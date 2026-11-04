# HYN Agent Pre-Cache Empirical Benchmark Report (`precache-v1`)

- **Run ID**: `20261104T121851Z_deepseek-v4-flash`
- **Model**: `deepseek-v4-flash` (`provider=deepseek`)
- **UTC Execution Window**: `2026-11-04T12:18:51Z` → `2026-11-04T12:27:40Z`
- **Local Execution Window**: `2026-11-04T20:18:51+08:00` → `2026-11-04T20:27:40+08:00`
- **Methodology**: Dual-Track verification combining **Track A** (4 deterministic multi-step/multi-turn trajectories replayed back-to-back in the same minute window with 40-char equal-token Run-Isolation Nonces) and **Track B** (`B5_live_e2e_bugfix` unscripted autonomous bugfix in an isolated temporary Git repository verified by `pytest`).

## 1. Executive Summary (`legacy_baseline` vs `optimized_v1`)

| Metric | `legacy_baseline` | `optimized_v1` | Delta / Savings |
| :--- | ---: | ---: | ---: |
| Total LLM Requests | 88 | 72 | — |
| Total Input Tokens | 3,613,525 | 3,150,112 | — |
| Cache Read Input Tokens (`0.1x`) | 2,327,552 | 2,779,008 | +451,456 |
| Uncached Input Tokens (`1.0x`) | 1,285,973 | 371,104 | **-71.14%** (-914,869) |
| All-Step Cache Hit Rate (`CHR_all`) | 64.41% | **88.22%** | **+23.81 pp** |
| Warm-Step Cache Hit Rate (`CHR_warm`, Step 2+) | 65.17% | **89.58%** | **+24.41 pp** |
| Effective Billable Input Tokens (`w_read=0.10`) | 1,518,728.2 | **649,004.8** | **-57.27% vs Baseline** |
| Billable Input Savings vs `0%` No-Cache Raw Input | -57.97% | **-79.40%** | — |
| Warm-Step Unexpected Prefix Breaks (`Step 2..N`) | 25 | **0** | Zero unexpected mutations (CoT turn-boundary resets: 7) |
| Long-Context (`>=20k`) `TTFT` P50 / P90 (ms) | 1096 / 1542 | **978 / 1375** | P50 10.77% |

> **Track A Controlled Replay (`B1`–`B4`, 124 paired calls)**: `CHR_warm` improved from `59.23%` to **`89.42%`**, reducing uncached prefill tokens by **`70.42%`** and effective billable input tokens by **`54.65%`** vs `legacy_baseline` (**`79.40%`** vs `0%`-cache raw input).

## 2. Per-Scenario Breakdown

| Scenario | Track | Steps (B/O) | Baseline Input | Baseline Hit (`CHR_warm`) | Optimized Input | Optimized Hit (`CHR_warm`) | Uncached Saved | Billable Saved (vs Base / vs Raw) | `>=20k` TTFT P50 (B → O) |
| :--- | :---: | :---: | ---: | ---: | ---: | ---: | ---: | ---: | :---: |
| `B1_fullstack_bugfix_16steps` | A | 16/16 | 583,948 | 341,248 (59.29%) | 628,343 | 558,464 (**90.25%**) | -71.21% | **-54.58%** / -79.99% | 976ms → 949ms |
| `B2_multiturn_mixed_lang_10turns` | A | 14/14 | 674,168 | 273,024 (41.01%) | 691,136 | 579,328 (**84.99%**) | -72.13% | **-60.38%** / -75.44% | 1341ms → 960ms |
| `B3_office_selection_8turns` | A | 12/12 | 441,932 | 340,096 (78.45%) | 446,349 | 375,168 (**85.88%**) | -30.10% | **-19.98%** / -75.65% | 997ms → 1017ms |
| `B4_longhorizon_milestone_20steps` | A | 20/20 | 1,030,787 | 643,200 (62.92%) | 1,080,492 | 998,144 (**93.21%**) | -78.75% | **-59.69%** / -83.14% | 973ms → 890ms |
| `B5_live_e2e_bugfix` | B | 26/10 | 882,690 | 729,984 (83.51%) | 303,792 | 267,904 (**91.07%**) | -76.50% | **-72.23%** / -79.37% | 994ms → 1061ms |

## 3. DeepSeek Platform Billing Reconciliation Guide

To independently verify these exact token counters against your live DeepSeek Open Platform statement:
1. Sign in to `https://platform.deepseek.com/usage`.
2. Select the UTC date/hour window covering **`2026-11-04T12:18:51Z`** to **`2026-11-04T12:27:40Z`** (Local time: `2026-11-04T20:18:51+08:00` to `2026-11-04T20:27:40+08:00`) and filter by model **`deepseek-v4-flash`**.
3. Compare the platform's billed usage totals for this run window against the sum of both variants (`legacy_baseline` + `optimized_v1`) recorded in `traces/*.jsonl`:
   - **Combined API Requests**: `160`
   - **Combined Total Prompt (`input_tokens`)**: `6,763,637`
   - **Combined Cache Hit Tokens (`prompt_cache_hit_tokens`, billed at 0.1x)**: `5,106,560`
   - **Combined Cache Miss Tokens (`prompt_cache_miss_tokens`, billed at 1.0x)**: `1,657,077`
   - **Combined Completion Tokens (`completion_tokens`)**: `13,344`

## 4. Reproduction & Integrity Verification

```powershell
Set-Location hyn_agent_backend
.\.venv\Scripts\python.exe scripts/bench_precache.py --model deepseek-v4-flash
```

Every `.jsonl` trace line contains the provider's native `response_id` (`chatcmpl-...`), deterministic SHA-256 prefix fingerprints (`tools_sha256`, `system_sha256`, `msg_hashes`), and `raw_provider_usage`. Verify file checksums against `manifest.json`.
