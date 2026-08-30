# OwnerOps Film

Private cinematic demo-production workspace for the OwnerOps WebMCP hackathon film.

This repository is the source of truth for capture plans, authentic ChatGPT footage, Remotion timeline code, sound placement, review evidence, and delivery metadata. The OwnerOps product remains separate and read only during film production.

```text
ownerops-webmcp/  # PRODUCT — READ ONLY
ownerops-film/    # VIDEO PRODUCTION — work here
```

## Product truth

OwnerOps is a shared operational workspace where a human uses the visual interface and an agent uses structured WebMCP tools against the same live state. The centerpiece is the causal sequence:

```text
Agent reads live store
→ Agent proposes
→ Candidate materializes in OwnerOps
→ Human edits the candidate
→ Review becomes required
→ Agent re-reads the exact edited candidate
→ REVIEWED
→ Human explicitly applies
```

The release-candidate branch is `re0/ai-store-manager`. Its canonical WebMCP surface is exactly nine tools:

1. `configure_demo_store`
2. `get_store_state`
3. `get_daily_brief`
4. `record_operating_event`
5. `plan_store_actions`
6. `preview_store_plan`
7. `evaluate_current_plan`
8. `apply_store_plan`
9. `restore_store_snapshot`

Only this nine-tool contract is valid production guidance.

## Start or resume production

1. Open this repository as the Codex working directory.
2. Read `AGENTS.md`, then `docs/PRODUCTION_STATUS.md`.
3. Run `./scripts/bootstrap.sh` from Git Bash, macOS, Linux, or WSL.
4. Run `./scripts/check-env.sh` and resolve only reported missing requirements.
5. Invoke `skills/ownerops-cinematic-demo/SKILL.md` and follow its gates.
6. Record the five authentic clips listed in `docs/REAL_WEBMCP_RECORDING_CHECKLIST.md` before assembling the causally critical section.
7. Update the one canonical shotlist and capture matrix; do not create parallel versions.

Third-party repositories are cloned into ignored `tools/` directories at pinned commits from `TOOLCHAIN.lock.md`. Project-local generated skill discovery files live under ignored `.agents/skills/`; global Codex configuration is not overwritten.

## Commands

```bash
./scripts/bootstrap.sh
./scripts/check-env.sh
npm run compositions
npm run studio
npm run capture:product
npm run render:setup-check
```

`npm run render:setup-check` renders only a short production-environment slate. It is not final footage and does not reconstruct product or ChatGPT UI.

## Required authentic footage

Place the real recordings here without committing them:

```text
assets/chatgpt/01_webmcp_connected.mp4
assets/chatgpt/02_agent_plan_preview.mp4
assets/chatgpt/03_human_edit.mp4
assets/chatgpt/04_agent_review_exact_edit.mp4
assets/chatgpt/05_apply_reviewed.mp4
```

The ChatGPT Desktop/in-app browser, Site Tools calls, `REVIEWED` transition, and final Apply must be real and causally continuous. Remotion may crop, reframe, zoom, mask, sequence, add restrained typography, and place sound around that footage; it must not fabricate the proof.

## Delivery target

- 1920×1080
- 30 fps
- H.264
- yuv420p
- AAC 48 kHz
- approximately 105 seconds; always under 180 seconds

Canonical production documents are limited to the files in `docs/`. Raw video, generated renders, external repositories, secrets, and dependency directories are intentionally untracked.
