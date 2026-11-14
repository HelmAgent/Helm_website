/**
 * 零外部依赖 PKZIP (STORE, CRC-32) 内存归档器与浏览器端 WebCrypto SHA-256 校验工具。
 *
 * 职责与协作：
 * - 为 `BenchmarkReportView.vue` 提供真实可用的单文件下载、整套证据包 `.zip` 一键打包下载与浏览器端实时 SHA-256 密码学验签能力。
 * - 支持 UTF-8 文件名标志位（Bit 11），兼容 Windows Explorer、macOS Archive Utility、7-Zip 与 unzip。
 */

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[i] = c >>> 0
  }
  return table
})()

export function crc32(bytes) {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

/**
 * 将一组 `{ name: string, data: Uint8Array }` 打包为标准未压缩 `.zip` 二进制流。
 */
export function buildStoreZip(entries) {
  const encoder = new TextEncoder()
  const localParts = []
  const centralParts = []
  let offset = 0

  const now = new Date()
  const dosTime =
    ((now.getHours() & 0x1f) << 11) |
    ((now.getMinutes() & 0x3f) << 5) |
    ((now.getSeconds() >> 1) & 0x1f)
  const dosDate =
    (((now.getFullYear() - 1980) & 0x7f) << 9) |
    (((now.getMonth() + 1) & 0x0f) << 5) |
    (now.getDate() & 0x1f)

  for (const item of entries) {
    const nameBytes = encoder.encode(item.name.replace(/^\/+/, ''))
    const dataBytes =
      item.data instanceof Uint8Array
        ? item.data
        : encoder.encode(String(item.data ?? ''))
    const checksum = crc32(dataBytes)
    const size = dataBytes.byteLength

    // Local File Header (30 bytes + filename)
    const localHeader = new ArrayBuffer(30 + nameBytes.length)
    const lv = new DataView(localHeader)
    lv.setUint32(0, 0x04034b50, true) // signature
    lv.setUint16(4, 20, true) // version needed (2.0)
    lv.setUint16(6, 0x0800, true) // UTF-8 filename flag
    lv.setUint16(8, 0, true) // compression: 0 = STORE
    lv.setUint16(10, dosTime, true)
    lv.setUint16(12, dosDate, true)
    lv.setUint32(14, checksum, true)
    lv.setUint32(18, size, true)
    lv.setUint32(22, size, true)
    lv.setUint16(26, nameBytes.length, true)
    lv.setUint16(28, 0, true)
    new Uint8Array(localHeader, 30).set(nameBytes)

    localParts.push(new Uint8Array(localHeader), dataBytes)

    // Central Directory Header (46 bytes + filename)
    const centralHeader = new ArrayBuffer(46 + nameBytes.length)
    const cv = new DataView(centralHeader)
    cv.setUint32(0, 0x02014b50, true) // central file header signature
    cv.setUint16(4, 20, true) // version made by
    cv.setUint16(6, 20, true) // version needed
    cv.setUint16(8, 0x0800, true) // UTF-8 flag
    cv.setUint16(10, 0, true) // compression: STORE
    cv.setUint16(12, dosTime, true)
    cv.setUint16(14, dosDate, true)
    cv.setUint32(16, checksum, true)
    cv.setUint32(20, size, true)
    cv.setUint32(24, size, true)
    cv.setUint16(28, nameBytes.length, true)
    cv.setUint16(30, 0, true)
    cv.setUint16(32, 0, true)
    cv.setUint16(34, 0, true)
    cv.setUint16(36, 0, true)
    cv.setUint32(38, 0, true)
    cv.setUint32(42, offset, true) // relative offset of local header
    new Uint8Array(centralHeader, 46).set(nameBytes)

    centralParts.push(new Uint8Array(centralHeader))
    offset += 30 + nameBytes.length + size
  }

  let centralSize = 0
  for (const c of centralParts) centralSize += c.byteLength

  // End of Central Directory Record (22 bytes)
  const eocd = new ArrayBuffer(22)
  const ev = new DataView(eocd)
  ev.setUint32(0, 0x06054b50, true)
  ev.setUint16(4, 0, true)
  ev.setUint16(6, 0, true)
  ev.setUint16(8, entries.length, true)
  ev.setUint16(10, entries.length, true)
  ev.setUint32(12, centralSize, true)
  ev.setUint32(16, offset, true)
  ev.setUint16(20, 0, true)

  return new Blob([...localParts, ...centralParts, new Uint8Array(eocd)], {
    type: 'application/zip'
  })
}

export async function sha256Hex(arrayBuffer) {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('WebCrypto API unavailable')
  }
  const digest = await crypto.subtle.digest('SHA-256', arrayBuffer)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function triggerBlobDownload(blob, filename) {
  if (typeof document === 'undefined') return
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export function formatBytes(bytes) {
  const n = Number(bytes)
  if (!Number.isFinite(n) || n < 0) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(2)} MB`
}
