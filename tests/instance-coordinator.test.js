const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("instance-coordinator.js", "utf8"), sandbox);
const coordinator = sandbox.YTQSInstanceCoordinator;

assert.equal(coordinator.OFFICIAL_CHROME_EXTENSION_ID, "ababphalnahfigfafmaamnpnlbhnjnhl");
assert.equal(coordinator.compareVersions("2.0.1", "2.0.0"), 1);
assert.equal(coordinator.compareVersions("2.0.1", "2.0.1.0"), 0);
assert.equal(coordinator.compareVersions("1.9.9", "2.0.0"), -1);
assert.equal(coordinator.classifyDistribution(coordinator.OFFICIAL_CHROME_EXTENSION_ID, "development"), "chrome-web-store");
assert.equal(coordinator.classifyDistribution("bcdefghijklmnopabcdefghijklmnopa", "chrome-web-store"), "development");

const store = { extensionId: coordinator.OFFICIAL_CHROME_EXTENSION_ID, version: "2.0.1", distribution: "chrome-web-store" };
const development = { extensionId: "bcdefghijklmnopabcdefghijklmnopa", version: "2.0.1", distribution: "development" };
assert.equal(coordinator.preferredInstance(store, development), development);
assert.equal(coordinator.preferredInstance({ ...store, version: "2.0.2" }, development).version, "2.0.2");
assert.equal(coordinator.preferredInstance(store, { ...development, version: "2.0.0" }), store);

console.log("instance-coordinator tests passed");
