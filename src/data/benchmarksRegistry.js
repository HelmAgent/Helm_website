/**
 * 权威实测报告与 SHA-256 证据包注册中心（benchmarksRegistry.js）。
 *
 * 职责与协作：
 * - 通过 Vite `import.meta.glob` 将 `docs/public/benchmarks/` 下全部 6 套评测报告（`REPORT.md`）与证据清单（`manifest.json`）预编译注入前端，实现零闪烁秒开阅读。
 * - 同时保留静态路径 `/benchmarks/<slug>/*`，确保所有下载按钮（单文件直链下载与整包 `.zip` 归档）及 WebCrypto SHA-256 实时验签 100% 指向未经篡改的原始字节流。
 */
import { tt, getLangPrefix } from './siteData.js'

const rawReportFiles = import.meta.glob('../../docs/public/benchmarks/*/REPORT.md', {
  query: '?raw',
  import: 'default',
  eager: true
})

const rawManifestFiles = import.meta.glob('../../docs/public/benchmarks/*/manifest.json', {
  import: 'default',
  eager: true
})

const reportBySlug = {}
for (const [fullPath, content] of Object.entries(rawReportFiles)) {
  const m = fullPath.match(/\/benchmarks\/([^/]+)\/REPORT\.md$/i)
  if (m) {
    reportBySlug[m[1]] = content
  }
}

const manifestBySlug = {}
for (const [fullPath, jsonObj] of Object.entries(rawManifestFiles)) {
  const m = fullPath.match(/\/benchmarks\/([^/]+)\/manifest\.json$/i)
  if (m) {
    manifestBySlug[m[1]] = jsonObj
  }
}

export const BENCHMARK_SLUGS = [
  'swebench-mini-v1',
  'precache-v1',
  'rag-eval-v1',
  'harness-ablation-v1',
  'polyglot-mini-v1',
  'gaia-mini-v1'
]

