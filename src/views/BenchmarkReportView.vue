<script setup>
/**
 * BenchmarkReportView.vue — 极昼杂志级实测报告与密码学证据审阅中心
 *
 * 职责与协作：
 * - 对应 `/benchmarks` 与 `/benchmarks/<slug>`（及 `/ja/*`、`/en/*` 多语言路径）。
 * - 共享 `flagship.css` 的 `.hl-doc-prose` 排版系统与浅色 Mermaid 矢量图渲染，零硬编码色值。
 * - 完整实现 `REPORT.md` 下载、`.zip` 证据包打包（含进度/异常重试）、逐文件 WebCrypto SHA-256 实时验签，以及含骨架屏 Loading / Empty / Error 的原始 JSON/JSONL 在线检视抽屉。
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

const zipState = ref('idle') // 'idle' | 'loading' | 'done' | 'error'
const zipProgressText = ref('')
const zipErrorMsg = ref('')
const mdDownloaded = ref(false)
const copiedKey = ref('')

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
  const stages = document.querySelectorAll('.hl-bench-page .nx-mermaid-stage[data-mermaid]')
  if (!stages.length) return

  try {
    const mermaidModule = await import('mermaid')
    const mermaid = mermaidModule.default || mermaidModule
    const rootStyle = getComputedStyle(document.documentElement)
    const token = (name) => rootStyle.getPropertyValue(name).trim()

    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        darkMode: false,
        background: token('--hl-surface-subtle'),
        primaryColor: token('--hl-accent-soft'),
        primaryTextColor: token('--hl-ink'),
        primaryBorderColor: token('--hl-accent'),
        lineColor: token('--hl-ink-4'),
        secondaryColor: token('--hl-surface-alt'),
        tertiaryColor: token('--hl-surface'),
        fontFamily: token('--font-ui'),
        fontSize: '13px'
      }
    })

    for (let i = 0; i < stages.length; i++) {
      const el = stages[i]
      if (el.dataset.rendered === '1') continue
      const rawCode = decodeURIComponent(el.dataset.mermaid || '')
      if (!rawCode) continue
      const id = `hl-bench-mermaid-${Date.now()}-${i}`
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
  <div class="hl-bench-page">
    <div class="hl-container-wide">
      <div class="hl-bench-topbar">
        <a
          class="hl-back-pill"
          :href="`${prefix}/#benchmarks`"
          @click.prevent="navigate(`${prefix}/#benchmarks`)"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M19 12H5m7 7-7-7 7-7" />
          </svg>
          <span>{{ t('返回首页评测总览', 'ベンチマーク一覧へ戻る', 'Back to Overview') }}</span>
        </a>

        <span class="hl-pill-tag is-ok">
          {{ t('6 套公开实测证据包 · SHA-256 可复核', '全6種の公開実証バンドル · SHA-256 署名済', '6 Signed Empirical Bundles · SHA-256 Verifiable') }}
        </span>
      </div>

      <div class="hl-bench-grid">
        <!-- 左栏：6 套实测套件导航 -->
        <aside class="hl-bench-left">
          <div class="hl-bench-sb">
            <div class="hl-bench-sb-head">
              {{ t('实测报告中心（6 套件）', '実証レポート一覧（全6種）', 'Benchmark Suites (6)') }}
            </div>

            <nav class="hl-bench-nav" aria-label="Benchmark Suites">
              <a
                v-for="s in suites"
                :key="s.id"
                class="hl-bench-item"
                :class="{ 'is-active': s.id === activeSlug }"
                :href="s.link"
                @click.prevent="navigate(s.link)"
              >
                <div class="hl-bench-item-top hl-tabular">
                  <span>{{ s.num }}</span>
                  <strong>{{ s.heroScore }}</strong>
                </div>
                <div class="hl-bench-item-title">{{ s.title }}</div>
              </a>
            </nav>

            <div class="hl-bench-sep"></div>

            <a
              class="hl-bench-jump"
              :href="currentSuite.archLink"
              @click.prevent="navigate(currentSuite.archLink)"
            >
              <span>ARCHITECTURE LINK</span>
              <strong>{{ currentSuite.archLabel }} →</strong>
            </a>

            <button type="button" class="hl-bench-jump" @click="openAuditModal">
              <span>SECURITY &amp; PRIVACY</span>
              <strong>{{ t('离线安全与架构透明性说明 →', '安全稼働仕様を見る →', 'Security & Privacy Brief →') }}</strong>
            </button>
          </div>
        </aside>

        <!-- 中栏：实测正文与 SHA-256 证据舱 -->
        <main class="hl-bench-center">
          <article class="hl-bench-sheet" @click="handleArticleClick">
            <header class="hl-bench-head">
              <div class="hl-bench-meta hl-tabular">
                <span class="hl-pill-tag is-accent">{{ currentSuite.num }} · {{ currentSuite.category }}</span>
                <span class="hl-bench-stat">
                  {{ evidenceFiles.length }} {{ t('份原始文件', '件の証跡', 'Artifacts') }} · {{ formatBytes(totalBundleBytes) }}
                </span>
              </div>

              <h1 class="hl-bench-title">{{ currentSuite.title }}</h1>
              <p class="hl-bench-lead">{{ currentSuite.subtitle }}</p>

              <div class="hl-bench-dl-bar">
                <a
                  class="hl-btn hl-btn-ink hl-btn-sm"
                  :href="getStaticFileUrl('REPORT.md')"
                  :download="`${activeSlug}_REPORT.md`"
                  @click.prevent="downloadReportMarkdown"
                >
                  <span>
                    {{
                      mdDownloaded
                        ? t('已下载 REPORT.md', '保存完了', 'Downloaded REPORT.md')
                        : t(`下载报告 (${activeSlug}_REPORT.md)`, `レポート保存 (${activeSlug}_REPORT.md)`, `Download ${activeSlug}_REPORT.md`)
                    }}
                  </span>
                </a>

                <button
                  type="button"
                  class="hl-btn hl-btn-tonal hl-btn-sm hl-tabular"
                  :disabled="zipState === 'loading'"
                  @click="downloadFullZipBundle"
                >
                  <span v-if="zipState === 'loading'">
                    {{ t(`正在打包 (${zipProgressText})...`, `作成中 (${zipProgressText})...`, `Packaging (${zipProgressText})...`) }}
                  </span>
                  <span v-else-if="zipState === 'done'">
                    {{ t('证据包 .zip 已下载', '.zip 保存完了', 'Bundle .zip Downloaded') }}
                  </span>
                  <span v-else>
                    {{ t(`打包下载完整证据包 (.zip · ${formatBytes(totalBundleBytes)})`, `全証跡を一括保存 (.zip · ${formatBytes(totalBundleBytes)})`, `Download Evidence Bundle (.zip · ${formatBytes(totalBundleBytes)})`) }}
                  </span>
                </button>

                <button
                  type="button"
                  class="hl-btn hl-btn-outline hl-btn-sm"
                  @click="scrollToSection('evidence-bundle')"
                >
                  <span>{{ t('SHA-256 清单与验签', 'SHA-256 検証', 'SHA-256 Manifest') }}</span>
                </button>
              </div>

              <!-- Error 状态 + 重试 -->
              <div v-if="zipState === 'error'" class="hl-bench-err" role="alert">
                <span><strong>{{ t('打包中断：', '保存エラー：', 'Bundle Error:') }}</strong> {{ zipErrorMsg }}</span>
                <button type="button" class="hl-btn hl-btn-outline hl-btn-xs" @click="downloadFullZipBundle">
                  {{ t('重试打包', '再試行', 'Retry') }}
                </button>
              </div>

              <!-- 4 项定量 KPI -->
              <div class="hl-bench-kpis hl-tabular">
                <div v-for="kpi in currentSuite.kpis" :key="kpi.label" class="hl-kpi-cell">
                  <div class="hl-kpi-val">{{ kpi.value }}</div>
                  <div class="hl-kpi-lbl">{{ kpi.label }}</div>
                  <div class="hl-kpi-note">{{ kpi.note }}</div>
                </div>
              </div>

              <div v-if="currentLang !== 'zh'" class="hl-lang-note">
                {{
                  t(
                    '',
                    '上部の要旨およびKPIは日本語で表示しています。以下のレポート本文は manifest.json の SHA-256 署名とのバイト一致を保証するため、オリジナルの計測原文（REPORT.md）をそのまま表示しています。',
                    'Summary and KPIs above are localized. To preserve exact byte-for-byte parity with manifest.json SHA-256 signatures, the underlying REPORT.md artifact below renders its original signed text.'
                  )
                }}
              </div>
            </header>

            <!-- 正文与 Empty 兜底 -->
            <div v-if="renderedReport.html" class="hl-doc-prose" v-html="renderedReport.html"></div>
            <div v-else class="hl-empty-box">
              <p>{{ t('当前套件暂无正文，请从下方证据清单下载原始数据并验签。', '本文データがありません。下部の証跡リストをご利用ください。', 'Report text unavailable—download and verify raw artifacts below.') }}</p>
            </div>

            <!-- SHA-256 密码学证据舱 -->
            <section id="evidence-bundle" class="hl-vault">
              <div class="hl-vault-head">
                <div>
                  <div class="hl-vault-kicker">CRYPTOGRAPHIC EVIDENCE MANIFEST</div>
                  <h2>{{ t('公开可复核证据清单与在线验签', '公開証跡マニフェスト＆WebCrypto検証', 'Verifiable Evidence Manifest & Live Checksums') }}</h2>
                </div>
                <div class="hl-vault-actions">
                  <button
                    type="button"
                    class="hl-btn hl-btn-ink hl-btn-xs"
                    :disabled="isVerifyingAll || !evidenceFiles.length"
                    @click="verifyAllFiles"
                  >
                    {{
                      isVerifyingAll
                        ? t('浏览器端核验中...', '検証中...', 'Verifying...')
                        : t('一键核验全部 SHA-256', '全 SHA-256 を検証', 'Verify All SHA-256')
                    }}
                  </button>
                  <a
                    class="hl-btn hl-btn-outline hl-btn-xs"
                    :href="getStaticFileUrl('manifest.json')"
                    :download="`${activeSlug}_manifest.json`"
                    @click.prevent="downloadManifestJson"
                  >
                    manifest.json
                  </a>
                </div>
              </div>

              <div v-if="evidenceFiles.length" class="hl-vault-list hl-tabular">
                <div
                  v-for="item in evidenceFiles"
                  :key="item.path"
                  class="hl-vault-row"
                  :class="{ 'is-open': previewFile === item.path && previewStatus !== 'empty' }"
                >
                  <div class="hl-vault-info">
                    <div class="hl-vault-top">
                      <code class="hl-vault-path" :title="item.path">{{ item.path }}</code>
                      <span class="hl-vault-bytes">{{ formatBytes(item.bytes) }}</span>
                      <span v-if="verifyMap[item.path] === 'matched'" class="hl-v-tag is-ok">{{ t('SHA-256 一致', '一致', 'Verified') }}</span>
                      <span v-else-if="verifyMap[item.path] === 'verifying'" class="hl-v-tag is-wait">{{ t('计算中...', '計算中...', 'Hashing...') }}</span>
                      <span v-else-if="verifyMap[item.path] === 'mismatch' || verifyMap[item.path] === 'error'" class="hl-v-tag is-err">{{ t('校验异常', 'エラー', 'Failed') }}</span>
                    </div>
                    <div class="hl-vault-sha">
                      <span>SHA-256:</span>
                      <code :title="item.sha256">{{ item.sha256 }}</code>
                      <button type="button" class="hl-inline-btn" @click="copyText(item.path, item.sha256)">
                        {{ copiedKey === item.path ? t('已复制', '済', 'Copied') : t('复制', 'コピー', 'Copy') }}
                      </button>
                    </div>
                  </div>

                  <div class="hl-vault-btns">
                    <button type="button" class="hl-btn hl-btn-tonal hl-btn-xs" @click="inspectEvidenceFile(item.path)">
                      {{ previewFile === item.path && previewStatus === 'ready' ? t('收起', '閉じる', 'Close') : t('预览', '表示', 'Preview') }}
                    </button>
                    <button type="button" class="hl-btn hl-btn-outline hl-btn-xs" :disabled="verifyMap[item.path] === 'verifying'" @click="verifySingleFile(item)">
                      {{ t('验签', '検証', 'Verify') }}
                    </button>
                    <a class="hl-btn hl-btn-ink hl-btn-xs" :href="getStaticFileUrl(item.path)" :download="getDownloadFileName(item.path)">
                      {{ t('下载', '保存', 'Save') }}
                    </a>
                  </div>
                </div>
              </div>
              <div v-else class="hl-empty-box">
                <p>{{ t('未找到证据清单条目。', '証跡ファイルがありません。', 'No manifest entries available.') }}</p>
              </div>

              <!-- 原始文件在线检视抽屉（含骨架屏 Loading / Error 重试 / Ready） -->
              <div v-if="previewStatus !== 'empty'" class="hl-inspector">
                <div class="hl-inspector-head">
                  <div>
                    <span>RAW ARTIFACT</span>
                    <code>{{ previewFile }}</code>
                  </div>
                  <div class="hl-inspector-btns">
                    <button v-if="previewStatus === 'ready'" type="button" class="hl-inline-btn" @click="copyText('insp', previewContent)">
                      {{ copiedKey === 'insp' ? t('已复制', '済', 'Copied') : t('复制片段', 'コピー', 'Copy') }}
                    </button>
                    <a v-if="previewFile" class="hl-inline-btn" :href="getStaticFileUrl(previewFile)" :download="getDownloadFileName(previewFile)">
                      {{ t('下载完整原件 ↓', '全量保存 ↓', 'Full File ↓') }}
                    </a>
                  </div>
                </div>

                <div v-if="previewStatus === 'loading'" class="hl-skel-box" aria-busy="true">
                  <div class="hl-skel is-w80"></div>
                  <div class="hl-skel is-w60"></div>
                  <div class="hl-skel is-w90"></div>
                  <div class="hl-skel is-w70"></div>
                </div>

                <div v-else-if="previewStatus === 'error'" class="hl-bench-err">
                  <span>{{ t('读取失败：', '読込失敗：', 'Load failed:') }} {{ previewError }}</span>
                  <button type="button" class="hl-btn hl-btn-outline hl-btn-xs" @click="inspectEvidenceFile(previewFile)">
                    {{ t('重试', '再試行', 'Retry') }}
                  </button>
                </div>

                <div v-else>
                  <pre class="hl-inspector-pre"><code>{{ previewContent }}</code></pre>
                  <div v-if="previewTruncated" class="hl-trunc-bar">
                    <span>{{ t('仅预览前 180 行以保持流畅，右侧可下载无损全量原件。', '先頭180行のみ表示中。全量は右から保存できます。', 'Showing first 180 lines; download full file on the right.') }}</span>
                    <a class="hl-btn hl-btn-ink hl-btn-xs" :href="getStaticFileUrl(previewFile)" :download="getDownloadFileName(previewFile)">
                      {{ t('下载全量文件', '全量保存', 'Download Full') }}
                    </a>
                  </div>
                </div>
              </div>
            </section>

            <!-- 底部上下套翻页 -->
            <footer class="hl-bench-pager">
              <a v-if="prevSuite" class="hl-pager-card" :href="prevSuite.link" @click.prevent="navigate(prevSuite.link)">
                <span>← {{ prevSuite.num }}</span>
                <strong>{{ prevSuite.title }}</strong>
              </a>
              <div v-else></div>

              <a v-if="nextSuite" class="hl-pager-card is-next" :href="nextSuite.link" @click.prevent="navigate(nextSuite.link)">
                <span>{{ nextSuite.num }} →</span>
                <strong>{{ nextSuite.title }}</strong>
              </a>
            </footer>
          </article>
        </main>

        <!-- 右栏：章节锚点 -->
        <aside class="hl-bench-right">
          <div class="hl-bench-toc-sticky">
            <div v-if="renderedReport.toc && renderedReport.toc.length" class="hl-bench-toc-card">
              <div class="hl-toc-head">{{ t('报告目录', 'レポート目次', 'Sections') }}</div>
              <ul>
                <li v-for="item in renderedReport.toc" :key="item.id" :class="`is-lv-${item.level}`">
                  <a :href="`#${item.id}`">{{ item.text }}</a>
                </li>
                <li>
                  <a href="#evidence-bundle" @click.prevent="scrollToSection('evidence-bundle')">
                    {{ t('SHA-256 证据清单与验签', 'SHA-256 証跡検証', 'SHA-256 Evidence') }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hl-bench-page {
  background-color: var(--hl-surface-alt);
  color: var(--hl-ink);
  padding: 28px 0 88px;
}

.hl-bench-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.hl-back-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--hl-radius-pill);
  background-color: var(--hl-surface);
  border: 1px solid var(--hl-border);
  font-size: 13px;
  font-weight: 500;
  color: var(--hl-ink-2);
  transition: border-color 150ms ease, color 150ms ease;
}

.hl-back-pill:hover {
  border-color: var(--hl-border-strong);
  color: var(--hl-ink);
}

.hl-bench-grid {
  display: grid;
  grid-template-columns: 268px minmax(0, 1fr) 224px;
  gap: 24px;
  align-items: start;
}

.hl-bench-sb {
  position: sticky;
  top: 76px;
  padding: 18px 14px;
  border-radius: var(--hl-radius-xl);
  background-color: var(--hl-surface);
  border: 1px solid var(--hl-border-soft);
  box-shadow: var(--hl-shadow-bento);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hl-bench-sb-head {
  padding: 0 10px 6px;
  font-size: 11.5px;
  font-weight: 650;
  color: var(--hl-ink-4);
}

.hl-bench-nav {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.hl-bench-item {
  padding: 9px 10px;
  border-radius: var(--hl-radius-sm);
  display: flex;
  flex-direction: column;
  gap: 3px;
  transition: background-color 150ms ease;
}

.hl-bench-item:hover {
  background-color: var(--hl-surface-alt);
}

.hl-bench-item.is-active {
  background-color: var(--hl-accent-soft);
}

.hl-bench-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--hl-ink-4);
}

.hl-bench-item-top strong {
  color: var(--hl-accent);
  font-weight: 650;
}

.hl-bench-item-title {
  font-size: 13px;
  font-weight: 550;
  line-height: 1.4;
  color: var(--hl-ink-2);
}

.hl-bench-item.is-active .hl-bench-item-title {
  font-weight: 650;
  color: var(--hl-ink);
}

.hl-bench-sep {
  height: 1px;
  background-color: var(--hl-border);
  margin: 8px 6px;
}

.hl-bench-jump {
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border-radius: var(--hl-radius-md);
  background-color: var(--hl-surface-alt);
  border: 1px solid var(--hl-border);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: border-color 150ms ease, background-color 150ms ease;
}

.hl-bench-jump:hover {
  border-color: var(--hl-border-strong);
  background-color: var(--hl-surface-tonal);
}

.hl-bench-jump span {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--hl-accent);
}

.hl-bench-jump strong {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--hl-ink);
}

/* 中栏正文画布 */
.hl-bench-sheet {
  padding: 44px 48px;
  border-radius: var(--hl-radius-xl);
  background-color: var(--hl-surface);
  border: 1px solid var(--hl-border-soft);
  box-shadow: var(--hl-shadow-bento);
  min-width: 0;
}

