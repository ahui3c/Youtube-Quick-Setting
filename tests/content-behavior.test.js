const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

let source = fs.readFileSync("content.js", "utf8");
const copySource = fs.readFileSync("copy-utils.js", "utf8");
assert.match(source, /event\.key === "\*"/);
assert.match(source, /event\.code === "NumpadMultiply"/);
assert.match(source, /event\.key === "ArrowLeft"/);
assert.match(source, /event\.key === "ArrowRight"/);
assert.match(source, /event\.key === "0"/);
assert.match(source, /event\.code === "Numpad0"/);
assert.match(source, /event\.code === "KeyS"/);
assert.match(source, /ytReelPlayerOverlayViewModelMetadataContainerMetapanel/);
source = source.replace(/^\s*show(?:Speed|Seek|Copy)Overlay\([^;]+;\r?$/gm, "");
source = source.replace(/\ndocument\.addEventListener\("keydown"[\s\S]*$/, "\nthis.__contentTest = { contentType, isVideoPage, effectiveSettings, restoreNormalSpeed, seekShorts, handleKeyboardShortcut, currentVideoInfo, copyCurrentVideoInfo, ytqsNormalizeSettings, ytqsShortsVideoId, ytqsNormalizeShortsAuthor, ytqsExtractShortsPublishDate, ytqsNormalizePublishDate, ytqsCurrentShortsPagePublishDate, ytqsFormatShortsPublishTime, ytqsDeduplicateShortsChannelNames, ytqsDeduplicateShortsPublishTimes, ytqsDeduplicateShortsPagePublishTimes, setSettings: (value) => { ytqsSettings = ytqsNormalizeSettings(value); }, setContext: (value) => { ytqsContext = value; } };" );

const messages = [];
const clipboardWrites = [];
const video = {
  playbackRate: 2,
  defaultPlaybackRate: 2,
  currentTime: 12,
  duration: 30,
  paused: false,
  getBoundingClientRect: () => ({ width: 400, height: 700 }),
  closest: () => ({ querySelector: () => player })
};
const player = { querySelector: () => video, classList: { contains: () => false } };
const pageMetadata = { canonical: "", publishDate: "" };
let pagePublishMarkers = [];
class MockHTMLElement {
  constructor(tagName = "BODY") {
    this.tagName = tagName;
    this.isContentEditable = false;
  }
  closest() { return null; }
}
const sandbox = {
  location: { pathname: "/shorts/abc123", search: "", origin: "https://www.youtube.com" },
  navigator: { language: "en", clipboard: { writeText: async (text) => clipboardWrites.push(text) } },
  chrome: { i18n: { getUILanguage: () => "en-US" } },
  document: {
    title: "Test Video - YouTube",
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
  window: { postMessage: (message) => messages.push(message) },
  setTimeout: (callback) => callback(),
  clearTimeout() {},
  HTMLElement: MockHTMLElement,
  Object,
  Number,
  Intl,
  URL,
  URLSearchParams
};
vm.createContext(sandbox);
vm.runInContext(copySource, sandbox, { filename: "copy-utils.js" });
vm.runInContext(source, sandbox, { filename: "content.js" });

const api = sandbox.__contentTest;
assert.equal(api.contentType(), "shorts");
assert.equal(api.isVideoPage(), true);
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

api.setSettings({
  global: { speed: 1, quality: "hd1080", premiumQualityEnabled: true, theaterModeEnabled: true },
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
api.setContext({ isVideo: true, contentType: "regular", channelId: "", channelName: "" });
assert.equal(api.effectiveSettings().theaterMode, true);
assert.equal(api.effectiveSettings().premiumQualityEnabled, true);
api.setSettings({ global: { speed: 1, quality: "hd1080", theaterModeEnabled: false } });
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

sandbox.location.pathname = "/shorts/qRjSmLc2cOs";
sandbox.location.search = "";
assert.equal(api.currentVideoInfo().url, "https://www.youtube.com/shorts/qRjSmLc2cOs");

sandbox.location.pathname = "/watch";
sandbox.location.search = "?v=qRjSmLc2cOs&list=PL123&t=90";
const regularArrow = keyboardEvent("ArrowRight");
assert.equal(api.handleKeyboardShortcut(regularArrow), false);
assert.equal(video.currentTime, 0);

const info = api.currentVideoInfo();
assert.deepEqual(JSON.parse(JSON.stringify(info)), {
  title: "Test Video",
  url: "https://www.youtube.com/watch?v=qRjSmLc2cOs",
  currentTime: 0,
  text: "Test Video\nhttps://www.youtube.com/watch?v=qRjSmLc2cOs"
});
const copy = keyboardEvent("s", "KeyS");
assert.equal(api.handleKeyboardShortcut(copy), true);
assert.equal(copy.preventDefaultCalled, true);
assert.equal(copy.stopImmediatePropagationCalled, true);

video.currentTime = 125.9;
const timestampCopy = keyboardEvent("S", "KeyS");
timestampCopy.shiftKey = true;
assert.equal(api.handleKeyboardShortcut(timestampCopy), true);

setImmediate(() => {
  assert.deepEqual(clipboardWrites, [
    "Test Video\nhttps://www.youtube.com/watch?v=qRjSmLc2cOs",
    "Test Video\nhttps://www.youtube.com/watch?v=qRjSmLc2cOs&t=125s"
  ]);
  console.log("CONTENT_BEHAVIOR_TESTS_OK");
});
