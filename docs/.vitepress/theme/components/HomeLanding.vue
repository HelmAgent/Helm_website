<script setup>
/**
 * 石澜（Stone）风格定制产品首页组件（HomeLanding.vue）。
 *
 * 职责与协作：
 * - 用于根路径 `/`（中文）、`/ja/`（日语）、`/en/`（英语）首页。
 * - 将「产品价值主张（全本地离线/数据不出网）」、「免安装浏览器交互沙盒（ProductPlayground）」与「5 篇源码级工程架构白皮书入口」有机整合。
 * - 支持实机演示视频槽位（若用户在 `docs/public/media/hero-demo.mp4` 放入录屏，可一键切换观看高清视频）。
 */
import { ref, computed } from 'vue'
import { SITE_META } from '../siteData.js'
import ProductPlayground from './ProductPlayground.vue'

const props = defineProps({
  lang: {
    type: String,
    default: 'zh'
  }
})

// 首屏展示模式：'interactive'（默认免安装交互沙盒） | 'video'（实机录屏视频槽位）
const showcaseTab = ref('interactive')
const videoLoadError = ref(false)

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

const corePillars = computed(() => [
  {
    tag: '01 · PRIVACY & LOCAL LLM',
    title: tt('100% 数据不出网 · 原生适配 Ollama 与企业内网', '100% ローカル完結 · Ollama＆社内LANモデルにネイティブ対応', '100% Local Data · Native Ollama & Enterprise LAN'),
    desc: tt(
      '内置 127.0.0.1 FastAPI 引擎，免密钥直连本机 Ollama 或企业内网私有部署网关（vLLM / SGLang / OneAPI）。会话、记忆、知识库与文档快照全部保存在本机可控目录，Electron 主进程日志自动擦除 API Key。',
      '127.0.0.1 ローカル FastAPI エンジンを内蔵し、ローカル Ollama や社内LAN（vLLM / SGLang / OneAPI）へAPIキー不要で直結。会話・メモリ・知識ベースはすべてローカル保存され、ログ出力時には認証情報を自動マスクします。',
      'Embedded 127.0.0.1 FastAPI backend connects directly to local Ollama or intranet gateways (vLLM / SGLang / OneAPI). All sessions, memories, and snapshots stay on disk with automatic log sanitization.'
    ),
    codeRef: 'app/catalog/models.py · main.js',
    link: `${prefix.value}/architecture/overview`
  },
  {
    tag: '02 · LONG-HORIZON ENGINE (P0–P3)',
    title: tt('数小时无人值守长程自治 · 影子 Git 检查点', '数時間の無人自律稼働 · 非侵襲シャドウGitチェックポイント', 'Multi-Hour Unattended Autonomy & Shadow Git Checkpoints'),
    desc: tt(
      '通过 TurnHub 单调递增 seq 环形缓冲与 stream_reset 重试回滚保障流式高可靠；配备 StuckDetector L2 自省防死循环、4 档运行中实时切换权限，以及不触碰用户 HEAD 与暂存区的影子 Git 检查点，随时一键回滚。',
      'TurnHub の単調増加 seq バッファと stream_reset により通信断やLLM再試行に完全対応。StuckDetector L2 ループ防止、4段階のリアルタイム権限切替、作業ブランチを一切汚さないシャドウGitチェックポイントを搭載。',
      'Powered by TurnHub monotonic seq replay, stream_reset on retry, StuckDetector L2 anti-loop notices, 4-tier live permission switching, and non-invasive Shadow Git Checkpoints.'
    ),
    codeRef: 'turn_hub.py · stuck_detector.py · git_checkpoints.py',
    link: `${prefix.value}/architecture/long-running`
  },
  {
    tag: '03 · MULTI-AGENT & WORKTREES',
    title: tt('主从多智能体团队 · Git Worktree 物理隔离并发', 'マルチエージェントチーム · Git Worktree による物理分離並列開発', 'Multi-Agent Team with Git Worktree Isolation'),
    desc: tt(
      '主代理（Lead）可招募最多 4 名常驻队友（Teammates），每位队友绑定独立的 Git Worktree 工作树并行编码，通过异步内存收件箱汇报结果，并强制执行「计划未批准前禁止写文件与跑命令」的安全门禁。',
      'リードエージェントが最大4名の常駐メイトを統括。各メイトは独立した Git Worktree 上で並列実装を行い、非同期メールボックスで連携。「計画承認前は書込・コマンド実行禁止」の安全ゲートを徹底しています。',
      'Lead agent coordinates up to 4 resident teammates working in isolated Git Worktrees via async inbox messaging, enforced by a strict read-only gate until plans are approved.'
    ),
    codeRef: 'team_runtime.py · team_worktree.py',
    link: `${prefix.value}/architecture/multi-agent-team`
  },
  {
    tag: '04 · CANVAS WORKBENCH & MEMORY',
    title: tt('WPS 级多格式工作台 · 划取「✨ AI 局部热替换」', 'WPS級ドキュメントワークベンチ · 選択範囲「✨ AI部分ホットパッチ」', 'WPS-Grade Office Workbench & Selection AI Hot-Patch'),
    desc: tt(
      '右侧分栏原生渲染并编辑 Word (.docx)、Excel (.xlsx)、PPT (.pptx)、PDF、Markdown 与 HTML。鼠标划取任意段落或单元格即浮起「✨ AI 修改」，后端精准局部写回并通过 SSE 原地无闪烁更新；配合冻结快照的双层异步记忆，保护 94%+ Prefix Cache 命中率。',
      '右ペインで docx / xlsx / pptx / pdf / md / html を高精細プレビュー＆直接編集。マウスで選択した箇所だけを「✨ AI修正」でピンポイント更新し、SSE で即座に再描画。さらに Prefix Cache を壊さない非同期2層メモリを搭載。',
      'In-app preview and editing for docx, xlsx, pptx, pdf, md, and html. Select any paragraph, cell range, or slide shape for instant SSE in-place AI patching, backed by a prefix-cache-friendly two-tier memory system.'
    ),
    codeRef: 'PreviewWorkbench.js · file_workbench.py · memory.py',
    link: `${prefix.value}/architecture/workbench`
  }
])
</script>

