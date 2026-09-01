import {Audio, Video} from '@remotion/media';
import {AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const C = {canvas: '#f2f3f1', surface: '#fbfcfa', ink: '#18231f', muted: '#68736f', accent: '#2f6b55', line: '#dfe3df'};
const font = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const sec = (value: number) => Math.round(value * 30);

const fade = (frame: number, duration: number) => interpolate(frame, [0, 18, duration - 18, duration], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const Copy = ({eyebrow, title, align = 'left'}: {eyebrow?: string; title: string; align?: 'left' | 'center'}) => {
  const frame = useCurrentFrame();
  return <div style={{position: 'absolute', left: align === 'left' ? 96 : 300, right: align === 'left' ? 840 : 300, top: align === 'left' ? 120 : 360, textAlign: align, color: C.ink}}>
    {eyebrow && <div style={{fontSize: 22, fontWeight: 750, letterSpacing: 4, color: C.accent, textTransform: 'uppercase', opacity: interpolate(frame, [5, 25], [0, 1], {extrapolateRight: 'clamp'})}}>{eyebrow}</div>}
    <div style={{fontSize: align === 'left' ? 72 : 82, lineHeight: 1.08, fontWeight: 620, letterSpacing: -3.2, marginTop: 18, opacity: interpolate(frame, [0, 28], [0, 1], {extrapolateRight: 'clamp'}), translate: `0 ${interpolate(frame, [0, 28], [24, 0], {extrapolateRight: 'clamp'})}px`}}>{title}</div>
  </div>;
};

const ImageShot = ({src, title, eyebrow, fit = 'cover', position = 'center', dark = false}: {src: string; title?: string; eyebrow?: string; fit?: 'cover' | 'contain'; position?: string; dark?: boolean}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return <AbsoluteFill style={{background: C.canvas, overflow: 'hidden', fontFamily: font, opacity: fade(frame, durationInFrames)}}>
    <Img src={staticFile(`media/${src}`)} style={{width: '100%', height: '100%', objectFit: fit, objectPosition: position, scale: interpolate(frame, [0, durationInFrames], [1.03, 1.10], {easing: Easing.bezier(0.2, 0.75, 0.2, 1)}), filter: dark ? 'brightness(0.54) saturate(0.75)' : undefined}} />
    {title && <><div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(242,243,241,.97) 0%,rgba(242,243,241,.88) 35%,rgba(242,243,241,0) 68%)'}}/><Copy title={title} eyebrow={eyebrow}/></>}
  </AbsoluteFill>;
};

const ProofShot = ({src, trim = 0, rate = 1, title, label}: {src: string; trim?: number; rate?: number; title?: string; label?: string}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return <AbsoluteFill style={{background: '#0f1412', overflow: 'hidden', fontFamily: font, opacity: fade(frame, durationInFrames)}}>
    <Video src={staticFile(`media/${src}`)} trimBefore={sec(trim)} playbackRate={rate} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', scale: 1.045, translate: '0 18px'}} />
    <div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.15), inset 0 -190px 150px -120px rgba(10,16,13,.72)'}}/>
    {label && <div style={{position: 'absolute', left: 84, bottom: 72, color: '#e7eee9', fontSize: 20, letterSpacing: 3, fontWeight: 720, textTransform: 'uppercase'}}>{label}</div>}
    {title && <div style={{position: 'absolute', right: 84, bottom: 66, maxWidth: 780, textAlign: 'right', color: 'white', fontSize: 48, fontWeight: 590, letterSpacing: -1.8, opacity: interpolate(frame, [12, 28], [0, 1], {extrapolateRight: 'clamp'})}}>{title}</div>}
  </AbsoluteFill>;
};

const Montage = ({items}: {items: string[]}) => {
  const frame = useCurrentFrame();
  const index = Math.min(items.length - 1, Math.floor(frame / Math.max(1, Math.floor(sec(10) / items.length))));
  return <ImageShot src={items[index]} fit="contain" />;
};

const EndCard = () => <AbsoluteFill style={{background: C.canvas, fontFamily: font, color: C.ink, alignItems: 'center', justifyContent: 'center'}}>
  <div style={{fontSize: 24, letterSpacing: 5, fontWeight: 780, color: C.accent}}>9 WEBMCP TOOLS</div>
  <div style={{fontSize: 112, letterSpacing: -5, fontWeight: 650, marginTop: 24}}>OwnerOps</div>
  <div style={{fontSize: 34, color: C.muted, marginTop: 18}}>Human UI. Agent tools. One live state.</div>
  <div style={{width: 84, height: 2, background: C.line, margin: '34px 0'}}/>
  <div style={{fontSize: 24, color: C.accent, fontWeight: 650}}>Built with WebMCP</div>
</AbsoluteFill>;

export const OwnerOpsCinematicPoC = ({bgm = true}: {bgm?: boolean}) => <AbsoluteFill style={{background: C.canvas}}>
  {bgm && <Audio src={staticFile('media/ambient.wav')} volume={0.85}/>} 
  {[8, 16, 29, 42, 51, 64, 80, 92, 100].map((at) => <Sequence key={at} from={sec(at)} durationInFrames={sec(.18)}><Audio src={staticFile('media/tick.wav')}/></Sequence>)}
  <Sequence from={sec(78.5)} durationInFrames={sec(.8)}><Audio src={staticFile('media/review.wav')}/></Sequence>
  <Sequence from={sec(89.5)} durationInFrames={sec(.9)}><Audio src={staticFile('media/apply.wav')}/></Sequence>

  <Sequence from={sec(0)} durationInFrames={sec(7)}><ImageShot src="opening-state-overscan.png" title="Running a store means hundreds of small decisions." eyebrow="OwnerOps" dark/></Sequence>
  <Sequence from={sec(7)} durationInFrames={sec(10)}><Montage items={['today-brief.png', 'schedule-week.png', 'analysis-sales.png', 'analysis-costs-stock.png', 'store-inventory.png']}/></Sequence>
  <Sequence from={sec(17)} durationInFrames={sec(6)}><ProofShot src="01_webmcp_connected.mp4" trim={6} label="Real ChatGPT · Site Tools" title="Ask for the outcome."/></Sequence>
  <Sequence from={sec(23)} durationInFrames={sec(6)}><ProofShot src="02_agent_plan_preview.mp4" trim={0} rate={3.5} label="Structured live-state read"/></Sequence>
  <Sequence from={sec(29)} durationInFrames={sec(13)}><ProofShot src="02_agent_plan_preview.mp4" trim={68} label="Real OwnerOps candidate" title="Impact before commitment."/></Sequence>
  <Sequence from={sec(42)} durationInFrames={sec(9)}><Montage items={['analysis-costs-stock.png', 'analysis-sales.png', 'schedule-month.png']}/></Sequence>
  <Sequence from={sec(51)} durationInFrames={sec(13)}><ProofShot src="03_human_edit.mp4" trim={4.8} label="Human direct edit" title="Then the human changes it."/></Sequence>
  <Sequence from={sec(64)} durationInFrames={sec(10)}><ProofShot src="04_agent_review_exact_edit.mp4" trim={0} rate={4} label="evaluate_current_plan" title="The agent sees the exact edit."/></Sequence>
  <Sequence from={sec(74)} durationInFrames={sec(9)}><ProofShot src="04_agent_review_exact_edit.mp4" trim={40} label="Same live state" title="REVIEWED"/></Sequence>
  <Sequence from={sec(83)} durationInFrames={sec(9)}><ProofShot src="05_apply_reviewed.mp4" trim={2.7} label="Human approval" title="Applied only when approved."/></Sequence>
  <Sequence from={sec(92)} durationInFrames={sec(8)}><Montage items={['today-brief.png', 'schedule-day.png', 'analysis-sales.png', 'store-inventory.png']}/></Sequence>
  <Sequence from={sec(100)} durationInFrames={sec(5)}><EndCard/></Sequence>
</AbsoluteFill>;
