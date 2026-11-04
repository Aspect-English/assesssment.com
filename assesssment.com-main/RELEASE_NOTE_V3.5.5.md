# V3.5.5 Release Note

本版完全移除學生端的 3 秒 Demo 時間覆寫：

- 不再呼叫 applyAssessmentDemoTiming
- 清除 localStorage 舊 Demo Mode 記錄
- 正式測驗一律讀取 question_bank.preparation_time
- 正式測驗一律讀取 question_bank.response_time
- 保留問答題開始錄音前的 3 秒停頓
- 更新學生端核心 JS 快取版本
