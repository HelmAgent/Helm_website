<script setup>
/**
 * 旗舰企业级工程架构白皮书与部署指南阅读器（WhitepaperView.vue）。
 *
 * 职责与协作：
 * - 彻底取代 VitePress 默认的 `.VPDoc` 与 `.VPSidebar`，使内页与首页 100% 统一在「风格 1：深邃科技旗舰风」视觉体系下。
 * - 自动加载 `docs/architecture/*` 与 `docs/guide/*` 的中/日/英三语 Markdown 原文，并通过 `markdownRenderer.js` + `mermaid` 渲染深色矢量拓扑图与可复制代码块。
 */
import { computed, watch, onMounted, nextTick } from 'vue'
import {
  tt,
  getLangPrefix,
  getArchitectureChapters,
  getGuideChapters
} from '../data/siteData.js'
import { getMarkdownByRoute } from '../data/docsRegistry.js'
import { renderEnterpriseMarkdown } from '../utils/markdownRenderer.js'
import { useAppRouter } from '../router.js'

const { currentPath, currentLang, strippedPath, navigate, openAuditModal } = useAppRouter()

const prefix = computed(() => getLangPrefix(currentLang.value))
const archChapters = computed(() => getArchitectureChapters(currentLang.value))
const guideChapters = computed(() => getGuideChapters(currentLang.value))

function t(zh, ja, en) {
  return tt(currentLang.value, zh, ja, en)
}

const allItems = computed(() => [...archChapters.value, ...guideChapters.value])

const currentMeta = computed(() => {
  return allItems.value.find((it) => it.slug === strippedPath.value) || archChapters.value[0]
})

const currentIndex = computed(() => {
  return allItems.value.findIndex((it) => it.slug === strippedPath.value)
})

const prevChapter = computed(() => {
  if (currentIndex.value > 0) return allItems.value[currentIndex.value - 1]
  return null
})

const nextChapter = computed(() => {
  if (currentIndex.value >= 0 && currentIndex.value < allItems.value.length - 1) {
    return allItems.value[currentIndex.value + 1]
  }
  return null
})

const renderedDoc = computed(() => {
  const raw = getMarkdownByRoute(currentPath.value)
  return renderEnterpriseMarkdown(raw)
})

async function renderMermaidDiagrams() {
  if (typeof window === 'undefined') return
  const stages = document.querySelectorAll('.nx-mermaid-stage[data-mermaid]')
  if (!stages.length) return

  try {
    const mermaidModule = await import('mermaid')
    const mermaid = mermaidModule.default || mermaidModule
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#070b14',
        primaryColor: '#172554',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#38bdf8',
        lineColor: '#60a5fa',
        secondaryColor: '#0f172a',
        tertiaryColor: '#1e293b',
        fontFamily: '"Inter", "Segoe UI", "Yu Gothic UI", "Microsoft YaHei UI", sans-serif',
        fontSize: '13px'
      }
    })

    for (let i = 0; i < stages.length; i++) {
      const el = stages[i]
      if (el.dataset.rendered === '1') continue
      const rawCode = decodeURIComponent(el.dataset.mermaid || '')
      if (!rawCode) continue
      const id = `nx-mermaid-${Date.now()}-${i}`
      const { svg } = await mermaid.render(id, rawCode)
      el.innerHTML = svg
      el.dataset.rendered = '1'
    }
  } catch (err) {
    console.warn('[Helm Blueprint Reader] Mermaid render skipped:', err)
  }
}

function handleArticleClick(e) {
  const copyBtn = e.target.closest('[data-copy-code]')
  if (copyBtn) {
    const raw = decodeURIComponent(copyBtn.dataset.copyCode || '')
    if (navigator.clipboard && raw) {
      navigator.clipboard.writeText(raw)
      const orig = copyBtn.textContent
      copyBtn.textContent = 'COPIED ✓'
      setTimeout(() => {
        copyBtn.textContent = orig
      }, 1800)
    }
    return
  }

  const internalLink = e.target.closest('a[data-internal-link="true"]')
  if (internalLink) {
    e.preventDefault()
    const href = internalLink.getAttribute('href')
    if (href) navigate(href)
  }
}

