/**
 * 旗舰官网内置的零依赖 Markdown → 企业级深色玻璃态 HTML 解析器。
 *
 * 职责与协作：
 * - 解析 `docs/architecture/*` 与 `docs/guide/*` 中的 Frontmatter、多级标题（提取右侧目录 TOC）、GitHub 风格提示块（> [!NOTE] 等）、表格、Mermaid 架构图与代码块。
 * - 专为「风格 1：深邃科技旗舰风」定制输出 DOM 类名，彻底摆脱 VitePress 默认 `.vp-doc` 文档样式。
 */

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function slugify(text, index) {
  const cleaned = text
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_~]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s/\\.,()（）:：—–-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return cleaned ? `sec-${index}-${cleaned}` : `sec-${index}`
}

function parseInline(text) {
  if (!text) return ''
  // 先保护行内代码 `code`
  const codeSlots = []
  let working = text.replace(/`([^`]+)`/g, (_, code) => {
    const token = `@@INLINE_CODE_${codeSlots.length}@@`
    codeSlots.push(`<code class="nx-inline-code">${escapeHtml(code)}</code>`)
    return token
  })

  // 允许原始 <br/> 或 <br>
  working = working.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  working = working.replace(/&lt;br\s*\/?&gt;/gi, '<br/>')

  // 链接 [text](url)
  working = working.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const isExternal = /^https?:\/\//i.test(href)
    const isRawAsset = /^\/benchmarks\/.+\.(json|jsonl|zip|txt|csv)(\?.*)?$/i.test(href)
    if (isExternal || isRawAsset) {
      return `<a class="nx-doc-link" href="${href}" target="_blank" rel="noopener">${label}</a>`
    }
    // 将旧版直指 /benchmarks/<slug>/REPORT.md 的链接平滑归一至精美阅读器路由 /benchmarks/<slug>
    const normalizedBenchHref = href.replace(
      /^(\/(?:ja|en))?\/benchmarks\/([a-z0-9-]+)\/REPORT\.md$/i,
      '$1/benchmarks/$2'
    )
    return `<a class="nx-doc-link" href="${normalizedBenchHref}" data-internal-link="true">${label}</a>`
  })

  // 粗体 **text**
  working = working.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

  // 还原行内代码
  codeSlots.forEach((html, idx) => {
    working = working.replace(`@@INLINE_CODE_${idx}@@`, html)
  })

  return working
}

export function renderEnterpriseMarkdown(rawMd, locale = 'zh') {
  if (!rawMd) {
    return { title: '', description: '', html: '', toc: [] }
  }

  let body = rawMd.replace(/\r\n/g, '\n')
  const meta = { title: '', description: '' }

  // 提取 YAML Frontmatter
  if (body.startsWith('---\n')) {
    const endIdx = body.indexOf('\n---\n', 4)
    if (endIdx !== -1) {
      const fmBlock = body.slice(4, endIdx)
      body = body.slice(endIdx + 5)
      for (const line of fmBlock.split('\n')) {
        const m = line.match(/^([a-zA-Z0-9_-]+):\s*(.+)$/)
        if (m) {
          meta[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '')
        }
      }
    }
  }

  const lines = body.split('\n')
  const htmlParts = []
  const toc = []
  let headingCounter = 0
  let mermaidCounter = 0
  let currentSectionTitle = ''
  let i = 0

  const defaultFigTitle =
    locale === 'ja'
      ? 'アーキテクチャ図'
      : locale === 'en'
        ? 'Architecture Topology'
        : '架构拓扑图'
  const zoomLabel =
    locale === 'ja'
      ? '拡大表示'
      : locale === 'en'
        ? 'Click to Zoom'
        : '点击放大查看'
  const errLabel =
    locale === 'ja'
      ? '図表の描画に失敗しました。再試行するか定義を確認してください。'
      : locale === 'en'
        ? 'Diagram rendering failed. Retry or inspect source below.'
        : '架构图矢量渲染失败，请点击重试或查阅下方拓扑源码。'
  const retryLabel =
    locale === 'ja' ? '再試行' : locale === 'en' ? 'Retry' : '重试渲染'

  while (i < lines.length) {
    const line = lines[i]

    // 跳过空行
    if (!line.trim()) {
      i++
      continue
    }

    // 水平分割线
    if (/^---+\s*$/.test(line.trim())) {
      htmlParts.push('<hr class="nx-doc-divider" />')
      i++
      continue
    }

    // 围栏代码块 ```lang
    const fenceMatch = line.match(/^```([a-zA-Z0-9_-]*)\s*$/)
    if (fenceMatch) {
      const codeLang = (fenceMatch[1] || 'text').toLowerCase()
      const codeLines = []
      i++
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        codeLines.push(lines[i])
        i++
      }
      i++ // 跳过结束 ```
      const rawCode = codeLines.join('\n')

      if (codeLang === 'mermaid') {
        const encoded = encodeURIComponent(rawCode.trim())
        const figIndex = mermaidCounter++
        const figNum = String(figIndex + 1).padStart(2, '0')
        const figTitle = currentSectionTitle || meta.title || defaultFigTitle
        const ariaZoom = `${zoomLabel}: ${figTitle}`
        htmlParts.push(`
          <figure class="nx-mermaid-card" data-mermaid-index="${figIndex}" data-mermaid-title="${escapeHtml(figTitle)}">
            <div class="nx-mermaid-bar">
              <div class="nx-mermaid-meta">
                <span class="nx-mermaid-dot" aria-hidden="true"></span>
                <span class="nx-mermaid-num hl-tabular">FIG ${figNum}</span>
                <span class="nx-mermaid-tag" title="${escapeHtml(figTitle)}">${escapeHtml(figTitle)}</span>
              </div>
              <button type="button" class="nx-mermaid-zoom-btn" data-zoom-mermaid="${figIndex}" aria-label="${escapeHtml(ariaZoom)}">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <polyline points="9 21 3 21 3 15"></polyline>
                  <line x1="21" y1="3" x2="14" y2="10"></line>
                  <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
                <span>${escapeHtml(zoomLabel)}</span>
              </button>
            </div>
            <div class="nx-mermaid-stage" data-mermaid="${encoded}" data-zoom-mermaid="${figIndex}">
              <div class="nx-mermaid-skeleton" aria-hidden="true">
                <div class="nx-mermaid-skel-bar is-w65"></div>
                <div class="nx-mermaid-skel-bar is-w90"></div>
                <div class="nx-mermaid-skel-bar is-w75"></div>
              </div>
              <div class="nx-mermaid-error">
                <div class="nx-mermaid-error-bar">
                  <span>${escapeHtml(errLabel)}</span>
                  <button type="button" class="nx-mermaid-retry-btn" data-retry-mermaid="${figIndex}">${escapeHtml(retryLabel)}</button>
                </div>
                <pre class="nx-mermaid-fallback">${escapeHtml(rawCode)}</pre>
              </div>
            </div>
          </figure>
        `)
      } else {
        const encodedCopy = encodeURIComponent(rawCode)
        htmlParts.push(`
          <div class="nx-code-block">
            <div class="nx-code-header">
              <div class="nx-code-dots"><span></span><span></span><span></span></div>
              <span class="nx-code-lang">${escapeHtml(codeLang.toUpperCase())}</span>
              <button type="button" class="nx-code-copy-btn" data-copy-code="${encodedCopy}">COPY</button>
            </div>
            <pre class="nx-code-pre"><code>${escapeHtml(rawCode)}</code></pre>
          </div>
        `)
      }
      continue
    }

    // 标题 # / ## / ###
    const hMatch = line.match(/^(#{1,4})\s+(.+)$/)
    if (hMatch) {
      const level = hMatch[1].length
      const rawTitle = hMatch[2].trim()
      if (level === 1 && !meta.title) {
        meta.title = rawTitle.replace(/[`*]/g, '')
      }
      if (level === 1) {
        // 顶层 H1 由阅读器页头渲染，正文中不重复渲染
        i++
        continue
      }
      headingCounter++
      const id = slugify(rawTitle, headingCounter)
      const cleanLabel = rawTitle.replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1')
      if (level === 2 || level === 3) {
        toc.push({ id, text: cleanLabel, level })
        currentSectionTitle = cleanLabel
      }
      htmlParts.push(
        `<h${level} id="${id}" class="nx-doc-h${level}"><a class="nx-heading-anchor" href="#${id}">#</a><span>${parseInline(rawTitle)}</span></h${level}>`
      )
      i++
      continue
    }

    // 引用块 / GitHub Alert (> [!NOTE] ...)
    if (line.trim().startsWith('>')) {
      const quoteLines = []
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].replace(/^\s*>\s?/, ''))
        i++
      }
      const firstLine = quoteLines[0] || ''
      const alertMatch = firstLine.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)$/i)
      if (alertMatch) {
        const type = alertMatch[1].toLowerCase()
        const customTitle = alertMatch[2].trim() || type.toUpperCase()
        const restBody = quoteLines.slice(1).map((l) => parseInline(l)).join('<br/>')
        htmlParts.push(`
          <div class="nx-callout is-${type}">
            <div class="nx-callout-head">
              <span class="nx-callout-badge">${escapeHtml(type.toUpperCase())}</span>
              <strong class="nx-callout-title">${parseInline(customTitle)}</strong>
            </div>
            <div class="nx-callout-body">${restBody}</div>
          </div>
        `)
      } else {
        const bodyHtml = quoteLines.map((l) => parseInline(l)).join('<br/>')
        htmlParts.push(`<blockquote class="nx-blockquote">${bodyHtml}</blockquote>`)
      }
      continue
    }

    // Markdown 表格 (| ... |)
    if (line.trim().startsWith('|') && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|/.test(lines[i + 1])) {
      const parseRow = (rowStr) =>
        rowStr
          .trim()
          .replace(/^\||\|$/g, '')
          .split('|')
          .map((c) => parseInline(c.trim()))

      const headers = parseRow(lines[i])
      i += 2 // 跳过表头与分隔行
      const rows = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(parseRow(lines[i]))
        i++
      }

      const thHtml = headers.map((h) => `<th>${h}</th>`).join('')
      const trHtml = rows
        .map((r) => `<tr>${r.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
        .join('')

      htmlParts.push(`
        <div class="nx-table-wrap">
          <table class="nx-doc-table">
            <thead><tr>${thHtml}</tr></thead>
            <tbody>${trHtml}</tbody>
          </table>
        </div>
      `)
      continue
    }

    // 列表 (- / * / 1.)
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const isOrdered = /^\s*\d+\.\s+/.test(line)
      const tag = isOrdered ? 'ol' : 'ul'
      const items = []
      while (i < lines.length && (/^\s*([-*]|\d+\.)\s+/.test(lines[i]) || /^\s{2,}\S/.test(lines[i]))) {
        const current = lines[i]
        if (/^\s*([-*]|\d+\.)\s+/.test(current)) {
          items.push(parseInline(current.replace(/^\s*([-*]|\d+\.)\s+/, '')))
        } else if (items.length > 0) {
          items[items.length - 1] += '<br/>' + parseInline(current.trim())
        }
        i++
      }
      htmlParts.push(
        `<${tag} class="nx-doc-list is-${tag}">${items.map((it) => `<li>${it}</li>`).join('')}</${tag}>`
      )
      continue
    }

    // 普通段落
    const paraLines = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,4}\s|```|---+\s*$|>\s*|\|\s*|\s*([-*]|\d+\.)\s+)/.test(lines[i])
    ) {
      paraLines.push(parseInline(lines[i].trim()))
      i++
    }
    if (paraLines.length) {
      htmlParts.push(`<p class="nx-doc-p">${paraLines.join(' ')}</p>`)
    } else {
      i++
    }
  }

  return {
    title: meta.title,
    description: meta.description,
    html: htmlParts.join('\n'),
    toc
  }
}
