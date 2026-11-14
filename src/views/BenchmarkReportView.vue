<script setup>
/**
 * 权威实测报告与密码学证据审阅中心（BenchmarkReportView.vue）。
 *
 * 职责与协作：
 * - 对应 `/benchmarks` 与 `/benchmarks/<slug>`（及 `/ja/*`、`/en/*` 多语言路径）。
 * - 将原本生硬的裸 `.md` / `.json` 文本升级为深邃黑曜石企业级报告阅读器，支持一键下载 `.md` 报告、一键打包下载全套 `.zip` 证据包、逐文件直链下载、在线预览原始 JSON/JSONL 轨迹，以及基于浏览器原生 WebCrypto 的实时 SHA-256 哈希核验。
 */
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { tt, getLangPrefix } from '../data/siteData.js'
import {
  BENCHMARK_SLUGS,
  getBenchmarkSuites,
  getBenchmarkReportRaw,
  getBenchmarkManifest
} from '../data/benchmarksRegistry.js'
import { renderEnterpriseMarkdown } from '../utils/markdownRenderer.js'
import {
  buildStoreZip,
  sha256Hex,
  triggerBlobDownload,
  formatBytes
} from '../utils/zipBuilder.js'
import { useAppRouter } from '../router.js'

const { currentPath, currentHash, currentLang, strippedPath, navigate, openAuditModal } = useAppRouter()

const prefix = computed(() => getLangPrefix(currentLang.value))
const suites = computed(() => getBenchmarkSuites(currentLang.value))

function t(zh, ja, en) {
  return tt(currentLang.value, zh, ja, en)
}

const activeSlug = computed(() => {
  const sp = strippedPath.value
  const m = sp.match(/^\/benchmarks\/([a-z0-9-]+)$/i)
  if (m && BENCHMARK_SLUGS.includes(m[1])) {
    return m[1]
  }
  return BENCHMARK_SLUGS[0]
})

const currentSuite = computed(() => {
  return suites.value.find((s) => s.id === activeSlug.value) || suites.value[0]
})

const currentIndex = computed(() => {
  return suites.value.findIndex((s) => s.id === activeSlug.value)
})

const prevSuite = computed(() => {
  if (currentIndex.value > 0) return suites.value[currentIndex.value - 1]
  return null
})

const nextSuite = computed(() => {
  if (currentIndex.value >= 0 && currentIndex.value < suites.value.length - 1) {
    return suites.value[currentIndex.value + 1]
  }
  return null
})

const rawReportMd = computed(() => getBenchmarkReportRaw(activeSlug.value))
const manifestData = computed(() => getBenchmarkManifest(activeSlug.value))

const evidenceFiles = computed(() => {
  if (!manifestData.value || !Array.isArray(manifestData.value.files)) return []
  return manifestData.value.files
})

const totalBundleBytes = computed(() => {
  return evidenceFiles.value.reduce((acc, f) => acc + (Number(f.bytes) || 0), 0)
})

const renderedReport = computed(() => {
  return renderEnterpriseMarkdown(rawReportMd.value)
})

// 交互态管理：打包下载、WebCrypto SHA-256 验签、原始文件在线预览抽屉（完整覆盖 Loading / Empty / Error / Data）
const zipState = ref('idle') // 'idle' | 'loading' | 'done' | 'error'
const zipProgressText = ref('')
const zipErrorMsg = ref('')
const mdDownloaded = ref(false)
const copiedKey = ref('')

// Record<filePath, 'idle' | 'verifying' | 'matched' | 'mismatch' | 'error'>
const verifyMap = ref({})
const isVerifyingAll = ref(false)

const previewFile = ref('')
const previewStatus = ref('empty') // 'empty' | 'loading' | 'ready' | 'error'
const previewContent = ref('')
const previewTruncated = ref(false)
const previewError = ref('')

function resetInteractiveState() {
  zipState.value = 'idle'
  zipProgressText.value = ''
  zipErrorMsg.value = ''
  verifyMap.value = {}
  isVerifyingAll.value = false
  previewFile.value = ''
  previewStatus.value = 'empty'
  previewContent.value = ''
  previewTruncated.value = false
  previewError.value = ''
}

function getStaticFileUrl(relPath) {
  const clean = String(relPath || '').replace(/^\/+/, '')
  return `/benchmarks/${activeSlug.value}/${clean}`
}

