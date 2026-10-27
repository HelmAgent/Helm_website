<div align="center">

<img src="./docs/public/helm-icon.jpg" alt="Helm Emblem" width="92" style="border-radius: 18px;" />

# HELM — Desktop Autonomous Coding & Office Agent

### *"Take the Helm of Long-Running Code & Docs."*
**执掌长周期代码与文档创作之舵 · 机密数据 100% 零出网**  
**機密コードを外部に送信しない。数時間の自律開発と文書制作の舵を取る**

[![Official Website](https://img.shields.io/badge/🌐_Official_Website-www.helm--ai.website-0ea5e9?style=for-the-badge)](https://www.helm-ai.website/)
[![Live Interactive Sandbox](https://img.shields.io/badge/🎮_1:1_Web_Workbench-Live_Demo-2563eb?style=for-the-badge)](https://www.helm-ai.website/demo)
[![Windows Installer](https://img.shields.io/badge/📥_Download_Windows_x64-v0.1.0_Beta-10b981?style=for-the-badge)](https://www.helm-ai.website/download)
[![VirusTotal 0/57 Clean](https://img.shields.io/badge/🛡️_VirusTotal-0%2F57_Clean-059669?style=for-the-badge)](https://www.virustotal.com/gui/file/c93002b281b848c534538236819c135139aa78e9ae85e88a04e67ba9536ccf0f?nocache=1)

</div>

---

## 🌐 立即访问 Helm 官方旗舰站 / 公式ウェブサイト / Official Website

> 🚀 **官方门户网站（支持中国大陆及全球免代理极速访问）**：  
> 👉 **[https://www.helm-ai.website/](https://www.helm-ai.website/)**

| 站点入口 / Entry | 简体中文 (ZH) | 日本語 (JA) | English (EN) |
| :--- | :--- | :--- | :--- |
| **🏠 产品旗舰首页 & 实机视频**<br/>*7分35秒一句话从零开发记账软件实录* | **[访问中文首页 ↗](https://www.helm-ai.website/)** | **[日本語ホーム ↗](https://www.helm-ai.website/ja/)** | **[English Home ↗](https://www.helm-ai.website/en/)** |
| **💻 1:1 在线交互工作台 (Web 沙盒)**<br/>*免安装直接在浏览器内操作体验* | **[打开交互工作台 ↗](https://www.helm-ai.website/demo)** | **[Web体験デモ ↗](https://www.helm-ai.website/ja/demo)** | **[Live Sandbox ↗](https://www.helm-ai.website/en/demo)** |
| **📘 工程架构白皮书 (全 5 卷)**<br/>*深入底层状态机与源码数据契约* | **[阅读架构白皮书 ↗](https://www.helm-ai.website/architecture/overview)** | **[技術設計白書 (全5章) ↗](https://www.helm-ai.website/ja/architecture/overview)** | **[5-Vol Blueprint ↗](https://www.helm-ai.website/en/architecture/overview)** |
| **⚡ 3 分钟快速上手与私有化部署**<br/>*Ollama 本机离线与企业内网配置* | **[查看快速指南 ↗](https://www.helm-ai.website/guide/getting-started)** | **[クイックスタート ↗](https://www.helm-ai.website/ja/guide/getting-started)** | **[Quick Start Guide ↗](https://www.helm-ai.website/en/guide/getting-started)** |
| **📥 客户端下载与三步离线安全审计**<br/>*Windows x64 安装包与 SHA-256 校验* | **[前往下载中心 ↗](https://www.helm-ai.website/download)** | **[ダウンロード・検証 ↗](https://www.helm-ai.website/ja/download)** | **[Download & Audit ↗](https://www.helm-ai.website/en/download)** |

---

## 📥 客户端下载与安全校验 / セキュリティ検証 / Security & Verification

您可以通过 **[Helm 官网下载中心 (https://www.helm-ai.website/download)](https://www.helm-ai.website/download)** 或下方 GitHub Releases 直链获取 Windows 64 位桌面安装版（已内嵌完整 **Electron 44 + Vue 3.5 + Python 3.13 FastAPI** 运行时与 Office 文档处理引擎，无需额外配置环境，安装即用，零 C 盘空间污染）：

**[📥 無料ダウンロード / 立即下载 Windows 版 (.exe) · v0.1.0 内测版](https://github.com/HelmAgent/Helm_website/releases/latest/download/Helm.Setup.1.0.0.exe)**  
🔒 **100% Local & Safe** · [✅ VirusTotal 安全扫描报告 (0/57 零报毒)](https://www.virustotal.com/gui/file/c93002b281b848c534538236819c135139aa78e9ae85e88a04e67ba9536ccf0f?nocache=1) · `SHA-256: c93002b2...536ccf0f`

| File / ファイル | Version & Size | SHA-256 Checksum | VirusTotal Scan Report |
| :--- | :--- | :--- | :--- |
| `Helm Setup 1.0.0.exe`<br/>(`Helm.Setup.1.0.0.exe`) | `v0.1.0 Beta` · `170 MB` | `c93002b281b848c534538236819c135139aa78e9ae85e88a04e67ba9536ccf0f` | [✅ View Report on VirusTotal (0/57 Clean)](https://www.virustotal.com/gui/file/c93002b281b848c534538236819c135139aa78e9ae85e88a04e67ba9536ccf0f?nocache=1) |

```powershell
# PowerShell 本地校验命令：
Get-FileHash .\Helm.Setup.1.0.0.exe -Algorithm SHA256
# 预期输出：C93002B281B848C534538236819C135139AA78E9AE85E88A04E67BA9536CCF0F
```

---

## ⚙️ 四大核心工程引擎（详见 [官网架构白皮书](https://www.helm-ai.website/architecture/overview)）

1. **全本地离线与企业内网（LAN）原生分级架构（Zero Data Egress）**
   - 原生支持 `127.0.0.1:11434` 本机 Ollama 物理断网直连，以及企业内网 GPU 集群（`vLLM / SGLang / OneAPI`）与 `RAGFlow` 知识库共享。
   - Electron 主进程内置写盘前正则密钥脱敏钩子（自动将 `sk-*` / `Bearer` 擦除为 `***`）与 `50 msg/s` IPC 限流保护。
2. **无侵入影子 Git 检查点与 P0–P3 长程自省引擎（Shadow Git & Long-Horizon Engine）**
   - 摒弃直接 `git commit` 污染用户分支的做法，采用临时 `GIT_INDEX_FILE` 与 `git commit-tree` 将快照写入私有命名空间 `refs/hyn/checkpoints/<session_id>`，用户 `git status` 与分支历史 100% 零污染。
   - 配合 `TurnHub` 单调递增 `seq` 环形缓冲断线回放与 `StuckDetector` L1/L2 防死循环强制自省，支撑数小时无人值守开发。
3. **Git Worktree 物理隔离的主从多智能体常驻团队（Multi-Agent Resident Team）**
   - Lead 主代理可统筹最多 4 名常驻队友（Teammates），基于 `ContextVar` 将每名队友的文件读写与终端命令严格锁定在各自的 `.hyn_wt/mate-*` 独立工作树中，并在重构计划获批准前从底层物理剥离一切写盘工具。
4. **WPS 级高保真文档工作台与会话级冻结双层记忆（Surgical Office & Frozen Memory）**
   - 右侧分栏原生渲染并编辑 `docx / xlsx / pptx / pdf / md / html`，支持鼠标框选任意幻灯片形状、Word 段落或表格区间触发 `SelectionAnchor` 手术刀级局部热替换（SSE 无闪烁热刷新）与 5 版本文件快照回退。
   - 独创会话级冻结记忆快照（`_memory_snapshot`）+ 后台异步水位线队列提取 `USER.md / MEMORY.md`，守护 **94.2% 大模型 Prefix Cache 命中率**。

---

## 🤝 社区交流、内测痛点共创与定制开发

目前处于内测阶段，感谢大家的支持与使用！遇到任何问题请随时提出，我会尽快优化修复。正式版及后续升级中将由大家的真实痛点决定下一版新功能——符合 **[官网公开的 3 条客观标准](https://www.helm-ai.website/#community)**（具备行业共性、输入输出边界清晰、公开内置共享与同行投票排期）的高频痛点，我将**免费为大家开发为官方内置功能**！

- **🌐 官方网站**：[https://www.helm-ai.website/](https://www.helm-ai.website/)
- **💬 Discord 交流群**：[https://discord.gg/AsU9Xqd6g](https://discord.gg/AsU9Xqd6g)
- **🐧 QQ 交流群号**：`1129820733`
- **✉️ 交流合作与私人订制邮箱**：`785430621@qq.com`（若有紧急交付或不便公开的私人订制功能需求，请通过邮箱单独联系）

---

## 🛠️ 官网仓库本地开发与构建说明

本仓库为 **Helm 官方旗舰网站（[https://www.helm-ai.website/](https://www.helm-ai.website/)）** 源码，基于 **Vue 3.5 + Vite 6** 构建：

```powershell
# 启动本地热更新开发服务
npm run dev

# 构建生产环境静态产物（同时生成 dist/ 与 docs/.vitepress/dist/）
npm run build

# 本地预览生产环境静态包
npm run preview
```
