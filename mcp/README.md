# Playwright MCP with Codex

Direct Playwright scripts are the primary deterministic capture mechanism. MCP is optional and is intended for selector exploration, visible-state inspection, QA, and interaction debugging.

Codex supports project-scoped `.codex/config.toml` for trusted projects. This repository keeps the canonical merge snippet in `mcp/codex-config.toml`; bootstrap copies it to ignored `.codex/config.toml` only when no project config already exists. It never overwrites global `~/.codex/config.toml` or an existing project configuration.

## Project-local setup

1. Run `./scripts/bootstrap.sh` so the pinned Playwright MCP repository exists under `tools/playwright-mcp` and its dependencies are installed.
2. If `.codex/config.toml` does not exist, copy `mcp/codex-config.toml` there.
3. If it exists, merge only the `[mcp_servers.playwright]` table.
4. Trust the project, restart Codex, then run `codex mcp list` or use `/mcp`.
5. Keep the MCP output directory under ignored `review/playwright-mcp/`.

`mcp/playwright.json` is a generic JSON-client example. Adjust absolute paths if the client does not resolve commands relative to the repository root.

Do not use MCP merely to add architectural layers. For repeatable product capture, prefer `npm run capture:product` and the pinned demo-video pipeline.