function getDownloadFileName(relPath) {
  const flat = String(relPath || '')
    .replace(/^\/+/, '')
    .replace(/\//g, '_')
  return `${activeSlug.value}_${flat}`
}

function downloadReportMarkdown() {
  const raw = rawReportMd.value
  if (!raw) return
  const blob = new Blob([raw], { type: 'text/markdown;charset=utf-8' })
  triggerBlobDownload(blob, `${activeSlug.value}_REPORT.md`)
  mdDownloaded.value = true
  setTimeout(() => {
    mdDownloaded.value = false
  }, 2000)
}

function downloadManifestJson() {
  if (!manifestData.value) return
  const jsonText = JSON.stringify(manifestData.value, null, 2)
  const blob = new Blob([jsonText], { type: 'application/json;charset=utf-8' })
  triggerBlobDownload(blob, `${activeSlug.value}_manifest.json`)
}

async function downloadFullZipBundle() {
  if (zipState.value === 'loading') return
  zipState.value = 'loading'
  zipErrorMsg.value = ''
  try {
    const slug = activeSlug.value
    const files = evidenceFiles.value
    const entries = []

    if (manifestData.value) {
      entries.push({
        name: `${slug}/manifest.json`,
        data: new TextEncoder().encode(JSON.stringify(manifestData.value, null, 2))
      })
    }

    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      zipProgressText.value = `${i + 1}/${files.length}`
      const resp = await fetch(getStaticFileUrl(f.path), { cache: 'no-cache' })
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: ${f.path}`)
      }
      const contentType = resp.headers.get('content-type') || ''
      if (contentType.includes('text/html') && !f.path.endsWith('.html')) {
        throw new Error(`Unexpected HTML fallback for ${f.path}`)
      }
      const buf = await resp.arrayBuffer()
      entries.push({
        name: `${slug}/${f.path}`,
        data: new Uint8Array(buf)
      })
    }

    const zipBlob = buildStoreZip(entries)
    triggerBlobDownload(zipBlob, `${slug}-evidence-bundle.zip`)
    zipState.value = 'done'
    setTimeout(() => {
      if (zipState.value === 'done') zipState.value = 'idle'
    }, 2600)
  } catch (err) {
    zipState.value = 'error'
    zipErrorMsg.value = err?.message || 'Bundle fetch failed'
  }
}

async function verifySingleFile(fileItem) {
  const key = fileItem.path
  verifyMap.value = { ...verifyMap.value, [key]: 'verifying' }
  try {
    const resp = await fetch(getStaticFileUrl(fileItem.path), { cache: 'no-cache' })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const buf = await resp.arrayBuffer()
    const actualHash = await sha256Hex(buf)
    const expected = String(fileItem.sha256 || '').toLowerCase()
    const matched = expected && actualHash.toLowerCase() === expected
    verifyMap.value = {
      ...verifyMap.value,
      [key]: matched ? 'matched' : 'mismatch'
    }
  } catch {
    verifyMap.value = { ...verifyMap.value, [key]: 'error' }
  }
}

async function verifyAllFiles() {
  if (isVerifyingAll.value || !evidenceFiles.value.length) return
  isVerifyingAll.value = true
  try {
    for (const f of evidenceFiles.value) {
      await verifySingleFile(f)
    }
  } finally {
    isVerifyingAll.value = false
  }
}

async function inspectEvidenceFile(filePath) {
  if (previewFile.value === filePath && previewStatus.value === 'ready') {
    previewFile.value = ''
    previewStatus.value = 'empty'
    return
  }
  previewFile.value = filePath
  previewStatus.value = 'loading'
  previewError.value = ''
  previewTruncated.value = false

  try {
    if (filePath === 'REPORT.md' && rawReportMd.value) {
      const lines = rawReportMd.value.split('\n')
      previewTruncated.value = lines.length > 180
      previewContent.value = lines.slice(0, 180).join('\n')
      previewStatus.value = 'ready'
      return
    }
    const resp = await fetch(getStaticFileUrl(filePath), { cache: 'no-cache' })
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} (${filePath})`)
    }
    const text = await resp.text()
    let formatted = text
    if (filePath.endsWith('.json')) {
      try {
        formatted = JSON.stringify(JSON.parse(text), null, 2)
      } catch {
        formatted = text
      }
    }
    const lines = formatted.split('\n')
    if (lines.length > 180) {
      previewTruncated.value = true
      previewContent.value = lines.slice(0, 180).join('\n')
    } else {
      previewContent.value = formatted
    }
    previewStatus.value = 'ready'
  } catch (err) {
    previewStatus.value = 'error'
    previewError.value = err?.message || 'Failed to load evidence file'
  }
}

async function copyText(key, val) {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && val) {
      await navigator.clipboard.writeText(val)
      copiedKey.value = key
      setTimeout(() => {
        if (copiedKey.value === key) copiedKey.value = ''
      }, 1800)
    }
  } catch {
    // ignore clipboard error
  }
}

function scrollToSection(id) {
  if (typeof document === 'undefined') return
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

async function renderMermaidDiagrams() {
  if (typeof window === 'undefined') return
  const stages = document.querySelectorAll('.nx-bench-reader .nx-mermaid-stage[data-mermaid]')
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
      const id = `nx-bench-mermaid-${Date.now()}-${i}`
      const { svg } = await mermaid.render(id, rawCode)
      el.innerHTML = svg
      el.dataset.rendered = '1'
    }
  } catch (err) {
    console.warn('[Helm Benchmark Reader] Mermaid render skipped:', err)
  }
}

