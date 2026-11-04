# CHANGELOG

## V3.5.6 — Audio & Image Controls

### Added
- 高品質麥克風錄音設定
- 嗶聲提示
- 圖片取消／移除按鈕

### Changed
- 學生首頁移除老師後台入口

## V3.5.5 — Formal Timing Fix

### Fixed
- 題目時間持續被限制為 3 秒
- 舊 localStorage Demo Mode 繼續覆寫正式設定
- 瀏覽器快取持續載入舊 question-service.js

### Changed
- 正式測驗直接使用 question_bank 時間
- Demo Mode 在本版本完全停用

## V3.5.4 — Demo Mode Rebuild

### Added
- 獨立 assessment-settings.js
- 正式／Demo 模式明確切換
- Demo 秒數集中設定
- localStorage 快速切換函式
- 模式狀態 Console 提示

### Fixed
- 老師後台時間被固定壓縮成 3 秒
- 找不到 Demo Mode 設定來源

## V3.5.3 — Device Troubleshooting

### Added
- 耳機／喇叭故障排除視窗
- 麥克風故障排除視窗
- 瀏覽器可用麥克風偵測
- 視窗內直接重新測試
- 藍牙耳機與 Windows 音訊設定提醒

## V3.5.2 — Student Record Detail Fix

### Fixed
- 「查看」按鈕點擊後無反應
- teacher.html 缺少 studentRecordDetailBackdrop
- 明細視窗欄位與關閉按鈕缺失
- 明細視窗缺失時未提供清楚錯誤

## V3.5.1 — Student Records Rebuild

### Fixed
- Teacher Portal 未載入 student-records-service.js
- Teacher Portal 未載入 student-records.js
- StudentRecordsModule 未執行 init
- 學生紀錄頁停留在初始空白狀態
- 測驗總題數仍使用固定數字
- Session 完成狀態未更新

### Added
- V3.5.1 快取版本參數
- Session 狀態與進度更新
- 老師錄音 Signed URL 讀取 Policy
- 修正版安裝與驗收文件

## V3.5.0 — Student Records

### Added
- 學生測驗紀錄列表
- 姓名、日期與狀態篩選
- 測驗完成進度
- 各題錄音與作答明細
- Storage signed URL 錄音播放器
- Teacher / Admin 讀取 RLS
- 學生紀錄統計卡片

## V3.4.2 — Publish Validator & Atomic Release

### Added
- 發布前檢查報告
- 錯誤／提醒分級
- `publish_test_atomic` RPC
- `published_at` 欄位
- 同類型測驗單一 Active 保護

### Changed
- 發布流程改為資料庫交易式 RPC
- 有阻擋錯誤時不可發布
- 有提醒時可由老師確認後繼續發布

## V3.2.3 — Question Editor

- 新增／編輯題目
- 管理員刪除題目
- 圖片與音檔上傳
- 即時學生預覽
- 題庫寫入 RLS

## V3.2.2 — Teacher Login & Access Control

### Added
- Teacher login page
- Supabase Auth Email / Password login
- Session persistence
- Profile role and status verification
- Protected teacher portal route
- Logged-in user information
- Logout flow
- Chinese authentication error messages
- Auth SQL and test documentation

### Security
- Teacher Portal now requires an authenticated user.
- Only active `teacher` and `admin` profiles can enter.
- No service role key is included in frontend files.

## V3.2.1 — Teacher Portal UI

### Added
- Teacher Portal layout
- Read-only Dashboard
- Question Bank list and filters
- Test management cards
- Live Supabase connection status
- Student / Teacher portal navigation
- Teacher portal implementation guide


## V3.1.0 — Dynamic Question Bank

### Added
- Dynamic tests lookup
- Dynamic question loading
- 11-question database seed
- Read-only anonymous RLS policies
- Local fallback question flow
- Database-to-engine field mapping

### Preserved
- Student homepage
- Equipment tests
- Recording and Storage upload
- responses persistence
- Taiwan-time display
- Audio duration metadata

## V3.3.0
- 新增測驗建立、編輯與組卷功能。
- 新增題庫多選、移除及上下排序。
- 新增草稿儲存、基本驗證與發布流程。
- 學生端改為自動載入目前 active 的 speaking 測驗。
- 新增 tests / test_questions 老師端 RLS policies。

## V3.3.1

- 修正 `responses.question_id` 未寫入題庫 UUID 的問題。
- 新增學生端 test_sessions、responses、Storage 錄音上傳的完整 RLS migration。

## V3.4.1
- 強化 Exam Builder：題型篩選、全選結果、拖曳排序。
- 新增試卷逐題預覽。
- 新增未儲存變更提醒。
