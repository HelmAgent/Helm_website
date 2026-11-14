/**
 * Mermaid 架构图渲染、SVG 克隆隔离与放大检视数据提取辅助模块。
 *
 * 职责与协作：
 * - 统一从全局设计令牌（`flagship.css`）读取浅色主题变量初始化 Mermaid 11。
 * - 将 `.nx-mermaid-stage[data-mermaid]` 渲染为矢量 SVG，并记录原始 `viewBox` 尺寸与渲染状态（支持错误回退与重试）。
 * - 为全屏缩放检视器（`DiagramLightbox.vue`）生成去重命名空间的纯净矢量 SVG，消除同页重复 ID 与 `max-width` 限制。
 */

export async function renderMermaidStages(rootEl, options = { forceRetryErrors: false }) {
  if (typeof window === 'undefined' || !rootEl) return
  const stages = rootEl.querySelectorAll('.nx-mermaid-stage[data-mermaid]')
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
      if (!el.isConnected) continue
      if (el.dataset.rendered === '1') continue
      if (el.dataset.rendered === 'error' && !options.forceRetryErrors) continue

      const rawCode = decodeURIComponent(el.dataset.mermaid || '')
      if (!rawCode) continue

      const id = `hl-mermaid-${Date.now()}-${i}`
      try {
        const { svg } = await mermaid.render(id, rawCode)
        if (!el.isConnected) continue
        el.innerHTML = svg
        el.dataset.svgId = id

        const svgEl = el.querySelector('svg')
        const { vbWidth, vbHeight } = extractSvgViewBoxSize(svgEl)
        el.dataset.vbWidth = String(vbWidth)
        el.dataset.vbHeight = String(vbHeight)
        el.dataset.rendered = '1'
      } catch (stageErr) {
        console.warn(`[Helm Diagram] Mermaid stage ${i} failed:`, stageErr)
        el.dataset.rendered = 'error'
      }
    }
  } catch (err) {
    console.warn('[Helm Diagram] Mermaid module load failed:', err)
    for (const el of stages) {
      if (el.dataset.rendered !== '1') {
        el.dataset.rendered = 'error'
      }
    }
  }
}

export function extractSvgViewBoxSize(svgEl) {
  if (!svgEl) return { vbWidth: 960, vbHeight: 540 }

  const vbAttr = svgEl.getAttribute('viewBox')
  if (vbAttr) {
    const nums = vbAttr
      .trim()
      .split(/[\s,]+/)
      .map(Number)
    if (nums.length === 4 && nums[2] > 0 && nums[3] > 0) {
      return { vbWidth: nums[2], vbHeight: nums[3] }
    }
  }

  const baseVal = svgEl.viewBox && svgEl.viewBox.baseVal
  if (baseVal && baseVal.width > 0 && baseVal.height > 0) {
    return { vbWidth: baseVal.width, vbHeight: baseVal.height }
  }

  const rect = svgEl.getBoundingClientRect()
  if (rect && rect.width > 0 && rect.height > 0) {
    return { vbWidth: rect.width, vbHeight: rect.height }
  }

  return { vbWidth: 960, vbHeight: 540 }
}

export function prepareZoomSvg(svgMarkup, origId, fallbackW = 960, fallbackH = 540) {
  if (!svgMarkup) {
    return { svgHtml: '', vbWidth: fallbackW, vbHeight: fallbackH }
  }

  let namespaced = svgMarkup
  if (origId) {
    const escaped = origId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    namespaced = namespaced.replace(new RegExp(escaped, 'g'), `${origId}-zoom`)
  }

  if (typeof document === 'undefined') {
    return { svgHtml: namespaced, vbWidth: fallbackW, vbHeight: fallbackH }
  }

  const temp = document.createElement('div')
  temp.innerHTML = namespaced
  const svgEl = temp.querySelector('svg')
  if (!svgEl) {
    return { svgHtml: namespaced, vbWidth: fallbackW, vbHeight: fallbackH }
  }

  let vbWidth = Number(fallbackW) || 0
  let vbHeight = Number(fallbackH) || 0
  const vbAttr = svgEl.getAttribute('viewBox')
  if (vbAttr) {
    const nums = vbAttr
      .trim()
      .split(/[\s,]+/)
      .map(Number)
    if (nums.length === 4 && nums[2] > 0 && nums[3] > 0) {
      vbWidth = nums[2]
      vbHeight = nums[3]
    }
  } else if (vbWidth > 0 && vbHeight > 0) {
    svgEl.setAttribute('viewBox', `0 0 ${vbWidth} ${vbHeight}`)
  }

  if (!vbWidth || vbWidth <= 0) vbWidth = 960
  if (!vbHeight || vbHeight <= 0) vbHeight = 540

  svgEl.style.removeProperty('max-width')
  svgEl.style.removeProperty('max-height')
  svgEl.style.width = '100%'
  svgEl.style.height = '100%'
  svgEl.style.display = 'block'
  svgEl.removeAttribute('width')
  svgEl.removeAttribute('height')

  return {
    svgHtml: svgEl.outerHTML,
    vbWidth,
    vbHeight
  }
}

export function collectArticleDiagrams(rootEl) {
  if (!rootEl) return []
  const cards = rootEl.querySelectorAll('.nx-mermaid-card')
  const items = []

  cards.forEach((card, idx) => {
    const stageEl = card.querySelector('.nx-mermaid-stage')
    if (!stageEl) return
    const title = card.dataset.mermaidTitle || ''
    const renderedState = stageEl.dataset.rendered || ''
    const rawCode = decodeURIComponent(stageEl.dataset.mermaid || '')

    if (renderedState === '1') {
      const origId = stageEl.dataset.svgId || ''
      const fbW = Number(stageEl.dataset.vbWidth) || 960
      const fbH = Number(stageEl.dataset.vbHeight) || 540
      const { svgHtml, vbWidth, vbHeight } = prepareZoomSvg(stageEl.innerHTML, origId, fbW, fbH)
      items.push({
        index: idx,
        title,
        svgHtml,
        vbWidth,
        vbHeight,
        hasError: false,
        rawCode
      })
    } else {
      items.push({
        index: idx,
        title,
        svgHtml: '',
        vbWidth: 960,
        vbHeight: 540,
        hasError: renderedState === 'error',
        rawCode
      })
    }
  })

  return items
}