function handleArticleClick(e) {
  const copyBtn = e.target.closest('[data-copy-code]')
  if (copyBtn) {
    const raw = decodeURIComponent(copyBtn.dataset.copyCode || '')
    if (navigator.clipboard && raw) {
      navigator.clipboard.writeText(raw)
      const orig = copyBtn.textContent
      copyBtn.textContent = 'COPIED'
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
  nextTick(() => {
    renderMermaidDiagrams()
    if (currentHash.value === '#evidence-bundle') {
      scrollToSection('evidence-bundle')
    }
  })
})

watch(
  () => [currentPath.value, currentLang.value],
  () => {
    resetInteractiveState()
    nextTick(() => {
      setTimeout(() => {
        renderMermaidDiagrams()
        if (currentHash.value === '#evidence-bundle') {
          scrollToSection('evidence-bundle')
        }
      }, 50)
    })
  }
)
</script>

<template>
  <div class="nx-bench-reader">
    <div class="nx-container">
      <!-- 顶部面包屑与返回导航条 -->
      <div class="nx-bench-topbar">
        <a
          class="nx-bench-back-link"
          :href="`${prefix}/#benchmarks`"
          @click.prevent="navigate(`${prefix}/#benchmarks`)"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          <span>{{ t('返回首页评测总览', 'ベンチマーク一覧へ戻る', 'Back to Benchmark Overview') }}</span>
        </a>

        <div class="nx-bench-top-meta">
          <span class="nx-badge is-emerald">
            <span class="nx-pulse-dot"></span>
            <span>{{ t('6 套公开实测证据包 · SHA-256 可复核', '全6種の公開実証バンドル · SHA-256 署名済', '6 Signed Empirical Bundles · SHA-256 Verifiable') }}</span>
          </span>
        </div>
      </div>

      <div class="nx-bench-layout">
        <!-- ==================== 左栏：6 套实测套件导航器 ==================== -->
        <aside class="nx-bench-sidebar">
          <div class="nx-bench-sb-sticky nx-glass-card">
            <div class="nx-bench-sb-head">
              {{ t('EMPIRICAL SUITES // 实测报告中心', 'EMPIRICAL SUITES // 実証レポート一覧', 'EMPIRICAL BENCHMARK SUITES') }}
            </div>

            <nav class="nx-bench-sb-nav" aria-label="Benchmark Suites">
              <a
                v-for="s in suites"
                :key="s.id"
                class="nx-bench-sb-item"
                :class="{ 'is-active': s.id === activeSlug }"
                :href="s.link"
                @click.prevent="navigate(s.link)"
              >
                <div class="nx-bench-sb-row">
                  <span class="nx-bench-sb-num">{{ s.num }}</span>
                  <span class="nx-bench-sb-score">{{ s.heroScore }}</span>
                </div>
                <div class="nx-bench-sb-title">{{ s.title }}</div>
              </a>
            </nav>

            <div class="nx-bench-sb-divider"></div>

            <!-- 跳转到对应架构白皮书 -->
            <a
              class="nx-bench-arch-jump"
              :href="currentSuite.archLink"
              @click.prevent="navigate(currentSuite.archLink)"
            >
              <span class="nx-bench-arch-kicker">ARCHITECTURE LINK</span>
              <span class="nx-bench-arch-text">{{ currentSuite.archLabel }} →</span>
            </a>

            <button type="button" class="nx-bench-audit-trigger" @click="openAuditModal">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>{{ t('架构透明性与本地安全说明', '設計の透明性と安全稼働仕様', 'Architecture & Security Overview') }}</span>
            </button>
          </div>
        </aside>

        <!-- ==================== 中栏：精美评测报告主画布 + 密码学证据下载舱 ==================== -->
        <main class="nx-bench-main">
          <article class="nx-bench-article nx-glass-card" @click="handleArticleClick">
            <!-- 1. 报告页头与真实下载控制舱 -->
            <header class="nx-bench-header">
              <div class="nx-bench-meta-row">
                <span class="nx-badge">{{ currentSuite.num }} · {{ currentSuite.category }}</span>
                <span class="nx-bench-bundle-stat">
                  {{ evidenceFiles.length }} {{ t('份原始文件', '件の証跡ファイル', 'Artifacts') }} · {{ formatBytes(totalBundleBytes) }}
                </span>
              </div>

              <h1 class="nx-bench-h1">{{ currentSuite.title }}</h1>
              <p class="nx-bench-lead">{{ currentSuite.subtitle }}</p>

              <!-- 真实可用的下载主工具栏 -->
              <div class="nx-bench-download-bar">
                <a
                  class="nx-btn nx-btn-primary nx-bench-dl-btn"
                  :href="getStaticFileUrl('REPORT.md')"
                  :download="`${activeSlug}_REPORT.md`"
                  @click.prevent="downloadReportMarkdown"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>
                    {{
                      mdDownloaded
                        ? t('已开始下载 REPORT.md', 'REPORT.md を保存しました', 'Downloaded REPORT.md')
                        : t(`下载实测报告 (${activeSlug}_REPORT.md)`, `評価レポートを保存 (${activeSlug}_REPORT.md)`, `Download Report (${activeSlug}_REPORT.md)`)
                    }}
                  </span>
                </a>

                <button
                  type="button"
                  class="nx-btn nx-btn-glass nx-bench-dl-btn"
                  :disabled="zipState === 'loading'"
                  @click="downloadFullZipBundle"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M21 8v13H3V8" />
                    <path d="M1 3h22v5H1z" />
                    <path d="M10 12h4" />
                  </svg>
                  <span v-if="zipState === 'loading'">
                    {{ t(`正在打包证据包 (${zipProgressText})...`, `証跡バンドル作成中 (${zipProgressText})...`, `Packaging Bundle (${zipProgressText})...`) }}
                  </span>
                  <span v-else-if="zipState === 'done'">
                    {{ t('证据包 .zip 已下载', '証跡 .zip を保存しました', 'Bundle .zip Downloaded') }}
                  </span>
                  <span v-else>
                    {{ t(`打包下载完整证据包 (.zip · ${formatBytes(totalBundleBytes)})`, `全証跡バンドルを一括保存 (.zip · ${formatBytes(totalBundleBytes)})`, `Download Full Evidence Bundle (.zip · ${formatBytes(totalBundleBytes)})`) }}
                  </span>
                </button>

                <button
                  type="button"
                  class="nx-btn nx-btn-glass nx-bench-dl-btn is-compact"
                  @click="scrollToSection('evidence-bundle')"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>{{ t('SHA-256 清单与逐项下载', 'SHA-256 検証・個別保存', 'SHA-256 Manifest & Files') }}</span>
                </button>
              </div>

              <!-- 打包异常时的清晰错误与重试入口 -->
              <div v-if="zipState === 'error'" class="nx-bench-error-banner" role="alert">
                <div class="nx-bench-error-text">
                  <strong>{{ t('打包下载中断：', '一括保存エラー：', 'Bundle Download Error:') }}</strong>
                  <span>{{ zipErrorMsg }}</span>
                </div>
                <button type="button" class="nx-bench-mini-btn" @click="downloadFullZipBundle">
                  {{ t('重试打包', '再試行', 'Retry') }}
                </button>
              </div>

              <!-- 4 项核心定量指标面板 -->
              <div class="nx-bench-kpi-strip">
                <div v-for="kpi in currentSuite.kpis" :key="kpi.label" class="nx-bench-kpi-cell">
                  <div class="nx-bench-kpi-val">{{ kpi.value }}</div>
                  <div class="nx-bench-kpi-lbl">{{ kpi.label }}</div>
                  <div class="nx-bench-kpi-note">{{ kpi.note }}</div>
                </div>
              </div>

              <!-- 非中文语言下的签名原文说明条 -->
              <div v-if="currentLang !== 'zh'" class="nx-bench-lang-notice">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>
                  {{
                    t(
                      '',
                      '上部の要旨およびKPIは日本語で表示しています。以下の技術レポート本文は SHA-256 ハッシュ署名（manifest.json）とのバイト単位の完全一致を保証するため、オリジナルの計測原文（REPORT.md）をそのままレンダリングしています。',
                      'Executive summary and KPIs above are localized. To preserve exact byte-for-byte cryptographic parity with manifest.json SHA-256 signatures, the underlying REPORT.md artifact below is rendered from its original signed engineering text.'
                    )
                  }}
                </span>
              </div>
            </header>

            <!-- 2. 渲染后的精美 Markdown 正文 -->
            <div v-if="renderedReport.html" class="nx-bench-body" v-html="renderedReport.html"></div>
            <div v-else class="nx-bench-empty-state">
              <p>{{ t('当前套件暂无报告正文，请从下方证据包下载原始 JSON 数据。', 'レポート本文が見つかりません。下部の証跡リストからJSONを取得してください。', 'Report body unavailable; please download raw JSON artifacts below.') }}</p>
            </div>

            <!-- 3. SHA-256 密码学证据清单与逐文件预览/下载舱 -->
            <section id="evidence-bundle" class="nx-evidence-vault">
              <div class="nx-vault-head">
                <div class="nx-vault-head-left">
                  <div class="nx-vault-kicker">CRYPTOGRAPHIC EVIDENCE MANIFEST // SHA-256 签名证据舱</div>
                  <h2 class="nx-vault-title">
                    {{ t('公开可复核证据包清单与原始文件下载', '公開検証可能な証跡マニフェスト＆生データ保存', 'Verifiable Evidence Manifest & Raw Artifact Downloads') }}
                  </h2>
                </div>

                <div class="nx-vault-head-actions">
                  <button
                    type="button"
                    class="nx-bench-mini-btn is-emerald"
                    :disabled="isVerifyingAll || !evidenceFiles.length"
                    @click="verifyAllFiles"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span>
                      {{
                        isVerifyingAll
                          ? t('浏览器端校验中...', 'WebCrypto 検証中...', 'Verifying SHA-256...')
                          : t('一键在线核验全部 SHA-256', 'ブラウザ上で全 SHA-256 を検証', 'Verify All SHA-256 Live')
                      }}
                    </span>
                  </button>

                  <a
                    class="nx-bench-mini-btn"
                    :href="getStaticFileUrl('manifest.json')"
                    :download="`${activeSlug}_manifest.json`"
                    @click.prevent="downloadManifestJson"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>manifest.json</span>
                  </a>
                </div>
              </div>

              <!-- 证据文件列表 -->
              <div v-if="evidenceFiles.length" class="nx-vault-list">
                <div
                  v-for="item in evidenceFiles"
                  :key="item.path"
                  class="nx-vault-row"
                  :class="{ 'is-selected': previewFile === item.path && previewStatus !== 'empty' }"
                >
                  <div class="nx-vault-file-info">
                    <div class="nx-vault-file-top">
                      <code class="nx-vault-filepath" :title="item.path">{{ item.path }}</code>
                      <span class="nx-vault-filesize">{{ formatBytes(item.bytes) }}</span>
                      <span
                        v-if="verifyMap[item.path] === 'matched'"
                        class="nx-vault-status is-ok"
                      >
                        {{ t('SHA-256 一致', 'SHA-256 一致', 'SHA-256 Verified') }}
                      </span>
                      <span
                        v-else-if="verifyMap[item.path] === 'verifying'"
                        class="nx-vault-status is-wait"
                      >
                        {{ t('计算哈希中...', '計算中...', 'Hashing...') }}
                      </span>
                      <span
                        v-else-if="verifyMap[item.path] === 'mismatch' || verifyMap[item.path] === 'error'"
                        class="nx-vault-status is-err"
                      >
                        {{ t('校验失败', '検証エラー', 'Verify Error') }}
                      </span>
                    </div>

                    <div class="nx-vault-hash-line">
                      <span class="nx-vault-hash-lbl">SHA-256:</span>
                      <code class="nx-vault-hash-val" :title="item.sha256">{{ item.sha256 }}</code>
                      <button
                        type="button"
                        class="nx-vault-copy-hash"
                        @click="copyText(item.path, item.sha256)"
                      >
                        {{ copiedKey === item.path ? t('已复制', 'コピー済', 'Copied') : t('复制', 'コピー', 'Copy') }}
                      </button>
                    </div>
                  </div>

                  <div class="nx-vault-row-actions">
                    <button
                      type="button"
                      class="nx-bench-mini-btn"
                      @click="inspectEvidenceFile(item.path)"
                    >
                      <span>{{ previewFile === item.path && previewStatus === 'ready' ? t('收起预览', '閉じる', 'Close') : t('在线预览', 'プレビュー', 'Preview') }}</span>
                    </button>

                    <button
                      type="button"
                      class="nx-bench-mini-btn"
                      :disabled="verifyMap[item.path] === 'verifying'"
                      @click="verifySingleFile(item)"
                    >
                      <span>{{ t('验签', '検証', 'Verify') }}</span>
                    </button>

                    <a
                      class="nx-bench-mini-btn is-primary"
                      :href="getStaticFileUrl(item.path)"
                      :download="getDownloadFileName(item.path)"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>{{ t('下载', '保存', 'Download') }}</span>
                    </a>
                  </div>
                </div>
              </div>
              <div v-else class="nx-bench-empty-state">
                <p>{{ t('未检测到证据清单文件。', 'マニフェスト情報がありません。', 'No manifest entries found.') }}</p>
              </div>

              <!-- 原始 JSON / JSONL 在线检视抽屉（含骨架屏 Loading 与 Error 重试） -->
              <div v-if="previewStatus !== 'empty'" class="nx-inspector-drawer">
                <div class="nx-inspector-bar">
                  <div class="nx-inspector-title-wrap">
                    <span class="nx-inspector-tag">RAW ARTIFACT INSPECTOR</span>
                    <code class="nx-inspector-filename">{{ previewFile }}</code>
                  </div>
                  <div class="nx-inspector-actions">
                    <button
                      v-if="previewStatus === 'ready'"
                      type="button"
                      class="nx-vault-copy-hash"
                      @click="copyText('inspector-body', previewContent)"
                    >
                      {{ copiedKey === 'inspector-body' ? t('已复制片段', 'コピー済', 'Copied') : t('复制内容', '内容をコピー', 'Copy') }}
                    </button>
                    <a
                      v-if="previewFile"
                      class="nx-vault-copy-hash"
                      :href="getStaticFileUrl(previewFile)"
                      :download="getDownloadFileName(previewFile)"
                    >
                      {{ t('下载完整原件 ↓', '完全なファイルを保存 ↓', 'Download Full File ↓') }}
                    </a>
                  </div>
                </div>

                <!-- Loading 骨架屏状态 -->
                <div v-if="previewStatus === 'loading'" class="nx-inspector-skeleton" aria-busy="true">
                  <div class="nx-skel-line is-w80"></div>
                  <div class="nx-skel-line is-w60"></div>
                  <div class="nx-skel-line is-w90"></div>
                  <div class="nx-skel-line is-w70"></div>
                </div>

                <!-- Error 重试状态 -->
                <div v-else-if="previewStatus === 'error'" class="nx-inspector-error">
                  <span>{{ t('读取原始证据文件失败：', 'ファイルの読込に失敗しました：', 'Failed to load artifact:') }} {{ previewError }}</span>
                  <button type="button" class="nx-bench-mini-btn" @click="inspectEvidenceFile(previewFile)">
                    {{ t('点击重试', '再試行', 'Retry') }}
                  </button>
                </div>

                <!-- Ready 源码展示状态 -->
                <div v-else class="nx-inspector-body-wrap">
                  <pre class="nx-inspector-pre"><code>{{ previewContent }}</code></pre>
                  <div v-if="previewTruncated" class="nx-inspector-trunc-bar">
                    <span>{{ t('为保证页面流畅，当前仅预览前 180 行；点击右侧即可下载完整无损原件。', '表示速度維持のため先頭180行のみ表示しています。右のボタンから全量を保存できます。', 'Showing first 180 lines for smooth rendering; download the full artifact on the right.') }}</span>
                    <a
                      class="nx-bench-mini-btn is-primary"
                      :href="getStaticFileUrl(previewFile)"
                      :download="getDownloadFileName(previewFile)"
                    >
                      {{ t('下载完整文件', '全量を保存', 'Download Full File') }}
                    </a>
                  </div>
                </div>
              </div>
            </section>

            <!-- 4. 底部上下套评测报告翻页器 -->
            <footer class="nx-bench-pager">
              <a
                v-if="prevSuite"
                class="nx-bench-pager-card"
                :href="prevSuite.link"
                @click.prevent="navigate(prevSuite.link)"
              >
                <span class="nx-bench-pager-dir">← {{ t('上一套实测', '前のベンチマーク', 'Previous Suite') }} · {{ prevSuite.num }}</span>
                <strong class="nx-bench-pager-title">{{ prevSuite.title }}</strong>
              </a>
              <div v-else></div>

              <a
                v-if="nextSuite"
                class="nx-bench-pager-card is-next"
                :href="nextSuite.link"
                @click.prevent="navigate(nextSuite.link)"
              >
                <span class="nx-bench-pager-dir">{{ t('下一套实测', '次のベンチマーク', 'Next Suite') }} · {{ nextSuite.num }} →</span>
                <strong class="nx-bench-pager-title">{{ nextSuite.title }}</strong>
              </a>
            </footer>
          </article>
        </main>

        <!-- ==================== 右栏：本篇章节目录与快速复核指引 ==================== -->
        <aside class="nx-bench-toc">
          <div class="nx-bench-toc-sticky">
            <div v-if="renderedReport.toc && renderedReport.toc.length" class="nx-bench-toc-box nx-glass-card">
              <div class="nx-bench-toc-title">{{ t('报告章节 // ON THIS REPORT', 'レポート目次 // SECTIONS', 'REPORT SECTIONS') }}</div>
              <ul class="nx-bench-toc-list">
                <li
                  v-for="item in renderedReport.toc"
                  :key="item.id"
                  :class="`is-level-${item.level}`"
                >
                  <a :href="`#${item.id}`">{{ item.text }}</a>
                </li>
                <li class="is-level-2">
                  <a href="#evidence-bundle" @click.prevent="scrollToSection('evidence-bundle')">
                    {{ t('SHA-256 证据清单与下载', 'SHA-256 証跡・保存', 'SHA-256 Evidence & Downloads') }}
                  </a>
                </li>
              </ul>
            </div>

            <div class="nx-bench-cli-card nx-glass-card">
              <div class="nx-bench-toc-title">{{ t('本地命令行复核 // CLI VERIFY', 'ローカル検証コマンド // CLI', 'LOCAL POWERSHELL AUDIT') }}</div>
              <p class="nx-bench-cli-desc">
                {{
                  t(
                    '下载任意证据文件后，可在本地 PowerShell 执行 Get-FileHash 与上方 manifest.json 比对签名：',
                    '保存した証跡ファイルは PowerShell の Get-FileHash で manifest.json と照合できます：',
                    'After downloading any file, verify its SHA-256 signature locally in PowerShell:'
                  )
                }}
              </p>
              <pre class="nx-bench-cli-pre"><code>Get-FileHash .\{{ activeSlug }}_REPORT.md -Algorithm SHA256</code></pre>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nx-bench-reader {
  position: relative;
  z-index: 5;
  padding: 28px 0 56px;
  font-variant-numeric: tabular-nums;
}

.nx-bench-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.nx-bench-back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: var(--nx-radius-sm);
  background: var(--nx-bg-glass);
  border: 1px solid var(--nx-border-subtle);
  font-size: 13px;
  font-weight: 600;
  color: var(--nx-text-2);
  transition: all var(--nx-transition-fast);
}

