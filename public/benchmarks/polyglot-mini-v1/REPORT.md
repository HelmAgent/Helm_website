# HYN Agent 多语言代码编辑与 Polyglot 评测报告 (`polyglot_mini`)

- **生成时间**：`2026-11-10T12:16:16.664072+00:00`
- **评测范围**：`Python`、`TypeScript`、`Go`、`Rust`、`C++`、`Java` 六大主流语言

## 1. Track A：六大语言工具链确定性实测 (`36/36` 零 API 成本微基准)

| 语言 (`Language`) | 测试用例数 | 通过率 (`Pass@1`) | `code_outline` 符号召回 | `edit_file` + `apply_patch` | `CRLF` & `CJK` 无损保持 | 歧义防误改 & 语法校验 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **`PYTHON`** | `6` | **`100.0%`** | `5/5` | `100%` | `100%` | `100%` |
| **`TYPESCRIPT`** | `6` | **`100.0%`** | `4/4` | `100%` | `100%` | `100%` |
| **`GO`** | `6` | **`100.0%`** | `4/4` | `100%` | `100%` | `100%` |
| **`RUST`** | `6` | **`100.0%`** | `4/4` | `100%` | `100%` | `100%` |
| **`CPP`** | `6` | **`100.0%`** | `4/4` | `100%` | `100%` | `100%` |
| **`JAVA`** | `6` | **`100.0%`** | `4/4` | `100%` | `100%` | `100%` |
| **总计 (`Aggregate`)** | **`36`** | **`100.0%`** | **`100.0%`** | **`100.0%`** | **`100.0%`** | **`100.0%`** |

## 2. Track B：Aider-Polyglot 24 题无提示盲测（Blind-Prompt）编程套件

- **当前验证模式**：`llm-live`（分层：`full`，通过：`24/24` = **`100.0%`**，API 成本：`¥0.0339`）
- **DeepSeek 错峰实测一键启动命令（北京时间：工作日 18:00–次日 09:00 及周末全天）**：
  ```powershell
  # 1. Canary 探针集（6 题，每语言 1 题，预计耗时 ~25s，成本 ~¥0.01）
  $env:PYTHONIOENCODING='utf-8'; .\.venv\Scripts\python.exe scripts/bench_polyglot_mini.py --mode llm-live --tier canary --require-offpeak --max-cost-cny 2.0

  # 2. Full 完整集（24 题，6 语言 × 4 题无提示盲测，预计耗时 ~90s，成本 ~¥0.03）
  $env:PYTHONIOENCODING='utf-8'; .\.venv\Scripts\python.exe scripts/bench_polyglot_mini.py --mode llm-live --tier full --require-offpeak --max-cost-cny 5.0
  ```
