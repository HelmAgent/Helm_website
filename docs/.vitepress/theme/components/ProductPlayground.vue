<script setup>
/**
 * 免安装网页版交互式产品工作台组件（ProductPlayground.vue）。
 *
 * 职责与协作：
 * - 严格按 `prototypes/hyn-stone.html` 与 `hyn_agent_frontend/styles/tokens.css` 1:1 还原石澜桌面界面。
 * - 语言隔离：中文模式下不出现任何日语词汇或日文字体名；日语模式下文件名、代码注释与 UI 文案全部采用地道日本软件工程表达。
 */
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps({
  lang: {
    type: String,
    default: 'zh'
  },
  standalone: {
    type: Boolean,
    default: false
  }
})

const activeScenario = ref('longrun')
const selectedCheckpointIdx = ref(1)
const aiPatchApplied = ref(false)
const matePlanApproved = ref(false)
const permMode = ref('full_auto')
const showPermMenu = ref(false)
const showContextPopover = ref(false)
const showWorkbench = ref(true)
const expandedTools = ref({ t1: false, t2: true })

const isAutoPlaying = ref(false)
let autoPlayTimer = null

function tt(zh, ja, en) {
  if (props.lang === 'ja') return ja
  if (props.lang === 'en') return en
  return zh
}

function selectScenario(key) {
  stopAutoPlay()
  activeScenario.value = key
  showWorkbench.value = true
  showPermMenu.value = false
  showContextPopover.value = false
}

function toggleAutoPlay() {
  if (isAutoPlaying.value) {
    stopAutoPlay()
    return
  }
  isAutoPlaying.value = true
  let step = 0
  const sequence = [
    () => {
      activeScenario.value = 'longrun'
      selectedCheckpointIdx.value = 0
      expandedTools.value.t1 = true
    },
    () => {
      selectedCheckpointIdx.value = 1
    },
    () => {
      activeScenario.value = 'workbench'
      aiPatchApplied.value = false
    },
    () => {
      aiPatchApplied.value = true
    },
    () => {
      activeScenario.value = 'team'
      matePlanApproved.value = false
    },
    () => {
      matePlanApproved.value = true
    }
  ]
  sequence[0]()
  autoPlayTimer = setInterval(() => {
    step = (step + 1) % sequence.length
    sequence[step]()
  }, 2800)
}

