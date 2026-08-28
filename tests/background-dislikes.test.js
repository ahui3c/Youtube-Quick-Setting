const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

let source = fs.readFileSync("background.js", "utf8");
source += "\nthis.__backgroundTest = { ytqsIsValidVideoId, ytqsNormalizeDislikeResponse };";
let listener = null;
let fetchCalls = 0;
const sandbox = {
  Map,
  Number,
  Date,
  AbortController,
  setTimeout,
  clearTimeout,
  encodeURIComponent,
  chrome: {
    permissions: { contains: async () => true },
    runtime: { onMessage: { addListener(callback) { listener = callback; } } }
  },
  fetch: async (url, options) => {
    fetchCalls += 1;
    assert.match(url, /videoId=qRjSmLc2cOs$/);
    assert.equal(options.credentials, "omit");
    assert.equal(options.referrerPolicy, "no-referrer");
    return {
      ok: true,
      status: 200,
      json: async () => ({ dislikes: 321, likes: 1000, rating: 4.1, deleted: false })
    };
  }
};
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: "background.js" });

const api = sandbox.__backgroundTest;
assert.equal(api.ytqsIsValidVideoId("qRjSmLc2cOs"), true);
assert.equal(api.ytqsIsValidVideoId("bad"), false);
assert.deepEqual(
  JSON.parse(JSON.stringify(api.ytqsNormalizeDislikeResponse({ dislikes: 1234.4, likes: 99, rating: 4.5, deleted: false }))),
  { dislikes: 1234, likes: 99, rating: 4.5 }
);
assert.equal(api.ytqsNormalizeDislikeResponse({ dislikes: -1 }), null);
assert.equal(api.ytqsNormalizeDislikeResponse({ dislikes: 1, deleted: true }), null);

(async () => {
  assert.equal(typeof listener, "function");
  const callListener = () => new Promise((resolve) => {
    assert.equal(listener({ type: "YTQS_GET_ESTIMATED_DISLIKES", videoId: "qRjSmLc2cOs" }, {}, resolve), true);
  });
  const first = await callListener();
  const second = await callListener();
  assert.deepEqual(JSON.parse(JSON.stringify(first)), { ok: true, dislikes: 321, likes: 1000, rating: 4.1 });
  assert.deepEqual(JSON.parse(JSON.stringify(second)), { ok: true, dislikes: 321, likes: 1000, rating: 4.1 });
  assert.equal(fetchCalls, 1, "successful API responses should be cached");
  console.log("BACKGROUND_DISLIKE_TESTS_OK");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
