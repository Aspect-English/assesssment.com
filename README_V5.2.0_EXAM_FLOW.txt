V5.2.0 Exam Flow

完成調整：
1. 耳機測試進入頁面後自動播放測試語音；只有自動播放失敗時才顯示重新播放按鈕。
2. 麥克風測試按開始後，先播放 Beep，再正式開始 5 秒錄音。
3. Speaking 正式測驗畫面移除進度條（保留隱藏相容節點）。
4. 測驗完成頁不再顯示錄音播放器／錄音狀態，改為「作答已成功送出」。
5. Speaking 正式題目前增加 Practice Question：5 秒準備 + Beep + 10 秒作答；Practice 錄音不寫入正式 responses。
6. 老師後台增加「AI 轉逐字稿」：
   - 先上傳音檔
   - 按 AI 轉逐字稿
   - Read Aloud 會優先填 Passage；其他題型填 Prompt
   - 需部署 supabase/functions/transcribe-audio 並設定 OPENAI_API_KEY
7. Writing Exam Mode：
   - 僅允許英文字母、數字、空白與常用英文標點
   - 貼上內容會過濾非英文字符
   - Writing 期間停用右鍵
   - 嘗試進入 Fullscreen
   - 偵測切換分頁/視窗並在回到測驗時顯示警告與次數
   注意：一般瀏覽器/PWA 無法從作業系統層級完全禁止 Alt+Tab，只能偵測、警告與全螢幕降低誤切。

部署：
- 解壓後部署「所有根目錄內容」到 Vercel。
- Service Worker cache 已升級為 v5.2.0，部署後建議 Ctrl+Shift+R。
- AI 逐字稿的 Supabase Edge Function 不會因 Vercel 部署自動上線，需另部署至 Supabase。