function stopAutoPlay() {
  isAutoPlaying.value = false
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

onUnmounted(() => {
  stopAutoPlay()
})

function toggleTool(id) {
  expandedTools.value[id] = !expandedTools.value[id]
}

function triggerAiSelectionPatch() {
  aiPatchApplied.value = !aiPatchApplied.value
}

function changePermMode(nextMode) {
  permMode.value = nextMode
  showPermMenu.value = false
}

const samplePptName = computed(() =>
  tt('架构评审汇报_2026.pptx', 'アーキテクチャ審査資料_2026.pptx', 'Architecture_Review_2026.pptx')
)

const sampleFontName = computed(() =>
  tt('微软雅黑 UI ▾', 'Yu Gothic UI ▾', 'Segoe UI ▾')
)

const permOptions = computed(() => [
  {
    id: 'ask_all',
    code: 'ASK_ALL',
    label: tt('全部询问', '毎回確認', 'Ask All'),
    desc: tt('所有写文件与命令均需人工确认', 'ファイル書込・コマンド実行を毎回確認', 'Confirm every file write and shell command')
  },
  {
    id: 'auto_edit',
    code: 'AUTO_EDIT',
    label: tt('自动编辑', '自動編集', 'Auto Edit'),
    desc: tt('工作区内改文件与只读命令自动放行', 'ワークスペース内編集と読取専用コマンドを自動許可', 'Auto-approve workspace edits & read-only commands')
  },
  {
    id: 'default',
    code: 'DEFAULT',
    label: tt('智能确认', 'スマート確認', 'Smart Default'),
    desc: tt('常规操作放行，破坏性命令需确认', '通常操作は自動許可し、破壊的コマンドのみ確認', 'Confirm only destructive commands')
  },
  {
    id: 'full_auto',
    code: 'FULL_AUTO',
    label: tt('完全放行', '完全自動 (無人稼働)', 'Full Auto'),
    desc: tt('数小时无人值守，仅硬拒绝越界与高危指令', '数時間の無人実行。領域外・危険操作はシステムが強制遮断', 'Unattended long-horizon run with hard-deny guardrails')
  }
])

const currentPermObj = computed(() => {
  return permOptions.value.find((p) => p.id === permMode.value) || permOptions.value[3]
})

const checkpoints = computed(() => [
  {
    id: 'CP-01',
    step: 'Step 04',
    time: '14:02:11',
    ref: 'refs/hyn/checkpoints/sess_8a9f @ 3c91a0b',
    summary: tt('流式重试回滚 (stream_reset) 接入', 'ストリーム再試行時の自動ロールバック (stream_reset) 実装', 'Integrate stream_reset rollback on LLM retry'),
    files: 3,
    diff: tt(
      `--- a/app/services/llm_retry.py\n+++ b/app/services/llm_retry.py\n@@ -42,6 +42,10 @@ async def stream_with_retry(policy: RetryPolicy):\n+    # 网关抖动重试前发送 stream_reset 清空前端半截作废输出\n+    await turn_hub.emit(session_id, {"type": "stream_reset", "attempt": attempt})\n+    await asyncio.sleep(policy.backoff_for(attempt))`,
      `--- a/app/services/llm_retry.py\n+++ b/app/services/llm_retry.py\n@@ -42,6 +42,10 @@ async def stream_with_retry(policy: RetryPolicy):\n+    # リトライ前に stream_reset を送出し、途中の不完全な出力を破棄\n+    await turn_hub.emit(session_id, {"type": "stream_reset", "attempt": attempt})\n+    await asyncio.sleep(policy.backoff_for(attempt))`,
      `--- a/app/services/llm_retry.py\n+++ b/app/services/llm_retry.py\n@@ -42,6 +42,10 @@ async def stream_with_retry(policy: RetryPolicy):\n+    # Emit stream_reset before retry to discard partial dirty output\n+    await turn_hub.emit(session_id, {"type": "stream_reset", "attempt": attempt})\n+    await asyncio.sleep(policy.backoff_for(attempt))`
    )
  },
  {
    id: 'CP-02',
    step: 'Step 11',
    time: '14:18:45',
    ref: 'refs/hyn/checkpoints/sess_8a9f @ 7f4e21d',
    summary: tt('StuckDetector L2 自省注入并通过 86 项单测', 'StuckDetector L2 内省注入・単体テスト全86件パス', 'StuckDetector L2 retrospective & 86 unit tests passed'),
    files: 5,
    diff: tt(
      `--- a/app/services/stuck_detector.py\n+++ b/app/services/stuck_detector.py\n@@ -88,4 +88,8 @@ class StuckDetector:\n+    if repeat_count >= 3:\n+        # 注入 L2 自省通知，强制停止重复报错调用并切换排查策略\n+        return StepObservation(level="L2", inject_notice=L2_RETROSPECTIVE_NOTICE)`,
      `--- a/app/services/stuck_detector.py\n+++ b/app/services/stuck_detector.py\n@@ -88,4 +88,8 @@ class StuckDetector:\n+    if repeat_count >= 3:\n+        # 同一エラー反復時に L2 内省プロンプトを注入し、別アプローチへ誘導\n+        return StepObservation(level="L2", inject_notice=L2_RETROSPECTIVE_NOTICE)`,
      `--- a/app/services/stuck_detector.py\n+++ b/app/services/stuck_detector.py\n@@ -88,4 +88,8 @@ class StuckDetector:\n+    if repeat_count >= 3:\n+        # Inject L2 retrospective notice to break repeated tool failures\n+        return StepObservation(level="L2", inject_notice=L2_RETROSPECTIVE_NOTICE)`
    )
  }
])

watch(
  () => props.lang,
  () => {
    showPermMenu.value = false
    showContextPopover.value = false
  }
)
</script>

<template>
  <div class="pg-frame" :class="{ 'is-standalone': standalone }">
    <div class="pg-control-deck">
      <div class="pg-deck-left">
        <span class="pg-deck-kicker">INTERACTIVE WORKBENCH</span>
        <div class="pg-scenario-pills">
          <button
            type="button"
            class="pg-pill-btn"
            :class="{ 'is-active': activeScenario === 'longrun' }"
            @click="selectScenario('longrun')"
          >
            <span class="pg-pill-num">01</span>
            <span>{{ tt('离线长程自治 & 影子 Git 检查点', 'オフライン長時間自律稼働＆シャドウGitチェックポイント', 'Offline Long-Horizon & Shadow Checkpoints') }}</span>
          </button>
          <button
            type="button"
            class="pg-pill-btn"
            :class="{ 'is-active': activeScenario === 'workbench' }"
            @click="selectScenario('workbench')"
          >
            <span class="pg-pill-num">02</span>
            <span>{{ tt('WPS 级文档工作台 & 划取 AI 热替换', 'Office高精細ワークベンチ＆選択範囲AIインプレース編集', 'Office Workbench & Selection AI Hot-Patch') }}</span>
          </button>
          <button
            type="button"
            class="pg-pill-btn"
            :class="{ 'is-active': activeScenario === 'team' }"
            @click="selectScenario('team')"
          >
            <span class="pg-pill-num">03</span>
            <span>{{ tt('Git Worktree 多智能体团队并发', 'Git Worktree マルチエージェント並列開発', 'Git Worktree Multi-Agent Team') }}</span>
          </button>
        </div>
      </div>

      <div class="pg-deck-right">
        <button
          type="button"
          class="pg-autoplay-btn"
          :class="{ 'is-playing': isAutoPlaying }"
          @click="toggleAutoPlay"
        >
          <span class="pg-play-indicator"></span>
          <span>{{ isAutoPlaying ? tt('停止自动巡航', '自動再生を停止', 'Stop Auto-Tour') : tt('自动巡航演示', '自動ツアー再生', 'Auto-Play Tour') }}</span>
        </button>
      </div>
    </div>

    <div class="pg-window-titlebar">
      <div class="pg-win-dots">
        <span></span><span></span><span></span>
      </div>
      <div class="pg-win-caption">
        <img class="pg-win-helm" src="/logo.svg" alt="Helm" />
        <span>Helm Desktop</span>
        <span class="pg-win-sep">—</span>
        <code>127.0.0.1:8001 (FastAPI Embedded)</code>
        <span class="pg-win-badge">{{ tt('完全离线就绪', '完全オフライン稼働中', 'AIR-GAPPED READY') }}</span>
      </div>
      <div class="pg-win-meta">Electron 44 · Vue 3.5 · Python 3.13</div>
    </div>

    <div class="pg-viewport-scroll">
      <div class="stone-window">
        <aside class="stone-sidebar">
          <div class="stone-brand">
            <img class="stone-helm-icon" src="/logo.svg" alt="Helm" />
            <div>
              <div class="stone-word">HELM</div>
              <div class="stone-workspace">local · core-engine</div>
            </div>
          </div>

          <nav class="stone-nav">
            <button
              type="button"
              class="stone-nav-item"
              :class="{ 'is-active': activeScenario === 'longrun' }"
              @click="selectScenario('longrun')"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                <path d="M8 3.2v9.6M3.2 8h9.6" />
              </svg>
              <span>{{ tt('长程会话', '自律セッション', 'Autonomous Session') }}</span>
            </button>

            <button
              type="button"
              class="stone-nav-item"
              :class="{ 'is-active': activeScenario === 'workbench' }"
              @click="selectScenario('workbench')"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3.2 3.2h6.2v9.6H3.2zM9.4 3.2h3.4v9.6H9.4" />
              </svg>
              <span>{{ tt('文档与知识库', '文書＆ナレッジベース', 'Docs & Knowledge') }}</span>
            </button>

            <button
              type="button"
              class="stone-nav-item"
              :class="{ 'is-active': activeScenario === 'team' }"
              @click="selectScenario('team')"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 4.2h10M3 8h10M3 11.8h6.5" />
              </svg>
              <span>{{ tt('团队协同 (Worktree)', 'チーム協働 (Worktree)', 'Team Worktrees') }}</span>
              <span class="stone-nav-tag">3</span>
            </button>

            <button type="button" class="stone-nav-item" @click="selectScenario('longrun')">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6">
                <circle cx="8" cy="8" r="5.2" />
                <path d="M8 5.1V8l2 1.4" stroke-linecap="round" />
              </svg>
              <span>{{ tt('定时自动化 (Cron)', 'スケジュール自動化', 'Automations') }}</span>
            </button>

            <button type="button" class="stone-nav-item" @click="selectScenario('workbench')">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                <path d="M3 4.5h10M3 8h10M3 11.5h10" />
                <circle cx="6" cy="4.5" r="1.3" fill="#ffffff" />
                <circle cx="10.5" cy="8" r="1.3" fill="#ffffff" />
              </svg>
              <span>{{ tt('定制 (MCP / Skills)', '拡張機能 (MCP / Skills)', 'MCP & Skills') }}</span>
            </button>
          </nav>

          <div class="stone-recent-header">{{ tt('近日会话', '最近のセッション', 'RECENT SESSIONS') }}</div>
          <div class="stone-recent-list">
            <div
              class="stone-recent-item"
              :class="{ 'is-active': activeScenario === 'longrun' }"
              @click="selectScenario('longrun')"
            >
              <div class="stone-recent-title">{{ tt('离线重构重试与死循环检测', 'リトライ制御・ループ検知の改修', 'Offline retry & stuck guard') }}</div>
              <div class="stone-recent-meta">Ollama · qwen2.5-coder:32b</div>
            </div>
            <div
              class="stone-recent-item"
              :class="{ 'is-active': activeScenario === 'workbench' }"
              @click="selectScenario('workbench')"
            >
              <div class="stone-recent-title">{{ tt('安全合规评审 PPT 与局部润色', '審査資料PPT作成と選択範囲AI編集', 'Security Review PPTX & Patch') }}</div>
              <div class="stone-recent-meta">RAGFlow · Local Evidence</div>
            </div>
            <div
              class="stone-recent-item"
              :class="{ 'is-active': activeScenario === 'team' }"
              @click="selectScenario('team')"
            >
              <div class="stone-recent-title">{{ tt('多队友并行迁移权限引擎 P3', '権限エンジンP3の並列実装', 'Parallel P3 permission team') }}</div>
              <div class="stone-recent-meta">Lead + 3 Worktrees</div>
            </div>
          </div>

          <div class="stone-sidebar-footer">
            <span class="stone-live-dot"></span>
            <span class="stone-footer-text">{{ tt('本机后端 · 127.0.0.1 零外发', 'ローカル完結 · 外部送信ゼロ', 'Local · Zero Egress') }}</span>
          </div>
        </aside>

        <main class="stone-main">
          <header class="stone-main-header">
            <div class="stone-main-title">
              <span v-if="activeScenario === 'longrun'">{{ tt('离线重构重试与死循环检测模块', 'リトライ制御・ループ検知モジュールのオフライン改修', 'Offline Refactor: Retry & StuckDetector') }}</span>
              <span v-else-if="activeScenario === 'workbench'">{{ tt('系统安全评审 PPT 生成与局部 AI 热替换', 'セキュリティ審査資料PPTの生成と選択範囲AI編集', 'Security Review PPTX & In-Place AI Patch') }}</span>
              <span v-else>{{ tt('多智能体团队协同 · Git Worktree 物理隔离', 'マルチエージェント協働 · Git Worktree 物理分離', 'Multi-Agent Team · Git Worktree Isolation') }}</span>
            </div>
            <div class="stone-header-actions">
              <span class="stone-tag-chip">TurnHub seq: 142</span>
              <button type="button" class="stone-mini-btn" @click="showWorkbench = !showWorkbench">
                {{ showWorkbench ? tt('收起右侧工作台', '右ペインを閉じる', 'Hide Workbench') : tt('展开右侧工作台', '右ペインを開く', 'Show Workbench') }}
              </button>
            </div>
          </header>

          <div class="stone-chat-scroll">
            <template v-if="activeScenario === 'longrun'">
              <div class="stone-user-msg">
                {{ tt(
                  '在不联网环境下连接本机 Ollama，重构 llm_retry 与 stuck_detector 模块，确保单测全部通过，并开启影子 Git 检查点。',
                  'オフライン環境でローカルの Ollama に接続し、llm_retry と stuck_detector モジュールをリファクタリングしてください。全単体テストのパスを確認し、シャドウGitチェックポイントを記録してください。',
                  'Using local offline Ollama, refactor llm_retry and stuck_detector, pass all unit tests, and record Shadow Git Checkpoints.'
                ) }}
              </div>

              <div class="stone-assistant-block">
                <div class="stone-thought-box">
                  <div class="stone-thought-head">
                    <span class="stone-thought-label">THOUGHT CHAIN</span>
                    <span class="stone-thought-time">{{ tt('已连续自治运行 26m 14s · 进度笔记常驻', '26分14秒連続稼働中 · 進捗ノート常駐', '26m 14s elapsed · Progress Notes active') }}</span>
                  </div>
                  <p>
                    {{ tt(
                      '已加载会话级 <progress_notes>。在私有引用 refs/hyn/checkpoints/sess_8a9f 下创建无侵入快照（不触碰用户 HEAD 与暂存区）。正在执行第 11 步回归单测验证。',
                      'セッション進捗ノート <progress_notes> を読み込みました。作業ブランチの HEAD やステージング領域（Index）を一切汚さず、専用名前空間 refs/hyn/checkpoints/sess_8a9f にスナップショットを作成しました。回帰テストを実行します。',
                      'Loaded <progress_notes>. Created non-invasive shadow checkpoint under refs/hyn/checkpoints/sess_8a9f without touching user HEAD or index. Running regression suite.'
                    ) }}
                  </p>
                </div>

                <div class="stone-tool-card" @click="toggleTool('t1')">
                  <div class="stone-tool-head">
                    <span class="stone-tool-badge">TOOL</span>
                    <span class="stone-tool-name">apply_patch · <code>app/services/stuck_detector.py</code></span>
                    <span class="stone-auto-tag">AUTO · FULL_AUTO</span>
                    <span class="stone-tool-status is-ok">{{ tt('已完成', '完了', 'Done') }} ▾</span>
                  </div>
                  <pre v-if="expandedTools.t1" class="stone-tool-code">+ L2_RETROSPECTIVE_NOTICE = "[Runtime notice] Repeated identical tool failure detected..."
+ def evaluate_step(obs: StepObservation) -> StuckDecision: ...</pre>
                </div>

                <div class="stone-tool-card" @click="toggleTool('t2')">
                  <div class="stone-tool-head">
                    <span class="stone-tool-badge">EXEC</span>
                    <span class="stone-tool-name">run_powershell · <code>python -m unittest discover -s tests -v</code></span>
                    <span class="stone-auto-tag">AUTO · FULL_AUTO</span>
                    <span class="stone-tool-status is-ok">86 OK (1.8s) ▾</span>
                  </div>
                  <pre v-if="expandedTools.t2" class="stone-tool-code">test_stream_reset_on_llm_retry (tests.test_turn_hub.TurnHubTest) ... ok
test_shadow_checkpoint_preserves_user_index (tests.test_git_checkpoints.CheckpointTest) ... ok
test_stuck_detector_l2_retrospective (tests.test_stuck_detector.StuckTest) ... ok
----------------------------------------------------------------------
Ran 86 tests in 1.842s — OK</pre>
                </div>

                <div class="stone-checkpoint-banner">
                  <span>{{ tt('影子 Git 检查点 CP-02 已写入私有引用（未改动您的分支与 git status，可在右侧对比 Diff 或一键回滚）', 'シャドウGitチェックポイント CP-02 を専用refに記録しました（作業ブランチや git status は無変更。右ペインで差分確認・ロールバック可能）', 'Shadow Git Checkpoint CP-02 recorded in private ref (User HEAD & index untouched; inspect Diff on the right)') }}</span>
                </div>

                <div class="stone-completion-card">
                  <div class="stone-completion-head">
                    <span class="stone-badge is-success">COMPLETION GATE PASSED</span>
                    <span class="stone-completion-sub">P2 Verification Protocol</span>
                  </div>
                  <div class="stone-completion-body">
                    {{ tt(
                      '已完成流式重试回滚（stream_reset）与二阶卡死自省（StuckDetector L2）改造，86 项单元测试全部通过。',
                      'ストリーム再試行時の自動破棄（stream_reset）および2段階スタック検知（StuckDetector L2）の実装が完了し、単体テスト全86件のパスを確認しました。',
                      'Completed stream_reset retry rollback and StuckDetector L2 retrospective injection. All 86 unit tests passed.'
                    ) }}
                  </div>
                </div>
              </div>
            </template>

            <template v-else-if="activeScenario === 'workbench'">
              <div class="stone-user-msg">
                {{ tt(
                  '结合本地 RAGFlow 知识库里的《企业安全合规规范》，生成架构评审 PPT，并将第 2 页选中的文本框精简为 3 条量化指标。',
                  'ローカル RAGFlow ナレッジベースの『情報セキュリティ管理規程』を参照してアーキテクチャ審査資料（PPTX）を生成し、2ページ目の選択枠を3つの定量指標に要約してください。',
                  'Using the local RAGFlow security compliance dataset, generate an Architecture Review PPTX and condense the selected Slide 2 text box into 3 quantitative metrics.'
                ) }}
              </div>

              <div class="stone-assistant-block">
                <div class="stone-tool-card">
                  <div class="stone-tool-head">
                    <span class="stone-tool-badge">RAG</span>
                    <span class="stone-tool-name">knowledge_search · <code>dataset="sec_compliance_local"</code></span>
                    <span class="stone-tool-status is-ok">{{ tt('命中 4 条本地证据链', 'ローカル根拠 4件ヒット', '4 Local Evidences') }}</span>
                  </div>
                </div>

                <div class="stone-selection-chip-bar">
                  <span class="stone-sel-chip">
                    SELECTION ANCHOR · <code>{{ samplePptName }}</code> · {{ tt('Slide 02 · Shape 104', 'スライド 02 · Shape 104', 'Slide 02 · Shape 104') }}
                  </span>
                </div>

                <div class="stone-tool-card">
                  <div class="stone-tool-head">
                    <span class="stone-tool-badge">PATCH</span>
                    <span class="stone-tool-name">patch_file_selection · <code>slide_index=2, shape_id=104</code></span>
                    <span class="stone-tool-status is-ok">{{ tt('SSE 原地热更新完成', 'SSE インプレース反映完了', 'SSE Hot-Reloaded') }}</span>
                  </div>
                </div>

                <div class="stone-artifact-card" @click="showWorkbench = true">
                  <div class="stone-artifact-badge">PPTX</div>
                  <div class="stone-artifact-info">
                    <div class="stone-artifact-name">{{ samplePptName }}</div>
                    <div class="stone-artifact-meta">{{ tt('最终交付产物（已自动过滤中间 .py 脚本 · 点击在右侧预览与局部修改）', '最終成果物（中間 .py スクリプトを自動除外 · 右ペインで直接プレビュー・部分編集）', 'Final Deliverable (Intermediate .py scripts filtered · Click to edit on right)') }}</div>
                  </div>
                  <span class="stone-badge is-success">{{ tt('工作台已打开', 'プレビュー中', 'Workbench Open') }}</span>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="stone-user-msg">
                {{ tt(
                  '启动团队模式：分配 3 名常驻队友分别在独立 Git Worktree 下并行完成「后端权限接口」、「前端按钮组件」与「边界安全单测」。',
                  'チームモードを起動：3名の常駐チームメイトをそれぞれ独立した Git Worktree に割り当て、「バックエンド権限API」「フロントエンドUI」「境界セキュリティテスト」を並列実装してください。',
                  'Launch Team Mode: assign 3 resident teammates in isolated Git Worktrees to build Backend Permission API, Frontend Button, and Security Boundary Tests in parallel.'
                ) }}
              </div>

              <div class="stone-assistant-block">
                <div class="stone-team-grid">
                  <div class="stone-mate-card">
                    <div class="stone-mate-top">
                      <strong>mate-backend</strong>
                      <span class="stone-badge is-success">RUNNING</span>
                    </div>
                    <div class="stone-mate-wt">Worktree: <code>.hyn_wt/mate-backend</code></div>
                    <p class="stone-mate-desc">{{ tt('已完成 permission_mode.py 与 PATCH /sessions/{id} 实时广播。', 'permission_mode.py および PATCH /sessions/{id} リアルタイム配信の実装完了。', 'Implemented permission_mode.py & live session PATCH.') }}</p>
                  </div>

                  <div class="stone-mate-card">
                    <div class="stone-mate-top">
                      <strong>mate-frontend</strong>
                      <span class="stone-badge" :class="matePlanApproved ? 'is-success' : ''">
                        {{ matePlanApproved ? tt('已批准 · 写入中', '承認済 · 書込中', 'APPROVED · WRITING') : tt('等待计划审批 (只读门禁中)', '計画承認待ち (読取専用ゲート)', 'AWAITING PLAN APPROVAL') }}
                      </span>
                    </div>
                    <div class="stone-mate-wt">Worktree: <code>.hyn_wt/mate-frontend</code></div>
                    <p class="stone-mate-desc">{{ tt('安全门禁：计划未获批准前强制剥离写盘与执行命令权限，防止越权改乱代码。', '安全ゲート：計画が承認されるまでファイル書込・コマンド実行権限を遮断し、意図しない変更を防止します。', 'Safety Gate: Mutating tools are stripped until plan is approved.') }}</p>
                    <button
                      type="button"
                      class="stone-approve-btn"
                      @click="matePlanApproved = !matePlanApproved"
                    >
                      {{ matePlanApproved ? tt('✓ 已解锁 Worktree 写入权限（点击可重置）', '✓ Worktree 書込ロック解除済（クリックでリセット）', '✓ Worktree Writes Unlocked (Click to reset)') : tt('批准队友重构计划（解锁 Worktree 写入权限）', '実装計画を承認（Worktree 書込ロックを解除）', 'Approve Teammate Plan (Unlock Worktree Writes)') }}
                    </button>
                  </div>

                  <div class="stone-mate-card">
                    <div class="stone-mate-top">
                      <strong>mate-sec-test</strong>
                      <span class="stone-badge is-success">COMPLETED</span>
                    </div>
                    <div class="stone-mate-wt">Worktree: <code>.hyn_wt/mate-sec-test</code></div>
                    <p class="stone-mate-desc">{{ tt('验证 full_auto 模式下越出工作区与高危系统指令 100% 硬拒绝。', 'full_auto モード時のワークスペース外アクセスおよび危険コマンドの強制ブロック（100%遮断）を検証完了。', 'Verified 100% hard-deny for out-of-workspace & system commands.') }}</p>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <footer class="stone-composer-band">
            <div class="stone-composer-inner">
              <div class="stone-composer-input-mock">
                {{ tt('输入后续指令，或在右侧预览画布划取任意段落/单元格触发 AI 局部修改…', '追加の指示を入力、または右ペインのプレビュー上で範囲選択して AI 部分編集を実行…', 'Enter instructions, or select any paragraph/cell on the right canvas for in-place AI edit...') }}
              </div>
              <div class="stone-composer-toolbar">
                <span class="stone-toolbar-pill">
                  <span class="stone-dot-green"></span>
                  Ollama · qwen2.5-coder:32b (127.0.0.1)
                </span>

                <div class="stone-toolbar-spacer"></div>

                <div class="stone-pop-anchor">
                  <button
                    type="button"
                    class="stone-perm-btn"
                    :class="{ 'is-danger': permMode === 'full_auto', 'is-accent': permMode === 'ask_all' }"
                    @click="showPermMenu = !showPermMenu; showContextPopover = false"
                  >
                    <span>{{ currentPermObj.code }} · {{ currentPermObj.label }}</span>
                    <span>▴</span>
                  </button>
                  <div v-if="showPermMenu" class="stone-popover">
                    <div class="stone-popover-title">{{ tt('4 档实时权限（切换后立即在下一次工具调用生效）', '4段階リアルタイム権限（切替は次のツール呼出から即時適用）', '4-Tier Live Permission Mode') }}</div>
                    <div
                      v-for="item in permOptions"
                      :key="item.id"
                      class="stone-perm-opt"
                      :class="{ 'is-selected': permMode === item.id }"
                      @click="changePermMode(item.id)"
                    >
                      <div class="stone-perm-opt-name">{{ item.code }} — {{ item.label }}</div>
                      <div class="stone-perm-opt-desc">{{ item.desc }}</div>
                    </div>
                  </div>
                </div>

                <div class="stone-pop-anchor">
                  <button
                    type="button"
                    class="stone-ring-btn"
                    @click="showContextPopover = !showContextPopover; showPermMenu = false"
                  >
                    <span class="stone-ring-circle"></span>
                    <span>24% · 31k/128k</span>
                  </button>
                  <div v-if="showContextPopover" class="stone-popover">
                    <div class="stone-popover-title">{{ tt('长程预算与 Prefix Cache 监控', '実行バジェット＆ Prefix Cache 監視', 'Long-Horizon Budget & Cache') }}</div>
                    <div class="stone-ring-row"><span>Token Budget:</span> <strong>31,240 / 128,000 (24%)</strong></div>
                    <div class="stone-ring-row"><span>Time Budget:</span> <strong>26m / 240m</strong></div>
                    <div class="stone-ring-row"><span>Prefix Cache:</span> <strong class="is-green">94.2% Hit (Frozen Snapshot)</strong></div>
                    <div class="stone-ring-row"><span>Progress Notes:</span> <strong>1,420 / 8,000 chars</strong></div>
                  </div>
                </div>

                <button type="button" class="stone-send-btn">
                  {{ tt('发送', '送信', 'Send') }}
                </button>
              </div>
            </div>
          </footer>
        </main>

        <aside v-if="showWorkbench" class="stone-workbench">
          <template v-if="activeScenario === 'longrun'">
            <div class="stone-wb-header">
              <span class="stone-wb-title">{{ tt('影子 Git 检查点 (Shadow Checkpoints)', 'シャドウGitチェックポイント', 'Shadow Git Checkpoints') }}</span>
              <span class="stone-badge">ZERO HEAD POLLUTION</span>
            </div>
            <div class="stone-wb-body">
              <div class="stone-cp-tabs">
                <button
                  v-for="(cp, idx) in checkpoints"
                  :key="cp.id"
                  type="button"
                  class="stone-cp-tab"
                  :class="{ 'is-active': selectedCheckpointIdx === idx }"
                  @click="selectedCheckpointIdx = idx"
                >
                  <div class="stone-cp-tab-top">
                    <strong>{{ cp.id }} · {{ cp.step }}</strong>
                    <span>{{ cp.time }}</span>
                  </div>
                  <div class="stone-cp-tab-sub">{{ cp.summary }}</div>
                </button>
              </div>
              <div class="stone-cp-detail">
                <div class="stone-cp-ref">{{ checkpoints[selectedCheckpointIdx].ref }}</div>
                <pre class="stone-cp-diff">{{ checkpoints[selectedCheckpointIdx].diff }}</pre>
                <div class="stone-cp-note">
                  {{ tt(
                    '底层机制：使用临时 GIT_INDEX_FILE + git commit-tree 写入私有引用 refs/hyn/checkpoints/，100% 不触碰您的工作分支与暂存区。',
                    '内部仕組み：一時 GIT_INDEX_FILE と git commit-tree により専用名前空間 refs/hyn/checkpoints/ へ記録。作業中ブランチやステージング領域を一切汚しません。',
                    'Mechanism: Uses temporary GIT_INDEX_FILE + git commit-tree into private refs without touching user HEAD or staging area.'
                  ) }}
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="stone-wb-header">
              <span class="stone-wb-title">{{ samplePptName }}</span>
              <span class="stone-badge is-success">SNAPSHOT v3/5</span>
            </div>
            <div class="stone-wps-bar">
              <span class="stone-wps-item">{{ sampleFontName }}</span>
              <span class="stone-wps-item">16pt ▾</span>
              <span class="stone-wps-item"><b>B</b></span>
              <span class="stone-wps-item"><i>I</i></span>
              <span class="stone-wps-item"><u>U</u></span>
              <span class="stone-wps-spacer"></span>
              <button type="button" class="stone-wps-ai-btn" @click="triggerAiSelectionPatch">
                {{ aiPatchApplied ? tt('撤销 AI 修改', '元に戻す', 'Undo Patch') : tt('点击触发「AI 局部热修改」', 'クリックして「AI部分編集」を実行', 'Click to Run AI In-Place Patch') }}
              </button>
            </div>

            <div class="stone-wb-body">
              <div class="stone-ppt-canvas">
                <div class="stone-ppt-slide-tag">SLIDE 02 / 12 · SECURITY & RELIABILITY METRICS</div>
                <div class="stone-ppt-h1">
                  {{ tt('全本地离线架构与长程自治可靠性指标', '完全ローカル構成と長時間自律稼働の信頼性指標', '100% Local Architecture & Long-Horizon Reliability') }}
                </div>

                <div class="stone-ppt-shape" :class="{ 'is-patched': aiPatchApplied }" @click="triggerAiSelectionPatch">
                  <div class="stone-floating-popover">
                    {{ aiPatchApplied ? tt('✓ SSE 原地热替换已完成 (点击切换)', '✓ SSE インプレース反映完了', '✓ SSE Hot-Reloaded') : tt('AI 修改 (Ctrl+L · 点击此处体验)', 'AI編集 (Ctrl+L · ここをクリック)', 'AI Edit (Ctrl+L · Click here)') }}
                  </div>

                  <template v-if="!aiPatchApplied">
                    <p class="stone-ppt-raw">
                      {{ tt(
                        '【修改前草稿】本系统支持连接本地 Ollama 与企业内网大模型，所有对话、记忆和知识库都在本地处理，同时通过 TurnHub 与影子检查点保障数小时运行不丢失进度。',
                        '【編集前の下書き】本システムはローカルの Ollama や社内LANモデルに接続可能で、会話・メモリ・ナレッジベースをすべてローカルで処理し、TurnHub とシャドウチェックポイントにより長時間稼働を実現します。',
                        '[Draft Before AI Edit] Connects to local Ollama and intranet LLMs, keeping all data local while using TurnHub and shadow checkpoints for long runs.'
                      ) }}
                    </p>
                  </template>
                  <template v-else>
                    <ul class="stone-ppt-refined">
                      <li><strong>0 Byte {{ tt('外发流量', '外部送信', 'External Egress') }}</strong>：{{ tt('127.0.0.1 闭环运行，核心代码 100% 不出本机与企业内网', '127.0.0.1 ループバック完結、機密コード・文書の社外流出ゼロ', '127.0.0.1 loop, zero external code egress') }}</li>
                      <li><strong>94.2% Prefix Cache {{ tt('命中', 'ヒット', 'Hit') }}</strong>：{{ tt('会话冻结记忆快照 + 异步提取，大幅降低首字延迟', 'セッション凍結メモリスナップショットにより初回応答遅延（TTFT）を大幅短縮', 'Session-frozen memory snapshot preserves KV cache') }}</li>
                      <li><strong>100% {{ tt('无损状态回滚', '状態ロールバック', 'State Rollback') }}</strong>：{{ tt('TurnHub 单调 seq 重连 + 无侵入影子 Git 检查点', 'TurnHub 単調増加 seq 再接続 + 非侵襲シャドウGitチェックポイント', 'Monotonic seq replay + Shadow Git Checkpoints') }}</li>
                    </ul>
                  </template>
                </div>
              </div>
            </div>
          </template>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pg-frame {
  width: 100%;
  margin: 20px 0;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: #ffffff;
  overflow: hidden;
}

.pg-frame.is-standalone {
  margin: 0;
}

.pg-control-deck {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 18px;
  background: #ffffff;
  border-bottom: 1px solid var(--border-subtle);
}

.pg-deck-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
}

