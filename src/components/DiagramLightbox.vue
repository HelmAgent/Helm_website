<script setup>
/**
 * DiagramLightbox.vue — 极昼工程白皮书矢量架构图全屏放大检视器
 *
 * 职责与协作：
 * - 承接白皮书与指南中所有 Mermaid 矢量架构图的全屏高清放大、鼠标锚点滚轮缩放、拖拽平移、双击切换与同章多图巡航。
 * - 采用原生 SVG 视口几何缩放（`vbWidth * scale`）配合 `translate3d` 平移，确保任意倍率下文字与线条 100% 矢量锐利不模糊。
 * - 严格引用 `flagship.css` 全局语义令牌，零硬编码色值，完整覆盖 Loading / Empty / Error / Ready 四态与键盘无障碍焦点环。
 */
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { tt } from '../data/siteData.js'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  diagrams: {
    type: Array,
    default: () => []
  },
  activeIndex: {
    type: Number,
    default: 0
  },
  chapterTitle: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  lang: {
    type: String,
    default: 'zh'
  }
})

const emit = defineEmits(['close', 'select', 'retry'])

const MIN_SCALE = 0.25
const MAX_SCALE = 4.0
const ZOOM_STEP = 1.25

const dialogRef = ref(null)
const closeBtnRef = ref(null)
const stageRef = ref(null)

const scale = ref(1)
const fitScale = ref(1)
const panX = ref(0)
const panY = ref(0)
const isDragging = ref(false)
const isMaximized = ref(false)
const viewMode = ref('fit') // 'fit' | 'readable' | 'actual' | 'custom'

let dragPointerId = null
let dragStartX = 0
let dragStartY = 0
let dragOriginPanX = 0
let dragOriginPanY = 0
let movedDuringPointer = false
let previousFocusEl = null
let resizeObserver = null

function t(zh, ja, en) {
  return tt(props.lang, zh, ja, en)
}

const currentDiagram = computed(() => {
  if (!props.diagrams.length) return null
  return props.diagrams[props.activeIndex] || props.diagrams[0]
})

const figureBadge = computed(() => {
  const total = props.diagrams.length
  if (!total) return 'FIG 00'
  const cur = String(props.activeIndex + 1).padStart(2, '0')
  const tot = String(total).padStart(2, '0')
  return `${cur} / ${tot}`
})

const zoomPercent = computed(() => `${Math.round(scale.value * 100)}%`)

const scaledWidth = computed(() => {
  const vbW = currentDiagram.value?.vbWidth || 960
  return Math.max(40, Math.round(vbW * scale.value))
})

const scaledHeight = computed(() => {
  const vbH = currentDiagram.value?.vbHeight || 540
  return Math.max(40, Math.round(vbH * scale.value))
})

const isAtFit = computed(() => {
  return (
    Math.abs(scale.value - fitScale.value) < 0.025 &&
    Math.abs(panX.value) < 6 &&
    Math.abs(panY.value) < 6
  )
})

const isAtActual = computed(() => Math.abs(scale.value - 1) < 0.025)

const canZoomOut = computed(() => scale.value > MIN_SCALE + 0.01)
const canZoomIn = computed(() => scale.value < MAX_SCALE - 0.01)
const hasMultiple = computed(() => props.diagrams.length > 1)
const canPrev = computed(() => props.activeIndex > 0)
const canNext = computed(() => props.activeIndex < props.diagrams.length - 1)

function clampScale(val) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, val))
}

function clampPan(nextPanX, nextPanY, targetScale = scale.value) {
  const stage = stageRef.value
  const diag = currentDiagram.value
  if (!stage || !diag) {
    return { x: nextPanX, y: nextPanY }
  }
  const stageW = stage.clientWidth || 800
  const stageH = stage.clientHeight || 520
  const outerW = diag.vbWidth * targetScale + 34
  const outerH = diag.vbHeight * targetScale + 34

  const maxX = Math.max((outerW - stageW) / 2 + 48, 120)
  const maxY = Math.max((outerH - stageH) / 2 + 48, 120)

  return {
    x: Math.min(maxX, Math.max(-maxX, nextPanX)),
    y: Math.min(maxY, Math.max(-maxY, nextPanY))
  }
}

