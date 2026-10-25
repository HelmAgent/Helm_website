---
title: 4. Two-Tier Memory & Local RAG
description: Prefix-cache-friendly session-frozen memory snapshots, async extraction queue with watermarks, CJK bigram scoring, and RAGFlow evidence packing.
---

# 4. Prefix-Cache-Friendly Two-Tier Memory & Local RAG

> [!NOTE] Source Modules & Design Docs
> - Source: `app/services/memory.py`, `app/services/memory_queue.py`, `app/services/memory_store.py`, `app/services/knowledge/*`
> - Design Plan: `docs/memory_upgrade_plan.md`

## 4.1 Solving the Three Classic Agent Memory Bottlenecks

1. **Protecting LLM Prefix Cache (90%+ Hit Rate)**: Dynamically mutating the system prompt's memory block on every turn invalidates the LLM KV prefix cache. HYN Agent **freezes a recalled memory snapshot per session** at a fixed prompt offset and provides an on-demand `read_memory` tool for mid-session lookups.
2. **Non-Blocking Async Extraction Queue (`memory_queue.py`)**: Memory extraction runs asynchronously in the background after turn completion (and right before context compaction), adding zero latency to user replies.
3. **Watermark Filtering & CJK Bigram Scoring (`memory_text.py`)**: Tracks per-session extraction watermarks, strips pseudo-messages (`[Scheduled]`, `[Team events]`) and bulky `tool_result` blocks, and uses **adjacent character bigram scoring** for accurate Chinese/Japanese keyword fallback without requiring a heavy external vector DB.

```mermaid
flowchart LR
  subgraph TurnRuntime["Turn Runtime (agent_loop.py)"]
    FrozenSnap["Session-Frozen Memory Snapshot<br/>(Fixed Prompt Offset · Preserves Prefix Cache)"]
    ReadMemTool["read_memory / remember / forget Tools<br/>(On-Demand Lookup)"]
  end

  subgraph AsyncPipeline["Async Extraction Pipeline (memory_queue.py)"]
    Watermark["Watermark Filter<br/>(Strips pseudo-messages & bulky tool_results)"]
    Extractor["Incremental LLM Extraction & Conflict Resolution<br/>(Updates/deletes existing memory IDs)"]
    Sanitizer["Secret Interception & Atomic Disk Write<br/>(Blocks API keys · atomic write)"]
    Watermark --> Extractor --> Sanitizer
  end

  subgraph Storage["Two-Tier Markdown Store (memory_store.py)"]
    GlobalScope["Global Scope<br/>Cross-project preferences"]
    WorkspaceScope["Workspace Scope<br/>Repo-specific conventions"]
  end

  TurnRuntime -- "Enqueued on turn end & pre-compaction" --> AsyncPipeline
  Sanitizer --> Storage
  Storage -- "Frozen at session start via Bigram scoring" --> FrozenSnap
```

---

## 4.2 Local RAGFlow Knowledge Base & Verifiable Evidence Chains

For large enterprise document repositories, `app/services/knowledge/` connects to local or intranet **RAGFlow** instances. `evidence.py` (`pack_evidence`) packages retrieved chunks with document titles, dataset IDs, and similarity scores so every claim is traceable to internal source files.