onMounted(() => {
  nextTick(() => renderMermaidDiagrams())
})

watch(
  () => [currentPath.value, currentLang.value],
  () => {
    nextTick(() => {
      setTimeout(() => renderMermaidDiagrams(), 50)
    })
  }
)
</script>

<template>
  <div class="nx-blueprint-reader">
    <div class="nx-container">
      <div class="nx-reader-layout">
        <!-- ==================== 左栏：企业级架构卷宗导航器 ==================== -->
        <aside class="nx-reader-sidebar">
          <div class="nx-sidebar-sticky nx-glass-card">
            <div class="nx-sb-group">
              <div class="nx-sb-group-title">
                {{ t('ENGINEERING BLUEPRINT // 架构白皮书', 'ENGINEERING BLUEPRINT // 技術設計白書', 'ARCHITECTURE WHITEPAPER') }}
              </div>
              <nav class="nx-sb-nav">
                <a
                  v-for="ch in archChapters"
                  :key="ch.id"
                  class="nx-sb-link"
                  :class="{ 'is-active': strippedPath === ch.slug }"
                  :href="ch.link"
                  @click.prevent="navigate(ch.link)"
                >
                  <span class="nx-sb-num">{{ ch.num }}</span>
                  <span class="nx-sb-text">{{ ch.title }}</span>
                </a>
              </nav>
            </div>

            <div class="nx-sb-divider"></div>

            <div class="nx-sb-group">
              <div class="nx-sb-group-title">
                {{ t('USER & LAN GUIDES // 部署与使用指南', 'USER & LAN GUIDES // 導入・設定ガイド', 'DEPLOYMENT & USER GUIDES') }}
              </div>
              <nav class="nx-sb-nav">
                <a
                  v-for="g in guideChapters"
                  :key="g.id"
                  class="nx-sb-link"
                  :class="{ 'is-active': strippedPath === g.slug }"
                  :href="g.link"
                  @click.prevent="navigate(g.link)"
                >
                  <span class="nx-sb-num is-guide">{{ g.num }}</span>
                  <span class="nx-sb-text">{{ g.title }}</span>
                </a>
              </nav>
            </div>

            <div class="nx-sb-divider"></div>

            <!-- 精致的面试源码 Live Walkthrough 卡片 -->
            <button type="button" class="nx-sb-audit-btn" @click="openAuditModal">
              <span class="nx-sb-audit-tag">⌘ LIVE SOURCE WALKTHROUGH</span>
              <strong>
                {{ t('技术审阅与 IDE 实机源码演示说明 →', '技術審査・面接ライブ解説のご案内 →', 'Interview & IDE Source Walkthrough →') }}
              </strong>
            </button>
          </div>
        </aside>

        <!-- ==================== 中栏：深色黑曜石架构白皮书正文画布 ==================== -->
        <main class="nx-reader-main">
          <article class="nx-article-card nx-glass-card" @click="handleArticleClick">
            <!-- 卷宗页头 -->
            <header class="nx-article-header">
              <div class="nx-article-meta-bar">
                <span class="nx-badge">{{ currentMeta.num }} · {{ currentMeta.badge }}</span>
                <span v-if="currentMeta.metric" class="nx-article-metric">{{ currentMeta.metric }}</span>
              </div>

              <h1 class="nx-article-h1">{{ renderedDoc.title || currentMeta.title }}</h1>

              <p v-if="renderedDoc.description || currentMeta.subtitle" class="nx-article-lead">
                {{ renderedDoc.description || currentMeta.subtitle }}
              </p>

              <div v-if="currentMeta.modules && currentMeta.modules.length" class="nx-article-modules">
                <span class="nx-mod-label">{{ t('关联核心模块：', '対応コアモジュール：', 'Verified Source Modules:') }}</span>
                <code v-for="m in currentMeta.modules" :key="m">{{ m }}</code>
              </div>
            </header>

            <!-- 编译后的白皮书 HTML 正文 -->
            <div class="nx-article-body" v-html="renderedDoc.html"></div>

            <!-- 底部上下卷切换卡片 -->
            <footer class="nx-article-pager">
              <a
                v-if="prevChapter"
                class="nx-pager-card is-prev"
                :href="prevChapter.link"
                @click.prevent="navigate(prevChapter.link)"
              >
                <span class="nx-pager-dir">← {{ t('上一卷', '前の章', 'Previous') }} · {{ prevChapter.num }}</span>
                <strong class="nx-pager-title">{{ prevChapter.title }}</strong>
              </a>
              <div v-else></div>

              <a
                v-if="nextChapter"
                class="nx-pager-card is-next"
                :href="nextChapter.link"
                @click.prevent="navigate(nextChapter.link)"
              >
                <span class="nx-pager-dir">{{ t('下一卷', '次の章', 'Next') }} · {{ nextChapter.num }} →</span>
                <strong class="nx-pager-title">{{ nextChapter.title }}</strong>
              </a>
            </footer>
          </article>
        </main>

        <!-- ==================== 右栏：本卷章节锚点与快捷实机体验 ==================== -->
        <aside class="nx-reader-toc">
          <div class="nx-toc-sticky">
            <div v-if="renderedDoc.toc && renderedDoc.toc.length" class="nx-toc-box nx-glass-card">
              <div class="nx-toc-title">{{ t('本卷目录 // ON THIS PAGE', '目次 // ON THIS PAGE', 'ON THIS PAGE') }}</div>
              <ul class="nx-toc-list">
                <li
                  v-for="item in renderedDoc.toc"
                  :key="item.id"
                  :class="`is-level-${item.level}`"
                >
                  <a :href="`#${item.id}`">{{ item.text }}</a>
                </li>
              </ul>
            </div>

            <div class="nx-toc-cta-card nx-glass-card">
              <div class="nx-toc-cta-tag">INTERACTIVE SANDBOX</div>
              <h4>
                {{ t('在 1:1 交互沙盒中验证本卷架构', '1:1 対話型デモで本設計を検証', 'Verify in 1:1 Interactive Sandbox') }}
              </h4>
              <p>
                {{
                  t(
                    '免安装直接在浏览器中操作体验影子 Git 检查点、Worktree 团队与 Office 局部热补丁。',
                    'ブラウザ上でシャドウGit、Worktreeチーム、Office部分AI更新を直接操作できます。',
                    'Test Shadow Git Checkpoints, Worktree Teams, and Office hot-patching right in your browser.'
                  )
                }}
              </p>
              <a
                class="nx-btn nx-btn-primary nx-toc-btn"
                :href="`${prefix}/demo`"
                @click.prevent="navigate(`${prefix}/demo`)"
              >
                {{ t('打开交互沙盒 (/demo) →', '対話型デモを開く →', 'Open Live Sandbox →') }}
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nx-blueprint-reader {
  position: relative;
  z-index: 5;
  padding: 40px 0 48px;
}

