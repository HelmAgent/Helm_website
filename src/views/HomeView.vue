<script setup>
/**
 * HomeView.vue — Antigravity × Apple 极昼旗舰产品首页（7 章节呼吸感架构）
 *
 * 视觉与交互契约：
 * 1. 遵循 60-30-10 配色纪律（纯白画布 `--hl-bg` + 苹果冷灰 `--hl-surface-alt` + 单章节曜石深色剧场 `--hl-pro-bg`）。
 * 2. 全胶囊按钮几何（Pill Geometry），将版本号、体积、VirusTotal 0/57 与 SHA-256 剥离至静谧校验条。
 * 3. 通过 Bento 右下角圆形 `+` 触发 `BentoSheetModal` 抽屉，兼顾首屏留白与全量硬核实证数据。
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  SITE_META,
  tt,
  getLangPrefix,
  getArchitectureChapters
} from '../data/siteData.js'
import { useAppRouter } from '../router.js'
import ProductPlayground from '../components/ProductPlayground.vue'
import BentoSheetModal from '../components/BentoSheetModal.vue'

const { currentLang, navigate, openAuditModal } = useAppRouter()

const showcaseTab = ref('video')
const videoLoadError = ref(false)
const videoPlayerRef = ref(null)
const playbackRate = ref(1)
const activeFeatureIdx = ref(0)
const activeBentoSheet = ref('')
const showAllCompareRows = ref(false)
const copiedKey = ref('')

// 首屏交互式微罗盘引力场（Azimuth Compass Vector Field）
const azimuthCanvasRef = ref(null)
let animFrameId = 0
let removeCanvasListeners = null

const prefix = computed(() => getLangPrefix(currentLang.value))
const archChapters = computed(() => getArchitectureChapters(currentLang.value))

function t(zh, ja, en) {
  return tt(currentLang.value, zh, ja, en)
}

async function copyText(key, text) {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      copiedKey.value = key
      setTimeout(() => {
        if (copiedKey.value === key) copiedKey.value = ''
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

function openInteractiveStage() {
  showcaseTab.value = 'interactive'
  if (typeof document !== 'undefined') {
    const el = document.getElementById('hero-stage')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

// 首屏实机录屏三段导读
const videoHighlights = computed(() => [
  {
    step: '01',
    title: t('一句话零干预工程拆解', '1文からの自律設計・構築', 'Single-Prompt Engineering Plan'),
    desc: t(
      '仅输入「帮我制作一个记账软件」，自主完成目录规划、账目持久化与现代 UI 编写。',
      '「家計簿ソフトを作って」の1文だけで、設計・データ永続化・UI構築を自律完遂。',
      'From a single sentence, Helm plans project structure, persistence, and clean UI.'
    )
  },
  {
    step: '02',
    title: t('7 分 35 秒连续自检闭环', '7分35秒の自己検証ループ', '7m 35s Self-Verifying Loop'),
    desc: t(
      '高密度串联文件读写、依赖安装与终端验证，遇到运行细节自动自检修复，零人工中断。',
      'ファイル操作・依存解決・コマンド検証を連続実行し、問題も自己修正して完走。',
      'Chains file edits, dependency checks, and shell tests with automatic self-correction.'
    )
  },
  {
    step: '03',
    title: t('编码完成后直接本机拉起成品', '完了後にローカルで即時起動', 'Verified Local App Launch'),
    desc: t(
      '拒绝无法跑通的代码片段演示——完成后直接在本机启动服务并打开可交互记账软件。',
      'コード断片だけでなく、構築完了後にローカルで実際のアプリを起動して動作実証。',
      'Goes beyond raw snippets—launches and opens the working app locally upon completion.'
    )
  }
])

// 第 3 章：Apple Pro 曜石深色剧场 — 五大核心状态机引擎
const featurePillars = computed(() => [
  {
    id: 'privacy',
    code: 'ENGINE 01 · ZERO-TRUST, DPAPI VAULT & SYSTEM DOCTOR',
    shortTab: t('01. 离线安全与自愈诊断', '01. 完全オフライン＆自動修復', '01. Zero-Trust & Doctor'),
    title: t(
      '全本地/内网三级架构、Windows DPAPI 金库与免管理员自愈',
      '完全オフライン＆社内LAN 3層構造・DPAPI暗号化金庫＆自動修復',
      'Air-Gapped Local/LAN Topology, Windows DPAPI Vault & System Doctor'
    ),
    desc: t(
      '将模型严格划分为 local（Ollama）、lan（企业内网 vLLM/OneAPI）与 cloud 三级。内置纯 ASGI 反 DNS 重绑定鉴权、Windows DPAPI 系统级密钥加密，以及免管理员自愈便携版 Git / Node / uvx 的 System Doctor。',
      'モデル接続を local・lan・cloud の3階層に分離。純粋ASGIによるDNSリバインディング防御、Windows DPAPI 暗号化保管庫、管理者不要で Git/Node/uvx を自動修復する System Doctor を統合。',
      'Separates local, corporate LAN, and cloud tiers. Unites pure-ASGI anti-DNS-rebinding auth, OS-level Windows DPAPI secret encryption, and zero-admin System Doctor toolchain auto-repair.'
    ),
    highlights: [
      t('拔除网线即可在 127.0.0.1 闭环运行；纯 ASGI 鉴权严格剥离预览子框架令牌', 'LAN抜線の完全オフライン稼働に対応；プレビュー子フレームへのトークン注入を遮断', 'Full 127.0.0.1 air-gapped execution; strips X-HYN-Token from preview subframes'),
      t('Windows DPAPI 硬件账户级加密 API Key 与 MCP OAuth 凭证，日志写盘前自动脱敏', 'Windows DPAPI で API キーと OAuth 資格情報を暗号化し、ログ書込前に自動マスク', 'Windows DPAPI CryptProtectData vault for API & OAuth keys + pre-write log scrubbing'),
      t('System Doctor 免管理员一键修复缺失工具链，跨 3 大协议自适应编译 Schema', '管理者権限不要で不足ツールを自動構築し、3大LLMプロトコル向けにSchemaを変換', 'Zero-admin 1-click portable MinGit/Node/uvx repair + 3-protocol schema compiler')
    ],
    visualNodes: [
      { tag: 'TIER 1 & 2 · LAN', name: 'Ollama & Corporate vLLM', addr: '127.0.0.1 / 192.168.x.x', status: t('机密零出网', '閉域網完結', 'Zero Egress') },
      { tag: 'OS CRYPTO VAULT', name: 'Windows DPAPI SecretBox', addr: 'CryptProtectData · SubFrame', status: t('系统级加密', 'OS暗号保護', 'OS-Bound') },
      { tag: 'SELF-HEALING', name: 'System Doctor Sandboxed', addr: 'MinGit · Node v22 · uvx', status: t('免提权自愈', '自動環境構築', 'Zero-Admin') }
    ],
    snippetTitle: 'app/core/local_auth.py & secret_box.py',
    snippet: `# Pure-ASGI anti-DNS-rebinding + constant-time token verify
if host not in _LOOPBACK_HOSTS or not secrets.compare_digest(token, expected):
    return await send_403(send)
# OS-level Windows DPAPI encryption for API keys & MCP OAuth tokens
cipher_blob = win32_crypt_protect_data(plaintext_secret.encode("utf-8"))`,
    docLink: `${prefix.value}/architecture/overview`,
    docLabel: t('阅读第 1 卷：双进程与 DPAPI 架构', '第1章：デュアルプロセス基盤を読む', 'Read Vol. 01: Dual-Process & DPAPI')
  },
  {
    id: 'longrun',
    code: 'ENGINE 02 · 3-PATH PARALLELISM, SHADOW GIT & D1–D7 GUARD',
    shortTab: t('02. 三路并发与长程引擎', '02. 3経路並列＆自律制御', '02. 3-Path & Long-Horizon'),
    title: t(
      '零框架三路保序并发、确定性代码导航与无侵入影子 Git 检查点',
      'ゼロフレームワーク3経路並列・高速コード探索＆非侵襲シャドウGit',
      'Zero-Framework 3-Path Read Concurrency, Code Navigation & Shadow Git'
    ),
    desc: t(
      '纯自研 5,227 行异步状态机将连续只读工具、MCP 与探索子代理合并保序并发。配合随包 ripgrep（42.1× 提速）、tree-sitter 大纲、StuckDetector D1–D7 护栏与私有影子检查点，斩获 SWE-bench Mini 84.0% 峰值解决率。',
      '独自実装 5,227行の非同期ループが読取ツール・MCP・探索サブエージェントを順序維持並列実行。ripgrep（42.1倍高速）、tree-sitter、D1–D7 ループ防止、シャドウGitにより SWE-bench 84.0% を実証。',
      'Custom 5,227-LOC async state machine batches read tools, MCP calls, and explore subagents concurrently. Paired with 42.1× ripgrep, tree-sitter AST, D1–D7 loop guard, and Shadow Git.'
    ),
    highlights: [
      t('SWE-bench Verified Mini 实测 98.0%（49/50）Gold 文件定位率，100/100 零空补丁', 'SWE-bench Verified Mini で 98.0%（49/50）の正解特定率、100/100 空パッチゼロ', '98.0% (49/50) Gold File localization and 100% (100/100) valid non-empty patches'),
      t('D1–D7 七维死循环检测 -> L1–L4 渐进介入（拦截率 100%，省 87.7% 无效步数）', 'D1–D7 ループ検知（阻止率 100%・無駄ステップ -87.7%）＋ G1–G4 完了ゲート', 'D1–D7 loop guard (100% recall, -87.7% wasted steps) + CompletionGate DoD'),
      t('临时 GIT_INDEX_FILE 写入 refs/hyn/checkpoints/，用户分支零污染；写后 37ms 语法自检', '一時インデックスで専用refへ保存しブランチ汚染ゼロ；編集後37ms構文検査', 'Zero-pollution Shadow Git refs + 37ms post-edit syntax check (0.0% FP)')
    ],
    visualNodes: [
      { tag: '3-PATH PARALLEL', name: 'Read Tools + MCP + Explore', addr: 'Order-Preserving gather()', status: t('保序并发归并', '順序維持並列', 'Concurrent Read') },
      { tag: 'CODE NAVIGATION', name: 'ripgrep 15.2 + tree-sitter', addr: '119ms P50 · -95.4% Tokens', status: t('42× 检索 · 98%定位', '42倍高速 · 98%特定', '42× Search') },
      { tag: 'SHADOW & GUARD', name: 'refs/hyn/checkpoints + D1–D7', addr: '100/100 Valid Patches', status: t('零污染 · 零死循环', '汚染ゼロ', 'Zero Dirty Git') }
    ],
    snippetTitle: 'app/services/git_checkpoints.py',
    snippet: `GIT_INDEX_FILE=<temp_index> git add -A
tree=$(GIT_INDEX_FILE=<temp_index> git write-tree)
commit=$(git commit-tree $tree -p $parent -m "hyn checkpoint")
# Write to private namespace; user HEAD & index remain 100% untouched
git update-ref refs/hyn/checkpoints/<session_id> $commit`,
    docLink: `${prefix.value}/architecture/long-running`,
    docLabel: t('阅读第 2 卷：长程自治引擎', '第2章：長時間自律エンジンを読む', 'Read Vol. 02: Long-Horizon Engine')
  },
  {
    id: 'team',
    code: 'ENGINE 03 · DAG WORKTREE TEAM & MULTI-AGENT COMPARE',
    shortTab: t('03. Worktree 团队与赛马对比', '03. Worktree 並列＆比較統合', '03. Worktree Team & Compare'),
    title: t(
      '最多 8 队友 DAG 协同、零拷贝 Worktree 隔离与多方案并行赛马',
      '最大8メイトDAG協働・ゼロコピー Worktree 分離＆並列比較マージ',
      '8-Teammate Task DAG, Zero-Copy Worktrees & Multi-Agent Compare'
    ),
    desc: t(
      '主代理通过 Task DAG 统筹 1–8 名常驻队友。每名队友绑定独立 .worktrees/<name> 并通过 Windows Junction 零拷贝共享巨型依赖；支持 compare_group 多方案同题竞技与 3-way 安全合入，并发加速 2.88×–3.04×。',
      'リードが Task DAG で最大8名の常駐メイトを統括。独立 .worktrees/<name> と Windows Junction により依存関係をゼロコピー共有し、並列比較と 3-way マージで 2.88×〜3.04× 高速化。',
      'Lead orchestrates 1–8 resident teammates via Task DAG on isolated .worktrees/<name> with zero-copy Windows Junctions, parallel compare_group evaluation, and 3-way merge (3.04× speedup).'
    ),
    highlights: [
      t('Windows CreateJunction 零磁盘拷贝共享 node_modules/.venv，毫秒级拉起独立工作树', 'Windows Junction で node_modules/.venv をコピーせず共有し瞬時に起動', 'Zero-copy Windows Directory Junctions share node_modules/.venv instantaneously'),
      t('分级唤醒信箱（200K 无人值守预算熔断）+ 计划获批前物理剥离全部写盘工具', '優先度別受信箱（200K 無人上限）＋ 計画承認前の変更ツール物理除外', 'Classified wake inbox (200K unattended cap) + physical _MUTATING plan gate'),
      t('compare_group 多方案同题赛马对比，配合 pre_apply 快照支持一键无损撤销', '複数案の差分を並列比較し、pre_apply スナップショットでいつでも復元可能', 'Multi-agent compare_group diff review + 1-click undo via pre_apply Git refs')
    ],
    visualNodes: [
      { tag: 'TASK DAG & LEAD', name: 'Atomic create_tasks + Plan Gate', addr: '1–8 Resident Mates', status: t('拓扑自动解锁', 'DAG依存解決', 'DAG Unblock') },
      { tag: 'ZERO-COPY WT', name: '.worktrees/mate-* + Junction', addr: '2.88×–3.04× Speedup', status: t('0% 并发写冲突', '書込競合 0%', '0% Collision') },
      { tag: 'COMPARE & MERGE', name: 'compare_group + 3-Way Apply', addr: 'refs/hyn/worktrees/*', status: t('多方案赛马优选', '並列比較統合', '3-Way Pick') }
    ],
    snippetTitle: 'app/services/team_runtime.py',
    snippet: `_MUTATING = {"write_file", "edit_file", "apply_patch",
             "write_docx", "edit_document", "run_powershell"}
# Physically strip all mutating tools until implementation plan is approved
if mate.require_plan and not mate.plan_approved:
    allowed_tools = _WORKSPACE - _MUTATING`,
    docLink: `${prefix.value}/architecture/multi-agent-team`,
    docLabel: t('阅读第 3 卷：智能体团队与 Worktree', '第3章：DAGチーム・Worktreeを読む', 'Read Vol. 03: Agent Team & Worktree')
  },
  {
    id: 'memory',
    code: 'ENGINE 04 · 4-LAYER CACHE, 7-STAGE COMPACT & RAGFLOW',
    shortTab: t('04. 四层缓存与异构 RAG', '04. 4層キャッシュ＆高精度RAG', '04. 4-Layer Cache & RAG'),
    title: t(
      '四层只增前缀缓存、7 级保真裁剪、BM25 记忆与 4 阶段异构 RAG',
      '4層追記型キャッシュ・7段階圧縮・BM25記憶＆4段階異種RAG',
      '4-Layer Prefix Cache, 7-Stage Compactor, BM25 Memory & 4-Stage RAG'
    ),
    desc: t(
      '将上下文切分为 L1–L4 四层只增前缀并用 SHA-256 逐层诊断，SWE-bench 1.2 亿+ Token 实测达成 97.74% 缓存命中（单题 ¥0.27）。配合 7 级缓存经济学裁剪（100% 保留末尾堆栈）与 100% 召回异构 RAG。',
      'L1–L4 追記型プレフィックスと SHA-256 診断により SWE-bench 実戦で 97.74% ヒット率を達成。7段階キャッシュ経済性圧縮（末尾トレース 100% 維持）と完全正解率 100% の4段階RAGを統合。',
      'Enforces L1–L4 append-only prefixes with SHA-256 diagnostics—hitting 97.74% cache rate across 120M+ tokens (¥0.27/fix). Pairs 7-stage compaction with 100%-recall 4-stage RAG.'
    ),
    highlights: [
      t('precache-v1 双轨 160 次真实 API 实测：热态命中 89.58%，意外断层 25→0，计费省 57.27%', 'precache-v1 実API 160回検証：ウォーム 89.58%、キャッシュ破壊 25→0、課金 -57.27%', 'precache-v1 (160 live calls): 89.58% warm hit, unexpected breaks 25→0, -57.27% cost'),
      t('仅当未来 6 轮缓存收益大于重建成本时才触发去重；60/40 头尾裁剪 100% 保住异常堆栈', 'キャッシュ経済性式に基づき遅延重複排除；60/40 圧縮で末尾スタックトレースを 100% 保持', 'KV-economics delayed dedup + 60/40 preview retaining 100% of tail tracebacks'),
      t('异构知识库 v0→v3 四阶段消融：双栏财报与修订合同完整命中率 36.7% → 100.0%', '2段組PDF・改訂契約書の4段階RAG検証：完全正解率 36.7% → 100.0%、MRR 1.000', '4-stage RAG ablation (v0→v3): lifts strict recall from 36.7% to 100.0% (MRR 1.000)')
    ],
    visualNodes: [
      { tag: 'PREFIX POLICY', name: 'L1–L4 SHA-256 Guard', addr: '97.74% Live · 0 Breaks', status: t('单题仅 ¥0.27', '1問 ¥0.27', '¥0.27 / Bug') },
      { tag: '7-STAGE COMPACT', name: '60/40 Preview + Econ Dedup', addr: '-93.1% Size · 100% Trace', status: t('堆栈零丢失', 'トレース100%', '100% Trace') },
      { tag: 'HYBRID RAG v3', name: 'Layout + Breadcrumb + Rerank', addr: 'Recall 100% · MRR 1.000', status: t('零噪声污染', 'ノイズ 0%', '0% Noise') }
    ],
    snippetTitle: 'app/services/context_compact.py',
    snippet: `# Only deduplicate repeated file reads when 6-turn cache savings beat rebuild cost
future_savings = delta_tokens_saved * 6 * CACHE_READ_RATE   # 0.10x
rebuild_penalty = invalidated_suffix_tokens * REBUILD_COST  # 0.90x
if future_savings > rebuild_penalty:
    apply_stale_read_dedup(messages)`,
    docLink: `${prefix.value}/architecture/memory-and-rag`,
    docLabel: t('阅读第 4 卷：前缀缓存与异构 RAG', '第4章：4層キャッシュ・RAGを読む', 'Read Vol. 04: Prefix Cache & RAG')
  },
  {
    id: 'workbench',
    code: 'ENGINE 05 · DUAL WORKBENCH, PLAN MODE & MCP OAUTH',
    shortTab: t('05. 双模工作台与 MCP 生态', '05. Office編集＆MCP拡張', '05. Workbench, Plan & MCP'),
    title: t(
      '双模高保真文档工作台、零缓存抖动 Plan Mode 与 MCP OAuth 生态',
      'デュアルモード Office ワークベンチ・Plan Mode ＆ MCP OAuth',
      'Dual-Mode Office Workbench, Prefix-Safe Plan Mode & MCP OAuth'
    ),
    desc: t(
      '右侧工作台无缝切换「运行观测舱」与「7 格式原生编辑舱（docx/xlsx/pptx/pdf/md/html/Diff）」，支持鼠标划词 SelectionAnchor 手术刀级热补丁；内置零缓存失效 Plan Mode、<1ms 技能预载与 MCP OAuth 2.0。',
      '右ペインで「稼働監視」と「7形式ネイティブ編集（SelectionAnchor 部分更新）」を切替。キャッシュを壊さない Plan Mode、<1ms スキル読込、MCP OAuth 2.0 を統合。',
      'Switches seamlessly between Live Telemetry and 7 native editors with SelectionAnchor SSE hot-patching, paired with prefix-safe Plan Mode, <1ms skill preload, and MCP OAuth 2.0.'
    ),
    highlights: [
      t('Office 微基准 20/20 全通，GAIA Validation 30 题多步实测 90.0%（L2 达 100%）', 'Office 微小ベンチ 20/20 合格、GAIA Validation 30問実測 90.0%（L2 100%）', '20/20 Office surgical patch microbench & 90.0% (27/30) on GAIA Validation'),
      t('5 档权限 + 受保护路径硬门禁（30/30 攻击 100% 拦截）；Plan Mode 切换零前缀失效', '5段階権限＋保護パス強制確認（攻撃阻止 30/30）；Plan Mode 切替時キャッシュ維持', '5 permission tiers + Protected Path Guard (30/30 block); zero-churn Plan Mode'),
      t('<1ms 三语 BM25 零 RTT 技能直注，全协议 MCP OAuth 2.0 + 30 工具上限防上下文膨胀', '<1ms 3言語 BM25 で 1 RTT 削減、MCP OAuth 2.0 と最大30ツール制限を実装', '<1ms trilingual BM25 saves 1 RTT; full MCP OAuth 2.0 + 30-tool cap')
    ],
    visualNodes: [
      { tag: 'SURGICAL OFFICE', name: '7 Native Editors + Diff Bar', addr: '20/20 Office · 90% GAIA', status: t('划词原地热更新', '選択即時更新', 'Live Hot-Patch') },
      { tag: 'INTENT & PLAN', name: 'Plan Mode + <1ms BM25 Enrich', addr: '0.67ms P50 · Zero-RTT', status: t('零缓存抖动对齐', 'キャッシュ維持', 'Prefix-Safe') },
      { tag: 'ECOSYSTEM', name: 'MCP OAuth 2.0 + Hooks + Cron', addr: 'stdio / SSE / HTTP', status: t('SHA-256 门禁', '署名検証済', 'Trust Gate') }
    ],
    snippetTitle: 'SelectionAnchor & TurnEnricher',
    snippet: `{
  "locator": { "type": "pptx_shape", "slide_index": 2, "shape_id": 104 },
  "intent_enricher": { "slash_skill": "Zero-RTT L4 Preload", "bm25_p50": "0.67ms" },
  "mcp_runtime": { "auth": "RFC8252 Loopback OAuth2 + DPAPI", "cap": 30 }
}`,
    docLink: `${prefix.value}/architecture/intent-and-ecosystem`,
    docLabel: t('阅读第 5 & 6 卷：工作台与 MCP 生态', '第5・6章：ワークベンチ＆MCPを読む', 'Read Vol. 05 & 06: Workbench & MCP')
  }
])

const activeFeature = computed(() => featurePillars.value[activeFeatureIdx.value])

// 第 4 章：极简 1px 细线选型与工程对比（前 3 项直面核心选型拷问，后 4 项按需展开底层架构）
const comparisonRows = computed(() => [
  {
    core: true,
    dim: t('细分行业痛点共创', '業界特化ワークフロー共創', 'Vertical Workflow Co-Creation'),
    helm: t(
      '你提痛点，我免费写进下一版内置功能；高票行业共性需求公开排期，紧急私密需求支持一对一定制',
      'ユーザーの業務課題を無償で次期標準機能として実装。緊急・非公開の個別要件もカスタム対応',
      'High-vote industry pain points built into official releases for free; private custom workflows on demand'
    ),
    other: t(
      'Codex 等大厂只做全球通用标准化底座，财务、运营、科研、制造等细分岗位诉求难以被响应',
      '汎用クラウドツールは標準機能のみで、特定業界・現場固有の業務フロー要望には対応しない',
      'Big-tech cloud tools build generic horizontal primitives and never tailor for niche industry workflows'
    )
  },
  {
    core: true,
    dim: t('数据主权与推理成本', 'データ主権と推論コスト', 'Data Sovereignty & Cost'),
    helm: t(
      'Windows .exe 开箱即用（内嵌 Python 3.13），100% 支持本机 Ollama 与内网 vLLM；平价模型单题修复仅 ¥0.27',
      'Python 3.13 内蔵 .exe で即稼働。ローカル Ollama / 社内LAN直結に対応し、1課題解決わずか ¥0.27',
      'Turnkey Windows .exe (bundled Python 3.13); 100% local Ollama & LAN vLLM ready at ¥0.27 per solved bug'
    ),
    other: t(
      '强制上传海外云端服务器，依赖高昂美元月费订阅与高价闭源模型（单题成本常达 ¥5–¥18+）',
      '海外クラウド送信必須・高額なドル建てサブスクと高価なモデルに依存（1問 ¥5〜¥18+）',
      'Requires uploading source code to external clouds plus $20–$200/mo subscriptions ($0.80–$2.50+/task)'
    )
  },
  {
    core: true,
    dim: t('同屏可视化文档与回滚', '同画面Office編集＆復元', 'Visual Office & Shadow Git'),
    helm: t(
      '右侧内建 7 格式高保真预览，鼠标框选 PPT 形状或 Word 段落原地热更新；私有影子 Git 检查点零分支污染',
      '右ペインで PPT 図形や Word 段落をマウス選択して即時部分更新。非侵襲シャドウGitで履歴汚染ゼロ',
      'Highlight PPT shapes or Word paragraphs on the right canvas for live SSE hot-patching + zero-dirty Shadow Git'
    ),
    other: t(
      '黑盒命令行盲写脚本，极易改坏整篇排版格式，或产生大量临时提交污染用户 git status',
      'レイアウトが見えないCUIスクリプト処理で書式が崩れやすく、不要コミットで履歴も汚れやすい',
      'Blind CLI script generation often breaks document layouts or pollutes user Git commit history'
    )
  },
  {
    core: false,
    dim: t('代码定位与补丁完整性', 'コード特定精度とパッチ品質', 'Code Localization & Integrity'),
    helm: t(
      'SWE-bench Mini 峰值 84.0%（均值 81.0%），ripgrep 42× + AST 大纲达成 98% Gold 定位与 100% 非空补丁',
      'SWE-bench 最高 84.0%（平均 81.0%）、Gold特定率 98.0%、100/100 有効非空パッチを達成',
      '84.0% SWE-bench Mini peak (81.0% mean), 98.0% Gold file localization, 100/100 valid patches'
    ),
    other: t(
      '缺乏整行续读对齐与 AST 符号骨架，千行大文件易因截断盲区或步数耗尽产生空补丁',
      '行境界維持やAST抽出がなく、大型ファイルの切り捨てやステップ枯渇で空パッチが発生',
      'Lacks line-aligned pagination and AST outlines; prone to truncation blind spots and empty patches'
    )
  },
  {
    core: false,
    dim: t('长任务防死循环与容错', '長時間耐障害性・ループ防止', 'Long-Run Fault Tolerance'),
    helm: t(
      'TurnHub 单调 seq 断线无缝回放 + 写后 37ms 进程内语法门禁 + StuckDetector D1–D7（拦截率 100%）',
      'TurnHub seq 再接続 + 編集後 37ms 構文検査 + StuckDetector D1–D7（ループ阻止 100%）',
      'TurnHub seq replay + 37ms post-edit syntax guard + StuckDetector D1–D7 (100% loop recall)'
    ),
    other: t(
      '窗口刷新或网络抖动即丢失执行上下文，极易在同一报错命令上无限空转消耗 Token',
      '通信瞬断で処理が失われ、同一エラーコマンドの無限ループでトークンを浪費しやすい',
      'Loses state on network hiccups and burns tokens repeating identical failing commands'
    )
  },
  {
    core: false,
    dim: t('多智能体并发与权限门禁', '並列Worktree＆ゼロトラスト権限', 'Worktree Team & Safety Gate'),
    helm: t(
      '最多 8 队友独立 Worktree（Junction 零拷贝共享依赖，加速 3.04×，0% 冲突）+ 5 档权限（30/30 攻击拦截）',
      '最大8メイト独立 Worktree（Junction共有・3.04倍高速・競合0%）＋ 5段階権限（30/30 攻撃遮断）',
      'Up to 8 isolated Worktrees (zero-copy Junctions, 3.04× speedup, 0% collision) + 5-tier gate (30/30 block)'
    ),
    other: t(
      '多代理共享同一工作目录互相覆盖，缺乏细粒度只读 Plan Mode 与受保护路径硬门禁',
      '同一ディレクトリを同時編集して競合破損。細粒度な Plan Mode や保護パス強制確認がない',
      'Subagents overwrite shared directories without prefix-safe Plan Mode or protected-path guards'
    )
  },
  {
    core: false,
    dim: t('前缀缓存保护与保真压缩', 'Prefix Cache 保護と7段階圧縮', 'Prefix Cache & Compaction'),
    helm: t(
      '四层只增前缀达成 97.74% 实战缓存命中；7 级经济学裁剪压缩 93.1% 输出且 100% 保住末尾异常堆栈',
      '4層追記型で実戦 97.74% キャッシュヒット；7段階圧縮で末尾スタックトレースを 100% 保持',
      '4-layer append-only prefix hits 97.74% cache; 7-stage compactor retains 100% of tail tracebacks'
    ),
    other: t(
      '每轮动态改写 System Prompt 或暴力一刀切截断输出，导致缓存频繁失效与关键报错丢失',
      '毎ターン System Prompt を書き換えるか末尾を切り捨て、キャッシュ破壊とエラー欠損を招く',
      'Mutates system prompts per turn and truncates tail stack traces, causing severe KV-cache churn'
    )
  }
])

const visibleCompareRows = computed(() =>
  showAllCompareRows.value ? comparisonRows.value : comparisonRows.value.filter((r) => r.core)
)

// 第 6 章：内测共创 3 条客观标准
const coCreationRules = computed(() => [
  {
    num: '01',
    title: t('具备「行业共性」，造福同行而非孤立私活', '「業界の共通課題」であること', 'Industry Commonality Over One-Offs'),
    desc: t(
      '痛点应来自财务、运营、科研、教育、法务、制造等行业同行的日常高频刚需，开发后作为标准内置功能向所有人免费开放。',
      '特定の1社のみの特殊手順ではなく、経理・運営・研究・教育・法務・製造など同じ業界の実務者が共有する高頻度課題を対象とします。',
      'Pain points should reflect recurring challenges shared across your profession so the built-in feature benefits the entire community.'
    )
  },
  {
    num: '02',
    title: t('输入与输出边界清晰，附脱敏样例可验收', '入出力境界が明確（匿名化サンプル付）', 'Verifiable Input & Output Samples'),
    desc: t(
      '提交时请附上【行业场景 + 当前耗时痛点 + 脱敏输入样例 + 期望输出成品样式】，免去反复拉扯，确保精准复现与交付。',
      '【業務シーン＋現状の手間＋機密を除いた入力例＋期待する出力イメージ】を添えていただくことで、迅速かつ正確に実装します。',
      'Include [Scenario + Bottleneck + Sanitized Input Sample + Expected Output] so we can reproduce and verify cleanly.'
    )
  },
  {
    num: '03',
    title: t('按社区同行「+1 投票」客观排期（紧急私密走邮箱）', 'コミュニティ「+1 投票順」で透明開発', 'Community Vote Queue (Private via Email)'),
    desc: t(
      '免费功能严格按社群需求池附议票数排期。若涉及商业机密不便公开、企业独有流程或需紧急加塞交付，请直接联系下方邮箱定制。',
      '無償開発の優先順位は「+1 賛同票数」で客観決定します。社外秘・個別仕様・緊急納期のご依頼はメール窓口にて承ります。',
      'Free features are prioritized transparently by "+1" community votes; confidential or urgent custom workflows are available via email.'
    )
  }
])

// 初始化 Antigravity 启发式极昼罗盘微矢量场（克制 8%–16% 透明度，支持无障碍减弱动态）
onMounted(() => {
  if (typeof window === 'undefined') return
  const canvas = azimuthCanvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const rawRgb = getComputedStyle(document.documentElement).getPropertyValue('--hl-azimuth-rgb').trim() || '26, 79, 214'

  let width = 0
  let height = 0
  let pointerX = -9999
  let pointerY = -9999
  let smoothX = -9999
  let smoothY = -9999

  function resize() {
    const parent = canvas.parentElement
    if (!parent) return
    const rect = parent.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = rect.width
    height = Math.min(rect.height, 620)
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (reducedMotion) drawFrame()
  }

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect()
    pointerX = e.clientX - rect.left
    pointerY = e.clientY - rect.top
  }

  function onMouseLeave() {
    pointerX = -9999
    pointerY = -9999
  }

  function drawFrame() {
    ctx.clearRect(0, 0, width, height)
    if (pointerX > -1000) {
      smoothX = smoothX < -1000 ? pointerX : smoothX + (pointerX - smoothX) * 0.12
      smoothY = smoothY < -1000 ? pointerY : smoothY + (pointerY - smoothY) * 0.12
    } else {
      smoothX = -9999
      smoothY = -9999
    }

    const step = 44
    const cx = width * 0.5
    const cy = 220

    for (let x = step * 0.5; x < width; x += step) {
      for (let y = 28; y < height - 20; y += step) {
        const dxCenter = (x - cx) / Math.max(width * 0.52, 1)
        const dyCenter = (y - cy) / 340
        const radialFade = Math.max(0, 1 - Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter))
        if (radialFade <= 0.04) continue

        let angle = -Math.PI * 0.25
        let boost = 0
        if (smoothX > -1000) {
          const dx = smoothX - x
          const dy = smoothY - y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 260) {
            angle = Math.atan2(dy, dx)
            boost = (1 - dist / 260) * 0.16
          }
        }

        const alpha = radialFade * 0.085 + boost
        const len = 4.5 + boost * 16
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(angle)
        ctx.strokeStyle = `rgba(${rawRgb}, ${alpha.toFixed(3)})`
        ctx.lineWidth = 1.25
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(-len * 0.5, 0)
        ctx.lineTo(len * 0.5, 0)
        ctx.stroke()
        ctx.restore()
      }
    }

    if (!reducedMotion) {
      animFrameId = window.requestAnimationFrame(drawFrame)
    }
  }

  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('mouseleave', onMouseLeave)

  if (!reducedMotion) {
    animFrameId = window.requestAnimationFrame(drawFrame)
  }

  removeCanvasListeners = () => {
    window.removeEventListener('resize', resize)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseleave', onMouseLeave)
    if (animFrameId) window.cancelAnimationFrame(animFrameId)
  }
})

onUnmounted(() => {
  if (removeCanvasListeners) removeCanvasListeners()
})
</script>

<template>
  <div class="hl-home">
    <!-- ==================== CHAPTER 01 · ANTIGRAVITY × APPLE HERO STAGE ==================== -->
    <section class="hl-hero">
      <canvas ref="azimuthCanvasRef" class="hl-azimuth-canvas" aria-hidden="true"></canvas>

      <div class="hl-container hl-hero-inner">
        <!-- 静谧实证公告胶囊 -->
        <a class="hl-announce-pill hl-tabular" href="#benchmarks">
          <span class="hl-announce-dot" aria-hidden="true"></span>
          <span class="hl-announce-strong">SWE-bench Mini 84.0%</span>
          <span class="hl-announce-sep" aria-hidden="true">·</span>
          <span class="hl-announce-sub">
            {{
              t(
                '单题修复仅 ¥0.27 · 100% 本地与内网零出网实证',
                '1問解決 ¥0.27 · ローカル＆社内閉域網ゼロ送信実証',
                '¥0.27 / Solved Bug · 100% Air-Gapped Local & LAN Ready'
              )
            }}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </a>

        <!-- 雕塑级双行主标题 -->
        <h1 class="hl-hero-title">
          <span>
            {{
              t(
                '掌控代码与文档的长程航向，',
                'コードと文書の自律実行を、',
                'Take the Helm of Code & Docs.'
              )
            }}
          </span>
          <span class="hl-hero-title-sub">
            {{
              t(
                '让核心机密永远留在本地。',
                '100%ローカルの主権のもとへ。',
                'Keep Every Secret on Your Machine.'
              )
            }}
          </span>
        </h1>

        <p class="hl-hero-lead">
          {{
            t(
              '集零框架三路并发状态机、最多 8 队友 Git Worktree 协同与同屏可视化 Office 热补丁于一体的桌面级 AI 工程工作台。原生直连本机 Ollama 与企业内网集群。',
              'ゼロフレームワーク3経路並列エンジン、最大8メイトの Git Worktree 協調、同画面 Office ピンポイント更新を統合したデスクトップ AI ワークベンチ。ローカル Ollama・社内LANに直結。',
              'A native desktop agent workbench uniting a zero-framework 3-path state machine, 8-teammate Git Worktrees, and visual in-place Office hot-patching—built for local Ollama and corporate LANs.'
            )
          }}
        </p>

        <!-- 双胶囊主行动按钮（Antigravity Pill Geometry） -->
        <div class="hl-hero-ctas">
          <a
            class="hl-btn hl-btn-ink hl-btn-lg"
            :href="`${prefix}/download`"
            @click.prevent="navigate(`${prefix}/download`)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M3 5.5 10.5 4.5v7H3v-6zm8.5-1.15L21 3v8.5h-9.5V4.35zM3 12.5h7.5v7L3 18.5v-6zm8.5 0H21V21l-9.5-1.35V12.5z" />
            </svg>
            <span>{{ t('下载 Windows 版', 'Windows 版をダウンロード', 'Download for Windows') }}</span>
          </a>

          <button type="button" class="hl-btn hl-btn-tonal hl-btn-lg" @click="openInteractiveStage">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect width="18" height="14" x="3" y="5" rx="2" />
              <path d="M9 9h6M9 13h4" />
            </svg>
            <span>{{ t('在线体验 1:1 工作台', '1:1 ワークベンチを体験', 'Launch 1:1 Workbench') }}</span>
          </button>
        </div>

        <!-- 静谧元数据与安全验签条（从按钮内部剥离，干净得体） -->
        <div class="hl-trust-strip hl-tabular">
          <span>{{ SITE_META.version }} Beta · {{ SITE_META.installerSize }} · {{ t('内嵌 Python 3.13 免配环境', 'Python 3.13 同梱・設定不要', 'Bundled Python 3.13') }}</span>
          <span class="hl-trust-dot" aria-hidden="true">·</span>
          <a class="hl-trust-link is-ok" :href="SITE_META.virusTotalUrl" target="_blank" rel="noopener">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>VirusTotal {{ SITE_META.virusTotalScore }}</span>
          </a>
          <span class="hl-trust-dot" aria-hidden="true">·</span>
          <button
            type="button"
            class="hl-trust-copy"
            @click="copyText('sha', SITE_META.installerSha256)"
          >
            <span>
              {{
                copiedKey === 'sha'
                  ? t('已复制完整 SHA-256', 'SHA-256 コピー完了', 'SHA-256 Copied')
                  : `SHA-256 ${SITE_META.installerSha256Short}`
              }}
            </span>
          </button>
        </div>

        <!-- 舞台切换分段胶囊（默认展示 7m 35s 实机交付录屏） -->
        <div id="hero-stage" class="hl-stage-Controls">
          <div class="hl-segmented" role="tablist" :aria-label="t('首屏产品演示模式', 'デモ表示モード', 'Product Showcase Mode')">
            <button
              type="button"
              role="tab"
              class="hl-seg-btn"
              :class="{ 'is-active': showcaseTab === 'video' }"
              :aria-selected="showcaseTab === 'video'"
              @click="showcaseTab = 'video'"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
              <span>{{ t('7m 35s 一句话实机交付录屏', '7分35秒 実機アプリ構築デモ', '7m 35s Live Delivery Recording') }}</span>
            </button>
            <button
              type="button"
              role="tab"
              class="hl-seg-btn"
              :class="{ 'is-active': showcaseTab === 'interactive' }"
              :aria-selected="showcaseTab === 'interactive'"
              @click="showcaseTab = 'interactive'"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
              <span>{{ t('1:1 实时交互桌面工作台', '1:1 インタラクティブ操作体験', '1:1 Interactive Desktop Sandbox') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 宽幅钛金属质感产品视窗 -->
      <div class="hl-container-wide hl-stage-wrap">
        <!-- 模式 A：7m 35s 真实录屏视窗 -->
        <div v-if="showcaseTab === 'video'" class="hl-studio-window">
          <div class="hl-studio-bar">
            <div class="hl-studio-dots" aria-hidden="true">
              <span class="is-r"></span>
              <span class="is-y"></span>
              <span class="is-g"></span>
            </div>
            <div class="hl-studio-title">
              {{
                t(
                  'Helm Desktop — 一句话生成并启动本地记账软件（7m 35s 全程无剪辑）',
                  'Helm Desktop — 1文から家計簿ソフトを自律構築＆ローカル起動（7分35秒）',
                  'Helm Desktop — Single-Prompt Bookkeeping App Build & Local Launch (7m 35s)'
                )
              }}
            </div>
            <div class="hl-speed-group hl-tabular" role="group" :aria-label="t('视频倍速', '再生速度', 'Playback speed')">
              <button
                v-for="spd in [1, 1.5, 2]"
                :key="spd"
                type="button"
                class="hl-speed-pill"
                :class="{ 'is-active': playbackRate === spd }"
                @click="setVideoSpeed(spd)"
              >
                {{ spd }}×
              </button>
            </div>
          </div>

          <div class="hl-video-viewport">
            <video
              v-if="!videoLoadError"
              ref="videoPlayerRef"
              class="hl-video-el"
              :src="SITE_META.demoVideoUrl"
              controls
              playsinline
              preload="metadata"
              @loadedmetadata="handleVideoLoaded"
              @error="videoLoadError = true"
            ></video>

            <div v-else class="hl-video-fallback">
              <p>{{ t('实机演示视频暂时未能加载，您可立即切换至 1:1 实时交互桌面工作台体验完整界面。', '動画を読み込めませんでした。1:1 インタラクティブワークベンチをお試しください。', 'Demo video unavailable right now—switch to the 1:1 interactive workbench below.') }}</p>
              <div class="hl-fallback-actions">
                <button type="button" class="hl-btn hl-btn-ink hl-btn-sm" @click="videoLoadError = false">
                  {{ t('重试加载视频', '再試行', 'Retry Video') }}
                </button>
                <button type="button" class="hl-btn hl-btn-tonal hl-btn-sm" @click="showcaseTab = 'interactive'">
                  {{ t('切换至 1:1 交互工作台', '1:1 ワークベンチへ切替', 'Open 1:1 Sandbox') }}
                </button>
              </div>
            </div>
          </div>

          <!-- 视窗底部三栏精炼叙事带 -->
          <div class="hl-video-digest">
            <div v-for="vh in videoHighlights" :key="vh.step" class="hl-digest-item">
              <span class="hl-digest-num hl-tabular">{{ vh.step }}</span>
              <div>
                <strong>{{ vh.title }}</strong>
                <p>{{ vh.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 模式 B：1:1 桌面客户端交互沙盒 -->
        <div v-else class="hl-playground-wrap">
          <ProductPlayground :lang="currentLang" :standalone="true" />
        </div>
      </div>
    </section>

    <!-- ==================== CHAPTER 02 · APPLE ASYMMETRIC BENTO GRID ==================== -->
    <section id="benchmarks" class="hl-section hl-section-alt">
      <div class="hl-container">
        <div class="hl-sec-head">
          <p class="hl-eyebrow">{{ t('可复现工程实证', '再現可能なエンジニアリング実証', 'Verifiable Engineering Proof') }}</p>
          <h2 class="hl-sec-title">
            {{
              t(
                '每一项核心指标，皆附带原始日志与 SHA-256 验签。',
                'すべての主要指標に、生ログと SHA-256 署名を添付。',
                'Every headline number, backed by raw traces and SHA-256 proofs.'
              )
            }}
          </h2>
          <p class="hl-sec-desc">
            {{
              t(
                '轻点任意卡片右下角的「+」，即可展开主流 Coding Agent 横向对标表、双零出网拓扑与四维消融实测明细。',
                '各カード右下の「+」をクリックすると、主要エージェント比較表やゼロ・イグレス構成、アブレーション詳細が開きます。',
                'Tap the "+" button on any card to inspect the full agent comparison table, zero-egress topologies, and ablation matrices.'
              )
            }}
          </p>
        </div>

        <div class="hl-bento-grid">
          <!-- Card 1 (Span 7): 84.0% SWE-bench -->
          <article
            class="hl-bento-card is-interactive hl-bento-span-7"
            tabindex="0"
            role="button"
            @click="activeBentoSheet = 'swebench'"
            @keydown.enter.prevent="activeBentoSheet = 'swebench'"
            @keydown.space.prevent="activeBentoSheet = 'swebench'"
          >
            <div class="hl-bento-top">
              <span class="hl-pill-tag is-ok">DOCKER --network none · n=50</span>
              <span class="hl-bento-meta hl-tabular">DeepSeek-V4.1-Flash</span>
            </div>

            <div class="hl-bento-hero-stat hl-tabular">84.0%</div>
            <h3 class="hl-bento-title">
              {{ t('SWE-bench Verified Mini 单轮峰值解决率', 'SWE-bench Verified Mini ピーク解決率', 'SWE-bench Verified Mini Peak Pass@1') }}
            </h3>
            <p class="hl-bento-desc">
              {{
                t(
                  '两轮独立全量均值 81.0% ± 4.2%（Django 核心子集稳定达 88.0%），Gold 目标文件定位率 98.0%，100/100 题次有效非空补丁率 100%。',
                  '独立2回平均 81.0% ± 4.2%（Django 88.0%）、正解ファイル特定率 98.0%、有効非空パッチ率 100%（100/100）を達成。',
                  '81.0% ± 4.2% two-run independent mean (88.0% on Django), 98.0% Gold file localization, and 100% (100/100) valid patches.'
                )
              }}
            </p>

            <div class="hl-bento-bars hl-tabular" aria-hidden="true">
              <div class="hl-bar-row">
                <span class="hl-bar-lbl">Helm R1 Clean</span>
                <div class="hl-bar-track"><span class="hl-bar-fill is-accent" style="width: 84%"></span></div>
                <strong>84.0%</strong>
              </div>
              <div class="hl-bar-row">
                <span class="hl-bar-lbl">mini-SWE-agent (Same LLM)</span>
                <div class="hl-bar-track"><span class="hl-bar-fill" style="width: 82%"></span></div>
                <strong>82.0%</strong>
              </div>
              <div class="hl-bar-row">
                <span class="hl-bar-lbl">Django Subset (2-Run)</span>
                <div class="hl-bar-track"><span class="hl-bar-fill is-ok" style="width: 88%"></span></div>
                <strong>88.0%</strong>
              </div>
            </div>

            <div class="hl-bento-foot">
              <span class="hl-bento-hint">{{ t('展开 6 大 Agent 对标表与代码导航微基准', '比較表・ナビゲーション詳細を表示', 'Compare 6 agents & navigation primitives') }}</span>
              <span class="hl-plus-btn" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
              </span>
            </div>
          </article>

          <!-- Card 2 (Span 5): 0 Byte Zero Egress -->
          <article
            class="hl-bento-card is-interactive hl-bento-span-5"
            tabindex="0"
            role="button"
            @click="activeBentoSheet = 'privacy'"
            @keydown.enter.prevent="activeBentoSheet = 'privacy'"
            @keydown.space.prevent="activeBentoSheet = 'privacy'"
          >
            <div class="hl-bento-top">
              <span class="hl-pill-tag">AIR-GAPPED &amp; CORPORATE LAN</span>
            </div>

            <div class="hl-bento-hero-stat hl-tabular">0 Byte</div>
            <h3 class="hl-bento-title">
              {{ t('公网外发机密数据量', '外部クラウドへの機密送信量', 'Public Cloud Data Egress') }}
            </h3>
            <p class="hl-bento-desc">
              {{
                t(
                  '原生支持 127.0.0.1 本机离线 Ollama 与企业内网 vLLM 集群直连。API 凭证由 Windows DPAPI 系统级加密保护，预览子帧严格剥离令牌。',
                  '127.0.0.1 ローカル Ollama と社内閉域網 vLLM 直結に対応。認証情報は Windows DPAPI で OS 暗号化保管。',
                  'Native 127.0.0.1 Ollama and corporate LAN vLLM support, guarded by Windows DPAPI encryption and subframe token isolation.'
                )
              }}
            </p>

            <div class="hl-tier-pills">
              <span>127.0.0.1 Ollama</span>
              <span>LAN vLLM / RAGFlow</span>
              <span>DPAPI SecretBox</span>
            </div>

            <div class="hl-bento-foot">
              <span class="hl-bento-hint">{{ t('查看单机离线与企业内网双拓扑', '2つのゼロ・イグレス構成を見る', 'Inspect Topology A & B diagrams') }}</span>
              <span class="hl-plus-btn" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
              </span>
            </div>
          </article>

          <!-- Card 3 (Span 5): 97.74% Prefix Cache -->
          <article
            class="hl-bento-card is-interactive hl-bento-span-5"
            tabindex="0"
            role="button"
            @click="activeBentoSheet = 'cache'"
            @keydown.enter.prevent="activeBentoSheet = 'cache'"
            @keydown.space.prevent="activeBentoSheet = 'cache'"
          >
            <div class="hl-bento-top">
              <span class="hl-pill-tag is-accent">¥0.27 / {{ t('成功修复一题', '1問解決', 'Solved Issue') }}</span>
              <span class="hl-bento-meta hl-tabular">120M+ Tokens</span>
            </div>

            <div class="hl-bento-hero-stat hl-tabular">97.74%</div>
            <h3 class="hl-bento-title">
              {{ t('实战四层只增前缀缓存命中率', '実戦 4層追記プレフィックスヒット率', 'Live 4-Layer Prefix Cache Hit Rate') }}
            </h3>
            <p class="hl-bento-desc">
              {{
                t(
                  '跑完全套 50 道开源仓库修复仅需 ¥10.39。配合 7 级缓存经济学裁剪（100% 保住异常堆栈）与异构 RAG 100% 严格召回。',
                  '50問完走コストはわずか ¥10.39。末尾例外を100%残す7段階圧縮と、完全正解率100%の4段階異種RAGを統合。',
                  'Completes all 50 repository issues for ¥10.39 (~$1.45), paired with 100% traceback-retaining compaction and 100%-recall RAG.'
                )
              }}
            </p>

            <div class="hl-bento-foot">
              <span class="hl-bento-hint">{{ t('查看缓存经济学公式与 RAG 四阶段消融', 'キャッシュ経済性とRAG詳細を見る', 'Explore cache economics & RAG v0→v3') }}</span>
              <span class="hl-plus-btn" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
              </span>
            </div>
          </article>

          <!-- Card 4 (Span 7): Visual Office & Worktree 3.04x -->
          <article
            class="hl-bento-card is-interactive hl-bento-span-7"
            tabindex="0"
            role="button"
            @click="activeBentoSheet = 'workbench'"
            @keydown.enter.prevent="activeBentoSheet = 'workbench'"
            @keydown.space.prevent="activeBentoSheet = 'workbench'"
          >
            <div class="hl-bento-top">
              <span class="hl-pill-tag">VISUAL WORKBENCH · 8-MATE WORKTREE</span>
              <span class="hl-bento-meta hl-tabular">GAIA 90% · Polyglot 24/24</span>
            </div>

            <div class="hl-bento-hero-stat hl-tabular">3.04×</div>
            <h3 class="hl-bento-title">
              {{
                t(
                  '零拷贝 Worktree 并行加速 & 同屏「指哪改哪」文档工作台',
                  'Worktree 3.04倍並列加速 ＆ 同画面 Office ピンポイント更新',
                  'Zero-Copy Worktree Speedup & Surgical Visual Office Workbench'
                )
              }}
            </h3>
            <p class="hl-bento-desc">
              {{
                t(
                  '4 队友并发写冲突率 0.0%（Windows Junction 零拷贝共享依赖）；右侧内建 7 格式原生预览，鼠标框选 PPT 形状或 Word 段落原地热更新（20/20 全通）。',
                  '4メイト並列で書込競合 0.0%（Junction共有）。右ペインの7形式プレビュー上で PPT 図形や Word 段落を選択し即時部分更新（20/20 合格）。',
                  '0.0% write collision across parallel teammates via Windows Junctions, plus 7 native editors with mouse-selected SSE hot-patching (20/20 pass).'
                )
              }}
            </p>

            <div class="hl-tier-pills hl-tabular">
              <span>{{ t('502 项自动化单测', '502 単体テスト', '502 Pytest Suite') }}</span>
              <span>{{ t('30/30 越权攻击拦截', '30/30 攻撃遮断', '30/30 Attack Block') }}</span>
              <span>{{ t('Polyglot 6 语言 100%', 'Polyglot 100%', 'Polyglot 24/24') }}</span>
            </div>

            <div class="hl-bento-foot">
              <span class="hl-bento-hint">{{ t('查看四维架构壁垒与多模态办公消融实证', '4次元フルスタック実証を見る', 'View 4-dimension full-stack ablations') }}</span>
              <span class="hl-plus-btn" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
              </span>
            </div>
          </article>
        </div>

        <!-- 6 大权威实测中心静谧横幅 -->
        <div class="hl-evidence-strip">
          <div class="hl-evidence-text">
            <strong>{{ t('全套 6 大权威实测套件在线审阅与原始证据包验签', '全6種ベンチマーク実証レポート＆SHA-256証跡センター', '6 Empirical Benchmark Suites & Live WebCrypto Verification') }}</strong>
            <span>{{ t('涵盖 SWE-bench Mini、Pre-Cache、RAG 消融、Harness 护栏、Polyglot 与 GAIA，支持浏览器端实时校验 SHA-256。', 'SWE-bench・Pre-Cache・RAG・Harness・Polyglot・GAIA の全レポートと ZIP 証跡を公開。', 'Read full reports, inspect raw JSONL logs, and verify SHA-256 digests directly in your browser.') }}</span>
          </div>
          <a
            class="hl-btn hl-btn-outline hl-btn-sm"
            :href="`${prefix}/benchmarks/swebench-mini-v1`"
            @click.prevent="navigate(`${prefix}/benchmarks/swebench-mini-v1`)"
          >
            <span>{{ t('进入实测报告中心', '実証レポートセンターへ', 'Open Benchmark Hub') }}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
          </a>
        </div>
      </div>
    </section>

    <!-- ==================== CHAPTER 03 · APPLE PRO DARK CINEMA (5 CORE ENGINES) ==================== -->
    <section id="capabilities" class="hl-pro-section">
      <div class="hl-container">
        <div class="hl-sec-head is-pro">
          <p class="hl-pro-eyebrow">CORE STATE-MACHINE ARCHITECTURE · 5 ENGINES</p>
          <h2 class="hl-pro-title">
            {{
              t(
                '超越薄封装 API 套壳，深入状态机与数据契约。',
                '単なるAPIラッパーを超える、状態マシンとデータ契約。',
                'Beyond thin API wrappers. Engineered down to the state machine.'
              )
            }}
          </h2>
          <p class="hl-pro-desc">
            {{
              t(
                '摒弃黑盒框架堆砌，5,227 行纯异步核心逐一攻克「机密外泄、长任务死循环、并发写冲突、缓存频繁失效与文档盲改」五大工业顽疾。',
                '外部フレームワークに頼らない 5,227行の非同期コアが、「情報漏洩・無限ループ・並列競合・キャッシュ破断・文書破壊」を根本解決します。',
                'Zero LangChain wrappers: a 5,227-LOC async core purpose-built to eliminate data leaks, infinite loops, merge collisions, KV churn, and blind document rewrites.'
              )
            }}
          </p>
        </div>

        <!-- 5 大引擎胶囊切换器 -->
        <div class="hl-pro-tabs" role="tablist">
          <button
            v-for="(item, idx) in featurePillars"
            :key="item.id"
            type="button"
            role="tab"
            class="hl-pro-tab"
            :class="{ 'is-active': activeFeatureIdx === idx }"
            :aria-selected="activeFeatureIdx === idx"
            @click="activeFeatureIdx = idx"
          >
            {{ item.shortTab }}
          </button>
        </div>

        <!-- 双栏深色剧场面板 -->
        <div class="hl-pro-stage">
          <div class="hl-pro-left">
            <div class="hl-pro-code">{{ activeFeature.code }}</div>
            <h3 class="hl-pro-stage-title">{{ activeFeature.title }}</h3>
            <p class="hl-pro-stage-desc">{{ activeFeature.desc }}</p>

            <ul class="hl-pro-list">
              <li v-for="(hl, hIdx) in activeFeature.highlights" :key="hIdx">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>{{ hl }}</span>
              </li>
            </ul>

            <div class="hl-pro-actions">
              <a
                class="hl-pro-pill-cta"
                :href="activeFeature.docLink"
                @click.prevent="navigate(activeFeature.docLink)"
              >
                <span>{{ activeFeature.docLabel }}</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </a>
            </div>
          </div>

          <div class="hl-pro-right">
            <div class="hl-pro-nodes">
              <div v-for="(node, nIdx) in activeFeature.visualNodes" :key="nIdx" class="hl-pro-node">
                <div class="hl-pro-node-top">
                  <span class="hl-pro-node-tag">{{ node.tag }}</span>
                  <span class="hl-pro-node-status">{{ node.status }}</span>
                </div>
                <div class="hl-pro-node-main">
                  <strong>{{ node.name }}</strong>
                  <code>{{ node.addr }}</code>
                </div>
              </div>
            </div>

            <div class="hl-pro-terminal">
              <div class="hl-pro-term-bar">
                <div class="hl-studio-dots" aria-hidden="true">
                  <span class="is-r"></span><span class="is-y"></span><span class="is-g"></span>
                </div>
                <span class="hl-pro-term-file">{{ activeFeature.snippetTitle }}</span>
                <span class="hl-pro-term-badge">CONTRACT</span>
              </div>
              <pre class="hl-pro-pre"><code>{{ activeFeature.snippet }}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== CHAPTER 04 · HAIRLINE ARCHITECTURAL CONTRAST ==================== -->
    <section id="why-helm" class="hl-section">
      <div class="hl-container">
        <div class="hl-sec-head">
          <p class="hl-eyebrow">{{ t('核心选型对比', 'アーキテクチャ比較', 'Why Helm') }}</p>
          <h2 class="hl-sec-title">
            {{
              t(
                '既然有了 Codex 等通用工具，为什么还要选择 Helm？',
                '既存のクラウド型ツールではなく、なぜ Helm を選ぶのか？',
                'Why choose Helm over conventional cloud coding agents?'
              )
            }}
          </h2>
          <p class="hl-sec-desc">
            {{
              t(
                '通用云端 Agent 擅长公网辅助编程；而 Helm 专为「本地/内网物理合规、同屏精细改文档、以及免费为你定制垂直行业工作流」而生。',
                '汎用クラウドツールが対応できない「ローカル/社内LAN主権・Office同画面編集・業界特化ワークフローの無償共創」に特化しています。',
                'Built for what generic cloud agents cannot offer: 100% local/LAN sovereignty, visual Office hot-patching, and free co-created industry workflows.'
              )
            }}
          </p>
        </div>

        <!-- 无外框 1px 细分割线对比矩阵 -->
        <div class="hl-hairline-matrix">
          <div class="hl-matrix-head">
            <div>{{ t('评估维度', '評価軸', 'Dimension') }}</div>
            <div class="is-helm-head">
              <span class="hl-helm-dot" aria-hidden="true"></span>
              <span>Helm Desktop ({{ SITE_META.version }})</span>
            </div>
            <div>{{ t('常规云端 / 通用 Coding Agent', '一般的なクラウド型 Agent', 'Conventional Cloud Agents') }}</div>
          </div>

          <div
            v-for="row in visibleCompareRows"
            :key="row.dim"
            class="hl-matrix-row"
          >
            <div class="hl-matrix-dim">{{ row.dim }}</div>
            <div class="hl-matrix-helm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span>{{ row.helm }}</span>
            </div>
            <div class="hl-matrix-other">
              <span>{{ row.other }}</span>
            </div>
          </div>
        </div>

        <div class="hl-matrix-more">
          <button
            type="button"
            class="hl-btn hl-btn-tonal hl-btn-sm"
            @click="showAllCompareRows = !showAllCompareRows"
          >
            <span>
              {{
                showAllCompareRows
                  ? t('收起底层工程对比项', '詳細項目を折りたたむ', 'Show Fewer Dimensions')
                  : t('展开全部 7 项底层工程架构对比', '全7項目の技術比較を展開する', 'Expand All 7 Architectural Dimensions')
              }}
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              :style="{ transform: showAllCompareRows ? 'rotate(180deg)' : 'none', transition: 'transform 160ms ease' }"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- ==================== CHAPTER 05 · 6-VOLUME ARCHITECTURE WHITEPAPER SHELF ==================== -->
    <section class="hl-section hl-section-alt">
      <div class="hl-container">
        <div class="hl-shelf-header">
          <div>
            <p class="hl-eyebrow">{{ t('源码级透明披露', 'ソースコードレベルの設計開示', 'Source-Level Blueprint') }}</p>
            <h2 class="hl-sec-title">
              {{ t('Helm 工程架构白皮书（全 6 卷）', 'Helm 技術アーキテクチャ白書（全6章）', 'Helm Architecture Whitepaper (6 Volumes)') }}
            </h2>
          </div>
          <div class="hl-shelf-actions">
            <a
              class="hl-btn hl-btn-ink hl-btn-sm"
              :href="`${prefix}/architecture/overview`"
              @click.prevent="navigate(`${prefix}/architecture/overview`)"
            >
              <span>{{ t('进入白皮书阅读器', '白書リーダーを開く', 'Open Whitepaper Reader') }}</span>
            </a>
            <button type="button" class="hl-btn hl-btn-outline hl-btn-sm" @click="openAuditModal">
              <span>{{ t('离线安全与透明性说明', 'オフライン安全仕様', 'Offline Security Brief') }}</span>
            </button>
          </div>
        </div>

        <div class="hl-vol-grid">
          <a
            v-for="ch in archChapters"
            :key="ch.id"
            class="hl-bento-card is-interactive hl-vol-card"
            :href="ch.link"
            @click.prevent="navigate(ch.link)"
          >
            <div class="hl-vol-top">
              <span class="hl-vol-num hl-tabular">{{ ch.num }}</span>
              <span class="hl-vol-badge">{{ ch.badge }}</span>
            </div>
            <h3 class="hl-vol-title">{{ ch.title }}</h3>
            <p class="hl-vol-desc">{{ ch.subtitle }}</p>
            <div class="hl-vol-foot">
              <span class="hl-vol-metric hl-tabular">{{ ch.metric }}</span>
              <span class="hl-vol-arrow" aria-hidden="true">→</span>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- ==================== CHAPTER 06 · BETA CO-CREATION & COMMUNITY CHANNELS ==================== -->
    <section id="community" class="hl-section">
      <div class="hl-container">
        <div class="hl-comm-layout">
          <!-- 左栏：内测共创宣言与 3 条客观标准 -->
          <div class="hl-comm-left">
            <p class="hl-eyebrow">{{ t('内测共创计划', 'ベータ共創プログラム', 'Beta Co-Creation Program') }}</p>
            <h2 class="hl-sec-title">
              {{
                t(
                  '你提真实行业痛点，我免费写进下一版。',
                  'あなたの業界課題を、無償で次期標準機能へ。',
                  'Share your workflow pain points. We build them in for free.'
                )
              }}
            </h2>
            <p class="hl-comm-lead">
              {{
                t(
                  'Helm 目前处于内测阶段，感谢每一位早期用户的支持！遇到任何问题请随时提出，我会第一时间优化修复。后续版本开发什么完全由大家决定——希望 AI 真正走进各行各业解决高频痛点。',
                  '現在ベータテスト段階にあります。不具合や改善要望は迅速に修正いたします。今後の新機能は皆様の声で決定し、あらゆる業界の実務課題を無償で標準機能として実装してまいります。',
                  'Helm is in active beta—every bug report is fixed promptly, and our roadmap is driven directly by users. High-value industry workflows are built into official releases at zero cost.'
                )
              }}
            </p>

            <div class="hl-rules-list">
              <div class="hl-rules-caption">
                {{ t('免费需求入选的 3 条客观透明标准', '無償機能開発の3つの客観的採択基準', '3 Objective Criteria for Free Feature Inclusion') }}
              </div>
              <div v-for="rule in coCreationRules" :key="rule.num" class="hl-rule-row">
                <span class="hl-rule-idx hl-tabular">{{ rule.num }}</span>
                <div>
                  <strong>{{ rule.title }}</strong>
                  <p>{{ rule.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 右栏：三大官方直联卡片 -->
          <div class="hl-comm-right">
            <!-- Discord -->
            <div class="hl-channel-card">
              <div class="hl-channel-top">
                <span class="hl-channel-kicker">DISCORD COMMUNITY</span>
                <span class="hl-pill-tag">{{ t('全球开发者社区', '公式サーバー', 'Global Server') }}</span>
              </div>
              <h3>{{ t('Helm Discord 交流频道', 'Helm 公式 Discord', 'Helm Discord Server') }}</h3>
              <p>{{ t('实时交流工作流配置、反馈使用体验、参与新功能投票并获取更新通知。', 'ワークフロー共有・質問相談・新機能投票・アップデート通知。', 'Discuss workflows, vote on upcoming features, and get release updates.') }}</p>
              <code class="hl-channel-val">{{ SITE_META.discordUrl }}</code>
              <div class="hl-channel-actions">
                <a class="hl-btn hl-btn-ink hl-btn-sm" :href="SITE_META.discordUrl" target="_blank" rel="noopener">
                  <span>{{ t('加入 Discord ↗', 'Discord に参加 ↗', 'Join Discord ↗') }}</span>
                </a>
                <button type="button" class="hl-btn hl-btn-outline hl-btn-sm" @click="copyText('discord', SITE_META.discordUrl)">
                  <span>{{ copiedKey === 'discord' ? t('已复制', 'コピー済', 'Copied') : t('复制链接', 'リンクをコピー', 'Copy Link') }}</span>
                </button>
              </div>
            </div>

            <!-- QQ 交流群 -->
            <div class="hl-channel-card">
              <div class="hl-channel-top">
                <span class="hl-channel-kicker">QQ GROUP · CN</span>
                <span class="hl-pill-tag is-ok">{{ t('实时答疑与需求征集', '迅速サポート・要望受付', 'Fast Q&A & Ideas') }}</span>
              </div>
              <h3>{{ t('官方 QQ 交流群', '公式 QQ 交流グループ', 'Official QQ Group') }}</h3>
              <p>{{ t('遇到任何问题欢迎进群直联作者，群内定期征集高频痛点进行免费排期开发。', 'トラブル相談や無償開発リクエストの提案・投票を行える公式グループです。', 'Direct troubleshooting with the author and periodic free feature request polls.') }}</p>
              <div class="hl-channel-inline">
                <code class="hl-channel-val is-lg hl-tabular">{{ SITE_META.qqGroup }}</code>
                <button type="button" class="hl-btn hl-btn-ink hl-btn-sm" @click="copyText('qq', SITE_META.qqGroup)">
                  <span>{{ copiedKey === 'qq' ? t('已复制群号', 'コピー完了', 'Copied ID') : t('一键复制群号', '番号をコピー', 'Copy Group ID') }}</span>
                </button>
              </div>
            </div>

            <!-- 私人订制与合作邮箱 -->
            <div class="hl-channel-card">
              <div class="hl-channel-top">
                <span class="hl-channel-kicker">DIRECT EMAIL · CUSTOM DEV</span>
                <span class="hl-pill-tag is-accent">{{ t('私人订制与商务合作', '個別カスタム受注・提携', 'Private Custom & Enterprise') }}</span>
              </div>
              <h3>{{ t('专属功能定制与企业合作邮箱', '個別カスタム開発・提携メール', 'Private Custom Dev & Inquiry Email') }}</h3>
              <p>{{ t('涉及商业机密不便公开、紧急交付或企业内网私有化落地方案，请发送邮件一对一沟通。', '社外秘の個別仕様・緊急開発・社内閉域網への導入相談はメールでご連絡ください。', 'For confidential custom features, urgent deadlines, or enterprise LAN deployments.') }}</p>
              <code class="hl-channel-val is-lg">{{ SITE_META.contactEmail }}</code>
              <div class="hl-channel-actions">
                <a class="hl-btn hl-btn-ink hl-btn-sm" :href="`mailto:${SITE_META.contactEmail}`">
                  <span>{{ t('发送邮件联系', 'メールを送信', 'Send Email') }}</span>
                </a>
                <button type="button" class="hl-btn hl-btn-outline hl-btn-sm" @click="copyText('email', SITE_META.contactEmail)">
                  <span>{{ copiedKey === 'email' ? t('已复制', 'コピー済', 'Copied') : t('复制邮箱', 'アドレスをコピー', 'Copy Email') }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== CHAPTER 07 · ANTIGRAVITY LIFTOFF CLOSING STAGE ==================== -->
    <section class="hl-closing">
      <div class="hl-container hl-closing-inner">
        <img class="hl-closing-emblem" :src="SITE_META.brandIconUrl" alt="Helm Emblem" />
        <h2 class="hl-closing-title">
          {{
            t(
              '把长程工程与核心机密，重新握回自己手中。',
              '自律開発とデータ主権を、あなたの手元へ。',
              'Take the helm of your code, documents, and privacy.'
            )
          }}
        </h2>
        <p class="hl-closing-sub">
          {{ SITE_META.sloganEn }}
        </p>
        <div class="hl-hero-ctas">
          <a
            class="hl-btn hl-btn-ink hl-btn-lg"
            :href="`${prefix}/download`"
            @click.prevent="navigate(`${prefix}/download`)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M3 5.5 10.5 4.5v7H3v-6zm8.5-1.15L21 3v8.5h-9.5V4.35zM3 12.5h7.5v7L3 18.5v-6zm8.5 0H21V21l-9.5-1.35V12.5z" />
            </svg>
            <span>{{ t('免费下载 Windows 版', 'Windows 版を無料ダウンロード', 'Download Free for Windows') }}</span>
          </a>
          <a
            class="hl-btn hl-btn-outline hl-btn-lg"
            :href="`${prefix}/demo`"
            @click.prevent="navigate(`${prefix}/demo`)"
          >
            <span>{{ t('全屏打开 1:1 交互沙盒', '1:1 サンドボックスを全画面で開く', 'Open Fullscreen 1:1 Sandbox') }}</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Bento `+` 渐进披露详情抽屉 -->
    <BentoSheetModal
      :active-sheet="activeBentoSheet"
      :lang="currentLang"
      :prefix="prefix"
      @close="activeBentoSheet = ''"
      @navigate="navigate"
    />
  </div>
</template>

<style scoped>
.hl-home {
  background-color: var(--hl-bg);
  color: var(--hl-ink);
}

/* ==================== 通用章节骨架 ==================== */
.hl-section {
  padding: 96px 0;
  background-color: var(--hl-bg);
}

