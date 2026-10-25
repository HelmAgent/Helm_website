/**
 * 官网全局可配置元数据中心（供中文、日语、英语三套页面及组件统一读取）。
 *
 * 职责与协作：
 * - 集中维护版本号、GitHub 仓库地址、安装包直链、SHA-256 校验值与演示视频路径。
 * - 用户后续打包发布新版本或上传实机录屏后，只需修改本文件中的对应字段，全站三语页面会自动同步生效。
 */

export const SITE_META = {
  version: 'v1.0.0',
  releaseDate: '2026-10',
  // TODO(用户可替换)：将下方 githubRepo 替换为你的真实 GitHub 公开仓库地址
  githubRepo: 'https://github.com/huyuning460/Helm_website',
  // 安装版 (.exe) 与绿色免安装版 (.zip) 的 GitHub Releases 下载直链
  installerUrl: 'https://github.com/huyuning460/Helm_website/releases/latest/download/HYN-Agent-Setup-1.0.0.exe',
  portableUrl: 'https://github.com/huyuning460/Helm_website/releases/latest/download/HYN-Agent-Portable-1.0.0.zip',
  installerSize: '148 MB',
  portableSize: '162 MB',
  // TODO(用户可替换)：打包出正式安装包后，在此填入真实的 SHA-256 哈希值与 VirusTotal 报告链接
  installerSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  portableSha256: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
  virusTotalUrl: 'https://www.virustotal.com/',
  // 实机演示视频与高清截图路径（放置在 docs/public/media/ 下即可自动启用）
  demoVideoUrl: '/media/hero-demo.mp4',
  demoPosterUrl: '/media/hero-poster.png',
  systemRequirements: {
    os: 'Windows 10 / 11 (x64)',
    ram: '8 GB RAM (ローカルLLM利用時は 16GB+ 推奨)',
    network: '完全オフライン稼働対応 (127.0.0.1 ローカルバックエンド内蔵)'
  }
}
