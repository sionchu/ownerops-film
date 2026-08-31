#!/usr/bin/env bash
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PRODUCT_DIR="${OWNEROPS_PRODUCT_DIR:-$ROOT_DIR/../ownerops-webmcp}"
failures=0

report_command() {
  local name="$1"
  shift
  if command -v "$name" >/dev/null 2>&1; then
    local version
    version="$($@ 2>&1 | head -n 1)"
    printf 'OK      %-18s %s\n' "$name" "$version"
  else
    printf 'MISSING %-18s\n' "$name"
    failures=$((failures + 1))
  fi
}

report_pin() {
  local name="$1"
  local expected="$2"
  local directory="$ROOT_DIR/tools/$name"
  if [[ ! -d "$directory/.git" ]]; then
    printf 'MISSING %-18s expected %s\n' "$name" "$expected"
    failures=$((failures + 1))
    return
  fi
  local actual
  actual="$(git -C "$directory" rev-parse HEAD 2>/dev/null || true)"
  if [[ "$actual" == "$expected" ]]; then
    printf 'OK      %-18s %s\n' "$name" "$actual"
  else
    printf 'MISMATCH %-18s expected %s got %s\n' "$name" "$expected" "$actual"
    failures=$((failures + 1))
  fi
}

echo "OwnerOps film environment"
report_command git git --version
report_command node node --version
report_command npm npm --version
report_command ffmpeg ffmpeg -version
report_command ffprobe ffprobe -version

report_pin demo-video-skill 773c07e9abc128d430f0da17b685ac1c48f8064a
report_pin video-shotcraft c30d78438ef2e8c9cb2b620f19fecff13d982bd3
report_pin remotion-agent-skills 13058097a54c747524bb667fde4dde741576282e
report_pin playwright-mcp d0c29a5658b93b6e62435ceaf362a7d7dfc3522d

if [[ -d "$PRODUCT_DIR/.git" ]]; then
  product_branch="$(git -C "$PRODUCT_DIR" branch --show-current 2>/dev/null || true)"
  product_commit="$(git -C "$PRODUCT_DIR" rev-parse HEAD 2>/dev/null || true)"
  printf 'OK      %-18s branch=%s commit=%s\n' ownerops-product "$product_branch" "$product_commit"

  tool_hits=0
  for tool in configure_demo_store get_store_state get_daily_brief record_operating_event plan_store_actions preview_store_plan evaluate_current_plan apply_store_plan restore_store_snapshot; do
    if grep -R -F --include='*.ts' --include='*.tsx' -q "$tool" "$PRODUCT_DIR/src" 2>/dev/null; then
      tool_hits=$((tool_hits + 1))
    fi
  done
  if [[ "$tool_hits" -eq 9 ]]; then
    printf 'OK      %-18s 9 canonical tool names found\n' webmcp-tools
  else
    printf 'MISMATCH %-18s found %s of 9 canonical tool names\n' webmcp-tools "$tool_hits"
    failures=$((failures + 1))
  fi
else
  printf 'MISSING %-18s %s\n' ownerops-product "$PRODUCT_DIR"
  failures=$((failures + 1))
fi

for file in \
  "$ROOT_DIR/.agents/skills/ownerops-cinematic-demo/SKILL.md" \
  "$ROOT_DIR/.agents/skills/remotion-best-practices/SKILL.md" \
  "$ROOT_DIR/scripts/capture/record-webmcp-proof.mjs" \
  "$ROOT_DIR/scripts/capture/extract-webmcp-clips.mjs" \
  "$ROOT_DIR/scripts/capture/windows/focus-chatgpt.ps1" \
  "$ROOT_DIR/scripts/capture/windows/capture-hotkeys.ps1" \
  "$ROOT_DIR/scripts/capture/macos/focus-chatgpt.applescript" \
  "$ROOT_DIR/node_modules/.bin/remotion"; do
  if [[ -e "$file" ]]; then
    printf 'OK      %-18s %s\n' prepared "${file#$ROOT_DIR/}"
  else
    printf 'MISSING %-18s %s\n' prepared "${file#$ROOT_DIR/}"
    failures=$((failures + 1))
  fi
done

if node --check "$ROOT_DIR/scripts/capture/record-webmcp-proof.mjs" >/dev/null 2>&1 \
  && node --check "$ROOT_DIR/scripts/capture/extract-webmcp-clips.mjs" >/dev/null 2>&1; then
  printf 'OK      %-18s %s\n' capture-harness 'Node entry points parse'
else
  printf 'MISMATCH %-18s %s\n' capture-harness 'Node entry point syntax error'
  failures=$((failures + 1))
fi

if [[ "$failures" -eq 0 ]]; then
  echo "ENVIRONMENT CHECK: PASS"
  exit 0
fi

echo "ENVIRONMENT CHECK: FAIL ($failures issue(s))"
exit 1
