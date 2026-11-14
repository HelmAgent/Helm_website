<script setup>
/**
 * BentoSheetModal.vue — Apple 风格渐进披露详情抽屉（点击 Bento 右下角 `+` 呼出）
 *
 * 职责与协作：
 * - 承接首页四大 Bento 卡片的深度实测数据、横向对标表、双零出网部署拓扑与四维全栈消融矩阵，
 *   让首屏与主画布保持 Antigravity × Apple 级呼吸感，同时不丢失任何一项硬核工程证据。
 * - 严格引用 `flagship.css` 语义令牌，零硬编码色值，所有数字均启用 `tabular-nums`。
 */
import { computed, watch, onMounted, onUnmounted } from 'vue'
import { tt } from '../data/siteData.js'

const props = defineProps({
  activeSheet: {
    type: String,
    default: ''
  },
  lang: {
    type: String,
    default: 'zh'
  },
  prefix: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'navigate'])

function t(zh, ja, en) {
  return tt(props.lang, zh, ja, en)
}

function go(url) {
  emit('close')
  emit('navigate', url)
}

function onKeydown(e) {
  if (e.key === 'Escape' && props.activeSheet) {
    emit('close')
  }
}

watch(
  () => props.activeSheet,
  (val) => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = val ? 'hidden' : ''
    }
  }
)

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', onKeydown)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', onKeydown)
  }
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})

const sheetHeader = computed(() => {
  switch (props.activeSheet) {
    case 'swebench':
      return {
        eyebrow: 'SWE-BENCH VERIFIED MINI (N=50) · DOCKER --NETWORK NONE',
        title: t(
          'SWE-bench 84.0% 峰值实测、主流 Agent 对标与代码导航微基准',
          'SWE-bench 84.0% 実証データ・主要 Agent 比較＆コード探索ベンチ',
          'SWE-bench 84.0% Empirical Breakdown, Agent Comparison & Nav Primitives'
        )
      }
    case 'privacy':
      return {
        eyebrow: 'ZERO-EGRESS SECURITY · TOPOLOGY A & B',
        title: t(
          '两种「零外泄」私有化部署拓扑与操作系统级安全基座',
          '厳格な情報セキュリティ審査に対応する2つのゼロ・イグレス構成',
          'Two Zero-Egress Deployment Topologies & OS-Bound Security Stack'
        )
      }
    case 'cache':
      return {
        eyebrow: '4-LAYER PREFIX CACHE · 7-STAGE COMPACT · RAG v0→v3',
        title: t(
          '97.74% 缓存命中经济学、7 级保真裁剪与 4 阶段异构 RAG 消融',
          '97.74% キャッシュ経済学・7段階圧縮＆4段階異種RAGアブレーション',
          '97.74% Prefix Cache Economics, 7-Stage Compaction & 4-Stage RAG Ablation'
        )
      }
    case 'workbench':
      return {
        eyebrow: 'DUAL-MODE WORKBENCH · WORKTREE 3.04× · FULL-STACK ABLATION',
        title: t(
          '同屏指哪改哪文档工作台、Worktree 并行与四维全栈消融实证',
          '同画面 Office 部分更新・Worktree 並列＆4次元フルスタック実証',
          'Visual Selection Hot-Patching, Worktree Parallelism & Full-Stack Ablation'
        )
      }
    default:
      return { eyebrow: '', title: '' }
  }
})

const swebenchKeyStats = computed(() => [
  {
    code: '2-RUN MEAN',
    val: '81.0% ± 4.2%',
    lbl: t('两轮独立全量均值', '独立2回実行平均', '2-Run Independent Mean'),
    sub: t('R1 干净 84.0% (42/50) · R2 复跑 78.0% (39/50)', 'R1 84.0% (42/50) · R2 78.0% (39/50)', 'R1 84.0% (42/50) · R2 78.0% (39/50)')
  },
  {
    code: 'DJANGO CORE',
    val: '88.0% ± 0.0%',
    lbl: t('django/django 解决率', 'django/django 解決率', 'django/django Pass@1'),
    sub: t('两轮均稳定达成 22 / 25，零退化波动', '2回とも 22 / 25 を安定達成', '22 / 25 across both independent runs')
  },
  {
    code: 'GOLD HIT',
    val: '98.0% (49/50)',
    lbl: t('黄金目标文件定位修改率', '正解ファイル特定・編集率', 'Gold Target File Hit Rate'),
    sub: t('100% 发现目标文件，L2 截断丢失 0%', '対象発見 100%・読取欠損 0%', '100% target seen · 0% L2 truncation')
  },
  {
    code: 'VALID PATCH',
    val: '100% (100/100)',
    lbl: t('非空有效补丁交付率', '有効非空パッチ生成率', 'Valid Non-Empty Patch Rate'),
    sub: t('对比同模型官方参照组 96.0% (2 空补丁)', '公式参照群 96.0%（2件空パッチ）', 'vs. 96.0% on official mini-SWE-agent')
  },
  {
    code: 'LIVE CACHE',
    val: '97.74%',
    lbl: t('1.2 亿+ Token 缓存命中', '1.2億+ Token ヒット率', '120M+ Token Cache Hit'),
    sub: t('Step 2 起热态缓存命中率高达 97.81%', '2手目以降ウォームヒット 97.81%', '97.81% warm hit from Step 2 onward')
  },
  {
    code: 'COST / FIX',
    val: '¥0.27',
    lbl: t('每修复一题平均推理成本', '1問解決あたり平均コスト', 'Mean API Cost per Solved Bug'),
    sub: t('全套 50 题跑完总计仅 ¥10.39–¥12.16', '50問完走コスト ¥10.39〜¥12.16', 'Full 50-task suite: ¥10.39–¥12.16')
  }
])

