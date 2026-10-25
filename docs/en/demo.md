---
title: Interactive Web Demo (Zero Install)
description: Experience HYN Agent's Stone UI, long-horizon autonomy, Shadow Git Checkpoints, and in-place Office AI patching directly in your browser.
aside: false
---

# Interactive Web Demo (Zero Install)

> [!TIP] Try HYN Agent directly in your browser — no `.exe` installation required
> Built for enterprise reviewers and technical interviewers on locked-down corporate machines, this interactive sandbox **replicates HYN Agent's "Stone" desktop interface 1:1**. Switch across the **3 engineering scenarios**, expand tool execution cards, toggle the **4-tier live permission mode**, inspect the **Context Budget Ring**, compare **Shadow Git Checkpoint diffs**, or click **"✨ AI Edit"** in the right-hand Office workbench.

<ProductPlayground lang="en" />

## Included Interactive Scenarios

| Scenario | Underlying Engineering Modules | Interactive Controls You Can Click |
| :--- | :--- | :--- |
| **1. Offline Long-Horizon & Shadow Git Checkpoints** | `TurnHub` monotonic `seq`, `StuckDetector` L2 anti-loop, `git_checkpoints.py` private refs | Click tool cards (`apply_patch`, `run_powershell`) to expand; switch `#1 / #2` checkpoints on the right to inspect diffs; toggle **Permission Mode** & **Context Ring** at the bottom |
| **2. Office Workbench & Selection "✨ AI Edit"** | `PreviewWorkbench.js`, `WpsFormatToolbar.js`, `AiSelectionPopover.js`, `patch_file_selection` | Click the dashed slide selection box or **"✨ AI Edit (Ctrl+L)"** on the right canvas to trigger SSE in-place hot-patching |
| **3. Git Worktree Multi-Agent Team** | `team_runtime.py` resident teammates, `.hyn_wt/*` worktree leases, Plan Approval Gate | Click **"🛡️ Approve Teammate Plan"** on `mate-frontend` to unlock workspace write permissions |
