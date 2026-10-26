<script setup>
/**
 * 独立宽屏下载与安全透明验证页面组件（DownloadCenter.vue）。
 *
 * 职责与协作：
 * - 用于 `/download`、`/ja/download`、`/en/download`（配合 `layout: page` 使用 1320px 宽屏建筑感布局）。
 * - 严格保持语言纯粹性：中文界面绝不混入日语词汇；日语界面使用地道、得体的日本商务与安全工程表达。
 */
import { ref, computed } from 'vue'
import { SITE_META } from '../siteData.js'

const props = defineProps({
  lang: {
    type: String,
    default: 'zh'
  }
})

const copiedKey = ref('')

function tt(zh, ja, en) {
  if (props.lang === 'ja') return ja
  if (props.lang === 'en') return en
  return zh
}

const prefix = computed(() => {
  if (props.lang === 'ja') return '/ja'
  if (props.lang === 'en') return '/en'
  return ''
})

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
    title: tt('第一步：校验安装包 SHA-256 与官方内嵌运行时', 'Step 1：SHA-256 ハッシュ値の照合と内蔵ランタイムの確認', 'Step 1: Verify SHA-256 Checksum & Embedded Runtime'),
    desc: tt(
      '下载完成后在 PowerShell 执行哈希比对，确认分发包未经任何篡改。客户端内置 Python 3.13 官方嵌入式环境，渲染进程仅通过回环地址 127.0.0.1:8001 与本机 FastAPI 子进程通信。',
      'ダウンロード完了後、PowerShell で SHA-256 ハッシュ値を照合し、ファイルの完全性を確認します。クライアントには公式 Python 3.13 ランタイムが同梱されており、127.0.0.1:8001 のループバック通信のみで動作します。',
      'Verify binary integrity via PowerShell SHA-256. The client bundles an official Python 3.13 runtime communicating strictly over 127.0.0.1:8001.'
    ),
    cmd: 'Get-FileHash .\\Helm-Setup-1.0.0.exe -Algorithm SHA256'
  },
  {
    step: 'AUDIT 02 // AIR-GAPPED EXECUTION',
    title: tt('第二步：物理断网或配置防火墙出站阻断测试', 'Step 2：ネットワーク遮断（オフライン環境）での動作検証', 'Step 2: Test Under Air-Gapped / Firewall-Blocked Conditions'),
    desc: tt(
      '在本机启动 Ollama（127.0.0.1:11434）后，直接拔掉网线或关闭 Wi-Fi（或用 Windows 防火墙阻断一切公网出站）。在设置页启用「Ollama（本机离线）」，即可在物理断网下完整执行代码重构、单测运行与 Office 局部修改。',
      'ローカル環境で Ollama（127.0.0.1:11434）を起動後、Wi-Fi をオフにするか LAN ケーブルを抜いた状態（またはファイアウォールで外部通信を遮断した状態）にします。設定画面で「Ollama（ローカル）」を選択すれば、完全オフラインのままコード改修・単体テスト・Office 文書編集が完結します。',
      'Start Ollama locally (127.0.0.1:11434), disconnect Wi-Fi/Ethernet, and select "Ollama (Local Offline)" to run refactoring, unit tests, and Office edits completely offline.'
    ),
    cmd: tt(
      'ollama pull qwen2.5-coder:14b  # 模型就绪后即可断开外部网络独立运行',
      'ollama pull qwen2.5-coder:14b  # モデル取得後はネットワーク切断状態で稼働可能',
      'ollama pull qwen2.5-coder:14b  # Disconnect external network after pulling'
    )
  },
  {
    step: 'AUDIT 03 // TRANSPARENT STORAGE & LOGS',
    title: tt('第三步：审计本地明文目录与脱敏日志', 'Step 3：ローカル保存データとマスキング済みログの監査', 'Step 3: Inspect Local Storage & Scrubbed Logs'),
    desc: tt(
      '所有会话记录、双层 Markdown 记忆、文件快照均以明文结构保存在 .hyn_agent/ 目录下。打开 logs/main.log 可直接验证 sanitizeLogMessage 钩子：任何 sk-*、Bearer、api_key 均在落盘前被擦除为 ***。',
      '会話履歴・2層メモリ（Markdown形式）・ファイルスナップショットはすべて .hyn_agent/ 配下に平文で保存されます。logs/main.log を開くと、sanitizeLogMessage フックによって API キーやトークン文字列が記録前に *** へ自動マスキングされていることを確認できます。',
      'All sessions, Markdown memories, and file snapshots reside transparently under .hyn_agent/. Inspect logs/main.log to confirm API keys are scrubbed into *** prior to disk write.'
    ),
    cmd: 'Get-Content .\\.hyn_agent\\logs\\main.log -Tail 30'
  }
])
</script>

