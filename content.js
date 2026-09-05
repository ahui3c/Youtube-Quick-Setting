const YTQS_DEFAULTS = {
  schemaVersion: 4,
  language: "system",
  global: { speed: 1, quality: "hd1080", premiumQualityEnabled: false, theaterModeEnabled: false, disableAutoplayNext: false, hideEndScreenRecommendations: false },
  shorts: { speed: 1, quality: "hd1080", premiumQualityEnabled: false },
  shortsControls: { seekSeconds: 5, arrowKeysEnabled: true, channelNamesEnabled: true, publishTimeEnabled: false },
  gridLayout: { regularColumns: "auto", shortsColumns: "auto" },
  dateDisplay: { enabled: false, format: YTQSDate.DEFAULT_FORMAT },
  copy: { defaultFormat: "title-url" },
  screenshot: { output: "download" },
  channels: {}
};
const YTQS_SPEEDS = [0.7, 1, 1.25, 2, 3];
const YTQS_SEEK_SECONDS = [3, 5, 10];
const YTQS_HOME_GRID_COLUMNS = ["auto", 2, 3, 4, 5, 6];
const YTQS_SCREENSHOT_OUTPUTS = ["download", "clipboard"];
const YTQS_THEATER_OVERRIDES = ["inherit", "on", "off"];
const YTQS_SOCIAL_SHARE_WINDOW_MS = 4000;
let ytqsSettings = YTQS_DEFAULTS;
let ytqsContext = { isVideo: false, contentType: "regular", channelId: "", channelName: "" };
let ytqsRefreshTimer = 0;
let ytqsLastChannelNoticeKey = "";
let ytqsLastNavigationVideoId = "";
let ytqsShortsScanTimer = 0;
let ytqsShortsMutationObserver = null;
let ytqsShortsIntersectionObserver = null;
let ytqsSocialShareReadyUntil = 0;
let ytqsInstanceActive = false;
let ytqsFeatureListenersInstalled = false;
let ytqsInstanceConflict = null;
let ytqsInstanceMarker = null;
let ytqsInstanceMarkerObserver = null;
let ytqsInstanceStartTimer = 0;
let ytqsInstanceConflictCheckTimer = 0;
const ytqsDiscoveredInstanceIds = new Set();
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
  "zh-Hant": { channelSettings: "頻道指定設定", speed: "速度", quality: "解析度", playbackSpeed: "播放速度", seconds: "秒", backToStart: "回到片頭", copiedVideoInfo: "已複製影片資訊", copiedVideoInfoShareHint: "已成功複製到剪貼簿，再按快速鍵快速分享 F / T / X", socialShareOpened: "已開啟分享視窗", socialShareBlocked: "無法開啟分享視窗", copyFailed: "複製失敗", screenshotSaved: "影片截圖已下載", screenshotCopied: "影片截圖已複製到剪貼簿", screenshotFailed: "無法擷取影片畫面", today: "今天", published: "發布時間" },
  en: { channelSettings: "Channel settings", speed: "Speed", quality: "Quality", playbackSpeed: "Playback speed", seconds: "sec", backToStart: "Back to start", copiedVideoInfo: "Video info copied", copiedVideoInfoShareHint: "Copied to clipboard — press F / T / X to share", socialShareOpened: "Share window opened", socialShareBlocked: "Could not open the share window", copyFailed: "Copy failed", screenshotSaved: "Video screenshot downloaded", screenshotCopied: "Video screenshot copied to clipboard", screenshotFailed: "Could not capture the video frame", today: "today", published: "Published" },
  ja: { channelSettings: "チャンネル設定", speed: "速度", quality: "画質", playbackSpeed: "再生速度", seconds: "秒", backToStart: "先頭に戻る", copiedVideoInfo: "動画情報をコピーしました", copiedVideoInfoShareHint: "クリップボードにコピーしました。F / T / X ですぐに共有できます", socialShareOpened: "共有画面を開きました", socialShareBlocked: "共有画面を開けませんでした", copyFailed: "コピーに失敗しました", screenshotSaved: "動画スクリーンショットを保存しました", screenshotCopied: "動画スクリーンショットをクリップボードにコピーしました", screenshotFailed: "動画画面を保存できませんでした", today: "今日", published: "公開時刻" }
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
    theaterModeEnabled: value?.global?.theaterModeEnabled === true,
    disableAutoplayNext: value?.global?.disableAutoplayNext === true,
    hideEndScreenRecommendations: value?.global?.hideEndScreenRecommendations === true
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
    schemaVersion: 4,
    language: ["system", "zh-Hant", "en", "ja"].includes(value?.language) ? value.language : "system",
    global,
    shorts,
    shortsControls: {
      seekSeconds: YTQS_SEEK_SECONDS.includes(Number(value?.shortsControls?.seekSeconds)) ? Number(value.shortsControls.seekSeconds) : 5,
      arrowKeysEnabled: value?.shortsControls?.arrowKeysEnabled !== false,
      channelNamesEnabled: value?.shortsControls?.channelNamesEnabled !== false,
      publishTimeEnabled: value?.shortsControls?.publishTimeEnabled === true
    },
    gridLayout: {
      regularColumns: YTQS_HOME_GRID_COLUMNS.includes(value?.gridLayout?.regularColumns) ? value.gridLayout.regularColumns : "auto",
      shortsColumns: YTQS_HOME_GRID_COLUMNS.includes(value?.gridLayout?.shortsColumns) ? value.gridLayout.shortsColumns : "auto"
    },
    dateDisplay: {
      enabled: value?.dateDisplay?.enabled === true,
      format: YTQSDate.normalizeFormat(value?.dateDisplay?.format)
    },
    copy: {
      defaultFormat: YTQSCopy.DEFAULT_FORMAT
    },
    screenshot: {
      output: YTQS_SCREENSHOT_OUTPUTS.includes(value?.screenshot?.output) ? value.screenshot.output : "download"
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
  if (!isVideoPage()) return { isVideo: false, contentType: type, channelId: "", channelName: "", videoTitle: "", videoUrl: "", currentTime: 0, isSpherical: false };
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
  return { isVideo: true, contentType: type, channelId, channelName, videoTitle: videoInfo?.title || "", videoUrl: videoInfo?.url || "", currentTime: videoInfo?.currentTime || 0, isSpherical: isSphericalVideo() };
}