function computeFitScale() {
  const stage = stageRef.value
  const diag = currentDiagram.value
  if (!stage || !diag || !diag.vbWidth || !diag.vbHeight) return 1

  const stageW = stage.clientWidth || 960
  const stageH = stage.clientHeight || 600
  const padX = stageW < 640 ? 20 : 40
  const padY = stageH < 520 ? 20 : 40
  const availW = Math.max(160, stageW - padX - 34)
  const availH = Math.max(140, stageH - padY - 34)

  const rawFit = Math.min(availW / diag.vbWidth, availH / diag.vbHeight)
  return clampScale(Math.min(rawFit, 3.2))
}

function fitToScreen() {
  const fit = computeFitScale()
  viewMode.value = 'fit'
  fitScale.value = fit
  scale.value = fit
  panX.value = 0
  panY.value = 0
}

function setActualSize() {
  const stage = stageRef.value
  const diag = currentDiagram.value
  const next = 1
  viewMode.value = 'actual'
  scale.value = next

  if (!stage || !diag) {
    panX.value = 0
    panY.value = 0
    return
  }

  const stageW = stage.clientWidth || 960
  const stageH = stage.clientHeight || 600
  const outerW = diag.vbWidth * next + 34
  const outerH = diag.vbHeight * next + 34

  const startX = outerW > stageW - 40 ? outerW / 2 - stageW / 2 + 24 : 0
  const startY = outerH > stageH - 40 ? outerH / 2 - stageH / 2 + 24 : 0
  const clamped = clampPan(startX, startY, next)
  panX.value = clamped.x
  panY.value = clamped.y
}

function applyInitialView() {
  const stage = stageRef.value
  const diag = currentDiagram.value
  if (!stage || !diag || !diag.svgHtml) return

  const fit = computeFitScale()
  fitScale.value = fit

  // 若适应窗口比例过低（如超宽 8 节点横向流水线），自动提升至可读比例并对齐起始节点
  if (fit < 0.8) {
    viewMode.value = 'readable'
    const readable = clampScale(Math.min(1.0, Math.max(fit * 1.5, 0.92)))
    scale.value = readable
    const stageW = stage.clientWidth || 960
    const stageH = stage.clientHeight || 600
    const outerW = diag.vbWidth * readable + 34
    const outerH = diag.vbHeight * readable + 34
    const startX = outerW > stageW - 40 ? outerW / 2 - stageW / 2 + 24 : 0
    const startY = outerH > stageH - 40 ? outerH / 2 - stageH / 2 + 24 : 0
    const clamped = clampPan(startX, startY, readable)
    panX.value = clamped.x
    panY.value = clamped.y
  } else {
    viewMode.value = 'fit'
    scale.value = fit
    panX.value = 0
    panY.value = 0
  }
}

function toggleMaximize() {
  isMaximized.value = !isMaximized.value
}

function zoomAroundOffset(nextScaleRaw, offsetX = 0, offsetY = 0) {
  const prev = scale.value
  const next = clampScale(nextScaleRaw)
  if (Math.abs(next - prev) < 0.001) return

  viewMode.value = 'custom'
  const ratio = next / prev
  const rawPanX = offsetX - (offsetX - panX.value) * ratio
  const rawPanY = offsetY - (offsetY - panY.value) * ratio
  const clamped = clampPan(rawPanX, rawPanY, next)

  scale.value = next
  panX.value = clamped.x
  panY.value = clamped.y
}

function stepZoom(factor) {
  zoomAroundOffset(scale.value * factor, 0, 0)
}

function handleWheel(e) {
  if (!currentDiagram.value?.svgHtml) return
  e.preventDefault()

  const stage = stageRef.value
  if (!stage) return
  const rect = stage.getBoundingClientRect()
  const dx = e.clientX - rect.left - rect.width / 2
  const dy = e.clientY - rect.top - rect.height / 2

  const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY
  const factor = Math.exp(-delta * 0.0018)
  zoomAroundOffset(scale.value * factor, dx, dy)
}

