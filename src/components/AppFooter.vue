<script setup>
/**
 * Apple 级极简多栏目录页脚（AppFooter.vue）。
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

const { currentLang, navigate, switchLocale, openAuditModal } = useAppRouter()

const prefix = computed(() => getLangPrefix(currentLang.value))
const archChapters = computed(() => getArchitectureChapters(currentLang.value))
const guideChapters = computed(() => getGuideChapters(currentLang.value))
const copiedKey = ref('')

function t(zh, ja, en) {
  return tt(currentLang.value, zh, ja, en)
}

async function copyFooterText(key, text) {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      copiedKey.value = key
      setTimeout(() => {
        if (copiedKey.value === key) copiedKey.value = ''
      }, 1800)
    }
  } catch {
    // ignore clipboard error
  }
}
</script>

<template>
  <footer class="hl-footer">
    <div class="hl-container">
      <div class="hl-footer-grid">
        <!-- 品牌与合规透明度入口 -->
        <div class="hl-footer-brand">
          <div class="hl-footer-logo-row">
            <img class="hl-footer-icon" :src="SITE_META.brandIconUrl" alt="Helm" />
            <span class="hl-footer-name">Helm</span>
          </div>

          <p class="hl-footer-desc">
            {{
              t(
                '执掌长周期代码与文档创作之舵。原生直连本机 Ollama 与企业内网私有集群，机密数据零出网。',
                '数時間の自律開発と文書制作の舵を取る。ローカル Ollama や社内閉域網クラスタに直結し、機密データは一切外へ出ません。',
                'Take the helm of long-running code and docs. Native local Ollama & corporate LAN support with zero external data egress.'
              )
            }}
          </p>

          <button type="button" class="hl-audit-pill" @click="openAuditModal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>{{ t('架构透明性与本地离线安全说明', '設計の透明性とローカル安全稼働', 'Architecture & Local Security') }}</span>
          </button>
        </div>

        <!-- 产品与实测 -->
        <div class="hl-footer-col">
          <h4 class="hl-footer-head">{{ t('产品与实证', '製品・実証データ', 'Product & Evidence') }}</h4>
          <ul class="hl-footer-list">
            <li>
              <a :href="`${prefix}/`" @click.prevent="navigate(`${prefix}/`)">
                {{ t('旗舰产品概览', '製品ホーム', 'Overview') }}
              </a>
            </li>
            <li>
              <a :href="`${prefix}/demo`" @click.prevent="navigate(`${prefix}/demo`)">
                {{ t('1:1 在线交互工作台', '1:1 対話型ワークベンチ', '1:1 Live Workbench') }}
              </a>
            </li>
            <li>
              <a :href="`${prefix}/benchmarks/swebench-mini-v1`" @click.prevent="navigate(`${prefix}/benchmarks/swebench-mini-v1`)">
                {{ t('SWE-bench 实测报告 (84.0%)', 'SWE-bench 実証レポート (84.0%)', 'SWE-bench Report (84.0%)') }}
              </a>
            </li>
            <li>
              <a :href="`${prefix}/download`" @click.prevent="navigate(`${prefix}/download`)">
                {{ t('客户端下载与 SHA-256 校验', 'ダウンロード・SHA-256検証', 'Download & SHA-256 Audit') }}
              </a>
            </li>
          </ul>
        </div>

        <!-- 工程架构白皮书 -->
        <div class="hl-footer-col">
          <h4 class="hl-footer-head">{{ t('工程架构白皮书', '技術アーキテクチャ白書', 'Architecture Whitepaper') }}</h4>
          <ul class="hl-footer-list">
            <li v-for="ch in archChapters" :key="ch.id">
              <a :href="ch.link" @click.prevent="navigate(ch.link)">
                <span class="hl-footer-vol">{{ ch.num }}</span> · {{ ch.title }}
              </a>
            </li>
          </ul>
        </div>

        <!-- 指南与社区直连 -->
        <div class="hl-footer-col">
          <h4 class="hl-footer-head">{{ t('部署指南与社区', '導入ガイド・連絡先', 'Guides & Community') }}</h4>
          <ul class="hl-footer-list">
            <li v-for="g in guideChapters" :key="g.id">
              <a :href="g.link" @click.prevent="navigate(g.link)">
                {{ g.title }}
              </a>
            </li>
            <li>
              <a :href="SITE_META.discordUrl" target="_blank" rel="noopener">
                Discord {{ t('开发者社区 ↗', 'コミュニティ ↗', 'Community ↗') }}
              </a>
            </li>
            <li>
              <button type="button" class="hl-footer-copy-btn hl-tabular" @click="copyFooterText('qq', SITE_META.qqGroup)">
                {{
                  copiedKey === 'qq'
                    ? t('✓ 已复制 QQ 群号', '✓ コピー完了', '✓ Copied QQ ID')
                    : t(`QQ 交流群：${SITE_META.qqGroup}`, `QQ グループ：${SITE_META.qqGroup}`, `QQ Group: ${SITE_META.qqGroup}`)
                }}
              </button>
            </li>
            <li>
              <button type="button" class="hl-footer-copy-btn" @click="copyFooterText('email', SITE_META.contactEmail)">
                {{
                  copiedKey === 'email'
                    ? t('✓ 已复制邮箱', '✓ コピー完了', '✓ Copied Email')
                    : SITE_META.contactEmail
                }}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div class="hl-footer-bottom">
        <div class="hl-footer-legal hl-tabular">
          <span>Copyright © 2026 Helm Studio.</span>
          <span class="hl-sep">·</span>
          <span>127.0.0.1 Loopback · Zero Cloud Relay</span>
          <span class="hl-sep">·</span>
          <a :href="SITE_META.virusTotalUrl" target="_blank" rel="noopener">
            VirusTotal {{ SITE_META.virusTotalScore }} Clean ↗
          </a>
        </div>

        <div class="hl-footer-locales">
          <button type="button" :class="{ 'is-active': currentLang === 'zh' }" @click="switchLocale('zh')">简体中文</button>
          <span class="hl-sep">/</span>
          <button type="button" :class="{ 'is-active': currentLang === 'ja' }" @click="switchLocale('ja')">日本語</button>
          <span class="hl-sep">/</span>
          <button type="button" :class="{ 'is-active': currentLang === 'en' }" @click="switchLocale('en')">English</button>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.hl-footer {
  background-color: var(--hl-surface-alt);
  border-top: 1px solid var(--hl-border);
  padding: 56px 0 36px;
  color: var(--hl-ink-3);
  font-size: 12.5px;
}

.hl-footer-grid {
  display: grid;
  grid-template-columns: 1.35fr 1fr 1.35fr 1.1fr;
  gap: 36px;
  padding-bottom: 40px;
  border-bottom: 1px solid var(--hl-border);
}

.hl-footer-logo-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.hl-footer-icon {
  width: 26px;
  height: 26px;
  border-radius: 6px;
}

.hl-footer-name {
  font-size: 15.5px;
  font-weight: 650;
  color: var(--hl-ink);
  letter-spacing: -0.02em;
}

.hl-footer-desc {
  margin: 0 0 18px;
  line-height: 1.65;
  color: var(--hl-ink-3);
  max-width: 34ch;
}

.hl-audit-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 32px;
  padding: 0 14px;
  border-radius: var(--hl-radius-pill);
  border: 1px solid var(--hl-border-strong);
  background-color: var(--hl-surface);
  color: var(--hl-ink-2);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 160ms ease, color 160ms ease, transform 160ms var(--hl-ease);
}

.hl-audit-pill:hover {
  border-color: var(--hl-ink-4);
  color: var(--hl-ink);
  transform: translateY(-1px);
}

.hl-footer-head {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--hl-ink);
}

.hl-footer-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.hl-footer-list a {
  color: var(--hl-ink-3);
  line-height: 1.45;
  display: inline-block;
  transition: color 150ms ease;
}

.hl-footer-list a:hover {
  color: var(--hl-ink);
}

.hl-footer-vol {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--hl-ink-4);
}

.hl-footer-copy-btn {
  background: transparent;
  border: 0;
  padding: 0;
  color: var(--hl-ink-3);
  font-size: 12.5px;
  cursor: pointer;
  text-align: left;
  transition: color 150ms ease;
}

.hl-footer-copy-btn:hover {
  color: var(--hl-ink);
}

.hl-footer-bottom {
  padding-top: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  color: var(--hl-ink-4);
  font-size: 12px;
}

.hl-footer-legal {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.hl-footer-legal a:hover {
  color: var(--hl-ink);
}

.hl-sep {
  color: var(--hl-border-strong);
}

.hl-footer-locales {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hl-footer-locales button {
  background: transparent;
  border: 0;
  padding: 0;
  font-size: 12px;
  color: var(--hl-ink-4);
  cursor: pointer;
}

.hl-footer-locales button.is-active,
.hl-footer-locales button:hover {
  color: var(--hl-ink);
  font-weight: 600;
}

@media (max-width: 960px) {
  .hl-footer-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .hl-footer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
