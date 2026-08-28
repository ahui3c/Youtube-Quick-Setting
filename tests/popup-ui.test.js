const assert = require("node:assert/strict");
const path = require("node:path");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  await page.addInitScript(() => {
    globalThis.savedSettings = [];
    globalThis.copiedTexts = [];
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async (text) => copiedTexts.push(text) }
    });
    globalThis.chrome = {
      i18n: { getUILanguage: () => "ja-JP" },
      storage: {
        sync: {
          get: async () => ({
            ytQuickSettings: {
              language: "system",
              global: { speed: 1, quality: "hd1080", premiumQualityEnabled: false, theaterModeEnabled: true },
              shorts: { speed: 3, quality: "highest" },
              shortsControls: { seekSeconds: 10, arrowKeysEnabled: false, channelNamesEnabled: true },
              channels: {}
            }
          }),
          set: async (value) => savedSettings.push(value)
        }
      },
      tabs: {
        query: async () => [{ id: 1, url: "https://www.youtube.com/watch?v=abc123" }],
        sendMessage: async () => ({
          isVideo: true,
          contentType: "regular",
          channelId: "channelA",
          channelName: "Test Channel",
          videoTitle: "Test Video",
          videoUrl: "https://www.youtube.com/watch?v=qRjSmLc2cOs"
        })
      },
    };
  });

  await page.goto(`file:///${path.resolve("popup.html").replaceAll("\\", "/")}`);
  await page.waitForSelector("#globalSpeed .option-button");
  assert.equal(await page.locator("#appTitle").innerText(), "YouTube 速度 / 画質クイック設定");
  assert.equal(await page.locator("#globalSpeed .selected").innerText(), "1×");
  assert.equal(await page.locator("#globalTheaterSetting").isVisible(), true);
  assert.equal(await page.locator("#globalTheaterEnabled").isChecked(), true);
  assert.equal(await page.locator("#globalPremiumQualitySetting").isVisible(), true);
  assert.equal(await page.locator("#globalPremiumQualityEnabled").isChecked(), false);
  assert.equal(await page.locator("#copyVideoInfo").isEnabled(), true);
  await page.locator("#copyVideoInfo").click();
  assert.deepEqual(await page.evaluate(() => copiedTexts), ["Test Video\nhttps://www.youtube.com/watch?v=qRjSmLc2cOs"]);
  assert.equal(await page.locator("#copyVideoInfoDescription").innerText(), "クリップボードにコピーしました");
  await page.locator("#globalPremiumQualityEnabled").check();
  assert.equal(await page.evaluate(() => savedSettings.at(-1).ytQuickSettings.global.premiumQualityEnabled), true);
  await page.locator("#channelEnabled").check();
  assert.equal(await page.locator("#channelTheaterFieldset").isVisible(), true);
  assert.equal(await page.locator("#channelPremiumQualitySetting").isVisible(), true);
  assert.equal(await page.locator("#channelPremiumQualityEnabled").isChecked(), true);
  await page.locator("#channelPremiumQualityEnabled").uncheck();
  assert.equal(await page.evaluate(() => savedSettings.at(-1).ytQuickSettings.channels.channelA.regular.premiumQualityEnabled), false);
  await page.getByRole("radio", { name: "常にオフ" }).click();
  assert.equal(await page.locator("#channelTheaterMode .selected").innerText(), "常にオフ");
  assert.equal(await page.evaluate(() => savedSettings.at(-1).ytQuickSettings.channels.channelA.regular.theaterModeOverride), "off");
  const regularSettings = await page.locator(".settings-card").boundingBox();
  const regularCopy = await page.locator(".copy-card").boundingBox();
  const regularChannel = await page.locator("#channelCard").boundingBox();
  const regularShortcut = await page.locator("#shortcutHint").boundingBox();
  assert.ok(regularSettings && regularCopy && regularChannel, "regular-video settings, copy action, and channel settings should render");
  assert.ok(regularCopy.y >= regularSettings.y + regularSettings.height - 1, "copy action should stay below regular-video settings");
  assert.ok(regularChannel.y >= regularCopy.y + regularCopy.height - 1, "channel settings should stay below the copy action");
  assert.ok(regularChannel && regularShortcut && regularShortcut.y >= regularChannel.y + regularChannel.height - 1, "regular-video shortcuts should stay below channel settings");

  await page.locator("[data-content-type='shorts']").click();
  assert.equal(await page.locator("#globalSpeed .selected").innerText(), "3×");
  assert.equal(await page.locator("#globalKicker").innerText(), "すべてのショート");
  assert.equal(await page.locator("#shortsQualityNote").isVisible(), true);
  assert.equal(await page.locator("#shortsControls").isVisible(), true);
  assert.equal(await page.locator("#globalTheaterSetting").isVisible(), false);
  assert.equal(await page.locator("#channelTheaterFieldset").isVisible(), false);
  assert.equal(await page.locator("#globalPremiumQualitySetting").isVisible(), false);
  assert.equal(await page.locator("#channelPremiumQualitySetting").isVisible(), false);
  assert.equal(await page.locator("#shortsSeekSeconds .selected").innerText(), "10 秒");
  assert.equal(await page.locator("#shortsArrowKeysEnabled").isChecked(), false);
  assert.equal(await page.locator("#shortsChannelNamesEnabled").isChecked(), true);
  const shortsSettings = await page.locator(".settings-card").boundingBox();
  const shortsCopy = await page.locator(".copy-card").boundingBox();
  const shortsShortcut = await page.locator("#shortcutHint").boundingBox();
  const shortsChannel = await page.locator("#channelCard").boundingBox();
  assert.ok(shortsSettings && shortsCopy && shortsShortcut && shortsChannel, "Shorts layout regions should render");
  assert.ok(shortsCopy.y >= shortsSettings.y + shortsSettings.height - 1, "copy action should stay below Shorts settings");
  assert.ok(shortsChannel.y >= shortsCopy.y + shortsCopy.height - 1, "Shorts channel settings should stay below the copy action");
  assert.ok(shortsChannel.y >= shortsSettings.y + shortsSettings.height - 1, "Shorts channel settings should follow the global settings");
  assert.ok(shortsShortcut.y >= shortsChannel.y + shortsChannel.height - 1, "Shorts shortcuts should stay below channel settings");

  await page.locator("#languageSelect").selectOption("en");
  assert.equal(await page.locator("#appTitle").innerText(), "YouTube Quick Speed / Quality Settings");
  assert.match(await page.locator("#shortcutDescription").innerText(), /0 restarts/);
  assert.match(await page.locator("#shortcutDescription").innerText(), /10s/);
  assert.equal(await page.locator("#shortcutKeys kbd").count(), 7);
  assert.deepEqual(await page.locator("#shortcutKeys kbd").allTextContents(), ["←", "→", "0", "−", "＋", "＊", "S"]);

  await page.getByRole("radio", { name: "3 sec" }).click();
  assert.equal(await page.locator("#shortsSeekSeconds .selected").innerText(), "3 sec");
  assert.match(await page.locator("#shortcutDescription").innerText(), /3s/);
  await page.locator("#shortsArrowKeysEnabled").check();
  const saved = await page.evaluate(() => savedSettings.at(-1).ytQuickSettings.shortsControls);
  assert.deepEqual(saved, { seekSeconds: 3, arrowKeysEnabled: true, channelNamesEnabled: true });
  await page.locator("#shortsChannelNamesEnabled").uncheck();
  assert.equal(await page.evaluate(() => savedSettings.at(-1).ytQuickSettings.shortsControls.channelNamesEnabled), false);

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
