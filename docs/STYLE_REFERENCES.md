# OwnerOps Film Style References

References guide pacing and judgment, not asset reuse or imitation.

## OwnerOps first

The current product is the only source for film tokens. Synchronized from `ownerops-webmcp` branch `re0/ai-store-manager` at commit `2da46b07c1aeaf57d10edadba2b377b2d0d9c8f5`:

| Token family | Product source | Film use |
| --- | --- | --- |
| Color and status | Current CSS variables and status components | Backgrounds, restrained accents, REVIEWED/Apply emphasis |
| Typography hierarchy | Current application headings, labels, metrics | Remotion type scale and density; use redistributable/system fonts only |
| Spacing and radius | Current layout and component styles | Crop padding, title-card margins, frame geometry |
| Surfaces | Current workspace, candidate, delta, and review surfaces | Editorial planes and masks around real footage |
| Information density | Current 1920×1080 and responsive captures | Decide what to crop, not what to recreate |

### Current OwnerOps tokens

| Role | Current value |
| --- | --- |
| Canvas / surface / strong surface | `#f2f3f1` / `#fbfcfa` / `#ffffff` |
| Ink / muted / faint | `#18231f` / `#68736f` / `#909995` |
| Line / strong line | `#dfe3df` / `#cbd1cc` |
| Accent / hover / soft | `#2f6b55` / `#245541` / `#e6f0eb` |
| Warning / soft | `#a65a28` / `#fff0e2` |
| Danger / soft | `#a13f3f` / `#fbe9e7` |
| Info | `#3e6482` |
| Human-edit border / reviewed border | `#b97832` / `#2e7a5f` |
| Radius | 6 / 9 / 12 / 18 px, base 8 px |
| Motion | 160 / 260 / 460 ms with product easing curves |
| Font stack | Inter when available, then system UI fonts; do not distribute proprietary font files |

Do not hard-code a generic video-skill skin over the product. Do not inherit generic navy subtitle bars, bright blue feature labels, tutorial styling, or excessive fake cursor use.

## Official reference material

- [Apple MacBook Pro product page](https://www.apple.com/macbook-pro/) — study negative space, restrained headline density, product-first composition, and patient highlight pacing. Do not copy its imagery, font files, music, motion, or layouts.
- [OpenAI: Automating repetitive work at OpenAI with Codex](https://learn.chatgpt.com/blog/automating-repetitive-work-at-openai-with-codex) — study how real capability and workflow evidence are made legible. Do not fabricate ChatGPT UI or interactions.
- [Official Codex MCP documentation](https://learn.chatgpt.com/codex/extend/mcp) — configuration and capability reference for project-local MCP use.

## Direction

Quiet, precise, editorial, premium, technical, human, confident.

Preferred camera language:

- slow push-in;
- 1.08×–1.22× UI zoom;
- controlled crop reveal;
- gentle lateral drift;
- subtle 2.5D separation;
- one principal motion idea per shot.

Use approximately 1.3× only for critical detail. Hold important results 2–4 seconds, REVIEWED 3–4 seconds, and the final mark at least 1.5 seconds.

Avoid generic startup promo, PowerPoint staging, TikTok editing, purple AI gradients, sparkles, neon cyberpunk, pervasive glass, giant feature labels, fake holograms, constant zooming, random rotation, bouncing cards, stock restaurant footage, and copied ad choreography.

## Pinned shotcraft study route

Use `tools/video-shotcraft` at the locked commit. Before selecting motion:

1. read `SKILL.md` and `references/pipeline.md`;
2. inspect the gallery index;
3. choose only cards that support a restrained product close-up, controlled crop, or subtle depth;
4. inspect each chosen card's real demo implementation;
5. translate the camera principle into OwnerOps-derived geometry and tokens rather than reskinning a template.

Initial free-creation study selection:

| Shotcraft card | Real implementation read | OwnerOps adaptation |
| --- | --- | --- |
| `depth-layer-moves` / `multiplane` | `demos/camera/depth-layer-moves/MultiplaneReal.tsx` | Reduce parallax and scale amplitude; use only for product beauty shots with one controlled depth idea. |
| `title-demote-to-label` / default | `demos/typography/title-demote-to-label/TitleDemoteToLabel.tsx` | Use a restrained title-to-context transition without selection highlight, skeleton UI, blur spectacle, or generic styling. |
| `letterspace-materialize` / default | `demos/opening/letterspace-materialize/LetterspaceMaterialize.tsx` | Borrow only the patient simultaneous materialization timing for the OwnerOps closing mark; use normal licensed/system type, not the demo glyphs or gradient. |

Rejected for the representative proof of concept: scroll-brake reticles, dramatic dolly zoom, and spotlight overlays. They compete with the causal WebMCP proof and OwnerOps' quiet operating UI.

## Sound

Use a restrained ambient/electronic bed, tactile UI ticks, low mechanical impacts, a small riser before review, a warm REVIEWED tone, and a deeper Apply confirmation. Keep BGM and SFX separable. Do not use copyrighted reference music.
