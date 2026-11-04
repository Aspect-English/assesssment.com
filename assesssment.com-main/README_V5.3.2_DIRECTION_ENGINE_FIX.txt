V5.3.2 Direction Engine Fix

這版修正真正的學生端 Direction 執行位置。

V5.3.1 問題：
Direction 原本掛在 playPrompt()。
但 TOEIC Speaking 有些題型（例如 Read Aloud）不一定會執行 playPrompt，
所以即使老師後台已有 Active Direction，學生端也可能完全看不到。

V5.3.2：
1. AssessmentEngine 新增 beforeQuestion hook。
2. 每一題開始準備/播放題目/錄音之前，Engine 都會 await Direction。
3. 每個 Part 只播放一次：
   Practice
   → Part 1 Direction → Q1 → Q2
   → Part 2 Direction → Q3 → Q4
   → Part 3 Direction → Q5 → Q6 → Q7
   → Part 4 Direction → Q8 → Q9 → Q10
   → Part 5 Direction → Q11
4. Direction 播完才回到正式題目畫面。
5. 學生端可相容 status = active 或 Active。
6. Supabase 若無法讀取 speaking_directions，現在會直接報錯，不再默默跳過。

老師後台原本 Direction 不需要重建。
請確認 Direction 狀態為 Active。

部署後一定要：
F12 → Application → Service workers → Unregister
Application → Storage → Clear site data
關閉頁面重新開啟，再測 Speaking。
