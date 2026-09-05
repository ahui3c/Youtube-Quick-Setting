const SPEEDS = [0.7, 1, 1.25, 2, 3];
const QUALITIES = [
  { value: "highest", labelKey: "qualityHighest" },
  { value: "hd2160", labelKey: "quality4k" },
  { value: "hd1080", labelKey: "quality1080", hintKey: "qualityPremiumHint" }
];
const PROFILE_KEYS = ["regular", "shorts"];
const LANGUAGES = ["system", "zh-Hant", "en", "ja"];
const SHORTS_SEEK_SECONDS = [3, 5, 10];
const HOME_GRID_COLUMNS = ["auto", 2, 3, 4, 5, 6];
const THEATER_OVERRIDES = ["inherit", "on", "off"];
const SCREENSHOT_OUTPUTS = ["download", "clipboard"];
const COPY_FORMATS = YTQSCopy.FORMATS;
const SETTINGS_FORMAT_VERSION = YTQSSettingsTransfer.FORMAT_VERSION;
const RESTORE_POINT_KEY = "ytQuickSettingsRestorePoint";

const MESSAGES = {
  "zh-Hant": {
    appTitle: "YouTube 快速設定工具箱", system: "系統", regular: "一般影片", shorts: "Shorts",
    typeLabel: "影片類型", allRegular: "所有一般影片", allShorts: "所有 Shorts",
    globalHeading: "全域預設", saved: "已儲存", speed: "播放速度", quality: "影片畫質",
    channelKicker: "目前頻道優先", loadingChannel: "正在讀取頻道…", noChannel: "尚未偵測到影片頻道",
    currentChannel: "目前頻道", channelSpeed: "這個頻道的播放速度", channelQuality: "這個頻道的影片畫質",
    enableChannel: "啟用目前頻道專屬設定", removeChannel: "移除頻道專屬設定",
    channelEmpty: "請在 YouTube 影片或 Shorts 頁面開啟此面板，即可加入頻道專屬設定。",
    shortcutTitle: "快捷鍵與操作指南", shortcutDescription: "點擊查看完整按鍵說明",
    shortcutDialogKicker: "操作指南", shortcutDialogTitle: "YouTube 播放快捷鍵", shortcutDialogClose: "關閉",
    shortcutDialogContext: "快速鍵僅在 YouTube 影片播放頁生效。", sphericalShortcutDescription: "目前是全景影片：S／Shift+S 保留給 YouTube 視角操作。",
    shortsShortcutDescription: "目前 Shorts 方向鍵：每次 ±{seconds} 秒。", shortsShortcutDescriptionDisabled: "目前 Shorts 左右方向鍵已停用；0 仍可回到片頭。",
    shortcutGroupShorts: "短片", shortcutGroupPlayback: "播放", shortcutGroupTools: "工具", shortcutGroupShare: "分享",
    shortcutPlaybackHelp: "調整速度時會同步更新 YouTube 播放器。", shortcutShortsHelp: "Shorts 專用的時間移動操作。", shortcutShareHelp: "先複製，再選擇要開啟的分享平台。",
    shortcutSeekBack: "倒退 {seconds} 秒", shortcutSeekForward: "快進 {seconds} 秒", shortcutRestart: "回到片頭",
    shortcutSeekRequiresToggle: "需要啟用 Shorts 左右方向鍵", shortcutRestartAlways: "不受方向鍵開關影響",
    shortcutSlowDown: "降低播放速度", shortcutSpeedUp: "提高播放速度", shortcutReset: "恢復 1×",
    shortcutSpeedStep: "依序切換到相鄰速度檔位", shortcutResetDetail: "立即回到標準播放速度",
    shortcutScreenshot: "截取純影片畫面", shortcutScreenshotDownloadDetail: "下載目前影格的 PNG，不包含播放器與網頁 UI", shortcutScreenshotClipboardDetail: "將目前影格的 PNG 複製到系統剪貼簿，不包含播放器與網頁 UI",
    shortcutCopy: "複製標題＋網址", shortcutCopyDetail: "成功後會顯示可用的社群分享按鍵",
    shortcutTimestamp: "複製標題＋目前時間點網址", shortcutTimestampDetail: "網址會包含目前播放秒數",
    shortcutSocial: "快速分享到 Facebook、X、Threads", shortcutSocialDetail: "先按 S 複製，再於提示顯示期間按其中一鍵",
    shortcutDialogTip: "分享快速鍵只會在複製成功提示顯示期間生效。",
    shortcutFacebook: "FB", shortcutX: "X", shortcutThreads: "TH",
    copyVideoInfoTitle: "複製影片資訊", copyVideoInfoDescription: "預設：{format}｜S 複製後按 F／X／T 分享；Shift+S 標題＋時間點", copiedVideoInfo: "已複製到剪貼簿", copyVideoInfoFailed: "複製失敗", copyVideoInfoUnavailable: "請先開啟 YouTube 影片", copyFormatToggle: "選擇複製格式",
    captureVideoFrameTitle: "一鍵影片截圖", captureVideoFrameDescription: "截取不含 UI 的純影片畫面", screenshotResultLabel: "截圖結果", screenshotResultDownload: "下載存檔", screenshotResultClipboard: "複製到剪貼簿", screenshotSaved: "影片截圖已下載", screenshotCopied: "影片截圖已複製到剪貼簿", screenshotFailed: "無法擷取影片畫面", screenshotUnavailable: "請先開啟並播放 YouTube 影片",
    copyFormatTitleUrl: "標題＋網址", copyFormatTimestampUrl: "標題＋目前時間點網址", copyFormatMarkdown: "Markdown 連結", copyFormatHtml: "HTML 超連結", copyFormatChannelTitleUrl: "頻道＋標題＋網址", copyFormatFacebookShare: "分享標題＋連結到 Facebook", copyFormatXShare: "分享標題＋連結到 X", copyFormatThreadsShare: "分享標題＋連結到 Threads", facebookShareOpened: "已開啟 Facebook 分享視窗", xShareOpened: "已開啟 X 分享視窗", threadsShareOpened: "已開啟 Threads 分享視窗", socialShareBlocked: "無法開啟分享視窗",
    moreVideoSettingsTitle: "更多影片設定", settingsTransferTitle: "設定備份與還原", settingsTransferDescription: "匯出、匯入或回復上次設定", exportSettings: "匯出 JSON", importSettings: "匯入 JSON", restoreSettings: "還原上次匯入前設定", settingsTransferNote: "設定檔只在你的裝置上處理。", settingsExported: "設定已匯出", settingsImported: "設定已匯入", settingsRestored: "設定已還原", settingsTransferFailed: "無法處理設定檔",
    importDialogKicker: "匯入預覽", importDialogTitle: "確認設定變更", importModeLegend: "匯入方式", importModeMerge: "合併設定", importModeReplace: "完全取代", previewSections: "一般設定變更", previewAdded: "新增頻道", previewUpdated: "更新頻道", previewRemoved: "移除頻道", previewTotal: "匯入後頻道總數", importRestoreNote: "套用前會自動建立可還原的本機備份。", cancelImport: "取消", applyImport: "套用匯入", invalidImportFile: "這不是有效的 YouTube 快速設定檔。", newerImportFile: "此設定檔來自較新版本，請先更新插件。", restorePointCreated: "已建立匯入前還原點",
    shortsSeekSeconds: "快進秒數", secondsUnit: "秒", shortsArrowKeysTitle: "啟用 Shorts 左右方向鍵",
    shortsArrowKeysDescription: "控制 ←／→ 快退快進，0 回片頭不受影響",
    shortsDisplaySettingsTitle: "Shorts 顯示設定", shortsChannelNamesTitle: "首頁 Shorts 顯示頻道名稱", shortsChannelNamesDescription: "在 Shorts 卡片補上可點擊的頻道名稱",
    shortsPublishTimeTitle: "Shorts 顯示發布時間資訊", shortsPublishTimeDescription: "預設關閉；開啟後在首頁卡片與 Shorts 播放頁顯示發布時間",
    homeGridColumnsRegular: "首頁一般影片每行數量", homeGridColumnsShorts: "首頁 Shorts 每行數量", homeGridColumnsDescription: "僅套用首頁與訂閱內容頁；預設跟隨 YouTube", homeGridColumnsAuto: "跟隨 YouTube", homeGridColumnsCount: "{count} 部",
    absoluteDateTitle: "顯示絕對上傳日期", absoluteDateDescription: "將「2 週前」等相對時間改為完整日期", absoluteDateFormatLabel: "日期與時間格式", absoluteDateFormatHelp: "可用：yyyy、yy、MMM、MM、dd、ww、HH、hh、ap、mm、ss", absoluteDatePreview: "預覽：{date}",
    globalTheaterTitle: "自動開啟劇院模式", globalTheaterDescription: "進入一般影片時自動切換為劇院模式",
    disableAutoplayNextTitle: "取消自動播放下一部影片", disableAutoplayNextDescription: "自動關閉 YouTube 播放器的自動播放開關",
    hideEndScreenRecommendationsTitle: "隱藏片尾推薦卡", hideEndScreenRecommendationsDescription: "移出播放器時隱藏，滑鼠移入即可暫時顯示",
    channelTheater: "這個頻道的劇院模式", theaterInherit: "跟隨全局", theaterOn: "強制開啟", theaterOff: "強制關閉",
    connected: "已連線到目前影片", disconnected: "請開啟 YouTube 影片或 Shorts", languageLabel: "介面語言",
    instanceConflictTitle: "此版本已暫停運作", instanceConflictNewer: "偵測到優先版本 v{winner}，為避免兩套工具同時控制 YouTube，本版本 v{current} 已關閉全部功能。", instanceConflictSameVersion: "同為 v{version} 時由未封裝版優先；目前的 Chrome 商店版已關閉全部功能。",
    qualityHighest: "自動最高", quality4k: "4K", quality1080: "1080p", qualityPremiumHint: "Premium 強化畫質由下方開關獨立控制",
    premiumQualityTitle: "使用 Premium 強化畫質", premiumQualityDescription: "開啟後才會選擇 1080p Premium，僅適用已訂閱會員",
    channelPremiumQualityDescription: "只為這個頻道允許選擇 1080p Premium"
  },
  en: {
    appTitle: "YouTube Quick Settings Toolbox", system: "System", regular: "Videos", shorts: "Shorts",
    typeLabel: "Video type", allRegular: "All standard videos", allShorts: "All Shorts",
    globalHeading: "Global defaults", saved: "Saved", speed: "Playback speed", quality: "Video quality",
    channelKicker: "Current channel override", loadingChannel: "Loading channel…", noChannel: "No video channel detected",
    currentChannel: "Current channel", channelSpeed: "Playback speed for this channel", channelQuality: "Video quality for this channel",
    enableChannel: "Enable settings for the current channel", removeChannel: "Remove channel settings",
    channelEmpty: "Open this panel on a YouTube video or Short to add channel-specific settings.",
    shortcutTitle: "Keyboard shortcuts", shortcutDescription: "Open the complete control guide",
    shortcutDialogKicker: "Control guide", shortcutDialogTitle: "YouTube playback shortcuts", shortcutDialogClose: "Close",
    shortcutDialogContext: "Shortcuts work only on YouTube video playback pages.", sphericalShortcutDescription: "This is a 360° video: S/Shift+S stays with YouTube view controls.",
    shortsShortcutDescription: "Shorts arrow keys currently move ±{seconds}s.", shortsShortcutDescriptionDisabled: "Shorts arrow-key seeking is currently off; 0 still returns to the start.",
    shortcutGroupShorts: "Shorts", shortcutGroupPlayback: "Playback", shortcutGroupTools: "Tools", shortcutGroupShare: "Share",
    shortcutPlaybackHelp: "Speed changes stay synchronized with the YouTube player.", shortcutShortsHelp: "Time controls available while watching Shorts.", shortcutShareHelp: "Copy first, then choose a sharing destination.",
    shortcutSeekBack: "Back {seconds}s", shortcutSeekForward: "Forward {seconds}s", shortcutRestart: "Return to start",
    shortcutSeekRequiresToggle: "Requires Shorts arrow keys to be enabled", shortcutRestartAlways: "Works even when arrow keys are disabled",
    shortcutSlowDown: "Decrease playback speed", shortcutSpeedUp: "Increase playback speed", shortcutReset: "Reset to 1×",
    shortcutSpeedStep: "Moves to the next adjacent speed setting", shortcutResetDetail: "Immediately restores standard playback speed",
    shortcutScreenshot: "Capture a clean video frame", shortcutScreenshotDownloadDetail: "Download the current frame as a PNG without player or page UI", shortcutScreenshotClipboardDetail: "Copy the current PNG frame to the system clipboard without player or page UI",
    shortcutCopy: "Copy title + URL", shortcutCopyDetail: "The success message enables social sharing keys",
    shortcutTimestamp: "Copy title + timestamp URL", shortcutTimestampDetail: "Adds the current playback time to the URL",
    shortcutSocial: "Share to Facebook, X, or Threads", shortcutSocialDetail: "Press S first, then one of these keys while the message is visible",
    shortcutDialogTip: "Sharing keys work only while the copy-success message is visible.",
    shortcutFacebook: "FB", shortcutX: "X", shortcutThreads: "TH",
    copyVideoInfoTitle: "Copy video info", copyVideoInfoDescription: "Default: {format} | After S, press F/X/T to share; Shift+S adds timestamp", copiedVideoInfo: "Copied to clipboard", copyVideoInfoFailed: "Copy failed", copyVideoInfoUnavailable: "Open a YouTube video first", copyFormatToggle: "Choose copy format",
    captureVideoFrameTitle: "One-click video screenshot", captureVideoFrameDescription: "Capture a clean video frame without UI", screenshotResultLabel: "Screenshot result", screenshotResultDownload: "Download file", screenshotResultClipboard: "Copy to clipboard", screenshotSaved: "Video screenshot downloaded", screenshotCopied: "Video screenshot copied to clipboard", screenshotFailed: "Could not capture the video frame", screenshotUnavailable: "Open and play a YouTube video first",
    copyFormatTitleUrl: "Title + URL", copyFormatTimestampUrl: "Title + URL at current time", copyFormatMarkdown: "Markdown link", copyFormatHtml: "HTML link", copyFormatChannelTitleUrl: "Channel + title + URL", copyFormatFacebookShare: "Share title + link to Facebook", copyFormatXShare: "Share title + link to X", copyFormatThreadsShare: "Share title + link to Threads", facebookShareOpened: "Facebook share window opened", xShareOpened: "X share window opened", threadsShareOpened: "Threads share window opened", socialShareBlocked: "Could not open the share window",
    moreVideoSettingsTitle: "More video settings", settingsTransferTitle: "Backup and restore settings", settingsTransferDescription: "Export, import, or restore the last settings", exportSettings: "Export JSON", importSettings: "Import JSON", restoreSettings: "Restore pre-import settings", settingsTransferNote: "Settings files are processed only on your device.", settingsExported: "Settings exported", settingsImported: "Settings imported", settingsRestored: "Settings restored", settingsTransferFailed: "Could not process the settings file",
    importDialogKicker: "Import preview", importDialogTitle: "Confirm settings changes", importModeLegend: "Import mode", importModeMerge: "Merge settings", importModeReplace: "Replace all", previewSections: "General settings changed", previewAdded: "Channels added", previewUpdated: "Channels updated", previewRemoved: "Channels removed", previewTotal: "Channels after import", importRestoreNote: "A local restore point will be created before applying.", cancelImport: "Cancel", applyImport: "Apply import", invalidImportFile: "This is not a valid YouTube Quick Settings Toolbox file.", newerImportFile: "This file is from a newer version. Update the extension first.", restorePointCreated: "Pre-import restore point created",
    shortsSeekSeconds: "Seek interval", secondsUnit: "sec", shortsArrowKeysTitle: "Enable Shorts arrow keys",
    shortsArrowKeysDescription: "Controls ←/→ seeking; 0 always returns to the start",
    shortsDisplaySettingsTitle: "Shorts display settings", shortsChannelNamesTitle: "Show channel names on Home Shorts", shortsChannelNamesDescription: "Add a clickable channel name to Shorts cards on the Home page",
    shortsPublishTimeTitle: "Show Shorts publish time", shortsPublishTimeDescription: "Off by default; shows publish time on Home cards and Shorts playback pages",
    homeGridColumnsRegular: "Videos per Home row", homeGridColumnsShorts: "Shorts per Home row", homeGridColumnsDescription: "Applies only to Home and Subscriptions; follows YouTube by default", homeGridColumnsAuto: "Follow YouTube", homeGridColumnsCount: "{count} items",
    absoluteDateTitle: "Show absolute upload dates", absoluteDateDescription: "Replace relative times such as “2 weeks ago” with a full date", absoluteDateFormatLabel: "Date and time format", absoluteDateFormatHelp: "Available: yyyy, yy, MMM, MM, dd, ww, HH, hh, ap, mm, ss", absoluteDatePreview: "Preview: {date}",
    globalTheaterTitle: "Automatically open Theater mode", globalTheaterDescription: "Switch standard videos to Theater mode when they open",
    disableAutoplayNextTitle: "Disable autoplay of the next video", disableAutoplayNextDescription: "Automatically turn off YouTube's player autoplay toggle",
    hideEndScreenRecommendationsTitle: "Hide end-screen recommendations", hideEndScreenRecommendationsDescription: "Hide them when the pointer leaves the player; hover to reveal",
    channelTheater: "Theater mode for this channel", theaterInherit: "Follow global", theaterOn: "Force on", theaterOff: "Force off",
    connected: "Connected to the current video", disconnected: "Open a YouTube video or Short", languageLabel: "Interface language",
    instanceConflictTitle: "This version is paused", instanceConflictNewer: "Preferred version v{winner} was detected. To prevent duplicate YouTube controls, this v{current} instance has disabled all features.", instanceConflictSameVersion: "For matching v{version} builds, the unpacked build takes priority. This Chrome Web Store instance has disabled all features.",
    qualityHighest: "Highest", quality4k: "4K", quality1080: "1080p", qualityPremiumHint: "Premium enhanced quality is controlled separately below",
    premiumQualityTitle: "Use Premium enhanced quality", premiumQualityDescription: "Allows 1080p Premium only when enabled; requires a Premium subscription",
    channelPremiumQualityDescription: "Allow 1080p Premium for this channel only"
  },
  ja: {
    appTitle: "YouTube クイック設定ツールボックス", system: "システム", regular: "通常動画", shorts: "ショート",
    typeLabel: "動画タイプ", allRegular: "すべての通常動画", allShorts: "すべてのショート",
    globalHeading: "全体の既定値", saved: "保存済み", speed: "再生速度", quality: "動画の画質",
    channelKicker: "現在のチャンネルを優先", loadingChannel: "チャンネルを読み込み中…", noChannel: "動画のチャンネルを検出できません",
    currentChannel: "現在のチャンネル", channelSpeed: "このチャンネルの再生速度", channelQuality: "このチャンネルの画質",
    enableChannel: "現在のチャンネル専用設定を有効にする", removeChannel: "チャンネル専用設定を削除",
    channelEmpty: "YouTube 動画またはショートのページでこのパネルを開くと、チャンネル専用設定を追加できます。",
    shortcutTitle: "キーボードショートカット", shortcutDescription: "すべての操作ガイドを表示",
    shortcutDialogKicker: "操作ガイド", shortcutDialogTitle: "YouTube 再生ショートカット", shortcutDialogClose: "閉じる",
    shortcutDialogContext: "ショートカットは YouTube の動画再生ページでのみ動作します。", sphericalShortcutDescription: "現在は 360° 動画です。S／Shift+S は YouTube の視点操作用です。",
    shortsShortcutDescription: "ショートの左右キーは現在 ±{seconds} 秒です。", shortsShortcutDescriptionDisabled: "ショートの左右キーは現在無効です。0 は先頭移動に使えます。",
    shortcutGroupShorts: "ショート", shortcutGroupPlayback: "再生", shortcutGroupTools: "ツール", shortcutGroupShare: "共有",
    shortcutPlaybackHelp: "速度変更は YouTube プレーヤーにも同期されます。", shortcutShortsHelp: "ショート再生中に使える時間操作です。", shortcutShareHelp: "先にコピーしてから共有先を選びます。",
    shortcutSeekBack: "{seconds} 秒戻る", shortcutSeekForward: "{seconds} 秒進む", shortcutRestart: "先頭に戻る",
    shortcutSeekRequiresToggle: "ショートの左右キーを有効にする必要があります", shortcutRestartAlways: "左右キーが無効でも使用できます",
    shortcutSlowDown: "再生速度を下げる", shortcutSpeedUp: "再生速度を上げる", shortcutReset: "1× に戻す",
    shortcutSpeedStep: "隣の速度設定へ順番に切り替えます", shortcutResetDetail: "標準の再生速度へすぐに戻します",
    shortcutScreenshot: "動画だけをスクリーンショット", shortcutScreenshotDownloadDetail: "プレーヤーやページ UI を含めず、現在のフレームを PNG で保存します", shortcutScreenshotClipboardDetail: "プレーヤーやページ UI を含めず、現在の PNG フレームをクリップボードへコピーします",
    shortcutCopy: "タイトル＋URL をコピー", shortcutCopyDetail: "成功メッセージ表示中は共有キーを使えます",
    shortcutTimestamp: "タイトル＋現在位置 URL をコピー", shortcutTimestampDetail: "URL に現在の再生秒数を追加します",
    shortcutSocial: "Facebook、X、Threads に共有", shortcutSocialDetail: "先に S を押し、メッセージ表示中にいずれかのキーを押します",
    shortcutDialogTip: "共有キーはコピー成功メッセージの表示中だけ使用できます。",
    shortcutFacebook: "FB", shortcutX: "X", shortcutThreads: "TH",
    copyVideoInfoTitle: "動画情報をコピー", copyVideoInfoDescription: "既定：{format}｜S の後に F／X／T で共有、Shift+S は現在位置", copiedVideoInfo: "クリップボードにコピーしました", copyVideoInfoFailed: "コピーに失敗しました", copyVideoInfoUnavailable: "YouTube 動画を開いてください", copyFormatToggle: "コピー形式を選択",
    captureVideoFrameTitle: "ワンクリック動画スクリーンショット", captureVideoFrameDescription: "UI を含まない動画画面を保存", screenshotResultLabel: "スクリーンショットの結果", screenshotResultDownload: "ファイルに保存", screenshotResultClipboard: "クリップボードにコピー", screenshotSaved: "動画スクリーンショットを保存しました", screenshotCopied: "動画スクリーンショットをクリップボードにコピーしました", screenshotFailed: "動画画面を保存できませんでした", screenshotUnavailable: "YouTube 動画を開いて再生してください",
    copyFormatTitleUrl: "タイトル＋URL", copyFormatTimestampUrl: "タイトル＋現在位置の URL", copyFormatMarkdown: "Markdown リンク", copyFormatHtml: "HTML リンク", copyFormatChannelTitleUrl: "チャンネル＋タイトル＋URL", copyFormatFacebookShare: "タイトル＋リンクを Facebook に共有", copyFormatXShare: "タイトル＋リンクを X に共有", copyFormatThreadsShare: "タイトル＋リンクを Threads に共有", facebookShareOpened: "Facebook の共有画面を開きました", xShareOpened: "X の共有画面を開きました", threadsShareOpened: "Threads の共有画面を開きました", socialShareBlocked: "共有画面を開けませんでした",
    moreVideoSettingsTitle: "その他の動画設定", settingsTransferTitle: "設定のバックアップと復元", settingsTransferDescription: "書き出し、読み込み、前回設定の復元", exportSettings: "JSON を書き出す", importSettings: "JSON を読み込む", restoreSettings: "読み込み前の設定に戻す", settingsTransferNote: "設定ファイルは端末内だけで処理されます。", settingsExported: "設定を書き出しました", settingsImported: "設定を読み込みました", settingsRestored: "設定を復元しました", settingsTransferFailed: "設定ファイルを処理できませんでした",
    importDialogKicker: "読み込みプレビュー", importDialogTitle: "設定変更の確認", importModeLegend: "読み込み方法", importModeMerge: "設定を結合", importModeReplace: "すべて置換", previewSections: "一般設定の変更", previewAdded: "追加チャンネル", previewUpdated: "更新チャンネル", previewRemoved: "削除チャンネル", previewTotal: "読み込み後のチャンネル数", importRestoreNote: "適用前にローカル復元ポイントを自動作成します。", cancelImport: "キャンセル", applyImport: "読み込みを適用", invalidImportFile: "有効な YouTube クイック設定ファイルではありません。", newerImportFile: "新しいバージョンの設定ファイルです。先に拡張機能を更新してください。", restorePointCreated: "読み込み前の復元ポイントを作成しました",
    shortsSeekSeconds: "移動秒数", secondsUnit: "秒", shortsArrowKeysTitle: "ショートの左右キーを有効化",
    shortsArrowKeysDescription: "←／→ の移動を制御。0 の先頭移動は常に有効",
    shortsDisplaySettingsTitle: "ショートの表示設定", shortsChannelNamesTitle: "ホームのショートにチャンネル名を表示", shortsChannelNamesDescription: "ショートのカードにクリック可能なチャンネル名を追加します",
    shortsPublishTimeTitle: "ショートの公開時刻情報を表示", shortsPublishTimeDescription: "既定ではオフ。ホームのカードとショート再生ページに公開時刻を表示します",
    homeGridColumnsRegular: "ホームの通常動画の列数", homeGridColumnsShorts: "ホームのショートの列数", homeGridColumnsDescription: "ホームと登録チャンネルだけに適用。既定では YouTube に従います", homeGridColumnsAuto: "YouTube に従う", homeGridColumnsCount: "{count} 本",
    absoluteDateTitle: "アップロード日を絶対日付で表示", absoluteDateDescription: "「2 週間前」などの相対時刻を完全な日付に置き換えます", absoluteDateFormatLabel: "日付と時刻の形式", absoluteDateFormatHelp: "使用可能：yyyy、yy、MMM、MM、dd、ww、HH、hh、ap、mm、ss", absoluteDatePreview: "プレビュー：{date}",
    globalTheaterTitle: "シアターモードを自動的に有効化", globalTheaterDescription: "通常動画を開いたときにシアターモードへ切り替えます",
    disableAutoplayNextTitle: "次の動画の自動再生を無効化", disableAutoplayNextDescription: "YouTube プレーヤーの自動再生スイッチを自動的にオフにします",
    hideEndScreenRecommendationsTitle: "終了画面のおすすめを非表示", hideEndScreenRecommendationsDescription: "プレーヤーからポインターを外すと非表示、重ねると一時表示します",
    channelTheater: "このチャンネルのシアターモード", theaterInherit: "全体設定に従う", theaterOn: "常にオン", theaterOff: "常にオフ",
    connected: "現在の動画に接続しました", disconnected: "YouTube 動画またはショートを開いてください", languageLabel: "表示言語",
    instanceConflictTitle: "このバージョンは一時停止中です", instanceConflictNewer: "優先バージョン v{winner} を検出しました。YouTube の二重操作を防ぐため、この v{current} の全機能を停止しました。", instanceConflictSameVersion: "同じ v{version} では未パッケージ版が優先されます。Chrome ウェブストア版の全機能を停止しました。",
    qualityHighest: "最高画質", quality4k: "4K", quality1080: "1080p", qualityPremiumHint: "Premium 高画質は下のスイッチで個別に設定",
    premiumQualityTitle: "Premium 高画質を使用", premiumQualityDescription: "オンの場合のみ 1080p Premium を選択。Premium 登録が必要です",
    channelPremiumQualityDescription: "このチャンネルだけ 1080p Premium を許可"
  }
};