.hl-bench-head {
  padding-bottom: 28px;
  margin-bottom: 28px;
  border-bottom: 1px solid var(--hl-border);
}

.hl-bench-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.hl-bench-stat {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--hl-ink-4);
}

.hl-bench-title {
  margin: 0 0 12px;
  font-size: clamp(25px, 3vw, 34px);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.025em;
  color: var(--hl-ink);
}

.hl-bench-lead {
  margin: 0 0 22px;
  font-size: 15px;
  line-height: 1.65;
  color: var(--hl-ink-3);
  max-width: 70ch;
}

.hl-bench-dl-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.hl-bench-err {
  margin: 12px 0;
  padding: 12px 16px;
  border-radius: var(--hl-radius-md);
  background-color: var(--hl-err-soft);
  border: 1px solid var(--hl-err-border);
  color: var(--hl-err);
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.hl-bench-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.hl-kpi-cell {
  padding: 16px;
  border-radius: var(--hl-radius-lg);
  background-color: var(--hl-surface-alt);
  border: 1px solid var(--hl-border-soft);
  min-width: 0;
}

.hl-kpi-val {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--hl-ink);
  margin-bottom: 4px;
}

.hl-kpi-lbl {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--hl-ink-2);
}

.hl-kpi-note {
  margin-top: 2px;
  font-size: 11.5px;
  color: var(--hl-ink-4);
}

