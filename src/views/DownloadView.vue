<script setup>
/**
 * 旗舰企业级客户端下载与 3 步零信任安全验证中心（DownloadView.vue）。
 *
 * 职责与协作：
 * - 对应 `/download`、`/ja/download`、`/en/download`。
 * - 提供标准桌面安装版（`.exe`）与免管理员权限绿色便携版（`.zip`）分发卡片、一键复制 SHA-256 校验值，以及日本/中国企业安全部门最看重的 3 步物理断网离线验证流程。
 */
import { ref, computed } from 'vue'
import { SITE_META, tt, getLangPrefix } from '../data/siteData.js'
import { useAppRouter } from '../router.js'

const { currentLang, navigate } = useAppRouter()
const prefix = computed(() => getLangPrefix(currentLang.value))
const copiedKey = ref('')

function t(zh, ja, en) {
  return tt(currentLang.value, zh, ja, en)
}

async function copyHash(key, hash) {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(hash)
      copiedKey.value = key
      setTimeout(() => {
        if (copiedKey.value === key) copiedKey.value = ''
      }, 2000)
    }
  } catch {
    // 忽略无剪贴板权限环境
  }
}

const auditSteps = computed(() => [
  {
    step: 'AUDIT 01 // BINARY INTEGRITY',
    title: t('第一步：校验安装包 SHA-256 与内嵌运行时完整性', 'Step 1：SHA-256 ハッシュ値の照合と内蔵ランタイムの確認', 'Step 1: Verify SHA-256 Checksum & Embedded Runtime'),
    desc: t(
      '下载完成后在 PowerShell 执行哈希比对，确认分发包未经任何篡改。客户端内置 Python 3.13 官方嵌入式环境，渲染进程仅通过回环地址 127.0.0.1:8001 与本机 FastAPI 子进程通信。',
      'ダウンロード完了後、PowerShell で SHA-256 ハッシュ値を照合し、ファイルの完全性を確認します。クライアントには公式 Python 3.13 ランタイムが同梱されており、127.0.0.1:8001 のループバック通信のみで動作します。',
      'Verify binary integrity via PowerShell SHA-256. The client bundles an official Python 3.13 runtime communicating strictly over 127.0.0.1:8001.'
    ),
    cmd: 'Get-FileHash .\\Helm-Setup-1.0.0.exe -Algorithm SHA256'
  },
  {
    step: 'AUDIT 02 // AIR-GAPPED EXECUTION',
    title: t('第二步：物理断网或配置防火墙出站阻断测试', 'Step 2：ネットワーク遮断（オフライン環境）での動作検証', 'Step 2: Test Under Air-Gapped / Firewall-Blocked Conditions'),
    desc: t(
      '开启本机 Ollama（127.0.0.1:11434）后，可直接拔除网线、关闭 Wi-Fi 或在企业防火墙中禁止 Helm 出站访问公网。在此状态下执行代码重构、影子 Git 检查点与 Office 文档生成，验证 100% 本地闭环能力。',
      'ローカル Ollama（127.0.0.1:11434）を起動した状態で、LANケーブルを抜くか Wi-Fi をオフにして外部通信を物理的に遮断してください。そのままコード改修・シャドウチェックポイント・Office文書生成が100%稼働することを実証できます。',
      'With local Ollama running on 127.0.0.1:11434, unplug your network cable or block outbound traffic. Verify that coding, Shadow Git Checkpoints, and Office editing run 100% locally.'
    ),
    cmd: 'netstat -ano | findstr :8001   # Verify strict 127.0.0.1 loopback binding'
  },
  {
    step: 'AUDIT 03 // LOCAL DATA & LOG SANITIZATION',
    title: t('第三步：审计本地落盘目录与正则脱敏日志', 'Step 3：ローカル保存ディレクトリと自動マスキングログの監査', 'Step 3: Audit Local Storage & Pre-Write Sanitized Logs'),
    desc: t(
      '所有会话历史、双层记忆（USER.md / MEMORY.md）与 5 版本文件快照均以明文存储在本地 .hyn_agent/ 目录中；同时可检查日志目录，验证所有 API 凭证在写盘前均已被强制替换为 ***。',
      'すべての会話履歴、2層メモリ（USER.md / MEMORY.md）、ファイルスナップショットはローカルの .hyn_agent/ フォルダ内に平文で保存されます。また、ログファイル内の API キー等が書込前に *** へ自動消去されていることを確認できます。',
      'All sessions, 2-tier Markdown memory, and file snapshots reside in your local .hyn_agent/ folder. Inspect the log files to verify that API tokens are scrubbed to *** before disk write.'
    ),
    cmd: 'Get-ChildItem .\\.hyn_agent\\ -Recurse | Select-Object FullName, Length'
  }
])
</script>

