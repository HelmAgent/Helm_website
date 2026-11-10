# 代码导航能力升级：对标总报告（FINAL_REPORT，Step 4B 全量结项版）

> **更新时间**：2026-11-10（北京时间）｜**被测基线**：HYN Agent（backend `7748b1e` → 后置修复提交 `779dd59`）+ DeepSeek-V4.1-Flash（目录 ID `deepseek-flash`）
> **评测集**：SWE-bench Verified Mini（`MariusHobbhahn/swe-bench-verified-mini`，`split=test`，`n=50`，`django/django` 25 题 + `sphinx-doc/sphinx` 25 题，SHA-256 `cafe0f03f7f6db13...`）
> **已完成全部 4 组运行**：
> 1. `hyn_flash_r1`（首轮 T1→T2→T3 全量 50 题，发现 `7985` 联网泄漏并驱动后置修复 `779dd59`）
> 2. `hyn_flash_r1_clean`（在 `779dd59` 全程 `--network none` 下重跑 `sphinx-doc__sphinx-7985` 并合入其余 49 道干净题目，构成首轮无泄漏全量 50 题基线）
> 3. `hyn_flash_r2`（在 `779dd59` 下全新重跑完整 50 题，验证多轮稳定性与后置修复效果）
> 4. `mini_swe_flash_r1`（同模型 `deepseek-flash`、同 50 题集的官方 `mini-SWE-agent` 参照组）

---

## 0. 结论速览

| 运行标识 / 统计口径 | 解决 / 总数 | % Resolved | Wilson 95% CI / 标准差 | 核心说明 |
|---|---:|---:|---:|---|
| **`hyn_flash_r1_clean`（HYN 单次 Pass@1，第 1 轮干净全量）** | **42 / 50** | **84.00%** | **[71.49%, 91.66%]** | `7985` 在 `--network none` 下独立写出 `check_local_link` 并通过，全集 50 题零泄漏 |
| **`hyn_flash_r2`（HYN 单次 Pass@1，第 2 轮全新全量）** | **39 / 50** | **78.00%** | **[64.76%, 87.25%]** | 50/50 题全程断网，`gate_full` 无警告 `PASS`，总成本降至 ¥10.39（降幅 14.5%） |
| **HYN 两轮干净运行均值 ± 标准差（推荐主汇报口径）** | **40.5 / 50** | **81.00%** | **± 4.24%（样本 SD）** | 两轮交集（均解决）`38/50`（76.00%）；两轮并集（任一解决，仅作波动参考）`43/50`（86.00%） |
| **`mini_swe_flash_r1`（同模型 `mini-SWE-agent` 参照组 Pass@1）** | **41 / 50** | **82.00%** | **[69.20%, 90.23%]** | 配对精确 McNemar 检验：vs `r1_clean`（+2.0%，$p=1.00$）、vs `r2`（-4.0%，$p=0.73$），无统计学显著差异 |
| `hyn_flash_r1`（首轮原始 / 有效性修正） | 42 / 50（修正 41 / 50） | 84.00%（82.00%） | [69.20%, 90.23%] | 首轮 `7985` 因运行期容器未断网存在参考答案泄漏，已由 `hyn_flash_r1_clean` 替代 |
| 剔除 2 道上游 linkcheck 异常题（`n=48`） | `r1_clean` 40/48｜`r2` 38/48｜`mini` 39/48 | 83.33%｜79.17%｜81.25% | HYN 均值 **81.25% ± 2.95%** | 剔除 `sphinx-doc__sphinx-7985` 与 `8269` 后的 48 题稳定口径 |

- **工程链路与后置修复验证（提交 `779dd59`）**：
  - 在 `hyn_flash_r1_clean` 与 `hyn_flash_r2` 中，**0 次 API/容器错误、0 个空补丁、0 个补丁应用失败、0 次费用熔断、0 次墙钟超时**（100/100 题全部产出有效补丁；对比 `mini_swe_flash_r1` 出现 2 题因 80 步耗尽未提交补丁 `empty_patch = 4.0%`）。
  - 提交 `779dd59` 将 `DEFAULT_NETWORK_ALLOWLIST` 清空（仅保留在独立判分阶段容器），`hyn_flash_r2` 的 50 题 **100% 运行于 `--network none`**；同时消除了 `chmod 644` 权限噪声（从 `r1` 的 24 题降至 `r2` 的 **0 题**）、消除了 `web_search` 幻觉调用（从 `r1` 的 18 题 23 次降至 `r2` 的 **0 次**），并将 `.scratch` 临时目录排除在未同步检查之外，`hyn_flash_r2/gate_full.json` 取得无警告 `PASS`。
- **成本与缓存命中率（100% 错峰时段）**：
  - `hyn_flash_r1_clean`：总成本 **¥12.16**（¥0.243/题，¥0.289/解决题），前缀缓存命中率 **97.74%**。
  - `hyn_flash_r2`：总成本 **¥10.39**（¥0.208/题，¥0.267/解决题），前缀缓存命中率 **97.62%**；Kimi 失败归类 ¥1.96。
  - `mini_swe_flash_r1`（从 `mini_swe_raw/*.traj.json` 逐轮提取重算）：Prompt Tokens `45.73M`（缓存命中率 **97.19%**），Completion Tokens `707.1K`，按 DeepSeek V3.2 同口径错峰费率折算为 **¥6.79**（标准时段 ¥13.58）。
  - **本轮 Step 4 全部实测 LLM 总开销**：`hyn_flash_r1`（¥11.93 + 归类 ¥1.37）+ `7985` 干净重跑（¥0.28）+ `hyn_flash_r2`（¥10.39 + 归类 ¥1.96）+ `mini_swe_flash_r1`（¥6.79）= **¥32.72**（远低于 `RUNBOOK.md` 预算上限 ¥100）。
- **失败归类与 LSP 决策**：
  - `hyn_flash_r1`（8 题未解决）：`F1: 5`、`L1: 2`、`F2: 1`、**`L3: 0`**（`0/8 = 0.0%`）。
  - `hyn_flash_r2`（11 题未解决）：`F1: 6`、`F3: 2`、`L1: 2`、`F2: 1`、**`L3: 0`**（`0/11 = 0.0%`；若按 7 类规范将 `F3` 并入 `F1` 则为 `F1: 8, L1: 2, F2: 1, L3: 0`）。
  - 两轮合计 19 道未解决题次中，Kimi 多票评审判定 **`|L3| = 0/19 = 0.00%`**（即使按盲评最保守敏感性口径计入 `sphinx-doc__sphinx-9461` 1 题，单轮 `1/11 = 9.09%`、两轮合计 `1/19 = 5.26%`，均 `< 10%` 阈值）。**正式维持“不接入 LSP”的架构决策**。
