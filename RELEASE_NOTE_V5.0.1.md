# V5.0.1 Hotfix

修復老師後台停在「正在驗證老師權限」：

- 修正 teacher.html 中損壞的 HTML comment / script tag
- 恢復 student-records-service.js 正常載入
- 恢復 teacher.js、dashboard-service.js、AI scoring 等後續 script 執行
- 更新老師端核心 JS cache-busting 版本為 5.0.1

此修正不需要新的 SQL。