<template>
  <div class="dl-page">
    <div class="dl-container">
      <header class="dl-header">
        <div class="dl-header-left">
          <div class="dl-brand-head">
            <img class="dl-brand-icon" :src="SITE_META.brandIconUrl" alt="Helm" />
            <div>
              <div class="dl-kicker">HELM // DISTRIBUTION &amp; SECURITY AUDIT · {{ SITE_META.version }} ({{ SITE_META.releaseDate }})</div>
              <h1 class="dl-title">
                {{ tt('Helm 客户端下载与离线安全验证规程', 'Helm クライアント配布・オフライン安全性検証ガイド', 'Helm Client Distribution & Offline Security Verification') }}
              </h1>
            </div>
          </div>
          <p class="dl-sub">
            {{ tt(
              'Take the Helm of Long-Running Code & Docs.（执掌长周期代码与文档创作之舵。）内置 Python 3.13 + FastAPI 异步引擎与 Office 多格式预览工作台，无需额外部署服务端，免费下载、安装即用。',
              'Take the Helm of Long-Running Code & Docs.（長時間稼働するコード開発とドキュメント制作の舵を取る。）Python 3.13 + FastAPI 非同期エンジンおよび Office 高精細ワークベンチを内蔵し、ダウンロード後すぐにご利用いただけます。',
              'Take the Helm of Long-Running Code & Docs. Bundles Python 3.13 + FastAPI local engine and Office workbench with zero external server setup required.'
            ) }}
          </p>
        </div>
        <div class="dl-header-right">
          <a class="stone-btn" :href="`${prefix}/demo`">
            {{ tt('不便安装？打开浏览器免安装沙盒 →', 'インストール不要のブラウザ体験デモへ →', 'Restricted PC? Open Browser Sandbox →') }}
          </a>
        </div>
      </header>

      <section class="dl-grid">
        <div class="dl-card is-primary-card">
          <div class="dl-card-top">
            <span class="dl-tier-tag">EDITION 01 // RECOMMENDED INSTALLER</span>
            <span class="dl-size-pill">{{ SITE_META.installerSize }} · Windows x64</span>
          </div>
          <h2 class="dl-card-title">{{ tt('Windows 标准桌面安装版 (.exe)', 'Windows 標準インストーラー版 (.exe)', 'Windows Standard Installer (.exe)') }}</h2>
          <p class="dl-card-desc">
            {{ tt(
              '自动配置桌面快捷方式与独立数据隔离目录（默认保存在软件同级或自定义磁盘路径，零 C 盘空间侵占）。适合个人开发机与长期主力使用。',
              'デスクトップショートカットと独立データ保存領域を自動構成します（Cドライブを圧迫しない設計）。個人開発環境での日常利用に最適です。',
              'Automatically configures desktop shortcuts and an isolated data directory without bloating C: drive.'
            ) }}
          </p>

          <div class="dl-btn-row">
            <a class="stone-btn is-primary dl-main-btn" :href="SITE_META.installerUrl" target="_blank" rel="noopener">
              {{ tt('下载 Windows 安装包 (Helm-Setup.exe)', 'Windows インストーラー版 (Helm-Setup.exe) をダウンロード', 'Download Windows Installer (Helm-Setup.exe)') }}
            </a>
          </div>

          <div class="dl-checksum">
            <div class="dl-checksum-head">
              <span>SHA-256 CHECKSUM</span>
              <button type="button" class="dl-copy-btn" @click="copyHash('exe', SITE_META.installerSha256)">
                {{ copiedKey === 'exe' ? tt('✓ 已复制', '✓ コピー完了', '✓ Copied') : tt('复制 SHA-256', 'SHA-256 をコピー', 'Copy SHA-256') }}
              </button>
            </div>
            <code class="dl-checksum-val">{{ SITE_META.installerSha256 }}</code>
          </div>
        </div>

        <div class="dl-card">
          <div class="dl-card-top">
            <span class="dl-tier-tag">EDITION 02 // PORTABLE ARCHIVE</span>
            <span class="dl-size-pill">{{ SITE_META.portableSize }} · No Admin Required</span>
          </div>
          <h2 class="dl-card-title">{{ tt('Windows 免安装绿色解压版 (.zip)', 'Windows ポータブル版・インストール不要 (.zip)', 'Windows Portable Edition (.zip)') }}</h2>
          <p class="dl-card-desc">
            {{ tt(
              '无需管理员权限、不修改系统注册表。解压到任意非系统目录即可直接双击启动，删除文件夹即彻底卸载，适合快速评估与沙盒测试。',
              '管理者権限不要・レジストリ変更なし。任意のフォルダに解凍するだけですぐに起動でき、フォルダごと削除するだけでクリーンに削除可能です。',
              'Requires no administrator privileges and writes nothing to registry. Unzip to any folder and launch immediately.'
            ) }}
          </p>

          <div class="dl-btn-row">
            <a class="stone-btn dl-main-btn" :href="SITE_META.portableUrl" target="_blank" rel="noopener">
              {{ tt('下载免安装绿色版 (Helm-Portable.zip)', 'ポータブル版 (Helm-Portable.zip) をダウンロード', 'Download Portable Archive (Helm-Portable.zip)') }}
            </a>
          </div>

          <div class="dl-checksum">
            <div class="dl-checksum-head">
              <span>SHA-256 CHECKSUM</span>
              <button type="button" class="dl-copy-btn" @click="copyHash('zip', SITE_META.portableSha256)">
                {{ copiedKey === 'zip' ? tt('✓ 已复制', '✓ コピー完了', '✓ Copied') : tt('复制 SHA-256', 'SHA-256 をコピー', 'Copy SHA-256') }}
              </button>
            </div>
            <code class="dl-checksum-val">{{ SITE_META.portableSha256 }}</code>
          </div>
        </div>
      </section>

      <section class="dl-audit-section">
        <div class="dl-sec-head">
          <div class="dl-kicker">VERIFICATION PROTOCOL // ZERO-TRUST SELF-AUDIT</div>
          <h2 class="dl-sec-title">
            {{ tt('如何亲手验证「100% 本地闭环、数据零出网」？（3 步物理级自检）', '「100% ローカル完結・外部送信ゼロ」をご自身で検証する3ステップ', 'How to Independently Audit "100% Local & Zero Egress" in 3 Steps') }}
          </h2>
        </div>

        <div class="dl-audit-grid">
          <div v-for="item in auditSteps" :key="item.step" class="dl-audit-card">
            <div class="dl-audit-step">{{ item.step }}</div>
            <h3 class="dl-audit-title">{{ item.title }}</h3>
            <p class="dl-audit-desc">{{ item.desc }}</p>
            <pre class="dl-audit-cmd"><code>{{ item.cmd }}</code></pre>
          </div>
        </div>
      </section>

      <section class="dl-recruiter-banner">
        <div class="dl-recruiter-left">
          <div class="dl-kicker">
            {{ tt('FOR CORPORATE REVIEWERS & INTERVIEWERS // 致招聘负责人与技术面试官', 'FOR CORPORATE REVIEWERS & INTERVIEWERS // 採用ご担当者様・技術面接官の皆様へ', 'FOR CORPORATE REVIEWERS & INTERVIEWERS') }}
          </div>
          <h3>
            {{ tt(
              '办公电脑受终端安全策略限制，不便运行外部 .exe 程序？',
              '社用PCのセキュリティポリシーにより外部実行ファイル（.exe）の起動が制限されている場合',
              'Working on a Corporate PC with Strict Executable Restrictions?'
            ) }}
          </h3>
          <p>
            {{ tt(
              '您完全无需在办公电脑上安装软件。请直接通过本站的「浏览器免安装交互工作台」体验真实三栏界面，并阅读全 5 章「工程架构白皮书」审阅源码级设计。在视频面试（Zoom / Teams / Meet）中，我非常乐意通过屏幕共享为您现场演示物理断网下的实机运行，并在 IDE 中走读前后端全部源码与 86+ 项单元测试。',
              '社用PCへ無理にインストールしていただく必要はございません。ブラウザ上でそのまま操作できる「対話型ワークベンチ」および全5章の「技術アーキテクチャ白書」にて内部設計をご高覧いただけますと幸いです。また、オンライン面接（Zoom / Teams / Google Meet）の場におきましては、画面共有にて完全オフラインでの実機ライブデモ、ならびに IDE 上での全ソースコード・単体テスト（全86件）の解説をさせていただければ幸いです。',
              'You do not need to install anything on your work machine. Explore our Zero-Install Interactive Workbench in your browser and read the 5-part Engineering Whitepaper. During remote interviews, I am happy to share my screen for a live offline demo and full IDE source walkthrough.'
            ) }}
          </p>
        </div>
        <div class="dl-recruiter-right">
          <a class="stone-btn is-primary" :href="`${prefix}/demo`">
            {{ tt('打开浏览器免安装沙盒 →', 'ブラウザ体験デモを開く →', 'Open Browser Sandbox →') }}
          </a>
          <a class="stone-btn" :href="`${prefix}/architecture/overview`">
            {{ tt('阅读工程架构白皮书 →', '技術アーキテクチャ白書を読む →', 'Read Architecture Whitepaper →') }}
          </a>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.dl-page {
  background: #ffffff;
  min-height: calc(100vh - 64px);
  padding: 36px 24px 72px;
}