function handleStageDblClick(e) {
  if (!currentDiagram.value?.svgHtml) return
  const stage = stageRef.value
  if (!stage) return

  if (Math.abs(scale.value - fitScale.value) < 0.06) {
    const rect = stage.getBoundingClientRect()
    const dx = e.clientX - rect.left - rect.width / 2
    const dy = e.clientY - rect.top - rect.height / 2
    const target = clampScale(Math.max(1.5, fitScale.value * 1.65))
    zoomAroundOffset(target, dx, dy)
  } else {
    fitToScreen()
  }
}

function onPointerDown(e) {
  if (e.button !== 0 || !currentDiagram.value?.svgHtml) return
  const stage = stageRef.value
  if (!stage) return

  dragPointerId = e.pointerId
  dragStartX = e.clientX
  dragStartY = e.clientY
  dragOriginPanX = panX.value
  dragOriginPanY = panY.value
  movedDuringPointer = false
  isDragging.value = true

  try {
    stage.setPointerCapture(e.pointerId)
  } catch {
    // ignore pointer capture unsupported cases
  }
}

function onPointerMove(e) {
  if (!isDragging.value || e.pointerId !== dragPointerId) return
  const dx = e.clientX - dragStartX
  const dy = e.clientY - dragStartY
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
    movedDuringPointer = true
  }
  if (!movedDuringPointer) return

  const clamped = clampPan(dragOriginPanX + dx, dragOriginPanY + dy, scale.value)
  panX.value = clamped.x
  panY.value = clamped.y
}

function endPointerDrag(e) {
  if (!isDragging.value) return
  if (e && dragPointerId !== null && e.pointerId !== dragPointerId) return
  const stage = stageRef.value
  if (stage && dragPointerId !== null) {
    try {
      if (stage.hasPointerCapture(dragPointerId)) {
        stage.releasePointerCapture(dragPointerId)
      }
    } catch {
      // ignore
    }
  }
  isDragging.value = false
  dragPointerId = null
}

function selectPrev() {
  if (canPrev.value) {
    emit('select', props.activeIndex - 1)
  }
}

function selectNext() {
  if (canNext.value) {
    emit('select', props.activeIndex + 1)
  }
}

function trapTabFocus(e) {
  const root = dialogRef.value
  if (!root) return
  const focusables = Array.from(
    root.querySelectorAll('button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])')
  )
  if (!focusables.length) return
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

function onKeydown(e) {
  if (!props.open) return

  if (e.key === 'Escape') {
    e.preventDefault()
    emit('close')
    return
  }

  if (e.key === 'Tab') {
    trapTabFocus(e)
    return
  }

  if (e.key === '+' || e.key === '=') {
    e.preventDefault()
    stepZoom(ZOOM_STEP)
  } else if (e.key === '-' || e.key === '_') {
    e.preventDefault()
    stepZoom(1 / ZOOM_STEP)
  } else if (e.key === '0') {
    e.preventDefault()
    fitToScreen()
  } else if (e.key === '1') {
    e.preventDefault()
    setActualSize()
  } else if (e.key === 'f' || e.key === 'F') {
    if (!e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault()
      toggleMaximize()
    }
  } else if (e.key === '[') {
    e.preventDefault()
    selectPrev()
  } else if (e.key === ']') {
    e.preventDefault()
    selectNext()
  }
}

function setupResizeObserver() {
  if (typeof ResizeObserver === 'undefined' || !stageRef.value) return
  if (resizeObserver) resizeObserver.disconnect()
  resizeObserver = new ResizeObserver(() => {
    if (!props.open || !currentDiagram.value?.svgHtml) return
    const nextFit = computeFitScale()
    fitScale.value = nextFit
    if (viewMode.value === 'fit') {
      scale.value = nextFit
      panX.value = 0
      panY.value = 0
    } else if (viewMode.value === 'readable') {
      applyInitialView()
    } else {
      const clamped = clampPan(panX.value, panY.value, scale.value)
      panX.value = clamped.x
      panY.value = clamped.y
    }
  })
  resizeObserver.observe(stageRef.value)
}

watch(
  () => props.open,
  (isOpen) => {
    if (typeof document === 'undefined') return
    if (isOpen) {
      previousFocusEl = document.activeElement
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      nextTick(() => {
        setupResizeObserver()
        applyInitialView()
        closeBtnRef.value?.focus()
      })
    } else {
      isMaximized.value = false
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
      }
      if (previousFocusEl && typeof previousFocusEl.focus === 'function') {
        previousFocusEl.focus()
      }
      previousFocusEl = null
    }
  }
)

