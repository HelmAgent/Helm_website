---
title: Local RAG & MCP / Skills / Hooks
description: Connect RAGFlow hybrid knowledge bases, configure full-protocol MCP with OAuth 2.0, sub-1ms Zero-RTT Skills, 6-stage Hooks, and sleep-resilient Cron automations.
---

# Local RAG & MCP / Skills / Hooks Extensibility

## 1. Local & Intranet Knowledge Base (100% Recall RAGFlow Pipeline)

Open **Knowledge** in the left sidebar to connect a local or intranet **RAGFlow 1.0** service:
- **15 Layout Templates & Live Indexing**: Upload PDFs, compliance manuals, and spreadsheets while tracking real-time parsing status (`RUNNING` / `DONE`).
- **Hybrid Retrieval & `[ev_N]` Grounding**: Combines `0.7` dense vectors + `0.3` BM25 + Cross-Encoder reranking ([see 4-Stage RAG Benchmark](/en/benchmarks/rag-eval-v1)) with mandatory `[ev_N]` source citations that jump straight to the exact page in `PdfViewer`.

## 2. Full-Protocol MCP Client & RFC 8252 OAuth 2.0

Configure local, intranet, or SaaS MCP servers under **Customize → MCP**:
- **All 3 Transports**: Native support for `stdio`, `sse`, and `streamable_http` (Tools, Resources, and Elicitation).
- **DPAPI-Protected OAuth 2.0**: Launches RFC 8252 loopback PKCE sign-in in your system browser and encrypts refresh tokens inside the **Windows DPAPI Vault**.
- **30-Tool Cap & 5-Tier Permissions**: Automatically switches to `mcp_search_tools` lazy discovery above `30` tools, with per-server `allow` / `confirm` / `deny` policies integrated into the 5-tier session sandbox.

## 3. Zero-RTT Skills, 6-Stage Hooks & Sleep-Resilient Cron

- **Sub-`1ms` Zero-RTT Skills (`skill_loader.py` + `turn_enricher.py`)**: Compatible with `.hyn_agent/skills` and `.claude/skills`. Explicit `/skill` commands and trilingual BM25 matches (`0.67ms` median) preload instructions into Layer 4 `<system-reminder>` on Turn 1—saving a full LLM round-trip.
- **6-Stage Lifecycle Hooks & SHA-256 Trust (`hooks.py`)**: Intercept `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `SubagentStart`, `SubagentStop`, and `Stop` (exit-code `2` hard block + `updatedInput`). Repo-local hooks/skills require explicit **SHA-256 content-fingerprint approval** before execution.
- **Sleep-Resilient Cron (`cron_scheduler.py`)**: Schedule 5-field Cron jobs with `catchup_once` recovery so missed overnight runs execute cleanly upon laptop wake.