.nx-bench-back-link:hover {
  color: var(--nx-text-1);
  border-color: var(--nx-border-glow);
  background: var(--nx-bg-glass-hover);
}

.nx-bench-layout {
  display: grid;
  grid-template-columns: 276px minmax(0, 1fr) 240px;
  gap: 24px;
  align-items: start;
}

/* 左栏套件切换器 */
.nx-bench-sb-sticky {
  position: sticky;
  top: 88px;
  padding: 16px 14px;
}

.nx-bench-sb-head {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--nx-primary-bright);
  padding: 0 8px 10px;
}

.nx-bench-sb-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nx-bench-sb-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: var(--nx-radius-sm);
  border: 1px solid transparent;
  transition: all var(--nx-transition-fast);
  min-width: 0;
}

.nx-bench-sb-item:hover {
  background: var(--nx-bg-row-hover);
}

.nx-bench-sb-item.is-active {
  background: var(--nx-bg-active-soft);
  border-color: var(--nx-border-glow);
}

.nx-bench-sb-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
}

.nx-bench-sb-num {
  color: var(--nx-text-4);
  font-weight: 700;
}

.nx-bench-sb-item.is-active .nx-bench-sb-num {
  color: var(--nx-primary-bright);
}

.nx-bench-sb-score {
  color: var(--nx-emerald-bright);
  font-weight: 750;
}

