const assert = require("node:assert/strict");

require("../date-utils.js");

assert.equal(YTQSDate.DEFAULT_FORMAT, "yyyy-MM-dd");
assert.equal(YTQSDate.normalizeFormat(""), "yyyy-MM-dd");
assert.equal(YTQSDate.normalizeFormat(" yyyy/MM/dd HH:mm "), "yyyy/MM/dd HH:mm");
assert.equal(YTQSDate.format("2026-09-02", "yyyy-MM-dd", "en"), "2026-09-02");
assert.equal(YTQSDate.format("2026-09-02T14:05:09", "dd/MM/yyyy HH:mm:ss", "en"), "02/09/2026 14:05:09");
assert.equal(YTQSDate.format("2026-09-02T14:05:09", "yy MMM dd hh:mm ap", "en"), "26 Sep 02 02:05 PM");
assert.equal(YTQSDate.extract('{"publishDate":"2026-09-02T14:05:09Z"}'), "2026-09-02T14:05:09Z");
assert.equal(YTQSDate.extract('<meta itemprop="uploadDate" content="2025-07-01">'), "2025-07-01");
assert.equal(YTQSDate.extract('{"publishDate":"invalid"}'), "");

console.log("DATE_UTILS_TESTS_OK");
