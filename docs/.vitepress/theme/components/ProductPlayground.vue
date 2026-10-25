<script setup>
/**
 * 免安装网页版交互式回放沙盒组件（ProductPlayground.vue）。
 *
 * 职责与协作：
 * - 1:1 复刻 HYN Agent 桌面端「石澜（Stone）」UI 布局（260px 白侧栏 + 3×28 靛蓝竖标 + 石底主对话舞台 + 底部贴边白书写条 + 右侧可开关高保真预览工作台）。
 * - 专为无法在社用 PC 安装 `.exe` 的日本企业 HR 与技术面试官设计，打开网页即可交互体验三大核心场景：
 *   1. 离线 Ollama 长程重构 + 影子 Git 检查点（Shadow Git Checkpoints）查看与回滚。
 *   2. 右侧高保真预览工作台（WPS 格式工具栏 + 鼠标划取「✨ AI 修改」触发 `patch_file_selection` 原地热更新）。
 *   3. 多智能体团队协同（Lead + Git Worktree 物理隔离队友 + 计划审批门禁）。
 * - 接收 `lang` 属性（'zh' | 'ja' | 'en'），所有界面文案支持三语动态响应。
 */
import { ref, computed, watch } from 'vue'

const props = defineProps({
  lang: {
    type: String,
    default: 'zh'
  }
})

// 当前选中的演示剧本：'longrun' | 'workbench' | 'team'
const activeScenario = ref('longrun')
// 剧本一：当前选中的影子检查点索引
const selectedCheckpointIdx = ref(1)
// 剧本二：是否已执行「✨ AI 修改」局部热补丁
const aiPatchApplied = ref(false)
// 剧本三：队友计划是否已批准
const matePlanApproved = ref(false)
// 底部工具栏：4 档权限模式实时切换演示
const permMode = ref('full_auto')
const showPermMenu = ref(false)
// 底部工具栏：上下文预算圆环弹窗开关
const showContextPopover = ref(false)
// 右侧预览工作台开关
const showWorkbench = ref(true)
// 已展开的工具调用卡片 ID 集合
const expandedTools = ref({ t1: false, t2: true, t3: false })

/**
 * 三语内联翻译辅助函数。
 * @param {string} zh 中文文案
 * @param {string} ja 日语文案
 * @param {string} en 英文文案
 * @returns {string} 当前语言对应的文案
 */
function tt(zh, ja, en) {
  if (props.lang === 'ja') return ja
  if (props.lang === 'en') return en
  return zh
}

/**
 * 切换剧本时重置右侧工作台和局部交互状态，确保每次点击都有清晰反馈。
 * @param {string} key 剧本标识
 */
function selectScenario(key) {
  activeScenario.value = key
  showWorkbench.value = true
  showPermMenu.value = false
  showContextPopover.value = false
}

/**
 * 切换单个工具调用卡片的展开/折叠状态。
 * @param {string} id 工具卡片 ID
 */
function toggleTool(id) {
  expandedTools.value[id] = !expandedTools.value[id]
}

/**
 * 模拟在右侧预览工作台中点击「✨ AI 修改」并完成 SSE `file_updated` 原地热替换。
 */
function triggerAiSelectionPatch() {
  aiPatchApplied.value = !aiPatchApplied.value
}

/**
 * 切换会话级 4 档权限模式，并关闭弹出菜单。
 * @param {string} nextMode 权限档位标识
 */
function changePermMode(nextMode) {
  permMode.value = nextMode
  showPermMenu.value = false
}

const permOptions = computed(() => [
  {
    id: 'ask_all',
    label: tt('🔒 全部询问', '🔒 すべて確認', '🔒 Ask All'),
    desc: tt('所有写文件与命令均需人工确认', 'ファイル書込・コマンド実行を毎回確認', 'Confirm every file write and shell command')
  },
  {
    id: 'auto_edit',
    label: tt('✏️ 自动编辑', '✏️ 自動編集', '✏️ Auto Edit'),
    desc: tt('工作区内改文件与只读命令自动放行', 'ワークスペース内の編集と読取専用コマンドを許可', 'Auto-approve workspace edits & read-only commands')
  },
  {
    id: 'default',
    label: tt('🛡️ 智能确认', '🛡️ スマート確認', '🛡️ Smart Default'),
    desc: tt('常规操作放行，破坏性命令需确认', '通常操作は自動、破壊的コマンドのみ確認', 'Confirm only destructive commands')
  },
  {
    id: 'full_auto',
    label: tt('⚡ 完全放行', '⚡ 完全自動 (無人稼働)', '⚡ Full Auto'),
    desc: tt('数小时无人值守，仅拦截越界与高危指令', '数時間の無人実行。境界外・危険操作のみハード拒否', 'Unattended long-horizon run with hard-deny guardrails')
  }
])

const currentPermObj = computed(() => {
  return permOptions.value.find((p) => p.id === permMode.value) || permOptions.value[3]
})

