---
title: 2. 長時間自律エンジン (P0-P3)・3経路読取並列とシャドウGit
description: フレームワーク非依存の 5,227行非同期ループ、3経路順序保証並列読取、TurnHub 再接続、StuckDetector 7次元監視と SWE-bench 84.0% 実証を詳説。
---

# 2. 長時間自律エンジン (P0-P3)・3経路読取並列とシャドウGit

> [!NOTE] 対象モジュールと署名済み実測レポート
> - 対象ソース：`app/services/agent_loop.py`（`5,227` 行）、`turn_hub.py`、`turn_budget.py`、`stuck_detector.py`、`completion.py`、`ripgrep.py`、`code_outline.py`、`syntax_check.py`、`git_checkpoints.py`
> - 実測レポート：[SWE-bench Verified Mini (最高 84.0%)](/ja/benchmarks/swebench-mini-v1) · [Polyglot 6言語ブラインド検証 (24/24)](/ja/benchmarks/polyglot-mini-v1) · [Harness ガードレール消融実験 (-87.7% 無駄ステップ削減)](/ja/benchmarks/harness-ablation-v1)

## 2.1 フレームワーク非依存・5,227行の決定論的状態機械

LangChain 等の汎用ラッパーを排し、長時間の複数ファイル改修における切断・直列読取遅延・無限ループ・未検証終了を防ぐ純粋 Python `asyncio` ステートマシンを構築しています。

```mermaid
stateDiagram-v2
  state "Running · メインループ (単調増加 seq)" as Running
  state "ParallelRead · 3経路順序保証並列読取" as ParallelRead
  state "SerialMutate · 37ms 構文検査＆シャドウGit" as SerialMutate
  state "StreamRetry · 指数バックオフ＆stream_reset" as StreamRetry
  state "Paused · 予算上限 / L3遮断 / 承認待ち" as Paused
  state "Interrupted · 安全な中断チェックポイント" as Interrupted
  state "GateCheck · G1-G4 完了ゲート検証" as GateCheck

  [*] --> Running
  Running --> ParallelRead: 連続する読取専用ツール / allow-MCP / explore サブエージェント
  ParallelRead --> Running: asyncio.gather で元の tool_call_id 順に厳密整列
  Running --> SerialMutate: 書込・コマンド実行 (PreToolUse -> 37ms 構文チェック)
  SerialMutate --> Running: refs/hyn/checkpoints へ非侵襲スナップショット保存
  Running --> StreamRetry: 通信瞬断・VRAM待機 (最大8回リトライ)
  StreamRetry --> Running: stream_reset 送出後にクリーン再開
  Running --> Paused: TurnBudget 到達 / StuckDetector 介入 / 人間承認待ち
  Paused --> Running: 承認再開 (承認待機時間は実行時間予算から除外)
  Running --> Interrupted: アプリ終了・再起動
  Interrupted --> Running: 最終 seq からシームレス再開
  Running --> GateCheck: モデルが完了を宣言
  GateCheck --> Running: G1-G4 不合格 (不足検証項目を自動注入)
  GateCheck --> [*]: 検証済み成果物を納品
```

---

## 2.2 3経路の順序保証付き並列読取（3-Path Parallel Read）

```mermaid
flowchart LR
  Batch["1ターンの Tool Calls 列 (Index 0..N)"] --> Classifier["静的副作用分類器"]
  Classifier --> PathA["経路 A: 13種の読取専用内蔵ツール (read_file / search_in_files / code_outline)"]
  Classifier --> PathB["経路 B: allow ポリシーの読取専用 MCP ツール"]
  Classifier --> PathC["経路 C: セマフォ制御付き explore サブエージェント"]
  Classifier --> Barrier["書込バリア (write_file / apply_patch / run_powershell)"]

  PathA & PathB & PathC --> Gather["asyncio.gather 並列実行 (Pre/PostToolUse フック完全維持)"]
  Gather --> Merge["元の tool_call_id インデックス順に再整列 (プレフィックス保護)"]
  Barrier --> Serial["排他直列実行 + 37ms 構文検査 + シャドウGit記録"]
```

