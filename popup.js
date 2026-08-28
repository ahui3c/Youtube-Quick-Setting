const SPEEDS = [0.7, 1, 1.25, 2, 3];
const QUALITIES = [
  { value: "highest", labelKey: "qualityHighest" },
  { value: "hd2160", labelKey: "quality4k" },
  { value: "hd1080", labelKey: "quality1080", hintKey: "qualityPremiumHint" }
];
const PROFILE_KEYS = ["regular", "shorts"];
const LANGUAGES = ["system", "zh-Hant", "en", "ja"];
const SHORTS_SEEK_SECONDS = [3, 5, 10];
const THEATER_OVERRIDES = ["inherit", "on", "off"];

const MESSAGES = {
  "zh-Hant": {
    appTitle: "YouTube 快速設定速度 / 畫質", system: "系統", regular: "一般影片", shorts: "Shorts",
    typeLabel: "影片類型", allRegular: "所有一般影片", allShorts: "所有 Shorts",
    globalHeading: "全域預設", saved: "已儲存", speed: "播放速度", quality: "影片畫質",
    channelKicker: "目前頻道優先", loadingChannel: "正在讀取頻道…", noChannel: "尚未偵測到影片頻道",
    currentChannel: "目前頻道", channelSpeed: "這個頻道的播放速度", channelQuality: "這個頻道的影片畫質",
    enableChannel: "啟用目前頻道專屬設定", removeChannel: "移除頻道專屬設定",
    channelEmpty: "請在 YouTube 影片或 Shorts 頁面開啟此面板，即可加入頻道專屬設定。",
    shortcutTitle: "播放時快速操作", shortcutDescription: "−／+ 調速，* 回復 1×，C 複製影片資訊",
    shortsShortcutTitle: "Shorts 快速操作", shortsShortcutDescription: "←／→ {seconds} 秒，0 片頭；−／+ 調速，* 1×，C 複製",
    copyVideoInfoTitle: "複製影片標題＋網址", copyVideoInfoDescription: "或在播放頁直接按 C", copiedVideoInfo: "已複製到剪貼簿", copyVideoInfoFailed: "複製失敗", copyVideoInfoUnavailable: "請先開啟 YouTube 影片",
    shortsSeekSeconds: "快進秒數", secondsUnit: "秒", shortsArrowKeysTitle: "啟用 Shorts 左右方向鍵",
    shortsArrowKeysDescription: "控制 ←／→ 快退快進，0 回片頭不受影響",
    shortsChannelNamesTitle: "首頁 Shorts 顯示頻道名稱", shortsChannelNamesDescription: "在 Shorts 卡片補上可點擊的頻道名稱",
    globalTheaterTitle: "自動開啟劇院模式", globalTheaterDescription: "進入一般影片時自動切換為劇院模式",
    channelTheater: "這個頻道的劇院模式", theaterInherit: "跟隨全局", theaterOn: "強制開啟", theaterOff: "強制關閉",
    connected: "已連線到目前影片", disconnected: "請開啟 YouTube 影片或 Shorts", languageLabel: "介面語言",
    qualityHighest: "自動最高", quality4k: "4K", quality1080: "1080p", qualityPremiumHint: "Premium 強化畫質由下方開關獨立控制",
    premiumQualityTitle: "使用 Premium 強化畫質", premiumQualityDescription: "開啟後才會選擇 1080p Premium，僅適用已訂閱會員",
    channelPremiumQualityDescription: "只為這個頻道允許選擇 1080p Premium",
    shortsQualityNote: "YouTube Shorts 提供畫質控制時才會套用此偏好。"
  },
  en: {
    appTitle: "YouTube Quick Speed / Quality Settings", system: "System", regular: "Videos", shorts: "Shorts",
    typeLabel: "Video type", allRegular: "All standard videos", allShorts: "All Shorts",
    globalHeading: "Global defaults", saved: "Saved", speed: "Playback speed", quality: "Video quality",
    channelKicker: "Current channel override", loadingChannel: "Loading channel…", noChannel: "No video channel detected",
    currentChannel: "Current channel", channelSpeed: "Playback speed for this channel", channelQuality: "Video quality for this channel",
    enableChannel: "Enable settings for the current channel", removeChannel: "Remove channel settings",
    channelEmpty: "Open this panel on a YouTube video or Short to add channel-specific settings.",
    shortcutTitle: "Quick playback controls", shortcutDescription: "−/+ changes speed, * restores 1×, C copies video info",
    shortsShortcutTitle: "Shorts quick controls", shortsShortcutDescription: "←/→ {seconds}s, 0 restarts; −/+ speed, * 1×, C copies",
    copyVideoInfoTitle: "Copy video title + URL", copyVideoInfoDescription: "Or press C on the video page", copiedVideoInfo: "Copied to clipboard", copyVideoInfoFailed: "Copy failed", copyVideoInfoUnavailable: "Open a YouTube video first",
    shortsSeekSeconds: "Seek interval", secondsUnit: "sec", shortsArrowKeysTitle: "Enable Shorts arrow keys",
    shortsArrowKeysDescription: "Controls ←/→ seeking; 0 always returns to the start",
    shortsChannelNamesTitle: "Show channel names on Home Shorts", shortsChannelNamesDescription: "Add a clickable channel name to Shorts cards on the Home page",
    globalTheaterTitle: "Automatically open Theater mode", globalTheaterDescription: "Switch standard videos to Theater mode when they open",
    channelTheater: "Theater mode for this channel", theaterInherit: "Follow global", theaterOn: "Force on", theaterOff: "Force off",
    connected: "Connected to the current video", disconnected: "Open a YouTube video or Short", languageLabel: "Interface language",
    qualityHighest: "Highest", quality4k: "4K", quality1080: "1080p", qualityPremiumHint: "Premium enhanced quality is controlled separately below",
    premiumQualityTitle: "Use Premium enhanced quality", premiumQualityDescription: "Allows 1080p Premium only when enabled; requires a Premium subscription",
    channelPremiumQualityDescription: "Allow 1080p Premium for this channel only",
    shortsQualityNote: "This preference applies when YouTube provides quality controls for Shorts."
  },
  ja: {
    appTitle: "YouTube 速度 / 画質クイック設定", system: "システム", regular: "通常動画", shorts: "ショート",
    typeLabel: "動画タイプ", allRegular: "すべての通常動画", allShorts: "すべてのショート",
    globalHeading: "全体の既定値", saved: "保存済み", speed: "再生速度", quality: "動画の画質",
    channelKicker: "現在のチャンネルを優先", loadingChannel: "チャンネルを読み込み中…", noChannel: "動画のチャンネルを検出できません",
    currentChannel: "現在のチャンネル", channelSpeed: "このチャンネルの再生速度", channelQuality: "このチャンネルの画質",
    enableChannel: "現在のチャンネル専用設定を有効にする", removeChannel: "チャンネル専用設定を削除",
    channelEmpty: "YouTube 動画またはショートのページでこのパネルを開くと、チャンネル専用設定を追加できます。",
    shortcutTitle: "再生中のクイック操作", shortcutDescription: "−／+ で速度変更、* で 1×、C で動画情報をコピー",
    shortsShortcutTitle: "ショートのクイック操作", shortsShortcutDescription: "←／→ {seconds} 秒、0 先頭、−／+ 速度、* 1×、C コピー",
    copyVideoInfoTitle: "動画タイトル＋URLをコピー", copyVideoInfoDescription: "動画ページで C キーでもコピーできます", copiedVideoInfo: "クリップボードにコピーしました", copyVideoInfoFailed: "コピーに失敗しました", copyVideoInfoUnavailable: "YouTube 動画を開いてください",
    shortsSeekSeconds: "移動秒数", secondsUnit: "秒", shortsArrowKeysTitle: "ショートの左右キーを有効化",
    shortsArrowKeysDescription: "←／→ の移動を制御。0 の先頭移動は常に有効",
    shortsChannelNamesTitle: "ホームのショートにチャンネル名を表示", shortsChannelNamesDescription: "ショートのカードにクリック可能なチャンネル名を追加します",
    globalTheaterTitle: "シアターモードを自動的に有効化", globalTheaterDescription: "通常動画を開いたときにシアターモードへ切り替えます",
    channelTheater: "このチャンネルのシアターモード", theaterInherit: "全体設定に従う", theaterOn: "常にオン", theaterOff: "常にオフ",
    connected: "現在の動画に接続しました", disconnected: "YouTube 動画またはショートを開いてください", languageLabel: "表示言語",
    qualityHighest: "最高画質", quality4k: "4K", quality1080: "1080p", qualityPremiumHint: "Premium 高画質は下のスイッチで個別に設定",
    premiumQualityTitle: "Premium 高画質を使用", premiumQualityDescription: "オンの場合のみ 1080p Premium を選択。Premium 登録が必要です",
    channelPremiumQualityDescription: "このチャンネルだけ 1080p Premium を許可",
    shortsQualityNote: "YouTube がショートの画質設定を提供している場合に適用されます。"
  }
};

