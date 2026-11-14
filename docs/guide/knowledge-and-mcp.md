---
title: 本地知识库与 MCP / Skills / Hooks 扩展
description: 在 Helm 中连接 RAGFlow 混合检索知识库、配置全协议 MCP（含 OAuth 2.0）、零往返 Skills、6 级生命周期钩子与抗休眠 Cron 任务。
---

# 本地知识库与 MCP / Skills / Hooks 扩展

Helm 不仅能直接读写当前工作区源码与 7 类原生办公文档，还内置了完整的企业级知识检索（RAG）与开放插件生态。

## 1. 连接企业/本地知识库（RAGFlow 100% 召回证据链）

在左侧导航栏点击 **「知识库 (Knowledge)」**：
- **私有化 RAGFlow 1.0 对接**：填入本机或企业内网部署的 RAGFlow 服务地址（如 `http://127.0.0.1:9380`）与 API Key，支持 15 种专业文档版面解析模板与实时切片进度监控（`RUNNING` / `DONE`）。
- **混合检索与 `[ev_N]` 强制溯源**：底层采用 `0.7` 稠密向量 + `0.3` BM25 混合召回与 Cross-Encoder 重排（详见 [RAG 4 阶段演进实测报告](/benchmarks/rag-eval-v1)），每条结论强制附带页码与源文件证据锚点，点击即可在右侧 `PdfViewer` 精准定位。

## 2. 全协议 MCP 客户端与 OAuth 2.0 授权

在 **「定制 (Customize) → MCP」** 面板中可一键挂载本地、内网或 SaaS 级 MCP 服务器：
- **三大传输协议全覆盖**：完整支持 `stdio`、`sse` 与新一代 `streamable_http` 协议，涵盖 Tools、Resources 与 Elicitation 交互。
- **RFC 8252 OAuth 2.0 一键登录**：连接需要商业鉴权的远程 MCP 服务时，自动拉起系统浏览器完成 PKCE 授权，并将刷新令牌安全加密存入 **Windows DPAPI 金库**自动续期。
- **30 工具防膨胀与 5 档权限联动**：当挂载外部工具超过 `30` 个时自动切换为 `mcp_search_tools` 跨语种按需检索；每个 MCP 服务可独立设为 `allow`、`confirm` 或 `deny`，并与会话级 5 档权限模式深度联动。

## 3. 零往返 Skills 技能包与 6 级生命周期钩子

- **6 源动态 Skills 与 `<1ms` 零往返预载（`skill_loader.py` + `turn_enricher.py`）**：原生兼容项目内 `.hyn_agent/skills` 与 `.claude/skills`。输入 `/skill-name` 斜杠指令或命中三语 BM25 意图（中位 `0.67ms`）时，技能全文在首轮即注入 Layer 4 `<system-reminder>`，无需额外浪费一次 `load_skill` 网络往返。
- **6 阶段确定性 Hooks 与 SHA-256 仓库信任链（`hooks.py`）**：支持 `UserPromptSubmit`、`PreToolUse`、`PostToolUse`、`SubagentStart`、`SubagentStop`、`Stop` 六大拦截点（退出码 `2` 硬阻断、`updatedInput` 参数清洗）。外部克隆仓库自带的脚本钩子必须经用户审批 **SHA-256 内容指纹**后才允许运行，篡改即刻吊销。

## 4. 抗休眠本地 Cron 定时自动化（Automations）

在左侧导航栏点击 **「自动化 (Automations)」**：
- 支持标准 5 段式 Cron 表达式定时执行无人值守巡检、回归测试或日报汇总（自动产出 `.docx` / `.xlsx` / `.pptx`）。
- 内置 **`catchup_once` 睡眠唤醒补跑机制**：即使电脑夜间休眠错过了触发时刻，唤醒开盖后也会自动安全补跑一次并推送系统级桌面通知。