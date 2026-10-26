<script setup>
/**
 * 旗舰企业级悬浮毛玻璃导航栏（AppNavbar.vue）。
 *
 * 职责与协作：
 * - 彻底取代 VitePress 默认的 `VPNavBar`，提供对标 Cursor / Linear / LayerX 的深邃毛玻璃顶栏。
 * - 内置「工程架构白皮书 & 快速指南」双栏悬浮 Mega-Menu、一键直达三语胶囊切换器（中文 / 日本語 / EN）以及发光下载主按钮。
 */
import { ref, computed } from 'vue'
import {
  SITE_META,
  tt,
  getLangPrefix,
  getArchitectureChapters,
  getGuideChapters
} from '../data/siteData.js'
import { useAppRouter } from '../router.js'

const { currentLang, strippedPath, navigate, switchLocale } = useAppRouter()

const showMegaMenu = ref(false)
const mobileMenuOpen = ref(false)
let closeTimer = null

const prefix = computed(() => getLangPrefix(currentLang.value))
const archChapters = computed(() => getArchitectureChapters(currentLang.value))
const guideChapters = computed(() => getGuideChapters(currentLang.value))

function t(zh, ja, en) {
  return tt(currentLang.value, zh, ja, en)
}

function openMega() {
  if (closeTimer) clearTimeout(closeTimer)
  showMegaMenu.value = true
}

function closeMegaDelayed() {
  closeTimer = setTimeout(() => {
    showMegaMenu.value = false
  }, 160)
}

function go(url) {
  showMegaMenu.value = false
  mobileMenuOpen.value = false
  navigate(url)
}

const isArchActive = computed(
  () =>
    strippedPath.value.startsWith('/architecture/') ||
    strippedPath.value.startsWith('/guide/')
)
</script>

