---
title: 5. 高精細ドキュメントワークベンチと部分AIホットパッチ
description: 右ペイン分割ワークベンチ（PreviewWorkbench.js）、WPS級書式ツールバー、SelectionAnchor プロトコル、および patch_file_selection によるインプレース更新の設計。
---

# 5. 高精細ドキュメントワークベンチと部分AIホットパッチ

> [!NOTE] 対応ソースコード・設計書
> - フロントエンド：`src/components/preview/PreviewWorkbench.js`、`WpsFormatToolbar.js`、`AiSelectionPopover.js`、`editors/{DocxEditor,XlsxEditor,PptxEditor,MarkdownEditor,HtmlEditor,PdfViewer,TextEditor}.js`
> - バックエンド：`app/services/file_workbench.py`、`app/services/tools/selection_patch.py`、`app/services/tools/office.py`
> - 設計書：`docs/file_preview_phase1_plan.md`、`docs/file_ai_edit_phase2_plan.md`

## 5.1 なぜコーディングエージェントに Office ワークベンチを統合したのか？

日本の開発現場（SIer・事業会社問わず）では、コード実装だけでなく**アーキテクチャ審査資料（`.pptx`）、基本設計書・詳細設計書（`.docx`）、テスト仕様書（`.xlsx`）** の作成・更新に膨大な工数が割かれています。
従来のエージェントで Office 文書を扱う際の2大課題を解決しました：
1. **中間スクリプトの排除**：PPT生成用の一時 `.py` スクリプト等を除外し、最終成果物のみを「成果物カード（Artifact Card）」として提示。
2. **ピンポイント部分修正（In-Place Patching）**：スライド1枚やExcelの特定セル範囲だけを修正したい時、ファイル全体を再生成して既存レイアウトを壊すのではなく、選択箇所だけを構造的に書き換えて即座にプレビューへ反映します。

---

## 5.2 フェーズ1：高精細インプレース描画＆WPS級ツールバー編集

```mermaid
flowchart TD
  subgraph Deliver["1. 最終成果物の二重検出機構"]
    ToolPresent["present_files ツールの明示的呼び出し"]
    AutoFallback["ターン終了時の自動フォールバック検出<br/>(.py 等の中間スクリプトを自動除外)"]
    ArtifactCard["チャット画面に「成果物カード」を表示"]
    ToolPresent --> ArtifactCard
    AutoFallback --> ArtifactCard
  end

  subgraph Workbench["2. 右ペイン高精細ワークベンチ (PreviewWorkbench.js)"]
    Toolbar["WPS級書式ツールバー (WpsFormatToolbar.js)<br/>フォント · サイズ · B/I/U · 色/ハイライト · 整列 · 保存 · 5世代スナップショット復元"]
    Docx["DocxEditor<br/>docx-preview + data-p-idx 段落アンカー"]
    Xlsx["XlsxEditor<br/>マルチシートグリッド + セルスタイル編集"]
    Pptx["PptxEditor<br/>サムネイル + 16:9 slide_index/shape_id キャンバス"]
    MdHtmlPdf["Markdown / HTML デュアルエディタ & PDF.js TextLayer"]
    Toolbar --> Docx & Xlsx & Pptx & MdHtmlPdf
  end

  subgraph BackendWrite["3. ローカル非破壊書込エンジン (file_workbench.py)"]
    Snapshot["変更前スナップショット自動保存<br/>(DATA_DIR/file_snapshots/ · 最大5世代)"]
    Engines["python-docx / openpyxl / python-pptx / atomic_write<br/>変更ノードのみを更新し、既存の複雑なレイアウトを100%保持"]
    Snapshot --> Engines
  end

  ArtifactCard -- "クリックで右ペイン展開" --> Workbench
  Workbench -- "PUT /api/v1/files/save" --> BackendWrite
```

---

## 5.3 フェーズ2：マウス選択「✨ AI修正」と SSE インプレース更新

Cursor の `Add Selection to Chat` と OpenAI Canvas の体験を、Word / Excel / PowerPoint を含む全フォーマットへ拡張しました：

```mermaid
sequenceDiagram
  autonumber
  actor User as ユーザー
  participant Editor as 右ペインプレビュー (Docx/Xlsx/Pptx/Md/Html/Pdf)
  participant Popover as 選択ポップオーバー (AiSelectionPopover.js)
  participant Composer as 下部入力バー (SelectionChipTray.js)
  participant Agent as FastAPI + patch_file_selection ツール

  User->>Editor: 段落のドラッグ選択 / Excel 範囲選択 (B2:D8) / PPT 図形クリック
  Editor->>Popover: 標準化 SelectionAnchor イベントを発火
  Popover-->>User: 選択範囲の右上に「✨ AI修正 (Ctrl+L)」ボタンを浮上表示
  User->>Popover: 「✨ AI修正」をクリック
  Popover->>Editor: 選択範囲をハイライト固定 (.is-ai-targeted)
  Popover->>Composer: 「選択範囲チップ (Selection Chip)」を追加し入力欄へフォーカス
  User->>Composer: 修正指示（例：「3つの定量指標に要約して太字にする」）を送信
  Composer->>Agent: POST ストリーム要求 (<file_selection> 構造化アンカー付き)
  Agent->>Agent: 自動スナップショット作成 + patch_file_selection でピンポイント保存
  Agent-->>Editor: SSE 配信 { type: "file_updated", patch: {...} }
  Editor-->>User: 対象箇所へスクロール＋画面リロードなしでインプレース更新＋緑ハイライト
```

### フォーマット横断の `SelectionContext` アンカー仕様

| フォーマット | `locator.type` | 構造化アンカー座標 | バックエンド部分書込の仕組み |
| :--- | :--- | :--- | :--- |
| **PowerPoint (`.pptx`)** | `pptx_shape` | `slide_index` + `shape_id` + `paragraph_indices` | `python-pptx` で対象スライド・図形を特定し、該当段落のテキスト・書式のみを更新 |
| **Word (`.docx`)** | `docx_paragraphs` | `paragraph_start` 〜 `paragraph_end` (`data-p-idx`) | `python-docx` で対象段落のみを更新し、ヘッダーや表・他章のスタイルを完全保持 |
| **Excel (`.xlsx`)** | `xlsx_range` | `sheet_name` + `cell_range` (例: `Sheet1!B2:D8`) | `openpyxl` で指定セル範囲の値・数式・書式のみを一括更新 |
| **コード / MD / HTML** | `text_lines` / `dom_selector` | `line_start` 〜 `line_end` または CSS セレクタ | 行範囲のアトミック置換と差分パッチ返却 |
