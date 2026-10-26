/**
 * 官网全局可配置元数据中心（供中文、日语、英语三套页面及组件统一读取）。
 *
 * 职责与协作：
 * - 集中维护版本号、GitHub 仓库地址、安装包直链、SHA-256 校验值与演示视频路径。
 * - 保持语言中性，不在公共配置字段中混入单语种（如日语）文案，多语言描述由各组件按当前 locale 渲染。
 */

export const SITE_META = {
  version: 'v1.0.0',
  releaseDate: '2026-10',
  githubRepo: 'https://github.com/huyuning460/Helm_website',
  installerUrl: 'https://github.com/huyuning460/Helm_website/releases/latest/download/HYN-Agent-Setup-1.0.0.exe',
  portableUrl: 'https://github.com/huyuning460/Helm_website/releases/latest/download/HYN-Agent-Portable-1.0.0.zip',
  installerSize: '148 MB',
  portableSize: '162 MB',
  installerSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  portableSha256: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
  virusTotalUrl: 'https://www.virustotal.com/',
  demoVideoUrl: '/media/hero-demo.mp4',
  demoPosterUrl: '/media/hero-poster.png'
}
