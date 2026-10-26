---
title: Ollama 与企业内网模型配置
description: 配置 Helm 连接本机 Ollama 离线模型或企业局域网私有部署的 vLLM / SGLang / OneAPI 服务。
---

# Ollama 与企业内网模型配置

在金融、政务及高安全要求的企业研发环境中，**“源码与核心设计文档严禁上传公网”** 是引入 AI 编程工具的最大痛点。Helm 在底层模型目录（`app/catalog/models.py`）中将模型供应商明确划分为 `local`（本机离线）、`lan`（局域网内网）与 `cloud`（公网云端）三类，原生支持免密钥直连本地与内网模型。

## 一、 连接本机 Ollama（100% 物理断网可用）

### 1. 启动本机 Ollama 服务
在你的电脑上安装并启动 [Ollama](https://ollama.com/)，拉取适合编码与工具调用的开源模型：
```powershell
# 推荐 16GB~32GB 内存机器使用 14B 或 32B 编码模型
ollama pull qwen2.5-coder:14b
# 或拉取支持长上下文与工具调用的模型
ollama pull qwen2.5:32b
```

### 2. 在 Helm 中一键启用
1. 打开 **「设置 → 模型」**，在供应商列表中找到带有 **「本机离线 (Local)」** 标识的 **Ollama**。
2. 默认地址已预置为 `http://127.0.0.1:11434/v1`，**无需填写 API Key**（`requires_key=False`）。
3. 在「自定义模型 ID」中输入你本地拉取的模型名（如 `qwen2.5-coder:14b`），点击 **「探测连接 (Probe)」**，验证通过后即可在底部书写条的模型选择器中切换使用。

---

## 二、 连接企业局域网私有大模型（vLLM / SGLang / OneAPI）

许多企业会在内部 GPU 服务器上使用 **vLLM**、**SGLang**、**Xinference** 或 **OneAPI** 部署开源大模型（如 `DeepSeek-R1-Distill`、`Qwen2.5-Coder-32B`）。

### 配置步骤
1. 打开 **「设置 → 模型」**，选择 **「局域网大模型（企业内网）」**（`id: lan_server`）。
2. 将服务地址修改为公司内网推理网关地址（例如 `http://192.168.1.100:8000/v1` 或 `http://llm.internal.corp.local/v1`）。
3. 若内网网关未开启鉴权，密钥栏可直接留空；若开启了内网 Token 校验，填入对应内网 Token（仅保存在本机）。
4. 添加内网部署的 Model ID 并启用，即可实现**团队全员共享内网大模型算力，同时源码与会话 100% 不出公司局域网**。

---

## 三、 针对本地/开源小参数模型的稳定性兜底

开源模型（7B / 14B / 32B）在长程任务中的 Tool Calling 稳定性往往弱于云端超大模型。Helm 在后端引擎中专门做了三层工程加固：
1. **截断续写与重试清洗（`llm_retry.py` + `TurnHub`）**：当本地模型因显存抖动或生成截断报错时，自动触发带 `stream_reset` 的重试机制。
2. **二阶防死循环自省（`stuck_detector.py`）**：本地模型容易在同一报错命令上反复重试。当连续重复无效工具调用时，系统自动注入 `L1 / L2_RETROSPECTIVE_NOTICE` 强制模型切换排查策略。
3. **显式完成门禁（`completion.py`）**：防止本地小模型“只改了一半代码就提前宣称任务完成”。
