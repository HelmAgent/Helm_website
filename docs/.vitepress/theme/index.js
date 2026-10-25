/**
 * VitePress 自定义主题入口。
 *
 * 职责与协作：
 * - 继承 VitePress 默认主题并注入 `stone-theme.css`（石澜视觉系统）。
 * - 全局注册三大核心组件：
 *   1. `HomeLanding`：石澜风格定制产品首页（支持 zh / ja / en）。
 *   2. `ProductPlayground`：免安装网页版交互式回放沙盒，1:1 复刻 HYN Agent 桌面端石澜界面与核心工作流。
 *   3. `DownloadCenter`：安装包下载、SHA-256 校验、离线验证指南与致面试官说明组件。
 * - 在浏览器端自动将 Markdown 中的 ` ```mermaid ` 代码块渲染为矢量架构图，避免 SSR 构建报错。
 */
import DefaultTheme from 'vitepress/theme'
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import './stone-theme.css'
import HomeLanding from './components/HomeLanding.vue'
import ProductPlayground from './components/ProductPlayground.vue'
import DownloadCenter from './components/DownloadCenter.vue'

/**
 * 扫描当前页面中的 `.language-mermaid` 代码块并在客户端使用 mermaid 渲染为 SVG。
 * 仅在浏览器环境下执行，确保 `vitepress build` 服务端渲染（SSR）零报错。
 */
async function renderMermaidBlocks() {
  if (typeof window === 'undefined') return
  const blocks = document.querySelectorAll('div.language-mermaid')
  if (!blocks.length) return

  try {
    const mermaidModule = await import('mermaid')
    const mermaid = mermaidModule.default || mermaidModule
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        primaryColor: '#e6eef8',
        primaryTextColor: '#1a1d27',
        primaryBorderColor: '#0f4c81',
        lineColor: '#3e4556',
        secondaryColor: '#f2f4f8',
        tertiaryColor: '#ffffff',
        fontFamily: '"Segoe UI Variable Text", "Segoe UI", "Yu Gothic UI", "Microsoft YaHei UI", sans-serif',
        fontSize: '13px'
      }
    })

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i]
      if (block.dataset.mermaidRendered === '1') continue
      const codeEl = block.querySelector('pre code')
      if (!codeEl) continue
      const rawCode = (codeEl.textContent || '').trim()
      if (!rawCode) continue

      const id = `stone-mermaid-${Date.now()}-${i}`
      const { svg } = await mermaid.render(id, rawCode)
      const wrapper = document.createElement('div')
      wrapper.className = 'stone-mermaid-wrap'
      wrapper.innerHTML = svg
      block.dataset.mermaidRendered = '1'
      block.replaceWith(wrapper)
    }
  } catch (err) {
    console.warn('[HYN Website] Mermaid 渲染跳过:', err)
  }
}

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomeLanding', HomeLanding)
    app.component('ProductPlayground', ProductPlayground)
    app.component('DownloadCenter', DownloadCenter)
  },
  setup() {
    const route = useRoute()
    onMounted(() => {
      nextTick(() => renderMermaidBlocks())
    })
    watch(
      () => route.path,
      () => {
        nextTick(() => {
          setTimeout(() => renderMermaidBlocks(), 60)
        })
      }
    )
  }
}