.hl-section-alt {
  background-color: var(--hl-surface-alt);
}

.hl-sec-head {
  max-width: 760px;
  margin-bottom: 48px;
}

/* ==================== CHAPTER 01 · HERO STAGE ==================== */
.hl-hero {
  position: relative;
  padding: 64px 0 88px;
  background-color: var(--hl-bg);
  overflow: hidden;
}

.hl-azimuth-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 580px;
  pointer-events: none;
  z-index: 0;
}

.hl-hero-inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hl-announce-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  padding: 6px 14px;
  border-radius: var(--hl-radius-pill);
  background-color: var(--hl-surface-alt);
  border: 1px solid var(--hl-border);
  font-size: 13px;
  color: var(--hl-ink-2);
  margin-bottom: 28px;
  transition: border-color 160ms var(--hl-ease), background-color 160ms var(--hl-ease), transform 160ms var(--hl-ease);
}

.hl-announce-pill:hover {
  border-color: var(--hl-border-strong);
  background-color: var(--hl-surface-tonal);
  transform: translateY(-1px);
}

.hl-announce-dot {
  width: 7px;
  height: 7px;
  border-radius: var(--hl-radius-pill);
  background-color: var(--hl-ok);
  flex-shrink: 0;
}

.hl-announce-strong {
  font-weight: 650;
  color: var(--hl-ink);
  white-space: nowrap;
}

