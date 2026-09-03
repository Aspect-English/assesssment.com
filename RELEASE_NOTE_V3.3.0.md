# Aspect TOEIC SW Platform V3.3.0

本版完成第一個可實際運作的測驗發布閉環：

老師建立測驗 → 題庫選題 → 設定順序 → 儲存草稿 → 發布 → 學生端載入目前 active 的口說測驗。

## 新增
- Test Builder 測驗建立與編輯視窗
- 題庫搜尋、多選加入、移除、上下排序
- 儲存 `tests` 與 `test_questions`
- 基本發布前檢查
- 一鍵發布並停用舊的 speaking active 測驗
- 學生端不再綁定固定 `test_code`，自動載入最新 active speaking 測驗
- Teacher Portal 測驗卡操作按鈕
- Supabase RLS migration

## 部署前必要操作
先執行 `sql/05_test_builder_v3_3_0.sql`。
