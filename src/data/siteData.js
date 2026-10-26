/**
 * 旗舰官网统一元数据与章节目录中心。
 *
 * 职责与协作：
 * - 直接复用 `docs/.vitepress/theme/siteData.js` 中的 `SITE_META`，确保用户只需改一处即可同步全站下载链接、版本号与 SHA-256。
 * - 提供架构白皮书（5 卷）与使用指南（3 篇）的结构化导航元数据。
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
      badge: 'DUAL-PROCESS & OBSERVABILITY',
      slug: '/architecture/overview',
      link: `${p}/architecture/overview`,
      title: tt(
        lang,
        '总体架构与桌面端双进程设计',
        '全体設計とデュアルプロセス構造',
        'System Overview & Dual-Process Architecture'
      ),
      subtitle: tt(
        lang,
        'Electron 44 宿主桥接、Vue 3 石澜工作台、FastAPI (Python 3.13) 异步运行时、X-Request-ID 全链路追踪与 6 步确定性停机序列。',
        'Electron 44 ホスト制御、Vue 3 ワークベンチ、FastAPI (Python 3.13) 非同期エンジン、X-Request-ID 追跡、6段階グレースフルシャットダウン。',
        'Electron 44 host bridge, Vue 3 Stone workbench, FastAPI (Python 3.13) async engine, X-Request-ID tracing, and 6-step graceful shutdown.'
      ),
      modules: ['hyn_agent_frontend/main.js', 'app/main.py', 'app/core/request_log.py'],
      metric: '50 msg/s IPC Guard · 6-Step Lifespan'
    },
    {
      id: 'long-running',
      num: 'VOL. 02',
      badge: 'P0–P3 AUTONOMOUS ENGINE',
      slug: '/architecture/long-running',
      link: `${p}/architecture/long-running`,
      title: tt(
        lang,
        '长程自治引擎 (P0–P3) 与无侵入影子 Git 检查点',
        '長時間自律実行エンジン (P0–P3) とシャドウGitチェックポイント',
        'Long-Horizon Engine (P0–P3) & Shadow Git Checkpoints'
      ),
      subtitle: tt(
        lang,
        'TurnHub 单调递增 seq 断线回放、stream_reset 重试清场、StuckDetector L2 防死循环自省，以及零分支污染的 refs/hyn/checkpoints/ 快照。',
        'TurnHub 単調増加 seq 再接続、stream_reset 自動破棄・再試行、StuckDetector L2 ループ防止、作業ツリーを汚さない専用 Git Ref スナップショット。',
        'TurnHub monotonic seq replay, stream_reset retry cleanup, StuckDetector L2 anti-loop recovery, and zero-pollution Shadow Git refs.'
      ),
      modules: ['app/services/turn_hub.py', 'app/services/agent_loop.py', 'app/services/git_checkpoints.py'],
      metric: 'Zero HEAD Pollution · L1/L2 Anti-Loop'
    },
    {
      id: 'multi-agent-team',
      num: 'VOL. 03',
      badge: 'WORKTREE MULTI-AGENT TEAM',
      slug: '/architecture/multi-agent-team',
      link: `${p}/architecture/multi-agent-team`,
      title: tt(
        lang,
        '主从多智能体团队与 Git Worktree 物理隔离',
        '常駐マルチエージェントチームと Git Worktree 物理分離',
        'Multi-Agent Resident Team & Git Worktree Isolation'
      ),
      subtitle: tt(
        lang,
        'Lead 主代理统筹最多 4 名常驻队友（Teammates），基于 ContextVar 绑定独立 Git Worktree，配合「计划未批准前剥离一切写权限」的安全门禁。',
        'リードエージェントが最大4名の常駐メイトを統括。独立した Git Worktree による物理分離と「計画承認前は読取専用に制限する」安全ゲートを実装。',
        'Lead coordinates up to 4 resident teammates bound to isolated Git Worktrees via ContextVar, enforced by a read-only plan approval gate.'
      ),
      modules: ['app/services/team_runtime.py', 'app/services/worktree_manager.py'],
      metric: 'Up to 4 Worktrees · Read-Only Plan Gate'
    },
    {
      id: 'memory-and-rag',
      num: 'VOL. 04',
      badge: 'TWO-TIER MEMORY & LOCAL RAG',
      slug: '/architecture/memory-and-rag',
      link: `${p}/architecture/memory-and-rag`,
      title: tt(
        lang,
        '会话级冻结双层记忆与本地知识库 (RAG)',
        'セッション凍結2層メモリとローカル知識ベース (RAG)',
        'Session-Frozen Two-Tier Memory & Local RAG'
      ),
      subtitle: tt(
        lang,
        '冻结会话级 _memory_snapshot 守护 94.2% 大模型 Prefix Cache 命中率，结合后台异步水位线队列提取 USER.md / MEMORY.md 与内网 RAGFlow 混合检索。',
        'セッション開始時にメモリスナップショットを凍結して 94.2% の Prefix Cache ヒット率を維持し、非同期キューによる記憶抽出と社内 RAGFlow 検索を統合。',
        'Session-frozen memory snapshots preserve 94.2% LLM Prefix Cache hit rate, paired with async watermark extraction and internal RAGFlow retrieval.'
      ),
      modules: ['app/services/memory_queue.py', 'app/services/memory_store.py', 'app/services/ragflow_client.py'],
      metric: '94.2% KV Cache Hit · Async Watermark'
    },
    {
      id: 'workbench',
      num: 'VOL. 05',
      badge: 'SURGICAL OFFICE WORKBENCH',
      slug: '/architecture/workbench',
      link: `${p}/architecture/workbench`,
      title: tt(
        lang,
        'WPS 级高保真文档工作台与 SelectionAnchor 局部热补丁',
        '高精細 Office ワークベンチと選択範囲のインプレース AI 部分更新',
        'WPS-Grade Document Workbench & Selection AI Hot-Patch'
      ),
      subtitle: tt(
        lang,
        '右侧分栏原生预览 docx / xlsx / pptx / pdf / md，鼠标划取任意形状或段落生成归一化锚点，执行手术刀级局部写回并通过 SSE 实时热刷新。',
        '右ペインで docx / xlsx / pptx / pdf を直接プレビュー。マウス選択箇所を構造化アンカーに変換し、SSE で画面リロードなしのピンポイント更新を実行。',
        'In-app preview for docx, xlsx, pptx, and pdf with normalized SelectionAnchor coordinates and zero-reload SSE surgical hot-patching.'
      ),
      modules: ['src/components/PreviewWorkbench.vue', 'app/tools/document_patch.py'],
      metric: '6 Formats Native · 5-Gen File Snapshots'
    }
  ]
}

export function getGuideChapters(lang) {
  const p = getLangPrefix(lang)
  return [
    {
      id: 'getting-started',
      num: 'GUIDE 01',
      badge: 'QUICK START',
      slug: '/guide/getting-started',
      link: `${p}/guide/getting-started`,
      title: tt(
        lang,
        '快速开始与安装指南',
        'クイックスタート・導入手順',
        'Quick Start & Installation'
      ),
      subtitle: tt(
        lang,
        '3 分钟零配置上手 Helm：Windows 客户端安装启动、本地工作区绑定与 4 档实时权限控制。',
        '3分で完了する初期導入：Windows インストーラー版の起動、ワークスペース連携、4段階の権限モード。',
        'Get started in 3 minutes: Windows client installation, workspace binding, and 4-tier live permissions.'
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
        'Ollama 与企业内网模型配置',
        'Ollama・社内閉域網（LAN）モデル設定',
        'Ollama & Corporate Intranet LLM Setup'
      ),
      subtitle: tt(
        lang,
        '配置 100% 物理断网的本机 Ollama，或直连企业内网 GPU 集群（vLLM / SGLang / OneAPI）。',
        '完全オフラインのローカル Ollama や、社内GPUクラスタ（vLLM / SGLang / OneAPI）への直結手順。',
        'Configure 100% air-gapped local Ollama or connect directly to corporate LAN GPU clusters (vLLM / OneAPI).'
      )
    },
    {
      id: 'knowledge-and-mcp',
      num: 'GUIDE 03',
      badge: 'RAG & MCP EXTENSIONS',
      slug: '/guide/knowledge-and-mcp',
      link: `${p}/guide/knowledge-and-mcp`,
      title: tt(
        lang,
        '本地知识库与 MCP / Skills 扩展',
        'ローカル知識ベースと MCP / Skills 拡張',
        'Local Knowledge Base & MCP / Skills'
      ),
      subtitle: tt(
        lang,
        '挂载企业内部设计文档库（RAGFlow），并通过标准 MCP 协议与 Skills 注入团队专属工作流。',
        '社内設計書知識ベース（RAGFlow）の連携と、標準 MCP プロトコルおよびカスタム Skills の拡張方法。',
        'Mount internal engineering docs via RAGFlow and extend agent capabilities with standard MCP servers and Skills.'
      )
    }
  ]
}