<template>
  <header class="nx-navbar">
    <div class="nx-navbar-inner nx-container">
      <!-- 左侧：Helm 品牌徽章 + 几何舵轮标志 -->
      <div class="nx-brand-group">
        <a
          class="nx-brand-link"
          :href="`${prefix}/`"
          @click.prevent="go(`${prefix}/`)"
        >
          <span class="nx-brand-emblem">
            <img :src="SITE_META.brandIconUrl" alt="Helm Emblem" />
          </span>
          <span class="nx-brand-text">
            <span class="nx-brand-title">HELM</span>
            <span class="nx-brand-sub">AGENT HARNESS</span>
          </span>
        </a>
        <span class="nx-version-chip">{{ SITE_META.version }}</span>
      </div>

      <!-- 中部：企业级产品主导航 -->
      <nav class="nx-nav-links" aria-label="Main Navigation">
        <a
          class="nx-nav-item"
          :class="{ 'is-active': strippedPath === '/' }"
          :href="`${prefix}/`"
          @click.prevent="go(`${prefix}/`)"
        >
          {{ t('产品首页', '製品ホーム', 'Product') }}
        </a>

        <a
          class="nx-nav-item"
          :href="`${prefix}/#capabilities`"
          @click.prevent="go(`${prefix}/#capabilities`)"
        >
          {{ t('核心引擎', 'コア技術', 'Engine & Specs') }}
        </a>

        <a
          class="nx-nav-item is-sandbox-link"
          :class="{ 'is-active': strippedPath === '/demo' }"
          :href="`${prefix}/demo`"
          @click.prevent="go(`${prefix}/demo`)"
        >
          <span class="nx-live-dot"></span>
          <span>{{ t('在线交互沙盒', 'Web体験デモ', 'Live Sandbox') }}</span>
        </a>

        <!-- 工程架构白皮书 & 指南 Mega-Menu -->
        <div
          class="nx-mega-trigger-wrap"
          @mouseenter="openMega"
          @mouseleave="closeMegaDelayed"
        >
          <button
            type="button"
            class="nx-nav-item nx-mega-btn"
            :class="{ 'is-active': isArchActive || showMegaMenu }"
            @click="showMegaMenu = !showMegaMenu"
          >
            <span>{{ t('工程架构白皮书', '技術アーキテクチャ白書', 'Architecture') }}</span>
            <svg class="nx-chevron" viewBox="0 0 16 16" width="13" height="13" fill="none">
              <path
                d="M4 6.5L8 10.5L12 6.5"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <transition name="nx-fade-drop">
            <div
              v-if="showMegaMenu"
              class="nx-mega-dropdown"
              @mouseenter="openMega"
              @mouseleave="closeMegaDelayed"
            >
              <div class="nx-mega-grid">
                <!-- 左栏：5 卷工程架构白皮书 -->
                <div class="nx-mega-col is-main">
                  <div class="nx-mega-col-head">
                    <span class="nx-mega-kicker">
                      {{ t('ENGINEERING BLUEPRINT // 全 5 卷深度架构白皮书', 'ENGINEERING BLUEPRINT // 技術設計白書（全5章）', 'ENGINEERING BLUEPRINT // 5-VOLUME WHITEPAPER') }}
                    </span>
                  </div>
                  <div class="nx-mega-list">
                    <a
                      v-for="ch in archChapters"
                      :key="ch.id"
                      class="nx-mega-card"
                      :class="{ 'is-current': strippedPath === ch.slug }"
                      :href="ch.link"
                      @click.prevent="go(ch.link)"
                    >
                      <div class="nx-mega-card-top">
                        <span class="nx-mega-vol">{{ ch.num }}</span>
                        <span class="nx-mega-metric">{{ ch.metric }}</span>
                      </div>
                      <div class="nx-mega-card-title">{{ ch.title }}</div>
                      <div class="nx-mega-card-desc">{{ ch.subtitle }}</div>
                    </a>
                  </div>
                </div>

                <!-- 右栏：3 篇快速上手与私有化部署指南 -->
                <div class="nx-mega-col is-side">
                  <div class="nx-mega-col-head">
                    <span class="nx-mega-kicker">
                      {{ t('DEPLOYMENT & GUIDES // 部署与使用指南', 'DEPLOYMENT & GUIDES // 導入・設定ガイド', 'DEPLOYMENT & USER GUIDES') }}
                    </span>
                  </div>
                  <div class="nx-mega-side-list">
                    <a
                      v-for="g in guideChapters"
                      :key="g.id"
                      class="nx-mega-side-item"
                      :class="{ 'is-current': strippedPath === g.slug }"
                      :href="g.link"
                      @click.prevent="go(g.link)"
                    >
                      <span class="nx-mega-side-badge">{{ g.num }}</span>
                      <div class="nx-mega-side-title">{{ g.title }}</div>
                      <div class="nx-mega-side-desc">{{ g.subtitle }}</div>
                    </a>
                  </div>

                  <div class="nx-mega-bottom-cta">
                    <div class="nx-mega-bottom-note">
                      {{ t('100% 本地闭环 · 支持企业内网 vLLM 与 Ollama', '100% ローカル完結 · 社内閉域網 vLLM / Ollama 対応', '100% Local Loopback · Corporate LAN Ready') }}
                    </div>
                    <a
                      class="nx-mega-all-link"
                      :href="`${prefix}/architecture/overview`"
                      @click.prevent="go(`${prefix}/architecture/overview`)"
                    >
                      {{ t('进入白皮书阅读中心 →', '白書リーダーを開く →', 'Open Blueprint Reader →') }}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <a
          class="nx-nav-item"
          :class="{ 'is-active': strippedPath === '/download' }"
          :href="`${prefix}/download`"
          @click.prevent="go(`${prefix}/download`)"
        >
          {{ t('安全校验与下载', 'セキュリティ・導入', 'Security & Download') }}
        </a>
      </nav>

      <!-- 右侧：一键三语胶囊切换器 + GitHub + 旗舰下载按钮 -->
      <div class="nx-navbar-actions">
        <div class="nx-lang-switcher" role="group" aria-label="Language Switcher">
          <button
            type="button"
            class="nx-lang-btn"
            :class="{ 'is-active': currentLang === 'zh' }"
            @click="switchLocale('zh')"
          >
            中文
          </button>
          <button
            type="button"
            class="nx-lang-btn"
            :class="{ 'is-active': currentLang === 'ja' }"
            @click="switchLocale('ja')"
          >
            日本語
          </button>
          <button
            type="button"
            class="nx-lang-btn"
            :class="{ 'is-active': currentLang === 'en' }"
            @click="switchLocale('en')"
          >
            EN
          </button>
        </div>

        <a
          class="nx-github-icon-btn"
          :href="SITE_META.githubRepo"
          target="_blank"
          rel="noopener"
          title="GitHub Releases"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        </a>

        <a
          class="nx-btn nx-btn-primary nx-nav-cta"
          :href="`${prefix}/download`"
          @click.prevent="go(`${prefix}/download`)"
        >
          <span>{{ t('免费下载', '無料ダウンロード', 'Download') }}</span>
          <span class="nx-cta-arrow">↓</span>
        </a>

        <button
          type="button"
          class="nx-mobile-toggle"
          @click="mobileMenuOpen = !mobileMenuOpen"
          aria-label="Toggle Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>

    <!-- 移动端折叠抽屉 -->
    <div v-if="mobileMenuOpen" class="nx-mobile-drawer">
      <div class="nx-mobile-links">
        <a :href="`${prefix}/`" @click.prevent="go(`${prefix}/`)">
          {{ t('产品首页', '製品ホーム', 'Product Home') }}
        </a>
        <a :href="`${prefix}/demo`" @click.prevent="go(`${prefix}/demo`)">
          {{ t('在线交互沙盒 (免安装)', 'Web体験デモ (インストール不要)', 'Interactive Web Sandbox') }}
        </a>
        <a :href="`${prefix}/architecture/overview`" @click.prevent="go(`${prefix}/architecture/overview`)">
          {{ t('工程架构白皮书 (全 5 卷)', '技術アーキテクチャ白書 (全5章)', 'Architecture Whitepaper (5 Vols)') }}
        </a>
        <a :href="`${prefix}/guide/getting-started`" @click.prevent="go(`${prefix}/guide/getting-started`)">
          {{ t('快速开始与私有化配置', 'クイックスタート・導入手順', 'Quick Start & LAN Setup') }}
        </a>
        <a :href="`${prefix}/download`" @click.prevent="go(`${prefix}/download`)">
          {{ t('客户端下载与 SHA-256 校验', 'ダウンロード・SHA-256検証', 'Download & SHA-256 Verification') }}
        </a>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nx-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 68px;
  background: rgba(5, 8, 17, 0.78);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.nx-navbar-inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.nx-brand-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nx-brand-link {
  display: flex;
  align-items: center;
  gap: 11px;
}