const swebenchComparisonRows = computed(() => [
  {
    isHelm: true,
    name: 'Helm (HYN Agent) + DeepSeek-V4.1-Flash',
    tag: t('本仓库实测 · 最佳单轮 / 两轮均值', '本リポジトリ実測 · 最高 / 2回平均', 'Verified Empirical · Peak / 2-Run Mean'),
    dataset: 'Verified Mini (n=50)',
    passRate: '84.0% (Avg 81.0% ± 4.2%)',
    patchHealth: t('100% 有效补丁 (100/100)', '100% 有効パッチ (100/100)', '100% Valid Patches (100/100)'),
    costPerTask: t('¥0.21–¥0.24 / 题 (解决 ¥0.27)', '¥0.21–¥0.24 / 問 (解決 ¥0.27)', '~$0.03 / task (¥0.27 / solved)'),
    privacy: t('100% 断网沙箱 · 支持本机/内网', '100% 通信遮断 · ローカル/社内LAN', '100% Air-Gapped · Local/LAN Ready')
  },
  {
    isHelm: false,
    name: 'mini-SWE-agent + DeepSeek-V4.1-Flash',
    tag: t('同模型同题集官方脚手架配对参照', '同モデル・同課題セット公式参照群', 'Same-Model Official Scaffold Reference'),
    dataset: 'Verified Mini (n=50)',
    passRate: '82.0% (McNemar p = 1.00)',
    patchHealth: t('96.0% (2 题步数耗尽空补丁)', '96.0% (2問ステップ枯渇で空)', '96.0% (2 step-exhausted empty)'),
    costPerTask: t('¥0.14 / 题 (纯单步 Bash)', '¥0.14 / 問 (最小 Bash のみ)', '~$0.02 / task (minimal bash)'),
    privacy: t('研究用 CLI 脚本，无桌面工作台与门禁', '研究用 CLI（GUI・権限保護なし）', 'CLI script; no desktop workbench')
  },
  {
    isHelm: false,
    name: 'Claude Code (Sonnet / Opus 4.x)',
    tag: t('Anthropic 官方公开成绩', 'Anthropic 公式公開スコア', 'Anthropic Official Benchmark'),
    dataset: 'Verified Full (n=500)',
    passRate: '77.2% – 85.8%+',
    patchHealth: t('未公开空补丁与定位漏斗明细', '空パッチ率・特定率非公開', 'Empty-patch breakdown undisclosed'),
    costPerTask: t('约 ¥5.8 – ¥18+ / 题', '約 ¥5.8 – ¥18+ / 問', '$0.80 – $2.50+ / task'),
    privacy: t('强制上传海外云端，不支持内网', '海外クラウド必須・閉域網不可', 'Cloud only; no air-gapped LAN')
  },
  {
    isHelm: false,
    name: 'OpenAI Codex (codex-1 / GPT-5.x)',
    tag: t('OpenAI System Card 公开榜单', 'OpenAI 公式公開スコア', 'OpenAI System Card'),
    dataset: 'Verified Full (n=500)',
    passRate: '72.1% – 86.2%',
    patchHealth: t('codex-1 剔除 23 道不可运行题', '実行不可23問を除外集計', 'codex-1 excludes 23 instances'),
    costPerTask: t('约 ¥3.6 – ¥11+ / 题', '約 ¥3.6 – ¥11+ / 問', '$0.50 – $1.50+ / task'),
    privacy: t('强制运行于远程云端容器', 'リモートクラウド容器必須', 'Remote cloud containers only')
  },
  {
    isHelm: false,
    name: 'Cursor Autonomous Agent',
    tag: t('2026 第三方端到端评测快照', '2026 第三者自律モード計測', '2026 Autonomous Snapshot'),
    dataset: 'Verified Full (n=500)',
    passRate: '67.0% – 76.8%',
    patchHealth: t('偏交互配对，长程无人值守易中断', '対話支援中心・長時間実行で中断', 'Interactive focus; batch interrupts'),
    costPerTask: t('$20–$40/月 + 按量计费', '$20–$40/月 + 従量課金', '$20–$40/mo + fast requests'),
    privacy: t('强制经过海外中转服务器', '外部中継サーバー必須', 'Cloud relay required')
  }
])

const navMicroBenchmarks = computed(() => [
  {
    code: 'RIPGREP 15.2',
    metric: '119.3 ms',
    delta: t('提速 42.1× · 0% 噪声', '42.1倍高速 · ノイズ0%', '42.1× · 0% Noise'),
    title: t('随包剪枝检索引擎', '同梱 ripgrep 高速検索', 'Bundled Pruned Search'),
    desc: t('P50 延迟由 5,026ms 压至 119.3ms，噪声由 49.2% 降至 0.0%，召回率 99.33%。', 'P50遅延を 5,026ms → 119.3ms へ短縮、ノイズ 0.0%・再現率 99.33%。', 'Cuts P50 from 5,026ms to 119.3ms with 0.0% noise and 99.33% macro recall.')
  },
  {
    code: 'AST OUTLINE',
    metric: '95.41%',
    delta: t('省 Token · P50 23.8ms', 'Token削減 · 23.8ms', 'Saved · 23.8ms P50'),
    title: t('tree-sitter 符号大纲', 'tree-sitter 構造抽出', 'tree-sitter Symbol AST'),
    desc: t('60 个超千行源码文件实测：大纲仅占整文件字符 4.59%，解析失败率 0.0%。', '1,000行超ファイル60件で文字数を 4.59% に圧縮、解析失敗 0.0%。', 'Compresses >1,000-LOC files to 4.59% characters with 0.0% parse failures.')
  },
  {
    code: 'LINE-ALIGNED READ',
    metric: '100.0%',
    delta: t('漏读 0 行 (原 28.8万)', '欠損 0 行', '0 Missed Lines'),
    title: t('read_file 严格整行续读', 'read_file 行境界維持', 'Aligned Pagination'),
    desc: t('顺序续读一致率由 30.33% 提升至 100.0%，SWE-bench L2 截断失败 0%。', '連続読取整合性を 30.33% → 100.0% へ改善、L2欠損ゼロ。', 'Lifts sequential read consistency from 30.33% to 100.0% (0 L2 loss).')
  },
  {
    code: 'POST-EDIT SYNTAX',
    metric: '0.0% FP',
    delta: t('100% 检出 · 37 ms', '検出 100% · 37 ms', '100% Recall · 37ms'),
    title: t('写后零依赖进程内语法门禁', '編集直後の高速構文検査', 'In-Process Syntax Check'),
    desc: t('编辑后 37ms 内精准拦截新引入语法错误，跳过历史旧错，误报率 0.0%。', '新規構文エラーのみを 37ms で 100% 検知、誤報 0.0%。', 'Flags newly introduced syntax errors in 37ms with 0.0% false positives.')
  }
])

