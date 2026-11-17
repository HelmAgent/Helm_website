/**
 * 官网全局可配置元数据中心（供中文、日语、英语三套页面及组件统一读取）。
 *
 * 职责与协作：
 * - 集中维护品牌名称（Helm）、Slogan、版本号、GitHub 仓库地址、安装包直链、SHA-256 校验值与演示视频路径。
 * - `src/data/siteData.js` 直接透传本文件中的 `SITE_META`，修改此处即可同步更新首页、下载中心与页脚安全验签信息。
 * - 防踩坑约束：将本地 `Helm Setup X.Y.Z.exe` 上传至 GitHub Releases 附件时，GitHub 会自动将文件名中的空格替换为点号（即 `Helm.Setup.X.Y.Z.exe`），因此 `installerAssetName` 与 `installerUrl` 须保持点号连接格式。
 * - 保持语言中性，不在公共配置字段中混入单语种（如日语）文案，多语言描述由各组件按当前 locale 渲染。
 */

export const SITE_META = {
  brandName: 'Helm',
  sloganEn: 'Take the Helm of Long-Running Code & Docs.',
  version: 'v0.3.0',
  releaseDate: '2026-11',
  websiteUrl: 'https://www.helm-ai.website/',
  githubRepo: 'https://github.com/HelmAgent/Helm_website',
  installerFileName: 'Helm Setup 0.3.0.exe',
  installerAssetName: 'Helm.Setup.0.3.0.exe',
  installerUrl: 'https://github.com/HelmAgent/Helm_website/releases/latest/download/Helm.Setup.0.3.0.exe',
  installerSize: '163 MB',
  installerSha256: 'f57dbb588aabfba6c39537404920c510c08f2dc92fdd9090867a45d5c428b1da',
  installerSha256Short: 'f57dbb58...c428b1da',
  virusTotalScore: '0/56',
  virusTotalUrl: 'https://www.virustotal.com/gui/file/f57dbb588aabfba6c39537404920c510c08f2dc92fdd9090867a45d5c428b1da?nocache=1',
  discordUrl: 'https://discord.gg/AsU9Xqd6g',
  qqGroup: '1129820733',
  contactEmail: '785430621@qq.com',
  brandIconUrl: '/helm-icon.jpg',
  logoSvgUrl: '/logo.svg',
  demoVideoUrl: '/media/hero-q3-delivery.mp4',
  demoPosterUrl: '/media/hero-poster.png'
}
