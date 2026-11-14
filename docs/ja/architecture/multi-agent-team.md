---
title: 3. 常駐マルチエージェントチーム・タスクDAGと Git Worktree 並列比較
description: 軽量サブエージェントと最大8名の常駐チームメイトの2層協調、分類別イベント起動、ユーザー権限上限保護、タスクDAGリースと Windows Junction ゼロコピー Worktree を詳説。
---

# 3. 常駐マルチエージェントチーム・タスクDAGと Git Worktree 並列比較

> [!NOTE] 対象モジュールと署名済み実測レポート
> - 対象ソース：`app/tools/subagent.py`、`subagent_registry.py`、`team_runtime.py`（`4,585` 行）、`team_wake.py`、`task_store.py`、`worktree_core.py`
> - 実測レポート：[Harness ガードレール消融実験 (4名並列 3.04倍高速化 · 書込衝突 0.0% · 特権昇格阻止 100%)](/ja/benchmarks/harness-ablation-v1)

## 3.1 一時サブエージェントと常駐チームメイトの2層協調トポロジ

単一エージェントのコンテキスト枯渇と、従来型グループチャット方式のトークン爆発・ファイル上書き衝突を同時に解決するため、Helm は**一時サブエージェント（Subagents）**と**常駐チーム（Resident Teams：Lead + 1〜8名）**を明確に分離しています。

```mermaid
flowchart TD
  User["人間エンジニア (グローバル権限上限と高リスク承認を独占)"] --> Lead["Team Lead 統括エージェント (DAG分解 · 計画審査 · 3-Way統合)"]

  subgraph Ephemeral["軌道 A: 一時サブエージェント (subagent.py)"]
    Explore["explore 調査エージェント (数学的に保証された読取専用ツール群)"]
    Verify["verify 検証エージェント (独立テスト・ビルド検証)"]
    CustomSub["宣言型カスタムエージェント (.hyn_agent/agents/*.md · resume_id)"]
  end

  subgraph Resident["軌道 B: 常駐自律チーム (team_runtime.py · 1-8名 Teammates)"]
    Mailbox["JSONL 分類別メールボックス (Wake 即時起動 vs Piggyback 同乗配信)"]
    TaskDAG["プロジェクト Task DAG (task_store.py · Kahn閉路検査 · リース心拍)"]
    Mates["Teammates 1..8 (計画承認前は書込ツールを物理剥離)"]
    Mailbox <--> Mates
    TaskDAG <--> Mates
  end

  subgraph Isolation["物理ファイル分離層 (worktree_core.py)"]
    WT["独立 .worktrees/<name> + Windows Junction ゼロコピー依存共有"]
  end

  Lead -->|"局所委譲・要約のみ返却"| Explore & Verify & CustomSub
  Lead <-->|"assign_task / review_plan / broadcast"| Mailbox
  Mates --> WT
  WT -->|"compare_group 複数案並列比較 -> git apply --3way 統合"| Lead
```

---

## 3.2 分類別起動メールボックス・在席検知・権限収束ガード

```mermaid
sequenceDiagram
  autonumber
  participant UI as フロント画面 (10秒 watch=1 在席心拍)
  participant Wake as TeamWake ルータ (team_wake.py)
  participant Lead as Lead タスク
  participant Mate as Teammate タスク
  participant Guard as 計画＆権限ゲート

  Mate->>Guard: submit_plan で改修計画を提出
  Note over Mate,Guard: 計画承認前は _MUTATING 書込ツールを物理剥離
  Guard->>Wake: plan_approval_request を投函 (Wake クラス)
  Wake->>Wake: 3.0秒デバウンス窓 (wake_debounce_s=3.0) で同時通知を集約
  Wake->>Lead: Lead を起動して計画を審査
  Lead->>Guard: review_plan(approve=True, reason>=10文字)
  Guard-->>Mate: 専用 Worktree 内で書込ツールを解禁
  Mate->>Wake: idle_notification 心拍を送出 (Piggyback クラス -> 追加LLM課金ゼロ)
  UI-.->Wake: 離席検知 -> is_attended = False
  Mate->>Guard: 高リスクコマンド承認を要求
  Guard-->>Wake: 離席中のため TEAM_DEFERRED へ保留＆OSデスクトップ通知
```

> [!TIP] アーキテクチャ上のトレードオフ：トークン暴走と特権昇格をどう防ぐか？
> - **技術的課題**：並列エージェントの心拍通信による無限課金と、プロンプト注入による親エージェント経由の権限昇格が大きな脅威となります。
> - **従来手法の限界**：全員同報チャット方式ではメッセージごとに全エージェントが起動し、テキスト指示ベースの権限管理は容易に突破されます。
> - **Helm の解決策**：① メールを **Wake**（`3秒` 集約起動）と **Piggyback**（次回ターン同乗・単独課金ゼロ）に分離。② 実効権限を `min(ユーザー現在のモード, メンバー設定権限)` にハード固定。③ 無人実行上限 `200,000` トークン・連続自動起動 `8回`・`30分` 自動休眠（`24時間` リース保護）を強制します。
> - **定量的成果**：[Harness 消融実験](/ja/benchmarks/harness-ablation-v1) にて権限昇格・注入攻撃を **`100.0%`（30/30）阻止**し、待機中トークン消費 **0** を実現しました。

---

## 3.3 原子的タスク DAG と Windows Junction ゼロコピー Git Worktree

```mermaid
flowchart LR
  Create["create_tasks 原子生成 (最大30ノード · Kahn閉路検出)"] --> Ready["in-degree=0 タスクを自動解禁"]
  Ready --> Lease["Teammate がリース取得＆心拍維持 (失敗時は下流を連鎖キャンセル)"]
  Lease --> Sandbox[".worktrees/<mate> 独立チェックアウト生成"]
  Sandbox --> Junction["Windows _winapi.CreateJunction で node_modules / .venv を瞬時共有"]
  Junction --> Code["並列実装＆独立テスト (ファイル書込衝突 0.0%)"]
  Code --> Compare["compare_group 並列 Diff レビュー"]
  Compare --> Apply["git apply --3way 安全統合 + pre_apply 1クリック復元"]
```

- **安全な Junction 解除（`worktree_core.py`）**：管理者権限不要の `_winapi.CreateJunction` で数GBの依存環境をゼロコピー共有し、破棄時は必ず先に再解析ポイントを解除してから削除するため、本体の `node_modules` を誤削除する事故は起こりません。4名並列実行により **`2.88倍〜3.04倍` の実時間高速化**と **衝突率 `0.0%`** を実証しています。