.nx-brand-emblem {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(96, 165, 250, 0.35);
  background: #0d1322;
  box-shadow: 0 0 18px rgba(37, 99, 235, 0.32);
  flex: none;
}

.nx-brand-emblem img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.nx-brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
}

.nx-brand-title {
  font-size: 15.5px;
  font-weight: 850;
  letter-spacing: 0.16em;
  color: #ffffff;
}

.nx-brand-sub {
  margin-top: 2px;
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: #64748b;
}

.nx-version-chip {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 650;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(30, 41, 59, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #94a3b8;
}

.nx-nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nx-nav-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  color: #cbd5e1;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 160ms ease;
}

.nx-nav-item:hover,
.nx-nav-item.is-active {
  color: #ffffff;
  background: rgba(30, 41, 59, 0.65);
}

.nx-nav-item.is-active {
  color: #38bdf8;
}

.nx-live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.nx-chevron {
  opacity: 0.7;
  transition: transform 180ms ease;
}

.nx-mega-btn.is-active .nx-chevron {
  transform: rotate(180deg);
}

/* Mega-Menu 下拉面板 */
.nx-mega-trigger-wrap {
  position: relative;
}

.nx-mega-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  width: 820px;
  background: rgba(10, 15, 29, 0.96);
  border: 1px solid rgba(96, 165, 250, 0.28);
  border-radius: 16px;
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.12),
    0 28px 70px -12px rgba(0, 0, 0, 0.85),
    0 0 40px rgba(37, 99, 235, 0.16);
  backdrop-filter: blur(24px);
  padding: 20px;
  z-index: 150;
}

