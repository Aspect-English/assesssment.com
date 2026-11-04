# V5.4.1 Part 4 Shared Information Audio

新增：
- Part 4 題組可上傳 1 個共用 Information 音檔。
- 共用音檔只在 Information 頁播放一次。
- Q8、Q9、Q10 保留各自題目音檔。
- 學生端優先播放老師上傳的題目音檔；未上傳時才使用瀏覽器 TTS。
- Q10 依既有正式排序邏輯播放題目音檔 2 次。
- 不需新增 Supabase 欄位：共用 Information 音檔 URL 儲存在 directions 的 P4_INFO_AUDIO_URL metadata。
