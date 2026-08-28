const YTQS_DISLIKE_ORIGIN = "https://returnyoutubedislikeapi.com/*";
const YTQS_DISLIKE_CACHE_TTL = 6 * 60 * 60 * 1000;
const YTQS_DISLIKE_ERROR_TTL = 10 * 60 * 1000;
const ytqsDislikeCache = new Map();
const ytqsDislikePending = new Map();
let ytqsDislikeCooldownUntil = 0;

function ytqsIsValidVideoId(value) {
  return typeof value === "string" && /^[A-Za-z0-9_-]{11}$/.test(value);
}

function ytqsNormalizeDislikeResponse(value) {
  const dislikes = Number(value?.dislikes);
  const likes = Number(value?.likes);
  const rating = Number(value?.rating);
  if (value?.deleted === true || !Number.isFinite(dislikes) || dislikes < 0) return null;
  return {
    dislikes: Math.round(dislikes),
    likes: Number.isFinite(likes) && likes >= 0 ? Math.round(likes) : null,
    rating: Number.isFinite(rating) ? rating : null
  };
}

async function ytqsFetchDislikeCount(videoId) {
  if (!ytqsIsValidVideoId(videoId)) return { ok: false, reason: "invalid-video" };
  const now = Date.now();
  const cached = ytqsDislikeCache.get(videoId);
  if (cached && cached.expiresAt > now) return cached.value;
  if (ytqsDislikeCooldownUntil > now) return { ok: false, reason: "rate-limited" };
  if (ytqsDislikePending.has(videoId)) return ytqsDislikePending.get(videoId);

  const request = (async () => {
    const granted = await chrome.permissions.contains({ origins: [YTQS_DISLIKE_ORIGIN] });
    if (!granted) return { ok: false, reason: "permission-required" };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${encodeURIComponent(videoId)}`, {
        credentials: "omit",
        referrerPolicy: "no-referrer",
        headers: { Accept: "application/json" },
        signal: controller.signal
      });
      if (response.status === 429) {
        ytqsDislikeCooldownUntil = Date.now() + YTQS_DISLIKE_ERROR_TTL;
        return { ok: false, reason: "rate-limited" };
      }
      if (!response.ok) return { ok: false, reason: `http-${response.status}` };
      const normalized = ytqsNormalizeDislikeResponse(await response.json());
      if (!normalized) return { ok: false, reason: "invalid-response" };
      const value = { ok: true, ...normalized };
      ytqsDislikeCache.set(videoId, { value, expiresAt: Date.now() + YTQS_DISLIKE_CACHE_TTL });
      return value;
    } catch {
      return { ok: false, reason: "network-error" };
    } finally {
      clearTimeout(timeout);
    }
  })();

  ytqsDislikePending.set(videoId, request);
  try {
    return await request;
  } finally {
    ytqsDislikePending.delete(videoId);
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "YTQS_GET_ESTIMATED_DISLIKES") return false;
  ytqsFetchDislikeCount(message.videoId).then(sendResponse);
  return true;
});
