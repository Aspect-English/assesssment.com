V5.2.1 — Microphone Beep + Part 3 Sequential Reveal

修正 1：麥克風測試 Beep
- 學生按「開始錄音測試」後，先立即播放 Beep。
- Beep 播放完成後才開啟麥克風並開始錄音。
- Beep 放在直接的 user gesture 裡，降低 Chrome / PWA 阻擋音效的機率。
- 畫面順序：
  按開始 → 提示音播放中 → 開啟麥克風 → 錄音中。

修正 2：Speaking Part 3 Q5–Q7
- 每一題一開始只顯示「Listen to the question」。
- 本題語音完整念完後，才顯示「目前這一題」的題目文字／文章。
- Q5 作答期間不會出現 Q6、Q7。
- Q6 作答期間不會出現 Q7。
- 進入 Q7 才會顯示 Q7。
- 若該題同時有 Passage 與 Prompt，念完後會顯示 Passage + 當題 Prompt。

部署：
- 解壓後將根目錄全部內容重新部署至 Vercel。
- Service Worker cache 已升級 v5.2.1。
- 部署後建議 Ctrl+Shift+R；PWA 若仍讀舊版，可 Application > Service workers > Unregister，再 Clear site data。
