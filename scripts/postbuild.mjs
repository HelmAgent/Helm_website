/**
 * 构建后静态路由预生成与双目录同步脚本（postbuild.mjs）。
 *
 * 职责与协作：
 * 1. 为所有中/日/英三语子路由（如 `/ja/`、`/demo`、`/architecture/overview` 等）生成静态 `index.html` 与 `404.html`，确保在 GitHub Pages / Vercel / Cloudflare Pages 等任意静态托管平台上直接刷新子路径绝不报 404。
 * 2. 自动将构建产物同步一份至 `docs/.vitepress/dist`，无缝兼容既有云端部署流水线的输出目录配置。
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const legacyDistDir = path.join(rootDir, 'docs', '.vitepress', 'dist')

const indexHtmlPath = path.join(distDir, 'index.html')
if (!fs.existsSync(indexHtmlPath)) {
  console.error('[postbuild] dist/index.html not found!')
  process.exit(1)
}

const templateHtml = fs.readFileSync(indexHtmlPath, 'utf-8')

const baseRoutes = [
  '/demo',
  '/download',
  '/architecture/overview',
  '/architecture/long-running',
  '/architecture/multi-agent-team',
  '/architecture/memory-and-rag',
  '/architecture/workbench',
  '/guide/getting-started',
  '/guide/local-models',
  '/guide/knowledge-and-mcp'
]

const locales = ['', '/ja', '/en']
const allRoutes = []

for (const loc of locales) {
  if (loc) {
    allRoutes.push(loc)
  }
  for (const r of baseRoutes) {
    allRoutes.push(`${loc}${r}`)
  }
}

for (const route of allRoutes) {
  const cleanRel = route.replace(/^\/+/, '')
  const routeDir = path.join(distDir, cleanRel)
  fs.mkdirSync(routeDir, { recursive: true })
  fs.writeFileSync(path.join(routeDir, 'index.html'), templateHtml, 'utf-8')
  // 同时生成同名 .html 以兼容 cleanUrls=true 静态服务器
  fs.writeFileSync(path.join(distDir, `${cleanRel}.html`), templateHtml, 'utf-8')
}

// 生成 404.html SPA 兜底
fs.writeFileSync(path.join(distDir, '404.html'), templateHtml, 'utf-8')

// 同步至 docs/.vitepress/dist 以兼容既有部署目录设置
fs.rmSync(legacyDistDir, { recursive: true, force: true })
fs.mkdirSync(path.dirname(legacyDistDir), { recursive: true })
fs.cpSync(distDir, legacyDistDir, { recursive: true })

console.log(`[postbuild] Generated ${allRoutes.length} static route entries and synced to docs/.vitepress/dist.`)