.hl-announce-sep {
  color: var(--hl-ink-muted);
}

.hl-announce-sub {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--hl-ink-3);
}

.hl-hero-title {
  margin: 0;
  max-width: 980px;
  font-size: clamp(32px, 4.5vw, 58px);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.034em;
  text-wrap: balance;
  color: var(--hl-ink);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hl-hero-title-sub {
  color: var(--hl-ink-2);
}

.hl-hero-lead {
  margin: 24px 0 0;
  max-width: 680px;
  font-size: clamp(15.5px, 1.35vw, 18px);
  line-height: 1.64;
  letter-spacing: -0.008em;
  text-wrap: pretty;
  color: var(--hl-ink-3);
}

.hl-hero-ctas {
  margin-top: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}

.hl-trust-strip {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px 12px;
  font-size: 12.5px;
  color: var(--hl-ink-4);
}

.hl-trust-dot {
  color: var(--hl-border-strong);
}

.hl-trust-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: var(--hl-ok);
  transition: opacity 150ms ease;
}

.hl-trust-link:hover {
  opacity: 0.8;
}

.hl-trust-copy {
  padding: 2px 8px;
  border-radius: var(--hl-radius-pill);
  border: 1px solid var(--hl-border);
  background-color: var(--hl-surface-alt);
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--hl-ink-3);
  cursor: pointer;
  transition: border-color 150ms ease, color 150ms ease, background-color 150ms ease;
}

