# V7.8.1 QR Code 載入修正

- 將 QR Code 編碼程式放在網站本機 `qr-code-local.js`，不依賴外部 CDN。
- 使用支援 `QRCode.toDataURL()` 的 Canvas QR Code 轉換介面，與既有 PDF 報告程式相容。
- 修正 `teacher.html` 的套件引用與版本快取。
- 保留原有 Supabase report-audio 連結簽發及權限機制，無需再次更動 Edge Function。

## 部署
請將 `assesssment.com/` 內的網站檔案更新到 GitHub repository 的根目錄；不要把外層資料夾再包一層。GitHub Desktop Commit 並 Push。強制重新整理老師端後測試 PDF 匯出及 QR Code 掃描。

## 注意
已進行 JavaScript 語法檢查，尚未在正式網站端到端測試。原始壓縮檔同時包含舊版巢狀資料夾 `assesssment.com-main/`，請使用最外層 `assesssment.com/` 的新版檔案。

QR encoder copyright (c) 2009 Kazuhiko Arase, MIT license.
