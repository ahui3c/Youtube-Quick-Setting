const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

let source = fs.readFileSync("content.js", "utf8");
assert.match(source, /event\.key === "\*"/);
assert.match(source, /event\.code === "NumpadMultiply"/);
assert.match(source, /event\.key === "ArrowLeft"/);
assert.match(source, /event\.key === "ArrowRight"/);
assert.match(source, /event\.key === "0"/);
assert.match(source, /event\.code === "Numpad0"/);
source = source.replace(/^\s*show(?:Speed|Seek)Overlay\([^;]+;\r?$/gm, "");
source = source.replace(/\ndocument\.addEventListener\("keydown"[\s\S]*$/, "\nthis.__contentTest = { contentType, isVideoPage, effectiveSettings, restoreNormalSpeed, seekShorts, handleKeyboardShortcut, ytqsNormalizeSettings, ytqsShortsVideoId, ytqsNormalizeShortsAuthor, setSettings: (value) => { ytqsSettings = ytqsNormalizeSettings(value); }, setContext: (value) => { ytqsContext = value; } };" );

const messages = [];
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
class MockHTMLElement {
  constructor(tagName = "BODY") {
    this.tagName = tagName;
    this.isContentEditable = false;
  }
  closest() { return null; }
}
const sandbox = {
  location: { pathname: "/shorts/abc123", search: "", origin: "https://www.youtube.com" },
  navigator: { language: "en" },
  chrome: { i18n: { getUILanguage: () => "en-US" } },
  document: {
    querySelectorAll() {
      return [video];
    },
    querySelector(selector) {
      return selector.includes("#movie_player") ? player : null;
    }
  },
  window: { postMessage: (message) => messages.push(message) },
  setTimeout: (callback) => callback(),
  clearTimeout() {},
  HTMLElement: MockHTMLElement,
  Object,
  Number,
  URL,
  URLSearchParams
};
vm.createContext(sandbox);
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

sandbox.location.pathname = "/watch";
sandbox.location.search = "?v=abc123";
const regularArrow = keyboardEvent("ArrowRight");
assert.equal(api.handleKeyboardShortcut(regularArrow), false);
assert.equal(video.currentTime, 0);

console.log("CONTENT_BEHAVIOR_TESTS_OK");
