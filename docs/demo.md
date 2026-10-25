---
title: 在线交互沙盒（免安装体验）
description: 在浏览器内直接交互式体验 HYN Agent 的石澜 UI、长程重构、影子 Git 检查点与 Office 划取局部 AI 修改
aside: false
---

# 在线交互沙盒（免安装浏览器体验）

> [!TIP] 无需安装 `.exe`，直接在下方点击体验桌面端核心工作流
> 针对企业办公电脑受限或希望快速预览产品交互的访客与面试官，下方沙盒 **1:1 复刻了 HYN Agent 桌面端的「石澜（Stone）」界面**。你可以自由点击顶部的 **3 个典型工程场景**、展开工具调用详情、切换底部 **4 档实时权限模式**、查看 **上下文预算圆环**、对比 **影子 Git 检查点 Diff**，或在右侧预览工作台点击 **「✨ AI 修改」** 体验局部热替换。

<ProductPlayground lang="zh" />

## 沙盒内置三大场景说明

| 场景 | 展示的核心工程模块 | 你可以亲手点击交互的控件 |
| :--- | :--- | :--- |
| **场景 1：离线 Ollama 长程重构 & 影子检查点** | `TurnHub` 流式序号、`StuckDetector` L2 防死循环、`git_checkpoints.py` 无侵入快照 | 点击展开 `apply_patch` / `run_powershell` 卡片；在右侧切换 `#1 / #2` 检查点查看 Git Diff；点击底部 **「⚡ 完全放行」** 切换 4 档权限 |
| **场景 2：WPS 级高保真预览 & 划取 AI 修改** | `PreviewWorkbench.js`、`WpsFormatToolbar.js`、`AiSelectionPopover.js`、`patch_file_selection` | 点击右侧 PPT 画布上的虚线选区或右上角 **「✨ AI 修改 (Ctrl+L)」** 按钮，观察 SSE 原地无闪烁热替换与石澜绿高亮反馈 |
| **场景 3：Git Worktree 多智能体团队** | `team_runtime.py` 常驻队友、`.hyn_wt/*` 独立工作树租约、计划批准前强制只读门禁 | 点击第二个队友卡片中的 **「🛡️ 批准队友重构计划」** 按钮，观察队友从只读探测切换为写入执行态 |
