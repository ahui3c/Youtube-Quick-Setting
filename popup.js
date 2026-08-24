const SPEEDS = [0.7, 1, 1.25, 2, 3];
const QUALITIES = [
  { value: "highest", labelKey: "qualityHighest" },
  { value: "hd2160", labelKey: "quality4k" },
  { value: "hd1080", labelKey: "quality1080", hintKey: "qualityPremiumHint" }
];
const PROFILE_KEYS = ["regular", "shorts"];
const LANGUAGES = ["system", "zh-Hant", "en", "ja"];

const MESSAGES = {
  "zh-Hant": {
    appTitle: "YouTube 快速設定速度 / 畫質", system: "系統", regular: "一般影片", shorts: "Shorts",
    typeLabel: "影片類型", allRegular: "所有一般影片", allShorts: "所有 Shorts",
    globalHeading: "全域預設", saved: "已儲存", speed: "播放速度", quality: "影片畫質",
    channelKicker: "目前頻道優先", loadingChannel: "正在讀取頻道…", noChannel: "尚未偵測到影片頻道",
    currentChannel: "目前頻道", channelSpeed: "這個頻道的播放速度", channelQuality: "這個頻道的影片畫質",
    enableChannel: "啟用目前頻道專屬設定", removeChannel: "移除頻道專屬設定",
    channelEmpty: "請在 YouTube 影片或 Shorts 頁面開啟此面板，即可加入頻道專屬設定。",
    shortcutTitle: "播放時直接調速", shortcutDescription: "按 −／+ 切換速度，按 * 恢復 1×",
    shortsShortcutTitle: "Shorts 快速操作", shortsShortcutDescription: "←／→ 前後 5 秒，0 回片頭；−／+ 調速，* 回復 1×",
    connected: "已連線到目前影片", disconnected: "請開啟 YouTube 影片或 Shorts", languageLabel: "介面語言",
    qualityHighest: "自動最高", quality4k: "4K", quality1080: "1080p", qualityPremiumHint: "可用時優先使用 1080p Premium",
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
    shortcutTitle: "Adjust speed while playing", shortcutDescription: "Press −/+ to change speed, or * to restore 1×",
    shortsShortcutTitle: "Shorts quick controls", shortsShortcutDescription: "←/→ seek 5 sec, 0 restarts; −/+ changes speed, * restores 1×",
    connected: "Connected to the current video", disconnected: "Open a YouTube video or Short", languageLabel: "Interface language",
    qualityHighest: "Highest", quality4k: "4K", quality1080: "1080p", qualityPremiumHint: "Prefer 1080p Premium when available",
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
    shortcutTitle: "再生中に速度を変更", shortcutDescription: "−／+ で速度変更、* で 1× に戻す",
    shortsShortcutTitle: "ショートのクイック操作", shortsShortcutDescription: "←／→ で 5 秒移動、0 で先頭へ。−／+ で速度変更、* で 1×",
    connected: "現在の動画に接続しました", disconnected: "YouTube 動画またはショートを開いてください", languageLabel: "表示言語",
    qualityHighest: "最高画質", quality4k: "4K", quality1080: "1080p", qualityPremiumHint: "利用可能なら 1080p Premium を優先",
    shortsQualityNote: "YouTube がショートの画質設定を提供している場合に適用されます。"
  }
};

const DEFAULT_PROFILE = { speed: 1, quality: "hd1080" };
const DEFAULT_SETTINGS = {
  language: "system",
  global: { ...DEFAULT_PROFILE },
  shorts: { ...DEFAULT_PROFILE },
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
    quality: QUALITIES.some((item) => item.value === value?.quality) ? value.quality : fallback.quality
  };
}

function normalizeSettings(value) {
  const global = normalizeProfile(value?.global);
  const shorts = normalizeProfile(value?.shorts, global);
  const channels = {};
  if (value?.channels && typeof value.channels === "object") {
    Object.entries(value.channels).forEach(([id, channel]) => {
      const legacy = normalizeProfile(channel, global);
      channels[id] = {
        name: channel?.name || "",
        regular: normalizeProfile(channel?.regular, legacy),
        shorts: normalizeProfile(channel?.shorts, legacy)
      };
    });
  }
  return {
    language: LANGUAGES.includes(value?.language) ? value.language : "system",
    global,
    shorts,
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
  const isShorts = activeContentType === "shorts";
  $("#shortcutTitle").textContent = t(isShorts ? "shortsShortcutTitle" : "shortcutTitle");
  $("#shortcutDescription").textContent = t(isShorts ? "shortsShortcutDescription" : "shortcutDescription");
  const shortcutKeys = $("#shortcutKeys");
  shortcutKeys.classList.toggle("shorts", isShorts);
  shortcutKeys.replaceChildren(...(isShorts ? ["←", "→", "0", "−", "＋", "＊"] : ["−", "＋", "＊"]).map((key) => {
    const element = document.createElement("kbd");
    element.textContent = key;
    return element;
  }));
  $("#globalKicker").textContent = t(activeContentType === "shorts" ? "allShorts" : "allRegular");
  $("#shortsQualityNote").textContent = t("shortsQualityNote");
  $("#shortsQualityNote").hidden = activeContentType !== "shorts";
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

$("#channelEnabled").addEventListener("change", async (event) => {
  if (!context?.channelId) return;
  if (event.target.checked) {
    settings.channels[context.channelId] = {
      name: context.channelName || t("currentChannel"),
      regular: { ...settings.global },
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
  renderType();
}

init();
