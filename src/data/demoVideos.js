/**
 * 官网 5 大实机录屏演示数据源（首页首屏舞台 + `/demo` 实机演示中心单一事实源）。
 *
 * 维护契约：
 * - 所有时长与分辨率严格对应 `docs/public/media/*.mp4` 真实媒体头元数据。
 * - 支持中（zh）/ 日（ja）/ 英（en）三语完整切换，严禁出现单语种硬编码残留。
 */
import { tt, getLangPrefix } from './siteData.js'

export function getDemoScenarios(lang) {
  const p = getLangPrefix(lang)
  const t = (zh, ja, en) => tt(lang, zh, ja, en)

  return [
    {
      id: 'hero-q3-delivery',
      num: '01',
      isHero: true,
      videoUrl: '/media/hero-q3-delivery.mp4',
      duration: '01:06',
      icon: 'layers',
      shortTab: t(
        '主展示 · 看板与 PPT/Excel 交付',
        'メイン · 分析アプリ＆Office一括交付',
        'Flagship · Web App + PPT/Excel'
      ),
      badge: t('端到端全链路交付', '一気通貫の自律構築', 'End-to-End Delivery'),
      title: t(
        '一句话接管本机业务表：交付经营看板 Web 应用 + 复盘 PPTX + 审计 Excel',
        'ローカル業務CSVから一気通貫：分析Webボード＋振り返りPPTX＋監査Excelを同時交付',
        'From Local CSVs in One Prompt: Live Analytics Web App, Executive PPTX & Audit XLSX'
      ),
      windowTitle: t(
        'Helm Desktop — 读取本地 Q3 业务数据，构建看板服务并交付 PPTX / XLSX（01:06 实机录屏）',
        'Helm Desktop — ローカルQ3データ解析・Webボード起動＆PPTX / XLSX一括生成（01:06 実機収録）',
        'Helm Desktop — Local Q3 CSVs to Verified Web Dashboard, PPTX & XLSX (01:06 Live Recording)'
      ),
      desc: t(
        '直接读取本地工作区 360 笔订单与投放明细，自主编写 FastAPI 响应式看板并跑通 pytest 财务口径校验，后台拉起服务的同时生成原生复盘 PPTX 与渠道盈亏 Excel，在右侧双模工作台无缝切屏验证。',
        'ローカルの注文360件と広告費CSVを直接読み取り、FastAPI分析ボードの実装と pytest 検証を完遂。バックグラウンド起動と同時に PPTX と Excel を生成し、右ワークベンチで即座に確認します。',
        'Reads 360 local order rows and ad-spend CSVs, builds and pytest-verifies a FastAPI analytics dashboard running in the background, and delivers native PPTX & XLSX files in the split workbench.'
      ),
      highlights: [
        {
          step: '01',
          title: t('直接接管本机业务原始表', 'ローカル生データを直接解析', 'Ingests Raw Local CSVs'),
          desc: t(
            '读取工作区 360 笔订单与 6 大渠道投放成本，自动定位约 39% 高退货率的亏损异常渠道。',
            '注文360件と6チャネルの費用を読み取り、返品率約39%の赤字異常チャネルを自動特定。',
            'Parses 360 orders across 6 channels on disk, isolating a ~39% high-refund loss-making channel.'
          )
        },
        {
          step: '02',
          title: t('全栈编码 + 单测 + 后台拉起', '実装・単体テスト・裏側起動', 'Code, Pytest & Background Launch'),
          desc: t(
            '跑通 pytest 核算断言后在「执行现场」后台常驻启动看板服务，全程零人工干预。',
            'pytest で集計ロジックを検証後、「実行現場」でローカルWebサーバーを常駐起動。',
            'Verifies accounting math via pytest, then launches the live FastAPI server in InspectorDock.'
          )
        },
        {
          step: '03',
          title: t('多格式同屏预览与实机交互', '同画面Office確認＆実機操作', 'Multi-Tab Preview & Live App'),
          desc: t(
            '切换至「文件预览」多页签原生查看 5 页汇报 PPTX 与审计 XLSX，并在本机浏览器交互验证。',
            '「プレビュー」で5頁のPPTXと監査XLSXをネイティブ表示し、ブラウザで実機ボードを操作。',
            'Previews the 5-slide PPTX and audit XLSX in PreviewDock tabs, then interacts with the live web app.'
          )
        }
      ],
      prepNote: t(
        '工作区预置 q3_orders_2026.csv、q3_channel_spend_2026.csv 与业务统计口径说明.md。',
        'ワークスペースに注文CSV・広告費CSV・集計定義書を配置した状態で実行。',
        'Run inside a workspace containing q3_orders_2026.csv, q3_channel_spend_2026.csv, and metric definitions.'
      ),
      prompt: `请读取当前工作区中的 \`q3_orders_2026.csv\`、\`q3_channel_spend_2026.csv\` 与 \`业务统计口径说明.md\`，一次性帮我完成以下三项交付并确保全部自检通过：
1. 开发一套现代极简风格的「2026 Q3 经营分析与异常监控看板」Web 应用（FastAPI + 单页响应式图表，展示全盘核心 KPI、各渠道净营收与经营利润对比、高退货亏损渠道红色预警及原因拆解），编写并运行 pytest 校验财务核算准确后，在后台启动本地服务；
2. 基于同一套准确核算结果，生成《2026 Q3 经营复盘与渠道调优汇报.pptx》（5 页：核心结论、月度趋势、渠道盈亏拆解、亏损根因诊断、Q4 调优方案）与《Q3_渠道盈亏审计汇总表.xlsx》；
3. 最后通过文件卡片将生成的 PPTX、XLSX 与看板页面呈现在右侧工作台供我预览。`,
      docLink: `${p}/architecture/overview`,
      docLabel: t('阅读第 1 卷：双进程与总体架构', '第1章：全体アーキテクチャを読む', 'Read Vol. 01: System Topology')
    },
    {
      id: 'office-patch',
      num: '02',
      isHero: false,
      videoUrl: '/media/feat-office-patch.mp4',
      duration: '00:23',
      icon: 'pen',
      shortTab: t('PPT 靶向热更新', 'PPT ピンポイント更新', 'Surgical PPT Patch'),
      badge: t('同屏可视化文档工作台', '同画面 Office ワークベンチ', 'Visual Office Workbench'),
      title: t(
        '指哪改哪的 Office 手术刀：点选 PPT 第 3 页草稿卡片，原地无闪烁热更新',
        '狙った枠だけ書き換える Office メス：PPT第3ページの草稿枠をインプレース即時更新',
        'Surgical PPT Hot-Patching: Click One Slide Card, Rewrite In-Place Without Layout Drift'
      ),
      windowTitle: t(
        'Helm Desktop — 单击 PPT 第 3 页黄色草稿文本框，SSE 原地热更新量化结论（00:23 实机录屏）',
        'Helm Desktop — PPT第3ページの草稿枠を選択し、定量ROI結論へSSE即時更新（00:23 実機収録）',
        'Helm Desktop — Click Slide 3 Draft Shape & Hot-Patch Quantified ROI Points (00:23 Live Recording)'
      ),
      desc: t(
        '告别命令行盲改整份文档导致排版崩坏。在右侧工作台 16:9 原生画布上单击选中第 3 页右侧黄色草稿框加入对话选区，AI 调用 patch_file_selection 仅重写该形状文本并原地无闪烁刷新。',
        'スクリプトで文書全体を上書きしてレイアウトを崩す問題を解消。右ペインの16:9キャンバス上で第3ページの黄色い草稿枠をクリックして選択追加すると、対象図形のみを即座に部分更新します。',
        'Eliminates blind full-file rewrites that break slide formatting. Click the yellow draft shape on Slide 3 in the right-hand 16:9 canvas to attach its SelectionAnchor, hot-patching just that shape in place.'
      ),
      highlights: [
        {
          step: '01',
          title: t('右侧多页签原生 16:9 画布', '右ペイン16:9ネイティブ表示', 'Native 16:9 Split Canvas'),
          desc: t(
            '内置 PPTX / DOCX / XLSX 原生编辑器与多页签保活，无需切出客户端即可检视幻灯片结构。',
            'PPTX / DOCX / XLSX 等のネイティブプレビューを統合し、外部ソフト不要でスライドを確認。',
            'Renders editable slide thumbnails and vector shapes natively alongside multi-format tabs.'
          )
        },
        {
          step: '02',
          title: t('单击草稿卡片注入靶向选区', '図形クリックで選択チップ化', '1-Click Shape Selection Anchor'),
          desc: t(
            '在 PPT 第 3 页直接点击右侧黄色口语草稿框，将其形状坐标作为选区芯片带入底部输入框。',
            'スライド3右側の口語草稿ボックスをクリックし、図形ロケータを入力欄のチップとして添付。',
            'Clicking the yellow draft card on Slide 3 attaches its exact slide & shape locator to chat.'
          )
        },
        {
          step: '03',
          title: t('23 秒一镜原地热替换', '23秒で書式維持インプレース更新', 'Zero-Flicker SSE Hot-Patch'),
          desc: t(
            '精准改写为 3 条量化 ROI 要点并亮起未读改动徽标，周围卡片配色、字号与多页签状态零受损。',
            '3つの定量ROI要点へ瞬時に書き換え、周囲のカード配色やレイアウトを100%無傷で維持。',
            'Rewrites the draft into 3 crisp ROI bullets via SSE while keeping surrounding layout untouched.'
          )
        }
      ],
      prepNote: t(
        '前置状态：在右侧预览打开立项汇报 PPTX 切至第 3 页，点击右侧黄色「待精炼草稿」卡片加入对话选区后发送。',
        '事前状態：右ペインで企画書PPTXの第3ページを開き、右側の黄色い草稿カードを選択範囲に追加して送信。',
        'Setup: Open the proposal PPTX on Slide 3 in PreviewDock, click the right-hand yellow draft card to add selection, then send.'
      ),
      prompt: `把这段口语草稿改写为正式立项汇报的 3 条量化结论：突出“单题修复成本仅 ¥0.27”、“四层前缀缓存命中率 97.74%”以及“首月即可收回部署投入”，语言精炼克制。`,
      docLink: `${p}/architecture/workbench`,
      docLabel: t('阅读第 5 卷：双模工作台与局部热补丁', '第5章：ワークベンチ＆部分更新を読む', 'Read Vol. 05: Dual Workbench & Patch')
    },
    {
      id: 'worktree-race',
      num: '03',
      isHero: false,
      videoUrl: '/media/feat-worktree-race.mp4',
      duration: '01:06',
      icon: 'git-branch',
      shortTab: t('Worktree 双方案赛马', 'Worktree 並列比較', 'Worktree Race & Merge'),
      badge: t('多智能体隔离并发', 'マルチエージェント並列分離', 'Multi-Agent Worktrees'),
      title: t(
        '零拷贝 Git Worktree 双队友同题赛马：两套界面并行实现，并排审阅 Diff 择优合入',
        'Git Worktree 2メイト同時実装：2つのUI案を競合ゼロで並列構築し、差分比較で採用',
        'Zero-Copy Git Worktree Race: Two Resident Teammates Build Competing UIs Side-by-Side'
      ),
      windowTitle: t(
        'Helm Desktop — 派出双常驻队友在独立 Worktree 并行开发并对比 Diff 合入（01:06 实机录屏）',
        'Helm Desktop — 独立 Worktree で2メイトが並列開発し差分比較から3-way統合（01:06 実機収録）',
        'Helm Desktop — Dual Teammates Race in Isolated Worktrees with Side-by-Side Diff Merge (01:06)'
      ),
      desc: t(
        '拿不准哪种重构风格更好？主代理创建共享 compare_group 的并行任务，零拷贝拉起 wt_editorial 与 wt_console 独立工作树，两名常驻队友同时改写前端而 0% 写冲突，最后在任务面板并排看 Diff 一键合入。',
        'どちらのUI設計が良いか迷った際、同一 compare_group の並列タスクと独立 Worktree を瞬時に構築。2名の常駐メイトが競合ゼロで同時実装し、タスク画面で差分を並べて比較・ワンクリック統合できます。',
        'Unsure which design direction wins? Lead creates a shared compare_group across isolated Git Worktrees so two teammates build competing layouts concurrently with 0% file collision, ready for side-by-side diff adoption.'
      ),
      highlights: [
        {
          step: '01',
          title: t('原子创建赛马组与隔离工作树', '比較グループ＆Worktree作成', 'Atomic Compare Group & Worktrees'),
          desc: t(
            '自动绑定 compare_group="layout_race"，在 .worktrees/* 下拉起两套互不干扰的工作目录。',
            'compare_group="layout_race" を設定し、独立した2つの .worktrees/* 作業ツリーを生成。',
            'Wires two parallel tasks under layout_race and mounts isolated .worktrees/* directories.'
          )
        },
        {
          step: '02',
          title: t('执行现场实时观测双队友并发', '実行現場で2メイト並列監視', 'Live Dual-Agent Telemetry'),
          desc: t(
            '右侧「执行现场」实时呈现 mate_editorial 与 mate_console 并行推进及 SVG 任务拓扑。',
            '右ペイン「実行現場」で2名のメイトの稼働状況とSVGタスク依存グラフをリアルタイム表示。',
            'InspectorDock tracks both resident teammates and the live SVG task graph concurrently.'
          )
        },
        {
          step: '03',
          title: t('并排对比 Diff 一键 3-Way 合入', '並列Diff比較＆ワンクリック採用', 'Side-by-Side Diff & 3-Way Apply'),
          desc: t(
            '在「项目任务」打开方案对比弹窗审阅两份代码差异，一键无损合入主工作区并支持随时撤销。',
            '「タスク」画面で2案のコード差分を横並びで比較し、勝者をメイン領域へ3-way安全マージ。',
            'Compares both worktree diffs side-by-side in TasksView and applies the winner cleanly.'
          )
        }
      ],
      prepNote: t(
        '前置要求：工作区为已包含初始提交的 Git 仓库（团队设置中常驻队友上限 ≥ 2）。',
        '前提条件：初期コミット済みの Git リポジトリ（チーム設定のメイト上限 ≥ 2）。',
        'Prerequisite: Workspace is an initialized Git repository with teammate limit set to at least 2.'
      ),
      prompt: `我想重构当前项目 \`static/\` 下的集群状态概览页（\`index.html\`、\`styles.css\`、\`dashboard.js\`），但希望先并行做出两套风格迥异的方案对比后再拍板。
请你：
1. 调用 create_tasks 创建两个共享同一个 compare_group（命名为 \`layout_race\`）的并行项目任务；
2. 调用 create_worktree 为这两个任务分别创建独立的 Git Worktree（\`wt_editorial\` 与 \`wt_console\`）；
3. 派出两名常驻队友（\`mate_editorial\` 与 \`mate_console\`）在各自隔离的 Worktree 中同时实现（保持纯静态零外部依赖，确保直接打开 \`static/index.html\` 也能完整渲染）：
   - \`mate_editorial\`：极简白底编辑部风格（大留白、强字重排版对比、1px 低对比度细分割线与状态圆点）；
   - \`mate_console\`：高密度工程师运维台风格（顶部紧凑四宫格 KPI 卡片 + 带搜索过滤与延迟进度条的专业表格）；
完成后通知我去「项目任务」面板并排对比两套 Worktree Diff 并一键择优合入。`,
      docLink: `${p}/architecture/multi-agent-team`,
      docLabel: t('阅读第 3 卷：常驻团队与 Worktree 赛马', '第3章：DAGチーム＆Worktreeを読む', 'Read Vol. 03: Agent Team & Worktrees')
    },
    {
      id: 'plan-diff',
      num: '04',
      isHero: false,
      videoUrl: '/media/feat-plan-diff.mp4',
      duration: '00:46',
      icon: 'shield-check',
      shortTab: t('/plan 澄清与 Diff 审阅', '/plan 質問＆差分レビュー', '/plan Clarify & Diff'),
      badge: t('只读门禁与代码审阅', '読取専用ゲート＆差分検査', 'Read-Only Plan & Diff'),
      title: t(
        '拒绝盲目乱改十几个文件：只读 /plan 多选澄清、方案卡审批与跨文件折叠 Diff',
        '無断変更を物理遮断：読取専用 /plan 質問ウィザード・計画承認＆横断折りたたみDiff',
        'No More Blind Multi-File Edits: Read-Only /plan Clarification, Plan Gate & Shiki Diffs'
      ),
      windowTitle: t(
        'Helm Desktop — /plan 只读探索、多选问题卡对齐与跨文件代码 Diff 逐处审阅（00:46 实机录屏）',
        'Helm Desktop — /plan 読取調査・選択式質問カード・計画承認＆横断Diffレビュー（00:46 実機収録）',
        'Helm Desktop — /plan Read-Only Scan, Clarifying Cards, Plan Approval & Diff Review (00:46)'
      ),
      desc: t(
        '输入 /plan 立即切入物理只读规划态（且不破坏前缀缓存）：先扫描现有路由结构，弹出推荐项置顶的多选澄清卡片确认限流与审计方案，提交结构化实施方案获批后自动改码、跑通 pytest 并在右侧跨文件审阅 Diff。',
        '/plan 入力でキャッシュを壊さず読取専用モードへ移行。既存コード調査後、選択式カードで仕様の分岐を確認し、構造化プランの承認後に実装・pytest 実行・右ペインでの横断Diffレビューまで完結します。',
        'Entering /plan activates prefix-safe read-only mode: scans routes, presents structured multiple-choice clarifying questions, waits for atomic PlanCard approval, runs pytest, and opens cross-file Shiki folded diffs.'
      ),
      highlights: [
        {
          step: '01',
          title: t('只读物理门禁 + 多选澄清卡', '変更遮断＋選択式質問カード', 'Read-Only Gate & Clarify Card'),
          desc: t(
            '未获批前剥离一切写工具，针对限流算法、响应格式与脱敏落盘分歧弹出多选向导对齐意图。',
            '承認前は書込ツールを除外。アルゴリズムやログ形式の分岐を選択式カードで明確化。',
            'Strips mutating tools upfront and batches architectural trade-offs into clean multiple-choice cards.'
          )
        },
        {
          step: '02',
          title: t('结构化实施方案一键放行', '構造化プランカードの承認', 'Atomic PlanCard Approval'),
          desc: t(
            '清晰列出涉及文件清单、潜在风险与验证命令，点击「批准并自动编辑」后才精确落盘补丁。',
            '対象ファイル・リスク・検証コマンドを提示し、「承認して自動編集」クリック後にパッチ適用。',
            'Lists target files, risks, and test commands on PlanCard—executing edits only upon approval.'
          )
        },
        {
          step: '03',
          title: t('单测全绿与跨文件折叠 Diff', 'pytest 合格＆横断Diff検査', 'Pytest Pass & Cross-File Diffs'),
          desc: t(
            '自动补齐限流与审计单测并运行全绿，在右侧通过审阅栏跨文件步进检视 Shiki 语法高亮差异。',
            '単体テスト追加と合格を確認後、右ペインのレビューバーで複数ファイルの差分を順送り確認。',
            'Runs pytest to green, then steps across modified files in PreviewDock with Shiki syntax diffs.'
          )
        }
      ],
      prepNote: t(
        '前置环境：包含清结算路由与基础单测的 FastAPI 微服务仓库（支持直接输入 /plan 触发只读规划）。',
        '対象環境：決済APIルートと基本テストを含む FastAPI リポジトリ（/plan で起動）。',
        'Workspace: Modular FastAPI microservice repo with baseline pytest suite, triggered via /plan.'
      ),
      prompt: `/plan 我想给当前清结算服务补齐「接口限流保护」与「敏感审批操作合规审计日志」，并补全 pytest 单元测试。请先只读扫描 \`src/\` 与 \`tests/\` 代码结构，针对限流算法与维度、超限 HTTP 响应格式以及审计日志脱敏落盘方式等架构分歧点，先用多选问题卡向我确认，再提交结构化实施方案供我审批。`,
      docLink: `${p}/architecture/long-running`,
      docLabel: t('阅读第 2 卷：长程自治与质量门禁', '第2章：自律実行エンジンを読む', 'Read Vol. 02: Long-Horizon Engine')
    },
    {
      id: 'audit-skill',
      num: '05',
      isHero: false,
      videoUrl: '/media/feat-audit-skill.mp4',
      duration: '01:01',
      icon: 'file-check',
      shortTab: t('三单联审与沉淀 Skill', '3文書監査＆Skill化', '3-Doc Audit & Skill'),
      badge: t('异构取证与技能沉淀', '異種文書監査＆自動化', 'Cross-Doc Audit & Cron'),
      title: t(
        'PDF + Excel + Word 三单并发抓虫：揪出 4 处隐蔽漏洞，一键沉淀 /skill 与定时巡检',
        'PDF・Excel・Word 3文書並列監査：4つの隠れた不整合を摘出し、専用 /skill と定期巡回へ定着',
        'Concurrent PDF + XLSX + DOCX Audit: Catch 4 Contract Traps, Mint a /skill & Schedule Cron'
      ),
      windowTitle: t(
        'Helm Desktop — 招标书/报价单/合同三单并发核对，沉淀专属技能与周五定时巡检（01:01 实机录屏）',
        'Helm Desktop — 仕様書・見積・契約書の並列監査、SKILL.md 生成＆毎週金曜Cron登録（01:01 実機収録）',
        'Helm Desktop — 3-Doc Cross Audit, Workspace SKILL.md Creation & Weekly Cron Setup (01:01)'
      ),
      desc: t(
        '面向财务、采购与法务高频痛点：三路只读并发解析招标规范 PDF、供应商报价 XLSX 与采购合同 DOCX，一举抓出 ¥18,000 求和虚增、税率 13%→6% 缩水等 4 处暗坑，输出审计报告并沉淀为可复用技能与每周五自动巡检。',
        '経理・購買・法務の実務課題に直結：入札仕様PDF・見積XLSX・契約案DOCXを3並列で同時解析し、1.8万円の合計水増しや税率変更など4つの罠を摘出。監査報告書の作成から SKILL.md 化・定期Cron登録まで自動化します。',
        'Built for finance, procurement, and legal workflows: parses tender PDF, quote XLSX, and contract DOCX concurrently, catches 4 hidden pricing/tax/SLA traps, writes a DOCX audit report, and saves a reusable skill + weekly Cron.'
      ),
      highlights: [
        {
          step: '01',
          title: t('三路只读并发解析异构文档', '3形式の文書を同時並列読取', '3-Way Concurrent Doc Parsing'),
          desc: t(
            '单轮同时发出 3 次 read_document 调用，毫秒级抽齐 PDF、Excel 与 Word 全文及表格明细。',
            '1ターンで3つの read_document を並列実行し、PDF・Excel・Word の全文と表を瞬時に抽出。',
            'Dispatches three parallel read_document calls to extract PDF, Excel, and Word tables in one turn.'
          )
        },
        {
          step: '02',
          title: t('精准锁定 4 处金额与条款陷阱', '金額水増し・税率等の罠を摘出', 'Pinpoints All 4 Financial Traps'),
          desc: t(
            '查实报价单虚增 ¥18,000 且超封顶预算、税率缩水 7%、工期质保缩水及违约金不对等，产出审计 Word。',
            '合計1.8万円の水増し、税率13%→6%変更、納期・保証短縮、違約金上限2%の罠を漏れなく指摘。',
            'Flags the ¥18k sum inflation, 13%→6% VAT drop, SLA dilution, and 2% penalty cap in a clean DOCX report.'
          )
        },
        {
          step: '03',
          title: t('沉淀团队 /skill 与本地定时巡检', '専用Skill化＆毎週Cron自動化', 'Reusable /skill & Weekly Cron'),
          desc: t(
            '经受保护路径审批写入 skills/contract-audit/SKILL.md，并在「自动化」面板注册每周五 17:00 巡检。',
            '保護パス承認を経て SKILL.md を保存し、「自動化」パネルに毎週金曜17:00の定期監査を登録。',
            'Saves skills/contract-audit/SKILL.md behind Protected Path Guard and schedules a Friday 17:00 Cron job.'
          )
        }
      ],
      prepNote: t(
        '工作区预置埋有 4 处跨表数据矛盾的《招标技术规范书.pdf》《供应商报价明细.xlsx》与《技术采购合同草案.docx》。',
        '4箇所の不整合を仕込んだ仕様書PDF・見積XLSX・契約案DOCXの3点セットを配置。',
        'Workspace contains a tender PDF, quote XLSX, and contract DOCX seeded with 4 cross-document discrepancies.'
      ),
      prompt: `请交叉审计当前工作区内的《招标技术规范书_2026.pdf》、《供应商报价明细_星海智联.xlsx》和《技术采购合同草案_星海智联.docx》三份文件：
1. 逐项核对分项金额加总、预算红线、增值税率、付款比例、交付工期、质保期与违约金上限是否存在算术差错或背离招标红线的条款漏洞；
2. 生成一份结构清晰的《采购三单交叉审计与修订对照报告.docx》，通过文件卡片呈现在右侧工作台预览；
3. 将这套“招标书-报价单-合同三单交叉核对”标准流程沉淀为当前工作区技能 \`skills/contract-audit/SKILL.md\`，并创建一个每周五 17:00 自动运行的本地定时巡检任务。`,
      docLink: `${p}/architecture/intent-and-ecosystem`,
      docLabel: t('阅读第 6 卷：Skills 门禁与自动化生态', '第6章：Skills＆自動化エコシステムを読む', 'Read Vol. 06: Skills, Gate & Ecosystem')
    }
  ]
}
