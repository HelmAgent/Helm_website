# Helm 旗舰企业级产品官网与工程架构白皮书（Vue 3 + Vite）

本项目是 **Helm**（`"Take the Helm of Long-Running Code & Docs."`）的独立 Vue 3 企业级旗舰产品官网与源码级架构白皮书站点，支持 **简体中文（`/`）、日本語（`/ja/`）、English（`/en/`）** 三语实时无刷新切换。

- **外层舞台（Style 1：深邃科技旗舰风）**：对标 Cursor / Linear / Warp 与日本顶尖科技企业（LayerX / Preferred Networks），采用黑曜石深空底色（`#050811`）、星光径向聚光灯、悬浮毛玻璃导航顶栏与 1px 顶部高光卡片。
- **内嵌客户端（石澜 Stone 1:1 实机复刻）**：在深色钛金属硬件边框内 1:1 呈现桌面端三栏交互工作台（[`src/components/ProductPlayground.vue`](./src/components/ProductPlayground.vue)）。
- **内置架构白皮书阅读器（[`src/views/WhitepaperView.vue`](./src/views/WhitepaperView.vue)）**：脱离 VitePress 默认文档模板束缚，在统一的深邃旗舰视觉下渲染 5 卷工程架构白皮书与 3 篇私有化部署指南（含深色矢量 Mermaid 架构图与一键复制代码块）。

## 本地开发与构建

```powershell
cd d:\apps\hyn_agent\website

# 启动本地热更新开发服务（同时兼容 npm run docs:dev）
npm run dev

# 构建生产环境静态包（同时输出至 dist/ 与 docs/.vitepress/dist/，兼容所有托管平台）
npm run build

# 本地预览生产构建包
npm run preview
```

## 全局元数据配置（仅需修改 1 个文件）

1. **修改版本号、GitHub Releases 下载直链与 SHA-256 校验值**：
   直接编辑 [`docs/.vitepress/theme/siteData.js`](./docs/.vitepress/theme/siteData.js)（由 [`src/data/siteData.js`](./src/data/siteData.js) 统一引用），全站中/日/英三语页面会自动同步。
2. **放入实机演示视频（可选）**：
   将实机录屏命名为 `hero-demo.mp4` 放入 `docs/public/media/hero-demo.mp4`，首页「实机高清录屏演示 (MP4)」标签页即会自动启用播放。
