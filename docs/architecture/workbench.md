---
title: 5. 高保真文档预览工作台与局部 AI 热补丁
description: 解析 HYN Agent 的右侧分栏多格式工作台（PreviewWorkbench.js）、WPS 级格式工具栏、SelectionAnchor 跨格式锚点协议与 patch_file_selection 原地热更新。
---

# 5. 高保真文档预览工作台与局部 AI 热补丁

> [!NOTE] 对应源码与设计文档
> - 前端：`src/components/preview/PreviewWorkbench.js`、`WpsFormatToolbar.js`、`AiSelectionPopover.js`、`editors/{DocxEditor,XlsxEditor,PptxEditor,MarkdownEditor,HtmlEditor,PdfViewer,TextEditor}.js`
> - 后端：`app/services/file_workbench.py`、`app/services/tools/selection_patch.py`、`app/services/tools/office.py`
> - 设计文档：`docs/file_preview_phase1_plan.md`、`docs/file_ai_edit_phase2_plan.md`

## 5.1 为什么 Coding Agent 需要内建 Office 高保真工作台？

在真实的研发与企业办公场景中，工程师和架构师不仅要写代码，还需要交付**架构评审 PPT（`.pptx`）、技术规范书（`.docx`）、测试数据表（`.xlsx`）与分析报告（`.pdf` / `.md`）**。
传统 Agent 生成文档存在两大痛点：
1. **中间过程文件刷屏**：模型为了生成一份 PPT 往往会先写好几个临时 Python 脚本（如 `_gen_part1.py`），用户分不清哪个才是最终交付物；
2. **局部修改成本极高**：用户只想把 PPT 第 2 页某个文本框精简成 3 条要点，或者修改 Excel 某几个单元格，传统 Agent 只能把整个文件重新生成一遍，不仅慢，还会破坏用户在其他页面已调好的排版。

---

## 5.2 第一期架构：最终产物识别 + WPS 级原位渲染与编辑

```mermaid
flowchart TD
  subgraph Deliver["1. 最终交付产物双保险识别"]
    ToolPresent["显式调用 present_files 工具"]
    AutoFallback["轮次末富文档写盘自动兜底<br/>(自动过滤 .py 等中间脚本)"]
    ArtifactCard["对话流展示独立「最终产物卡片」"]
    ToolPresent --> ArtifactCard
    AutoFallback --> ArtifactCard
  end

  subgraph Workbench["2. 右侧分栏高保真预览工作台 (PreviewWorkbench.js)"]
    Toolbar["顶部 WPS 级格式工具栏 (WpsFormatToolbar.js)<br/>字体 · 字号 · B/I/U · 颜色/高亮 · 对齐 · Ctrl+S 保存 · 5版本快照回退"]
    Docx["DocxEditor<br/>docx-preview + data-p-idx 段落映射"]
    Xlsx["XlsxEditor<br/>多 Sheet 网格 + 单元格样式编辑"]
    Pptx["PptxEditor<br/>缩略图 + 16:9 slide_index/shape_id 画布"]
    MdHtmlPdf["Markdown / HTML 双模编辑器 & PDF.js TextLayer"]
    Toolbar --> Docx & Xlsx & Pptx & MdHtmlPdf
  end

  subgraph BackendWrite["3. 本地无损结构化写回 (file_workbench.py)"]
    Snapshot["自动备份防改坏历史快照<br/>(DATA_DIR/file_snapshots/ · 最多5份)"]
    Engines["python-docx / openpyxl / python-pptx / atomic_write<br/>仅更新变更节点，100% 保留原文档未修改排版"]
    Snapshot --> Engines
  end

  ArtifactCard -- "点击滑出分栏" --> Workbench
  Workbench -- "PUT /api/v1/files/save" --> BackendWrite
```

---

## 5.3 第二期架构：鼠标划取「✨ AI 修改」与 SSE 局部热替换

对标 Cursor 的 `Add Selection to Chat` 与 Canvas 局部重绘，HYN Agent 将**「鼠标划选 → 浮起 AI 按钮 → 结构化锚点注入 → 原地无闪烁热替换」**扩展到了全部富文档格式：

```mermaid
sequenceDiagram
  autonumber
  actor User as 用户
  participant Editor as 右侧预览画布 (Docx/Xlsx/Pptx/Md/Html/Pdf)
  participant Popover as 选区浮窗 (AiSelectionPopover.js)
  participant Composer as 底部书写条 (SelectionChipTray.js)
  participant Agent as FastAPI + patch_file_selection 工具

  User->>Editor: 划取文字段落 / 框选 Excel 区域 (B2:D8) / 点选 PPT 形状
  Editor->>Popover: 抛出标准化 SelectionAnchor 事件
  Popover-->>User: 在选区右上角浮起「✨ AI 修改 (Ctrl+L)」按钮
  User->>Popover: 点击「✨ AI 修改」
  Popover->>Editor: 锁定当前选区高亮 (.is-ai-targeted)
  Popover->>Composer: 挂载「选区引用胶囊 (Selection Chip)」并聚焦输入框
  User->>Composer: 输入指令（如“精简为 3 条量化指标并加粗”）并发送
  Composer->>Agent: POST 流式请求 (附带结构化 <file_selection> 上下文)
  Agent->>Agent: 自动创建快照 + 调用 patch_file_selection 精准落盘
  Agent-->>Editor: SSE 实时推送 { type: "file_updated", patch: {...} }
  Editor-->>User: 自动滚动至锚点 + 原地热替换 DOM/画布节点 + 石澜绿闪烁高亮
```

### 跨格式统一选区锚点契约（`SelectionContext`）
无论用户在哪种格式的预览器中划选，前端均将其归一化为精确的物理定位锚点（`locator`），使后端 `selection_patch.py` 能做到手术刀级局部写回：

| 文档格式 | `locator.type` | 精准结构化定位坐标 | 后端写回机制 |
| :--- | :--- | :--- | :--- |
| **PPT (`.pptx`)** | `pptx_shape` | `slide_index` + `shape_id` + `paragraph_indices` | `python-pptx` 定位对应幻灯片与 Shape 节点，仅替换目标段落文本与 Run 样式 |
| **Word (`.docx`)** | `docx_paragraphs` | `paragraph_start` ~ `paragraph_end` (`data-p-idx`) | `python-docx` 原位修改目标段落，不破坏文档其余章节、表格与页眉页脚 |
| **Excel (`.xlsx`)** | `xlsx_range` | `sheet_name` + `cell_range` (如 `Sheet1!B2:D8`) | `openpyxl` 批量更新目标矩形区域单元格数值、公式与样式 |
| **代码 / Markdown / HTML** | `text_lines` / `dom_selector` | `line_start` ~ `line_end` 或 CSS 选择器 | 原子行区间替换并返回增量 Patch |
