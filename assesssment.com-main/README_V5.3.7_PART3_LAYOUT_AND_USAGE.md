# V5.3.7 — Part 3 TOEIC-like Sequential Layout

## 學生端 Part 3
畫面改成參考 TOEIC Speaking 的閱讀式排版：

- 黑色頂部：TOEIC Speaking / Question X of 11
- Situation / Passage 固定顯示在上方
- 下方只顯示目前題目
- Q5 時不顯示 Q6、Q7
- Q6 時不顯示 Q7
- Q7 只在 Q6 回答結束後出現
- Preparation / Response 計時器保留在下方
- Begin preparing now / Begin speaking now / Beep / Recording 流程保留

## 老師後台如何新增 Part 3
1. 老師登入後台。
2. 進入「題庫管理 / 新增題目」。
3. Section 選 Speaking。
4. 題型選 Respond to Questions。
5. 會出現「Part 3 題組快速新增」。
6. 輸入題組代碼，例如 FOOD01。
7. 輸入題組標題，例如 Food Interview。
8. Situation / Passage 只輸入一次。
9. 輸入 Q5、Q6、Q7。
10. 建議時間：
    - Q5：Preparation 3 / Response 15
    - Q6：Preparation 3 / Response 15
    - Q7：Preparation 3 / Response 30
11. 按「一次建立 Q5–Q7」。
12. 回到題庫後，可逐題編輯 Q5/Q6/Q7，上傳各自音檔。
13. 到「測驗組卷」把三題依序加入目前 Speaking 測驗。
14. 題序必須是 Q5 → Q6 → Q7。

## 學生端預期流程
Part 3 Direction
→ Q5 Situation + Q5
→ Begin preparing now
→ 3 秒
→ Begin speaking now
→ Beep
→ 15 秒錄音
→ Q6 Situation + Q6
→ 3 / 15
→ Q7 Situation + Q7
→ 3 / 30

部署後若仍看到舊版：
F12 → Application → Service workers → Unregister
→ Storage → Clear site data → 重開網站。
