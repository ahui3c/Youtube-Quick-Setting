const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

let source = fs.readFileSync("content.js", "utf8");
assert.match(source, /event\.key === "\*"/);
assert.match(source, /event\.code === "NumpadMultiply"/);
source = source.replaceAll("  showSpeedOverlay(speed);\n  return true;", "  return true;");
source = source.replace(/\ndocument\.addEventListener\("keydown"[\s\S]*$/, "\nthis.__contentTest = { contentType, isVideoPage, effectiveSettings, restoreNormalSpeed, ytqsNormalizeSettings };" );

const messages = [];
const video = {
  playbackRate: 2,
  defaultPlaybackRate: 2,
  paused: false,
  getBoundingClientRect: () => ({ width: 400, height: 700 }),
  closest: () => ({ querySelector: () => player })
};
const player = { querySelector: () => video };
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
  Object,
  Number
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

console.log("CONTENT_BEHAVIOR_TESTS_OK");