.hl-trust-copy:hover {
  border-color: var(--hl-border-strong);
  background-color: var(--hl-surface-tonal);
  color: var(--hl-ink);
}

.hl-stage-Controls {
  margin-top: 44px;
  scroll-margin-top: 72px;
}

.hl-stage-wrap {
  position: relative;
  z-index: 2;
  margin-top: 20px;
}

.hl-studio-window {
  border-radius: var(--hl-radius-xl);
  background-color: var(--hl-surface);
  border: 1px solid var(--hl-border);
  box-shadow: var(--hl-shadow-window);
  overflow: hidden;
}

.hl-studio-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 18px;
  background-color: var(--hl-window-bar);
  border-bottom: 1px solid var(--hl-border);
}

.hl-studio-dots {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
}

.hl-studio-dots span {
  width: 11px;
  height: 11px;
  border-radius: var(--hl-radius-pill);
}

.hl-studio-dots .is-r {
  background-color: var(--win-dot-red);
}

.hl-studio-dots .is-y {
  background-color: var(--win-dot-amber);
}

.hl-studio-dots .is-g {
  background-color: var(--win-dot-green);
}

.hl-studio-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--hl-ink-3);
}

.hl-speed-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px;
  border-radius: var(--hl-radius-pill);
  background-color: var(--hl-surface);
  border: 1px solid var(--hl-border);
  flex-shrink: 0;
}

