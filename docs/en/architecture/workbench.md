---
title: 5. Dual-Mode Workbench, 7 Native Editors & Surgical Selection Patching
description: Deep dive into Helm's RightWorkbench (LiveFloor telemetry + PreviewWorkbench 7 native editors), SelectionAnchor OpenXML surgical patching, and 90.0% GAIA validation accuracy.
---

# 5. Dual-Mode Workbench, 7 Native Editors & Surgical Selection Patching

> [!NOTE] Core Modules & Cryptographically Signed Evidence
> - Frontend Modules: `hyn_agent_frontend/src/components/RightWorkbench.js`, `LiveFloor.js`, `PreviewWorkbench.js`, `AiReviewBar.js`, `WpsFormatToolbar.js`, `src/components/editors/*`
> - Backend Modules: `app/tools/file_workbench.py`, `app/services/selection_patch.py`
> - Empirical Report: [GAIA Multimodal Document & Office Benchmark (27/30 = 90.0% Exact Match)](/en/benchmarks/gaia-mini-v1)

## 5.1 Unified Dual-Mode `RightWorkbench` Architecture

Helm pairs a structured left-hand conversation stream with a unified right-hand workspace (`RightWorkbench.js`) that switches instantaneously between **real-time runtime telemetry (`LiveFloor`)** and **7 native document/code editors (`PreviewWorkbench`)**:

```mermaid
flowchart TD
  Shell["Helm Desktop Split Shell (Resizable Panes · Instant Hotkeys)"] --> Left["Left Pane: Action Stream (PlanCard · QuestionCard · Streaming Tool Rail)"]
  Shell --> Right["Right Pane: RightWorkbench Unified Host"]

  Right --> ModeA["Mode A: LiveFloor Telemetry Console (InspectorDock)"]
  Right --> ModeB["Mode B: PreviewWorkbench Native Studio (10 Tabs · 4-Instance LRU Keep-Alive)"]

  subgraph LiveViews["LiveFloor 4-View Inspector"]
    V1["Agents View: Lead / Subagent / Teammate Live Cards"]
    V2["Graph View: Task DAG & Tool Execution SVG Topology"]
    V3["Commands View: Managed Background Process Streams"]
    V4["Notes & Budget: Turn Notes & 3D Token/Clock Gauges"]
  end

  subgraph Editors["PreviewWorkbench 7 Native Format Engines"]
    E1["Office Suite: DocxEditor · XlsxEditor · PptxEditor (WPS Toolbar)"]
    E2["Layout & Web: PdfViewer (Citation Jump) · HtmlEditor (Tokenless Subframe)"]
    E3["Code & Docs: MarkdownEditor · TextEditor (Shiki + Folded Unified Diff)"]
    Review["AiReviewBar Cross-File AI Edit Stepper & 1-Click Snapshot Rollback"]
  end

  ModeA --> LiveViews
  ModeB --> Editors
```

---

## 5.2 `SelectionAnchor` Protocol & OpenXML Surgical Patching

Rewriting an entire `.docx`, `.xlsx`, or `.pptx` file just to polish one slide or recalculate one table destroys master layouts, corrupts formulas, and wastes thousands of output tokens. Helm bridges UI selections directly to AST/OpenXML node-level patching:

```mermaid
sequenceDiagram
  autonumber
  participant User as "Engineer / Business User"
  participant Editor as "Native Editor (PreviewWorkbench)"
  participant Agent as "AgentLoop Context Builder"
  participant Patch as "patch_file_selection (selection_patch.py)"
  participant Snap as "5-Generation Snapshot Store"

  User->>Editor: Highlight Word paragraphs / Excel cell range / PPTX shape / Code lines
  Editor->>Agent: Inject normalized SelectionAnchor JSON into active turn
  Agent->>Patch: Model emits minimal delta via patch_file_selection
  Patch->>Snap: Archive binary pre-edit backup (retains 5 generations per file)
  Patch->>Patch: Mutate target OpenXML / AST node in place (100% style & formula preservation)
  Patch-->>Editor: Broadcast SSE file_updated event
  Editor-->>User: Zero-flicker hot reload + AI diff highlight
```

> [!TIP] Architectural Trade-off: In-Place OpenXML Node Patching vs Markdown Round-Tripping
> - **Engineering Bottleneck**: Enterprise decks, financial workbooks, and contracts rely on merged cells, cross-sheet formulas, and slide masters that vanish if converted to plain Markdown and regenerated.
> - **Flaw in Conventional Designs**: Full-file regeneration is slow, token-expensive, and prone to silent section omissions.
> - **Helm's Underlying Solution**: Standardize five structural coordinates (`docx_paragraphs`, `xlsx_range`, `pptx_shape`, `text_lines`, `dom_selector`) backed by 5-generation binary snapshots (`DATA_DIR/file_snapshots/`) and SSE `file_updated` live reload.
> - **Measured Engineering Gain**: **`20/20` (100%) layout-intact pass rate** on Office surgical microbenchmarks and **over `82%` output token savings** per targeted edit.

---

## 5.3 Seven Native Editors & 90.0% GAIA Validation Proof

```mermaid
flowchart LR
  Bench["GAIA Validation Stratified Suite (n = 30 · Multi-File Office + Code Execution)"] --> L1["Level 1 Foundational: 10/10 (100.0%)"]
  Bench --> L2["Level 2 Multi-Sheet & Cross-Modal: 12/12 (100.0%)"]
  Bench --> L3["Level 3 Long-Horizon Synthesis: 5/8 (62.5%)"]
  L1 & L2 & L3 --> Total["Overall Strict Exact-Match: 27/30 = 90.0%"]
```

| Native Editor | File Types | Core Capabilities | `SelectionAnchor` Coordinate |
| :--- | :--- | :--- | :--- |
| **`DocxEditor.js`** | `.docx` | Style-faithful paragraph rendering, WPS format bar, diff highlights | `docx_paragraphs` |
| **`XlsxEditor.js`** | `.xlsx` / `.csv` | Multi-sheet tabs, frozen headers, range selection & formula audit | `xlsx_range` |
| **`PptxEditor.js`** | `.pptx` | Slide filmstrip, canvas shape selection, master-preserving edits | `pptx_shape` |
| **`PdfViewer.js`** | `.pdf` | Crisp vector rendering & 1-click jump from RAG `[ev_N]` citations | Page & span anchors |
| **`TextEditor.js`** | `40+` languages | `Shiki` syntax highlighting, folded Unified Diff, line-range anchors | `text_lines` |
| **`MarkdownEditor.js`** | `.md` | Split source/rendered view with live Mermaid & table rendering | `text_lines` |
| **`HtmlEditor.js`** | `.html` | Token-stripped sandboxed preview + visual DOM selector targeting | `dom_selector` |