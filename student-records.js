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


  function questionImageUrl(question) {
    const raw = String(question?.image_url || "").trim();
    if (!raw) return "";
    if (/^https:\/\//i.test(raw)) return raw;
    if (/^(?:data:|javascript:|blob:|\/\/)/i.test(raw)) return "";
    const relative = raw.replace(/^\/+/, "");
    const base = new URL("./", window.location.href);
    return new URL(relative, base).href;
  }

  function imageMarkup(question) {
    const url = questionImageUrl(question);
    if (!url) return "";
    return `<div class="record-question-image-wrap"><strong>題目圖片</strong><img class="record-question-image" src="${escapeHtml(url)}" alt="該題原始題目圖片" loading="lazy" onerror="this.closest('.record-question-image-wrap').classList.add('image-unavailable')"/><span class="record-image-error">題目圖片無法載入，請確認題庫圖片網址。</span></div>`;
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
              <div class="record-row-actions">
                <button
                  class="table-action"
                  type="button"
                  data-view-session="${escapeHtml(session.id)}"
                >查看</button>
                ${portalState?.auth?.profile?.role === "admin" ? `
                  <button
                    class="table-action record-archive-action"
                    type="button"
                    data-archive-session="${escapeHtml(session.id)}"
                    aria-label="封存 ${escapeHtml(session.student_name_snapshot || "未填姓名")} 的測驗紀錄"
                  >刪除</button>
                ` : ""}
              </div>
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

    tbody.querySelectorAll("[data-archive-session]").forEach((button) => {
      button.addEventListener("click", async () => {
        if (portalState?.auth?.profile?.role !== "admin") return;
        const sessionId = button.dataset.archiveSession;
        const record = state.rows.find((item) => item.session.id === sessionId);
        if (!record) return;
        const name = record.session.student_name_snapshot || "未填姓名";
        if (!window.confirm(`確定封存「${name}」的這筆測驗紀錄？\n\n封存後將不再顯示於學生紀錄列表，但原始作答、錄音及成績會保留。`)) return;
        button.disabled = true;
        button.textContent = "處理中…";
        try {
          await StudentRecordsService.archiveSession(sessionId);
          await load(true);
        } catch (error) {
          console.error("封存學生紀錄失敗：", error);
          window.alert("封存失敗：" + (error?.message || "請確認 Supabase 已執行封存 SQL，且帳號具有管理員權限。"));
          button.disabled = false;
          button.textContent = "刪除";
        }
      });
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

    if ($("recordDetailOverall")) $("recordDetailOverall").textContent = "—";
    if ($("recordDetailToeicScore")) $("recordDetailToeicScore").textContent = "— / 200";

    const deleteButton = $("deleteStudentRecordButton");
    if (deleteButton) deleteButton.classList.toggle("hidden", portalState?.auth?.profile?.role !== "admin");
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

      const sessionOverall =
        TeacherScoringService.calculateSessionOverall(scores);
      const estimatedToeicScore =
        TeacherScoringService.estimateToeicScore(sessionOverall);

      $("recordDetailOverall").textContent =
        sessionOverall ?? "—";
      $("recordDetailToeicScore").textContent =
        estimatedToeicScore === null
          ? "— / 200"
          : `${estimatedToeicScore} / 200`;

      state.currentReportData = {
        session,
        responses,
        questions,
        scores,
        aiAssessments
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

                ${imageMarkup(question)}
                ${response.text_response ? `<div class="record-written-answer"><strong>學生作答</strong><p>${escapeHtml(response.text_response)}</p></div>` : ""}
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

                <div class="transcript-panel" data-transcript-panel="${escapeHtml(response.id)}">
                  <div class="transcript-panel-heading">
                    <div>
                      <strong>錄音逐字稿</strong>
                      <span>將本題學生錄音轉換成文字並儲存</span>
                    </div>
                    <button
                      class="transcript-button"
                      type="button"
                      data-transcribe-response="${escapeHtml(response.id)}"
                      ${audioUrl ? "" : "disabled"}
                    >
                      ${aiAssessment?.transcript ? "重新轉換" : "轉換逐字稿"}
                    </button>
                  </div>
                  <div class="transcript-status ${aiAssessment?.transcript ? "completed" : "idle"}" data-transcript-status>
                    ${aiAssessment?.transcript ? "已儲存逐字稿" : (audioUrl ? "尚未轉換" : "此題沒有可用錄音") }
                  </div>
                  <div class="transcript-text ${aiAssessment?.transcript ? "" : "hidden"}" data-transcript-text>
                    ${escapeHtml(aiAssessment?.transcript || "")}
                  </div>
                  <div class="transcript-verification hidden" data-transcript-verification>
                    <strong>第二次獨立辨識（僅供比對，不會自動合併）</strong>
                    <div class="transcript-text" data-verification-text></div>
                    <small data-verification-warning></small>
                  </div>
                  <div class="transcript-edit-wrap">
                    <label>老師確認版逐字稿（請對照原始錄音，保留重複、語助詞與文法錯誤）</label>
                    <textarea class="transcript-edit" rows="5" data-transcript-edit>${escapeHtml(aiAssessment?.transcript || "")}</textarea>
                    <button type="button" class="transcript-button" data-confirm-transcript="${escapeHtml(response.id)}">儲存老師確認版</button>
                    <small data-confirm-status>儲存後，PDF 將使用此份確認版逐字稿。再次轉錄前請先備份人工修正內容。</small>
                  </div>
                </div>

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

      list.querySelectorAll("[data-confirm-transcript]").forEach((button) => {
        button.addEventListener("click", async () => {
          const responseId = button.dataset.confirmTranscript;
          const panel = button.closest("[data-transcript-panel]");
          const editor = panel.querySelector("[data-transcript-edit]");
          const status = panel.querySelector("[data-confirm-status]");
          const transcript = editor.value.trim();
          if (!transcript) { status.textContent = "逐字稿不可為空白。"; return; }
          if (!window.confirm("確定已對照錄音，並儲存老師確認版逐字稿？")) return;
          button.disabled = true;
          status.textContent = "正在儲存確認版……";
          try {
            const assessment = await TranscriptionService.confirmTranscript(responseId, transcript);
            const text = panel.querySelector("[data-transcript-text]");
            text.textContent = transcript;
            text.classList.remove("hidden");
            aiMap.set(responseId, { ...(aiMap.get(responseId) || {}), ...assessment, transcript });
            if (state.currentReportData) state.currentReportData.aiAssessments = [...aiMap.values()];
            status.textContent = "已儲存老師確認版；PDF 將使用此版本。";
          } catch (error) {
            console.error("儲存確認版失敗", error);
            status.textContent = `儲存失敗：${error.message || "未知錯誤"}`;
          } finally { button.disabled = false; }
        });
      });

      list.querySelectorAll("[data-transcribe-response]").forEach((button) => {
        button.addEventListener("click", async () => {
          const responseId = button.dataset.transcribeResponse;
          const panel = button.closest("[data-transcript-panel]");
          const status = panel.querySelector("[data-transcript-status]");
          const text = panel.querySelector("[data-transcript-text]");

          button.disabled = true;
          button.textContent = "轉換中……";
          status.className = "transcript-status processing";
          status.textContent = "正在將學生錄音轉換為逐字稿……";

          try {
            const result =
              await TranscriptionService.transcribeResponse(responseId);

            text.textContent = result.transcript;
            text.classList.remove("hidden");
            const editor = panel.querySelector("[data-transcript-edit]");
            if (editor) editor.value = result.transcript;
            const verification = panel.querySelector("[data-transcript-verification]");
            const verificationText = panel.querySelector("[data-verification-text]");
            const warning = panel.querySelector("[data-verification-warning]");
            if (verification) {
              verification.classList.toggle("hidden", !result.verificationTranscript);
              if (verificationText) verificationText.textContent = result.verificationTranscript || "";
              if (warning) warning.textContent = result.verificationWarning || "";
            }
            status.className = "transcript-status completed";
            status.textContent = "逐字稿已轉換並儲存";
            button.textContent = "重新轉換";

            const existing = aiMap.get(responseId) || {};
            aiMap.set(responseId, {
              ...existing,
              ...(result.assessment || {}),
              transcript: result.transcript
            });

            if (state.currentReportData) {
              state.currentReportData.aiAssessments =
                [...aiMap.values()];
            }
          } catch (error) {
            console.error("逐字稿轉換失敗：", error);
            status.className = "transcript-status failed";
            status.textContent =
              `轉換失敗：${error.message || "未知錯誤"}`;
            button.textContent = "重新嘗試";
          } finally {
            button.disabled = false;
          }
        });
      });

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

    $("deleteStudentRecordButton")?.addEventListener("click", async () => {
      const sessionId = state.currentReportData?.session?.id;
      if (!sessionId || portalState?.auth?.profile?.role !== "admin") return;
      if (!window.confirm("確定將這筆學生測驗紀錄移至封存？封存後將不再顯示於學生紀錄列表，原始資料不會刪除。")) return;
      const button = $("deleteStudentRecordButton");
      button.disabled = true;
      try {
        await StudentRecordsService.archiveSession(sessionId);
        closeDetail();
        await load(true);
      } catch (error) {
        window.alert("封存失敗：" + (error.message || "請確認已執行附帶的 Supabase SQL 權限設定"));
      } finally { button.disabled = false; }
    });

    $("exportStudentReportButton")
      .addEventListener(
        "click",
        async () => {
          if (!state.currentReportData) {
            return;
          }

          const button = $("exportStudentReportButton");
          button.disabled = true;
          try {
            await PdfReportService.export(
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
          } finally { button.disabled = false; }
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
