<script setup>
/**
 * WhitepaperView.vue — 极昼杂志级工程架构白皮书与部署指南阅读器
 *
 * 职责与协作：
 * - 统一渲染 `/architecture/*`（全 6 卷）与 `/guide/*`（3 篇部署与生态指南）的中/日/英三语正文。
 * - 共享 `flagship.css` 的 `.hl-doc-prose` 排版体系与浅色矢量 Mermaid 架构图渲染，零硬编码色值。
 */
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import {
  tt,
  getLangPrefix,
  getArchitectureChapters,
  getGuideChapters
} from '../data/siteData.js'
import { getMarkdownByRoute } from '../data/docsRegistry.js'
import { renderEnterpriseMarkdown } from '../utils/markdownRenderer.js'
import { renderMermaidStages, collectArticleDiagrams } from '../utils/mermaidHelper.js'
import { useAppRouter } from '../router.js'
import DiagramLightbox from '../components/DiagramLightbox.vue'

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

const articleRef = ref(null)
const isZoomOpen = ref(false)
const zoomDiagrams = ref([])
const zoomActiveIndex = ref(0)
const zoomLoading = ref(false)

const renderedDoc = computed(() => {
  const raw = getMarkdownByRoute(currentPath.value)
  return renderEnterpriseMarkdown(raw, currentLang.value)
})

const zoomChapterTitle = computed(() => {
  const num = currentMeta.value?.num || ''
  const title = renderedDoc.value?.title || currentMeta.value?.title || ''
  return num && title ? `${num} · ${title}` : title
})

async function renderMermaidDiagrams(forceRetryErrors = false) {
  if (!articleRef.value) return
  await renderMermaidStages(articleRef.value, { forceRetryErrors })
  if (isZoomOpen.value) {
    zoomDiagrams.value = collectArticleDiagrams(articleRef.value)
  }
}

async function openDiagramZoom(targetIndex) {
  if (!articleRef.value) return
  zoomActiveIndex.value = targetIndex

  const pendingStages = articleRef.value.querySelectorAll(
    '.nx-mermaid-stage[data-mermaid]:not([data-rendered])'
  )
  if (pendingStages.length > 0) {
    zoomLoading.value = true
    isZoomOpen.value = true
    await renderMermaidStages(articleRef.value)
    zoomDiagrams.value = collectArticleDiagrams(articleRef.value)
    zoomLoading.value = false
  } else {
    zoomDiagrams.value = collectArticleDiagrams(articleRef.value)
    zoomLoading.value = false
    isZoomOpen.value = true
  }
}

async function handleRetryDiagram() {
  zoomLoading.value = true
  await renderMermaidDiagrams(true)
  zoomLoading.value = false
}

