const YTQS_DEFAULTS = {
  language: "system",
  global: { speed: 1, quality: "hd1080", premiumQualityEnabled: false, theaterModeEnabled: false },
  shorts: { speed: 1, quality: "hd1080", premiumQualityEnabled: false },
  shortsControls: { seekSeconds: 5, arrowKeysEnabled: true, channelNamesEnabled: true },
  channels: {}
};
const YTQS_SPEEDS = [0.7, 1, 1.25, 2, 3];
const YTQS_SEEK_SECONDS = [3, 5, 10];
const YTQS_THEATER_OVERRIDES = ["inherit", "on", "off"];
let ytqsSettings = YTQS_DEFAULTS;
let ytqsContext = { isVideo: false, contentType: "regular", channelId: "", channelName: "" };
let ytqsRefreshTimer = 0;
let ytqsLastChannelNoticeKey = "";
let ytqsLastNavigationVideoId = "";
let ytqsShortsScanTimer = 0;
let ytqsShortsMutationObserver = null;
let ytqsShortsIntersectionObserver = null;
let ytqsShortsMetadataRequests = 0;
const ytqsShortsMetadataCache = new Map();
const ytqsShortsMetadataPending = new Map();
const ytqsShortsMetadataQueue = [];

const YTQS_QUALITY_LABELS = {
  highest: "自動最高",
  hd2160: "4K",
  hd1080: "1080p"
};

const YTQS_MESSAGES = {
  "zh-Hant": { channelSettings: "頻道指定設定", speed: "速度", quality: "解析度", playbackSpeed: "播放速度", seconds: "秒", backToStart: "回到片頭", copiedVideoInfo: "已複製影片資訊", copyFailed: "複製失敗" },
  en: { channelSettings: "Channel settings", speed: "Speed", quality: "Quality", playbackSpeed: "Playback speed", seconds: "sec", backToStart: "Back to start", copiedVideoInfo: "Video info copied", copyFailed: "Copy failed" },
  ja: { channelSettings: "チャンネル設定", speed: "速度", quality: "画質", playbackSpeed: "再生速度", seconds: "秒", backToStart: "先頭に戻る", copiedVideoInfo: "動画情報をコピーしました", copyFailed: "コピーに失敗しました" }
};

function ytqsNormalizeProfile(value, fallback = YTQS_DEFAULTS.global) {
  return {
    speed: YTQS_SPEEDS.includes(Number(value?.speed)) ? Number(value.speed) : fallback.speed,
    quality: Object.hasOwn(YTQS_QUALITY_LABELS, value?.quality) ? value.quality : fallback.quality,
    premiumQualityEnabled: value?.premiumQualityEnabled === true
  };
}

function ytqsNormalizeSettings(value) {
  const global = {
    ...ytqsNormalizeProfile(value?.global),
    theaterModeEnabled: value?.global?.theaterModeEnabled === true
  };
  const shorts = ytqsNormalizeProfile(value?.shorts, global);
  const channels = {};
  if (value?.channels && typeof value.channels === "object") {
    Object.entries(value.channels).forEach(([id, channel]) => {
      const legacy = ytqsNormalizeProfile(channel, global);
      channels[id] = {
        name: channel?.name || "",
        regular: {
          ...ytqsNormalizeProfile(channel?.regular, legacy),
          theaterModeOverride: YTQS_THEATER_OVERRIDES.includes(channel?.regular?.theaterModeOverride)
            ? channel.regular.theaterModeOverride
            : "inherit"
        },
        shorts: ytqsNormalizeProfile(channel?.shorts, legacy)
      };
    });
  }
  return {
    language: ["system", "zh-Hant", "en", "ja"].includes(value?.language) ? value.language : "system",
    global,
    shorts,
    shortsControls: {
      seekSeconds: YTQS_SEEK_SECONDS.includes(Number(value?.shortsControls?.seekSeconds)) ? Number(value.shortsControls.seekSeconds) : 5,
      arrowKeysEnabled: value?.shortsControls?.arrowKeysEnabled !== false,
      channelNamesEnabled: value?.shortsControls?.channelNamesEnabled !== false
    },
    channels
  };
}

