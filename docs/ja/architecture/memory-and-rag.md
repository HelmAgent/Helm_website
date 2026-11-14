---
title: 4. 4層追記プレフィックス・7段階圧縮・2層メモリ＆異種文書RAG
description: SHA-256 プレフィックス診断による 97.74% キャッシュヒット、7段階キャッシュ経済学圧縮、DB不要の2層Markdownメモリと RAGFlow 再現率100% 実証を詳説。
---

# 4. 4層追記プレフィックス・7段階圧縮・2層メモリ＆異種文書RAG

> [!NOTE] 対象モジュールと署名済み実測レポート
> - 対象ソース：`app/services/prefix_policy.py`、`prefix_hash.py`、`context_compact.py`、`memory_store.py`、`memory_extractor.py`、`knowledge/ragflow.py`、`web_search/*`
> - 実測レポート：[プレフィックスキャッシュ安定性検証 (160回呼出 · 意図せぬ破綻 25->0 · コスト -57.3%)](/ja/benchmarks/precache-v1) · [4段階 RAG 進化検証 (Strict Recall 36.7%->100.0% · MRR 1.000)](/ja/benchmarks/rag-eval-v1)

## 4.1 4層追記専用プレフィックス契約と SHA-256 破綻診断

システムプロンプトへ現在時刻や動的スキル全文を直接差し込むと、数万トークンの KV キャッシュが毎ターン無効化されます。Helm は**4層追記専用プレフィックス（4-Layer Append-Only Prefix）**を徹底しています。

```mermaid
flowchart LR
  subgraph Frozen["セッション固定領域 (ターン間で100%バイト一致)"]
    L1["Layer 1: 基本システム指示 + 静的 AGENTS.md + 初回メモリスナップショット"]
    L2["Layer 2: 辞書順で決定論的に固定された内蔵＆MCPツール Schema"]
  end

  subgraph AppendOnly["ターン追記領域 (過去メッセージのインプレース改変禁止)"]
    L3["Layer 3: 会話履歴 Messages (キャッシュ経済学に基づく遅延重複排除)"]
    L4["Layer 4: 末尾動的注入 (<system-reminder> · Plan制約 · 増分メモリ · スキル本文)"]
  end

  L1 --> L2 --> L3 --> L4
  L1 & L2 & L3 -.->|"層別 SHA-256 ハッシュ計測 (prefix_hash.py)"| Audit["broken_layer リアルタイム特定 + Anthropic 4点キャッシュ"]
```

> [!TIP] アーキテクチャ上のトレードオフ：会話途中のモード切替でキャッシュ破綻ゼロを実現する理由
> - **技術的課題**：会話途中で `Plan Mode` へ切り替えたり新しいメモリや `/skill` を呼び出したりする際、Layer 1/2 を書き換えると蓄積済み KV キャッシュが消滅します。
> - **従来手法の限界**：毎ターン System Prompt や `tools` 配列を再構築する実装では、実運用時のキャッシュヒット率が 45% 未満に低下します。
> - **Helm の解決策**：Layer 1/2 を完全凍結し、実行中の状態変化はすべて Layer 4 末尾の `<system-reminder>` へ集約。`prefix_hash.py` で各層の SHA-256 を常時監視します。
> - **定量的成果**：[SWE-bench 1.2億トークン検証](/ja/benchmarks/swebench-mini-v1) で **`97.74%` のキャッシュヒット率（1問あたり `¥0.27`）**、[160回キャッシュ検証 (`/ja/benchmarks/precache-v1`)](/ja/benchmarks/precache-v1) で意図せぬ破綻を **`25回 -> 0回`**、課金入力コストを **`-57.27%`** 削減しました。

---

## 4.2 キャッシュ経済学に基づく 7段階コンテキスト圧縮（`ContextCompactor`）

```mermaid
flowchart TD
  Input["ターン開始前のコンテキスト水位判定"] --> S1["Stage 1: tool_result_budget ディスク退避 + 60/40 先頭・末尾プレビュー"]
  S1 --> S2["Stage 2: KVキャッシュ経済学の遅延重複排除 (将来節約額 > 再計算損失のときのみ実行)"]
  S2 --> S3["Stage 3: snip_compact 古い長大ツール出力の刈り込み"]
  S3 --> S4["Stage 4: micro_compact 初期の中間推論ステップ圧縮"]
  S4 --> S5["Stage 5: fit_tool_results 単一ターンの並列バースト上限保護"]
  S5 --> S6["Stage 6: compact_history 構造化要約 (要約前に非同期メモリ抽出を強制フラッシュ)"]
  S6 --> S7["Stage 7: reactive_compact HTTP 400 / 413 発生時の自動緊急圧縮リトライ"]
```

- **60/40 先頭・末尾保持プレビュー**：スタックトレースは常に出力末尾に現れるため、先頭 `60%` と末尾 `40%` を残して全文をディスク退避します。**`93.1%` 圧縮時でも末尾トレース保持率 `100.0%`**（単純先頭切り詰めでは `33.3%`）を達成しました。

---

## 4.3 DB不要の2層メモリ・4段階ハイブリッドRAG・5+1 Web検索フォールバック

```mermaid
flowchart TD
  Query["質問・知識検索クエリ"] --> Mem["2層 Markdown メモリ (_global + <ws_key> · 10世代 .history/)"]
  Query --> RAG["RAGFlow 1.0 (15種レイアウト解析 · 0.7 密ベクトル + 0.3 BM25 + Rerank)"]
  Query --> Web["5+1 Web検索自動切替 (DeepSeek -> Bocha -> Yuanbao -> Perplexity -> Felo -> Custom)"]

  Mem -->|"初回 CJK Bigram + 会話中 <2ms BM25"| Inject["根拠付きコンテキスト統合"]
  RAG -->|"[ev_N] ページ引用強制 + ドメイン外拒否ゲート"| Inject
  Web -->|"SSRF 内部IP遮断 + <untrusted_web_content> 隔離"| Inject
```

| RAG 進化段階 (`/ja/benchmarks/rag-eval-v1`) | 主要アーキテクチャ改善 | `Strict Recall@5` | `MRR` | 類似ノイズ混入率 | `OOD` 拒否精度 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`v0` ベースライン** | 固定長チャンク + 密ベクトル検索のみ | `36.7%` | `0.489` | `46.7%` | `66.7%` |
| **`v1` ハイブリッド** | `0.7` 密ベクトル + `0.3` BM25 + レイアウト分割 | `73.3%` | `0.811` | `20.0%` | `83.3%` |
| **`v2` 再ランキング** | Cross-Encoder 精選リランキング導入 | `93.3%` | `0.956` | `3.3%` | `100.0%` |
| **`v3` 最終構成** | 信頼度閾値ゲート + `[ev_N]` 引用強制 | **`100.0%` (30/30)** | **`1.000`** | **`0.0%`** | **`100.0%` (6/6)** |