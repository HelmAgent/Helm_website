<script setup>
/**
 * 独立宽屏在线交互沙盒页面组件（DemoShowcasePage.vue）。
 *
 * 职责与协作：
 * - 用于 `/demo`、`/ja/demo`、`/en/demo`（配合 `layout: page` 脱离 VitePress 默认 688px 窄文档容器）。
 * - 严格隔离三语文案：中文界面不出现任何日语词汇；日语界面采用地道自然的日本软件工程术语。
 */
import { computed } from 'vue'
import ProductPlayground from './ProductPlayground.vue'

const props = defineProps({
  lang: {
    type: String,
    default: 'zh'
  }
})

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

const specs = computed(() => [
  {
    code: 'SCENARIO 01 // P0–P3 ENGINE',
    title: tt('离线长程自治与影子 Git 检查点', 'オフライン長時間自律稼働＆シャドウGitチェックポイント', 'Offline Long-Horizon & Shadow Git Checkpoints'),
    items: [
      tt('点击对话区工具卡片（apply_patch / run_powershell）展开查看单测输出', 'ツールカード（apply_patch / run_powershell）をクリックしてテスト出力を展開', 'Click tool cards (apply_patch / run_powershell) to inspect outputs'),
      tt('在右侧工作台切换 CP-01 / CP-02 查看私有引用 refs/hyn/checkpoints/ 的 Git Diff', '右ペインで CP-01 / CP-02 を切り替え、専用ref（refs/hyn/checkpoints/）の差分を確認', 'Switch CP-01 / CP-02 on the right pane to compare Git diffs'),
      tt('点击底部「FULL_AUTO」切换 4 档实时权限，或点击「24% · 31k/128k」查看 Prefix Cache 监控', '下部の権限ボタンで4段階モードをリアルタイム切替、またはキャッシュヒット率を確認', 'Toggle 4-tier live permissions or inspect Prefix Cache metrics at the bottom')
    ]
  },
  {
    code: 'SCENARIO 02 // OFFICE WORKBENCH',
    title: tt('WPS 级多格式工作台与划取 AI 局部热替换', 'WPS級ドキュメントワークベンチ＆選択範囲AIインプレース編集', 'WPS-Grade Office Workbench & Selection AI Patch'),
    items: [
      tt('右侧分栏原生预览 PPTX / DOCX / XLSX，顶部配备完整格式工具栏与 5 版本快照', '右ペインで Office 文書を高精細プレビューし、最大5世代の自動スナップショットを保持', 'Right-pane native preview with formatting toolbar and 5-version snapshots'),
      tt('直接点击右侧幻灯片虚线框或「AI 修改 (Ctrl+L)」，观察 SSE 原地无闪烁热替换', 'スライド内の破線枠または「AI編集 (Ctrl+L)」をクリックし、SSEによる即時反映を体験', 'Click the dashed slide shape or "AI Edit (Ctrl+L)" for instant SSE hot-reloading'),
      tt('自动过滤中间生成脚本（.py），仅在对话流呈现最终交付产物卡片', '中間生成スクリプト（.py）を自動除外し、最終成果物カードのみをチャット欄に提示', 'Automatically filters intermediate .py scripts, showing only final deliverables')
    ]
  },
  {
    code: 'SCENARIO 03 // GIT WORKTREES',
    title: tt('主从多智能体团队与 Git Worktree 物理隔离', '常駐マルチエージェントチームと Git Worktree 物理分離', 'Multi-Agent Team & Git Worktree Isolation'),
    items: [
      tt('Lead 主代理统筹 3 名常驻队友，各自绑定独立 .hyn_wt/* 工作树并行开发', 'リードエージェントが3名の常駐チームメイトを統括し、独立した .hyn_wt/* 上で並列実装', 'Lead coordinates 3 resident teammates in isolated .hyn_wt/* worktrees'),
      tt('点击 mate-frontend 卡片上的「批准队友重构计划」，体验只读安全门禁解锁过程', 'mate-frontend の「実装計画を承認」をクリックし、読取専用ゲートの解除を確認', 'Click "Approve Teammate Plan" on mate-frontend to unlock workspace writes'),
      tt('异步内存收件箱（Zero-Polling Inbox）汇总结果，杜绝主对话上下文爆炸', '非同期インボックスで完了報告を集約し、メイン会話のコンテキスト肥大化を防止', 'Zero-polling inbox aggregates results without polluting main context')
    ]
  }
])
</script>