function ytqsLanguage() {
  const selected = ytqsSettings.language;
  if (selected && selected !== "system") return selected;
  const system = chrome.i18n?.getUILanguage?.() || navigator.language || "en";
  if (system.toLowerCase().startsWith("zh")) return "zh-Hant";
  if (system.toLowerCase().startsWith("ja")) return "ja";
  return "en";
}

function ytqsText(key) {
  return YTQS_MESSAGES[ytqsLanguage()]?.[key] || YTQS_MESSAGES.en[key] || key;
}

function injectPageBridge() {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("page-bridge.js");
  script.dataset.ytQuickSetting = "bridge";
  (document.head || document.documentElement).append(script);
  script.addEventListener("load", () => script.remove());
}

function contentType() {
  return /^\/shorts\/[^/]+/.test(location.pathname) ? "shorts" : "regular";
}

function isVideoPage() {
  return (location.pathname === "/watch" && new URLSearchParams(location.search).has("v")) || contentType() === "shorts";
}

function readChannelContext() {
  const type = contentType();
  if (!isVideoPage()) return { isVideo: false, contentType: type, channelId: "", channelName: "", videoTitle: "", videoUrl: "" };
  const activeReel = type === "shorts" ? activeShortVideo()?.closest("ytd-reel-video-renderer") : null;
  const channelLink = type === "shorts"
    ? activeReel?.querySelector("#channel-name a, a[href^='/@'], a[href^='/channel/']")
    : document.querySelector("ytd-watch-metadata #channel-name a, #owner #channel-name a");
  const href = channelLink?.getAttribute("href") || "";
  const channelIdMeta = document.querySelector('meta[itemprop="channelId"]')?.content || "";
  // The visible owner link updates with YouTube SPA navigation; head metadata can lag behind.
  const channelPath = href.match(/^\/(?:channel\/[^/?]+|@[^/?]+)/)?.[0] || "";
  const channelId = href.match(/\/channel\/([^/?]+)/)?.[1] || channelPath || channelIdMeta;
  const channelName = channelLink?.textContent?.trim() || document.querySelector('link[itemprop="name"]')?.getAttribute("content") || "";
  const videoInfo = currentVideoInfo();
  return { isVideo: true, contentType: type, channelId, channelName, videoTitle: videoInfo?.title || "", videoUrl: videoInfo?.url || "" };
}

function effectiveSettings() {
  const channel = ytqsContext.channelId && ytqsSettings.channels?.[ytqsContext.channelId];
  const profile = channel
    ? channel[ytqsContext.contentType] || channel.regular
    : ytqsContext.contentType === "shorts" ? ytqsSettings.shorts : ytqsSettings.global;
  if (ytqsContext.contentType === "shorts") return profile;
  const override = channel?.regular?.theaterModeOverride || "inherit";
  const theaterMode = override === "on"
    ? true
    : override === "off"
      ? false
      : ytqsSettings.global.theaterModeEnabled === true ? true : null;
  return { ...profile, theaterMode };
}

function currentVideoId() {
  return new URLSearchParams(location.search).get("v") || location.pathname;
}

function currentVideoInfo() {
  if (!isVideoPage()) return null;
  const type = contentType();
  const videoId = type === "shorts"
    ? location.pathname.match(/^\/shorts\/([A-Za-z0-9_-]{11})/)?.[1] || ""
    : new URLSearchParams(location.search).get("v") || "";
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) return null;
  const activeReel = type === "shorts" ? activeShortVideo()?.closest("ytd-reel-video-renderer") : null;
  const visibleTitle = type === "shorts"
    ? activeReel?.querySelector("#overlay #description, #video-title, h2")?.textContent?.trim()
    : document.querySelector("ytd-watch-metadata h1 yt-formatted-string, ytd-watch-metadata h1")?.textContent?.trim();
  const metadataTitle = document.querySelector('meta[name="title"], meta[property="og:title"]')?.getAttribute("content")?.trim();
  const documentTitle = document.title?.replace(/\s+-\s+YouTube\s*$/i, "").trim();
  const title = visibleTitle || metadataTitle || documentTitle || videoId;
  const url = type === "shorts"
    ? `https://www.youtube.com/shorts/${videoId}`
    : `https://www.youtube.com/watch?v=${videoId}`;
  return { title, url, text: `${title}\n${url}` };
}

