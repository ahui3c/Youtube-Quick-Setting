const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

let source = fs.readFileSync("popup.js", "utf8");
const copySource = fs.readFileSync("copy-utils.js", "utf8");
const transferSource = fs.readFileSync("settings-transfer.js", "utf8");
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
vm.runInContext(copySource, sandbox, { filename: "copy-utils.js" });
vm.runInContext(transferSource, sandbox, { filename: "settings-transfer.js" });
vm.runInContext(source, sandbox, { filename: "popup.js" });

const { normalizeSettings, profileKey, channelProfile } = sandbox.__settingsTest;
const migrated = normalizeSettings({
  global: { speed: 1.25, quality: "hd2160" },
  channels: {
    channelA: { name: "Channel A", speed: 2, quality: "highest" }
  }
});
assert.equal(migrated.schemaVersion, 2);
assert.equal(migrated.copy.defaultFormat, "title-url");
assert.deepEqual(
  JSON.parse(JSON.stringify(migrated.shorts)),
  { speed: 1.25, quality: "hd2160", premiumQualityEnabled: false }
);
assert.deepEqual(
  JSON.parse(JSON.stringify(migrated.shortsControls)),
  { seekSeconds: 5, arrowKeysEnabled: true, channelNamesEnabled: true, publishTimeEnabled: false }
);
assert.deepEqual(
  JSON.parse(JSON.stringify(migrated.channels.channelA.regular)),
  { speed: 2, quality: "highest", premiumQualityEnabled: false, theaterModeOverride: "inherit" }
);
assert.deepEqual(
  JSON.parse(JSON.stringify(migrated.channels.channelA.shorts)),
  { speed: 2, quality: "highest", premiumQualityEnabled: false }
);

const independent = normalizeSettings({
  language: "ja",
  copy: { defaultFormat: "markdown" },
  global: { speed: 1, quality: "hd1080", premiumQualityEnabled: true, theaterModeEnabled: true },
  shorts: { speed: 3, quality: "highest" },
  shortsControls: { seekSeconds: 10, arrowKeysEnabled: false, channelNamesEnabled: false, publishTimeEnabled: false },
  channels: {
    channelB: {
      regular: { speed: 1.25, quality: "hd1080", premiumQualityEnabled: true, theaterModeOverride: "off" },
      shorts: { speed: 0.7, quality: "highest" }
    }
  }
});
assert.equal(independent.language, "ja");
assert.equal(independent.schemaVersion, 2);
assert.equal(independent.copy.defaultFormat, "title-url");
assert.equal(independent.global.speed, 1);
assert.equal(independent.global.theaterModeEnabled, true);
assert.equal(independent.global.premiumQualityEnabled, true);
assert.equal(independent.shorts.speed, 3);
assert.equal(independent.shortsControls.seekSeconds, 10);
assert.equal(independent.shortsControls.arrowKeysEnabled, false);
assert.equal(independent.shortsControls.channelNamesEnabled, false);
assert.equal(independent.shortsControls.publishTimeEnabled, false);
assert.equal(channelProfile(independent.channels.channelB, "regular").speed, 1.25);
assert.equal(channelProfile(independent.channels.channelB, "regular").theaterModeOverride, "off");
assert.equal(channelProfile(independent.channels.channelB, "regular").premiumQualityEnabled, true);
assert.equal(channelProfile(independent.channels.channelB, "shorts").speed, 0.7);
assert.equal(profileKey("regular"), "global");
assert.equal(profileKey("shorts"), "shorts");

console.log("SETTINGS_PROFILE_TESTS_OK");
