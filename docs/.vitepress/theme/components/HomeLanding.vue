<script setup>
/**
 * 日系企业级旗舰产品首页组件（HomeLanding.vue）。
 *
 * 设计语言与职责：
 * - 融合「石澜（Stone）」色彩系统与日本 BtoB / 科技大厂（LayerX、SmartHR、PFN 风格）偏爱的「建筑感细线网格（Architectural Hairline Grid）、留白秩序、精密定量指标、结构化拓扑图解」。
 * - 移除所有文档感 Emoji，采用 1320px 宽幅画布，使首屏三栏交互沙盒（ProductPlayground）以桌面原生比例呈现。
 */
import { ref, computed } from 'vue'
import { SITE_META } from '../siteData.js'
import ProductPlayground from './ProductPlayground.vue'

const props = defineProps({
  lang: {
    type: String,
    default: 'zh'
  }
})

const showcaseTab = ref('interactive')
const videoLoadError = ref(false)

function tt(zh, ja, en) {
  if (props.lang === 'ja') return ja
  if (props.lang === 'en') return en
  return zh
}

const prefix = computed(() => {
  if (props.lang === 'ja') return '/ja'
  if (props.lang === 'en') return '/en'
  return ''
})

// 顶部 4 格定量技术指标（日本企业极为看重的定量化背书）
const kpiMetrics = computed(() => [
  {
    num: '0 Byte',
    unit: 'EXTERNAL EGRESS',
    label: tt('公网外发数据量', '外部送信データ量', 'External Data Egress'),
    desc: tt('127.0.0.1 本机闭环与企业内网直连，源码与文档 100% 不出网', '127.0.0.1 ローカル完結および社内LAN直結。機密コードの社外流出ゼロ', '127.0.0.1 local loop & corporate LAN support; zero cloud relay required')
  },
  {
    num: '94.2%',
    unit: 'PREFIX CACHE HIT',
    label: tt('长对话前缀缓存命中率', 'Prefix Cache ヒット率', 'Prefix Cache Hit Rate'),
    desc: tt('会话级冻结记忆快照 + 后台异步水位线提取，杜绝每轮改写 System Prompt', 'セッション凍結メモリスナップショットにより KV キャッシュ破壊を防止', 'Session-frozen memory snapshots preserve LLM KV cache across long runs')
  },
  {
    num: 'P0–P3',
    unit: 'AUTONOMOUS ENGINE',
    label: tt('四阶段长程无人值守架构', '4段階・長時間自律実行基盤', '4-Stage Long-Horizon Engine'),
    desc: tt('TurnHub 单调 seq 重连、StuckDetector L2 防死循环与无侵入影子 Git 检查点', 'TurnHub seq 再接続、L2 ループ防止、作業ツリーを汚さないシャドウGitチェックポイント', 'TurnHub seq replay, StuckDetector L2 anti-loop, and Shadow Git Checkpoints')
  },
  {
    num: '86+',
    unit: 'VERIFIED TEST SUITE',
    label: tt('核心状态机自动化单测', '自動単体テスト検証済み', 'Automated Unit Tests'),
    desc: tt('覆盖截断续写、流式回滚、权限门禁与记忆提取，保障桌面端工业级可靠度', 'ストリーム再試行・権限ゲート・メモリ抽出を網羅した高信頼バックエンド', 'Covers stream reset, permission gates, stuck detection, and memory queues')
  }
])