function activeShortVideo() {
  const videos = [...document.querySelectorAll("ytd-reel-video-renderer video, ytd-shorts video")];
  return videos.find((video) => {
    const rect = video.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && !video.paused;
  }) || videos.find((video) => {
    const rect = video.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
}

function currentPlayer() {
  if (contentType() === "shorts") {
    const video = activeShortVideo();
    return video?.closest("ytd-reel-video-renderer")?.querySelector("#shorts-player, #movie_player") || video?.parentElement;
  }
  return document.querySelector("#movie_player");
}

function currentVideo() {
  if (contentType() === "shorts") return activeShortVideo();
  return currentPlayer()?.querySelector("video.html5-main-video, video") || document.querySelector("video.html5-main-video, video");
}

function showChannelSettingsNotice(channelSettings) {
  const noticeKey = [
    currentVideoId(),
    ytqsContext.contentType,
    ytqsContext.channelId,
    channelSettings.speed,
    channelSettings.quality
  ].join("|");
  if (noticeKey === ytqsLastChannelNoticeKey) return;
  ytqsLastChannelNoticeKey = noticeKey;

  let style = document.querySelector("#ytqs-channel-settings-style");
  if (!style) {
    style = document.createElement("style");
    style.id = "ytqs-channel-settings-style";
    style.textContent = `
      #ytqs-channel-settings-notice{position:absolute;z-index:70;right:18px;bottom:72px;display:grid;grid-template-columns:3px 1fr;column-gap:12px;min-width:218px;padding:12px 15px 12px 12px;border:1px solid rgba(255,255,255,.18);border-radius:11px;background:rgba(17,18,21,.92);box-shadow:0 12px 36px rgba(0,0,0,.42);color:#fff;font-family:Roboto,"Microsoft JhengHei UI",sans-serif;opacity:0;transform:translateY(8px);pointer-events:none;backdrop-filter:blur(10px);transition:opacity .16s ease,transform .16s ease}
      #ytqs-channel-settings-notice.ytqs-channel-show{opacity:1;transform:translateY(0)}
      #ytqs-channel-settings-notice .ytqs-channel-accent{grid-row:1/3;width:3px;border-radius:3px;background:#ff3b30}
      #ytqs-channel-settings-notice .ytqs-channel-title{color:#b7b9be;font-size:11px;font-weight:600;line-height:1.2;letter-spacing:.04em}
      #ytqs-channel-settings-notice .ytqs-channel-values{display:flex;align-items:baseline;gap:7px;margin-top:5px;white-space:nowrap}
      #ytqs-channel-settings-notice .ytqs-channel-label{color:#8f9197;font-size:10px}
      #ytqs-channel-settings-notice strong{color:#fff;font-size:14px;font-weight:700}
      #ytqs-channel-settings-notice .ytqs-channel-divider{width:3px;height:3px;margin:0 2px;border-radius:50%;background:#ff3b30}
      #movie_player.ytp-fullscreen #ytqs-channel-settings-notice{right:28px;bottom:96px;transform:translateY(10px) scale(1.08);transform-origin:right bottom}
      #movie_player.ytp-fullscreen #ytqs-channel-settings-notice.ytqs-channel-show{transform:translateY(0) scale(1.08)}
      #ytqs-channel-settings-notice.ytqs-channel-fixed{position:fixed;right:24px;bottom:28px}
      @media(max-width:600px){#ytqs-channel-settings-notice{right:10px;bottom:58px;min-width:190px;padding:10px 12px 10px 10px}}
      @media(prefers-reduced-motion:reduce){#ytqs-channel-settings-notice{transition:none}}
    `;
    document.documentElement.append(style);
  }

  document.querySelector("#ytqs-channel-settings-notice")?.remove();
  const notice = document.createElement("div");
  notice.id = "ytqs-channel-settings-notice";
  notice.setAttribute("role", "status");
  notice.setAttribute("aria-live", "polite");
  notice.innerHTML = `
    <span class="ytqs-channel-accent" aria-hidden="true"></span>
    <span class="ytqs-channel-title">${ytqsText("channelSettings")}</span>
    <span class="ytqs-channel-values">
      <span class="ytqs-channel-label">${ytqsText("speed")}</span>
      <strong>${Number(channelSettings.speed)}×</strong>
      <span class="ytqs-channel-divider" aria-hidden="true"></span>
      <span class="ytqs-channel-label">${ytqsText("quality")}</span>
      <strong>${YTQS_QUALITY_LABELS[channelSettings.quality] || channelSettings.quality}</strong>
    </span>
  `;

  const player = currentPlayer();
  if (player) {
    player.append(notice);
  } else {
    notice.classList.add("ytqs-channel-fixed");
    document.documentElement.append(notice);
  }

  requestAnimationFrame(() => notice.classList.add("ytqs-channel-show"));
  clearTimeout(showChannelSettingsNotice.timer);
  showChannelSettingsNotice.timer = setTimeout(() => {
    notice.classList.remove("ytqs-channel-show");
    setTimeout(() => notice.remove(), 180);
  }, 2000);
}

function applySettings() {
  if (!ytqsContext.isVideo) return;
  const channel = ytqsContext.channelId && ytqsSettings.channels?.[ytqsContext.channelId];
  const channelSettings = channel?.[ytqsContext.contentType] || channel?.regular;
  window.postMessage({
    source: "yt-quick-setting-extension",
    type: "APPLY_SETTINGS",
    settings: effectiveSettings()
  }, location.origin);
  if (channelSettings) showChannelSettingsNotice(channelSettings);
}

function refreshContextAndApply(attempt = 0) {
  const next = readChannelContext();
  ytqsContext = next;
  if (next.isVideo && !next.channelId && attempt < 8) {
    clearTimeout(ytqsRefreshTimer);
    ytqsRefreshTimer = setTimeout(() => refreshContextAndApply(attempt + 1), 500);
    return;
  }
  applySettings();
}

function scheduleRefresh() {
  clearTimeout(ytqsRefreshTimer);
  const videoId = currentVideoId();
  if (videoId !== ytqsLastNavigationVideoId) {
    ytqsLastNavigationVideoId = videoId;
    ytqsLastChannelNoticeKey = "";
  }
  ytqsContext = { isVideo: isVideoPage(), contentType: contentType(), channelId: "", channelName: "" };
  ytqsRefreshTimer = setTimeout(() => refreshContextAndApply(0), 250);
}

function ytqsShortsVideoId(card) {
  const href = card?.querySelector?.('a[href^="/shorts/"]')?.getAttribute("href") || "";
  return href.match(/^\/shorts\/([^/?]+)/)?.[1] || "";
}

function ytqsNormalizeShortsAuthor(value) {
  const name = typeof value?.author_name === "string" ? value.author_name.trim() : "";
  if (!name || typeof value?.author_url !== "string") return null;
  try {
    const url = new URL(value.author_url, location.origin);
    const validHost = url.hostname === "youtube.com" || url.hostname === "www.youtube.com";
    const validPath = /^\/(?:@|channel\/|c\/|user\/)/.test(url.pathname);
    if (url.protocol !== "https:" || !validHost || !validPath) return null;
    return { name, href: `${url.pathname}${url.search}` };
  } catch {
    return null;
  }
}

async function ytqsLoadShortsAuthor(videoId) {
  const response = await fetch(`/oembed?url=${encodeURIComponent(`https://www.youtube.com/shorts/${videoId}`)}&format=json`, {
    credentials: "omit",
    headers: { Accept: "application/json" }
  });
  if (!response.ok) return null;
  return ytqsNormalizeShortsAuthor(await response.json());
}

function ytqsPumpShortsMetadataQueue() {
  while (ytqsShortsMetadataRequests < 4 && ytqsShortsMetadataQueue.length) {
    const task = ytqsShortsMetadataQueue.shift();
    ytqsShortsMetadataRequests += 1;
    ytqsLoadShortsAuthor(task.videoId)
      .catch(() => null)
      .then((author) => {
        ytqsShortsMetadataCache.set(task.videoId, author);
        task.resolve(author);
      })
      .finally(() => {
        ytqsShortsMetadataRequests -= 1;
        ytqsShortsMetadataPending.delete(task.videoId);
        ytqsPumpShortsMetadataQueue();
      });
  }
}

function ytqsGetShortsAuthor(videoId) {
  if (ytqsShortsMetadataCache.has(videoId)) return Promise.resolve(ytqsShortsMetadataCache.get(videoId));
  if (ytqsShortsMetadataPending.has(videoId)) return ytqsShortsMetadataPending.get(videoId);
  const request = new Promise((resolve) => {
    ytqsShortsMetadataQueue.push({ videoId, resolve });
    ytqsPumpShortsMetadataQueue();
  });
  ytqsShortsMetadataPending.set(videoId, request);
  return request;
}

function ytqsInstallShortsChannelStyle() {
  if (document.querySelector("#ytqs-shorts-channel-style")) return;
  const style = document.createElement("style");
  style.id = "ytqs-shorts-channel-style";
  style.textContent = `
    .ytqs-shorts-channel-name{display:block;max-width:calc(100% - 36px);margin:3px 36px 0 0;color:var(--yt-spec-text-secondary,#606060);font-family:Roboto,Arial,sans-serif;font-size:1.4rem;font-weight:400;line-height:2rem;overflow:hidden;text-decoration:none;text-overflow:ellipsis;white-space:nowrap}
    .ytqs-shorts-channel-name:hover{color:var(--yt-spec-text-primary,#0f0f0f);text-decoration:none}
  `;
  document.documentElement.append(style);
}

function ytqsDeduplicateShortsChannelNames(card, videoId) {
  const markers = [...card.querySelectorAll(".ytqs-shorts-channel-name")];
  const current = markers.find((marker) => marker.dataset.videoId === videoId) || null;
  markers.forEach((marker) => {
    if (marker !== current) marker.remove();
  });
  return current;
}

async function ytqsRenderShortsChannelName(card) {
  if (!card?.isConnected || location.pathname !== "/" || ytqsSettings.shortsControls.channelNamesEnabled === false) return;
  const videoId = ytqsShortsVideoId(card);
  if (!videoId) return;
  if (ytqsDeduplicateShortsChannelNames(card, videoId)) return;
  if (card.dataset.ytqsChannelRequest === videoId) return;
  card.dataset.ytqsChannelRequest = videoId;
  try {
    const author = await ytqsGetShortsAuthor(videoId);
    if (!author || !card.isConnected || ytqsShortsVideoId(card) !== videoId || ytqsSettings.shortsControls.channelNamesEnabled === false) return;
    // YouTube can rerender and rescan the same card while metadata is pending.
    // Recheck after the await so only one of those asynchronous paths inserts.
    if (ytqsDeduplicateShortsChannelNames(card, videoId)) return;
    const subhead = card.querySelector(".shortsLockupViewModelHostOutsideMetadataSubhead");
    if (!subhead?.parentElement) return;
    const link = document.createElement("a");
    link.className = "ytqs-shorts-channel-name";
    link.dataset.videoId = videoId;
    link.href = author.href;
    link.textContent = author.name;
    link.title = author.name;
    subhead.parentElement.insertBefore(link, subhead);
  } finally {
    if (card.dataset.ytqsChannelRequest === videoId) delete card.dataset.ytqsChannelRequest;
  }
}

function ytqsScanShortsCards() {
  const enabled = location.pathname === "/" && ytqsSettings.shortsControls.channelNamesEnabled !== false;
  if (!enabled) {
    document.querySelectorAll(".ytqs-shorts-channel-name").forEach((element) => element.remove());
    return;
  }
  ytqsInstallShortsChannelStyle();
  document.querySelectorAll("ytm-shorts-lockup-view-model-v2").forEach((card) => {
    ytqsShortsIntersectionObserver?.observe(card);
    const rect = card.getBoundingClientRect();
    if (rect.bottom >= -600 && rect.top <= innerHeight + 600) ytqsRenderShortsChannelName(card);
  });
}

function ytqsScheduleShortsCardScan() {
  clearTimeout(ytqsShortsScanTimer);
  ytqsShortsScanTimer = setTimeout(ytqsScanShortsCards, 180);
}

function ytqsInstallShortsCardObservers() {
  if (ytqsShortsMutationObserver) return;
  if (!document.documentElement) {
    document.addEventListener("DOMContentLoaded", ytqsInstallShortsCardObservers, { once: true });
    return;
  }
  ytqsShortsIntersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) ytqsRenderShortsChannelName(entry.target);
    });
  }, { rootMargin: "600px 0px" });
  ytqsShortsMutationObserver = new MutationObserver(ytqsScheduleShortsCardScan);
  ytqsShortsMutationObserver.observe(document.documentElement, { childList: true, subtree: true });
  ytqsScheduleShortsCardScan();
}