watch(
  () => [props.activeIndex, currentDiagram.value?.svgHtml],
  () => {
    if (!props.open) return
    nextTick(() => {
      applyInitialView()
    })
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
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  if (typeof document !== 'undefined') {
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="hl-zoom-fade">
      <div
        v-if="open"
        ref="dialogRef"
        class="hl-zoom-backdrop"
        role="dialog"
        aria-modal="true"
        :aria-label="currentDiagram?.title || t('架构图放大预览', 'アーキテクチャ図の拡大表示', 'Architecture Diagram Viewer')"
        @click.self="emit('close')"
      >
        <div class="hl-zoom-panel" :class="{ 'is-maximized': isMaximized }">
          <!-- 顶部控制栏：序号与章节标题 + 同章切换 + 缩放预设与步进 + 关闭 -->
          <header class="hl-zoom-topbar">
            <div class="hl-zoom-heading">
              <div class="hl-zoom-meta">
                <span class="hl-zoom-badge hl-tabular">{{ figureBadge }}</span>
                <span v-if="chapterTitle" class="hl-zoom-chapter" :title="chapterTitle">{{ chapterTitle }}</span>
              </div>
              <h3 class="hl-zoom-title" :title="currentDiagram?.title">
                {{ currentDiagram?.title || t('架构拓扑图', 'アーキテクチャ図', 'Architecture Topology') }}
              </h3>
            </div>

            <div class="hl-zoom-toolbar">
              <!-- 同章多图前后切换 -->
              <div v-if="hasMultiple" class="hl-zoom-group" role="group" :aria-label="t('切换架构图', '図表の切替', 'Switch diagram')">
                <button
                  type="button"
                  class="hl-zoom-icon-btn"
                  :disabled="!canPrev"
                  :title="t('上一张架构图 ([)', '前の図 ([)', 'Previous diagram ([)')"
                  :aria-label="t('上一张架构图', '前の図', 'Previous diagram')"
                  @click="selectPrev"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="hl-zoom-icon-btn"
                  :disabled="!canNext"
                  :title="t('下一张架构图 (])', '次の図 (])', 'Next diagram (])')"
                  :aria-label="t('下一张架构图', '次の図', 'Next diagram')"
                  @click="selectNext"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>

              <!-- 适应窗口 / 1:1 原始比例切换 -->
              <div class="hl-zoom-group" role="group" :aria-label="t('视图比例模式', '表示倍率モード', 'View scale presets')">
                <button
                  type="button"
                  class="hl-zoom-text-btn"
                  :class="{ 'is-active': isAtFit }"
                  :disabled="!currentDiagram?.svgHtml"
                  :title="t('适应窗口大小 (0)', '画面に合わせる (0)', 'Fit to window (0)')"
                  @click="fitToScreen"
                >
                  {{ t('适应窗口', '全体表示', 'Fit') }}
                </button>
                <button
                  type="button"
                  class="hl-zoom-text-btn hl-tabular"
                  :class="{ 'is-active': isAtActual }"
                  :disabled="!currentDiagram?.svgHtml"
                  :title="t('1:1 原始比例 (1)', '等倍表示 (1)', 'Actual size 1:1 (1)')"
                  @click="setActualSize"
                >
                  1:1
                </button>
              </div>

              <!-- 缩放步进器 -->
              <div class="hl-zoom-group" role="group" :aria-label="t('缩放控制', 'ズーム操作', 'Zoom controls')">
                <button
                  type="button"
                  class="hl-zoom-icon-btn"
                  :disabled="!canZoomOut || !currentDiagram?.svgHtml"
                  :title="t('缩小 (-)', '縮小 (-)', 'Zoom out (-)')"
                  :aria-label="t('缩小', '縮小', 'Zoom out')"
                  @click="stepZoom(1 / ZOOM_STEP)"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3M8 11h6" />
                  </svg>
                </button>

                <button
                  type="button"
                  class="hl-zoom-readout hl-tabular"
                  :disabled="!currentDiagram?.svgHtml"
                  :title="t('点击重置为适应窗口', 'クリックで全体表示にリセット', 'Click to fit window')"
                  @click="fitToScreen"
                >
                  {{ zoomPercent }}
                </button>

                <button
                  type="button"
                  class="hl-zoom-icon-btn"
                  :disabled="!canZoomIn || !currentDiagram?.svgHtml"
                  :title="t('放大 (+)', '拡大 (+)', 'Zoom in (+)')"
                  :aria-label="t('放大', '拡大', 'Zoom in')"
                  @click="stepZoom(ZOOM_STEP)"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3M11 8v6M8 11h6" />
                  </svg>
                </button>
              </div>

              <!-- 全屏铺满 (100%) / 92% 浮动视窗切换 -->
              <button
                type="button"
                class="hl-zoom-expand"
                :class="{ 'is-active': isMaximized }"
                :aria-pressed="isMaximized"
                :title="
                  isMaximized
                    ? t('还原为 92% 自适应弹窗 (F)', '92% ウィンドウに戻す (F)', 'Restore 92% adaptive modal (F)')
                    : t('铺满 100% 浏览器窗口 (F)', 'ブラウザ全体に最大化 (F)', 'Maximize to 100% viewport (F)')
                "
                :aria-label="
                  isMaximized
                    ? t('还原弹窗尺寸', 'ウィンドウサイズを戻す', 'Restore modal size')
                    : t('铺满浏览器窗口', 'ブラウザ全体に最大化', 'Maximize to full viewport')
                "
                @click="toggleMaximize"
              >
                <svg v-if="!isMaximized" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
                <svg v-else viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="4 14 10 14 10 20" />
                  <polyline points="20 10 14 10 14 4" />
                  <line x1="14" y1="10" x2="21" y2="3" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              </button>

              <!-- 关闭按钮 -->
              <button
                ref="closeBtnRef"
                type="button"
                class="hl-zoom-close"
                :title="t('关闭预览 (Esc)', '閉じる (Esc)', 'Close viewer (Esc)')"
                :aria-label="t('关闭架构图放大预览', '拡大表示を閉じる', 'Close diagram viewer')"
                @click="emit('close')"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

          <!-- 中部画布：完整覆盖 Loading / Empty / Error / Ready 四态 -->
          <div
            ref="stageRef"
            class="hl-zoom-stage"
            :class="{
              'is-interactive': Boolean(currentDiagram?.svgHtml),
              'is-dragging': isDragging
            }"
            @wheel="handleWheel"
            @dblclick="handleStageDblClick"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="endPointerDrag"
            @pointercancel="endPointerDrag"
          >
            <!-- Loading 骨架态 -->
            <div v-if="loading || (currentDiagram && !currentDiagram.svgHtml && !currentDiagram.hasError)" class="hl-zoom-state-card" aria-busy="true">
              <div class="hl-zoom-skel is-w60"></div>
              <div class="hl-zoom-skel is-w90"></div>
              <div class="hl-zoom-skel is-w75"></div>
              <p class="hl-zoom-state-note">
                {{ t('正在生成高清矢量架构图...', 'ベクター図表を描画しています...', 'Rendering crisp vector diagram...') }}
              </p>
            </div>

            <!-- Empty 空状态 -->
            <div v-else-if="!currentDiagram" class="hl-zoom-state-card">
              <strong>{{ t('当前章节暂无可预览的架构图', '表示可能なアーキテクチャ図がありません', 'No diagram available in this section') }}</strong>
              <p class="hl-zoom-state-note">
                {{ t('请返回白皮书正文选择包含拓扑图的章节进行检视。', '本文に戻り、図表を含むセクションを選択してください。', 'Return to the article and select a topology figure.') }}
              </p>
              <button type="button" class="hl-btn hl-btn-outline hl-btn-xs" @click="emit('close')">
                {{ t('返回正文', '本文へ戻る', 'Back to Article') }}
              </button>
            </div>

            <!-- Error 失败态 + 重试入口 -->
            <div v-else-if="currentDiagram.hasError" class="hl-zoom-state-card is-error" role="alert">
              <strong>{{ t('架构图渲染异常', '図表の描画に失敗しました', 'Diagram Render Failed') }}</strong>
              <p class="hl-zoom-state-note">
                {{ t('当前图表未能完成矢量编译，您可以点击重新渲染或查阅原始拓扑定义。', 'ベクター変換が完了しませんでした。再試行するか定義を確認してください。', 'Vector compilation did not finish. Retry rendering or inspect raw source.') }}
              </p>
              <pre v-if="currentDiagram.rawCode" class="hl-zoom-raw-pre"><code>{{ currentDiagram.rawCode }}</code></pre>
              <div class="hl-zoom-err-actions">
                <button type="button" class="hl-btn hl-btn-ink hl-btn-xs" @click="emit('retry', currentDiagram.index)">
                  {{ t('重试渲染', '再試行', 'Retry Render') }}
                </button>
                <button type="button" class="hl-btn hl-btn-outline hl-btn-xs" @click="emit('close')">
                  {{ t('关闭窗口', '閉じる', 'Close') }}
                </button>
              </div>
            </div>

            <!-- Ready 高清矢量画布 -->
            <div
              v-else
              class="hl-zoom-canvas"
              :style="{
                width: `${scaledWidth}px`,
                height: `${scaledHeight}px`,
                transform: `translate3d(${panX}px, ${panY}px, 0)`
              }"
              v-html="currentDiagram.svgHtml"
            ></div>
          </div>

          <!-- 底部静谧操作提示条 -->
          <footer class="hl-zoom-footer">
            <span class="hl-zoom-hint">
              {{
                t(
                  '滚轮平滑缩放 · 按住左键拖拽平移 · 双击画布快速放大或复位',
                  'ホイールで拡大縮小 · ドラッグで移動 · ダブルクリックで倍率切替',
                  'Scroll to zoom · Drag to pan · Double-click to toggle zoom'
                )
              }}
            </span>
            <div class="hl-zoom-shortcuts hl-tabular">
              <span><kbd>+</kbd> <kbd>-</kbd> {{ t('缩放', '拡縮', 'Zoom') }}</span>
              <span><kbd>0</kbd> {{ t('适应窗口', '全体', 'Fit') }}</span>
              <span><kbd>1</kbd> 1:1</span>
              <span><kbd>F</kbd> {{ t('全屏', '最大化', 'Max') }}</span>
              <span v-if="hasMultiple"><kbd>[</kbd> <kbd>]</kbd> {{ t('切图', '切替', 'Prev/Next') }}</span>
              <span><kbd>Esc</kbd> {{ t('关闭', '閉じる', 'Close') }}</span>
            </div>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.hl-zoom-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1300;
  background-color: var(--hl-backdrop);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.hl-zoom-panel {
  width: 92vw;
  width: 92dvw;
  height: 92vh;
  height: 92dvh;
  min-width: min(320px, 96vw);
  min-height: min(360px, 94vh);
  display: flex;
  flex-direction: column;
  background-color: var(--hl-surface-sheet);
  border: 1px solid var(--hl-border-soft);
  border-radius: var(--hl-radius-2xl);
  box-shadow: var(--hl-shadow-sheet);
  color: var(--hl-ink);
  overflow: hidden;
  transition:
    width var(--hl-dur) var(--hl-ease),
    height var(--hl-dur) var(--hl-ease),
    border-radius var(--hl-dur) var(--hl-ease);
}

.hl-zoom-panel.is-maximized {
  width: 100vw;
  width: 100dvw;
  height: 100vh;
  height: 100dvh;
  border-radius: 0;
  border-width: 0;
}

.hl-zoom-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 24px;
  background-color: var(--hl-surface-frosted);
  border-bottom: 1px solid var(--hl-border);
  flex-shrink: 0;
}