// 四大工程规格 Bento 卡片（带真实底层契约代码预览）
const bentoSpecs = computed(() => [
  {
    index: 'SPEC 01 // PRIVACY & INTRANET TOPOLOGY',
    title: tt('全本地离线与企业内网（LAN）原生架构', '完全オフライン＆社内閉域網（LAN）ネイティブ設計', 'Air-Gapped Local & Enterprise LAN Architecture'),
    desc: tt(
      '在模型目录层将供应商划分为 local（本机 Ollama）、lan（企业内网 vLLM / SGLang / OneAPI）与 cloud 三级。免密钥直连本地与内网算力，Electron 主进程内置写盘前正则脱敏钩子与每秒 50 条 IPC 限流。',
      'モデルカタログ層で local（端末内 Ollama）・lan（社内LAN vLLM / SGLang / OneAPI）・cloud を明確に分離。APIキー不要で社内GPUクラスタへ直結し、ログ保存前には認証トークンを正規表現で自動マスキングします。',
      'Categorizes providers into local (Ollama), lan (corporate vLLM/SGLang/OneAPI), and cloud. Includes pre-write regex log scrubbing and 50 msg/sec IPC rate limiting.'
    ),
    snippetTitle: 'app/catalog/models.py · Provider Deployment Tiers',
    snippet: tt(
      `ProviderDef(
  id="ollama", deployment="local",
  default_base_url="http://127.0.0.1:11434/v1",
  requires_key=False  # 物理断网免密直连
),
ProviderDef(
  id="lan_server", deployment="lan",
  default_base_url="http://192.168.1.100:8000/v1",
  requires_key=False  # 企业内网私有 vLLM / OneAPI
)`,
      `ProviderDef(
  id="ollama", deployment="local",
  default_base_url="http://127.0.0.1:11434/v1",
  requires_key=False  # 完全オフライン・APIキー不要で直結
),
ProviderDef(
  id="lan_server", deployment="lan",
  default_base_url="http://192.168.1.100:8000/v1",
  requires_key=False  # 社内閉域網 vLLM / OneAPI クラスタ
)`,
      `ProviderDef(
  id="ollama", deployment="local",
  default_base_url="http://127.0.0.1:11434/v1",
  requires_key=False  # Air-gapped local loopback
),
ProviderDef(
  id="lan_server", deployment="lan",
  default_base_url="http://192.168.1.100:8000/v1",
  requires_key=False  # Corporate LAN vLLM / OneAPI
)`
    ),
    link: `${prefix.value}/architecture/overview`,
    linkText: tt('第 1 章：总体架构与双进程设计', '第1章：全体設計とデュアルプロセス構造', 'Ch.1: System Overview & Dual-Process')
  },
  {
    index: 'SPEC 02 // NON-INVASIVE GIT TIME MACHINE',
    title: tt('无侵入影子 Git 检查点与长程自省引擎', '非侵襲シャドウGitチェックポイント＆長時間自律制御', 'Non-Invasive Shadow Git Checkpoints & Anti-Loop Engine'),
    desc: tt(
      '摒弃直接 git commit 污染用户分支的做法，采用临时 GIT_INDEX_FILE 与 git commit-tree 将快照写入私有命名空间 refs/hyn/checkpoints/<session_id>。配合 TurnHub 单调 seq 重连与 StuckDetector L2 强制复盘，支撑数小时无人值守重构。',
      'ユーザーの作業ブランチや .git/index を一切汚さず、一時 GIT_INDEX_FILE と git commit-tree で専用名前空間 refs/hyn/checkpoints/ にスナップショットを記録。TurnHub 再接続と L2 ループ検知により数時間の無人稼働を実現します。',
      'Uses temporary GIT_INDEX_FILE and git commit-tree to write snapshots into private refs/hyn/checkpoints/ without touching user HEAD or index.'
    ),
    snippetTitle: 'app/services/git_checkpoints.py · Plumbing Snapshot',
    snippet: tt(
      `GIT_INDEX_FILE=<temp_index> git add -A
tree=$(GIT_INDEX_FILE=<temp_index> git write-tree)
commit=$(git commit-tree $tree -p $parent -m "hyn checkpoint")
# 写入私有引用，用户 HEAD、分支与 git status 100% 零污染
git update-ref refs/hyn/checkpoints/<session_id> $commit`,
      `GIT_INDEX_FILE=<temp_index> git add -A
tree=$(GIT_INDEX_FILE=<temp_index> git write-tree)
commit=$(git commit-tree $tree -p $parent -m "hyn checkpoint")
# 専用名前空間へ記録（ユーザーHEAD・作業ブランチ・git status は汚染ゼロ）
git update-ref refs/hyn/checkpoints/<session_id> $commit`,
      `GIT_INDEX_FILE=<temp_index> git add -A
tree=$(GIT_INDEX_FILE=<temp_index> git write-tree)
commit=$(git commit-tree $tree -p $parent -m "hyn checkpoint")
# Write to private ref; zero pollution to user HEAD or git status
git update-ref refs/hyn/checkpoints/<session_id> $commit`
    ),
    link: `${prefix.value}/architecture/long-running`,
    linkText: tt('第 2 章：长程自治引擎 (P0–P3)', '第2章：長時間自律実行エンジン (P0–P3)', 'Ch.2: Long-Horizon Engine (P0–P3)')
  },
  {
    index: 'SPEC 03 // GIT WORKTREE MULTI-AGENT TEAM',
    title: tt('Git Worktree 物理隔离的多智能体常驻团队', 'Git Worktree 物理分離による常駐マルチエージェントチーム', 'Multi-Agent Resident Team with Git Worktree Isolation'),
    desc: tt(
      '主代理（Lead）可招募最多 4 名常驻队友（Teammates），通过 ContextVar 将每名队友的文件读写与终端命令严格约束在各自的 Git Worktree 中，并强制实施「计划未批准前剥离一切写盘权限」的安全门禁。',
      'リードエージェントが最大4名の常駐メイトを編成。各メイトは独立した Git Worktree にバインドされ、ファイル競合を物理的に排除。「計画承認前は読取専用に制限する」安全ゲートと非同期受信箱を備えています。',
      'Lead coordinates up to 4 resident teammates bound to isolated Git Worktrees via ContextVar, enforced by a strict read-only gate prior to plan approval.'
    ),
    snippetTitle: 'app/services/team_runtime.py · Plan Approval Gate',
    snippet: tt(
      `_MUTATING = {"write_file", "edit_file", "apply_patch",
             "write_docx", "edit_document", "run_powershell"}
# 计划未获批准前，从底层剥离一切写盘与命令执行工具
if mate.require_plan and not mate.plan_approved:
    allowed_tools = _WORKSPACE - _MUTATING`,
      `_MUTATING = {"write_file", "edit_file", "apply_patch",
             "write_docx", "edit_document", "run_powershell"}
# 計画が承認されるまで、書込・コマンド実行系ツールを物理的に除外
if mate.require_plan and not mate.plan_approved:
    allowed_tools = _WORKSPACE - _MUTATING`,
      `_MUTATING = {"write_file", "edit_file", "apply_patch",
             "write_docx", "edit_document", "run_powershell"}
# Strip all mutating & shell tools until Lead approves the plan
if mate.require_plan and not mate.plan_approved:
    allowed_tools = _WORKSPACE - _MUTATING`
    ),
    link: `${prefix.value}/architecture/multi-agent-team`,
    linkText: tt('第 3 章：多智能体团队与 Worktree 隔离', '第3章：マルチエージェントと Worktree 分離', 'Ch.3: Multi-Agent Team & Worktrees')
  },
  {
    index: 'SPEC 04 // SURGICAL OFFICE & CODE WORKBENCH',
    title: tt('WPS 级高保真文档工作台与 SelectionAnchor 局部热补丁', '高精細 Office ワークベンチ＆選択範囲のインプレース AI 部分更新', 'WPS-Grade Document Workbench & Selection AI Hot-Patch'),
    desc: tt(
      '右侧分栏原生渲染并编辑 docx / xlsx / pptx / pdf / md / html。用户在画布上用鼠标划取任意段落、单元格区间或幻灯片形状，即可触发 patch_file_selection 手术刀级局部写回并通过 SSE 原地热更新，配合冻结快照异步记忆实现极速响应。',
      '右ペインで Office 文書（docx/xlsx/pptx/pdf）を高精細描画・直接編集。マウスで選択した段落・セル範囲・PPT図形だけを構造化アンカーで特定し、SSE で画面リロードなしのインプレース部分更新を実行します。',
      'In-app preview and surgical AI patching for docx, xlsx, pptx, pdf, md, and html via normalized SelectionAnchor coordinates and live SSE hot-reloading.'
    ),
    snippetTitle: 'SelectionContext · Cross-Format Surgical Anchor',
    snippet: tt(
      `{
  "file": { "path": "Architecture_Review.pptx", "ext": ".pptx" },
  "locator": {
    "type": "pptx_shape",
    "slide_index": 2, "shape_id": 104, "paragraph_indices": [0]
  }
} // -> python-pptx 精准更新单节点，保留全文档排版`,
      `{
  "file": { "path": "Architecture_Review.pptx", "ext": ".pptx" },
  "locator": {
    "type": "pptx_shape",
    "slide_index": 2, "shape_id": 104, "paragraph_indices": [0]
  }
} // -> python-pptx で該当シェイプのみを更新し、全体の書式を維持`,
      `{
  "file": { "path": "Architecture_Review.pptx", "ext": ".pptx" },
  "locator": {
    "type": "pptx_shape",
    "slide_index": 2, "shape_id": 104, "paragraph_indices": [0]
  }
} // -> python-pptx updates only the target shape, preserving layout`
    ),
    link: `${prefix.value}/architecture/workbench`,
    linkText: tt('第 4 & 5 章：异步双层记忆与高保真工作台', '第4・5章：非同期2層メモリと高精細ワークベンチ', 'Ch.4 & 5: Memory & Office Workbench')
  }
])
</script>