.hl-lang-note {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: var(--hl-radius-md);
  background-color: var(--hl-accent-soft);
  border: 1px solid var(--hl-accent-border);
  font-size: 13px;
  line-height: 1.58;
  color: var(--hl-ink-2);
}

.hl-empty-box {
  padding: 28px;
  border-radius: var(--hl-radius-lg);
  background-color: var(--hl-surface-alt);
  border: 1px solid var(--hl-border);
  text-align: center;
  color: var(--hl-ink-3);
}

/* SHA-256 证据清单舱 */
.hl-vault {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1.5px solid var(--hl-rule-ink);
  scroll-margin-top: 76px;
}

.hl-vault-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 18px;
}

.hl-vault-kicker {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 650;
  color: var(--hl-accent);
  margin-bottom: 4px;
}

.hl-vault-head h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--hl-ink);
}

.hl-vault-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.hl-vault-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hl-vault-row {
  padding: 14px 18px;
  border-radius: var(--hl-radius-md);
  background-color: var(--hl-surface-alt);
  border: 1px solid var(--hl-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.hl-vault-row.is-open {
  border-color: var(--hl-accent);
  background-color: var(--hl-accent-soft);
}

.hl-vault-info {
  flex: 1 1 320px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hl-vault-top {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.hl-vault-path {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--hl-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.hl-vault-bytes {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--hl-ink-4);
}

.hl-v-tag {
  padding: 2px 8px;
  border-radius: var(--hl-radius-pill);
  font-size: 11px;
  font-weight: 600;
}

.hl-v-tag.is-ok {
  background-color: var(--hl-ok-soft);
  color: var(--hl-ok);
}

.hl-v-tag.is-wait {
  background-color: var(--hl-warn-soft);
  color: var(--hl-warn);
}

.hl-v-tag.is-err {
  background-color: var(--hl-err-soft);
  color: var(--hl-err);
}

.hl-vault-sha {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--hl-ink-4);
}

.hl-vault-sha code {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  color: var(--hl-ink-3);
}

.hl-inline-btn {
  padding: 1px 8px;
  border-radius: var(--hl-radius-pill);
  border: 1px solid var(--hl-border-strong);
  background-color: var(--hl-surface);
  color: var(--hl-ink-2);
  font-size: 11px;
  font-weight: 500;
  flex-shrink: 0;
  cursor: pointer;
}

.hl-inline-btn:hover {
  color: var(--hl-ink);
}

.hl-vault-btns {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* 原始文件检视器 */
.hl-inspector {
  margin-top: 16px;
  border-radius: var(--hl-radius-md);
  background-color: var(--hl-pro-code);
  border: 1px solid var(--hl-border);
  overflow: hidden;
}

.hl-inspector-head {
  padding: 10px 16px;
  background-color: var(--hl-pro-surface);
  border-bottom: 1px solid var(--hl-pro-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.hl-inspector-head span {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--hl-pro-accent);
  margin-right: 10px;
}

.hl-inspector-head code {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--hl-pro-text);
}

.hl-inspector-btns {
  display: flex;
  gap: 8px;
}

.hl-skel-box {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hl-skel {
  height: 12px;
  border-radius: var(--hl-radius-xs);
  background-color: var(--hl-pro-surface-2);
}

.hl-skel.is-w80 { width: 80%; }
.hl-skel.is-w60 { width: 60%; }
.hl-skel.is-w90 { width: 90%; }
.hl-skel.is-w70 { width: 70%; }

.hl-inspector-pre {
  margin: 0;
  padding: 16px 18px;
  max-height: 360px;
  overflow: auto;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.6;
  color: var(--hl-pro-text-2);
}

.hl-trunc-bar {
  padding: 10px 16px;
  background-color: var(--hl-surface-alt);
  border-top: 1px solid var(--hl-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12.5px;
  color: var(--hl-ink-3);
}

/* 翻页与右栏 */
.hl-bench-pager {
  margin-top: 44px;
  padding-top: 24px;
  border-top: 1px solid var(--hl-border);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.hl-pager-card {
  padding: 16px 20px;
  border-radius: var(--hl-radius-lg);
  background-color: var(--hl-surface-alt);
  border: 1px solid var(--hl-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: border-color 150ms ease, background-color 150ms ease;
}

.hl-pager-card:hover {
  border-color: var(--hl-border-strong);
  background-color: var(--hl-surface-tonal);
}

.hl-pager-card.is-next {
  text-align: right;
}

.hl-pager-card span {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--hl-accent);
}

.hl-pager-card strong {
  font-size: 14px;
  color: var(--hl-ink);
}

.hl-bench-toc-sticky {
  position: sticky;
  top: 76px;
}

.hl-bench-toc-card {
  padding: 18px;
  border-radius: var(--hl-radius-lg);
  background-color: var(--hl-surface);
  border: 1px solid var(--hl-border-soft);
  box-shadow: var(--hl-shadow-bento);
}

.hl-toc-head {
  font-size: 12px;
  font-weight: 650;
  color: var(--hl-ink);
  margin-bottom: 10px;
}

.hl-bench-toc-card ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 60vh;
  overflow-y: auto;
}

.hl-bench-toc-card li a {
  display: block;
  font-size: 12.5px;
  line-height: 1.42;
  color: var(--hl-ink-3);
}

.hl-bench-toc-card li a:hover {
  color: var(--hl-accent);
}

.hl-bench-toc-card li.is-lv-3 {
  padding-left: 12px;
}

@media (max-width: 1180px) {
  .hl-bench-grid {
    grid-template-columns: 248px minmax(0, 1fr);
  }

  .hl-bench-right {
    display: none;
  }

  .hl-bench-kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .hl-bench-grid {
    grid-template-columns: 1fr;
  }

  .hl-bench-sb {
    position: static;
  }

  .hl-bench-sheet {
    padding: 28px 20px;
  }

  .hl-bench-kpis,
  .hl-bench-pager {
    grid-template-columns: 1fr;
  }
}
</style>
