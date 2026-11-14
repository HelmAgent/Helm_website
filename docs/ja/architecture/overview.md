---
title: 1. 全体設計・ゼロトラスト認証＆自己修復型デュアルプロセス基盤
description: Helm の Electron 44 + Vue 3.5 + Python 3.13 FastAPI 3層分離アーキテクチャ、純粋 ASGI 認証、Windows DPAPI 暗号化保管庫、3プロトコル適応 Schema コンパイラと System Doctor を詳説。
---

# 1. 全体設計・ゼロトラスト認証＆自己修復型デュアルプロセス基盤

> [!NOTE] エンジニアリングアーキテクチャ白書（全 6 巻）
> 本シリーズ（全6巻）では、**Helm**（バックエンド `167` モジュール / `70,223` 行 / 自動テスト `502` 件、フロントエンド `69` モジュール / `42,326` 行）の状態機械・境界設計・実測データを完全公開します。第1巻は `hyn_agent_frontend/main.js`、`app/main.py`、`app/core/*`、`tool_schema.py`、`system_doctor.py` を解説します。

## 1.1 3層分離デスクトップトポロジと責務境界

Helm は重い I/O 処理を Electron メインプロセスに詰め込んだり外部クラウドコンテナへ依存したりせず、**「Electron 44 ホスト（システム境界） + Vue 3.5 レンダラ（デュアルモード画面） + ローカル Python 3.13 FastAPI 非同期エンジン（ゼロフレームワーク Agent ランタイム）」** に厳密分離しています。

```mermaid
flowchart TD
  subgraph Host["Electron 44 デスクトップホスト (Windows x64)"]
    Main["Electron Main (main.js · トップフレーム限定トークン注入 · スリープ抑止 · IPC制限)"]
    Renderer["Vue 3.5 レンダラ (src/ · デュアルモードWorkbench · 単調増加 seq 状態機械)"]
    PreviewFrame["サンドボックス subFrame (X-HYN-Token を物理剥離)"]
    Main <-->|"preload.js 保護ブリッジ (50 msg/s · 4KB上限)"| Renderer
    Renderer -->|"分離プレビュー"| PreviewFrame
  end

  subgraph Engine["Python 3.13 FastAPI 非同期ランタイム (127.0.0.1:8001)"]
    AuthMW["LocalAuthMiddleware (純粋ASGI · Host検証 · compare_digest)"]
    ReqMW["RequestLogMiddleware + LoopWatchdog (X-Request-ID · 遅延監視)"]
    CoreLoop["ゼロフレームワーク AgentLoop (5,227行 · TurnHub · 52内蔵ツール + MCP)"]
    Vault["Windows DPAPI 金庫 (secret_box.py · CryptProtectData)"]
    Doctor["System Doctor 自己修復 (ポータブル MinGit · Node v22 · uvx)"]
    AuthMW --> ReqMW --> CoreLoop
    CoreLoop --> Vault
    CoreLoop --> Doctor
  end

  subgraph Infra["100% ローカル＆社内イントラネット基盤"]
    LocalLLM["3階層モデルルーティング (Local Ollama / 社内 vLLM / Cloud API)"]
    LocalDisk["隔離データ領域 (.hyn_agent/ · セッション · 2層メモリ · シャドウGit)"]
  end

  Renderer <-->|"REST + SSE ストリーム (X-HYN-Token & X-Request-ID)"| AuthMW
  PreviewFrame -.->|"トークン無し通信 -> 403 遮断"| AuthMW
  CoreLoop --> LocalLLM
  CoreLoop --> LocalDisk
```

> [!TIP] アーキテクチャ上のトレードオフ：なぜ純粋 Node.js ではなく Electron + 独立 Python サブプロセスなのか？
> - **技術的課題**：60FPS のマルチタブ文書 UI を維持しながら、AST 解析・OpenXML（`docx/xlsx/pptx`）の局所バイナリ編集・並列 Worktree 制御を同時に回す必要があります。
> - **従来手法の限界**：Node.js 単一プロセスでは大容量文書解析で画面がフリーズし、LangChain 等の厚い抽象化はプロンプトのバイト配列をブラックボックス化して KV キャッシュ効率を損ないます。
> - **Helm の解決策**：Electron Main を最小限に保ち、同梱された公式 Python 3.13 上の純粋 `asyncio + httpx` エンジンへローカル直結します。
> - **定量的成果**：**`502` 件の `pytest` 自動テスト**に守護され、**外部への意図せぬデータ送信 0 バイト**と社内 Docker への無改修展開を両立しています。

