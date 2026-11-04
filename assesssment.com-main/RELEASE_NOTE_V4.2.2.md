# V4.2.2 Release Note

修復老師 Dashboard 顯示「讀取失敗」：

- 修復 questionTypeSummary 不存在造成的 null.innerHTML 錯誤
- Dashboard 元件改為容錯渲染
- 缺少非必要區塊時只略過，不中斷整個老師後台
- 錯誤畫面改用安全 DOM 函式
- 搜尋、篩選、重新整理等事件加入元素存在檢查
- 更新所有老師端核心 JS 快取版本
