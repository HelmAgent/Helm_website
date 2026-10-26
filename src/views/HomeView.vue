<script setup>
/**
 * 旗舰深邃科技风产品首页视图（HomeView.vue）。
 *
 * 设计语言（Style 1）：
 * - 对标 Cursor / Linear / Warp 与日本顶尖科技企业（LayerX / Preferred Networks）的深邃黑曜石舞台、径向星光聚光灯、1px 顶部高光玻璃卡片与交互式特性画廊。
 * - 将首页底部的「致面试官说明」升维为得体、尊贵的「Architecture Whitepaper（工程架构白皮书 · 全 5 卷）」导览矩阵 + 精致的「Developer & Interview Live Demo」弹窗触发器。
 */
import { ref, computed } from 'vue'
import {
  SITE_META,
  tt,
  getLangPrefix,
  getArchitectureChapters
} from '../data/siteData.js'
import { useAppRouter } from '../router.js'
import ProductPlayground from '../components/ProductPlayground.vue'

const { currentLang, navigate, openAuditModal } = useAppRouter()

const showcaseTab = ref('video')
const videoLoadError = ref(false)
const videoPlayerRef = ref(null)
const playbackRate = ref(1)
const activeFeatureIdx = ref(0)
const showCodeDrawer = ref(false)

function setVideoSpeed(rate) {
  playbackRate.value = rate
  if (videoPlayerRef.value) {
    videoPlayerRef.value.playbackRate = rate
    videoPlayerRef.value.play().catch(() => {})
  }
}

function handleVideoLoaded() {
  if (videoPlayerRef.value) {
    videoPlayerRef.value.playbackRate = playbackRate.value
  }
}

const prefix = computed(() => getLangPrefix(currentLang.value))
const archChapters = computed(() => getArchitectureChapters(currentLang.value))

function t(zh, ja, en) {
  return tt(currentLang.value, zh, ja, en)
}

// 4 项核心定量指标
const kpiMetrics = computed(() => [
  {
    num: '0 Byte',
    unit: 'EXTERNAL DATA EGRESS',
    badge: t('100% 本地与内网闭环', '社外送信データ量ゼロ', '100% Air-Gap Ready'),
    label: t('公网外发机密数据量', '外部クラウド送信データ量', 'External Cloud Data Egress'),
    desc: t(
      '原生支持 127.0.0.1 本机 Ollama 与企业内网 GPU 集群直连，核心源码与办公文档 100% 不出网。',
      '127.0.0.1 ローカル完結および社内閉域網（LAN）直結に対応。機密コードや文書の社外流出を物理的に遮断。',
      'Native 127.0.0.1 loopback and corporate LAN GPU cluster support; zero external cloud relay required.'
    )
  },
  {
    num: '94.2%',
    unit: 'PREFIX CACHE HIT RATE',
    badge: t('首字极速响应', 'KVキャッシュ保護', 'Frozen Snapshot'),
    label: t('大模型前缀缓存命中率', 'LLM Prefix Cache ヒット率', 'LLM Prefix Cache Hit Rate'),
    desc: t(
      '独创会话级冻结记忆快照 + 后台异步水位线队列提取，彻底根除每轮改写 System Prompt 导致的缓存失效。',
      'セッション凍結メモリスナップショットと非同期抽出キューにより、毎ターンの KV キャッシュ破壊を防止。',
      'Session-frozen memory snapshots + async watermark queues prevent per-turn System Prompt cache invalidation.'
    )
  },
  {
    num: 'P0–P3',
    unit: 'LONG-HORIZON ENGINE',
    badge: t('数小时无人值守', '長時間自律稼働', 'Self-Healing Loop'),
    label: t('四阶段长程自治状态机', '4段階・長時間自律実行エンジン', '4-Stage Autonomous Engine'),
    desc: t(
      '集成 TurnHub 单调 seq 断线回放、StuckDetector L2 防死循环强制自省与零分支污染的影子 Git 检查点。',
      'TurnHub seq 再接続、StuckDetector L2 ループ検知、作業ブランチを汚さないシャドウGitチェックポイントを統合。',
      'Combines TurnHub seq replay, StuckDetector L2 anti-loop recovery, and non-invasive Shadow Git Checkpoints.'
    )
  },
  {
    num: '86+',
    unit: 'AUTOMATED TEST SUITE',
    badge: t('工业级可靠度', '単体テスト検証済', 'Verified Contracts'),
    label: t('核心状态机自动化单元测试', 'コア状態マシン自動単体テスト', 'Core State-Machine Unit Tests'),
    desc: t(
      '全覆盖流式重试回滚、四档权限门禁、影子检查点与双层记忆队列，确保桌面端长任务稳如磐石。',
      'ストリーム再試行・4段階権限ゲート・シャドウGit・2層メモリを網羅した高信頼バックエンド。',
      'Comprehensive coverage across stream reset, permission gates, shadow git refs, and async memory queues.'
    )
  }
])

