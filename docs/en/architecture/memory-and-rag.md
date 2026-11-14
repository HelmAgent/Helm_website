---
title: 4. 97.7% Prefix Cache Economics, 7-Stage Compaction & Hybrid RAG
description: Inside Helm's 4-layer append-only prefix contract, SHA-256 drift diagnostics, 7-stage cache-aware context compactor, zero-DB Markdown memory, and 100% Strict Recall RAGFlow pipeline.
---

# 4. 97.7% Prefix Cache Economics, 7-Stage Compaction & Hybrid RAG

> [!NOTE] Core Modules & Cryptographically Signed Evidence
> - Core Modules: `app/services/prefix_policy.py`, `prefix_hash.py`, `context_compact.py`, `memory_store.py`, `memory_extractor.py`, `knowledge/ragflow.py`, `web_search/*`
> - Empirical Reports: [Prefix Cache Stability (160 Live Calls · Unexpected Breaks 25->0 · -57.3% Cost)](/en/benchmarks/precache-v1) · [4-Stage RAG Evolution (Strict Recall 36.7%->100.0% · MRR 1.000)](/en/benchmarks/rag-eval-v1)

## 4.1 Four-Layer Append-Only Prefix Architecture & Drift Telemetry

Injecting dynamic timestamps, toggled skills, or unsorted MCP schemas into the system prompt invalidates tens of thousands of cached KV tokens on every turn. Helm enforces a strict **4-Layer Append-Only Prefix Contract**:

```mermaid
flowchart LR
  subgraph Frozen["Session-Frozen Prefix (100% Byte-Identical Across Turns)"]
    L1["Layer 1: Core System Prompt + Static AGENTS.md + Turn-1 Memory Snapshot"]
    L2["Layer 2: Deterministically Sorted Built-in & MCP Tool Schemas"]
  end

  subgraph AppendOnly["Turn-Append Zone (Zero In-Place History Mutation)"]
    L3["Layer 3: Conversation Messages (Guarded by Cache-Economics Delayed Dedup)"]
    L4["Layer 4: Tail Dynamic Zone (<system-reminder> · Plan Mode · Incremental Memory · Skills)"]
  end

  L1 --> L2 --> L3 --> L4
  L1 & L2 & L3 -.->|"Per-Layer SHA-256 Fingerprints (prefix_hash.py)"| Audit["Real-Time broken_layer Attribution + Anthropic 4-Breakpoint Cache"]
```

> [!TIP] Architectural Trade-off: Mid-Session Mode Switching With Zero Cache Invalidation
> - **Engineering Bottleneck**: Switching into `Plan Mode`, recalling new memories, or invoking `/skill` mid-session must alter behavior immediately without breaking the frozen prefix.
> - **Flaw in Conventional Designs**: Mutating Layer 1 system prompts or filtering Layer 2 tool arrays collapses warm KV-cache hit rates below 45%.
> - **Helm's Underlying Solution**: Lock Layer 1/2 across the session and route all mid-session state changes (`Plan Mode` rules, preloaded `SKILL.md`, `<incremental_memory_recall>`) into Layer 4 tail `<system-reminder>` blocks while auditing per-layer SHA-256 hashes via `prefix_hash.py`.
> - **Measured Engineering Gain**: **`97.74%` live prefix cache hit rate** across 120M+ SWE-bench tokens (**`¥0.27`/solved issue**), and **`0` unexpected warm breaks** (down from `25`, **`-57.27%` billable input cost**) across 160 live calls in [Prefix Cache Benchmark (`/en/benchmarks/precache-v1`)](/en/benchmarks/precache-v1).

---

## 4.2 Seven-Stage Cache-Aware `ContextCompactor`

```mermaid
flowchart TD
  Input["Pre-Turn Context Watermark Check"] --> S1["Stage 1: tool_result_budget Disk Offload + 60/40 Head-Tail Preview"]
  S1 --> S2["Stage 2: KV-Cache Economics Delayed Dedup (delta_saved * 6 * 0.10 > invalidated * 0.90)"]
  S2 --> S3["Stage 3: snip_compact Prunes Stale Oversized Outputs"]
  S3 --> S4["Stage 4: micro_compact Condenses Early Intermediate Steps"]
  S4 --> S5["Stage 5: fit_tool_results Enforces Per-Turn Parallel Burst Cap"]
  S5 --> S6["Stage 6: compact_history Structured Summary (Flushes Memory Queue First)"]
  S6 --> S7["Stage 7: reactive_compact Emergency Recovery on HTTP 400 / 413 Overflow"]
```

- **60/40 Head-Tail Truncation**: Retains the first `60%` (invocation context) and final `40%` (stack trace & assertion summary) while saving full output to disk — preserving **`100.0%` of tail tracebacks** vs `33.3%` under head-only truncation at **`93.1%` compression**.

---

## 4.3 Zero-DB Dual-Scope Memory, 4-Stage Hybrid RAG & 5+1 Web Failover

```mermaid
flowchart TD
  Query["User Prompt / Cross-Domain Retrieval"] --> Mem["2-Scope Markdown Memory (_global + <ws_key> · 10-Gen .history/)"]
  Query --> RAG["Enterprise RAGFlow 1.0 (15 Layout Parsers · 0.7 Dense + 0.3 BM25 + Rerank)"]
  Query --> Web["5+1 Web Search Failover (DeepSeek -> Bocha -> Yuanbao -> Perplexity -> Felo -> Custom)"]

  Mem -->|"Turn-1 CJK Bigram + <2ms Mid-Turn BM25"| Inject["Grounded Context Assembly"]
  RAG -->|"[ev_N] Mandatory Page Citations + OOD Refusal Gate"| Inject
  Web -->|"SSRF Private-IP Block + <untrusted_web_content> Isolation"| Inject
```

| RAG Stage (`/en/benchmarks/rag-eval-v1`) | Key Engineering Upgrade | `Strict Recall@5` | `MRR` | Distractor Pollution | `OOD` Refusal Accuracy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`v0` Baseline** | Dense vector search with fixed chunking | `36.7%` | `0.489` | `46.7%` | `66.7%` |
| **`v1` Hybrid** | `0.7` Dense + `0.3` BM25 + layout-aware chunking | `73.3%` | `0.811` | `20.0%` | `83.3%` |
| **`v2` Reranked** | Cross-Encoder semantic reranking | `93.3%` | `0.956` | `3.3%` | `100.0%` |
| **`v3` Production** | Confidence gating + mandatory `[ev_N]` grounding | **`100.0%` (30/30)** | **`1.000`** | **`0.0%`** | **`100.0%` (6/6)** |