const DEFAULT_PROFILE = { speed: 1, quality: "hd1080", premiumQualityEnabled: false };
const DEFAULT_SETTINGS = {
  language: "system",
  global: { ...DEFAULT_PROFILE, theaterModeEnabled: false },
  shorts: { ...DEFAULT_PROFILE },
  shortsControls: { seekSeconds: 5, arrowKeysEnabled: true, channelNamesEnabled: true },
  channels: {}
};

let settings = structuredClone(DEFAULT_SETTINGS);
let context = null;
let activeContentType = "regular";
let activeLanguage = "zh-Hant";
let saveTimer = null;
const $ = (selector) => document.querySelector(selector);

function normalizeProfile(value, fallback = DEFAULT_PROFILE) {
  return {
    speed: SPEEDS.includes(Number(value?.speed)) ? Number(value.speed) : fallback.speed,
    quality: QUALITIES.some((item) => item.value === value?.quality) ? value.quality : fallback.quality,
    premiumQualityEnabled: value?.premiumQualityEnabled === true
  };
}

function normalizeSettings(value) {
  const global = {
    ...normalizeProfile(value?.global),
    theaterModeEnabled: value?.global?.theaterModeEnabled === true
  };
  const shorts = normalizeProfile(value?.shorts, global);
  const channels = {};
  if (value?.channels && typeof value.channels === "object") {
    Object.entries(value.channels).forEach(([id, channel]) => {
      const legacy = normalizeProfile(channel, global);
      channels[id] = {
        name: channel?.name || "",
        regular: {
          ...normalizeProfile(channel?.regular, legacy),
          theaterModeOverride: THEATER_OVERRIDES.includes(channel?.regular?.theaterModeOverride)
            ? channel.regular.theaterModeOverride
            : "inherit"
        },
        shorts: normalizeProfile(channel?.shorts, legacy)
      };
    });
  }
  return {
    language: LANGUAGES.includes(value?.language) ? value.language : "system",
    global,
    shorts,
    shortsControls: {
      seekSeconds: SHORTS_SEEK_SECONDS.includes(Number(value?.shortsControls?.seekSeconds)) ? Number(value.shortsControls.seekSeconds) : 5,
      arrowKeysEnabled: value?.shortsControls?.arrowKeysEnabled !== false,
      channelNamesEnabled: value?.shortsControls?.channelNamesEnabled !== false
    },
    channels
  };
}

