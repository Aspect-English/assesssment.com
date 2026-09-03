# Aspect TOEIC Speaking & Writing — V3.1 Dynamic Question Bank

## 這一版新增

- `test-service.js`
- `question-service.js`
- Supabase tests／test_questions／question_bank 動態載入
- 11 題題庫初始化 SQL
- 匿名讀取題庫的 RLS Policies
- Supabase 失敗時自動使用本機備援

## 操作 1：執行 SQL

Supabase：

```text
SQL Editor → New query
```

複製並執行：

```text
sql/01_initialize_dynamic_question_bank.sql
```

最下方第一個結果應顯示：

```text
question_count = 11
```

第二個結果應列出 Q1～Q11。

## 操作 2：測試學生端

用 Live Server 開啟 `index.html`，完成設備測試後開始口說測驗。

Console 應顯示：

```text
已從 Supabase 載入口說題目
本次題目來源：supabase
```

## Demo 時間

目前 `question-config.js`：

```js
demoMode: true
```

正式使用前改成：

```js
demoMode: false
```

## Q3、Q4 圖片

目前 Seed 的 `image_url` 為空，所以學生端會顯示素材尚未設定。
老師後台完成後，可上傳正式圖片並更新欄位。

## Part 3、Part 4 音訊

目前 `audio_url` 為空，因此暫時由瀏覽器英文語音播放 prompt。


老師後台登入入口：`teacher-login.html`


V5.0.0 首次使用請執行：`sql/07_atomic_publish_v3_4_2.sql`


V5.0.0 首次使用請執行：`sql/08_student_records_v3_5_0.sql`


V5.0.0 修正版首次使用請執行：`sql/09_student_records_fix_v3_5_1.sql`


V5.0.0 修復學生紀錄「查看」明細視窗。


V5.0.0 新增學生設備測試故障排除視窗。


V5.0.0 新增獨立 `assessment-settings.js`，預設為正式模式。


V5.0.0 已完全停用 3 秒 Demo 時間覆寫。


V5.0.0：高品質錄音、嗶聲、圖片取消與移除學生端後台入口。


V5.0.0 首次使用請執行：`sql/10_teacher_scoring_v4_0_0.sql`


V5.0.0 新增老師管理 Dashboard。


V5.0.0 新增學生 PDF 成績報告，不需要新 SQL。


V5.0.0 修復 DashboardService 未載入造成的老師後台「讀取失敗」。


V5.0.0 修復 Dashboard 非必要元件不存在時導致整個老師後台顯示讀取失敗。


V5.0.0 新增 AI 轉文字與初步評分。請依 `docs/V5.0.0_AI_SETUP.md` 設定。