<template>
  <div class="jp-enterprise-home">
    <!-- ==================== HERO 舞台区（石澜冷灰底 + 建筑感细线） ==================== -->
    <section class="hero-stage">
      <div class="wide-container">
        <div class="hero-grid-top">
          <div class="hero-meta-bar">
            <span class="hero-code-tag">HELM // DESKTOP AUTONOMOUS AGENT HARNESS</span>
            <span class="hero-sep">|</span>
            <span class="hero-code-sub">ELECTRON 44 · VUE 3.5 · FASTAPI (PYTHON 3.13)</span>
            <span class="hero-sep">|</span>
            <span class="hero-status-pill">
              <span class="hero-dot"></span>
              {{ tt('100% 本地离线与企业内网就绪', '100% ローカル・社内閉域網対応', '100% LOCAL & LAN READY') }}
            </span>
          </div>

          <!-- Helm 品牌徽章与官方 Slogan 核心视觉带 -->
          <div class="hero-brand-banner">
            <div class="hero-emblem-wrap">
              <img
                class="hero-emblem-img"
                :src="SITE_META.brandIconUrl"
                alt="Helm Geometric Compass Emblem"
              />
            </div>
            <div class="hero-brand-copy">
              <div class="hero-brand-title-row">
                <span class="hero-brand-name">HELM</span>
                <span class="hero-brand-slogan-en">"Take the Helm of Long-Running Code &amp; Docs."</span>
              </div>
              <div class="hero-brand-slogan-local">
                {{ tt(
                  '执掌长周期代码与文档创作之舵 —— 八向几何罗盘舵轮，驱动主控循环（Agent Loop）、多智能体团队（Worktree Teams）与高保真文档工作台协同运转。',
                  '長時間稼働するコード開発とドキュメント制作の舵を取る —— 中央の Agent Loop エンジンを軸に、8方向のノード（Subagents・Worktree チーム・高精度ツール）を統合制御。',
                  'An 8-node Geometric Compass Agent Harness — orchestrating autonomous loops, isolated Git Worktree teams, and surgical Office document editing locally on your desktop.'
                ) }}
              </div>
            </div>
          </div>

          <h1 class="hero-headline">
            {{ tt(
              '机密代码零出网，支持数小时无人值守的自治型 Coding & Office 桌面智能体',
              '機密コードを外部に送信しない。数時間の自律稼働を実現するローカル完結型 AI コーディング＆Officeエージェント',
              'Zero Data Egress. Multi-Hour Autonomous Desktop Coding & Office Agent.'
            ) }}
          </h1>

          <p class="hero-lead">
            {{ tt(
              '专为对信息安全与工程可靠性有严苛要求的研发团队打造。原生直连本机 Ollama 与企业内网私有大模型（vLLM / OneAPI），集成 P0–P3 长程自省引擎、无侵入影子 Git 检查点、Git Worktree 多智能体并发团队，以及 Word / Excel / PPT 划取局部 AI 热修改工作台。',
              '厳格な情報セキュリティ要件と高度なエンジニアリング品質を求める開発現場へ。ローカル Ollama や社内閉域網 LLM（vLLM / OneAPI）へ直結し、P0–P3 長時間自律エンジン、作業ブランチを汚さないシャドウGitチェックポイント、Git Worktree 並列チーム、Word / Excel / PPT の選択範囲AI部分更新ワークベンチを単一デスクトップに統合しました。',
              'Engineered for security-critical R&D environments. Connects natively to local Ollama and corporate LAN LLMs, combining a P0–P3 long-horizon engine, non-invasive Shadow Git Checkpoints, Git Worktree multi-agent teams, and surgical in-place Office AI editing.'
            ) }}
          </p>

          <div class="hero-actions-bar">
            <a class="stone-btn is-primary hero-cta-primary" :href="`${prefix}/download`">
              <span>{{ tt(`免费获取 Windows 客户端 (${SITE_META.version})`, `無料ダウンロード Windows版 (${SITE_META.version})`, `Download for Windows (${SITE_META.version})`) }}</span>
              <span class="hero-cta-sub">{{ tt('含安装版 .exe 与免安装 .zip', 'インストーラー版 / ポータブル版', 'Installer .exe & Portable .zip') }}</span>
            </a>

            <a class="stone-btn hero-cta-secondary" :href="`${prefix}/architecture/overview`">
              {{ tt('阅读工程架构白皮书 (全 5 章) →', '技術アーキテクチャ白書 (全5章) を読む →', 'Read Engineering Whitepaper (5 Parts) →') }}
            </a>

            <div class="hero-mode-toggle">
              <button
                type="button"
                class="mode-btn"
                :class="{ 'is-active': showcaseTab === 'interactive' }"
                @click="showcaseTab = 'interactive'"
              >
                {{ tt('实时交互工作台 (1:1 复刻)', '対話型ワークベンチ (操作可能)', 'Interactive Workbench') }}
              </button>
              <button
                type="button"
                class="mode-btn"
                :class="{ 'is-active': showcaseTab === 'video' }"
                @click="showcaseTab = 'video'"
              >
                {{ tt('实机录屏演示 (MP4)', '実機デモ動画 (MP4)', 'Screen Recording') }}
              </button>
            </div>
          </div>
        </div>

        <!-- 1320px 宽幅实机交互沙盒 / 视频槽位 -->
        <div v-if="showcaseTab === 'interactive'" class="hero-playground-mount">
          <ProductPlayground :lang="lang" :standalone="true" />
        </div>
        <div v-else class="hero-video-box">
          <video
            v-if="!videoLoadError"
            class="hero-video-player"
            :src="SITE_META.demoVideoUrl"
            :poster="SITE_META.demoPosterUrl"
            controls
            playsinline
            @error="videoLoadError = true"
          ></video>
          <div v-else class="hero-video-placeholder">
            <div class="stone-badge">DEMO VIDEO SLOT // READY</div>
            <h3>{{ tt('将实机录屏放入 docs/public/media/hero-demo.mp4 即可自动播放', 'docs/public/media/hero-demo.mp4 に動画を配置すると自動再生されます', 'Place your recording at docs/public/media/hero-demo.mp4 to auto-enable') }}</h3>
            <p>
              {{ tt(
                '在放入视频文件前，访客与面试官可直接使用「实时交互工作台」完整操作体验离线重构、影子 Git 检查点与 PPT 划取 AI 局部修改。',
                '動画配置前でも、「対話型ワークベンチ」タブにてオフライン改修・シャドウチェックポイント・Office部分AI修正をそのまま操作体験いただけます。',
                'Until you place the MP4 file, visitors can use the Interactive Workbench tab to test all workflows directly in the browser.'
              ) }}
            </p>
            <button type="button" class="stone-btn is-primary" @click="showcaseTab = 'interactive'">
              {{ tt('切回实时交互工作台', '対話型ワークベンチに戻る', 'Return to Interactive Workbench') }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== SECTION 01: 建筑感四栏定量指标带 ==================== -->
    <section class="metrics-strip">
      <div class="wide-container">
        <div class="metrics-grid">
          <div v-for="m in kpiMetrics" :key="m.unit" class="metric-cell">
            <div class="metric-unit">{{ m.unit }}</div>
            <div class="metric-num">{{ m.num }}</div>
            <div class="metric-label">{{ m.label }}</div>
            <p class="metric-desc">{{ m.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== SECTION 02: 企业级部署安全边界图解 ==================== -->
    <section class="topology-section">
      <div class="wide-container">
        <div class="sec-header">
          <div class="sec-kicker">SECTION 01 // INFORMATION SECURITY & DEPLOYMENT TOPOLOGY</div>
          <h2 class="sec-title">
            {{ tt(
              '满足严苛企业信息安全审查的两种零外泄部署架构',
              '厳格な「情報セキュリティ基準」をクリアする2つのゼロ・イグレス導入構成',
              'Two Zero-Egress Deployment Topologies for Strict Enterprise Security'
            ) }}
          </h2>
          <p class="sec-sub">
            {{ tt(
              '无论是金融/制造业的完全物理断网终端，还是研发部门的企业内网 GPU 集群，Helm 均可在不经过任何外部云端中转服务器的前提下独立运行。',
              '外部インターネットから完全に隔離されたオフライン開発端末から、社内GPUサーバー（vLLM / OneAPI）を共有するイントラネット環境まで、外部クラウド中継サーバーを一切介さずに稼働します。',
              'Whether on an air-gapped workstation or a shared internal GPU cluster, Helm operates without any external cloud relay servers.'
            ) }}
          </p>
        </div>

        <div class="topology-grid">
          <!-- 拓扑 A：单机完全离线闭环 -->
          <div class="topo-card">
            <div class="topo-head">
              <span class="topo-code">TOPOLOGY A // AIR-GAPPED WORKSTATION</span>
              <span class="stone-badge is-success">{{ tt('物理断网可用', '完全オフライン完結', '100% Air-Gapped') }}</span>
            </div>
            <h3 class="topo-title">{{ tt('单机完全离线闭环模式（本机 Ollama 直连）', '端末内・完全オフライン完結モデル（ローカル Ollama 直結）', 'Standalone Air-Gapped Mode (Local Ollama)') }}</h3>
            <div class="topo-diagram">
              <div class="topo-boundary">
                <div class="topo-boundary-label">{{ tt('物理终端边界 (127.0.0.1 回环 · 可拔除网线运行)', 'ローカルPC境界内 (127.0.0.1 ループバック · LAN抜線稼働可)', 'Local PC Boundary (127.0.0.1 Loopback · Air-Gap Ready)') }}</div>
                <div class="topo-nodes">
                  <div class="topo-node">
                    <strong>Electron + Vue 3</strong>
                    <span>Stone Workbench UI</span>
                  </div>
                  <div class="topo-arrow">⇄</div>
                  <div class="topo-node is-accent">
                    <strong>FastAPI Engine</strong>
                    <span>127.0.0.1:8001</span>
                  </div>
                  <div class="topo-arrow">⇄</div>
                  <div class="topo-node">
                    <strong>Local Ollama</strong>
                    <span>127.0.0.1:11434</span>
                  </div>
                </div>
                <div class="topo-storage-bar">
                  <code>.hyn_agent/</code> — {{ tt('会话 JSON · 双层 Markdown 记忆 · Office 快照 · 影子 Git 引用全本地落盘', '会話履歴 · 2層メモリ · 文書スナップショット · シャドウGit参照をすべてローカル保存', 'Sessions, 2-tier Markdown memory, file snapshots & shadow Git refs stored on local disk') }}
                </div>
              </div>
            </div>
          </div>

          <!-- 拓扑 B：企业内网私有化共享 -->
          <div class="topo-card">
            <div class="topo-head">
              <span class="topo-code">TOPOLOGY B // CORPORATE INTRANET (LAN)</span>
              <span class="stone-badge">{{ tt('数据不出企业内网', '社内閉域網完結', 'Corporate LAN Only') }}</span>
            </div>
            <h3 class="topo-title">{{ tt('企业内网集群模式（私有 vLLM / SGLang / RAGFlow）', '社内閉域網クラスタ共有モデル（社内 vLLM / SGLang / RAGFlow）', 'Corporate Intranet Cluster (Internal vLLM & RAGFlow)') }}</h3>
            <div class="topo-diagram">
              <div class="topo-boundary is-lan">
                <div class="topo-boundary-label">{{ tt('企业防火墙内部局域网 (192.168.x.x / 10.x.x.x · 阻断公网出站)', '社内イントラネット境界 (外部インターネットへのデータ送信ゼロ)', 'Corporate Firewall Boundary (Zero Public Internet Egress)') }}</div>
                <div class="topo-nodes">
                  <div class="topo-node">
                    <strong>Helm Desktop Client</strong>
                    <span>Developer PC (Local Git)</span>
                  </div>
                  <div class="topo-arrow">⇄</div>
                  <div class="topo-node is-accent">
                    <strong>LAN LLM Gateway</strong>
                    <span>vLLM / SGLang / OneAPI</span>
                  </div>
                  <div class="topo-arrow">+</div>
                  <div class="topo-node">
                    <strong>LAN RAGFlow</strong>
                    <span>{{ tt('企业内部规范与设计文档库', '社内規定・設計書RAG', 'Internal Spec RAG') }}</span>
                  </div>
                </div>
                <div class="topo-storage-bar">
                  <code>lan_server</code> — {{ tt('全团队共享企业内网 GPU 算力与知识库，机密代码 100% 留存内网', 'チーム全体で社内GPUリソースと知識ベースを共有し、機密コードは社外へ一切出ない', 'Share on-premise GPU clusters and RAG datasets across the team with zero external exposure') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== SECTION 03: 四大核心工程规格 Bento 矩阵 ==================== -->
    <section class="bento-section">
      <div class="wide-container">
        <div class="sec-header">
          <div class="sec-kicker">SECTION 02 // CORE ENGINEERING SPECIFICATIONS</div>
          <h2 class="sec-title">
            {{ tt(
              '超越薄封装套壳：深入底层状态机与数据契约的硬核实现',
              '単なるAPIラッパーではない：状態マシンとデータ契約に基づく深層アーキテクチャ',
              'Beyond Thin API Wrappers: Deep State-Machine & Data-Contract Engineering'
            ) }}
          </h2>
        </div>

        <div class="bento-grid">
          <div v-for="spec in bentoSpecs" :key="spec.index" class="bento-card">
            <div class="bento-index">{{ spec.index }}</div>
            <h3 class="bento-title">{{ spec.title }}</h3>
            <p class="bento-desc">{{ spec.desc }}</p>

            <div class="bento-code-window">
              <div class="bento-code-head">{{ spec.snippetTitle }}</div>
              <pre class="bento-code-pre"><code>{{ spec.snippet }}</code></pre>
            </div>

            <div class="bento-footer">
              <a class="bento-link" :href="spec.link">
                <span>{{ spec.linkText }}</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== SECTION 04: 企业级能力对比表 ==================== -->
    <section class="matrix-section">
      <div class="wide-container">
        <div class="sec-header">
          <div class="sec-kicker">SECTION 03 // ARCHITECTURAL COMPARISON MATRIX</div>
          <h2 class="sec-title">
            {{ tt('Helm 与常规云端 Coding Agent 的工程能力对比', 'Helm と一般的なクラウド型 Coding Agent のアーキテクチャ比較', 'Helm vs. Conventional Cloud Coding Agents') }}
          </h2>
        </div>

        <div class="matrix-wrap">
          <table class="matrix-table">
            <thead>
              <tr>
                <th>{{ tt('技术评估维度', '技術評価項目', 'Evaluation Dimension') }}</th>
                <th class="is-hyn">Helm ({{ tt('本架构', '本プロダクト', 'This Architecture') }})</th>
                <th>{{ tt('常规云端 Agent / 简单 API 套壳', '一般的なクラウド型 / 簡易エージェント', 'Typical Cloud / Wrapper Agents') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>{{ tt('数据主权与离线能力', 'データ主権とオフライン稼働', 'Data Sovereignty & Offline') }}</strong></td>
                <td class="is-hyn"><strong>{{ tt('100% 本地落盘，原生支持本机 Ollama 与企业内网 vLLM', '100% ローカル保存。Ollama / 社内閉域網 vLLM で完全オフライン稼働', '100% local disk; native offline Ollama & corporate LAN vLLM') }}</strong></td>
                <td>{{ tt('强制经过外部云端中转服务器，难以通过严苛的企业信息安全合规审查', '外部クラウド中継が必須で、企業の情報セキュリティ審査を通過困難', 'Requires external cloud relays; blocked by strict enterprise security') }}</td>
              </tr>
              <tr>
                <td><strong>{{ tt('长任务流式容错与防死循环', '長時間ストリーム耐障害性・ループ防止', 'Long-Horizon Fault Tolerance') }}</strong></td>
                <td class="is-hyn"><strong>{{ tt('TurnHub 单调 seq 断线回放 + stream_reset 重试清洗 + StuckDetector L2 自省', 'TurnHub seq 再接続 + stream_reset 自動破棄・再試行 + StuckDetector L2 ループ検知', 'TurnHub seq replay + stream_reset + StuckDetector L2 retrospective') }}</strong></td>
                <td>{{ tt('刷新窗口或网络抖动即丢失任务，极易在同一报错命令上无限空转', '通信瞬断で処理が失われ、同一エラーコマンドの無限ループに陥りやすい', 'Loses state on hiccups; prone to infinite tool-error loops') }}</td>
              </tr>
              <tr>
                <td><strong>{{ tt('版本快照与回滚机制', 'スナップショットとロールバック', 'Snapshot & Rollback Mechanism') }}</strong></td>
                <td class="is-hyn"><strong>{{ tt('无侵入影子 Git 检查点（临时 GIT_INDEX_FILE + 私有 refs，零工作区污染）', '非侵襲シャドウGitチェックポイント（作業ブランチ・Indexを一切汚さない）', 'Non-invasive Shadow Git Checkpoints (zero pollution to user HEAD/index)') }}</strong></td>
                <td>{{ tt('直接覆盖工作区文件，或产生大量临时 commit 污染用户分支历史', '作業ツリーを直接上書きするか、不要なコミットでブランチ履歴を汚す', 'Overwrites working tree directly or pollutes git commit history') }}</td>
              </tr>
              <tr>
                <td><strong>{{ tt('多智能体并发与权限安全', 'マルチエージェント並列性と権限ゲート', 'Multi-Agent Concurrency & Safety') }}</strong></td>
                <td class="is-hyn"><strong>{{ tt('Git Worktree 物理隔离并发 + 计划批准前强制只读门禁 + 4 档实时权限', 'Git Worktree 物理分離 + 計画承認前の読取専用ゲート + 4段階リアルタイム権限', 'Physical Git Worktree isolation + read-only plan gate + 4-tier live permissions') }}</strong></td>
                <td>{{ tt('多代理共享同一目录互相覆盖，缺乏细粒度写盘门禁', '同一ディレクトリを同時編集して競合破損。細粒度な書込ゲートがない', 'Subagents overwrite each other in shared directories') }}</td>
              </tr>
              <tr>
                <td><strong>{{ tt('大模型 Prefix Cache 保护', 'LLM Prefix Cache ヒット率保護', 'LLM Prefix Cache Preservation') }}</strong></td>
                <td class="is-hyn"><strong>{{ tt('会话级冻结记忆快照 + 后台异步队列提取，Prefix Cache 命中率 94%+', 'セッション凍結メモリスナップショット＋非同期抽出により 94%+ ヒット率維持', 'Session-frozen memory snapshot + async queue keeps 94%+ cache hit rate') }}</strong></td>
                <td>{{ tt('每轮动态改写 System Prompt 记忆区，导致 KV Cache 每轮失效、首字极慢', '毎ターン System Prompt を書き換えるため KV キャッシュが毎回無効化', 'Mutates system prompt every turn, invalidating KV prefix cache') }}</td>
              </tr>
              <tr>
                <td><strong>{{ tt('Office 富文档协同交付', 'Office文書の直接プレビュー・部分編集', 'Office Document Workbench') }}</strong></td>
                <td class="is-hyn"><strong>{{ tt('右侧内建 docx/xlsx/pptx/pdf 工作台 + 鼠标划取 SelectionAnchor 原地热更新', 'docx/xlsx/pptx/pdf ワークベンチ内蔵＋選択範囲のピンポイントSSE更新', 'Built-in docx/xlsx/pptx/pdf workbench + mouse-selection SSE hot-patching') }}</strong></td>
                <td>{{ tt('仅能输出代码文本，改一行 PPT 文字也必须重新生成整个文件', 'テキスト出力のみで、PPTやWordの1箇所を直すにも全体再生成が必要', 'Text-only; requires regenerating the entire file for minor edits') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- ==================== SECTION 05: 致企业招聘负责人与技术面试官 ==================== -->
    <section class="executive-brief-section">
      <div class="wide-container">
        <div class="brief-box">
          <div class="brief-content">
            <div class="sec-kicker">
              {{ tt(
                'SECTION 04 // FOR RECRUITERS & TECHNICAL INTERVIEWERS · 致招聘负责人与技术面试官',
                'SECTION 04 // FOR RECRUITERS & TECHNICAL INTERVIEWERS · 採用ご担当者様・技術面接官の皆様へ',
                'SECTION 04 // FOR RECRUITERS & TECHNICAL INTERVIEWERS'
              ) }}
            </div>
            <h3 class="brief-title">
              {{ tt(
                '关于独立产品形态发布、办公电脑免安装审阅与技术面试源码走读的说明',
                '独立プロダクトとしての配布形態、社用PCでのブラウザ検証、および面接時の全ソースコード解説について',
                'On Standalone Distribution, Zero-Install Review, and Live Source Walkthroughs in Interviews'
              ) }}
            </h3>
            <p class="brief-text">
              {{ tt(
                '1. 为什么搭建本官网与架构白皮书：Helm 作为完整的桌面端独立产品进行打包分发，目前暂未直接公开源码仓库。为了让技术面试官在不安装客户端的前提下即可深入评估本项目的工程含金量，本站在「工程架构白皮书」中完整公开了双进程架构、P0–P3 状态机、影子检查点、Git Worktree 团队与双层记忆的源码级设计。\n2. 面试现场 Live Demo 与完整源码审阅：在远程视频面试（Zoom / Teams / Google Meet）中，我随时准备通过屏幕共享为您现场演示物理断网下的实机运行，并在 IDE 中直接打开前端（Electron + Vue 3）与后端（FastAPI + 86 项单元测试）完整源码进行逐模块讲解。',
                '1. 技術白書とWebサンドボックスの公開理由：Helm は完成されたデスクトップ製品として無料配布しており、現時点ではリポジトリ全体の一般公開を控えております。社用PCのセキュリティ制限により .exe の実行が難しい採用ご担当者様・技術面接官の皆様にも、ブラウザ上の「対話型ワークベンチ」と全5章の「技術アーキテクチャ白書」を通じて、内部設計の深さをそのまま検証いただけるよう構成しました。\n2. 面接での実機ライブデモ＆全ソースコード開示：オンライン面接（Zoom / Teams / Google Meet）の場におきましては、画面共有による完全オフライン環境での実機デモンストレーション、および IDE 上でのフロントエンド（Electron + Vue 3）・バックエンド（FastAPI + 単体テスト86件）全ソースコードのライブ解説を実演いたします。',
                '1. Why an Architecture Whitepaper & Web Sandbox: Helm is packaged as a standalone desktop product. So technical reviewers on locked-down corporate PCs can evaluate its full engineering depth without installing an .exe, this site provides a 1:1 Interactive Workbench and a 5-part Whitepaper detailing our state machines and data contracts.\n2. Live Demo & Full IDE Source Walkthrough: During remote interviews (Zoom / Teams / Meet), I am ready to share my screen for a live offline demonstration and walk through the entire Electron + Vue 3 + FastAPI codebase and 86+ unit tests in my IDE.'
              ) }}
            </p>
          </div>
          <div class="brief-actions">
            <a class="stone-btn is-primary" :href="`${prefix}/architecture/overview`">
              {{ tt('审阅 5 篇工程架构白皮书 →', '技術アーキテクチャ白書 (全5章) へ →', 'Read 5-Part Whitepaper →') }}
            </a>
            <a class="stone-btn" :href="`${prefix}/demo`">
              {{ tt('打开全屏交互沙盒 (/demo)', '全画面ワークベンチを開く (/demo)', 'Open Fullscreen Sandbox (/demo)') }}
            </a>
            <a class="stone-btn" :href="`${prefix}/download`">
              {{ tt('查看安装包与 SHA-256 校验', 'ダウンロード・SHA-256検証へ', 'Download & SHA-256 Checksums') }}
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.jp-enterprise-home {
  background: #ffffff;
  color: var(--text-primary);
}

.wide-container {
  max-width: 1320px;
  margin: 0 auto;
}

/* HERO 舞台区 */
.hero-stage {
  background: var(--bg-app);
  border-bottom: 1px solid var(--border-subtle);
  padding: 44px 24px 56px;
}

.hero-meta-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  font-family: var(--font-mono);
  font-size: 11.5px;
  margin-bottom: 18px;
}

.hero-code-tag {
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.06em;
}

.hero-sep {
  color: var(--border-strong);
}

.hero-code-sub {
  color: var(--text-tertiary);
}

.hero-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  font-weight: 650;
  color: var(--status-success);
}

.hero-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--status-success);
}

.hero-brand-banner {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 14px 18px;
  margin-bottom: 20px;
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-left: 3px solid var(--accent);
  border-radius: 6px;
  max-width: 1020px;
}

.hero-emblem-wrap {
  width: 58px;
  height: 58px;
  border-radius: 12px;
  overflow: hidden;
  flex: none;
  border: 1px solid #1e293b;
  background: #121722;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.14);
}

.hero-emblem-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hero-brand-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero-brand-title-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-brand-name {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: var(--text-primary);
}

.hero-brand-slogan-en {
  font-family: var(--font-mono);
  font-size: 13.5px;
  font-weight: 700;
  color: var(--accent);
}

.hero-brand-slogan-local {
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-secondary);
}

.hero-headline {
  margin: 0 0 16px;
  font-size: 34px;
  font-weight: 750;
  line-height: 1.28;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  max-width: 1080px;
}

.hero-lead {
  margin: 0 0 26px;
  font-size: 15px;
  line-height: 1.75;
  color: var(--text-secondary);
  max-width: 1020px;
}

.hero-actions-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.hero-cta-primary {
  height: 44px;
  padding: 0 20px;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 1px;
  line-height: 1.15;
}

.hero-cta-sub {
  font-size: 10.5px;
  font-weight: 400;
  opacity: 0.85;
}

.hero-cta-secondary {
  height: 44px;
  padding: 0 18px;
  font-size: 13.5px;
}

.hero-mode-toggle {
  margin-left: auto;
  display: inline-flex;
  padding: 3px;
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
}

.mode-btn {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.mode-btn.is-active {
  background: var(--bg-selected);
  color: var(--accent);
  font-weight: 650;
}

.hero-video-box {
  background: #ffffff;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.hero-video-player {
  display: block;
  width: 100%;
  max-height: 600px;
  background: #1a1d27;
}

.hero-video-placeholder {
  padding: 64px 24px;
  text-align: center;
}

.hero-video-placeholder h3 {
  margin: 14px 0 8px;
  font-size: 18px;
}

.hero-video-placeholder p {
  max-width: 640px;
  margin: 0 auto 20px;
  font-size: 13.5px;
  color: var(--text-secondary);
  line-height: 1.65;
}

/* SECTION 01: 建筑感四栏定量指标带 */
.metrics-strip {
  background: #ffffff;
  border-bottom: 1px solid var(--border-subtle);
  padding: 0 24px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-left: 1px solid var(--border-subtle);
  border-right: 1px solid var(--border-subtle);
}

.metric-cell {
  padding: 28px 24px;
  border-right: 1px solid var(--border-subtle);
}

.metric-cell:last-child {
  border-right: none;
}

.metric-unit {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--text-tertiary);
}

.metric-num {
  margin: 6px 0 4px;
  font-family: var(--font-mono);
  font-size: 30px;
  font-weight: 750;
  color: var(--accent);
  letter-spacing: -0.02em;
}

.metric-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.metric-desc {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-secondary);
}

/* 通用章节标题 */
.sec-header {
  margin-bottom: 32px;
}

.sec-kicker {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--accent);
  margin-bottom: 8px;
}

.sec-title {
  margin: 0 0 10px;
  font-size: 25px;
  font-weight: 750;
  letter-spacing: -0.01em;
  line-height: 1.35;
}

.sec-sub {
  margin: 0;
  max-width: 880px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-secondary);
}

/* SECTION 02: 部署拓扑图解 */
.topology-section {
  padding: 60px 24px;
  background: var(--bg-hover);
  border-bottom: 1px solid var(--border-subtle);
}

.topology-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.topo-card {
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 24px;
}

.topo-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.topo-code {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-tertiary);
}