.nx-reader-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 240px;
  gap: 24px;
  align-items: start;
}

/* 左栏侧边导航 */
.nx-sidebar-sticky {
  position: sticky;
  top: 88px;
  padding: 18px 14px;
}

.nx-sb-group-title {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.08em;
  color: #38bdf8;
  padding: 0 8px 8px;
}

.nx-sb-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nx-sb-link {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 9px 10px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 150ms ease;
}

.nx-sb-link:hover {
  background: rgba(30, 41, 69, 0.55);
}

.nx-sb-link.is-active {
  background: rgba(37, 99, 235, 0.22);
  border-color: rgba(56, 189, 248, 0.4);
}

.nx-sb-num {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
}

.nx-sb-link.is-active .nx-sb-num {
  color: #38bdf8;
}

.nx-sb-num.is-guide {
  color: #34d399;
}

.nx-sb-text {
  font-size: 12.5px;
  font-weight: 650;
  line-height: 1.4;
  color: #cbd5e1;
}

.nx-sb-link.is-active .nx-sb-text {
  color: #ffffff;
}

.nx-sb-divider {
  height: 1px;
  background: rgba(148, 163, 184, 0.12);
  margin: 14px 0;
}

.nx-sb-audit-btn {
  width: 100%;
  text-align: left;
  padding: 11px 12px;
  border-radius: 9px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.28);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 160ms ease;
}

