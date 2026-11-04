# V5.5.4

## 老師端
- 修正點擊 Part 4 題組仍跳出「Part 4 題組 / 我知道了」提醒。
- 原因是 teacher.js 呼叫 QuestionEditor.open，但 question-editor.js 未輸出該 API。
- 現已輸出 QuestionEditor.open，Part 4 題庫列可直接開啟編輯器。
- 移除 Part 4 的 coming-soon fallback modal。

## 學生端防切換
- 切換分頁 / 視窗 / 應用程式 / 離開全螢幕會終止測驗。
- 終止畫面改為本機立即顯示，不再等待 Supabase 回傳。
- 加入 sessionStorage 違規旗標；學生切回測驗頁時會再次強制終止。
- Speaking / Writing 共用。
- 瀏覽器無法從網頁層真正禁止 Windows Alt+Tab；本系統採偵測後立即終止。