// 四大旗舰工程引擎交互画廊
const featurePillars = computed(() => [
  {
    id: 'privacy',
    code: 'ENGINE 01 // PRIVACY & LAN TOPOLOGY',
    shortTab: t('01. 离线与内网架构', '01. 完全オフライン＆社内LAN', '01. Air-Gapped & LAN'),
    title: t(
      '全本地离线与企业内网（LAN）原生分级架构',
      '完全オフライン＆社内閉域網（LAN）ネイティブ3層構造',
      'Air-Gapped Local & Corporate LAN Native Architecture'
    ),
    desc: t(
      '在模型目录层将供应商严格划分为 local（本机 Ollama）、lan（企业内网 vLLM / SGLang / OneAPI）与 cloud 三级。免 API Key 即可一键探测本机与内网算力；Electron 主进程内置写盘前正则密钥脱敏钩子与每秒 50 条 IPC 限流保护。',
      'モデルカタログ層でプロバイダを local（端末内 Ollama）・lan（社内LAN vLLM / SGLang / OneAPI）・cloud の3階層に分離。APIキー不要で社内GPUクラスタへ直結し、ログ保存前には認証トークンを正規表現で自動マスキングします。',
      'Categorizes providers into local (Ollama), lan (corporate vLLM/SGLang/OneAPI), and cloud tiers. Connects to local/intranet GPUs without API keys, backed by pre-write regex log scrubbing and 50 msg/s IPC rate limiting.'
    ),
    highlights: [
      t('拔除网线即可在 127.0.0.1 完整运行代码重构与文档生成', 'LANケーブルを抜いた完全オフライン環境でもコード改修・文書生成が完結', 'Full coding & Office generation on 127.0.0.1 with physical network unplugged'),
      t('企业内网多终端共享 vLLM / OneAPI 算力与 RAGFlow 知识库', '社内イントラネット内の複数PCから社内GPUクラスタとRAGFlowを安全に共有', 'Share internal GPU clusters and RAGFlow knowledge bases across corporate LAN'),
      t('日志落盘前自动擦除 sk-* / Bearer 等敏感凭证', 'ディスク書込前に sk-* や Bearer トークンを強制的に *** へサニタイズ', 'Automatic regex scrubbing of sk-* and Bearer tokens before disk logging')
    ],
    visualNodes: [
      { tag: 'TIER 1 · LOCAL', name: 'Local Ollama', addr: '127.0.0.1:11434/v1', status: t('物理断网免密直连', '完全オフライン直結', 'Air-Gapped Loopback') },
      { tag: 'TIER 2 · LAN', name: 'Corporate vLLM / OneAPI', addr: '192.168.1.100:8000/v1', status: t('数据不出企业防火墙', '社内閉域網内完結', 'Zero Internet Egress') },
      { tag: 'IPC GUARD', name: 'Sanitize & Rate Limit', addr: '50 msg/s · 4KB Cap', status: t('正则脱敏落盘', '認証情報自動消去', 'Pre-Write Token Scrub') }
    ],
    snippetTitle: 'app/catalog/models.py · Provider Deployment Tiers',
    snippet: `ProviderDef(
  id="ollama", deployment="local",
  default_base_url="http://127.0.0.1:11434/v1",
  requires_key=False  # Air-gapped local loopback
),
ProviderDef(
  id="lan_server", deployment="lan",
  default_base_url="http://192.168.1.100:8000/v1",
  requires_key=False  # Corporate intranet GPU cluster
)`,
    docLink: `${prefix.value}/architecture/overview`,
    docLabel: t('阅读第 1 卷：总体架构与双进程设计 →', '第1章：全体設計とデュアルプロセス構造を読む →', 'Read Vol. 01: System Overview & Dual-Process →')
  },
  {
    id: 'longrun',
    code: 'ENGINE 02 // SHADOW GIT & P0–P3 AUTONOMY',
    shortTab: t('02. 影子检查点与长程引擎', '02. シャドウGit＆長時間自律', '02. Shadow Git & P0–P3'),
    title: t(
      '无侵入影子 Git 检查点与 P0–P3 长程自省引擎',
      '非侵襲シャドウGitチェックポイント＆P0–P3長時間自律制御',
      'Non-Invasive Shadow Git Checkpoints & P0–P3 Autonomous Engine'
    ),
    desc: t(
      '彻底摒弃直接 git commit 污染用户分支的做法，采用临时 GIT_INDEX_FILE 与 git commit-tree 将文件快照写入私有命名空间 refs/hyn/checkpoints/<session_id>。配合 TurnHub 单调 seq 断线回放与 StuckDetector L2 防死循环自省，支撑数小时无人值守开发。',
      'ユーザーの作業ブランチや .git/index を一切汚さず、一時 GIT_INDEX_FILE と git commit-tree で専用名前空間 refs/hyn/checkpoints/ にスナップショットを記録。TurnHub 再接続と L2 ループ検知により数時間の無人稼働を実現します。',
      'Never pollutes user branches or .git/index. Uses temporary GIT_INDEX_FILE and git commit-tree to write snapshots into private refs/hyn/checkpoints/, paired with TurnHub seq replay and StuckDetector L2 recovery.'
    ),
    highlights: [
      t('用户 git status 与提交历史 100% 零污染，随时一键时光倒流', 'ユーザーの git status やコミット履歴を一切汚さず、任意の時点へ即時ロールバック', '100% zero pollution to user git status or commit history; instant 1-click rollback'),
      t('TurnHub 环形缓冲 + 单调 seq：窗口刷新或网络闪断无缝续接流式输出', 'TurnHub 単調増加 seq により、画面リロードや瞬断後もストリームを欠損なく再接続', 'TurnHub monotonic seq ring buffer replays missed SSE events seamlessly on reconnect'),
      t('StuckDetector L1/L2 双级检测：连续重复报错自动注入自省指令跳出死循环', '同一エラーの反復やピンポン振動を検知し、L2 強制内省プロンプトで無限ループを打破', 'StuckDetector L1/L2 breaks tool-error loops via automatic retrospective injection')
    ],
    visualNodes: [
      { tag: 'USER BRANCH', name: 'refs/heads/main', addr: 'git status: clean', status: t('用户分支零改动', '作業ブランチ汚染ゼロ', 'Untouched User Index') },
      { tag: 'SHADOW REF', name: 'refs/hyn/checkpoints/s1', addr: 'git commit-tree', status: t('毫秒级私有快照', '非侵襲スナップショット', 'Private Plumbing Ref') },
      { tag: 'ANTI-LOOP', name: 'StuckDetector L1 / L2', addr: 'TurnHub seq Replay', status: t('自动跳出死循环', '無限ループ自動回避', 'Self-Healing Recovery') }
    ],
    snippetTitle: 'app/services/git_checkpoints.py · Plumbing Snapshot',
    snippet: `GIT_INDEX_FILE=<temp_index> git add -A
tree=$(GIT_INDEX_FILE=<temp_index> git write-tree)
commit=$(git commit-tree $tree -p $parent -m "hyn checkpoint")
# Write to private namespace; user HEAD & index remain 100% untouched
git update-ref refs/hyn/checkpoints/<session_id> $commit`,
    docLink: `${prefix.value}/architecture/long-running`,
    docLabel: t('阅读第 2 卷：长程自治引擎 (P0–P3) →', '第2章：長時間自律実行エンジン (P0–P3) を読む →', 'Read Vol. 02: Long-Horizon Engine (P0–P3) →')
  },
  {
    id: 'team',
    code: 'ENGINE 03 // GIT WORKTREE MULTI-AGENT TEAM',
    shortTab: t('03. Worktree 多智能体团队', '03. Worktree マルチエージェント', '03. Worktree Agent Team'),
    title: t(
      'Git Worktree 物理隔离的主从多智能体常驻团队',
      'Git Worktree 物理分離による常駐マルチエージェントチーム',
      'Multi-Agent Resident Team with Git Worktree Isolation'
    ),
    desc: t(
      '主代理（Lead）可招募最多 4 名常驻队友（Teammates）协同攻坚。通过 ContextVar 将每名队友的文件读写与终端命令严格锁定在各自的 .hyn_wt/mate-* 独立工作树中，并强制实施「计划未获批准前从底层剥离一切写权限」的安全门禁。',
      'リードエージェントが最大4名の常駐メイトを編成。各メイトは独立した Git Worktree（.hyn_wt/mate-*）にバインドされ、ファイル競合を物理的に排除。「計画承認前は読取専用に制限する」安全ゲートと非同期受信箱を備えています。',
      'Lead coordinates up to 4 resident teammates bound to isolated .hyn_wt/mate-* Git Worktrees via ContextVar, enforced by a strict read-only gate prior to plan approval.'
    ),
    highlights: [
      t('4 名队友并行修改前端、后端与单测，物理级隔离杜绝文件互相覆盖', '最大4名のメイトが独立した Worktree 上で並列実装し、ファイル競合破損を完全排除', 'Up to 4 teammates code in parallel across isolated worktrees without file collisions'),
      t('安全门禁：队友提交重构计划获批准前，底层物理剥离 6 类写盘与命令工具', '計画が承認されるまで write_file や run_powershell 等の変更系ツールを物理的に除外', 'Strips all 6 mutating & shell tools until Lead or user approves the implementation plan'),
      t('零轮询异步收件箱（Zero-Polling Inbox）：仅在回合边界注入摘要，保护主上下文', 'ポーリング不要の非同期インボックスで完了報告を集約し、コンテキスト肥大化を防止', 'Zero-polling async inbox injects teammate results at turn boundaries without context bloat')
    ],
    visualNodes: [
      { tag: 'LEAD AGENT', name: 'Orchestrator & Plan Gate', addr: 'Async Inbox Drain', status: t('统筹审批与汇总', '計画審査・全体統括', 'Plan Gate & Merge') },
      { tag: 'WORKTREE #1', name: '.hyn_wt/mate-backend', addr: 'Branch: wt/backend', status: t('独立工作树并发', '物理分離ワークツリー', 'Isolated Worktree') },
      { tag: 'WORKTREE #2', name: '.hyn_wt/mate-frontend', addr: '_WORKSPACE - _MUTATING', status: t('只读门禁保护中', '計画承認ゲート有効', 'Read-Only Until Approved') }
    ],
    snippetTitle: 'app/services/team_runtime.py · Plan Approval Gate',
    snippet: `_MUTATING = {"write_file", "edit_file", "apply_patch",
             "write_docx", "edit_document", "run_powershell"}
# Physically strip all mutating tools until implementation plan is approved
if mate.require_plan and not mate.plan_approved:
    allowed_tools = _WORKSPACE - _MUTATING`,
    docLink: `${prefix.value}/architecture/multi-agent-team`,
    docLabel: t('阅读第 3 卷：多智能体团队与 Worktree 隔离 →', '第3章：マルチエージェントと Worktree 分離を読む →', 'Read Vol. 03: Multi-Agent Team & Worktrees →')
  },
  {
    id: 'workbench',
    code: 'ENGINE 04 // SURGICAL OFFICE & MEMORY ENGINE',
    shortTab: t('04. 高保真文档工作台与双层记忆', '04. Office部分AI更新＆2層メモリ', '04. Office Workbench & Memory'),
    title: t(
      'WPS 级高保真文档工作台与 SelectionAnchor 手术刀级热补丁',
      '高精細 Office ワークベンチ＆選択範囲のインプレース AI 部分更新',
      'WPS-Grade Document Workbench & Selection AI Hot-Patching'
    ),
    desc: t(
      '右侧分栏原生渲染并编辑 docx / xlsx / pptx / pdf / md / html。用户在画布上用鼠标划取任意段落、单元格区间或幻灯片形状，即可生成结构化 SelectionAnchor 触发局部精准写回，并通过 SSE 原地无闪烁热刷新。',
      '右ペインで Office 文書（docx/xlsx/pptx/pdf）を高精細描画・直接編集。マウスで選択した段落・セル範囲・PPT図形だけを構造化アンカーで特定し、SSE で画面リロードなしのインプレース部分更新を実行します。',
      'In-app preview and surgical AI patching for docx, xlsx, pptx, pdf, md, and html via normalized SelectionAnchor coordinates and zero-reload SSE hot-patching.'
    ),
    highlights: [
      t('告别“改一句话重生成整份 PPT”：精准定位 slide_index 与 shape_id 原地修改', '「1箇所の修正でPPT全体を再生成」する必要なし：該当シェイプのみを書式維持で更新', 'Updates only the targeted slide shape or paragraph while preserving full document styling'),
      t('内置 5 版本文件快照（.hyn_agent/file_snapshots）与一键撤销回退', '最大5世代の自動ファイルスナップショットを保持し、ワンクリックで復元可能', 'Maintains 5-generation automatic file snapshots with instant 1-click undo'),
      t('冻结记忆快照守护 94.2% Prefix Cache，长会话依然保持秒级首字响应', '凍結メモリスナップショットにより長時間セッションでも高速な初回応答を維持', 'Session-frozen memory snapshots keep TTFT fast across multi-hour sessions')
    ],
    visualNodes: [
      { tag: 'ANCHOR LOCATOR', name: 'pptx_shape / docx_para', addr: 'slide: 2 · shape: 104', status: t('归一化坐标定位', '構造化アンカー特定', 'Surgical Coordinate') },
      { tag: 'HOT RELOAD', name: 'SSE file_updated Event', addr: '5-Gen File Snapshot', status: t('无闪烁原地刷新', 'リロードなし即時反映', 'In-Place Live Patch') },
      { tag: 'PREFIX CACHE', name: 'Frozen _memory_snapshot', addr: '94.2% KV Cache Hit', status: t('异步水位线提取', '非同期メモリ抽出', 'Async Watermark Queue') }
    ],
    snippetTitle: 'SelectionContext · Cross-Format Surgical Anchor',
    snippet: `{
  "file": { "path": "Architecture_Review.pptx", "ext": ".pptx" },
  "locator": {
    "type": "pptx_shape",
    "slide_index": 2, "shape_id": 104, "paragraph_indices": [0]
  }
} // -> python-pptx updates only the target shape, preserving layout`,
    docLink: `${prefix.value}/architecture/workbench`,
    docLabel: t('阅读第 4 & 5 卷：双层记忆与高保真工作台 →', '第4・5章：非同期2層メモリと高精細ワークベンチを読む →', 'Read Vol. 04 & 05: Memory & Office Workbench →')
  }
])

