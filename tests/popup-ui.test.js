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
    globalThis.sentMessages = [];
    globalThis.localStore = {};
    globalThis.sphericalContext = localStorage.getItem("ytqs-test-spherical") === "true";
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
              global: { speed: 1, quality: "hd1080", premiumQualityEnabled: false, theaterModeEnabled: true, disableAutoplayNext: true, hideEndScreenRecommendations: true },
              shorts: { speed: 3, quality: "highest" },
              shortsControls: { seekSeconds: 10, arrowKeysEnabled: false, channelNamesEnabled: true, publishTimeEnabled: true },
              gridLayout: { regularColumns: 4, shortsColumns: 6 },
              dateDisplay: { enabled: true, format: "dd/MM/yyyy HH:mm" },
              copy: { defaultFormat: "markdown" },
              screenshot: { output: "clipboard" },
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
        sendMessage: async (_tabId, message) => {
          sentMessages.push(message);
          if (message?.type === "YTQS_CAPTURE_VIDEO_FRAME") {
            return message.output === "clipboard"
              ? { ok: true, output: "clipboard", width: 1920, height: 1080 }
              : { ok: true, output: "download", filename: "Test Video-20260902-030405Z.png", width: 1920, height: 1080 };
          }
          return {
            isVideo: true,
            contentType: "regular",
            channelId: "channelA",
            channelName: "Test Channel",
            videoTitle: "Test Video",
            videoUrl: "https://www.youtube.com/watch?v=qRjSmLc2cOs",
            currentTime: 125.9,
            isSpherical: sphericalContext
          };
        }
      },
    };
  });

  await page.goto(`file:///${path.resolve("popup.html").replaceAll("\\", "/")}`);
  await page.waitForSelector("#globalSpeed .option-button");
  assert.equal(await page.locator("#appTitle").innerText(), "YouTube クイック設定ツールボックス");
  assert.equal(await page.locator("#globalSpeed .selected").innerText(), "1×");
  assert.equal(await page.locator("#homeGridColumnsLegend").innerText(), "ホームの通常動画の列数");
  assert.equal(await page.locator("#homeGridColumns [role='radio']").count(), 6);
  assert.equal(await page.locator("#homeGridColumns .selected").innerText(), "4 本");
  await page.getByRole("radio", { name: "5 本" }).click();
  assert.equal(await page.evaluate(() => savedSettings.at(-1).ytQuickSettings.gridLayout.regularColumns), 5);
  assert.equal(await page.locator("#globalTheaterSetting").isVisible(), true);
  assert.equal(await page.locator("#absoluteDateEnabled").isChecked(), true);
  assert.equal(await page.locator("#absoluteDateFormatSetting").isVisible(), true);
  assert.equal(await page.locator("#absoluteDateFormat").inputValue(), "dd/MM/yyyy HH:mm");
  assert.match(await page.locator("#absoluteDatePreview").innerText(), /02\/09\/2026 14:05/);
  await page.locator("#absoluteDateEnabled").uncheck();
  assert.equal(await page.locator("#absoluteDateFormatSetting").isVisible(), false);
  assert.equal(await page.evaluate(() => savedSettings.at(-1).ytQuickSettings.dateDisplay.enabled), false);
  await page.locator("#absoluteDateEnabled").check();
  await page.locator("#absoluteDateFormat").fill("yyyy-MM-dd HH:mm:ss");
  await page.locator("#absoluteDateFormat").press("Tab");
  assert.equal(await page.evaluate(() => savedSettings.at(-1).ytQuickSettings.dateDisplay.format), "yyyy-MM-dd HH:mm:ss");
  assert.equal(await page.locator("#globalTheaterEnabled").isChecked(), true);
  assert.equal(await page.locator("#globalDisableAutoplayNextSetting").isVisible(), true);
  assert.equal(await page.locator("#globalDisableAutoplayNextEnabled").isChecked(), true);
  await page.locator("#globalDisableAutoplayNextEnabled").uncheck();
  assert.equal(await page.evaluate(() => savedSettings.at(-1).ytQuickSettings.global.disableAutoplayNext), false);
  await page.locator("#globalDisableAutoplayNextEnabled").check();
  assert.equal(await page.locator("#globalHideEndScreenRecommendationsSetting").isVisible(), true);
  assert.equal(await page.locator("#globalHideEndScreenRecommendationsEnabled").isChecked(), true);
  await page.locator("#globalHideEndScreenRecommendationsEnabled").uncheck();
  assert.equal(await page.evaluate(() => savedSettings.at(-1).ytQuickSettings.global.hideEndScreenRecommendations), false);
  await page.locator("#globalHideEndScreenRecommendationsEnabled").check();
  assert.equal(await page.locator("#globalPremiumQualitySetting").isVisible(), true);
  assert.equal(await page.locator("#globalPremiumQualityEnabled").isChecked(), false);
  assert.equal(await page.locator("#copyVideoInfo").isEnabled(), true);
  assert.equal(await page.locator("#captureVideoFrame").isEnabled(), true);
  assert.equal(await page.locator("#captureVideoFrameTitle").innerText(), "ワンクリック動画スクリーンショット");
  assert.equal(await page.locator("#captureVideoFrameResult").inputValue(), "clipboard");
  assert.equal(await page.locator("#captureVideoFrameResult option:checked").innerText(), "クリップボードにコピー");
  assert.match(await page.locator("#shortcutKeys .shortcut-help-section").nth(1).innerText(), /クリップボード/);
  await page.locator("#captureVideoFrame").click();
  assert.equal(await page.evaluate(() => sentMessages.at(-1).type), "YTQS_CAPTURE_VIDEO_FRAME");
  assert.equal(await page.evaluate(() => sentMessages.at(-1).output), "clipboard");
  assert.equal(await page.locator("#captureVideoFrameDescription").innerText(), "動画スクリーンショットをクリップボードにコピーしました");
  assert.match(await page.locator("#captureVideoFrameState").innerText(), /1920×1080/);
  if (process.env.YTQS_SCREENSHOT_RESULT_SCREENSHOT) {
    await page.locator(".screenshot-card").screenshot({ path: process.env.YTQS_SCREENSHOT_RESULT_SCREENSHOT });
  }
  await page.locator("#captureVideoFrameResult").selectOption("download");
  assert.equal(await page.evaluate(() => savedSettings.at(-1).ytQuickSettings.screenshot.output), "download");
  assert.match(await page.locator("#shortcutKeys .shortcut-help-section").nth(1).innerText(), /PNG で保存/);
  await page.locator("#captureVideoFrame").click();
  assert.equal(await page.evaluate(() => sentMessages.at(-1).output), "download");
  assert.match(await page.locator("#captureVideoFrameState").innerText(), /Test Video-20260902-030405Z\.png/);
  await page.locator("#copyVideoInfo").click();
  assert.deepEqual(await page.evaluate(() => copiedTexts), ["Test Video\nhttps://www.youtube.com/watch?v=qRjSmLc2cOs"]);
  assert.equal(await page.locator("#copyVideoInfoDescription").innerText(), "クリップボードにコピーしました");
  assert.match(await page.locator("#copyVideoInfoState").innerText(), /Test Video/);
  await page.locator("#copyFormatToggle").click();
  assert.equal(await page.locator("#copyFormatMenu [role='menuitemradio']").count(), 5);
  assert.equal(await page.locator("#copyFormatMenu button").count(), 8);
  assert.deepEqual(await page.locator("#copyFormatMenu [data-share-platform]").evaluateAll((buttons) => buttons.map((button) => button.dataset.sharePlatform)), ["facebook", "x", "threads"]);
  assert.deepEqual(await page.locator("#copyFormatMenu .copy-format-social-icon").allTextContents(), ["f", "X", "@"]);
  if (process.env.YTQS_SHARE_MENU_SCREENSHOT) {
    await page.screenshot({ path: process.env.YTQS_SHARE_MENU_SCREENSHOT, fullPage: true });
  }
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
  await page.locator("#copyFormatToggle").click();
  await page.getByRole("menuitem", { name: "タイトル＋リンクを X に共有" }).click();
  const xShareUrl = new URL(await page.evaluate(() => openedWindows.at(-1).url));
  assert.equal(xShareUrl.origin, "https://twitter.com");
  assert.equal(xShareUrl.pathname, "/intent/tweet");
  assert.equal(xShareUrl.searchParams.get("text"), "Test Video");
  assert.equal(xShareUrl.searchParams.get("url"), "https://www.youtube.com/watch?v=qRjSmLc2cOs");
  assert.equal(await page.locator("#copyVideoInfoDescription").innerText(), "X の共有画面を開きました");
  await page.locator("#copyFormatToggle").click();
  await page.getByRole("menuitem", { name: "タイトル＋リンクを Threads に共有" }).click();
  const threadsShareUrl = new URL(await page.evaluate(() => openedWindows.at(-1).url));
  assert.equal(threadsShareUrl.origin, "https://www.threads.net");
  assert.equal(threadsShareUrl.pathname, "/intent/post");
  assert.equal(threadsShareUrl.searchParams.get("text"), "Test Video\nhttps://www.youtube.com/watch?v=qRjSmLc2cOs");
  assert.equal(await page.locator("#copyVideoInfoDescription").innerText(), "Threads の共有画面を開きました");
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
  assert.equal(await page.locator("#settingsVersionBadge").innerText(), "v4");
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
      gridLayout: { regularColumns: 5, shortsColumns: 6 },
      copy: { defaultFormat: "url-only" },
      screenshot: { output: "clipboard" },
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
  assert.equal(await page.evaluate(() => savedSettings.at(-1).ytQuickSettings.screenshot.output), "clipboard");
  assert.deepEqual(await page.evaluate(() => Object.keys(savedSettings.at(-1).ytQuickSettings.channels).sort()), ["channelA", "channelB"]);
  assert.equal(await page.evaluate(() => Boolean(localStore.ytQuickSettingsRestorePoint?.settings)), true);
  assert.equal(await page.locator("#restoreSettings").isVisible(), true);
  await page.locator("#restoreSettings").click();
  assert.equal(await page.evaluate(() => savedSettings.at(-1).ytQuickSettings.global.speed), 1);
  assert.equal(await page.evaluate(() => savedSettings.at(-1).ytQuickSettings.screenshot.output), "download");
  assert.deepEqual(await page.evaluate(() => Object.keys(savedSettings.at(-1).ytQuickSettings.channels)), ["channelA"]);
  const regularSettings = await page.locator(".settings-card").boundingBox();
  const regularCopy = await page.locator(".copy-card").boundingBox();
  const regularScreenshot = await page.locator(".screenshot-card").boundingBox();
  const regularChannel = await page.locator("#channelCard").boundingBox();
  const regularShortcut = await page.locator("#shortcutHint").boundingBox();
  const regularShortcutButton = await page.locator("#shortcutHelpButton").boundingBox();
  const regularGridColumns = await page.locator("#homeGridColumnsBottomCard").boundingBox();
  const regularMoreVideoSettings = await page.locator("#moreVideoSettings").boundingBox();
  const regularTransfer = await page.locator("#settingsTransfer").boundingBox();
  assert.equal(await page.locator("#shortcutDialog").evaluate((dialog) => dialog.open), false);
  assert.equal(await page.locator("#shortcutKeys").isVisible(), false);
  assert.ok(regularSettings && regularCopy && regularScreenshot && regularChannel, "regular-video settings, copy, screenshot, and channel settings should render");
  assert.ok(regularCopy.y >= regularSettings.y + regularSettings.height - 1, "copy action should stay below regular-video settings");
  assert.ok(regularScreenshot.y >= regularCopy.y + regularCopy.height - 1, "screenshot action should stay below the copy action");
  assert.ok(regularChannel.y >= regularScreenshot.y + regularScreenshot.height - 1, "channel settings should stay below the screenshot action");
  assert.ok(regularChannel && regularShortcut && regularShortcut.y >= regularChannel.y + regularChannel.height - 1, "regular-video shortcuts should stay below channel settings");
  assert.ok(regularShortcutButton && regularShortcutButton.height <= 60, "shortcut help should remain a compact launcher in the main panel");
  assert.ok(regularGridColumns && regularGridColumns.y >= regularShortcut.y + regularShortcut.height - 1, "regular-video grid columns should stay near the bottom");
  assert.ok(regularMoreVideoSettings && regularMoreVideoSettings.y >= regularGridColumns.y + regularGridColumns.height - 1, "more video settings should follow the grid setting");
  assert.deepEqual(
    await page.locator("#moreVideoSettings .more-video-setting").evaluateAll((elements) => elements.map((element) => element.id)),
    ["absoluteDateSetting", "globalHideEndScreenRecommendationsSetting", "globalDisableAutoplayNextSetting"],
    "more video settings should keep the requested order",
  );
  assert.equal(await page.locator("#moreVideoSettingsTitle").innerText(), "その他の動画設定");
  assert.ok(regularTransfer && regularTransfer.y >= regularMoreVideoSettings.y + regularMoreVideoSettings.height - 1, "backup and restore should follow the more video settings group");
  if (process.env.YTQS_REGULAR_SCREENSHOT) {
    await page.screenshot({ path: process.env.YTQS_REGULAR_SCREENSHOT, fullPage: true });
  }
  await page.locator("#shortcutHelpButton").click();
  assert.equal(await page.locator("#shortcutDialog").evaluate((dialog) => dialog.open), true);
  assert.deepEqual(await page.locator("#shortcutKeys .shortcut-help-section h3").allTextContents(), ["再生", "ツール", "共有"]);
  assert.deepEqual(await page.locator("#shortcutKeys kbd").allTextContents(), ["PgUp", "PgDn", "Home", "Ctrl", "S", "S", "Shift", "S", "F", "X", "T"]);
  assert.equal(await page.locator("#shortcutKeys .shortcut-help-row").count(), 7);
  const shortcutDialogBox = await page.locator("#shortcutDialog").boundingBox();
  assert.ok(shortcutDialogBox && shortcutDialogBox.width >= 340, "shortcut help dialog should use the available popup width");
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).overflow), "hidden");
  const shortcutRowsFit = await page.locator("#shortcutKeys .shortcut-help-row").evaluateAll((rows) => rows.every((row) => {
    const keys = row.querySelector(".shortcut-key-cluster")?.getBoundingClientRect();
    const copy = row.querySelector(".shortcut-help-row-copy")?.getBoundingClientRect();
    const bounds = row.getBoundingClientRect();
    return keys && copy && keys.right <= copy.left - 8 && copy.right <= bounds.right + 1;
  }));
  assert.equal(shortcutRowsFit, true, "shortcut key clusters and descriptions must not overlap or overflow their rows");
  await page.locator("#shortcutDialogClose").click();
  assert.equal(await page.locator("#shortcutDialog").evaluate((dialog) => dialog.open), false);

  await page.locator("[data-content-type='shorts']").click();
  assert.equal(await page.locator("#globalSpeed .selected").innerText(), "3×");
  assert.equal(await page.locator("#globalKicker").innerText(), "すべてのショート");
  assert.equal(await page.locator("#shortsQualityNote").count(), 0);
  assert.equal(await page.locator("#globalQualityFieldset").isVisible(), false);
  assert.equal(await page.locator("#channelQualityFieldset").isVisible(), false);
  assert.equal(await page.locator("#shortsControls").isVisible(), true);
  assert.equal(await page.locator("#globalTheaterSetting").isVisible(), false);
  assert.equal(await page.locator("#globalDisableAutoplayNextSetting").isVisible(), false);
  assert.equal(await page.locator("#globalHideEndScreenRecommendationsSetting").isVisible(), false);
  assert.equal(await page.locator("#homeGridColumnsBottomCard").isVisible(), false);
  assert.equal(await page.locator("#shortsDisplaySettingsCard").isVisible(), true);
  assert.equal(await page.locator("#homeGridColumnsFieldset").evaluate((element) => element.parentElement?.id), "shortsHomeGridSetting");
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
  assert.equal(await page.locator("#homeGridColumnsLegend").innerText(), "ホームのショートの列数");
  assert.equal(await page.locator("#homeGridColumns .selected").innerText(), "6 本");
  await page.getByRole("radio", { name: "YouTube に従う" }).click();
  assert.equal(await page.evaluate(() => savedSettings.at(-1).ytQuickSettings.gridLayout.shortsColumns), "auto");
  const shortsSettings = await page.locator(".settings-card").boundingBox();
  const shortsCopy = await page.locator(".copy-card").boundingBox();
  const shortsScreenshot = await page.locator(".screenshot-card").boundingBox();
  const shortsShortcut = await page.locator("#shortcutHint").boundingBox();
  const shortsChannel = await page.locator("#channelCard").boundingBox();
  const shortsDisplaySettings = await page.locator("#shortsDisplaySettingsCard").boundingBox();
  const shortsMoreVideoSettings = await page.locator("#moreVideoSettings").boundingBox();
  const shortsTransfer = await page.locator("#settingsTransfer").boundingBox();
  assert.ok(shortsSettings && shortsCopy && shortsScreenshot && shortsShortcut && shortsChannel, "Shorts layout regions should render");
  assert.ok(shortsCopy.y >= shortsSettings.y + shortsSettings.height - 1, "copy action should stay below Shorts settings");
  assert.ok(shortsScreenshot.y >= shortsCopy.y + shortsCopy.height - 1, "Shorts screenshot should stay below the copy action");
  assert.ok(shortsChannel.y >= shortsScreenshot.y + shortsScreenshot.height - 1, "Shorts channel settings should stay below the screenshot action");
  assert.ok(shortsChannel.y >= shortsSettings.y + shortsSettings.height - 1, "Shorts channel settings should follow the global settings");
  assert.ok(shortsShortcut.y >= shortsChannel.y + shortsChannel.height - 1, "Shorts shortcuts should stay below channel settings");
  assert.ok(shortsDisplaySettings && shortsDisplaySettings.y >= shortsShortcut.y + shortsShortcut.height - 1, "Shorts display settings should follow the shortcut launcher");
  assert.deepEqual(
    await page.locator("#shortsDisplaySettingsCard fieldset, #shortsDisplaySettingsCard .shorts-display-setting").evaluateAll((elements) => elements.map((element) => element.id || element.querySelector("strong")?.id)),
    ["homeGridColumnsFieldset", "shortsChannelNamesTitle", "shortsPublishTimeTitle"],
    "Shorts display settings should keep the same grid-first hierarchy used by regular videos",
  );
  assert.ok(shortsMoreVideoSettings && shortsMoreVideoSettings.y >= shortsDisplaySettings.y + shortsDisplaySettings.height - 1, "more video settings should follow Shorts display settings");
  assert.equal(await page.locator("#absoluteDateSetting").isVisible(), true);
  assert.ok(shortsTransfer && shortsTransfer.y >= shortsMoreVideoSettings.y + shortsMoreVideoSettings.height - 1, "backup and restore should remain below the more video settings group on Shorts");
  if (process.env.YTQS_SHORTS_SCREENSHOT) {
    await page.screenshot({ path: process.env.YTQS_SHORTS_SCREENSHOT, fullPage: true });
  }

  await page.locator("#languageSelect").selectOption("en");
  assert.equal(await page.locator("#appTitle").innerText(), "YouTube Quick Settings Toolbox");
  assert.equal(await page.locator("#shortsPublishTimeTitle").innerText(), "Show Shorts publish time");
  assert.equal(await page.locator("#shortsDisplaySettingsTitle").innerText(), "Shorts display settings");
  assert.equal(await page.locator("#moreVideoSettingsTitle").innerText(), "More video settings");
  assert.equal(await page.locator("#shortcutTitle").innerText(), "Keyboard shortcuts");
  await page.locator("#shortcutHelpButton").click();
  assert.match(await page.locator("#shortcutDialogContext").innerText(), /arrow-key seeking is currently off/);
  assert.deepEqual(await page.locator("#shortcutKeys .shortcut-help-section h3").allTextContents(), ["Shorts", "Playback", "Tools", "Share"]);
  assert.equal(await page.locator("#shortcutKeys .shortcut-help-row.is-disabled").count(), 2);
  assert.deepEqual(await page.locator("#shortcutKeys kbd").allTextContents(), ["←", "→", "0", "PgUp", "PgDn", "Home", "Ctrl", "S", "S", "Shift", "S", "F", "X", "T"]);
  await page.locator("#shortcutDialogClose").click();

  assert.equal(await page.getByRole("radio", { name: "3 sec" }).isDisabled(), true);
  await page.locator("#shortsArrowKeysEnabled").check();
  assert.equal(await page.locator("#shortsSeekSecondsFieldset").isEnabled(), true);
  await page.locator("#shortcutHelpButton").click();
  assert.match(await page.locator("#shortcutDialogContext").innerText(), /±10s/);
  assert.equal(await page.locator("#shortcutKeys .shortcut-help-row.is-disabled").count(), 0);
  await page.locator("#shortcutDialogClose").click();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);
  await page.getByRole("radio", { name: "3 sec" }).click();
  assert.equal(await page.locator("#shortsSeekSeconds .selected").innerText(), "3 sec");
  await page.locator("#shortcutHelpButton").click();
  assert.match(await page.locator("#shortcutDialogContext").innerText(), /±3s/);
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#shortcutDialog").evaluate((dialog) => dialog.open), false);
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
  assert.equal(await page.locator("#homeGridColumnsBottomCard").isVisible(), true);
  assert.equal(await page.locator("#shortsDisplaySettingsCard").isVisible(), false);
  assert.equal(await page.locator("#homeGridColumnsFieldset").evaluate((element) => element.parentElement?.id), "homeGridColumnsBottomCard");
  assert.equal(await page.locator("#globalHideEndScreenRecommendationsSetting").isVisible(), true);

  await page.evaluate(() => localStorage.setItem("ytqs-test-spherical", "true"));
  await page.reload();
  await page.waitForSelector("#globalSpeed .option-button");
  await page.locator("#shortcutHelpButton").click();
  assert.deepEqual(await page.locator("#shortcutKeys kbd").allTextContents(), ["PgUp", "PgDn", "Home", "Ctrl", "S"]);
  assert.equal(await page.locator("#shortcutKeys .shortcut-help-section").count(), 2);
  assert.match(await page.locator("#shortcutDialogContext").innerText(), /S[／\/]Shift\+S.*YouTube/);
  await page.locator("#shortcutDialogClose").click();
  assert.equal(await page.locator("#copyVideoInfo").isEnabled(), true);
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