function systemLanguage() {
  const language = chrome.i18n?.getUILanguage?.() || navigator.language || "en";
  if (language.toLowerCase().startsWith("zh")) return "zh-Hant";
  if (language.toLowerCase().startsWith("ja")) return "ja";
  return "en";
}

function resolveLanguage() {
  return settings.language === "system" ? systemLanguage() : settings.language;
}

function t(key) {
  return MESSAGES[activeLanguage]?.[key] || MESSAGES.en[key] || key;
}

function profileKey(type = activeContentType) {
  return type === "shorts" ? "shorts" : "global";
}

function channelProfile(channel, type = activeContentType) {
  return channel?.[type === "shorts" ? "shorts" : "regular"];
}

function applyTranslations() {
  activeLanguage = resolveLanguage();
  document.documentElement.lang = activeLanguage;
  document.title = t("appTitle");
  $("#appTitle").textContent = t("appTitle");
  $("#languageLabel").textContent = t("languageLabel");
  $("#languageSelect").options[0].textContent = t("system");
  $("#typeSwitch").setAttribute("aria-label", t("typeLabel"));
  $("[data-content-type='regular']").textContent = t("regular");
  $("[data-content-type='shorts']").textContent = t("shorts");
  $("#globalHeading").textContent = t("globalHeading");
  $("#saveState").textContent = t("saved");
  $("#globalSpeedLegend").textContent = t("speed");
  $("#globalQualityLegend").textContent = t("quality");
  $("#channelKicker").textContent = t("channelKicker");
  $("#channelToggleLabel").textContent = t("enableChannel");
  $("#channelSpeedLegend").textContent = t("channelSpeed");
  $("#channelQualityLegend").textContent = t("channelQuality");
  $("#removeChannel").textContent = t("removeChannel");
  $("#channelEmpty").textContent = t("channelEmpty");
  $("#copyVideoInfoTitle").textContent = t("copyVideoInfoTitle");
  $("#copyVideoInfoDescription").textContent = t("copyVideoInfoDescription");
  const isShorts = activeContentType === "shorts";
  $("#shortcutTitle").textContent = t(isShorts ? "shortsShortcutTitle" : "shortcutTitle");
  $("#shortcutDescription").textContent = t(isShorts ? "shortsShortcutDescription" : "shortcutDescription")
    .replace("{seconds}", String(settings.shortsControls.seekSeconds));
  const shortcutKeys = $("#shortcutKeys");
  shortcutKeys.classList.toggle("shorts", isShorts);
  shortcutKeys.replaceChildren(...(isShorts ? ["←", "→", "0", "−", "＋", "＊", "C"] : ["−", "＋", "＊", "C"]).map((key) => {
    const element = document.createElement("kbd");
    element.textContent = key;
    return element;
  }));
  $("#globalKicker").textContent = t(activeContentType === "shorts" ? "allShorts" : "allRegular");
  $("#shortsQualityNote").textContent = t("shortsQualityNote");
  $("#shortsQualityNote").hidden = activeContentType !== "shorts";
  $("#shortsSeekSecondsLegend").textContent = t("shortsSeekSeconds");
  $("#shortsArrowKeysTitle").textContent = t("shortsArrowKeysTitle");
  $("#shortsArrowKeysDescription").textContent = t("shortsArrowKeysDescription");
  $("#shortsArrowKeysLabel").textContent = t("shortsArrowKeysTitle");
  $("#shortsChannelNamesTitle").textContent = t("shortsChannelNamesTitle");
  $("#shortsChannelNamesDescription").textContent = t("shortsChannelNamesDescription");
  $("#shortsChannelNamesLabel").textContent = t("shortsChannelNamesTitle");
  $("#globalTheaterTitle").textContent = t("globalTheaterTitle");
  $("#globalTheaterDescription").textContent = t("globalTheaterDescription");
  $("#globalTheaterLabel").textContent = t("globalTheaterTitle");
  $("#channelTheaterLegend").textContent = t("channelTheater");
  $("#globalPremiumQualityTitle").textContent = t("premiumQualityTitle");
  $("#globalPremiumQualityDescription").textContent = t("premiumQualityDescription");
  $("#globalPremiumQualityLabel").textContent = t("premiumQualityTitle");
  $("#channelPremiumQualityTitle").textContent = t("premiumQualityTitle");
  $("#channelPremiumQualityDescription").textContent = t("channelPremiumQualityDescription");
  $("#channelPremiumQualityLabel").textContent = t("premiumQualityTitle");
  $("#statusDot").title = context?.isVideo ? t("connected") : t("disconnected");
}

