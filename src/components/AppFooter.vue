<script setup>
/**
 * 旗舰企业级多栏页脚（AppFooter.vue）。
 *
 * 职责与协作：
 * - 彻底取代 VitePress 单行简陋页脚，呈现商业级 AI 软件的多维站点地图、本地安全合规状态指示器。
 * - 内置精致得体的「Developer & Interview Live Demo（开发者与面试实机源码演示）」入口，点击后呼出 `AuditModal.vue`。
 */
import { computed } from 'vue'
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

function t(zh, ja, en) {
  return tt(currentLang.value, zh, ja, en)
}
</script>

<template>
  <footer class="nx-footer">
    <div class="nx-container">
      <div class="nx-footer-top">
        <!-- 第一栏：品牌标识、Slogan 与精致的「Developer & Interview Live Demo」入口 -->
        <div class="nx-footer-brand-col">
          <div class="nx-footer-brand-row">
            <img class="nx-footer-emblem" :src="SITE_META.brandIconUrl" alt="Helm Emblem" />
            <div>
              <div class="nx-footer-name">HELM</div>
              <div class="nx-footer-slogan">"Take the Helm of Long-Running Code &amp; Docs."</div>
            </div>
          </div>

          <p class="nx-footer-summary">
            {{
              t(
                '面向严苛研发环境打造的数据零出网自治型 Coding & Office 桌面智能体。原生直连本机 Ollama 与企业内网 GPU 集群。',
                '厳格な情報セキュリティ要件に応えるローカル完結型 AI コーディング＆Office エージェント。ローカル Ollama や社内閉域網 LLM にネイティブ直結。',
                'Zero-egress autonomous desktop Coding & Office agent engineered for security-critical R&D. Connects natively to local Ollama & corporate LAN GPUs.'
              )
            }}
          </p>

          <div class="nx-footer-status-row">
            <span class="nx-status-indicator">
              <span class="nx-pulse-dot"></span>
              <span>127.0.0.1 LOOPBACK · ZERO CLOUD RELAY</span>
            </span>
          </div>

          <!-- 精致隐蔽的「Developer & Interview Live Demo」入口胶囊 -->
          <button type="button" class="nx-interview-pill" @click="openAuditModal">
            <span class="nx-interview-icon">⌘</span>
            <span class="nx-interview-text">
              {{
                t(
                  'Developer & Interview Live Demo · 架构审阅与实机源码演示说明',
                  'Developer & Interview Live Demo · 技術審査・面接ライブ解説のご案内',
                  'Developer & Interview Live Demo · Source Walkthrough Info'
                )
              }}
            </span>
            <span class="nx-interview-arrow">→</span>
          </button>
        </div>

        <!-- 第二栏：产品体验与分发 -->
        <div class="nx-footer-col">
          <h4 class="nx-footer-col-title">
            {{ t('产品与安全分发', '製品・セキュリティ検証', 'Product & Distribution') }}
          </h4>
          <ul class="nx-footer-list">
            <li>
              <a :href="`${prefix}/`" @click.prevent="navigate(`${prefix}/`)">
                {{ t('旗舰产品概览', '製品トップ・特徴', 'Flagship Overview') }}
              </a>
            </li>
            <li>
              <a :href="`${prefix}/demo`" @click.prevent="navigate(`${prefix}/demo`)">
                {{ t('浏览器免安装交互沙盒', 'Web対話型デモ (インストール不要)', 'Zero-Install Browser Sandbox') }}
              </a>
            </li>
            <li>
              <a :href="`${prefix}/download`" @click.prevent="navigate(`${prefix}/download`)">
                {{ t(`Windows 客户端下载 (${SITE_META.version})`, `Windows版ダウンロード (${SITE_META.version})`, `Download for Windows (${SITE_META.version})`) }}
              </a>
            </li>
            <li>
              <a :href="`${prefix}/download`" @click.prevent="navigate(`${prefix}/download`)">
                {{ t('SHA-256 哈希与物理断网验证', 'SHA-256 照合・オフライン監査手順', 'SHA-256 & Air-Gapped Audit') }}
              </a>
            </li>
            <li>
              <a :href="SITE_META.githubRepo" target="_blank" rel="noopener">
                GitHub Releases ↗
              </a>
            </li>
          </ul>
        </div>

        <!-- 第三栏：工程架构白皮书（全 5 卷） -->
        <div class="nx-footer-col">
          <h4 class="nx-footer-col-title">
            {{ t('Architecture Whitepaper (全 5 卷)', '技術アーキテクチャ白書 (全5章)', 'Architecture Whitepaper (5 Vols)') }}
          </h4>
          <ul class="nx-footer-list">
            <li v-for="ch in archChapters" :key="ch.id">
              <a :href="ch.link" @click.prevent="navigate(ch.link)">
                <span class="nx-footer-vol">{{ ch.num }}</span>
                <span>{{ ch.title }}</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- 第四栏：使用指南与多语言 -->
        <div class="nx-footer-col">
          <h4 class="nx-footer-col-title">
            {{ t('私有化部署与指南', '導入・設定ガイド', 'Enterprise Guides') }}
          </h4>
          <ul class="nx-footer-list">
            <li v-for="g in guideChapters" :key="g.id">
              <a :href="g.link" @click.prevent="navigate(g.link)">
                {{ g.title }}
              </a>
            </li>
          </ul>

          <div class="nx-footer-lang-box">
            <div class="nx-footer-lang-label">LANGUAGE / 表示言語</div>
            <div class="nx-footer-lang-links">
              <button
                type="button"
                :class="{ 'is-active': currentLang === 'zh' }"
                @click="switchLocale('zh')"
              >
                简体中文
              </button>
              <span>·</span>
              <button
                type="button"
                :class="{ 'is-active': currentLang === 'ja' }"
                @click="switchLocale('ja')"
              >
                日本語
              </button>
              <span>·</span>
              <button
                type="button"
                :class="{ 'is-active': currentLang === 'en' }"
                @click="switchLocale('en')"
              >
                English
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部版权与架构签名栏 -->
      <div class="nx-footer-bottom">
        <div class="nx-footer-copy">
          © 2026 Helm Project · Built with Electron 44, Vue 3.5 &amp; Python 3.13 FastAPI · Stone Workbench System
        </div>
        <div class="nx-footer-meta-links">
          <button type="button" class="nx-footer-subtle-btn" @click="openAuditModal">
            {{ t('Developer & Interview Live Demo', 'Developer & Interview Live Demo (面接ライブ解説)', 'Developer & Interview Live Demo') }}
          </button>
          <span class="nx-sep">|</span>
          <span>SHA-256 Verified Release</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.nx-footer {
  position: relative;
  z-index: 10;
  margin-top: 96px;
  padding: 68px 0 36px;
  background: linear-gradient(180deg, rgba(6, 10, 20, 0.9) 0%, #03050b 100%);
  border-top: 1px solid rgba(148, 163, 184, 0.14);
}

.nx-footer-top {
  display: grid;
  grid-template-columns: 1.55fr 1fr 1.25fr 1fr;
  gap: 36px;
  padding-bottom: 44px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.nx-footer-brand-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.nx-footer-emblem {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid rgba(96, 165, 250, 0.35);
  box-shadow: 0 0 20px rgba(37, 99, 235, 0.25);
}

.nx-footer-name {
  font-size: 17px;
  font-weight: 850;
  letter-spacing: 0.16em;
  color: #ffffff;
}

.nx-footer-slogan {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #38bdf8;
  margin-top: 2px;
}

.nx-footer-summary {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.65;
  color: #94a3b8;
  max-width: 400px;
}

.nx-footer-status-row {
  margin-bottom: 16px;
}

.nx-status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.24);
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 650;
  color: #34d399;
}