export function getBenchmarkSuites(lang) {
  const p = getLangPrefix(lang)
  return [
    {
      id: 'swebench-mini-v1',
      num: 'SUITE 01',
      category: 'END-TO-END CODING',
      link: `${p}/benchmarks/swebench-mini-v1`,
      archLink: `${p}/architecture/long-running`,
      archLabel: tt(lang, '关联架构：Vol. 02 长程自治与代码导航', '関連白書：Vol. 02 長時間自律＆コード探索', 'Related: Vol. 02 Long-Horizon & Code Nav'),
      heroScore: '84.0%',
      heroUnit: 'PEAK PASS@1 (42/50)',
      badge: tt(lang, '两轮均值 81.0% · 98% 定位', '2回平均 81.0% · 98% 特定', '81.0% Mean · 98% Gold Hit'),
      title: tt(
        lang,
        'SWE-bench Verified Mini 端到端开源缺陷修复评测',
        'SWE-bench Verified Mini エンドツーエンド課題解決ベンチマーク',
        'SWE-bench Verified Mini End-to-End Bug Resolution Benchmark'
      ),
      subtitle: tt(
        lang,
        '在官方 Docker 全断网沙箱（--network none，n=50）中搭载 DeepSeek-V4.1-Flash 实测：单轮干净峰值 84.00%（42/50），两轮独立均值 81.00% ± 4.24%，与官方 mini-SWE-agent（82.0%）配对精确 McNemar 检验无显著差异（p=1.00），且达成 100%（100/100）有效非空补丁率与 ¥0.27/题极致成本。',
        '公式 Docker 完全オフライン環境（--network none, n=50）にて DeepSeek-V4.1-Flash で実測：単回最高 84.00%（42/50）、2回独立平均 81.00% ± 4.24%。公式 mini-SWE-agent（82.0%, McNemar p=1.00）と同等精度を維持しつつ、有効パッチ率 100%（100/100）と 1問解決 ¥0.27 を達成。',
        'Evaluated inside air-gapped official Docker containers (--network none, n=50) with DeepSeek-V4.1-Flash: 84.00% (42/50) single-run peak, 81.00% ± 4.24% 2-run mean, statistically tied with official mini-SWE-agent (82.0%, McNemar p=1.00) while achieving 100% (100/100) valid non-empty patches at ¥0.27 per solved issue.'
      ),
      kpis: [
        { label: tt(lang, '单轮干净峰值 Pass@1', '単回クリーン最高 Pass@1', 'Clean Peak Pass@1'), value: '84.00%', note: '42 / 50 · CI [71.5%, 91.7%]' },
        { label: tt(lang, '双轮独立均值 ± SD', '独立2回平均 ± SD', '2-Run Mean ± SD'), value: '81.0% ± 4.2%', note: 'R1 84.0% · R2 78.0%' },
        { label: tt(lang, '黄金文件定位修改率', 'Goldファイル特定率', 'Gold File Hit Rate'), value: '98.0%', note: '49 / 50 Edited · 100% Seen' },
        { label: tt(lang, '非空有效补丁交付率', '有効非空パッチ率', 'Valid Patch Integrity'), value: '100.0%', note: '100 / 100 (vs 96.0% Ref)' }
      ]
    },
    {
      id: 'precache-v1',
      num: 'SUITE 02',
      category: 'KV PREFIX CACHE',
      link: `${p}/benchmarks/precache-v1`,
      archLink: `${p}/architecture/memory-and-rag`,
      archLabel: tt(lang, '关联架构：Vol. 04 四层只增前缀与记忆', '関連白書：Vol. 04 4層追記プレフィックス', 'Related: Vol. 04 4-Layer Prefix & Memory'),
      heroScore: '89.58%',
      heroUnit: 'WARM CACHE HIT RATE',
      badge: tt(lang, '计费省 57.27% · 10 条轨迹', '課金 -57.27% · 10 トレース', '-57.27% Billable · 10 Traces'),
      title: tt(
        lang,
        '四层只增前缀架构：多场景双轨 Prefix Cache 受控基准',
        '4層追記型プレフィックス：マルチシナリオ双軌道 Prefix Cache 検証',
        '4-Layer Append-Only Prefix: Controlled Dual-Track Cache Benchmark'
      ),
      subtitle: tt(
        lang,
        '覆盖全栈排障（16步）、中英混合多轮对话（10轮）、Office 划词补丁（8轮）、超长程里程碑重构（20步）与端到端真实排障 5 大场景共 160 次真实 API 调用（10 条 JSONL 轨迹）：热态缓存命中率由 65.17% 跃升至 89.58%（非预期缓存断裂 25 → 0），等效计费输入降幅达 57.27%（较零缓存省 79.40%）。',
        'フルスタック改修（16歩）、多言語対話（10回）、Office選択更新（8回）、長距離リファクタ（20歩）、実機E2Eの5大シナリオ計160回の実APIコール（10本のJSONLトレース）：ウォームヒット率が 65.17% → 89.58%（予期せぬキャッシュ破断 25 → 0）へ向上し、課金入力コストを 57.27% 削減（ゼロキャッシュ比 -79.40%）。',
        'Spans 5 realistic workflows across 160 live API calls (10 full JSONL traces): lifts warm prefix cache hit rate from 65.17% to 89.58% (unexpected warm prefix breaks reduced from 25 to 0) and cuts billable input cost by 57.27% (-79.40% vs raw uncached).'
      ),
      kpis: [
        { label: tt(lang, 'Step 2+ 热态缓存命中率', 'Step 2+ ウォームヒット率', 'Step 2+ Warm Hit Rate'), value: '89.58%', note: 'vs 65.17% Legacy (0 Breaks)' },
        { label: tt(lang, '等效计费输入成本降幅', '課金入力Token削減率', 'Billable Input Reduction'), value: '-57.27%', note: '-79.40% vs 0%-Cache Raw' },
        { label: tt(lang, '长程 20 步热态命中率', '20歩長距離ウォームヒット', '20-Step Warm Hit Rate'), value: '93.21%', note: 'B4 Long-Horizon Trace' },
        { label: tt(lang, 'SWE-bench 1.2亿Token实战', 'SWE 1.2億Token実戦値', '120M-Token Live SWE Hit'), value: '97.74%', note: '¥0.27 / Solved Issue' }
      ]
    },
    {
      id: 'rag-eval-v1',
      num: 'SUITE 03',
      category: 'ENTERPRISE RAG ABLATION',
      link: `${p}/benchmarks/rag-eval-v1`,
      archLink: `${p}/architecture/memory-and-rag`,
      archLabel: tt(lang, '关联架构：Vol. 04 异构知识库检索管线', '関連白書：Vol. 04 異種文書ハイブリッドRAG', 'Related: Vol. 04 Multimodal Hybrid RAG'),
      heroScore: '100.0%',
      heroUnit: 'STRICT RECALL@K (v3)',
      badge: tt(lang, 'MRR 1.000 · 0% 干扰污染', 'MRR 1.000 · 汚染 0%', 'MRR 1.000 · 0% Pollution'),
      title: tt(
        lang,
        '企业异构多模态知识库 4 阶段递进消融评测 (v0 → v3)',
        '企業向け異種混合ドキュメント 4段階RAGアブレーション評価 (v0 → v3)',
        'Enterprise Heterogeneous Knowledge Base 4-Stage RAG Ablation (v0 → v3)'
      ),
      subtitle: tt(
        lang,
        '针对双栏 PDF 财报、复杂表格 Word 合同与多版本修订备忘录构建 36 道黄金 QA 基准：逐级量化朴素切片 (v0) → 版面结构还原 (v1) → 章节面包屑分块 (v2) → 混合检索 + 时间有效性重排 (v3) 的真实增益，严格完整命中率从 36.7% 跃升至 100.0%。',
        '2段組PDF決算書・複雑表組Word契約書・改訂履歴メモに対する36問のゴールデンQAで検証：単純分割(v0) → レイアウト復元(v1) → 章階層チャンク(v2) → ハイブリッド検索＋時系列リランク(v3) により完全正解率が 36.7% → 100.0% へ到達。',
        'Evaluated across 36 golden QAs over two-column financial PDFs, complex DOCX tables, and revision memos: quantifies step-by-step gains from naive chunking (v0) to layout recovery (v1), breadcrumb chunking (v2), and hybrid temporal reranking (v3), lifting strict hit rate from 36.7% to 100.0%.'
      ),
      kpis: [
        { label: tt(lang, '严格完整命中率 (v0→v3)', '完全正解率 (v0→v3)', 'Strict Full Hit (v0→v3)'), value: '100.0%', note: 'Up from 36.7% (+63.3pt)' },
        { label: tt(lang, '事实召回率 Fact Recall', '事実再現率 Fact Recall', 'Fact Recall@K'), value: '100.0%', note: 'Up from 59.4% (v0)' },
        { label: tt(lang, '平均倒数排名 (MRR)', '平均逆順位 (MRR)', 'Mean Reciprocal Rank'), value: '1.000', note: 'Rank #1 Golden Hit' },
        { label: tt(lang, '过期/干扰块污染率', '旧版・ノイズ混入率', 'Distractor Pollution'), value: '0.0%', note: 'Down from 20.0% · 100% OOD' }
      ]
    },
    {
      id: 'harness-ablation-v1',
      num: 'SUITE 04',
      category: 'HARNESS & WORKTREE GUARD',
      link: `${p}/benchmarks/harness-ablation-v1`,
      archLink: `${p}/architecture/multi-agent-team`,
      archLabel: tt(lang, '关联架构：Vol. 02 & Vol. 03 护栏与并发隔离', '関連白書：Vol. 02 & 03 ループ防止＆Worktree', 'Related: Vol. 02 & 03 Guardrails & Worktree'),
      heroScore: '3.04×',
      heroUnit: '4-MATE WORKTREE SPEEDUP',
      badge: tt(lang, '100% 拦死循环 · 0% 越权', 'ループ阻止100% · 侵害0%', '100% Loop Stop · 0% ASR'),
      title: tt(
        lang,
        'Agent Harness 四大核心护栏消融：防死循环、保真压缩、Worktree 并行与零信任门禁',
        'Agent Harness 4大機構アブレーション：ループ防止・60/40圧縮・Worktree並列・権限ゲート',
        'Agent Harness Ablation: StuckDetector v2, 60/40 Compaction, 4-Mate Worktree & Security Gate'
      ),
      subtitle: tt(
        lang,
        '四组受控对照实验：StuckDetector v2 对 D1–D6 六维死循环轨迹达成 100% (18/18) 检出并节省 87.7% 无效步数；60/40 头尾保真裁剪实现 100% 末尾堆栈保留；4 队友 Git Worktree 并行取得 2.88×–3.04× 加速且冲突率 0%；PermissionGate 对 30 组高危攻击载荷拦截率 100% (ASR 0.0%)。',
        '4つの対照実験：StuckDetector v2 が D1〜D6 の6種ループを 100% (18/18) 阻止し無駄ステップを 87.7% 削減。60/40 圧縮が末尾トレースを 100% 保持。4メイト Git Worktree 並列が 2.88×〜3.04× 高速化・競合 0% を実証。PermissionGate が30種の攻撃ペイロードを 100% 遮断。',
        'Four controlled ablations: StuckDetector v2 catches 100% (18/18) of D1–D6 loops (-87.7% wasted steps); 60/40 head-tail compaction retains 100% of tail tracebacks; 4-teammate Git Worktrees deliver 2.88×–3.04× speedup with 0% collisions; PermissionGate blocks 100% (30/30) of adversarial payloads.'
      ),
      kpis: [
        { label: tt(lang, 'D1–D6 死循环拦截率', 'D1–D6 ループ検知率', 'D1–D6 Loop Recall'), value: '100.0%', note: '18/18 · -87.7% Wasted Steps' },
        { label: tt(lang, '60/40 裁剪堆栈保留率', '60/40 末尾情報保持率', '60/40 Tail Fact Retention'), value: '100.0%', note: '93.1% Size Reduction' },
        { label: tt(lang, '4 队友 Worktree 加速比', '4メイト Worktree 高速化', '4-Mate Wall-Clock Speedup'), value: '2.88×–3.04×', note: '0.0% Write Collision' },
        { label: tt(lang, '对抗越权攻击成功率 ASR', '敵対的攻撃成功率 ASR', 'Adversarial Attack ASR'), value: '0.0%', note: '30/30 Blocked · 0% FP' }
      ]
    },
    {
      id: 'polyglot-mini-v1',
      num: 'SUITE 05',
      category: '6-LANGUAGE POLYGLOT',
      link: `${p}/benchmarks/polyglot-mini-v1`,
      archLink: `${p}/architecture/long-running`,
      archLabel: tt(lang, '关联架构：Vol. 02 多语言 AST 与语法门禁', '関連白書：Vol. 02 多言語AST＆構文検査', 'Related: Vol. 02 Polyglot AST & Syntax Check'),
      heroScore: '100.0%',
      heroUnit: 'BLIND PASS@1 (24/24)',
      badge: tt(lang, '6 大主流语言 · 36/36 基建', '6言語完走 · 36/36 基盤検証', '6 Languages · 36/36 Microbench'),
      title: tt(
        lang,
        'Aider-Polyglot 六语言无提示盲测与多语言工具链微基准',
        'Aider-Polyglot 6言語ブラインド実装＆多言語ツールチェーン検証',
        'Aider-Polyglot 6-Language Blind Coding & Polyglot Toolchain Benchmark'
      ),
      subtitle: tt(
        lang,
        '横跨 Python、JavaScript、Go、Rust、Java、C++ 六大工业级编程语言的 24 道无提示算法与系统编程盲测题全部一次跑通单元测试（24/24 = 100.0%），配套多语言符号大纲与进程内语法自检微基准 36/36 全通。',
        'Python・JavaScript・Go・Rust・Java・C++ の6言語にわたる24問のヒントなし実装課題で全問単体テスト合格（24/24 = 100.0%）。多言語シンボル抽出および構文検査マイクロベンチも 36/36 完全通過。',
        'Achieves 100.0% (24/24) unassisted test-suite pass rate across Python, JavaScript, Go, Rust, Java, and C++ blind coding tasks, backed by 36/36 passing polyglot outline and syntax-check microbenchmarks.'
      ),
      kpis: [
        { label: tt(lang, '6 语言盲测一次通过率', '6言語ブラインド合格率', '6-Lang Blind Pass@1'), value: '100.0%', note: '24 / 24 Official Tests' },
        { label: tt(lang, '覆盖编译与脚本语言', '評価対象プログラミング言語', 'Evaluated Languages'), value: '6 Langs', note: 'Py / JS / Go / Rust / Java / C++' },
        { label: tt(lang, '多语言工具链微基准', '多言語ツール基盤検証', 'Toolchain Microbench'), value: '36 / 36', note: '100% AST & Syntax Guard' },
        { label: tt(lang, '评测推理底座模型', '使用推論モデル', 'Evaluated Model'), value: 'V4.1-Flash', note: 'Zero Manual Hints' }
      ]
    },
    {
      id: 'gaia-mini-v1',
      num: 'SUITE 06',
      category: 'GAIA & OFFICE MULTIMODAL',
      link: `${p}/benchmarks/gaia-mini-v1`,
      archLink: `${p}/architecture/workbench`,
      archLabel: tt(lang, '关联架构：Vol. 05 高保真 Office 工作台', '関連白書：Vol. 05 高精細 Office ワークベンチ', 'Related: Vol. 05 Surgical Office Workbench'),
      heroScore: '90.0%',
      heroUnit: 'GAIA LIVE ACCURACY (27/30)',
      badge: tt(lang, 'L2 100% · Office 20/20 全通', 'L2 100% · Office 20/20 合格', 'L2 100% · 20/20 Office Patch'),
      title: tt(
        lang,
        'GAIA Validation 多步工具调用与 Office 局部热补丁实测',
        'GAIA Validation 多段階ツール実行＆Office インプレース部分更新実証',
        'GAIA Validation Multi-Step Agent Loop & Surgical Office Hot-Patch Benchmark'
      ),
      subtitle: tt(
        lang,
        '在真实多步推理与跨格式附件处理基准 GAIA Validation 分层子集（n=30）中达成 90.0%（27/30：Level 1 90% / Level 2 100% / Level 3 75%）端到端准确率；同时 DOCX / XLSX / PPTX SelectionAnchor 手术刀级局部热补丁微基准 20/20 零样式破坏通过。',
        '実世界の多段階推論・添付ファイル処理ベンチマーク GAIA Validation（n=30）で 90.0%（27/30：L1 90% / L2 100% / L3 75%）を達成。さらに DOCX/XLSX/PPTX の SelectionAnchor 部分更新テスト 20/20 で書式破壊ゼロを実証。',
        'Reaches 90.0% (27/30: L1 90%, L2 100%, L3 75%) end-to-end accuracy on the stratified GAIA Validation multi-step tool benchmark, plus 20/20 zero-layout-corruption passes on DOCX/XLSX/PPTX SelectionAnchor hot-patching.'
      ),
      kpis: [
        { label: tt(lang, 'GAIA 端到端总准确率', 'GAIA 総合正解率', 'GAIA Overall Accuracy'), value: '90.0%', note: '27 / 30 Tasks Exact Match' },
        { label: tt(lang, 'Level 2 多步工具组合', 'Level 2 多段階ツール連携', 'Level 2 Multi-Tool Tasks'), value: '100.0%', note: '12 / 12 Perfect Score' },
        { label: tt(lang, 'Office 局部热补丁基准', 'Office 部分AI更新検証', 'Office Surgical Patch'), value: '20 / 20', note: 'DOCX · XLSX · PPTX' },
        { label: tt(lang, '排版与母版样式破坏率', '書式・レイアウト崩れ率', 'Style Corruption Rate'), value: '0.0%', note: 'Preserves Native XML Runs' }
      ]
    }
  ]
}

export function getBenchmarkReportRaw(slug) {
  return reportBySlug[slug] || ''
}

export function getBenchmarkManifest(slug) {
  const raw = manifestBySlug[slug]
  if (!raw) return null
  const files = Array.isArray(raw.files)
    ? raw.files.map((f) => ({
        path: f.path || f.file || '',
        bytes: f.bytes ?? 0,
        sha256: f.sha256 || ''
      }))
    : []
  return {
    ...raw,
    files
  }
}
