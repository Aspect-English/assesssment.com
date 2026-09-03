PWA V5.1.1 完整修正版

已完成：
1. 移除 index.html 重複的 manifest 設定。
2. manifest 改用 /manifest.webmanifest?v=5.1.1。
3. icon-192.png 與 icon-512.png 放在網站根目錄。
4. manifest icon 路徑改為 /icon-192.png、/icon-512.png。
5. manifest 新增 id="/"，並統一 start_url="/"、scope="/"。
6. Service Worker cache 版本更新為 v5.1.1。
7. Service Worker 快取路徑同步改成根目錄 icon。
8. pwa-register.js 更新至根目錄 service worker / scope。
9. 保留原本學生端、老師後台與 Supabase 相關檔案。

Vercel 部署：
- 請部署本 ZIP 解壓後「裡面的全部內容」。
- index.html、manifest.webmanifest、service-worker.js、pwa-register.js、
  icon-192.png、icon-512.png 必須位於同一層根目錄。

重新部署後：
1. 確認 /icon-192.png 與 /icon-512.png 可直接開啟。
2. F12 > Application > Service workers > Unregister。
3. Application > Storage > Clear site data。
4. Ctrl + Shift + R。
5. 回 Application > Manifest 檢查 Icons 是否正常出現。