.nx-bench-sb-title {
  font-size: 13px;
  font-weight: 650;
  line-height: 1.42;
  color: var(--nx-text-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.nx-bench-sb-item.is-active .nx-bench-sb-title {
  color: var(--nx-text-1);
}

.nx-bench-sb-divider {
  height: 1px;
  background: var(--nx-border-subtle);
  margin: 14px 0;
}

.nx-bench-arch-jump {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: var(--nx-radius-sm);
  background: var(--nx-bg-code);
  border: 1px solid var(--nx-border-subtle);
  margin-bottom: 10px;
  transition: border-color var(--nx-transition-fast);
}

.nx-bench-arch-jump:hover {
  border-color: var(--nx-border-glow);
}

.nx-bench-arch-kicker {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  color: var(--nx-text-4);
}

.nx-bench-arch-text {
  font-size: 12.5px;
  font-weight: 650;
  color: var(--nx-primary-bright);
  line-height: 1.4;
}

.nx-bench-audit-trigger {
  width: 100%;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--nx-radius-sm);
  background: var(--nx-bg-row);
  border: 1px solid var(--nx-border-subtle);
  color: var(--nx-text-2);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--nx-transition-fast);
  text-align: left;
}

.nx-bench-audit-trigger:hover {
  color: var(--nx-text-1);
  border-color: var(--nx-border-glow);
  background: var(--nx-bg-row-hover);
}

