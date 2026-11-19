"use strict";

/**
 * 儲存單題作答紀錄
 *
 * @param {Object} responseData
 * @returns {Promise<Object>}
 */
async function saveResponse(responseData) {
  if (!responseData) {
    throw new Error("缺少作答資料。");
  }

  if (!responseData.uploadId) {
    throw new Error("缺少 uploadId。");
  }

  if (!responseData.sessionId) {
    throw new Error("缺少 sessionId。");
  }

  if (!responseData.questionOrder) {
    throw new Error("缺少 questionOrder。");
  }

  if (!responseData.responseType) {
    throw new Error("缺少 responseType。");
  }

  const now = new Date().toISOString();

  const row = {
    upload_id:
      responseData.uploadId,

    session_id:
      responseData.sessionId,

    question_id:
      responseData.questionId || null,

    question_code_snapshot:
      responseData.questionCodeSnapshot || null,

    question_order:
      responseData.questionOrder,

    question_number:
      responseData.questionNumber ??
      responseData.questionOrder,

    response_type:
      responseData.responseType,

    text_response:
      responseData.textResponse || null,

    selected_answer:
      responseData.selectedAnswer || null,

    recording_bucket:
  responseData.responseType === "audio"
    ? (
        responseData.recordingBucket ||
        "speaking-recordings"
      )
    : null,

    recording_path:
      responseData.recordingPath || null,

    mime_type:
      responseData.mimeType || null,

    file_size:
      responseData.fileSize ?? null,

    duration_seconds:
      responseData.durationSeconds ?? null,

    upload_status:
      responseData.uploadStatus || "uploaded",

    retry_count:
      responseData.retryCount ?? 0,

    answered_at:
      responseData.answeredAt || now,

    uploaded_at:
      responseData.uploadedAt || now,

    updated_at:
      now
  };

  console.log(
    "正在儲存作答紀錄：",
    row
  );

  const { error } =
    await supabaseClient
      .from("responses")
      .insert(row);

  if (error) {
    console.error(
      "作答紀錄儲存失敗：",
      error
    );

    throw error;
  }

 console.log(
  "作答紀錄儲存成功：",
  row.upload_id
);

return row;
}
