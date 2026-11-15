<script setup>
/**
 * DemoView.vue — 5 大场景桌面实机录屏与复现剧场
 *
 * 职责与协作：
 * - 对应 `/demo`、`/ja/demo`、`/en/demo`，并支持 `?scene=<id>` 深度链接直达指定场景。
 * - 与首页首屏共享 `src/data/demoVideos.js` 单一事实源，完整展示实机录屏、三步技术看点、前置条件与可一键复制的复现提示词。
 * - 桌面宽屏（>1100px）采用左侧 1px 细线目录 + 右侧主舞台分栏骨架；紧凑桌面（960×640）与移动端自动收拢为顶部横向胶囊条 + 全宽视窗，严禁卡片套卡片。
 * - 严格使用 `flagship.css` 语义令牌，零硬编码色值。
 */
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { tt, getLangPrefix } from '../data/siteData.js'
import { getDemoScenarios } from '../data/demoVideos.js'
import { useAppRouter } from '../router.js'

const { currentLang, currentSearch, navigate } = useAppRouter()
const prefix = computed(() => getLangPrefix(currentLang.value))

function t(zh, ja, en) {
  return tt(currentLang.value, zh, ja, en)
}

const scenarios = computed(() => getDemoScenarios(currentLang.value))
const activeIdx = ref(0)
const activeScenario = computed(() => scenarios.value[activeIdx.value] || scenarios.value[0])

const sideTablistRef = ref(null)
const compactTablistRef = ref(null)
const videoPlayerRef = ref(null)

const playbackRate = ref(1)
const videoLoading = ref(true)
const videoLoadError = ref(false)
const prefersReducedMotion = ref(false)
const copiedKey = ref('')

watch(
  [currentSearch, scenarios],
  ([search, list]) => {
    if (!search) return
    const params = new URLSearchParams(search)
    const sceneId = params.get('scene')
    if (sceneId) {
      const found = list.findIndex((item) => item.id === sceneId)
      if (found >= 0 && found !== activeIdx.value) {
        activeIdx.value = found
        videoLoadError.value = false
        videoLoading.value = true
      }
    }
  },
  { immediate: true }
)

function selectScenario(idx, focusTab = false, containerEl = null) {
  const count = scenarios.value.length
  const normalized = ((idx % count) + count) % count
  const target = scenarios.value[normalized]
  if (normalized !== activeIdx.value) {
    activeIdx.value = normalized
    videoLoadError.value = false
    videoLoading.value = true
    navigate(`${prefix.value}/demo?scene=${target.id}`, { scrollTop: false, replace: true })
  }
  if (focusTab && containerEl) {
    nextTick(() => {
      const tabs = containerEl.querySelectorAll('[role="tab"]')
      tabs[normalized]?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' })
      tabs[normalized]?.focus()
    })
  }
}

function onSideTabKeydown(event) {
  const key = event.key
  if (key === 'ArrowDown' || key === 'ArrowRight') {
    event.preventDefault()
    selectScenario(activeIdx.value + 1, true, sideTablistRef.value)
  } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
    event.preventDefault()
    selectScenario(activeIdx.value - 1, true, sideTablistRef.value)
  } else if (key === 'Home') {
    event.preventDefault()
    selectScenario(0, true, sideTablistRef.value)
  } else if (key === 'End') {
    event.preventDefault()
    selectScenario(scenarios.value.length - 1, true, sideTablistRef.value)
  }
}

function onCompactTabKeydown(event) {
  const key = event.key
  if (key === 'ArrowRight') {
    event.preventDefault()
    selectScenario(activeIdx.value + 1, true, compactTablistRef.value)
  } else if (key === 'ArrowLeft') {
    event.preventDefault()
    selectScenario(activeIdx.value - 1, true, compactTablistRef.value)
  } else if (key === 'Home') {
    event.preventDefault()
    selectScenario(0, true, compactTablistRef.value)
  } else if (key === 'End') {
    event.preventDefault()
    selectScenario(scenarios.value.length - 1, true, compactTablistRef.value)
  }
}

