<script setup>
/**
 * 「架构透明性与本地离线安全运行说明」Apple Sheet 抽屉弹窗（AuditModal.vue）。
 */
import { computed } from 'vue'
import { tt, getLangPrefix } from '../data/siteData.js'
import { useAppRouter } from '../router.js'

const { currentLang, isAuditModalOpen, closeAuditModal, navigate } = useAppRouter()

const prefix = computed(() => getLangPrefix(currentLang.value))

function t(zh, ja, en) {
  return tt(currentLang.value, zh, ja, en)
}

function jumpTo(url) {
  closeAuditModal()
  navigate(url)
}
</script>

<template>
  <transition name="hl-modal-fade">
    <div
      v-if="isAuditModalOpen"
      class="hl-modal-backdrop"
      role="dialog"
      aria-modal="true"
      @click.self="closeAuditModal"
    >
      <div class="hl-modal-sheet">
        <div class="hl-modal-head">
          <div>
            <div class="hl-eyebrow">{{ t('架构透明性与本地安全保障', '設計の透明性とローカル安全仕様', 'Architecture & Local Privacy') }}</div>
            <h3 class="hl-modal-title">
              {{
                t(
                  '独立桌面分发、源码级设计披露与 100% 本地闭环',
                  '独立デスクトップ配布・6章設計開示・完全ローカル完結',
                  'Standalone Desktop Release, 6-Vol Blueprint & Zero Egress'
                )
              }}
            </h3>
          </div>
          <button
            type="button"
            class="hl-modal-close"
            aria-label="Close"
            @click="closeAuditModal"
          >
            ✕
          </button>
        </div>

        <div class="hl-modal-cols">
          <div class="hl-modal-box">
            <h4>
              {{
                t(
                  '独立桌面软件与全透明工程披露',
                  '独立デスクトップ製品と全6章の技術白書',
                  'Standalone Desktop & Full Architectural Disclosure'
                )
              }}
            </h4>
            <p>
              {{
                t(
                  'Helm 面向个人与企业研发团队提供开箱即用的 Windows 安装包（内嵌 Electron 44、Vue 3.5 与 Python 3.13 运行时）。为便于在安装前审阅底层工程质量，本站完整公开了「1:1 在线交互工作台」、「全 6 卷工程架构白皮书」以及「6 套 SHA-256 签名实测证据包」。',
                  'Helm はすぐに使える Windows デスクトップ製品として提供されます。導入前に信頼性を検証いただけるよう、「1:1 対話型ワークベンチ」「全6章の技術白書」「SHA-256 署名付き6大ベンチマーク証跡」をすべて公開しています。',
                  'Helm ships as a turnkey Windows installer bundling Electron 44, Vue 3.5, and Python 3.13. Prior to installation, you can inspect our 1:1 Interactive Workbench, 6-volume Architecture Whitepaper, and 6 SHA-256 signed benchmark bundles.'
                )
              }}
            </p>
          </div>

          <div class="hl-modal-box">
            <h4>
              {{
                t(
                  '物理断网可用与硬件级凭据隔离',
                  '完全オフライン稼働と DPAPI 暗号化保護',
                  'Air-Gapped Execution & OS-Level Credential Vault'
                )
              }}
            </h4>
            <p>
              {{
                t(
                  '核心引擎由 502 项自动化单测严密守护（SWE-bench Verified Mini 峰值 84.0% Pass@1）。原生直连 127.0.0.1 本机 Ollama 或企业内网 vLLM，拔掉网线亦可独立完成代码重构、影子 Git 检查点与 Office 局部热修改；所有密钥经 Windows DPAPI 硬件账户级加密，写盘日志自动脱敏。',
                  '502件の単体テストで検証されたコアエンジン（SWE-bench Mini ピーク 84.0%）を搭載。ローカル Ollama や社内閉域網 vLLM と連携し、LAN抜線状態でも開発と Office 部分更新が完結。認証情報は Windows DPAPI で暗号化されます。',
                  'Backed by 502 pytest tests and proven at 84.0% peak Pass@1 on SWE-bench Mini, Helm runs 100% locally over 127.0.0.1 Ollama or corporate LAN GPUs, encrypting credentials via Windows DPAPI.'
                )
              }}
            </p>
          </div>
        </div>

        <div class="hl-modal-suites hl-tabular">
          <div class="hl-modal-suites-label">
            {{ t('6 套公开实测证据包（支持浏览器端 SHA-256 实时验签）：', '公開実証バンドル（ブラウザ上で SHA-256 検証可能）：', '6 Verifiable Empirical Bundles (Live SHA-256 Check):') }}
          </div>
          <div class="hl-modal-pills">
            <a :href="`${prefix}/benchmarks/swebench-mini-v1`" @click.prevent="jumpTo(`${prefix}/benchmarks/swebench-mini-v1`)">SWE-bench Mini (84.0%)</a>
            <a :href="`${prefix}/benchmarks/precache-v1`" @click.prevent="jumpTo(`${prefix}/benchmarks/precache-v1`)">Prefix Cache (97.74%)</a>
            <a :href="`${prefix}/benchmarks/rag-eval-v1`" @click.prevent="jumpTo(`${prefix}/benchmarks/rag-eval-v1`)">RAG v0→v3 (100%)</a>
            <a :href="`${prefix}/benchmarks/harness-ablation-v1`" @click.prevent="jumpTo(`${prefix}/benchmarks/harness-ablation-v1`)">Harness (-87.7%)</a>
            <a :href="`${prefix}/benchmarks/polyglot-mini-v1`" @click.prevent="jumpTo(`${prefix}/benchmarks/polyglot-mini-v1`)">Polyglot (24/24)</a>
            <a :href="`${prefix}/benchmarks/gaia-mini-v1`" @click.prevent="jumpTo(`${prefix}/benchmarks/gaia-mini-v1`)">GAIA Office (90%)</a>
          </div>
        </div>

        <div class="hl-modal-actions">
          <button type="button" class="hl-btn hl-btn-ink hl-btn-sm" @click="jumpTo(`${prefix}/architecture/overview`)">
            {{ t('阅读全 6 卷架构白皮书', '技術白書 (全6章) を読む', 'Read 6-Vol Whitepaper') }}
          </button>
          <button type="button" class="hl-btn hl-btn-tonal hl-btn-sm" @click="jumpTo(`${prefix}/benchmarks/swebench-mini-v1`)">
            {{ t('打开实测证据中心', 'ベンチマーク証跡へ', 'Benchmark Evidence Hub') }}
          </button>
          <button type="button" class="hl-btn hl-btn-tonal hl-btn-sm" @click="jumpTo(`${prefix}/download`)">
            {{ t('前往下载与三步校验', 'ダウンロード・検証へ', 'Download & Verify') }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.hl-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 220;
  background-color: var(--hl-backdrop);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.hl-modal-sheet {
  width: 100%;
  max-width: 780px;
  max-height: 88vh;
  overflow-y: auto;
  background-color: var(--hl-surface);
  border-radius: var(--hl-radius-2xl);
  border: 1px solid var(--hl-border);
  box-shadow: var(--hl-shadow-sheet);
  padding: 32px;
}

.hl-modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.hl-modal-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.3;
  color: var(--hl-ink);
}

