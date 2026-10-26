/**
 * 官网全局可配置元数据中心（供中文、日语、英语三套页面及组件统一读取）。
 *
 * 职责与协作：
 * - 集中维护品牌名称（Helm）、Slogan、版本号、GitHub 仓库地址、安装包直链、SHA-256 校验值与演示视频路径。
 * - 保持语言中性，不在公共配置字段中混入单语种（如日语）文案，多语言描述由各组件按当前 locale 渲染。
 */

export const SITE_META = {
  brandName: 'Helm',
  sloganEn: 'Take the Helm of Long-Running Code & Docs.',
  version: 'v0.1.0',
  releaseDate: '2026-10',
  githubRepo: 'https://github.com/HelmAgent/Helm_website',
  installerFileName: 'Helm Setup 1.0.0.exe',
  installerAssetName: 'Helm.Setup.1.0.0.exe',
  installerUrl: 'https://github.com/HelmAgent/Helm_website/releases/latest/download/Helm.Setup.1.0.0.exe',
  installerSize: '170 MB',
  installerSha256: 'c93002b281b848c534538236819c135139aa78e9ae85e88a04e67ba9536ccf0f',
  installerSha256Short: 'c93002b2...536ccf0f',
  virusTotalScore: '0/57',
  virusTotalUrl: 'https://www.virustotal.com/gui/file/c93002b281b848c534538236819c135139aa78e9ae85e88a04e67ba9536ccf0f?nocache=1',
  discordUrl: 'https://discord.gg/AsU9Xqd6g',
  qqGroup: '1129820733',
  contactEmail: '785430621@qq.com',
  brandIconUrl: '/helm-icon.jpg',
  logoSvgUrl: '/logo.svg',
  demoVideoUrl: '/media/hero-demo.mp4',
  demoPosterUrl: '/media/hero-poster.png'
}
