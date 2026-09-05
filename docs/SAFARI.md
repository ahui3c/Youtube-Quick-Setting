# Safari 版本準備

目前提供「Safari 轉換準備版」，不是可直接提交 App Store 的成品。建置會輸出 `dist-safari/`，保留 Chrome 原始碼與商店封裝不變，並把擴充功能 API 轉為 Safari 支援的 `browser.*` 命名空間。

## 產生轉換來源

```powershell
pnpm run build:safari
```

在 macOS 與最新版 Xcode 中執行：

```bash
xcrun safari-web-extension-packager /path/to/dist-safari
```

命令會產生包含 macOS／iOS 宿主 App 與 Safari Web Extension 的 Xcode 專案。之後應在 Xcode 中設定開發團隊、Bundle Identifier、簽署與 App Store Connect 資料。

## 已預留的相容層

- Chrome、Firefox、Safari 使用同一份功能核心。
- 平台 Manifest 由建置腳本個別產生，避免 Safari 調整污染 Chrome 商店版。
- API 呼叫只在 Safari 輸出中改為 `browser.*`。
- 截圖下載可沿用；Safari 對內容腳本影像剪貼簿的限制不同，未來 Safari 實機版應在宿主／擴充頁面完成剪貼簿橋接，或自動回退為下載。

## 正式開發前檢查

1. 在 macOS/Xcode 轉換並處理轉換器警告。
2. 逐項驗證 YouTube SPA 導航、播放器 API、Shorts DOM 與鍵盤事件。
3. 驗證 macOS Safari 的截圖複製與下載；iOS/iPadOS 需另做觸控介面與快捷鍵能力分級。
4. 完成 Apple Developer 簽署、隱私標籤及 App Store 審核素材。

因此目前可安全地繼續維護共用核心，但不能把 Windows 上的建置結果視為 Safari 實機驗證。
