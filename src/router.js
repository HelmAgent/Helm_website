/**
 * 轻量响应式企业级路由与多语言状态中心（基于原生 History API + Vue 3 Reactivity）。
 *
 * 职责与协作：
 * - 完整兼容所有既有 URL（`/`、`/ja/`、`/en/`、`/demo`、`/download`、`/architecture/*`、`/guide/*`）。
 * - 支持三语一键无刷新同页切换（例如从 `/architecture/long-running` 切到日语自动跳转 `/ja/architecture/long-running`）。
 * - 统一管理「架构透明性与本地安全运行说明」弹窗状态。
 */
import { ref, computed } from 'vue'

function normalizePath(rawPath) {
  if (!rawPath) return '/'
  let p = rawPath.split('?')[0].split('#')[0]
  if (p.length > 1 && p.endsWith('/')) {
    p = p.replace(/\/+$/, '')
  }
  if (p === '/ja') return '/ja/'
  if (p === '/en') return '/en/'
  return p || '/'
}

const currentPath = ref(
  typeof window !== 'undefined' ? normalizePath(window.location.pathname) : '/'
)
const currentHash = ref(typeof window !== 'undefined' ? window.location.hash : '')
export const isAuditModalOpen = ref(false)

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    currentPath.value = normalizePath(window.location.pathname)
    currentHash.value = window.location.hash
  })
}

export const currentLang = computed(() => {
  const p = currentPath.value
  if (p === '/ja/' || p === '/ja' || p.startsWith('/ja/')) return 'ja'
  if (p === '/en/' || p === '/en' || p.startsWith('/en/')) return 'en'
  return 'zh'
})

export const strippedPath = computed(() => {
  const p = currentPath.value
  if (p === '/ja/' || p === '/ja' || p === '/en/' || p === '/en') return '/'
  const withoutLocale = p.replace(/^\/(ja|en)(?=\/)/, '')
  return withoutLocale || '/'
})

export const currentView = computed(() => {
  const sp = strippedPath.value
  if (sp === '/' || sp === '') return 'home'
  if (sp === '/demo') return 'demo'
  if (sp === '/download') return 'download'
  if (sp.startsWith('/architecture/') || sp.startsWith('/guide/')) return 'whitepaper'
  return 'home'
})

export function navigate(targetUrl, options = { scrollTop: true }) {
  if (typeof window === 'undefined') return
  if (!targetUrl) return

  if (/^https?:\/\//i.test(targetUrl)) {
    window.open(targetUrl, '_blank', 'noopener')
    return
  }

  const [pathPart, hashPart] = targetUrl.split('#')
  const nextPath = pathPart ? normalizePath(pathPart) : currentPath.value
  const nextHash = hashPart ? `#${hashPart}` : ''

  const fullUrl = `${nextPath}${nextHash}`
  if (window.location.pathname + window.location.hash !== fullUrl) {
    window.history.pushState({}, '', fullUrl)
  }

  currentPath.value = nextPath
  currentHash.value = nextHash

  if (nextHash) {
    setTimeout(() => {
      const el = document.getElementById(hashPart)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 60)
  } else if (options.scrollTop) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

export function switchLocale(targetLang) {
  const sp = strippedPath.value
  let target = sp
  if (targetLang === 'ja') {
    target = sp === '/' ? '/ja/' : `/ja${sp}`
  } else if (targetLang === 'en') {
    target = sp === '/' ? '/en/' : `/en${sp}`
  } else {
    target = sp
  }
  navigate(target, { scrollTop: false })
}

export function openAuditModal() {
  isAuditModalOpen.value = true
}

export function closeAuditModal() {
  isAuditModalOpen.value = false
}

export function useAppRouter() {
  return {
    currentPath,
    currentHash,
    currentLang,
    strippedPath,
    currentView,
    navigate,
    switchLocale,
    isAuditModalOpen,
    openAuditModal,
    closeAuditModal
  }
}
