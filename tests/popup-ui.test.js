const assert = require("node:assert/strict");
const path = require("node:path");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  await page.addInitScript(() => {
    globalThis.chrome = {
      i18n: { getUILanguage: () => "ja-JP" },
      storage: {
        sync: {
          get: async () => ({
            ytQuickSettings: {
              language: "system",
              global: { speed: 1, quality: "hd1080" },
              shorts: { speed: 3, quality: "highest" },
              channels: {}
            }
          }),
          set: async () => {}
        }
      },
      tabs: { query: async () => [] }
    };
  });

  await page.goto(`file:///${path.resolve("popup.html").replaceAll("\\", "/")}`);
  await page.waitForSelector("#globalSpeed .option-button");
  assert.equal(await page.locator("#appTitle").innerText(), "YouTube 速度 / 画質クイック設定");
  assert.equal(await page.locator("#globalSpeed .selected").innerText(), "1×");

  await page.locator("[data-content-type='shorts']").click();
  assert.equal(await page.locator("#globalSpeed .selected").innerText(), "3×");
  assert.equal(await page.locator("#globalKicker").innerText(), "すべてのショート");
  assert.equal(await page.locator("#shortsQualityNote").isVisible(), true);

  await page.locator("#languageSelect").selectOption("en");
  assert.equal(await page.locator("#appTitle").innerText(), "YouTube Quick Speed / Quality Settings");
  assert.match(await page.locator("#shortcutDescription").innerText(), /restore 1×/);

  const masthead = await page.locator(".masthead").boundingBox();
  const title = await page.locator("#appTitle").boundingBox();
  const status = await page.locator("#statusDot").boundingBox();
  const shortcuts = await page.locator(".shortcut-hint").boundingBox();
  const languageSettings = await page.locator(".language-settings").boundingBox();
  assert.ok(masthead && masthead.height <= 62, "long localized titles should keep a compact header");
  assert.ok(title && status && title.x + title.width <= status.x - 8, "title must not overlap the status indicator");
  assert.ok(shortcuts && languageSettings && languageSettings.y > shortcuts.y + shortcuts.height - 1, "language selector should be the final settings row");
  assert.equal(await page.locator(".masthead #languageSelect").count(), 0);
  assert.equal(await page.locator(".language-settings #languageSelect").isVisible(), true);

  await page.locator("#languageSelect").selectOption("zh-Hant");
  assert.equal(await page.locator("#appTitle").innerText(), "YouTube 快速設定速度 / 畫質");

  const panel = await page.locator(".panel").boundingBox();
  assert.ok(panel && panel.width <= 390, "popup panel should fit the extension width");
  if (process.env.YTQS_SCREENSHOT) {
    await page.screenshot({ path: process.env.YTQS_SCREENSHOT, fullPage: true });
  }
  await browser.close();
  console.log("POPUP_UI_TESTS_OK");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