.pg-deck-kicker {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--text-tertiary);
}

.pg-scenario-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pg-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
  background: var(--bg-hover);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 150ms ease;
}

.pg-pill-btn:hover {
  border-color: var(--border-strong);
  color: var(--text-primary);
}

.pg-pill-btn.is-active {
  background: var(--bg-selected);
  color: var(--accent);
  border-color: var(--accent);
  font-weight: 650;
}

.pg-pill-num {
  font-family: var(--font-mono);
  font-size: 11px;
  opacity: 0.75;
}

.pg-autoplay-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 650;
  border-radius: var(--radius-sm);
  border: 1px solid var(--accent);
  background: #ffffff;
  color: var(--accent);
  cursor: pointer;
}

.pg-autoplay-btn.is-playing {
  background: var(--accent);
  color: var(--on-accent);
}

.pg-play-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.pg-window-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #f2f4f8;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 11.5px;
}

.pg-win-dots {
  display: flex;
  gap: 6px;
}

.pg-win-dots span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #cbd2df;
}

.pg-win-caption {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-secondary);
}

.pg-win-caption code {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-tertiary);
}

.pg-win-badge {
  padding: 1px 6px;
  font-size: 10px;
  font-family: var(--font-mono);
  font-weight: 700;
  border-radius: 3px;
  background: var(--status-success-bg);
  color: var(--status-success);
}

