# YouTube 快速設定工具箱－隱私權政策

最後更新：2026 年 9 月 5 日

本隱私權政策適用於 Chrome 與 Firefox 版本的「YouTube 快速設定工具箱」（以下稱「本擴充功能」）。Safari 轉換準備版尚未公開發布。

## 我們處理的資料

本擴充功能只會在 `youtube.com` 上，於使用者操作或觀看影片時讀取目前頁面的影片類型、公開標題、公開網址、目前播放時間、公開發布日期、頻道名稱與頻道識別資訊，以判斷應套用的設定、補充 Shorts 卡片資訊，並在使用者主動執行複製操作時產生所選格式的文字。複製內容不會傳送給開發者。只有使用者在複製成功提示期間再次按下 `S`，或主動選擇下拉選單的 Facebook 分享項目時，擴充功能才會開啟 Facebook 分享頁面，並將目前影片的公開標題與公開網址加入分享網址參數；後續資料處理由 Facebook 的服務與隱私政策管理。

若使用者啟用「首頁 Shorts 顯示頻道名稱」或「Shorts 顯示發布時間資訊」，本擴充功能會將首頁可見 Shorts 的公開影片網址傳送至 YouTube 自己的公開中繼資料或影片頁面，以取得頻道名稱、頻道網址及公開發布日期。Shorts 播放頁會優先讀取 YouTube 已載入目前頁面的公開發布日期，只有資料尚未就緒時才向 YouTube 自己的影片頁面補查。請求不會攜帶登入 Cookie，結果只暫存在目前頁面，不會傳送給開發者或其他服務。

除上述由使用者明確觸發的 YouTube 公開影片 Facebook 分享外，本擴充功能不會收集、傳送、出售或與開發者及第三方分享瀏覽紀錄、YouTube 頁面內容、個人資料或使用統計，也不含廣告、追蹤器與分析服務。

## 儲存的設定

本擴充功能會使用瀏覽器的 `storage.sync` 儲存使用者選擇的語言、全域設定、自動播放下一部影片開關、片尾推薦卡顯示設定、Shorts 設定、截圖結果、複製格式及頻道專屬設定。若使用者已啟用瀏覽器同步，這些偏好可能由 Chrome 或 Firefox 在使用者自己的裝置間同步；開發者無法存取這些資料。匯入設定前建立的單一還原點儲存在 `storage.local`，只存在使用者裝置中。

設定匯出與匯入由使用者主動操作，JSON 檔案只在本機產生或讀取，不會上傳至開發者或第三方服務。

移除本擴充功能或清除其儲存資料，即可移除本機設定；同步副本依使用者的瀏覽器帳戶與同步設定管理。

## 權限用途

- `storage`：儲存並同步使用者選擇的速度、畫質、自動播放、頻道、Shorts 與介面語言設定。
- `activeTab`：使用者開啟擴充功能時，辨識目前作用中的 YouTube 分頁與影片情境。
- `clipboardWrite`：只有使用者點擊複製按鈕、選擇複製格式、在影片頁按下 `S`／`Shift+S`，或選擇「複製到剪貼簿」後主動截圖時，將目前公開影片資訊或 PNG 影格寫入系統剪貼簿；不會讀取剪貼簿內容。
- 影片截圖直接在使用者裝置上從目前影片影格產生，依使用者選擇下載或複製到剪貼簿，不會上傳或傳送給開發者。
- `https://www.youtube.com/*`：在 YouTube 影片與 Shorts 頁面套用播放速度、選擇可用畫質、依使用者選項關閉下一部影片自動播放或隱藏片尾推薦卡、同步 YouTube 設定面板狀態、顯示設定提示，並從 YouTube 取得首頁 Shorts 的公開頻道資料及首頁／播放頁的公開發布日期。

## 資料安全與第三方

本擴充功能不使用自有伺服器、不執行遠端程式碼，也不包含廣告或分析服務。Shorts 頻道名稱與發布日期只從目前正在使用的 YouTube 頁面讀取或向 YouTube 服務查詢。使用者偏好的跨裝置同步由 Chrome 或 Firefox 提供，並受相應瀏覽器供應商的隱私條款約束。社群分享只會在使用者主動選擇分享項目，或在複製提示期間按下對應快速鍵時開啟，且不需要社群平台主機權限；分享頁面的登入、預覽與發佈行為由各平台控制。

本擴充功能對從 Google API 或 Google 服務取得之資訊的使用，遵守 Chrome Web Store User Data Policy，包括 Limited Use 要求。

## 聯絡方式

如有隱私權問題，請透過 [GitHub Issues](https://github.com/ahui3c/Youtube-Quick-Setting/issues) 聯絡。

## English

This extension locally reads the current YouTube video type, title, public URL, current playback time, channel name, channel identifier, and public publish date only to provide its features. Selected video information is written to the clipboard only after the user clicks a copy control or presses `S`/`Shift+S`; clipboard contents are never read. Video screenshots are generated locally from the current video frame and either downloaded or copied to the clipboard according to the user's saved preference; they are never uploaded or sent to the developer. Facebook, X, or Threads sharing opens only after the user explicitly selects it or presses `F`, `X`, or `T` while the copy confirmation is visible. JSON exports, imports, and the single local restore point are processed only on the user's device. Home Shorts channel names and publish dates are obtained from YouTube without login cookies. Synced preferences are stored with the browser's `storage.sync`; the developer cannot access them. The Chrome and Firefox builds contain no ads, trackers, analytics, remote code, or developer-operated server. The Safari conversion-ready output has not been publicly released.

## 日本語

本拡張機能は、機能提供のために現在の YouTube 動画タイプ、タイトル、公開 URL、現在の再生位置、チャンネル名、チャンネル識別情報、公開日をローカルで読み取ります。選択した動画情報は、ユーザーがコピー操作を行うか `S`／`Shift+S` キーを押した場合のみクリップボードへ書き込み、内容は読み取りません。動画スクリーンショットは現在の動画フレームから端末内で生成し、保存済みの選択に従ってファイル保存またはクリップボードへコピーします。開発者へのアップロードや送信は行いません。Facebook、X、Threads の共有は、ユーザーが明示的に選択するか、コピー確認表示中に `F`、`X`、`T` を押した場合のみ開きます。JSON の書き出し・読み込みと単一の復元ポイントは端末内だけで処理されます。ホームのショートのチャンネル名と公開日は、ログイン Cookie なしで YouTube から取得します。同期設定はブラウザーの `storage.sync` に保存され、開発者はアクセスできません。Chrome 版と Firefox 版には、広告、トラッカー、解析サービス、リモートコード、開発者運営サーバーは含まれません。Safari 変換準備版はまだ一般公開していません。
