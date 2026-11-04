"use strict";

const AiScoringService = {
  async getBySession(sessionId) {
    const { data, error } = await supabaseClient
      .from("ai_assessments")
      .select("*")
      .eq("session_id", sessionId)
      .order("question_order", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async requestAssessment(responseId) {
    const { data, error } = await supabaseClient.functions.invoke(
      "ai-score-response",
      { body: { responseId } }
    );

    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data.assessment;
  },

  copyToTeacherForm(panel, assessment) {
    if (!panel || !assessment) return;

    ["pronunciation","intonation","grammar","vocabulary","content"]
      .forEach((key) => {
        const field = panel.querySelector(`[data-score-field="${key}"]`);
        if (field) {
          field.value = assessment[key] ?? "";
          field.dispatchEvent(new Event("change"));
        }
      });

    const comment = panel.querySelector("[data-score-comment]");
    if (comment) {
      comment.value = [
        assessment.feedback,
        assessment.improvements
          ? `建議加強：${assessment.improvements}`
          : ""
      ].filter(Boolean).join("\n\n");
    }
  }
};
