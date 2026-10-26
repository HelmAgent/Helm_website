<script setup>
/**
 * 旗舰全屏交互式工作台体验页（DemoView.vue）。
 *
 * 职责与协作：
 * - 对应 `/demo`、`/ja/demo`、`/en/demo`。
 * - 采用深邃黑曜石舞台承载 1320px 宽屏 1:1 桌面端交互工作台（ProductPlayground），并附带三大交互剧本操作指引卡片。
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
    code: 'SCENARIO 01 // P0–P3 AUTONOMOUS ENGINE',
    title: t('离线长程自治与无侵入影子 Git 检查点', 'オフライン長時間自律稼働＆シャドウGitチェックポイント', 'Offline Long-Horizon & Shadow Git Checkpoints'),
    items: [
      t('点击对话区工具卡片（apply_patch / run_powershell）展开检视自动化单测输出', 'ツールカード（apply_patch / run_powershell）をクリックして単体テスト出力を展開', 'Click tool cards (apply_patch / run_powershell) to inspect automated test outputs'),
      t('在右侧工作台切换 CP-01 / CP-02，对比私有命名空间 refs/hyn/checkpoints/ 的 Git Diff', '右ペインで CP-01 / CP-02 を切り替え、専用ref（refs/hyn/checkpoints/）の差分を確認', 'Switch CP-01 / CP-02 in the right pane to compare private Git ref diffs'),
      t('点击底部书写栏的「FULL_AUTO」切换 4 档实时权限，或点击「24% · 31k/128k」查看 Prefix Cache 监控', '下部の権限ボタンで4段階モードをリアルタイム切替、またはキャッシュヒット率を確認', 'Toggle 4-tier live permissions or inspect Prefix Cache metrics at the bottom bar')
    ]
  },
  {
    code: 'SCENARIO 02 // SURGICAL OFFICE WORKBENCH',
    title: t('WPS 级多格式工作台与划词 AI 局部热补丁', '高精細 Office ワークベンチ＆選択範囲AIインプレース更新', 'WPS-Grade Office Workbench & Selection AI Patch'),
    items: [
      t('右侧分栏原生渲染 PPTX / DOCX / XLSX，顶部配备完整格式工具栏与 5 版本文件快照', '右ペインで Office 文書を高精細プレビューし、最大5世代の自動スナップショットを保持', 'Right-pane native preview with formatting toolbar and 5-generation file snapshots'),
      t('直接点击右侧幻灯片虚线框或「AI 修改 (Ctrl+L)」，观察 SSE 原地无闪烁热替换', 'スライド内の破線枠または「AI編集 (Ctrl+L)」をクリックし、SSEによる即時反映を体験', 'Click the dashed slide shape or "AI Edit (Ctrl+L)" for instant SSE hot-reloading'),
      t('自动过滤中间生成脚本（.py），仅在对话流呈现最终交付产物卡片', '中間生成スクリプト（.py）を自動除外し、最終成果物カードのみをチャット欄に提示', 'Automatically filters intermediate .py scripts, showing only final deliverables')
    ]
  },
  {
    code: 'SCENARIO 03 // GIT WORKTREE AGENT TEAM',
    title: t('主从多智能体常驻团队与 Git Worktree 物理隔离', '常駐マルチエージェントチームと Git Worktree 物理分離', 'Multi-Agent Resident Team & Git Worktree Isolation'),
    items: [
      t('Lead 主代理统筹 3 名常驻队友，各自绑定独立 .hyn_wt/* 工作树并行开发', 'リードエージェントが3名の常駐チームメイトを統括し、独立した .hyn_wt/* 上で並列実装', 'Lead coordinates 3 resident teammates in isolated .hyn_wt/* worktrees'),
      t('点击 mate-frontend 卡片上的「批准队友重构计划」，体验只读安全门禁解锁过程', 'mate-frontend の「実装計画を承認」をクリックし、読取専用ゲートの解除を確認', 'Click "Approve Teammate Plan" on mate-frontend to unlock workspace writes'),
      t('零轮询异步内存收件箱（Zero-Polling Inbox）汇总结果，杜绝主对话上下文膨胀', '非同期インボックスで完了報告を集約し、メイン会話のコンテキスト肥大化を防止', 'Zero-polling async inbox aggregates results without polluting main context')
    ]
  }
])
</script>

<template>
  <div class="nx-demo-view">
    <div class="nx-container">
      <!-- 顶部标题与导航操作 -->
      <div class="nx-demo-head">
        <div class="nx-demo-head-left">
          <div class="nx-sec-kicker">
            <span class="nx-pulse-dot"></span>
            <span>INTERACTIVE WEB WORKBENCH // 1:1 STONE DESKTOP REPLICA</span>
          </div>
          <h1 class="nx-demo-title">
            {{
              t(
                'Helm 在线交互工作台（1:1 桌面端实机复刻）',
                'Helm Web対話型ワークベンチ（実機UI 1:1再現）',
                'Helm Interactive Web Workbench (1:1 Desktop UI Replica)'
              )
            }}
          </h1>
          <p class="nx-demo-sub">
            {{
              t(
                '可直接在下方 1320px 宽屏工作台中切换三大工程场景、展开工具调用栈、对比影子 Git 检查点、触发 PPT 划词局部 AI 热更新或审批多智能体 Worktree 计划。',
                '1320px ワイド画面のまま3つの主要シナリオを切り替え、ツール実行ログの展開、シャドウGit差分の比較、PPTの選択範囲AI修正、マルチエージェント計画の承認を直接操作いただけます。',
                'Test all core workflows directly in your browser: switch across 3 engineering scenarios, inspect Shadow Git diffs, trigger surgical PPT AI patches, and approve Git Worktree teammate plans.'
              )
            }}
          </p>
        </div>

        <div class="nx-demo-head-actions">
          <a
            class="nx-btn nx-btn-primary"
            :href="`${prefix}/download`"
            @click.prevent="navigate(`${prefix}/download`)"
          >
            {{ t('下载 Windows 客户端 →', 'Windows版をダウンロード →', 'Download Windows Client →') }}
          </a>
          <a
            class="nx-btn nx-btn-glass"
            :href="`${prefix}/architecture/overview`"
            @click.prevent="navigate(`${prefix}/architecture/overview`)"
          >
            {{ t('工程架构白皮书 (全 5 卷)', '技術アーキテクチャ白書 (全5章)', 'Architecture Blueprint') }}
          </a>
        </div>
      </div>

      <!-- 1320px 全尺寸交互工作台舞台 -->
      <div class="nx-demo-stage-wrap">
        <ProductPlayground :lang="currentLang" :standalone="true" />
      </div>

      <!-- 三大交互剧本操作指南卡片 -->
      <div class="nx-demo-guide-grid">
        <div v-for="sc in scenarios" :key="sc.code" class="nx-demo-card nx-glass-card">
          <div class="nx-demo-card-code">{{ sc.code }}</div>
          <h3 class="nx-demo-card-title">{{ sc.title }}</h3>
          <ul class="nx-demo-card-list">
            <li v-for="(item, idx) in sc.items" :key="idx">{{ item }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nx-demo-view {
  position: relative;
  z-index: 5;
  padding: 44px 0 40px;
}

.nx-demo-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 28px;
}

.nx-demo-head-left {
  max-width: 820px;
}

.nx-demo-title {
  margin: 0 0 12px;
  font-size: clamp(26px, 3vw, 36px);
  font-weight: 850;
  letter-spacing: -0.025em;
  color: #ffffff;
}

.nx-demo-sub {
  margin: 0;
  font-size: 14.5px;
  line-height: 1.68;
  color: #94a3b8;
}

.nx-demo-head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.nx-demo-stage-wrap {
  margin-bottom: 32px;
}

.nx-demo-guide-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.nx-demo-card {
  padding: 24px;
}

.nx-demo-card-code {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #38bdf8;
  margin-bottom: 8px;
}

.nx-demo-card-title {
  margin: 0 0 12px;
  font-size: 16.5px;
  font-weight: 750;
  color: #f8fafc;
}

.nx-demo-card-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  line-height: 1.58;
  color: #cbd5e1;
}

@media (max-width: 1024px) {
  .nx-demo-guide-grid {
    grid-template-columns: 1fr;
  }
}
</style>
