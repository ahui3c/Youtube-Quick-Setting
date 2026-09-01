const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

let source = fs.readFileSync("page-bridge.js", "utf8");
assert.match(source, /!currentSettings\?\.quality/);
assert.match(source, /if \(settings\?\.quality\) setTimeout\(\(\) => applyQualityViaMenu/);
source = source.replace(
  /\n\}\)\(\);\s*$/,
  "\nwindow.__qualityTest = { bestQuality, chooseMenuQuality, applyTheaterMode, applyTheaterModeOnce, applyWithRetries, shouldRestoreQualityPosition };\n})();"
);

let theaterEnabled = false;
let sizeButtonClicks = 0;
let scheduledTasks = 0;
const player = {
  classList: { contains: (name) => name === "ytp-big-mode" && theaterEnabled },
  querySelector: (selector) => selector === ".ytp-size-button" ? { click: () => { theaterEnabled = !theaterEnabled; sizeButtonClicks += 1; } } : null
};
const sandbox = {
  window: { addEventListener() {} },
  document: {
    addEventListener() {},
    querySelector: (selector) => selector === "ytd-watch-flexy" ? { hasAttribute: (name) => name === "theater" && theaterEnabled } : null
  },
  setTimeout() { scheduledTasks += 1; },
  location: { origin: "https://www.youtube.com", pathname: "/watch", search: "?v=video-a", href: "https://www.youtube.com/watch?v=video-a" },
  URLSearchParams,
  Promise
};
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: "page-bridge.js" });

const { bestQuality, chooseMenuQuality, applyTheaterMode, applyTheaterModeOnce, applyWithRetries, shouldRestoreQualityPosition } = sandbox.window.__qualityTest;

assert.equal(applyTheaterMode(player, true), true);
assert.equal(theaterEnabled, true);
assert.equal(sizeButtonClicks, 1);
assert.equal(applyTheaterMode(player, true), true);
assert.equal(sizeButtonClicks, 1);
assert.equal(applyTheaterMode(player, false), true);
assert.equal(theaterEnabled, false);
assert.equal(sizeButtonClicks, 2);
assert.equal(applyTheaterMode(player, null), false);

assert.equal(applyTheaterModeOnce(player, true), true);
assert.equal(theaterEnabled, true);
assert.equal(sizeButtonClicks, 3);
// Simulate the viewer leaving Theater mode after the extension applied it.
theaterEnabled = false;
assert.equal(applyTheaterModeOnce(player, true), false);
assert.equal(theaterEnabled, false);
assert.equal(sizeButtonClicks, 3);
// A different video gets one new load-time application.
sandbox.location.search = "?v=video-b";
sandbox.location.href = "https://www.youtube.com/watch?v=video-b";
assert.equal(applyTheaterModeOnce(player, true), true);
assert.equal(theaterEnabled, true);
assert.equal(sizeButtonClicks, 4);

applyWithRetries({ speed: 1, quality: "hd1080", premiumQualityEnabled: false, theaterMode: true });
assert.equal(scheduledTasks, 5);
applyWithRetries({ speed: 1, quality: "hd1080", premiumQualityEnabled: false, theaterMode: true });
assert.equal(scheduledTasks, 5);
applyWithRetries({ speed: 1, quality: "hd2160", premiumQualityEnabled: false, theaterMode: true });
assert.equal(scheduledTasks, 10);
applyWithRetries({ speed: 2, quality: null, premiumQualityEnabled: false, theaterMode: null });
assert.equal(scheduledTasks, 14);
assert.equal(shouldRestoreQualityPosition(0, 0.7), true);
assert.equal(shouldRestoreQualityPosition(0.62, 0.7), false);
assert.equal(shouldRestoreQualityPosition(2, 0.7), false);

assert.equal(bestQuality(["hd1440", "hd1080", "hd720"], "hd2160"), "hd1440");
assert.equal(bestQuality(["hd2160", "hd1440"], "hd1080"), "hd1440");
assert.equal(bestQuality(["hd2160", "hd1080", "hd720"], "hd1080"), "hd1080");
assert.equal(bestQuality(["hd1440", "hd1080", "hd720"], "highest"), "hd1440");

function row(id, text, premium = false, selected = false) {
  return {
    id,
    textContent: text,
    classList: { contains: (name) => name === "ytp-menuitem-checked" && selected },
    getAttribute: (name) => name === "aria-checked" && selected ? "true" : null,
    querySelector(selector) {
      return selector === ".ytp-premium-label" && premium ? {} : null;
    }
  };
}

const qualityRows = [
  row("4k", "2160p 4K"),
  row("1080-standard", "1080p HD"),
  row("1080-premium", "1080p Premium", true),
  row("720", "720p")
];
assert.equal(chooseMenuQuality(qualityRows, "hd1080").element.id, "1080-standard");
assert.equal(chooseMenuQuality([row("1080-selected", "1080p", false, true)], "hd1080").selected, true);
assert.equal(chooseMenuQuality(qualityRows, "hd1080", true).element.id, "1080-premium");
assert.equal(chooseMenuQuality(qualityRows, "highest").element.id, "4k");
assert.equal(chooseMenuQuality(qualityRows, "hd2160").element.id, "4k");
assert.equal(chooseMenuQuality([row("720", "720p"), row("480", "480p")], "hd1080").element.id, "720");
assert.equal(chooseMenuQuality([row("4k", "2160p 4K"), row("1440", "1440p")], "hd1080").element.id, "1440");
assert.equal(chooseMenuQuality([row("1080-premium", "1080p Premium", true), row("720", "720p")], "hd1080").element.id, "720");

console.log("QUALITY_SELECTION_TESTS_OK");
