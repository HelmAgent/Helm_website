<script setup>
/**
 * DemoView.vue — 1:1 桌面端交互工作台全尺寸体验中心
 *
 * 职责与协作：
 * - 对应 `/demo`、`/ja/demo`、`/en/demo`。
 * - 采用极昼纯净画布承载 1320px 宽幅 `ProductPlayground`，下方辅以三大剧本的 Apple Bento 操作指引。
 * - 严格使用 `flagship.css` 语义令牌，零硬编码色值。
 */
import { computed } from 'vue'
import { tt, getLangPrefix } from '../data/siteData.js'
import { useAppRouter } from '../router.js'
import ProductPlayground from '../components/ProductPlayground.vue'

const { currentLang, navigate } = useAppRouter()
const prefix = computed(() => getLangPrefix(currentLang.value))

function t(zh, ja, en) {
  return tt(currentLang.value, zh, ja, en)
}

const scenarios = computed(() => [
  {
    num: '01',
    code: 'AUTONOMOUS ENGINE & SHADOW GIT',
    title: t('离线长程自治与影子 Git 检查点', 'オフライン自律実行＆シャドウGit', 'Long-Horizon & Shadow Git'),
    items: [
      t('点击对话区工具卡片（apply_patch / run_powershell）展开真实单测输出', 'ツールカードをクリックして単体テスト実行ログを展開', 'Click tool cards to inspect automated test outputs'),
      t('在右侧切换 CP-01 / CP-02，对比私有 refs/hyn/checkpoints/ 的 Git Diff', '右ペインで CP-01 / CP-02 を切り替え専用Git差分を確認', 'Switch CP-01 / CP-02 to compare private Git ref diffs'),
      t('点击底部书写栏切换 5 档实时权限（含 Plan Mode）或查看缓存监控', '下部のボタンで5段階権限（Plan Mode含む）やキャッシュを切替', 'Toggle 5-tier permissions (Plan Mode) or inspect cache stats')
    ]
  },
  {
    num: '02',
    code: 'SURGICAL OFFICE WORKBENCH',
    title: t('高保真文档工作台与划词热补丁', '高精細 Office ＆選択範囲AI更新', 'Visual Office & Surgical Patch'),
    items: [
      t('右侧分栏原生渲染 PPTX / DOCX / XLSX，内置 5 版本文件快照回退', '右ペインで Office 文書を高精細表示し5世代スナップショットを保持', 'Right-pane native preview with 5-generation file snapshots'),
      t('点击右侧幻灯片虚线框或「AI 修改 (Ctrl+L)」，观察 SSE 原地热替换', 'スライド内の破線枠をクリックし SSE 即時反映を体験', 'Click the dashed slide shape for instant SSE hot-reloading'),
      t('自动隐藏中间脚本（.py），仅在对话流干净交付最终办公产物卡片', '中間スクリプトを除外し最終成果物カードのみを提示', 'Filters intermediate scripts, surfacing clean deliverable cards')
    ]
  },
  {
    num: '03',
    code: 'GIT WORKTREE AGENT TEAM',
    title: t('常驻智能体团队与 Worktree 隔离', '常駐チーム＆ Git Worktree 分離', 'Agent Team & Git Worktrees'),
    items: [
      t('主代理统筹最多 8 名常驻队友，各自锁定独立 .worktrees/* 并行开发', 'リードが最大8メイトを統括し独立 .worktrees/* で並列実装', 'Lead coordinates up to 8 teammates in isolated .worktrees/*'),
      t('点击 mate-frontend 上的「批准队友重构计划」，体验物理写门禁解锁', '「実装計画を承認」をクリックし変更ツールゲートの解除を確認', 'Click "Approve Teammate Plan" to unlock workspace writes'),
      t('零轮询分级信箱汇总各队友进度，杜绝主对话上下文膨胀', '非同期受信箱で報告を集約しメインコンテキスト肥大化を防止', 'Classified async inbox aggregates results cleanly')
    ]
  }
])
</script>

