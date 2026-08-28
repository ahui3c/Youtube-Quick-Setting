const assert = require("node:assert/strict");

require("../copy-utils.js");
require("../settings-transfer.js");

const info = {
  title: 'A <Useful> "Video"',
  url: "https://www.youtube.com/watch?v=qRjSmLc2cOs",
  channelName: "Test Channel",
  currentTime: 125.9
};

assert.equal(YTQSCopy.formatVideoInfo(info, "title-url"), 'A <Useful> "Video"\nhttps://www.youtube.com/watch?v=qRjSmLc2cOs');
assert.equal(YTQSCopy.formatVideoInfo(info, "timestamp-url"), 'A <Useful> "Video"\nhttps://www.youtube.com/watch?v=qRjSmLc2cOs&t=125s');
assert.equal(YTQSCopy.formatVideoInfo(info, "markdown"), '[A <Useful> "Video"](https://www.youtube.com/watch?v=qRjSmLc2cOs)');
assert.equal(YTQSCopy.formatVideoInfo(info, "html"), '<a href="https://www.youtube.com/watch?v=qRjSmLc2cOs">A &lt;Useful&gt; &quot;Video&quot;</a>');
assert.equal(YTQSCopy.FORMATS.includes("url-only"), false);
assert.equal(YTQSCopy.FORMATS.includes("title-only"), false);
assert.equal(YTQSCopy.formatVideoInfo(info, "url-only"), 'A <Useful> "Video"\nhttps://www.youtube.com/watch?v=qRjSmLc2cOs');
assert.equal(YTQSCopy.formatVideoInfo(info, "channel-title-url"), `Test Channel\n${info.title}\n${info.url}`);
assert.equal(YTQSCopy.timestampUrl("https://www.youtube.com/shorts/qRjSmLc2cOs", 12), "https://www.youtube.com/shorts/qRjSmLc2cOs?t=12s");
assert.match(YTQSCopy.summarize("x".repeat(120)), /…$/);

const current = {
  schemaVersion: 2,
  language: "zh-Hant",
  global: { speed: 1, quality: "hd1080" },
  shorts: { speed: 1, quality: "hd1080" },
  shortsControls: { seekSeconds: 5 },
  copy: { defaultFormat: "title-url" },
  channels: { channelA: { name: "A" } }
};
const imported = {
  schemaVersion: 2,
  language: "en",
  global: { speed: 2, quality: "hd1080" },
  shorts: { speed: 1, quality: "hd1080" },
  shortsControls: { seekSeconds: 10 },
  copy: { defaultFormat: "markdown" },
  channels: { channelB: { name: "B" } }
};

const exported = YTQSSettingsTransfer.createExport(current, "1.6.0");
assert.equal(exported.schema, "youtube-quick-setting-settings");
assert.equal(exported.formatVersion, 2);
assert.equal(exported.extensionVersion, "1.6.0");
assert.deepEqual(YTQSSettingsTransfer.extractImport(exported).rawSettings, current);
assert.equal(YTQSSettingsTransfer.extractImport(current).formatVersion, 2);
assert.throws(() => YTQSSettingsTransfer.extractImport({ schema: "other", settings: {} }), /invalid-schema/);
assert.throws(() => YTQSSettingsTransfer.extractImport({ formatVersion: 99, settings: {} }), /newer-version/);

const merged = YTQSSettingsTransfer.mergeSettings(current, imported);
assert.deepEqual(Object.keys(merged.channels).sort(), ["channelA", "channelB"]);
assert.equal(merged.global.speed, 2);
const mergePreview = YTQSSettingsTransfer.preview(current, imported, "merge");
assert.deepEqual({ added: mergePreview.added, updated: mergePreview.updated, removed: mergePreview.removed, total: mergePreview.totalChannels }, { added: 1, updated: 0, removed: 0, total: 2 });
const replacePreview = YTQSSettingsTransfer.preview(current, imported, "replace");
assert.deepEqual({ added: replacePreview.added, updated: replacePreview.updated, removed: replacePreview.removed, total: replacePreview.totalChannels }, { added: 1, updated: 0, removed: 1, total: 1 });

console.log("COPY_AND_TRANSFER_TESTS_OK");
