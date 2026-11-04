V5.0.9 修正「刪除測驗按鈕有顯示但按了沒反應」

原因：
V5.0.8 的 data-delete-test click listener 被放在 renderTestCards() 外面。
teacher.js 初次執行時，測驗卡片尚未 render，所以 querySelectorAll 找不到按鈕，
因此沒有綁定 click 事件。

V5.0.9：
- 把刪除測驗 click listener 移到 renderTestCards() 內
- 每次測驗卡片重新 render 後都會重新綁定刪除事件
- 保留安全刪除規則：
  1. 無學生作答 -> 永久刪除組卷關聯 + 測驗
  2. 有學生作答 -> 保留資料並改 inactive

安裝：
覆蓋 teacher.html、teacher.js、test-builder-service.js
Ctrl+F5 強制重新整理
