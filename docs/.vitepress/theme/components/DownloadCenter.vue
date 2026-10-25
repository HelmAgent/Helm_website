<script setup>
/**
 * 下载与安全校验中心组件（DownloadCenter.vue）。
 *
 * 职责与协作：
 * - 用于 `/download`、`/ja/download`、`/en/download` 页面。
 * - 从 `siteData.js` 读取安装包直链、绿色版直链、SHA-256 哈希与版本信息，支持一键复制 SHA-256。
 * - 提供「如何验证 100% 本地不出网」三步自检指南，以及专为日本企业 HR / 技术面试官准备的「採用ご担当者様・面接官の方へ」说明卡。
 */
import { ref } from 'vue'
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

/**
 * 复制指定 SHA-256 校验值到剪贴板并给出 2 秒成功反馈。
 * @param {string} key 按钮标识
 * @param {string} hash SHA-256 字符串
 */
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
</script>

<template>
  <div class="dl-wrap">
    <!-- 顶部版本与安全承诺横幅 -->
    <div class="dl-banner">
      <div class="dl-banner-top">
        <span class="stone-badge is-success">🔒 {{ tt('100% 本地后端 · 零数据上传', '100% ローカル完結 · 外部送信ゼロ', '100% Local Backend · Zero Data Egress') }}</span>
        <span class="dl-ver">{{ SITE_META.version }} · {{ SITE_META.releaseDate }}</span>
      </div>
      <h2 class="dl-title">
        {{ tt('获取 HYN Agent 桌面客户端', 'HYN Agent デスクトップ版のダウンロード', 'Download HYN Agent Desktop Client') }}
      </h2>
      <p class="dl-desc">
        {{ tt(
          '内置 Python 3.13 + FastAPI 本地引擎与 Office 文档工作台，开箱即用，无需配置服务端或额外安装 Python 环境。',
          'Python 3.13 + FastAPI ローカルエンジンおよび Office ワークベンチを内蔵。追加の環境構築なしで即座に利用可能です。',
          'Bundles Python 3.13 + FastAPI local runtime and Office workbench. Zero server setup or external Python required.'
        ) }}
      </p>
    </div>

    <!-- 双版本下载卡片（标准安装版 vs 免安装绿色解压版） -->
    <div class="dl-cards">
      <div class="dl-card is-recommended">
        <div class="dl-card-head">
          <div>
            <span class="stone-badge">{{ tt('推荐 · 标准桌面安装版', '推奨 · 標準インストーラー版', 'Recommended · Standard Installer') }}</span>
            <h3 class="dl-card-name">Windows Setup (.exe)</h3>
          </div>
          <span class="dl-size">{{ SITE_META.installerSize }}</span>
        </div>
        <p class="dl-card-note">
          {{ tt(
            '自动创建桌面快捷方式与用户数据隔离目录（默认保存在仓库同级或自定义路径，不占 C 盘空间）。',
            'デスクトップショートカットを自動作成。データは指定フォルダに隔離保存され、Cドライブを圧迫しません。',
            'Creates desktop shortcuts and isolated local storage directory without bloating C: drive.'
          ) }}
        </p>
        <div class="dl-actions">
          <a class="stone-btn is-primary" :href="SITE_META.installerUrl" target="_blank" rel="noopener">
            ⬇ {{ tt('下载 Windows 安装包 (.exe)', 'Windows インストーラー (.exe) をダウンロード', 'Download Windows Installer (.exe)') }}
          </a>
        </div>
        <div class="dl-hash-box">
          <div class="dl-hash-label">
            <span>SHA-256:</span>
            <button type="button" class="dl-copy-btn" @click="copyHash('exe', SITE_META.installerSha256)">
              {{ copiedKey === 'exe' ? tt('✓ 已复制', '✓ コピー済', '✓ Copied') : tt('复制校验码', 'コピー', 'Copy') }}
            </button>
          </div>
          <code class="dl-hash-code">{{ SITE_META.installerSha256 }}</code>
        </div>
      </div>

      <div class="dl-card">
        <div class="dl-card-head">
          <div>
            <span class="stone-badge is-success">{{ tt('免安装 · 解压即用', 'インストール不要 · ポータブル版', 'No Install · Portable ZIP') }}</span>
            <h3 class="dl-card-name">Windows Portable (.zip)</h3>
          </div>
          <span class="dl-size">{{ SITE_META.portableSize }}</span>
        </div>
        <p class="dl-card-note">
          {{ tt(
            '无需管理员权限、不写系统注册表。解压到任意目录双击即可运行，删除文件夹即彻底卸载。',
            '管理者権限不要・レジストリ変更なし。任意のフォルダに解凍するだけですぐに起動できます。',
            'Requires no admin privileges and writes nothing to registry. Unzip and run anywhere.'
          ) }}
        </p>
        <div class="dl-actions">
          <a class="stone-btn" :href="SITE_META.portableUrl" target="_blank" rel="noopener">
            📦 {{ tt('下载免安装绿色版 (.zip)', 'ポータブル版 (.zip) をダウンロード', 'Download Portable ZIP (.zip)') }}
          </a>
        </div>
        <div class="dl-hash-box">
          <div class="dl-hash-label">
            <span>SHA-256:</span>
            <button type="button" class="dl-copy-btn" @click="copyHash('zip', SITE_META.portableSha256)">
              {{ copiedKey === 'zip' ? tt('✓ 已复制', '✓ コピー済', '✓ Copied') : tt('复制校验码', 'コピー', 'Copy') }}
            </button>
          </div>
          <code class="dl-hash-code">{{ SITE_META.portableSha256 }}</code>
        </div>
      </div>
    </div>

    <!-- 面向日本企业 HR 与技术面试官的专属提示 -->
    <div class="dl-recruiter-box">
      <div class="dl-recruiter-head">
        <span class="stone-badge">👔 {{ tt('致招聘负责人与技术面试官（採用ご担当者様・面接官の方へ）', '採用ご担当者様・技術面接官の方へ', 'Note for Recruiters & Technical Interviewers') }}</span>
      </div>
      <p class="dl-recruiter-text">
        {{ tt(
          '考虑到许多日本及跨国企业的办公电脑（社用 PC）设有严格的终端安全管控（禁止运行外部可执行文件）：您完全无需在办公电脑上冒险安装软件。请直接点击上方导航栏的「在线交互沙盒」在浏览器内体验真实 UI 交互，并阅读「工程架构白皮书」审阅源码级设计。在远程视频面试（Zoom / Teams / Meet）中，我非常乐意通过屏幕共享（画面共有）为您现场演示断网实机运行、打开 IDE 走读前后端完整源码并現場运行 86+ 项单元测试。',
          '多くの企業様において、社用PCでの外部実行ファイル（.exe）の起動がセキュリティポリシー（SKYSEA等）により制限されていることを承知しております。社用PCへ無理にインストールしていただく必要はございません。ぜひブラウザ上でそのまま操作できる「Web体験デモ」およびソースコードレベルの設計を詳述した「技術アーキテクチャ白書」をご覧ください。また、オンライン面接（Zoom / Teams / Meet）の場にて、画面共有による実機ライブデモおよび IDE 上での全ソースコード・単体テスト（86件以上）のリアルタイム解説を喜んで実演いたします。',
          'We understand corporate PCs often restrict running external executables (.exe). You do not need to install anything on your work machine: explore the Zero-Install Interactive Web Demo directly in your browser and review our 5-part Engineering Architecture Whitepaper. During remote interviews (Zoom/Teams/Meet), I am happy to share my screen for a live offline demo and full IDE source code walkthrough.'
        ) }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.dl-wrap {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dl-banner {
  padding: 20px 24px;
  background: var(--bg-hover);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
}

.dl-banner-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.dl-ver {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--text-tertiary);
}

.dl-title {
  margin: 12px 0 6px !important;
  border: none !important;
  padding: 0 !important;
  font-size: 22px !important;
}

.dl-desc {
  margin: 0 !important;
  color: var(--text-secondary);
  font-size: 14px;
}

.dl-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.dl-card {
  padding: 20px;
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dl-card.is-recommended {
  border-color: var(--accent);
}

.dl-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.dl-card-name {
  margin: 8px 0 0 !important;
  font-size: 18px !important;
}

.dl-size {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--text-tertiary);
  background: var(--bg-hover);
  padding: 2px 8px;
  border-radius: 4px;
}

.dl-card-note {
  margin: 0 !important;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.55;
}

.dl-actions {
  margin-top: 4px;
}

.dl-hash-box {
  margin-top: auto;
  padding: 10px;
  background: var(--bg-code);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
}

.dl-hash-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11.5px;
  color: var(--text-tertiary);
  margin-bottom: 4px;
}

.dl-copy-btn {
  padding: 1px 8px;
  font-size: 11px;
  border-radius: 4px;
  border: 1px solid var(--border-subtle);
  background: #ffffff;
  color: var(--accent);
  cursor: pointer;
}

.dl-hash-code {
  display: block;
  font-size: 11px;
  font-family: var(--font-mono);
  word-break: break-all;
  color: var(--text-secondary);
}

.dl-recruiter-box {
  padding: 18px 20px;
  background: var(--bg-selected);
  border: 1px solid var(--bg-selected-strong);
  border-radius: var(--radius-sm);
}

.dl-recruiter-head {
  margin-bottom: 8px;
}

.dl-recruiter-text {
  margin: 0 !important;
  font-size: 13.5px;
  color: var(--text-primary);
  line-height: 1.65;
}
</style>
