# Real WebMCP Recording Checklist

These recordings are mandatory evidence, not optional beauty footage. Store them under `assets/chatgpt/`; they are intentionally ignored by Git.

## Capture environment

- [ ] Current OwnerOps release candidate from `re0/ai-store-manager` is running or deployed.
- [ ] Product commit matches `docs/PRODUCTION_STATUS.md`.
- [ ] ChatGPT Desktop/in-app browser supports the real Site Tools/WebMCP flow.
- [ ] Exactly nine current OwnerOps tools are available.
- [ ] Recording area excludes secrets, unrelated tabs, personal notifications, and private account details.
- [ ] Display scaling, browser zoom, and capture resolution are recorded in the take notes.
- [ ] Cursor is visible for the human edit and final Apply; otherwise motion is minimized.

## Required files

| File | Required content | Acceptance |
| --- | --- | --- |
| `01_webmcp_connected.mp4` | Real ChatGPT/in-app browser connected to current OwnerOps with Site Tools available | Connection and current product identity are legible; no fake UI |
| `02_agent_plan_preview.mp4` | Profitability prompt, structured live-state read, alternatives, real preview materialization | Candidate is visibly created in OwnerOps, not only described in chat |
| `03_human_edit.mp4` | Human directly changes the current candidate | `YOUR EDIT` and `Review required` appear; Apply remains unavailable; real cursor visible |
| `04_agent_review_exact_edit.mp4` | Prompt asks to recalculate the exact current edit; real `evaluate_current_plan` runs | Same edited candidate remains; `REVIEWED` appears; hold 3–4 seconds |
| `05_apply_reviewed.mp4` | Human applies the reviewed plan | Apply occurs only after review; committed state updates; preview clears; real cursor visible |

## Critical continuous take

- [ ] Begin with the agent proposal visible.
- [ ] Perform one clear human edit.
- [ ] Show `YOUR EDIT` / `Review required`.
- [ ] Show that Apply is unavailable.
- [ ] Ask: `내가 수정한 안 기준으로 다시 계산해줘.`
- [ ] Capture the real `evaluate_current_plan` invocation.
- [ ] Keep the exact edited candidate visible or causally traceable.
- [ ] Show the same candidate becoming `REVIEWED`.
- [ ] Hold REVIEWED for 3–4 seconds.
- [ ] Capture the human clicking `Apply reviewed plan`.
- [ ] Show committed-state update and preview clear.

Prefer one continuous recording for the critical sequence. If a technical interruption forces multiple clips, preserve visible state identifiers and take notes so editorial joins cannot imply false causality.

## Technical inspection

For every accepted clip:

```bash
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt -show_entries format=duration -of json assets/chatgpt/FILE.mp4
```

- [ ] Resolution is large enough for the planned crop.
- [ ] Frame rate is stable enough for 30 fps delivery.
- [ ] Text and tool names are readable at the intended crop.
- [ ] No dropped modal, loading overlay, notification, or unrelated cursor movement obscures proof.
- [ ] Audio/privacy review is complete.
- [ ] A take note records date, product commit, browser/app version, and any editorial limitation.

Do not recreate or patch missing proof in Remotion. Re-record the real sequence.
