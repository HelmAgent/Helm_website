<script setup>
/**
 * 「架构透明性与本地离线安全运行说明」弹窗组件（AuditModal.vue）。
 *
 * 职责与协作：
 * - 面向所有普通用户、开发者及企业安全团队，说明 Helm 的独立桌面软件分发形态、在线交互工作台以及 100% 本地闭环隐私保障。
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
  <transition name="nx-modal-fade">
    <div
      v-if="isAuditModalOpen"
      class="nx-modal-backdrop"
      role="dialog"
      aria-modal="true"
      @click.self="closeAuditModal"
    >
      <div class="nx-modal-card nx-glass-card">
        <div class="nx-modal-header">
          <div class="nx-modal-badge-row">
            <span class="nx-badge">ARCHITECTURE &amp; LOCAL SECURITY OVERVIEW</span>
            <span class="nx-modal-code">ELECTRON 44 · VUE 3.5 · FASTAPI (86+ UNIT TESTS)</span>
          </div>
          <button
            type="button"
            class="nx-modal-close"
            @click="closeAuditModal"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <h3 class="nx-modal-title">
          {{
            t(
              '系统架构透明披露、在线交互工作台与本地离线隐私安全说明',
              'システム設計の透明性、Web対話型ワークベンチ、およびローカル安全稼働について',
              'Architecture Transparency, Interactive Web Workbench, and Local Privacy Overview'
            )
          }}
        </h3>

        <div class="nx-modal-grid">
          <div class="nx-modal-item">
            <div class="nx-modal-item-num">01 // ARCHITECTURE TRANSPARENCY &amp; WEB WORKBENCH</div>
            <h4>
              {{
                t(
                  '独立桌面软件分发与全透明架构白皮书',
                  '独立デスクトップ製品の配布と全5章の技術設計白書',
                  'Standalone Desktop Release & 5-Volume Blueprint'
                )
              }}
            </h4>
            <p>
              {{
                t(
                  'Helm 作为开箱即用的桌面端独立软件面向广大用户提供 Windows 安装包下载。为了让用户在下载前即可直观了解软件功能与底层可靠性，本站特别内建了「1:1 在线交互工作台」与「全 5 卷工程架构白皮书」，完整公开双进程拓扑、TurnHub 状态机、无侵入影子 Git 检查点与 Git Worktree 并发隔离的技术实现。',
                  'Helm はすぐに使えるデスクトップ製品として Windows インストーラー版を配布しています。導入前に操作感や内部の信頼性を確認いただけるよう、本サイトでは「1:1 対話型ワークベンチ」と「全5章の技術アーキテクチャ白書」を公開し、デュアルプロセス構造やシャドウGitチェックポイント等の設計を詳しく解説しています。',
                  'Helm is distributed as a standalone Windows desktop application. So users and developers can explore its capabilities and reliability prior to installation, this site provides a 1:1 Interactive Workbench and a 5-volume Architecture Whitepaper.'
                )
              }}
            </p>
          </div>

          <div class="nx-modal-item">
            <div class="nx-modal-item-num">02 // 100% LOCAL PRIVACY &amp; RELIABILITY</div>
            <h4>
              {{
                t(
                  '物理断网实机运行与工业级工程可靠性保障',
                  '完全オフライン環境での実機稼働と高信頼エンジニアリング基盤',
                  'Air-Gapped Local Execution & Industrial-Grade Reliability'
                )
              }}
            </h4>
            <p>
              {{
                t(
                  'Helm 内置完整的 Python 3.13 FastAPI 异步运行时与 86+ 项自动化核心单测，支持连接本机 Ollama 或企业内网大模型在物理断网环境下独立闭环运行（含长周期代码开发、影子 Git 检查点与 Office 文档局部 AI 热修改），确保个人隐私文档与企业核心代码 100% 留存本地，绝不经过任何第三方中转服务器。',
                  'Helm は Python 3.13 FastAPI 非同期ランタイムと 86件以上の自動単体テスト検証済みコアエンジンを内蔵しています。ローカルの Ollama や社内閉域網 LLM と連携し、完全オフライン環境でもコード開発・シャドウGitチェックポイント・Office文書の選択範囲AI更新が完結するため、個人ユーザーから企業現場まで安心してご利用いただけます。',
                  'Bundling an embedded Python 3.13 FastAPI runtime backed by 86+ automated unit tests, Helm runs 100% locally with Ollama or corporate LAN models—delivering autonomous coding, Shadow Git Checkpoints, and surgical Office AI editing with zero cloud relay.'
                )
              }}
            </p>
          </div>
        </div>

        <div class="nx-modal-footer">
          <button
            type="button"
            class="nx-btn nx-btn-primary"
            @click="jumpTo(`${prefix}/architecture/overview`)"
          >
            {{ t('审阅全 5 卷工程架构白皮书 →', '技術アーキテクチャ白書 (全5章) を読む →', 'Read 5-Vol Architecture Blueprint →') }}
          </button>
          <button
            type="button"
            class="nx-btn nx-btn-glass"
            @click="jumpTo(`${prefix}/demo`)"
          >
            {{ t('打开在线交互工作台 (/demo)', '全画面ワークベンチを開く (/demo)', 'Open Interactive Workbench (/demo)') }}
          </button>
          <button
            type="button"
            class="nx-btn nx-btn-glass"
            @click="jumpTo(`${prefix}/download`)"
          >
            {{ t('查看安装包与 SHA-256 校验', 'ダウンロード・SHA-256検証へ', 'Download & SHA-256 Audit') }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.nx-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(3, 6, 14, 0.78);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.nx-modal-card {
  width: 100%;
  max-width: 820px;
  background: rgba(11, 17, 32, 0.96);
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 18px;
  padding: 32px;
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.14),
    0 32px 80px -12px rgba(0, 0, 0, 0.9),
    0 0 60px rgba(37, 99, 235, 0.22);
}

.nx-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.nx-modal-badge-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.nx-modal-code {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #64748b;
}

.nx-modal-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.8);
  color: #94a3b8;
  cursor: pointer;
}

.nx-modal-close:hover {
  color: #ffffff;
  border-color: rgba(56, 189, 248, 0.5);
}

.nx-modal-title {
  margin: 0 0 22px;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.35;
  color: #f8fafc;
}

.nx-modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 26px;
}

.nx-modal-item {
  padding: 20px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.nx-modal-item-num {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 700;
  color: #38bdf8;
  margin-bottom: 8px;
}

.nx-modal-item h4 {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
}

.nx-modal-item p {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: #cbd5e1;
}

.nx-modal-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.14);
}

.nx-modal-fade-enter-active,
.nx-modal-fade-leave-active {
  transition: opacity 180ms ease;
}

.nx-modal-fade-enter-from,
.nx-modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 720px) {
  .nx-modal-grid {
    grid-template-columns: 1fr;
  }
}
</style>
