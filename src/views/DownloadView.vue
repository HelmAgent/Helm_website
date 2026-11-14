<script setup>
/**
 * DownloadView.vue — Apple macOS 级客户端分发与三步「零信任」离线安全验证中心
 *
 * 职责与协作：
 * - 对应 `/download`、`/ja/download`、`/en/download`。
 * - 提供标准桌面安装版（`.exe`）分发卡片、内嵌 Python 3.13 运行时规格、一键复制 SHA-256 与 PowerShell 自检命令，以及官方社区直联入口。
 * - 100% 引用 `flagship.css` 语义令牌，零硬编码色值。
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

async function copyText(key, val) {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(val)
      copiedKey.value = key
      setTimeout(() => {
        if (copiedKey.value === key) copiedKey.value = ''
      }, 2100)
    }
  } catch {
    // 忽略无剪贴板权限环境
  }
}

const auditSteps = computed(() => [
  {
    key: 'step1',
    num: '01',
    tag: 'BINARY INTEGRITY',
    title: t(
      '校验安装包 SHA-256 与内嵌运行时完整性',
      'SHA-256 ハッシュ照合と内蔵ランタイムの確認',
      'Verify SHA-256 Checksum & Embedded Runtime'
    ),
    desc: t(
      '下载后可在 PowerShell 一键比对哈希值，确认分发包未经任何篡改（VirusTotal 57 家引擎扫描 0/57 零报毒）。渲染进程仅通过 127.0.0.1:8001 与本机 FastAPI 通信。',
      'PowerShell で SHA-256 ハッシュ値を照合し完全性を確認できます（VirusTotal 0/57 検証済）。内蔵 Python 3.13 ランタイムと 127.0.0.1:8001 ループバックのみで通信します。',
      'Verify binary integrity via PowerShell SHA-256 (VirusTotal 0/57 clean). Communicates strictly with bundled Python 3.13 over 127.0.0.1:8001.'
    ),
    cmd: `Get-FileHash .\\${SITE_META.installerAssetName} -Algorithm SHA256`
  },
  {
    key: 'step2',
    num: '02',
    tag: 'AIR-GAPPED LOOPBACK',
    title: t(
      '物理断网或防火墙出站阻断实测',
      'ネットワーク物理遮断（オフライン）での動作検証',
      'Test Under Air-Gapped / Firewall-Blocked Conditions'
    ),
    desc: t(
      '开启本机 Ollama（127.0.0.1:11434）后，直接拔除网线或关闭 Wi-Fi，在此状态下执行代码重构、影子 Git 检查点与 Office 热更新，验证 100% 本地闭环能力。',
      'ローカル Ollama（127.0.0.1:11434）起動後、LANケーブルを抜いて外部通信を物理遮断したまま、コード改修・シャドウGit・Office更新が100%稼働することを確認できます。',
      'With local Ollama on 127.0.0.1:11434, unplug your network cable and verify that coding, Shadow Git checkpoints, and Office hot-patching run 100% locally.'
    ),
    cmd: 'netstat -ano | findstr :8001'
  },
  {
    key: 'step3',
    num: '03',
    tag: 'DPAPI VAULT & LOGS',
    title: t(
      '审计 Windows DPAPI 密钥库与脱敏日志',
      'Windows DPAPI 暗号化金庫と自動マスクログの監査',
      'Audit Windows DPAPI Vault & Scrubbed Logs'
    ),
    desc: t(
      'API Key 与 MCP OAuth 令牌均通过 Windows DPAPI 绑定当前账户硬件级加密落盘；会话与双层记忆透明存放于 .hyn_agent/，敏感凭证写盘前自动脱敏为 ***。',
      'APIキーとOAuthトークンは Windows DPAPI でOSアカウント単位に暗号化保存。会話とメモリは .hyn_agent/ に保存され、認証情報は書込前に *** へ自動消去されます。',
      'API keys and MCP OAuth tokens are encrypted via Windows DPAPI. Sessions and 2-tier memory reside in .hyn_agent/, with secrets scrubbed to *** before disk write.'
    ),
    cmd: 'Get-ChildItem .\\.hyn_agent\\ -Recurse | Select-Object FullName, Length'
  }
])

const runtimeSpecs = computed(() => [
  {
    k: t('桌面宿主与工作台', 'デスクトップUI', 'Desktop Host & UI'),
    v: 'Electron 44 + Vue 3.5 (Stone Workbench)'
  },
  {
    k: t('内嵌本地后端引擎', '内蔵バックエンド', 'Embedded Backend'),
    v: 'Python 3.13 + FastAPI (127.0.0.1:8001)'
  },
  {
    k: t('三级模型接入架构', '対応モデル接続', '3-Tier Model Routing'),
    v: t('本机 Ollama / 企业内网 vLLM / 主流云端 API', 'ローカル Ollama / 社内LAN vLLM / クラウドAPI', 'Local Ollama / Corporate LAN vLLM / Cloud APIs')
  },
  {
    k: t('免提权工具链自愈', '自動環境修復', 'System Doctor Repair'),
    v: t('缺失 Git / Node / uvx 时免管理员拉取便携沙箱', '管理者不要でポータブル Git / Node / uvx を自動構築', 'Zero-admin 1-click portable MinGit / Node v22 / uvx')
  },
  {
    k: t('数据与凭据存储', 'データ・暗号化保管', 'Vault & Disk Isolation'),
    v: t('Windows DPAPI 密钥金库 + 独立 .hyn_agent/（零 C 盘污染）', 'Windows DPAPI 金庫 + .hyn_agent/ 分離保存', 'Windows DPAPI vault + isolated .hyn_agent/ directory')
  }
])
</script>

<template>
  <div class="hl-dl-page">
    <!-- 顶部极昼标题区 -->
    <section class="hl-dl-hero">
      <div class="hl-container">
        <div class="hl-dl-brand-pill hl-tabular">
          <img :src="SITE_META.brandIconUrl" alt="Helm Emblem" />
          <strong>Helm Desktop</strong>
          <span class="hl-dl-sep">·</span>
          <span>{{ SITE_META.version }} Beta ({{ SITE_META.releaseDate }})</span>
          <span class="hl-pill-tag is-ok">{{ t('零公网中转 · 100% 本地落盘', '外部クラウド中継ゼロ', 'Zero Cloud Relay') }}</span>
        </div>

        <h1 class="hl-dl-title">
          {{
            t(
              '下载 Helm 桌面端，开箱即享完整本地运行时。',
              'Helm デスクトップ版を導入。環境構築は一切不要。',
              'Download Helm Desktop. Complete local runtime inside.'
            )
          }}
        </h1>
        <p class="hl-dl-desc">
          {{
            t(
              '提供 Windows 64 位标准安装程序（.exe），内嵌 Python 3.13 FastAPI 异步引擎与全套 Office 原生处理组件。无需预装 Python 或 Node.js，支持自定义非系统盘路径安装。',
              'Python 3.13 非同期エンジンと Office 文書処理基盤をすべて内蔵した Windows 64bit 標準インストーラー（.exe）。事前セットアップ不要で任意のドライブへ導入可能。',
              'Standard Windows x64 installer (.exe) bundling the complete Python 3.13 FastAPI engine and native Office processors—no pre-installed Python or Node.js required.'
            )
          }}
        </p>
      </div>
    </section>

    <!-- 核心双栏分发与运行时规格 -->
    <section class="hl-dl-main">
      <div class="hl-container">
        <div class="hl-dl-grid">
          <!-- 左卡：.exe 分发主卡 -->
          <div class="hl-bento-card hl-dl-primary-card">
            <div class="hl-dl-card-head">
              <span class="hl-pill-tag is-accent">WINDOWS 10 / 11 (x64) INSTALLER</span>
              <span class="hl-dl-size hl-tabular">{{ SITE_META.installerSize }}</span>
            </div>

            <h2>
              {{
                t(
                  `Windows 桌面安装版 · ${SITE_META.version} Beta`,
                  `Windows 標準インストーラー · ${SITE_META.version} Beta`,
                  `Windows Desktop Installer · ${SITE_META.version} Beta`
                )
              }}
            </h2>
            <p class="hl-dl-card-sub">
              {{
                t(
                  '适合个人工作站与企业内网研发终端主力使用。支持自定义非 C 盘路径、自动创建桌面快捷方式与完整干净卸载。',
                  '個人PCおよび社内開発端末向け。非システムドライブへの導入、ショートカット作成、クリーンアンインストールに対応。',
                  'Built for personal PCs and enterprise workstations. Supports non-C: install paths, shortcuts, and clean uninstall.'
                )
              }}
            </p>

            <div class="hl-dl-cta-wrap">
              <a
                class="hl-btn hl-btn-ink hl-btn-lg hl-dl-btn-full"
                :href="SITE_META.installerUrl"
                target="_blank"
                rel="noopener"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3 5.5 10.5 4.5v7H3v-6zm8.5-1.15L21 3v8.5h-9.5V4.35zM3 12.5h7.5v7L3 18.5v-6zm8.5 0H21V21l-9.5-1.35V12.5z" />
                </svg>
                <span>{{ t(`下载 ${SITE_META.installerFileName}`, `${SITE_META.installerFileName} をダウンロード`, `Download ${SITE_META.installerFileName}`) }}</span>
              </a>

              <div class="hl-dl-verify-row hl-tabular">
                <span class="hl-dl-safe">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>100% Local &amp; Safe</span>
                </span>
                <span>·</span>
                <a class="hl-link" :href="SITE_META.virusTotalUrl" target="_blank" rel="noopener">
                  <span>VirusTotal {{ SITE_META.virusTotalScore }} {{ t('安全扫描报告', '検査レポート', 'Scan Report') }} ↗</span>
                </a>
              </div>
            </div>

            <!-- SHA-256 校验盒 -->
            <div class="hl-checksum-box hl-tabular">
              <div class="hl-checksum-head">
                <span>SHA-256 CHECKSUM</span>
                <button
                  type="button"
                  class="hl-btn hl-btn-outline hl-btn-xs"
                  @click="copyText('exe-sha', SITE_META.installerSha256)"
                >
                  {{ copiedKey === 'exe-sha' ? t('已复制哈希', 'コピー完了', 'Copied') : t('复制完整哈希', 'ハッシュをコピー', 'Copy SHA-256') }}
                </button>
              </div>
              <code class="hl-checksum-val">{{ SITE_META.installerSha256 }}</code>
            </div>
          </div>

          <!-- 右卡：内嵌运行时规格清单 -->
          <div class="hl-bento-card hl-dl-spec-card">
            <div class="hl-dl-card-head">
              <span class="hl-pill-tag">EMBEDDED RUNTIME · ZERO SETUP</span>
              <span class="hl-dl-size">Turnkey Bundle</span>
            </div>

            <h2>{{ t('内嵌运行时与系统架构规格', '内蔵ランタイム・システム仕様', 'Bundled Runtime & System Specs') }}</h2>
            <p class="hl-dl-card-sub">
              {{
                t(
                  '前后端与文档解析依赖已全部随包封装，双击图标即可进入工作台，亦可随时由 System Doctor 诊断环境。',
                  'フロントエンド・バックエンド・文書エンジンをすべて同梱。インストール後すぐに稼働を開始します。',
                  'All frontend, backend, and Office engines are pre-packaged—launch immediately after install.'
                )
              }}
            </p>

            <dl class="hl-spec-dl">
              <div v-for="sp in runtimeSpecs" :key="sp.k" class="hl-spec-row">
                <dt>{{ sp.k }}</dt>
                <dd>{{ sp.v }}</dd>
              </div>
            </dl>

            <div class="hl-spec-actions">
              <a
                class="hl-btn hl-btn-tonal hl-btn-sm"
                :href="`${prefix}/guide/getting-started`"
                @click.prevent="navigate(`${prefix}/guide/getting-started`)"
              >
                <span>{{ t('阅读 3 分钟上手指南', '3分クイックスタート', '3-Minute Quick Start') }}</span>
              </a>
              <a
                class="hl-btn hl-btn-outline hl-btn-sm"
                :href="`${prefix}/architecture/overview`"
                @click.prevent="navigate(`${prefix}/architecture/overview`)"
              >
                <span>{{ t('6 卷工程架构白皮书', '技術白書（全6章）', '6-Vol Whitepaper') }}</span>
              </a>
            </div>
          </div>
        </div>

        <!-- 三步物理级离线安全自检协议 -->
        <div class="hl-audit-block">
          <div class="hl-sec-head">
            <p class="hl-eyebrow">{{ t('零信任自检协议', 'ゼロトラスト検証プロトコル', 'Zero-Trust Audit Protocol') }}</p>
            <h2 class="hl-sec-title">
              {{
                t(
                  '面向企业安全审查的三步离线自检指南',
                  '情報セキュリティ部門向け：3ステップ安全性検証',
                  'Three-step verification for enterprise security teams'
                )
              }}
            </h2>
          </div>

          <div class="hl-audit-grid">
            <article v-for="item in auditSteps" :key="item.key" class="hl-bento-card hl-audit-card">
              <div class="hl-audit-top">
                <span class="hl-audit-idx hl-tabular">{{ item.num }}</span>
                <span class="hl-audit-tag">{{ item.tag }}</span>
              </div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.desc }}</p>
              <div class="hl-cmd-bar">
                <code>{{ item.cmd }}</code>
                <button
                  type="button"
                  class="hl-cmd-copy"
                  @click="copyText(item.key, item.cmd)"
                >
                  {{ copiedKey === item.key ? t('已复制', '済', 'Copied') : t('复制', 'コピー', 'Copy') }}
                </button>
              </div>
            </article>
          </div>
        </div>

        <!-- 社区支持与私人订制联系带 -->
        <div class="hl-dl-comm-strip">
          <div class="hl-dl-comm-intro">
            <span class="hl-pill-tag is-ok">{{ t('内测痛点免费共创', 'ベータ無償共創計画', 'Free Beta Co-Creation') }}</span>
            <h3>
              {{
                t(
                  '遇到安装或使用问题？欢迎进群交流，高票行业痛点免费为你开发',
                  '導入サポート・無償機能リクエスト・個別カスタム開発窓口',
                  'Need help or a custom workflow? Reach out anytime'
                )
              }}
            </h3>
            <p>
              {{
                t(
                  '符合「行业共性、边界清晰、公开内置」标准的痛点需求将按投票免费开发进下一版；涉及商业机密或紧急专属交付请发送邮件一对一联系。',
                  '業界共通の課題はコミュニティ投票順で無償実装します。社外秘・緊急の個別カスタム開発はメールにて個別にご相談ください。',
                  'Common industry pain points are built into official releases for free; urgent or confidential custom requirements are available via email.'
                )
              }}
            </p>
          </div>

          <div class="hl-dl-comm-cards">
            <div class="hl-mini-comm">
              <span>Discord</span>
              <code>{{ SITE_META.discordUrl }}</code>
              <a class="hl-btn hl-btn-ink hl-btn-xs" :href="SITE_META.discordUrl" target="_blank" rel="noopener">
                {{ t('加入频道 ↗', '参加 ↗', 'Join ↗') }}
              </a>
            </div>

            <div class="hl-mini-comm">
              <span>{{ t('QQ 交流群', 'QQ グループ', 'QQ Group') }}</span>
              <code class="hl-tabular">{{ SITE_META.qqGroup }}</code>
              <button type="button" class="hl-btn hl-btn-tonal hl-btn-xs" @click="copyText('dl-qq', SITE_META.qqGroup)">
                {{ copiedKey === 'dl-qq' ? t('已复制', '完了', 'Copied') : t('复制群号', 'コピー', 'Copy ID') }}
              </button>
            </div>

            <div class="hl-mini-comm">
              <span>{{ t('合作与定制邮箱', 'カスタム開発メール', 'Custom Dev Email') }}</span>
              <code>{{ SITE_META.contactEmail }}</code>
              <div class="hl-mini-actions">
                <a class="hl-btn hl-btn-ink hl-btn-xs" :href="`mailto:${SITE_META.contactEmail}`">
                  {{ t('发邮件', '送信', 'Email') }}
                </a>
                <button type="button" class="hl-btn hl-btn-outline hl-btn-xs" @click="copyText('dl-mail', SITE_META.contactEmail)">
                  {{ copiedKey === 'dl-mail' ? t('已复制', '完了', 'Copied') : t('复制', 'コピー', 'Copy') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hl-dl-page {
  background-color: var(--hl-surface-alt);
  color: var(--hl-ink);
  padding-bottom: 96px;
}

.hl-dl-hero {
  background-color: var(--hl-bg);
  padding: 56px 0 48px;
  border-bottom: 1px solid var(--hl-border);
}

.hl-dl-brand-pill {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  font-size: 13px;
  color: var(--hl-ink-3);
}

.hl-dl-brand-pill img {
  width: 28px;
  height: 28px;
  border-radius: var(--hl-radius-xs);
}

.hl-dl-brand-pill strong {
  color: var(--hl-ink);
  font-weight: 650;
}

.hl-dl-sep {
  color: var(--hl-border-strong);
}

.hl-dl-title {
  margin: 0;
  max-width: 840px;
  font-size: clamp(30px, 4vw, 48px);
  font-weight: 700;
  line-height: 1.14;
  letter-spacing: -0.03em;
  text-wrap: balance;
  color: var(--hl-ink);
}

.hl-dl-desc {
  margin: 16px 0 0;
  max-width: 64ch;
  font-size: 16px;
  line-height: 1.64;
  color: var(--hl-ink-3);
}

.hl-dl-main {
  padding-top: 40px;
}

.hl-dl-grid {
  display: grid;
  grid-template-columns: 1.08fr 0.92fr;
  gap: 20px;
}

.hl-dl-primary-card,
.hl-dl-spec-card {
  padding: 32px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.hl-dl-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 18px;
}

.hl-dl-size {
  font-family: var(--font-mono);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--hl-ink-3);
}

.hl-dl-primary-card h2,
.hl-dl-spec-card h2 {
  margin: 0 0 10px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--hl-ink);
}

.hl-dl-card-sub {
  margin: 0 0 24px;
  font-size: 14.5px;
  line-height: 1.62;
  color: var(--hl-ink-3);
}

.hl-dl-cta-wrap {
  margin-bottom: 24px;
}

.hl-dl-btn-full {
  width: 100%;
}

.hl-dl-verify-row {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px 10px;
  font-size: 12.5px;
  color: var(--hl-ink-4);
}

.hl-dl-safe {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  color: var(--hl-ok);
}

.hl-checksum-box {
  margin-top: auto;
  padding: 16px 18px;
  border-radius: var(--hl-radius-md);
  background-color: var(--hl-surface-alt);
  border: 1px solid var(--hl-border);
}

.hl-checksum-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 650;
  color: var(--hl-ink-4);
}

.hl-checksum-val {
  display: block;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.5;
  word-break: break-all;
  color: var(--hl-ink-2);
}

/* 运行时规格定义列表 */
.hl-spec-dl {
  margin: 0 0 24px;
  border-top: 1px solid var(--hl-border);
}

