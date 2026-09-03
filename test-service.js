"use strict";

const TestService = {
  async getActiveTestByCode(testCode = null) {
    let query = supabaseClient
      .from("tests")
      .select("id,test_code,test_name,test_type,description,status,version,updated_at")
      .eq("status", "active");

    if (testCode) {
      query = query.eq("test_code", testCode);
    } else {
      query = query.eq("test_type", "speaking").order("updated_at", { ascending: false }).limit(1);
    }

    const { data, error } = await query.maybeSingle();
    if (error) {
      console.error("讀取測驗設定失敗：", error);
      throw error;
    }
    if (!data) {
      throw new Error(testCode ? `找不到啟用中的測驗：${testCode}` : "目前沒有已發布的口說測驗。");
    }
    return {
      id: data.id,
      code: data.test_code,
      name: data.test_name,
      type: data.test_type,
      description: data.description,
      status: data.status,
      version: data.version
    };
  }
};