function setVideoSpeed(rate) {
  playbackRate.value = rate
  if (videoPlayerRef.value) {
    videoPlayerRef.value.playbackRate = rate
  }
}

function handleVideoLoaded() {
  videoLoading.value = false
  videoLoadError.value = false
  if (videoPlayerRef.value) {
    videoPlayerRef.value.playbackRate = playbackRate.value
  }
}

function retryVideoLoad() {
  videoLoadError.value = false
  videoLoading.value = true
  nextTick(() => {
    if (videoPlayerRef.value) {
      videoPlayerRef.value.load()
    }
  })
}

async function copyText(key, text) {
  try {
    await navigator.clipboard.writeText(text)
    copiedKey.value = key
    setTimeout(() => {
      if (copiedKey.value === key) copiedKey.value = ''
    }, 2200)
  } catch {
    copiedKey.value = ''
  }
}

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})
</script>

<template>
  <div class="hl-demo-page">
    <!-- 顶部编辑部风格导览头 -->
    <section class="hl-demo-header">
      <div class="hl-container-wide hl-demo-head-row">
        <div class="hl-demo-intro">
          <p class="hl-eyebrow">REAL DESKTOP WORKFLOW RECORDINGS</p>
          <h1 class="hl-demo-title">
            {{
              t(
                'Helm 5 大场景实机录屏与复现剧场',
                'Helm 5大シナリオ実機収録＆再現シアター',
                'Helm Live Desktop Recordings & Prompt Theater'
              )
            }}
          </h1>
          <p class="hl-demo-desc">
            {{
              t(
                '告别脚本编排的概念动画。以下 5 支视频全部由最新重构的桌面端客户端实机录制，涵盖本地数据分析与全栈看板交付、PPT 靶向热补丁、Git Worktree 双队友赛马、/plan 只读门禁以及跨格式合同联审，并附带完整可复现提示词。',
                '概念アニメーションではなく、最新デスクトップ実機で収録した5つのワークフロー映像です。ローカルCSVからのWebボード＆Office一括交付、PPT部分更新、Git Worktree並列開発、/plan ゲート、3文書並列監査を収録し、再現用プロンプト全文を公開しています。',
                'Zero scripted mockups—all 5 clips are captured straight from the refactored Electron + Python 3.13 desktop client, spanning end-to-end dashboard & Office delivery, surgical PPT hot-patching, Git Worktree races, /plan gates, and 3-doc contract audits.'
              )
            }}
          </p>
        </div>

        <div class="hl-demo-actions">
          <a
            class="hl-btn hl-btn-ink"
            :href="`${prefix}/download`"
            @click.prevent="navigate(`${prefix}/download`)"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M3 5.5 10.5 4.5v7H3v-6zm8.5-1.15L21 3v8.5h-9.5V4.35zM3 12.5h7.5v7L3 18.5v-6zm8.5 0H21V21l-9.5-1.35V12.5z" />
            </svg>
            <span>{{ t('下载 Windows 客户端', 'Windows 版をダウンロード', 'Download for Windows') }}</span>
          </a>
          <a
            class="hl-btn hl-btn-outline"
            :href="`${prefix}/architecture/overview`"
            @click.prevent="navigate(`${prefix}/architecture/overview`)"
          >
            <span>{{ t('阅读 6 卷架构白皮书', '技術白書（全6章）', '6-Vol Whitepaper') }}</span>
          </a>
        </div>
      </div>
    </section>

    <!-- 主剧场区域 -->
    <section class="hl-demo-stage">
      <div class="hl-container-wide">
        <!-- 紧凑桌面（<=1100px，含 960×640）横向场景胶囊切换条 -->
        <div class="hl-compact-bar-wrap">
          <div
            ref="compactTablistRef"
            class="hl-segmented hl-compact-segmented"
            role="tablist"
            :aria-label="t('实机演示场景切换', '実機デモ切替', 'Scenario Switcher')"
            @keydown="onCompactTabKeydown"
          >
            <button
              v-for="(sc, idx) in scenarios"
              :key="`compact-${sc.id}`"
              type="button"
              role="tab"
              class="hl-seg-btn hl-compact-tab"
              :class="{ 'is-active': activeIdx === idx }"
              :aria-selected="activeIdx === idx"
              :tabindex="activeIdx === idx ? 0 : -1"
              @click="selectScenario(idx, true, compactTablistRef)"
            >
              <span class="hl-compact-num hl-tabular">{{ sc.num }}</span>
              <span>{{ sc.shortTab }}</span>
              <span class="hl-compact-dur hl-tabular">{{ sc.duration }}</span>
            </button>
          </div>
        </div>

        <!-- 宽屏分栏骨架：左侧 1px 细线目录 + 右侧实机视窗与复现提示词 -->
        <div class="hl-theater-layout">
          <aside class="hl-theater-rail">
            <div class="hl-rail-label">
              <span>{{ t('实机演示目录 (5)', '実機デモ一覧 (5)', 'RECORDED WORKFLOWS (5)') }}</span>
              <span class="hl-tabular">1918×1030</span>
            </div>

            <div
              ref="sideTablistRef"
              class="hl-rail-list"
              role="tablist"
              aria-orientation="vertical"
              :aria-label="t('实机场景列表', '実機シナリオ一覧', 'Live Workflow List')"
              @keydown="onSideTabKeydown"
            >
              <button
                v-for="(sc, idx) in scenarios"
                :key="sc.id"
                type="button"
                role="tab"
                class="hl-rail-item"
                :class="{ 'is-active': activeIdx === idx }"
                :aria-selected="activeIdx === idx"
                :tabindex="activeIdx === idx ? 0 : -1"
                @click="selectScenario(idx, true, sideTablistRef)"
              >
                <div class="hl-rail-item-top hl-tabular">
                  <span class="hl-rail-num">{{ sc.num }}</span>
                  <span class="hl-rail-badge">{{ sc.badge }}</span>
                  <span class="hl-rail-dur">{{ sc.duration }}</span>
                </div>
                <div class="hl-rail-short">{{ sc.shortTab }}</div>
                <p class="hl-rail-sub">{{ sc.title }}</p>
              </button>
            </div>
          </aside>

          <!-- 右侧主内容舞台 -->
          <div class="hl-theater-main" role="tabpanel" :aria-label="activeScenario.title">
            <header class="hl-scene-head">
              <div class="hl-scene-meta hl-tabular">
                <span class="hl-pill-tag is-accent">{{ activeScenario.badge }}</span>
                <span class="hl-scene-spec">
                  {{ t('场景', 'シナリオ', 'Scenario') }} {{ activeScenario.num }} · {{ activeScenario.duration }} · 1918×1030 HD
                </span>
              </div>
              <h2 class="hl-scene-title">{{ activeScenario.title }}</h2>
              <p class="hl-scene-desc">{{ activeScenario.desc }}</p>
            </header>

            <!-- 实机录屏窗口 -->
            <div class="hl-studio-window">
              <div class="hl-studio-bar">
                <div class="hl-studio-dots" aria-hidden="true">
                  <span class="is-r"></span>
                  <span class="is-y"></span>
                  <span class="is-g"></span>
                </div>
                <div class="hl-studio-title">
                  {{ activeScenario.windowTitle }}
                </div>
                <div class="hl-speed-group hl-tabular" role="group" :aria-label="t('视频倍速', '再生速度', 'Playback speed')">
                  <button
                    v-for="spd in [1, 1.5, 2]"
                    :key="spd"
                    type="button"
                    class="hl-speed-pill"
                    :class="{ 'is-active': playbackRate === spd }"
                    @click="setVideoSpeed(spd)"
                  >
                    {{ spd }}×
                  </button>
                </div>
              </div>

              <div class="hl-video-viewport">
                <div v-if="videoLoading && !videoLoadError" class="hl-video-skeleton" aria-hidden="true">
                  <div class="hl-skeleton-bar"></div>
                  <div class="hl-skeleton-panes">
                    <div class="hl-skeleton-chat"></div>
                    <div class="hl-skeleton-dock"></div>
                  </div>
                </div>

                <video
                  v-if="!videoLoadError"
                  :key="activeScenario.id"
                  ref="videoPlayerRef"
                  class="hl-video-el"
                  :src="activeScenario.videoUrl"
                  :autoplay="!prefersReducedMotion"
                  muted
                  loop
                  controls
                  playsinline
                  preload="metadata"
                  @loadstart="videoLoading = true"
                  @loadedmetadata="handleVideoLoaded"
                  @canplay="videoLoading = false"
                  @error="videoLoadError = true; videoLoading = false"
                ></video>

                <div v-else class="hl-video-fallback">
                  <p>
                    {{
                      t(
                        '当前场景实机演示视频暂时未能加载，请检查媒体资源或点击重试。',
                        '現在のデモ動画を読み込めませんでした。再試行してください。',
                        'Unable to load this screen recording right now. Please retry below.'
                      )
                    }}
                  </p>
                  <div class="hl-fallback-actions">
                    <button type="button" class="hl-btn hl-btn-ink hl-btn-sm" @click="retryVideoLoad">
                      {{ t('重试加载视频', '動画を再読込', 'Retry Video') }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- 三栏关键技术看点 -->
              <div class="hl-video-digest">
                <div
                  v-for="vh in activeScenario.highlights"
                  :key="`${activeScenario.id}-${vh.step}`"
                  class="hl-digest-item"
                >
                  <span class="hl-digest-num hl-tabular">{{ vh.step }}</span>
                  <div class="hl-digest-copy">
                    <strong>{{ vh.title }}</strong>
                    <p>{{ vh.desc }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 1px 细分割复现提示词与架构溯源单层面板 -->
            <section class="hl-prompt-sheet" :aria-label="t('复现提示词', '再現用プロンプト', 'Reproducible Prompt')">
              <div class="hl-prompt-head">
                <div class="hl-prompt-head-left">
                  <div class="hl-prompt-title-row">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <polyline points="4 17 10 11 4 5" />
                      <line x1="12" x2="20" y1="19" y2="19" />
                    </svg>
                    <h3>
                      {{
                        t(
                          '同款实机复现提示词（Prompt）',
                          '実機再現用プロンプト全文',
                          'Exact Reproducible Prompt'
                        )
                      }}
                    </h3>
                  </div>
                  <p class="hl-prompt-prep">{{ activeScenario.prepNote }}</p>
                </div>

                <div class="hl-prompt-actions">
                  <button
                    type="button"
                    class="hl-copy-btn"
                    :class="{ 'is-copied': copiedKey === `demo-prompt-${activeScenario.id}` }"
                    @click="copyText(`demo-prompt-${activeScenario.id}`, activeScenario.prompt)"
                  >
                    <svg v-if="copiedKey === `demo-prompt-${activeScenario.id}`" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    <span>
                      {{
                        copiedKey === `demo-prompt-${activeScenario.id}`
                          ? t('已复制完整提示词', 'プロンプトをコピーしました', 'Prompt Copied')
                          : t('复制复现提示词', 'プロンプトをコピー', 'Copy Full Prompt')
                      }}
                    </span>
                  </button>

                  <a
                    class="hl-link hl-prompt-doc-link"
                    :href="activeScenario.docLink"
                    @click.prevent="navigate(activeScenario.docLink)"
                  >
                    <span>{{ activeScenario.docLabel }}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </a>
                </div>
              </div>

              <pre class="hl-prompt-body"><code>{{ activeScenario.prompt }}</code></pre>
            </section>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hl-demo-page {
  background-color: var(--hl-surface-alt);
  color: var(--hl-ink);
  padding-bottom: 88px;
}

.hl-demo-header {
  background-color: var(--hl-bg);
  padding: 52px 0 40px;
  border-bottom: 1px solid var(--hl-border);
}

.hl-demo-head-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.hl-demo-intro {
  max-width: 740px;
  min-width: 0;
}

.hl-demo-title {
  margin: 0;
  font-size: clamp(28px, 3.5vw, 40px);
  font-weight: 700;
  line-height: 1.16;
  letter-spacing: -0.028em;
  color: var(--hl-ink);
}

.hl-demo-desc {
  margin: 12px 0 0;
  max-width: 68ch;
  font-size: 15px;
  line-height: 1.64;
  color: var(--hl-ink-3);
}

.hl-demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  flex-shrink: 0;
}

.hl-demo-stage {
  padding-top: 32px;
}

/* 紧凑桌面（<=1100px）横向切换胶囊，宽屏默认隐藏 */
.hl-compact-bar-wrap {
  display: none;
  margin-bottom: 24px;
  max-width: 100%;
  overflow-x: auto;
  padding: 2px;
  -ms-overflow-style: none;
}

.hl-compact-bar-wrap::-webkit-scrollbar {
  height: 0;
  background: transparent;
}

.hl-compact-segmented {
  flex-wrap: nowrap;
  gap: 4px;
  padding: 4px;
}

.hl-compact-tab {
  flex-shrink: 0;
  white-space: nowrap;
  height: 36px;
  padding: 0 12px;
  gap: 6px;
}

.hl-compact-num {
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--hl-ink-4);
}