- **盲评一致性检验（均达标 $\ge 80\%$）**：
  - `hyn_flash_r1`（`n=8`）：主类严格一致 **7/8 = 87.50%**（Wilson 95% CI `[52.91%, 97.76%]`，$\kappa = 0.7778$），宽松一致 **8/8 = 100.00%**。
  - `hyn_flash_r2`（`n=11`）：按 `step4_tiered_eval_and_report.md` §3.1 的 7 类规范（`F3→F1`）主类严格一致 **9/11 = 81.82%**（Wilson 95% CI `[52.30%, 94.86%]`，$\kappa = 0.5926$），宽松一致 **11/11 = 100.00%**；LSP 可解性（`L3` vs 非 `L3`）一致率 **10/11 = 90.91%**。
  - 两轮盲评合并（`n=19`）：7 类规范严格一致率 **16/19 = 84.21%**（CI `[62.43%, 94.48%]`），宽松一致率 **19/19 = 100.00%**。

---

## 1. 四组运行概览与有效性核查（step4 §4 第 1 项）

| 检查维度 | `hyn_flash_r1`（首轮） | `hyn_flash_r1_clean`（首轮干净基线） | `hyn_flash_r2`（第 2 轮全量） | `mini_swe_flash_r1`（同模型参照组） |
|---|---|---|---|---|
| **后端 Git Commit** | `7748b1e` + 开跑前热修 | `779dd59`（重跑 `7985`） | `779dd59`（全量 50 题） | `779dd59`（适配器调用 `mini-swe-agent`） |
| **运行时间窗（北京时间）** | 11-09 02:26–02:51, 18:04–19:06 | 含 11-09 23:42–23:46 重跑 `7985` | 11-10 00:08–01:05 | 11-09 22:34–23:28 |
| **是否跨入高峰时段** | **否**（1,602 次调用全 `offpeak`） | **否**（1,606 次调用全 `offpeak`） | **否**（1,352 次调用全 `offpeak`） | **否**（1,379 次调用全在 22:34–23:28 错峰窗） |
| **配置冻结校验 (`frozen_config`)** | `canary/probe/full` 一致，0 漂移 | `full` 校验通过，0 漂移 | `canary/full` 一致，0 漂移 | 统一传入 `--max-steps 80` 与 `deepseek-flash` |
| **Agent 容器断网隔离 (`--network none`)** | 48/50 断网（`7985`、`8269` 联网） | 49/50 断网（**`7985` 已断网重跑**；`8269` 轨迹 0 联网命令） | **50/50 全部断网 (`allow_network=false`)** | **50/50 全部零联网命令** |
| **参考答案泄漏事件** | 1 题（`7985`） | **0 题** | **0 题** | **0 题** |
| **API / 容器错误数** | 0 | 0 | 0 | 0 |
| **空补丁 / 应用失败数** | 0 / 0 | 0 / 0 | 0 / 0 | **2 个空补丁**（`11848`、`8548` 步数耗尽）/ 0 |
| **工程闸门 (`gate_full`)** | `STOP`（`.scratch` 误报，人工复核有效） | 沿用 `r1` 49 题 + 干净 `7985` | **`PASS`（`has_warnings=false`）** | 外部脚手架导入模式（无容器同步误报） |

---

## 2. 首轮有效性问题的后置修复与复测验证（提交 `779dd59`）

