const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

let source = fs.readFileSync("popup.js", "utf8");
source = source.replace(
  /\n\$\("#typeSwitch"\)[\s\S]*$/,
  "\nthis.__settingsTest = { normalizeSettings, profileKey, channelProfile };"
);

const sandbox = {
  structuredClone,
  chrome: { i18n: { getUILanguage: () => "zh-TW" } },
  navigator: { language: "zh-TW" },
  document: { querySelector() {} }
};
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: "popup.js" });

const { normalizeSettings, profileKey, channelProfile } = sandbox.__settingsTest;
const migrated = normalizeSettings({
  global: { speed: 1.25, quality: "hd2160" },
  channels: {
    channelA: { name: "Channel A", speed: 2, quality: "highest" }
  }
});

assert.deepEqual(
  JSON.parse(JSON.stringify(migrated.shorts)),
  { speed: 1.25, quality: "hd2160" }
);
assert.deepEqual(
  JSON.parse(JSON.stringify(migrated.shortsControls)),
  { seekSeconds: 5, arrowKeysEnabled: true }
);
assert.deepEqual(
  JSON.parse(JSON.stringify(migrated.channels.channelA.regular)),
  { speed: 2, quality: "highest" }
);
assert.deepEqual(
  JSON.parse(JSON.stringify(migrated.channels.channelA.shorts)),
  { speed: 2, quality: "highest" }
);

const independent = normalizeSettings({
  language: "ja",
  global: { speed: 1, quality: "hd1080" },
  shorts: { speed: 3, quality: "highest" },
  shortsControls: { seekSeconds: 10, arrowKeysEnabled: false },
  channels: {
    channelB: {
      regular: { speed: 1.25, quality: "hd1080" },
      shorts: { speed: 0.7, quality: "highest" }
    }
  }
});
assert.equal(independent.language, "ja");
assert.equal(independent.global.speed, 1);
assert.equal(independent.shorts.speed, 3);
assert.equal(independent.shortsControls.seekSeconds, 10);
assert.equal(independent.shortsControls.arrowKeysEnabled, false);
assert.equal(channelProfile(independent.channels.channelB, "regular").speed, 1.25);
assert.equal(channelProfile(independent.channels.channelB, "shorts").speed, 0.7);
assert.equal(profileKey("regular"), "global");
assert.equal(profileKey("shorts"), "shorts");

console.log("SETTINGS_PROFILE_TESTS_OK");
