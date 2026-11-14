---
title: 5. デュアルモードWorkbench・7種ネイティブエディタ＆Office局所パッチ
description: RightWorkbench（LiveFloor 実行監視 + PreviewWorkbench 7種ネイティブエディタ）、SelectionAnchor 局所パッチと GAIA 90.0% 実証を詳説。
---

# 5. デュアルモードWorkbench・7種ネイティブエディタ＆Office局所パッチ

> [!NOTE] 対象モジュールと署名済み実測レポート
> - フロントエンド：`hyn_agent_frontend/src/components/RightWorkbench.js`、`LiveFloor.js`、`PreviewWorkbench.js`、`AiReviewBar.js`、`WpsFormatToolbar.js`、`src/components/editors/*`
> - バックエンド：`app/tools/file_workbench.py`、`app/services/selection_patch.py`
> - 実測レポート：[GAIA マルチモーダル文書＆オフィス実務検証 (27/30 = 90.0% 正解率)](/ja/benchmarks/gaia-mini-v1)

## 5.1 右ペイン統合型デュアルモード `RightWorkbench`

Helm は左側の対話ストリームと右側の統合ワークベンチ（`RightWorkbench.js`）を組み合わせ、**リアルタイム稼働監視（`LiveFloor`）** と **7種ネイティブ文書スタジオ（`PreviewWorkbench`）** を瞬時に切り替えられます。

```mermaid
flowchart TD
  Shell["Helm デスクトップ分割シェル (リサイズ対応 · ショートカット切替)"] --> Left["左ペイン: 対話＆意思決定ストリーム (PlanCard · QuestionCard)"]
  Shell --> Right["右ペイン: RightWorkbench 統合コンテナ"]

  Right --> ModeA["モード A: LiveFloor 稼働監視コンソール (InspectorDock)"]
  Right --> ModeB["モード B: PreviewWorkbench ネイティブ編集台 (最大10タブ · 4-LRU保持)"]

  subgraph LiveViews["LiveFloor 4視点インスペクタ"]
    V1["Agents: 主/副エージェント＆チーム稼働カード"]
    V2["Graph: タスクDAG・ツール呼出 SVG トポロジ図"]
    V3["Commands: バックグラウンド管理プロセスのライブ出力"]
    V4["Notes & Budget: ノート＆トークン/時間3次元ゲージ"]
  end

  subgraph Editors["PreviewWorkbench 7種ネイティブエンジン"]
    E1["Office 3種: DocxEditor · XlsxEditor · PptxEditor (WPS書式バー)"]
    E2["版面＆Web: PdfViewer (引用ページ遷移) · HtmlEditor (トークン剥離subFrame)"]
    E3["開発＆執筆: MarkdownEditor · TextEditor (Shiki強調 + 折畳みDiff)"]
    Review["AiReviewBar ファイル横断 AI変更ナビゲータ＆1クリック復元"]
  end

  ModeA --> LiveViews
  ModeB --> Editors
```

---

## 5.2 `SelectionAnchor` 選択座標プロトコルと OpenXML 局所パッチ

```mermaid
sequenceDiagram
  autonumber
  participant User as "ユーザー (範囲選択)"
  participant Editor as "7種ネイティブエディタ"
  participant Agent as "AgentLoop コンテキスト構築"
  participant Patch as "patch_file_selection (selection_patch.py)"
  participant Snap as "5世代スナップショット保管庫"

  User->>Editor: Word段落 / Excelセル範囲 / PPT図形 / コード行を選択
  Editor->>Agent: 正規化 SelectionAnchor JSON を当ターンへ注入
  Agent->>Patch: 選択箇所のみの最小差分を patch_file_selection で適用
  Patch->>Snap: 書込前に元バイナリを自動保存 (最大5世代保持)
  Patch->>Patch: OpenXML / AST ノードを直接置換 (マスター配色・数式を100%維持)
  Patch-->>Editor: SSE file_updated イベントを通知
  Editor-->>User: ちらつきゼロでホットリロード＆変更箇所ハイライト
```

> [!TIP] アーキテクチャ上のトレードオフ：なぜ Markdown 変換ではなく OpenXML 直接パッチを行うのか？
> - **技術的課題**：業務用の提案書 PPTX・財務 XLSX・契約書 DOCX を一度テキスト変換して再生成すると、結合セル・数式・スライドマスターが崩壊します。
> - **従来手法の限界**：ファイル全体の丸ごと再出力は遅く、トークン消費が膨大で章落ち事故も多発します。
> - **Helm の解決策**：5種の座標系（`docx_paragraphs`・`xlsx_range`・`pptx_shape`・`text_lines`・`dom_selector`）と 5世代バイナリスナップショット、SSE ホットリロードを直結しました。
> - **定量的成果**：Office 局所編集マイクロベンチマークで **`20/20`（100%）レイアウト無破損合格**、出力トークン消費を **`82% 以上` 削減**しました。

---

## 5.3 7種ネイティブエディタ一覧と GAIA 90.0% 実証

```mermaid
flowchart LR
  Bench["GAIA Validation 実務ベンチマーク (n = 30 · 複数シート集計 + 文書解析 + Python計算)"] --> L1["Level 1 基礎複合: 10/10 (100.0%)"]
  Bench --> L2["Level 2 複数表・横断推論: 12/12 (100.0%)"]
  Bench --> L3["Level 3 長連鎖統合課題: 5/8 (62.5%)"]
  L1 & L2 & L3 --> Total["総合厳格一致率: 27/30 = 90.0%"]
```

| エディタコンポーネント | 対応拡張子 | 主な機能 | `SelectionAnchor` 種別 |
| :--- | :--- | :--- | :--- |
| **`DocxEditor.js`** | `.docx` | 段落スタイル忠実描画・WPS書式バー・変更ハイライト | `docx_paragraphs` |
| **`XlsxEditor.js`** | `.xlsx` / `.csv` | 複数シート切替・行列固定・範囲選択・数式検証 | `xlsx_range` |
| **`PptxEditor.js`** | `.pptx` | スライド一覧・図形単位クリック選択・マスター維持編集 | `pptx_shape` |
| **`PdfViewer.js`** | `.pdf` | 高精細描画・RAG `[ev_N]` 引用からの1クリックページ遷移 | ページ＆テキスト座標 |
| **`TextEditor.js`** | `40+` 言語 | `Shiki` 構文強調・折畳み Unified Diff・行範囲指定 | `text_lines` |
| **`MarkdownEditor.js`** | `.md` | ソース/プレビュー切替・Mermaid図表即時描画 | `text_lines` |
| **`HtmlEditor.js`** | `.html` | トークン剥離サンドボックス描画・DOMセレクタ指定改修 | `dom_selector` |