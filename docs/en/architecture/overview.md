---
title: 1. System Topology, Zero-Trust Loopback Auth & Self-Healing Runtime
description: Deep dive into Helm's Electron 44 + Vue 3.5 + Python 3.13 FastAPI dual-process architecture, pure-ASGI subframe-isolated auth, Windows DPAPI vault, cross-protocol schema compiler, and admin-free System Doctor.
---

# 1. System Topology, Zero-Trust Loopback Auth & Self-Healing Runtime

> [!NOTE] Engineering Whitepaper Series (6 Volumes)
> This 6-volume series documents the state machines, security boundaries, and empirical benchmarks behind **Helm** (`167` backend Python modules / `70,223` LOC / `502` automated `pytest` tests; `69` frontend ESM modules / `42,326` LOC). Volume 01 covers `hyn_agent_frontend/main.js`, `preload.js`, `app/main.py`, `app/core/*`, `app/services/tool_schema.py`, and `app/services/system_doctor.py`.

## 1.1 Three-Plane Decoupled Desktop Topology

Helm avoids cramming heavy I/O into the Electron main process or routing user workspaces through third-party cloud sandboxes. Instead, it separates responsibilities across **Electron 44 Main Host (system bridge & security boundary) + Vue 3.5 Renderer (dual-mode workbench) + Local Python 3.13 FastAPI Engine (zero-framework async agent runtime)**:

```mermaid
flowchart TD
  subgraph Host["Electron 44 Desktop Host (Windows x64)"]
    Main["Electron Main (main.js · Main-Frame Token Injection · PowerSaveBlocker · IPC Rate Limit)"]
    Renderer["Vue 3.5 Renderer (src/ · Dual-Mode Workbench · Monotonic seq Stream Engine)"]
    PreviewFrame["Sandboxed Preview Subframe (subFrame · X-HYN-Token Physically Stripped)"]
    Main <-->|"preload.js Guarded Bridge (50 msg/s · 4KB Cap)"| Renderer
    Renderer -->|"Isolated Preview"| PreviewFrame
  end

  subgraph Engine["Python 3.13 FastAPI Async Runtime (127.0.0.1:8001)"]
    AuthMW["LocalAuthMiddleware (Pure ASGI · Loopback Host Guard · compare_digest)"]
    ReqMW["RequestLogMiddleware + LoopWatchdog (X-Request-ID · Event-Loop Lag Monitor)"]
    CoreLoop["Zero-Framework AgentLoop (5,227 LOC · TurnHub · 52 Built-in Tools + MCP)"]
    Vault["Windows DPAPI Vault (secret_box.py · Win32 CryptProtectData)"]
    Doctor["System Doctor Auto-Repair (Portable MinGit · Node v22 · uvx)"]
    AuthMW --> ReqMW --> CoreLoop
    CoreLoop --> Vault
    CoreLoop --> Doctor
  end

  subgraph Infra["100% Local & Enterprise Intranet Infrastructure"]
    LocalLLM["3-Tier Model Router (Local Ollama / Intranet vLLM / Direct Cloud API)"]
    LocalDisk["Isolated Data Root (.hyn_agent/ · Sessions · 2-Scope Memory · Shadow Git Refs)"]
  end

  Renderer <-->|"REST + SSE Stream (X-HYN-Token & X-Request-ID)"| AuthMW
  PreviewFrame -.->|"Unauthenticated Subframe Call -> 403 Blocked"| AuthMW
  CoreLoop --> LocalLLM
  CoreLoop --> LocalDisk
```

> [!TIP] Architectural Trade-off: Why Electron + Dedicated Python 3.13 Subprocess Instead of Pure Node.js?
> - **Engineering Bottleneck**: A desktop agent must keep a complex multi-tab document UI at 60 FPS while simultaneously executing CPU/I/O-heavy AST parsing, binary OpenXML (`docx/xlsx/pptx`) patching, and multi-agent Git worktree orchestration.
> - **Flaw in Conventional Designs**: Running heavy document parsing inside Node.js freezes IPC and window responsiveness; wrapping heavyweight frameworks like LangChain obscures prompt byte layout and breaks KV-cache determinism.
> - **Helm's Underlying Solution**: Keep Electron Main minimal (window lifecycle, `powerSaveBlocker`, native notifications) while driving a pure `asyncio + httpx` FastAPI engine bundled with an embedded official Python 3.13 runtime.
> - **Measured Engineering Gain**: Guarded by **`502` passing `pytest` tests**, achieving **0-byte unintended public telemetry** while allowing the exact same backend to deploy unchanged onto enterprise Docker clusters.

---

## 1.2 Zero-Trust Loopback Auth & Windows DPAPI Hardware-Bound Vault

Desktop apps listening on `127.0.0.1` face two classic attack vectors: **DNS rebinding from malicious websites** and **privilege escalation from untrusted HTML preview iframes stealing local auth headers**. Helm enforces defense-in-depth:

```mermaid
sequenceDiagram
  autonumber
  participant Boot as Electron Main (main.js)
  participant TopUI as Main Workbench Frame
  participant SubUI as Untrusted HTML Preview subFrame
  participant ASGI as LocalAuthMiddleware (local_auth.py)
  participant DPAPI as Windows DPAPI (secret_box.py)

  Boot->>Boot: Generate 256-bit random session token & pass to FastAPI env
  Boot->>TopUI: onBeforeSendHeaders injects X-HYN-Token into top-level mainFrame only
  SubUI->>ASGI: Malicious script attempts POST 127.0.0.1:8001/api/v1/tools
  Note over Boot,ASGI: details.frame !== mainFrame -> X-HYN-Token omitted
  ASGI-->>SubUI: 403 Forbidden (Blocks subframe escalation & non-loopback DNS Rebinding)
  TopUI->>ASGI: Save API Key / MCP OAuth token with valid loopback Host & X-HYN-Token
  ASGI->>ASGI: Constant-time secrets.compare_digest verification
  ASGI->>DPAPI: Win32 CryptProtectData bound to OS user login credentials
  DPAPI-->>TopUI: Ciphertext persisted to secrets_vault.json + log scrubber armed
```

1. **Pure-ASGI Zero-Buffering Auth (`app/core/local_auth.py`)**: Bypasses Starlette `BaseHTTPMiddleware` (which buffers streaming SSE responses), validates loopback `Host` headers against DNS rebinding, and runs `secrets.compare_digest` constant-time token verification.
2. **Windows DPAPI Credential Vault (`app/core/secret_box.py`, `secret_vault.py`)**: Encrypts every provider API key and MCP OAuth refresh token via Win32 `CryptProtectData` tied to the current Windows user account, paired with pre-write secret scrubbing (`***`), `4 KB` log line caps, and `50 msg/s` IPC rate limiting.

---

## 1.3 Three-Tier Compute Routing & Cross-Protocol Schema Compiler

LLM gateways enforce incompatible JSON Schema subsets (e.g., Gemini rejects `$defs`/`$ref` and `additionalProperties`, while several intranet engines reject `anyOf`). `app/services/tool_schema.py` compiles tool schemas deterministically:

```mermaid
flowchart LR
  Raw["52 Built-in Tools + Dynamic MCP Tool Schemas"] --> Compiler["adapt_schema Compiler (tool_schema.py)"]
  Compiler --> Step1["1. Recursively inline $defs & $ref definitions"]
  Step1 --> Step2["2. Flatten nullable anyOf / oneOf unions"]
  Step2 --> Step3["3. Strip forbidden dialect keys & sort keys deterministically"]
  Step3 --> P1["OpenAI Chat Completions (Local Ollama / Intranet vLLM / DeepSeek)"]
  Step3 --> P2["Anthropic Messages Native (Claude + 4-Breakpoint Ephemeral Cache)"]
  Step3 --> P3["Google Gemini Native (generateContent Strict Schema Subset)"]
```

| Deployment Tier | Supported Gateways (`8` Built-in Providers / `18` Curated Models) | Network Boundary | Core Engineering Capability |
| :--- | :--- | :--- | :--- |
| **`local` (Air-Gapped)** | Local `Ollama` (`127.0.0.1:11434/v1`) | **0 Bytes External** | Keyless model auto-discovery & VRAM reallocation backoff |
| **`lan` (Enterprise Intranet)** | Private `vLLM` / `SGLang` / `OneAPI` | **Inside Corporate Firewall** | Shared GPU clusters + intranet RAGFlow + reasoning trace parsing |
| **`cloud` (Direct Frontier)** | `DeepSeek` / `Qwen` / `GLM` / `Claude` / `Gemini` / `OpenAI` | Direct TLS to Official API | Zero proxy middlemen; native DeepSeek 64-token & Claude breakpoint caching |

---

## 1.4 Admin-Free `System Doctor` & 8-Step Deterministic Shutdown

1. **Portable Toolchain Auto-Repair (`app/services/system_doctor.py`)**: Performs 3-tier diagnostics across core runtime, external binaries, and MCP servers. On restricted corporate laptops without UAC admin rights, missing `git`, `node`/`npx`, or `uv`/`uvx` binaries are automatically provisioned using official portable **MinGit**, **Node.js v22**, and **`uv`** inside `DATA_DIR/toolchains/` without touching global system `PATH` or registry keys.
2. **Symmetric 6-Step Startup & 8-Step Graceful Shutdown (`app/main.py`)**: On exit, `_lifespan` deterministically checkpoints active `TurnHub` runs as `interrupted`, flushes the async memory queue (up to `10s`), suspends resident agent teams with a `24h` lease grace window, stops Cron jobs, terminates background process trees, closes MCP sessions, drains HTTP pools, and disarms `LoopWatchdog`.