---
title: 6. 5段階権限サンドボックス・1ms未満ゼロRTT意図推論＆拡張エコシステム
description: 5段階対話権限と3重実行ゲート、キャッシュ破綻ゼロの Plan Mode、0.67ms 3言語 BM25 意図推論、MCP OAuth 2.0、6段階フックと Cron 自動化を詳説。
---

# 6. 5段階権限サンドボックス・1ms未満ゼロRTT意図推論＆拡張エコシステム

> [!NOTE] 対象モジュールと署名済み実測レポート
> - 対象ソース：`app/services/permission_mode.py`、`permission.py`、`plan_submission.py`、`clarification.py`、`intent_matcher.py`、`turn_enricher.py`、`mcp_runtime.py`、`mcp_oauth.py`、`skill_loader.py`、`hooks.py`、`cron_scheduler.py`
> - 実測レポート：[Harness ガードレール消融実験 (攻撃阻止 30/30 · 0.67ms ゼロRTT意図推論 · 多言語MCP検索 100%)](/ja/benchmarks/harness-ablation-v1)

## 6.1 5段階対話権限モードと3重実行ゲート

```mermaid
flowchart TD
  Call["モデルが任意の ToolCall を発行"] --> Gate1["第1ゲート: 保護パスハードロック (Protected Path Guard)"]
  Gate1 -->|".git/hooks · .env* · .hyn_agent に該当"| ForceHITL["full_auto 中でも強制的に人間承認ダイアログを表示"]
  Gate1 -->|"通常のワークスペースパス"| Gate2["第2ゲート: 5段階権限マトリクス + AST コマンド危険度分類"]
  Gate2 -->|"plan は全書込遮断 / ask_all / default はリスク別判定"| Decision{"自動許可または承認待ち?"}
  Decision -->|"承認必要"| Card["承認カード表示 (待機中は実行時間予算タイマーを自動一時停止)"]
  Decision -->|"許可"| Gate3["第3ゲート: PreToolUse 外部ライフサイクルフック (hooks.py)"]
  Gate3 -->|"Exit Code = 2"| Block["ハード遮断し理由をモデルへ返却"]
  Gate3 -->|"Exit Code = 0 (updatedInput による引数無害化対応)"| Exec["保護ランタイムで実行"]
```

| 権限モード (`mode`) | 読取ツール | ファイル編集 | シェル実行 | 機密保護パス (`.env*` / `.git/hooks`) | 推奨シーン |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`plan`（読取・計画）** | 自動許可 | **物理遮断（計画提出のみ）** | **物理遮断** | **強制人間承認** | 大規模コード調査・事前設計レビュー |
| **`ask_all`（全件確認）** | 自動許可 | 毎回承認 | 毎回承認 | **強制人間承認** | 本番環境調査・高機密フォルダ操作 |
| **`default`（標準均衡）** | 自動許可 | Diff 確認 | 安全読取のみ自動許可 | **強制人間承認** | 日常の開発＆オフィス文書作成 |
| **`auto_edit`（高速編集）** | 自動許可 | **自動許可（スナップショット付）** | 危険コマンドは承認 | **強制人間承認** | マルチファイル実装・TDD反復 |
| **`full_auto`（完全自律）** | 自動許可 | **自動許可** | ワークスペース内自動許可 | **強制人間承認（脱獄防止底線）** | 長時間リファクタリング・ベンチマーク |

- **キャッシュ破綻ゼロの `Plan Mode` と永続化 `ask_user`**：`Plan Mode` 切替は Layer 4 `<system-reminder>` で制御するため KV キャッシュを一切壊しません（`PlanCard.js`）。曖昧さ解消の `ask_user`（`QuestionCard.js`）はディスクへ直列化保存され、アプリ再起動後も続きから回答可能です。

---

## 6.2 `1ms` 未満のゼロRTT 3言語意図エンリッチャー

```mermaid
sequenceDiagram
  autonumber
  participant User as ユーザー入力 ("/review 認証モジュールの並列競合を監査して")
  participant Enricher as TurnEnricher (turn_enricher.py)
  participant BM25 as 日/中/英 3言語 BM25 + CJK Bigram (intent_matcher.py)
  participant LLM as 単一パス LLM 推論 (追加往復 0回)

  User->>Enricher: プロンプト送信
  Enricher->>BM25: 英単語ステム + CJK Bigram + 3言語同義語ブリッジ (中央値 0.67ms)
  alt 明示的 /skill スラッシュコマンド
    Enricher->>Enricher: 対象 SKILL.md 全文を Layer 4 <system-reminder> へ事前注入
  else 自然言語の暗黙的意図
    BM25-->>Enricher: 関連上位スキル＆英語MCPツール候補を即時抽出
  end
  Enricher->>LLM: 初回リクエストから完全な専門手順を保持して推論開始 (1 RTT 短縮)
```

> [!TIP] アーキテクチャ上のトレードオフ：なぜローカル Embedding モデルではなく純粋 CPU 3言語 BM25 なのか？
> - **技術的課題**：日本語・中国語の指示から英語記述の MCP ツールを検索する際、単純一致では漏れますが、数百MBの Embedding モデル常駐はメモリと起動時間を圧迫します。
> - **従来手法の限界**：ルータ用の別 LLM 呼び出しを挟むと毎回 2〜5 秒の遅延が発生します。
> - **Helm の解決策**：日・中・英の技術同義語辞書＋語幹抽出＋CJK Bigram 転置インデックスを純粋 Python メモリ上で実装しました。
> - **定量的成果**：中央値 **`0.67 ms`**、`/skill` 実行時の追加通信 **1往復削減**、多言語 MCP ツール Top-3 検索再現率 **`100.0%`** を達成しました。

---

## 6.3 全プロトコル MCP（OAuth 2.0 対応）・6段階フック・ローカル Cron

```mermaid
flowchart LR
  subgraph Ecosystem["Helm オープン拡張エコシステム"]
    MCP["全プロトコル MCP クライアント (stdio · sse · streamable_http + RFC 8252 OAuth 2.0)"]
    Skills["6階層ダイナミックスキル (.hyn_agent / .claude 互換 + SHA-256 信頼検証)"]
    Hooks["6段階ライフサイクルフック (UserPromptSubmit -> Pre/PostToolUse -> SubagentStart/Stop -> Stop)"]
    Cron["永続 Cron スケジューラ (スリープ復帰時の自動補完実行 catchup_once)"]
  end

  MCP & Skills & Hooks & Cron --> Core["AgentLoop ＆ CustomizeView マーケットプレイスへ直結"]
```

1. **エンタープライズ MCP + DPAPI 暗号化 OAuth 2.0（`mcp_runtime.py`、`mcp_oauth.py`）**：`stdio`・`sse`・`streamable_http` に対応し、RFC 8252 ループバック PKCE OAuth 2.0 トークンを Windows DPAPI でハードウェア保護。外部 MCP ツールが `30` 個を超えると自動的に `mcp_search_tools` オンデマンド読込へ切り替わります。
2. **6段階フックと SHA-256 リポジトリ信頼チェーン（`hooks.py`）**：外部リポジトリ同梱の `.hyn_agent` フックやスキルは、ユーザーが内容の **SHA-256 ハッシュ**を承認しない限り実行されず、1バイトでも改ざんされると即座に失効します。
3. **スリープ耐性ローカル Cron（`cron_scheduler.py`）**：PC スリープ中に逃した定期ジョブも、復帰時に `catchup_once` で安全に1回補完実行します。