.pg-win-meta {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-tertiary);
}

.pg-viewport-scroll {
  width: 100%;
  overflow-x: auto;
}

.stone-window {
  display: grid;
  grid-template-columns: 232px minmax(440px, 1fr) auto;
  min-width: 980px;
  min-height: 550px;
  background: var(--bg-app);
  color: var(--text-primary);
  font-size: 13px;
}

.stone-sidebar {
  display: flex;
  flex-direction: column;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-subtle);
}

.pg-win-helm {
  width: 15px;
  height: 15px;
  border-radius: 3px;
  flex: none;
}

.stone-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 16px 12px;
}

.stone-helm-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  flex: none;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.14);
}

.stone-word {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.16em;
  line-height: 1.1;
}

.stone-workspace {
  margin-top: 2px;
  font-size: 11px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
}

.stone-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 10px;
}

.stone-nav-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border: 0;
  background: transparent;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12.5px;
  text-align: left;
}

.stone-nav-item:hover {
  background: var(--bg-hover);
}

.stone-nav-item.is-active {
  background: var(--bg-selected);
  color: var(--accent);
  font-weight: 650;
}

.stone-nav-tag {
  margin-left: auto;
  padding: 0 6px;
  font-size: 11px;
  font-family: var(--font-mono);
  border-radius: 4px;
  background: var(--bg-selected-strong);
  color: var(--accent);
}