.hl-spec-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding: 11px 0;
  border-bottom: 1px solid var(--hl-border);
  font-size: 13.5px;
}

.hl-spec-row dt {
  font-weight: 600;
  color: var(--hl-ink);
  flex-shrink: 0;
}

.hl-spec-row dd {
  margin: 0;
  text-align: right;
  color: var(--hl-ink-3);
}

.hl-spec-actions {
  margin-top: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 三步安全验证 */
.hl-audit-block {
  margin-top: 64px;
}

.hl-audit-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.hl-audit-card {
  padding: 26px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.hl-audit-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 14px;
}

.hl-audit-idx {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--hl-accent);
}

.hl-audit-tag {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--hl-ink-4);
}

.hl-audit-card h3 {
  margin: 0 0 10px;
  font-size: 16.5px;
  font-weight: 650;
  line-height: 1.35;
  color: var(--hl-ink);
}

.hl-audit-card p {
  margin: 0 0 18px;
  font-size: 13.5px;
  line-height: 1.62;
  color: var(--hl-ink-3);
}

.hl-cmd-bar {
  margin-top: auto;
  padding: 10px 12px;
  border-radius: var(--hl-radius-sm);
  background-color: var(--hl-pro-code);
  color: var(--hl-pro-text-2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.hl-cmd-bar code {
  font-family: var(--font-mono);
  font-size: 11.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.hl-cmd-copy {
  height: 24px;
  padding: 0 10px;
  border-radius: var(--hl-radius-pill);
  border: 1px solid var(--hl-pro-border-strong);
  background-color: var(--hl-pro-surface);
  color: var(--hl-pro-text);
  font-size: 11px;
  font-weight: 500;
  flex-shrink: 0;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.hl-cmd-copy:hover {
  background-color: var(--hl-pro-surface-2);
}

/* 底部社区条 */
.hl-dl-comm-strip {
  margin-top: 56px;
  padding: 32px;
  border-radius: var(--hl-radius-xl);
  background-color: var(--hl-surface);
  border: 1px solid var(--hl-border-soft);
  box-shadow: var(--hl-shadow-bento);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hl-dl-comm-intro h3 {
  margin: 10px 0 6px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--hl-ink);
}

.hl-dl-comm-intro p {
  margin: 0;
  font-size: 14px;
  line-height: 1.62;
  color: var(--hl-ink-3);
  max-width: 72ch;
}

.hl-dl-comm-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.hl-mini-comm {
  padding: 16px 18px;
  border-radius: var(--hl-radius-lg);
  background-color: var(--hl-surface-alt);
  border: 1px solid var(--hl-border-soft);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
}

.hl-mini-comm span {
  font-size: 12px;
  font-weight: 600;
  color: var(--hl-ink-4);
}

.hl-mini-comm code {
  width: 100%;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--hl-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hl-mini-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 980px) {
  .hl-dl-grid,
  .hl-audit-grid,
  .hl-dl-comm-cards {
    grid-template-columns: 1fr;
  }

  .hl-spec-row {
    flex-direction: column;
    gap: 4px;
  }

  .hl-spec-row dd {
    text-align: left;
  }
}
</style>
