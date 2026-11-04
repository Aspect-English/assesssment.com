PWA V5.1.0
以原 V5.0.1 為基準，只加入 PWA，不改 Speaking/Writing 核心流程。

測試：
1. 用 Live Server / localhost / HTTPS 開啟 index.html（不可用 file://）。
2. Chrome/Edge 網址列或選單選「安裝應用程式」。
3. 安裝後從桌面啟動，應為獨立 App 視窗。
4. 再測 Speaking/Writing、Supabase、麥克風與錄音。

新增：manifest.webmanifest、service-worker.js、pwa-register.js、icons/
Supabase/API/CDN 不做離線快取，避免題庫資料過期。