function handleArticleClick(e) {
  const retryBtn = e.target.closest('[data-retry-mermaid]')
  if (retryBtn) {
    e.preventDefault()
    renderMermaidDiagrams(true)
    return
  }

  const zoomTrigger = e.target.closest('[data-zoom-mermaid]')
  if (zoomTrigger) {
    if (
      zoomTrigger.classList.contains('nx-mermaid-stage') &&
      zoomTrigger.dataset.rendered === 'error'
    ) {
      return
    }
    e.preventDefault()
    const idx = Number(zoomTrigger.dataset.zoomMermaid) || 0
    openDiagramZoom(idx)
    return
  }

  const copyBtn = e.target.closest('[data-copy-code]')
  if (copyBtn) {
    const raw = decodeURIComponent(copyBtn.dataset.copyCode || '')
    if (navigator.clipboard && raw) {
      navigator.clipboard.writeText(raw)
      const orig = copyBtn.textContent
      copyBtn.textContent = t('已复制', 'コピー済', 'Copied')
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
    isZoomOpen.value = false
    nextTick(() => {
      setTimeout(() => renderMermaidDiagrams(), 50)
    })
  }
)
</script>

<template>
  <div class="hl-reader-page">
    <div class="hl-container-wide">
      <div class="hl-reader-grid">
        <!-- 左栏：白皮书全 6 卷与私有化指南目录 -->
        <aside class="hl-reader-left">
          <div class="hl-sidebar-card">
            <div class="hl-sb-section">
              <div class="hl-sb-heading">
                {{ t('工程架构白皮书（全 6 卷）', '技術アーキテクチャ白書（全6章）', 'Architecture Whitepaper') }}
              </div>
              <nav class="hl-sb-nav">
                <a
                  v-for="ch in archChapters"
                  :key="ch.id"
                  class="hl-sb-item"
                  :class="{ 'is-active': strippedPath === ch.slug }"
                  :href="ch.link"
                  @click.prevent="navigate(ch.link)"
                >
                  <span class="hl-sb-num hl-tabular">{{ ch.num }}</span>
                  <span class="hl-sb-title">{{ ch.title }}</span>
                </a>
              </nav>
            </div>

            <div class="hl-sb-sep"></div>

            <div class="hl-sb-section">
              <div class="hl-sb-heading">
                {{ t('部署与使用指南', '導入・設定ガイド', 'Deployment & Guides') }}
              </div>
              <nav class="hl-sb-nav">
                <a
                  v-for="g in guideChapters"
                  :key="g.id"
                  class="hl-sb-item"
                  :class="{ 'is-active': strippedPath === g.slug }"
                  :href="g.link"
                  @click.prevent="navigate(g.link)"
                >
                  <span class="hl-sb-num hl-tabular">{{ g.num }}</span>
                  <span class="hl-sb-title">{{ g.title }}</span>
                </a>
              </nav>
            </div>

            <div class="hl-sb-sep"></div>

            <div class="hl-sb-shortcuts">
              <a
                class="hl-sb-shortcut"
                :href="`${prefix}/benchmarks/swebench-mini-v1`"
                @click.prevent="navigate(`${prefix}/benchmarks/swebench-mini-v1`)"
              >
                <span>EMPIRICAL EVIDENCE · 6 SUITES</span>
                <strong>{{ t('6 大权威实测报告与证据包 →', '6大ベンチマーク実証レポート →', '6 Empirical Reports & ZIPs →') }}</strong>
              </a>

              <button type="button" class="hl-sb-shortcut" @click="openAuditModal">
                <span>SECURITY &amp; PRIVACY</span>
                <strong>{{ t('离线安全与架构透明性说明 →', 'オフライン安全仕様を見る →', 'Offline Security Brief →') }}</strong>
              </button>
            </div>
          </div>
        </aside>

        <!-- 中栏：杂志级白皮书正文画布 -->
        <main class="hl-reader-center">
          <article ref="articleRef" class="hl-article-sheet" @click="handleArticleClick">
            <header class="hl-article-head">
              <div class="hl-article-meta hl-tabular">
                <span class="hl-pill-tag is-accent">{{ currentMeta.num }} · {{ currentMeta.badge }}</span>
                <span v-if="currentMeta.metric" class="hl-article-metric">{{ currentMeta.metric }}</span>
              </div>

              <h1 class="hl-article-title">{{ renderedDoc.title || currentMeta.title }}</h1>

              <p v-if="renderedDoc.description || currentMeta.subtitle" class="hl-article-lead">
                {{ renderedDoc.description || currentMeta.subtitle }}
              </p>

              <div v-if="currentMeta.modules && currentMeta.modules.length" class="hl-article-mods">
                <span>{{ t('对应核心模块：', '対応モジュール：', 'Verified Modules:') }}</span>
                <code v-for="m in currentMeta.modules" :key="m">{{ m }}</code>
              </div>
            </header>

            <div :key="currentPath" class="hl-doc-prose" v-html="renderedDoc.html"></div>

            <footer class="hl-article-pager">
              <a
                v-if="prevChapter"
                class="hl-pager-btn"
                :href="prevChapter.link"
                @click.prevent="navigate(prevChapter.link)"
              >
                <span class="hl-pager-dir">← {{ t('上一篇', '前の章', 'Previous') }} · {{ prevChapter.num }}</span>
                <strong>{{ prevChapter.title }}</strong>
              </a>
              <div v-else></div>

              <a
                v-if="nextChapter"
                class="hl-pager-btn is-next"
                :href="nextChapter.link"
                @click.prevent="navigate(nextChapter.link)"
              >
                <span class="hl-pager-dir">{{ t('下一篇', '次の章', 'Next') }} · {{ nextChapter.num }} →</span>
                <strong>{{ nextChapter.title }}</strong>
              </a>
            </footer>
          </article>
        </main>

        <!-- 右栏：本页锚点目录与沙盒快捷卡 -->
        <aside class="hl-reader-right">
          <div class="hl-toc-sticky">
            <div v-if="renderedDoc.toc && renderedDoc.toc.length" class="hl-toc-card">
              <div class="hl-toc-heading">{{ t('本页目录', '目次', 'On This Page') }}</div>
              <ul class="hl-toc-list">
                <li
                  v-for="item in renderedDoc.toc"
                  :key="item.id"
                  :class="`is-lv-${item.level}`"
                >
                  <a :href="`#${item.id}`">{{ item.text }}</a>
                </li>
              </ul>
            </div>

            <div class="hl-toc-promo">
              <span class="hl-pill-tag">1:1 SANDBOX</span>
              <h4>{{ t('在交互工作台中验证架构', '対話型デモで設計を体験', 'Test in 1:1 Sandbox') }}</h4>
              <p>
                {{
                  t(
                    '在线操作影子 Git 检查点、Worktree 多智能体协同与 Office 划词热补丁。',
                    'シャドウGit・Worktree協調・Office部分更新をブラウザで操作できます。',
                    'Try Shadow Git, Worktree teams, and surgical Office hot-patching in browser.'
                  )
                }}
              </p>
              <a
                class="hl-btn hl-btn-ink hl-btn-sm hl-toc-cta"
                :href="`${prefix}/demo`"
                @click.prevent="navigate(`${prefix}/demo`)"
              >
                <span>{{ t('打开 1:1 工作台', '1:1 デモを開く', 'Open 1:1 Sandbox') }}</span>
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <DiagramLightbox
      :open="isZoomOpen"
      :diagrams="zoomDiagrams"
      :active-index="zoomActiveIndex"
      :chapter-title="zoomChapterTitle"
      :loading="zoomLoading"
      :lang="currentLang"
      @close="isZoomOpen = false"
      @select="zoomActiveIndex = $event"
      @retry="handleRetryDiagram"
    />
  </div>
</template>

<style scoped>
.hl-reader-page {
  background-color: var(--hl-surface-alt);
  color: var(--hl-ink);
  padding: 36px 0 88px;
}

.hl-reader-grid {
  display: grid;
  grid-template-columns: 268px minmax(0, 1fr) 232px;
  gap: 24px;
  align-items: start;
}

.hl-sidebar-card {
  position: sticky;
  top: 76px;
  padding: 18px 14px;
  border-radius: var(--hl-radius-xl);
  background-color: var(--hl-surface);
  border: 1px solid var(--hl-border-soft);
  box-shadow: var(--hl-shadow-bento);
}

.hl-sb-heading {
  padding: 0 10px 8px;
  font-size: 11.5px;
  font-weight: 650;
  color: var(--hl-ink-4);
}

.hl-sb-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hl-sb-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 9px 10px;
  border-radius: var(--hl-radius-sm);
  transition: background-color 150ms ease;
}

