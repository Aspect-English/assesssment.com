# Aspect TOEIC SW V7.8 — PDF 音檔 QR Code

## 部署順序
1. 先備份 Supabase 資料庫，在 SQL Editor 執行 `SUPABASE_REPORT_AUDIO_LINKS.sql`。
2. Supabase Edge Functions 建立新函式 `report-audio`，將 `supabase/functions/report-audio/index.ts` 貼上並部署。這是公開掃碼 GET 入口，必須允許沒有 JWT 的 GET；POST 在程式內自行驗證老師 JWT 和 profiles 權限。請在此函式設定中關閉「Verify JWT」(函式程式會驗證 POST 的 Bearer token)。
3. 使用 GitHub Desktop 將網站檔案同步到原 Repository，Commit、Push，等待 Pages 部署。
4. 老師端登入 → 學生紀錄 → 查看 → 匯出 PDF。第一次會建立 30 天有效的安全播放連結並生成 QR Code。
5. 使用手機掃描學生錄音及題目音檔 QR Code，確認能播放；列印成 PDF 再測試一次。

## 權限及安全
- 只有 profiles 中 active 的 teacher/admin 能發行連結。
- 持有 PDF/QR 的人不需登入即可在 30 天內播放；請勿把成績單公開分享。
- 隨機 256-bit token 僅以 SHA-256 雜湊存資料庫；每次匯出會發行新連結，舊連結不會自動撤銷。
- 可在 report_audio_links 表將 revoked_at 設為目前時間以撤銷。
- 錄音仍儲存在私有 Storage，透過 Edge Function 按權限檢查後串流。
- 題目音檔目前支援 HTTPS Supabase 專案網域及 aspect-english.github.io 的 audio_url；其他網域會略過 QR Code。
- QR Code 產生需要 jsDelivr 的 qrcode 依賴；離線環境無法產生。

## 已知限制
- 目前不提供老師端按鈕撤銷連結，請在 Supabase 表格管理。
- 音檔較大時 Edge Function 代理串流可能受到平台執行時間/傳輸限制。
- QR Code 是播放連結，不是將音訊嵌入 PDF；過期後須重新匯出。
- 尚未在正式 Supabase 環境完成端到端測試，請先用測試學生紀錄驗證。