const fullStackAblations = computed(() => [
  {
    code: 'RAG v0 → v3',
    metric: '100.0%',
    badge: 'MRR 1.000 · 0% Noise',
    title: t('异构知识库 4 阶段递进消融', '異種混合文書の4段階RAG実証', '4-Stage Multimodal RAG Ablation'),
    desc: t('双栏 PDF 财报与修订合同 36 题实测：完整命中率由 36.7% 跃升至 100.0%，干扰污染 0.0%。', '2段組PDF・改訂契約書36問で完全正解率 36.7% → 100.0%、汚染 0.0%。', '36 golden QAs across 2-col PDFs & contracts: strict recall 36.7% → 100.0%.'),
    slug: 'rag-eval-v1'
  },
  {
    code: 'LOOP & COMPACT',
    metric: '-87.7%',
    badge: '100% Loop Recall',
    title: t('StuckDetector v2 与 60/40 保真裁剪', 'StuckDetector v2 ＆ 60/40 圧縮', 'StuckDetector v2 & 60/40 Compactor'),
    desc: t('D1–D6 死循环 100% (18/18) 拦截；60/40 裁剪压缩 93.1% 超长输出且 100% 保留末尾堆栈。', 'D1–D6 ループ阻止 100% (18/18)；93.1% 圧縮しつつ末尾例外を 100% 保持。', '100% (18/18) loop recall; shrinks outputs 93.1% while keeping 100% tail tracebacks.'),
    slug: 'harness-ablation-v1'
  },
  {
    code: 'WORKTREE & GATE',
    metric: '2.88×–3.04×',
    badge: '0% Collision · 30/30 Block',
    title: t('4 队友 Worktree 并行与零信任门禁', '4メイト Worktree 並列＆権限保護', '4-Mate Worktree & Zero-Trust Gate'),
    desc: t('Windows Junction 零拷贝共享依赖，并发写冲突率 0.0%；30 组越权攻击载荷 100% 拦截。', 'Junction共有で書込競合 0.0%；30種の破壊的ペイロードを 100% 遮断。', 'Zero-copy Junctions with 0.0% write collision; blocks 30/30 adversarial payloads.'),
    slug: 'harness-ablation-v1'
  },
  {
    code: 'POLYGLOT & GAIA',
    metric: '100% / 90%',
    badge: '24/24 · GAIA 27/30',
    title: t('6 语言盲测与 GAIA 多步办公实测', '6言語盲検＆GAIA 多段階Office実証', '6-Lang Polyglot & GAIA Multi-Step'),
    desc: t('Aider-Polyglot 24/24 全通；GAIA Validation 30 题实测 90.0%（L2 达 100%），Office 补丁 20/20。', 'Polyglot 24/24 合格；GAIA 30問で 90.0%（L2 100%）、Office 20/20。', '24/24 on Polyglot blind tasks; 90.0% (27/30) on GAIA Validation & 20/20 Office.'),
    slug: 'gaia-mini-v1'
  }
])
</script>