.hl-sb-item:hover {
  background-color: var(--hl-surface-alt);
}

.hl-sb-item.is-active {
  background-color: var(--hl-accent-soft);
}

.hl-sb-num {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 650;
  color: var(--hl-ink-4);
}

.hl-sb-item.is-active .hl-sb-num {
  color: var(--hl-accent);
}

.hl-sb-title {
  font-size: 13px;
  font-weight: 550;
  line-height: 1.4;
  color: var(--hl-ink-2);
}

.hl-sb-item.is-active .hl-sb-title {
  font-weight: 650;
  color: var(--hl-ink);
}

.hl-sb-sep {
  height: 1px;
  background-color: var(--hl-border);
  margin: 14px 6px;
}

.hl-sb-shortcuts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hl-sb-shortcut {
  width: 100%;
  text-align: left;
  padding: 11px 12px;
  border-radius: var(--hl-radius-md);
  background-color: var(--hl-surface-alt);
  border: 1px solid var(--hl-border);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 3px;
  transition: border-color 150ms ease, background-color 150ms ease;
}

.hl-sb-shortcut:hover {
  border-color: var(--hl-border-strong);
  background-color: var(--hl-surface-tonal);
}

.hl-sb-shortcut span {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--hl-accent);
}

.hl-sb-shortcut strong {
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--hl-ink);
}

