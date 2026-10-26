/**
 * 多语言工程白皮书与使用指南 Markdown 资源注册表。
 *
 * 职责与协作：
 * - 使用 Vite 原生 `import.meta.glob` 将 `docs/` 下的中/日/英三语 Markdown 原文静态打包进前端应用。
 * - 根据当前路由路径（如 `/architecture/overview` 或 `/ja/architecture/overview`）精确匹配对应语言的文档内容。
 */

const rawMarkdownFiles = import.meta.glob('../../docs/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
})

// 规范化键值：如 '/architecture/overview' 或 '/ja/architecture/overview'
const normalizedMap = {}

for (const [fullPath, content] of Object.entries(rawMarkdownFiles)) {
  // fullPath 形如 '../../docs/architecture/overview.md' 或 '../../docs/ja/architecture/overview.md'
  const rel = fullPath
    .replace(/^.*\/docs\//, '/')
    .replace(/\.md$/i, '')
    .replace(/\/index$/i, '/')
  normalizedMap[rel] = content
}

export function getMarkdownByRoute(routePath) {
  let clean = (routePath || '/').replace(/\/+$/, '')
  if (!clean) clean = '/'
  if (normalizedMap[clean]) {
    return normalizedMap[clean]
  }
  // 尝试回退至中文对应章节
  const fallbackZh = clean.replace(/^\/(ja|en)(?=\/|$)/, '') || '/'
  return normalizedMap[fallbackZh] || null
}