.dl-container {
  max-width: 1320px;
  margin: 0 auto;
}

.dl-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  padding-bottom: 24px;
  margin-bottom: 28px;
  border-bottom: 1px solid var(--border-subtle);
}

.dl-header-left {
  max-width: 820px;
}

.dl-brand-head {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 10px;
}

.dl-brand-icon {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  border: 1px solid #1e293b;
  flex: none;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.14);
}

.dl-kicker {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--accent);
  margin-bottom: 8px;
}

.dl-title {
  margin: 0 0 10px;
  font-size: 28px;
  font-weight: 750;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.dl-sub {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: var(--text-secondary);
}

.dl-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 48px;
}

.dl-card {
  padding: 28px;
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
}

.dl-card.is-primary-card {
  border-color: var(--accent);
  background: #fcfdff;
}

.dl-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.dl-tier-tag {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--accent);
}

.dl-size-pill {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 2px 8px;
  background: var(--bg-hover);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  color: var(--text-tertiary);
}

.dl-card-title {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 750;
}

.dl-card-desc {
  margin: 0 0 20px;
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--text-secondary);
}

.dl-btn-row {
  margin-bottom: 20px;
}

.dl-main-btn {
  height: 40px;
  padding: 0 18px;
  font-size: 13.5px;
}

.dl-checksum {
  margin-top: auto;
  padding: 12px;
  background: var(--bg-code);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
}