.hl-compact-dur {
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: var(--hl-radius-pill);
  background-color: var(--hl-surface);
  color: var(--hl-ink-4);
}

.hl-compact-tab.is-active .hl-compact-dur {
  background-color: var(--hl-accent-soft);
  color: var(--hl-accent);
}

/* 宽屏编辑部分栏骨架 */
.hl-theater-layout {
  display: grid;
  grid-template-columns: 328px minmax(0, 1fr);
  gap: 32px;
  align-items: start;
}

.hl-theater-rail {
  position: sticky;
  top: 76px;
  background-color: var(--hl-surface);
  border: 1px solid var(--hl-border);
  border-radius: var(--hl-radius-lg);
  overflow: hidden;
}

.hl-rail-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--hl-border);
  background-color: var(--hl-surface-subtle);
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--hl-ink-4);
}

.hl-rail-list {
  display: flex;
  flex-direction: column;
}

.hl-rail-item {
  position: relative;
  width: 100%;
  padding: 16px 18px;
  border: 0;
  border-bottom: 1px solid var(--hl-border);
  background-color: transparent;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 160ms var(--hl-ease),
    color 160ms var(--hl-ease);
}

.hl-rail-item:last-child {
  border-bottom: 0;
}

.hl-rail-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: transparent;
  transition: background-color 160ms var(--hl-ease);
}

