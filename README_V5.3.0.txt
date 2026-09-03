V5.3.0 Teacher Question Manager + Speaking Directions + Louder Beep

本版重點：
1. 老師後台保留原本題庫管理 / 新增題目 / 編輯題目 / 測驗管理。
2. 新增「口說 Directions」管理：
   - Part 1~5
   - 標題
   - Direction 文字
   - Direction 音檔
   - Active / Draft / Inactive
   - AI 轉逐字稿（需啟用既有 transcribe-audio Edge Function）
3. 學生端會在每個 Speaking Part 第一題開始前播放該 Part Direction，且每 Part 只播一次。
4. Beep 音量提高：
   - 一般開始提示音預設 0.65
   - 麥克風測試開始 Beep 約 0.72
   - 結束提示音約 0.58
5. 保留 V5.2.1：
   - 麥克風測試先 Beep 再錄音
   - Part 3 Q5/Q6/Q7 逐題揭露
   - Practice Question
   - Writing Exam Mode
   - PWA / Vercel 架構

Supabase：
請確認 speaking_directions 表存在，至少欄位：
- id uuid
- part_number int unique
- title text
- directions_text text
- audio_url text
- status text
- created_at timestamptz
- updated_at timestamptz

RLS：
teacher/admin 需能 select/insert/update speaking_directions。

AI 逐字稿：
- 使用 supabase/functions/transcribe-audio
- 需在 Supabase Edge Function secret 設定 OPENAI_API_KEY

部署：
- 解壓後把根目錄全部內容部署到 Vercel
- Service Worker cache 已升級 v5.3.0
- 部署後建議 Ctrl+Shift+R
