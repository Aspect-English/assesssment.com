"use strict";

/**
 * 老師後台音檔轉逐字稿。
 *
 * 需要部署 Supabase Edge Function:
 *   transcribe-audio
 *
 * 成功時預期回傳：
 *   { text: "..." }
 */
const TranscriptionService = {
  async transcribeAudioUrl(audioUrl) {
    if (!audioUrl) {
      throw new Error(
        "請先上傳音檔，再進行逐字稿轉換。"
      );
    }

    const { data, error } =
      await supabaseClient.functions.invoke(
        "transcribe-audio",
        {
          body: {
            audioUrl
          }
        }
      );

    if (error) {
      throw error;
    }

    const text =
      String(data?.text || "").trim();

    if (!text) {
      throw new Error(
        "轉錄服務沒有回傳文字。"
      );
    }

    return text;
  }
};

window.TranscriptionService =
  TranscriptionService;