<template>
  <div class="demo-page">
    <div class="demo-container">
      <header class="demo-header">
        <div class="demo-header-left">
          <div class="demo-kicker">ZERO-INSTALL BROWSER SANDBOX // 1:1 STONE UI REPLICA</div>
          <h1 class="demo-title">
            {{ tt('浏览器免安装交互工作台', 'ブラウザ対話型ワークベンチ（インストール不要）', 'Interactive Desktop Workbench (Zero Install)') }}
          </h1>
          <p class="demo-sub">
            {{ tt(
              '针对企业办公电脑受安全策略限制不便安装外部可执行文件的场景，下方工作台以 1:1 比例完整还原了 HYN Agent 桌面客户端的「石澜」界面与三栏协同交互。您可直接点击顶部场景或开启「自动巡航演示」。',
              '社内セキュリティ規定により外部実行ファイル（.exe）の導入が制限されている環境向けに、HYN Agent デスクトップ版の「石瀾（Stone）」3ペインUIをブラウザ上で完全再現しました。上部のシナリオ切替または「自動ツアー再生」からお試しください。',
              'Designed for corporate environments where installing external executables is restricted. Interact directly with HYN Agent’s 3-pane Stone UI or launch the Auto-Play Tour below.'
            ) }}
          </p>
        </div>
        <div class="demo-header-right">
          <a class="stone-btn is-primary" :href="`${prefix}/download`">
            {{ tt('获取 Windows 桌面客户端', 'Windows デスクトップ版を入手', 'Download Windows Client') }}
          </a>
          <a class="stone-btn" :href="`${prefix}/architecture/overview`">
            {{ tt('审阅工程架构白皮书 →', '技術アーキテクチャ白書を見る →', 'Architecture Whitepaper →') }}
          </a>
        </div>
      </header>

      <ProductPlayground :lang="lang" :standalone="true" />

      <section class="demo-spec-grid">
        <div v-for="s in specs" :key="s.code" class="demo-spec-cell">
          <div class="demo-spec-code">{{ s.code }}</div>
          <h3 class="demo-spec-title">{{ s.title }}</h3>
          <ul class="demo-spec-list">
            <li v-for="(line, i) in s.items" :key="i">{{ line }}</li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.demo-page {
  background: #ffffff;
  min-height: calc(100vh - 64px);
  padding: 36px 24px 72px;
}

.demo-container {
  max-width: 1320px;
  margin: 0 auto;
}

.demo-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  padding-bottom: 24px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-subtle);
}

.demo-header-left {
  max-width: 820px;
}

.demo-kicker {
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--accent);
  margin-bottom: 8px;
}

.demo-title {
  margin: 0 0 10px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.demo-sub {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: var(--text-secondary);
}

.demo-header-right {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.demo-spec-grid {
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
  overflow: hidden;
}

.demo-spec-cell {
  padding: 22px 24px;
  background: #ffffff;
  border-right: 1px solid var(--border-subtle);
}

.demo-spec-cell:last-child {
  border-right: none;
}

.demo-spec-code {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--accent);
  margin-bottom: 6px;
}

.demo-spec-title {
  margin: 0 0 10px;
  font-size: 15.5px;
  font-weight: 700;
  color: var(--text-primary);
}

.demo-spec-list {
  margin: 0;
  padding-left: 16px;
  font-size: 12.5px;
  line-height: 1.65;
  color: var(--text-secondary);
}

.demo-spec-list li + li {
  margin-top: 6px;
}

@media (max-width: 960px) {
  .demo-spec-grid {
    grid-template-columns: 1fr;
  }
  .demo-spec-cell {
    border-right: none;
    border-bottom: 1px solid var(--border-subtle);
  }
}
</style>