> [!TIP] アーキテクチャ上のトレードオフ：KVキャッシュ順序を壊さずに並列高速化する仕組み
> - **技術的課題**：コード調査フェーズの 70% 以上を占める読取ツールを直列実行すると応答が大きく遅延します。
> - **従来手法の限界**：完了順でメッセージを返すと `tool_call_id` の並びが崩れ、API エラーやプレフィックスキャッシュ破綻を招きます。
> - **Helm の解決策**：連続する読取専用区間を自動抽出し、`asyncio.gather` 実行後に元のインデックス順へ厳密再配置。書込系ツールに到達した時点で即座に直列メモリバリアを張ります。
> - **定量的成果**：マルチファイル調査の所要時間を **55%〜70% 短縮**しつつ、キャッシュ決定論を 100% 維持します。

---

## 2.3 `TurnHub` 再接続・7次元 `StuckDetector` v2・`CompletionGate`

```mermaid
flowchart TD
  Step["各ステップ完了時に StepObservation を収集"] --> Budget["TurnBudget 3次元管理 (ステップ数 · トークン · 実稼働秒数)"]
  Budget --> Stuck["StuckDetector v2 7次元異常検知 (D1-D7)"]
  Stuck -->|"D1 完全反復 / D2 ポーリング空転 / D3 連続エラー"| L1["L1 軌道修正ヒント注入"]
  Stuck -->|"D4 A-B往復振動 / D5 進捗停滞 / D6 エラー連鎖"| L2["L2 強制内省 (1ターンの間書込ツールを物理剥離)"]
  Stuck -->|"D7 空思考劣化 または L2後も停滞"| L3L4["L3 収束モード / L4 一時停止してユーザーへ委譲"]
  Stuck -->|"正常軌道で完了要求"| Gate["CompletionGate 4重完了検証 (G1-G4)"]
  Gate -->|"検証証跡不足 / テスト未実行 / 構文エラー残存"| Reject["早期終了を却下し修正リストを注入"]
  Gate -->|"全条件クリア (純粋なOffice文書作成時は単体テスト免除)"| Done["完了承認"]
```

- [Harness 消融実験 (`/ja/benchmarks/harness-ablation-v1`)](/ja/benchmarks/harness-ablation-v1) において、`StuckDetector` v2 は `18` 件の無限ループ軌跡を **`100.0%`（18/18）検知・誤検知 `0.0%`** で遮断し、無駄な消費ステップを **`87.7%` 削減**しました。

---

## 2.4 決定論的コードナビゲーション v2 と非侵襲シャドウGit

| ナビゲーション基盤 | 従来ベースライン | Helm 実測値 | 解決した課題 |
| :--- | :--- | :--- | :--- |
| **同梱 `ripgrep 15.2` (`search_in_files`)** | Python 走査 P50 `5,026.2 ms`・ノイズ `49.17%` | P50 **`119.3 ms`**（**`42.1倍`高速**）・ノイズ **`0.00%`** | `.git`/`node_modules` 汚染を根絶 |
| **`tree-sitter` 構文木 (`code_outline`)** | 数千行ファイルの丸読みによる枠圧迫 | P50 **`23.81 ms`**（512-LRU 温態 `0.8 ms`） | 原文比 **`4.59%`** サイズ（**`95.41%` 節約**） |
| **行境界整合 `read_file` + 規約自動検出** | 文字数切断で連続読取一致率 `30.33%` | **`100.00%` 無欠損ページング** + `AGENTS.md` 自動注入 | SWE-bench `L2` 切断起因ミス **`0%`** |
| **インプロセス構文検査 (`syntax_check.py`)** | テスト実行まで括弧抜けに気付かない | 中央値 **`37 ms`**（検出率 `100.0%` / 誤報 `0.0%`） | 書込直後に構文ミスを即時フィードバック |

- **実証スコア**：[SWE-bench Verified Mini](/ja/benchmarks/swebench-mini-v1) にて `DeepSeek-V4.1-Flash` 単体で **最高 `84.00%`（42/50）Pass@1**（2回平均 `81.00% ± 4.24%`・正解ファイル特定率 `98.0%`）、[Polyglot 6言語検証](/ja/benchmarks/polyglot-mini-v1) にて **`100.0%`（24/24）** を達成しました。