.hl-zoom-heading {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hl-zoom-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.hl-zoom-badge {
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--hl-radius-pill);
  background-color: var(--hl-accent-soft);
  color: var(--hl-accent);
  flex-shrink: 0;
}

.hl-zoom-chapter {
  font-size: 12px;
  color: var(--hl-ink-4);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.hl-zoom-title {
  margin: 0;
  font-size: 16px;
  font-weight: 650;
  letter-spacing: -0.015em;
  line-height: 1.3;
  color: var(--hl-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.hl-zoom-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.hl-zoom-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: var(--hl-radius-pill);
  background-color: var(--hl-surface-tonal);
  border: 1px solid var(--hl-border);
}

.hl-zoom-icon-btn,
.hl-zoom-text-btn,
.hl-zoom-readout {
  height: 28px;
  border-radius: var(--hl-radius-pill);
  border: 0;
  background: transparent;
  color: var(--hl-ink-2);
  font-size: 12.5px;
  font-weight: 550;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  transition:
    background-color var(--hl-dur) var(--hl-ease),
    color var(--hl-dur) var(--hl-ease),
    box-shadow var(--hl-dur) var(--hl-ease),
    transform var(--hl-dur) var(--hl-ease);
}

.hl-zoom-icon-btn {
  width: 28px;
  padding: 0;
}

.hl-zoom-text-btn {
  padding: 0 12px;
  white-space: nowrap;
}

.hl-zoom-readout {
  min-width: 52px;
  padding: 0 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--hl-ink);
  background-color: var(--hl-surface);
  box-shadow: var(--hl-shadow-2xs);
}

.hl-zoom-icon-btn:hover:not(:disabled),
.hl-zoom-text-btn:hover:not(:disabled),
.hl-zoom-readout:hover:not(:disabled) {
  background-color: var(--hl-surface);
  color: var(--hl-ink);
}

.hl-zoom-text-btn.is-active {
  background-color: var(--hl-surface);
  color: var(--hl-accent);
  box-shadow: var(--hl-shadow-2xs);
}

.hl-zoom-icon-btn:active:not(:disabled),
.hl-zoom-text-btn:active:not(:disabled),
.hl-zoom-readout:active:not(:disabled) {
  transform: scale(0.96);
}

.hl-zoom-icon-btn:disabled,
.hl-zoom-text-btn:disabled,
.hl-zoom-readout:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.hl-zoom-expand,
.hl-zoom-close {
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
  transition:
    background-color var(--hl-dur) var(--hl-ease),
    color var(--hl-dur) var(--hl-ease),
    transform var(--hl-dur) var(--hl-ease);
}

.hl-zoom-expand.is-active {
  background-color: var(--hl-accent-soft);
  color: var(--hl-accent);
}

.hl-zoom-expand:hover,
.hl-zoom-close:hover {
  background-color: var(--hl-ink);
  color: var(--hl-on-ink);
  transform: scale(1.04);
}

.hl-zoom-expand:active,
.hl-zoom-close:active {
  transform: scale(0.97);
}

/* 矢量制图画布（极浅点阵标尺底纹，100% 语义变量） */
.hl-zoom-stage {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--hl-surface-subtle);
  background-image: radial-gradient(circle, var(--hl-border) 1px, transparent 1px);
  background-size: 20px 20px;
  user-select: none;
  touch-action: none;
}