const checkpoints = computed(() => [
  {
    id: '#1',
    step: 'Step 4',
    time: '14:02:11',
    ref: 'refs/hyn/checkpoints/sess_8a9f @ 3c91a0b',
    summary: tt('完成数据访问层异步超时封装', 'データアクセス層の非同期タイムアウト実装', 'Wrap async timeout in data access layer'),
    files: 3,
    diff: `--- a/app/services/llm_retry.py\n+++ b/app/services/llm_retry.py\n@@ -42,6 +42,11 @@ async def stream_with_retry(policy: RetryPolicy):\n+    # 发生网关抖动重试前，先通过 TurnHub 发送 stream_reset 清空前端半截脏输出\n+    await turn_hub.emit(session_id, {"type": "stream_reset", "attempt": attempt})\n+    await asyncio.sleep(policy.backoff_for(attempt))`
  },
  {
    id: '#2',
    step: 'Step 11',
    time: '14:18:45',
    ref: 'refs/hyn/checkpoints/sess_8a9f @ 7f4e21d',
    summary: tt('接入 StuckDetector L2 自省提示并通过 86 项单测', 'StuckDetector L2 内省プロンプト導入・単体テスト86件通過', 'Integrate StuckDetector L2 notice & pass 86 unit tests'),
    files: 5,
    diff: `--- a/app/services/stuck_detector.py\n+++ b/app/services/stuck_detector.py\n@@ -88,4 +88,9 @@ class StuckDetector:\n+    if repeat_count >= 3:\n+        # 注入 L2 复盘提醒，强制模型停止重复调用同一报错命令并切换排查路径\n+        return StepObservation(level="L2", inject_notice=L2_RETROSPECTIVE_NOTICE)`
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
  <div class="pg-wrapper">
    <!-- 顶部剧本切换栏（引导面试官点击体验 3 大核心工程亮点） -->
    <div class="pg-scenario-bar">
      <div class="pg-scenario-title">
        <span class="pg-live-dot"></span>
        <span>{{ tt('免安装交互式沙盒（点击下方场景与界面控件直接体验）', 'インストール不要・対話型Webデモ（シナリオやUIボタンをクリックして操作できます）', 'Zero-Install Interactive Sandbox (Click scenarios & UI controls below)') }}</span>
      </div>
      <div class="pg-scenario-tabs">
        <button
          type="button"
          class="pg-tab-btn"
          :class="{ 'is-active': activeScenario === 'longrun' }"
          @click="selectScenario('longrun')"
        >
          {{ tt('场景 1：离线 Ollama 长程重构 & 影子 Git 检查点', '1. オフライン長時間実行＆シャドウGitチェックポイント', '1. Offline Long-Horizon & Shadow Git Checkpoints') }}
        </button>
        <button
          type="button"
          class="pg-tab-btn"
          :class="{ 'is-active': activeScenario === 'workbench' }"
          @click="selectScenario('workbench')"
        >
          {{ tt('场景 2：WPS 级高保真预览 & 划取「✨ AI 修改」', '2. Office高精細プレビュー＆選択範囲「✨ AI修正」', '2. Office Workbench & Selection "✨ AI Edit"') }}
        </button>
        <button
          type="button"
          class="pg-tab-btn"
          :class="{ 'is-active': activeScenario === 'team' }"
          @click="selectScenario('team')"
        >
          {{ tt('场景 3：Git Worktree 多智能体团队并行开发', '3. Git Worktree マルチエージェント並列開発', '3. Git Worktree Multi-Agent Team') }}
        </button>
      </div>
    </div>

    <!-- 石澜桌面客户端 1:1 窗口壳 -->
    <div class="stone-window">
      <!-- 左侧 260px 纯白侧栏（遵循石澜五处锁死之三 & 五） -->
      <aside class="stone-sidebar">
        <div class="stone-brand">
          <span class="stone-mark"></span>
          <div>
            <div class="stone-word">HYN</div>
            <div class="stone-workspace">d:/workspace/core-service</div>
          </div>
        </div>

        <nav class="stone-nav">
          <div class="stone-nav-item" :class="{ 'is-active': activeScenario !== 'team' }" @click="selectScenario('longrun')">
            <span>💬</span>
            <span>{{ tt('对话与工作台', 'チャット＆ワークベンチ', 'Chat & Workbench') }}</span>
          </div>
          <div class="stone-nav-item" :class="{ 'is-active': activeScenario === 'team' }" @click="selectScenario('team')">
            <span>🌿</span>
            <span>{{ tt('团队协同 (Worktree)', 'チーム協働 (Worktree)', 'Team (Worktree)') }}</span>
            <span class="stone-nav-tag">3</span>
          </div>
          <div class="stone-nav-item" @click="selectScenario('workbench')">
            <span>📚</span>
            <span>{{ tt('知识库 (RAGFlow)', 'ナレッジベース (RAG)', 'Knowledge (RAG)') }}</span>
          </div>
          <div class="stone-nav-item">
            <span>⏰</span>
            <span>{{ tt('定时自动化 (Cron)', 'スケジュール自動化', 'Automations (Cron)') }}</span>
          </div>
          <div class="stone-nav-item">
            <span>🧩</span>
            <span>{{ tt('定制 (MCP / Skills / Hooks)', '拡張 (MCP / Skills)', 'Customize (MCP / Skills)') }}</span>
          </div>
        </nav>

        <div class="stone-recent-header">{{ tt('近日会话', '最近のセッション', 'Recent Sessions') }}</div>
        <div class="stone-recent-list">
          <div
            class="stone-recent-item"
            :class="{ 'is-active': activeScenario === 'longrun' }"
            @click="selectScenario('longrun')"
          >
            <div class="stone-recent-title">{{ tt('离线重构重试与死循环检测模块', 'リトライ＆ループ検知のオフライン改修', 'Offline refactor retry & loop guard') }}</div>
            <div class="stone-recent-meta">Ollama · qwen2.5-coder:32b</div>
          </div>
          <div
            class="stone-recent-item"
            :class="{ 'is-active': activeScenario === 'workbench' }"
            @click="selectScenario('workbench')"
          >
            <div class="stone-recent-title">{{ tt('生成系统安全评审 PPT 与白皮书', 'セキュリティ審査PPTと白書の生成', 'Generate Security Review PPTX') }}</div>
            <div class="stone-recent-meta">RAGFlow · 127.0.0.1</div>
          </div>
          <div
            class="stone-recent-item"
            :class="{ 'is-active': activeScenario === 'team' }"
            @click="selectScenario('team')"
          >
            <div class="stone-recent-title">{{ tt('多队友并行迁移权限引擎 P3', '権限エンジンP3のマルチメイト移行', 'Parallel P3 permission migration') }}</div>
            <div class="stone-recent-meta">Lead + 3 Teammates</div>
          </div>
        </div>

        <!-- 底部本地离线安全状态栏 -->
        <div class="stone-sidebar-footer">
          <span class="stone-status-pill is-ok">● 127.0.0.1</span>
          <span class="stone-footer-text">{{ tt('纯本地后端 · 数据零出网', 'ローカル完結 · 外部通信ゼロ', 'Local Backend · Zero Egress') }}</span>
        </div>
      </aside>

      <!-- 中间石底主舞台 (#e4e8f0) -->
      <main class="stone-main">
        <!-- 顶部会话栏 -->
        <header class="stone-main-header">
          <div class="stone-main-title">
            <span v-if="activeScenario === 'longrun'">{{ tt('离线重构重试与死循环检测模块', 'リトライ＆ループ検知のオフライン改修', 'Offline Refactor: Retry & StuckDetector') }}</span>
            <span v-else-if="activeScenario === 'workbench'">{{ tt('生成系统安全评审 PPT 与局部 AI 润色', 'セキュリティ審査PPT生成＆選択範囲AI修正', 'Security Review PPTX & In-Place AI Edit') }}</span>
            <span v-else>{{ tt('多智能体团队协同 · Git Worktree 物理隔离', 'マルチエージェント協働 · Git Worktree 分離', 'Multi-Agent Team · Git Worktree Isolation') }}</span>
          </div>
          <div class="stone-header-actions">
            <span class="stone-tag-chip">seq: 142</span>
            <button type="button" class="stone-mini-btn" @click="showWorkbench = !showWorkbench">
              {{ showWorkbench ? tt('收起右侧工作台', '右パネルを隠す', 'Hide Workbench') : tt('展开右侧工作台', '右パネルを表示', 'Show Workbench') }}
            </button>
          </div>
        </header>

        <!-- 对话与状态内容流（助手消息直接落在 #e4e8f0 石底上，不套气泡） -->
        <div class="stone-chat-scroll">
          <!-- ==================== 场景 1：离线长程运行 & 影子检查点 ==================== -->
          <template v-if="activeScenario === 'longrun'">
            <div class="stone-user-msg">
              {{ tt(
                '在不联网环境下连接本机 Ollama，重构 llm_retry 与 stuck_detector 模块，确保单测全部通过，并开启影子 Git 检查点。',
                'オフライン環境でローカル Ollama に接続し、llm_retry と stuck_detector をリファクタリングして単体テストをすべて通し、シャドウGitチェックポイントを記録してください。',
                'Using local offline Ollama, refactor llm_retry and stuck_detector, pass all unit tests, and record shadow Git checkpoints.'
              ) }}
            </div>

            <div class="stone-assistant-block">
              <div class="stone-thought-box">
                <span class="stone-thought-label">🧠 {{ tt('思考链 (Thought · 已持续运行 26 分钟)', '思考プロセス (Thought · 26分連続稼働中)', 'Thought Chain (26m elapsed)') }}</span>
                <p>
                  {{ tt(
                    '已读取会话进度笔记 <progress_notes>。当前工作区为 Git 仓库，已在私有引用 refs/hyn/checkpoints/sess_8a9f 下建立无侵入快照（不触碰用户 HEAD 与暂存区）。正在执行第 11 步回归测试验证……',
                    'セッション進捗ノート <progress_notes> を読込完了。ユーザーの HEAD やステージング領域を汚さず refs/hyn/checkpoints/sess_8a9f にシャドウチェックポイントを作成しました。単体テストを実行します…',
                    'Loaded <progress_notes>. Created non-invasive shadow checkpoint under refs/hyn/checkpoints/sess_8a9f without touching user HEAD or index. Running regression tests...'
                  ) }}
                </p>
              </div>

              <!-- 可点击展开的工具调用卡片 -->
              <div class="stone-tool-card" @click="toggleTool('t1')">
                <div class="stone-tool-head">
                  <span class="stone-tool-icon">🛠️</span>
                  <span class="stone-tool-name">apply_patch · <code>app/services/stuck_detector.py</code></span>
                  <span class="stone-auto-tag">{{ tt('已自动放行 (full_auto)', '自動承認 (full_auto)', 'Auto-approved (full_auto)') }}</span>
                  <span class="stone-tool-Status is-ok">{{ tt('已完成', '完了', 'Completed') }} ▾</span>
                </div>
                <pre v-if="expandedTools.t1" class="stone-tool-code">+ L2_RETROSPECTIVE_NOTICE = "[Runtime notice] Repeated identical tool failure detected..."
+ def evaluate_step(obs: StepObservation) -> StuckDecision: ...</pre>
              </div>

              <div class="stone-tool-card" @click="toggleTool('t2')">
                <div class="stone-tool-head">
                  <span class="stone-tool-icon">💻</span>
                  <span class="stone-tool-name">run_powershell · <code>python -m unittest discover -s tests -v</code></span>
                  <span class="stone-auto-tag">{{ tt('已自动放行 (full_auto)', '自動承認 (full_auto)', 'Auto-approved (full_auto)') }}</span>
                  <span class="stone-tool-Status is-ok">86 OK (1.8s) ▾</span>
                </div>
                <pre v-if="expandedTools.t2" class="stone-tool-code">test_stream_reset_on_llm_retry (tests.test_turn_hub.TurnHubTest) ... ok
test_shadow_checkpoint_preserves_user_index (tests.test_git_checkpoints.CheckpointTest) ... ok
test_stuck_detector_l2_retrospective (tests.test_stuck_detector.StuckTest) ... ok
----------------------------------------------------------------------
Ran 86 tests in 1.842s — OK</pre>
              </div>

              <!-- 轻量检查点提示 -->
              <div class="stone-checkpoint-banner">
                <span>📌 {{ tt('已创建影子 Git 检查点 #2（未改动您的分支与 git status，可在右侧查看 Diff 或一键回滚）', 'シャドウGitチェックポイント #2 を作成しました（ブランチや git status は無変更。右パネルでDiff確認・ロールバック可能）', 'Created Shadow Git Checkpoint #2 (User HEAD & index untouched; inspect Diff or rollback on the right)') }}</span>
              </div>

              <!-- P2 显式完成协议卡片 -->
              <div class="stone-completion-card">
                <div class="stone-completion-head">
                  <span class="stone-badge is-success">✓ {{ tt('Completion Gate 通过', '完了ゲート検証済み', 'Completion Gate Passed') }}</span>
                  <span class="stone-completion-sub">P2 Explicit Completion Protocol</span>
                </div>
                <div class="stone-completion-body">
                  {{ tt(
                    '已完成流式重试回滚（stream_reset）与二阶卡死自省（StuckDetector L2）改造，86 项单元测试全部通过，会话进度笔记已归档。',
                    'ストリーム再試行時のリセット（stream_reset）および2段階スタック検知（StuckDetector L2）の実装が完了し、全86件の単体テスト通過を確認しました。',
                    'Completed stream_reset retry rollback and StuckDetector L2 retrospective injection. All 86 unit tests passed.'
                  ) }}
                </div>
              </div>
            </div>
          </template>

          <!-- ==================== 场景 2：高保真文档工作台 & 划取 AI 修改 ==================== -->
          <template v-else-if="activeScenario === 'workbench'">
            <div class="stone-user-msg">
              {{ tt(
                '结合本地 RAGFlow 知识库里的《企业安全合规规范》，生成一份架构评审 PPT，并把第 2 页的核心结论精简为 3 条量化指标。',
                'ローカル RAGFlow ナレッジベースの『社内セキュリティ準拠規約』を参照し、アーキテクチャ審査用PPTを作成してください。また2ページ目の結論を3つの定量指標に要約してください。',
                'Using the local RAGFlow security compliance knowledge base, generate an Architecture Review PPTX and refine Slide 2 into 3 quantitative metrics.'
              ) }}
            </div>

            <div class="stone-assistant-block">
              <div class="stone-tool-card">
                <div class="stone-tool-head">
                  <span class="stone-tool-icon">🔍</span>
                  <span class="stone-tool-name">knowledge_search · <code>dataset="sec_compliance_jp"</code></span>
                  <span class="stone-tool-Status is-ok">{{ tt('命中 4 条本地证据链', 'ローカル根拠 4件ヒット', '4 Local Evidences') }}</span>
                </div>
              </div>

              <!-- 选区胶囊提示 -->
              <div class="stone-selection-chip-bar">
                <span class="stone-sel-chip">
                  🎯 <code>架构评审汇报_2026.pptx</code> · {{ tt('第 2 页 · 标题与正文文本框 (Shape 104)', 'スライド 2 · テキストボックス (Shape 104)', 'Slide 2 · Shape 104') }}
                </span>
              </div>

              <div class="stone-tool-card">
                <div class="stone-tool-head">
                  <span class="stone-tool-icon">✨</span>
                  <span class="stone-tool-name">patch_file_selection · <code>slide_index=2, shape_id=104</code></span>
                  <span class="stone-tool-Status is-ok">{{ tt('SSE 原地热更新完成', 'SSE インプレース更新完了', 'In-place SSE Hot-Reloaded') }}</span>
                </div>
              </div>

              <!-- 最终交付产物卡片（ArtifactCardList，自动过滤中间 .py 脚本） -->
              <div class="stone-artifact-card" @click="showWorkbench = true">
                <div class="stone-artifact-icon">📊</div>
                <div class="stone-artifact-info">
                  <div class="stone-artifact-name">架构评审汇报_2026.pptx</div>
                  <div class="stone-artifact-meta">{{ tt('最终交付产物（已自动过滤中间生成脚本 · 点击在右侧预览与编辑）', '最終成果物（中間スクリプトを自動除外 · 右パネルで直接編集可能）', 'Final Deliverable (Intermediate scripts filtered · Click to edit on right)') }}</div>
                </div>
                <span class="stone-badge is-success">{{ tt('预览中', 'プレビュー中', 'Previewing') }}</span>
              </div>
            </div>
          </template>

          <!-- ==================== 场景 3：Git Worktree 多智能体团队 ==================== -->
          <template v-else>
            <div class="stone-user-msg">
              {{ tt(
                '启动团队模式：分配 3 名常驻队友分别在独立 Git Worktree 下并行完成「后端权限接口」、「前端 PermissionModeButton 组件」与「边界安全测试」。',
                'チームモードを起動：3名の常駐メイトをそれぞれ独立した Git Worktree に割り当て、「バックエンド権限API」「フロントエンドボタン」「境界セキュリティテスト」を並列実装してください。',
                'Launch Team Mode: assign 3 resident teammates in isolated Git Worktrees to build Backend Permission API, Frontend Button, and Security Boundary Tests in parallel.'
              ) }}
            </div>

            <div class="stone-assistant-block">
              <div class="stone-team-grid">
                <div class="stone-mate-card">
                  <div class="stone-mate-top">
                    <strong>👤 mate-backend</strong>
                    <span class="stone-badge is-success">{{ tt('运行中', '実行中', 'Running') }}</span>
                  </div>
                  <div class="stone-mate-wt">🌿 Worktree: <code>.hyn_wt/mate-backend</code></div>
                  <p class="stone-mate-desc">{{ tt('已完成 permission_mode.py 与 PATCH /sessions/{id} 实时广播。', 'permission_mode.py と PATCH /sessions/{id} 実装完了。', 'Implemented permission_mode.py & live session PATCH.') }}</p>
                </div>

                <div class="stone-mate-card">
                  <div class="stone-mate-top">
                    <strong>👤 mate-frontend</strong>
                    <span class="stone-badge" :class="matePlanApproved ? 'is-success' : ''">
                      {{ matePlanApproved ? tt('计划已批 · 写入中', '承認済 · 書込中', 'Approved · Writing') : tt('等待批准计划', '計画承認待ち', 'Awaiting Plan Approval') }}
                    </span>
                  </div>
                  <div class="stone-mate-wt">🌿 Worktree: <code>.hyn_wt/mate-frontend</code></div>
                  <p class="stone-mate-desc">{{ tt('计划在计划获批前仅允许只读探测，防止队友越权改乱工作区。', '計画承認前は読取専用に制限（勝手なファイル変更を防止）。', 'Read-only until plan is approved by Lead/User.') }}</p>
                  <button
                    type="button"
                    class="stone-approve-btn"
                    @click="matePlanApproved = !matePlanApproved"
                  >
                    {{ matePlanApproved ? tt('✓ 已批准写盘权限（点击可重置）', '✓ 書込許可済み（クリックでリセット）', '✓ Write Approved (Click to reset)') : tt('🛡️ 批准队友重构计划（解锁 Worktree 写入）', '🛡️ メイトの計画を承認（Worktree 書込を解禁）', '🛡️ Approve Teammate Plan (Unlock Writes)') }}
                  </button>
                </div>

                <div class="stone-mate-card">
                  <div class="stone-mate-top">
                    <strong>👤 mate-sec-test</strong>
                    <span class="stone-badge is-success">{{ tt('已完成', '完了', 'Completed') }}</span>
                  </div>
                  <div class="stone-mate-wt">🌿 Worktree: <code>.hyn_wt/mate-sec-test</code></div>
                  <p class="stone-mate-desc">{{ tt('验证 full_auto 模式下越出工作区与高危系统指令 100% 硬拒绝。', 'full_auto 時のワークスペース外操作・危険コマンド100%拒否を検証。', 'Verified 100% hard-deny for out-of-workspace & system commands.') }}</p>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- 底部贴边白书写条（遵循石澜五处锁死之四：白带贴住主区底边，顶上一条分割线） -->
        <footer class="stone-composer-band">
          <div class="stone-composer-inner">
            <div class="stone-composer-input-mock">
              {{ tt('输入后续指令，或在右侧预览区用鼠标划取任意段落/单元格触发「✨ AI 修改」…', '指示を入力、または右プレビューで範囲選択して「✨ AI修正」を実行…', 'Type instructions, or select any paragraph/cell in the right preview to trigger "✨ AI Edit"...') }}
            </div>
            <div class="stone-composer-toolbar">
              <!-- 模型选择器（展示 Ollama 本机离线与企业内网） -->
              <span class="stone-toolbar-pill">
                🟢 Ollama · qwen2.5-coder:32b (127.0.0.1)
              </span>

              <div class="stone-toolbar-spacer"></div>

              <!-- 权限模式 4 档实时切换按钮（PermissionModeButton.js 复刻） -->
              <div class="stone-pop-anchor">
                <button
                  type="button"
                  class="stone-perm-btn"
                  :class="{ 'is-danger': permMode === 'full_auto', 'is-accent': permMode === 'ask_all' }"
                  @click="showPermMenu = !showPermMenu; showContextPopover = false"
                >
                  {{ currentPermObj.label }} ▴
                </button>
                <div v-if="showPermMenu" class="stone-popover stone-perm-popover">
                  <div class="stone-popover-title">{{ tt('会话权限模式（运行中切换立即在下一次工具调用生效）', '権限モード（実行中の切替も即座に次のツール呼出から反映）', 'Permission Mode (Live switch takes effect on next tool call)') }}</div>
                  <div
                    v-for="item in permOptions"
                    :key="item.id"
                    class="stone-perm-opt"
                    :class="{ 'is-selected': permMode === item.id }"
                    @click="changePermMode(item.id)"
                  >
                    <div class="stone-perm-opt-name">{{ item.label }}</div>
                    <div class="stone-perm-opt-desc">{{ item.desc }}</div>
                  </div>
                </div>
              </div>

              <!-- 上下文与时长预算圆环（ContextRing.js 复刻） -->
              <div class="stone-pop-anchor">
                <button
                  type="button"
                  class="stone-ring-btn"
                  @click="showContextPopover = !showContextPopover; showPermMenu = false"
                >
                  <span class="stone-ring-circle"></span>
                  <span>24% · 31k/128k</span>
                </button>
                <div v-if="showContextPopover" class="stone-popover stone-ring-popover">
                  <div class="stone-popover-title">{{ tt('长程运行预算与记忆状态 (P1 + Memory)', '長時間実行バジェット＆メモリ状態', 'Long-Horizon Budget & Memory Status') }}</div>
                  <div class="stone-ring-row"><span>Token Budget:</span> <strong>31,240 / 128,000 (24%)</strong></div>
                  <div class="stone-ring-row"><span>Time Budget:</span> <strong>26m / 240m (Unattended)</strong></div>
                  <div class="stone-ring-row"><span>Prefix Cache:</span> <strong class="is-green">Frozen Snapshot Hit (94%)</strong></div>
                  <div class="stone-ring-row"><span>Progress Notes:</span> <strong>Active (1,420 / 8,000 chars)</strong></div>
                </div>
              </div>

              <!-- 石澜靛蓝发送按钮 (#0f4c81) -->
              <button type="button" class="stone-send-btn">
                {{ tt('发送', '送信', 'Send') }}
              </button>
            </div>
          </div>
        </footer>
      </main>

      <!-- 右侧高保真预览与检查点工作台（PreviewWorkbench.js 复刻） -->
      <aside v-if="showWorkbench" class="stone-workbench">
        <!-- 场景 1 右侧：影子 Git 检查点与进度笔记面板 -->
        <template v-if="activeScenario === 'longrun'">
          <div class="stone-wb-header">
            <span class="stone-wb-title">🌿 {{ tt('影子 Git 检查点 (Shadow Checkpoints)', 'シャドウGitチェックポイント', 'Shadow Git Checkpoints') }}</span>
            <span class="stone-badge">{{ tt('零工作区污染', 'HEAD・Index 無変更', 'Zero HEAD Pollution') }}</span>
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
                <div><strong>{{ cp.id }} · {{ cp.step }}</strong> ({{ cp.time }})</div>
                <div class="stone-cp-tab-sub">{{ cp.summary }}</div>
              </button>
            </div>
            <div class="stone-cp-detail">
              <div class="stone-cp-ref">{{ checkpoints[selectedCheckpointIdx].ref }}</div>
              <pre class="stone-cp-diff">{{ checkpoints[selectedCheckpointIdx].diff }}</pre>
              <div class="stone-cp-note">
                💡 {{ tt(
                  '原理：通过临时 GIT_INDEX_FILE + git commit-tree 写入私有引用，绝不改动用户当前分支与暂存区。',
                  '仕組み：一時 GIT_INDEX_FILE と git commit-tree で専用refに記録。作業中ブランチを一切汚しません。',
                  'Mechanism: Uses temporary GIT_INDEX_FILE + git commit-tree into private refs without touching user HEAD.'
                ) }}
              </div>
            </div>
          </div>
        </template>

        <!-- 场景 2 & 3 右侧：WPS 级高保真文档预览工作台 + 划取 AI 修改 -->
        <template v-else>
          <div class="stone-wb-header">
            <span class="stone-wb-title">📊 架构评审汇报_2026.pptx</span>
            <span class="stone-badge is-success">{{ tt('历史快照 v3/5', 'スナップショット v3/5', 'Snapshot v3/5') }}</span>
          </div>
          <!-- WPS 级格式工具栏（WpsFormatToolbar.js 复刻） -->
          <div class="stone-wps-bar">
            <span class="stone-wps-item">Yu Gothic UI ▾</span>
            <span class="stone-wps-item">18px ▾</span>
            <span class="stone-wps-item"><b>B</b></span>
            <span class="stone-wps-item"><i>I</i></span>
            <span class="stone-wps-item"><u>U</u></span>
            <span class="stone-wps-item">🎨 #0f4c81</span>
            <span class="stone-wps-spacer"></span>
            <button type="button" class="stone-wps-ai-btn" @click="triggerAiSelectionPatch">
              ✨ {{ aiPatchApplied ? tt('撤销本次 AI 修改', 'AI修正を元に戻す', 'Undo AI Edit') : tt('点此体验「✨ AI 局部修改」', 'クリックして「✨ AI部分修正」を体験', 'Click to Try "✨ AI In-Place Edit"') }}
            </button>
          </div>

          <div class="stone-wb-body">
            <!-- 16:9 PPT 画布预览 -->
            <div class="stone-ppt-canvas">
              <div class="stone-ppt-slide-tag">Slide 02 / 12 · Architecture & Security</div>
              <div class="stone-ppt-h1">
                {{ tt('全本地离线架构与长程自治可靠性指标', '完全ローカル構成と長時間自律稼働の信頼性指標', '100% Local Architecture & Long-Horizon Reliability') }}
              </div>

              <!-- 鼠标划取锚点区域（带右上角浮窗按钮 AiSelectionPopover） -->
              <div class="stone-ppt-shape" :class="{ 'is-patched': aiPatchApplied }" @click="triggerAiSelectionPatch">
                <div class="stone-floating-popover">
                  ✨ {{ aiPatchApplied ? tt('已通过 SSE 原地热替换 (点击切换)', 'SSE インプレース更新完了', 'SSE Hot-Reloaded') : tt('✨ AI 修改 (Ctrl+L · 点击我)', '✨ AI修正 (Ctrl+L · クリック)', '✨ AI Edit (Ctrl+L · Click me)') }}
                </div>

                <template v-if="!aiPatchApplied">
                  <p class="stone-ppt-raw">
                    {{ tt(
                      '【修改前草稿】本系统支持连接本地 Ollama 与企业内网大模型，所有对话、记忆和知识库都在本地处理，同时通过 TurnHub 与影子检查点保障数小时运行不丢失进度。',
                      '【修正前の下書き】本システムはローカル Ollama や社内LANモデルに接続可能で、会話・メモリ・知識ベースをすべてローカルで処理し、TurnHub とシャドウチェックポイントで長時間稼働を実現します。',
                      '[Draft Before AI Edit] Connects to local Ollama and intranet LLMs, keeping all data local while using TurnHub and shadow checkpoints for long runs.'
                    ) }}
                  </p>
                </template>
                <template v-else>
                  <ul class="stone-ppt-refined">
                    <li><strong>0 外部通信 (Zero Egress)</strong>：{{ tt('127.0.0.1 原生闭环，源码与文档 100% 不出社内网络', '127.0.0.1 完結、機密コード・文書の外部送信ゼロ', '127.0.0.1 loop, zero external code leakage') }}</li>
                    <li><strong>94% Prefix Cache 命中率</strong>：{{ tt('会话级冻结记忆快照 + 异步提取队列，大幅降低长任务首字延迟', 'セッション凍結メモリスナップショットによりTTFTを大幅短縮', 'Session-frozen memory snapshot preserves LLM prefix cache') }}</li>
                    <li><strong>100% 状态可回滚</strong>：{{ tt('TurnHub 单调 seq 流式重连 + 无侵入影子 Git 检查点', 'TurnHub 単調増加 seq 再接続 + 非侵襲シャドウGitチェックポイント', 'Monotonic seq replay + non-invasive Shadow Git Checkpoints') }}</li>
                  </ul>
                </template>
              </div>
            </div>
          </div>
        </template>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.pg-wrapper {
  margin: 24px 0;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  background: #ffffff;
  overflow: hidden;
}

.pg-scenario-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-hover);
  border-bottom: 1px solid var(--border-subtle);
}

.pg-scenario-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 650;
  color: var(--text-primary);
}

.pg-live-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--status-success);
}

