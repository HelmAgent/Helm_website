<script setup>
/**
 * Helm 官方旗舰站根组件（App.vue）。
 *
 * 设计语言：Antigravity × Apple 极昼与曜石交响设计体系（Daylight & Pro Cinema）。
 */
import { watchEffect } from 'vue'
import { useAppRouter } from './router.js'
import { tt } from './data/siteData.js'
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
import AuditModal from './components/AuditModal.vue'
import HomeView from './views/HomeView.vue'
import DemoView from './views/DemoView.vue'
import DownloadView from './views/DownloadView.vue'
import WhitepaperView from './views/WhitepaperView.vue'
import BenchmarkReportView from './views/BenchmarkReportView.vue'

const { currentLang, currentView } = useAppRouter()

watchEffect(() => {
  if (typeof document === 'undefined') return
  const lang = currentLang.value
  document.documentElement.lang = lang === 'ja' ? 'ja-JP' : lang === 'en' ? 'en-US' : 'zh-CN'
  document.title = tt(
    lang,
    'Helm · 执掌长周期代码与文档创作之舵 (Take the Helm of Long-Running Code & Docs.)',
    'Helm · 数時間の自律開発と文書制作の舵を取る (Take the Helm of Long-Running Code & Docs.)',
    'Helm · Take the Helm of Long-Running Code & Docs.'
  )
})
</script>

<template>
  <div class="hl-app-shell">
    <AppNavbar />

    <main class="hl-app-main">
      <HomeView v-if="currentView === 'home'" />
      <DemoView v-else-if="currentView === 'demo'" />
      <DownloadView v-else-if="currentView === 'download'" />
      <BenchmarkReportView v-else-if="currentView === 'benchmarks'" />
      <WhitepaperView v-else />
    </main>

    <AppFooter />
    <AuditModal />
  </div>
</template>

<style scoped>
.hl-app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--hl-bg);
  color: var(--hl-ink);
}

.hl-app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
