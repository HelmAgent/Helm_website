---
title: Local RAG & MCP / Skills
description: Connect RAGFlow local knowledge bases, mount MCP servers, load Skills, and schedule Cron automations in Helm.
---

# Local RAG & MCP / Skills Extensibility

## 1. Local Knowledge Base (RAGFlow Integration)

Open **Knowledge** in the left sidebar to connect a local or intranet **RAGFlow** instance:
- **Dataset & Document Management**: Create datasets, upload internal architecture docs or compliance specs, and monitor chunk parsing status (`RUNNING` / `DONE`).
- **Structured Evidence Packing (`app/services/knowledge/evidence.py`)**: Retrieved chunks are packed with source filenames and relevance scores so responses remain grounded in verifiable internal documentation.

## 2. MCP (Model Context Protocol) Runtime

Configure standard MCP servers under **Customize → MCP**:
- **Lazy On-Demand Spawning**: MCP child processes are spawned only when enabled and invoked, and cleanly terminated during FastAPI lifespan shutdown (`app/main.py`).
- **Per-Server Security Policies**: Set each MCP server to `allow`, `confirm`, or `deny`, integrated with the 4-tier session permission engine.

## 3. Skills, Lifecycle Hooks & Cron Automations

- **Skills (`skill_loader.py`)**: Reusable domain instructions loaded on demand via `load_skill` without bloating the base system prompt.
- **Lifecycle Hooks (`hooks.py`)**: `PreToolUse` and `PostToolUse` hooks for permission enforcement and auditing.
- **Cron Automations (`cron_scheduler.py`)**: Schedule recurring unattended agent runs with standard Cron expressions.