.pg-scenario-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pg-tab-btn {
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
  background: #ffffff;
  color: var(--text-secondary);
  cursor: pointer;
}

.pg-tab-btn.is-active {
  background: var(--bg-selected);
  color: var(--accent);
  border-color: var(--accent);
  font-weight: 650;
}

/* 石澜桌面客户端主容器 */
.stone-window {
  display: flex;
  min-height: 540px;
  background: var(--bg-app);
  color: var(--text-primary);
  font-size: 13px;
}

/* 左侧 260px 白侧栏 */
.stone-sidebar {
  width: 240px;
  flex: none;
  display: flex;
  flex-direction: column;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-subtle);
}

.stone-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 14px 12px;
}

.stone-mark {
  width: 3px;
  height: 28px;
  border-radius: 2px;
  background: var(--accent);
  flex: none;
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
  padding: 4px 8px;
}

.stone-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  padding: 0 8px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12.5px;
}

.stone-nav-item:hover {
  background: var(--bg-hover);
}

/* 遵循石澜规范：选中态浅底 #e6eef8 + 靛蓝字 #0f4c81 + 圆角 6，无左竖条 */
.stone-nav-item.is-active {
  background: var(--bg-selected);
  color: var(--accent);
  font-weight: 650;
}

.stone-nav-tag {
  margin-left: auto;
  padding: 0 6px;
  font-size: 11px;
  border-radius: 4px;
  background: var(--bg-selected-strong);
  color: var(--accent);
}

