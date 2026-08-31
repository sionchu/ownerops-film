import {access, mkdir, readFile, writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import {pathToFileURL} from 'node:url';
import {buildProofClipPlan} from './proof-plan.mjs';

const root = path.resolve(import.meta.dirname, '..', '..');

const parseArgs = (argv) => {
  const options = {overwrite: false};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--metadata') options.metadata = argv[++index];
    else if (value === '--output-dir') options.outputDir = argv[++index];
    else if (value === '--overwrite') options.overwrite = true;
    else throw new Error(`Unknown argument: ${value}`);
  }
  if (!options.metadata) throw new Error('Usage: --metadata <take-metadata.json> [--output-dir <dir>] [--overwrite]');
  return options;
};

const resolveInsideRoot = (candidate, label) => {
  const resolved = path.resolve(root, candidate);
  const relative = path.relative(root, resolved);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay inside ownerops-film`);
  }
  return resolved;
};

const run = (command, args, {capture = false} = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
      windowsHide: true,
    });
    let stdout = '';
    let stderr = '';
    if (capture) {
      child.stdout.on('data', (chunk) => (stdout += chunk));
      child.stderr.on('data', (chunk) => (stderr += chunk));
    }
    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) resolve({stdout, stderr});
      else reject(new Error(`${command} exited ${code}${stderr ? `: ${stderr.trim()}` : ''}`));
    });
  });

const probe = async (file) => {
  const {stdout} = await run(
    'ffprobe',
    [
      '-v',
      'error',
      '-show_entries',
      'stream=index,codec_name,width,height,pix_fmt,r_frame_rate,sample_rate,channels',
      '-show_entries',
      'format=duration',
      '-of',
      'json',
      file,
    ],
    {capture: true},
  );
  return JSON.parse(stdout);
};

const exists = async (file) => {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
};

export const extractProofClips = async ({metadataPath, outputDir, overwrite = false}) => {
  const resolvedMetadata = resolveInsideRoot(metadataPath, 'metadata path');
  const metadata = JSON.parse(await readFile(resolvedMetadata, 'utf8'));
  const master = resolveInsideRoot(metadata.masterPath, 'master path');
  if (!(await exists(master))) throw new Error(`Master recording not found: ${master}`);

  const masterProbe = await probe(master);
  const masterDurationSec = Number(masterProbe.format?.duration);
  const clips = buildProofClipPlan(metadata.markers, masterDurationSec);
  const resolvedOutput = resolveInsideRoot(
    outputDir ?? path.join(path.dirname(path.relative(root, resolvedMetadata)), 'clips'),
    'output directory',
  );
  await mkdir(resolvedOutput, {recursive: true});

  const targets = clips.map((clip) => path.join(resolvedOutput, clip.clip));
  if (!overwrite) {
    const existing = [];
    for (const target of targets) {
      if (await exists(target)) existing.push(path.relative(root, target));
    }
    if (existing.length) {
      throw new Error(`Refusing to overwrite existing clips: ${existing.join(', ')}`);
    }
  }

  const extracted = [];
  for (const [index, clip] of clips.entries()) {
    const target = targets[index];
    await run('ffmpeg', [
      '-hide_banner',
      '-loglevel',
      'warning',
      overwrite ? '-y' : '-n',
      '-ss',
      String(clip.startSec),
      '-i',
      master,
      '-f',
      'lavfi',
      '-i',
      'anullsrc=channel_layout=stereo:sample_rate=48000',
      '-t',
      String(clip.durationSec),
      '-map',
      '0:v:0',
      '-map',
      '1:a:0',
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-crf',
      '18',
      '-pix_fmt',
      'yuv420p',
      '-r',
      '30',
      '-c:a',
      'aac',
      '-ar',
      '48000',
      '-b:a',
      '128k',
      '-shortest',
      '-movflags',
      '+faststart',
      target,
    ]);
    const clipProbe = await probe(target);
    extracted.push({
      ...clip,
      path: path.relative(root, target).replaceAll('\\', '/'),
      probe: clipProbe,
    });
    process.stdout.write(`extracted ${clip.clip}\n`);
  }

  const updated = {
    ...metadata,
    status: 'clips_extracted_pending_review',
    extraction: {
      extractedAt: new Date().toISOString(),
      outputDirectory: path.relative(root, resolvedOutput).replaceAll('\\', '/'),
      masterProbe,
      clips: extracted,
    },
  };
  await writeFile(resolvedMetadata, `${JSON.stringify(updated, null, 2)}\n`, 'utf8');
  return updated;
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const options = parseArgs(process.argv.slice(2));
  await extractProofClips({
    metadataPath: options.metadata,
    outputDir: options.outputDir,
    overwrite: options.overwrite,
  });
}