.hl-zoom-stage.is-interactive {
  cursor: grab;
}

.hl-zoom-stage.is-interactive.is-dragging {
  cursor: grabbing;
}

.hl-zoom-canvas {
  box-sizing: content-box;
  flex-shrink: 0;
  padding: 16px;
  border-radius: var(--hl-radius-lg);
  background-color: var(--hl-surface);
  border: 1px solid var(--hl-border);
  box-shadow: var(--hl-shadow-bento);
  will-change: transform;
}

.hl-zoom-canvas :deep(svg) {
  width: 100% !important;
  height: 100% !important;
  max-width: none !important;
  max-height: none !important;
  display: block;
}

/* Loading / Empty / Error 状态卡片 */
.hl-zoom-state-card {
  width: 100%;
  max-width: 520px;
  margin: 24px;
  padding: 24px;
  border-radius: var(--hl-radius-lg);
  background-color: var(--hl-surface);
  border: 1px solid var(--hl-border);
  box-shadow: var(--hl-shadow-bento);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hl-zoom-state-card.is-error {
  border-color: var(--hl-err-border);
}

.hl-zoom-state-card strong {
  font-size: 15px;
  color: var(--hl-ink);
}

.hl-zoom-state-note {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--hl-ink-3);
}

.hl-zoom-skel {
  height: 12px;
  border-radius: var(--hl-radius-xs);
  background-color: var(--hl-surface-tonal);
  animation: hl-zoom-pulse 1.4s ease-in-out infinite;
}

