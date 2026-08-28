# Chrome Web Store 隱私權揭露填表草稿

## 單一用途

在 YouTube 一般影片與 Shorts 頁面，依使用者偏好自動套用播放速度及可用畫質，提供鍵盤快速操作、畫面提示、首頁 Shorts 頻道名稱，以及由使用者選擇啟用的第三方預估踩數。

## 權限理由

### storage

儲存使用者選擇的播放速度、畫質、一般影片與 Shorts 設定、頻道專屬設定及介面語言。資料使用 Chrome storage.sync；開發者不接收或存取資料。

### activeTab

僅在使用者點擊擴充功能按鈕時辨識目前作用中的分頁是否為 YouTube 影片，並取得該影片的本機頁面情境以顯示及編輯正確設定。

### 主機權限 https://www.youtube.com/*

在 YouTube 影片與 Shorts 頁面讀取影片類型及頻道識別資訊，控制 HTML5 播放速度、呼叫 YouTube 播放器可用畫質介面、同步設定面板顯示值、呈現套用結果提示，並向 YouTube 自己的公開中繼資料端點查詢首頁可見 Shorts 的頻道名稱。權限不會用於其他網站。

### 選用主機權限 https://returnyoutubedislikeapi.com/*

預設不授予。只有使用者主動開啟「顯示預估踩數」時才請求，用於傳送目前公開影片 ID 並讀取第三方推算數字；不傳送 YouTube Cookie、使用者身分或按讚／倒讚操作。使用者關閉功能後會移除此權限。

### web_accessible_resources

只公開套件內的 page-bridge.js 給 youtube.com，用於與 YouTube 頁面播放器介面通訊。沒有從網路下載或執行任何程式碼。

## 遠端程式碼

否。本擴充功能的所有 JavaScript 都包含在提交的套件內；不下載、載入或執行遠端程式碼，也不使用 eval 或外部 CDN。

## 資料使用揭露

- 個人識別資訊：否
- 健康資訊：否
- 財務及付款資訊：否
- 驗證資訊：否
- 個人通訊：否
- 位置資訊：否
- 網頁瀏覽記錄：不收集或傳送；只在目前開啟的 youtube.com 分頁本機判斷影片 URL 類型
- 網站內容：在本機暫時讀取目前影片的頻道名稱／識別資訊；首頁 Shorts 公開網址只傳送回 YouTube。若使用者另行啟用預估踩數，公開影片 ID 會傳送至 Return YouTube Dislike API；不傳送給開發者
- 使用者活動：否

## Limited Use 認證

資料使用僅限於提供商店頁面所述的單一用途；不出售、不用於廣告或信用評估、不向第三方轉移，也不允許人工閱讀使用者資料。

## 隱私權政策網址

https://github.com/ahui3c/Youtube-Quick-Setting/blob/master/PRIVACY.md
