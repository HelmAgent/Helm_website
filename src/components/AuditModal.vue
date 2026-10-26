<script setup>
/**
 * 精致得体的「Developer & Interview Live Demo（架构审阅与实机源码演示）」高管弹窗组件（AuditModal.vue）。
 *
 * 职责与协作：
 * - 响应用户定位需求：不再在首页底部放置突兀的大段求职说明文字，而是浓缩为页脚与白皮书栏的精致入口。
 * - 当日本/中国 IT 企业的技术面试官或招聘负责人点击时，以极具质感的技术高管简报卡片展现离线审阅指南与 IDE 全量源码 Live Walkthrough 承诺。
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
            <span class="nx-badge">DEVELOPER &amp; INTERVIEW LIVE DEMO</span>
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
              '技术架构审阅、办公环境免安装体验与远程面试源码 Live 走读说明',
              '技術アーキテクチャ検証、社用PCでのブラウザ体験、および面接時の全ソースコード解説について',
              'Technical Architecture Review, Zero-Install Sandbox, and Live IDE Source Walkthrough'
            )
          }}
        </h3>

        <div class="nx-modal-grid">
          <div class="nx-modal-item">
            <div class="nx-modal-item-num">01 // ZERO-INSTALL ARCHITECTURAL AUDIT</div>
            <h4>
              {{
                t(
                  '独立产品分发与全透明架构白皮书',
                  '独立製品としての配布形態と全5章の技術設計白書',
                  'Standalone Product Release & 5-Volume Blueprint'
                )
              }}
            </h4>
            <p>
              {{
                t(
                  'Helm 作为完整的桌面端独立软件进行打包发布。考虑到企业办公终端通常对运行外部 .exe 设有安全策略限制，本站特别内建了「1:1 浏览器交互沙盒」与「全 5 卷工程架构白皮书」，无需安装即可在线验证双进程拓扑、TurnHub 状态机、无侵入影子 Git 检查点与 Git Worktree 并发隔离的底层实现。',
                  'Helm は完成されたデスクトップ製品としてパッケージ配布しております。社用PCのセキュリティ制限により実行ファイルの導入が難しい技術面接官・エンジニアの皆様にも、ブラウザ上の「1:1 対話型ワークベンチ」と「全5章の技術アーキテクチャ白書」を通じて、状態マシンやデータ契約の深さをそのまま検証いただけます。',
                  'Helm is packaged as a standalone desktop application. So technical reviewers on locked-down corporate machines can evaluate its engineering depth without running an installer, this site provides a 1:1 Interactive Sandbox and a 5-volume Architecture Whitepaper.'
                )
              }}
            </p>
          </div>

          <div class="nx-modal-item">
            <div class="nx-modal-item-num">02 // LIVE OFFLINE DEMO &amp; IDE SOURCE WALKTHROUGH</div>
            <h4>
              {{
                t(
                  '面试现场物理断网实机演示与 IDE 全量源码走读',
                  'オンライン面接での完全オフライン実機デモ＆IDE全ソースコード解説',
                  'Live Air-Gapped Demo & Full IDE Source Walkthrough'
                )
              }}
            </h4>
            <p>
              {{
                t(
                  '在远程视频技术面试（Zoom / Teams / Google Meet）或现场面试中，我随时准备通过屏幕共享为您现场演示物理断网下的 Helm 实机运行（含 Ollama 离线重构与 PPT 划词局部热补丁），并在 IDE 中直接打开前端（Electron + Vue 3）与后端（FastAPI + 86 项自动化单测）完整源码进行逐模块讲解。',
                  'オンライン面接（Zoom / Teams / Google Meet）や技術面談の場におきましては、画面共有による完全オフライン環境での実機デモンストレーション（ローカルLLM連携・Office選択範囲AI更新）、および IDE 上でのフロントエンド（Electron + Vue 3）・バックエンド（FastAPI + 単体テスト86件）全ソースコードのライブ解説を実演いたします。',
                  'During remote interviews (Zoom / Teams / Meet), I am ready to share my screen for a live air-gapped demonstration and walk through the entire Electron + Vue 3 + FastAPI codebase and 86+ unit tests directly in my IDE.'
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
            {{ t('打开全屏交互沙盒 (/demo)', '全画面ワークベンチを開く (/demo)', 'Open Fullscreen Sandbox (/demo)') }}
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