.hl-rail-item:hover {
  background-color: var(--hl-surface-subtle);
}

.hl-rail-item:active {
  background-color: var(--hl-surface-tonal);
}

.hl-rail-item.is-active {
  background-color: var(--hl-accent-soft);
}

.hl-rail-item.is-active::before {
  background-color: var(--hl-accent);
}

.hl-rail-item-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  min-width: 0;
}

.hl-rail-num {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--hl-ink-4);
  flex-shrink: 0;
}

.hl-rail-item.is-active .hl-rail-num {
  color: var(--hl-accent);
}

.hl-rail-badge {
  font-size: 11.5px;
  font-weight: 550;
  color: var(--hl-ink-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.hl-rail-dur {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--hl-ink-4);
  flex-shrink: 0;
}

.hl-rail-item.is-active .hl-rail-dur {
  color: var(--hl-accent);
}

.hl-rail-short {
  font-size: 14.5px;
  font-weight: 650;
  color: var(--hl-ink);
  margin-bottom: 4px;
}

.hl-rail-sub {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--hl-ink-3);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 右侧主内容舞台 */
.hl-theater-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hl-scene-head {
  min-width: 0;
}

.hl-scene-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.hl-scene-spec {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--hl-ink-4);
}

.hl-scene-title {
  margin: 0;
  font-size: clamp(20px, 2.2vw, 26px);
  font-weight: 700;
  line-height: 1.28;
  letter-spacing: -0.02em;
  color: var(--hl-ink);
}

