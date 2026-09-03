"use strict";

const DashboardService = {
  getTaiwanDayRange(date = new Date()) {
    const formatter = new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Taipei",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }
    );

    const day = formatter.format(date);

    return {
      start:
        new Date(
          `${day}T00:00:00+08:00`
        ).toISOString(),

      end:
        new Date(
          `${day}T23:59:59.999+08:00`
        ).toISOString()
    };
  },

  async getOverview() {
    const { start, end } =
      this.getTaiwanDayRange();

    const [
      sessionsResult,
      responsesResult,
      scoresResult
    ] = await Promise.all([
      supabaseClient
        .from("test_sessions")
        .select(
          [
            "id",
            "student_name_snapshot",
            "test_type",
            "test_id_text",
            "status",
            "started_at",
            "updated_at",
            "total_questions"
          ].join(",")
        )
        .gte("started_at", start)
        .lte("started_at", end)
        .order("started_at", {
          ascending: false
        }),

      supabaseClient
        .from("responses")
        .select(
          [
            "id",
            "session_id",
            "question_order",
            "answered_at"
          ].join(",")
        )
        .gte("answered_at", start)
        .lte("answered_at", end),

      supabaseClient
        .from("teacher_scores")
        .select(
          [
            "session_id",
            "response_id",
            "overall",
            "updated_at"
          ].join(",")
        )
        .gte("updated_at", start)
        .lte("updated_at", end)
    ]);

    if (sessionsResult.error) {
      throw sessionsResult.error;
    }

    if (responsesResult.error) {
      throw responsesResult.error;
    }

    if (scoresResult.error) {
      throw scoresResult.error;
    }

    const sessions =
      sessionsResult.data || [];

    const responses =
      responsesResult.data || [];

    const scores =
      scoresResult.data || [];

    const responseMap =
      new Map();

    responses.forEach((response) => {
      const list =
        responseMap.get(
          response.session_id
        ) || [];

      list.push(response);

      responseMap.set(
        response.session_id,
        list
      );
    });

    const scoreMap =
      new Map();

    scores.forEach((score) => {
      const list =
        scoreMap.get(
          score.session_id
        ) || [];

      list.push(score);

      scoreMap.set(
        score.session_id,
        list
      );
    });

    const rows =
      sessions.map((session) => {
        const sessionResponses =
          responseMap.get(
            session.id
          ) || [];

        const sessionScores =
          scoreMap.get(
            session.id
          ) || [];

        const responseCount =
          new Set(
            sessionResponses.map(
              (item) =>
                item.question_order
            )
          ).size;

        const totalQuestions =
          Number(
            session.total_questions || 0
          );

        const completed =
          session.status === "completed" ||
          (
            totalQuestions > 0 &&
            responseCount >= totalQuestions
          );

        const reviewed =
          responseCount > 0 &&
          sessionScores.length >=
            responseCount;

        const averageScore =
          sessionScores.length
            ? Number(
                (
                  sessionScores
                    .map(
                      (score) =>
                        Number(
                          score.overall || 0
                        )
                    )
                    .reduce(
                      (sum, value) =>
                        sum + value,
                      0
                    ) /
                  sessionScores.length
                ).toFixed(2)
              )
            : null;

        return {
          session,
          responseCount,
          totalQuestions,
          completed,
          reviewed,
          averageScore
        };
      });

    const completedRows =
      rows.filter(
        (row) => row.completed
      );

    const reviewedRows =
      completedRows.filter(
        (row) => row.reviewed
      );

    const pendingRows =
      completedRows.filter(
        (row) => !row.reviewed
      );

    const reviewedScores =
      reviewedRows
        .map(
          (row) =>
            row.averageScore
        )
        .filter(
          (value) =>
            Number.isFinite(value)
        );

    const averageScore =
      reviewedScores.length
        ? Number(
            (
              reviewedScores.reduce(
                (sum, value) =>
                  sum + value,
                0
              ) /
              reviewedScores.length
            ).toFixed(2)
          )
        : null;

    return {
      todaySessionCount:
        sessions.length,
      completedCount:
        completedRows.length,
      pendingReviewCount:
        pendingRows.length,
      reviewedCount:
        reviewedRows.length,
      averageScore,
      recentRows:
        rows.slice(0, 8)
    };
  }
};