在首轮 `hyn_flash_r1` 分析中发现的工程与有效性问题，已通过提交 [`779dd59`](https://github.com/HelmAgent/Helm_website/blob/main/hyn_agent_backend/benchmarks/swebench_mini/container.py) 完成修复，并在 `hyn_flash_r1_clean` 与 `hyn_flash_r2` 中得到完整验证：

### 2.1 `sphinx-doc__sphinx-7985` 断网重跑与干净解决验证
- **问题回顾**：首轮 `hyn_flash_r1` 中因 `DEFAULT_NETWORK_ALLOWLIST` 同时作用于 Agent 运行期容器，`sphinx-doc__sphinx-7985` 在第 9–14 步通过 `pip download sphinx==3.3.0` 与 `git clone` 获取了上游提交。
- **修复与重跑结果**：提交 `779dd59` 将 `DEFAULT_NETWORK_ALLOWLIST` 清空（确保 Agent 运行期 100% 强制 `--network none`，仅官方 harness 判分容器按需联网）。
  - 在 **`hyn_flash_r1_clean`** 中，单独重跑 `sphinx-doc__sphinx-7985`（`allow_network=false`）：Agent 耗时 `241.0s`、执行 `35` 步（花费 `¥0.2783`），全程无任何联网或历史探测命令，独立在 `sphinx/builders/linkcheck.py` 中将 `self.to_ignore` 匹配前移并实现 `check_local_link`（调用 `self.env.relfn2path` 与 `path.exists`），**干净通过全部 `FAIL_TO_PASS` 与 `PASS_TO_PASS` 测试**，拿回干净的 **42/50（84.00%）** 成绩。
  - 在 **`hyn_flash_r2`** 中，`sphinx-doc__sphinx-7985` 同样在 `allow_network=false` 下独立实现 `is_local_link`，因对存在的本地链接返回了 `'local'` 而非 `'working'` 导致测试未通过（归类为 `F1` 修复逻辑错误），体现了 LLM 在该题实现细节上的正常采样波动。

### 2.2 提示词加固与容器权限/临时文件噪声消除对比
| 审计指标（全量 50 题） | `hyn_flash_r1`（修复前） | `hyn_flash_r2`（修复后 `779dd59`） | 变化幅度与效果说明 |
|---|---:|---:|---|
| 补丁含 `100755 → 100644` 模式变更题数 | 5 题 | **0 题** | `export.py` 启用 `git -c core.fileMode=false diff`，彻底消除权限模式噪音 |
| 容器内执行 `chmod` 修复权限的题数 | 24 题 | **0 题** | `container.py` 同步后自动恢复权限，消除 24 道题中无意义的 `chmod` 步数浪费 |
| 幻觉调用 `web_search` 的题数 / 次数 | 18 题 / 23 次 | **0 题 / 0 次** | 系统提示词明确声明无联网搜索工具，100% 消除 `web_search` 幻觉调用 |
| 尝试联网命令（`pip download`/`curl`/`git clone`）题数 | 21 题 | **1 题**（被断网拦截） | 提示词明确禁止获取外部/上游版本源码，联网试探减少 **95.2%** |
| 尝试本地 git 历史探测（`git log --all`/`fsck`）题数 | 31 题 | **5 题**（均无上游提交） | 历史探测行为减少 **83.9%** |
| 容器 `run_shell` 总调用次数 | 1,057 次 | **791 次** | 减少 **25.2%**，主循环步数均值从 `32.1` 步降至 `27.0` 步，总费用降低 **14.5%** |
| `.scratch` 导致 `unsynced_container_changes` 误报 | 1 题（`9229` 触发 `gate_full` STOP） | **0 题**（`gate_full` `PASS`） | `container.py` 忽略 `.scratch/` 临时目录，工程闸门零误报 |

---

## 3. 主要评测结果汇总

### 3.1 分仓库与分难度解决率对比
| 维度 | 题数 | `hyn_flash_r1_clean` | `hyn_flash_r2` | **HYN 两轮均值 ± SD** | `mini_swe_flash_r1`（参照组） |
|---|---:|---:|---:|---:|---:|
| **全集 (`full`)** | **50** | **42 / 50 (84.00%)** | **39 / 50 (78.00%)** | **81.00% ± 4.24%** | **41 / 50 (82.00%)** |
| 仓库 `django/django` | 25 | 22 / 25 (88.00%) | 22 / 25 (88.00%) | **88.00% ± 0.00%** | 22 / 25 (88.00%) |
| 仓库 `sphinx-doc/sphinx` | 25 | 20 / 25 (80.00%) | 17 / 25 (68.00%) | **74.00% ± 8.49%** | 19 / 25 (76.00%) |
| 剔除 2 道异常题 (`n=48`) | 48 | 40 / 48 (83.33%) | 38 / 48 (79.17%) | **81.25% ± 2.95%** | 39 / 48 (81.25%) |
| 难度 `<15 min fix` | 19 | 18 / 19 (94.74%) | 19 / 19 (100.00%) | **97.37% ± 3.72%** | 18 / 19 (94.74%) |
| 难度 `15 min - 1 hour` | 23 | 20 / 23 (86.96%) | 18 / 23 (78.26%) | **82.61% ± 6.15%** | 21 / 23 (91.30%) |
| 难度 `1-4 hours` | 7 | 4 / 7 (57.14%) | 2 / 7 (28.57%) | **42.86% ± 20.20%** | 2 / 7 (28.57%) |
| 难度 `>4 hours` | 1 | 0 / 1 (0.00%) | 0 / 1 (0.00%) | **0.00% ± 0.00%** | 0 / 1 (0.00%) |

> 难度标签来源：`princeton-nlp/SWE-bench_Verified` 官方人工耗时标注（`D:\hyn_bench_cache\swebench_mini\verified_difficulties.json`）。可以看到在 `1-4 hours` 较难题目上，`hyn_flash_r1_clean` 解决了 `4/7`（57.14%），高于 `mini_swe_flash_r1` 的 `2/7`（28.57%）。

### 3.2 多轮稳定性与同模型配对 McNemar 检验（step4 §4 第 2 项）

| 配对比较组合 | 组合 A 解决率 | 组合 B 解决率 | 同解 ($a$) | 仅 A 解 ($b$) | 仅 B 解 ($c$) | 均未解 ($d$) | 分歧题数 ($b+c$) | 精确双侧 McNemar $p$ 值 | 显著性 ($p < 0.05$) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **`hyn_flash_r1_clean` vs `mini_swe_flash_r1`** | **42/50 (84.0%)** | **41/50 (82.0%)** | 38 | 4 | 3 | 5 | 7 | **1.000000** | `False`（无显著差异） |
| **`hyn_flash_r2` vs `mini_swe_flash_r1`** | **39/50 (78.0%)** | **41/50 (82.0%)** | 36 | 3 | 5 | 6 | 8 | **0.726562** | `False`（无显著差异） |
| **`hyn_flash_r1_clean` vs `hyn_flash_r2`（内部稳定性）** | **42/50 (84.0%)** | **39/50 (78.0%)** | 38 | 4 | 1 | 7 | 5 | **0.375000** | `False`（正常采样波动） |
| HYN 两轮并集（任一解决）vs `mini_swe_flash_r1` | 43/50 (86.0%) | 41/50 (82.0%) | 38 | 5 | 3 | 4 | 8 | 0.726562 | `False`（仅作参考） |

- **逐题差异明细**：
  - **`hyn_flash_r1_clean` 与 `hyn_flash_r2` 之间**：50 题中有 **45 题（90.0%）结论完全一致**（38 题两轮均解决，7 题两轮均未解决：`django-11885`、`django-12325`、`sphinx-11510`、`sphinx-7590`、`sphinx-7748`、`sphinx-8056`、`sphinx-8638`）。仅 5 题存在单轮波动（仅 `r1_clean` 解决：`django-12273`、`sphinx-7985`、`sphinx-9229`、`sphinx-9461`；仅 `r2` 解决：`django-12308`）。
  - **HYN vs `mini_swe_flash_r1` 之间**：
    - **HYN 稳定解决而 `mini-SWE-agent` 未解决的题目**：`django__django-11848` 与 `sphinx-doc__sphinx-8548` 在 `mini_swe_flash_r1` 中均因纯 bash 循环耗尽 80 步触发 `LimitsExceeded` 产出**空补丁**，而在 HYN 的 `r1_clean` 和 `r2` 两轮中**100% 稳定解决**；此外 `sphinx-9229`、`sphinx-9461`（`r1_clean` 解决）和 `django-12308`（`r2` 解决）也仅由 HYN 解决。
    - **`mini-SWE-agent` 解决而 HYN 两轮均未解决的题目（3 题）**：`django__django-12325`、`sphinx-doc__sphinx-8056`、`sphinx-doc__sphinx-8638`。这 3 题在 HYN 中均已读到 Gold 文件与目标代码行，但模型在修复策略选择上出现了偏差（见 §4）。
- **严谨性结论（遵循 step4 §5.4 诚实汇报准则）**：
  - 在同模型（`deepseek-flash`）、同题集（`n=50`）下，HYN 单轮最高 **84.00%**、两轮均值 **81.00% ± 4.24%**，与 `mini-SWE-agent` 的 **82.00%** 处于同一水平线（配对 McNemar $p = 1.00 / 0.73 \ge 0.05$）。因此，**对外不得声称“HYN 脚手架在解决率上统计显著超越 `mini-SWE-agent`”**，而应客观陈述：`HYN Agent + DeepSeek-V4.1-Flash` 取得了 **81.0% ± 4.2%（最高 84.0%）** 的第一梯队 Pass@1 解决率，且相比极简 bash 脚手架消除了步数耗尽导致的空补丁问题（非空有效补丁率 **100% vs 96%**）。

### 3.3 阶梯加码（T1 Canary → T2 Probe → T3 Full）预测准确度评估（step4 §6）
| 层级 | 题数 | `hyn_flash_r1_clean` | `hyn_flash_r2` | `mini_swe_flash_r1` |
|---|---:|---:|---:|---:|
| **T1 `canary`** | 3 | 2 / 3 (66.67%) `[20.77%, 93.85%]` | 2 / 3 (66.67%) `[20.77%, 93.85%]` | 3 / 3 (100.00%) `[43.85%, 100.00%]` |
| **T2 `probe`（摸底预测）** | 15 | 13 / 15 (86.67%) `[62.12%, 96.26%]` | 12 / 15 (80.00%) `[54.81%, 92.95%]` | 14 / 15 (93.33%) `[70.18%, 98.81%]` |
| **T3 `full`（全量实际）** | 50 | 42 / 50 (84.00%) `[71.49%, 91.66%]` | 39 / 50 (78.00%) `[64.76%, 87.25%]` | 41 / 50 (82.00%) `[69.20%, 90.23%]` |
| **T2 vs T3 偏差 ($\Delta$)** | — | **+2.67%**（T3 落在 T2 CI 内） | **+2.00%**（T3 落在 T2 CI 内） | +11.33%（T3 落在 T2 CI 内） |

- **方法论结论**：在 HYN 的两轮独立运行中，15 题分层抽样 `probe` 对 50 题 `full` 的点估计偏差仅为 **+2.67%** 与 **+2.00%**，预测极其精准！这证明 `T1 (3题工程冒烟) → T2 (15题质量摸底，阈值 ≥10/15) → T3 (50题全量)` 的阶梯加码协议能够以 **30% 的题量成本**把关全量质量，建议固化为后续所有模型/脚手架评测的标准流程。

### 3.4 成本、前缀缓存命中率与耗时步数分布
| 指标 | `hyn_flash_r1_clean` | `hyn_flash_r2` | `mini_swe_flash_r1`（从 `.traj.json` 提取重算） |
|---|---:|---:|---:|
| **总费用（CNY，100% 错峰实付）** | **¥12.1585** | **¥10.3944** | **¥6.7893** |
| 按全标准/高峰时段折算费用 (CNY) | ¥24.3170 | ¥20.7888 | ¥13.5786 |
| 每题平均成本（错峰 / 标准） | ¥0.2432 / ¥0.4863 | ¥0.2079 / ¥0.4158 | ¥0.1358 / ¥0.2716 |
| 每解决一题平均成本（错峰 / 标准） | ¥0.2895 / ¥0.5790 | ¥0.2665 / ¥0.5330 | ¥0.1656 / ¥0.3312 |
| Prompt Tokens 总量 | 66,603,182 | 54,259,668 | 45,731,100 |
| Prompt 缓存命中 Tokens | 65,099,136 | 52,969,984 | 44,447,104 |
| Completion Tokens 总量 | 1,036,134 | 951,935 | 707,050 |
| **整体前缀缓存命中率 (`hit / prompt`)** | **97.74%** | **97.62%** | **97.19%** |
| **第 2 步起热缓存命中率** | **97.81%** | **97.70%** | **97.35%** |
| 单题墙钟时间 Mean / P50 / P90 / Max (s) | 214.6 / 129.7 / 495.1 / 810.4 | 183.6 / 113.9 / 400.3 / 741.2 | 175.2 / 59.5 / 541.2 / 729.0 |
| 主循环步数 Mean / P50 / P90 / Max | 32.1 / 23.0 / 66.1 / 83 | 27.0 / 18.5 / 54.2 / 82 | 27.6 / 16.5 / 58.2 / 80 |
| 工具调用次数 Mean / P50 / P90 / Max | 37.8 / 30.0 / 79.1 / 85 | 32.8 / 25.5 / 65.3 / 85 | 27.6 / 16.5 / 58.2 / 80（每步单 bash） |
| 容器 `run_shell` 次数 Mean / P50 / P90 / Max | 21.1 / 12.5 / 44.4 / 75 | 15.8 / 11.5 / 32.3 / 56 | 27.6 / 16.5 / 58.2 / 80 |

> 注：`mini_swe_flash_r1/REPORT.md` 中成本与步数显示为 `0` 是因为 `report.py` 默认读取 HYN 原生 `results.jsonl`，而 `mini-SWE-agent` 将每步 API 响应与 token 消耗保存在 `mini_swe_raw/<id>/<id>.traj.json` 中；上表已从全部 50 个 `.traj.json` 文件逐条提取 `usage` 并按同一计费规则精确还原。

### 3.5 补丁健康度与免费定位副指标（Gold Patch 静态对齐漏斗）
| 漏斗阶段 / 补丁指标 | `hyn_flash_r1_clean` | `hyn_flash_r2` | `mini_swe_flash_r1` |
|---|---:|---:|---:|
| 非空且成功应用的有效补丁数 | **50 / 50 (100.0%)** | **50 / 50 (100.0%)** | 48 / 50 (96.0%，2 题空补丁) |
| 平均每个非空补丁修改文件数（Max） | 1.26 (Max 3) | 1.20 (Max 4) | 1.23 (Max 4) |
| 1. 工具输出出现过 Gold 文件 (`gold_file_seen`) | 50 / 50 (100.0%) | 50 / 50 (100.0%) | —（纯 bash 轨迹未拆解文件工具） |
| 2. 读取过 Gold 文件 (`gold_file_read`) | 49 / 50 (98.0%) | 46 / 50 (92.0%) | — |
| 3. 关键改动行进入模型视野 (`gold_lines_visible`) | 49 / 50 (98.0%) | 46 / 50 (92.0%) | — |
| 4. 补丁编辑了至少一个 Gold 文件 (`gold_file_edited`) | **49 / 50 (98.0%)** | **49 / 50 (98.0%)** | **48 / 50 (96.0%)** |
| 5. 补丁编辑了 Gold 目标函数/类 (`gold_function_edited`) | **44 / 50 (88.0%)** | **42 / 50 (84.0%)** | **43 / 50 (86.0%)** |
| **已定位到 Gold 文件但未通过测试 (`localized_but_unresolved`)** | 8 / 50 (16.0%) | 11 / 50 (22.0%) | 7 / 50 (14.0%) |

- **核心洞察**：在 HYN 的两轮运行中，**98.0%（49/50）的补丁都直接修改了正确的 Gold 文件**，84%–88% 修改到了正确的 Gold 函数！所有未解决题目（`r1_clean` 的 8 题、`r2` 的 11 题）100% 都在工具输出中见到并读取过 Gold 文件。**当前系统的核心瓶颈不在“找不到文件/符号定位”，而在于复杂框架语义理解与边界条件实现（`F1/F3`）**。

### 3.6 工具使用分布对比（`hyn_flash_r1_clean` vs `hyn_flash_r2`）
| 工具名称 | `hyn_flash_r1_clean` 调用次数（覆盖题数） | `hyn_flash_r2` 调用次数（覆盖题数） | 趋势说明 |
|---|---:|---:|---|
| `run_shell` | 1,056（50 题） | 791（50 题） | 后置修复消除 `chmod` 和历史探测后，容器命令调用显著精简（-25.1%） |
| `grep` | 343（49 题） | 382（46 题） | Step 1 升级的 ripgrep 搜索成为主力代码定位工具（平均每题 7.6 次） |
| `read_file` | 330（50 题） | 341（46 题） | Step 1 升级的带行号分页读取高频使用，两轮均 **0 次发生 `L2`（读取截断）失败** |
| `apply_patch` / `edit_file` / `write_file` | 52 / 39 / 2 | 52 / 26 / 9 | 宿主机文件修改 + 自动单向同步链路稳定可靠（0 空补丁） |
| `glob` | 40（22 题） | 36（20 题） | 按路径模式快速定位目标模块与测试文件 |
| `code_outline` | 2（2 题） | 1（1 题） | `r1_clean` 重跑 `7985` 时第 1 步调用了 `code_outline` 并成功解决；整体调用率仍偏低 |
| `todo_write` | 0（0 题） | 3（1 题） | 轻量进度跟踪 |
| `web_search` / `search` / `bash`（非注册工具） | 23 / 1 / 0（18 题） | 0 / 0 / 1（1 题） | `web_search` 幻觉调用在 `r2` 中降为 0 |

---

## 4. 失败归类与 LSP 收益上限分析（Kimi K3.1 Pro 多票评审 + 盲评交叉核验）

### 4.1 两轮未解决题目归类分布汇总
| 类别代码 | 类别定义 | LSP 可解？ | `hyn_flash_r1`（`n=8`） | `hyn_flash_r2`（`n=11`） | 两轮合并（`n=19` 题次） |
|---|---|---|---:|---:|---:|
| **`L1`** | 未找到正确位置：搜索噪声或探索不足（改在下游或相邻函数） | 否 (`no`) | 2 (25.0%) | 2 (18.2%) | 4 (21.1%) |
| **`L2`** | 读取截断或上下文丢失 | 否 (`no`) | 0 (0.0%) | 0 (0.0%) | **0 (0.0%)** |
| **`L3`** | **符号歧义，或漏掉调用方/被调方（LSP 可直接解决的静态引用问题）** | **是 (`yes`)** | **0 (0.0%)** | **0 (0.0%)** | **0 (0.0%)** |
| **`F1`** | 位置正确，但修复逻辑/算法/边界处理错误 | 否 (`no`) | 5 (62.5%) | 6 (54.5%) | 11 (57.9%) |
| **`F2`** | 引入回归，破坏了 `PASS_TO_PASS` 原有测试 | 否 (`no`) | 1 (12.5%) | 1 (9.1%) | 2 (10.5%) |
| **`F3`** | 误解了 issue 需求或预期行为（7 类规范中并入 `F1`） | 否 (`no`) | 0 (0.0%) | 2 (18.2%) | 2 (10.5%) |
| **`E1` / `E2`** | 空补丁、超时、熔断、工具或容器环境错误 | 否 (`no`) | 0 (0.0%) | 0 (0.0%) | **0 (0.0%)** |

> Kimi (`kimi-k3.1-pro`) 在 `hyn_flash_r1`（8 题 × 2 票）与 `hyn_flash_r2`（11 题 × 2 票）中的**两次评审自一致率均为 100.00%**（共 19 题次全部两票全票一致，0 次触发第 3 票复核）。

### 4.2 `hyn_flash_r2` 11 道未解决题逐题归类与盲评对照表
（`hyn_flash_r1` 的 8 题明细见上文历史记录，其中 7 题与 `r2` 重合；下表展示最新 `hyn_flash_r2` 全部 11 题的 Kimi 评审与独立盲评对照）：

| # | `instance_id` | Kimi 两票主类（7 类规范映射） | 独立盲评主类（次类） | 一致性判定 | 失败根因摘要 |
|---:|---|---|---|---|---|
| 1 | `django__django-11885` | `F2` (`F2`) | `F2` (`["F1"]`) | **主类严格一致** | 定位并修改了 `Collector.delete`，`FAIL_TO_PASS` 通过，但按 Model 合并 `fast_deletes` QuerySet 破坏了分批删除语义，导致 `test_large_delete` 等 2 项 `PASS_TO_PASS` 回归失败 |
| 2 | `django__django-12273` | `L1` (`L1`) | `L1` (`["F1"]`) | **主类严格一致** | Gold 修改 `base.py` 第 569 行 `Model._set_pk_val`；Agent 仅读取 650–949 行并修改了 `_save_parents`（`gold_lines_visible=false`） |
| 3 | `django__django-12325` | `F1` (`F1`) | `F1` (`["L3"]`) | **主类严格一致** | 已读取 `base.py` 与 `options.py` 并修改 `ModelBase.__new__`，但保留了无显式 `parent_link=True` 时的回退覆盖逻辑，且未删除 `Options._prepare` 的校验 |
| 4 | `sphinx-doc__sphinx-11510` | `F1` (`F1`) | `F1` (`[]`) | **主类严格一致** | 已修改 `Include.run`，但包装 `FileInput` 触发 `source-read` 事件时固定传入主文档 `self.env.docname` 而非被包含文件的 docname |
| 5 | `sphinx-doc__sphinx-7590` | `F1` (`F1`) | `F1` (`[]`) | **主类严格一致** | 已在 `cpp.py` 新增 `ASTUserDefinedLiteral`，但 `get_id` 未实现正确的 UDL 修饰规则（代码内留有 `# TODO: this is not correct`） |
| 6 | `sphinx-doc__sphinx-7748` | `F1` (`F1`) | `F1` (`[]`) | **主类严格一致** | 已修改 `DocstringSignatureMixin._find_signature`，但未支持行尾反斜杠续行及 `__init__` 组合场景 |
| 7 | `sphinx-doc__sphinx-7985` | `F1` (`F1`) | `F1` (`[]`) | **主类严格一致** | 断网下独立实现 `is_local_link`，但对有效本地链接仍返回 `'local'`（预期 `'working'`），且将分支置于 `self.to_ignore` 之前 |
| 8 | `sphinx-doc__sphinx-8056` | `L1` (`L1`) | `F1` (`["L1"]`) | **宽松一致** | 已读取 `napoleon/docstring.py` 并复现问题，但选择在下游 `docfields.py` 兼容逗号分隔参数名以保持单行展示，未在 `_consume_fields` 中拆分 |
| 9 | `sphinx-doc__sphinx-8638` | `F3` (`F1`) | `F1` (`["L1"]`) | **7 类规范一致** | 已读取 `PyObject` 变量字段定义，但将问题误判为 `PythonDomain.find_obj` 的同名匹配优先级，未删除 `PyTypedField('variable')` 的 `rolename='obj'` |
| 10 | `sphinx-doc__sphinx-9229` | `F3` (`F1`) | `F1` (`["L1"]`) | **7 类规范一致** | 已读取 `ClassDocumenter.get_doc/add_content`（1670–1899 行），但受容器 Python 3.9 下泛型 `__doc__` 表现影响，将问题收窄为 `list[int]` `GenericAlias` 类型过滤 |
| 11 | `sphinx-doc__sphinx-9461` | `F1` (`F1`) | `L3` (`["F1"]`) | **宽松一致** | 已修改 `PropertyDocumenter.can_document_member` 与 `import_object`，但漏改 `sphinx/domains/python.py`（`PyProperty` 的 `:classmethod:` 指令选项）与 `inspect.py` |

### 4.3 LSP 收益上限与架构决策（README §1.2 & step4 §3.3）
- **主口径（Kimi 多数投票评审）**：
  - `hyn_flash_r1`：`|L3| / |unresolved| = 0/8 = 0.00%`（Wilson 95% CI `[0.00%, 32.44%]`），`|L3| / 50 = 0.00%`（CI `[0.00%, 7.13%]`）。
  - `hyn_flash_r2`：`|L3| / |unresolved| = 0/11 = 0.00%`（Wilson 95% CI `[0.00%, 25.88%]`），`|L3| / 50 = 0.00%`（CI `[0.00%, 7.13%]`）。
  - 两轮合并：`|L3| = 0/19 = 0.00%`（CI `[0.00%, 16.82%]`）。
- **敏感性分析（纳入盲评标出的跨文件改动不完整项）**：
  - 即便将盲评中唯一标为 `L3` 主类的 `sphinx-doc__sphinx-9461` 计入（注：该题漏改的是 Sphinx reST 域指令的字符串选项 `:classmethod:`，静态语言服务器 LSP 的 `goToDefinition`/`findReferences` 实际上无法跨 Python 字符串与 reST 域定义建立引用跳转），其在 `hyn_flash_r2` 未解决题中占比也仅为 `1/11 = 9.09%`，在全集 50 题中占比仅 `1/50 = 2.00%`（且该题在 `hyn_flash_r1_clean` 中无需 LSP 已成功解决！）。
- **最终架构决策**：`L3` 占比稳定 **低于 10% 决策阈值**，**维持“不接入 LSP（语言服务器协议）”的架构决策**，继续聚焦于轻量级 `ripgrep + tree-sitter (code_outline)` 与提示词/验证闭环优化。

---

## 5. 盲评一致性检验汇总（step4 §3.2）

两轮盲评均严格执行“先只读 `blind_review_packets.json` → 写入 `blind_review_labels.json` 并锁定 SHA-256 哈希与时间戳 → 再打开 `classifications.json` 计算一致率”的单向盲评协议：

| 盲评轮次 | 盲评样本量 | `blind_review_labels.json` SHA-256 锁定指纹与时间 | 7 类规范严格一致率 | 7 类规范宽松一致率 | Cohen's $\kappa$（7 类） | `L3`（LSP 可解）判定一致率 | 是否达标（$\ge 80\%$） |
|---|---:|---|---:|---:|---:|---:|---|
| **`hyn_flash_r1`** | 8 / 8 (100%) | `2B50A8B2...50FF60` (`2026-11-09T19:39:28+08:00`) | **7/8 = 87.50%** `[52.91%, 97.76%]` | **8/8 = 100.00%** `[67.56%, 100.00%]` | **0.7778** | **8/8 = 100.00%** | **✅ 达标** |
| **`hyn_flash_r2`** | 11 / 11 (100%) | `F8419945...DE24D` (`2026-11-10T01:50:12+08:00`) | **9/11 = 81.82%** `[52.30%, 94.86%]` | **11/11 = 100.00%** `[74.12%, 100.00%]` | **0.5926** | **10/11 = 90.91%** | **✅ 达标** |
| **两轮合并 (`r1 + r2`)** | **19 / 19 (100%)** | 两轮均先于 `classifications.json` 读取前锁定 | **16/19 = 84.21%** `[62.43%, 94.48%]` | **19/19 = 100.00%** `[83.18%, 100.00%]` | **0.6780** | **18/19 = 94.74%** | **✅ 达标** |

> 分类粒度说明：`step4_tiered_eval_and_report.md` §3.1 定义了 7 个标准大类（`L1, L2, L3, F1, F2, E1, E2`），其中所有非回归的修复/需求理解错误均归入 `F1`；而 `classify_failures.py` 实现时将非回归修复错误细分为 `F1`（修复逻辑错误）与 `F3`（误解 issue 需求）。若按未合并 `F3` 的 9 类原始编码计算，`hyn_flash_r2` 因 `8638` 与 `9229` 两题落入 `F1 vs F3` 子类区分，原始 9 类严格一致率为 `7/11 = 63.64%`、宽松一致率 `9/11 = 81.82%`；按文档 §3.1 的 7 类规范对齐后严格一致率为 **9/11 = 81.82%**，宽松一致率为 **11/11 = 100.00%**，完全满足 $\ge 80\%$ 门槛。

---

## 6. 公开榜单与同模型参照对标总表（step4 §5）

> **口径声明**：我方实测运行于 **`SWE-bench Verified Mini (n=50)`**，公开榜单大多基于 **`SWE-bench Verified (n=500)`** 全集。由于 `n=50` 的 95% Wilson 置信区间宽度约 `±10%`，不同题集规模不可直接跨表排名；同题集内对比请以配对 `mini_swe_flash_r1` 为准。

| 系统（脚手架 + 模型） | 评测集与样本量 | % Resolved (Pass@1) | 95% CI / 多轮波动 | 单题平均成本 | 数据来源与核验状态 |
|---|---|---:|---:|---:|---|
| **HYN Agent + DeepSeek-V4.1-Flash（`hyn_flash_r1_clean`）** | **Verified Mini, n=50** | **84.00% (42/50)** | **[71.49%, 91.66%]** | **¥0.243（错峰）** | **本报告实测（全断网干净基线）** |
| **HYN Agent + DeepSeek-V4.1-Flash（两轮均值 `r1_clean + r2`）** | **Verified Mini, n=50 × 2** | **81.00% (40.5/50)** | **± 4.24% (SD)** | **¥0.226（错峰均值）** | **本报告实测（2 轮 × 50 题）** |
| **HYN Agent + DeepSeek-V4.1-Flash（`hyn_flash_r2`）** | **Verified Mini, n=50** | **78.00% (39/50)** | **[64.76%, 87.25%]** | **¥0.208（错峰）** | **本报告实测（`779dd59` 全新跑）** |
| **mini-SWE-agent + DeepSeek-V4.1-Flash（`mini_swe_flash_r1`）** | **Verified Mini, n=50** | **82.00% (41/50)** | **[69.20%, 90.23%]** | **¥0.136（错峰重算）** | **本报告实测（同模型同题集参照组）** |
| DeepSeek-V4-Pro（厂商公布成绩） | Verified, n=500 | 80.6% | — | — | 公开检索摘要（上官网前须核对原网页） |
| mini-SWE-agent v2.0.0 + Claude 4.5 Opus (high) | Verified, n=500 | 76.8% | — | — | swebench.com bash-only 检索摘要 |
| mini-SWE-agent v2.0.0 + Gemini 3 Flash (high) | Verified, n=500 | 75.8% | — | — | swebench.com bash-only 检索摘要 |
| mini-SWE-agent v2.0.0 + MiniMax M2.5 (high) | Verified, n=500 | 75.8% | — | — | swebench.com bash-only 检索摘要 |
| mini-SWE-agent v2.0.0 + Claude 4.6 Opus | Verified, n=500 | 75.6% | — | — | swebench.com bash-only 检索摘要 |

---

## 7. 官网与对外宣传文案草稿（合规修订版，step4 §5.4）

> **HYN Agent 搭载 DeepSeek-V4.1-Flash 在 SWE-bench Verified Mini 上取得最高 84.0%（两轮均值 81.0% ± 4.2%）的端到端 Pass@1 解决率**
>
> 在 SWE-bench 官方 Docker 判分套件与全程断网沙箱（`--network none`）下，HYN Agent 搭配 `deepseek-flash` 对 SWE-bench Verified Mini（50 道真实 `django/django` 与 `sphinx-doc/sphinx` 开源缺陷修复任务）进行了两轮完整独立评测：
> - **端到端解决率（Pass@1）**：单轮最高解决 **42/50（84.00%，95% Wilson CI [71.49%, 91.66%]）**，两轮独立运行均值 **81.00% ± 4.24%**（其中 `django/django` 两轮稳定达到 **22/25 = 88.00%**），与同模型下的官方 `mini-SWE-agent` 参照组（82.00%，配对 McNemar $p=1.00$）同处第一梯队水平。
> - **工程交付可靠性**：两轮共 **100/100 道题次实现 100% 非空有效补丁产出、0 接口/容器崩溃、0 超时熔断**，代码定位阶段在 **98.0%（49/50）** 的任务中直接定位并编辑了正确的目标源码文件。
> - **极致成本与缓存效率**：依托上下文前缀稳定化设计，多步迭代的前缀缓存命中率高达 **97.6%–97.7%**，错峰时段跑完全套 50 道真实仓库修复任务仅需 **¥10.39–¥12.16（平均每题约 ¥0.21–¥0.24，每成功修复一题仅需 ¥0.27–¥0.29）**。
>
> *合规说明：SWE-bench Verified Mini（n=50）为 SWE-bench Verified（n=500）的标准分层抽样子集，受样本量置信区间宽度影响，子集解决率不与 500 题全量榜单做跨口径直接排名。*

---

## 8. 改进项闭环状态与后续演进建议

| 优先级 | 改进项 | 当前状态 | 验证结果与后续说明 |
|---|---|---|---|
| **P0** | Agent 运行期强制 `--network none`（清空 `DEFAULT_NETWORK_ALLOWLIST`） | **✅ 已完成 (`779dd59`)** | `hyn_flash_r1_clean`（重跑 `7985`）与 `hyn_flash_r2`（全量 50 题）100% 验证断网隔离生效，0 泄漏 |
| **P0** | 加固评测提示词（禁止外部下载/历史探测，移除 `web_search` 暗示） | **✅ 已完成 (`779dd59`)** | `hyn_flash_r2` 中 `web_search` 幻觉调用从 23 次降至 **0 次**，探测行为减少 **78%**，`run_shell` 减少 **25.2%** |
| **P1** | 消除容器 `core.fileMode` 权限变更噪声与 `chmod` 循环 | **✅ 已完成 (`779dd59`)** | `hyn_flash_r2` 中补丁模式噪声与 `chmod` 修复题数从 24 题降至 **0 题** |
| **P1** | 忽略容器 `.scratch/` 临时目录，消除未同步改动误报 | **✅ 已完成 (`779dd59`)** | `hyn_flash_r2/gate_full.json` 取得无警告 `PASS`（`unsynced_container_change_instances = []`） |
| **P2** | `report.py` 支持解析 `mini_swe_raw/*.traj.json` 的 Token 与步数统计 | 建议后续优化 | 当前 `mini_swe_flash_r1/REPORT.md` 成本显示为 0，本报告已通过脚本从 `.traj.json` 完整提取并写入 `step4b_multirun_analysis.json` |
| **P2** | 提升复杂语义修复准确率（针对 `F1/F3` 占未解决题 ~80% 的瓶颈） | 下一阶段重点 | 代码定位已达 98% 饱和，后续重点并非引入 LSP（`L3=0%`），而是在修改源码后引导 Agent 编写更具针对性的边界回归测试（如 `django-11885` 的分批删除测试、`sphinx-7985` 的 `to_ignore` 优先级验证） |

---

## 9. 四组运行全量数据可追溯清单

根目录：`d:\apps\hyn_agent\hyn_agent_backend\benchmarks\results\swebench_mini\`

| 目录 / 文件路径 | 核心内容说明 |
|---|---|
| [`hyn_flash_r1_clean/REPORT.md`](https://github.com/HelmAgent/Helm_website/blob/main/hyn_agent_backend/benchmarks/results/swebench_mini/hyn_flash_r1_clean/REPORT.md) / [`summary.json`](https://github.com/HelmAgent/Helm_website/blob/main/hyn_agent_backend/benchmarks/results/swebench_mini/hyn_flash_r1_clean/summary.json) | 首轮干净全量报告（42/50 = 84.00%），内含 `--compare-runs hyn_flash_r1_clean hyn_flash_r2` 与 `--reference-run mini_swe_flash_r1` 联合统计 |
| [`hyn_flash_r1_clean/step4b_multirun_analysis.json`](https://github.com/HelmAgent/Helm_website/blob/main/hyn_agent_backend/benchmarks/results/swebench_mini/hyn_flash_r1_clean/step4b_multirun_analysis.json) | **四组运行全量汇总分析包**（含 4 组运行审计、难度分层、`mini_swe_raw` Token/成本还原、多轮均值±SD 与全部配对 McNemar 检验） |
| [`hyn_flash_r2/REPORT.md`](https://github.com/HelmAgent/Helm_website/blob/main/hyn_agent_backend/benchmarks/results/swebench_mini/hyn_flash_r2/REPORT.md) / [`summary.json`](https://github.com/HelmAgent/Helm_website/blob/main/hyn_agent_backend/benchmarks/results/swebench_mini/hyn_flash_r2/summary.json) | 第 2 轮全量正式报告（39/50 = 78.00%，成本 ¥10.3944，缓存命中率 97.62%） |
| [`hyn_flash_r2/gate_canary.json`](https://github.com/HelmAgent/Helm_website/blob/main/hyn_agent_backend/benchmarks/results/swebench_mini/hyn_flash_r2/gate_canary.json) / [`gate_full.json`](https://github.com/HelmAgent/Helm_website/blob/main/hyn_agent_backend/benchmarks/results/swebench_mini/hyn_flash_r2/gate_full.json) | 第 2 轮 T1 与 T3 工程闸门（全部无警告 `PASS`） |
| [`hyn_flash_r2/classifications.json`](https://github.com/HelmAgent/Helm_website/blob/main/hyn_agent_backend/benchmarks/results/swebench_mini/hyn_flash_r2/classifications.json) / [`review_sheet.csv`](https://github.com/HelmAgent/Helm_website/blob/main/hyn_agent_backend/benchmarks/results/swebench_mini/hyn_flash_r2/review_sheet.csv) | 第 2 轮 11 道未解决题的 Kimi K3.1 Pro 多票归类结果（两次评审自一致率 100%，`L3=0`） |
| [`hyn_flash_r2/blind_review_labels.json`](https://github.com/HelmAgent/Helm_website/blob/main/hyn_agent_backend/benchmarks/results/swebench_mini/hyn_flash_r2/blind_review_labels.json) | 第 2 轮 11 道未解决题盲评标签（SHA-256 `F8419945A9D12887DA3DA8A949311D9FCB8698E26842A4CC4D47F374A1DDE24D`） |
| [`hyn_flash_r2/blind_review_agreement.json`](https://github.com/HelmAgent/Helm_website/blob/main/hyn_agent_backend/benchmarks/results/swebench_mini/hyn_flash_r2/blind_review_agreement.json) | 第 2 轮盲评一致性检验明细（7 类严格一致 9/11 = 81.82%，宽松一致 11/11 = 100.00%） |
| [`hyn_flash_r2/step4b_analysis.json`](https://github.com/HelmAgent/Helm_website/blob/main/hyn_agent_backend/benchmarks/results/swebench_mini/hyn_flash_r2/step4b_analysis.json) | 第 2 轮轨迹审计与多轮对比数据 |
| [`mini_swe_flash_r1/REPORT.md`](https://github.com/HelmAgent/Helm_website/blob/main/hyn_agent_backend/benchmarks/results/swebench_mini/mini_swe_flash_r1/REPORT.md) / [`summary.json`](https://github.com/HelmAgent/Helm_website/blob/main/hyn_agent_backend/benchmarks/results/swebench_mini/mini_swe_flash_r1/summary.json) | 同模型 `mini-SWE-agent` 参照组报告（41/50 = 82.00%）与 `mini_swe_raw/*.traj.json` 原始轨迹 |
| [`hyn_flash_r1/`](https://github.com/HelmAgent/Helm_website/blob/main/hyn_agent_backend/benchmarks/results/swebench_mini/hyn_flash_r1) | 首轮原始运行归档（含 `blind_review_labels.json`、`blind_review_agreement.json`、`step4b_analysis.json`、`REVIEWER_NOTES.md`） |
