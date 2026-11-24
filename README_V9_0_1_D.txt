V9.0.1-D 開發測試包（不是正式上線版）
基於原始專案 (6) + V9.0.0 + V9.0.1。
1. 先備份資料庫與 GitHub，使用獨立測試 Supabase 專案。SQL 會替換測驗 trigger 與部分 RLS，舊帳密入口不再可建立測驗。勿直接在 production 執行。
2. SQL Editor 執行 V9_0_1_D_INSTALL.sql。若錯誤停止，不要部署前端。
3. 部署 Edge Function student-code：Supabase CLI 登入並 link 測試專案後，在此目錄執行 supabase functions deploy student-code --no-verify-jwt。此函式以代碼自行驗證；不接受任意使用者 ID。服務角色金鑰僅使用 Edge 環境變數，不放 GitHub 前端。
4. 將根目錄 HTML/JS 覆蓋原專案（測試分支），不要把 SQL 當作網頁執行。測試分支的 config.js 需指向測試專案。
5. 教師端測驗管理：載入既有學生，選測驗類型、有效時間，產生代碼；學生首頁輸入姓名與代碼，選測驗。代碼在建立 session 時消耗。測試已完成、錯誤代碼、過期代碼、重複使用及跨學生寫入。
6. 學生管理：產生專屬代碼（重發撤銷舊碼），需既有 active student Auth 帳號與 hw_v804_access 有效權益。學生端可查詢可用週次，尚不能作答。
限制：未連線實測 SQL、Edge Function、Storage 或瀏覽器。仍需既有 Auth 帳號（學生不需知道帳密），未實作教師新增 Auth 帳號、重考、斷線續考、完整作業作答、伺服器請求限速、Storage RLS 與題庫保護。代碼為 96-bit 隨機值，雜湊儲存；驗證 session 最長四小時。舊未綁定紀錄不會按姓名合併。一次性代碼僅對指定一種測驗有效。不可正式開放前述安全缺口未驗證的環境。