function createSpeedControl(container, selected, onChange) {
  container.replaceChildren();
  const selectedIndex = Math.max(0, SPEEDS.indexOf(Number(selected)));
  container.style.setProperty("--track-progress", `${(selectedIndex / (SPEEDS.length - 1)) * 100}%`);
  SPEEDS.forEach((speed) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `option-button${Number(selected) === speed ? " selected" : ""}`;
    button.textContent = `${speed}×`;
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", String(Number(selected) === speed));
    button.addEventListener("click", () => onChange(speed));
    container.append(button);
  });
}

function createQualityControl(container, selected, onChange) {
  container.replaceChildren();
  QUALITIES.forEach(({ value, labelKey, hintKey }) => {
    const label = t(labelKey);
    const hint = hintKey ? t(hintKey) : "";
    const button = document.createElement("button");
    button.type = "button";
    button.className = `quality-button${selected === value ? " selected" : ""}`;
    button.textContent = label;
    if (hint) {
      button.title = hint;
      button.setAttribute("aria-label", `${label}, ${hint}`);
    }
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", String(selected === value));
    button.addEventListener("click", () => onChange(value));
    container.append(button);
  });
}

function createTheaterOverrideControl(container, selected, onChange) {
  const options = [
    { value: "inherit", label: t("theaterInherit") },
    { value: "on", label: t("theaterOn") },
    { value: "off", label: t("theaterOff") }
  ];
  container.replaceChildren();
  options.forEach(({ value, label }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `quality-button${selected === value ? " selected" : ""}`;
    button.textContent = label;
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", String(selected === value));
    button.addEventListener("click", () => onChange(value));
    container.append(button);
  });
}

