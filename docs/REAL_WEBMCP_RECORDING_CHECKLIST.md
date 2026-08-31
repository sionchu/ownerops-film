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

## OS capture harness

Windows is the supported recording platform in this revision. macOS is detected and preflighted, but recording exits clearly as unsupported until the project has a trustworthy non-invasive global marker mechanism.

Preflight:

```bash
npm run proof:preflight
```

Windows acceptance:

- [ ] Exactly one visible ChatGPT Desktop window matches `OWNEROPS_CHATGPT_WINDOW_PATTERN` (default `ChatGPT`).
- [ ] The product checkout is clean, on `re0/ai-store-manager`, and its commit is synchronized in `docs/PRODUCTION_STATUS.md`.
- [ ] ffmpeg and ffprobe are available.
- [ ] The capture area excludes secrets, notifications, unrelated tabs, and private account details.
- [ ] The operator understands `F8` advances one phase and `F9` aborts the take.

Start a uniquely named take:

```bash
npm run proof:record -- --take rc-proof-01 --browser-zoom 100
```

The harness foregrounds the single ChatGPT window, records only its current bounds with ffmpeg `gdigrab`, includes the real cursor, writes `take.json`, and extracts all five clips after the final marker. It does not inject ChatGPT or OwnerOps UI input.

Marker sequence:

| F8 | Completed phase | Next operator action |
| ---: | --- | --- |
| 1 | WebMCP connected and Site Tools legible | Run the real planning prompt and wait for the candidate preview |
| 2 | Agent plan/preview materialized | Make exactly one direct candidate edit |
| 3 | `YOUR EDIT` / `Review required`; Apply unavailable | Do not edit again; ask for exact re-review |
| 4 | Real `evaluate_current_plan`; same candidate `REVIEWED` for 3–4 seconds | Human clicks `Apply reviewed plan` |
| 5 | Committed state updated and preview cleared | Harness holds 1.5 seconds, stops, and extracts clips |

Exactly one candidate edit is allowed in the take. Do not undo, redo, drag another shift, or make a second candidate change. Prompts and final Apply also remain real human interactions; only recording infrastructure is automated.

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

Harness output:

```text
assets/chatgpt/takes/TAKE_ID/
├── master.mkv
├── take.json
├── ffmpeg.log
└── clips/
    ├── 01_webmcp_connected.mp4
    ├── 02_agent_plan_preview.mp4
    ├── 03_human_edit.mp4
    ├── 04_agent_review_exact_edit.mp4
    └── 05_apply_reviewed.mp4
```

The extracted clips contain H.264/yuv420p video at 30 fps and AAC stereo silence at 48 kHz. They are review candidates, not accepted evidence. Inspect them and confirm causal continuity against the master. Promote an accepted set with:

```bash
npm run proof:extract -- --metadata assets/chatgpt/takes/TAKE_ID/take.json --output-dir assets/chatgpt
```

Promotion uses the canonical filenames and refuses to overwrite an existing accepted set unless the operator explicitly adds `--overwrite`.

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
