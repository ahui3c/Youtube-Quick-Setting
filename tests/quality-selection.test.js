const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

let source = fs.readFileSync("page-bridge.js", "utf8");
source = source.replace(
  /\n\}\)\(\);\s*$/,
  "\nwindow.__qualityTest = { bestQuality, chooseMenuQuality };\n})();"
);

const sandbox = {
  window: { addEventListener() {} },
  document: { addEventListener() {} },
  setTimeout() {},
  location: { origin: "https://www.youtube.com" },
  Promise
};
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: "page-bridge.js" });

const { bestQuality, chooseMenuQuality } = sandbox.window.__qualityTest;

assert.equal(bestQuality(["hd1440", "hd1080", "hd720"], "hd2160"), "hd1440");
assert.equal(bestQuality(["hd2160", "hd1440"], "hd1080"), "hd1440");
assert.equal(bestQuality(["hd2160", "hd1080", "hd720"], "hd1080"), "hd1080");
assert.equal(bestQuality(["hd1440", "hd1080", "hd720"], "highest"), "hd1440");

function row(id, text, premium = false) {
  return {
    id,
    textContent: text,
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
assert.equal(chooseMenuQuality(qualityRows, "hd1080").element.id, "1080-premium");
assert.equal(chooseMenuQuality(qualityRows, "hd2160").element.id, "4k");
assert.equal(chooseMenuQuality([row("720", "720p"), row("480", "480p")], "hd1080").element.id, "720");
assert.equal(chooseMenuQuality([row("4k", "2160p 4K"), row("1440", "1440p")], "hd1080").element.id, "1440");

console.log("QUALITY_SELECTION_TESTS_OK");