.hl-speed-pill {
  height: 24px;
  padding: 0 9px;
  border: 0;
  border-radius: var(--hl-radius-pill);
  background: transparent;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--hl-ink-4);
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;
}

.hl-speed-pill:hover {
  color: var(--hl-ink);
}

.hl-speed-pill.is-active {
  background-color: var(--hl-ink);
  color: var(--hl-on-ink);
}

.hl-video-viewport {
  width: 100%;
  background-color: var(--hl-pro-code);
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hl-video-el {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.hl-video-fallback {
  padding: 40px 24px;
  text-align: center;
  color: var(--hl-pro-text-2);
  max-width: 48ch;
}

.hl-video-fallback p {
  margin: 0 0 16px;
  font-size: 14.5px;
}

.hl-fallback-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.hl-video-digest {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid var(--hl-border);
  background-color: var(--hl-surface-subtle);
}

.hl-digest-item {
  padding: 20px 24px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border-right: 1px solid var(--hl-border);
  min-width: 0;
}

.hl-digest-item:last-child {
  border-right: 0;
}

.hl-digest-num {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 650;
  color: var(--hl-accent);
  padding-top: 2px;
  flex-shrink: 0;
}

.hl-digest-item strong {
  display: block;
  font-size: 14px;
  font-weight: 650;
  color: var(--hl-ink);
  margin-bottom: 4px;
}

.hl-digest-item p {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--hl-ink-3);
}

/* ==================== CHAPTER 02 · APPLE BENTO GRID ==================== */
.hl-bento-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 20px;
}