.stone-recent-header {
  padding: 12px 14px 4px;
  font-size: 11px;
  font-weight: 650;
  color: var(--text-tertiary);
}

.stone-recent-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 8px;
  flex: 1;
}

.stone-recent-item {
  padding: 6px 8px;
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
  font-size: 11px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
}

.stone-sidebar-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-top: 1px solid var(--border-subtle);
  font-size: 11px;
}

.stone-status-pill {
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-weight: 650;
}

.stone-status-pill.is-ok {
  background: var(--status-success-bg);
  color: var(--status-success);
}

.stone-footer-text {
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 中间石底主舞台 (#e4e8f0) */
.stone-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg-app);
}

.stone-main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
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
  padding: 3px 10px;
  font-size: 11.5px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
  background: #ffffff;
  color: var(--text-secondary);
  cursor: pointer;
}

.stone-chat-scroll {
  flex: 1;
  padding: 16px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 用户消息左细线，助手正文直接落在石底上 */
.stone-user-msg {
  padding: 8px 12px;
  background: #ffffff;
  border-left: 3px solid var(--accent);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 13px;
}

.stone-assistant-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stone-thought-box {
  padding: 8px 12px;
  border-left: 2px solid var(--border-strong);
  color: var(--text-secondary);
  font-size: 12px;
}

.stone-thought-box p {
  margin: 4px 0 0;
  line-height: 1.5;
}

.stone-thought-label {
  font-weight: 650;
  color: var(--text-tertiary);
}

.stone-tool-card {
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  cursor: pointer;
}

.stone-tool-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
}

