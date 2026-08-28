# YouTube 快速設定速度 / 畫質－隱私權政策

最後更新：2026 年 8 月 28 日

本隱私權政策適用於 Chrome 擴充功能「YouTube 快速設定速度 / 畫質」（以下稱「本擴充功能」）。

## 我們處理的資料

本擴充功能只會在 `youtube.com` 上，於使用者操作或觀看影片時讀取目前頁面的影片類型、頻道名稱與頻道識別資訊，以判斷應套用全域、Shorts 或該頻道專屬的速度與畫質設定。

若使用者啟用「首頁 Shorts 顯示頻道名稱」，本擴充功能會將首頁可見 Shorts 的公開影片網址傳送至 YouTube 自己的公開中繼資料端點，以取得頻道名稱與頻道網址。請求不會攜帶登入 Cookie，結果只暫存在目前頁面，不會傳送給開發者或其他服務。

本擴充功能不會收集、傳送、出售或與開發者及第三方分享瀏覽紀錄、YouTube 頁面內容、個人資料或使用統計，也不含廣告、追蹤器與分析服務。

## 儲存的設定

本擴充功能會使用 Chrome 的 `storage.sync` 儲存使用者選擇的語言、全域設定、Shorts 設定及頻道專屬設定。若使用者已在 Chrome 啟用同步，這些偏好可能由 Google Chrome 在使用者自己的裝置間同步；開發者無法存取這些資料。

移除本擴充功能或清除其儲存資料，即可移除本機設定；Chrome 同步副本則依使用者的 Chrome 帳戶與同步設定管理。

## 權限用途

- `storage`：儲存並同步使用者選擇的速度、畫質、頻道、Shorts 與介面語言設定。
- `activeTab`：使用者開啟擴充功能時，辨識目前作用中的 YouTube 分頁與影片情境。
- `https://www.youtube.com/*`：在 YouTube 影片與 Shorts 頁面套用播放速度、選擇可用畫質、同步 YouTube 設定面板狀態、顯示設定提示，並從 YouTube 取得首頁 Shorts 的公開頻道資料。

## 資料安全與第三方

本擴充功能不使用自有伺服器、不執行遠端程式碼，也不向 YouTube 以外的第三方傳輸資料。首頁 Shorts 頻道名稱只向目前正在使用的 YouTube 服務查詢；使用者偏好的跨裝置同步則由 Chrome 提供並受 Google 的隱私條款約束。

本擴充功能對從 Google API 或 Google 服務取得之資訊的使用，遵守 Chrome Web Store User Data Policy，包括 Limited Use 要求。

## 聯絡方式

如有隱私權問題，請透過 [GitHub Issues](https://github.com/ahui3c/Youtube-Quick-Setting/issues) 聯絡。

## English

This extension locally reads the current YouTube video type, channel name, and channel identifier only to provide its playback features. When **Show channel names on Home Shorts** is enabled, it sends the public URL of a visible Short to YouTube's own public metadata endpoint without login cookies, then caches the returned channel name and URL only in the current page. Nothing is sent to the developer or any service other than YouTube. Preferences are stored with Chrome `storage.sync`; the developer cannot access them. The extension contains no ads, trackers, analytics, remote code, or developer-operated server. Its use of information received from Google APIs or Google services complies with the Chrome Web Store User Data Policy, including the Limited Use requirements.

## 日本語

本拡張機能は、再生機能を提供するために現在の YouTube 動画タイプ、チャンネル名、チャンネル識別情報をローカルで読み取ります。「ホームのショートにチャンネル名を表示」が有効な場合、表示中ショートの公開 URL をログイン Cookie なしで YouTube 自身の公開メタデータ機能へ送り、返されたチャンネル名と URL を現在のページ内だけでキャッシュします。開発者や YouTube 以外のサービスには送信しません。設定は Chrome の `storage.sync` に保存され、開発者はアクセスできません。広告、トラッカー、解析サービス、リモートコード、開発者運営サーバーは使用しません。