/* 中栏报告卡片 */
.nx-bench-main {
  min-width: 0;
}

.nx-bench-article {
  padding: 36px 40px;
  min-width: 0;
}

.nx-bench-header {
  padding-bottom: 28px;
  margin-bottom: 28px;
  border-bottom: 1px solid var(--nx-border-subtle);
}

.nx-bench-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.nx-bench-bundle-stat {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 650;
  color: var(--nx-emerald-bright);
}

.nx-bench-h1 {
  margin: 0 0 14px;
  font-size: clamp(24px, 2.6vw, 32px);
  font-weight: 850;
  line-height: 1.26;
  letter-spacing: -0.02em;
  color: var(--nx-text-1);
}

.nx-bench-lead {
  margin: 0 0 22px;
  font-size: 14.5px;
  line-height: 1.72;
  color: var(--nx-text-2);
  max-width: 74ch;
}

/* 真实下载工具栏 */
.nx-bench-download-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 22px;
}

.nx-bench-dl-btn {
  height: 40px;
  padding: 0 16px;
  font-size: 13px;
  gap: 8px;
}

.nx-bench-dl-btn.is-compact {
  padding: 0 14px;
}

.nx-bench-error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 20px;
  border-radius: var(--nx-radius-sm);
  background: var(--nx-rose-soft);
  border: 1px solid var(--nx-rose-border);
  color: var(--nx-text-1);
  font-size: 13px;
}

.nx-bench-kpi-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-radius: var(--nx-radius-md);
  background: var(--nx-bg-code);
  border: 1px solid var(--nx-border-subtle);
  overflow: hidden;
}

.nx-bench-kpi-cell {
  padding: 16px;
  border-right: 1px solid var(--nx-border-subtle);
  min-width: 0;
}

.nx-bench-kpi-cell:last-child {
  border-right: none;
}

.nx-bench-kpi-val {
  font-family: var(--font-mono);
  font-size: 22px;
  font-weight: 850;
  color: var(--nx-emerald-bright);
  letter-spacing: -0.02em;
  margin-bottom: 4px;
}

.nx-bench-kpi-lbl {
  font-size: 13px;
  font-weight: 700;
  color: var(--nx-text-1);
  margin-bottom: 4px;
}

.nx-bench-kpi-note {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--nx-text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nx-bench-lang-notice {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: var(--nx-radius-sm);
  background: var(--nx-primary-soft);
  border: 1px solid var(--nx-primary-border);
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--nx-text-2);
}

.nx-bench-lang-notice svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--nx-primary-bright);
}

/* Markdown 正文深度排版（全部采用语义令牌） */
.nx-bench-body :deep(.nx-doc-h2) {
  margin: 36px 0 16px;
  padding-top: 22px;
  border-top: 1px solid var(--nx-border-subtle);
  font-size: 20px;
  font-weight: 800;
  color: var(--nx-text-1);
  display: flex;
  align-items: baseline;
  gap: 8px;
  scroll-margin-top: 92px;
}

.nx-bench-body :deep(.nx-doc-h2:first-child) {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.nx-bench-body :deep(.nx-doc-h3) {
  margin: 24px 0 12px;
  font-size: 16px;
  font-weight: 750;
  color: var(--nx-text-1);
  display: flex;
  align-items: baseline;
  gap: 8px;
  scroll-margin-top: 92px;
}

.nx-bench-body :deep(.nx-doc-h4) {
  margin: 18px 0 10px;
  font-size: 14.5px;
  font-weight: 700;
  color: var(--nx-text-1);
}

.nx-bench-body :deep(.nx-heading-anchor) {
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--nx-primary-bright);
  opacity: 0.5;
}

.nx-bench-body :deep(.nx-doc-p) {
  margin: 0 0 16px;
  font-size: 14.5px;
  line-height: 1.75;
  color: var(--nx-text-2);
  max-width: 75ch;
}

