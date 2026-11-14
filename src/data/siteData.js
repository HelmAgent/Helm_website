/**
 * 旗舰官网统一元数据与章节目录中心。
 *
 * 职责与协作：
 * - 直接复用 `docs/.vitepress/theme/siteData.js` 中的 `SITE_META`，确保用户只需改一处即可同步全站下载链接、版本号与 SHA-256。
 * - 提供工程架构白皮书（全 6 卷）与私有化部署指南（3 篇）的结构化导航元数据。
 */
import { SITE_META as RAW_SITE_META } from '../../docs/.vitepress/theme/siteData.js'

export const SITE_META = RAW_SITE_META

export function tt(lang, zh, ja, en) {
  if (lang === 'ja') return ja
  if (lang === 'en') return en
  return zh
}

export function getLangPrefix(lang) {
  if (lang === 'ja') return '/ja'
  if (lang === 'en') return '/en'
  return ''
}

export function getArchitectureChapters(lang) {
  const p = getLangPrefix(lang)
  return [
    {
      id: 'overview',
      num: 'VOL. 01',
      badge: 'DUAL-PROCESS, DPAPI & DOCTOR',
      slug: '/architecture/overview',
      link: `${p}/architecture/overview`,
      title: tt(
        lang,
        '总体架构、双进程零信任鉴权与免提权环境自愈',
        '全体設計・ゼロトラスト認証＆自己修復型デュアルプロセス基盤',
        'System Topology, Zero-Trust Loopback Auth & Self-Healing Runtime'
      ),
      subtitle: tt(
        lang,
        'Electron 44 宿主子帧隔离、纯 ASGI X-HYN-Token 恒定时间鉴权、Windows DPAPI 系统级密钥库、三协议自适应 Schema 编译器与 System Doctor 免管理员便携工具链自愈（8 步确定性停机）。',
        'Electron 44 サブフレーム分離、純粋 ASGI X-HYN-Token 認証、Windows DPAPI 暗号化保管庫、3プロトコル適応 Schema コンパイラ、System Doctor ポータブル環境自己修復（8段階シャットダウン）。',
        'Electron 44 subframe token isolation, pure-ASGI X-HYN-Token auth, Windows DPAPI credential vault, 3-protocol adaptive schema compiler, System Doctor portable toolchain auto-repair, and 8-step shutdown.'
      ),
      modules: [
        'hyn_agent_frontend/main.js',
        'app/main.py',
        'app/core/local_auth.py',
        'app/core/secret_box.py',
        'app/services/system_doctor.py'
      ],
      metric: 'DPAPI Vault · 8-Step Lifespan · 502 Tests'
    },
    {
      id: 'long-running',
      num: 'VOL. 02',
      badge: 'P0–P3 AUTONOMY & 3-PATH PARALLEL',
      slug: '/architecture/long-running',
      link: `${p}/architecture/long-running`,
      title: tt(
        lang,
        '长程自治引擎 (P0–P3)、三路只读并发与影子 Git 检查点',
        '長時間自律エンジン (P0–P3)・3経路読取並列とシャドウGit',
        'Long-Horizon Engine (P0–P3), 3-Path Read Concurrency & Shadow Git'
      ),
      subtitle: tt(
        lang,
        '零框架纯异步流式 Agent Loop（5,227 LOC）：集成三路保序并发检索、ripgrep 42.1× 极速搜索、tree-sitter AST 大纲、TurnHub 单调 seq 断线回放、StuckDetector D1–D7→L1–L4 护栏、CompletionGate 四重门禁与私有 refs 影子检查点。',
        'フレームワーク非依存の純粋非同期ループ（5,227行）：3経路順序保証並列読取、ripgrep 42.1倍検索、tree-sitter AST、TurnHub seq 再接続、StuckDetector D1–D7 監視、CompletionGate、非侵襲シャドウGitを統合。',
        'Zero-framework 5,227-LOC async loop uniting 3-path order-preserving read concurrency, 42.1× ripgrep, tree-sitter AST, TurnHub seq replay, StuckDetector D1–D7 → L1–L4 guardrails, CompletionGate, and Shadow Git refs.'
      ),
      modules: [
        'app/services/agent_loop.py',
        'app/services/turn_hub.py',
        'app/services/stuck_detector.py',
        'app/services/git_checkpoints.py'
      ],
      metric: '84.0% SWE-bench · 100% Loop Recall'
    },
    {
      id: 'multi-agent-team',
      num: 'VOL. 03',
      badge: 'RESIDENT TEAM, DAG & WORKTREE',
      slug: '/architecture/multi-agent-team',
      link: `${p}/architecture/multi-agent-team`,
      title: tt(
        lang,
        '主从常驻智能体团队、任务图 DAG 与 Worktree 多方案对比',
        '常駐マルチエージェントチーム・タスクDAGと Git Worktree 並列比較',
        'Resident Agent Teams, Project Task DAG & Git Worktree Compare'
      ),
      subtitle: tt(
        lang,
        '三类轻量 Subagent（explore/verify/general）与最多 8 名常驻队友双轨协同：支持分级唤醒信箱、在场感知无人预算护栏、Windows 目录联接（Junction）零拷贝 Worktree、compare_group 多方案同题竞技与 git apply --3way 安全合入。',
        '軽量サブエージェントと最大8名の常駐チームメイトの2層協調：分類別イベント起動、無人トークン上限保護、Windows Junction 高速 Worktree、compare_group 複数案並列比較、3-way 安全マージを実装。',
        'Dual-tier orchestration pairing ephemeral subagents with up to 8 resident teammates: classified wake mailboxes, unattended token guards, Windows Junction worktrees, compare_group parallel diffs, and 3-way apply.'
      ),
      modules: [
        'app/services/team_runtime.py',
        'app/services/team_wake.py',
        'app/services/worktree_core.py',
        'app/services/task_store.py'
      ],
      metric: 'Up to 8 Teammates · 3.04× Speedup'
    },
    {
      id: 'memory-and-rag',
      num: 'VOL. 04',
      badge: '4-LAYER PREFIX, 7-STAGE COMPACT & RAG',
      slug: '/architecture/memory-and-rag',
      link: `${p}/architecture/memory-and-rag`,
      title: tt(
        lang,
        '四层只增前缀缓存、7 级保真压缩、双层记忆与异构 RAG',
        '4層追記プレフィックス・7段階圧縮・2層メモリ＆異種文書RAG',
        '4-Layer Prefix Cache, 7-Stage Compaction, Two-Tier Memory & RAG'
      ),
      subtitle: tt(
        lang,
        'SHA-256 逐层前缀漂移诊断驱动 SWE-bench 97.74% 缓存命中（单题 ¥0.27）；7 级缓存经济学延迟去重与 60/40 头尾保真压缩（100% 堆栈保留）；双作用域四类型记忆库配合 4 阶段异构 RAG（v0→v3 达成 100% 严格召回与 MRR 1.000）。',
        'SHA-256 プレフィックス診断により SWE-bench 97.74% ヒット率（1問解決 ¥0.27）を達成。キャッシュ経済学に基づく7段階圧縮（末尾トレース保持100%）、4種別長期メモリ、4段階異種RAG（v3 再現率100%・MRR 1.000）を詳説。',
        'SHA-256 prefix diagnostics drive 97.74% SWE-bench cache hit (¥0.27/fix); 7-stage cache-economics compaction retains 100% tail tracebacks; 4-type Markdown memory pairs with 4-stage multimodal RAG (100% v3 recall, MRR 1.000).'
      ),
      modules: [
        'app/core/prefix_hash.py',
        'app/services/context_compact.py',
        'app/services/memory_store.py',
        'app/services/knowledge/ragflow.py'
      ],
      metric: '97.74% SWE Cache · 100% RAG v3'
    },
    {
      id: 'workbench',
      num: 'VOL. 05',
      badge: 'DUAL-MODE WORKBENCH & OFFICE PATCH',
      slug: '/architecture/workbench',
      link: `${p}/architecture/workbench`,
      title: tt(
        lang,
        '双模分屏工作台、跨文件 AI 审阅栏与 Office 局部热补丁',
        '2モード統合ワークベンチ・AI差分レビュー＆Officeインプレース更新',
        'Dual-Mode Split Workbench, Cross-File AI Review & Surgical Office Patch'
      ),
      subtitle: tt(
        lang,
        'RightWorkbench 统一调度「执行现场 InspectorDock（代理/DAG 图/命令/预算）」与「7 类原生编辑器 PreviewDock（10 标签 4-LRU 保活、Shiki 语法高亮折叠 Diff、AiReviewBar 跨文件逐处审阅）」，配合 SelectionAnchor 跨格式手术刀热更新。',
        'RightWorkbench が「実行インスペクタ（エージェント/DAG/コマンド/予算）」と「7種ネイティブエディタ（10タブ 4-LRU、Shiki 折りたたみ Diff、AiReviewBar 横断レビュー）」を統合し、SelectionAnchor による書式維持更新を実現。',
        'RightWorkbench unifies InspectorDock (live agents, SVG DAG, background commands, budget) with PreviewDock (7 native editors, 10-tab 4-LRU cache, Shiki folded diffs, AiReviewBar) and SelectionAnchor SSE hot-patching.'
      ),
      modules: [
        'src/components/workbench/RightWorkbench.js',
        'src/components/preview/PreviewWorkbench.js',
        'app/services/file_workbench.py',
        'app/services/tools/selection_patch.py'
      ],
      metric: 'Dual-Mode Split · 20/20 Office Patch'
    },
    {
      id: 'intent-and-ecosystem',
      num: 'VOL. 06',
      badge: 'INTENT ALIGNMENT, MCP OAUTH & HOOKS',
      slug: '/architecture/intent-and-ecosystem',
      link: `${p}/architecture/intent-and-ecosystem`,
      title: tt(
        lang,
        '渐进式意图对齐、零轮次意图增强与 MCP / Skills / Hooks 生态',
        '段階的意図整合・Zero-RTT 意図補強と MCP / Skills / Hooks エコシステム',
        'Progressive Intent Alignment, Zero-RTT Enricher & MCP / Skills / Hooks'
      ),
      subtitle: tt(
        lang,
        '5 档实时权限（含零缓存抖动只读 Plan Mode + PlanCard 原子审批）与落盘可恢复 ask_user 澄清向导；<1ms 中日英混合 BM25 Turn Enricher 实现 /skill 零轮次直注与跨轮话题偏移记忆召回；全特性 MCP（Streamable HTTP + OAuth 2.0 + 30 工具上限）与 6 阶段生命周期 Hooks。',
        '5段階権限（キャッシュ破断ゼロの読取専用 Plan Mode + PlanCard 承認）と永続化 ask_user 質問ウィザード；1ms未満の日中英 BM25 Turn Enricher による Zero-RTT /skill 注入と話題転換メモリ想起；OAuth 2.0 対応 MCP クライアントと6段階 Hooks を統合。',
        '5-tier permissions (prefix-safe read-only Plan Mode + PlanCard) and disk-persisted ask_user wizard; <1ms trilingual BM25 Turn Enricher for Zero-RTT /skill preload & topic-shift recall; RFC 8252 OAuth 2.0 MCP client and 6-stage lifecycle Hooks.'
      ),
      modules: [
        'app/services/plan_submission.py',
        'app/services/intent_matcher.py',
        'app/services/mcp_runtime.py',
        'app/services/mcp_oauth.py',
        'app/services/hooks.py'
      ],
      metric: '5-Tier Plan Mode · <1ms BM25 · 52+ Tools'
    }
  ]
}