/* 中栏正文画布 */
.hl-article-sheet {
  padding: 44px 48px;
  border-radius: var(--hl-radius-xl);
  background-color: var(--hl-surface);
  border: 1px solid var(--hl-border-soft);
  box-shadow: var(--hl-shadow-bento);
  min-width: 0;
}

.hl-article-head {
  padding-bottom: 28px;
  margin-bottom: 28px;
  border-bottom: 1px solid var(--hl-border);
}

.hl-article-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.hl-article-metric {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--hl-ink-4);
}

.hl-article-title {
  margin: 0 0 14px;
  font-size: clamp(26px, 3vw, 34px);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.025em;
  color: var(--hl-ink);
}

.hl-article-lead {
  margin: 0;
  font-size: 15.5px;
  line-height: 1.66;
  color: var(--hl-ink-3);
  max-width: 70ch;
}

.hl-article-mods {
  margin-top: 18px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12.5px;
  color: var(--hl-ink-4);
}

.hl-article-mods code {
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 2px 8px;
  border-radius: var(--hl-radius-xs);
  background-color: var(--hl-surface-alt);
  border: 1px solid var(--hl-border);
  color: var(--hl-ink-2);
}

.hl-article-pager {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--hl-border);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.hl-pager-btn {
  padding: 16px 20px;
  border-radius: var(--hl-radius-lg);
  background-color: var(--hl-surface-alt);
  border: 1px solid var(--hl-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: border-color 150ms ease, background-color 150ms ease;
}

.hl-pager-btn:hover {
  border-color: var(--hl-border-strong);
  background-color: var(--hl-surface-tonal);
}

.hl-pager-btn.is-next {
  text-align: right;
}

.hl-pager-dir {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--hl-accent);
}

.hl-pager-btn strong {
  font-size: 14px;
  line-height: 1.4;
  color: var(--hl-ink);
}

/* 右栏目录与卡片 */
.hl-toc-sticky {
  position: sticky;
  top: 76px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hl-toc-card,
.hl-toc-promo {
  padding: 18px;
  border-radius: var(--hl-radius-lg);
  background-color: var(--hl-surface);
  border: 1px solid var(--hl-border-soft);
  box-shadow: var(--hl-shadow-bento);
}

.hl-toc-heading {
  font-size: 12px;
  font-weight: 650;
  color: var(--hl-ink);
  margin-bottom: 10px;
}

.hl-toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 52vh;
  overflow-y: auto;
}

.hl-toc-list li a {
  display: block;
  font-size: 12.5px;
  line-height: 1.42;
  color: var(--hl-ink-3);
  transition: color 150ms ease;
}

.hl-toc-list li a:hover {
  color: var(--hl-accent);
}

.hl-toc-list li.is-lv-3 {
  padding-left: 12px;
}

.hl-toc-promo h4 {
  margin: 10px 0 6px;
  font-size: 14.5px;
  font-weight: 650;
  color: var(--hl-ink);
}

.hl-toc-promo p {
  margin: 0 0 14px;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--hl-ink-3);
}

.hl-toc-cta {
  width: 100%;
}

@media (max-width: 1180px) {
  .hl-reader-grid {
    grid-template-columns: 248px minmax(0, 1fr);
  }

  .hl-reader-right {
    display: none;
  }
}

@media (max-width: 860px) {
  .hl-reader-grid {
    grid-template-columns: 1fr;
  }

  .hl-sidebar-card {
    position: static;
  }

  .hl-article-sheet {
    padding: 28px 22px;
  }

  .hl-article-pager {
    grid-template-columns: 1fr;
  }
}
</style>
