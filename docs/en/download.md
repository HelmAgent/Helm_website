---
title: Download & Security Verification
description: Download HYN Agent Windows Installer and Portable ZIP, verify SHA-256 checksums, and audit 100% offline operation.
---

# Download & Security Verification

<DownloadCenter lang="en" />

---

## How to Independently Verify "100% Local & Zero Egress" in 3 Steps

For a desktop agent capable of reading local source code and office documents, trust must be verifiable rather than assumed. You can verify HYN Agent's zero-egress architecture in three physical steps:

### Step 1: Verify SHA-256 Checksum
Run the following PowerShell command after downloading to confirm binary integrity against the SHA-256 checksum above:
```powershell
Get-FileHash .\HYN-Agent-Setup-1.0.0.exe -Algorithm SHA256
```

### Step 2: Run Under Air-Gapped / Firewall-Blocked Conditions
1. Start `Ollama` locally on `127.0.0.1:11434` (or connect to an internal corporate LAN vLLM / SGLang endpoint).
2. **Disconnect Wi-Fi / Ethernet** (or block all outbound internet traffic for HYN Agent in Windows Firewall, allowing only `127.0.0.1`).
3. Select **"Ollama (Local Offline)"** in Settings. You can execute multi-step code refactoring, run unit test suites, and edit Word/Excel/PPT documents completely offline.

### Step 3: Inspect Transparent Local Storage & Sanitized Logs
- All sessions, two-tier memories (`.md` files with YAML frontmatter), and file snapshots are stored transparently in your chosen local data directory (`.hyn_agent/`).
- Inspect `.hyn_agent/logs/main.log` and `renderer.log` to verify that the Electron `sanitizeLogMessage` hook scrubs any `sk-*`, `Bearer`, or `api_key` patterns into `***` before writing to disk.
