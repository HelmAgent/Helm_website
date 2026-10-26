<script setup>
/**
 * 旗舰深邃科技风产品首页视图（HomeView.vue）。
 *
 * 设计语言（Style 1）：
 * - 对标 Cursor / Linear / Warp 与日本顶尖科技企业（LayerX / Preferred Networks）的深邃黑曜石舞台、径向星光聚光灯、1px 顶部高光玻璃卡片与交互式特性画廊。
 * - 提供「Architecture Whitepaper（工程架构白皮书 · 全 5 卷）」导览矩阵与「架构透明性与离线安全说明」弹窗触发器。
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
const copiedContactKey = ref('')

async function copyContactText(key, text) {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      copiedContactKey.value = key
      setTimeout(() => {
        if (copiedContactKey.value === key) copiedContactKey.value = ''
      }, 2200)
    }
  } catch {
    // 忽略无剪贴板权限环境
  }
}

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
              <span class="nx-hero-btn-sub">{{ t('Windows 64 位安装包 (.exe)', 'Windows 64bit インストーラー (.exe)', 'Windows x64 Installer (.exe)') }}</span>
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
              <span>{{ t('1:1 实时交互工作台 (在线体验)', '1:1 対話型ワークベンチ (ブラウザ上で操作可能)', '1:1 Interactive Desktop Workbench') }}</span>
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

              <!-- 常驻预览的源码契约视窗 -->
              <div class="nx-contract-window">
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
              <span>{{ t('架构透明性与离线安全说明', '設計の透明性とオフライン安全仕様', 'Architecture & Offline Security Info') }}</span>
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

    <!-- ==================== 7. 核心问答 Q&A：为什么不用 Codex 等通用工具，而要用 Helm？ ==================== -->
    <section id="why-helm" class="nx-qa-section">
      <div class="nx-container">
        <div class="nx-sec-header is-center">
          <div class="nx-sec-kicker">
            <span class="nx-pulse-dot"></span>
            <span>CORE FAQ // 直面最核心的选型拷问</span>
          </div>
          <h2 class="nx-sec-title">
            {{
              t(
                '核心问答 Q&A：既然有了 Codex 等大厂工具，为什么还要用 Helm？',
                'よくある質問 Q&A：なぜ Codex などの既存ツールではなく Helm を選ぶのか？',
                'Core Q&A: Why Choose Helm Over Conventional Tools Like Codex?'
              )
            }}
          </h2>
          <p class="nx-sec-desc">
            {{
              t(
                '通用云端 Coding Agent 擅长在公网环境下为程序员辅助编码；而 Helm 聚焦于大厂通用工具无法覆盖的「本地/内网物理合规、可视化同屏精细交付、以及为你免费量身定制垂直行业工作流」三大真实痛点。',
                '汎用クラウド型エージェントはパブリック環境でのコーディング支援に優れていますが、Helm は「完全オフライン/社内LANのデータ主権・Office同画面でのピンポイント部分更新・業界特化ワークフローの無償共創」という3つの領域に特化しています。',
                'While cloud coding agents excel at general coding on the public internet, Helm is purpose-built for three areas they do not cover: 100% local/LAN data sovereignty, visual in-place Office hot-patching, and free co-created vertical industry workflows.'
              )
            }}
          </p>
        </div>

        <div class="nx-qa-grid">
          <!-- Q&A 理由 01：大厂通用 vs 垂直痛点免费定制 -->
          <div class="nx-qa-card nx-glass-card">
            <div class="nx-qa-top">
              <span class="nx-qa-num">REASON 01 // VERTICAL CO-CREATION</span>
              <span class="nx-badge is-emerald">{{ t('核心差异 · 行业痛点共创', '業界特化・無償開発', 'Free Vertical Co-Creation') }}</span>
            </div>
            <h3 class="nx-qa-title">
              {{
                t(
                  '大厂绝不会为你的细分工作流改一行代码，而 Helm 会免费为你写进下一版',
                  '巨大テック企業は個別の業務フローに対応しないが、Helm はあなたの課題を次期標準機能として無償開発',
                  'Big Tech Will Never Customize for Your Niche Workflow—Helm Builds Your Pain Points into the Next Release for Free'
                )
              }}
            </h3>
            <p class="nx-qa-desc">
              {{
                t(
                  'Codex 等产品只做面向全球的标准化底座，你提出任何针对特定岗位（如财务多表核对、电商运营、科研数据处理、教务排课、标书审查、制造业报表）的痛点都只会石沉大海。而在 Helm，下个版本开发什么完全由用户痛点决定——高票共性需求我直接免费为你开发成官方内置功能；紧急或私密的专属需求更可一对一联系作者私人订制。',
                  'Codex 等の汎用ツールに特定の業界業務（経理照合、EC運営、研究データ処理、教育、製造帳票など）の要望を出しても反映されません。Helm では次期バージョンの機能をユーザーの声で決定し、共通性の高い課題は無償で公式標準機能として実装します。緊急・非公開の個別要件もメールで直接カスタム受注可能です。',
                  'General cloud tools will never tailor features for specific industry workflows (finance reconciliation, operations, research, education, or manufacturing). With Helm, users decide the roadmap: high-vote industry pain points are built into official features for free, and urgent private workflows can be custom-built on demand.'
                )
              }}
            </p>
          </div>

          <!-- Q&A 理由 02：物理级数据主权与零环境折腾 -->
          <div class="nx-qa-card nx-glass-card">
            <div class="nx-qa-top">
              <span class="nx-qa-num">REASON 02 // ZERO EGRESS &amp; MODEL FREEDOM</span>
              <span class="nx-badge">{{ t('100% 本地/内网闭环', '完全ローカル・社内LAN完結', '100% Local & LAN Ready') }}</span>
            </div>
            <h3 class="nx-qa-title">
              {{
                t(
                  '机密数据 100% 不出本机/内网，免环境折腾且不被海外账号与高昂美金订阅绑架',
                  '機密データは100%端末・社内LAN内で完結。環境構築不要でローカル Ollama や社内 vLLM に直結',
                  '100% Local/Intranet Data Sovereignty, Zero Environment Setup & Full Model Freedom'
                )
              }}
            </h3>
            <p class="nx-qa-desc">
              {{
                t(
                  'Codex 强依赖海外网络环境、高昂美元订阅，且要求将源码与业务表格上传至外部云端，在企业研发、金融、政务、医疗及隐私敏感场景下寸步难行，还常需折腾命令行与运行环境。Helm 提供 Windows 标准 .exe 一键安装即用（内嵌完整 Python 3.13 运行时），原生支持 127.0.0.1 本机离线 Ollama、企业内网 vLLM 集群或高性价比国产大模型（DeepSeek / Kimi 等），真正实现零门槛与数据零外泄。',
                  '海外クラウド必須・高額なドル建て課金・社外サーバーへのデータ送信を伴うツールは、厳格なセキュリティ環境では利用できません。Helm は Python 3.13 ランタイム内蔵の Windows .exe インストーラーで即座に起動し、127.0.0.1 ローカル Ollama や社内閉域網 vLLM、各種 API を自由に選択可能。外部へのデータ流出をゼロにします。',
                  'Cloud-only agents require external data uploads, overseas connectivity, and costly subscriptions—blocking adoption in strict enterprise or air-gapped environments. Helm installs as a turnkey Windows .exe (bundling Python 3.13) and connects natively to local Ollama, corporate LAN vLLM clusters, or cost-effective APIs with zero data egress.'
                )
              }}
            </p>
          </div>

          <!-- Q&A 理由 03：同屏可视化指哪改哪与零污染快照 -->
          <div class="nx-qa-card nx-glass-card">
            <div class="nx-qa-top">
              <span class="nx-qa-num">REASON 03 // VISUAL WORKBENCH &amp; SHADOW GIT</span>
              <span class="nx-badge">{{ t('同屏指哪改哪 · 零污染回滚', '同画面ピンポイント更新', 'Visual Anchor & Shadow Git') }}</span>
            </div>
            <h3 class="nx-qa-title">
              {{
                t(
                  '告别“黑盒命令行盲改”：右侧画布可视化“指哪改哪” + 零分支污染的影子快照',
                  'ブラックボックスなCUI操作からの脱却：右ペインでの選択範囲ピンポイント更新＆非侵襲シャドウGit',
                  'Beyond Black-Box CLI Scripts: Visual Selection Hot-Patching & Non-Invasive Shadow Git'
                )
              }}
            </h3>
            <p class="nx-qa-desc">
              {{
                t(
                  '即便让命令行 Agent 写脚本处理文档，也是看不见排版的“黑盒盲改”，经常改坏整篇格式或用临时提交污染 Git 历史。Helm 在右侧内建了高保真文档工作台，你可以一边看着渲染好的 PPT / Word / Excel，一边直接用鼠标框选某一页的某个形状或段落触发局部精准热替换；配合底层 refs/hyn/checkpoints/ 私有影子检查点与 5 版本文件快照，任何一步不满意均可毫秒级一键回退，且用户 git status 100% 保持干净。',
                  'CUIベースのエージェントによるスクリプト生成はレイアウトが見えない「ブラックボックス処理」になりがちです。Helm は右ペインに高精細プレビューを備え、マウスで選択した PPT 図形や Word 段落だけをピンポイントで即時更新（SSEホットリロード）。さらにブランチ履歴を一切汚さないシャドウGitチェックポイントにより、いつでもワンクリックでロールバック可能です。',
                  'Running blind CLI scripts to edit documents often breaks formatting or pollutes Git history. Helm features an integrated right-pane visual workbench where you highlight specific PPT shapes or Word paragraphs with your mouse for surgical SSE hot-patching—backed by zero-pollution Shadow Git refs and 5-version file snapshots for instant 1-click undo.'
                )
              }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== 8. 内测共创计划、公开「3 条客观入选标准」与官方联系方式 ==================== -->
    <section id="community" class="nx-community-section">
      <div class="nx-container">
        <div class="nx-sec-header is-center">
          <div class="nx-sec-kicker">
            <span class="nx-pulse-dot"></span>
            <span>BETA CO-CREATION, FAIR RULES &amp; COMMUNITY // 内测共创计划与官方交流渠道</span>
          </div>
          <h2 class="nx-sec-title">
            {{
              t(
                '内测共创计划、3 条客观入选标准与联系方式',
                'ベータ共創プログラム・無償開発の3つの客観基準・連絡先',
                'Beta Co-Creation Plan, 3 Objective Selection Rules & Community Channels'
              )
            }}
          </h2>
        </div>

        <!-- 升级版：内测致谢与「你提痛点 · 我免费开发」共创计划完整说明 -->
        <div class="nx-remark-banner nx-glass-card">
          <div class="nx-remark-header">
            <span class="nx-badge is-emerald">
              <span class="nx-pulse-dot"></span>
              {{ t('内测致谢与「你提痛点 · 我免费开发」共创计划', 'ベータ版への感謝と「課題提案・無償開発」共創計画', 'BETA GRATITUDE & FREE PAIN-POINT CO-CREATION PLAN') }}
            </span>
            <span class="nx-remark-sub-pill">
              {{ t('共性痛点免费开发 · 私人紧急需求邮箱定制', '共通課題は無償実装 · 個別緊急要件はメール受注', 'Public Pain Points Built Free · Private Urgent Needs via Email') }}
            </span>
          </div>
          <div class="nx-remark-body">
            <p>
              {{
                t(
                  '目前处于内测阶段，感谢大家的支持与使用！大家在使用中遇到任何问题都请务必提出，我会尽快优化并修复。',
                  '現在 Helm はベータテスト段階にあります。皆様のご支援とご利用に心より感謝申し上げます。ご利用中に何か問題やご不便がございましたらぜひお知らせください。迅速に改善・修正いたします。',
                  'Helm is currently in beta—thank you so much for your support! Please report any issues or friction you encounter during use, and I will optimize and fix them as quickly as possible.'
                )
              }}
            </p>
            <p>
              {{
                t(
                  '并计划在正式版本发布后，广泛征集大家的意见，由大家来决定下一个版本的新功能——希望 AI 能够真正服务各行各业，尽可能地解决大家的真实痛点。且在后续的升级中，我也会持续积极听取大家的意见，免费为大家开发新的功能！',
                  '正式版リリースおよび今後のアップデートでは、皆様から広くご意見を募集し、次期バージョンの新機能を皆様と共に決定していきます。AI があらゆる業界に役立ち、日々の実務の痛みを解決できるよう、皆様の声を積極的に取り入れ、新しい機能を無償で開発・提供してまいります。',
                  'Following the official release and across future upgrades, you decide what comes next! We will actively collect your feedback so AI can serve every industry and solve real-world pain points—continuously developing requested features for everyone for free.'
                )
              }}
            </p>
            <p class="is-highlight-line">
              {{
                t(
                  '💡 私人订制通道：要是大家有紧急交付、不便公开或高度定制化的私人订制功能，也请通过下方合作邮箱（785430621@qq.com）单独与我联系。',
                  '💡 個別カスタム開発窓口：緊急の納期対応や社外秘・個別仕様のプライベートカスタム機能開発をご希望の場合は、下記のメールアドレス（785430621@qq.com）まで個別にご連絡ください。',
                  '💡 Private Custom Development: If you have urgent, confidential, or highly tailored private custom feature requirements, please contact me directly via email (785430621@qq.com).'
                )
              }}
            </p>
          </div>
        </div>

        <!-- 专门版块：提前立规矩 · 公开「3 条客观入选标准」与透明排期机制 -->
        <div class="nx-rules-panel nx-glass-card">
          <div class="nx-rules-head">
            <div>
              <div class="nx-rules-kicker">TRANSPARENT &amp; OBJECTIVE SELECTION PROTOCOL // 公平透明原则</div>
              <h3 class="nx-rules-title">
                {{
                  t(
                    '提前立规矩：免费需求开发的「3 条客观入选标准」与大众投票机制',
                    '公平・透明な選考ルール：無償機能開発における「3つの客観的採択基準」',
                    'Fair & Transparent Rules: 3 Objective Criteria for Free Feature Development'
                  )
                }}
              </h3>
            </div>
            <span class="nx-badge">
              {{ t('同行附议投票排期 · 全程公开透明', 'コミュニティ投票順・完全透明', 'Community Vote Prioritized') }}
            </span>
          </div>

          <div class="nx-rules-grid">
            <div class="nx-rule-card">
              <div class="nx-rule-num">RULE 01 // INDUSTRY COMMONALITY</div>
              <h4 class="nx-rule-card-title">
                {{ t('标准一：具备「行业共性」（拒绝孤立私活）', '基準 1：「業界の共通課題」であること（個別私用案件の除外）', 'Rule 1: Industry Commonality (No Isolated One-Offs)') }}
              </h4>
              <p class="nx-rule-card-desc">
                {{
                  t(
                    '提出的痛点不能只是“仅某一家公司独有的奇葩内部流程”，而应是你所在行业（如财务、运营、科研、教育、法务、工程等）同行普遍每天都会遇到的高频痛点，开发后能作为内置功能造福整个行业。',
                    '特定の1社のみに存在する特殊な内部手順ではなく、経理・運営・研究・教育・法務・製造など、同じ業界の多くの実務者が日々直面している共通の課題であることを基準とします。',
                    'The pain point should not be an idiosyncratic workflow unique to a single company, but a high-frequency challenge shared by peers across your industry (finance, ops, research, education, legal, engineering) so the built-in feature benefits everyone.'
                  )
                }}
              </p>
            </div>

            <div class="nx-rule-card">
              <div class="nx-rule-num">RULE 02 // VERIFIABLE INPUT &amp; OUTPUT</div>
              <h4 class="nx-rule-card-title">
                {{ t('标准二：输入与输出边界清晰（附脱敏样例）', '基準 2：入出力の定義が明確であること（匿名化サンプルの提供）', 'Rule 2: Clear Input/Output Boundaries (With Sample Data)') }}
              </h4>
              <p class="nx-rule-card-desc">
                {{
                  t(
                    '为避免需求模糊反复拉扯，提交共创需求时请明确：【所在行业/场景】+【目前耗时与痛点】+【一份脱敏的原始输入文件/表格样例】+【期望最终生成的输出成品样式】，以便快速复现与精准验收。',
                    '曖昧な要件定義を防ぐため、【業界・業務シーン】＋【現状の手間】＋【機密情報を除いた入力ファイル例】＋【期待する出力結果のイメージ】を明記してご提案ください。',
                    'To ensure rapid and accurate delivery, submissions must include: [Industry/Scenario] + [Current Bottleneck] + [Sanitized Input Sample File] + [Expected Output Format].'
                  )
                }}
              </p>
            </div>

            <div class="nx-rule-card">
              <div class="nx-rule-num">RULE 03 // PUBLIC SHARING &amp; VOTE QUEUE</div>
              <h4 class="nx-rule-card-title">
                {{ t('标准三：同意公开内置 & 按同行投票排期（私密紧急走邮箱）', '基準 3：標準機能としての公開＆投票順での開発（非公開・緊急はメールへ）', 'Rule 3: Public Built-In Sharing & Vote Queue (Private/Urgent via Email)') }}
              </h4>
              <p class="nx-rule-card-desc">
                {{
                  t(
                    '免费开发的功能将内置于 Helm 正式版供所有人免费使用，并严格按照社群需求池中同行「+1 附议投票数」客观决定开发先后顺序。若您的需求涉及商业机密不便公开、属于企业独有业务或需紧急加塞交付，请走下方邮箱私人订制通道。',
                    '無償開発した機能は全ユーザーが利用できるよう Helm に標準搭載され、開発の優先順位はコミュニティ内の「+1 賛同票数」で客観的に決定します。社外秘で公開できない要件や緊急の個別開発は、下記のメール窓口よりご依頼ください。',
                    'Free co-created features are shipped in Helm for all users, prioritized objectively by community "+1" votes. If your requirement is confidential, proprietary to your business, or requires urgent expedited delivery, please use the private email channel below.'
                  )
                }}
              </p>
            </div>
          </div>
        </div>

        <!-- 三大官方联系方式与交流群卡片 -->
        <div class="nx-community-grid">
          <!-- 卡片 1：Helm Discord 交流群 -->
          <div class="nx-community-card nx-glass-card">
            <div class="nx-comm-head">
              <span class="nx-comm-tag">DISCORD COMMUNITY</span>
              <span class="nx-comm-status">{{ t('全球开发者社区', '公式サーバー', 'Official Server') }}</span>
            </div>
            <h3 class="nx-comm-title">
              {{ t('Helm 的 Discord 交流群', 'Helm 公式 Discord 交流サーバー', 'Helm Discord Community') }}
            </h3>
            <p class="nx-comm-desc">
              {{
                t(
                  '加入 Discord 频道，实时交流 Agent 工作流配置、反馈使用问题、探讨新功能想法并获取版本更新通知。',
                  'Discord サーバーに参加して、ワークフローの共有、不具合や使い方の相談、新機能のアイデア提案を行えます。',
                  'Join our Discord server to discuss workflows, report usage questions, share feature ideas, and get release updates.'
                )
              }}
            </p>
            <div class="nx-comm-value-box">
              <span class="nx-comm-label">{{ t('Helm的discord交流群链接', 'Discord 招待リンク', 'Discord Invite Link') }}</span>
              <code class="nx-comm-code">{{ SITE_META.discordUrl }}</code>
            </div>
            <div class="nx-comm-actions">
              <a
                class="nx-btn nx-btn-primary nx-comm-btn-main"
                :href="SITE_META.discordUrl"
                target="_blank"
                rel="noopener"
              >
                <span>{{ t('立即加入 Discord 交流群 ↗', 'Discord に参加する ↗', 'Join Discord Server ↗') }}</span>
              </a>
              <button
                type="button"
                class="nx-btn nx-btn-glass nx-comm-btn-copy"
                @click="copyContactText('discord', SITE_META.discordUrl)"
              >
                {{
                  copiedContactKey === 'discord'
                    ? t('✓ 已复制链接', '✓ コピー完了', '✓ Copied')
                    : t('复制链接', 'リンクをコピー', 'Copy Link')
                }}
              </button>
            </div>
          </div>

          <!-- 卡片 2：QQ 交流群 -->
          <div class="nx-community-card nx-glass-card">
            <div class="nx-comm-head">
              <span class="nx-comm-tag">QQ GROUP // CN COMMUNITY</span>
              <span class="nx-comm-status">{{ t('实时答疑与需求征集', '迅速サポート・要望受付', 'Fast Q&A & Ideas') }}</span>
            </div>
            <h3 class="nx-comm-title">
              {{ t('QQ 交流群', 'QQ 開発者交流グループ', 'QQ Community Group') }}
            </h3>
            <p class="nx-comm-desc">
              {{
                t(
                  '使用过程中遇到任何问题请积极进群联系，群内不定期征集特定需求进行免费开发，欢迎分享你的奇思妙想。',
                  '利用上の疑問やトラブルの相談、不定期の無償機能開発リクエスト、アイデア共有のための公式 QQ グループです。',
                  'Connect directly for troubleshooting, usage support, and periodic free feature request selection.'
                )
              }}
            </p>
            <div class="nx-comm-value-box">
              <span class="nx-comm-label">{{ t('QQ交流群号', 'QQ グループ番号', 'QQ Group Number') }}</span>
              <code class="nx-comm-code is-large">{{ SITE_META.qqGroup }}</code>
            </div>
            <div class="nx-comm-actions">
              <button
                type="button"
                class="nx-btn nx-btn-primary nx-comm-btn-main"
                @click="copyContactText('qq', SITE_META.qqGroup)"
              >
                <span>
                  {{
                    copiedContactKey === 'qq'
                      ? t(`✓ 已复制群号：${SITE_META.qqGroup}`, `✓ コピー完了：${SITE_META.qqGroup}`, `✓ Copied: ${SITE_META.qqGroup}`)
                      : t(`一键复制 QQ 群号 (${SITE_META.qqGroup})`, `QQグループ番号をコピー (${SITE_META.qqGroup})`, `Copy QQ Group ID (${SITE_META.qqGroup})`)
                  }}
                </span>
              </button>
            </div>
          </div>

          <!-- 卡片 3：交流合作与私人订制邮箱 -->
          <div class="nx-community-card nx-glass-card">
            <div class="nx-comm-head">
              <span class="nx-comm-tag">DIRECT EMAIL // CUSTOM DEV</span>
              <span class="nx-comm-status">{{ t('私人订制与商务合作', '個別カスタム開発・提携', 'Custom Dev & Inquiry') }}</span>
            </div>
            <h3 class="nx-comm-title">
              {{ t('交流合作邮箱', '交流・提携・カスタム開発メール', 'Collaboration & Custom Dev Email') }}
            </h3>
            <p class="nx-comm-desc">
              {{
                t(
                  '私人订制专属功能、企业内网私有化落地方案、特定业务工作流定制及深度合作交流，请直接发送邮件联系。',
                  'プライベートなカスタム機能開発（個別受注）、社内閉域網への導入相談、業務提携についてはメールにてご連絡ください。',
                  'For private custom feature development, tailored enterprise workflows, or partnership inquiries, please contact via email.'
                )
              }}
            </p>
            <div class="nx-comm-value-box">
              <span class="nx-comm-label">{{ t('交流合作邮箱', '連絡先メールアドレス', 'Contact Email') }}</span>
              <code class="nx-comm-code is-large">{{ SITE_META.contactEmail }}</code>
            </div>
            <div class="nx-comm-actions">
              <a
                class="nx-btn nx-btn-primary nx-comm-btn-main"
                :href="`mailto:${SITE_META.contactEmail}`"
              >
                <span>{{ t('发送邮件联系 ✉', 'メールを送信する ✉', 'Send Email ✉') }}</span>
              </a>
              <button
                type="button"
                class="nx-btn nx-btn-glass nx-comm-btn-copy"
                @click="copyContactText('email', SITE_META.contactEmail)"
              >
                {{
                  copiedContactKey === 'email'
                    ? t('✓ 已复制邮箱', '✓ コピー完了', '✓ Copied')
                    : t('复制邮箱', 'アドレスをコピー', 'Copy Email')
                }}
              </button>
            </div>
          </div>
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

/* ==================== 7. CORE Q&A: WHY HELM OVER CODEX ==================== */
.nx-qa-section {
  padding: 56px 0 36px;
  scroll-margin-top: 84px;
}

