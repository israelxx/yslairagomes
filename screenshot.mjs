import puppeteer from 'file:///C:/Users/israe/AppData/Local/Temp/claude/c--Users-israe-OneDrive--rea-de-Trabalho-portifolio-yslaira/67d6ce02-43ab-4398-8641-27b411fab765/scratchpad/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import { mkdir, readdir, writeFile } from 'node:fs/promises';

const CHROME = 'C:/Users/israe/.cache/puppeteer/chrome/win64-152.0.7977.54/chrome-win64/chrome.exe';
const OUT_DIR = 'temporary screenshots';

const url = process.argv[2] ?? 'http://localhost:3000';
const label = process.argv[3] ?? '';
const width = Number(process.argv[4] ?? 1440);

await mkdir(OUT_DIR, { recursive: true });
const existing = await readdir(OUT_DIR);
const next = existing
  .map((f) => Number(/^screenshot-(\d+)/.exec(f)?.[1] ?? 0))
  .reduce((a, b) => Math.max(a, b), 0) + 1;
const name = label ? `screenshot-${next}-${label}.png` : `screenshot-${next}.png`;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1'],
});
const page = await browser.newPage();
await page.setViewport({ width, height: 1000, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
await page.evaluate(async () => {
  await new Promise((resolve) => {
    let y = 0;
    const step = () => {
      window.scrollTo(0, y);
      y += 600;
      if (y < document.body.scrollHeight) requestAnimationFrame(step);
      else { window.scrollTo(0, 0); setTimeout(resolve, 400); }
    };
    step();
  });
});
await new Promise((r) => setTimeout(r, 900));
const buffer = await page.screenshot({ fullPage: true, type: 'png' });
await writeFile(`${OUT_DIR}/${name}`, buffer);
await browser.close();
console.log(`${OUT_DIR}/${name}`);