.hl-bento-span-7 {
  grid-column: span 7;
}

.hl-bento-span-5 {
  grid-column: span 5;
}

.hl-bento-grid .hl-bento-card {
  padding: 32px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.hl-bento-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.hl-bento-meta {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--hl-ink-4);
}

.hl-bento-hero-stat {
  font-size: clamp(44px, 4.8vw, 60px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.02;
  color: var(--hl-ink);
  margin-bottom: 12px;
}

.hl-bento-title {
  margin: 0 0 8px;
  font-size: 19px;
  font-weight: 650;
  letter-spacing: -0.018em;
  color: var(--hl-ink);
}

.hl-bento-desc {
  margin: 0;
  font-size: 14.5px;
  line-height: 1.62;
  color: var(--hl-ink-3);
}

.hl-bento-bars {
  margin-top: 22px;
  padding: 16px 18px;
  border-radius: var(--hl-radius-md);
  background-color: var(--hl-surface-alt);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hl-bar-row {
  display: grid;
  grid-template-columns: 168px 1fr 48px;
  align-items: center;
  gap: 12px;
  font-size: 12.5px;
}

.hl-bar-lbl {
  color: var(--hl-ink-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hl-bar-track {
  height: 7px;
  border-radius: var(--hl-radius-pill);
  background-color: var(--hl-border);
  overflow: hidden;
}

.hl-bar-fill {
  display: block;
  height: 100%;
  border-radius: var(--hl-radius-pill);
  background-color: var(--hl-ink-4);
}

.hl-bar-fill.is-accent {
  background-color: var(--hl-accent);
}

.hl-bar-fill.is-ok {
  background-color: var(--hl-ok);
}

.hl-bar-row strong {
  text-align: right;
  font-weight: 650;
  color: var(--hl-ink);
}

.hl-tier-pills {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hl-tier-pills span {
  padding: 5px 11px;
  border-radius: var(--hl-radius-pill);
  background-color: var(--hl-surface-alt);
  border: 1px solid var(--hl-border);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--hl-ink-2);
}

.hl-bento-foot {
  margin-top: auto;
  padding-top: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.hl-bento-hint {
  font-size: 13px;
  font-weight: 500;
  color: var(--hl-ink-4);
  transition: color 160ms ease;
}

.hl-bento-card.is-interactive:hover .hl-bento-hint {
  color: var(--hl-ink);
}

.hl-evidence-strip {
  margin-top: 20px;
  padding: 22px 28px;
  border-radius: var(--hl-radius-xl);
  background-color: var(--hl-surface);
  border: 1px solid var(--hl-border-soft);
  box-shadow: var(--hl-shadow-bento);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.hl-evidence-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1 1 420px;
}

.hl-evidence-text strong {
  font-size: 15px;
  color: var(--hl-ink);
}

.hl-evidence-text span {
  font-size: 13.5px;
  color: var(--hl-ink-3);
}

/* ==================== CHAPTER 03 · APPLE PRO DARK CINEMA ==================== */
.hl-pro-section {
  padding: 104px 0;
  background-color: var(--hl-pro-bg);
  color: var(--hl-pro-text);
}

.hl-sec-head.is-pro {
  max-width: 760px;
  margin-bottom: 36px;
}

.hl-pro-eyebrow {
  margin: 0 0 10px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--hl-pro-accent);
}

.hl-pro-title {
  margin: 0;
  font-size: clamp(28px, 3.5vw, 44px);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.028em;
  color: var(--hl-pro-text);
}

.hl-pro-desc {
  margin: 14px 0 0;
  font-size: 16px;
  line-height: 1.64;
  color: var(--hl-pro-muted);
  max-width: 64ch;
}

.hl-pro-tabs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 28px;
}

.hl-pro-tab {
  height: 38px;
  padding: 0 18px;
  border-radius: var(--hl-radius-pill);
  border: 1px solid var(--hl-pro-border);
  background-color: var(--hl-pro-surface);
  color: var(--hl-pro-muted);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 165ms var(--hl-ease), color 165ms var(--hl-ease), border-color 165ms var(--hl-ease);
}

.hl-pro-tab:hover {
  color: var(--hl-pro-text);
  border-color: var(--hl-pro-border-strong);
}

.hl-pro-tab.is-active {
  background-color: var(--hl-pro-text);
  color: var(--hl-pro-bg);
  border-color: var(--hl-pro-text);
  font-weight: 600;
}

.hl-pro-stage {
  display: grid;
  grid-template-columns: 1.08fr 0.92fr;
  gap: 32px;
  padding: 36px;
  border-radius: var(--hl-radius-2xl);
  background-color: var(--hl-pro-surface);
  border: 1px solid var(--hl-pro-border);
}

.hl-pro-left {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.hl-pro-code {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--hl-pro-accent);
  margin-bottom: 10px;
}

.hl-pro-stage-title {
  margin: 0 0 12px;
  font-size: clamp(21px, 2.3vw, 26px);
  font-weight: 650;
  line-height: 1.28;
  letter-spacing: -0.02em;
  color: var(--hl-pro-text);
}

.hl-pro-stage-desc {
  margin: 0 0 22px;
  font-size: 14.5px;
  line-height: 1.66;
  color: var(--hl-pro-text-2);
}

.hl-pro-list {
  list-style: none;
  margin: 0 0 28px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hl-pro-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13.5px;
  line-height: 1.56;
  color: var(--hl-pro-text-2);
}

.hl-pro-list svg {
  color: var(--hl-pro-ok);
  flex-shrink: 0;
  margin-top: 3px;
}

.hl-pro-actions {
  margin-top: auto;
}

.hl-pro-pill-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 22px;
  border-radius: var(--hl-radius-pill);
  background-color: var(--hl-pro-text);
  color: var(--hl-pro-bg);
  font-size: 13.5px;
  font-weight: 600;
  transition: transform 165ms var(--hl-ease), opacity 165ms ease;
}

.hl-pro-pill-cta:hover {
  transform: translateY(-1px);
  opacity: 0.92;
}

.hl-pro-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.hl-pro-nodes {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hl-pro-node {
  padding: 14px 16px;
  border-radius: var(--hl-radius-md);
  background-color: var(--hl-pro-surface-2);
  border: 1px solid var(--hl-pro-border);
}

.hl-pro-node-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.hl-pro-node-tag {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--hl-pro-muted);
}

.hl-pro-node-status {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--hl-pro-ok);
}

.hl-pro-node-main {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.hl-pro-node-main strong {
  font-size: 14px;
  color: var(--hl-pro-text);
}

.hl-pro-node-main code {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--hl-pro-accent);
}

.hl-pro-terminal {
  border-radius: var(--hl-radius-md);
  background-color: var(--hl-pro-code);
  border: 1px solid var(--hl-pro-border);
  overflow: hidden;
  margin-top: auto;
}

.hl-pro-term-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--hl-pro-border);
}