<template>
  <div class="nx-download-view">
    <div class="nx-container">
      <!-- 顶部横幅 -->
      <div class="nx-dl-hero">
        <div class="nx-sec-kicker">
          <span class="nx-pulse-dot"></span>
          <span>OFFICIAL CLIENT DISTRIBUTION &amp; SECURITY VERIFICATION</span>
        </div>

        <div class="nx-dl-brand-banner nx-glass-card">
          <img class="nx-dl-emblem" :src="SITE_META.brandIconUrl" alt="Helm Emblem" />
          <div class="nx-dl-brand-info">
            <div class="nx-dl-brand-row">
              <strong>HELM DESKTOP</strong>
              <span class="nx-badge">{{ SITE_META.version }} · {{ SITE_META.releaseDate }}</span>
              <span class="nx-badge is-emerald">{{ t('零公网中转 · 100% 本地落盘', '外部クラウド中継ゼロ', 'Zero Cloud Relay') }}</span>
            </div>
            <div class="nx-dl-slogan">"Take the Helm of Long-Running Code &amp; Docs."</div>
          </div>
        </div>

        <h1 class="nx-dl-title">
          {{
            t(
              '客户端下载与三步「零信任」离线安全验证',
              'クライアント導入＆3ステップ・オフライン安全性検証',
              'Client Distribution & 3-Step Offline Security Verification'
            )
          }}
        </h1>
        <p class="nx-dl-desc">
          {{
            t(
              '提供 Windows 64 位标准安装程序（.exe）与免管理员权限绿色便携包（.zip）。安装包已内嵌 Python 3.13 FastAPI 异步运行时与全套 Office 处理引擎，开箱即用，零 C 盘空间污染。',
              'Windows 64bit 標準インストーラー版（.exe）と、管理者権限不要・レジストリ非変更のポータブル版（.zip）を提供。Python 3.13 FastAPI ランタイムを内蔵しており、追加の環境構築なしで即座に稼働します。',
              'Available as a standard Windows x64 Installer (.exe) and a zero-admin Portable Archive (.zip). Bundles the complete Python 3.13 FastAPI runtime out of the box.'
            )
          }}
        </p>
      </div>

      <!-- 双栏下载卡片 -->
      <div class="nx-dl-cards-grid">
        <!-- 卡片 1：标准桌面安装版 (.exe) -->
        <div class="nx-dl-card nx-glass-card is-recommended">
          <div class="nx-dl-card-top">
            <span class="nx-badge">RECOMMENDED // STANDARD INSTALLER</span>
            <span class="nx-dl-size">{{ SITE_META.installerSize }}</span>
          </div>
          <h2 class="nx-dl-card-title">
            {{ t('Windows 标准桌面安装版 (.exe)', 'Windows 標準インストーラー版 (.exe)', 'Windows Standard Installer (.exe)') }}
          </h2>
          <p class="nx-dl-card-sub">
            {{
              t(
                '适合个人研发工作站与长期主力使用。支持自定义非系统盘安装路径、自动创建桌面与开始菜单快捷方式，并提供完整卸载向导。',
                '個人開発端末やメイン環境での長期利用に最適。任意のドライブへのインストール、デスクトップショートカット自動作成、クリーンアンインストールに対応。',
                'Ideal for primary developer workstations. Supports custom non-system installation paths, desktop shortcuts, and clean uninstallation.'
              )
            }}
          </p>

          <a
            class="nx-btn nx-btn-primary nx-dl-main-btn"
            :href="SITE_META.installerUrl"
            target="_blank"
            rel="noopener"
          >
            <span>{{ t(`下载 Helm-Setup-1.0.0.exe (${SITE_META.version})`, `Helm-Setup-1.0.0.exe をダウンロード (${SITE_META.version})`, `Download Helm-Setup-1.0.0.exe (${SITE_META.version})`) }}</span>
            <span>↓</span>
          </a>

          <div class="nx-hash-box">
            <div class="nx-hash-top">
              <span>SHA-256 CHECKSUM</span>
              <button
                type="button"
                class="nx-hash-copy"
                @click="copyHash('exe', SITE_META.installerSha256)"
              >
                {{ copiedKey === 'exe' ? t('✓ 已复制', '✓ コピー完了', '✓ Copied') : t('复制哈希', 'ハッシュをコピー', 'Copy Hash') }}
              </button>
            </div>
            <code class="nx-hash-val">{{ SITE_META.installerSha256 }}</code>
          </div>
        </div>

        <!-- 卡片 2：免安装绿色便携版 (.zip) -->
        <div class="nx-dl-card nx-glass-card">
          <div class="nx-dl-card-top">
            <span class="nx-badge is-emerald">PORTABLE // ZERO ADMIN PRIVILEGE</span>
            <span class="nx-dl-size">{{ SITE_META.portableSize }}</span>
          </div>
          <h2 class="nx-dl-card-title">
            {{ t('Windows 免安装绿色便携版 (.zip)', 'Windows ポータブル版・管理者権限不要 (.zip)', 'Windows Portable Archive (.zip)') }}
          </h2>
          <p class="nx-dl-card-sub">
            {{
              t(
                '专为权限受限的企业办公电脑与内网评测环境打造。无需管理员权限、不写注册表，解压至任意目录双击即可运行，用完即删零残留。',
                'ソフトウェア導入制限のある社用PCや検証環境に最適。管理者権限不要・レジストリ変更なしで、任意のフォルダへ展開して即座に実行できます。',
                'Designed for restricted corporate PCs and security evaluation. Requires zero admin privileges and leaves zero registry footprint.'
              )
            }}
          </p>

          <a
            class="nx-btn nx-btn-glass nx-dl-main-btn"
            :href="SITE_META.portableUrl"
            target="_blank"
            rel="noopener"
          >
            <span>{{ t(`下载 Helm-Portable-1.0.0.zip (${SITE_META.version})`, `Helm-Portable-1.0.0.zip をダウンロード (${SITE_META.version})`, `Download Helm-Portable-1.0.0.zip (${SITE_META.version})`) }}</span>
            <span>↓</span>
          </a>

          <div class="nx-hash-box">
            <div class="nx-hash-top">
              <span>SHA-256 CHECKSUM</span>
              <button
                type="button"
                class="nx-hash-copy"
                @click="copyHash('zip', SITE_META.portableSha256)"
              >
                {{ copiedKey === 'zip' ? t('✓ 已复制', '✓ コピー完了', '✓ Copied') : t('复制哈希', 'ハッシュをコピー', 'Copy Hash') }}
              </button>
            </div>
            <code class="nx-hash-val">{{ SITE_META.portableSha256 }}</code>
          </div>
        </div>
      </div>

      <!-- 办公电脑不便安装时的替代引导条 -->
      <div class="nx-dl-sandbox-banner nx-glass-card">
        <div class="nx-dl-sb-text">
          <strong>
            {{
              t(
                '当前使用受管控的企业办公电脑，暂时不便下载运行 .exe？',
                '現在ご利用中の社用PCで実行ファイル（.exe）の起動が制限されていますか？',
                'Using a locked-down corporate PC where .exe execution is restricted?'
              )
            }}
          </strong>
          <span>
            {{
              t(
                '您无需下载任何文件，可直接在浏览器中打开「1:1 实时交互沙盒」完整体验全部桌面端工作流，或直接阅读 5 卷源码级工程架构白皮书。',
                'インストール不要の「1:1 ブラウザ対話型デモ」にて全ワークフローをそのまま操作体験いただくか、「技術アーキテクチャ白書（全5章）」をご参照ください。',
                'Launch our zero-install 1:1 Browser Sandbox to test all workflows online, or read the 5-volume Architecture Whitepaper.'
              )
            }}
          </span>
        </div>
        <div class="nx-dl-sb-actions">
          <a
            class="nx-btn nx-btn-primary"
            :href="`${prefix}/demo`"
            @click.prevent="navigate(`${prefix}/demo`)"
          >
            {{ t('打开浏览器免安装沙盒 →', 'Web対話型デモを開く →', 'Launch Browser Sandbox →') }}
          </a>
          <a
            class="nx-btn nx-btn-glass"
            :href="`${prefix}/architecture/overview`"
            @click.prevent="navigate(`${prefix}/architecture/overview`)"
          >
            {{ t('阅读 5 卷架构白皮书', '技術白書 (全5章) を読む', 'Read Whitepaper') }}
          </a>
        </div>
      </div>

      <!-- 三步物理级离线安全审计指南 -->
      <div class="nx-audit-section">
        <div class="nx-sec-header">
          <div class="nx-sec-kicker">ZERO-TRUST SECURITY VERIFICATION PROTOCOL</div>
          <h2 class="nx-sec-title">
            {{
              t(
                '面向企业安全部门的三步「物理级离线与数据主权」自测指南',
                '情報セキュリティ部門向け：3ステップ・オフライン安全性検証プロトコル',
                'Three-Step Air-Gapped & Data Sovereignty Verification Protocol'
              )
            }}
          </h2>
        </div>

        <div class="nx-audit-grid">
          <div v-for="item in auditSteps" :key="item.step" class="nx-audit-card nx-glass-card">
            <div class="nx-audit-step">{{ item.step }}</div>
            <h3 class="nx-audit-title">{{ item.title }}</h3>
            <p class="nx-audit-desc">{{ item.desc }}</p>
            <pre class="nx-audit-cmd"><code>{{ item.cmd }}</code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nx-download-view {
  position: relative;
  z-index: 5;
  padding: 48px 0 44px;
}