.nx-bench-body :deep(.nx-doc-list) {
  margin: 0 0 18px;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--nx-text-2);
  max-width: 75ch;
}

.nx-bench-body :deep(.nx-doc-list strong),
.nx-bench-body :deep(.nx-doc-p strong) {
  color: var(--nx-text-1);
}

.nx-bench-body :deep(.nx-inline-code) {
  padding: 2px 6px;
  border-radius: var(--nx-radius-xs);
  background: var(--nx-bg-row);
  border: 1px solid var(--nx-border-mid);
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: var(--nx-primary-bright);
}

.nx-bench-body :deep(.nx-doc-link) {
  color: var(--nx-primary-bright);
  font-weight: 600;
  border-bottom: 1px dashed var(--nx-primary-border);
}

.nx-bench-body :deep(.nx-doc-divider) {
  border: none;
  height: 1px;
  background: var(--nx-border-subtle);
  margin: 28px 0;
}

.nx-bench-body :deep(.nx-blockquote),
.nx-bench-body :deep(.nx-callout) {
  margin: 20px 0;
  padding: 16px 20px;
  border-radius: var(--nx-radius-md);
  background: var(--nx-bg-row);
  border: 1px solid var(--nx-primary-border);
  border-left: 3px solid var(--nx-primary-bright);
  font-size: 13.5px;
  line-height: 1.68;
  color: var(--nx-text-2);
}

.nx-bench-body :deep(.nx-table-wrap) {
  margin: 20px 0;
  overflow-x: auto;
  border-radius: var(--nx-radius-md);
  border: 1px solid var(--nx-border-mid);
}

.nx-bench-body :deep(.nx-doc-table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.nx-bench-body :deep(.nx-doc-table th),
.nx-bench-body :deep(.nx-doc-table td) {
  padding: 10px 14px;
  border-bottom: 1px solid var(--nx-border-subtle);
  text-align: left;
}

.nx-bench-body :deep(.nx-doc-table th) {
  background: var(--nx-bg-deep);
  color: var(--nx-text-1);
  font-weight: 700;
  white-space: nowrap;
}

.nx-bench-body :deep(.nx-doc-table td) {
  background: var(--nx-bg-surface);
  color: var(--nx-text-2);
}

.nx-bench-body :deep(.nx-code-block) {
  margin: 20px 0;
  border-radius: var(--nx-radius-md);
  overflow: hidden;
  border: 1px solid var(--nx-border-mid);
  background: var(--nx-bg-void);
}

.nx-bench-body :deep(.nx-code-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: var(--nx-bg-bar);
  border-bottom: 1px solid var(--nx-border-subtle);
  font-family: var(--font-mono);
  font-size: 11px;
}

.nx-bench-body :deep(.nx-code-dots) {
  display: flex;
  gap: 6px;
}

.nx-bench-body :deep(.nx-code-dots span) {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--nx-border-mid);
}

.nx-bench-body :deep(.nx-code-lang) {
  color: var(--nx-text-3);
  font-weight: 700;
}

.nx-bench-body :deep(.nx-code-copy-btn) {
  background: var(--nx-bg-row);
  border: 1px solid var(--nx-border-mid);
  color: var(--nx-primary-bright);
  border-radius: var(--nx-radius-xs);
  padding: 2px 8px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.nx-bench-body :deep(.nx-code-pre) {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--nx-text-2);
}

.nx-bench-body :deep(.nx-code-pre::-webkit-scrollbar),
.nx-bench-body :deep(.nx-table-wrap::-webkit-scrollbar),
.nx-inspector-pre::-webkit-scrollbar {
  height: 6px;
  width: 6px;
  background: transparent;
}

.nx-bench-body :deep(.nx-code-pre::-webkit-scrollbar-track),
.nx-bench-body :deep(.nx-table-wrap::-webkit-scrollbar-track),
.nx-inspector-pre::-webkit-scrollbar-track {
  background: transparent;
}

.nx-bench-body :deep(.nx-code-pre::-webkit-scrollbar-thumb),
.nx-bench-body :deep(.nx-table-wrap::-webkit-scrollbar-thumb),
.nx-inspector-pre::-webkit-scrollbar-thumb {
  background: var(--nx-border-mid);
  border-radius: var(--nx-radius-xs);
}

/* SHA-256 证据清单下载舱 */
.nx-evidence-vault {
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid var(--nx-border-mid);
  scroll-margin-top: 88px;
}

.nx-vault-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 18px;
}

.nx-vault-kicker {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--nx-emerald-bright);
  margin-bottom: 6px;
}

.nx-vault-title {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  color: var(--nx-text-1);
}

.nx-vault-head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.nx-vault-list {
  display: flex;
  flex-direction: column;
  border-radius: var(--nx-radius-md);
  border: 1px solid var(--nx-border-mid);
  background: var(--nx-bg-code);
  overflow: hidden;
}

.nx-vault-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--nx-border-subtle);
  transition: background var(--nx-transition-fast);
  min-width: 0;
}

.nx-vault-row:last-child {
  border-bottom: none;
}

.nx-vault-row:hover,
.nx-vault-row.is-selected {
  background: var(--nx-bg-row);
}

.nx-vault-file-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

.nx-vault-file-top {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.nx-vault-filepath {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--nx-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.nx-vault-filesize {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--nx-text-3);
  padding: 1px 6px;
  border-radius: var(--nx-radius-xs);
  background: var(--nx-bg-surface);
  border: 1px solid var(--nx-border-subtle);
  flex-shrink: 0;
}

.nx-vault-status {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}

.nx-vault-status.is-ok {
  background: var(--nx-emerald-soft);
  border: 1px solid var(--nx-emerald-border);
  color: var(--nx-emerald-bright);
}

.nx-vault-status.is-wait {
  background: var(--nx-primary-soft);
  border: 1px solid var(--nx-primary-border);
  color: var(--nx-primary-bright);
}

.nx-vault-status.is-err {
  background: var(--nx-rose-soft);
  border: 1px solid var(--nx-rose-border);
  color: var(--nx-rose-bright);
}

.nx-vault-hash-line {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.nx-vault-hash-lbl {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--nx-text-4);
  flex-shrink: 0;
}

.nx-vault-hash-val {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--nx-text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.nx-vault-copy-hash {
  background: transparent;
  border: 1px solid var(--nx-border-subtle);
  border-radius: var(--nx-radius-xs);
  padding: 2px 7px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--nx-primary-bright);
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--nx-transition-fast);
}

