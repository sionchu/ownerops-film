import {execFile, spawn} from 'node:child_process';
import {createWriteStream} from 'node:fs';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import {promisify} from 'node:util';
import {extractProofClips} from './extract-webmcp-clips.mjs';
import {PROOF_PHASES} from './proof-plan.mjs';

const execFileAsync = promisify(execFile);
const root = path.resolve(import.meta.dirname, '..', '..');
const expectedProductBranch = 're0/ai-store-manager';
const windowsPowerShell = path.join(
  process.env.SystemRoot ?? 'C:\\Windows',
  'System32',
  'WindowsPowerShell',
  'v1.0',
  'powershell.exe',
);

const parseArgs = (argv) => {
  const command = argv[0] ?? 'preflight';
  const options = {command};
  for (let index = 1; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--take') options.takeId = argv[++index];
    else if (value === '--window-pattern') options.windowPattern = argv[++index];
    else if (value === '--fps') options.fps = Number(argv[++index]);
    else if (value === '--browser-zoom') options.browserZoom = Number(argv[++index]);
    else throw new Error(`Unknown argument: ${value}`);
  }
  if (!['preflight', 'record'].includes(command)) {
    throw new Error('Usage: record-webmcp-proof.mjs <preflight|record> [--take ID] [--window-pattern PATTERN] [--fps 30] [--browser-zoom 100]');
  }
  return options;
};

const firstLine = (value) => value.trim().split(/\r?\n/, 1)[0];

const run = async (command, args, options = {}) => {
  const result = await execFileAsync(command, args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
    windowsHide: true,
    ...options,
  });
  return {stdout: result.stdout ?? '', stderr: result.stderr ?? ''};
};

const relativeToRoot = (file) => path.relative(root, file).replaceAll('\\', '/');

const readProductTruth = async () => {
  const productDir = path.resolve(
    process.env.OWNEROPS_PRODUCT_DIR ?? path.join(root, '..', 'ownerops-webmcp'),
  );
  const [branch, commit, status, productionStatus] = await Promise.all([
    run('git', ['-C', productDir, 'branch', '--show-current']),
    run('git', ['-C', productDir, 'rev-parse', 'HEAD']),
    run('git', ['-C', productDir, 'status', '--porcelain']),
    readFile(path.join(root, 'docs', 'PRODUCTION_STATUS.md'), 'utf8'),
  ]);
  const currentBranch = branch.stdout.trim();
  const currentCommit = commit.stdout.trim();
  if (currentBranch !== expectedProductBranch) {
    throw new Error(`OwnerOps product must remain on ${expectedProductBranch}; found ${currentBranch || 'detached HEAD'}`);
  }
  if (status.stdout.trim()) {
    throw new Error('OwnerOps product checkout is not clean. The proof harness refuses to record against modified product code.');
  }
  if (!productionStatus.includes(currentCommit)) {
    throw new Error(`Product commit ${currentCommit} is not synchronized in docs/PRODUCTION_STATUS.md`);
  }
  return {
    repository: 'sionchu/ownerops-webmcp',
    branch: currentBranch,
    commit: currentCommit,
    clean: true,
  };
};

const toolVersions = async () => {
  const [{stdout: ffmpeg}, {stdout: ffprobe}] = await Promise.all([
    run('ffmpeg', ['-version']),
    run('ffprobe', ['-version']),
  ]);
  return {ffmpeg: firstLine(ffmpeg), ffprobe: firstLine(ffprobe)};
};

const inspectWindowsChatGpt = async ({windowPattern = 'ChatGPT', focus = false} = {}) => {
  const script = path.join(root, 'scripts', 'capture', 'windows', 'focus-chatgpt.ps1');
  const args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script, '-TitlePattern', windowPattern];
  if (!focus) args.push('-DryRun');
  const {stdout} = await run(windowsPowerShell, args);
  return JSON.parse(stdout.trim());
};

const inspectMac = async () => {
  const [{stdout: running}, {stdout: devices, stderr}] = await Promise.all([
    run('osascript', ['-e', 'application "ChatGPT" is running']),
    run('ffmpeg', ['-hide_banner', '-devices']).catch((error) => ({stdout: '', stderr: error.message})),
  ]);
  return {
    chatGptRunning: running.trim() === 'true',
    avfoundationAvailable: `${devices}\n${stderr}`.includes('avfoundation'),
    support: 'preflight-only',
    reason: 'macOS recording is gated until a non-invasive global marker mechanism is available.',
  };
};