---

## 1.2 ゼロトラスト認証と Windows DPAPI ハードウェア連携金庫

```mermaid
sequenceDiagram
  autonumber
  participant Boot as Electron Main (main.js)
  participant TopUI as メイン画面フレーム (mainFrame)
  participant SubUI as HTMLプレビュー子フレーム (subFrame)
  participant ASGI as LocalAuthMiddleware (local_auth.py)
  participant DPAPI as Windows DPAPI (secret_box.py)

  Boot->>Boot: 256-bit ランダムトークンを生成し FastAPI 子プロセスへ注入
  Boot->>TopUI: onBeforeSendHeaders でトップフレームのみ X-HYN-Token を付与
  SubUI->>ASGI: 悪意あるスクリプトが 127.0.0.1:8001/api/v1/tools を呼び出し
  Note over Boot,ASGI: details.frame !== mainFrame のためトークンを剥離
  ASGI-->>SubUI: 403 Forbidden (子フレーム特権昇格と DNS Rebinding を完全遮断)
  TopUI->>ASGI: 正規トークン付きで API キー / MCP OAuth トークンを保存
  ASGI->>DPAPI: Win32 CryptProtectData で OS ログインユーザーに紐付け暗号化
  DPAPI-->>TopUI: secrets_vault.json へ暗号化保存＆ログ自動マスク登録
```

1. **純粋 ASGI ストリーミング認証（`local_auth.py`）**：SSE をバッファリングしない純粋 ASGI 実装により、ループバック `Host` 検証と `secrets.compare_digest` 定数時間比較を実行します。
2. **Windows DPAPI 資格情報金庫（`secret_box.py`）**：API キーや OAuth トークンを平文保存せず、Windows ネイティブ `CryptProtectData` で暗号化。ログ出力前には秘密文字列を強制的に `***` へ置換します。

---

## 1.3 3階層計算ルーティングと適応型 Schema コンパイラ

```mermaid
flowchart LR
  Raw["52内蔵ツール + 動的 MCP JSON Schema"] --> Compiler["adapt_schema コンパイラ (tool_schema.py)"]
  Compiler --> Step1["1. $defs / $ref の再帰インライン展開"]
  Step1 --> Step2["2. anyOf / oneOf 複合型のフラット化"]
  Step2 --> Step3["3. プロトコル別の非対応属性除去と辞書順ソート固定"]
  Step3 --> P1["OpenAI Chat Completions (Ollama / 社内 vLLM / DeepSeek)"]
  Step3 --> P2["Anthropic Messages ネイティブ (Claude + 4点キャッシュ)"]
  Step3 --> P3["Google Gemini ネイティブ (厳格型サブセット)"]
```

| 配備階層 | 対応ゲートウェイ（`8` プロバイダ / `18` 厳選モデル） | 通信境界 | 主な特徴 |
| :--- | :--- | :--- | :--- |
| **`local`（完全オフライン）** | ローカル `Ollama` (`127.0.0.1:11434/v1`) | **外部通信 0 バイト** | APIキー不要の自動検出・VRAM再確保リトライ |
| **`lan`（社内イントラ）** | 社内 `vLLM` / `SGLang` / `OneAPI` | **社内ファイアウォール内完結** | 社内GPUクラスタ＆社内RAGFlow直結 |
| **`cloud`（公式API直結）** | `DeepSeek` / `Qwen` / `GLM` / `Claude` / `Gemini` / `OpenAI` | 公式エンドポイントへ TLS 直結 | 中継サーバ無し・プレフィックスキャッシュ最適化 |

---

## 1.4 管理者権限不要の `System Doctor` と 8段階グレースフルシャットダウン

- **ポータブル環境自己修復（`system_doctor.py`）**：管理者権限（UAC）のない企業貸与 PC でも、`git`・`node`/`npx`・`uv`/`uvx` の欠損を検知すると公式ポータブル版 **MinGit**・**Node.js v22**・**`uv`** を `DATA_DIR/toolchains/` へ自動展開し、システム環境変数を汚さずに修復します。
- **6段階起動復旧＆8段階シャットダウン（`app/main.py`）**：終了時は実行中ターンを `interrupted` としてチェックポイント保存し、非同期メモリキューの書き出し（最大 `10秒`）、常駐チームの `24時間` リース保護スリープ、Cron・子プロセス・MCP 切断を順序通りに完了させます。