function isTypingTarget(target) {
  return target instanceof HTMLElement && (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
    Boolean(target.closest("input, textarea, select, [contenteditable='true']"))
  );
}

function showSpeedOverlay(speed) {
  let overlay = document.querySelector("#ytqs-speed-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "ytqs-speed-overlay";
    overlay.innerHTML = '<span class="ytqs-speed-icon">▶▶</span><span class="ytqs-speed-value"></span><span class="ytqs-speed-label"></span>';
    const style = document.createElement("style");
    style.textContent = `
      #ytqs-speed-overlay{position:fixed;z-index:2147483647;left:50%;top:24%;transform:translate(-50%,-8px);display:grid;grid-template-columns:auto auto;align-items:center;gap:2px 10px;min-width:158px;padding:14px 18px;border:1px solid rgba(255,255,255,.2);border-radius:12px;background:rgba(16,16,18,.9);box-shadow:0 14px 45px rgba(0,0,0,.4);color:#fff;font-family:Roboto,"Microsoft JhengHei UI",sans-serif;opacity:0;pointer-events:none;transition:opacity .15s ease,transform .15s ease;backdrop-filter:blur(8px)}
      #ytqs-speed-overlay.ytqs-show{opacity:1;transform:translate(-50%,0)}
      #ytqs-speed-overlay .ytqs-speed-icon{grid-row:1/3;color:#ff3b30;font-size:15px;letter-spacing:-3px}
      #ytqs-speed-overlay .ytqs-speed-value{font-size:22px;font-weight:700;line-height:1}
      #ytqs-speed-overlay .ytqs-speed-label{color:#b7b7ba;font-size:11px;line-height:1.1}
      @media(prefers-reduced-motion:reduce){#ytqs-speed-overlay{transition:none}}
    `;
    document.documentElement.append(style, overlay);
  }
  overlay.querySelector(".ytqs-speed-icon").textContent = "▶▶";
  overlay.querySelector(".ytqs-speed-value").textContent = `${speed}×`;
  overlay.querySelector(".ytqs-speed-label").textContent = ytqsText("playbackSpeed");
  overlay.classList.remove("ytqs-show");
  void overlay.offsetWidth;
  overlay.classList.add("ytqs-show");
  clearTimeout(showSpeedOverlay.timer);
  showSpeedOverlay.timer = setTimeout(() => overlay.classList.remove("ytqs-show"), 1050);
}