.topo-title {
  margin: 0 0 16px;
  font-size: 16.5px;
  font-weight: 700;
}

.topo-boundary {
  border: 1.5px dashed var(--status-success);
  background: #f9fcfa;
  border-radius: var(--radius-sm);
  padding: 16px;
}

.topo-boundary.is-lan {
  border-color: var(--accent);
  background: #f7fafe;
}

.topo-boundary-label {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 14px;
}

.topo-nodes {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.topo-node {
  flex: 1;
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  text-align: center;
}

.topo-node.is-accent {
  border-color: var(--accent);
  background: var(--bg-selected);
}

.topo-node strong {
  display: block;
  font-size: 12.5px;
  color: var(--text-primary);
}

.topo-node span {
  display: block;
  margin-top: 2px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-tertiary);
}

.topo-arrow {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--accent);
}

.topo-storage-bar {
  margin-top: 12px;
  padding: 8px 10px;
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  font-size: 11.5px;
  color: var(--text-secondary);
}

/* SECTION 03: Bento 工程规格矩阵 */
.bento-section {
  padding: 60px 24px;
  background: #ffffff;
  border-bottom: 1px solid var(--border-subtle);
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.bento-card {
  padding: 28px;
  background: #ffffff;
  border-right: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
}

.bento-card:nth-child(2n) {
  border-right: none;
}

.bento-card:nth-last-child(-n+2) {
  border-bottom: none;
}

.bento-index {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--accent);
  margin-bottom: 8px;
}

