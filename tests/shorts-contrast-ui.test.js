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
  assert.match(css, /html\[dark\] \.ytqs-shorts-page-publish-time:not\(\.ytqs-on-video\)/);
  assert.match(css, /html\[dark\] \.ytqs-shorts-channel-name/);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1100, height: 760 } });
  await page.setContent(`
    <style>
      body { margin: 0; background: #fff; color: #111; font-family: Arial, sans-serif; }
      html[dark] body { background: #0f0f0f; color: #f1f1f1; }
      .layout { display: flex; gap: 48px; padding: 48px; }
      .sample { width: 420px; min-height: 260px; padding: 24px; border-radius: 18px; }
      .outside { background: #f7f7f7; color: #111; }
      html[dark] .outside { background: #181818; color: #f1f1f1; }
      .video { background: linear-gradient(145deg, #496445, #27201a); color: #111; }
      .native-subhead { color: #606060; font-size: 14px; }
      html[dark] .native-subhead { color: #aaa; }
      ${css}
    </style>
    <main class="layout">
      <section class="sample outside" aria-label="影片外側資訊">
        <a class="ytqs-shorts-channel-name">頻道名稱</a>
        <div class="native-subhead">觀看次數 · 1 天前</div>
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

  assert.equal(outside.color, "rgb(96, 96, 96)");
  assert.equal(outside.background, "rgba(0, 0, 0, 0.08)");
  assert.equal(onVideo.color, "rgb(255, 255, 255)");
  assert.equal(onVideo.background, "rgba(0, 0, 0, 0.58)");
  assert.equal(onVideo.opacity, "1");

  await page.locator("html").evaluate((element) => element.setAttribute("dark", ""));
  const darkOutside = await page.locator(".outside .ytqs-shorts-page-publish-time").evaluate((element) => {
    const style = getComputedStyle(element);
    return { color: style.color, background: style.backgroundColor };
  });
  const darkOnVideo = await page.locator(".video .ytqs-shorts-page-publish-time").evaluate((element) => {
    const style = getComputedStyle(element);
    return { color: style.color, background: style.backgroundColor, opacity: style.opacity };
  });
  assert.equal(darkOutside.color, "rgb(241, 241, 241)");
  assert.equal(darkOutside.background, "rgba(255, 255, 255, 0.14)");
  const darkChannelColor = await page.locator(".ytqs-shorts-channel-name").evaluate((element) => getComputedStyle(element).color);
  const darkNativeMetadataColor = await page.locator(".native-subhead").evaluate((element) => getComputedStyle(element).color);
  assert.equal(darkChannelColor, darkNativeMetadataColor);
  assert.equal(darkChannelColor, "rgb(170, 170, 170)");
  assert.equal(darkOnVideo.color, "rgb(255, 255, 255)");
  assert.equal(darkOnVideo.background, "rgba(0, 0, 0, 0.58)");
  assert.equal(darkOnVideo.opacity, "1");

  if (process.env.YTQS_CONTRAST_SCREENSHOT) {
    await page.screenshot({ path: process.env.YTQS_CONTRAST_SCREENSHOT, fullPage: true });
  }
  await browser.close();
  console.log("SHORTS_CONTRAST_UI_TESTS_OK");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