<template>
  <Teleport to="body">
    <Transition name="hl-sheet-fade">
      <div
        v-if="activeSheet"
        class="hl-sheet-backdrop"
        role="dialog"
        aria-modal="true"
        :aria-label="sheetHeader.title"
        @click.self="emit('close')"
      >
        <div class="hl-sheet-panel">
          <!-- 顶部毛玻璃吸顶栏 -->
          <header class="hl-sheet-topbar">
            <div class="hl-sheet-heading">
              <div class="hl-sheet-eyebrow">{{ sheetHeader.eyebrow }}</div>
              <h3 class="hl-sheet-title">{{ sheetHeader.title }}</h3>
            </div>
            <button
              type="button"
              class="hl-sheet-close"
              :aria-label="t('关闭详情面板', '閉じる', 'Close sheet')"
              @click="emit('close')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </header>

          <!-- Sheet 01: SWE-bench 完整证据与对标 -->
          <div v-if="activeSheet === 'swebench'" class="hl-sheet-body">
            <div class="hl-sheet-kpi-grid">
              <div v-for="s in swebenchKeyStats" :key="s.code" class="hl-sheet-kpi-card">
                <span class="hl-sheet-kpi-code">{{ s.code }}</span>
                <div class="hl-sheet-kpi-val hl-tabular">{{ s.val }}</div>
                <strong class="hl-sheet-kpi-lbl">{{ s.lbl }}</strong>
                <p class="hl-sheet-kpi-sub">{{ s.sub }}</p>
              </div>
            </div>

            <div class="hl-sheet-block">
              <div class="hl-sheet-block-head">
                <h4>{{ t('2026 主流 Coding Agent 公开成绩与同模型 1:1 受控对标', '2026年 主要 Coding Agent 比較＆同一モデル対照実験', '2026 Coding Agent Comparison & 1:1 Controlled Reference') }}</h4>
                <span class="hl-pill-tag is-ok">{{ t('严格区分 n=50 与 n=500 口径', 'n=50 / n=500 明記', 'n=50 vs n=500 Disclosed') }}</span>
              </div>
              <div class="hl-sheet-table-wrap">
                <table class="hl-sheet-table hl-tabular">
                  <thead>
                    <tr>
                      <th>{{ t('Agent / 系统与模型', '評価対象・モデル', 'Agent / Model') }}</th>
                      <th>{{ t('样本口径', '母数', 'Scope') }}</th>
                      <th>{{ t('Pass@1 解决率', 'Pass@1 解決率', 'Pass@1') }}</th>
                      <th>{{ t('补丁完整性', '有効パッチ率', 'Patch Health') }}</th>
                      <th>{{ t('单题成本', '推論コスト', 'Cost / Task') }}</th>
                      <th>{{ t('数据主权与部署', 'データ主権', 'Privacy') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in swebenchComparisonRows" :key="row.name" :class="{ 'is-helm': row.isHelm }">
                      <td>
                        <strong>{{ row.name }}</strong>
                        <small>{{ row.tag }}</small>
                      </td>
                      <td><code>{{ row.dataset }}</code></td>
                      <td class="is-score">{{ row.passRate }}</td>
                      <td>{{ row.patchHealth }}</td>
                      <td><code>{{ row.costPerTask }}</code></td>
                      <td>{{ row.privacy }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="hl-sheet-note">
                <p>
                  <strong>{{ t('统计检验与样本透明声明：', '統計検定・評価スコープ注記：', 'Methodology & McNemar Note:') }}</strong>
                  {{
                    t(
                      'Helm 两轮独立运行（84.0% / 78.0%，均值 81.0%）与同模型同题集官方 mini-SWE-agent（82.0%）在配对精确 McNemar 检验下 p = 1.00 / p = 0.7266（统计打平），但 Helm 在全部 100 题次中达成 100% 非空有效补丁（官方参照组出现 2 题步数耗尽空补丁）。Claude Code / Codex / Cursor 分数为公开 n=500 全量集参考值，不直接等同 n=50 百分比。',
                      'Helm 2回実行（平均 81.0%）と同一モデル公式 mini-SWE-agent（82.0%）は厳密 McNemar 検定で p = 1.00（統計的同等）ですが、Helm は計100問すべてで有効非空パッチ 100% を達成しました（参照群は2問が空パッチ）。n=500 公開値は参考併記です。',
                      'Helm (84.0% / 78.0%) ties statistically with same-model official mini-SWE-agent (82.0%, McNemar p = 1.00) while achieving 100% (100/100) valid patches vs. 96.0% (2 step-exhausted empties). Public n=500 scores are shown with explicit scope labels.'
                    )
                  }}
                </p>
              </div>
            </div>

            <div class="hl-sheet-block">
              <div class="hl-sheet-block-head">
                <h4>{{ t('四大确定性代码导航微基准（零大模型噪声实测）', '4つの決定的コードナビゲーション微細ベンチマーク', 'Four Deterministic Code Navigation Micro-Benchmarks') }}</h4>
              </div>
              <div class="hl-sheet-subgrid">
                <div v-for="m in navMicroBenchmarks" :key="m.code" class="hl-sheet-subcard">
                  <div class="hl-sheet-subtop">
                    <span>{{ m.code }}</span>
                    <em>{{ m.delta }}</em>
                  </div>
                  <div class="hl-sheet-subnum hl-tabular">{{ m.metric }}</div>
                  <strong>{{ m.title }}</strong>
                  <p>{{ m.desc }}</p>
                </div>
              </div>
            </div>

            <footer class="hl-sheet-footer">
              <button type="button" class="hl-btn hl-btn-ink" @click="go(`${prefix}/benchmarks/swebench-mini-v1`)">
                <span>{{ t('阅读完整 SWE-bench 报告与下载', '完全な SWE-bench レポートを読む', 'Read Full SWE-bench Report') }}</span>
              </button>
              <button type="button" class="hl-btn hl-btn-outline" @click="go(`${prefix}/benchmarks/swebench-mini-v1#evidence-bundle`)">
                <span>{{ t('SHA-256 原始证据包在线验签', 'SHA-256 証跡バンドル検証', 'Verify SHA-256 Evidence Bundle') }}</span>
              </button>
            </footer>
          </div>

          <!-- Sheet 02: 零出网双部署拓扑与安全基座 -->
          <div v-else-if="activeSheet === 'privacy'" class="hl-sheet-body">
            <div class="hl-topo-pair">
              <div class="hl-topo-box-card">
                <div class="hl-sheet-subtop">
                  <span>TOPOLOGY A · AIR-GAPPED PC</span>
                  <em>{{ t('拔除网线可用', 'LAN抜線稼働可', '100% Offline') }}</em>
                </div>
                <h4>{{ t('单机完全离线闭环模式（本机 Ollama）', '端末内・完全オフライン完結モデル', 'Standalone Air-Gapped Workstation') }}</h4>
                <div class="hl-topo-chain">
                  <div class="hl-topo-node"><strong>Electron + Vue 3</strong><span>Stone Desktop UI</span></div>
                  <span class="hl-topo-sep">⇄</span>
                  <div class="hl-topo-node is-accent"><strong>FastAPI Engine</strong><span>127.0.0.1:8001</span></div>
                  <span class="hl-topo-sep">⇄</span>
                  <div class="hl-topo-node"><strong>Local Ollama</strong><span>127.0.0.1:11434</span></div>
                </div>
                <p class="hl-topo-caption">
                  <code>.hyn_agent/</code> — {{ t('会话 JSON、双层记忆、文件快照与影子 Git 引用 100% 存储于本地磁盘，公网外发 0 Byte。', '会話履歴・メモリ・文書スナップショット・シャドウGitはすべてローカル保存（外部送信 0 Byte）。', 'Sessions, memory, file snapshots, and Shadow Git refs remain 100% on local disk (0 Byte egress).') }}
                </p>
              </div>

              <div class="hl-topo-box-card">
                <div class="hl-sheet-subtop">
                  <span>TOPOLOGY B · CORPORATE LAN</span>
                  <em>{{ t('数据不出内网防火墙', '社内閉域網完結', 'Intranet Only') }}</em>
                </div>
                <h4>{{ t('企业内网集群模式（vLLM / SGLang / RAGFlow）', '社内閉域網GPUクラスタ＆RAG共有モデル', 'Corporate Intranet GPU & RAG Cluster') }}</h4>
                <div class="hl-topo-chain">
                  <div class="hl-topo-node"><strong>Helm Client</strong><span>Developer PC</span></div>
                  <span class="hl-topo-sep">⇄</span>
                  <div class="hl-topo-node is-accent"><strong>LAN LLM Gateway</strong><span>vLLM / OneAPI</span></div>
                  <span class="hl-topo-sep">+</span>
                  <div class="hl-topo-node"><strong>LAN RAGFlow</strong><span>{{ t('内部规范库', '社内設計書RAG', 'Internal Spec RAG') }}</span></div>
                </div>
                <p class="hl-topo-caption">
                  <code>lan_server</code> — {{ t('研发团队共享企业内网 GPU 算力与 15 类版面知识库，阻断一切外部云端中转。', 'チームで社内GPUと知識ベースを共有し、外部クラウド中継サーバーを一切経由しません。', 'Share internal GPU clusters and enterprise RAG datasets without any external cloud relay.') }}
                </p>
              </div>
            </div>

            <div class="hl-sheet-subgrid">
              <div class="hl-sheet-subcard">
                <div class="hl-sheet-subtop"><span>PURE ASGI AUTH</span><em>SubFrame Guard</em></div>
                <div class="hl-sheet-subnum hl-tabular">X-HYN-Token</div>
                <strong>{{ t('反 DNS 重绑定与子帧令牌剥离', 'DNSリバインディング防御＆子フレーム分離', 'Anti-DNS-Rebinding & SubFrame Guard') }}</strong>
                <p>{{ t('恒定时间比对进程级随机令牌，严格向预览 iframe 剥离鉴权头，阻断恶意文档越权调用。', '定数時間トークン検証とプレビュー子フレームからのトークン除外を強制。', 'Constant-time token verification while stripping auth headers from preview subframes.') }}</p>
              </div>
              <div class="hl-sheet-subcard">
                <div class="hl-sheet-subtop"><span>OS CRYPTO</span><em>CryptProtectData</em></div>
                <div class="hl-sheet-subnum hl-tabular">DPAPI Vault</div>
                <strong>{{ t('Windows 硬件账户级密钥保险箱', 'Windows OSレベル暗号化保管庫', 'Windows OS-Bound Secret Vault') }}</strong>
                <p>{{ t('API Key 与 MCP OAuth 2.0 凭证经系统级加密落盘，并在日志写盘前自动执行正则脱敏。', 'APIキーやOAuthトークンをOS暗号化し、ログ出力前に自動マスキング。', 'Encrypts API keys and OAuth tokens via Windows DPAPI with pre-write log scrubbing.') }}</p>
              </div>
              <div class="hl-sheet-subcard">
                <div class="hl-sheet-subtop"><span>ZERO-ADMIN</span><em>Self-Healing</em></div>
                <div class="hl-sheet-subnum hl-tabular">System Doctor</div>
                <strong>{{ t('免管理员一键便携工具链自愈', '管理者権限不要の環境自己修復', 'Zero-Admin Toolchain Auto-Repair') }}</strong>
                <p>{{ t('内嵌 Python 3.13，缺失 Git / Node / uvx 时在用户目录沙箱自动拉取便携运行时。', 'Python 3.13 同梱。不足する Git/Node/uvx をユーザー領域へ自動構築。', 'Bundles Python 3.13 and repairs missing MinGit/Node/uvx inside user-space sandboxes.') }}</p>
              </div>
              <div class="hl-sheet-subcard">
                <div class="hl-sheet-subtop"><span>PERMISSION GATE</span><em>0.0% ASR</em></div>
                <div class="hl-sheet-subnum hl-tabular">30 / 30</div>
                <strong>{{ t('5 档实时权限与受保护路径硬门禁', '5段階権限＆保護パス強制ゲート', '5-Tier Permissions & Path Guard') }}</strong>
                <p>{{ t('含零缓存抖动只读 Plan Mode，实测对 30 组路径穿越与高危命令注入实现 100% 拦截。', 'キャッシュを維持する Plan Mode を備え、30種の攻撃ペイロードを 100% 遮断。', 'Includes prefix-safe Plan Mode and blocks 100% (30/30) of adversarial path/shell payloads.') }}</p>
              </div>
            </div>

            <footer class="hl-sheet-footer">
              <button type="button" class="hl-btn hl-btn-ink" @click="go(`${prefix}/architecture/overview`)">
                <span>{{ t('阅读第 1 卷：双进程与 DPAPI 架构白皮书', '白書 第1章：デュアルプロセス安全基盤を読む', 'Read Vol. 01: Dual-Process & DPAPI Whitepaper') }}</span>
              </button>
              <button type="button" class="hl-btn hl-btn-outline" @click="go(`${prefix}/guide/local-models`)">
                <span>{{ t('查看 Ollama 与企业内网配置指南', 'Ollama・社内LAN接続ガイドを見る', 'View Ollama & LAN Setup Guide') }}</span>
              </button>
            </footer>
          </div>

          <!-- Sheet 03: 四层前缀缓存、7级压缩与异构 RAG -->
          <div v-else-if="activeSheet === 'cache'" class="hl-sheet-body">
            <div class="hl-sheet-kpi-grid is-three">
              <div class="hl-sheet-kpi-card">
                <span class="hl-sheet-kpi-code">SWE-BENCH LIVE (120M+ TOKENS)</span>
                <div class="hl-sheet-kpi-val hl-tabular">97.74%</div>
                <strong class="hl-sheet-kpi-lbl">{{ t('实战前缀缓存命中率', '実戦キャッシュヒット率', 'Live Prefix Cache Hit Rate') }}</strong>
                <p class="hl-sheet-kpi-sub">{{ t('单题修复仅 ¥0.27，50 题跑完总计 ¥10.39', '1問解決 ¥0.27・50問完走 ¥10.39', '¥0.27 per solved bug; ¥10.39 for all 50 tasks') }}</p>
              </div>
              <div class="hl-sheet-kpi-card">
                <span class="hl-sheet-kpi-code">PRECACHE-V1 CONTROLLED (160 CALLS)</span>
                <div class="hl-sheet-kpi-val hl-tabular">-57.27%</div>
                <strong class="hl-sheet-kpi-lbl">{{ t('热态计费成本直降 (命中 89.58%)', 'ウォーム課金削減 (ヒット 89.58%)', 'Billable Cost Saved (89.58% Warm)') }}</strong>
                <p class="hl-sheet-kpi-sub">{{ t('意外前缀断层次数从 25 次降至 0 次', '予期せぬキャッシュ破壊 25回 → 0回', 'Unexpected prefix breaks reduced from 25 to 0') }}</p>
              </div>
              <div class="hl-sheet-kpi-card">
                <span class="hl-sheet-kpi-code">RAG-EVAL-V1 (v0 → v3 ABLATION)</span>
                <div class="hl-sheet-kpi-val hl-tabular">100.0%</div>
                <strong class="hl-sheet-kpi-lbl">{{ t('异构文档完整命中率 (MRR 1.000)', '異種文書完全正解率 (MRR 1.000)', 'Strict Multimodal Recall (MRR 1.000)') }}</strong>
                <p class="hl-sheet-kpi-sub">{{ t('由基线 v0 的 36.7% 跃升至 100%，噪声污染 0%', 'v0 の 36.7% から 100% へ向上、ノイズ 0%', 'Lifted from 36.7% (v0) to 100.0% with 0% noise') }}</p>
              </div>
            </div>

            <div class="hl-sheet-block">
              <div class="hl-sheet-block-head">
                <h4>{{ t('为什么常规 Agent 越聊越贵、越压越傻？Helm 的三层记忆工程解法', 'キャッシュ破断と情報欠落を防ぐ3層メモリ機構', 'Three Memory Mechanisms Eliminating Cache Churn & Traceback Loss') }}</h4>
              </div>
              <div class="hl-sheet-subgrid is-three">
                <div class="hl-sheet-subcard">
                  <div class="hl-sheet-subtop"><span>LAYER L1–L4</span><em>SHA-256 Guard</em></div>
                  <strong>{{ t('四层只增前缀（禁止动态篡改 System Prompt）', '4層追記型プレフィックス構造', 'L1–L4 Append-Only Prefix Policy') }}</strong>
                  <p>{{ t('将系统指令、工具集、项目静态记忆与增量对话严格分层锁定；切换只读 Plan Mode 时亦不触发 L1/L2 失效。', 'システム指示・ツール定義・静的記憶・会話を厳格に分離し、Plan Mode 切替時もキャッシュを維持。', 'Locks system prompt, tool schemas, and static memory so even Plan Mode toggles cause zero L1/L2 churn.') }}</p>
                </div>
                <div class="hl-sheet-subcard">
                  <div class="hl-sheet-subtop"><span>7-STAGE COMPACT</span><em>100% Traceback</em></div>
                  <strong>{{ t('缓存经济学延迟去重 + 60/40 头尾保真', 'キャッシュ経済性に基づく7段階圧縮', 'KV-Economics Dedup & 60/40 Preview') }}</strong>
                  <p>{{ t('仅当未来 6 轮省下缓存费大于后缀重建费时才合并重复读取；超长输出保留前 60% 与后 40%，100% 留住末尾报错堆栈。', '将来6ターンの節約額が再構築コストを上回る場合のみ重複排除を実行し、末尾トレースを100%保持。', 'Deduplicates stale reads only when 6-turn cache savings beat rebuild cost; keeps 100% of tail stack traces.') }}</p>
                </div>
                <div class="hl-sheet-subcard">
                  <div class="hl-sheet-subtop"><span>HYBRID RAG v3</span><em>15 Templates</em></div>
                  <strong>{{ t('版面还原 + 章节面包屑 + 时间权重重排', 'レイアウト復元・階層チャンク・時系列リランク', 'Layout Parsing + Breadcrumb + Rerank') }}</strong>
                  <p>{{ t('攻克双栏 PDF 跨栏串行与新旧修订合同冲突，边界外问题拒答率达 100%。', '2段組PDFの文字混入や新旧契約書の競合を解消し、境界外質問は 100% 正確に拒否。', 'Resolves two-column PDF interleaving and superseded contract clauses with 100% OOD refusal.') }}</p>
                </div>
              </div>
            </div>

            <footer class="hl-sheet-footer">
              <button type="button" class="hl-btn hl-btn-ink" @click="go(`${prefix}/benchmarks/precache-v1`)">
                <span>{{ t('查看 Pre-Cache 双轨实测报告', 'Pre-Cache 実証レポートを見る', 'Read Pre-Cache Benchmark Report') }}</span>
              </button>
              <button type="button" class="hl-btn hl-btn-tonal" @click="go(`${prefix}/benchmarks/rag-eval-v1`)">
                <span>{{ t('查看 RAG 4 阶段消融报告', 'RAG 4段階アブレーションを見る', 'Read 4-Stage RAG Report') }}</span>
              </button>
              <button type="button" class="hl-btn hl-btn-outline" @click="go(`${prefix}/architecture/memory-and-rag`)">
                <span>{{ t('阅读第 4 卷白皮书', '白書 第4章を読む', 'Read Vol. 04 Whitepaper') }}</span>
              </button>
            </footer>
          </div>

          <!-- Sheet 04: 双模工作台、Worktree 并行与四维全栈消融 -->
          <div v-else-if="activeSheet === 'workbench'" class="hl-sheet-body">
            <div class="hl-sheet-block">
              <div class="hl-sheet-block-head">
                <h4>{{ t('四维架构壁垒与多模态全栈消融实证（点击卡片直达对应证据包）', '4次元アーキテクチャ＆マルチモーダル実証マトリクス', 'Four-Dimension Full-Stack & Multimodal Empirical Matrix') }}</h4>
                <span class="hl-pill-tag is-accent">{{ t('6 大实测套件 · SHA-256 验签', '全6スイート SHA-256 署名済', '6 Signed Suites') }}</span>
              </div>
              <div class="hl-sheet-subgrid">
                <div
                  v-for="ab in fullStackAblations"
                  :key="ab.code"
                  class="hl-sheet-subcard is-clickable"
                  @click="go(`${prefix}/benchmarks/${ab.slug}`)"
                >
                  <div class="hl-sheet-subtop">
                    <span>{{ ab.code }}</span>
                    <em>{{ ab.badge }}</em>
                  </div>
                  <div class="hl-sheet-subnum hl-tabular">{{ ab.metric }}</div>
                  <strong>{{ ab.title }}</strong>
                  <p>{{ ab.desc }}</p>
                  <span class="hl-sheet-sublink">{{ t('打开实测报告与证据包 →', '実証レポートを開く →', 'Open Report & Evidence →') }}</span>
                </div>
              </div>
            </div>

            <footer class="hl-sheet-footer">
              <button type="button" class="hl-btn hl-btn-ink" @click="go(`${prefix}/benchmarks/harness-ablation-v1`)">
                <span>{{ t('查看 Harness 护栏与 Worktree 报告', 'Harness・Worktree レポートを見る', 'Read Harness & Worktree Report') }}</span>
              </button>
              <button type="button" class="hl-btn hl-btn-tonal" @click="go(`${prefix}/benchmarks/gaia-mini-v1`)">
                <span>{{ t('查看 GAIA 30 题多步办公报告', 'GAIA 30問実証レポートを見る', 'Read GAIA 30-Task Report') }}</span>
              </button>
              <button type="button" class="hl-btn hl-btn-outline" @click="go(`${prefix}/architecture/workbench`)">
                <span>{{ t('阅读第 5 卷：双模工作台架构', '白書 第5章：ワークベンチ設計', 'Read Vol. 05: Workbench') }}</span>
              </button>
            </footer>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.hl-sheet-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background-color: var(--hl-backdrop);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
}

.hl-sheet-panel {
  width: 100%;
  max-width: 1020px;
  max-height: min(88vh, 860px);
  overflow-y: auto;
  background-color: var(--hl-surface-sheet);
  border: 1px solid var(--hl-border-soft);
  border-radius: var(--hl-radius-2xl);
  box-shadow: var(--hl-shadow-sheet);
  color: var(--hl-ink);
}

.hl-sheet-topbar {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 32px 18px;
  background-color: var(--hl-surface-frosted);
  backdrop-filter: saturate(180%) blur(18px);
  -webkit-backdrop-filter: saturate(180%) blur(18px);
  border-bottom: 1px solid var(--hl-border);
}

.hl-sheet-eyebrow {
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--hl-accent);
  margin-bottom: 4px;
}

.hl-sheet-title {
  margin: 0;
  font-size: clamp(19px, 2.2vw, 24px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: var(--hl-ink);
}

.hl-sheet-close {
  width: 36px;
  height: 36px;
  border-radius: var(--hl-radius-pill);
  border: 0;
  background-color: var(--hl-surface-plus);
  color: var(--hl-ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: background-color 160ms var(--hl-ease), color 160ms var(--hl-ease), transform 160ms var(--hl-ease);
}

.hl-sheet-close:hover {
  background-color: var(--hl-ink);
  color: var(--hl-on-ink);
  transform: scale(1.04);
}

.hl-sheet-body {
  padding: 28px 32px 32px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.hl-sheet-kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.hl-sheet-kpi-card {
  padding: 18px 20px;
  border-radius: var(--hl-radius-lg);
  background-color: var(--hl-surface-alt);
  border: 1px solid var(--hl-border-soft);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hl-sheet-kpi-code {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--hl-ink-4);
}

.hl-sheet-kpi-val {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--hl-ink);
  line-height: 1.15;
  margin: 2px 0;
}

.hl-sheet-kpi-lbl {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--hl-ink);
}

.hl-sheet-kpi-sub {
  margin: 2px 0 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--hl-ink-3);
}

.hl-sheet-block {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hl-sheet-block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.hl-sheet-block-head h4 {
  margin: 0;
  font-size: 16.5px;
  font-weight: 650;
  letter-spacing: -0.015em;
  color: var(--hl-ink);
}

.hl-sheet-table-wrap {
  width: 100%;
  overflow-x: auto;
  border-radius: var(--hl-radius-lg);
  border: 1px solid var(--hl-border);
  background-color: var(--hl-surface);
}

.hl-sheet-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  text-align: left;
}

.hl-sheet-table th {
  padding: 12px 14px;
  background-color: var(--hl-surface-alt);
  color: var(--hl-ink-3);
  font-weight: 600;
  font-size: 12px;
  border-bottom: 1px solid var(--hl-border);
  white-space: nowrap;
}

.hl-sheet-table td {
  padding: 13px 14px;
  border-bottom: 1px solid var(--hl-border);
  color: var(--hl-ink-2);
  vertical-align: top;
  line-height: 1.5;
}

.hl-sheet-table tbody tr:last-child td {
  border-bottom: 0;
}

.hl-sheet-table td strong {
  display: block;
  color: var(--hl-ink);
  font-weight: 600;
}

.hl-sheet-table td small {
  display: block;
  margin-top: 2px;
  font-size: 11.5px;
  color: var(--hl-ink-4);
}

.hl-sheet-table td code {
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 2px 6px;
  border-radius: var(--hl-radius-xs);
  background-color: var(--hl-surface-tonal);
  color: var(--hl-ink);
  white-space: nowrap;
}

.hl-sheet-table tr.is-helm {
  background-color: var(--hl-accent-soft);
}

.hl-sheet-table tr.is-helm td.is-score {
  font-weight: 700;
  color: var(--hl-accent);
}

.hl-sheet-note {
  padding: 14px 18px;
  border-radius: var(--hl-radius-md);
  background-color: var(--hl-surface-alt);
  border: 1px solid var(--hl-border);
}

.hl-sheet-note p {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: var(--hl-ink-3);
}

.hl-sheet-note strong {
  color: var(--hl-ink);
}

.hl-sheet-subgrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.hl-sheet-subgrid.is-three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.hl-sheet-subcard {
  padding: 18px 20px;
  border-radius: var(--hl-radius-lg);
  background-color: var(--hl-surface-alt);
  border: 1px solid var(--hl-border-soft);
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 160ms var(--hl-ease), transform 160ms var(--hl-ease), box-shadow 160ms var(--hl-ease);
}

.hl-sheet-subcard.is-clickable {
  cursor: pointer;
}

.hl-sheet-subcard.is-clickable:hover {
  transform: translateY(-2px);
  border-color: var(--hl-accent-border);
  box-shadow: var(--hl-shadow-bento-hover);
}

.hl-sheet-subtop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--hl-ink-4);
}