const DEFAULT_PROFILE = { speed: 1, quality: "hd1080", premiumQualityEnabled: false };
const DEFAULT_SETTINGS = {
  schemaVersion: SETTINGS_FORMAT_VERSION,
  language: "system",
  global: { ...DEFAULT_PROFILE, theaterModeEnabled: false, disableAutoplayNext: false, hideEndScreenRecommendations: false },
  shorts: { ...DEFAULT_PROFILE },
  shortsControls: { seekSeconds: 5, arrowKeysEnabled: true, channelNamesEnabled: true, publishTimeEnabled: false },
  gridLayout: { regularColumns: "auto", shortsColumns: "auto" },
  dateDisplay: { enabled: false, format: YTQSDate.DEFAULT_FORMAT },
  copy: { defaultFormat: YTQSCopy.DEFAULT_FORMAT },
  screenshot: { output: "download" },
  channels: {}
};

let settings = structuredClone(DEFAULT_SETTINGS);
let context = null;
let activeContentType = "regular";
let activeLanguage = "zh-Hant";
let saveTimer = null;
let pendingImport = null;
let restorePoint = null;
let instanceConflict = null;
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
    theaterModeEnabled: value?.global?.theaterModeEnabled === true,
    disableAutoplayNext: value?.global?.disableAutoplayNext === true,
    hideEndScreenRecommendations: value?.global?.hideEndScreenRecommendations === true
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
      channelNamesEnabled: value?.shortsControls?.channelNamesEnabled !== false,
      publishTimeEnabled: value?.shortsControls?.publishTimeEnabled === true
    },
    gridLayout: {
      regularColumns: HOME_GRID_COLUMNS.includes(value?.gridLayout?.regularColumns) ? value.gridLayout.regularColumns : "auto",
      shortsColumns: HOME_GRID_COLUMNS.includes(value?.gridLayout?.shortsColumns) ? value.gridLayout.shortsColumns : "auto"
    },
    dateDisplay: {
      enabled: value?.dateDisplay?.enabled === true,
      format: YTQSDate.normalizeFormat(value?.dateDisplay?.format)
    },
    copy: {
      defaultFormat: YTQSCopy.DEFAULT_FORMAT
    },
    screenshot: {
      output: SCREENSHOT_OUTPUTS.includes(value?.screenshot?.output) ? value.screenshot.output : "download"
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

function createShortcutKeyCluster(keys) {
  const cluster = document.createElement("span");
  cluster.className = "shortcut-key-cluster";
  keys.forEach((key, index) => {
    if (index > 0) {
      const separator = document.createElement("span");
      separator.className = "shortcut-key-separator";
      separator.setAttribute("aria-hidden", "true");
      separator.textContent = key === "S" && keys[0] === "Shift" ? "+" : "/";
      cluster.append(separator);
    }
    const keyElement = document.createElement("kbd");
    keyElement.textContent = key;
    cluster.append(keyElement);
  });
  return cluster;
}

function createShortcutHelpRow(keys, title, detail, { disabled = false } = {}) {
  const row = document.createElement("div");
  row.className = "shortcut-help-row";
  if (disabled) row.classList.add("is-disabled");

  const copy = document.createElement("span");
  copy.className = "shortcut-help-row-copy";
  const strong = document.createElement("strong");
  strong.textContent = title;
  const description = document.createElement("span");
  description.textContent = detail;
  copy.append(strong, description);
  row.append(createShortcutKeyCluster(keys), copy);
  return row;
}

function createShortcutHelpSection(title, description, rows) {
  const section = document.createElement("section");
  section.className = "shortcut-help-section";
  const heading = document.createElement("header");
  const titleElement = document.createElement("h3");
  titleElement.textContent = title;
  const descriptionElement = document.createElement("p");
  descriptionElement.textContent = description;
  heading.append(titleElement, descriptionElement);
  section.append(heading, ...rows);
  return section;
}

function renderShortcutHelp({ isShorts, isSpherical, shortsArrowKeysEnabled }) {
  const seconds = String(settings.shortsControls.seekSeconds);
  const sections = [];

  if (isShorts) {
    sections.push(createShortcutHelpSection(t("shortcutGroupShorts"), t("shortcutShortsHelp"), [
      createShortcutHelpRow(["←"], t("shortcutSeekBack").replace("{seconds}", seconds), t("shortcutSeekRequiresToggle"), { disabled: !shortsArrowKeysEnabled }),
      createShortcutHelpRow(["→"], t("shortcutSeekForward").replace("{seconds}", seconds), t("shortcutSeekRequiresToggle"), { disabled: !shortsArrowKeysEnabled }),
      createShortcutHelpRow(["0"], t("shortcutRestart"), t("shortcutRestartAlways"))
    ]));
  }

  sections.push(createShortcutHelpSection(t("shortcutGroupPlayback"), t("shortcutPlaybackHelp"), [
    createShortcutHelpRow(["PgUp"], t("shortcutSlowDown"), t("shortcutSpeedStep")),
    createShortcutHelpRow(["PgDn"], t("shortcutSpeedUp"), t("shortcutSpeedStep")),
    createShortcutHelpRow(["Home"], t("shortcutReset"), t("shortcutResetDetail"))
  ]));

  sections.push(createShortcutHelpSection(t("shortcutGroupTools"), t("captureVideoFrameDescription"), [
    createShortcutHelpRow(["Ctrl", "S"], t("shortcutScreenshot"), t(settings.screenshot.output === "clipboard" ? "shortcutScreenshotClipboardDetail" : "shortcutScreenshotDownloadDetail"))
  ]));

  if (!isSpherical) {
    sections.push(createShortcutHelpSection(t("shortcutGroupShare"), t("shortcutShareHelp"), [
      createShortcutHelpRow(["S"], t("shortcutCopy"), t("shortcutCopyDetail")),
      createShortcutHelpRow(["Shift", "S"], t("shortcutTimestamp"), t("shortcutTimestampDetail")),
      createShortcutHelpRow(["F", "X", "T"], t("shortcutSocial"), t("shortcutSocialDetail"))
    ]));
  }

  const shortcutKeys = $("#shortcutKeys");
  shortcutKeys.replaceChildren(...sections);
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
  $("#copyVideoInfoDescription").textContent = t("copyVideoInfoDescription").replace("{format}", copyFormatLabel(YTQSCopy.DEFAULT_FORMAT));
  $("#copyFormatToggleLabel").textContent = t("copyFormatToggle");
  $("#copyFormatToggle").setAttribute("aria-label", t("copyFormatToggle"));
  $("#captureVideoFrameTitle").textContent = t("captureVideoFrameTitle");
  $("#captureVideoFrameDescription").textContent = t("captureVideoFrameDescription");
  $("#captureVideoFrameResultLabel").textContent = t("screenshotResultLabel");
  $("#captureVideoFrameResult").options[0].textContent = t("screenshotResultDownload");
  $("#captureVideoFrameResult").options[1].textContent = t("screenshotResultClipboard");
  $("#captureVideoFrameResult").value = settings.screenshot.output;
  $("#moreVideoSettingsTitle").textContent = t("moreVideoSettingsTitle");
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
  const isSpherical = context?.isSpherical === true && activeContentType === context?.contentType;
  const shortsArrowKeysEnabled = settings.shortsControls.arrowKeysEnabled === true;
  $("#shortcutTitle").textContent = t("shortcutTitle");
  $("#shortcutDescription").textContent = t("shortcutDescription");
  $("#shortcutDialogKicker").textContent = t("shortcutDialogKicker");
  $("#shortcutDialogTitle").textContent = t("shortcutDialogTitle");
  $("#shortcutDialogClose").setAttribute("aria-label", t("shortcutDialogClose"));
  $("#shortcutDialogContext").textContent = t(isSpherical
    ? "sphericalShortcutDescription"
    : isShorts
      ? shortsArrowKeysEnabled ? "shortsShortcutDescription" : "shortsShortcutDescriptionDisabled"
      : "shortcutDialogContext")
    .replace("{seconds}", String(settings.shortsControls.seekSeconds));
  $("#shortcutDialogTip").textContent = t("shortcutDialogTip");
  renderShortcutHelp({ isShorts, isSpherical, shortsArrowKeysEnabled });
  $("#globalKicker").textContent = t(activeContentType === "shorts" ? "allShorts" : "allRegular");
  $("#shortsSeekSecondsLegend").textContent = t("shortsSeekSeconds");
  $("#shortsArrowKeysTitle").textContent = t("shortsArrowKeysTitle");
  $("#shortsArrowKeysDescription").textContent = t("shortsArrowKeysDescription");
  $("#shortsArrowKeysLabel").textContent = t("shortsArrowKeysTitle");
  $("#shortsDisplaySettingsTitle").textContent = t("shortsDisplaySettingsTitle");
  $("#shortsChannelNamesTitle").textContent = t("shortsChannelNamesTitle");
  $("#shortsChannelNamesDescription").textContent = t("shortsChannelNamesDescription");
  $("#shortsChannelNamesLabel").textContent = t("shortsChannelNamesTitle");
  $("#shortsPublishTimeTitle").textContent = t("shortsPublishTimeTitle");
  $("#shortsPublishTimeDescription").textContent = t("shortsPublishTimeDescription");
  $("#shortsPublishTimeLabel").textContent = t("shortsPublishTimeTitle");
  $("#absoluteDateTitle").textContent = t("absoluteDateTitle");
  $("#absoluteDateDescription").textContent = t("absoluteDateDescription");
  $("#absoluteDateLabel").textContent = t("absoluteDateTitle");
  $("#absoluteDateFormatLabel").textContent = t("absoluteDateFormatLabel");
  $("#absoluteDateFormatHelp").textContent = t("absoluteDateFormatHelp");
  $("#globalTheaterTitle").textContent = t("globalTheaterTitle");
  $("#globalTheaterDescription").textContent = t("globalTheaterDescription");
  $("#globalTheaterLabel").textContent = t("globalTheaterTitle");
  $("#globalDisableAutoplayNextTitle").textContent = t("disableAutoplayNextTitle");
  $("#globalDisableAutoplayNextDescription").textContent = t("disableAutoplayNextDescription");
  $("#globalDisableAutoplayNextLabel").textContent = t("disableAutoplayNextTitle");
  $("#globalHideEndScreenRecommendationsTitle").textContent = t("hideEndScreenRecommendationsTitle");
  $("#globalHideEndScreenRecommendationsDescription").textContent = t("hideEndScreenRecommendationsDescription");
  $("#globalHideEndScreenRecommendationsLabel").textContent = t("hideEndScreenRecommendationsTitle");
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

function createHomeGridColumnsControl(container, selected, onChange) {
  container.replaceChildren();
  HOME_GRID_COLUMNS.forEach((value) => {
    const button = document.createElement("button");
    const label = value === "auto"
      ? t("homeGridColumnsAuto")
      : t("homeGridColumnsCount").replace("{count}", String(value));
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
  if (instanceConflict?.active) return;
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
  const qualityFieldset = $("#globalQualityFieldset");
  qualityFieldset.hidden = activeContentType === "shorts";
  if (activeContentType === "regular") {
    createQualityControl($("#globalQuality"), profile.quality, async (quality) => {
      profile.quality = quality;
      renderGlobal();
      await persist();
    });
  } else {
    $("#globalQuality").replaceChildren();
  }
  const gridKey = activeContentType === "shorts" ? "shortsColumns" : "regularColumns";
  const gridFieldset = $("#homeGridColumnsFieldset");
  const gridBottomCard = $("#homeGridColumnsBottomCard");
  const shortsDisplaySettingsCard = $("#shortsDisplaySettingsCard");
  if (activeContentType === "shorts") {
    gridBottomCard.hidden = true;
    $("#shortsHomeGridSetting").append(gridFieldset);
    shortsDisplaySettingsCard.hidden = false;
  } else {
    shortsDisplaySettingsCard.hidden = true;
    gridBottomCard.append(gridFieldset);
    gridBottomCard.hidden = false;
  }
  $("#homeGridColumnsLegend").textContent = t(activeContentType === "shorts" ? "homeGridColumnsShorts" : "homeGridColumnsRegular");
  $("#homeGridColumnsDescription").textContent = t("homeGridColumnsDescription");
  createHomeGridColumnsControl($("#homeGridColumns"), settings.gridLayout[gridKey], async (value) => {
    settings.gridLayout[gridKey] = value;
    renderGlobal();
    await persist();
  });
  const theaterSetting = $("#globalTheaterSetting");
  theaterSetting.hidden = activeContentType === "shorts";
  $("#globalTheaterEnabled").checked = settings.global.theaterModeEnabled;
  const autoplayNextSetting = $("#globalDisableAutoplayNextSetting");
  autoplayNextSetting.hidden = activeContentType === "shorts";
  $("#globalDisableAutoplayNextEnabled").checked = settings.global.disableAutoplayNext;
  const endScreenSetting = $("#globalHideEndScreenRecommendationsSetting");
  endScreenSetting.hidden = activeContentType === "shorts";
  $("#globalHideEndScreenRecommendationsEnabled").checked = settings.global.hideEndScreenRecommendations;
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
  const arrowKeysEnabled = settings.shortsControls.arrowKeysEnabled === true;
  const fieldset = $("#shortsSeekSecondsFieldset");
  fieldset.disabled = !arrowKeysEnabled;
  fieldset.setAttribute("aria-disabled", String(!arrowKeysEnabled));
  const choices = $("#shortsSeekSeconds");
  choices.replaceChildren();
  SHORTS_SEEK_SECONDS.forEach((seconds) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `quality-button${selected === seconds ? " selected" : ""}`;
    button.textContent = `${seconds} ${t("secondsUnit")}`;
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", String(selected === seconds));
    button.disabled = !arrowKeysEnabled;
    button.addEventListener("click", async () => {
      settings.shortsControls.seekSeconds = seconds;
      renderType();
      await persist();
    });
    choices.append(button);
  });
  $("#shortsArrowKeysEnabled").checked = settings.shortsControls.arrowKeysEnabled;
  $("#shortsChannelNamesEnabled").checked = settings.shortsControls.channelNamesEnabled;
  $("#shortsPublishTimeEnabled").checked = settings.shortsControls.publishTimeEnabled;
}

function renderDateDisplay() {
  const enabled = settings.dateDisplay.enabled === true;
  $("#absoluteDateEnabled").checked = enabled;
  $("#absoluteDateFormatSetting").hidden = !enabled;
  $("#absoluteDateFormat").value = settings.dateDisplay.format;
  const preview = YTQSDate.format(new Date(2026, 8, 2, 14, 5, 9), settings.dateDisplay.format, activeLanguage);
  $("#absoluteDatePreview").textContent = t("absoluteDatePreview").replace("{date}", preview);
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
  const qualityFieldset = $("#channelQualityFieldset");
  qualityFieldset.hidden = activeContentType === "shorts";
  if (activeContentType === "regular") {
    createQualityControl($("#channelQuality"), profile.quality, async (quality) => {
      profile.quality = quality;
      renderChannel();
      await persist();
    });
  } else {
    $("#channelQuality").replaceChildren();
  }
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
  renderDateDisplay();
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

async function getInstanceConflictStatus() {
  try {
    return await chrome.runtime.sendMessage({ type: "YTQS_INSTANCE_CONFLICT_STATUS" });
  } catch {
    return null;
  }
}

function renderInstanceConflict() {
  const conflict = instanceConflict?.active ? instanceConflict : null;
  const banner = $("#instanceConflict");
  document.body.classList.toggle("has-instance-conflict", Boolean(conflict));
  banner.hidden = !conflict;
  $("#instanceConflictTitle").textContent = t("instanceConflictTitle");
  const sameVersionDevelopment = conflict?.reason === "same-version-development-priority";
  $("#instanceConflictDetail").textContent = sameVersionDevelopment
    ? t("instanceConflictSameVersion").replace("{version}", conflict.currentVersion || conflict.winnerVersion || "")
    : t("instanceConflictNewer")
      .replace("{winner}", conflict?.winnerVersion || "")
      .replace("{current}", conflict?.currentVersion || "");
  document.querySelectorAll(".panel > :not(.masthead):not(.instance-conflict)").forEach((element) => {
    element.inert = Boolean(conflict);
  });
}

async function copyTextToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function showCopyButtonState(state, summary = "", messageKey = "") {
  const button = $("#copyVideoInfo");
  const succeeded = state === "copied" || state === "shared";
  const failed = state === "failed" || state === "share-failed";
  button.classList.toggle("copied", succeeded);
  button.classList.toggle("failed", failed);
  const stateElement = $("#copyVideoInfoState");
  stateElement.textContent = state === "copied"
    ? `${t("copiedVideoInfo")} · ${summary}`
    : state === "shared"
      ? `${t(messageKey || "facebookShareOpened")} · ${summary}`
      : state === "share-failed"
        ? t("socialShareBlocked")
        : state === "failed" ? t("copyVideoInfoFailed") : "";
  stateElement.hidden = !state;
  $("#copyVideoInfoDescription").textContent = state === "copied"
    ? t("copiedVideoInfo")
    : state === "shared"
      ? t(messageKey || "facebookShareOpened")
      : state === "share-failed"
        ? t("socialShareBlocked")
        : state === "failed"
          ? t("copyVideoInfoFailed")
          : t("copyVideoInfoDescription").replace("{format}", copyFormatLabel(YTQSCopy.DEFAULT_FORMAT));
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
  const formatButtons = COPY_FORMATS.map((format) => {
    const button = document.createElement("button");
    const selected = YTQSCopy.DEFAULT_FORMAT === format;
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
  });
  const shareButtons = [
    { platform: "facebook", labelKey: "copyFormatFacebookShare", icon: "f" },
    { platform: "x", labelKey: "copyFormatXShare", icon: "X" },
    { platform: "threads", labelKey: "copyFormatThreadsShare", icon: "@" }
  ].map(({ platform, labelKey, icon }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.copyAction = "social-share";
    button.dataset.sharePlatform = platform;
    button.className = "copy-format-action";
    button.setAttribute("role", "menuitem");
    const iconElement = document.createElement("span");
    iconElement.className = `copy-format-social-icon ${platform}`;
    iconElement.textContent = icon;
    const label = document.createElement("span");
    label.textContent = t(labelKey);
    button.append(iconElement, label);
    return button;
  });
  menu.replaceChildren(...formatButtons, ...shareButtons);
}

async function copyVideoInfo(format) {
  const freshContext = await getPageContext();
  if (freshContext?.isVideo) context = freshContext;
  if (!context?.videoTitle || !context?.videoUrl) {
    showCopyButtonState("failed");
    $("#copyVideoInfoDescription").textContent = t("copyVideoInfoUnavailable");
    return false;
  }
  const selectedFormat = COPY_FORMATS.includes(format) ? format : YTQSCopy.DEFAULT_FORMAT;
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

function showScreenshotButtonState(state, result = {}) {
  const button = $("#captureVideoFrame");
  const saved = state === "saved";
  const failed = state === "failed";
  const copied = saved && result.output === "clipboard";
  const successText = copied ? t("screenshotCopied") : t("screenshotSaved");
  const summary = copied ? `${result.width || 0}×${result.height || 0}` : result.filename || "";
  button.classList.toggle("saved", saved);
  button.classList.toggle("failed", failed);
  const stateElement = $("#captureVideoFrameState");
  stateElement.textContent = saved
    ? `${successText}${summary ? ` · ${summary}` : ""}`
    : failed ? t("screenshotFailed") : "";
  stateElement.hidden = !state;
  $("#captureVideoFrameDescription").textContent = saved
    ? successText
    : failed ? t("screenshotFailed") : t("captureVideoFrameDescription");
  clearTimeout(showScreenshotButtonState.timer);
  if (state) showScreenshotButtonState.timer = setTimeout(() => showScreenshotButtonState(""), 2200);
}

async function captureVideoFrameFromPopup() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url?.startsWith("https://www.youtube.com/")) {
    showScreenshotButtonState("failed");
    $("#captureVideoFrameDescription").textContent = t("screenshotUnavailable");
    return false;
  }
  try {
    const result = await chrome.tabs.sendMessage(tab.id, { type: "YTQS_CAPTURE_VIDEO_FRAME", output: settings.screenshot.output });
    showScreenshotButtonState(result?.ok ? "saved" : "failed", result || {});
    return result?.ok === true;
  } catch {
    showScreenshotButtonState("failed");
    return false;
  }
}

function openSocialShareFromPopup(platform) {
  if (!context?.videoTitle || !context?.videoUrl) {
    showCopyButtonState("share-failed");
    return false;
  }
  const shareUrl = YTQSCopy.socialShareUrl(platform, { title: context.videoTitle, url: context.videoUrl });
  const width = 720;
  const height = 680;
  const left = Math.max(0, Math.round((window.screenX || 0) + ((window.outerWidth || width) - width) / 2));
  const top = Math.max(0, Math.round((window.screenY || 0) + ((window.outerHeight || height) - height) / 2));
  const shareWindow = shareUrl && window.open(
    shareUrl,
    `ytqs-${platform}-share`,
    `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
  );
  if (!shareWindow) {
    showCopyButtonState("share-failed");
    return false;
  }
  try {
    shareWindow.opener = null;
    shareWindow.focus();
  } catch {
    // The cross-origin share window can still open even when focus is restricted.
  }
  const messageKey = platform === "facebook" ? "facebookShareOpened" : platform === "x" ? "xShareOpened" : "threadsShareOpened";
  showCopyButtonState("shared", YTQSCopy.summarize(`${context.videoTitle}\n${context.videoUrl}`), messageKey);
  return true;
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
    const importedSettings = normalizeSettings(extracted.rawSettings);
    if (!Object.hasOwn(extracted.rawSettings, "gridLayout")) delete importedSettings.gridLayout;
    if (!Object.hasOwn(extracted.rawSettings, "screenshot")) delete importedSettings.screenshot;
    pendingImport = {
      formatVersion: extracted.formatVersion,
      settings: importedSettings
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
  renderType();
  await persist();
});

$("#shortsChannelNamesEnabled").addEventListener("change", async (event) => {
  settings.shortsControls.channelNamesEnabled = event.target.checked;
  await persist();
});

$("#shortsPublishTimeEnabled").addEventListener("change", async (event) => {
  settings.shortsControls.publishTimeEnabled = event.target.checked;
  await persist();
});

$("#absoluteDateEnabled").addEventListener("change", async (event) => {
  settings.dateDisplay.enabled = event.target.checked;
  renderDateDisplay();
  await persist();
});

$("#absoluteDateFormat").addEventListener("input", (event) => {
  settings.dateDisplay.format = event.target.value.slice(0, 60);
  const preview = YTQSDate.format(new Date(2026, 8, 2, 14, 5, 9), settings.dateDisplay.format, activeLanguage);
  $("#absoluteDatePreview").textContent = t("absoluteDatePreview").replace("{date}", preview);
});

$("#absoluteDateFormat").addEventListener("change", async (event) => {
  settings.dateDisplay.format = YTQSDate.normalizeFormat(event.target.value);
  renderDateDisplay();
  await persist();
});

$("#copyVideoInfo").addEventListener("click", () => copyVideoInfo(YTQSCopy.DEFAULT_FORMAT));
$("#captureVideoFrame").addEventListener("click", captureVideoFrameFromPopup);
$("#captureVideoFrameResult").addEventListener("change", async (event) => {
  settings.screenshot.output = SCREENSHOT_OUTPUTS.includes(event.target.value) ? event.target.value : "download";
  applyTranslations();
  await persist();
});

$("#copyFormatToggle").addEventListener("click", () => {
  const willOpen = $("#copyFormatMenu").hidden;
  $("#copyFormatMenu").hidden = !willOpen;
  $("#copyFormatToggle").setAttribute("aria-expanded", String(willOpen));
  if (willOpen) $("#copyFormatMenu button[aria-checked='true']")?.focus();
});

$("#copyFormatMenu").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy-format], [data-copy-action]");
  if (!button) return;
  closeCopyFormatMenu();
  if (button.dataset.copyAction === "social-share") {
    openSocialShareFromPopup(button.dataset.sharePlatform);
    return;
  }
  await copyVideoInfo(button.dataset.copyFormat);
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".copy-card")) closeCopyFormatMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !$("#copyFormatMenu").hidden) closeCopyFormatMenu();
});

$("#shortcutHelpButton").addEventListener("click", () => {
  $("#shortcutDialog").showModal();
});

$("#shortcutDialog").addEventListener("click", (event) => {
  if (event.target === event.currentTarget) event.currentTarget.close();
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

$("#globalDisableAutoplayNextEnabled").addEventListener("change", async (event) => {
  settings.global.disableAutoplayNext = event.target.checked;
  await persist();
});

$("#globalHideEndScreenRecommendationsEnabled").addEventListener("change", async (event) => {
  settings.global.hideEndScreenRecommendations = event.target.checked;
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
  const [stored, coordination] = await Promise.all([
    chrome.storage.sync.get("ytQuickSettings"),
    getInstanceConflictStatus()
  ]);
  settings = normalizeSettings(stored.ytQuickSettings);
  instanceConflict = coordination?.conflict?.active ? coordination.conflict : null;
  $("#languageSelect").value = settings.language;
  activeLanguage = resolveLanguage();
  if (instanceConflict) {
    applyTranslations();
    renderInstanceConflict();
    $("#statusDot").classList.remove("online");
    $("#statusDot").title = t("instanceConflictTitle");
    return;
  }
  if (Number(stored.ytQuickSettings?.schemaVersion || 1) < SETTINGS_FORMAT_VERSION || !stored.ytQuickSettings?.copy || !stored.ytQuickSettings?.gridLayout || !stored.ytQuickSettings?.screenshot) {
    await chrome.storage.sync.set({ ytQuickSettings: settings });
  }
  $("#languageSelect").value = settings.language;
  context = await getPageContext();
  await loadRestorePoint();
  activeContentType = context?.contentType === "shorts" ? "shorts" : "regular";
  $("#statusDot").classList.toggle("online", Boolean(context?.isVideo));
  $("#copyVideoInfo").disabled = !context?.isVideo;
  $("#copyFormatToggle").disabled = !context?.isVideo;
  $("#captureVideoFrame").disabled = !context?.isVideo;
  renderType();
  renderInstanceConflict();
}

init();