const activeFeature = computed(() => featurePillars.value[activeFeatureIdx.value])
</script>

<template>
  <div class="nx-home">
    <!-- ==================== 1. 电影级深邃科技首屏舞台 (HERO STAGE) ==================== -->
    <section class="nx-hero-section">
      <div class="nx-container">
        <div class="nx-hero-center">
          <!-- 顶部发布胶囊 -->
          <a
            class="nx-release-pill"
            :href="`${prefix}/architecture/overview`"
            @click.prevent="navigate(`${prefix}/architecture/overview`)"
          >
            <span class="nx-release-tag">RELEASE {{ SITE_META.version }}</span>
            <span class="nx-release-text">
              {{
                t(
                  'Electron 44 + Vue 3.5 + FastAPI 双进程自治智能体 · 探索 5 卷工程架构白皮书',
                  'Electron 44 + Vue 3.5 + FastAPI デュアルプロセス自律エージェント · 全5章の技術白書を公開',
                  'Electron 44 + Vue 3.5 + FastAPI Autonomous Agent Harness · Explore 5-Vol Blueprint'
                )
              }}
            </span>
            <span class="nx-release-arrow">→</span>
          </a>

          <!-- 品牌罗盘徽章与官方 Slogan -->
          <div class="nx-hero-brand-pill">
            <img class="nx-hero-compass" :src="SITE_META.brandIconUrl" alt="Helm Compass Emblem" />
            <div class="nx-hero-brand-meta">
              <span class="nx-hero-brand-name">HELM</span>
              <span class="nx-hero-brand-sep">·</span>
              <span class="nx-hero-brand-slogan">"Take the Helm of Long-Running Code &amp; Docs."</span>
            </div>
          </div>

          <!-- 极具冲击力的金属渐变主标题 -->
          <h1 class="nx-hero-title">
            {{
              t(
                '执掌长周期代码与文档创作之舵，机密数据 100% 零出网',
                '機密コードを外部に送信しない。数時間の自律開発と文書制作の舵を取る',
                'Take the Helm of Long-Running Code & Docs. Zero Data Egress.'
              )
            }}
          </h1>

          <p class="nx-hero-subtitle">
            {{
              t(
                '专为对信息安全与工程可靠性有严苛要求的研发团队打造。原生直连本机 Ollama 与企业内网私有大模型（vLLM / OneAPI），将 P0–P3 长程自治引擎、无侵入影子 Git 检查点、Git Worktree 多智能体并发团队与 Office 手术刀级局部热修改融于一体。',
                '厳格な情報セキュリティ基準と高度なエンジニアリング品質を求める開発現場へ。ローカル Ollama や社内閉域網 LLM（vLLM / OneAPI）へ直結し、P0–P3 長時間自律エンジン、シャドウGitチェックポイント、Git Worktree 並列チーム、Word / Excel / PPT の選択範囲AI部分更新ワークベンチを単一デスクトップに統合しました。',
                'Engineered for security-critical R&D teams. Connects natively to local Ollama and corporate LAN LLMs (vLLM / OneAPI), uniting a P0–P3 long-horizon engine, non-invasive Shadow Git Checkpoints, Git Worktree agent teams, and surgical in-place Office AI editing.'
              )
            }}
          </p>

          <!-- 首屏核心操作栏 -->
          <div class="nx-hero-cta-row">
            <a
              class="nx-btn nx-btn-primary nx-hero-btn-main"
              :href="`${prefix}/download`"
              @click.prevent="navigate(`${prefix}/download`)"
            >
              <span>{{ t(`免费下载 Windows 客户端 (${SITE_META.version})`, `無料ダウンロード Windows版 (${SITE_META.version})`, `Download for Windows (${SITE_META.version})`) }}</span>
              <span class="nx-hero-btn-sub">{{ t('安装版 .exe / 免安装 .zip', 'インストーラー / ポータブル版', '.exe Installer & .zip Portable') }}</span>
            </a>

            <a
              class="nx-btn nx-btn-glass nx-hero-btn-sec"
              :href="`${prefix}/architecture/overview`"
              @click.prevent="navigate(`${prefix}/architecture/overview`)"
            >
              <span>{{ t('审阅工程架构白皮书 (全 5 卷)', '技術アーキテクチャ白書 (全5章)', 'Architecture Whitepaper (5 Vols)') }}</span>
              <span>→</span>
            </a>
          </div>

          <!-- 舞台模式切换胶囊（默认展示实机演示视频） -->
          <div class="nx-stage-switcher">
            <button
              type="button"
              class="nx-stage-tab"
              :class="{ 'is-active': showcaseTab === 'video' }"
              @click="showcaseTab = 'video'"
            >
              <span class="nx-pulse-dot"></span>
              <span>▶ {{ t('实机演示视频：一句话 7分35秒 从零开发记账软件', '実機デモ動画：1文の指示で 7分35秒 ゼロから家計簿ソフトを完遂', 'Live Demo Video: 1-Prompt Bookkeeping App Built in 7m 35s') }}</span>
            </button>
            <button
              type="button"
              class="nx-stage-tab"
              :class="{ 'is-active': showcaseTab === 'interactive' }"
              @click="showcaseTab = 'interactive'"
            >
              <span>{{ t('1:1 实时交互工作台 (免安装直接操作)', '1:1 対話型ワークベンチ (ブラウザ上で操作可能)', '1:1 Interactive Desktop Workbench') }}</span>
            </button>
          </div>
        </div>

        <!-- 1320px 宽屏实机舞台容器（带底部深海蓝光晕） -->
        <div class="nx-hero-stage-wrap">
          <div class="nx-stage-glow"></div>
          <div v-if="showcaseTab === 'interactive'" class="nx-stage-mount">
            <ProductPlayground :lang="currentLang" :standalone="true" />
          </div>
          <div v-else class="nx-video-stage nx-glass-card">
            <!-- 顶部实机挑战说明与倍速控制栏 -->
            <div class="nx-video-hud">
              <div class="nx-video-hud-left">
                <div class="nx-video-kicker-row">
                  <span class="nx-badge is-emerald">
                    <span class="nx-pulse-dot"></span>
                    {{ t('REAL-WORLD AUTONOMOUS BENCHMARK · 实机端到端交付实录', 'REAL-WORLD AUTONOMOUS BENCHMARK · 実機一気通貫デモ', 'REAL-WORLD AUTONOMOUS BENCHMARK · END-TO-END RUN') }}
                  </span>
                  <span class="nx-video-duration-chip">
                    {{ t('实机任务总耗时：7 分 35 秒', '実機タスク総所要時間：7分35秒', 'Total Task Duration: 7m 35s') }}
                  </span>
                </div>
                <h2 class="nx-video-headline">
                  {{
                    t(
                      '仅凭一句话指令，7 分 35 秒从零搭建完整可用的「记账软件」并自动本地运行',
                      'わずか1文の指示から 7分35秒 で実用可能な「家計簿・収支管理ソフト」をゼロから構築・ローカル起動',
                      'From a Single Sentence to a Fully Working Local Bookkeeping App in 7 Minutes 35 Seconds'
                    )
                  }}
                </h2>
              </div>

              <div class="nx-video-hud-right">
                <div class="nx-speed-group" role="group" aria-label="Playback Speed">
                  <span class="nx-speed-label">{{ t('倍速', '再生速度', 'Speed') }}</span>
                  <button
                    v-for="rate in [1, 1.5, 2]"
                    :key="rate"
                    type="button"
                    class="nx-speed-btn"
                    :class="{ 'is-active': playbackRate === rate }"
                    @click="setVideoSpeed(rate)"
                  >
                    {{ rate }}x
                  </button>
                </div>
                <button
                  type="button"
                  class="nx-btn nx-btn-glass nx-video-switch-btn"
                  @click="showcaseTab = 'interactive'"
                >
                  <span>{{ t('切换至 1:1 交互工作台亲自操作 →', '1:1 対話型ワークベンチで操作する →', 'Try 1:1 Interactive Workbench →') }}</span>
                </button>
              </div>
            </div>

            <!-- 一句话指令输入与三大硬核战绩指标条 -->
            <div class="nx-video-mission-bar">
              <div class="nx-mission-prompt">
                <span class="nx-mission-tag">{{ t('单句输入指令 (PROMPT)', '入力プロンプト (1文のみ)', 'SINGLE-SENTENCE PROMPT') }}</span>
                <p class="nx-mission-text">
                  {{
                    t(
                      '“从零开发一个功能完整的记账软件，支持收支录入、分类统计与可视化明细，开发完成后直接在本地打开运行。”',
                      '「収支登録・カテゴリ別集計・明細表示を備えた家計簿ソフトをゼロから開発し、完了後にローカルで起動して開いてください。」',
                      '"Develop a full-featured bookkeeping software from scratch with income/expense entry and analytics, then launch and open it locally upon completion."'
                    )
                  }}
                </p>
              </div>

              <div class="nx-mission-stats">
                <div class="nx-mission-stat-item">
                  <span class="nx-ms-val">7m 35s</span>
                  <span class="nx-ms-lbl">{{ t('从空目录到软件成功运行', '空ディレクトリから起動完了まで', 'Blank Dir to Running App') }}</span>
                </div>
                <div class="nx-mission-stat-item">
                  <span class="nx-ms-val">{{ t('0 人工干预', '人間介入 0回', 'Zero Intervention') }}</span>
                  <span class="nx-ms-lbl">{{ t('一句话触发全链路自主闭环', '1文の指示で設計・実装・検証を完遂', '1-Prompt Autonomous Loop') }}</span>
                </div>
                <div class="nx-mission-stat-item">
                  <span class="nx-ms-val">{{ t('本地实机拉起', 'ローカル即時起動', 'Auto Local Launch') }}</span>
                  <span class="nx-ms-lbl">{{ t('完成后自动启动并打开可用成品', '開発完了後に自動でアプリを起動・表示', 'Built, Verified & Opened Locally') }}</span>
                </div>
              </div>
            </div>

            <!-- 视频播放器本体（进入页面默认自动播放） -->
            <div v-if="!videoLoadError" class="nx-video-viewport">
              <video
                ref="videoPlayerRef"
                class="nx-video-player"
                :src="SITE_META.demoVideoUrl"
                autoplay
                muted
                loop
                playsinline
                controls
                preload="auto"
                @loadedmetadata="handleVideoLoaded"
                @error="videoLoadError = true"
              ></video>
            </div>
            <div v-else class="nx-video-fallback">
              <span class="nx-badge">DEMO VIDEO SLOT // READY</span>
              <h3>
                {{
                  t(
                    '将实机录屏放入 docs/public/media/hero-demo.mp4 即可自动启用播放',
                    'docs/public/media/hero-demo.mp4 に動画を配置すると自動再生されます',
                    'Place your screen recording at docs/public/media/hero-demo.mp4 to auto-enable'
                  )
                }}
              </h3>
              <p>
                {{
                  t(
                    '访客与技术审阅者也可随时切换至「1:1 实时交互工作台」，在浏览器内直接体验离线重构、影子检查点与 PPT 划词局部 AI 热更新。',
                    '「1:1 対話型ワークベンチ」タブにてオフライン改修・シャドウチェックポイント・Office部分AI修正をそのまま操作体験いただけます。',
                    'Visitors can also switch to the 1:1 Interactive Workbench tab to test all workflows directly in the browser.'
                  )
                }}
              </p>
              <button type="button" class="nx-btn nx-btn-primary" @click="showcaseTab = 'interactive'">
                {{ t('切回 1:1 实时交互工作台', '1:1 対話型ワークベンチに戻る', 'Return to Interactive Workbench') }}
              </button>
            </div>

            <!-- 视频下方：为什么这段 7分35秒 实机录屏具有代表性（三栏亮点卡） -->
            <div class="nx-video-highlights">
              <div class="nx-vh-card">
                <div class="nx-vh-num">01 // ONE-PROMPT ZERO-TO-ONE</div>
                <h4 class="nx-vh-title">
                  {{ t('一句话完成从 0 到 1 全栈构建', '1文の指示からゼロベースで一気通貫構築', '1-Prompt Zero-to-One Full Build') }}
                </h4>
                <p class="nx-vh-desc">
                  {{
                    t(
                      '无需人工分步拆解任务或手写项目脚手架。仅凭一句话，Helm 自主规划工程结构、账目数据持久化与现代交互界面，展现完整的软件工程落地能力。',
                      '細かな段階的指示やボイラープレートの手動作成は不要。わずか1文からディレクトリ設計、データ永続化、UI構築までを自律的に完遂します。',
                      'No step-by-step handholding or manual scaffolding required. From a single sentence, Helm plans the project structure, data persistence, and modern UI.'
                    )
                  }}
                </p>
              </div>

              <div class="nx-vh-card">
                <div class="nx-vh-num">02 // 7M 35S UNATTENDED EXECUTION</div>
                <h4 class="nx-vh-title">
                  {{ t('7 分 35 秒高密度工具调用零中断', '7分35秒の連続ツール実行・自己検証ループ', '7m 35s Unattended Execution Loop') }}
                </h4>
                <p class="nx-vh-desc">
                  {{
                    t(
                      '在 7 分 35 秒的连续运行中，Agent 自动串联文件读写、依赖检查与终端命令执行，遇到环境或运行细节问题自动自检修正，一气呵成跑通全流程。',
                      '7分35秒の連続稼働中、ファイル作成・依存解決・コマンド実行を自律的に連鎖。実行時の細かな問題も自己検証ループで即座に修正し完走します。',
                      'Across 7m 35s of continuous execution, the agent chains file writes, dependency checks, and shell commands, automatically self-correcting along the way.'
                    )
                  }}
                </p>
              </div>

              <div class="nx-vh-card">
                <div class="nx-vh-num">03 // VERIFIED LOCAL LAUNCH &amp; QUALITY</div>
                <h4 class="nx-vh-title">
                  {{ t('高水准交付质量：完成后直接本地打开', '高い完成度：構築完了後にローカルで即時起動', 'High Delivery Quality & Local Launch') }}
                </h4>
                <p class="nx-vh-desc">
                  {{
                    t(
                      '告别“只输出代码片段不管能否跑通”的半成品演示。Helm 在完成记账软件编码后，直接在本机启动服务并打开软件界面，交付真正开箱即用的高质量成品。',
                      '「コード断片を出すだけで動かない」デモとは一線を画し、実装完了後にローカル環境でアプリを直接起動・表示。即座に使える高品質な成果物を実証します。',
                      'Beyond generating unverified code snippets—upon finishing the code, Helm launches the service and opens the working bookkeeping app locally on screen.'
                    )
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== 2. 精密定量技术指标矩阵 (TELEMETRY STRIP) ==================== -->
    <section class="nx-telemetry-section">
      <div class="nx-container">
        <div class="nx-telemetry-grid">
          <div v-for="m in kpiMetrics" :key="m.unit" class="nx-telemetry-card nx-glass-card">
            <div class="nx-telemetry-top">
              <span class="nx-telemetry-unit">{{ m.unit }}</span>
              <span class="nx-telemetry-badge">{{ m.badge }}</span>
            </div>
            <div class="nx-telemetry-num">{{ m.num }}</div>
            <div class="nx-telemetry-label">{{ m.label }}</div>
            <p class="nx-telemetry-desc">{{ m.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== 3. 四大核心工程引擎交互画廊 (INTERACTIVE ENGINE SPOTLIGHT) ==================== -->
    <section id="capabilities" class="nx-spotlight-section">
      <div class="nx-container">
        <div class="nx-sec-header is-center">
          <div class="nx-sec-kicker">
            <span>CORE ENGINEERING ARCHITECTURE</span>
          </div>
          <h2 class="nx-sec-title">
            {{
              t(
                '超越薄封装 API 套壳：深入底层状态机与数据契约的四大核心引擎',
                '単なるAPIラッパーではない：状態マシンとデータ契約に基づく4大コアエンジン',
                'Beyond Thin API Wrappers: Four Core State-Machine & Data-Contract Engines'
              )
            }}
          </h2>
          <p class="nx-sec-desc">
            {{
              t(
                '点击下方四大引擎模块，直观检视 Helm 如何解决「机密代码外泄、长任务中断死循环、多代理并发冲突、Office 文档全量重写」四大工业痛点。',
                '以下の4つのエンジンタブを切り替えて、「機密コード漏洩・長時間タスクのループ・並列編集競合・Office文書の全体再生成」を解決する内部機構をご確認ください。',
                'Explore how Helm solves the four hardest enterprise agent bottlenecks: data leakage, long-run loops, multi-agent collisions, and destructive document rewrites.'
              )
            }}
          </p>
        </div>

        <!-- 引擎切换胶囊栏 -->
        <div class="nx-pillar-tabs">
          <button
            v-for="(item, idx) in featurePillars"
            :key="item.id"
            type="button"
            class="nx-pillar-tab"
            :class="{ 'is-active': activeFeatureIdx === idx }"
            @click="activeFeatureIdx = idx"
          >
            {{ item.shortTab }}
          </button>
        </div>

        <!-- 当前选中引擎的左右双栏深度互动展示 -->
        <div class="nx-spotlight-panel nx-glass-card">
          <div class="nx-spotlight-left">
            <div class="nx-spotlight-code">{{ activeFeature.code }}</div>
            <h3 class="nx-spotlight-title">{{ activeFeature.title }}</h3>
            <p class="nx-spotlight-desc">{{ activeFeature.desc }}</p>

            <ul class="nx-spotlight-checklist">
              <li v-for="(hl, hIdx) in activeFeature.highlights" :key="hIdx">
                <span class="nx-check-icon">✓</span>
                <span>{{ hl }}</span>
              </li>
            </ul>

            <div class="nx-spotlight-actions">
              <a
                class="nx-btn nx-btn-primary"
                :href="activeFeature.docLink"
                @click.prevent="navigate(activeFeature.docLink)"
              >
                {{ activeFeature.docLabel }}
              </a>
              <button
                type="button"
                class="nx-btn nx-btn-glass"
                @click="showCodeDrawer = !showCodeDrawer"
              >
                <span>{{ showCodeDrawer ? t('收起底层代码契约', 'コード契約を閉じる', 'Hide Source Contract') : t('检视底层源码契约', 'ソースコード契約を表示', 'Inspect Source Contract') }}</span>
                <code>&lt;/&gt;</code>
              </button>
            </div>
          </div>

          <div class="nx-spotlight-right">
            <!-- 动态架构拓扑卡片组 -->
            <div class="nx-visual-topology">
              <div class="nx-visual-head">
                <span class="nx-pulse-dot"></span>
                <span>LIVE ARCHITECTURE PIPELINE // VERIFIED RUNTIME</span>
              </div>

              <div class="nx-visual-nodes">
                <div
                  v-for="(node, nIdx) in activeFeature.visualNodes"
                  :key="nIdx"
                  class="nx-visual-node-card"
                >
                  <div class="nx-vn-top">
                    <span class="nx-vn-tag">{{ node.tag }}</span>
                    <span class="nx-vn-status">{{ node.status }}</span>
                  </div>
                  <div class="nx-vn-main">
                    <strong>{{ node.name }}</strong>
                    <code>{{ node.addr }}</code>
                  </div>
                </div>
              </div>

              <!-- 可按需展开或常驻预览的源码契约视窗 -->
              <div class="nx-contract-window" :class="{ 'is-expanded': showCodeDrawer }">
                <div class="nx-contract-bar">
                  <div class="nx-contract-dots"><span></span><span></span><span></span></div>
                  <span class="nx-contract-file">{{ activeFeature.snippetTitle }}</span>
                  <span class="nx-contract-tag">SOURCE CONTRACT</span>
                </div>
                <pre class="nx-contract-pre"><code>{{ activeFeature.snippet }}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== 4. 企业级信息安全与零出网部署拓扑 (SECURITY & DEPLOYMENT TOPOLOGY) ==================== -->
    <section class="nx-topology-section">
      <div class="nx-container">
        <div class="nx-sec-header">
          <div class="nx-sec-kicker">ZERO-TRUST SECURITY &amp; DEPLOYMENT TOPOLOGIES</div>
          <h2 class="nx-sec-title">
            {{
              t(
                '满足严苛企业信息安全审查的两种「零外泄」私有化部署拓扑',
                '厳格な「情報セキュリティ審査」をクリアする2つのゼロ・イグレス導入構成',
                'Two Zero-Egress Deployment Topologies for Strict Enterprise Security Audits'
              )
            }}
          </h2>
          <p class="nx-sec-desc">
            {{
              t(
                '无论是金融、汽车与制造业的完全物理断网终端，还是科技研发部门的企业内网 GPU 集群，Helm 均可在不经过任何外部云端中转服务器的前提下独立闭环运行。',
                '外部インターネットから完全に隔離されたオフライン開発端末から、社内GPUサーバー（vLLM / OneAPI）を共有するイントラネット環境まで、外部クラウド中継サーバーを一切介さずに稼働します。',
                'Whether on an air-gapped workstation or a shared internal GPU cluster, Helm operates 100% independently without any external cloud relay servers.'
              )
            }}
          </p>
        </div>

        <div class="nx-topo-grid">
          <!-- 拓扑 A：单机完全离线闭环 -->
          <div class="nx-topo-card nx-glass-card">
            <div class="nx-topo-header">
              <span class="nx-topo-code">TOPOLOGY A // AIR-GAPPED WORKSTATION</span>
              <span class="nx-badge is-emerald">{{ t('物理断网可用', '完全オフライン完結', '100% Air-Gapped') }}</span>
            </div>
            <h3 class="nx-topo-title">
              {{ t('单机完全离线闭环模式（本机 Ollama 直连）', '端末内・完全オフライン完結モデル（ローカル Ollama 直結）', 'Standalone Air-Gapped Mode (Local Ollama)') }}
            </h3>
            <div class="nx-topo-boundary">
              <div class="nx-topo-boundary-tag">
                {{ t('物理终端边界 (127.0.0.1 回环 · 拔除网线可用)', 'ローカルPC境界内 (127.0.0.1 ループバック · LAN抜線稼働可)', 'Local PC Boundary (127.0.0.1 Loopback · Air-Gap Ready)') }}
              </div>
              <div class="nx-topo-flow">
                <div class="nx-topo-box">
                  <strong>Electron + Vue 3</strong>
                  <span>Stone Workbench UI</span>
                </div>
                <div class="nx-topo-arrow">⇄</div>
                <div class="nx-topo-box is-highlight">
                  <strong>FastAPI Engine</strong>
                  <span>127.0.0.1:8001</span>
                </div>
                <div class="nx-topo-arrow">⇄</div>
                <div class="nx-topo-box">
                  <strong>Local Ollama</strong>
                  <span>127.0.0.1:11434</span>
                </div>
              </div>
              <div class="nx-topo-foot">
                <code>.hyn_agent/</code> — {{ t('会话 JSON · 双层记忆 · Office 快照 · 影子 Git 引用全本地落盘', '会話履歴 · 2層メモリ · 文書スナップショット · シャドウGit参照をすべてローカル保存', 'Sessions, 2-tier memory, file snapshots & shadow Git refs stored on local disk') }}
              </div>
            </div>
          </div>

          <!-- 拓扑 B：企业内网集群共享 -->
          <div class="nx-topo-card nx-glass-card">
            <div class="nx-topo-header">
              <span class="nx-topo-code">TOPOLOGY B // CORPORATE INTRANET CLUSTER</span>
              <span class="nx-badge">{{ t('数据不出企业内网', '社内閉域網完結', 'Corporate LAN Only') }}</span>
            </div>
            <h3 class="nx-topo-title">
              {{ t('企业内网集群模式（私有 vLLM / SGLang / RAGFlow）', '社内閉域網クラスタ共有モデル（社内 vLLM / SGLang / RAGFlow）', 'Corporate Intranet Cluster (Internal vLLM & RAGFlow)') }}
            </h3>
            <div class="nx-topo-boundary is-lan">
              <div class="nx-topo-boundary-tag">
                {{ t('企业防火墙内部局域网 (192.168.x.x / 10.x.x.x · 阻断公网出站)', '社内イントラネット境界 (外部インターネットへのデータ送信ゼロ)', 'Corporate Firewall Boundary (Zero Public Internet Egress)') }}
              </div>
              <div class="nx-topo-flow">
                <div class="nx-topo-box">
                  <strong>Helm Desktop Client</strong>
                  <span>Developer PC (Local Git)</span>
                </div>
                <div class="nx-topo-arrow">⇄</div>
                <div class="nx-topo-box is-highlight">
                  <strong>LAN LLM Gateway</strong>
                  <span>vLLM / SGLang / OneAPI</span>
                </div>
                <div class="nx-topo-arrow">+</div>
                <div class="nx-topo-box">
                  <strong>LAN RAGFlow</strong>
                  <span>{{ t('企业内部技术文档库', '社内規定・設計書RAG', 'Internal Spec RAG') }}</span>
                </div>
              </div>
              <div class="nx-topo-foot">
                <code>lan_server</code> — {{ t('全团队共享企业内网 GPU 算力与知识库，机密代码 100% 留存内网', 'チーム全体で社内GPUリソースと知識ベースを共有し、機密コードは社外へ一切出ない', 'Share on-premise GPU clusters and RAG datasets across the team with zero external exposure') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== 5. 企业级能力对比矩阵 (COMPARISON MATRIX) ==================== -->
    <section class="nx-matrix-section">
      <div class="nx-container">
        <div class="nx-sec-header is-center">
          <div class="nx-sec-kicker">ARCHITECTURAL BENCHMARK</div>
          <h2 class="nx-sec-title">
            {{ t('Helm 与常规云端 Coding Agent 的工程能力对比', 'Helm と一般的なクラウド型 Coding Agent のアーキテクチャ比較', 'Helm vs. Conventional Cloud Coding Agents') }}
          </h2>
        </div>

        <div class="nx-matrix-card nx-glass-card">
          <div class="nx-table-scroll">
            <table class="nx-comp-table">
              <thead>
                <tr>
                  <th>{{ t('核心评估维度', '技術評価項目', 'Evaluation Dimension') }}</th>
                  <th class="is-helm-col">
                    <span class="nx-helm-th-badge">HELM DESKTOP ({{ SITE_META.version }})</span>
                  </th>
                  <th>{{ t('常规云端 Agent / 简单 API 套壳', '一般的なクラウド型 / 簡易エージェント', 'Typical Cloud / Wrapper Agents') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>{{ t('数据主权与离线能力', 'データ主権とオフライン稼働', 'Data Sovereignty & Offline') }}</strong></td>
                  <td class="is-helm-col">
                    <span class="nx-status-ok">✓</span>
                    <strong>{{ t('100% 本地落盘，原生直连本机 Ollama 与企业内网 vLLM', '100% ローカル保存。Ollama / 社内閉域網 vLLM で完全オフライン稼働', '100% local disk; native offline Ollama & corporate LAN vLLM') }}</strong>
                  </td>
                  <td class="is-dim">
                    <span class="nx-status-no">✕</span>
                    {{ t('强制经过外部云端中转服务器，难以通过严苛的企业安全合规审查', '外部クラウド中継が必須で、企業の情報セキュリティ審査を通過困難', 'Requires external cloud relays; blocked by strict enterprise security') }}
                  </td>
                </tr>
                <tr>
                  <td><strong>{{ t('长任务流式容错与防死循环', '長時間ストリーム耐障害性・ループ防止', 'Long-Horizon Fault Tolerance') }}</strong></td>
                  <td class="is-helm-col">
                    <span class="nx-status-ok">✓</span>
                    <strong>{{ t('TurnHub 单调 seq 断线回放 + stream_reset 重试清场 + StuckDetector L2 自省', 'TurnHub seq 再接続 + stream_reset 自動破棄・再試行 + StuckDetector L2 ループ検知', 'TurnHub seq replay + stream_reset + StuckDetector L2 retrospective') }}</strong>
                  </td>
                  <td class="is-dim">
                    <span class="nx-status-no">✕</span>
                    {{ t('刷新窗口或网络抖动即丢失任务，极易在同一报错命令上无限空转', '通信瞬断で処理が失われ、同一エラーコマンドの無限ループに陥りやすい', 'Loses state on hiccups; prone to infinite tool-error loops') }}
                  </td>
                </tr>
                <tr>
                  <td><strong>{{ t('版本快照与回滚机制', 'スナップショットとロールバック', 'Snapshot & Rollback Mechanism') }}</strong></td>
                  <td class="is-helm-col">
                    <span class="nx-status-ok">✓</span>
                    <strong>{{ t('无侵入影子 Git 检查点（临时 GIT_INDEX_FILE + 私有 refs，零工作区污染）', '非侵襲シャドウGitチェックポイント（作業ブランチ・Indexを一切汚さない）', 'Non-invasive Shadow Git Checkpoints (zero pollution to user HEAD/index)') }}</strong>
                  </td>
                  <td class="is-dim">
                    <span class="nx-status-no">✕</span>
                    {{ t('直接覆盖工作区文件，或产生大量临时 commit 污染用户分支历史', '作業ツリーを直接上書きするか、不要なコミットでブランチ履歴を汚す', 'Overwrites working tree directly or pollutes git commit history') }}
                  </td>
                </tr>
                <tr>
                  <td><strong>{{ t('多智能体并发与权限安全', 'マルチエージェント並列性と権限ゲート', 'Multi-Agent Concurrency & Safety') }}</strong></td>
                  <td class="is-helm-col">
                    <span class="nx-status-ok">✓</span>
                    <strong>{{ t('Git Worktree 物理隔离并发 + 计划批准前强制只读门禁 + 4 档实时权限', 'Git Worktree 物理分離 + 計画承認前の読取専用ゲート + 4段階リアルタイム権限', 'Physical Git Worktree isolation + read-only plan gate + 4-tier live permissions') }}</strong>
                  </td>
                  <td class="is-dim">
                    <span class="nx-status-no">✕</span>
                    {{ t('多代理共享同一目录互相覆盖，缺乏细粒度写盘门禁', '同一ディレクトリを同時編集して競合破損。細粒度な書込ゲートがない', 'Subagents overwrite each other in shared directories') }}
                  </td>
                </tr>
                <tr>
                  <td><strong>{{ t('大模型 Prefix Cache 保护', 'LLM Prefix Cache ヒット率保護', 'LLM Prefix Cache Preservation') }}</strong></td>
                  <td class="is-helm-col">
                    <span class="nx-status-ok">✓</span>
                    <strong>{{ t('会话级冻结记忆快照 + 后台异步队列提取，Prefix Cache 命中率 94.2%', 'セッション凍結メモリスナップショット＋非同期抽出により 94.2% ヒット率維持', 'Session-frozen memory snapshot + async queue keeps 94.2% cache hit rate') }}</strong>
                  </td>
                  <td class="is-dim">
                    <span class="nx-status-no">✕</span>
                    {{ t('每轮动态改写 System Prompt 记忆区，导致 KV Cache 每轮失效、首字极慢', '毎ターン System Prompt を書き換えるため KV キャッシュが毎回無効化', 'Mutates system prompt every turn, invalidating KV prefix cache') }}
                  </td>
                </tr>
                <tr>
                  <td><strong>{{ t('Office 富文档协同交付', 'Office文書の直接プレビュー・部分編集', 'Office Document Workbench') }}</strong></td>
                  <td class="is-helm-col">
                    <span class="nx-status-ok">✓</span>
                    <strong>{{ t('右侧内建 docx/xlsx/pptx/pdf 工作台 + 鼠标划取 SelectionAnchor 原地热更新', 'docx/xlsx/pptx/pdf ワークベンチ内蔵＋選択範囲のピンポイントSSE更新', 'Built-in docx/xlsx/pptx/pdf workbench + mouse-selection SSE hot-patching') }}</strong>
                  </td>
                  <td class="is-dim">
                    <span class="nx-status-no">✕</span>
                    {{ t('仅能输出代码文本，改一行 PPT 文字也必须重新生成整个文件', 'テキスト出力のみで、PPTやWordの1箇所を直すにも全体再生成が必要', 'Text-only; requires regenerating the entire file for minor edits') }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== 6. 尊贵得体的「Architecture Whitepaper（工程架构白皮书 · 全 5 卷）」导览区 ==================== -->
    <section class="nx-blueprint-section">
      <div class="nx-container">
        <div class="nx-blueprint-top">
          <div>
            <div class="nx-sec-kicker">ARCHITECTURE WHITEPAPER // 5-VOLUME ENGINEERING BLUEPRINT</div>
            <h2 class="nx-sec-title">
              {{
                t(
                  '深入源码级设计：Helm 工程架构白皮书（全 5 卷）',
                  'ソースコードレベルの設計開示：Helm 技術アーキテクチャ白書（全5章）',
                  'Source-Level Design Disclosure: Helm Architecture Whitepaper (5 Volumes)'
                )
              }}
            </h2>
            <p class="nx-sec-desc">
              {{
                t(
                  '完整公开双进程解耦拓扑、TurnHub 流式状态机、无侵入影子 Git 检查点、Git Worktree 并发团队与异步双层记忆的核心源码契约与架构图解。',
                  'デュアルプロセス構造、TurnHub 状態マシン、非侵襲シャドウGitチェックポイント、Git Worktree 並列チーム、非同期2層メモリの内部設計とデータ契約を全5章で詳述しています。',
                  'Complete architectural specifications detailing dual-process IPC, TurnHub state machines, Shadow Git Checkpoints, Git Worktree teams, and two-tier memory contracts.'
                )
              }}
            </p>
          </div>

          <div class="nx-blueprint-top-actions">
            <a
              class="nx-btn nx-btn-primary"
              :href="`${prefix}/architecture/overview`"
              @click.prevent="navigate(`${prefix}/architecture/overview`)"
            >
              {{ t('进入白皮书阅读中心 →', '白書リーダーで第1章から読む →', 'Open Architecture Reader →') }}
            </a>
            <button type="button" class="nx-btn nx-btn-glass" @click="openAuditModal">
              <span>⌘</span>
              <span>{{ t('Developer & Interview Live Demo', 'Developer & Interview Live Demo', 'Developer & Interview Live Demo') }}</span>
            </button>
          </div>
        </div>

        <div class="nx-blueprint-grid">
          <a
            v-for="ch in archChapters"
            :key="ch.id"
            class="nx-blueprint-card nx-glass-card is-interactive"
            :href="ch.link"
            @click.prevent="navigate(ch.link)"
          >
            <div class="nx-bp-card-head">
              <span class="nx-bp-vol">{{ ch.num }}</span>
              <span class="nx-bp-badge">{{ ch.badge }}</span>
            </div>
            <h3 class="nx-bp-title">{{ ch.title }}</h3>
            <p class="nx-bp-desc">{{ ch.subtitle }}</p>
            <div class="nx-bp-modules">
              <code v-for="m in ch.modules" :key="m">{{ m }}</code>
            </div>
            <div class="nx-bp-foot">
              <span class="nx-bp-metric">{{ ch.metric }}</span>
              <span class="nx-bp-read">{{ t('阅读本卷 →', '本章を読む →', 'Read Volume →') }}</span>
            </div>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.nx-home {
  position: relative;
  z-index: 5;
}

/* ==================== 1. HERO STAGE ==================== */
.nx-hero-section {
  padding: 56px 0 64px;
}

.nx-hero-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 1020px;
  margin: 0 auto 38px;
}

.nx-release-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 5px 14px 5px 6px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(56, 189, 248, 0.3);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 0 24px rgba(37, 99, 235, 0.2);
  font-size: 12px;
  color: #cbd5e1;
  margin-bottom: 22px;
  transition: all 180ms ease;
}

.nx-release-pill:hover {
  border-color: #38bdf8;
  color: #ffffff;
  transform: translateY(-1px);
}

.nx-release-tag {
  padding: 2px 9px;
  border-radius: 999px;
  background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
  color: #ffffff;
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 700;
}

.nx-release-arrow {
  color: #38bdf8;
  font-family: var(--font-mono);
}

.nx-hero-brand-pill {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 8px 18px 8px 10px;
  border-radius: 12px;
  background: rgba(13, 20, 36, 0.82);
  border: 1px solid rgba(148, 163, 184, 0.18);
  margin-bottom: 22px;
}

.nx-hero-compass {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid rgba(96, 165, 250, 0.4);
}

.nx-hero-brand-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.nx-hero-brand-name {
  font-size: 15px;
  font-weight: 850;
  letter-spacing: 0.16em;
  color: #ffffff;
}

.nx-hero-brand-sep {
  color: #475569;
}

.nx-hero-brand-slogan {
  font-family: var(--font-mono);
  font-size: 12.5px;
  font-weight: 650;
  color: #38bdf8;
}

.nx-hero-title {
  margin: 0 0 20px;
  font-size: clamp(32px, 4.4vw, 54px);
  font-weight: 850;
  line-height: 1.18;
  letter-spacing: -0.03em;
  background: linear-gradient(180deg, #ffffff 0%, #e2e8f0 65%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nx-hero-subtitle {
  margin: 0 0 30px;
  font-size: clamp(15px, 1.45vw, 17.5px);
  line-height: 1.72;
  color: #94a3b8;
  max-width: 880px;
}

.nx-hero-cta-row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 28px;
}

.nx-hero-btn-main {
  height: 50px;
  padding: 0 26px;
  font-size: 14.5px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.nx-hero-btn-sub {
  padding-left: 10px;
  border-left: 1px solid rgba(255, 255, 255, 0.25);
  font-size: 11.5px;
  font-weight: 500;
  color: #dbeafe;
}

.nx-hero-btn-sec {
  height: 50px;
  padding: 0 24px;
  font-size: 14px;
}

.nx-stage-switcher {
  display: inline-flex;
  align-items: center;
  padding: 4px;
  border-radius: 10px;
  background: rgba(12, 19, 36, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.nx-stage-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 16px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: #94a3b8;
  font-size: 12.5px;
  font-weight: 650;
  cursor: pointer;
  transition: all 160ms ease;
}

.nx-stage-tab:hover {
  color: #f8fafc;
}

.nx-stage-tab.is-active {
  background: rgba(37, 99, 235, 0.28);
  color: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(56, 189, 248, 0.42);
}

.nx-hero-stage-wrap {
  position: relative;
}

.nx-stage-glow {
  position: absolute;
  inset: -24px 40px -20px;
  background: radial-gradient(ellipse at center, rgba(37, 99, 235, 0.28) 0%, rgba(14, 165, 233, 0.08) 50%, transparent 75%);
  filter: blur(36px);
  z-index: 0;
  pointer-events: none;
}

.nx-stage-mount {
  position: relative;
  z-index: 2;
}

.nx-video-stage {
  position: relative;
  z-index: 2;
  padding: 28px 30px 30px;
  text-align: left;
}

.nx-video-hud {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 18px;
  padding-bottom: 18px;
  margin-bottom: 18px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
}

.nx-video-hud-left {
  max-width: 820px;
}

.nx-video-kicker-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.nx-video-duration-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.22);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #7dd3fc;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 750;
}

.nx-video-headline {
  margin: 0;
  font-size: clamp(19px, 2.2vw, 24px);
  font-weight: 800;
  line-height: 1.32;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.nx-video-hud-right {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.nx-speed-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 5px 3px 10px;
  border-radius: 9px;
  background: rgba(8, 13, 26, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.nx-speed-label {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 700;
  color: #64748b;
  margin-right: 4px;
}

.nx-speed-btn {
  height: 26px;
  padding: 0 9px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #94a3b8;
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 150ms ease;
}

.nx-speed-btn:hover {
  color: #ffffff;
}

.nx-speed-btn.is-active {
  background: rgba(37, 99, 235, 0.35);
  color: #38bdf8;
  box-shadow: inset 0 0 0 1px rgba(56, 189, 248, 0.45);
}

.nx-video-switch-btn {
  height: 34px;
  padding: 0 14px;
  font-size: 12px;
}

.nx-video-mission-bar {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 16px;
  padding: 16px 18px;
  margin-bottom: 18px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(11, 20, 40, 0.95) 100%);
  border: 1px solid rgba(56, 189, 248, 0.28);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.08);
  align-items: center;
}

.nx-mission-prompt {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-right: 14px;
  border-right: 1px solid rgba(148, 163, 184, 0.16);
}

.nx-mission-tag {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 750;
  letter-spacing: 0.08em;
  color: #38bdf8;
}

.nx-mission-text {
  margin: 0;
  font-size: 13.5px;
  font-weight: 650;
  line-height: 1.55;
  color: #f1f5f9;
}

.nx-mission-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.nx-mission-stat-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(6, 10, 21, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.nx-ms-val {
  font-family: var(--font-mono);
  font-size: 15.5px;
  font-weight: 850;
  color: #34d399;
}

.nx-ms-lbl {
  font-size: 11px;
  line-height: 1.35;
  color: #94a3b8;
}

.nx-video-viewport {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(96, 165, 250, 0.32);
  background: #020617;
  box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.85);
}

.nx-video-player {
  display: block;
  width: 100%;
  max-height: 680px;
  background: #000;
}

.nx-video-highlights {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.nx-vh-card {
  padding: 16px 18px;
  border-radius: 11px;
  background: rgba(11, 17, 32, 0.82);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.nx-vh-num {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.08em;
  color: #38bdf8;
  margin-bottom: 6px;
}

.nx-vh-title {
  margin: 0 0 6px;
  font-size: 14.5px;
  font-weight: 750;
  color: #ffffff;
}

.nx-vh-desc {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.58;
  color: #94a3b8;
}

.nx-video-fallback {
  max-width: 640px;
  margin: 0 auto;
  padding: 36px 16px;
  text-align: center;
}

.nx-video-fallback h3 {
  margin: 16px 0 10px;
  font-size: 20px;
  color: #f8fafc;
}

.nx-video-fallback p {
  margin: 0 0 22px;
  font-size: 14px;
  line-height: 1.65;
  color: #94a3b8;
}

/* ==================== 2. TELEMETRY STRIP ==================== */
.nx-telemetry-section {
  padding: 20px 0 72px;
}

.nx-telemetry-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.nx-telemetry-card {
  padding: 24px 22px;
}

.nx-telemetry-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.nx-telemetry-unit {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #38bdf8;
}

.nx-telemetry-badge {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.28);
  color: #34d399;
  font-size: 10.5px;
  font-weight: 650;
}

.nx-telemetry-num {
  font-family: var(--font-mono);
  font-size: 36px;
  font-weight: 850;
  letter-spacing: -0.03em;
  color: #ffffff;
  margin-bottom: 6px;
}

.nx-telemetry-label {
  font-size: 14.5px;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 8px;
}

.nx-telemetry-desc {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.6;
  color: #94a3b8;
}

/* ==================== 3. INTERACTIVE ENGINE SPOTLIGHT ==================== */
.nx-spotlight-section {
  padding: 64px 0 80px;
}

.nx-pillar-tabs {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 28px;
}

.nx-pillar-tab {
  height: 42px;
  padding: 0 20px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(13, 20, 36, 0.72);
  color: #cbd5e1;
  font-size: 13.5px;
  font-weight: 650;
  cursor: pointer;
  transition: all 180ms ease;
}

.nx-pillar-tab:hover {
  border-color: rgba(56, 189, 248, 0.45);
  color: #ffffff;
}

.nx-pillar-tab.is-active {
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.38) 0%, rgba(15, 76, 129, 0.52) 100%);
  border-color: #38bdf8;
  color: #ffffff;
  box-shadow: 0 0 24px rgba(56, 189, 248, 0.24);
}

.nx-spotlight-panel {
  display: grid;
  grid-template-columns: 1.08fr 1fr;
  gap: 36px;
  padding: 38px;
  align-items: center;
}

.nx-spotlight-code {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #38bdf8;
  margin-bottom: 10px;
}

.nx-spotlight-title {
  margin: 0 0 14px;
  font-size: 26px;
  font-weight: 800;
  line-height: 1.28;
  color: #ffffff;
}

.nx-spotlight-desc {
  margin: 0 0 20px;
  font-size: 14.5px;
  line-height: 1.7;
  color: #cbd5e1;
}

.nx-spotlight-checklist {
  list-style: none;
  margin: 0 0 26px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.nx-spotlight-checklist li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13.5px;
  line-height: 1.55;
  color: #e2e8f0;
}

.nx-check-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.16);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34d399;
  font-size: 11px;
  font-weight: 800;
  flex: none;
  margin-top: 1px;
}

.nx-spotlight-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.nx-visual-topology {
  background: rgba(7, 11, 22, 0.85);
  border: 1px solid rgba(96, 165, 250, 0.24);
  border-radius: 14px;
  padding: 20px;
}

.nx-visual-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #94a3b8;
  margin-bottom: 14px;
}

.nx-visual-nodes {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.nx-visual-node-card {
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.nx-vn-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 10.5px;
  margin-bottom: 4px;
}

.nx-vn-tag {
  color: #38bdf8;
  font-weight: 700;
}

.nx-vn-status {
  color: #34d399;
  font-weight: 650;
}

.nx-vn-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.nx-vn-main strong {
  font-size: 13.5px;
  color: #f8fafc;
}

.nx-vn-main code {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: #94a3b8;
  background: rgba(2, 6, 23, 0.6);
  padding: 2px 7px;
  border-radius: 5px;
}

.nx-contract-window {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: #050811;
}

.nx-contract-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #0b1120;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
  font-family: var(--font-mono);
  font-size: 11px;
}

.nx-contract-dots {
  display: flex;
  gap: 5px;
}

.nx-contract-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #334155;
}

.nx-contract-file {
  color: #cbd5e1;
}

.nx-contract-tag {
  color: #38bdf8;
  font-size: 10px;
  font-weight: 700;
}

.nx-contract-pre {
  margin: 0;
  padding: 14px;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.55;
  color: #e2e8f0;
  overflow-x: auto;
}

/* ==================== 4. DEPLOYMENT TOPOLOGIES ==================== */
.nx-topology-section {
  padding: 64px 0 80px;
}

.nx-topo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.nx-topo-card {
  padding: 30px;
}

.nx-topo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.nx-topo-code {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
}

.nx-topo-title {
  margin: 0 0 18px;
  font-size: 19px;
  font-weight: 750;
  color: #ffffff;
}

.nx-topo-boundary {
  padding: 18px;
  border-radius: 12px;
  border: 1px dashed rgba(16, 185, 129, 0.45);
  background: rgba(6, 12, 24, 0.75);
}

.nx-topo-boundary.is-lan {
  border-color: rgba(56, 189, 248, 0.45);
}

.nx-topo-boundary-tag {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 650;
  color: #34d399;
  margin-bottom: 14px;
}

.nx-topo-boundary.is-lan .nx-topo-boundary-tag {
  color: #38bdf8;
}

.nx-topo-flow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 14px;
}

.nx-topo-box {
  flex: 1;
  padding: 12px 10px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.2);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nx-topo-box.is-highlight {
  border-color: #38bdf8;
  background: rgba(37, 99, 235, 0.18);
}

.nx-topo-box strong {
  font-size: 12.5px;
  color: #ffffff;
}

.nx-topo-box span {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #94a3b8;
}

.nx-topo-arrow {
  font-family: var(--font-mono);
  font-size: 16px;
  color: #38bdf8;
  font-weight: 700;
}

.nx-topo-foot {
  padding-top: 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.14);
  font-size: 12px;
  color: #cbd5e1;
  line-height: 1.5;
}

.nx-topo-foot code {
  font-family: var(--font-mono);
  color: #38bdf8;
}

/* ==================== 5. COMPARISON MATRIX ==================== */
.nx-matrix-section {
  padding: 56px 0 80px;
}

.nx-matrix-card {
  overflow: hidden;
}

.nx-table-scroll {
  overflow-x: auto;
}

.nx-comp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}