.nx-sb-audit-btn:hover {
  border-color: #38bdf8;
  background: rgba(30, 41, 69, 0.9);
}

.nx-sb-audit-tag {
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: 700;
  color: #38bdf8;
}

.nx-sb-audit-btn strong {
  font-size: 12px;
  color: #f1f5f9;
  line-height: 1.4;
}

/* 中栏正文卡片 */
.nx-article-card {
  padding: 40px 44px;
}

.nx-article-header {
  padding-bottom: 26px;
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.nx-article-meta-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.nx-article-metric {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: #34d399;
}

.nx-article-h1 {
  margin: 0 0 14px;
  font-size: clamp(24px, 2.8vw, 34px);
  font-weight: 850;
  line-height: 1.25;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.nx-article-lead {
  margin: 0 0 18px;
  font-size: 15px;
  line-height: 1.68;
  color: #94a3b8;
}

.nx-article-modules {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.nx-mod-label {
  font-size: 12px;
  color: #64748b;
}

.nx-article-modules code {
  padding: 3px 8px;
  border-radius: 5px;
  background: rgba(5, 8, 17, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.18);
  font-family: var(--font-mono);
  font-size: 11px;
  color: #7dd3fc;
}

/* 正文深度排版（v-html 内部元素） */
.nx-article-body :deep(.nx-doc-h2) {
  margin: 38px 0 16px;
  padding-top: 24px;
  border-top: 1px solid rgba(148, 163, 184, 0.14);
  font-size: 21px;
  font-weight: 800;
  color: #ffffff;
  display: flex;
  align-items: baseline;
  gap: 8px;
  scroll-margin-top: 92px;
}

.nx-article-body :deep(.nx-doc-h2:first-child) {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.nx-article-body :deep(.nx-doc-h3) {
  margin: 26px 0 12px;
  font-size: 16.5px;
  font-weight: 750;
  color: #f1f5f9;
  display: flex;
  align-items: baseline;
  gap: 8px;
  scroll-margin-top: 92px;
}

.nx-article-body :deep(.nx-heading-anchor) {
  font-family: var(--font-mono);
  font-size: 14px;
  color: #38bdf8;
  opacity: 0.45;
}

.nx-article-body :deep(.nx-doc-p) {
  margin: 0 0 16px;
  font-size: 14.5px;
  line-height: 1.75;
  color: #cbd5e1;
}

.nx-article-body :deep(.nx-doc-list) {
  margin: 0 0 18px;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  line-height: 1.7;
  color: #cbd5e1;
}

.nx-article-body :deep(.nx-doc-list strong) {
  color: #ffffff;
}

.nx-article-body :deep(.nx-inline-code) {
  padding: 2px 6px;
  border-radius: 5px;
  background: rgba(30, 41, 59, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.2);
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: #7dd3fc;
}

.nx-article-body :deep(.nx-doc-link) {
  color: #38bdf8;
  font-weight: 600;
  border-bottom: 1px dashed rgba(56, 189, 248, 0.45);
}

.nx-article-body :deep(.nx-doc-divider) {
  border: none;
  height: 1px;
  background: rgba(148, 163, 184, 0.14);
  margin: 28px 0;
}

/* GitHub Callout 玻璃卡片 */
.nx-article-body :deep(.nx-callout) {
  margin: 20px 0;
  padding: 16px 20px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.32);
  border-left: 3px solid #38bdf8;
}

.nx-article-body :deep(.nx-callout.is-tip) {
  border-color: rgba(16, 185, 129, 0.32);
  border-left-color: #10b981;
}

.nx-article-body :deep(.nx-callout-head) {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.nx-article-body :deep(.nx-callout-badge) {
  padding: 1px 7px;
  border-radius: 4px;
  background: rgba(56, 189, 248, 0.18);
  color: #38bdf8;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 750;
}

.nx-article-body :deep(.nx-callout-title) {
  font-size: 13.5px;
  color: #ffffff;
}

.nx-article-body :deep(.nx-callout-body) {
  font-size: 13.5px;
  line-height: 1.65;
  color: #cbd5e1;
}

/* Mermaid 矢量架构图舞台 */
.nx-article-body :deep(.nx-mermaid-card) {
  margin: 24px 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(56, 189, 248, 0.28);
  background: #070b14;
}

.nx-article-body :deep(.nx-mermaid-bar) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #0b1120;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: #38bdf8;
}

.nx-article-body :deep(.nx-mermaid-dot) {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #38bdf8;
}

.nx-article-body :deep(.nx-mermaid-stage) {
  padding: 24px 18px;
  overflow-x: auto;
  text-align: center;
}

.nx-article-body :deep(.nx-mermaid-stage svg) {
  max-width: 100%;
  height: auto;
}

/* 代码块视窗 */
.nx-article-body :deep(.nx-code-block) {
  margin: 20px 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: #050811;
}

.nx-article-body :deep(.nx-code-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: #0b1120;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
  font-family: var(--font-mono);
  font-size: 11px;
}

.nx-article-body :deep(.nx-code-dots) {
  display: flex;
  gap: 5px;
}

.nx-article-body :deep(.nx-code-dots span) {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #334155;
}

.nx-article-body :deep(.nx-code-lang) {
  color: #94a3b8;
  font-weight: 700;
}

.nx-article-body :deep(.nx-code-copy-btn) {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.22);
  color: #38bdf8;
  border-radius: 4px;
  padding: 2px 8px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.nx-article-body :deep(.nx-code-pre) {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.6;
  color: #e2e8f0;
}

/* 表格 */
.nx-article-body :deep(.nx-table-wrap) {
  margin: 20px 0;
  overflow-x: auto;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.nx-article-body :deep(.nx-doc-table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.nx-article-body :deep(.nx-doc-table th),
.nx-article-body :deep(.nx-doc-table td) {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  text-align: left;
}

.nx-article-body :deep(.nx-doc-table th) {
  background: rgba(8, 13, 26, 0.9);
  color: #ffffff;
  font-weight: 700;
}

.nx-article-body :deep(.nx-doc-table td) {
  background: rgba(13, 20, 36, 0.5);
  color: #cbd5e1;
}

/* 上下卷翻页器 */
.nx-article-pager {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid rgba(148, 163, 184, 0.16);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.nx-pager-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 18px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.18);
  transition: all 160ms ease;
}

.nx-pager-card:hover {
  border-color: #38bdf8;
  background: rgba(30, 41, 69, 0.85);
}

.nx-pager-card.is-next {
  text-align: right;
}

.nx-pager-dir {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #38bdf8;
}

.nx-pager-title {
  font-size: 14px;
  color: #ffffff;
}

/* 右栏目录与快捷卡片 */
.nx-toc-sticky {
  position: sticky;
  top: 88px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.nx-toc-box {
  padding: 18px 16px;
}

.nx-toc-title {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 750;
  letter-spacing: 0.08em;
  color: #38bdf8;
  margin-bottom: 12px;
}

.nx-toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nx-toc-list li a {
  font-size: 12px;
  line-height: 1.45;
  color: #94a3b8;
  display: block;
  transition: color 150ms ease;
}

.nx-toc-list li a:hover {
  color: #38bdf8;
}

.nx-toc-list li.is-level-3 {
  padding-left: 12px;
}

.nx-toc-cta-card {
  padding: 18px 16px;
}

.nx-toc-cta-tag {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  color: #34d399;
  margin-bottom: 6px;
}

.nx-toc-cta-card h4 {
  margin: 0 0 8px;
  font-size: 13.5px;
  color: #ffffff;
}

.nx-toc-cta-card p {
  margin: 0 0 14px;
  font-size: 12px;
  line-height: 1.55;
  color: #94a3b8;
}

.nx-toc-btn {
  width: 100%;
  height: 36px;
  font-size: 12px;
}

@media (max-width: 1180px) {
  .nx-reader-layout {
    grid-template-columns: 250px minmax(0, 1fr);
  }
  .nx-reader-toc {
    display: none;
  }
}

@media (max-width: 860px) {
  .nx-reader-layout {
    grid-template-columns: 1fr;
  }
  .nx-sidebar-sticky {
    position: static;
  }
  .nx-article-card {
    padding: 24px 20px;
  }
  .nx-article-pager {
    grid-template-columns: 1fr;
  }
}
</style>
