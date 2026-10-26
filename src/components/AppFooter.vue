<script setup>
/**
 * 旗舰企业级多栏页脚（AppFooter.vue）。
 *
 * 职责与协作：
 * - 彻底取代 VitePress 单行简陋页脚，呈现商业级 AI 软件的多维站点地图、本地安全合规状态指示器。
 * - 内置「架构透明性与本地安全运行说明」入口，点击后呼出 `AuditModal.vue`。
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
const copiedFooterKey = ref('')

function t(zh, ja, en) {
  return tt(currentLang.value, zh, ja, en)
}

async function copyFooterText(key, text) {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      copiedFooterKey.value = key
      setTimeout(() => {
        if (copiedFooterKey.value === key) copiedFooterKey.value = ''
      }, 2000)
    }
  } catch {
    // 忽略无剪贴板权限环境
  }
}
</script>

<template>
  <footer class="nx-footer">
    <div class="nx-container">
      <div class="nx-footer-top">
        <!-- 第一栏：品牌标识、Slogan 与「架构透明性与本地安全运行说明」入口 -->
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

          <!-- 架构透明性与本地安全运行说明入口胶囊 -->
          <button type="button" class="nx-security-pill" @click="openAuditModal">
            <span class="nx-security-icon">⌘</span>
            <span class="nx-security-text">
              {{
                t(
                  '架构透明性与本地离线安全运行说明',
                  '設計の透明性とローカル安全稼働について',
                  'Architecture Transparency & Local Security Info'
                )
              }}
            </span>
            <span class="nx-security-arrow">→</span>
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
                {{ t('在线交互工作台', 'Web対話型ワークベンチ', 'Interactive Web Workbench') }}
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

      <!-- 全站常驻：社区交流群、合作邮箱与备注说明栏 -->
      <div class="nx-footer-community-bar">
        <div class="nx-footer-comm-channels">
          <div class="nx-footer-comm-item">
            <span class="nx-footer-comm-tag">DISCORD</span>
            <span class="nx-footer-comm-lbl">{{ t('Helm的discord交流群链接：', 'Helm Discord：', 'Helm Discord:') }}</span>
            <a :href="SITE_META.discordUrl" target="_blank" rel="noopener" class="nx-footer-comm-link">
              {{ SITE_META.discordUrl }} ↗
            </a>
          </div>

          <div class="nx-footer-comm-item">
            <span class="nx-footer-comm-tag">QQ GROUP</span>
            <span class="nx-footer-comm-lbl">{{ t('QQ交流群号：', 'QQ交流グループ番号：', 'QQ Group:') }}</span>
            <button
              type="button"
              class="nx-footer-comm-copy-btn"
              @click="copyFooterText('qq', SITE_META.qqGroup)"
              :title="t('点击复制 QQ 群号', 'クリックしてコピー', 'Click to copy')"
            >
              <code>{{ SITE_META.qqGroup }}</code>
              <span class="nx-footer-copy-hint">
                {{ copiedFooterKey === 'qq' ? t('✓ 已复制', '✓ コピー済', '✓ Copied') : t('复制', 'コピー', 'Copy') }}
              </span>
            </button>
          </div>

          <div class="nx-footer-comm-item">
            <span class="nx-footer-comm-tag">EMAIL</span>
            <span class="nx-footer-comm-lbl">{{ t('交流合作邮箱：', '提携・連絡メール：', 'Contact Email:') }}</span>
            <a :href="`mailto:${SITE_META.contactEmail}`" class="nx-footer-comm-link">
              {{ SITE_META.contactEmail }}
            </a>
            <button
              type="button"
              class="nx-footer-comm-copy-btn is-mini"
              @click="copyFooterText('email', SITE_META.contactEmail)"
            >
              <span class="nx-footer-copy-hint">
                {{ copiedFooterKey === 'email' ? t('✓ 已复制', '✓ コピー済', '✓ Copied') : t('复制', 'コピー', 'Copy') }}
              </span>
            </button>
          </div>
        </div>

        <p class="nx-footer-remark">
          {{
            t(
              '【内测致谢与痛点共创计划】目前处于内测阶段，感谢大家的支持与使用，遇到任何问题请务必提出，我会尽快优化修复。正式版及后续升级中将广泛征集大家意见，由大家决定下一版新功能——具有行业共性、高票高频的痛点我将免费开发为内置功能；若有紧急且私人订制的功能需求，请通过邮箱（785430621@qq.com）单独与我联系。',
              '【ベータ感謝・共創計画】現在ベータ段階につき、不具合があればぜひお知らせください。正式版および今後の更新では皆様の声を募集し、業界共通の課題は無償で新機能として開発します。緊急・非公開の個別カスタム開発はメール（785430621@qq.com）までご連絡ください。',
              '[Beta & Co-Creation Plan] Thank you for testing Helm! Please report any issues for rapid fixes. Your feedback decides our next release—shared industry pain points are built into official features for free. For urgent, private custom development, please contact 785430621@qq.com.'
            )
          }}
        </p>
      </div>

      <!-- 底部版权与架构签名栏 -->
      <div class="nx-footer-bottom">
        <div class="nx-footer-copy">
          © 2026 Helm Project · Built with Electron 44, Vue 3.5 &amp; Python 3.13 FastAPI · Stone Workbench System
        </div>
        <div class="nx-footer-meta-links">
          <button type="button" class="nx-footer-subtle-btn" @click="openAuditModal">
            {{ t('架构透明性与本地安全说明', '設計の透明性とローカル安全仕様', 'Architecture & Local Security') }}
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

.nx-security-pill {
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

.nx-security-pill:hover {
  background: rgba(30, 41, 69, 0.9);
  border-color: rgba(56, 189, 248, 0.55);
  color: #ffffff;
  transform: translateY(-1px);
}

.nx-security-icon {
  font-family: var(--font-mono);
  color: #38bdf8;
  font-weight: 700;
}

.nx-security-arrow {
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

.nx-footer-community-bar {
  padding: 22px 24px;
  margin-top: 26px;
  border-radius: 12px;
  background: rgba(11, 18, 34, 0.78);
  border: 1px solid rgba(56, 189, 248, 0.24);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nx-footer-comm-channels {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px 28px;
}

.nx-footer-comm-item {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
  font-size: 12.5px;
}

.nx-footer-comm-tag {
  padding: 2px 7px;
  border-radius: 5px;
  background: rgba(37, 99, 235, 0.22);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #38bdf8;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 750;
}

.nx-footer-comm-lbl {
  color: #94a3b8;
  font-weight: 600;
}

.nx-footer-comm-link {
  font-family: var(--font-mono);
  font-size: 12.5px;
  font-weight: 700;
  color: #f8fafc;
  transition: color 150ms ease;
}

.nx-footer-comm-link:hover {
  color: #38bdf8;
}

.nx-footer-comm-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.24);
  cursor: pointer;
  transition: all 150ms ease;
}

.nx-footer-comm-copy-btn:hover {
  border-color: rgba(56, 189, 248, 0.55);
}

.nx-footer-comm-copy-btn code {
  font-family: var(--font-mono);
  font-size: 12.5px;
  font-weight: 750;
  color: #ffffff;
}

.nx-footer-copy-hint {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: #38bdf8;
}

.nx-footer-remark {
  margin: 0;
  padding-top: 10px;
  border-top: 1px dashed rgba(148, 163, 184, 0.16);
  font-size: 12.5px;
  line-height: 1.6;
  color: #cbd5e1;
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