.hl-sheet-subtop em {
  font-style: normal;
  font-family: var(--font-ui);
  font-weight: 600;
  color: var(--hl-ok);
  background-color: var(--hl-ok-soft);
  padding: 2px 8px;
  border-radius: var(--hl-radius-pill);
}

.hl-sheet-subnum {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--hl-ink);
}

.hl-sheet-subcard strong {
  font-size: 14.5px;
  color: var(--hl-ink);
}

.hl-sheet-subcard p {
  margin: 0;
  font-size: 13px;
  line-height: 1.58;
  color: var(--hl-ink-3);
}

.hl-sheet-sublink {
  margin-top: auto;
  padding-top: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--hl-accent);
}

/* 零出网双拓扑块 */
.hl-topo-pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.hl-topo-box-card {
  padding: 20px 22px;
  border-radius: var(--hl-radius-lg);
  background-color: var(--hl-surface-alt);
  border: 1px solid var(--hl-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hl-topo-box-card h4 {
  margin: 0;
  font-size: 15.5px;
  font-weight: 650;
  color: var(--hl-ink);
}

.hl-topo-chain {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.hl-topo-node {
  flex: 1 1 110px;
  min-width: 0;
  padding: 10px 12px;
  border-radius: var(--hl-radius-md);
  background-color: var(--hl-surface);
  border: 1px solid var(--hl-border);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hl-topo-node.is-accent {
  border-color: var(--hl-accent-border);
  background-color: var(--hl-accent-soft);
}

.hl-topo-node strong {
  font-size: 12.5px;
  color: var(--hl-ink);
}

.hl-topo-node span {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--hl-ink-4);
}

.hl-topo-sep {
  font-weight: 700;
  color: var(--hl-ink-4);
}

.hl-topo-caption {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--hl-ink-3);
}

.hl-topo-caption code {
  font-family: var(--font-mono);
  padding: 1px 6px;
  border-radius: var(--hl-radius-xs);
  background-color: var(--hl-surface);
  color: var(--hl-ink);
}

.hl-sheet-footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--hl-border);
}

.hl-sheet-fade-enter-active,
.hl-sheet-fade-leave-active {
  transition: opacity 180ms var(--hl-ease);
}

.hl-sheet-fade-enter-active .hl-sheet-panel,
.hl-sheet-fade-leave-active .hl-sheet-panel {
  transition: transform 200ms var(--hl-ease);
}

.hl-sheet-fade-enter-from,
.hl-sheet-fade-leave-to {
  opacity: 0;
}

.hl-sheet-fade-enter-from .hl-sheet-panel,
.hl-sheet-fade-leave-to .hl-sheet-panel {
  transform: translateY(14px) scale(0.985);
}

@media (max-width: 900px) {
  .hl-sheet-kpi-grid,
  .hl-sheet-subgrid.is-three,
  .hl-topo-pair {
    grid-template-columns: 1fr;
  }

  .hl-sheet-subgrid {
    grid-template-columns: 1fr;
  }

  .hl-sheet-topbar,
  .hl-sheet-body {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>
