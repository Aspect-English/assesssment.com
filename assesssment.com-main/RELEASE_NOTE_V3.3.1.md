# V3.3.1 Release Note

## 修正

- 學生錄音寫入 `responses` 時，現在會將 Supabase 題庫的 UUID 寫入 `question_id`。
- 保留 `question_code_snapshot`，方便日後追蹤題目代碼變更。
- 新增學生端完整 RLS migration：`sql/06_student_flow_rls_v3_3_1.sql`。

## 驗收

完成第一題後，瀏覽器 Console 的「正在儲存作答紀錄」應顯示：

```text
question_id: <UUID>
question_code_snapshot: <題目代碼>
```

Supabase `responses` 資料表中的 `question_id` 不應再是 `null`。
