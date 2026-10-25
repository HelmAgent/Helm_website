# HYN Agent 官方产品站与工程架构白皮书（VitePress）

本项目是 **HYN Agent** 的多语言（默认简体中文 `/`、日语 `/ja/`、英语 `/en/`）产品官网与技术架构白皮书站点，完全继承桌面端「石澜（Stone）」视觉规范（`#e4e8f0` 冷灰石底 + `#0f4c81` 靛蓝主色 + `6px` 圆角）。

## 本地开发与构建

```powershell
cd d:\apps\hyn_agent\website

# 启动本地热更新预览服务
npm run docs:dev

# 构建生产环境静态产物（输出至 docs/.vitepress/dist）
npm run docs:build

# 本地预览构建后的生产包
npm run docs:preview
```

## 用户后续替换配置清单（仅需改 1 个文件）

1. **修改版本号、GitHub Releases 下载链接与 SHA-256 哈希**：
   直接编辑 [`docs/.vitepress/theme/siteData.js`](./docs/.vitepress/theme/siteData.js)，中/日/英三语页面会自动同步。
2. **放入实机演示视频（可选）**：
   将录制好的 60~90 秒实机演示视频命名为 `hero-demo.mp4` 放入 `docs/public/media/hero-demo.mp4`（封面图可选放入 `docs/public/media/hero-poster.png`），首页「实机录屏演示视频」标签页即会自动启用播放。
