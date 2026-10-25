---
title: Ollama & Intranet LLM Setup
description: Connect HYN Agent to local offline Ollama or internal corporate vLLM / SGLang / OneAPI clusters.
---

# Ollama & Intranet LLM Setup

Enterprise R&D teams often prohibit sending proprietary source code to external cloud APIs. HYN Agent categorizes providers in `app/catalog/models.py` into `local` (offline), `lan` (corporate intranet), and `cloud`, supporting key-free connections to local and intranet endpoints.

## 1. Local Offline Ollama (`127.0.0.1`)

1. Install and start [Ollama](https://ollama.com/), then pull a coding-capable model:
   ```powershell
   ollama pull qwen2.5-coder:14b
   # Or on 32GB+ RAM machines:
   ollama pull qwen2.5-coder:32b
   ```
2. In HYN Agent, go to **Settings → Models** and select **Ollama (Local Offline)**.
3. The default endpoint `http://127.0.0.1:11434/v1` requires no API key (`requires_key=False`). Add your model ID and click **Probe** to verify connectivity.

## 2. Enterprise Intranet LLM (`lan_server`)

Connect directly to internal GPU servers running **vLLM**, **SGLang**, **Xinference**, or **OneAPI**:
1. Select **Enterprise LAN Model (`lan_server`)** in **Settings → Models**.
2. Enter your internal gateway URL (e.g., `http://192.168.1.100:8000/v1`).
3. Add the internal model ID and optional token. Your entire engineering team can leverage shared on-premise GPUs while keeping 100% of code and documents inside the corporate network.

## 3. Stability Guardrails for Smaller Local Models

To compensate for tool-calling instability in 7B–32B models, HYN Agent includes three runtime guardrails:
- **`TurnHub` + `stream_reset`**: Automatically discards partial dirty streams when retrying truncated or failed local LLM generations.
- **`StuckDetector` L1/L2 Retrospective Injection**: Detects repeated identical tool errors and injects `L2_RETROSPECTIVE_NOTICE` to break infinite loops.
- **Explicit Completion Gate (`completion.py`)**: Prevents premature task termination before verification steps pass.
