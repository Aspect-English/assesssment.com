# V8.0.4 學生姓名管理補丁

## 新增功能
- 老師可在「作業管理 → 學生作業指派」選擇學生，編輯姓名並儲存至 Supabase。
- 儲存後下拉選單更新為「姓名（Email）」。
- 「重新載入學生」會取得新建立的學生帳號。

## 新增學生帳號（安全流程）
由於靜態 GitHub Pages 前端不應持有 Supabase service_role 金鑰，本補丁**不會在瀏覽器直接建立 Auth 使用者**。新增學生時，先由管理員到 Supabase Authentication → Users 建立登入帳號，確認 public.profiles 有同 UUID 且 role='student'、status='active' 的資料，回老師端按「重新載入學生」。若要一鍵新增帳號，需另外實作受管理員授權的 Edge Function。

## 安裝
1. 先備份正式環境，建議先在測試環境驗證。
2. 在 SQL Editor 執行 `V8_0_4_STUDENT_NAME_INSTALL.sql`。須先安裝既有 V8.0.4，包含 `hw_v804_is_teacher()`。
3. 將 `teacher.html`、`homework-assignment-v804.js`、`homework-management.css` 上傳至 GitHub Pages 專案根目錄並覆蓋同名檔案。
4. 部署後強制重新整理，登入管理員，選學生、輸入姓名、儲存，重新登入確認名稱仍在。

## 注意
- 不修改原有學生帳號密碼、Email、角色、測驗或作業設定。
- SQL 函式依賴現有 `hw_v804_is_teacher()` 的老師權限判斷；部署前請確認該函式安全性。
- 本補丁只提供「修改姓名」及「重新載入新增學生」，不是一鍵建立登入帳號的完成版。