function effectiveSettings() {
  const channel = ytqsContext.channelId && ytqsSettings.channels?.[ytqsContext.channelId];
  const profile = channel
    ? channel[ytqsContext.contentType] || channel.regular
    : ytqsContext.contentType === "shorts" ? ytqsSettings.shorts : ytqsSettings.global;
  if (ytqsContext.contentType === "shorts") {
    return { speed: profile.speed, quality: null, premiumQualityEnabled: false, disableAutoplayNext: false, hideEndScreenRecommendations: false };
  }
  const override = channel?.regular?.theaterModeOverride || "inherit";
  const theaterMode = override === "on"
    ? true
    : override === "off"
      ? false
      : ytqsSettings.global.theaterModeEnabled === true ? true : null;
  return {
    ...profile,
    theaterMode,
    disableAutoplayNext: ytqsSettings.global.disableAutoplayNext === true,
    hideEndScreenRecommendations: ytqsSettings.global.hideEndScreenRecommendations === true
  };
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
  const currentTime = Math.max(0, Number(currentVideo()?.currentTime) || 0);
  return { title, url, currentTime, text: `${title}\n${url}` };
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
  const isShorts = ytqsContext.contentType === "shorts";
  const noticeKey = [
    currentVideoId(),
    ytqsContext.contentType,
    ytqsContext.channelId,
    channelSettings.speed,
    isShorts ? "no-quality" : channelSettings.quality
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
  const createNoticeElement = (tagName, className, text) => {
    const element = document.createElement(tagName);
    element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const accent = createNoticeElement("span", "ytqs-channel-accent");
  accent.setAttribute("aria-hidden", "true");
  const title = createNoticeElement("span", "ytqs-channel-title", ytqsText("channelSettings"));
  const values = createNoticeElement("span", "ytqs-channel-values");
  values.append(
    createNoticeElement("span", "ytqs-channel-label", ytqsText("speed")),
    createNoticeElement("strong", "", `${Number(channelSettings.speed)}×`)
  );
  if (!isShorts) {
    const divider = createNoticeElement("span", "ytqs-channel-divider");
    divider.setAttribute("aria-hidden", "true");
    values.append(
      divider,
      createNoticeElement("span", "ytqs-channel-label", ytqsText("quality")),
      createNoticeElement("strong", "", YTQS_QUALITY_LABELS[channelSettings.quality] || channelSettings.quality)
    );
  }
  notice.append(accent, title, values);

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
  applyHomeGridLayout();
  applyEndScreenRecommendationVisibility();
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

function ytqsIsHomeGridPage(pathname = location.pathname) {
  return pathname === "/" || pathname === "/feed/subscriptions";
}

function ytqsHomeGridStyleText(gridLayout = ytqsSettings.gridLayout, pathname = location.pathname) {
  if (!ytqsIsHomeGridPage(pathname)) return "";
  const declarations = [];
  if (gridLayout?.regularColumns !== "auto" && YTQS_HOME_GRID_COLUMNS.includes(gridLayout?.regularColumns)) {
    declarations.push(`--ytd-rich-grid-items-per-row:${gridLayout.regularColumns} !important`);
  }
  if (gridLayout?.shortsColumns !== "auto" && YTQS_HOME_GRID_COLUMNS.includes(gridLayout?.shortsColumns)) {
    declarations.push(`--ytd-rich-grid-slim-items-per-row:${gridLayout.shortsColumns} !important`);
  }
  return declarations.length ? `ytd-rich-grid-renderer{${declarations.join(";")}}` : "";
}

function applyHomeGridLayout() {
  const css = ytqsHomeGridStyleText();
  let style = document.querySelector("#ytqs-home-grid-style");
  if (!css) {
    style?.remove();
    return false;
  }
  if (!style) {
    style = document.createElement("style");
    style.id = "ytqs-home-grid-style";
    document.documentElement.append(style);
  }
  style.textContent = css;
  return true;
}

function applyEndScreenRecommendationVisibility() {
  let style = document.querySelector("#ytqs-end-screen-style");
  if (!style) {
    style = document.createElement("style");
    style.id = "ytqs-end-screen-style";
    style.textContent = `
      #movie_player.ytqs-hide-end-screen-recommendations:not(:hover) .ytp-endscreen-content,
      #movie_player.ytqs-hide-end-screen-recommendations:not(:hover) .ytp-autonav-endscreen-upnext-container,
      #movie_player.ytqs-hide-end-screen-recommendations:not(:hover) .ytp-autonav-endscreen-countdown-container {
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `;
    document.documentElement.append(style);
  }
  const player = document.querySelector("#movie_player");
  const enabled = ytqsContext.isVideo
    && ytqsContext.contentType === "regular"
    && ytqsSettings.global.hideEndScreenRecommendations === true;
  player?.classList?.toggle("ytqs-hide-end-screen-recommendations", enabled);
  return enabled;
}

function refreshContextAndApply(attempt = 0) {
  if (!ytqsInstanceActive) return;
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
  if (!ytqsInstanceActive) return;
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

function ytqsExtractShortsPublishDate(source) {
  return ytqsNormalizePublishDate(YTQSDate.extract(source));
}

function ytqsNormalizePublishDate(value) {
  const date = typeof value === "string" ? value.trim() : "";
  return Number.isFinite(Date.parse(date)) ? date : "";
}

function ytqsCurrentShortsPagePublishDate(videoId) {
  if (!videoId) return "";
  const canonical = document.querySelector('link[rel="canonical"]')?.href
    || document.querySelector('meta[property="og:url"]')?.content
    || document.querySelector('link[itemprop="url"]')?.href
    || "";
  const canonicalVideoId = canonical.match(/\/shorts\/([A-Za-z0-9_-]{11})/)?.[1] || "";
  if (canonicalVideoId !== videoId) return "";
  const value = document.querySelector('meta[itemprop="uploadDate"], meta[itemprop="datePublished"]')?.content || "";
  return ytqsNormalizePublishDate(value);
}

async function ytqsLoadShortsPublishDate(videoId) {
  const response = await fetch(`/watch?v=${encodeURIComponent(videoId)}`, {
    credentials: "omit",
    headers: { Accept: "text/html" }
  });
  if (!response.ok) return "";
  return ytqsExtractShortsPublishDate(await response.text());
}

function ytqsFormatShortsPublishTime(value, now = Date.now()) {
  if (ytqsSettings.dateDisplay.enabled) {
    return YTQSDate.format(value, ytqsSettings.dateDisplay.format, ytqsLanguage());
  }
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "";
  const elapsed = Math.max(0, Number(now) - timestamp);
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (dateOnly && elapsed < 86400000) return ytqsText("today");
  const choices = [
    [3600000, 60000, "minute"],
    [86400000, 3600000, "hour"],
    [604800000, 86400000, "day"],
    [2629800000, 604800000, "week"],
    [31557600000, 2629800000, "month"],
    [Infinity, 31557600000, "year"]
  ];
  const [, divisor, unit] = choices.find(([limit]) => elapsed < limit);
  const amount = Math.max(1, Math.floor(elapsed / divisor));
  const language = ytqsLanguage();
  const locale = language === "zh-Hant" ? "zh-TW" : language;
  return new Intl.RelativeTimeFormat(locale, { numeric: "always" }).format(-amount, unit);
}

function ytqsPumpShortsMetadataQueue() {
  while (ytqsShortsMetadataRequests < 4 && ytqsShortsMetadataQueue.length) {
    const task = ytqsShortsMetadataQueue.shift();
    ytqsShortsMetadataRequests += 1;
    task.load()
      .catch(() => null)
      .then((value) => {
        ytqsShortsMetadataCache.set(task.key, value);
        task.resolve(value);
      })
      .finally(() => {
        ytqsShortsMetadataRequests -= 1;
        ytqsShortsMetadataPending.delete(task.key);
        ytqsPumpShortsMetadataQueue();
      });
  }
}

function ytqsGetShortsMetadata(key, load) {
  if (ytqsShortsMetadataCache.has(key)) return Promise.resolve(ytqsShortsMetadataCache.get(key));
  if (ytqsShortsMetadataPending.has(key)) return ytqsShortsMetadataPending.get(key);
  const request = new Promise((resolve) => {
    ytqsShortsMetadataQueue.push({ key, load, resolve });
    ytqsPumpShortsMetadataQueue();
  });
  ytqsShortsMetadataPending.set(key, request);
  return request;
}

function ytqsGetShortsAuthor(videoId) {
  return ytqsGetShortsMetadata(`author:${videoId}`, () => ytqsLoadShortsAuthor(videoId));
}

function ytqsGetShortsPublishDate(videoId) {
  return ytqsGetShortsMetadata(`publish:${videoId}`, () => ytqsLoadShortsPublishDate(videoId));
}

function ytqsInstallShortsChannelStyle() {
  if (document.querySelector("#ytqs-shorts-channel-style")) return;
  const style = document.createElement("style");
  style.id = "ytqs-shorts-channel-style";
  style.textContent = `
    .ytqs-shorts-channel-name{display:block;max-width:calc(100% - 36px);margin:3px 36px 0 0;color:var(--yt-spec-text-secondary,#606060);font-family:Roboto,Arial,sans-serif;font-size:1.4rem;font-weight:400;line-height:2rem;overflow:hidden;text-decoration:none;text-overflow:ellipsis;white-space:nowrap}
    .ytqs-shorts-channel-name:hover{color:var(--yt-spec-text-primary,#0f0f0f);text-decoration:none}
    html[dark] .ytqs-shorts-channel-name,html[data-theme="dark"] .ytqs-shorts-channel-name,body[dark] .ytqs-shorts-channel-name{color:#aaa}
    html[dark] .ytqs-shorts-channel-name:hover,html[data-theme="dark"] .ytqs-shorts-channel-name:hover,body[dark] .ytqs-shorts-channel-name:hover{color:var(--yt-spec-text-primary,#f1f1f1)}
    .ytqs-shorts-publish-time{white-space:nowrap}
    .ytqs-shorts-page-publish-time{display:inline-flex!important;align-items:center;align-self:flex-start;gap:5px;width:max-content;max-width:100%;margin:3px 0 2px;padding:2px 8px;border-radius:999px;background:rgba(0,0,0,.08);color:var(--yt-spec-text-secondary,#606060);font-family:Roboto,"Microsoft JhengHei UI",sans-serif;font-size:12px;font-weight:500;line-height:18px;opacity:.86;pointer-events:none;white-space:nowrap}
    html[dark] .ytqs-shorts-page-publish-time:not(.ytqs-on-video),html[data-theme="dark"] .ytqs-shorts-page-publish-time:not(.ytqs-on-video),body[dark] .ytqs-shorts-page-publish-time:not(.ytqs-on-video){background:rgba(255,255,255,.14);box-shadow:0 1px 3px rgba(0,0,0,.28);color:var(--yt-spec-text-primary,#f1f1f1)}
    .ytqs-shorts-page-publish-time.ytqs-on-video{background:rgba(0,0,0,.58);box-shadow:0 1px 4px rgba(0,0,0,.3);color:#fff!important;opacity:1;text-shadow:0 1px 2px rgba(0,0,0,.75)}
    .ytqs-shorts-page-publish-time svg{width:13px;height:13px;flex:none;fill:currentColor}
    .ytqs-absolute-date{white-space:nowrap}
  `;
  document.documentElement.append(style);
}

function ytqsVideoIdFromCard(card) {
  const href = card?.querySelector?.('a[href*="/watch?v="]')?.getAttribute?.("href") || "";
  try {
    const videoId = new URL(href, location.origin).searchParams.get("v") || "";
    return /^[A-Za-z0-9_-]{11}$/.test(videoId) ? videoId : "";
  } catch {
    return "";
  }
}

function ytqsLooksLikeRelativeDate(text) {
  return /(?:ago|前|分钟前|小時前|時間前|日前|週前|週間前|か月前|年前|seconds?|minutes?|hours?|days?|weeks?|months?|years?)/i.test(String(text || "").trim());
}

function ytqsCardDateElement(card) {
  const elements = [...(card?.querySelectorAll?.(
    "#metadata-line > span, .inline-metadata-item, .ytContentMetadataViewModelMetadataRow > .ytContentMetadataViewModelMetadataText"
  ) || [])];
  return elements.find((element) => ytqsLooksLikeRelativeDate(element.textContent)) || null;
}

function ytqsRestoreAbsoluteDateElement(element) {
  if (!element?.classList?.contains("ytqs-absolute-date")) return;
  if (element.dataset.ytqsOriginalDate) element.textContent = element.dataset.ytqsOriginalDate;
  element.classList.remove("ytqs-absolute-date");
  delete element.dataset.ytqsOriginalDate;
  delete element.dataset.ytqsAbsoluteVideoId;
}

function ytqsRestoreAbsoluteDates() {
  document.querySelectorAll(".ytqs-absolute-date").forEach(ytqsRestoreAbsoluteDateElement);
}

function ytqsApplyAbsoluteDate(element, videoId, value) {
  const label = YTQSDate.format(value, ytqsSettings.dateDisplay.format, ytqsLanguage());
  if (!label || !element?.isConnected || !ytqsSettings.dateDisplay.enabled) return false;
  if (element.dataset.ytqsAbsoluteVideoId && element.dataset.ytqsAbsoluteVideoId !== videoId) {
    ytqsRestoreAbsoluteDateElement(element);
  }
  if (!element.dataset.ytqsOriginalDate) element.dataset.ytqsOriginalDate = element.textContent.trim();
  element.dataset.ytqsAbsoluteVideoId = videoId;
  element.classList.add("ytqs-absolute-date");
  element.title = element.dataset.ytqsOriginalDate;
  element.textContent = label;
  return true;
}

async function ytqsRenderCardAbsoluteDate(card) {
  if (!ytqsSettings.dateDisplay.enabled || !card?.isConnected) return;
  const videoId = ytqsVideoIdFromCard(card);
  const element = ytqsCardDateElement(card);
  if (!videoId || !element) return;
  if (element.dataset.ytqsAbsoluteVideoId === videoId) return;
  const publishDate = await ytqsGetShortsPublishDate(videoId);
  if (ytqsVideoIdFromCard(card) !== videoId) return;
  ytqsApplyAbsoluteDate(element, videoId, publishDate);
}

function ytqsCurrentWatchVideoId() {
  if (location.pathname !== "/watch") return "";
  return new URLSearchParams(location.search).get("v") || "";
}

function ytqsCurrentWatchDateElement() {
  const elements = [...document.querySelectorAll("ytd-watch-metadata #info span, ytd-watch-metadata #info-container span, #info-strings yt-formatted-string")];
  return elements.find((element) => ytqsLooksLikeRelativeDate(element.textContent)) || null;
}

function ytqsCurrentStructuredPublishDate() {
  const direct = document.querySelector('meta[itemprop="uploadDate"], meta[itemprop="datePublished"]')?.content || "";
  if (ytqsNormalizePublishDate(direct)) return direct;
  const scripts = [...document.querySelectorAll('script[type="application/ld+json"], ytd-watch-metadata script')];
  for (const script of scripts) {
    const value = YTQSDate.extract(script.textContent || "");
    if (value) return value;
  }
  return "";
}

async function ytqsRenderWatchAbsoluteDate() {
  const videoId = ytqsCurrentWatchVideoId();
  const element = ytqsCurrentWatchDateElement();
  if (!ytqsSettings.dateDisplay.enabled || !videoId || !element) return;
  if (element.dataset.ytqsAbsoluteVideoId === videoId) return;
  const publishDate = ytqsCurrentStructuredPublishDate() || await ytqsGetShortsPublishDate(videoId);
  if (ytqsCurrentWatchVideoId() !== videoId) return;
  ytqsApplyAbsoluteDate(element, videoId, publishDate);
}

function ytqsScanAbsoluteDates() {
  if (!ytqsSettings.dateDisplay.enabled) {
    ytqsRestoreAbsoluteDates();
    return;
  }
  ytqsInstallShortsChannelStyle();
  ytqsRenderWatchAbsoluteDate();
  document.querySelectorAll("ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer, ytd-playlist-video-renderer").forEach((card) => {
    const rect = card.getBoundingClientRect();
    if (rect.bottom >= -600 && rect.top <= innerHeight + 600) ytqsRenderCardAbsoluteDate(card);
  });
}

function ytqsDeduplicateShortsChannelNames(card, videoId) {
  const markers = [...card.querySelectorAll(".ytqs-shorts-channel-name")];
  const current = markers.find((marker) => marker.dataset.videoId === videoId) || null;
  markers.forEach((marker) => {
    if (marker !== current) marker.remove();
  });
  return current;
}

function ytqsDeduplicateShortsPublishTimes(card, videoId) {
  const markers = [...card.querySelectorAll(".ytqs-shorts-publish-time")];
  const current = markers.find((marker) => marker.dataset.videoId === videoId) || null;
  markers.forEach((marker) => {
    if (marker !== current) marker.remove();
  });
  return current;
}

function ytqsDeduplicateShortsPagePublishTimes(reel, videoId) {
  const markers = [...document.querySelectorAll(".ytqs-shorts-page-publish-time")];
  const current = markers.find((marker) => marker.dataset.videoId === videoId && reel?.contains(marker)) || null;
  markers.forEach((marker) => {
    if (marker !== current) marker.remove();
  });
  return current;
}

function ytqsIsMarkerOverVideo(markerRect, videoRect) {
  if (!markerRect || !videoRect || videoRect.width <= 0 || videoRect.height <= 0) return false;
  const centerX = markerRect.left + markerRect.width / 2;
  const centerY = markerRect.top + markerRect.height / 2;
  return centerX >= videoRect.left && centerX <= videoRect.right
    && centerY >= videoRect.top && centerY <= videoRect.bottom;
}

function ytqsUpdateShortsPagePublishTimeContrast(reel, marker) {
  if (!reel?.isConnected || !marker?.isConnected) return false;
  const video = reel.querySelector("video");
  const onVideo = Boolean(video && ytqsIsMarkerOverVideo(marker.getBoundingClientRect(), video.getBoundingClientRect()));
  marker.classList.toggle("ytqs-on-video", onVideo);
  return onVideo;
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

async function ytqsRenderShortsPublishTime(card) {
  if (!card?.isConnected || location.pathname !== "/" || ytqsSettings.shortsControls.publishTimeEnabled === false) return;
  const videoId = ytqsShortsVideoId(card);
  if (!videoId) return;
  if (ytqsDeduplicateShortsPublishTimes(card, videoId)) return;
  if (card.dataset.ytqsPublishRequest === videoId) return;
  card.dataset.ytqsPublishRequest = videoId;
  try {
    const publishDate = await ytqsGetShortsPublishDate(videoId);
    const label = ytqsFormatShortsPublishTime(publishDate);
    if (!label || !card.isConnected || ytqsShortsVideoId(card) !== videoId || ytqsSettings.shortsControls.publishTimeEnabled === false) return;
    if (ytqsDeduplicateShortsPublishTimes(card, videoId)) return;
    const subhead = card.querySelector(".shortsLockupViewModelHostOutsideMetadataSubhead");
    if (!subhead) return;
    const marker = document.createElement("span");
    marker.className = "ytqs-shorts-publish-time";
    marker.dataset.videoId = videoId;
    marker.textContent = ` · ${label}`;
    subhead.append(marker);
  } finally {
    if (card.dataset.ytqsPublishRequest === videoId) delete card.dataset.ytqsPublishRequest;
  }
}

async function ytqsRenderShortsPagePublishTime() {
  if (contentType() !== "shorts" || ytqsSettings.shortsControls.publishTimeEnabled === false) return;
  const videoId = location.pathname.match(/^\/shorts\/([A-Za-z0-9_-]{11})/)?.[1] || "";
  if (!videoId) return;
  const reel = activeShortVideo()?.closest("ytd-reel-video-renderer");
  if (!reel?.isConnected) return;
  const existingMarker = ytqsDeduplicateShortsPagePublishTimes(reel, videoId);
  if (existingMarker) {
    ytqsUpdateShortsPagePublishTimeContrast(reel, existingMarker);
    return;
  }
  if (reel.dataset.ytqsPublishRequest === videoId) return;
  reel.dataset.ytqsPublishRequest = videoId;
  try {
    const publishDate = ytqsCurrentShortsPagePublishDate(videoId) || await ytqsGetShortsPublishDate(videoId);
    const label = ytqsFormatShortsPublishTime(publishDate);
    if (!label || !reel.isConnected || contentType() !== "shorts" || ytqsSettings.shortsControls.publishTimeEnabled === false) return;
    if (location.pathname.match(/^\/shorts\/([A-Za-z0-9_-]{11})/)?.[1] !== videoId) return;
    if (ytqsDeduplicateShortsPagePublishTimes(reel, videoId)) return;
    const metapanel = reel.querySelector(".ytReelPlayerOverlayViewModelMetadataContainerMetapanel yt-reel-metapanel-view-model");
    if (!metapanel) return;
    const titleItem = [...metapanel.children].find((element) => element.querySelector?.("yt-shorts-video-title-view-model")) || null;
    const marker = document.createElement("div");
    marker.className = "ytReelMetapanelViewModelMetapanelItem ytqs-shorts-page-publish-time";
    marker.dataset.videoId = videoId;
    marker.title = `${ytqsText("published")}：${label}`;
    marker.setAttribute("role", "note");
    marker.setAttribute("aria-label", marker.title);
    marker.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5v4.6l3.2 1.9-1 1.7L11 12.7V7h2Z"/></svg>';
    const text = document.createElement("span");
    text.textContent = label;
    marker.append(text);
    metapanel.insertBefore(marker, titleItem);
    ytqsUpdateShortsPagePublishTimeContrast(reel, marker);
  } finally {
    if (reel.dataset.ytqsPublishRequest === videoId) delete reel.dataset.ytqsPublishRequest;
  }
}

function ytqsScanShortsCards() {
  if (!ytqsInstanceActive) return;
  ytqsScanAbsoluteDates();
  const onHome = location.pathname === "/";
  const onShortsPage = contentType() === "shorts";
  const channelNamesEnabled = onHome && ytqsSettings.shortsControls.channelNamesEnabled !== false;
  const publishTimeEnabled = onHome && ytqsSettings.shortsControls.publishTimeEnabled !== false;
  const pagePublishTimeEnabled = onShortsPage && ytqsSettings.shortsControls.publishTimeEnabled !== false;
  if (!channelNamesEnabled) document.querySelectorAll(".ytqs-shorts-channel-name").forEach((element) => element.remove());
  if (!publishTimeEnabled) document.querySelectorAll(".ytqs-shorts-publish-time").forEach((element) => element.remove());
  if (!pagePublishTimeEnabled) document.querySelectorAll(".ytqs-shorts-page-publish-time").forEach((element) => element.remove());
  if (pagePublishTimeEnabled) {
    ytqsInstallShortsChannelStyle();
    ytqsRenderShortsPagePublishTime();
  }
  if (!channelNamesEnabled && !publishTimeEnabled) {
    return;
  }
  ytqsInstallShortsChannelStyle();
  document.querySelectorAll("ytm-shorts-lockup-view-model-v2").forEach((card) => {
    ytqsShortsIntersectionObserver?.observe(card);
    const rect = card.getBoundingClientRect();
    if (rect.bottom >= -600 && rect.top <= innerHeight + 600) {
      if (channelNamesEnabled) ytqsRenderShortsChannelName(card);
      if (publishTimeEnabled) ytqsRenderShortsPublishTime(card);
    }
  });
}

function ytqsScheduleShortsCardScan() {
  if (!ytqsInstanceActive) return;
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
      if (!entry.isIntersecting) return;
      if (ytqsSettings.shortsControls.channelNamesEnabled !== false) ytqsRenderShortsChannelName(entry.target);
      if (ytqsSettings.shortsControls.publishTimeEnabled !== false) ytqsRenderShortsPublishTime(entry.target);
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
    style.id = "ytqs-speed-overlay-style";
    style.textContent = `
      #ytqs-speed-overlay{position:fixed;z-index:2147483647;left:50%;top:24%;transform:translate(-50%,-8px);display:grid;grid-template-columns:auto auto;align-items:center;gap:2px 10px;min-width:158px;padding:14px 18px;border:1px solid rgba(255,255,255,.2);border-radius:12px;background:rgba(16,16,18,.9);box-shadow:0 14px 45px rgba(0,0,0,.4);color:#fff;font-family:Roboto,"Microsoft JhengHei UI",sans-serif;opacity:0;pointer-events:none;transition:opacity .15s ease,transform .15s ease;backdrop-filter:blur(8px)}
      #ytqs-speed-overlay.ytqs-show{opacity:1;transform:translate(-50%,0)}
      #ytqs-speed-overlay .ytqs-speed-icon{grid-row:1/3;color:#ff3b30;font-size:15px;letter-spacing:-3px}
      #ytqs-speed-overlay .ytqs-speed-value{font-size:22px;font-weight:700;line-height:1}
      #ytqs-speed-overlay .ytqs-speed-label{color:#b7b7ba;font-size:11px;line-height:1.1}
      #ytqs-speed-overlay.ytqs-seek-overlay{gap:1px 7px;min-width:118px;padding:8px 12px;border-color:rgba(255,255,255,.14);border-radius:9px;background:rgba(16,16,18,.68);box-shadow:0 7px 22px rgba(0,0,0,.22);backdrop-filter:blur(4px)}
      #ytqs-speed-overlay.ytqs-seek-overlay.ytqs-show{opacity:.82}
      #ytqs-speed-overlay.ytqs-seek-overlay .ytqs-speed-icon{font-size:11px;letter-spacing:-2px}
      #ytqs-speed-overlay.ytqs-seek-overlay .ytqs-speed-value{font-size:17px}
      #ytqs-speed-overlay.ytqs-seek-overlay .ytqs-speed-label{font-size:10px}
      @media(prefers-reduced-motion:reduce){#ytqs-speed-overlay{transition:none}}
    `;
    document.documentElement.append(style, overlay);
  }
  overlay.classList.remove("ytqs-seek-overlay");
  positionOverlayForContent(overlay);
  overlay.querySelector(".ytqs-speed-icon").textContent = "▶▶";
  overlay.querySelector(".ytqs-speed-value").textContent = `${speed}×`;
  overlay.querySelector(".ytqs-speed-label").textContent = ytqsText("playbackSpeed");
  overlay.classList.remove("ytqs-show");
  void overlay.offsetWidth;
  overlay.classList.add("ytqs-show");
  clearTimeout(showSpeedOverlay.timer);
  showSpeedOverlay.timer = setTimeout(() => overlay.classList.remove("ytqs-show"), 1050);
}

function positionShortsOverlay(overlay, video) {
  const rect = video?.getBoundingClientRect?.();
  if (!overlay || !rect || !Number.isFinite(rect.left) || !Number.isFinite(rect.top) || rect.width <= 0 || rect.height <= 0) {
    return false;
  }
  const viewportWidth = Number(window.innerWidth) || document.documentElement?.clientWidth || rect.right || rect.width;
  const viewportHeight = Number(window.innerHeight) || document.documentElement?.clientHeight || rect.bottom || rect.height;
  const centerX = Math.min(viewportWidth - 16, Math.max(16, rect.left + rect.width / 2));
  const upperOffset = Math.min(150, Math.max(72, rect.height * .18));
  const upperY = Math.min(viewportHeight - 64, Math.max(24, rect.top + upperOffset));
  overlay.style.left = `${Math.round(centerX)}px`;
  overlay.style.top = `${Math.round(upperY)}px`;
  return true;
}

function positionOverlayForContent(overlay, video = currentVideo()) {
  if (contentType() === "shorts" && positionShortsOverlay(overlay, video)) return true;
  overlay?.style?.removeProperty?.("left");
  overlay?.style?.removeProperty?.("top");
  return false;
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

function showSeekOverlay(deltaSeconds, currentTime, duration, video = currentVideo()) {
  let overlay = document.querySelector("#ytqs-speed-overlay");
  if (!overlay) {
    showSpeedOverlay(1);
    overlay = document.querySelector("#ytqs-speed-overlay");
  }
  if (!overlay) return;
  overlay.classList.add("ytqs-seek-overlay");
  positionShortsOverlay(overlay, video);
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

function showCopyOverlay(success, title = "", messageKey = "", kind = "copy") {
  let overlay = document.querySelector("#ytqs-copy-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "ytqs-copy-overlay";
    overlay.innerHTML = '<span class="ytqs-copy-icon"></span><span class="ytqs-copy-value"></span><span class="ytqs-copy-title"></span>';
    const style = document.createElement("style");
    style.id = "ytqs-copy-overlay-style";
    style.textContent = `
      #ytqs-copy-overlay{position:fixed;z-index:2147483647;left:50%;top:24%;transform:translate(-50%,-8px);display:grid;grid-template-columns:28px minmax(0,1fr);align-items:center;column-gap:10px;min-width:230px;max-width:min(440px,calc(100vw - 32px));padding:13px 17px;border:1px solid rgba(255,255,255,.2);border-radius:12px;background:rgba(16,16,18,.92);box-shadow:0 14px 45px rgba(0,0,0,.4);color:#fff;font-family:Roboto,"Microsoft JhengHei UI",sans-serif;opacity:0;pointer-events:none;transition:opacity .15s ease,transform .15s ease;backdrop-filter:blur(8px)}
      #ytqs-copy-overlay.ytqs-show{opacity:1;transform:translate(-50%,0)}
      #ytqs-copy-overlay .ytqs-copy-icon{grid-row:1/3;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#31b879;color:#fff;font-size:16px;font-weight:800}
      #ytqs-copy-overlay.ytqs-copy-share .ytqs-copy-icon{background:#5b5bd6;font-family:Arial,sans-serif}
      #ytqs-copy-overlay.ytqs-copy-screenshot .ytqs-copy-icon{background:#2878d4}
      #ytqs-copy-overlay.ytqs-copy-error .ytqs-copy-icon{background:#ff3b30}
      #ytqs-copy-overlay .ytqs-copy-value{font-size:14px;font-weight:700;line-height:1.3}
      #ytqs-copy-overlay .ytqs-copy-title{overflow:hidden;color:#b7b7ba;font-size:11px;line-height:1.35;text-overflow:ellipsis;white-space:nowrap}
      @media(prefers-reduced-motion:reduce){#ytqs-copy-overlay{transition:none}}
    `;
    document.documentElement.append(style, overlay);
  }
  positionOverlayForContent(overlay);
  overlay.classList.toggle("ytqs-copy-error", !success);
  overlay.classList.toggle("ytqs-copy-share", kind === "share" && success);
  overlay.classList.toggle("ytqs-copy-screenshot", kind === "screenshot" && success);
  overlay.querySelector(".ytqs-copy-icon").textContent = success ? kind === "share" ? "f" : kind === "screenshot" ? "▣" : "✓" : "!";
  overlay.querySelector(".ytqs-copy-value").textContent = ytqsText(messageKey || (success ? "copiedVideoInfo" : "copyFailed"));
  overlay.querySelector(".ytqs-copy-title").textContent = title;
  overlay.classList.remove("ytqs-show");
  void overlay.offsetWidth;
  overlay.classList.add("ytqs-show");
  clearTimeout(showCopyOverlay.timer);
  showCopyOverlay.timer = setTimeout(() => overlay.classList.remove("ytqs-show"), YTQS_SOCIAL_SHARE_WINDOW_MS);
}

function ytqsScreenshotFilename(title = document.title, date = new Date()) {
  const cleanTitle = String(title || "YouTube")
    .replace(/\s+-\s+YouTube\s*$/i, "")
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90) || "YouTube";
  const timestamp = date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z").replace("T", "-");
  return `${cleanTitle}-${timestamp}.png`;
}

async function captureCurrentVideoFrame(video = currentVideo(), requestedOutput = ytqsSettings.screenshot?.output) {
  const width = Number(video?.videoWidth) || 0;
  const height = Number(video?.videoHeight) || 0;
  if (!video || video.readyState < 2 || width <= 0 || height <= 0) {
    showCopyOverlay(false, "", "screenshotFailed", "screenshot");
    return { ok: false, reason: "video-not-ready" };
  }
  try {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("canvas-context-unavailable");
    context.drawImage(video, 0, 0, width, height);
    const blob = await new Promise((resolve, reject) => {
      try {
        canvas.toBlob((value) => value ? resolve(value) : reject(new Error("empty-screenshot")), "image/png");
      } catch (error) {
        reject(error);
      }
    });
    const filename = ytqsScreenshotFilename(currentVideoInfo()?.title || document.title);
    const output = requestedOutput === "clipboard" ? "clipboard" : "download";
    if (output === "clipboard") {
      if (navigator.clipboard?.write && typeof ClipboardItem === "function") {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      } else if (globalThis.browser?.clipboard?.setImageData) {
        await globalThis.browser.clipboard.setImageData(await blob.arrayBuffer(), "png");
      } else {
        throw new Error("image-clipboard-unavailable");
      }
      showCopyOverlay(true, `${width}×${height}`, "screenshotCopied", "screenshot");
      return { ok: true, output, width, height };
    }
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.hidden = true;
    document.documentElement.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    showCopyOverlay(true, `${width}×${height} · ${filename}`, "screenshotSaved", "screenshot");
    return { ok: true, output, filename, width, height };
  } catch {
    showCopyOverlay(false, "", "screenshotFailed", "screenshot");
    return { ok: false, reason: "capture-failed" };
  }
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

async function copyCurrentVideoInfo(formatOverride = "", armSocialShare = false) {
  const info = currentVideoInfo();
  if (!info) {
    showCopyOverlay(false);
    return false;
  }
  const format = YTQSCopy.FORMATS.includes(formatOverride)
    ? formatOverride
    : YTQSCopy.DEFAULT_FORMAT;
  const text = YTQSCopy.formatVideoInfo({ ...info, channelName: ytqsContext.channelName }, format);
  const copied = Boolean(text) && await writeClipboardText(text);
  ytqsSocialShareReadyUntil = copied && armSocialShare
    ? Date.now() + YTQS_SOCIAL_SHARE_WINDOW_MS
    : 0;
  showCopyOverlay(copied, YTQSCopy.summarize(text), copied && armSocialShare ? "copiedVideoInfoShareHint" : "");
  return copied;
}

function socialShareReady() {
  return ytqsSocialShareReadyUntil > Date.now();
}

function socialPlatformFromEvent(event) {
  const key = event?.key?.toLowerCase();
  return key === "f" ? "facebook"
    : key === "x" ? "x"
      : key === "t" ? "threads"
        : "";
}

function openSocialShareWindow(platform) {
  const info = currentVideoInfo();
  const shareUrl = YTQSCopy.socialShareUrl(platform, info);
  ytqsSocialShareReadyUntil = 0;
  if (!shareUrl) {
    showCopyOverlay(false, "", "socialShareBlocked", "share");
    return false;
  }
  const width = 720;
  const height = 680;
  const left = Math.max(0, Math.round((window.screenX || 0) + ((window.outerWidth || width) - width) / 2));
  const top = Math.max(0, Math.round((window.screenY || 0) + ((window.outerHeight || height) - height) / 2));
  const shareWindow = window.open(
    shareUrl,
    `ytqs-${platform}-share`,
    `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
  );
  if (!shareWindow) {
    showCopyOverlay(false, YTQSCopy.summarize(info.text), "socialShareBlocked", "share");
    return false;
  }
  try {
    shareWindow.opener = null;
    shareWindow.focus();
  } catch {
    // The cross-origin share window can still open even when focus is restricted.
  }
  const icon = platform === "facebook" ? "f" : platform === "threads" ? "T" : "X";
  showCopyOverlay(true, YTQSCopy.summarize(info.text), "socialShareOpened", "share");
  const overlay = document.querySelector("#ytqs-copy-overlay .ytqs-copy-icon");
  if (overlay) overlay.textContent = icon;
  return true;
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
  showSeekOverlay(deltaSeconds, next, duration, video);
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

function isSphericalVideo() {
  const player = currentPlayer();
  return player?.classList?.contains("ytp-webgl-spherical") === true
    || Boolean(player?.querySelector?.(".ytp-webgl-spherical-control"));
}

function handleKeyboardShortcut(event) {
  const isScreenshot = event.ctrlKey === true
    && event.altKey !== true
    && event.metaKey !== true
    && event.shiftKey !== true
    && (event.code === "KeyS" || event.key?.toLowerCase() === "s");
  if (!isVideoPage() || event.defaultPrevented || event.altKey || event.metaKey || isTypingTarget(event.target)) return false;
  if (event.ctrlKey && !isScreenshot) return false;
  const isShorts = contentType() === "shorts";
  const shortsControls = ytqsSettings.shortsControls || YTQS_DEFAULTS.shortsControls;
  const isSeekBackward = isShorts && shortsControls.arrowKeysEnabled && event.key === "ArrowLeft";
  const isSeekForward = isShorts && shortsControls.arrowKeysEnabled && event.key === "ArrowRight";
  const isSeekStart = isShorts && (event.key === "0" || event.code === "Numpad0");
  const isSpeedDown = event.key === "PageUp" || event.code === "PageUp";
  const isSpeedUp = event.key === "PageDown" || event.code === "PageDown";
  const isReset = event.key === "Home" || event.code === "Home";
  const socialPlatform = socialShareReady() ? socialPlatformFromEvent(event) : "";
  // YouTube uses S as a native viewing control for 360° videos. Leave both S
  // and Shift+S untouched while the spherical player is active.
  const isCopy = !event.ctrlKey && (event.code === "KeyS" || event.key?.toLowerCase() === "s") && !isSphericalVideo();
  if (!isSeekBackward && !isSeekForward && !isSeekStart && !isSpeedUp && !isSpeedDown && !isReset && !isCopy && !isScreenshot && !socialPlatform) return false;
  if (event.repeat && !isSeekBackward && !isSeekForward) return false;
  if ((isSeekBackward || isSeekForward || isSeekStart) && isSeekBlockedTarget(event.target)) return false;
  const handled = socialPlatform
    ? (openSocialShareWindow(socialPlatform), true)
    : isScreenshot
      ? (captureCurrentVideoFrame(currentVideo(), ytqsSettings.screenshot.output), true)
    : isCopy
    ? (event.shiftKey
      ? (ytqsSocialShareReadyUntil = 0, copyCurrentVideoInfo("timestamp-url"), true)
      : (copyCurrentVideoInfo("title-url", true), true))
    : isSeekStart
    ? seekShorts(0)
    : isSeekBackward
      ? seekShorts(-shortsControls.seekSeconds)
      : isSeekForward
        ? seekShorts(shortsControls.seekSeconds)
        : isReset
          ? restoreNormalSpeed()
          : adjustSpeed(isSpeedUp ? 1 : -1);
  if (handled) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  return handled;
}

function ytqsHandleKeydown(event) {
  handleKeyboardShortcut(event);
}

function ytqsHandleRuntimeMessage(message, _sender, sendResponse) {
  if (message?.type === "YTQS_GET_INSTANCE_STATUS") {
    sendResponse(ytqsInstanceStatus());
    return false;
  }
  if (message?.type === "YTQS_INSTANCE_CONFLICT") {
    ytqsApplyInstanceConflict(message.conflict);
    sendResponse({ ok: true });
    return false;
  }
  if (message?.type === "YTQS_GET_CONTEXT") {
    if (!ytqsInstanceActive) {
      const status = ytqsInstanceStatus();
      sendResponse({ isVideo: false, contentType: contentType(), channelId: "", channelName: "", instanceStatus: status });
      return false;
    }
    ytqsContext = readChannelContext();
    sendResponse({ ...ytqsContext, instanceStatus: ytqsInstanceStatus() });
    return false;
  }
  if (!ytqsInstanceActive) return false;
  if (message?.type === "YTQS_CAPTURE_VIDEO_FRAME") {
    captureCurrentVideoFrame(currentVideo(), message.output).then(sendResponse);
    return true;
  }
  return false;
}

function ytqsHandleStorageChange(changes, area) {
  if (!ytqsInstanceActive) return;
  if (area !== "sync" || !changes.ytQuickSettings) return;
  ytqsSettings = ytqsNormalizeSettings(changes.ytQuickSettings.newValue);
  refreshContextAndApply();
  ytqsScheduleShortsCardScan();
}

function ytqsStartFeatures() {
  if (ytqsInstanceActive) return;
  ytqsInstanceActive = true;
  if (!ytqsFeatureListenersInstalled) {
    document.addEventListener("keydown", ytqsHandleKeydown, true);
    chrome.storage.onChanged.addListener(ytqsHandleStorageChange);
    document.addEventListener("yt-navigate-finish", scheduleRefresh, true);
    document.addEventListener("yt-page-data-updated", scheduleRefresh, true);
    document.addEventListener("yt-navigate-finish", ytqsScheduleShortsCardScan, true);
    document.addEventListener("yt-page-data-updated", ytqsScheduleShortsCardScan, true);
    window.addEventListener("popstate", scheduleRefresh);
    window.addEventListener("popstate", ytqsScheduleShortsCardScan);
    window.addEventListener("resize", ytqsScheduleShortsCardScan, { passive: true });
    ytqsFeatureListenersInstalled = true;
  }
  injectPageBridge();
  chrome.storage.sync.get("ytQuickSettings", (stored) => {
    if (!ytqsInstanceActive) return;
    ytqsSettings = ytqsNormalizeSettings(stored.ytQuickSettings);
    scheduleRefresh();
    ytqsInstallShortsCardObservers();
  });
}

function ytqsStopFeatures() {
  if (!ytqsInstanceActive && !ytqsFeatureListenersInstalled) return;
  ytqsInstanceActive = false;
  clearTimeout(ytqsRefreshTimer);
  clearTimeout(ytqsShortsScanTimer);
  clearTimeout(showSpeedOverlay.timer);
  clearTimeout(showCopyOverlay.timer);
  ytqsShortsMutationObserver?.disconnect();
  ytqsShortsIntersectionObserver?.disconnect();
  ytqsShortsMutationObserver = null;
  ytqsShortsIntersectionObserver = null;
  if (ytqsFeatureListenersInstalled) {
    document.removeEventListener("keydown", ytqsHandleKeydown, true);
    chrome.storage.onChanged.removeListener(ytqsHandleStorageChange);
    document.removeEventListener("yt-navigate-finish", scheduleRefresh, true);
    document.removeEventListener("yt-page-data-updated", scheduleRefresh, true);
    document.removeEventListener("yt-navigate-finish", ytqsScheduleShortsCardScan, true);
    document.removeEventListener("yt-page-data-updated", ytqsScheduleShortsCardScan, true);
    window.removeEventListener("popstate", scheduleRefresh);
    window.removeEventListener("popstate", ytqsScheduleShortsCardScan);
    window.removeEventListener("resize", ytqsScheduleShortsCardScan);
    ytqsFeatureListenersInstalled = false;
  }
  ytqsRestoreAbsoluteDates();
  document.querySelector("#movie_player")?.classList?.remove("ytqs-hide-end-screen-recommendations");
  document.querySelectorAll([
    "#ytqs-channel-settings-notice",
    "#ytqs-channel-settings-style",
    "#ytqs-home-grid-style",
    "#ytqs-end-screen-style",
    "#ytqs-shorts-channel-style",
    "#ytqs-speed-overlay",
    "#ytqs-speed-overlay-style",
    "#ytqs-copy-overlay",
    "#ytqs-copy-overlay-style",
    ".ytqs-shorts-channel-name",
    ".ytqs-shorts-publish-time",
    ".ytqs-shorts-page-publish-time"
  ].join(",")).forEach((element) => element.remove());
}

function ytqsOwnInstance() {
  const coordinator = globalThis.YTQSInstanceCoordinator;
  return {
    extensionId: String(chrome.runtime?.id || ""),
    version: String(chrome.runtime?.getManifest?.().version || "0.0.0"),
    distribution: coordinator?.classifyDistribution(chrome.runtime?.id, globalThis.YTQS_BUILD?.distribution) || "unknown"
  };
}

function ytqsInstanceStatus() {
  return { active: ytqsInstanceActive, self: ytqsOwnInstance(), conflict: ytqsInstanceConflict };
}

function ytqsScheduleInstanceStart() {
  clearTimeout(ytqsInstanceStartTimer);
  ytqsInstanceStartTimer = setTimeout(() => {
    if (!ytqsInstanceConflict?.active) ytqsStartFeatures();
  }, 220);
}

function ytqsApplyInstanceConflict(conflict) {
  const wasConflicted = ytqsInstanceConflict?.active === true;
  ytqsInstanceConflict = conflict?.active ? conflict : null;
  if (ytqsInstanceConflict) {
    clearTimeout(ytqsInstanceStartTimer);
    ytqsStopFeatures();
    if (!ytqsInstanceConflictCheckTimer && ytqsInstanceConflict.winnerExtensionId) {
      ytqsInstanceConflictCheckTimer = setInterval(() => {
        ytqsEvaluateDiscoveredInstance(ytqsInstanceConflict?.winnerExtensionId || "");
      }, 30000);
    }
    return;
  }
  if (ytqsInstanceConflictCheckTimer) clearInterval(ytqsInstanceConflictCheckTimer);
  ytqsInstanceConflictCheckTimer = 0;
  if (wasConflicted || !ytqsInstanceActive) ytqsScheduleInstanceStart();
}

function ytqsEvaluateDiscoveredInstance(extensionId) {
  const coordinator = globalThis.YTQSInstanceCoordinator;
  if (!coordinator?.validExtensionId(extensionId) || extensionId === chrome.runtime?.id) return;
  try {
    chrome.runtime.sendMessage({ type: "YTQS_INSTANCE_PEER", extensionId }, (response) => {
      if (chrome.runtime.lastError) return;
      if (response?.ok) ytqsApplyInstanceConflict(response.conflict);
    });
  } catch {}
}

function ytqsStartInstanceCoordination() {
  const coordinator = globalThis.YTQSInstanceCoordinator;
  const own = ytqsOwnInstance();
  if (!coordinator?.validExtensionId(own.extensionId)
    || ![coordinator.DEVELOPMENT_DISTRIBUTION, coordinator.CHROME_STORE_DISTRIBUTION].includes(own.distribution)) {
    ytqsStartFeatures();
    return;
  }
  ytqsDiscoveredInstanceIds.add(own.extensionId);
  const scan = () => {
    document.querySelectorAll(`meta[name="${coordinator.MARKER_NAME}"]`).forEach((marker) => {
      if (marker.getAttribute("data-product") !== coordinator.PRODUCT
        || marker.getAttribute("data-protocol") !== String(coordinator.PROTOCOL_VERSION)) return;
      const extensionId = String(marker.getAttribute("data-extension-id") || "");
      if (ytqsDiscoveredInstanceIds.has(extensionId) || !coordinator.validExtensionId(extensionId)) return;
      ytqsDiscoveredInstanceIds.add(extensionId);
      ytqsEvaluateDiscoveredInstance(extensionId);
    });
  };
  const publish = () => {
    if (!document.documentElement || ytqsInstanceMarker) return;
    ytqsInstanceMarker = document.createElement("meta");
    ytqsInstanceMarker.setAttribute("name", coordinator.MARKER_NAME);
    ytqsInstanceMarker.setAttribute("data-product", coordinator.PRODUCT);
    ytqsInstanceMarker.setAttribute("data-protocol", String(coordinator.PROTOCOL_VERSION));
    ytqsInstanceMarker.setAttribute("data-extension-id", own.extensionId);
    document.documentElement.append(ytqsInstanceMarker);
    ytqsInstanceMarkerObserver = new MutationObserver(scan);
    ytqsInstanceMarkerObserver.observe(document.documentElement, { childList: true });
    scan();
    try {
      chrome.runtime.sendMessage({ type: "YTQS_INSTANCE_CONFLICT_STATUS" }, (response) => {
        if (chrome.runtime.lastError) {
          ytqsScheduleInstanceStart();
          return;
        }
        ytqsApplyInstanceConflict(response?.conflict);
        if (response?.conflict?.winnerExtensionId) ytqsEvaluateDiscoveredInstance(response.conflict.winnerExtensionId);
      });
    } catch {
      ytqsScheduleInstanceStart();
    }
  };
  if (document.documentElement) publish();
  else setTimeout(publish, 0);
}

chrome.runtime.onMessage.addListener(ytqsHandleRuntimeMessage);
ytqsStartInstanceCoordination();