function flashSaved() {
  const el = $("#saveState");
  el.classList.add("visible");
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => el.classList.remove("visible"), 1100);
}

async function persist() {
  await chrome.storage.sync.set({ ytQuickSettings: settings });
  flashSaved();
}

function renderGlobal() {
  const profile = settings[profileKey()];
  createSpeedControl($("#globalSpeed"), profile.speed, async (speed) => {
    profile.speed = speed;
    renderGlobal();
    await persist();
  });
  createQualityControl($("#globalQuality"), profile.quality, async (quality) => {
    profile.quality = quality;
    renderGlobal();
    await persist();
  });
  const theaterSetting = $("#globalTheaterSetting");
  theaterSetting.hidden = activeContentType === "shorts";
  $("#globalTheaterEnabled").checked = settings.global.theaterModeEnabled;
  const premiumQualitySetting = $("#globalPremiumQualitySetting");
  premiumQualitySetting.hidden = activeContentType === "shorts";
  $("#globalPremiumQualityEnabled").checked = settings.global.premiumQualityEnabled;
  renderShortsControls();
}

function renderShortsControls() {
  const container = $("#shortsControls");
  const visible = activeContentType === "shorts";
  container.hidden = !visible;
  if (!visible) return;
  const selected = settings.shortsControls.seekSeconds;
  const choices = $("#shortsSeekSeconds");
  choices.replaceChildren();
  SHORTS_SEEK_SECONDS.forEach((seconds) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `quality-button${selected === seconds ? " selected" : ""}`;
    button.textContent = `${seconds} ${t("secondsUnit")}`;
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", String(selected === seconds));
    button.addEventListener("click", async () => {
      settings.shortsControls.seekSeconds = seconds;
      renderType();
      await persist();
    });
    choices.append(button);
  });
  $("#shortsArrowKeysEnabled").checked = settings.shortsControls.arrowKeysEnabled;
  $("#shortsChannelNamesEnabled").checked = settings.shortsControls.channelNamesEnabled;
}

function channelInitial(name) {
  return (name || t("currentChannel")).trim().slice(0, 1).toLocaleUpperCase(activeLanguage);
}

function renderChannel() {
  const available = Boolean(context?.isVideo && context?.channelId);
  const channel = available ? settings.channels[context.channelId] : null;
  const enabled = Boolean(channel);
  const toggle = $("#channelEnabled");
  toggle.disabled = !available;
  toggle.checked = enabled;
  $("#channelControls").hidden = !enabled;
  $("#channelEmpty").hidden = available;

  if (!available) {
    $("#channelHeading").textContent = t("noChannel");
    $("#channelAvatar").textContent = t("currentChannel").slice(0, 1);
    return;
  }

  $("#channelHeading").textContent = context.channelName || t("currentChannel");
  $("#channelAvatar").textContent = channelInitial(context.channelName);
  if (!enabled) return;

  const profile = channelProfile(channel);
  createSpeedControl($("#channelSpeed"), profile.speed, async (speed) => {
    profile.speed = speed;
    renderChannel();
    await persist();
  });
  createQualityControl($("#channelQuality"), profile.quality, async (quality) => {
    profile.quality = quality;
    renderChannel();
    await persist();
  });
  const premiumQualitySetting = $("#channelPremiumQualitySetting");
  premiumQualitySetting.hidden = activeContentType === "shorts";
  $("#channelPremiumQualityEnabled").checked = profile.premiumQualityEnabled;
  const theaterFieldset = $("#channelTheaterFieldset");
  theaterFieldset.hidden = activeContentType === "shorts";
  if (activeContentType === "regular") {
    createTheaterOverrideControl($("#channelTheaterMode"), profile.theaterModeOverride, async (value) => {
      profile.theaterModeOverride = value;
      renderChannel();
      await persist();
    });
  }
}

