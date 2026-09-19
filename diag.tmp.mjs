import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
});
const page = await browser.newPage();
const failures = [];
page.on('requestfailed', r => failures.push(`FAILED: ${r.url()} — ${r.failure()?.errorText}`));
page.on('response', r => { if (r.status() >= 400) failures.push(`HTTP ${r.status()}: ${r.url()}`); });
await page.setViewport({ width: 1440, height: 1100 });
await page.goto('https://vildevev.github.io/intro-to-vibe-coding/', { waitUntil: 'networkidle0', timeout: 60000 });
await page.screenshot({ path: '/tmp/vibe-shots/live-home.png' });
const fontCheck = await page.evaluate(() => ({
  fontsLoaded: document.fonts.status,
  bricolage: document.fonts.check('800 2rem "Bricolage Grotesque"'),
  atkinson: document.fonts.check('400 1rem "Atkinson Hyperlegible"'),
}));
console.log(JSON.stringify({ failures, fontCheck }, null, 2));
await browser.close();
