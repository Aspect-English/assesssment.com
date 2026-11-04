# V7.8.3 — 音檔 QR Code 播放頁修正

- QR Code 新連結導向 GitHub Pages `audio-player.html#token=...`，避免 Supabase Edge Function 的 HTML 被顯示為純文字。
- 音檔仍由 `report-audio?raw=1&token=...` 取得，後端每次驗證到期與撤銷狀態。
- 只修改 Edge Function 的新連結網址，保留現有 PDF 與評分邏輯。

## 部署
1. GitHub Desktop：複製網站根目錄檔案並 Commit/Push（確保 `audio-player.html` 在網站根目錄）。
2. Supabase → Edge Functions → report-audio → Code：使用 `supabase/functions/report-audio/index.ts` 覆蓋並 Deploy updates。Verify JWT 保持 OFF。
3. 重新匯出 PDF，舊 PDF QR Code 不會自動更新。掃描新 PDF QR Code 測試。

## 限制
本修正解決 HTML 被當純文字顯示的問題，不會轉碼 WebM/Opus，也不會修復損壞或不存在的原始錄音。需要實際手機與電腦測試播放。