<template>
  <div class="hl-demo-page">
    <section class="hl-demo-header">
      <div class="hl-container hl-demo-head-row">
        <div class="hl-demo-intro">
          <p class="hl-eyebrow">1:1 INTERACTIVE DESKTOP SANDBOX</p>
          <h1 class="hl-demo-title">
            {{
              t(
                'Helm 在线交互工作台（1:1 桌面端复刻）',
                'Helm 対話型ワークベンチ（実機UI 1:1再現）',
                'Helm Interactive Workbench (1:1 Desktop Replica)'
              )
            }}
          </h1>
          <p class="hl-demo-desc">
            {{
              t(
                '无需安装即可在浏览器中完整操作桌面端界面：切换三大剧本、展开工具调用栈、对比影子检查点、触发 PPT 划词热更新或审批多智能体计划。',
                'ブラウザ上で3つの主要シナリオを切り替え、ツールログ展開・シャドウGit差分・PPT部分更新・Worktree計画承認を直接操作できます。',
                'Explore all core workflows live in your browser: inspect Shadow Git diffs, trigger surgical PPT patches, and approve Git Worktree plans.'
              )
            }}
          </p>
        </div>

        <div class="hl-demo-actions">
          <a
            class="hl-btn hl-btn-ink"
            :href="`${prefix}/download`"
            @click.prevent="navigate(`${prefix}/download`)"
          >
            <span>{{ t('下载 Windows 客户端', 'Windows 版をダウンロード', 'Download for Windows') }}</span>
          </a>
          <a
            class="hl-btn hl-btn-outline"
            :href="`${prefix}/architecture/overview`"
            @click.prevent="navigate(`${prefix}/architecture/overview`)"
          >
            <span>{{ t('阅读 6 卷架构白皮书', '技術白書（全6章）', '6-Vol Whitepaper') }}</span>
          </a>
        </div>
      </div>
    </section>

    <section class="hl-demo-stage">
      <div class="hl-container-wide">
        <ProductPlayground :lang="currentLang" :standalone="true" />
      </div>

      <div class="hl-container hl-demo-guides">
        <article v-for="sc in scenarios" :key="sc.num" class="hl-bento-card hl-guide-card">
          <div class="hl-guide-top">
            <span class="hl-guide-num hl-tabular">{{ sc.num }}</span>
            <span class="hl-guide-code">{{ sc.code }}</span>
          </div>
          <h3>{{ sc.title }}</h3>
          <ul>
            <li v-for="(it, idx) in sc.items" :key="idx">{{ it }}</li>
          </ul>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hl-demo-page {
  background-color: var(--hl-surface-alt);
  color: var(--hl-ink);
  padding-bottom: 88px;
}

.hl-demo-header {
  background-color: var(--hl-bg);
  padding: 52px 0 40px;
  border-bottom: 1px solid var(--hl-border);
}

.hl-demo-head-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.hl-demo-intro {
  max-width: 720px;
}

.hl-demo-title {
  margin: 0;
  font-size: clamp(28px, 3.6vw, 42px);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.028em;
  color: var(--hl-ink);
}

.hl-demo-desc {
  margin: 12px 0 0;
  font-size: 15.5px;
  line-height: 1.62;
  color: var(--hl-ink-3);
}

.hl-demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hl-demo-stage {
  padding-top: 32px;
}

.hl-demo-guides {
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.hl-guide-card {
  padding: 26px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.hl-guide-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.hl-guide-num {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--hl-accent);
}

.hl-guide-code {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--hl-ink-4);
}

.hl-guide-card h3 {
  margin: 0 0 12px;
  font-size: 16.5px;
  font-weight: 650;
  color: var(--hl-ink);
}

.hl-guide-card ul {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13.5px;
  line-height: 1.58;
  color: var(--hl-ink-3);
}

@media (max-width: 980px) {
  .hl-demo-guides {
    grid-template-columns: 1fr;
  }
}
</style>
