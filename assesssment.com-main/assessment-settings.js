"use strict";

/**
 * V3.5.5 正式測驗模式
 *
 * 學生端一律使用老師後台 question_bank 中的：
 * - preparation_time
 * - response_time
 *
 * 本版本不再套用 3 秒 Demo 時間。
 */
const ASSESSMENT_SETTINGS = {
  demoMode: false
};

/**
 * 清除舊版本可能留下的 Demo Mode 瀏覽器紀錄。
 */
try {
  localStorage.removeItem(
    "assessmentDemoMode"
  );
} catch (error) {
  console.warn(
    "無法清除舊 Demo Mode 紀錄：",
    error
  );
}

function isAssessmentDemoMode() {
  return false;
}

function setAssessmentDemoMode() {
  console.warn(
    "V3.5.5 已停用 Demo Mode，測驗時間以老師後台設定為準。"
  );

  return false;
}
