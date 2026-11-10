# HYN Agent 通用办公与多步调研评测报告 (`gaia_mini`)

- **生成时间**：`2026-11-10T03:34:52.726177+00:00`
- **评测覆盖**：`.docx` / `.xlsx` / `.pptx` / `.pdf` 多模态办公工具链微基准（Track A）+ GAIA Validation Level 1–3 分层 30 题套件（Track B）

## 1. Track A：多模态办公工具链与 GAIA 判分器确定性实测 (`20/20` 零 API 成本)

| 能力模块 | 测试用例数 | 通过率 (`Pass Rate`) | 核心验证点 |
| :--- | :---: | :---: | :--- |
| **Word 文档读写与选区热更新 (`.docx`)** | `4` | **`100.0%`** | `write_docx`、`read_document`、`edit_document`、`patch_file_selection` 段落级快照回滚 |
| **Excel 多表解析与共享字符串还原 (`.xlsx`)** | `1` | **`100.0%`** | `xl/sharedStrings.xml` + 数值单元格跨表无损还原 |
| **PPTX 幻灯片与演讲者备注提取 (`.pptx`)** | `1` | **`100.0%`** | 幻灯片正文 + `notesSlide` 演讲者备注联合提取 |
| **PDF 按页分段读取与二进制防护门禁 (`.pdf`)** | `4` | **`100.0%`** | `pages='2-2'` 按页精准隔离 + `read_file` 二进制误读自动拦截引导 |
| **GAIA Official Exact-Match 答案标准化器** | `10` | **`100.0%`** | 货币符号、千分位、百分比、冠词、多元素列表等价归一 |
| **总计 (`Aggregate`)** | **`20`** | **`100.0%`** | **耗时 `1260.69 ms`，API 成本 `¥0.00`** |

## 2. Track B：GAIA Validation 30 题分层套件（Level 1–3）状态与错峰启动命令

| 难度分层 (`GAIA Level`) | 题目数 | 当前验证模式 (`Mode`) | 准确率 (`Exact Match`) | 典型任务特征 |
| :--- | :---: | :---: | :---: | :--- |
| **Level 1（1–2 步工具检索）** | `10` | `llm-mock` | **`100.0%`** | PDF 指定页码提取、PPTX 演讲者备注定位、单表数值查询 |
| **Level 2（3–5 步跨表对账推理）** | `12` | `llm-mock` | **`100.0%`** | 跨 `.xlsx` 财报与 `.docx` SLA 合同违约金核算、多跳占比统计 |
| **Level 3（6+ 步跨模态综合与版本覆盖）** | `8` | `llm-mock` | **`100.0%`** | 跨 5 份异构文档 + 补充修订备忘录的时间版本覆盖与综合交付 |
| **总计 (`30 Tasks`)** | **`30`** | `llm-mock` | **`100.0%`** | **DeepSeek 错峰实测就绪** |

### DeepSeek 夜间错峰实测一键启动命令（北京时间 00:30–08:30）
```powershell
# 1. Canary 探针集（6 题：2 L1 + 2 L2 + 2 L3，预计耗时 ~45s，成本 ~¥0.18）
$env:PYTHONIOENCODING='utf-8'; .\.venv\Scripts\python.exe scripts/bench_gaia_mini.py --mode llm-live --tier canary --require-offpeak --max-cost-cny 2.0

# 2. Full 完整集（30 题：10 L1 + 12 L2 + 8 L3，预计耗时 ~3.5min，成本 ~¥0.85）
$env:PYTHONIOENCODING='utf-8'; .\.venv\Scripts\python.exe scripts/bench_gaia_mini.py --mode llm-live --tier full --require-offpeak --max-cost-cny 5.0
```
