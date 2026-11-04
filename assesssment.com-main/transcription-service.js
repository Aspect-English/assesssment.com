"use strict";

/**
 * 老師後台學生錄音轉逐字稿。
 *
 * 需要部署 Supabase Edge Function:
 *   transcribe-audio
 *
 * 前端只傳 responseId；Edge Function 會驗證老師身分、
 * 從 Storage 下載錄音、轉錄，並把 transcript 存入 ai_assessments。
 */
const TranscriptionService = {
  async transcribeResponse(responseId) {
    if (!responseId) {
      throw new Error("缺少學生作答 responseId。");
    }

    const { data, error } =
      await supabaseClient.functions.invoke(
        "transcribe-audio",
        {
          body: { responseId }
        }
      );

    if (error) {
      throw error;
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    const transcript =
      String(data?.transcript || data?.text || "").trim();

    if (!transcript) {
      throw new Error("轉錄服務沒有回傳文字。");
    }

    return {
      transcript,
      assessment: data?.assessment || null
    };
  },

  // 保留舊題庫編輯功能相容性。
  async transcribeAudioUrl(audioUrl) {
    if (!audioUrl) {
      throw new Error("請先上傳音檔，再進行逐字稿轉換。");
    }

    const { data, error } =
      await supabaseClient.functions.invoke(
        "transcribe-audio",
        {
          body: { audioUrl }
        }
      );

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    const text = String(data?.text || data?.transcript || "").trim();
    if (!text) throw new Error("轉錄服務沒有回傳文字。");
    return text;
  }
};

window.TranscriptionService = TranscriptionService;
