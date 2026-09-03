"use strict";

if (!window.supabase) {
  throw new Error(
    "Supabase JavaScript 程式庫尚未載入。"
  );
}

if (
  typeof SUPABASE_CONFIG === "undefined" ||
  !SUPABASE_CONFIG.url ||
  !SUPABASE_CONFIG.publishableKey
) {
  throw new Error(
    "Supabase 設定不完整，請檢查 config.js。"
  );
}

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.publishableKey
  );

console.log("Supabase Client 初始化完成");

async function testSupabaseConnection() {
  console.log("正在測試 Supabase 連線……");

  const { data, error } =
    await supabaseClient
      .from("test_sessions")
      .select("id")
      .limit(1);

  if (error) {
    console.error(
      "Supabase 連線測試失敗：",
      error
    );

    throw error;
  }

  console.log(
    "Supabase 連線成功：",
    data
  );

  return true;
}

async function createTestSession(testData, totalQuestions = 3) {
  const sessionId = crypto.randomUUID();

  const sessionData = {
    id: sessionId,
    test_id_text: testData.testId,
    student_name_snapshot: testData.studentName,
    test_type: testData.testType,
    status: "device_testing",
    current_question: 0,
    total_questions: totalQuestions,
    started_at: testData.startedAt,
    last_active_at: new Date().toISOString()
  };

  const { error } = await supabaseClient
    .from("test_sessions")
    .insert(sessionData);

  if (error) {
    console.error("建立測驗紀錄失敗：", error);
    throw error;
  }

  console.log("測驗紀錄建立成功：", {
    id: sessionId
  });

  return {
    id: sessionId
  };
}

/**
 * 更新學生測驗 Session 狀態與總題數。
 */
async function updateTestSessionState(
  sessionId,
  {
    status,
    currentQuestion,
    totalQuestions
  } = {}
) {
  if (!sessionId) {
    return;
  }

  const updates = {
    last_active_at:
      new Date().toISOString()
  };

  if (status) {
    updates.status = status;
  }

  if (
    Number.isFinite(
      Number(currentQuestion)
    )
  ) {
    updates.current_question =
      Number(currentQuestion);
  }

  if (
    Number.isFinite(
      Number(totalQuestions)
    ) &&
    Number(totalQuestions) > 0
  ) {
    updates.total_questions =
      Number(totalQuestions);
  }

  const { error } =
    await supabaseClient
      .from("test_sessions")
      .update(updates)
      .eq("id", sessionId);

  if (error) {
    console.warn(
      "更新測驗 Session 狀態失敗：",
      error
    );
  }
}
