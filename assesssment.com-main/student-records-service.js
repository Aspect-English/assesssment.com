"use strict";

const StudentRecordsService = {
  async archiveSession(sessionId) {
    const { error } = await supabaseClient.rpc("archive_student_session", { p_session_id: sessionId });
    if (error) throw error;
  },

  async getSessions() {
    const { data, error } =
      await supabaseClient
        .from("test_sessions")
        .select(
          [
            "id",
            "test_id_text",
            "test_type",
            "student_name_snapshot",
            "status",
            "current_question",
            "total_questions",
            "started_at",
            "last_active_at",
            "created_at",
            "updated_at"
          ].join(",")
        )
        .is("archived_at", null)
        .order("started_at", {
          ascending: false
        })
        .limit(500);

    if (error) {
      console.error(
        "讀取 test_sessions 失敗：",
        error
      );

      throw error;
    }

    return data || [];
  },

  async getResponseSummary(sessionIds) {
    if (!sessionIds.length) {
      return [];
    }

    const { data, error } =
      await supabaseClient
        .from("responses")
        .select(
          [
            "id",
            "session_id",
            "question_order",
            "upload_status",
            "duration_seconds",
            "answered_at"
          ].join(",")
        )
        .in("session_id", sessionIds);

    if (error) {
      console.error(
        "讀取 responses 摘要失敗：",
        error
      );

      throw error;
    }

    return data || [];
  },

  async getSessionResponses(sessionId) {
    const { data, error } =
      await supabaseClient
        .from("responses")
        .select(
          [
            "id",
            "upload_id",
            "session_id",
            "question_id",
            "question_code_snapshot",
            "question_order",
            "question_number",
            "response_type",
            "text_response",
            "recording_bucket",
            "recording_path",
            "mime_type",
            "file_size",
            "duration_seconds",
            "upload_status",
            "retry_count",
            "answered_at",
            "uploaded_at",
            "created_at",
            "updated_at"
          ].join(",")
        )
        .eq("session_id", sessionId)
        .order("question_order", {
          ascending: true
        });

    if (error) {
      console.error(
        "讀取學生作答明細失敗：",
        error
      );

      throw error;
    }

    return data || [];
  },

  async getQuestionsByIds(questionIds) {
    const ids = [
      ...new Set(
        questionIds.filter(Boolean)
      )
    ];

    if (!ids.length) {
      return [];
    }

    const { data, error } =
      await supabaseClient
        .from("question_bank")
        .select(
          [
            "id",
            "question_code",
            "question_type",
            "title",
            "prompt",
            "passage",
            "image_url",
            "directions"
          ].join(",")
        )
        .in("id", ids);

    if (error) {
      console.error(
        "讀取題目資料失敗：",
        error
      );

      throw error;
    }

    return data || [];
  },

  async createRecordingUrl(response) {
    if (!response.recording_path) {
      return null;
    }

    const bucket =
      response.recording_bucket ||
      "speaking-recordings";

    const { data, error } =
      await supabaseClient.storage
        .from(bucket)
        .createSignedUrl(
          response.recording_path,
          60 * 60
        );

    if (error) {
      console.warn(
        "建立錄音播放網址失敗：",
        error
      );

      return null;
    }

    return data?.signedUrl || null;
  }
};