.stone-recent-header {
  padding: 14px 16px 6px;
  font-size: 10.5px;
  font-family: var(--font-mono);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--text-tertiary);
}

.stone-recent-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 10px;
  flex: 1;
}

.stone-recent-item {
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.stone-recent-item:hover {
  background: var(--bg-hover);
}

.stone-recent-item.is-active {
  background: var(--bg-selected);
}

.stone-recent-item.is-active .stone-recent-title {
  color: var(--accent);
  font-weight: 650;
}

.stone-recent-title {
  font-size: 12px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stone-recent-meta {
  margin-top: 2px;
  font-size: 11px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
}

.stone-sidebar-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid var(--border-subtle);
  font-size: 11.5px;
}

.stone-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--status-success);
  flex: none;
}

.stone-footer-text {
  color: var(--text-secondary);
  font-size: 11.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stone-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg-app);
}

.stone-main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 20px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-app);
}

.stone-main-title {
  font-weight: 650;
  color: var(--text-primary);
}

.stone-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stone-tag-chip {
  padding: 2px 8px;
  font-size: 11px;
  font-family: var(--font-mono);
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  color: var(--text-tertiary);
}

.stone-mini-btn {
  padding: 4px 10px;
  font-size: 11.5px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
  background: #ffffff;
  color: var(--text-secondary);
  cursor: pointer;
}

