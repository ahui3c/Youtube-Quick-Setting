const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const sourceFiles = [
  "manifest.json", "build-info.js", "instance-coordinator.js", "background.js", "popup.html", "popup.css", "popup.js", "content.js",
  "page-bridge.js", "copy-utils.js", "date-utils.js", "settings-transfer.js"
];
const digest = (filename) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, filename))).digest("hex");
const before = Object.fromEntries(sourceFiles.map((filename) => [filename, digest(filename)]));

execFileSync(process.execPath, [path.join(root, "scripts", "build-platforms.js"), "all"], { stdio: "pipe" });

for (const filename of sourceFiles) assert.equal(digest(filename), before[filename], `build changed source ${filename}`);

const sourceManifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const chromeManifest = JSON.parse(fs.readFileSync(path.join(root, "dist-chrome", "manifest.json"), "utf8"));
assert.deepEqual(chromeManifest, sourceManifest);
for (const filename of sourceFiles.filter((filename) => filename !== "build-info.js")) {
  assert.deepEqual(fs.readFileSync(path.join(root, "dist-chrome", filename)), fs.readFileSync(path.join(root, filename)));
}
assert.match(fs.readFileSync(path.join(root, "dist-chrome", "build-info.js"), "utf8"), /chrome-web-store/);

const firefoxManifest = JSON.parse(fs.readFileSync(path.join(root, "dist-firefox", "manifest.json"), "utf8"));
assert.equal(firefoxManifest.manifest_version, 3);
assert.equal(firefoxManifest.browser_specific_settings.gecko.id, "youtube-quick-settings-toolbox@ahui3c.com");
assert.equal(firefoxManifest.browser_specific_settings.gecko.strict_min_version, "142.0");
assert.deepEqual(firefoxManifest.browser_specific_settings.gecko.data_collection_permissions.required, ["none"]);
assert.deepEqual(firefoxManifest.background.scripts, ["background.js"]);
assert.match(fs.readFileSync(path.join(root, "dist-firefox", "build-info.js"), "utf8"), /mozilla-add-ons/);
for (const filename of ["popup.js", "content.js"]) {
  const output = fs.readFileSync(path.join(root, "dist-firefox", filename), "utf8");
  assert.match(output, /\bbrowser\./);
  assert.doesNotMatch(output, /\bchrome\./);
}

const safariManifest = JSON.parse(fs.readFileSync(path.join(root, "dist-safari", "manifest.json"), "utf8"));
assert.equal(safariManifest.browser_specific_settings.safari.strict_min_version, "17.0");
assert.match(fs.readFileSync(path.join(root, "dist-safari", "content.js"), "utf8"), /\bbrowser\./);

console.log("platform-build tests passed");