.bento-title {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.bento-desc {
  margin: 0 0 16px;
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.bento-code-window {
  margin-top: auto;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  background: var(--bg-code);
  overflow: hidden;
}

.bento-code-head {
  padding: 6px 12px;
  background: var(--bg-app);
  border-bottom: 1px solid var(--border-subtle);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-tertiary);
}

.bento-code-pre {
  margin: 0;
  padding: 12px;
  font-family: var(--font-mono);
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--text-primary);
  overflow-x: auto;
}

.bento-footer {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border-subtle);
}

.bento-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 650;
  color: var(--accent);
  text-decoration: none;
}

.bento-link:hover {
  text-decoration: underline;
}

/* SECTION 04: 对比表 */
.matrix-section {
  padding: 60px 24px;
  background: var(--bg-hover);
  border-bottom: 1px solid var(--border-subtle);
}

.matrix-wrap {
  overflow-x: auto;
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  font-size: 13.5px;
}

.matrix-table th,
.matrix-table td {
  padding: 14px 18px;
  border: 1px solid var(--border-subtle);
  text-align: left;
  line-height: 1.6;
}

.matrix-table th {
  background: var(--bg-app);
  font-weight: 700;
}

.matrix-table .is-hyn {
  background: var(--bg-selected);
}

/* SECTION 05: 面试官简报卡 */
.executive-brief-section {
  padding: 56px 24px 72px;
  background: #ffffff;
}

.brief-box {
  padding: 32px;
  background: var(--bg-app);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 32px;
  flex-wrap: wrap;
}

.brief-content {
  flex: 1;
  min-width: 320px;
}

.brief-title {
  margin: 6px 0 12px;
  font-size: 20px;
  font-weight: 750;
}

.brief-text {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.75;
  color: var(--text-secondary);
  white-space: pre-line;
}

.brief-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 250px;
}

@media (max-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .topology-grid,
  .bento-grid {
    grid-template-columns: 1fr;
  }
  .bento-card {
    border-right: none;
    border-bottom: 1px solid var(--border-subtle) !important;
  }
}

@media (max-width: 640px) {
  .hero-headline {
    font-size: 24px;
  }
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  .topo-nodes {
    flex-direction: column;
  }
}
</style>