.hl-pro-term-file {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--hl-pro-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hl-pro-term-badge {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--hl-pro-accent);
  flex-shrink: 0;
}

.hl-pro-pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.62;
  color: var(--hl-pro-text-2);
}

/* ==================== CHAPTER 04 · HAIRLINE ARCHITECTURAL CONTRAST ==================== */
.hl-hairline-matrix {
  border-top: 1.5px solid var(--hl-rule-ink);
}

.hl-matrix-head,
.hl-matrix-row {
  display: grid;
  grid-template-columns: 200px 1.25fr 1fr;
  gap: 28px;
  padding: 20px 8px;
  border-bottom: 1px solid var(--hl-border);
  align-items: start;
}

.hl-matrix-head {
  padding: 14px 8px;
  font-size: 12.5px;
  font-weight: 650;
  color: var(--hl-ink-4);
}

.hl-matrix-head .is-helm-head {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--hl-ink);
}

.hl-helm-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--hl-radius-pill);
  background-color: var(--hl-accent);
}

.hl-matrix-dim {
  font-size: 14.5px;
  font-weight: 650;
  color: var(--hl-ink);
}

.hl-matrix-helm {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14.5px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--hl-ink);
}

.hl-matrix-helm svg {
  color: var(--hl-accent);
  flex-shrink: 0;
  margin-top: 4px;
}

