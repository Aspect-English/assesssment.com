# V3.5.1 Release Note

本版重新整理並修復學生紀錄模組：

- 修復 teacher.html 未載入 Student Records JS
- 修復 StudentRecordsModule 未初始化
- 點選學生紀錄後自動載入 Supabase 資料
- 重新整理按鈕可重新抓取學生紀錄
- 保留 test_sessions 真實欄位
- 學生正式開始測驗時更新正確總題數
- 完成測驗時將 Session 狀態更新為 completed
- 老師可透過 Signed URL 播放學生錄音
- 加入 V3.5.1 RLS 與索引 SQL