.stone-chat-scroll {
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stone-user-msg {
  padding: 10px 14px;
  background: #ffffff;
  border-left: 3px solid var(--accent);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.55;
}

.stone-assistant-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stone-thought-box {
  padding: 10px 14px;
  border-left: 2px solid var(--border-strong);
  color: var(--text-secondary);
  font-size: 12px;
}

.stone-thought-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.stone-thought-label {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--text-tertiary);
}

.stone-thought-time {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-tertiary);
}

.stone-thought-box p {
  margin: 0;
  line-height: 1.55;
}

.stone-tool-card {
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 9px 12px;
  cursor: pointer;
}

.stone-tool-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
}

.stone-tool-badge {
  padding: 1px 6px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  background: var(--bg-hover);
  border: 1px solid var(--border-subtle);
  border-radius: 3px;
  color: var(--text-secondary);
}

.stone-tool-name {
  font-weight: 600;
  color: var(--text-primary);
}

.stone-auto-tag {
  padding: 1px 6px;
  font-size: 10px;
  font-family: var(--font-mono);
  border-radius: 3px;
  background: var(--bg-selected);
  color: var(--accent);
}

.stone-tool-status {
  margin-left: auto;
  font-size: 11px;
  font-family: var(--font-mono);
  font-weight: 650;
}

