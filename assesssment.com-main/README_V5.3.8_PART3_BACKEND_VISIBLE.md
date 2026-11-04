# V5.3.8 — Part 3 後台題組介面顯示修正

## 這次真正修正的原因
V5.3.7 的 teacher.html 仍載入：
question-editor.js?v=5.3.0

因此即使 HTML 已有「Part 3 題組快速新增」，
瀏覽器/PWA 仍可能使用舊版 question-editor.js，
造成選 Speaking → Respond to Questions 後只看到原本單題欄位。

V5.3.8 已把老師後台 question-editor.js / teacher.js / teacher.css
快取版本更新，並補強 Part 3 面板同步。

## 使用方式
1. 老師後台 → 題庫管理 → 新增題目
2. Section：Speaking
3. 題型：Respond to Questions
4. 畫面會切換為「Part 3 題組快速新增」
5. 填：
   - 題組代碼，例如 FOOD01
   - 題組標題
   - 共用 Situation / Passage
   - Q5：3 / 15
   - Q6：3 / 15
   - Q7：3 / 30
6. 按「一次建立 Q5–Q7」
7. 建立後回題庫逐題上傳/調整音檔
8. 測驗組卷依 Q5 → Q6 → Q7 加入

若部署後仍看到舊畫面：
F12 → Application → Service workers → Unregister
→ Storage → Clear site data → 關閉頁面重開。