.nx-dl-hero {
  max-width: 880px;
  margin-bottom: 36px;
}

.nx-dl-brand-banner {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px 12px 12px;
  margin: 10px 0 22px;
}

.nx-dl-emblem {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  border: 1px solid rgba(96, 165, 250, 0.4);
}

.nx-dl-brand-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.nx-dl-brand-row strong {
  font-size: 15px;
  letter-spacing: 0.14em;
  color: #ffffff;
}

.nx-dl-slogan {
  margin-top: 4px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: #38bdf8;
}

.nx-dl-title {
  margin: 0 0 14px;
  font-size: clamp(28px, 3.4vw, 40px);
  font-weight: 850;
  letter-spacing: -0.025em;
  color: #ffffff;
}

.nx-dl-desc {
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: #94a3b8;
}

.nx-dl-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 28px;
}

.nx-dl-card {
  padding: 32px;
  display: flex;
  flex-direction: column;
}

.nx-dl-card.is-recommended {
  border-color: rgba(56, 189, 248, 0.42);
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.15),
    0 24px 60px -15px rgba(37, 99, 235, 0.25);
}

.nx-dl-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.nx-dl-size {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
}

.nx-dl-card-title {
  margin: 0 0 10px;
  font-size: 22px;
  font-weight: 800;
  color: #ffffff;
}