.hl-modal-close {
  width: 34px;
  height: 34px;
  border-radius: var(--hl-radius-pill);
  border: 0;
  background-color: var(--hl-surface-tonal);
  color: var(--hl-ink-2);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 150ms ease, color 150ms ease;
}

.hl-modal-close:hover {
  background-color: var(--hl-surface-tonal-hover);
  color: var(--hl-ink);
}

.hl-modal-cols {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.hl-modal-box {
  padding: 20px;
  border-radius: var(--hl-radius-lg);
  background-color: var(--hl-surface-alt);
}

.hl-modal-box h4 {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 650;
  color: var(--hl-ink);
}

.hl-modal-box p {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--hl-ink-3);
}

.hl-modal-suites {
  padding: 16px 18px;
  border-radius: var(--hl-radius-md);
  border: 1px solid var(--hl-border);
  margin-bottom: 22px;
}

.hl-modal-suites-label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--hl-ink-2);
  margin-bottom: 10px;
}

.hl-modal-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hl-modal-pills a {
  padding: 4px 12px;
  border-radius: var(--hl-radius-pill);
  background-color: var(--hl-accent-soft);
  color: var(--hl-accent);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  transition: background-color 150ms ease, color 150ms ease;
}

.hl-modal-pills a:hover {
  background-color: var(--hl-ink);
  color: var(--hl-on-ink);
}

.hl-modal-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hl-modal-fade-enter-active,
.hl-modal-fade-leave-active {
  transition: opacity 180ms ease;
}

.hl-modal-fade-enter-from,
.hl-modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 680px) {
  .hl-modal-sheet {
    padding: 22px;
  }

  .hl-modal-cols {
    grid-template-columns: 1fr;
  }
}
</style>
