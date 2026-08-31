# OwnerOps Film Toolchain Lock

Accessed and prepared on 2026-08-31. Bootstrap must check out these commits in detached HEAD state under ignored `tools/` directories.

| Component | Source | Pinned revision | Local path | Use |
| --- | --- | --- | --- | --- |
| demo-video-skill | https://github.com/Kminer2053/demo-video-skill | `773c07e9abc128d430f0da17b685ac1c48f8064a` | `tools/demo-video-skill` | Deterministic browser capture, cursor/crop choreography, wait handling, ffmpeg compression |
| video-shotcraft | https://github.com/Vincentwei1021/video-shotcraft | `c30d78438ef2e8c9cb2b620f19fecff13d982bd3` | `tools/video-shotcraft` | Autonomous cinematic shot grammar, camera, 2.5D, pacing, transitions, sound |
| Remotion agent skills | https://github.com/remotion-dev/claude-code-plugin | `13058097a54c747524bb667fde4dde741576282e` | `tools/remotion-agent-skills` | `remotion-best-practices`, `remotion-create`, `remotion-markup`, `remotion-multimedia`, `remotion-render`, `remotion-studio` |
| Playwright MCP | https://github.com/microsoft/playwright-mcp | `d0c29a5658b93b6e62435ceaf362a7d7dfc3522d` | `tools/playwright-mcp` | Selector exploration, visual inspection, capture QA, interaction debugging |

## npm dependencies

Exact versions are committed in `package.json` and `package-lock.json`.

| Package | Version |
| --- | --- |
| `remotion` | `4.0.518` |
| `@remotion/cli` | `4.0.518` |
| `@remotion/bundler` | `4.0.518` |
| `playwright` | `1.62.1` |
| `react` / `react-dom` | `19.2.8` |
| `typescript` | `7.0.2` |

## System tools

- Git 2.40 or newer
- Node.js 22 or newer
- npm 10 or newer
- ffmpeg and ffprobe with H.264/AAC support
- Git Bash, macOS/Linux shell, or WSL for the bootstrap scripts
- Windows PowerShell 5.1 or newer for the supported Windows focus/hotkey path
- `osascript` and FFmpeg `avfoundation` for macOS preflight; macOS recording is not yet enabled

The bootstrap does not install paid software, alter global Codex configuration, or write to the OwnerOps product repository.

## Product truth synchronized read-only

- Repository: `sionchu/ownerops-webmcp`
- Branch: `re0/ai-store-manager`
- Commit inspected: `2da46b07c1aeaf57d10edadba2b377b2d0d9c8f5`
- Canonical WebMCP registration count: 9
