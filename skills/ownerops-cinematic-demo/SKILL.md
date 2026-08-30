---
name: ownerops-cinematic-demo
description: Orchestrate authentic OwnerOps WebMCP demo-video production, including product-truth sync, real ChatGPT capture gates, Playwright product capture, restrained Remotion assembly, sound, rendering, and evidence review. Use only for the ownerops-film production repository; never modify the OwnerOps product.
---

# OwnerOps Cinematic Demo

Produce a premium, capability-led OwnerOps film without weakening the proof or changing the product.

## Boundary

- Work only in `ownerops-film`.
- Treat `ownerops-webmcp` branch `re0/ai-store-manager` as read only.
- Never solve capture problems by changing application code, calculations, demo data, WebMCP behavior, or filming-only UI.
- Prefer deterministic Playwright scripts for product capture. Use Playwright MCP for exploration and debugging when it materially helps.
- Use third-party repositories only at revisions pinned in `TOOLCHAIN.lock.md`.

## Canonical product truth

OwnerOps is a shared operational workspace where a human uses the visual interface and an agent uses structured WebMCP tools against the same live state. Do not frame it primarily as a chatbot, scheduling generator, or dashboard.

The signature interaction is immutable:

```text
Agent reads live store
→ Agent proposes
→ Candidate materializes in OwnerOps
→ Human directly edits candidate
→ Review becomes required
→ Agent re-reads the exact human-edited candidate
→ REVIEWED
→ Human explicitly applies
```

The canonical WebMCP tool set has exactly nine tools:

1. `configure_demo_store`
2. `get_store_state`
3. `get_daily_brief`
4. `record_operating_event`
5. `plan_store_actions`
6. `preview_store_plan`
7. `evaluate_current_plan`
8. `apply_store_plan`
9. `restore_store_snapshot`

Do not substitute any other count or read/write split for this exact nine-tool contract.

## Required workflow

1. Sync current product truth from the release-candidate branch. Record its commit in `docs/PRODUCTION_STATUS.md`; do not write to it.
2. Run `scripts/check-env.sh` and distinguish missing tools from working tools.
3. Read `docs/SHOTLIST_105S_CURRENT.md` and `docs/CAPTURE_MATRIX.md`.
4. Check for all five authentic files in `assets/chatgpt/` using `docs/REAL_WEBMCP_RECORDING_CHECKLIST.md`.
5. Stop causal-sequence assembly if authentic footage is missing. Continue safe product-only capture and graphics work.
6. Read the pinned demo-video skill and use its engineering pipeline without inheriting its default skin.
7. Read pinned video-shotcraft `SKILL.md`, `references/pipeline.md`, gallery index, only the selected shot cards, and their real demo implementations. Use autonomous free-creation mode; derive a language from OwnerOps rather than reskinning a generic template.
8. Read the relevant pinned Remotion skills before authoring or rendering the timeline.
9. Capture product-only shots from real rendered OwnerOps UI at a larger size than the final crop when possible.
10. Build one representative cinematic proof of concept. Inspect its actual frames or contact sheet before expanding it.
11. Assemble the full 1920×1080, 30 fps Remotion timeline around authentic footage.
12. Add restrained sound. Keep BGM and SFX separable so a SFX-only mix remains practical.
13. Render H.264/yuv420p with AAC at 48 kHz.
14. Generate and inspect a contact sheet and selected spot frames. Check crop, text, holds, causality, and visual continuity.
15. Play the final MP4 end-to-end and report only genuine remaining blockers.

## Authenticity gate

These elements must come from one real ChatGPT Desktop/in-app browser and OwnerOps workflow:

- WebMCP/Site Tools connection
- plan creation and preview materialization
- direct human candidate edit
- Review required while Apply remains unavailable
- the request to evaluate the exact current preview
- real `evaluate_current_plan`
- unchanged human-edited candidate becoming `REVIEWED`
- final human Apply

Never reconstruct ChatGPT UI or Site Tools in React or Remotion. Never fabricate messages, tool counts, `REVIEWED`, or causal continuity. Never make Apply appear available before review. Keep the real cursor visible during the human edit and final Apply, and minimize it elsewhere.

Expected authentic files:

```text
assets/chatgpt/01_webmcp_connected.mp4
assets/chatgpt/02_agent_plan_preview.mp4
assets/chatgpt/03_human_edit.mp4
assets/chatgpt/04_agent_review_exact_edit.mp4
assets/chatgpt/05_apply_reviewed.mp4
```

## Direction

Use OwnerOps color, typography hierarchy, spacing, radius, surface, accent, status color, and information density from the current product. Do not distribute proprietary Apple fonts or copy Apple/OpenAI assets, trademarks, UI, music, or animation.

The tone is quiet, precise, editorial, premium, technical, human, confident. Prefer slow push-ins, 1.08×–1.22× UI zoom, controlled crop reveals, gentle lateral drift, subtle 2.5D depth, and one principal motion idea per shot. Use approximately 1.3× only for a critical detail. Hold important results for 2–4 seconds, `REVIEWED` for 3–4 seconds, and the final brand mark for at least 1.5 seconds.

Avoid generic startup montage, tutorial subtitle bars, bright feature labels, purple gradients, sparkles, cyberpunk/neon, omnipresent glass, giant labels, fake holograms, random rotation, bouncing cards, stock restaurant imagery, and constant cursor/zoom motion.

Use a restrained ambient/electronic bed, tactile ticks, low mechanical impacts, a small riser before review, a warm confirmation on `REVIEWED`, and a deeper confirmation on Apply. Avoid trailer music, loud EDM, notification spam, and voice-assistant cliché sounds.

## Remotion boundary

Remotion may crop, reframe, zoom, mask, sequence, add restrained typography, add sound, and render. It must not recreate existing OwnerOps interfaces or fake ChatGPT/Site Tools. Preserve understandable temporal causality through the human edit, exact re-read, review, and apply.

## Completion gate

Do not call production complete until:

- the current product commit and nine-tool contract are recorded;
- all real-footage requirements are present and inspected;
- product-only shots come from real UI;
- the representative proof of concept was inspected;
- the complete render exists in the target format;
- a contact sheet and spot frames were inspected;
- the final MP4 was played end-to-end;
- `docs/PRODUCTION_STATUS.md` records actual evidence and only remaining blockers.
