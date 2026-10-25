/**
 * VitePress 自定义主题入口。
 *
 * 职责与协作：
 * - 继承 VitePress 默认主题并注入 `stone-theme.css`（石澜 + 日系企业级网格视觉系统）。
 * - 全局注册四大核心组件：
 *   1. `HomeLanding`：日系企业级旗舰产品首页（1320px 宽屏）。
 *   2. `ProductPlayground`：1:1 石澜桌面端交互式工作台（带自动巡航与三栏宽屏布局）。
 *   3. `DemoShowcasePage`：独立宽屏交互沙盒页（脱离 688px 窄文档容器）。
 *   4. `DownloadCenter`：独立宽屏客户端下载与 3 步物理级离线验证页。
 * - 在浏览器端自动将 Markdown 中的 ` ```mermaid ` 代码块渲染为矢量架构图。
 */
import DefaultTheme from 'vitepress/theme'
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import './stone-theme.css'
import HomeLanding from './components/HomeLanding.vue'
import ProductPlayground from './components/ProductPlayground.vue'
import DemoShowcasePage from './components/DemoShowcasePage.vue'
import DownloadCenter from './components/DownloadCenter.vue'

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
    app.component('DemoShowcasePage', DemoShowcasePage)
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