.hl-scene-desc {
  margin: 10px 0 0;
  max-width: 72ch;
  font-size: 14.5px;
  line-height: 1.64;
  color: var(--hl-ink-3);
}

/* 实机录屏视窗 */
.hl-studio-window {
  border-radius: var(--hl-radius-xl);
  background-color: var(--hl-surface);
  border: 1px solid var(--hl-border);
  box-shadow: var(--hl-shadow-window);
  overflow: hidden;
}

.hl-studio-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 18px;
  background-color: var(--hl-window-bar);
  border-bottom: 1px solid var(--hl-border);
}

.hl-studio-dots {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
}

.hl-studio-dots span {
  width: 11px;
  height: 11px;
  border-radius: var(--hl-radius-pill);
}

.hl-studio-dots .is-r {
  background-color: var(--win-dot-red);
}

.hl-studio-dots .is-y {
  background-color: var(--win-dot-amber);
}

.hl-studio-dots .is-g {
  background-color: var(--win-dot-green);
}

.hl-studio-title {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: var(--hl-ink-3);
}

.hl-speed-group {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  border-radius: var(--hl-radius-pill);
  background-color: var(--hl-surface);
  border: 1px solid var(--hl-border);
  flex-shrink: 0;
}

.hl-speed-pill {
  height: 24px;
  padding: 0 9px;
  border: 0;
  border-radius: var(--hl-radius-pill);
  background: transparent;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--hl-ink-4);
  cursor: pointer;
  transition:
    background-color 150ms var(--hl-ease),
    color 150ms var(--hl-ease),
    transform 150ms var(--hl-ease);
}

