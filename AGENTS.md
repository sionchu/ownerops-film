# OwnerOps Film — Production Contract

## Scope

This repository owns demo-video production only. Do not edit `ownerops-webmcp`, change WebMCP behavior, alter calculations or demo data, add filming-only product UI, or place production dependencies or footage in the product repository.

Before work, read in order:

1. `docs/PRODUCTION_STATUS.md`
2. `TOOLCHAIN.lock.md`
3. `skills/ownerops-cinematic-demo/SKILL.md`
4. `docs/SHOTLIST_105S_CURRENT.md`
5. `docs/CAPTURE_MATRIX.md`
6. `docs/REAL_WEBMCP_RECORDING_CHECKLIST.md`
7. `docs/STYLE_REFERENCES.md`

## Immutable product truth

OwnerOps is a shared operational workspace where human UI and agent tools act on one live state. It is not presented primarily as a chatbot, schedule generator, or dashboard.

The canonical tool set is exactly:

`configure_demo_store`, `get_store_state`, `get_daily_brief`, `record_operating_event`, `plan_store_actions`, `preview_store_plan`, `evaluate_current_plan`, `apply_store_plan`, `restore_store_snapshot`.

Keep every film-production artifact synchronized to this exact nine-tool contract.

## Authenticity

Never reconstruct ChatGPT, Site Tools, tool calls, messages, `REVIEWED`, or the causal human-edit/re-review/apply proof. Do not splice unrelated states as if connected. Apply must remain unavailable until the real review completes. Keep the real cursor visible for the human edit and final human Apply.

Use Playwright against real rendered OwnerOps UI for product-only capture. Use deterministic scripts before MCP when scripting is simpler. Use Remotion only for editorial treatment around authentic footage.

## Visual and audio direction

Use OwnerOps-derived tokens. Aim for quiet, precise, editorial, premium, technical, human, confident presentation. Use slow push-ins, controlled crops, gentle drift, subtle depth, and one principal motion idea per shot. Avoid generic promo skins, purple AI gradients, sparkles, neon, stock restaurant imagery, constant zooming, bouncing cards, and copied Apple/OpenAI assets.

Sound should be restrained: ambient/electronic bed, tactile ticks, low mechanical impacts, a small riser before review, a warm review tone, and a deeper apply confirmation. Prepare BGM+SFX and SFX-only mixes when practical.

## Canonical artifacts and evidence

Maintain one file per concept. Do not create `v2`, `final-final`, duplicate shotlists, parallel style guides, or duplicate MCP configurations.

Report actual results only. Separate completed work, checks executed, missing footage, and blockers. Before delivery, render the full film, inspect a contact sheet and spot frames, and play the final MP4 end-to-end.