.nx-qa-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.nx-qa-card {
  display: flex;
  flex-direction: column;
  padding: 28px;
  border-color: rgba(56, 189, 248, 0.28);
}

.nx-qa-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.nx-qa-num {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 750;
  letter-spacing: 0.06em;
  color: #38bdf8;
}

.nx-qa-title {
  margin: 0 0 12px;
  font-size: 18.5px;
  font-weight: 800;
  line-height: 1.38;
  color: #ffffff;
}

.nx-qa-desc {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.68;
  color: #cbd5e1;
  flex: 1;
}

/* ==================== 8. COMMUNITY, RULES & CUSTOM DEV ==================== */
.nx-community-section {
  padding: 48px 0 36px;
  scroll-margin-top: 84px;
}

.nx-remark-banner {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 26px 30px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.92) 45%, rgba(37, 99, 235, 0.16) 100%);
  border: 1px solid rgba(52, 211, 153, 0.42);
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.14),
    0 18px 48px -12px rgba(16, 185, 129, 0.18);
}

.nx-remark-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.nx-remark-sub-pill {
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.22);
  border: 1px solid rgba(56, 189, 248, 0.38);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: #7dd3fc;
}

.nx-remark-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nx-remark-body p {
  margin: 0;
  font-size: 14.5px;
  font-weight: 600;
  line-height: 1.7;
  color: #f1f5f9;
}

