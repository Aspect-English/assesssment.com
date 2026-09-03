"use strict";

const StudentRecordsModule = (() => {
  const state = {
    initialized: false,
    loaded: false,
    loading: false,
    sessions: [],
    responses: [],
    scoreSummary: [],
    rows: [],
    currentReportData: null
  };

  const $ = (id) =>
    document.getElementById(id);

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDateTime(value) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat(
      "zh-TW",
      {
        timeZone: "Asia/Taipei",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }
    ).format(date);
  }

  function formatDuration(seconds) {
    const value = Number(seconds || 0);

    if (!value) {
      return "—";
    }

    const minutes =
      Math.floor(value / 60);

    const remaining =
      Math.round(value % 60);

    return minutes
      ? `${minutes}:${String(remaining).padStart(2, "0")}`
      : `${remaining} 秒`;
  }

  function getDerivedStatus(row) {
    if (row.totalQuestions > 0 &&
        row.responseCount >= row.totalQuestions) {
      return "completed";
    }

    if (row.responseCount > 0 ||
        Number(row.session.current_question || 0) > 0) {
      return "in_progress";
    }

    return "not_started";
  }

  function getStatusLabel(status) {
    const labels = {
      completed: "已完成",
      in_progress: "測驗中",
      not_started: "尚未作答"
    };

    return labels[status] || status;
  }

  function buildRows() {
    const responseMap =
      new Map();

    state.responses.forEach((response) => {
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

    state.rows =
      state.sessions.map((session) => {
        const responses =
          responseMap.get(session.id) || [];

        const uniqueOrders =
          new Set(
            responses.map(
              (item) =>
                item.question_order
            )
          );

        const totalQuestions =
          Number(
            session.total_questions || 0
          );

        const reviewedResponses =
          state.scoreSummary.filter(
            (score) => score.session_id === session.id
          );

        const row = {
          session,
          responses,
          responseCount: uniqueOrders.size,
          totalQuestions,
          reviewedCount: reviewedResponses.length,
          averageTeacherScore:
            reviewedResponses.length
              ? Number(
                  (
                    reviewedResponses
                      .map((score) => Number(score.overall || 0))
                      .reduce((sum, value) => sum + value, 0) /
                    reviewedResponses.length
                  ).toFixed(2)
                )
              : null
        };

        row.derivedStatus =
          getDerivedStatus(row);

        return row;
      });
  }

  function getFilteredRows() {
    const keyword =
      $("studentRecordSearch")
        .value
        .trim()
        .toLowerCase();

    const status =
      $("studentRecordStatusFilter")
        .value;

    const date =
      $("studentRecordDateFilter")
        .value;

    return state.rows.filter((row) => {
      const session = row.session;

      const searchText = [
        session.student_name_snapshot,
        session.test_id_text,
        session.test_type
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesKeyword =
        !keyword ||
        searchText.includes(keyword);

      const matchesStatus =
        !status ||
        row.derivedStatus === status;

      let matchesDate = true;

      if (date && session.started_at) {
        const localDate =
          new Intl.DateTimeFormat(
            "en-CA",
            {
              timeZone: "Asia/Taipei",
              year: "numeric",
              month: "2-digit",
              day: "2-digit"
            }
          ).format(
            new Date(session.started_at)
          );

        matchesDate =
          localDate === date;
      }

      return (
        matchesKeyword &&
        matchesStatus &&
        matchesDate
      );
    });
  }

  function renderSummary() {
    const completed =
      state.rows.filter(
        (row) =>
          row.derivedStatus ===
          "completed"
      ).length;

    const inProgress =
      state.rows.filter(
        (row) =>
          row.derivedStatus ===
          "in_progress"
      ).length;

    $("studentRecordTotal")
      .textContent =
      state.rows.length;

    $("studentRecordCompleted")
      .textContent =
      completed;

    $("studentRecordInProgress")
      .textContent =
      inProgress;

    $("studentResponseTotal")
      .textContent =
      state.responses.length;
  }

  function renderTable() {
    const tbody =
      $("studentRecordsTableBody");

    const rows =
      getFilteredRows();

    if (!rows.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              找不到符合條件的學生紀錄。
            </div>
          </td>
        </tr>
      `;

      return;
    }

    tbody.innerHTML =
      rows.map((row) => {
        const session = row.session;

        const progressText =
          row.totalQuestions > 0
            ? `${row.responseCount} / ${row.totalQuestions}`
            : `${row.responseCount} 題`;

        return `
          <tr>

            <td>
              <div class="record-student-cell">
                <strong>
                  ${escapeHtml(
                    session.student_name_snapshot ||
                    "未填姓名"
                  )}
                </strong>

                <span>
                  ${escapeHtml(
                    session.id
                  )}
                </span>
              </div>
            </td>

            <td>
              <strong>
                ${escapeHtml(
                  session.test_type ||
                  "speaking"
                )}
              </strong>

              <div class="record-secondary-text">
                ${escapeHtml(
                  session.test_id_text ||
                  "—"
                )}
              </div>
            </td>

            <td>
              ${escapeHtml(
                formatDateTime(
                  session.started_at
                )
              )}
            </td>

            <td>
              <div class="record-progress-cell">
                <strong>
                  ${escapeHtml(progressText)}
                </strong>

                <div class="record-progress-track">
                  <span
                    style="width: ${
                      row.totalQuestions
                        ? Math.min(
                            100,
                            Math.round(
                              row.responseCount /
                              row.totalQuestions *
                              100
                            )
                          )
                        : 0
                    }%"
                  ></span>
                </div>
              </div>
            </td>

            <td>
              <span
                class="record-status-badge ${row.derivedStatus}"
              >
                ${escapeHtml(
                  getStatusLabel(
                    row.derivedStatus
                  )
                )}
              </span>

              <div>
                <span class="record-review-badge ${
                  row.responseCount > 0 &&
                  row.reviewedCount >= row.responseCount
                    ? "reviewed"
                    : "pending"
                }">
                  ${
                    row.responseCount > 0 &&
                    row.reviewedCount >= row.responseCount
                      ? `已評分 ${row.averageTeacherScore ?? "—"}`
                      : `待評分 ${row.reviewedCount} / ${row.responseCount}`
                  }
                </span>
              </div>
            </td>

            <td>
              <button
                class="table-action"
                type="button"
                data-view-session="${escapeHtml(
                  session.id
                )}"
              >
                查看
              </button>
            </td>

          </tr>
        `;
      }).join("");

    tbody
      .querySelectorAll(
        "[data-view-session]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            openDetail(
              button.dataset.viewSession
            );
          }
        );
      });
  }

  async function load(force = false) {
    if (
      state.loading ||
      (state.loaded && !force)
    ) {
      return;
    }

    state.loading = true;

    $("studentRecordsTableBody")
      .innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              正在讀取學生紀錄……
            </div>
          </td>
        </tr>
      `;

    try {
      state.sessions =
        await StudentRecordsService
          .getSessions();

      const sessionIds =
        state.sessions.map((session) => session.id);

      state.responses =
        await StudentRecordsService.getResponseSummary(sessionIds);

      state.scoreSummary =
        await TeacherScoringService.getSessionScoreSummary(sessionIds);

      buildRows();
      renderSummary();
      renderTable();

      state.loaded = true;

    } catch (error) {
      console.error(
        "學生紀錄載入失敗：",
        error
      );

      $("studentRecordsTableBody")
        .innerHTML = `
          <tr>
            <td colspan="6">
              <div class="empty-state">
                無法讀取學生紀錄。請確認已執行
                V3.5.0 SQL 與 RLS Policy。
              </div>
            </td>
          </tr>
        `;

    } finally {
      state.loading = false;
    }
  }

  async function openDetail(
    sessionId
  ) {
    const row =
      state.rows.find(
        (item) =>
          item.session.id ===
          sessionId
      );

    if (!row) {
      return;
    }

    const session = row.session;

    $("recordDetailStudentName")
      .textContent =
      session.student_name_snapshot ||
      "未填姓名";

    $("recordDetailTestType")
      .textContent =
      session.test_type || "—";

    $("recordDetailTestId")
      .textContent =
      session.test_id_text || "—";

    $("recordDetailStartedAt")
      .textContent =
      formatDateTime(
        session.started_at
      );

    $("recordDetailProgress")
      .textContent =
      row.totalQuestions
        ? `${row.responseCount} / ${row.totalQuestions}`
        : `${row.responseCount} 題`;

    $("recordDetailSubtitle")
      .textContent =
      `${getStatusLabel(
        row.derivedStatus
      )} · ${formatDateTime(
        session.started_at
      )}`;

    state.currentReportData = null;

    const exportButton =
      $("exportStudentReportButton");

    exportButton.disabled = true;
    exportButton.textContent =
      "準備報告中……";

    const list =
      $("recordDetailResponseList");

    list.innerHTML = `
      <div class="empty-state">
        正在載入作答與錄音……
      </div>
    `;

    const detailBackdrop =
      $("studentRecordDetailBackdrop");

    if (!detailBackdrop) {
      throw new Error(
        "找不到學生紀錄明細視窗，請確認 teacher.html 已載入 V3.5.2。"
      );
    }

    detailBackdrop.classList.remove(
      "hidden"
    );

    document.body.classList.add(
      "record-detail-open"
    );

    try {
      const responses =
        await StudentRecordsService
          .getSessionResponses(
            sessionId
          );

      const [questions, scores, aiAssessments] =
        await Promise.all([
          StudentRecordsService.getQuestionsByIds(
            responses.map((response) => response.question_id)
          ),
          TeacherScoringService.getScoresBySession(sessionId),
          AiScoringService.getBySession(sessionId)
        ]);

      const questionMap =
        new Map(
          questions.map((question) => [question.id, question])
        );

      const scoreMap =
        new Map(
          scores.map((score) => [score.response_id, score])
        );

      const aiMap =
        new Map(
          aiAssessments.map((assessment) => [
            assessment.response_id,
            assessment
          ])
        );

      const enriched =
        await Promise.all(
          responses.map(
            async (response) => ({
              response,
              question:
                questionMap.get(
                  response.question_id
                ) || null,
              audioUrl:
                await StudentRecordsService.createRecordingUrl(response),
              score:
                scoreMap.get(response.id) || null,
              aiAssessment:
                aiMap.get(response.id) || null
            })
          )
        );

      state.currentReportData = {
        session,
        responses,
        questions,
        scores
      };

      exportButton.disabled = false;
      exportButton.textContent =
        scores.length
          ? "匯出 PDF"
          : "匯出未評分報告";

      if (!enriched.length) {
        list.innerHTML = `
          <div class="empty-state">
            這次測驗尚無作答紀錄。
          </div>
        `;

        return;
      }

      list.innerHTML =
        enriched.map(
          ({
            response,
            question,
            audioUrl,
            score,
            aiAssessment
          }) => {
            const code =
              question?.question_code ||
              response
                .question_code_snapshot ||
              `Q${response.question_order}`;

            const title =
              question?.title ||
              question?.prompt ||
              question?.passage ||
              response.response_type ||
              "口說作答";

            return `
              <article class="record-response-card">

                <div class="record-response-heading">

                  <div>
                    <span>
                      Question ${
                        response.question_order
                      }
                    </span>

                    <h3>
                      ${escapeHtml(code)}
                    </h3>

                    <p>
                      ${escapeHtml(title)}
                    </p>
                  </div>

                  <span class="status-badge ${
                    response.upload_status ===
                    "uploaded"
                      ? "active"
                      : "draft"
                  }">
                    ${escapeHtml(
                      response.upload_status ||
                      "pending"
                    )}
                  </span>

                </div>

                <div class="record-response-meta">
                  <span>
                    錄音：
                    <strong>
                      ${escapeHtml(
                        formatDuration(
                          response
                            .duration_seconds
                        )
                      )}
                    </strong>
                  </span>

                  <span>
                    作答：
                    <strong>
                      ${escapeHtml(
                        formatDateTime(
                          response
                            .answered_at
                        )
                      )}
                    </strong>
                  </span>

                  <span>
                    格式：
                    <strong>
                      ${escapeHtml(
                        response.mime_type ||
                        "—"
                      )}
                    </strong>
                  </span>
                </div>

                ${
                  audioUrl
                    ? `
                      <audio
                        class="record-audio-player"
                        controls
                        preload="none"
                        src="${escapeHtml(audioUrl)}"
                      ></audio>
                    `
                    : `
                      <div class="record-audio-unavailable">
                        目前無法建立錄音播放網址。
                      </div>
                    `
                }

                ${""}

                <div class="score-panel" data-score-panel="${escapeHtml(response.id)}">
                  <div class="score-panel-heading">
                    <strong>老師評分</strong>
                    <span class="score-overall-badge" data-overall-badge>${score?.overall ?? "—"}</span>
                  </div>

                  <div class="score-grid">
                    ${[
                      ["pronunciation", "Pronunciation"],
                      ["intonation", "Intonation"],
                      ["grammar", "Grammar"],
                      ["vocabulary", "Vocabulary"],
                      ["content", "Content"]
                    ].map(([key, label]) => `
                      <label class="score-field">
                        <span>${label}</span>
                        <select data-score-field="${key}">
                          <option value="">—</option>
                          ${[0,1,2,3,4,5].map((value) => `
                            <option value="${value}" ${
                              Number(score?.[key]) === value ? "selected" : ""
                            }>${value}</option>
                          `).join("")}
                        </select>
                      </label>
                    `).join("")}
                  </div>

                  <label class="score-comment">
                    <span>老師評語</span>
                    <textarea data-score-comment placeholder="輸入本題評語">${escapeHtml(score?.teacher_comment || "")}</textarea>
                  </label>

                  <div class="score-actions">
                    <span class="score-save-status" data-score-status>
                      ${score ? `上次儲存：${escapeHtml(formatDateTime(score.updated_at))}` : "尚未評分"}
                    </span>
                    <button class="score-save-button" type="button" data-save-score="${escapeHtml(response.id)}">
                      儲存本題評分
                    </button>
                  </div>
                </div>

              </article>
            `;
          }
        ).join("");

      list.querySelectorAll("[data-score-panel]").forEach((panel) => {
        const updateOverall = () => {
          const values = [
            ...panel.querySelectorAll("[data-score-field]")
          ].map((select) => select.value);

          panel.querySelector("[data-overall-badge]").textContent =
            TeacherScoringService.calculateOverall(values) ?? "—";
        };

        panel.querySelectorAll("[data-score-field]").forEach((select) => {
          select.addEventListener("change", updateOverall);
        });
      });

      list.querySelectorAll("[data-run-ai]").forEach((button) => {
        button.addEventListener("click", async () => {
          const responseId = button.dataset.runAi;
          const panel = button.closest("[data-ai-panel]");
          const status = panel.querySelector("[data-ai-status]");
          const result = panel.querySelector("[data-ai-result]");

          button.disabled = true;
          button.textContent = "AI 分析中……";
          status.className = "ai-score-status processing";
          status.textContent = "正在轉錄錄音並產生初步評分……";

          try {
            const assessment =
              await AiScoringService.requestAssessment(responseId);

            status.className = "ai-score-status completed";
            status.textContent =
              `AI 初評完成，Overall ${assessment.overall ?? "—"}`;

            [
              "pronunciation","intonation","grammar",
              "vocabulary","content","overall"
            ].forEach((key) => {
              const target = panel.querySelector(`[data-ai-value="${key}"]`);
              if (target) target.textContent = assessment[key] ?? "—";
            });

            panel.querySelector("[data-ai-transcript]").textContent =
              assessment.transcript || "—";
            panel.querySelector("[data-ai-strengths]").textContent =
              assessment.strengths || "—";
            panel.querySelector("[data-ai-improvements]").textContent =
              assessment.improvements || "—";

            result.classList.remove("hidden");
            button.textContent = "重新分析";
            button.dataset.assessment = JSON.stringify(assessment);
          } catch (error) {
            console.error("AI 初評失敗：", error);
            status.className = "ai-score-status failed";
            status.textContent = `AI 初評失敗：${error.message || "未知錯誤"}`;
            button.textContent = "重新嘗試";
          } finally {
            button.disabled = false;
          }
        });
      });

      list.querySelectorAll("[data-copy-ai]").forEach((button) => {
        button.addEventListener("click", () => {
          const responseId = button.dataset.copyAi;
          const aiPanel = button.closest("[data-ai-panel]");
          const runButton = aiPanel.querySelector("[data-run-ai]");
          const assessment = runButton.dataset.assessment
            ? JSON.parse(runButton.dataset.assessment)
            : aiMap.get(responseId);

          const teacherPanel =
            list.querySelector(`[data-score-panel="${responseId}"]`);

          AiScoringService.copyToTeacherForm(teacherPanel, assessment);
          button.textContent = "已套用";
          setTimeout(() => button.textContent = "套用到老師評分", 1200);
        });
      });

      list.querySelectorAll("[data-save-score]").forEach((button) => {
        button.addEventListener("click", async () => {
          const responseId = button.dataset.saveScore;
          const response = responses.find((item) => item.id === responseId);
          const panel = button.closest("[data-score-panel]");
          const statusElement = panel.querySelector("[data-score-status]");
          const getValue = (key) =>
            panel.querySelector(`[data-score-field="${key}"]`).value;

          button.disabled = true;
          button.textContent = "儲存中……";
          statusElement.textContent = "正在儲存評分……";

          try {
            const saved = await TeacherScoringService.upsertScore({
              sessionId,
              responseId: response.id,
              questionId: response.question_id,
              questionOrder: response.question_order,
              pronunciation: getValue("pronunciation"),
              intonation: getValue("intonation"),
              grammar: getValue("grammar"),
              vocabulary: getValue("vocabulary"),
              content: getValue("content"),
              teacherComment: panel.querySelector("[data-score-comment]").value,
              teacherId: portalState.auth.user.id,
              teacherName:
                portalState.auth.profile?.full_name ||
                portalState.auth.user.email
            });

            panel.querySelector("[data-overall-badge]").textContent =
              saved.overall ?? "—";
            statusElement.textContent =
              `已儲存：${formatDateTime(saved.updated_at)}`;

            await load(true);
          } catch (error) {
            console.error("儲存老師評分失敗：", error);
            statusElement.textContent = `儲存失敗：${error.message}`;
          } finally {
            button.disabled = false;
            button.textContent = "儲存本題評分";
          }
        });
      });

    } catch (error) {
      console.error(
        "學生作答明細載入失敗：",
        error
      );

      list.innerHTML = `
        <div class="empty-state">
          無法讀取作答明細或錄音。
        </div>
      `;
    }
  }

  function closeDetail() {
    const detailBackdrop =
      $("studentRecordDetailBackdrop");

    if (!detailBackdrop) {
      return;
    }

    detailBackdrop.classList.add(
      "hidden"
    );

    state.currentReportData = null;

    const exportButton =
      $("exportStudentReportButton");

    exportButton.disabled = true;
    exportButton.textContent =
      "匯出 PDF";

    document.body.classList.remove(
      "record-detail-open"
    );

    document
      .querySelectorAll(
        ".record-audio-player"
      )
      .forEach((player) => {
        player.pause();
      });
  }

  function init() {
    if (state.initialized) {
      return;
    }

    const requiredIds = [
      "studentRecordSearch",
      "studentRecordStatusFilter",
      "studentRecordDateFilter",
      "refreshStudentRecordsButton",
      "closeStudentRecordDetailButton",
      "studentRecordDetailBackdrop",
      "studentRecordsTableBody"
    ];

    const missingIds =
      requiredIds.filter(
        (id) => !$(id)
      );

    if (missingIds.length) {
      console.error(
        "學生紀錄元件不存在：",
        missingIds
      );

      return;
    }

    state.initialized = true;

    $("studentRecordSearch")
      .addEventListener(
        "input",
        renderTable
      );

    $("studentRecordStatusFilter")
      .addEventListener(
        "change",
        renderTable
      );

    $("studentRecordDateFilter")
      .addEventListener(
        "change",
        renderTable
      );

    $("refreshStudentRecordsButton")
      .addEventListener(
        "click",
        () => load(true)
      );

    $("exportStudentReportButton")
      .addEventListener(
        "click",
        () => {
          if (!state.currentReportData) {
            return;
          }

          try {
            PdfReportService.export(
              state.currentReportData
            );
          } catch (error) {
            console.error(
              "匯出 PDF 報告失敗：",
              error
            );

            window.alert(
              error.message ||
              "無法開啟 PDF 報告。"
            );
          }
        }
      );

    $("closeStudentRecordDetailButton")
      .addEventListener(
        "click",
        closeDetail
      );

    $("studentRecordDetailBackdrop")
      .addEventListener(
        "click",
        (event) => {
          if (
            event.target ===
            $("studentRecordDetailBackdrop")
          ) {
            closeDetail();
          }
        }
      );

    window.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Escape" &&
          !$(
            "studentRecordDetailBackdrop"
          ).classList.contains(
            "hidden"
          )
        ) {
          closeDetail();
        }
      }
    );
  }

  return {
    init,
    load,
    renderTable
  };
})();