.nx-dl-card-sub {
  margin: 0 0 24px;
  font-size: 13.5px;
  line-height: 1.65;
  color: #cbd5e1;
  flex: 1;
}

.nx-dl-main-btn {
  width: 100%;
  height: 48px;
  font-size: 14px;
  margin-bottom: 20px;
}

.nx-hash-box {
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(5, 8, 17, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.nx-hash-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: #64748b;
  margin-bottom: 6px;
}

.nx-hash-copy {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.22);
  color: #38bdf8;
  border-radius: 5px;
  padding: 2px 8px;
  font-size: 10.5px;
  font-family: var(--font-mono);
  cursor: pointer;
}

.nx-hash-val {
  display: block;
  font-family: var(--font-mono);
  font-size: 11px;
  color: #cbd5e1;
  word-break: break-all;
}

.nx-dl-sandbox-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  padding: 24px 28px;
  margin-bottom: 64px;
  border-color: rgba(56, 189, 248, 0.28);
}

.nx-dl-sb-text {
  max-width: 740px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nx-dl-sb-text strong {
  font-size: 15.5px;
  color: #ffffff;
}

.nx-dl-sb-text span {
  font-size: 13.5px;
  color: #94a3b8;
  line-height: 1.55;
}

.nx-dl-sb-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.nx-audit-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.nx-audit-card {
  padding: 26px;
  display: flex;
  flex-direction: column;
}

.nx-audit-step {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 700;
  color: #38bdf8;
  margin-bottom: 8px;
}

.nx-audit-title {
  margin: 0 0 10px;
  font-size: 17px;
  font-weight: 750;
  color: #ffffff;
}

.nx-audit-desc {
  margin: 0 0 18px;
  font-size: 13px;
  line-height: 1.62;
  color: #cbd5e1;
  flex: 1;
}

.nx-audit-cmd {
  margin: 0;
  padding: 12px;
  border-radius: 8px;
  background: #050811;
  border: 1px solid rgba(148, 163, 184, 0.16);
  font-family: var(--font-mono);
  font-size: 11px;
  color: #34d399;
  overflow-x: auto;
}

@media (max-width: 1024px) {
  .nx-dl-cards-grid,
  .nx-audit-grid {
    grid-template-columns: 1fr;
  }
}
</style>