.dl-checksum-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-tertiary);
  margin-bottom: 6px;
}

.dl-copy-btn {
  padding: 2px 8px;
  font-size: 11px;
  border-radius: 4px;
  border: 1px solid var(--border-subtle);
  background: #ffffff;
  color: var(--accent);
  cursor: pointer;
}

.dl-checksum-val {
  display: block;
  font-family: var(--font-mono);
  font-size: 11.5px;
  word-break: break-all;
  color: var(--text-secondary);
}

.dl-audit-section {
  margin-bottom: 48px;
}

.dl-sec-head {
  margin-bottom: 20px;
}

.dl-sec-title {
  margin: 0;
  font-size: 22px;
  font-weight: 750;
}

.dl-audit-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.dl-audit-card {
  padding: 24px;
  background: #ffffff;
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
}

.dl-audit-card:last-child {
  border-right: none;
}

.dl-audit-step {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 8px;
}

.dl-audit-title {
  margin: 0 0 10px;
  font-size: 15.5px;
  font-weight: 700;
}

.dl-audit-desc {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.65;
  color: var(--text-secondary);
  flex: 1;
}

.dl-audit-cmd {
  margin: 0;
  padding: 10px;
  background: var(--bg-code);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  overflow-x: auto;
}

.dl-recruiter-banner {
  padding: 28px 32px;
  background: var(--bg-app);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.dl-recruiter-left {
  flex: 1;
  min-width: 300px;
}

.dl-recruiter-left h3 {
  margin: 6px 0 10px;
  font-size: 18px;
  font-weight: 750;
}

.dl-recruiter-left p {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.dl-recruiter-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

@media (max-width: 960px) {
  .dl-grid,
  .dl-audit-grid {
    grid-template-columns: 1fr;
  }
  .dl-audit-card {
    border-right: none;
    border-bottom: 1px solid var(--border-subtle);
  }
}
</style>
