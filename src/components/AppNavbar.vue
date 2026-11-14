<script setup>
/**
 * 52px 极简磨砂顶栏（AppNavbar.vue）。
 *
 * 设计语言：对标 Apple 全球导航条与 Google Antigravity 胶囊微交互。
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

const isBenchActive = computed(() => strippedPath.value.startsWith('/benchmarks'))
</script>

<template>
  <header class="hl-navbar">
    <div class="hl-navbar-inner hl-container-wide">
      <a
        class="hl-brand"
        :href="`${prefix}/`"
        @click.prevent="go(`${prefix}/`)"
      >
        <span class="hl-brand-mark">
          <img :src="SITE_META.brandIconUrl" alt="Helm" />
        </span>
        <span class="hl-brand-name">Helm</span>
      </a>

      <nav class="hl-nav-links" aria-label="Main Navigation">
        <a
          class="hl-nav-item"
          :class="{ 'is-active': strippedPath === '/' }"
          :href="`${prefix}/`"
          @click.prevent="go(`${prefix}/`)"
        >
          {{ t('概览', '概要', 'Overview') }}
        </a>

        <a
          class="hl-nav-item"
          :href="`${prefix}/#capabilities`"
          @click.prevent="go(`${prefix}/#capabilities`)"
        >
          {{ t('核心引擎', 'コア技術', 'Engines') }}
        </a>

        <a
          class="hl-nav-item"
          :class="{ 'is-active': isBenchActive }"
          :href="`${prefix}/benchmarks/swebench-mini-v1`"
          @click.prevent="go(`${prefix}/benchmarks/swebench-mini-v1`)"
        >
          {{ t('实测基准', 'ベンチマーク', 'Benchmarks') }}
        </a>

        <div
          class="hl-mega-trigger"
          @mouseenter="openMega"
          @mouseleave="closeMegaDelayed"
        >
          <button
            type="button"
            class="hl-nav-item hl-mega-btn"
            :class="{ 'is-active': isArchActive || showMegaMenu }"
            :aria-expanded="showMegaMenu"
            @click="showMegaMenu = !showMegaMenu"
          >
            <span>{{ t('架构白皮书', 'アーキテクチャ白書', 'Architecture') }}</span>
            <svg
              class="hl-chevron"
              :class="{ 'is-open': showMegaMenu }"
              viewBox="0 0 16 16"
              width="12"
              height="12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 6.5L8 10.5L12 6.5"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>

        <a
          class="hl-nav-item"
          :class="{ 'is-active': strippedPath === '/demo' }"
          :href="`${prefix}/demo`"
          @click.prevent="go(`${prefix}/demo`)"
        >
          {{ t('在线工作台', 'Web体験デモ', 'Live Workbench') }}
        </a>
      </nav>

      <div class="hl-nav-actions">
        <div class="hl-lang-pill" role="group" aria-label="Language Switcher">
          <button
            type="button"
            class="hl-lang-btn"
            :class="{ 'is-active': currentLang === 'zh' }"
            @click="switchLocale('zh')"
          >
            中
          </button>
          <button
            type="button"
            class="hl-lang-btn"
            :class="{ 'is-active': currentLang === 'ja' }"
            @click="switchLocale('ja')"
          >
            日
          </button>
          <button
            type="button"
            class="hl-lang-btn"
            :class="{ 'is-active': currentLang === 'en' }"
            @click="switchLocale('en')"
          >
            EN
          </button>
        </div>

        <a
          class="hl-icon-link"
          :href="SITE_META.githubRepo"
          target="_blank"
          rel="noopener"
          aria-label="GitHub Repository"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path
              d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
            />
          </svg>
        </a>

        <a
          class="hl-btn hl-btn-ink hl-btn-xs"
          :href="`${prefix}/download`"
          @click.prevent="go(`${prefix}/download`)"
        >
          <span>{{ t('下载', '入手', 'Download') }}</span>
        </a>

        <button
          type="button"
          class="hl-mobile-toggle"
          :aria-expanded="mobileMenuOpen"
          aria-label="Toggle Navigation Menu"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <svg v-if="!mobileMenuOpen" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      </div>
    </div>

    <transition name="hl-sheet-drop">
      <div
        v-if="showMegaMenu"
        class="hl-mega-sheet"
        @mouseenter="openMega"
        @mouseleave="closeMegaDelayed"
      >
        <div class="hl-container hl-mega-grid">
          <div class="hl-mega-main">
            <div class="hl-mega-label">
              {{ t('工程架构白皮书（全 6 卷）', '技術アーキテクチャ白書（全6章）', 'Architecture Whitepaper (6 Volumes)') }}
            </div>
            <div class="hl-mega-chapters">
              <a
                v-for="ch in archChapters"
                :key="ch.id"
                class="hl-mega-item"
                :class="{ 'is-current': strippedPath === ch.slug }"
                :href="ch.link"
                @click.prevent="go(ch.link)"
              >
                <div class="hl-mega-item-meta hl-tabular">
                  <span class="hl-mega-vol">{{ ch.num }}</span>
                  <span class="hl-mega-metric">{{ ch.metric }}</span>
                </div>
                <div class="hl-mega-item-title">{{ ch.title }}</div>
              </a>
            </div>
          </div>

          <div class="hl-mega-side">
            <div class="hl-mega-label">
              {{ t('私有化部署与快速上手', '導入・オフライン設定ガイド', 'Deployment & Quick Guides') }}
            </div>
            <div class="hl-mega-guides">
              <a
                v-for="g in guideChapters"
                :key="g.id"
                class="hl-mega-guide-link"
                :class="{ 'is-current': strippedPath === g.slug }"
                :href="g.link"
                @click.prevent="go(g.link)"
              >
                <span class="hl-mega-guide-num">{{ g.num }}</span>
                <span class="hl-mega-guide-title">{{ g.title }}</span>
              </a>
            </div>

            <a
              class="hl-link hl-mega-all"
              :href="`${prefix}/architecture/overview`"
              @click.prevent="go(`${prefix}/architecture/overview`)"
            >
              <span>{{ t('进入白皮书阅读中心', '白書リーダーを開く', 'Open Blueprint Reader') }}</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path d="M6 4l4 4-4 4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </transition>

    <transition name="hl-sheet-drop">
      <div v-if="mobileMenuOpen" class="hl-mobile-drawer">
        <div class="hl-container hl-mobile-links">
          <a class="hl-mobile-link" :href="`${prefix}/`" @click.prevent="go(`${prefix}/`)">
            {{ t('产品概览', '概要', 'Overview') }}
          </a>
          <a class="hl-mobile-link" :href="`${prefix}/#capabilities`" @click.prevent="go(`${prefix}/#capabilities`)">
            {{ t('五大自研引擎', '5大コアエンジン', 'Core Engines') }}
          </a>
          <a class="hl-mobile-link" :href="`${prefix}/benchmarks/swebench-mini-v1`" @click.prevent="go(`${prefix}/benchmarks/swebench-mini-v1`)">
            {{ t('权威实测报告 (6 套)', 'ベンチマーク実証 (全6種)', 'Empirical Benchmarks (6 Suites)') }}
          </a>
          <a class="hl-mobile-link" :href="`${prefix}/architecture/overview`" @click.prevent="go(`${prefix}/architecture/overview`)">
            {{ t('工程架构白皮书 (全 6 卷)', '技術アーキテクチャ白書 (全6章)', 'Architecture Whitepaper (6 Vols)') }}
          </a>
          <a class="hl-mobile-link" :href="`${prefix}/demo`" @click.prevent="go(`${prefix}/demo`)">
            {{ t('1:1 在线交互工作台', '1:1 Web体験デモ', '1:1 Live Workbench') }}
          </a>
          <a class="hl-mobile-link" :href="`${prefix}/download`" @click.prevent="go(`${prefix}/download`)">
            {{ t('客户端下载与安全校验', 'ダウンロード・安全性検証', 'Download & Security Audit') }}
          </a>
        </div>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.hl-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--hl-surface-frosted);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--hl-border);
}

.hl-navbar-inner {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.hl-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.hl-brand-mark {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--hl-shadow-2xs);
}

.hl-brand-mark img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hl-brand-name {
  font-size: 16px;
  font-weight: 650;
  letter-spacing: -0.02em;
  color: var(--hl-ink);
}

.hl-nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
}

.hl-nav-item {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  color: var(--hl-ink-3);
  background: transparent;
  border: 0;
  padding: 6px 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 160ms ease;
}

.hl-nav-item:hover,
.hl-nav-item.is-active {
  color: var(--hl-ink);
}

.hl-chevron {
  transition: transform 180ms var(--hl-ease);
}

.hl-chevron.is-open {
  transform: rotate(180deg);
}

.hl-nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hl-lang-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border-radius: var(--hl-radius-pill);
  background-color: var(--hl-surface-tonal);
}

.hl-lang-btn {
  height: 26px;
  padding: 0 9px;
  border-radius: var(--hl-radius-pill);
  border: 0;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  color: var(--hl-ink-3);
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease, box-shadow 150ms ease;
}

.hl-lang-btn:hover {
  color: var(--hl-ink);
}

.hl-lang-btn.is-active {
  background-color: var(--hl-surface);
  color: var(--hl-ink);
  box-shadow: var(--hl-shadow-2xs);
}

.hl-icon-link {
  width: 32px;
  height: 32px;
  border-radius: var(--hl-radius-pill);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--hl-ink-3);
  transition: background-color 150ms ease, color 150ms ease;
}

.hl-icon-link:hover {
  background-color: var(--hl-surface-tonal);
  color: var(--hl-ink);
}

.hl-mobile-toggle {
  display: none;
  width: 34px;
  height: 34px;
  border-radius: var(--hl-radius-pill);
  border: 0;
  background-color: var(--hl-surface-tonal);
  color: var(--hl-ink);
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.hl-mega-sheet {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--hl-surface-sheet);
  backdrop-filter: saturate(180%) blur(24px);
  -webkit-backdrop-filter: saturate(180%) blur(24px);
  border-bottom: 1px solid var(--hl-border);
  box-shadow: var(--hl-shadow-dropdown);
  padding: 28px 0 32px;
}

.hl-mega-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

.hl-mega-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--hl-ink-4);
  margin-bottom: 14px;
}

.hl-mega-chapters {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 24px;
}

.hl-mega-item {
  padding: 10px 12px;
  border-radius: var(--hl-radius-sm);
  transition: background-color 150ms ease;
}

.hl-mega-item:hover,
.hl-mega-item.is-current {
  background-color: var(--hl-surface-alt);
}

.hl-mega-item-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--hl-ink-4);
  margin-bottom: 3px;
}

.hl-mega-vol {
  color: var(--hl-accent);
  font-weight: 600;
}

.hl-mega-item-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--hl-ink);
  line-height: 1.38;
}

.hl-mega-side {
  border-left: 1px solid var(--hl-border);
  padding-left: 32px;
  display: flex;
  flex-direction: column;
}

.hl-mega-guides {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.hl-mega-guide-link {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  border-radius: var(--hl-radius-sm);
  transition: background-color 150ms ease;
}

.hl-mega-guide-link:hover,
.hl-mega-guide-link.is-current {
  background-color: var(--hl-surface-alt);
}

.hl-mega-guide-num {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--hl-ink-4);
}

.hl-mega-guide-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--hl-ink);
}

.hl-mega-all {
  margin-top: 16px;
  font-size: 13.5px;
}

.hl-mobile-drawer {
  background-color: var(--hl-surface-sheet);
  border-bottom: 1px solid var(--hl-border);
  padding: 12px 0 20px;
}

.hl-mobile-links {
  display: flex;
  flex-direction: column;
}

.hl-mobile-link {
  padding: 12px 4px;
  border-bottom: 1px solid var(--hl-border);
  font-size: 14.5px;
  font-weight: 500;
  color: var(--hl-ink);
}

.hl-mobile-link:last-child {
  border-bottom: 0;
}

.hl-sheet-drop-enter-active,
.hl-sheet-drop-leave-active {
  transition: opacity 160ms ease, transform 160ms var(--hl-ease);
}

.hl-sheet-drop-enter-from,
.hl-sheet-drop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 1080px) {
  .hl-nav-links {
    gap: 16px;
  }
}

@media (max-width: 940px) {
  .hl-nav-links {
    display: none;
  }

  .hl-mobile-toggle {
    display: inline-flex;
  }

  .hl-mega-sheet {
    display: none;
  }
}
</style>