.nx-comp-table th,
.nx-comp-table td {
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.nx-comp-table th {
  background: rgba(8, 13, 26, 0.9);
  font-size: 12px;
  font-weight: 750;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #94a3b8;
}

.nx-comp-table th.is-helm-col,
.nx-comp-table td.is-helm-col {
  background: rgba(37, 99, 235, 0.1);
  border-left: 1px solid rgba(56, 189, 248, 0.25);
  border-right: 1px solid rgba(56, 189, 248, 0.25);
  color: #ffffff;
}

.nx-helm-th-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
  color: #ffffff;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 750;
}

.nx-status-ok {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  font-size: 11px;
  font-weight: 800;
  margin-right: 8px;
}

.nx-status-no {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(244, 63, 94, 0.16);
  color: #fb7185;
  font-size: 11px;
  font-weight: 800;
  margin-right: 8px;
}

.nx-comp-table td.is-dim {
  color: #94a3b8;
}

/* ==================== 6. ARCHITECTURE WHITEPAPER BLUEPRINT DECK ==================== */
.nx-blueprint-section {
  padding: 64px 0 36px;
}

.nx-blueprint-top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 36px;
}

.nx-blueprint-top .nx-sec-desc {
  max-width: 760px;
}

.nx-blueprint-top-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.nx-blueprint-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.nx-blueprint-card {
  display: flex;
  flex-direction: column;
  padding: 26px;
}