.nx-interview-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 13px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(96, 165, 250, 0.25);
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 180ms ease;
  text-align: left;
}

.nx-interview-pill:hover {
  background: rgba(30, 41, 69, 0.9);
  border-color: rgba(56, 189, 248, 0.55);
  color: #ffffff;
  transform: translateY(-1px);
}

.nx-interview-icon {
  font-family: var(--font-mono);
  color: #38bdf8;
  font-weight: 700;
}

.nx-interview-arrow {
  color: #38bdf8;
  font-family: var(--font-mono);
}

.nx-footer-col-title {
  margin: 0 0 14px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #f8fafc;
}

.nx-footer-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.nx-footer-list a {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-size: 12.5px;
  color: #94a3b8;
  line-height: 1.45;
  transition: color 150ms ease;
}

.nx-footer-list a:hover {
  color: #38bdf8;
}

.nx-footer-vol {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
  flex: none;
}

.nx-footer-lang-box {
  margin-top: 22px;
  padding-top: 14px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}

.nx-footer-lang-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  color: #64748b;
  margin-bottom: 6px;
}

.nx-footer-lang-links {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #475569;
}

.nx-footer-lang-links button {
  background: none;
  border: none;
  padding: 0;
  font-size: 12px;
  color: #94a3b8;
  cursor: pointer;
}

.nx-footer-lang-links button.is-active,
.nx-footer-lang-links button:hover {
  color: #38bdf8;
  font-weight: 650;
}

.nx-footer-bottom {
  padding-top: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #64748b;
}

.nx-footer-meta-links {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nx-footer-subtle-btn {
  background: none;
  border: none;
  padding: 0;
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
  transition: color 150ms ease;
}

.nx-footer-subtle-btn:hover {
  color: #38bdf8;
}

.nx-sep {
  opacity: 0.4;
}

@media (max-width: 1024px) {
  .nx-footer-top {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .nx-footer-top {
    grid-template-columns: 1fr;
  }
}
</style>