.stone-tool-name {
  font-weight: 600;
  color: var(--text-primary);
}

.stone-auto-tag {
  padding: 1px 6px;
  font-size: 11px;
  border-radius: 4px;
  background: var(--bg-selected);
  color: var(--accent);
}

.stone-tool-Status {
  margin-left: auto;
  font-size: 11px;
  font-weight: 650;
}

.stone-tool-Status.is-ok {
  color: var(--status-success);
}

.stone-tool-code {
  margin: 8px 0 0;
  padding: 8px;
  background: var(--bg-code);
  border-radius: 4px;
  font-size: 11px;
  font-family: var(--font-mono);
  overflow-x: auto;
  line-height: 1.45;
}

.stone-checkpoint-banner {
  padding: 6px 10px;
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
  padding: 10px 12px;
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
  font-size: 12px;
  font-weight: 600;
}

.stone-artifact-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #ffffff;
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.stone-artifact-icon {
  font-size: 22px;
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

/* 场景 3 团队网格 */
.stone-team-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stone-mate-card {
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
}

.stone-mate-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 650;
  border-radius: var(--radius-sm);
  border: 1px solid var(--accent);
  background: var(--bg-selected);
  color: var(--accent);
  cursor: pointer;
}

/* 底部贴边白书写条（遵循石澜五处锁死之四） */
.stone-composer-band {
  background: #ffffff;
  border-top: 1px solid var(--border-subtle);
  padding: 10px 16px;
}