.stone-tool-status.is-ok {
  color: var(--status-success);
}

.stone-tool-code {
  margin: 8px 0 0;
  padding: 8px 10px;
  background: var(--bg-code);
  border-radius: 4px;
  font-size: 11px;
  font-family: var(--font-mono);
  overflow-x: auto;
  line-height: 1.45;
}

.stone-checkpoint-banner {
  padding: 8px 12px;
  background: var(--bg-selected);
  border: 1px solid var(--bg-selected-strong);
  border-radius: var(--radius-sm);
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
}

.stone-completion-card {
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
}

.stone-completion-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.stone-completion-sub {
  font-size: 11px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
}

.stone-completion-body {
  font-size: 12.5px;
  color: var(--text-secondary);
  line-height: 1.55;
}

.stone-selection-chip-bar {
  display: flex;
  gap: 6px;
}

.stone-sel-chip {
  padding: 4px 10px;
  background: var(--bg-selected);
  color: var(--accent);
  border: 1px solid var(--bg-selected-strong);
  border-radius: var(--radius-sm);
  font-size: 11.5px;
  font-family: var(--font-mono);
  font-weight: 600;
}

.stone-artifact-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #ffffff;
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.stone-artifact-badge {
  padding: 6px 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  background: var(--bg-selected);
  color: var(--accent);
  border-radius: 4px;
}

