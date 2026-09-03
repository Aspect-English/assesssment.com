V5.3.3 — Direction Timer Hide

修正：
1. Speaking Direction 畫面完全隱藏：
   - Preparation Time
   - Response Time
   - 00:45 / 00:xx
2. Direction 播放期間只保留：
   - Speaking Part X
   - Direction 標題
   - Direction 文字
   - Directions 狀態
3. Direction 音檔播放完成後，正式題目開始前才恢復：
   - Preparation Time
   - Response Time
4. 保留 V5.3.2 所有功能：
   - Part 1~5 Direction 每 Part 播放一次
   - Practice Question
   - Part 3 Q5/Q6/Q7 逐題揭露
   - 麥克風測試先 Beep 再錄音
   - PWA / Vercel
   - Teacher Directions Manager

部署後：
- 重新部署 Vercel。
- Ctrl + Shift + R。
- 若 PWA 仍讀舊版：
  Application > Service workers > Unregister
  Application > Storage > Clear site data
  再重新開啟。
