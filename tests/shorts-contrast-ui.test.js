const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium } = require("playwright");

(async () => {
  const source = fs.readFileSync("content.js", "utf8");
  const start = source.indexOf("function ytqsInstallShortsChannelStyle");
  const end = source.indexOf("function ytqsDeduplicateShortsChannelNames", start);
  const installStyleSource = source.slice(start, end);
  const css = installStyleSource.match(/style\.textContent = `([\s\S]*?)`;/)?.[1] || "";
  assert.match(css, /\.ytqs-shorts-page-publish-time\.ytqs-on-video/);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1100, height: 760 } });
  await page.setContent(`
    <style>
      body { margin: 0; background: #fff; color: #111; font-family: Arial, sans-serif; }
      .layout { display: flex; gap: 48px; padding: 48px; }
      .sample { width: 420px; min-height: 260px; padding: 24px; border-radius: 18px; }
      .outside { background: #f7f7f7; color: #111; }
      .video { background: linear-gradient(145deg, #496445, #27201a); color: #111; }
      ${css}
    </style>
    <main class="layout">
      <section class="sample outside" aria-label="影片外側資訊">
        <div class="ytqs-shorts-page-publish-time"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/></svg><span>1 天前</span></div>
      </section>
      <section class="sample video" aria-label="影片內資訊">
        <div class="ytqs-shorts-page-publish-time ytqs-on-video"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/></svg><span>1 天前</span></div>
      </section>
    </main>
  `);

  const outside = await page.locator(".outside .ytqs-shorts-page-publish-time").evaluate((element) => {
    const style = getComputedStyle(element);
    return { color: style.color, background: style.backgroundColor };
  });
  const onVideo = await page.locator(".video .ytqs-shorts-page-publish-time").evaluate((element) => {
    const style = getComputedStyle(element);
    return { color: style.color, background: style.backgroundColor, opacity: style.opacity };
  });

  assert.equal(outside.color, "rgb(17, 17, 17)");
  assert.equal(onVideo.color, "rgb(255, 255, 255)");
  assert.equal(onVideo.background, "rgba(0, 0, 0, 0.58)");
  assert.equal(onVideo.opacity, "1");

  if (process.env.YTQS_CONTRAST_SCREENSHOT) {
    await page.screenshot({ path: process.env.YTQS_CONTRAST_SCREENSHOT, fullPage: true });
  }
  await browser.close();
  console.log("SHORTS_CONTRAST_UI_TESTS_OK");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
