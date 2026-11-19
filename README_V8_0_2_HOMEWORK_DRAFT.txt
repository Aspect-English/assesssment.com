Aspect TOEIC SW V8.0.2 — 老師端作業編排草稿

此 ZIP 是基於使用者上傳的 assesssment.com-main (2).zip 製作的完整網站專案。

已實作：
- teacher.html 老師後台新增「作業管理」選單
- Homework 01～15 作業名稱、備註、Speaking Part 1–5 / Writing Part 1–3 題數編輯
- 本機 localStorage 草稿儲存、JSON 匯入/匯出、重設、題數摘要
- 沿用原本 teacher.js 的老師登入與頁籤切換

重要限制：
- 此版本不會寫入 Supabase，不會指派學生、抽題、發布作業、處理錄音或停權。
- 本機草稿只存在該瀏覽器，換電腦需匯出 JSON 再匯入。
- V8.0.1 資料庫 SQL 預設 RLS 拒絕所有資料存取，不能直接由瀏覽器使用。
- 正式啟用前需實作後端權限驗證、交易式防重複抽題、題庫關聯與權益檢查。

部署：
1. 先備份目前 GitHub 專案。
2. 將 ZIP 中 assesssment.com-main/ 的檔案覆蓋到同一網站專案（請勿額外多一層資料夾）。
3. GitHub Desktop Commit / Push；網站更新後重新整理老師端。
4. 老師登入後點選「作業管理」，可編輯與匯出15組作業草稿。
5. 不必先執行 V8.0.1 SQL 即可試用本機草稿介面。

此版本尚未經實際瀏覽器登入或 Supabase 環境整合測試。
