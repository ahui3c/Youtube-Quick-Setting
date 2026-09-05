# Firefox 版本開發與封裝

Firefox 版本與 Chrome 共用功能原始碼，但只在 `dist-firefox/` 建置輸出中把擴充功能 API 轉為 `browser.*`。根目錄的 Chrome Manifest 與 JavaScript 不會被覆寫。

## 建置與測試

```powershell
pnpm run build:firefox
pnpm test
pnpm run package:firefox
```

產生結果：

- `dist-firefox/`：可從 `about:debugging#/runtime/this-firefox` 暫時載入的目錄
- `deliverables/firefox/YouTube-Quick-Settings-Toolbox-v2.0.2-Firefox.zip`：AMO 上傳用未簽署 ZIP
- 同名 `.sha256`：檔案雜湊

暫時載入時，請選擇 `dist-firefox/manifest.json`。一般使用者永久安裝仍需經 Mozilla Add-ons 簽署。

## Firefox 專屬設定

- 固定 Gecko ID：`youtube-quick-settings-toolbox@ahui3c.com`
- 最低版本：Firefox 142（符合目前 AMO 資料收集聲明欄位的支援範圍）
- 資料收集聲明：`required: ["none"]`
- 純影片截圖複製優先使用標準 Clipboard API；若 Firefox 不提供影像寫入，才使用 `browser.clipboard.setImageData()`。

發布前仍需在實際 Firefox 中驗證 YouTube 一般影片、Shorts、SPA 導航、面板儲存、快捷鍵、畫質回退、截圖下載與剪貼簿結果。