.stone-composer-inner {
  max-width: 640px;
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
  font-size: 11.5px;
  font-family: var(--font-mono);
  padding: 3px 8px;
  background: var(--bg-hover);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
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
  gap: 5px;
  height: 28px;
  padding: 0 8px;
  font-size: 11.5px;
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
  width: 280px;
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
  font-size: 12px;
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

/* 发送按钮锁死靛蓝 #0f4c81、高 32、圆角 6 */
.stone-send-btn {
  height: 30px;
  padding: 0 14px;
  border-radius: var(--radius-sm);
  border: none;
  background: var(--accent);
  color: var(--on-accent);
  font-size: 12px;
  font-weight: 650;
}

/* 右侧高保真预览工作台 */
.stone-workbench {
  width: 340px;
  flex: none;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-left: 1px solid var(--border-subtle);
}

.stone-wb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
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
  padding: 6px 10px;
  background: var(--bg-hover);
  border-bottom: 1px solid var(--border-subtle);
  font-size: 11px;
}

.stone-wps-item {
  padding: 2px 5px;
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
}

.stone-wps-spacer {
  flex: 1;
}

.stone-wps-ai-btn {
  padding: 3px 8px;
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
  padding: 12px;
  overflow-y: auto;
}

.stone-cp-tabs {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
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

.stone-cp-tab-sub {
  margin-top: 2px;
  color: var(--text-secondary);
}

.stone-cp-ref {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-tertiary);
  margin-bottom: 6px;
}