.hl-speed-pill:hover {
  color: var(--hl-ink);
}

.hl-speed-pill:active {
  transform: scale(0.96);
}

.hl-speed-pill.is-active {
  background-color: var(--hl-ink);
  color: var(--hl-on-ink);
}

.hl-video-viewport {
  position: relative;
  width: 100%;
  background-color: var(--hl-pro-code);
  aspect-ratio: 1918 / 1030;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hl-video-skeleton {
  position: absolute;
  inset: 0;
  z-index: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: var(--hl-pro-bg);
  pointer-events: none;
}

.hl-skeleton-bar {
  height: 28px;
  width: 36%;
  border-radius: var(--hl-radius-sm);
  background-color: var(--hl-pro-surface-2);
  animation: hlDemoPulse 1.5s ease-in-out infinite;
}

.hl-skeleton-panes {
  flex: 1;
  display: grid;
  grid-template-columns: 38fr 62fr;
  gap: 16px;
  min-height: 0;
}

.hl-skeleton-chat,
.hl-skeleton-dock {
  border-radius: var(--hl-radius-md);
  background-color: var(--hl-pro-surface);
  border: 1px solid var(--hl-pro-border);
  animation: hlDemoPulse 1.5s ease-in-out infinite;
}

@keyframes hlDemoPulse {
  0%,
  100% {
    opacity: 0.55;
  }
  50% {
    opacity: 0.9;
  }
}

.hl-video-el {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.hl-video-fallback {
  padding: 40px 24px;
  text-align: center;
  color: var(--hl-pro-text-2);
  max-width: 48ch;
}

.hl-video-fallback p {
  margin: 0 0 16px;
  font-size: 14.5px;
}

.hl-fallback-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.hl-video-digest {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid var(--hl-border);
  background-color: var(--hl-surface-subtle);
}

.hl-digest-item {
  padding: 18px 20px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  border-right: 1px solid var(--hl-border);
  min-width: 0;
}

.hl-digest-item:last-child {
  border-right: 0;
}

.hl-digest-num {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 650;
  color: var(--hl-accent);
  padding-top: 2px;
  flex-shrink: 0;
}

.hl-digest-copy {
  min-width: 0;
}

.hl-digest-item strong {
  display: block;
  font-size: 13.5px;
  font-weight: 650;
  color: var(--hl-ink);
  margin-bottom: 4px;
}

.hl-digest-item p {
  margin: 0;
  font-size: 13px;
  line-height: 1.54;
  color: var(--hl-ink-3);
}

/* 复现提示词面板（单层 1px 细分割结构，拒绝卡片套卡片） */
.hl-prompt-sheet {
  border-radius: var(--hl-radius-lg);
  background-color: var(--hl-surface);
  border: 1px solid var(--hl-border);
  overflow: hidden;
}

.hl-prompt-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--hl-border);
  flex-wrap: wrap;
}

