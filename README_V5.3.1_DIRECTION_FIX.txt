V5.3.1 — Student Speaking Direction Fix

修正：
1. 學生端不再只依賴 question.part。
2. 可辨識 part / partNumber / part_number。
3. 若題目沒有 Part 欄位，依正式題號自動判斷：
   Q1–2 = Part 1
   Q3–4 = Part 2
   Q5–7 = Part 3
   Q8–10 = Part 4
   Q11 = Part 5
4. 每個 Part 的 Direction 只播放一次。
5. Direction 播放期間會顯示該 Part Direction，不提前顯示正式題目。
6. Practice Question 不計入正式 Q1–Q11 的 Part 判斷。
7. 老師後台原本已新增的 Direction 不需要重建，但狀態必須為 Active。

預期流程：
Practice Question
→ Part 1 Direction → Q1 → Q2
→ Part 2 Direction → Q3 → Q4
→ Part 3 Direction → Q5 → Q6 → Q7
→ Part 4 Direction → Q8 → Q9 → Q10
→ Part 5 Direction → Q11

部署後：
1. 重新部署 Vercel。
2. Ctrl + Shift + R。
3. 若 PWA 仍是舊版：
   F12 > Application > Service workers > Unregister
   Application > Storage > Clear site data
   再重新整理。