<template>
  <div class="stone-home">
    <!-- 首屏 Hero 区（石澜冷灰石底 #e4e8f0） -->
    <section class="hero-band">
      <div class="hero-container">
        <div class="hero-badges">
          <span class="stone-badge is-success">🔒 {{ tt('100% 本地可控 · 离线可用', '100% ローカル完結 · オフライン稼働対応', '100% Local & Offline Ready') }}</span>
          <span class="stone-badge">⏱️ {{ tt('P0–P3 长程无人值守引擎', 'P0–P3 長時間自律実行エンジン', 'P0–P3 Long-Horizon Engine') }}</span>
          <span class="stone-badge">🌿 {{ tt('Git Worktree 多智能体团队', 'Git Worktree マルチエージェント', 'Git Worktree Multi-Agent') }}</span>
          <span class="stone-badge">📄 {{ tt('Office / 代码双栖工作台', 'Office・コード直編集ワークベンチ', 'Office & Code Workbench') }}</span>
        </div>

        <h1 class="hero-title">
          {{ tt(
            '数据不出网、支持数小时无人值守的全本地自治型 Coding & Office Agent',
            '機密コードを外部に送信しない、完全ローカル対応の自律型AIコーディング＆Officeエージェント',
            'Zero Data Leakage, Multi-Hour Autonomous Desktop Coding & Office Agent'
          ) }}
        </h1>

        <p class="hero-subtitle">
          {{ tt(
            '基于 Electron + Vue 3 + FastAPI 构建。原生支持本机 Ollama 与企业内网私有大模型、本地 RAGFlow 知识库、无侵入影子 Git 检查点、Git Worktree 团队并发，以及 Word / Excel / PPT 划取局部 AI 热修改。免费下载，安装即用。',
            'Electron + Vue 3 + FastAPI 構築。ローカル Ollama・社内LANモデル直結、ローカル RAGFlow 知識ベース、作業ブランチを汚さないシャドウGitチェックポイント、Git Worktree 並列チーム、Word/Excel/PPT の選択範囲AI修正を統合。無料ダウンロード・初期設定不要。',
            'Built with Electron, Vue 3, and FastAPI. Native local Ollama & enterprise LAN LLMs, local RAGFlow knowledge base, non-invasive Shadow Git Checkpoints, Git Worktree multi-agent teams, and in-place Office AI editing.'
          ) }}
        </p>

        <div class="hero-cta-row">
          <a class="stone-btn is-primary hero-btn-lg" :href="`${prefix}/download`">
            ⬇ {{ tt(`免费下载客户端 (${SITE_META.version})`, `無料ダウンロード (${SITE_META.version})`, `Free Download (${SITE_META.version})`) }}
          </a>
          <a class="stone-btn hero-btn-lg" :href="`${prefix}/demo`">
            ▶ {{ tt('浏览器免安装交互体验', 'ブラウザで操作体験 (インストール不要)', 'Try in Browser (Zero Install)') }}
          </a>
          <a class="stone-btn hero-btn-lg" :href="`${prefix}/architecture/overview`">
            📐 {{ tt('阅读工程架构白皮书', '技術アーキテクチャ白書を読む', 'Read Architecture Whitepaper') }}
          </a>
        </div>

        <!-- 首屏交互沙盒 / 实机视频双模式切换 -->
        <div class="hero-showcase-bar">
          <button
            type="button"
            class="showcase-switch-btn"
            :class="{ 'is-active': showcaseTab === 'interactive' }"
            @click="showcaseTab = 'interactive'"
          >
            🖱️ {{ tt('实时可点击交互沙盒（石澜 UI 1:1 复刻）', '対話型Webサンドボックス（クリックして操作可能）', 'Interactive Web Sandbox (1:1 Stone UI)') }}
          </button>
          <button
            type="button"
            class="showcase-switch-btn"
            :class="{ 'is-active': showcaseTab === 'video' }"
            @click="showcaseTab = 'video'"
          >
            🎬 {{ tt('实机录屏演示视频 (Demo Video)', '実機デモ動画 (Demo Video)', 'Real Screen Recording (Demo Video)') }}
          </button>
        </div>

        <div v-if="showcaseTab === 'interactive'">
          <ProductPlayground :lang="lang" />
        </div>
        <div v-else class="hero-video-box">
          <video
            v-if="!videoLoadError"
            class="hero-video-player"
            :src="SITE_META.demoVideoUrl"
            :poster="SITE_META.demoPosterUrl"
            controls
            playsinline
            @error="videoLoadError = true"
          ></video>
          <div v-else class="hero-video-placeholder">
            <div class="stone-badge">{{ tt('实机视频槽位已就绪', '実機動画スロット準備完了', 'Demo Video Slot Ready') }}</div>
            <h3>{{ tt('将实机录屏放入 docs/public/media/hero-demo.mp4 即可自动播放', 'docs/public/media/hero-demo.mp4 に動画を配置すると自動再生されます', 'Place your recording at docs/public/media/hero-demo.mp4 to auto-enable') }}</h3>
            <p>
              {{ tt(
                '在放入视频前，访客与面试官可直接使用「实时可点击交互沙盒」完整体验离线重构、影子检查点与文档划取 AI 修改。',
                '動画配置前でも、「対話型Webサンドボックス」タブにてオフライン改修・シャドウチェックポイント・Office部分AI修正をそのまま体験いただけます。',
                'Until you drop in the MP4 file, visitors can use the Interactive Web Sandbox tab to test all core workflows.'
              ) }}
            </p>
            <button type="button" class="stone-btn is-primary" @click="showcaseTab = 'interactive'">
              {{ tt('切回交互沙盒体验', '対話型サンドボックスに戻る', 'Back to Interactive Sandbox') }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 四大核心工程支柱 -->
    <section class="pillars-section">
      <div class="section-container">
        <div class="section-head">
          <span class="stone-badge">{{ tt('核心架构与差异化能力', 'コアアーキテクチャと独自性', 'CORE ARCHITECTURE & DIFFERENTIATORS') }}</span>
          <h2 class="section-title">
            {{ tt('不止于“调 API 对话”：专为企业级隐私与复杂长任务工程打造', '単なるAPIラッパーではない：機密保護と長時間自律エンジニアリングのための設計', 'Beyond Thin API Wrappers: Engineered for Local Privacy & Long-Horizon Tasks') }}
          </h2>
        </div>

        <div class="pillars-grid">
          <div v-for="item in corePillars" :key="item.tag" class="pillar-card">
            <div class="pillar-tag">{{ item.tag }}</div>
            <h3 class="pillar-title">{{ item.title }}</h3>
            <p class="pillar-desc">{{ item.desc }}</p>
            <div class="pillar-foot">
              <code class="pillar-code">{{ item.codeRef }}</code>
              <a class="pillar-link" :href="item.link">
                {{ tt('查看源码级设计 →', '設計詳細を見る →', 'Read Deep Dive →') }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 对比表：为什么日本与高安全企业需要 HYN Agent -->
    <section class="compare-section">
      <div class="section-container">
        <div class="section-head">
          <span class="stone-badge is-success">{{ tt('安全合规与工程能力对比', 'セキュリティ・機能比較', 'SECURITY & CAPABILITY COMPARISON') }}</span>
          <h2 class="section-title">
            {{ tt('HYN Agent vs. 传统云端 Coding Agent', 'HYN Agent と従来のクラウド型 Coding Agent の比較', 'HYN Agent vs. Cloud-Only Coding Agents') }}
          </h2>
        </div>

        <div class="compare-table-wrap">
          <table class="compare-table">
            <thead>
              <tr>
                <th>{{ tt('评估维度', '評価項目', 'Dimension') }}</th>
                <th class="is-highlight">HYN Agent ({{ tt('本产品', '本プロダクト', 'This Product') }})</th>
                <th>{{ tt('常规云端 Agent / 简单套壳工具', '一般的なクラウド型 / 簡易エージェント', 'Typical Cloud / Wrapper Agents') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>{{ tt('代码与文档隐私边界', '機密コード・文書の保護', 'Code & Document Privacy') }}</strong></td>
                <td class="is-highlight"><strong>{{ tt('100% 本地落盘，支持拔网线 + Ollama / 企业内网 vLLM 运行', '100% ローカル保存。完全オフライン（Ollama / 社内LAN）稼働可能', '100% local disk storage; runs completely offline with Ollama / LAN vLLM') }}</strong></td>
                <td>{{ tt('依赖外部云端中转服务器，企业核心源码存在外泄合规风险', '外部クラウドサーバー経由が必須で、社内規定により導入困難な場合が多い', 'Requires cloud relay servers; blocked by strict enterprise security policies') }}</td>
              </tr>
              <tr>
                <td><strong>{{ tt('长时任务防崩与恢复 (P0–P3)', '長時間実行の信頼性・復旧', 'Long-Horizon Reliability') }}</strong></td>
                <td class="is-highlight"><strong>{{ tt('TurnHub 单调 seq 重连 + StuckDetector 防死循环 + 崩溃断点自动续跑', 'TurnHub seq 再接続 + ループ自動検知(L1/L2) + クラッシュ後の自動再開', 'TurnHub seq replay + StuckDetector anti-loop + crash auto-resume') }}</strong></td>
                <td>{{ tt('网络抖动即断流，容易陷入重复报错工具调用死循环', '通信瞬断で処理が失われやすく、同一エラーの無限ループに陥りやすい', 'Drops state on network hiccups; prone to infinite tool-error loops') }}</td>
              </tr>
              <tr>
                <td><strong>{{ tt('代码安全回滚机制', 'コード変更のロールバック', 'Safe Code Rollback') }}</strong></td>
                <td class="is-highlight"><strong>{{ tt('无侵入影子 Git 检查点（私有 refs，绝不污染用户 HEAD 与暂存区）', '非侵襲シャドウGitチェックポイント（作業ブランチ・Indexを一切汚さない）', 'Non-invasive Shadow Git Checkpoints (zero pollution to user HEAD/index)') }}</strong></td>
                <td>{{ tt('直接改乱用户工作区，或乱建临时 git commit 污染提交历史', '作業ツリーを直接書き換えるか、不要なコミットで履歴を汚す', 'Overwrites working tree directly or pollutes git commit history') }}</td>
              </tr>
              <tr>
                <td><strong>{{ tt('多智能体并发冲突隔离', 'マルチエージェント競合分離', 'Multi-Agent Concurrency') }}</strong></td>
                <td class="is-highlight"><strong>{{ tt('基于 Git Worktree 物理隔离 + 计划批准前强制只读门禁', 'Git Worktree による物理分離 + 計画承認前の読取専用ゲート', 'Physical Git Worktree isolation + read-only gate before plan approval') }}</strong></td>
                <td>{{ tt('多个子代理同时读写同一目录，导致文件互相覆盖损坏', '複数エージェントが同一ディレクトリを同時編集しファイルが破損', 'Subagents overwrite each other in the same working directory') }}</td>
              </tr>
              <tr>
                <td><strong>{{ tt('Office 富文档协同交付', 'Office文書の直接プレビュー・編集', 'Office Document Workbench') }}</strong></td>
                <td class="is-highlight"><strong>{{ tt('内置 docx / xlsx / pptx / pdf 工作台 + 鼠标划取局部 AI 热更新', 'docx / xlsx / pptx / pdf 高精細プレビュー＋選択範囲のピンポイントAI更新', 'Built-in docx/xlsx/pptx/pdf workbench + mouse-selection in-place AI patch') }}</strong></td>
                <td>{{ tt('仅能输出纯文本或代码，修改 PPT/Word 需全量重新生成', 'コード・テキストのみで、Office文書の部分修正は不可', 'Text/code only; cannot preview or patch specific Office elements') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- 底部：致日本企业招聘官与技术面试官 + 快速跳转 -->
    <section class="recruiter-section">
      <div class="section-container">
        <div class="recruiter-card">
          <div class="recruiter-left">
            <span class="stone-badge">🎯 {{ tt('致招聘负责人与技术面试官 · 採用ご担当者様へ', '採用ご担当者様・エンジニア面接官の方へ', 'FOR RECRUITERS & ENGINEERING INTERVIEWERS') }}</span>
            <h3>
              {{ tt(
                '为什么提供完整架构白皮书？如何在面试中审阅源码？',
                'クローズドソースでの公開理由と、面接での全ソースコード・実機ライブデモのご案内',
                'Why an Architecture Whitepaper & How to Review Full Source Code in Interviews'
              ) }}
            </h3>
            <p>
              {{ tt(
                'HYN Agent 作为完整的桌面端独立产品进行构建与分发，目前免费提供安装包下载，暂未将完整仓库直接公开。为了便于技术面试官全面评估本项目的 Agent 架构深度与代码质量，本站「工程架构白皮书」完整公开了核心模块状态机、数据结构与防踩坑设计。在视频面试环节，我随时准备通过屏幕共享（画面共有）进行断网实机演示，并现场打开 IDE 展示 Electron + Vue 3 + FastAPI 全部源码及 86+ 项自动化单元测试。',
                'HYN Agent は独立したデスクトップ製品としてパッケージング・無料配布しており、現時点ではリポジトリ全体の一般公開を控えております。技術面接官の皆様にアーキテクチャの深さと実装品質を正確に評価いただけるよう、本サイトの「技術アーキテクチャ白書」にて内部状態マシン・データ契約・設計判断を詳細に公開しています。オンライン面接では、画面共有（Live Demo）による完全オフライン実機動作、および IDE 上での全ソースコード・単体テスト（86件以上）のウォークスルーをいつでも実演可能です。',
                'HYN Agent is distributed as a free standalone desktop product. To give technical interviewers complete visibility into its engineering depth without requiring installation on corporate PCs, our 5-part Whitepaper documents the exact state machines, data contracts, and edge-case handling. During remote interviews, I am ready to run a live offline demo and walk through the entire codebase and 86+ unit tests in my IDE.'
              ) }}
            </p>
          </div>
          <div class="recruiter-right">
            <a class="stone-btn is-primary" :href="`${prefix}/architecture/overview`">
              📖 {{ tt('阅读 5 篇工程架构白皮书', '技術アーキテクチャ白書 (全5章) を読む', 'Read 5-Part Whitepaper') }}
            </a>
            <a class="stone-btn" :href="`${prefix}/download`">
              ⬇ {{ tt('前往下载与 SHA-256 校验页', 'ダウンロード・SHA-256検証ページへ', 'Go to Download & SHA-256') }}
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.stone-home {
  background: #ffffff;
  color: var(--text-primary);
}

.hero-band {
  background: var(--bg-app);
  border-bottom: 1px solid var(--border-subtle);
  padding: 48px 24px 56px;
}

.hero-container,
.section-container {
  max-width: 1120px;
  margin: 0 auto;
}

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}

.hero-title {
  font-size: 32px;
  line-height: 1.3;
  font-weight: 750;
  color: var(--text-primary);
  margin: 0 0 16px;
  letter-spacing: -0.01em;
}

.hero-subtitle {
  font-size: 15.5px;
  line-height: 1.65;
  color: var(--text-secondary);
  max-width: 900px;
  margin: 0 0 24px;
}

.hero-cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 28px;
}

.hero-btn-lg {
  height: 40px;
  padding: 0 20px;
  font-size: 14px;
}

.hero-showcase-bar {
  display: inline-flex;
  gap: 6px;
  padding: 4px;
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
}

.showcase-switch-btn {
  padding: 6px 14px;
  font-size: 12.5px;
  font-weight: 600;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.showcase-switch-btn.is-active {
  background: var(--bg-selected);
  color: var(--accent);
  font-weight: 650;
}

.hero-video-box {
  margin-top: 20px;
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.hero-video-player {
  display: block;
  width: 100%;
  max-height: 560px;
  background: #1a1d27;
}

.hero-video-placeholder {
  padding: 56px 24px;
  text-align: center;
}

.hero-video-placeholder h3 {
  margin: 14px 0 8px;
  font-size: 18px;
}

.hero-video-placeholder p {
  max-width: 640px;
  margin: 0 auto 18px;
  font-size: 13.5px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.pillars-section {
  padding: 56px 24px;
  background: #ffffff;
  border-bottom: 1px solid var(--border-subtle);
}

.section-head {
  margin-bottom: 32px;
}

.section-title {
  margin: 12px 0 0;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.35;
}

.pillars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(460px, 1fr));
  gap: 20px;
}

.pillar-card {
  padding: 24px;
  background: var(--bg-hover);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pillar-tag {
  font-size: 11.5px;
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--accent);
}

.pillar-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.pillar-desc {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--text-secondary);
  flex: 1;
}

.pillar-foot {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.pillar-code {
  font-size: 11.5px;
  font-family: var(--font-mono);
  color: var(--text-tertiary);
  background: #ffffff;
  padding: 2px 8px;
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
}

.pillar-link {
  font-size: 13px;
  font-weight: 650;
  color: var(--accent);
  text-decoration: none;
}

.pillar-link:hover {
  text-decoration: underline;
}

.compare-section {
  padding: 56px 24px;
  background: var(--bg-hover);
  border-bottom: 1px solid var(--border-subtle);
}

.compare-table-wrap {
  overflow-x: auto;
}

.compare-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  font-size: 13.5px;
}

.compare-table th,
.compare-table td {
  padding: 14px 16px;
  border: 1px solid var(--border-subtle);
  text-align: left;
  line-height: 1.55;
}

.compare-table th {
  background: var(--bg-app);
  font-weight: 700;
}

.compare-table .is-highlight {
  background: var(--bg-selected);
  color: var(--text-primary);
}

.recruiter-section {
  padding: 48px 24px 64px;
  background: #ffffff;
}

.recruiter-card {
  padding: 28px;
  background: var(--bg-app);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.recruiter-left {
  flex: 1;
  min-width: 300px;
}

.recruiter-left h3 {
  margin: 12px 0 8px;
  font-size: 20px;
  font-weight: 700;
}

.recruiter-left p {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--text-secondary);
}

.recruiter-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 24px;
  }
  .pillars-grid {
    grid-template-columns: 1fr;
  }
}
</style>
