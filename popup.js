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
const COPY_FORMATS = YTQSCopy.FORMATS;
const SETTINGS_FORMAT_VERSION = YTQSSettingsTransfer.FORMAT_VERSION;
const RESTORE_POINT_KEY = "ytQuickSettingsRestorePoint";

const MESSAGES = {
  "zh-Hant": {
    appTitle: "YouTube 快速設定速度 / 畫質", system: "系統", regular: "一般影片", shorts: "Shorts",
    typeLabel: "影片類型", allRegular: "所有一般影片", allShorts: "所有 Shorts",
    globalHeading: "全域預設", saved: "已儲存", speed: "播放速度", quality: "影片畫質",
    channelKicker: "目前頻道優先", loadingChannel: "正在讀取頻道…", noChannel: "尚未偵測到影片頻道",
    currentChannel: "目前頻道", channelSpeed: "這個頻道的播放速度", channelQuality: "這個頻道的影片畫質",
    enableChannel: "啟用目前頻道專屬設定", removeChannel: "移除頻道專屬設定",
    channelEmpty: "請在 YouTube 影片或 Shorts 頁面開啟此面板，即可加入頻道專屬設定。",
    shortcutTitle: "播放時快速操作", shortcutDescription: "−／+ 調速，* 回復 1×，S 複製，Shift+S 標題＋時間點",
    shortsShortcutTitle: "Shorts 快速操作", shortsShortcutDescription: "←／→ {seconds} 秒，0 片頭；−／+ 調速，* 1×，S 複製，Shift+S 標題＋時間點",
    copyVideoInfoTitle: "複製影片資訊", copyVideoInfoDescription: "預設：{format}｜S；Shift+S 複製標題＋時間點", copiedVideoInfo: "已複製到剪貼簿", copyVideoInfoFailed: "複製失敗", copyVideoInfoUnavailable: "請先開啟 YouTube 影片", copyFormatToggle: "選擇複製格式",
    copyFormatTitleUrl: "標題＋網址", copyFormatTimestampUrl: "標題＋目前時間點網址", copyFormatMarkdown: "Markdown 連結", copyFormatHtml: "HTML 超連結", copyFormatChannelTitleUrl: "頻道＋標題＋網址",
    settingsTransferTitle: "設定備份與還原", settingsTransferDescription: "匯出、匯入或回復上次設定", exportSettings: "匯出 JSON", importSettings: "匯入 JSON", restoreSettings: "還原上次匯入前設定", settingsTransferNote: "設定檔只在你的裝置上處理。", settingsExported: "設定已匯出", settingsImported: "設定已匯入", settingsRestored: "設定已還原", settingsTransferFailed: "無法處理設定檔",
    importDialogKicker: "匯入預覽", importDialogTitle: "確認設定變更", importModeLegend: "匯入方式", importModeMerge: "合併設定", importModeReplace: "完全取代", previewSections: "一般設定變更", previewAdded: "新增頻道", previewUpdated: "更新頻道", previewRemoved: "移除頻道", previewTotal: "匯入後頻道總數", importRestoreNote: "套用前會自動建立可還原的本機備份。", cancelImport: "取消", applyImport: "套用匯入", invalidImportFile: "這不是有效的 YouTube 快速設定檔。", newerImportFile: "此設定檔來自較新版本，請先更新插件。", restorePointCreated: "已建立匯入前還原點",
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
    shortcutTitle: "Quick playback controls", shortcutDescription: "−/+ speed, * resets, S copies, Shift+S copies title + timestamp",
    shortsShortcutTitle: "Shorts quick controls", shortsShortcutDescription: "←/→ {seconds}s, 0 restarts; −/+ speed, * 1×, S copies, Shift+S title + timestamp",
    copyVideoInfoTitle: "Copy video info", copyVideoInfoDescription: "Default: {format} | S; Shift+S copies title + timestamp", copiedVideoInfo: "Copied to clipboard", copyVideoInfoFailed: "Copy failed", copyVideoInfoUnavailable: "Open a YouTube video first", copyFormatToggle: "Choose copy format",
    copyFormatTitleUrl: "Title + URL", copyFormatTimestampUrl: "Title + URL at current time", copyFormatMarkdown: "Markdown link", copyFormatHtml: "HTML link", copyFormatChannelTitleUrl: "Channel + title + URL",
    settingsTransferTitle: "Backup and restore settings", settingsTransferDescription: "Export, import, or restore the last settings", exportSettings: "Export JSON", importSettings: "Import JSON", restoreSettings: "Restore pre-import settings", settingsTransferNote: "Settings files are processed only on your device.", settingsExported: "Settings exported", settingsImported: "Settings imported", settingsRestored: "Settings restored", settingsTransferFailed: "Could not process the settings file",
    importDialogKicker: "Import preview", importDialogTitle: "Confirm settings changes", importModeLegend: "Import mode", importModeMerge: "Merge settings", importModeReplace: "Replace all", previewSections: "General settings changed", previewAdded: "Channels added", previewUpdated: "Channels updated", previewRemoved: "Channels removed", previewTotal: "Channels after import", importRestoreNote: "A local restore point will be created before applying.", cancelImport: "Cancel", applyImport: "Apply import", invalidImportFile: "This is not a valid YouTube Quick Setting file.", newerImportFile: "This file is from a newer version. Update the extension first.", restorePointCreated: "Pre-import restore point created",
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
    shortcutTitle: "再生中のクイック操作", shortcutDescription: "−／+ 速度、* で 1×、S コピー、Shift+S タイトル＋現在位置",
    shortsShortcutTitle: "ショートのクイック操作", shortsShortcutDescription: "←／→ {seconds} 秒、0 先頭、−／+ 速度、* 1×、S コピー、Shift+S タイトル＋現在位置",
    copyVideoInfoTitle: "動画情報をコピー", copyVideoInfoDescription: "既定：{format}｜S、Shift+S はタイトル＋現在位置", copiedVideoInfo: "クリップボードにコピーしました", copyVideoInfoFailed: "コピーに失敗しました", copyVideoInfoUnavailable: "YouTube 動画を開いてください", copyFormatToggle: "コピー形式を選択",
    copyFormatTitleUrl: "タイトル＋URL", copyFormatTimestampUrl: "タイトル＋現在位置の URL", copyFormatMarkdown: "Markdown リンク", copyFormatHtml: "HTML リンク", copyFormatChannelTitleUrl: "チャンネル＋タイトル＋URL",
    settingsTransferTitle: "設定のバックアップと復元", settingsTransferDescription: "書き出し、読み込み、前回設定の復元", exportSettings: "JSON を書き出す", importSettings: "JSON を読み込む", restoreSettings: "読み込み前の設定に戻す", settingsTransferNote: "設定ファイルは端末内だけで処理されます。", settingsExported: "設定を書き出しました", settingsImported: "設定を読み込みました", settingsRestored: "設定を復元しました", settingsTransferFailed: "設定ファイルを処理できませんでした",
    importDialogKicker: "読み込みプレビュー", importDialogTitle: "設定変更の確認", importModeLegend: "読み込み方法", importModeMerge: "設定を結合", importModeReplace: "すべて置換", previewSections: "一般設定の変更", previewAdded: "追加チャンネル", previewUpdated: "更新チャンネル", previewRemoved: "削除チャンネル", previewTotal: "読み込み後のチャンネル数", importRestoreNote: "適用前にローカル復元ポイントを自動作成します。", cancelImport: "キャンセル", applyImport: "読み込みを適用", invalidImportFile: "有効な YouTube クイック設定ファイルではありません。", newerImportFile: "新しいバージョンの設定ファイルです。先に拡張機能を更新してください。", restorePointCreated: "読み込み前の復元ポイントを作成しました",
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
  schemaVersion: SETTINGS_FORMAT_VERSION,
  language: "system",
  global: { ...DEFAULT_PROFILE, theaterModeEnabled: false },
  shorts: { ...DEFAULT_PROFILE },
  shortsControls: { seekSeconds: 5, arrowKeysEnabled: true, channelNamesEnabled: true },
  copy: { defaultFormat: YTQSCopy.DEFAULT_FORMAT },
  channels: {}
};

let settings = structuredClone(DEFAULT_SETTINGS);
let context = null;
let activeContentType = "regular";
let activeLanguage = "zh-Hant";
let saveTimer = null;
let pendingImport = null;
let restorePoint = null;
const $ = (selector) => document.querySelector(selector);

function normalizeProfile(value, fallback = DEFAULT_PROFILE) {
  return {
    speed: SPEEDS.includes(Number(value?.speed)) ? Number(value.speed) : fallback.speed,
    quality: QUALITIES.some((item) => item.value === value?.quality) ? value.quality : fallback.quality,
    premiumQualityEnabled: value?.premiumQualityEnabled === true
  };
}

function migrateSettings(value) {
  const migrated = value && typeof value === "object" ? structuredClone(value) : {};
  const version = Number(migrated.schemaVersion || 1);
  if (version < 2) migrated.copy = { defaultFormat: YTQSCopy.DEFAULT_FORMAT, ...(migrated.copy || {}) };
  migrated.schemaVersion = SETTINGS_FORMAT_VERSION;
  return migrated;
}

function normalizeSettings(value) {
  value = migrateSettings(value);
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
    schemaVersion: SETTINGS_FORMAT_VERSION,
    language: LANGUAGES.includes(value?.language) ? value.language : "system",
    global,
    shorts,
    shortsControls: {
      seekSeconds: SHORTS_SEEK_SECONDS.includes(Number(value?.shortsControls?.seekSeconds)) ? Number(value.shortsControls.seekSeconds) : 5,
      arrowKeysEnabled: value?.shortsControls?.arrowKeysEnabled !== false,
      channelNamesEnabled: value?.shortsControls?.channelNamesEnabled !== false
    },
    copy: {
      defaultFormat: COPY_FORMATS.includes(value?.copy?.defaultFormat) ? value.copy.defaultFormat : YTQSCopy.DEFAULT_FORMAT
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

function copyFormatLabel(format) {
  const keys = {
    "title-url": "copyFormatTitleUrl",
    "timestamp-url": "copyFormatTimestampUrl",
    markdown: "copyFormatMarkdown",
    html: "copyFormatHtml",
    "channel-title-url": "copyFormatChannelTitleUrl"
  };
  return t(keys[format] || keys[YTQSCopy.DEFAULT_FORMAT]);
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
  $("#copyVideoInfoDescription").textContent = t("copyVideoInfoDescription").replace("{format}", copyFormatLabel(settings.copy.defaultFormat));
  $("#copyFormatToggleLabel").textContent = t("copyFormatToggle");
  $("#copyFormatToggle").setAttribute("aria-label", t("copyFormatToggle"));
  $("#settingsTransferTitle").textContent = t("settingsTransferTitle");
  $("#settingsTransferDescription").textContent = t("settingsTransferDescription");
  $("#exportSettingsLabel").textContent = t("exportSettings");
  $("#importSettingsLabel").textContent = t("importSettings");
  $("#restoreSettingsLabel").textContent = t("restoreSettings");
  $("#settingsTransferNote").textContent = t("settingsTransferNote");
  $("#settingsVersionBadge").textContent = `v${SETTINGS_FORMAT_VERSION}`;
  $("#importDialogKicker").textContent = t("importDialogKicker");
  $("#importDialogTitle").textContent = t("importDialogTitle");
  $("#importModeLegend").textContent = t("importModeLegend");
  $("#importModeMerge").textContent = t("importModeMerge");
  $("#importModeReplace").textContent = t("importModeReplace");
  $("#previewSectionsLabel").textContent = t("previewSections");
  $("#previewAddedLabel").textContent = t("previewAdded");
  $("#previewUpdatedLabel").textContent = t("previewUpdated");
  $("#previewRemovedLabel").textContent = t("previewRemoved");
  $("#previewTotalLabel").textContent = t("previewTotal");
  $("#importRestoreNote").textContent = t("importRestoreNote");
  $("#cancelImport").textContent = t("cancelImport");
  $("#applyImport").textContent = t("applyImport");
  const isShorts = activeContentType === "shorts";
  $("#shortcutTitle").textContent = t(isShorts ? "shortsShortcutTitle" : "shortcutTitle");
  $("#shortcutDescription").textContent = t(isShorts ? "shortsShortcutDescription" : "shortcutDescription")
    .replace("{seconds}", String(settings.shortsControls.seekSeconds));
  const shortcutKeys = $("#shortcutKeys");
  shortcutKeys.classList.toggle("shorts", isShorts);
  shortcutKeys.replaceChildren(...(isShorts ? ["←", "→", "0", "−", "＋", "＊", "S"] : ["−", "＋", "＊", "S"]).map((key) => {
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
  renderCopyFormatMenu();
  renderRestorePoint();
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

function showCopyButtonState(state, summary = "") {
  const button = $("#copyVideoInfo");
  button.classList.toggle("copied", state === "copied");
  button.classList.toggle("failed", state === "failed");
  const stateElement = $("#copyVideoInfoState");
  stateElement.textContent = state === "copied"
    ? `${t("copiedVideoInfo")} · ${summary}`
    : state === "failed" ? t("copyVideoInfoFailed") : "";
  stateElement.hidden = !state;
  $("#copyVideoInfoDescription").textContent = state === "copied"
    ? t("copiedVideoInfo")
    : state === "failed"
      ? t("copyVideoInfoFailed")
      : t("copyVideoInfoDescription").replace("{format}", copyFormatLabel(settings.copy.defaultFormat));
  clearTimeout(showCopyButtonState.timer);
  if (state) showCopyButtonState.timer = setTimeout(() => showCopyButtonState(""), 1800);
}

function closeCopyFormatMenu() {
  $("#copyFormatMenu").hidden = true;
  $("#copyFormatToggle").setAttribute("aria-expanded", "false");
}

function renderCopyFormatMenu() {
  const menu = $("#copyFormatMenu");
  if (!menu) return;
  menu.replaceChildren(...COPY_FORMATS.map((format) => {
    const button = document.createElement("button");
    const selected = settings.copy.defaultFormat === format;
    button.type = "button";
    button.dataset.copyFormat = format;
    button.setAttribute("role", "menuitemradio");
    button.setAttribute("aria-checked", String(selected));
    const check = document.createElement("span");
    check.className = "copy-format-check";
    check.textContent = selected ? "✓" : "";
    const label = document.createElement("span");
    label.textContent = copyFormatLabel(format);
    button.append(check, label);
    return button;
  }));
}

async function copyVideoInfo(format, rememberAsDefault = false) {
  const freshContext = await getPageContext();
  if (freshContext?.isVideo) context = freshContext;
  if (!context?.videoTitle || !context?.videoUrl) {
    showCopyButtonState("failed");
    $("#copyVideoInfoDescription").textContent = t("copyVideoInfoUnavailable");
    return false;
  }
  const selectedFormat = COPY_FORMATS.includes(format) ? format : settings.copy.defaultFormat;
  if (rememberAsDefault && settings.copy.defaultFormat !== selectedFormat) {
    settings.copy.defaultFormat = selectedFormat;
    await persist();
    applyTranslations();
  }
  const text = YTQSCopy.formatVideoInfo({
    title: context.videoTitle,
    url: context.videoUrl,
    channelName: context.channelName,
    currentTime: context.currentTime
  }, selectedFormat);
  const copied = Boolean(text) && await copyTextToClipboard(text);
  showCopyButtonState(copied ? "copied" : "failed", YTQSCopy.summarize(text));
  return copied;
}

function setTransferStatus(messageKey, isError = false) {
  const element = $("#settingsTransferStatus");
  element.textContent = messageKey ? t(messageKey) : "";
  element.classList.toggle("error", isError);
}

function formatRestoreTime(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat(activeLanguage === "zh-Hant" ? "zh-TW" : activeLanguage, {
    month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit"
  }).format(date);
}

function renderRestorePoint() {
  const button = $("#restoreSettings");
  if (!button) return;
  button.hidden = !restorePoint?.settings;
  $("#restoreSettingsTime").textContent = restorePoint?.createdAt ? formatRestoreTime(restorePoint.createdAt) : "";
}

async function loadRestorePoint() {
  try {
    const stored = await chrome.storage.local.get(RESTORE_POINT_KEY);
    restorePoint = stored[RESTORE_POINT_KEY] || null;
  } catch {
    restorePoint = null;
  }
  renderRestorePoint();
}

async function saveRestorePoint(currentSettings) {
  restorePoint = {
    formatVersion: SETTINGS_FORMAT_VERSION,
    createdAt: new Date().toISOString(),
    settings: structuredClone(currentSettings)
  };
  await chrome.storage.local.set({ [RESTORE_POINT_KEY]: restorePoint });
  renderRestorePoint();
}

function exportSettings() {
  const version = chrome.runtime?.getManifest?.().version || "";
  const payload = YTQSSettingsTransfer.createExport(settings, version);
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `youtube-quick-setting-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  setTransferStatus("settingsExported");
}

function selectedImportMode() {
  return document.querySelector('input[name="importMode"]:checked')?.value === "replace" ? "replace" : "merge";
}

function updateImportPreview() {
  if (!pendingImport) return;
  const result = YTQSSettingsTransfer.preview(settings, pendingImport.settings, selectedImportMode());
  $("#previewSections").textContent = String(result.sections);
  $("#previewAdded").textContent = String(result.added);
  $("#previewUpdated").textContent = String(result.updated);
  $("#previewRemoved").textContent = String(result.removed);
  $("#previewTotal").textContent = String(result.totalChannels);
  $("#importVersionBadge").textContent = `v${pendingImport.formatVersion}`;
  $("#importDialogError").textContent = "";
}

async function prepareImport(file) {
  try {
    const payload = JSON.parse(await file.text());
    const extracted = YTQSSettingsTransfer.extractImport(payload);
    pendingImport = {
      formatVersion: extracted.formatVersion,
      settings: normalizeSettings(extracted.rawSettings)
    };
    document.querySelector('input[name="importMode"][value="merge"]').checked = true;
    updateImportPreview();
    $("#importDialog").showModal();
  } catch (error) {
    pendingImport = null;
    setTransferStatus(error?.message === "newer-version" ? "newerImportFile" : "invalidImportFile", true);
  }
}

async function applyPendingImport() {
  if (!pendingImport) return;
  try {
    const result = YTQSSettingsTransfer.preview(settings, pendingImport.settings, selectedImportMode());
    await saveRestorePoint(settings);
    settings = normalizeSettings(result.next);
    $("#languageSelect").value = settings.language;
    renderType();
    await persist();
    $("#importDialog").close();
    pendingImport = null;
    setTransferStatus("settingsImported");
  } catch {
    $("#importDialogError").textContent = t("settingsTransferFailed");
  }
}

async function restorePreviousSettings() {
  if (!restorePoint?.settings) return;
  try {
    const current = structuredClone(settings);
    const target = normalizeSettings(restorePoint.settings);
    await saveRestorePoint(current);
    settings = target;
    $("#languageSelect").value = settings.language;
    renderType();
    await persist();
    setTransferStatus("settingsRestored");
  } catch {
    setTransferStatus("settingsTransferFailed", true);
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

$("#shortsArrowKeysEnabled").addEventListener("change", async (event) => {
  settings.shortsControls.arrowKeysEnabled = event.target.checked;
  applyTranslations();
  await persist();
});

$("#shortsChannelNamesEnabled").addEventListener("change", async (event) => {
  settings.shortsControls.channelNamesEnabled = event.target.checked;
  await persist();
});

$("#copyVideoInfo").addEventListener("click", () => copyVideoInfo(settings.copy.defaultFormat));

$("#copyFormatToggle").addEventListener("click", () => {
  const willOpen = $("#copyFormatMenu").hidden;
  $("#copyFormatMenu").hidden = !willOpen;
  $("#copyFormatToggle").setAttribute("aria-expanded", String(willOpen));
  if (willOpen) $("#copyFormatMenu button[aria-checked='true']")?.focus();
});

$("#copyFormatMenu").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy-format]");
  if (!button) return;
  closeCopyFormatMenu();
  await copyVideoInfo(button.dataset.copyFormat, true);
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".copy-card")) closeCopyFormatMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !$("#copyFormatMenu").hidden) closeCopyFormatMenu();
});

$("#exportSettings").addEventListener("click", exportSettings);
$("#importSettings").addEventListener("click", () => $("#importSettingsFile").click());
$("#importSettingsFile").addEventListener("change", async (event) => {
  const [file] = event.target.files || [];
  event.target.value = "";
  if (file) await prepareImport(file);
});
document.querySelectorAll('input[name="importMode"]').forEach((input) => input.addEventListener("change", updateImportPreview));
$("#cancelImport").addEventListener("click", () => {
  pendingImport = null;
  $("#importDialog").close();
});
$("#applyImport").addEventListener("click", applyPendingImport);
$("#restoreSettings").addEventListener("click", restorePreviousSettings);

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
  if (Number(stored.ytQuickSettings?.schemaVersion || 1) < SETTINGS_FORMAT_VERSION || !stored.ytQuickSettings?.copy) {
    await chrome.storage.sync.set({ ytQuickSettings: settings });
  }
  $("#languageSelect").value = settings.language;
  context = await getPageContext();
  await loadRestorePoint();
  activeContentType = context?.contentType === "shorts" ? "shorts" : "regular";
  $("#statusDot").classList.toggle("online", Boolean(context?.isVideo));
  $("#copyVideoInfo").disabled = !context?.isVideo;
  $("#copyFormatToggle").disabled = !context?.isVideo;
  renderType();
}

init();
