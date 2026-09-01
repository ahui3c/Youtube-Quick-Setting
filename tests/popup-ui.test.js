const assert = require("node:assert/strict");
const path = require("node:path");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  await page.addInitScript(() => {
    globalThis.savedSettings = [];
    globalThis.copiedTexts = [];
    globalThis.openedWindows = [];
    globalThis.localStore = {};
    window.open = (url, name, features) => {
      const opened = { url, name, features, opener: window, focused: false, focus() { this.focused = true; } };
      openedWindows.push(opened);
      return opened;
    };
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
              shortsControls: { seekSeconds: 10, arrowKeysEnabled: false, channelNamesEnabled: true, publishTimeEnabled: true },
              copy: { defaultFormat: "markdown" },
              channels: {}
            }
          }),
          set: async (value) => savedSettings.push(value)
        },
        local: {
          get: async (key) => ({ [key]: localStore[key] }),
          set: async (value) => Object.assign(localStore, value)
        }
      },
      runtime: { getManifest: () => ({ version: "1.8.0" }) },
      tabs: {
        query: async () => [{ id: 1, url: "https://www.youtube.com/watch?v=abc123" }],
        sendMessage: async () => ({
          isVideo: true,
          contentType: "regular",
          channelId: "channelA",
          channelName: "Test Channel",
          videoTitle: "Test Video",
          videoUrl: "https://www.youtube.com/watch?v=qRjSmLc2cOs",
          currentTime: 125.9
        })
      },
    };
  });

  await page.goto(`file:///${path.resolve("popup.html").replaceAll("\\", "/")}`);
  await page.waitForSelector("#globalSpeed .option-button");
  assert.equal(await page.locator("#appTitle").innerText(), "YouTube クイック設定ツールボックス");
  assert.equal(await page.locator("#globalSpeed .selected").innerText(), "1×");
  assert.equal(await page.locator("#globalTheaterSetting").isVisible(), true);
  assert.equal(await page.locator("#globalTheaterEnabled").isChecked(), true);
  assert.equal(await page.locator("#globalPremiumQualitySetting").isVisible(), true);
  assert.equal(await page.locator("#globalPremiumQualityEnabled").isChecked(), false);
  assert.equal(await page.locator("#copyVideoInfo").isEnabled(), true);
  await page.locator("#copyVideoInfo").click();
  assert.deepEqual(await page.evaluate(() => copiedTexts), ["Test Video\nhttps://www.youtube.com/watch?v=qRjSmLc2cOs"]);
  assert.equal(await page.locator("#copyVideoInfoDescription").innerText(), "クリップボードにコピーしました");
  assert.match(await page.locator("#copyVideoInfoState").innerText(), /Test Video/);
  await page.locator("#copyFormatToggle").click();
  assert.equal(await page.locator("#copyFormatMenu [role='menuitemradio']").count(), 5);
  assert.equal(await page.locator("#copyFormatMenu button").count(), 6);
  assert.equal(await page.locator("#copyFormatMenu button").last().getAttribute("data-copy-action"), "facebook-share");
  await page.getByRole("menuitemradio", { name: "Markdown リンク" }).click();
  assert.equal(await page.evaluate(() => copiedTexts.at(-1)), "[Test Video](https://www.youtube.com/watch?v=qRjSmLc2cOs)");
  await page.locator("#copyVideoInfo").click();
  assert.equal(await page.evaluate(() => copiedTexts.at(-1)), "Test Video\nhttps://www.youtube.com/watch?v=qRjSmLc2cOs");
  await page.locator("#copyFormatToggle").click();
  await page.getByRole("menuitem", { name: "タイトル＋リンクを Facebook に共有" }).click();
  const facebookShare = await page.evaluate(() => {
    const opened = openedWindows.at(-1);
    return { url: opened.url, name: opened.name, features: opened.features, openerIsNull: opened.opener === null, focused: opened.focused };
  });
  const facebookShareUrl = new URL(facebookShare.url);
  assert.equal(facebookShareUrl.origin, "https://www.facebook.com");
  assert.equal(facebookShareUrl.pathname, "/sharer/sharer.php");
  assert.equal(facebookShareUrl.searchParams.get("u"), "https://www.youtube.com/watch?v=qRjSmLc2cOs");
  assert.equal(facebookShareUrl.searchParams.get("quote"), "Test Video\nhttps://www.youtube.com/watch?v=qRjSmLc2cOs");
  assert.equal(facebookShare.openerIsNull, true);
  assert.equal(facebookShare.focused, true);
  assert.equal(await page.locator("#copyVideoInfoDescription").innerText(), "Facebook の共有画面を開きました");
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

  await page.locator("#settingsTransfer").evaluate((element) => { element.open = true; });
  assert.equal(await page.locator("#settingsVersionBadge").innerText(), "v2");
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#exportSettings").click();
  const download = await downloadPromise;
  assert.match(download.suggestedFilename(), /^youtube-quick-setting-backup-\d{4}-\d{2}-\d{2}\.json$/);

  const importPayload = {
    schema: "youtube-quick-setting-settings",
    formatVersion: 2,
    settings: {
      schemaVersion: 2,
      language: "en",
      global: { speed: 2, quality: "highest", premiumQualityEnabled: false, theaterModeEnabled: false },
      shorts: { speed: 1, quality: "hd1080", premiumQualityEnabled: false },
      shortsControls: { seekSeconds: 5, arrowKeysEnabled: true, channelNamesEnabled: true, publishTimeEnabled: true },
      copy: { defaultFormat: "url-only" },
      channels: {
        channelB: {
          name: "Imported Channel",
          regular: { speed: 1.25, quality: "hd1080", premiumQualityEnabled: false, theaterModeOverride: "inherit" },
          shorts: { speed: 1, quality: "hd1080", premiumQualityEnabled: false }
        }
      }
    }
  };
  await page.locator("#importSettingsFile").setInputFiles({
    name: "settings.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(importPayload))
  });
  await page.locator("#importDialog").waitFor({ state: "visible" });
  assert.equal(
    await page.locator("#importDialog").evaluate((dialog) => dialog.open),
    true,
    await page.locator("#settingsTransferStatus").innerText()
  );
  assert.equal(await page.locator("#previewAdded").innerText(), "1");
  assert.equal(await page.locator("#previewRemoved").innerText(), "0");
  await page.locator('input[name="importMode"][value="replace"]').check();
  assert.equal(await page.locator("#previewRemoved").innerText(), "1");
  await page.locator('input[name="importMode"][value="merge"]').check();
  await page.locator("#applyImport").click();
  assert.equal(await page.locator("#importDialog").evaluate((dialog) => dialog.open), false);
  assert.equal(await page.evaluate(() => savedSettings.at(-1).ytQuickSettings.global.speed), 2);
  assert.equal(await page.evaluate(() => savedSettings.at(-1).ytQuickSettings.copy.defaultFormat), "title-url");
  assert.deepEqual(await page.evaluate(() => Object.keys(savedSettings.at(-1).ytQuickSettings.channels).sort()), ["channelA", "channelB"]);
  assert.equal(await page.evaluate(() => Boolean(localStore.ytQuickSettingsRestorePoint?.settings)), true);
  assert.equal(await page.locator("#restoreSettings").isVisible(), true);
  await page.locator("#restoreSettings").click();
  assert.equal(await page.evaluate(() => savedSettings.at(-1).ytQuickSettings.global.speed), 1);
  assert.deepEqual(await page.evaluate(() => Object.keys(savedSettings.at(-1).ytQuickSettings.channels)), ["channelA"]);
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
  assert.equal(await page.locator("#shortsQualityNote").count(), 0);
  assert.equal(await page.locator("#globalQualityFieldset").isVisible(), false);
  assert.equal(await page.locator("#channelQualityFieldset").isVisible(), false);
  assert.equal(await page.locator("#shortsControls").isVisible(), true);
  assert.equal(await page.locator("#globalTheaterSetting").isVisible(), false);
  assert.equal(await page.locator("#channelTheaterFieldset").isVisible(), false);
  assert.equal(await page.locator("#globalPremiumQualitySetting").isVisible(), false);
  assert.equal(await page.locator("#channelPremiumQualitySetting").isVisible(), false);
  assert.equal(await page.locator("#shortsSeekSeconds .selected").innerText(), "10 秒");
  assert.equal(await page.locator("#shortsArrowKeysEnabled").isChecked(), false);
  assert.equal(await page.locator("#shortsSeekSecondsFieldset").isDisabled(), true);
  assert.equal(await page.locator("#shortsSeekSeconds button:disabled").count(), 3);
  const arrowSetting = await page.locator("#shortsArrowKeysEnabled").locator("xpath=ancestor::div[contains(@class,'toggle-setting')]").boundingBox();
  const seekSetting = await page.locator("#shortsSeekSecondsFieldset").boundingBox();
  assert.ok(arrowSetting && seekSetting && seekSetting.y >= arrowSetting.y + arrowSetting.height - 1, "seek interval should render below the arrow-key toggle");
  assert.equal(await page.locator("#shortsChannelNamesEnabled").isChecked(), true);
  assert.equal(await page.locator("#shortsPublishTimeEnabled").isChecked(), true);
  assert.equal(await page.locator("#shortsPublishTimeTitle").innerText(), "ショートの公開時刻情報を表示");
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
  assert.equal(await page.locator("#appTitle").innerText(), "YouTube Quick Settings Toolbox");
  assert.equal(await page.locator("#shortsPublishTimeTitle").innerText(), "Show Shorts publish time");
  assert.match(await page.locator("#shortcutDescription").innerText(), /Arrow-key seeking is off/);
  assert.equal(await page.locator("#shortcutKeys kbd").count(), 5);
  assert.deepEqual(await page.locator("#shortcutKeys kbd").allTextContents(), ["0", "−", "＋", "＊", "S"]);

  assert.equal(await page.getByRole("radio", { name: "3 sec" }).isDisabled(), true);
  await page.locator("#shortsArrowKeysEnabled").check();
  assert.equal(await page.locator("#shortsSeekSecondsFieldset").isEnabled(), true);
  assert.match(await page.locator("#shortcutDescription").innerText(), /10s/);
  assert.deepEqual(await page.locator("#shortcutKeys kbd").allTextContents(), ["←", "→", "0", "−", "＋", "＊", "S"]);
  await page.getByRole("radio", { name: "3 sec" }).click();
  assert.equal(await page.locator("#shortsSeekSeconds .selected").innerText(), "3 sec");
  assert.match(await page.locator("#shortcutDescription").innerText(), /3s/);
  const saved = await page.evaluate(() => savedSettings.at(-1).ytQuickSettings.shortsControls);
  assert.deepEqual(saved, { seekSeconds: 3, arrowKeysEnabled: true, channelNamesEnabled: true, publishTimeEnabled: true });
  await page.locator("#shortsChannelNamesEnabled").uncheck();
  assert.equal(await page.evaluate(() => savedSettings.at(-1).ytQuickSettings.shortsControls.channelNamesEnabled), false);
  await page.locator("#shortsPublishTimeEnabled").uncheck();
  assert.equal(await page.evaluate(() => savedSettings.at(-1).ytQuickSettings.shortsControls.publishTimeEnabled), false);

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
  assert.equal(await page.locator("#appTitle").innerText(), "YouTube 快速設定工具箱");
  assert.equal(await page.locator("#shortsPublishTimeTitle").innerText(), "Shorts 顯示發布時間資訊");

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