function renderType() {
  document.querySelectorAll("[data-content-type]").forEach((button) => {
    const selected = button.dataset.contentType === activeContentType;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-current", selected ? "true" : "false");
  });
  applyTranslations();
  renderGlobal();
  renderChannel();
}

async function getPageContext() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url?.startsWith("https://www.youtube.com/")) return null;
  try {
    return await chrome.tabs.sendMessage(tab.id, { type: "YTQS_GET_CONTEXT" });
  } catch {
    return null;
  }
}

async function copyTextToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function showCopyButtonState(state) {
  const button = $("#copyVideoInfo");
  button.classList.toggle("copied", state === "copied");
  button.classList.toggle("failed", state === "failed");
  $("#copyVideoInfoState").textContent = state === "copied" ? t("copiedVideoInfo") : state === "failed" ? t("copyVideoInfoFailed") : "";
  $("#copyVideoInfoDescription").textContent = state === "copied"
    ? t("copiedVideoInfo")
    : state === "failed"
      ? t("copyVideoInfoFailed")
      : t("copyVideoInfoDescription");
  clearTimeout(showCopyButtonState.timer);
  if (state) showCopyButtonState.timer = setTimeout(() => showCopyButtonState(""), 1800);
}

$("#typeSwitch").addEventListener("click", (event) => {
  const button = event.target.closest("[data-content-type]");
  if (!button || !PROFILE_KEYS.includes(button.dataset.contentType)) return;
  activeContentType = button.dataset.contentType;
  renderType();
});

$("#languageSelect").addEventListener("change", async (event) => {
  settings.language = LANGUAGES.includes(event.target.value) ? event.target.value : "system";
  renderType();
  await persist();
});

$("#shortsArrowKeysEnabled").addEventListener("change", async (event) => {
  settings.shortsControls.arrowKeysEnabled = event.target.checked;
  applyTranslations();
  await persist();
});

$("#shortsChannelNamesEnabled").addEventListener("change", async (event) => {
  settings.shortsControls.channelNamesEnabled = event.target.checked;
  await persist();
});

$("#copyVideoInfo").addEventListener("click", async () => {
  if (!context?.videoTitle || !context?.videoUrl) {
    showCopyButtonState("failed");
    $("#copyVideoInfoDescription").textContent = t("copyVideoInfoUnavailable");
    return;
  }
  const copied = await copyTextToClipboard(`${context.videoTitle}\n${context.videoUrl}`);
  showCopyButtonState(copied ? "copied" : "failed");
});

$("#globalTheaterEnabled").addEventListener("change", async (event) => {
  settings.global.theaterModeEnabled = event.target.checked;
  await persist();
});

$("#globalPremiumQualityEnabled").addEventListener("change", async (event) => {
  settings.global.premiumQualityEnabled = event.target.checked;
  await persist();
});

$("#channelPremiumQualityEnabled").addEventListener("change", async (event) => {
  if (!context?.channelId || activeContentType !== "regular") return;
  const profile = channelProfile(settings.channels[context.channelId], "regular");
  if (!profile) return;
  profile.premiumQualityEnabled = event.target.checked;
  await persist();
});

$("#channelEnabled").addEventListener("change", async (event) => {
  if (!context?.channelId) return;
  if (event.target.checked) {
    settings.channels[context.channelId] = {
      name: context.channelName || t("currentChannel"),
      regular: {
        speed: settings.global.speed,
        quality: settings.global.quality,
        premiumQualityEnabled: settings.global.premiumQualityEnabled,
        theaterModeOverride: "inherit"
      },
      shorts: { ...settings.shorts }
    };
  } else {
    delete settings.channels[context.channelId];
  }
  renderChannel();
  await persist();
});

$("#removeChannel").addEventListener("click", async () => {
  if (!context?.channelId) return;
  delete settings.channels[context.channelId];
  renderChannel();
  await persist();
});

async function init() {
  const stored = await chrome.storage.sync.get("ytQuickSettings");
  settings = normalizeSettings(stored.ytQuickSettings);
  $("#languageSelect").value = settings.language;
  context = await getPageContext();
  activeContentType = context?.contentType === "shorts" ? "shorts" : "regular";
  $("#statusDot").classList.toggle("online", Boolean(context?.isVideo));
  $("#copyVideoInfo").disabled = !context?.isVideo;
  renderType();
}

init();