.nx-remark-body p.is-highlight-line {
  padding-top: 10px;
  border-top: 1px dashed rgba(52, 211, 153, 0.3);
  color: #34d399;
  font-weight: 700;
}

/* 3 条客观入选标准面板 */
.nx-rules-panel {
  padding: 28px 30px;
  margin-bottom: 24px;
  border-color: rgba(56, 189, 248, 0.32);
}

.nx-rules-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  padding-bottom: 18px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
}

.nx-rules-kicker {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 750;
  letter-spacing: 0.08em;
  color: #38bdf8;
  margin-bottom: 6px;
}

.nx-rules-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
}

.nx-rules-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.nx-rule-card {
  padding: 20px;
  border-radius: 12px;
  background: rgba(8, 13, 26, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.18);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nx-rule-num {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 750;
  color: #34d399;
  letter-spacing: 0.06em;
}

.nx-rule-card-title {
  margin: 0;
  font-size: 15.5px;
  font-weight: 750;
  color: #f8fafc;
}

.nx-rule-card-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: #94a3b8;
}

.nx-community-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.nx-community-card {
  display: flex;
  flex-direction: column;
  padding: 28px;
}

.nx-comm-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  margin-bottom: 12px;
}

.nx-comm-tag {
  color: #38bdf8;
  font-weight: 750;
  letter-spacing: 0.06em;
}

.nx-comm-status {
  color: #34d399;
  font-weight: 650;
}

.nx-comm-title {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
}

.nx-comm-desc {
  margin: 0 0 18px;
  font-size: 13.5px;
  line-height: 1.62;
  color: #94a3b8;
  flex: 1;
}

.nx-comm-value-box {
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(5, 8, 17, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.24);
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.nx-comm-label {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: #64748b;
}

.nx-comm-code {
  font-family: var(--font-mono);
  font-size: 12.5px;
  font-weight: 700;
  color: #7dd3fc;
  word-break: break-all;
}

.nx-comm-code.is-large {
  font-size: 16px;
  color: #ffffff;
  letter-spacing: 0.03em;
}

.nx-comm-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nx-comm-btn-main {
  flex: 1;
  height: 40px;
  font-size: 13px;
}

.nx-comm-btn-copy {
  height: 40px;
  padding: 0 14px;
  font-size: 12.5px;
  flex: none;
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
  .nx-topo-grid,
  .nx-qa-grid,
  .nx-rules-grid,
  .nx-community-grid {
    grid-template-columns: 1fr;
  }
  .nx-remark-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
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
