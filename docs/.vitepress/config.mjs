/**
 * VitePress 站点主配置文件（支持 zh-CN 默认、ja-JP 日语、en-US 英语三语切换）。
 *
 * 职责与协作：
 * - 定义全站多语言路由、顶部导航栏（nav）与文档侧边栏（sidebar）。
 * - 与 `.vitepress/theme/index.js` 中的自定义组件（HomeLanding、ProductPlayground、DownloadCenter）及 Mermaid 渲染器配合。
 * - 注意事项：静态资源统一放在 `docs/public/` 下，安装包切勿直接放入 `public/`，应通过 GitHub Releases 外链分发。
 */
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'HYN Agent',
  description: '数据不出网、支持数小时无人值守的全本地自治型 Coding & Office Agent',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#0f4c81' }]
  ],

  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'HYN Agent',
      description: '数据不出网 · 数小时长程自治 · 多智能体协同的桌面端 Coding & Office Agent',
      themeConfig: {
        logo: '/logo.svg',
        siteTitle: 'HYN AGENT',
        nav: [
          { text: '首页', link: '/' },
          { text: '在线交互沙盒', link: '/demo' },
          { text: '快速开始', link: '/guide/getting-started' },
          {
            text: '工程架构白皮书',
            items: [
              { text: '1. 总体架构与双进程设计', link: '/architecture/overview' },
              { text: '2. 长程自治引擎 (P0–P3)', link: '/architecture/long-running' },
              { text: '3. 多智能体团队与 Worktree 隔离', link: '/architecture/multi-agent-team' },
              { text: '4. 异步双层记忆与本地 RAG', link: '/architecture/memory-and-rag' },
              { text: '5. 高保真工作台与局部 AI 热补丁', link: '/architecture/workbench' }
            ]
          },
          { text: '下载与安全校验', link: '/download' }
        ],
        sidebar: {
          '/guide/': [
            {
              text: '使用指南',
              items: [
                { text: '快速开始与安装', link: '/guide/getting-started' },
                { text: 'Ollama 与企业内网模型配置', link: '/guide/local-models' },
                { text: '本地知识库与 MCP / Skills 扩展', link: '/guide/knowledge-and-mcp' }
              ]
            },
            {
              text: '体验与下载',
              items: [
                { text: '浏览器免安装交互沙盒', link: '/demo' },
                { text: '安装包下载与离线验证', link: '/download' }
              ]
            }
          ],
          '/architecture/': [
            {
              text: '工程架构白皮书（面试官专栏）',
              items: [
                { text: '1. 总体架构与桌面端双进程', link: '/architecture/overview' },
                { text: '2. 长程自治引擎 (P0–P3)', link: '/architecture/long-running' },
                { text: '3. 多智能体团队与 Worktree 隔离', link: '/architecture/multi-agent-team' },
                { text: '4. 异步双层记忆与本地知识库', link: '/architecture/memory-and-rag' },
                { text: '5. 高保真工作台与局部 AI 热补丁', link: '/architecture/workbench' }
              ]
            }
          ]
        },
        outline: {
          label: '本页目录',
          level: [2, 3]
        },
        docFooter: {
          prev: '上一篇',
          next: '下一篇'
        },
        lastUpdated: {
          text: '最后更新于'
        },
        footer: {
          message: '遵循「石澜 (Stone)」工业设计规范 · 100% 本地可控 · 支持离线与企业内网私有部署',
          copyright: 'Copyright © 2026 HYN Agent · 面向真实复杂工程与文档交付的桌面端智能体'
        }
      }
    },

    ja: {
      label: '日本語',
      lang: 'ja-JP',
      link: '/ja/',
      title: 'HYN Agent',
      description: '機密コードを外部に送信しない、完全ローカル対応の自律型AIコーディング＆Officeエージェント',
      themeConfig: {
        logo: '/logo.svg',
        siteTitle: 'HYN AGENT',
        nav: [
          { text: 'ホーム', link: '/ja/' },
          { text: 'Web体験デモ (インストール不要)', link: '/ja/demo' },
          { text: 'クイックスタート', link: '/ja/guide/getting-started' },
          {
            text: '技術アーキテクチャ白書',
            items: [
              { text: '1. 全体設計とデュアルプロセス構造', link: '/ja/architecture/overview' },
              { text: '2. 長時間自律実行エンジン (P0–P3)', link: '/ja/architecture/long-running' },
              { text: '3. マルチエージェントと Worktree 分離', link: '/ja/architecture/multi-agent-team' },
              { text: '4. 非同期2層メモリとローカルRAG', link: '/ja/architecture/memory-and-rag' },
              { text: '5. 高精細ワークベンチと選択範囲AI更新', link: '/ja/architecture/workbench' }
            ]
          },
          { text: 'ダウンロード・安全性検証', link: '/ja/download' }
        ],
        sidebar: {
          '/ja/guide/': [
            {
              text: 'ユーザーガイド',
              items: [
                { text: 'クイックスタート・導入手順', link: '/ja/guide/getting-started' },
                { text: 'Ollama・社内LANモデル設定', link: '/ja/guide/local-models' },
                { text: 'ローカル知識ベースと MCP / Skills 拡張', link: '/ja/guide/knowledge-and-mcp' }
              ]
            },
            {
              text: '体験・ダウンロード',
              items: [
                { text: 'ブラウザ対話型デモ (インストール不要)', link: '/ja/demo' },
                { text: 'ダウンロード＆オフライン検証', link: '/ja/download' }
              ]
            }
          ],
          '/ja/architecture/': [
            {
              text: '技術設計白書（面接官・エンジニア向け）',
              items: [
                { text: '1. 全体設計とデュアルプロセス構造', link: '/ja/architecture/overview' },
                { text: '2. 長時間自律実行エンジン (P0–P3)', link: '/ja/architecture/long-running' },
                { text: '3. マルチエージェントと Worktree 分離', link: '/ja/architecture/multi-agent-team' },
                { text: '4. 非同期2層メモリとローカルRAG', link: '/ja/architecture/memory-and-rag' },
                { text: '5. 高精細ワークベンチと選択範囲AI更新', link: '/ja/architecture/workbench' }
              ]
            }
          ]
        },
        outline: {
          label: '目次',
          level: [2, 3]
        },
        docFooter: {
          prev: '前のページ',
          next: '次のページ'
        },
        lastUpdated: {
          text: '最終更新'
        },
        footer: {
          message: '「石瀾 (Stone)」デザインシステム準拠 · 100% ローカル完結可能 · オフライン＆社内LAN対応',
          copyright: 'Copyright © 2026 HYN Agent · エンタープライズ水準のセキュリティを備えたデスクトップAIエージェント'
        }
      }
    },

    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      title: 'HYN Agent',
      description: '100% Local-Capable, Long-Horizon Autonomous Desktop Coding & Office Agent',
      themeConfig: {
        logo: '/logo.svg',
        siteTitle: 'HYN AGENT',
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Interactive Web Demo', link: '/en/demo' },
          { text: 'Quick Start', link: '/en/guide/getting-started' },
          {
            text: 'Architecture Whitepaper',
            items: [
              { text: '1. System Overview & Dual-Process', link: '/en/architecture/overview' },
              { text: '2. Long-Horizon Engine (P0–P3)', link: '/en/architecture/long-running' },
              { text: '3. Multi-Agent Team & Worktrees', link: '/en/architecture/multi-agent-team' },
              { text: '4. Two-Tier Memory & Local RAG', link: '/en/architecture/memory-and-rag' },
              { text: '5. Document Workbench & AI Patching', link: '/en/architecture/workbench' }
            ]
          },
          { text: 'Download & Security', link: '/en/download' }
        ],
        sidebar: {
          '/en/guide/': [
            {
              text: 'User Guide',
              items: [
                { text: 'Quick Start & Installation', link: '/en/guide/getting-started' },
                { text: 'Ollama & Intranet LLM Setup', link: '/en/guide/local-models' },
                { text: 'Local RAG & MCP / Skills', link: '/en/guide/knowledge-and-mcp' }
              ]
            },
            {
              text: 'Try & Download',
              items: [
                { text: 'Zero-Install Browser Demo', link: '/en/demo' },
                { text: 'Download & Offline Verification', link: '/en/download' }
              ]
            }
          ],
          '/en/architecture/': [
            {
              text: 'Engineering Whitepaper (For Tech Reviewers)',
              items: [
                { text: '1. System Overview & Dual-Process', link: '/en/architecture/overview' },
                { text: '2. Long-Horizon Engine (P0–P3)', link: '/en/architecture/long-running' },
                { text: '3. Multi-Agent Team & Worktrees', link: '/en/architecture/multi-agent-team' },
                { text: '4. Two-Tier Memory & Local RAG', link: '/en/architecture/memory-and-rag' },
                { text: '5. Document Workbench & AI Patching', link: '/en/architecture/workbench' }
              ]
            }
          ]
        },
        outline: {
          label: 'On this page',
          level: [2, 3]
        },
        docFooter: {
          prev: 'Previous page',
          next: 'Next page'
        },
        lastUpdated: {
          text: 'Last updated'
        },
        footer: {
          message: 'Built with the Stone Design System · 100% Local-Capable · Offline & Enterprise LAN Ready',
          copyright: 'Copyright © 2026 HYN Agent · Autonomous Desktop Coding & Office Agent'
        }
      }
    }
  }
})