.hl-prompt-head-left {
  min-width: 0;
  flex: 1 1 320px;
}

.hl-prompt-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--hl-ink);
}

.hl-prompt-title-row svg {
  color: var(--hl-accent);
  flex-shrink: 0;
}

.hl-prompt-title-row h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 650;
  color: var(--hl-ink);
}

.hl-prompt-prep {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--hl-ink-3);
}

.hl-prompt-actions {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  flex-shrink: 0;
}

.hl-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 16px;
  border-radius: var(--hl-radius-pill);
  border: 1px solid var(--hl-border-strong);
  background-color: var(--hl-surface);
  color: var(--hl-ink);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 160ms var(--hl-ease),
    border-color 160ms var(--hl-ease),
    color 160ms var(--hl-ease),
    transform 160ms var(--hl-ease);
}

.hl-copy-btn:hover {
  background-color: var(--hl-surface-alt);
  border-color: var(--hl-ink-4);
}

.hl-copy-btn:active {
  transform: scale(0.98);
}

.hl-copy-btn.is-copied {
  background-color: var(--hl-ok-soft);
  border-color: var(--hl-ok-border);
  color: var(--hl-ok);
}

.hl-prompt-doc-link {
  font-size: 13.5px;
  font-weight: 600;
}

.hl-prompt-body {
  margin: 0;
  padding: 20px 24px;
  background-color: var(--hl-surface-subtle);
  font-family: var(--font-mono);
  font-size: 13.5px;
  line-height: 1.68;
  color: var(--hl-ink-2);
  white-space: pre-wrap;
  word-break: break-word;
  overflow-x: auto;
}

/* 紧凑桌面（<=1100px，覆盖 960×640）与移动端响应式适配 */
@media (max-width: 1100px) {
  .hl-compact-bar-wrap {
    display: block;
  }

  .hl-theater-layout {
    grid-template-columns: 1fr;
  }

  .hl-theater-rail {
    display: none;
  }
}

@media (max-width: 900px) {
  .hl-video-digest {
    grid-template-columns: 1fr;
  }

  .hl-digest-item {
    border-right: 0;
    border-bottom: 1px solid var(--hl-border);
  }

  .hl-digest-item:last-child {
    border-bottom: 0;
  }
}

@media (max-width: 680px) {
  .hl-studio-title {
    display: none;
  }

  .hl-prompt-head,
  .hl-prompt-body {
    padding: 16px 18px;
  }
}
</style>