.nx-bp-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
  font-family: var(--font-mono);
  font-size: 11px;
}

.nx-bp-vol {
  color: #38bdf8;
  font-weight: 800;
}

.nx-bp-badge {
  color: #64748b;
  font-size: 10px;
}

.nx-bp-title {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 750;
  line-height: 1.35;
  color: #ffffff;
}

.nx-bp-desc {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.62;
  color: #94a3b8;
  flex: 1;
}

.nx-bp-modules {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.nx-bp-modules code {
  padding: 2px 7px;
  border-radius: 5px;
  background: rgba(7, 11, 20, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.14);
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: #cbd5e1;
}

.nx-bp-foot {
  padding-top: 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
}

.nx-bp-metric {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #34d399;
}

.nx-bp-read {
  font-weight: 700;
  color: #38bdf8;
}

@media (max-width: 1100px) {
  .nx-video-mission-bar {
    grid-template-columns: 1fr;
  }
  .nx-mission-prompt {
    padding-right: 0;
    padding-bottom: 12px;
    border-right: none;
    border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  }
  .nx-video-highlights {
    grid-template-columns: 1fr;
  }
  .nx-telemetry-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .nx-spotlight-panel,
  .nx-topo-grid {
    grid-template-columns: 1fr;
  }
  .nx-blueprint-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 680px) {
  .nx-video-stage {
    padding: 18px;
  }
  .nx-mission-stats {
    grid-template-columns: 1fr;
  }
  .nx-stage-switcher {
    flex-direction: column;
    width: 100%;
  }
  .nx-stage-tab {
    width: 100%;
    justify-content: center;
  }
  .nx-telemetry-grid,
  .nx-blueprint-grid {
    grid-template-columns: 1fr;
  }
  .nx-spotlight-panel {
    padding: 22px;
  }
  .nx-topo-flow {
    flex-direction: column;
  }
}
</style>
