# Aspect TOEIC SW Platform V5.0.2 Writing

這是依照目前已上傳的學生端核心檔案整理出的完整 Writing 基礎更新包。

包含：
- index.html
- app.js
- question-service.js
- style-writing.css
- README_V5.0.2.md

已完成：
- Writing 專用雙欄作答頁
- Writing Instructions
- Writing-only 跳過麥克風測試
- Speaking / Writing 分流
- Cut / Paste / Undo / Redo
- Hide / Show Word Count
- 即時 Word Count
- Writing 題庫 Loader
- 修正 loadWritingAssessmentQuestions is not defined
- Writing 三種題型：write_sentence / respond_written_request / opinion_essay

重要：
這個 ZIP 是「目前已上傳核心檔案」的新版本，不是整個原始專案的完整備份。
原專案中的 config.js、supabase-service.js、response.js、test-service.js、assessment-engine.js、
teacher 後台與其他檔案請保留原本版本。

安裝方式：
1. 先備份原專案。
2. 將 index.html、app.js、question-service.js 覆蓋到專案根目錄。
3. 將 style-writing.css 放到 style.css 同一層。
4. 其他原本檔案全部保留。
5. 重新啟動 Live Server。
6. 瀏覽器按 Ctrl + F5 強制重新整理。

下一階段尚未完成：
- Writing 每題正式倒數
- Next / Submit
- Writing 文字答案寫入 responses
- 8 題完整流程
- Full：Speaking 完成後自動進 Writing
- Quick：快速程度檢測題組
- Writing 老師人工評分與 0–200 模擬成績