.hl-zoom-skel.is-w60 {
  width: 60%;
}

.hl-zoom-skel.is-w90 {
  width: 90%;
}

.hl-zoom-skel.is-w75 {
  width: 75%;
}

@keyframes hl-zoom-pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.hl-zoom-raw-pre {
  margin: 0;
  padding: 12px;
  max-height: 200px;
  overflow: auto;
  border-radius: var(--hl-radius-sm);
  background-color: var(--hl-surface-alt);
  border: 1px solid var(--hl-border);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--hl-ink-2);
}

.hl-zoom-err-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 底部快捷键提示栏 */
.hl-zoom-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 24px;
  background-color: var(--hl-surface);
  border-top: 1px solid var(--hl-border);
  flex-shrink: 0;
}

.hl-zoom-hint {
  font-size: 12.5px;
  color: var(--hl-ink-3);
}

.hl-zoom-shortcuts {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: var(--hl-ink-4);
}

.hl-zoom-shortcuts span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.hl-zoom-shortcuts kbd {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 2px 6px;
  border-radius: var(--hl-radius-xs);
  background-color: var(--hl-surface-alt);
  border: 1px solid var(--hl-border-strong);
  color: var(--hl-ink-2);
}

/* 弹窗出入场过渡 */
.hl-zoom-fade-enter-active,
.hl-zoom-fade-leave-active {
  transition: opacity var(--hl-dur) var(--hl-ease);
}

.hl-zoom-fade-enter-active .hl-zoom-panel,
.hl-zoom-fade-leave-active .hl-zoom-panel {
  transition: transform var(--hl-dur) var(--hl-ease);
}

.hl-zoom-fade-enter-from,
.hl-zoom-fade-leave-to {
  opacity: 0;
}

.hl-zoom-fade-enter-from .hl-zoom-panel,
.hl-zoom-fade-leave-to .hl-zoom-panel {
  transform: scale(0.985);
}

@media (max-width: 768px) {
  .hl-zoom-panel {
    width: 96vw;
    width: 96dvw;
    height: 94vh;
    height: 94dvh;
    border-radius: var(--hl-radius-xl);
  }

  .hl-zoom-panel.is-maximized {
    width: 100vw;
    width: 100dvw;
    height: 100vh;
    height: 100dvh;
    border-radius: 0;
  }

  .hl-zoom-topbar {
    flex-wrap: wrap;
    padding: 12px 16px;
    gap: 12px;
  }

  .hl-zoom-toolbar {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .hl-zoom-footer {
    padding: 12px 16px;
  }

  .hl-zoom-shortcuts {
    display: none;
  }
}
</style>