export function getGuideChapters(lang) {
  const p = getLangPrefix(lang)
  return [
    {
      id: 'getting-started',
      num: 'GUIDE 01',
      badge: 'QUICK START & PLAN MODE',
      slug: '/guide/getting-started',
      link: `${p}/guide/getting-started`,
      title: tt(
        lang,
        '快速开始、System Doctor 与 5 档权限指南',
        'クイックスタート・System Doctor と 5段階権限ガイド',
        'Quick Start, System Doctor & 5-Tier Permissions'
      ),
      subtitle: tt(
        lang,
        '3 分钟零配置上手 Helm：Windows 客户端安装、System Doctor 一键环境自检修复、工作区绑定与含只读 Plan Mode 在内的 5 档实时权限控制。',
        '3分で完了する初期導入：Windows版起動、System Doctor 環境自己修復、ワークスペース連携、Plan Mode を含む5段階リアルタイム権限管理。',
        'Get started in 3 minutes: Windows setup, System Doctor 1-click toolchain repair, workspace binding, and 5-tier live permissions including Plan Mode.'
      )
    },
    {
      id: 'local-models',
      num: 'GUIDE 02',
      badge: 'LOCAL & LAN LLM',
      slug: '/guide/local-models',
      link: `${p}/guide/local-models`,
      linkText: 'Ollama & LAN Setup',
      title: tt(
        lang,
        'Ollama 离线引擎与企业内网集群配置',
        'Ollama 完全オフライン＆社内閉域網（LAN）モデル設定',
        'Air-Gapped Ollama & Corporate Intranet LLM Setup'
      ),
      subtitle: tt(
        lang,
        '配置 100% 物理断网的本机 Ollama，或直连企业内网 GPU 集群（vLLM / SGLang / OneAPI），并详解三协议接入与 DPAPI 密钥加密机制。',
        '完全オフラインのローカル Ollama や社内GPUクラスタ（vLLM / SGLang / OneAPI）への直結手順、3プロトコル接続と DPAPI 暗号化保管を解説。',
        'Configure 100% air-gapped local Ollama or corporate LAN GPU clusters (vLLM / OneAPI) with multi-protocol adapters and DPAPI key encryption.'
      )
    },
    {
      id: 'knowledge-and-mcp',
      num: 'GUIDE 03',
      badge: 'RAG, MCP OAUTH, SKILLS & HOOKS',
      slug: '/guide/knowledge-and-mcp',
      link: `${p}/guide/knowledge-and-mcp`,
      title: tt(
        lang,
        '异构知识库、MCP OAuth 2.0、Skills 与生命周期 Hooks',
        '知識ベース (RAG)・MCP OAuth 2.0・Skills・ライフサイクル Hooks',
        'Enterprise RAG, MCP OAuth 2.0, Dynamic Skills & Lifecycle Hooks'
      ),
      subtitle: tt(
        lang,
        '挂载企业内部 RAGFlow 15 类版面模板知识库，使用 /skill 零轮次触发团队技能，配置 Streamable HTTP / OAuth 2.0 MCP 服务与 6 阶段确定性 Hooks 门禁。',
        '社内設計書知識ベース（RAGFlow 15種テンプレート）の連携、/skill 即時呼出、OAuth 2.0 対応 MCP サーバーおよび 6段階 Hooks の設定方法。',
        'Mount internal RAGFlow datasets (15 layout templates), trigger Zero-RTT /skills, connect OAuth 2.0 MCP servers, and enforce 6-stage lifecycle Hooks.'
      )
    }
  ]
}
