# V4.2.1 Release Note

修復老師後台右上角顯示「讀取失敗」：

- teacher.html 補載入 dashboard-service.js
- dashboard-service.js 會在 teacher.js 前載入
- teacher.js 快取版本更新為 V4.2.1
- Student Records、Scoring、PDF 相關 JS 一併更新快取版本
- DashboardService 缺失時顯示清楚錯誤
