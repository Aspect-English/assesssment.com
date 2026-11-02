"use strict";

const TeacherScoringService = {
  calculateOverall(values) {
    const scores = values.map(Number).filter(Number.isFinite);
    if (!scores.length) return null;
    return Number(
      (scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(2)
    );
  },

  calculateSessionOverall(scores) {
    return this.calculateOverall(
      (scores || []).map((score) => score?.overall)
    );
  },

  estimateToeicScore(overall) {
    const value = Number(overall);
    if (!Number.isFinite(value)) return null;

    const bounded = Math.min(5, Math.max(0, value));
    const raw = (bounded / 5) * 200;

    // TOEIC Speaking/Writing score reports use 10-point increments.
    return Math.round(raw / 10) * 10;
  },

  async getScoresBySession(sessionId) {
    const { data, error } = await supabaseClient
      .from("teacher_scores")
      .select("*")
      .eq("session_id", sessionId)
      .order("question_order", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getSessionScoreSummary(sessionIds) {
    if (!sessionIds.length) return [];

    const { data, error } = await supabaseClient
      .from("teacher_scores")
      .select("session_id,response_id,overall")
      .in("session_id", sessionIds);

    if (error) throw error;
    return data || [];
  },

  async upsertScore(payload) {
    const overall = this.calculateOverall([
      payload.pronunciation,
      payload.intonation,
      payload.grammar,
      payload.vocabulary,
      payload.content
    ]);

    const clean = {
      session_id: payload.sessionId,
      response_id: payload.responseId,
      question_id: payload.questionId || null,
      question_order: Number(payload.questionOrder),
      pronunciation: payload.pronunciation === "" ? null : Number(payload.pronunciation),
      intonation: payload.intonation === "" ? null : Number(payload.intonation),
      grammar: payload.grammar === "" ? null : Number(payload.grammar),
      vocabulary: payload.vocabulary === "" ? null : Number(payload.vocabulary),
      content: payload.content === "" ? null : Number(payload.content),
      overall,
      teacher_comment: payload.teacherComment?.trim() || null,
      teacher_id: payload.teacherId,
      teacher_name: payload.teacherName || null
    };

    const { data, error } = await supabaseClient
      .from("teacher_scores")
      .upsert(clean, { onConflict: "response_id" })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  }
};
