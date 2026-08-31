#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TOOLS_DIR="$ROOT_DIR/tools"
LOCAL_SKILLS_DIR="$ROOT_DIR/.agents/skills"
PRODUCT_DIR="${OWNEROPS_PRODUCT_DIR:-$ROOT_DIR/../ownerops-webmcp}"

DEMO_VIDEO_SHA="773c07e9abc128d430f0da17b685ac1c48f8064a"
SHOTCRAFT_SHA="c30d78438ef2e8c9cb2b620f19fecff13d982bd3"
REMOTION_SKILLS_SHA="13058097a54c747524bb667fde4dde741576282e"
PLAYWRIGHT_MCP_SHA="d0c29a5658b93b6e62435ceaf362a7d7dfc3522d"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "missing required command: $1" >&2
    exit 1
  fi
}

clone_or_pin() {
  local name="$1"
  local url="$2"
  local sha="$3"
  local destination="$TOOLS_DIR/$name"

  if [[ ! -d "$destination/.git" ]]; then
    git clone --filter=blob:none "$url" "$destination"
  fi

  if [[ -n "$(git -C "$destination" status --porcelain)" ]]; then
    echo "refusing to change dirty tool checkout: $destination" >&2
    exit 1
  fi

  git -C "$destination" fetch --depth 1 origin "$sha"
  git -C "$destination" checkout --detach "$sha"
  local actual
  actual="$(git -C "$destination" rev-parse HEAD)"
  if [[ "$actual" != "$sha" ]]; then
    echo "pin mismatch for $name: expected $sha, got $actual" >&2
    exit 1
  fi
}

copy_skill() {
  local source="$1"
  local name="$2"
  local destination="$LOCAL_SKILLS_DIR/$name"
  mkdir -p "$destination"
  cp "$source/SKILL.md" "$destination/SKILL.md"
  for directory in references scripts assets agents gallery demos template; do
    if [[ -d "$source/$directory" ]]; then
      mkdir -p "$destination/$directory"
      cp -R "$source/$directory/." "$destination/$directory/"
    fi
  done
}

for command in git node npm npx ffmpeg ffprobe; do
  require_command "$command"
done

mkdir -p \
  "$TOOLS_DIR" \
  "$LOCAL_SKILLS_DIR" \
  "$ROOT_DIR/assets/product" \
  "$ROOT_DIR/assets/chatgpt" \
  "$ROOT_DIR/assets/chatgpt/takes" \
  "$ROOT_DIR/assets/audio" \
  "$ROOT_DIR/assets/stills" \
  "$ROOT_DIR/review/contact-sheets" \
  "$ROOT_DIR/review/spot-frames" \
  "$ROOT_DIR/review/playwright-mcp" \
  "$ROOT_DIR/renders"

clone_or_pin "demo-video-skill" "https://github.com/Kminer2053/demo-video-skill.git" "$DEMO_VIDEO_SHA"
clone_or_pin "video-shotcraft" "https://github.com/Vincentwei1021/video-shotcraft.git" "$SHOTCRAFT_SHA"
clone_or_pin "remotion-agent-skills" "https://github.com/remotion-dev/claude-code-plugin.git" "$REMOTION_SKILLS_SHA"
clone_or_pin "playwright-mcp" "https://github.com/microsoft/playwright-mcp.git" "$PLAYWRIGHT_MCP_SHA"

cd "$ROOT_DIR"
npm ci
npx playwright install chromium

for tool in demo-video-skill video-shotcraft playwright-mcp; do
  if [[ -f "$TOOLS_DIR/$tool/package-lock.json" ]]; then
    npm --prefix "$TOOLS_DIR/$tool" ci
  fi
done

copy_skill "$ROOT_DIR/skills/ownerops-cinematic-demo" "ownerops-cinematic-demo"
copy_skill "$TOOLS_DIR/demo-video-skill" "demo-video"
copy_skill "$TOOLS_DIR/video-shotcraft" "video-shotcraft"

for skill in remotion-best-practices remotion-create remotion-markup remotion-multimedia remotion-render remotion-studio; do
  source_path="$TOOLS_DIR/remotion-agent-skills/skills/$skill"
  if [[ -z "$source_path" || ! -f "$source_path/SKILL.md" ]]; then
    echo "missing required Remotion skill at pinned checkout: $skill" >&2
    exit 1
  fi
  copy_skill "$source_path" "$skill"
done

if [[ ! -f "$ROOT_DIR/.codex/config.toml" ]]; then
  mkdir -p "$ROOT_DIR/.codex"
  cp "$ROOT_DIR/mcp/codex-config.toml" "$ROOT_DIR/.codex/config.toml"
else
  echo "preserved existing project .codex/config.toml; merge mcp/codex-config.toml manually if needed"
fi

if [[ -d "$PRODUCT_DIR/.git" ]]; then
  echo "OwnerOps product detected read-only at: $PRODUCT_DIR"
else
  echo "OwnerOps product not found at $PRODUCT_DIR; set OWNEROPS_PRODUCT_DIR to the read-only clone" >&2
fi

echo "OwnerOps film bootstrap complete. Run ./scripts/check-env.sh."
