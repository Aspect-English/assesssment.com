# V7.4 老師端學生紀錄封存按鈕

- 管理員在學生紀錄列表每列可看到「查看」和「刪除」。
- 「刪除」實際執行封存（軟刪除），不刪除學生答案、錄音或評分。
- 操作前會顯示確認視窗；失敗時顯示錯誤。
- 需先在 Supabase SQL Editor 執行 `SUPABASE_ARCHIVE_STUDENT_RECORDS.sql`。
- 若目前登入的 profile.role 不是 admin，刪除按鈕不會顯示。
- 上傳網站時保留原本資料夾結構；確認 GitHub Pages 更新後強制重新整理。
