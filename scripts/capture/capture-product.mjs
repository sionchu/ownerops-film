import {mkdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {chromium} from 'playwright';

const root = path.resolve(import.meta.dirname, '..', '..');
const manifestPath = process.env.OWNEROPS_CAPTURE_MANIFEST ?? path.join(root, 'scripts', 'capture', 'product-shots.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const baseUrl = process.env.OWNEROPS_URL ?? manifest.baseUrl;
const outputDir = path.resolve(root, manifest.outputDir ?? 'assets/product');
const headless = process.env.PLAYWRIGHT_HEADLESS !== 'false';

if (!baseUrl) {
  throw new Error('Set OWNEROPS_URL or baseUrl in the capture manifest.');
}
await mkdir(outputDir, {recursive: true});
const browser = await chromium.launch({headless});

try {
  for (const shot of manifest.shots) {
    const context = await browser.newContext({
      deviceScaleFactor: shot.deviceScaleFactor ?? 1,
      viewport: shot.viewport ?? {width: 1920, height: 1080},
    });
    const page = await context.newPage();
    await page.goto(new URL(shot.path ?? '/', baseUrl).toString(), {waitUntil: 'networkidle'});

    for (const action of shot.actions ?? []) {
      if (action.type === 'click') await page.locator(action.selector).click();
      if (action.type === 'hover') await page.locator(action.selector).hover();
      if (action.type === 'fill') await page.locator(action.selector).fill(action.value ?? '');
      if (action.type === 'waitFor') await page.locator(action.selector).waitFor({state: action.state ?? 'visible'});
      if (action.type === 'wait') await page.waitForTimeout(action.ms ?? 500);
    }

    const target = shot.selector ? page.locator(shot.selector) : page;
    await target.screenshot({
      path: path.join(outputDir, `${shot.id}.png`),
      fullPage: shot.selector ? undefined : (shot.fullPage ?? false),
    });
    await context.close();
    process.stdout.write(`captured ${shot.id}\n`);
  }
} finally {
  await browser.close();
}
