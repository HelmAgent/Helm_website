---
title: ローカル知識ベースと MCP / Skills / Hooks 拡張
description: RAGFlow ハイブリッドRAG連携、OAuth 2.0対応 MCP、ゼロRTT Skills、6段階フックとスリープ耐性 Cron 自動化ガイド。
---

# ローカル知識ベースと MCP / Skills / Hooks 拡張

## 1. ローカル知識ベース連携（RAGFlow 再現率100% 根拠チェーン）

左サイドバーの **「ナレッジベース (Knowledge)」** から、ローカルまたは社内LANの **RAGFlow 1.0** に接続できます：
- **15種レイアウト解析＆進捗監視**：社内規約 PDF・財務表・設計書を登録し、解析状態（`RUNNING` / `DONE`）をリアルタイム確認。
- **ハイブリッド検索＆`[ev_N]` 強制引用**：`0.7` 密ベクトル + `0.3` BM25 + Cross-Encoder リランキング（[4段階 RAG 進化レポート参照](/ja/benchmarks/rag-eval-v1)）により、出典クリックで右ペイン `PdfViewer` の該当ページへ即座にジャンプします。

## 2. 全プロトコル MCP クライアント＆OAuth 2.0 認証

**「カスタマイズ (Customize) → MCP」** にて任意の MCP サーバーを接続できます：
- **3種トランスポート完全対応**：`stdio`・`sse`・`streamable_http`（Tools / Resources / Elicitation）をサポート。
- **DPAPI 保護 OAuth 2.0**：RFC 8252 ループバック PKCE ブラウザ認証に対応し、更新トークンを **Windows DPAPI 金庫** で安全に自動管理します。
- **30ツール上限保護＆5段階権限連動**：MCP ツール総数が `30` 個を超えると `mcp_search_tools` オンデマンド検索へ自動移行し、サーバー別 `allow` / `confirm` / `deny` ポリシーと連動します。

## 3. ゼロRTT Skills・6段階 Hooks・スリープ耐性 Cron

- **1ms未満ゼロRTT Skills（`skill_loader.py` + `turn_enricher.py`）**：`.hyn_agent/skills` や `.claude/skills` と互換。`/skill` コマンドや3言語 BM25 意図一致（中央値 `0.67ms`）により初回ターンから手順を注入し、余分な通信往復を削減します。
- **6段階ライフサイクル Hooks＆SHA-256 信頼検証（`hooks.py`）**：`UserPromptSubmit`・`PreToolUse`・`PostToolUse`・`SubagentStart`・`SubagentStop`・`Stop` の6箇所に対応。外部リポジトリ同梱のフックは **SHA-256 ハッシュ承認** を経るまで実行されません。
- **スリープ耐性 Cron 自動化（`cron_scheduler.py`）**：スリープ中に逃した定期タスクも復帰時に `catchup_once` で安全に1回補完実行します。