function formatPlaybackTime(value) {
  const totalSeconds = Math.max(0, Math.floor(Number(value) || 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function showSeekOverlay(deltaSeconds, currentTime, duration) {
  let overlay = document.querySelector("#ytqs-speed-overlay");
  if (!overlay) {
    showSpeedOverlay(1);
    overlay = document.querySelector("#ytqs-speed-overlay");
  }
  if (!overlay) return;
  const isReset = deltaSeconds === 0;
  overlay.querySelector(".ytqs-speed-icon").textContent = isReset ? "↶" : deltaSeconds > 0 ? "▶▶" : "◀◀";
  overlay.querySelector(".ytqs-speed-value").textContent = isReset
    ? formatPlaybackTime(currentTime)
    : `${deltaSeconds > 0 ? "+" : "−"}${Math.abs(deltaSeconds)} ${ytqsText("seconds")}`;
  overlay.querySelector(".ytqs-speed-label").textContent = isReset
    ? ytqsText("backToStart")
    : `${formatPlaybackTime(currentTime)} / ${formatPlaybackTime(duration)}`;
  overlay.classList.remove("ytqs-show");
  void overlay.offsetWidth;
  overlay.classList.add("ytqs-show");
  clearTimeout(showSpeedOverlay.timer);
  showSpeedOverlay.timer = setTimeout(() => overlay.classList.remove("ytqs-show"), 1050);
}

function showCopyOverlay(success, title = "") {
  let overlay = document.querySelector("#ytqs-copy-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "ytqs-copy-overlay";
    overlay.innerHTML = '<span class="ytqs-copy-icon"></span><span class="ytqs-copy-value"></span><span class="ytqs-copy-title"></span>';
    const style = document.createElement("style");
    style.textContent = `
      #ytqs-copy-overlay{position:fixed;z-index:2147483647;left:50%;top:24%;transform:translate(-50%,-8px);display:grid;grid-template-columns:28px minmax(0,1fr);align-items:center;column-gap:10px;min-width:230px;max-width:min(440px,calc(100vw - 32px));padding:13px 17px;border:1px solid rgba(255,255,255,.2);border-radius:12px;background:rgba(16,16,18,.92);box-shadow:0 14px 45px rgba(0,0,0,.4);color:#fff;font-family:Roboto,"Microsoft JhengHei UI",sans-serif;opacity:0;pointer-events:none;transition:opacity .15s ease,transform .15s ease;backdrop-filter:blur(8px)}
      #ytqs-copy-overlay.ytqs-show{opacity:1;transform:translate(-50%,0)}
      #ytqs-copy-overlay .ytqs-copy-icon{grid-row:1/3;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#31b879;color:#fff;font-size:16px;font-weight:800}
      #ytqs-copy-overlay.ytqs-copy-error .ytqs-copy-icon{background:#ff3b30}
      #ytqs-copy-overlay .ytqs-copy-value{font-size:14px;font-weight:700;line-height:1.3}
      #ytqs-copy-overlay .ytqs-copy-title{overflow:hidden;color:#b7b7ba;font-size:11px;line-height:1.35;text-overflow:ellipsis;white-space:nowrap}
      @media(prefers-reduced-motion:reduce){#ytqs-copy-overlay{transition:none}}
    `;
    document.documentElement.append(style, overlay);
  }
  overlay.classList.toggle("ytqs-copy-error", !success);
  overlay.querySelector(".ytqs-copy-icon").textContent = success ? "✓" : "!";
  overlay.querySelector(".ytqs-copy-value").textContent = ytqsText(success ? "copiedVideoInfo" : "copyFailed");
  overlay.querySelector(".ytqs-copy-title").textContent = title;
  overlay.classList.remove("ytqs-show");
  void overlay.offsetWidth;
  overlay.classList.add("ytqs-show");
  clearTimeout(showCopyOverlay.timer);
  showCopyOverlay.timer = setTimeout(() => overlay.classList.remove("ytqs-show"), 1600);
}

async function writeClipboardText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy copy path for older Chromium versions.
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
    document.documentElement.append(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}

async function copyCurrentVideoInfo() {
  const info = currentVideoInfo();
  if (!info) {
    showCopyOverlay(false);
    return false;
  }
  const copied = await writeClipboardText(info.text);
  showCopyOverlay(copied, info.title);
  return copied;
}

function seekShorts(deltaSeconds) {
  if (contentType() !== "shorts") return false;
  const video = currentVideo();
  const duration = Number(video?.duration);
  const player = currentPlayer();
  if (!video || !Number.isFinite(duration) || duration <= 0 || player?.classList?.contains("ad-showing")) return false;
  const current = Number(video.currentTime) || 0;
  const next = deltaSeconds === 0 ? 0 : Math.min(duration, Math.max(0, current + deltaSeconds));
  video.currentTime = next;
  showSeekOverlay(deltaSeconds, next, duration);
  return true;
}

function adjustSpeed(direction) {
  const video = currentVideo();
  if (!video) return false;
  const current = Number(video.playbackRate) || 1;
  let index;
  if (direction > 0) {
    index = YTQS_SPEEDS.findIndex((speed) => speed > current + 0.001);
    if (index === -1) index = YTQS_SPEEDS.length - 1;
  } else {
    index = [...YTQS_SPEEDS].reverse().findIndex((speed) => speed < current - 0.001);
    index = index === -1 ? 0 : YTQS_SPEEDS.length - 1 - index;
  }
  const next = YTQS_SPEEDS[index];
  window.postMessage({
    source: "yt-quick-setting-extension",
    type: "SET_SESSION_SPEED",
    speed: next
  }, location.origin);
  // Let the MAIN-world bridge update YouTube's own player state first. If the
  // bridge is unavailable, retain a short-delay media-element fallback.
  setTimeout(() => {
    if (Math.abs(video.playbackRate - next) > 0.001) {
      video.defaultPlaybackRate = next;
      video.playbackRate = next;
    }
  }, 80);
  showSpeedOverlay(next);
  return true;
}

function restoreNormalSpeed() {
  const video = currentVideo();
  if (!video) return false;
  const speed = 1;
  window.postMessage({
    source: "yt-quick-setting-extension",
    type: "SET_SESSION_SPEED",
    speed
  }, location.origin);
  setTimeout(() => {
    if (Math.abs(video.playbackRate - speed) > 0.001) {
      video.defaultPlaybackRate = speed;
      video.playbackRate = speed;
    }
  }, 80);
  showSpeedOverlay(speed);
  return true;
}

function isSeekBlockedTarget(target) {
  return target instanceof HTMLElement && Boolean(target.closest("button, a, [role='button'], [role='menu'], [role='menuitem'], [role='slider']"));
}

function handleKeyboardShortcut(event) {
  if (!isVideoPage() || event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey || isTypingTarget(event.target)) return false;
  const isShorts = contentType() === "shorts";
  const shortsControls = ytqsSettings.shortsControls || YTQS_DEFAULTS.shortsControls;
  const isSeekBackward = isShorts && shortsControls.arrowKeysEnabled && event.key === "ArrowLeft";
  const isSeekForward = isShorts && shortsControls.arrowKeysEnabled && event.key === "ArrowRight";
  const isSeekStart = isShorts && (event.key === "0" || event.code === "Numpad0");
  const isPlus = event.key === "+" || event.code === "NumpadAdd";
  const isMinus = event.key === "-" || event.key === "−" || event.code === "NumpadSubtract";
  const isReset = event.key === "*" || event.code === "NumpadMultiply";
  const isCopy = event.code === "KeyS" || event.key?.toLowerCase() === "s";
  if (!isSeekBackward && !isSeekForward && !isSeekStart && !isPlus && !isMinus && !isReset && !isCopy) return false;
  if (event.repeat && !isSeekBackward && !isSeekForward) return false;
  if ((isSeekBackward || isSeekForward || isSeekStart) && isSeekBlockedTarget(event.target)) return false;
  const handled = isCopy
    ? (copyCurrentVideoInfo(), true)
    : isSeekStart
    ? seekShorts(0)
    : isSeekBackward
      ? seekShorts(-shortsControls.seekSeconds)
      : isSeekForward
        ? seekShorts(shortsControls.seekSeconds)
        : isReset
          ? restoreNormalSpeed()
          : adjustSpeed(isPlus ? 1 : -1);
  if (handled) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  return handled;
}

document.addEventListener("keydown", (event) => {
  handleKeyboardShortcut(event);
}, true);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "YTQS_GET_CONTEXT") {
    ytqsContext = readChannelContext();
    sendResponse(ytqsContext);
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync" || !changes.ytQuickSettings) return;
  ytqsSettings = ytqsNormalizeSettings(changes.ytQuickSettings.newValue);
  refreshContextAndApply();
  ytqsScheduleShortsCardScan();
});

injectPageBridge();
chrome.storage.sync.get("ytQuickSettings", (stored) => {
  ytqsSettings = ytqsNormalizeSettings(stored.ytQuickSettings);
  scheduleRefresh();
  ytqsInstallShortsCardObservers();
});

document.addEventListener("yt-navigate-finish", scheduleRefresh, true);
document.addEventListener("yt-page-data-updated", scheduleRefresh, true);
document.addEventListener("yt-navigate-finish", ytqsScheduleShortsCardScan, true);
document.addEventListener("yt-page-data-updated", ytqsScheduleShortsCardScan, true);
window.addEventListener("popstate", scheduleRefresh);
window.addEventListener("popstate", ytqsScheduleShortsCardScan);