.stone-artifact-info {
  flex: 1;
}

.stone-artifact-name {
  font-weight: 650;
  color: var(--text-primary);
}

.stone-artifact-meta {
  font-size: 11.5px;
  color: var(--text-tertiary);
}

.stone-team-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stone-mate-card {
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
}

.stone-mate-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 12px;
}

.stone-mate-wt {
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
}

.stone-mate-desc {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.stone-approve-btn {
  margin-top: 8px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 650;
  border-radius: var(--radius-sm);
  border: 1px solid var(--accent);
  background: var(--bg-selected);
  color: var(--accent);
  cursor: pointer;
}

.stone-composer-band {
  background: #ffffff;
  border-top: 1px solid var(--border-subtle);
  padding: 10px 20px;
}

.stone-composer-inner {
  max-width: 680px;
  margin: 0 auto;
}

.stone-composer-input-mock {
  font-size: 12.5px;
  color: var(--text-tertiary);
  padding: 4px 0 8px;
}

.stone-composer-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.stone-toolbar-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-family: var(--font-mono);
  padding: 3px 8px;
  background: var(--bg-hover);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.stone-dot-green {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--status-success);
}

.stone-toolbar-spacer {
  flex: 1;
}

.stone-pop-anchor {
  position: relative;
}

.stone-perm-btn,
.stone-ring-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 9px;
  font-size: 11px;
  font-family: var(--font-mono);
  font-weight: 600;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
  background: var(--bg-hover);
  color: var(--text-secondary);
  cursor: pointer;
}

.stone-perm-btn.is-danger {
  color: var(--status-danger);
  background: var(--status-danger-bg);
  border-color: #f2c9c7;
}

.stone-perm-btn.is-accent {
  color: var(--accent);
  background: var(--bg-selected);
}

.stone-ring-circle {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  border: 2px solid var(--accent);
}

.stone-popover {
  position: absolute;
  bottom: 34px;
  right: 0;
  width: 290px;
  background: #ffffff;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  padding: 10px;
  z-index: 30;
}

.stone-popover-title {
  font-size: 11px;
  font-weight: 650;
  color: var(--text-tertiary);
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border-subtle);
}

.stone-perm-opt {
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.stone-perm-opt:hover {
  background: var(--bg-hover);
}

.stone-perm-opt.is-selected {
  background: var(--bg-selected);
}

.stone-perm-opt-name {
  font-size: 11.5px;
  font-family: var(--font-mono);
  font-weight: 650;
  color: var(--text-primary);
}

.stone-perm-opt-desc {
  font-size: 11px;
  color: var(--text-tertiary);
}

.stone-ring-row {
  display: flex;
  justify-content: space-between;
  font-size: 11.5px;
  padding: 3px 0;
}

.stone-ring-row .is-green {
  color: var(--status-success);
}

.stone-send-btn {
  height: 28px;
  padding: 0 14px;
  border-radius: var(--radius-sm);
  border: none;
  background: var(--accent);
  color: var(--on-accent);
  font-size: 12px;
  font-weight: 650;
}

.stone-workbench {
  width: 380px;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-left: 1px solid var(--border-subtle);
}

.stone-wb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  border-bottom: 1px solid var(--border-subtle);
}

.stone-wb-title {
  font-size: 12.5px;
  font-weight: 650;
}

.stone-wps-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 6px 12px;
  background: var(--bg-hover);
  border-bottom: 1px solid var(--border-subtle);
  font-size: 11px;
}

.stone-wps-item {
  padding: 2px 6px;
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
}

.stone-wps-spacer {
  flex: 1;
}

.stone-wps-ai-btn {
  padding: 3px 9px;
  font-size: 11px;
  font-weight: 650;
  border-radius: 4px;
  border: 1px solid var(--accent);
  background: var(--bg-selected);
  color: var(--accent);
  cursor: pointer;
}

.stone-wb-body {
  flex: 1;
  padding: 14px;
  overflow-y: auto;
}

.stone-cp-tabs {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.stone-cp-tab {
  text-align: left;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
  background: var(--bg-hover);
  cursor: pointer;
  font-size: 11.5px;
}

.stone-cp-tab.is-active {
  background: var(--bg-selected);
  border-color: var(--accent);
  color: var(--accent);
}

.stone-cp-tab-top {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
}

.stone-cp-tab-sub {
  margin-top: 3px;
  color: var(--text-secondary);
}

.stone-cp-ref {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-tertiary);
  margin-bottom: 6px;
}

.stone-cp-diff {
  padding: 10px;
  background: var(--bg-code);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  font-size: 11px;
  font-family: var(--font-mono);
  overflow-x: auto;
  line-height: 1.45;
}

.stone-cp-note {
  margin-top: 10px;
  font-size: 11.5px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.stone-ppt-canvas {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 14px;
  background: var(--bg-hover);
}

.stone-ppt-slide-tag {
  font-size: 10px;
  font-family: var(--font-mono);
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
}

.stone-ppt-h1 {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--accent);
  margin: 6px 0 12px;
}

.stone-ppt-shape {
  position: relative;
  padding: 28px 12px 12px;
  background: #ffffff;
  border: 1.5px dashed var(--accent);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 180ms ease;
}

.stone-ppt-shape.is-patched {
  background: var(--status-success-bg);
  border: 1.5px solid var(--status-success);
}

.stone-floating-popover {
  position: absolute;
  top: 5px;
  right: 6px;
  padding: 2px 8px;
  font-size: 10.5px;
  font-family: var(--font-mono);
  font-weight: 650;
  border-radius: 4px;
  background: var(--accent);
  color: var(--on-accent);
}

.stone-ppt-shape.is-patched .stone-floating-popover {
  background: var(--status-success);
}

.stone-ppt-raw {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.55;
}

.stone-ppt-refined {
  margin: 0;
  padding-left: 16px;
  font-size: 11.5px;
  color: var(--text-primary);
  line-height: 1.6;
}
</style>
