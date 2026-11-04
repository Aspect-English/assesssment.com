# V5.4.7 — Part 4 Publish Check Fix

修正發布前檢查：
- Part 4 改以 Q8–Q10 題組方式驗證。
- Question/Prompt 文字可空白，不再判定為「沒有題目內容」。
- 必須完整有 Q8、Q9、Q10。
- Q8/Q9/Q10 必須為 active。
- 共用 Information 圖片必須存在。
- Q8/Q9/Q10 題目音檔必須存在。
- 共用 Information 音檔維持選填，只顯示提醒。
- 各題 Preparation / Response 繼續驗證。

修正刪除題目：
- 刪除前先檢查 test_questions 是否仍引用該題。
- 若仍被測驗使用，不再顯示資料庫 FK 技術錯誤。
- 改提示老師先到「測驗組卷」移除題目並儲存，再回題庫刪除。