const preflight = async (options = {}) => {
  if (!['win32', 'darwin'].includes(process.platform)) {
    throw new Error(`Unsupported platform: ${process.platform}. This harness detects Windows and macOS only.`);
  }
  const [versions, product] = await Promise.all([toolVersions(), readProductTruth()]);
  const platform =
    process.platform === 'win32'
      ? {
          support: 'recording-supported',
          chatGptWindow: await inspectWindowsChatGpt({windowPattern: options.windowPattern, focus: false}),
        }
      : await inspectMac();
  const result = {
    platform: process.platform,
    release: os.release(),
    architecture: process.arch,
    versions,
    product,
    ...platform,
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  return result;
};

const makeTakeId = (requested) => {
  const takeId = requested ?? new Date().toISOString().replaceAll(':', '-').replace(/\.\d{3}Z$/, 'Z');
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{2,79}$/.test(takeId)) {
    throw new Error('Take ID must be 3–80 characters using letters, numbers, dot, underscore, or hyphen');
  }
  return takeId;
};

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const recordWindows = async (options) => {
  const preflightResult = await preflight(options);
  const takeId = makeTakeId(options.takeId);
  const fps = options.fps ?? Number(process.env.OWNEROPS_CAPTURE_FPS ?? 30);
  if (!Number.isInteger(fps) || fps < 24 || fps > 60) throw new Error('Capture fps must be an integer from 24 to 60');
  const browserZoom = options.browserZoom;
  if (!Number.isInteger(browserZoom) || browserZoom < 50 || browserZoom > 200) {
    throw new Error('Recording requires --browser-zoom with an integer percentage from 50 to 200');
  }
  const takeDirectory = path.join(root, 'assets', 'chatgpt', 'takes', takeId);
  await mkdir(path.dirname(takeDirectory), {recursive: true});
  await mkdir(takeDirectory, {recursive: false});

  const window = await inspectWindowsChatGpt({windowPattern: options.windowPattern, focus: true});

  const masterPath = path.join(takeDirectory, 'master.mkv');
  const metadataPath = path.join(takeDirectory, 'take.json');
  const ffmpegLogPath = path.join(takeDirectory, 'ffmpeg.log');
  const ffmpegArgs = [
    '-hide_banner',
    '-loglevel',
    'info',
    '-thread_queue_size',
    '1024',
    '-f',
    'gdigrab',
    '-framerate',
    String(fps),
    '-draw_mouse',
    '1',
    '-offset_x',
    String(window.x),
    '-offset_y',
    String(window.y),
    '-video_size',
    `${window.width}x${window.height}`,
    '-i',
    'desktop',
    '-c:v',
    'libx264',
    '-preset',
    'ultrafast',
    '-crf',
    '15',
    '-pix_fmt',
    'yuv420p',
    '-r',
    String(fps),
    '-an',
    masterPath,
  ];

  const metadata = {
    schemaVersion: 1,
    takeId,
    status: 'recording',
    platform: 'win32',
    startedAt: new Date().toISOString(),
    product: preflightResult.product,
    capture: {
      method: 'ffmpeg-gdigrab-window-bounds',
      fps,
      cursorVisible: true,
      audio: 'none',
      window: {
        processName: window.processName,
        appVersion: window.appVersion,
        titleMatched: window.titleMatched,
        focusConfirmed: window.focusConfirmed,
        dpi: window.dpi,
        displayScalePercent: window.displayScalePercent,
        browserZoomPercent: browserZoom,
        x: window.x,
        y: window.y,
        width: window.width,
        height: window.height,
        captureClippedToDesktop: window.captureClippedToDesktop,
      },
    },
    authenticity: {
      uiInputInjectedByHarness: false,
      requiredHumanCandidateEditCount: 1,
      finalApplyRemainsHuman: true,
    },
    masterPath: relativeToRoot(masterPath),
    markers: [],
  };
  const persist = () => writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');
  await persist();

  const logStream = createWriteStream(ffmpegLogPath, {flags: 'wx'});
  const recorder = spawn('ffmpeg', ffmpegArgs, {
    cwd: root,
    stdio: ['pipe', 'ignore', 'pipe'],
    windowsHide: true,
  });
  recorder.stderr.pipe(logStream);
  let recorderExited = false;
  const recorderExit = new Promise((resolve) => {
    recorder.once('error', (error) => {
      recorderExited = true;
      logStream.end();
      resolve({code: null, error});
    });
    recorder.once('exit', (code) => {
      recorderExited = true;
      logStream.end();
      resolve({code, error: null});
    });
  });
  const captureStarted = performance.now();
  await wait(900);
  if (recorderExited) {
    const result = await recorderExit;
    metadata.status = 'capture_start_failed';
    metadata.startError = result.error?.message ?? `ffmpeg exited with code ${result.code}`;
    metadata.endedAt = new Date().toISOString();
    await persist();
    throw new Error(`ffmpeg exited before capture started: ${metadata.startError}`);
  }

  const hotkeyScript = path.join(root, 'scripts', 'capture', 'windows', 'capture-hotkeys.ps1');
  const hotkeys = spawn(
    windowsPowerShell,
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', hotkeyScript],
    {cwd: root, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true},
  );
  let buffer = '';
  let finished = false;
  let markerBusy = false;
  let resolveSession;
  let rejectSession;
  const session = new Promise((resolve, reject) => {
    resolveSession = resolve;
    rejectSession = reject;
  });

  const stopRecorder = async () => {
    if (!recorderExited) recorder.stdin.write('q\n');
    const result = await recorderExit;
    if (result.error) throw result.error;
    if (result.code !== 0) throw new Error(`ffmpeg recording exited with code ${result.code}`);
  };

  const finishSuccess = async () => {
    if (finished) return;
    finished = true;
    try {
      process.stdout.write('Final state marked. Holding 1.5 seconds before capture stop…\n');
      await wait(1500);
      hotkeys.kill();
      await stopRecorder();
      metadata.status = 'master_recorded';
      metadata.endedAt = new Date().toISOString();
      metadata.durationSec = Number(((performance.now() - captureStarted) / 1000).toFixed(3));
      metadata.authenticity.operatorAttestedHumanCandidateEditCount = 1;
      await persist();
      const extracted = await extractProofClips({metadataPath: relativeToRoot(metadataPath)});
      resolveSession(extracted);
    } catch (error) {
      metadata.status = 'capture_finalize_failed';
      metadata.finalizeError = error.message;
      metadata.endedAt = new Date().toISOString();
      await persist().catch(() => {});
      rejectSession(error);
    }
  };

  const abort = async (reason) => {
    if (finished) return;
    finished = true;
    hotkeys.kill();
    try {
      await stopRecorder();
    } catch {}
    metadata.status = 'aborted';
    metadata.abortReason = reason;
    metadata.endedAt = new Date().toISOString();
    await persist();
    rejectSession(new Error(`Capture aborted: ${reason}`));
  };

  const mark = async () => {
    if (finished || markerBusy) return;
    markerBusy = true;
    try {
      const phase = PROOF_PHASES[metadata.markers.length];
      if (!phase) return;
      const marker = {
        name: phase.marker,
        timeSec: Number(((performance.now() - captureStarted) / 1000).toFixed(3)),
        recordedAt: new Date().toISOString(),
      };
      metadata.markers.push(marker);
      await persist();
      process.stdout.write(`MARK ${metadata.markers.length}/5 ${phase.marker} @ ${marker.timeSec}s\n`);
      if (metadata.markers.length === PROOF_PHASES.length) {
        await finishSuccess();
        return;
      }
      const next = PROOF_PHASES[metadata.markers.length];
      if (next.marker === 'single_human_edit_complete') {
        process.stdout.write('NEXT: Perform exactly one direct candidate edit. Do not undo, redo, or make a second candidate edit. Press F8 after YOUR EDIT / Review required is visible and Apply is unavailable.\n');
      } else if (next.marker === 'exact_review_complete') {
        process.stdout.write('NEXT: Do not edit again. Ask ChatGPT to recalculate the exact current edit. Press F8 after real evaluate_current_plan and a 3–4 second REVIEWED hold.\n');
      } else if (next.marker === 'apply_complete') {
        process.stdout.write('NEXT: Human clicks Apply reviewed plan. Press F8 after committed state updates and preview clears.\n');
      } else {
        process.stdout.write(`NEXT: ${next.instruction}. Press F8 when complete.\n`);
      }
    } finally {
      markerBusy = false;
    }
  };

  hotkeys.stdout.on('data', (chunk) => {
    buffer += chunk.toString('utf8');
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (line === 'MARK') void mark().catch((error) => abort(`marker failed: ${error.message}`));
      if (line === 'ABORT') void abort('F9 emergency stop').catch(rejectSession);
    }
  });
  hotkeys.stderr.on('data', (chunk) => process.stderr.write(chunk));
  hotkeys.once('error', (error) => void abort(`hotkey helper failed: ${error.message}`));
  hotkeys.once('exit', (code) => {
    if (!finished) void abort(`hotkey helper exited early with code ${code}`);
  });
  recorderExit.then((result) => {
    if (!finished) {
      const detail = result.error?.message ?? `code ${result.code}`;
      void abort(`ffmpeg exited early with ${detail}`);
    }
  });

  const signalHandler = () => void abort('operator interrupt');
  process.once('SIGINT', signalHandler);
  process.once('SIGTERM', signalHandler);

  process.stdout.write(`Recording take ${takeId} from the focused ChatGPT window.\n`);
  process.stdout.write('The harness never clicks or types in ChatGPT or OwnerOps. F8 marks each completed phase; F9 aborts.\n');
  process.stdout.write(`FIRST: ${PROOF_PHASES[0].instruction}. Press F8 when complete.\n`);

  try {
    const result = await session;
    process.stdout.write(`Master and five review clips saved under ${relativeToRoot(takeDirectory)}\n`);
    return result;
  } finally {
    process.off('SIGINT', signalHandler);
    process.off('SIGTERM', signalHandler);
  }
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  if (options.command === 'preflight') return preflight(options);
  if (process.platform === 'darwin') {
    await preflight(options);
    throw new Error('macOS detected: preflight is implemented, but recording remains intentionally disabled until trustworthy global phase markers are available.');
  }
  if (process.platform !== 'win32') throw new Error(`Recording is not supported on ${process.platform}`);
  return recordWindows(options);
};

await main();
