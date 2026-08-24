const assert = require("node:assert/strict");
const path = require("node:path");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  await page.addInitScript(() => {
    globalThis.savedSettings = [];
    globalThis.chrome = {
      i18n: { getUILanguage: () => "ja-JP" },
      storage: {
        sync: {
          get: async () => ({
            ytQuickSettings: {
              language: "system",
              global: { speed: 1, quality: "hd1080" },
              shorts: { speed: 3, quality: "highest" },
              shortsControls: { seekSeconds: 10, arrowKeysEnabled: false },
              channels: {}
            }
          }),
          set: async (value) => savedSettings.push(value)
        }
      },
      tabs: { query: async () => [] }
    };
  });

  await page.goto(`file:///${path.resolve("popup.html").replaceAll("\\", "/")}`);
  await page.waitForSelector("#globalSpeed .option-button");
  assert.equal(await page.locator("#appTitle").innerText(), "YouTube 速度 / 画質クイック設定");
  assert.equal(await page.locator("#globalSpeed .selected").innerText(), "1×");
  const regularChannel = await page.locator("#channelCard").boundingBox();
  const regularShortcut = await page.locator("#shortcutHint").boundingBox();
  assert.ok(regularChannel && regularShortcut && regularShortcut.y >= regularChannel.y + regularChannel.height - 1, "regular-video shortcuts should stay below channel settings");

  await page.locator("[data-content-type='shorts']").click();
  assert.equal(await page.locator("#globalSpeed .selected").innerText(), "3×");
  assert.equal(await page.locator("#globalKicker").innerText(), "すべてのショート");
  assert.equal(await page.locator("#shortsQualityNote").isVisible(), true);
  assert.equal(await page.locator("#shortsControls").isVisible(), true);
  assert.equal(await page.locator("#shortsSeekSeconds .selected").innerText(), "10 秒");
  assert.equal(await page.locator("#shortsArrowKeysEnabled").isChecked(), false);
  const shortsSettings = await page.locator(".settings-card").boundingBox();
  const shortsShortcut = await page.locator("#shortcutHint").boundingBox();
  const shortsChannel = await page.locator("#channelCard").boundingBox();
  assert.ok(shortsSettings && shortsShortcut && shortsChannel, "Shorts layout regions should render");
  assert.ok(shortsChannel.y >= shortsSettings.y + shortsSettings.height - 1, "Shorts channel settings should follow the global settings");
  assert.ok(shortsShortcut.y >= shortsChannel.y + shortsChannel.height - 1, "Shorts shortcuts should stay below channel settings");

  await page.locator("#languageSelect").selectOption("en");
  assert.equal(await page.locator("#appTitle").innerText(), "YouTube Quick Speed / Quality Settings");
  assert.match(await page.locator("#shortcutDescription").innerText(), /0 restarts/);
  assert.match(await page.locator("#shortcutDescription").innerText(), /10 sec/);
  assert.equal(await page.locator("#shortcutKeys kbd").count(), 6);
  assert.deepEqual(await page.locator("#shortcutKeys kbd").allTextContents(), ["←", "→", "0", "−", "＋", "＊"]);

  await page.getByRole("radio", { name: "3 sec" }).click();
  assert.equal(await page.locator("#shortsSeekSeconds .selected").innerText(), "3 sec");
  assert.match(await page.locator("#shortcutDescription").innerText(), /3 sec/);
  await page.locator("#shortsArrowKeysEnabled").check();
  const saved = await page.evaluate(() => savedSettings.at(-1).ytQuickSettings.shortsControls);
  assert.deepEqual(saved, { seekSeconds: 3, arrowKeysEnabled: true });

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

  await page.locator("[data-content-type='regular']").click();
  const movedRegularChannel = await page.locator("#channelCard").boundingBox();
  const movedRegularShortcut = await page.locator("#shortcutHint").boundingBox();
  assert.ok(movedRegularChannel && movedRegularShortcut && movedRegularShortcut.y >= movedRegularChannel.y + movedRegularChannel.height - 1, "switching back should keep the regular shortcut position");
  await page.locator("[data-content-type='shorts']").click();

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