.nx-vault-copy-hash:hover {
  border-color: var(--nx-border-glow);
  background: var(--nx-primary-soft);
}

.nx-vault-row-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.nx-bench-mini-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border-radius: var(--nx-radius-xs);
  background: var(--nx-bg-surface);
  border: 1px solid var(--nx-border-mid);
  color: var(--nx-text-2);
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--nx-transition-fast);
}

.nx-bench-mini-btn:hover:not(:disabled) {
  color: var(--nx-text-1);
  border-color: var(--nx-border-glow);
  background: var(--nx-bg-row-hover);
}

.nx-bench-mini-btn.is-primary {
  background: var(--nx-primary-soft);
  border-color: var(--nx-primary-border);
  color: var(--nx-primary-bright);
}

.nx-bench-mini-btn.is-primary:hover {
  background: var(--nx-primary);
  color: var(--nx-text-1);
}

.nx-bench-mini-btn.is-emerald {
  background: var(--nx-emerald-soft);
  border-color: var(--nx-emerald-border);
  color: var(--nx-emerald-bright);
}

/* 在线检视抽屉 */
.nx-inspector-drawer {
  margin-top: 16px;
  border-radius: var(--nx-radius-md);
  border: 1px solid var(--nx-primary-border);
  background: var(--nx-bg-void);
  overflow: hidden;
}

.nx-inspector-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 16px;
  background: var(--nx-bg-bar);
  border-bottom: 1px solid var(--nx-border-subtle);
}

.nx-inspector-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.nx-inspector-tag {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 750;
  color: var(--nx-emerald-bright);
  flex-shrink: 0;
}

.nx-inspector-filename {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--nx-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nx-inspector-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nx-inspector-skeleton {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nx-skel-line {
  height: 12px;
  border-radius: var(--nx-radius-xs);
  background: var(--nx-bg-row-hover);
}

.nx-skel-line.is-w80 { width: 80%; }
.nx-skel-line.is-w60 { width: 60%; }
.nx-skel-line.is-w90 { width: 90%; }
.nx-skel-line.is-w70 { width: 70%; }

.nx-inspector-error {
  padding: 18px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: var(--nx-rose-bright);
}

.nx-inspector-pre {
  margin: 0;
  padding: 16px;
  max-height: 420px;
  overflow: auto;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.6;
  color: var(--nx-text-2);
}

.nx-inspector-trunc-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 10px 16px;
  background: var(--nx-bg-bar);
  border-top: 1px solid var(--nx-border-subtle);
  font-size: 12px;
  color: var(--nx-text-3);
}

.nx-bench-empty-state {
  padding: 28px;
  text-align: center;
  color: var(--nx-text-3);
  font-size: 13.5px;
}

/* 底部上下套翻页器 */
.nx-bench-pager {
  margin-top: 36px;
  padding-top: 24px;
  border-top: 1px solid var(--nx-border-subtle);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.nx-bench-pager-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 18px;
  border-radius: var(--nx-radius-md);
  background: var(--nx-bg-row);
  border: 1px solid var(--nx-border-subtle);
  transition: all var(--nx-transition-fast);
  min-width: 0;
}

.nx-bench-pager-card:hover {
  border-color: var(--nx-border-glow);
  background: var(--nx-bg-row-hover);
}

.nx-bench-pager-card.is-next {
  text-align: right;
}

.nx-bench-pager-dir {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--nx-primary-bright);
}

.nx-bench-pager-title {
  font-size: 13.5px;
  color: var(--nx-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 右栏目录与验证卡片 */
.nx-bench-toc-sticky {
  position: sticky;
  top: 88px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.nx-bench-toc-box,
.nx-bench-cli-card {
  padding: 18px 16px;
}

.nx-bench-toc-title {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--nx-primary-bright);
  margin-bottom: 12px;
}

.nx-bench-toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nx-bench-toc-list li.is-level-3 {
  padding-left: 12px;
}

.nx-bench-toc-list a {
  display: block;
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--nx-text-3);
  transition: color var(--nx-transition-fast);
}

.nx-bench-toc-list a:hover {
  color: var(--nx-text-1);
}

.nx-bench-cli-desc {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 1.55;
  color: var(--nx-text-3);
}

.nx-bench-cli-pre {
  margin: 0;
  padding: 10px 12px;
  border-radius: var(--nx-radius-xs);
  background: var(--nx-bg-void);
  border: 1px solid var(--nx-border-subtle);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--nx-emerald-bright);
  overflow-x: auto;
}

@media (max-width: 1180px) {
  .nx-bench-layout {
    grid-template-columns: 256px minmax(0, 1fr);
  }
  .nx-bench-toc {
    display: none;
  }
}

@media (max-width: 960px) {
  .nx-bench-layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .nx-bench-sb-sticky {
    position: static;
  }
  .nx-bench-sb-nav {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .nx-bench-article {
    padding: 24px 20px;
  }
  .nx-bench-kpi-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .nx-bench-kpi-cell:nth-child(2) {
    border-right: none;
  }
  .nx-bench-kpi-cell:nth-child(1),
  .nx-bench-kpi-cell:nth-child(2) {
    border-bottom: 1px solid var(--nx-border-subtle);
  }
  .nx-vault-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .nx-vault-row-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 640px) {
  .nx-bench-sb-nav,
  .nx-bench-kpi-strip,
  .nx-bench-pager {
    grid-template-columns: 1fr;
  }
  .nx-bench-kpi-cell {
    border-right: none;
    border-bottom: 1px solid var(--nx-border-subtle);
  }
  .nx-bench-kpi-cell:last-child {
    border-bottom: none;
  }
}
</style>
