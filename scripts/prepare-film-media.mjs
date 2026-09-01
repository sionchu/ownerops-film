import {copyFile, mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'public', 'media');
await mkdir(output, {recursive: true});

const files = [
  ...['01_webmcp_connected.mp4', '02_agent_plan_preview.mp4', '03_human_edit.mp4', '04_agent_review_exact_edit.mp4', '05_apply_reviewed.mp4'].map((name) => [path.join(root, 'assets', 'chatgpt', name), name]),
  ...['opening-state-overscan.png', 'today-brief.png', 'schedule-week.png', 'schedule-month.png', 'schedule-day.png', 'analysis-sales.png', 'analysis-costs-stock.png', 'store-inventory.png'].map((name) => [path.join(root, 'assets', 'product', name), name]),
];

for (const [source, name] of files) await copyFile(source, path.join(output, name));

const audio = [
  ['ambient.wav', ['-f', 'lavfi', '-i', 'sine=frequency=55:sample_rate=48000:duration=105', '-f', 'lavfi', '-i', 'sine=frequency=110:sample_rate=48000:duration=105', '-filter_complex', '[0:a]volume=0.035[a0];[1:a]volume=0.012,tremolo=f=0.1:d=0.35[a1];[a0][a1]amix=inputs=2,lowpass=f=520,afade=t=in:st=0:d=3,afade=t=out:st=101:d=4', '-ac', '2', '-ar', '48000']],
  ['tick.wav', ['-f', 'lavfi', '-i', 'sine=frequency=880:sample_rate=48000:duration=0.12', '-af', 'volume=0.12,afade=t=out:st=0.02:d=0.1', '-ac', '2', '-ar', '48000']],
  ['review.wav', ['-f', 'lavfi', '-i', 'sine=frequency=392:sample_rate=48000:duration=0.7', '-f', 'lavfi', '-i', 'sine=frequency=587.33:sample_rate=48000:duration=0.7', '-filter_complex', '[0:a]volume=0.10[a0];[1:a]volume=0.055,adelay=70|70[a1];[a0][a1]amix=2,afade=t=out:st=0.25:d=0.45', '-ac', '2', '-ar', '48000']],
  ['apply.wav', ['-f', 'lavfi', '-i', 'sine=frequency=98:sample_rate=48000:duration=0.8', '-f', 'lavfi', '-i', 'sine=frequency=196:sample_rate=48000:duration=0.55', '-filter_complex', '[0:a]volume=0.14[a0];[1:a]volume=0.07,adelay=55|55[a1];[a0][a1]amix=2,afade=t=out:st=0.22:d=0.58', '-ac', '2', '-ar', '48000']],
];

for (const [name, args] of audio) {
  const result = spawnSync('ffmpeg', ['-y', ...args, path.join(output, name)], {stdio: 'inherit'});
  if (result.status !== 0) throw new Error(`ffmpeg failed while generating ${name}`);
}

process.stdout.write(`prepared ${files.length} visual assets and ${audio.length} original audio assets\n`);