.stone-cp-diff {
  padding: 8px;
  background: var(--bg-code);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  font-size: 11px;
  font-family: var(--font-mono);
  overflow-x: auto;
  line-height: 1.45;
}

.stone-cp-note {
  margin-top: 8px;
  font-size: 11.5px;
  color: var(--text-secondary);
  line-height: 1.45;
}

.stone-ppt-canvas {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 12px;
  background: var(--bg-hover);
}

.stone-ppt-slide-tag {
  font-size: 10.5px;
  font-family: var(--font-mono);
  color: var(--text-tertiary);
}

.stone-ppt-h1 {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--accent);
  margin: 6px 0 10px;
}

.stone-ppt-shape {
  position: relative;
  padding: 26px 10px 10px;
  background: #ffffff;
  border: 2px dashed var(--accent);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 200ms ease, border-color 200ms ease;
}

.stone-ppt-shape.is-patched {
  background: var(--status-success-bg);
  border: 2px solid var(--status-success);
}

.stone-floating-popover {
  position: absolute;
  top: 4px;
  right: 6px;
  padding: 2px 8px;
  font-size: 11px;
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
  line-height: 1.5;
}

.stone-ppt-refined {
  margin: 0;
  padding-left: 16px;
  font-size: 11.5px;
  color: var(--text-primary);
  line-height: 1.55;
}

@media (max-width: 960px) {
  .stone-window {
    flex-direction: column;
  }
  .stone-sidebar,
  .stone-workbench {
    width: 100%;
    border-right: none;
    border-left: none;
    border-bottom: 1px solid var(--border-subtle);
  }
}
</style>