.hl-matrix-other {
  font-size: 14px;
  line-height: 1.6;
  color: var(--hl-ink-4);
}

.hl-matrix-more {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

/* ==================== CHAPTER 05 · 6-VOLUME WHITEPAPER SHELF ==================== */
.hl-shelf-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.hl-shelf-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.hl-vol-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.hl-vol-card {
  padding: 26px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.hl-vol-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 14px;
}

.hl-vol-num {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--hl-accent);
}

.hl-vol-badge {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--hl-ink-4);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hl-vol-title {
  margin: 0 0 10px;
  font-size: 17px;
  font-weight: 650;
  line-height: 1.38;
  letter-spacing: -0.015em;
  color: var(--hl-ink);
}

.hl-vol-desc {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--hl-ink-3);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hl-vol-foot {
  margin-top: auto;
  padding-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-top: 1px solid var(--hl-border-soft);
}

.hl-vol-metric {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--hl-ink-2);
}

.hl-vol-arrow {
  font-size: 15px;
  color: var(--hl-accent);
  transition: transform 160ms var(--hl-ease);
}

.hl-vol-card:hover .hl-vol-arrow {
  transform: translateX(3px);
}

/* ==================== CHAPTER 06 · BETA CO-CREATION & COMMUNITY ==================== */
.hl-comm-layout {
  display: grid;
  grid-template-columns: 1.08fr 0.92fr;
  gap: 48px;
  align-items: start;
}

.hl-comm-lead {
  margin: 16px 0 32px;
  font-size: 15.5px;
  line-height: 1.68;
  color: var(--hl-ink-2);
  max-width: 60ch;
}

.hl-rules-list {
  border-top: 1.5px solid var(--hl-rule-ink);
}

.hl-rules-caption {
  padding: 14px 0;
  font-size: 12.5px;
  font-weight: 650;
  color: var(--hl-ink-4);
  border-bottom: 1px solid var(--hl-border);
}

.hl-rule-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 0;
  border-bottom: 1px solid var(--hl-border);
}

.hl-rule-idx {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--hl-accent);
  padding-top: 2px;
  flex-shrink: 0;
}

.hl-rule-row strong {
  display: block;
  font-size: 15px;
  font-weight: 650;
  color: var(--hl-ink);
  margin-bottom: 4px;
}

.hl-rule-row p {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--hl-ink-3);
}

.hl-comm-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hl-channel-card {
  padding: 24px 26px;
  border-radius: var(--hl-radius-xl);
  background-color: var(--hl-surface-alt);
  border: 1px solid var(--hl-border-soft);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hl-channel-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.hl-channel-kicker {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--hl-ink-4);
}

.hl-channel-card h3 {
  margin: 2px 0 0;
  font-size: 17px;
  font-weight: 650;
  color: var(--hl-ink);
}

.hl-channel-card p {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.58;
  color: var(--hl-ink-3);
}

.hl-channel-val {
  display: inline-block;
  margin-top: 4px;
  padding: 7px 12px;
  border-radius: var(--hl-radius-sm);
  background-color: var(--hl-surface);
  border: 1px solid var(--hl-border);
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: var(--hl-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hl-channel-val.is-lg {
  font-size: 14px;
  font-weight: 600;
}

.hl-channel-inline {
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.hl-channel-inline .hl-channel-val {
  margin-top: 0;
  flex: 1 1 160px;
}

.hl-channel-actions {
  margin-top: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

/* ==================== CHAPTER 07 · LIFTOFF CLOSING STAGE ==================== */
.hl-closing {
  padding: 96px 0 108px;
  background-color: var(--hl-surface-alt);
  border-top: 1px solid var(--hl-border);
}

.hl-closing-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hl-closing-emblem {
  width: 56px;
  height: 56px;
  border-radius: var(--hl-radius-md);
  box-shadow: var(--hl-shadow-xs);
  margin-bottom: 22px;
}

.hl-closing-title {
  margin: 0;
  max-width: 840px;
  font-size: clamp(28px, 3.6vw, 44px);
  font-weight: 700;
  line-height: 1.16;
  letter-spacing: -0.03em;
  text-wrap: balance;
  color: var(--hl-ink);
}

.hl-closing-sub {
  margin: 12px 0 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--hl-ink-4);
}

/* ==================== 响应式断点适配 (960×640 紧凑桌面 & 移动端) ==================== */
@media (max-width: 1040px) {
  .hl-bento-span-7,
  .hl-bento-span-5 {
    grid-column: span 6;
  }

  .hl-pro-stage,
  .hl-comm-layout {
    grid-template-columns: 1fr;
  }

  .hl-vol-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hl-video-digest {
    grid-template-columns: 1fr;
  }

  .hl-digest-item {
    border-right: 0;
    border-bottom: 1px solid var(--hl-border);
  }

  .hl-digest-item:last-child {
    border-bottom: 0;
  }
}

@media (max-width: 780px) {
  .hl-section,
  .hl-pro-section,
  .hl-closing {
    padding: 68px 0;
  }

  .hl-bento-span-7,
  .hl-bento-span-5 {
    grid-column: span 12;
  }

  .hl-vol-grid {
    grid-template-columns: 1fr;
  }

  .hl-matrix-head {
    display: none;
  }

  .hl-matrix-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .hl-bar-row {
    grid-template-columns: 128px 1fr 44px;
  }

  .hl-studio-title {
    display: none;
  }

  .hl-pro-stage {
    padding: 24px 20px;
  }
}
</style>
