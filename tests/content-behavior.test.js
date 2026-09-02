const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

let source = fs.readFileSync("content.js", "utf8");
const copySource = fs.readFileSync("copy-utils.js", "utf8");
const dateSource = fs.readFileSync("date-utils.js", "utf8");
assert.match(source, /event\.key === "Home"/);
assert.match(source, /event\.code === "Home"/);
assert.doesNotMatch(source, /NumpadMultiply/);
assert.match(source, /event\.key === "ArrowLeft"/);
assert.match(source, /event\.key === "ArrowRight"/);
assert.match(source, /event\.key === "0"/);
assert.match(source, /event\.code === "Numpad0"/);
assert.match(source, /event\.key === "PageUp"/);
assert.match(source, /event\.code === "PageUp"/);
assert.match(source, /event\.key === "PageDown"/);
assert.match(source, /event\.code === "PageDown"/);
assert.doesNotMatch(source, /NumpadAdd|NumpadSubtract/);
assert.match(source, /event\.code === "KeyS"/);
assert.match(source, /event\.ctrlKey === true/);
assert.match(source, /context\.drawImage\(video, 0, 0, width, height\)/);
assert.match(source, /#movie_player\.ytqs-hide-end-screen-recommendations:not\(:hover\) \.ytp-endscreen-content/);
assert.match(source, /已成功複製到剪貼簿，再按快速鍵快速分享 F \/ T \/ X/);
assert.match(source, /classList\?\.contains\("ytp-webgl-spherical"\)/);
assert.match(source, /\.ytp-webgl-spherical-control/);
assert.match(source, /ytReelPlayerOverlayViewModelMetadataContainerMetapanel/);
assert.match(source, /\.ytqs-shorts-page-publish-time\.ytqs-on-video/);
assert.match(source, /window\.addEventListener\("resize", ytqsScheduleShortsCardScan/);
assert.match(source, /#ytqs-speed-overlay\.ytqs-seek-overlay\.ytqs-show\{opacity:\.82\}/);
assert.match(source, /rect\.left \+ rect\.width \/ 2/);
assert.match(source, /function showSpeedOverlay\([\s\S]*?positionOverlayForContent\(overlay\)/);
assert.match(source, /function showCopyOverlay\([\s\S]*?positionOverlayForContent\(overlay\)/);
source = source.replace(/^\s*show(?:Speed|Seek|Copy)Overlay\([^;]+;\r?$/gm, "");
source = source.replace(/\ndocument\.addEventListener\("keydown"[\s\S]*$/, "\nthis.__contentTest = { contentType, isVideoPage, effectiveSettings, applyEndScreenRecommendationVisibility, restoreNormalSpeed, seekShorts, handleKeyboardShortcut, isSphericalVideo, currentVideoInfo, copyCurrentVideoInfo, captureCurrentVideoFrame, ytqsScreenshotFilename, socialShareReady, openSocialShareWindow, positionShortsOverlay, positionOverlayForContent, ytqsNormalizeSettings, ytqsIsHomeGridPage, ytqsHomeGridStyleText, ytqsShortsVideoId, ytqsNormalizeShortsAuthor, ytqsExtractShortsPublishDate, ytqsNormalizePublishDate, ytqsCurrentShortsPagePublishDate, ytqsFormatShortsPublishTime, ytqsVideoIdFromCard, ytqsLooksLikeRelativeDate, ytqsCardDateElement, ytqsDeduplicateShortsChannelNames, ytqsDeduplicateShortsPublishTimes, ytqsDeduplicateShortsPagePublishTimes, ytqsIsMarkerOverVideo, setSettings: (value) => { ytqsSettings = ytqsNormalizeSettings(value); }, setContext: (value) => { ytqsContext = value; } };" );

const messages = [];
const clipboardWrites = [];
const clipboardImageWrites = [];
const openedWindows = [];
const screenshotDownloads = [];
const screenshotDraws = [];
const video = {
  playbackRate: 2,
  defaultPlaybackRate: 2,
  currentTime: 12,
  duration: 30,
  paused: false,
  readyState: 4,
  videoWidth: 1920,
  videoHeight: 1080,
  getBoundingClientRect: () => ({ left: 100, top: 40, right: 500, bottom: 740, width: 400, height: 700 }),
  closest: () => ({ querySelector: () => player })
};
let sphericalVideo = false;
const playerClasses = new Set();
const player = {
  querySelector: (selector) => selector === ".ytp-webgl-spherical-control" ? (sphericalVideo ? {} : null) : video,
  classList: {
    contains: (name) => name === "ytp-webgl-spherical" ? sphericalVideo : playerClasses.has(name),
    toggle(name, force) {
      if (force) playerClasses.add(name);
      else playerClasses.delete(name);
      return force;
    }
  }
};
const pageMetadata = { canonical: "", publishDate: "" };
let pagePublishMarkers = [];
class TestURL extends URL {
  static createObjectURL() { return "blob:ytqs-screenshot"; }
  static revokeObjectURL() {}
}
class MockHTMLElement {
  constructor(tagName = "BODY") {
    this.tagName = tagName;
    this.isContentEditable = false;
  }
  closest() { return null; }
}
class MockClipboardItem {
  constructor(items) { this.items = items; }
}
const sandbox = {
  location: { pathname: "/shorts/abc123", search: "", origin: "https://www.youtube.com" },
  navigator: { language: "en", clipboard: { writeText: async (text) => clipboardWrites.push(text), write: async (items) => clipboardImageWrites.push(items) } },
  chrome: { i18n: { getUILanguage: () => "en-US" } },
  document: {
    title: "Test Video - YouTube",
    documentElement: { append() {} },
    createElement(tagName) {
      if (tagName === "canvas") {
        return {
          width: 0,
          height: 0,
          getContext: () => ({ drawImage: (...args) => screenshotDraws.push(args) }),
          toBlob: (callback, type) => callback({ type, size: 128 })
        };
      }
      if (tagName === "a") {
        return {
          href: "",
          download: "",
          hidden: false,
          click() { screenshotDownloads.push({ href: this.href, download: this.download }); },
          remove() {}
        };
      }
      return new MockHTMLElement(tagName.toUpperCase());
    },
    querySelectorAll(selector) {
      if (selector === ".ytqs-shorts-page-publish-time") return pagePublishMarkers;
      return [video];
    },
    querySelector(selector) {
      if (selector === 'link[rel="canonical"]') return pageMetadata.canonical ? { href: pageMetadata.canonical } : null;
      if (selector === 'meta[itemprop="uploadDate"], meta[itemprop="datePublished"]') return pageMetadata.publishDate ? { content: pageMetadata.publishDate } : null;
      return selector.includes("#movie_player") ? player : null;
    }
  },
  window: {
    innerWidth: 1000,
    innerHeight: 900,
    postMessage: (message) => messages.push(message),
    open: (url, name, features) => {
      const opened = { url, name, features, opener: {}, focused: false, focus() { this.focused = true; } };
      openedWindows.push(opened);
      return opened;
    }
  },
  setTimeout: (callback) => callback(),
  clearTimeout() {},
  HTMLElement: MockHTMLElement,
  ClipboardItem: MockClipboardItem,
  Object,
  Number,
  Intl,
  URL: TestURL,
  URLSearchParams
};
vm.createContext(sandbox);
vm.runInContext(copySource, sandbox, { filename: "copy-utils.js" });
vm.runInContext(dateSource, sandbox, { filename: "date-utils.js" });
vm.runInContext(source, sandbox, { filename: "content.js" });

const api = sandbox.__contentTest;
const seekOverlay = { style: {} };
assert.equal(api.positionShortsOverlay(seekOverlay, video), true);
assert.equal(seekOverlay.style.left, "300px");
assert.equal(seekOverlay.style.top, "166px");
assert.equal(api.positionShortsOverlay(seekOverlay, { getBoundingClientRect: () => ({ width: 0, height: 0 }) }), false);
assert.equal(api.positionOverlayForContent(seekOverlay, video), true);
assert.equal(api.ytqsNormalizeSettings({}).shortsControls.publishTimeEnabled, false);
assert.equal(api.ytqsNormalizeSettings({ shortsControls: { publishTimeEnabled: true } }).shortsControls.publishTimeEnabled, true);
assert.deepEqual(JSON.parse(JSON.stringify(api.ytqsNormalizeSettings({}).dateDisplay)), { enabled: false, format: "yyyy-MM-dd" });
assert.deepEqual(JSON.parse(JSON.stringify(api.ytqsNormalizeSettings({}).gridLayout)), { regularColumns: "auto", shortsColumns: "auto" });
assert.deepEqual(JSON.parse(JSON.stringify(api.ytqsNormalizeSettings({}).screenshot)), { output: "download" });
assert.deepEqual(JSON.parse(JSON.stringify(api.ytqsNormalizeSettings({ screenshot: { output: "clipboard" } }).screenshot)), { output: "clipboard" });
assert.deepEqual(
  JSON.parse(JSON.stringify(api.ytqsNormalizeSettings({ gridLayout: { regularColumns: 4, shortsColumns: 6 } }).gridLayout)),
  { regularColumns: 4, shortsColumns: 6 }
);
assert.deepEqual(
  JSON.parse(JSON.stringify(api.ytqsNormalizeSettings({ gridLayout: { regularColumns: 9, shortsColumns: "4" } }).gridLayout)),
  { regularColumns: "auto", shortsColumns: "auto" }
);
assert.equal(api.ytqsIsHomeGridPage("/"), true);
assert.equal(api.ytqsIsHomeGridPage("/feed/subscriptions"), true);
assert.equal(api.ytqsIsHomeGridPage("/watch"), false);
assert.equal(api.ytqsHomeGridStyleText({ regularColumns: "auto", shortsColumns: "auto" }, "/"), "");
assert.equal(
  api.ytqsHomeGridStyleText({ regularColumns: 4, shortsColumns: 6 }, "/"),
  "ytd-rich-grid-renderer{--ytd-rich-grid-items-per-row:4 !important;--ytd-rich-grid-slim-items-per-row:6 !important}"
);
assert.equal(api.ytqsHomeGridStyleText({ regularColumns: 4, shortsColumns: 6 }, "/watch"), "");
assert.deepEqual(JSON.parse(JSON.stringify(api.ytqsNormalizeSettings({ dateDisplay: { enabled: true, format: "dd/MM/yyyy" } }).dateDisplay)), { enabled: true, format: "dd/MM/yyyy" });
assert.equal(api.ytqsNormalizeSettings({ copy: { defaultFormat: "markdown" } }).copy.defaultFormat, "title-url");
assert.equal(api.contentType(), "shorts");
assert.equal(api.isVideoPage(), true);
assert.equal(api.ytqsScreenshotFilename("Bad:/Title - YouTube", new Date("2026-09-02T03:04:05Z")), "Bad Title-20260902-030405Z.png");
assert.equal(api.restoreNormalSpeed(), true);
assert.equal(messages.at(-1).type, "SET_SESSION_SPEED");
assert.equal(messages.at(-1).speed, 1);
assert.equal(video.playbackRate, 1);
assert.deepEqual(
  JSON.parse(JSON.stringify(api.ytqsNormalizeShortsAuthor({ author_name: "Channel A", author_url: "https://www.youtube.com/@channelA" }))),
  { name: "Channel A", href: "/@channelA" }
);
assert.equal(api.ytqsNormalizeShortsAuthor({ author_name: "Channel A", author_url: "https://example.com/@channelA" }), null);
assert.equal(api.ytqsShortsVideoId({ querySelector: () => ({ getAttribute: () => "/shorts/abc123?feature=share" }) }), "abc123");
assert.equal(api.ytqsVideoIdFromCard({ querySelector: () => ({ getAttribute: () => "/watch?v=qRjSmLc2cOs" }) }), "qRjSmLc2cOs");
assert.equal(api.ytqsVideoIdFromCard({ querySelector: () => ({ getAttribute: () => "/watch?v=bad" }) }), "");
assert.equal(api.ytqsLooksLikeRelativeDate("2 weeks ago"), true);
assert.equal(api.ytqsLooksLikeRelativeDate("1 年前"), true);
assert.equal(api.ytqsLooksLikeRelativeDate("4 週間前"), true);
assert.equal(api.ytqsLooksLikeRelativeDate("52K views"), false);
const legacyDateElement = { textContent: "1.7萬次" };
const currentDateElement = { textContent: "2 週前" };
let requestedDateSelector = "";
assert.equal(api.ytqsCardDateElement({
  querySelectorAll(selector) {
    requestedDateSelector = selector;
    return [legacyDateElement, currentDateElement];
  }
}), currentDateElement);
assert.match(requestedDateSelector, /ytContentMetadataViewModelMetadataRow/);
assert.match(requestedDateSelector, /ytContentMetadataViewModelMetadataText/);
const firstChannelMarker = { dataset: { videoId: "abc123" }, removed: false, remove() { this.removed = true; } };
const duplicateChannelMarker = { dataset: { videoId: "abc123" }, removed: false, remove() { this.removed = true; } };
const staleChannelMarker = { dataset: { videoId: "old456" }, removed: false, remove() { this.removed = true; } };
assert.equal(api.ytqsDeduplicateShortsChannelNames({
  querySelectorAll: () => [firstChannelMarker, duplicateChannelMarker, staleChannelMarker]
}, "abc123"), firstChannelMarker);
assert.equal(firstChannelMarker.removed, false);
assert.equal(duplicateChannelMarker.removed, true);
assert.equal(staleChannelMarker.removed, true);
assert.equal(api.ytqsExtractShortsPublishDate('{"publishDate":"2026-08-27T00:00:00Z"}'), "2026-08-27T00:00:00Z");
assert.equal(api.ytqsExtractShortsPublishDate('{"uploadDate":"2026-08-26"}'), "2026-08-26");
assert.equal(api.ytqsExtractShortsPublishDate('{"publishDate":"not-a-date"}'), "");
pageMetadata.canonical = "https://www.youtube.com/shorts/qRjSmLc2cOs";
pageMetadata.publishDate = "2026-08-25T05:00:31-07:00";
assert.equal(api.ytqsCurrentShortsPagePublishDate("qRjSmLc2cOs"), "2026-08-25T05:00:31-07:00");
assert.equal(api.ytqsCurrentShortsPagePublishDate("abcdefghijk"), "");
assert.equal(api.ytqsFormatShortsPublishTime("2026-08-27T00:00:00Z", Date.parse("2026-08-29T00:00:00Z")), "2 days ago");
assert.equal(api.ytqsFormatShortsPublishTime("2026-08-29", Date.parse("2026-08-29T08:00:00Z")), "today");
api.setSettings({ dateDisplay: { enabled: true, format: "yyyy/MM/dd" } });
assert.equal(api.ytqsFormatShortsPublishTime("2026-08-27T00:00:00Z"), "2026/08/27");
const firstPublishMarker = { dataset: { videoId: "abc123" }, removed: false, remove() { this.removed = true; } };
const duplicatePublishMarker = { dataset: { videoId: "abc123" }, removed: false, remove() { this.removed = true; } };
const stalePublishMarker = { dataset: { videoId: "old456" }, removed: false, remove() { this.removed = true; } };
assert.equal(api.ytqsDeduplicateShortsPublishTimes({
  querySelectorAll: () => [firstPublishMarker, duplicatePublishMarker, stalePublishMarker]
}, "abc123"), firstPublishMarker);
assert.equal(firstPublishMarker.removed, false);
assert.equal(duplicatePublishMarker.removed, true);
assert.equal(stalePublishMarker.removed, true);
const firstPagePublishMarker = { dataset: { videoId: "qRjSmLc2cOs" }, removed: false, remove() { this.removed = true; } };
const duplicatePagePublishMarker = { dataset: { videoId: "qRjSmLc2cOs" }, removed: false, remove() { this.removed = true; } };
const stalePagePublishMarker = { dataset: { videoId: "abcdefghijk" }, removed: false, remove() { this.removed = true; } };
const activeReel = { contains: (marker) => marker === firstPagePublishMarker || marker === duplicatePagePublishMarker };
pagePublishMarkers = [firstPagePublishMarker, duplicatePagePublishMarker, stalePagePublishMarker];
assert.equal(api.ytqsDeduplicateShortsPagePublishTimes(activeReel, "qRjSmLc2cOs"), firstPagePublishMarker);
assert.equal(firstPagePublishMarker.removed, false);
assert.equal(duplicatePagePublishMarker.removed, true);
assert.equal(stalePagePublishMarker.removed, true);
const videoRect = { left: 500, right: 900, top: 80, bottom: 780, width: 400, height: 700 };
assert.equal(api.ytqsIsMarkerOverVideo({ left: 540, top: 700, width: 80, height: 24 }, videoRect), true);
assert.equal(api.ytqsIsMarkerOverVideo({ left: 100, top: 700, width: 80, height: 24 }, videoRect), false);
assert.equal(api.ytqsIsMarkerOverVideo({ left: 540, top: 700, width: 80, height: 24 }, { ...videoRect, width: 0 }), false);

api.setSettings({
  global: { speed: 1, quality: "hd1080", premiumQualityEnabled: true, theaterModeEnabled: true, disableAutoplayNext: true, hideEndScreenRecommendations: true },
  channels: {
    channelA: {
      regular: { speed: 1.25, quality: "hd1080", premiumQualityEnabled: false, theaterModeOverride: "off" },
      shorts: { speed: 2, quality: "highest" }
    }
  }
});
api.setContext({ isVideo: true, contentType: "regular", channelId: "channelA", channelName: "Channel A" });
assert.equal(api.effectiveSettings().theaterMode, false);
assert.equal(api.effectiveSettings().premiumQualityEnabled, false);
assert.equal(api.effectiveSettings().disableAutoplayNext, true);
assert.equal(api.effectiveSettings().hideEndScreenRecommendations, true);
assert.equal(api.applyEndScreenRecommendationVisibility(), true);
assert.equal(playerClasses.has("ytqs-hide-end-screen-recommendations"), true);
api.setContext({ isVideo: true, contentType: "regular", channelId: "", channelName: "" });
assert.equal(api.effectiveSettings().theaterMode, true);
assert.equal(api.effectiveSettings().premiumQualityEnabled, true);
assert.equal(api.effectiveSettings().disableAutoplayNext, true);
assert.equal(api.effectiveSettings().hideEndScreenRecommendations, true);
api.setContext({ isVideo: true, contentType: "shorts", channelId: "channelA", channelName: "Channel A" });
assert.deepEqual(JSON.parse(JSON.stringify(api.effectiveSettings())), {
  speed: 2,
  quality: null,
  premiumQualityEnabled: false,
  disableAutoplayNext: false,
  hideEndScreenRecommendations: false
});
assert.equal(api.applyEndScreenRecommendationVisibility(), false);
assert.equal(playerClasses.has("ytqs-hide-end-screen-recommendations"), false);
api.setSettings({ global: { speed: 1, quality: "hd1080", theaterModeEnabled: false } });
api.setContext({ isVideo: true, contentType: "regular", channelId: "", channelName: "" });
assert.equal(api.effectiveSettings().theaterMode, null);

assert.equal(api.seekShorts(5), true);
assert.equal(video.currentTime, 17);
assert.equal(api.seekShorts(-5), true);
assert.equal(video.currentTime, 12);
assert.equal(api.seekShorts(0), true);
assert.equal(video.currentTime, 0);

function keyboardEvent(key, code = "") {
  return {
    key,
    code,
    target: new MockHTMLElement(),
    defaultPrevented: false,
    repeat: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    shiftKey: false,
    preventDefaultCalled: false,
    stopImmediatePropagationCalled: false,
    preventDefault() { this.preventDefaultCalled = true; },
    stopImmediatePropagation() { this.stopImmediatePropagationCalled = true; }
  };
}

video.playbackRate = 1.25;
video.defaultPlaybackRate = 1.25;
const speedDown = keyboardEvent("PageUp", "PageUp");
assert.equal(api.handleKeyboardShortcut(speedDown), true);
assert.equal(messages.at(-1).type, "SET_SESSION_SPEED");
assert.equal(messages.at(-1).speed, 1);
assert.equal(video.playbackRate, 1);
assert.equal(speedDown.preventDefaultCalled, true);
assert.equal(speedDown.stopImmediatePropagationCalled, true);

const speedUp = keyboardEvent("PageDown", "PageDown");
assert.equal(api.handleKeyboardShortcut(speedUp), true);
assert.equal(messages.at(-1).speed, 1.25);
assert.equal(video.playbackRate, 1.25);

video.playbackRate = 2;
video.defaultPlaybackRate = 2;
const resetSpeed = keyboardEvent("Home", "Home");
assert.equal(api.handleKeyboardShortcut(resetSpeed), true);
assert.equal(messages.at(-1).speed, 1);
assert.equal(video.playbackRate, 1);
assert.equal(resetSpeed.preventDefaultCalled, true);
assert.equal(resetSpeed.stopImmediatePropagationCalled, true);

const legacyReset = keyboardEvent("*", "NumpadMultiply");
assert.equal(api.handleKeyboardShortcut(legacyReset), false);
assert.equal(legacyReset.preventDefaultCalled, false);

const legacyPlus = keyboardEvent("+", "NumpadAdd");
assert.equal(api.handleKeyboardShortcut(legacyPlus), false);
assert.equal(legacyPlus.preventDefaultCalled, false);
const legacyMinus = keyboardEvent("-", "NumpadSubtract");
assert.equal(api.handleKeyboardShortcut(legacyMinus), false);
assert.equal(legacyMinus.preventDefaultCalled, false);

video.currentTime = 10;
const forward = keyboardEvent("ArrowRight");
assert.equal(api.handleKeyboardShortcut(forward), true);
assert.equal(video.currentTime, 15);
assert.equal(forward.preventDefaultCalled, true);
assert.equal(forward.stopImmediatePropagationCalled, true);

const restart = keyboardEvent("0", "Digit0");
assert.equal(api.handleKeyboardShortcut(restart), true);
assert.equal(video.currentTime, 0);

const repeatedForward = keyboardEvent("ArrowRight");
repeatedForward.repeat = true;
assert.equal(api.handleKeyboardShortcut(repeatedForward), true);
assert.equal(video.currentTime, 5);

api.setSettings({
  global: { speed: 1, quality: "hd1080" },
  shorts: { speed: 1, quality: "hd1080" },
  shortsControls: { seekSeconds: 10, arrowKeysEnabled: true }
});
const tenSecondForward = keyboardEvent("ArrowRight");
assert.equal(api.handleKeyboardShortcut(tenSecondForward), true);
assert.equal(video.currentTime, 15);

api.setSettings({
  global: { speed: 1, quality: "hd1080" },
  shorts: { speed: 1, quality: "hd1080" },
  shortsControls: { seekSeconds: 3, arrowKeysEnabled: false }
});
const disabledArrow = keyboardEvent("ArrowLeft");
assert.equal(api.handleKeyboardShortcut(disabledArrow), false);
assert.equal(video.currentTime, 15);
const zeroWhileDisabled = keyboardEvent("0", "Digit0");
assert.equal(api.handleKeyboardShortcut(zeroWhileDisabled), true);
assert.equal(video.currentTime, 0);

const typingTarget = keyboardEvent("ArrowRight");
typingTarget.target = new MockHTMLElement("INPUT");
assert.equal(api.handleKeyboardShortcut(typingTarget), false);
assert.equal(video.currentTime, 0);
const typingCopy = keyboardEvent("s", "KeyS");
typingCopy.target = new MockHTMLElement("TEXTAREA");
assert.equal(api.handleKeyboardShortcut(typingCopy), false);
const typingSpeed = keyboardEvent("PageUp", "PageUp");
typingSpeed.target = new MockHTMLElement("INPUT");
assert.equal(api.handleKeyboardShortcut(typingSpeed), false);
const typingReset = keyboardEvent("Home", "Home");
typingReset.target = new MockHTMLElement("TEXTAREA");
assert.equal(api.handleKeyboardShortcut(typingReset), false);

sandbox.location.pathname = "/shorts/qRjSmLc2cOs";
sandbox.location.search = "";
assert.equal(api.currentVideoInfo().url, "https://www.youtube.com/shorts/qRjSmLc2cOs");

sandbox.location.pathname = "/watch";
sandbox.location.search = "?v=qRjSmLc2cOs&list=PL123&t=90";
const regularArrow = keyboardEvent("ArrowRight");
assert.equal(api.handleKeyboardShortcut(regularArrow), false);
assert.equal(video.currentTime, 0);
const unarmedSocial = keyboardEvent("f", "KeyF");
assert.equal(api.handleKeyboardShortcut(unarmedSocial), false);
assert.equal(unarmedSocial.preventDefaultCalled, false);

const info = api.currentVideoInfo();
assert.deepEqual(JSON.parse(JSON.stringify(info)), {
  title: "Test Video",
  url: "https://www.youtube.com/watch?v=qRjSmLc2cOs",
  currentTime: 0,
  text: "Test Video\nhttps://www.youtube.com/watch?v=qRjSmLc2cOs"
});
sphericalVideo = true;
assert.equal(api.isSphericalVideo(), true);
const sphericalCopy = keyboardEvent("s", "KeyS");
assert.equal(api.handleKeyboardShortcut(sphericalCopy), false);
assert.equal(sphericalCopy.preventDefaultCalled, false);
assert.equal(sphericalCopy.stopImmediatePropagationCalled, false);
const sphericalTimestampCopy = keyboardEvent("S", "KeyS");
sphericalTimestampCopy.shiftKey = true;
assert.equal(api.handleKeyboardShortcut(sphericalTimestampCopy), false);
assert.equal(sphericalTimestampCopy.preventDefaultCalled, false);
const sphericalScreenshot = keyboardEvent("s", "KeyS");
sphericalScreenshot.ctrlKey = true;
assert.equal(api.handleKeyboardShortcut(sphericalScreenshot), true);
assert.equal(sphericalScreenshot.preventDefaultCalled, true);
assert.equal(sphericalScreenshot.stopImmediatePropagationCalled, true);
sphericalVideo = false;
assert.equal(api.isSphericalVideo(), false);
const copy = keyboardEvent("s", "KeyS");
api.setSettings({ copy: { defaultFormat: "markdown" } });
assert.equal(api.handleKeyboardShortcut(copy), true);
assert.equal(copy.preventDefaultCalled, true);
assert.equal(copy.stopImmediatePropagationCalled, true);

video.currentTime = 125.9;
setImmediate(async () => {
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(screenshotDraws.length, 1);
  assert.deepEqual(screenshotDraws[0].slice(1), [0, 0, 1920, 1080]);
  assert.equal(screenshotDownloads.length, 1);
  assert.match(screenshotDownloads[0].download, /^Test Video-\d{8}-\d{6}Z\.png$/);
  const directScreenshot = await api.captureCurrentVideoFrame();
  assert.equal(directScreenshot.ok, true);
  assert.equal(directScreenshot.output, "download");
  assert.equal(directScreenshot.width, 1920);
  assert.equal(directScreenshot.height, 1080);
  api.setSettings({ screenshot: { output: "clipboard" } });
  const clipboardShortcut = keyboardEvent("s", "KeyS");
  clipboardShortcut.ctrlKey = true;
  assert.equal(api.handleKeyboardShortcut(clipboardShortcut), true);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(clipboardImageWrites.length, 1);
  assert.equal(clipboardImageWrites[0][0] instanceof MockClipboardItem, true);
  assert.equal(clipboardImageWrites[0][0].items["image/png"].type, "image/png");
  assert.equal(api.socialShareReady(), true);
  const secondS = keyboardEvent("s", "KeyS");
  assert.equal(api.handleKeyboardShortcut(secondS), true);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(openedWindows.length, 0);
  assert.equal(api.socialShareReady(), true);

  const instagram = keyboardEvent("i", "KeyI");
  assert.equal(api.handleKeyboardShortcut(instagram), false);
  assert.equal(instagram.preventDefaultCalled, false);
  assert.equal(openedWindows.length, 0);
  assert.equal(api.socialShareReady(), true);

  const platforms = [
    ["f", "KeyF", "https://www.facebook.com", "/sharer/sharer.php"],
    ["x", "KeyX", "https://twitter.com", "/intent/tweet"],
    ["t", "KeyT", "https://www.threads.net", "/intent/post"]
  ];
  for (const [key, code, origin, pathname] of platforms) {
    const share = keyboardEvent(key, code);
    assert.equal(api.handleKeyboardShortcut(share), true);
    const opened = openedWindows.at(-1);
    const openedUrl = new URL(opened.url);
    assert.equal(openedUrl.origin, origin);
    assert.equal(openedUrl.pathname, pathname);
    assert.equal(opened.opener, null);
    assert.equal(opened.focused, true);
    if (key === "f") {
      assert.equal(openedUrl.searchParams.get("u"), "https://www.youtube.com/watch?v=qRjSmLc2cOs");
      assert.equal(openedUrl.searchParams.get("quote"), "Test Video\nhttps://www.youtube.com/watch?v=qRjSmLc2cOs");
    }
    if (key === "x") {
      assert.equal(openedUrl.searchParams.get("text"), "Test Video");
      assert.equal(openedUrl.searchParams.get("url"), "https://www.youtube.com/watch?v=qRjSmLc2cOs");
    }
    if (key === "t") assert.equal(openedUrl.searchParams.get("text"), "Test Video\nhttps://www.youtube.com/watch?v=qRjSmLc2cOs");
    if (key !== "t") await api.copyCurrentVideoInfo("title-url", true);
  }
  assert.equal(openedWindows.length, 3);

  await api.copyCurrentVideoInfo("title-url", true);
  sandbox.window.open = () => null;
  const blockedShare = keyboardEvent("f", "KeyF");
  assert.equal(api.handleKeyboardShortcut(blockedShare), true);
  assert.equal(api.socialShareReady(), false);
  const timestampCopy = keyboardEvent("S", "KeyS");
  timestampCopy.shiftKey = true;
  assert.equal(api.handleKeyboardShortcut(timestampCopy), true);
  setImmediate(() => {
    assert.equal(clipboardWrites.length, 6);
    assert.equal(clipboardWrites.at(-1), "Test Video\nhttps://www.youtube.com/watch?v=qRjSmLc2cOs&t=125s");
    console.log("CONTENT_BEHAVIOR_TESTS_OK");
  });
});