.nx-mega-grid {
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  gap: 20px;
}

.nx-mega-col-head {
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.nx-mega-kicker {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #38bdf8;
}

.nx-mega-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nx-mega-card {
  display: block;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: rgba(15, 23, 42, 0.5);
  transition: all 150ms ease;
}

.nx-mega-card:hover,
.nx-mega-card.is-current {
  background: rgba(30, 41, 69, 0.85);
  border-color: rgba(56, 189, 248, 0.35);
}

.nx-mega-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 10px;
  margin-bottom: 3px;
}

.nx-mega-vol {
  color: #38bdf8;
  font-weight: 700;
}

.nx-mega-metric {
  color: #64748b;
}

.nx-mega-card-title {
  font-size: 13px;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 2px;
}

.nx-mega-card-desc {
  font-size: 11.5px;
  color: #94a3b8;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.nx-mega-col.is-side {
  display: flex;
  flex-direction: column;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 12px;
  padding: 14px;
}

.nx-mega-side-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.nx-mega-side-item {
  display: block;
  padding: 9px 11px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 150ms ease;
}

.nx-mega-side-item:hover,
.nx-mega-side-item.is-current {
  background: rgba(30, 41, 69, 0.75);
  border-color: rgba(56, 189, 248, 0.3);
}

.nx-mega-side-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  color: #34d399;
}

.nx-mega-side-title {
  font-size: 12.5px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 2px 0;
}

.nx-mega-side-desc {
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.4;
}

.nx-mega-bottom-cta {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(148, 163, 184, 0.14);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nx-mega-bottom-note {
  font-size: 11px;
  color: #64748b;
}

.nx-mega-all-link {
  font-size: 12px;
  font-weight: 700;
  color: #38bdf8;
}

/* 右侧操作区与三语胶囊 */
.nx-navbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nx-lang-switcher {
  display: inline-flex;
  align-items: center;
  padding: 3px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 8px;
}

.nx-lang-btn {
  height: 26px;
  padding: 0 9px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #94a3b8;
  font-size: 11.5px;
  font-weight: 650;
  cursor: pointer;
  transition: all 150ms ease;
}

.nx-lang-btn:hover {
  color: #f8fafc;
}

.nx-lang-btn.is-active {
  background: rgba(37, 99, 235, 0.35);
  color: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(56, 189, 248, 0.45);
}

.nx-github-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  color: #94a3b8;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.16);
  transition: all 150ms ease;
}

.nx-github-icon-btn:hover {
  color: #ffffff;
  border-color: rgba(56, 189, 248, 0.4);
}

.nx-nav-cta {
  height: 36px;
  padding: 0 15px;
  font-size: 12.5px;
}

.nx-cta-arrow {
  font-family: var(--font-mono);
  font-size: 12px;
  opacity: 0.85;
}

.nx-mobile-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 34px;
  height: 34px;
  padding: 6px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.8);
  cursor: pointer;
}

.nx-mobile-toggle span {
  display: block;
  width: 100%;
  height: 1.5px;
  background: #e2e8f0;
}

.nx-mobile-drawer {
  background: rgba(8, 13, 26, 0.98);
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  padding: 14px 20px 20px;
}

.nx-mobile-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nx-mobile-links a {
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.14);
  font-size: 13.5px;
  font-weight: 600;
  color: #f1f5f9;
}

.nx-fade-drop-enter-active,
.nx-fade-drop-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}

.nx-fade-drop-enter-from,
.nx-fade-drop-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-6px);
}

@media (max-width: 1060px) {
  .nx-nav-links {
    display: none;
  }
  .nx-mobile-toggle {
    display: inline-flex;
  }
}

@media (max-width: 560px) {
  .nx-version-chip,
  .nx-nav-cta {
    display: none;
  }
}
</style>
