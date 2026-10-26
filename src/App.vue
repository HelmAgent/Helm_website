<script setup>
/**
 * 旗舰官网根组件（App.vue）。
 *
 * 职责与协作：
 * - 承载「风格 1：深邃科技旗舰风」全局星光聚光灯背景（`.nx-ambient-backdrop`）。
 * - 统一调度 `AppNavbar`、四大核心视图（`HomeView` / `DemoView` / `DownloadView` / `WhitepaperView`）、`AppFooter` 以及面试官源码走读弹窗 `AuditModal`。
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

const { currentLang, currentView } = useAppRouter()

watchEffect(() => {
  if (typeof document === 'undefined') return
  const lang = currentLang.value
  document.documentElement.lang = lang === 'ja' ? 'ja-JP' : lang === 'en' ? 'en-US' : 'zh-CN'
  document.title = tt(
    lang,
    'Helm · 执掌长周期代码与文档创作之舵 (Take the Helm of Long-Running Code & Docs.)',
    'Helm · 長時間稼働するコード開発とドキュメント制作の舵を取る (Take the Helm of Long-Running Code & Docs.)',
    'Helm · Take the Helm of Long-Running Code & Docs.'
  )
})
</script>

<template>
  <div class="nx-app-shell">
    <!-- 全局深邃黑曜石星光聚光灯与细线网格背景 -->
    <div class="nx-ambient-backdrop" aria-hidden="true">
      <div class="nx-ambient-aurora"></div>
      <div class="nx-ambient-grid"></div>
    </div>

    <!-- 悬浮毛玻璃导航顶栏 -->
    <AppNavbar />

    <!-- 视图路由出口 -->
    <HomeView v-if="currentView === 'home'" />
    <DemoView v-else-if="currentView === 'demo'" />
    <DownloadView v-else-if="currentView === 'download'" />
    <WhitepaperView v-else />

    <!-- 企业级多栏大页脚 -->
    <AppFooter />

    <!-- 精致的「Developer & Interview Live Demo」高管弹窗 -->
    <AuditModal />
  </div>
</template>

<style scoped>
.nx-app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}
</style>
