# V5.0.3 Writing Full Flow

本版已直接整合：
- Writing 專用 Instructions
- Writing 雙欄作答頁
- Cut / Paste / Undo / Redo
- Hide / Show Word Count
- 即時 Word Count
- Writing 題庫 Loader
- Next / Submit
- text_response 儲存
- 每題依 question.responseSeconds 倒數
- 時間到自動儲存並進下一題
- 最後一題時間到自動 Submit
- 防止手動 Next 與 Timer 同時送出造成重複資料
- 返回首頁時自動清理 Writing Timer
- 修正 loadWritingAssessmentQuestions scope

安裝方式：
1. 先備份原專案。
2. 覆蓋 index.html、app.js、question-service.js。
3. style-writing.css 放到 style.css 同層。
4. 其他原本 JS / CSS / 後台檔案全部保留。
5. 重新啟動 Live Server。
6. Ctrl + F5 強制重新整理。

注意：
response.js 請維持 Writing 使用 response_type="text"、text_response=學生答案；
非 audio 作答時 recording_bucket / recording_path 建議為 null。
