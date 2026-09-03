"use strict";

const portalState = {
  questions: [],
  tests: [],
  mappings: [],
  auth: null
};

const authLoadingScreen =
  document.getElementById(
    "authLoadingScreen"
  );

const teacherApp =
  document.getElementById(
    "teacherApp"
  );

const userDisplayName =
  document.getElementById(
    "userDisplayName"
  );

const userRoleLabel =
  document.getElementById(
    "userRoleLabel"
  );

const userAvatar =
  document.getElementById(
    "userAvatar"
  );

const topbarUserEmail =
  document.getElementById(
    "topbarUserEmail"
  );

const logoutButton =
  document.getElementById(
    "logoutButton"
  );

const sectionConfig = {
  dashboard: {
    element:
      document.getElementById(
        "dashboardSection"
      ),
    title: "Dashboard"
  },

  questions: {
    element:
      document.getElementById(
        "questionsSection"
      ),
    title: "題庫管理"
  },

  directions: {
    element:
      document.getElementById(
        "directionsSection"
      ),
    title: "口說 Directions"
  },

  tests: {
    element:
      document.getElementById(
        "testsSection"
      ),
    title: "測驗管理"
  },

  students: {
    element:
      document.getElementById(
        "studentsSection"
      ),
    title: "學生紀錄"
  }
};

const navItems =
  document.querySelectorAll(
    ".nav-item:not(:disabled)"
  );

const pageTitle =
  document.getElementById("pageTitle");

const databaseStatus =
  document.getElementById(
    "databaseStatus"
  );

const refreshButton =
  document.getElementById(
    "refreshButton"
  );

const activeQuestionCount =
  document.getElementById(
    "activeQuestionCount"
  );

const activeTestCount =
  document.getElementById(
    "activeTestCount"
  );

const mappingCount =
  document.getElementById(
    "mappingCount"
  );

const systemStatus =
  document.getElementById(
    "systemStatus"
  );

const dashboardTestList =
  document.getElementById(
    "dashboardTestList"
  );

const questionTypeSummary =
  document.getElementById(
    "questionTypeSummary"
  );

const todaySessionCount =
  document.getElementById(
    "todaySessionCount"
  );

const todayCompletedCount =
  document.getElementById(
    "todayCompletedCount"
  );

const pendingReviewCount =
  document.getElementById(
    "pendingReviewCount"
  );

const todayAverageScore =
  document.getElementById(
    "todayAverageScore"
  );

const dashboardRecentSessions =
  document.getElementById(
    "dashboardRecentSessions"
  );

const questionSearch =
  document.getElementById(
    "questionSearch"
  );

const questionTypeFilter =
  document.getElementById(
    "questionTypeFilter"
  );

const questionTableBody =
  document.getElementById(
    "questionTableBody"
  );

const testCardGrid =
  document.getElementById(
    "testCardGrid"
  );

const newQuestionButton =
  document.getElementById(
    "newQuestionButton"
  );

const newTestButton =
  document.getElementById(
    "newTestButton"
  );

const comingSoonModal =
  document.getElementById(
    "comingSoonModal"
  );

const closeModalButton =
  document.getElementById(
    "closeModalButton"
  );

const modalConfirmButton =
  document.getElementById(
    "modalConfirmButton"
  );

const modalTitle =
  document.getElementById(
    "modalTitle"
  );

const modalText =
  document.getElementById(
    "modalText"
  );


function renderSignedInUser(
  authContext
) {
  const { profile, user } =
    authContext;

  const displayName =
    profile.display_name ||
    profile.email ||
    user.email ||
    "Teacher";

  userDisplayName.textContent =
    displayName;

  userRoleLabel.textContent =
    profile.role === "admin"
      ? "Administrator"
      : "Teacher";

  topbarUserEmail.textContent =
    profile.email ||
    user.email ||
    "";

  userAvatar.textContent =
    displayName
      .trim()
      .charAt(0)
      .toUpperCase() || "A";
}


function revealTeacherPortal() {
  document.body.classList.remove(
    "auth-checking"
  );

  authLoadingScreen.classList.add(
    "hidden"
  );

  teacherApp.removeAttribute(
    "aria-hidden"
  );
}


function setConnectionStatus(
  status,
  text
) {
  databaseStatus.className =
    `connection-pill ${status}`;

  databaseStatus.textContent = text;
}


function showPortalSection(
  sectionName
) {
  Object.values(
    sectionConfig
  ).forEach((section) => {
    section.element.classList.remove(
      "active"
    );
  });

  navItems.forEach((item) => {
    item.classList.toggle(
      "active",
      item.dataset.section ===
        sectionName
    );
  });

  const selected =
    sectionConfig[sectionName];

  if (!selected) {
    return;
  }

  selected.element.classList.add(
    "active"
  );

  pageTitle.textContent =
    selected.title;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  if (
    sectionName === "directions" &&
    typeof SpeakingDirectionsModule !==
      "undefined"
  ) {
    SpeakingDirectionsModule.load();
  }

  if (
    sectionName === "students" &&
    typeof StudentRecordsModule !==
      "undefined"
  ) {
    StudentRecordsModule.load();
  }
}


function getQuestionTypeLabel(
  questionType
) {
  const mapping = {
    read_aloud:
      "Read Aloud",

    describe_picture:
      "Describe Picture",

    respond_question:
      "Respond to Questions",

    respond_information:
      "Using Information",

    express_opinion:
      "Express an Opinion"
  };

  return (
    mapping[questionType] ||
    questionType ||
    "未分類"
  );
}


function getQuestionPreview(
  question
) {
  return (
    question.passage ||
    question.prompt ||
    question.directions ||
    "尚未設定題目內容"
  );
}


function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function setText(
  element,
  value
) {
  if (!element) {
    return;
  }

  element.textContent =
    value ?? "—";
}


function setHtml(
  element,
  html
) {
  if (!element) {
    return;
  }

  element.innerHTML = html;
}


function safeAddEventListener(
  element,
  eventName,
  handler
) {
  if (!element) {
    return;
  }

  element.addEventListener(
    eventName,
    handler
  );
}


function formatDashboardTime(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "zh-TW",
    {
      timeZone: "Asia/Taipei",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }
  ).format(new Date(value));
}


function renderDashboardOverview(
  overview
) {
  setText(
    todaySessionCount,
    overview.todaySessionCount
  );

  setText(
    todayCompletedCount,
    overview.completedCount
  );

  setText(
    pendingReviewCount,
    overview.pendingReviewCount
  );

  setText(
    todayAverageScore,
    overview.averageScore ?? "—"
  );

  if (!dashboardRecentSessions) {
    console.warn(
      "Dashboard 最近測驗容器不存在，已略過。"
    );

    return;
  }

  if (
    !overview.recentRows.length
  ) {
    setHtml(
      dashboardRecentSessions,
      `
        <div class="empty-state">
          今天目前沒有測驗紀錄。
        </div>
      `
    );

    return;
  }

  setHtml(
    dashboardRecentSessions,
    overview.recentRows
      .map((row) => {
        const status =
          row.reviewed
            ? "已評分"
            : row.completed
              ? "待評分"
              : "測驗中";

        const badgeClass =
          row.reviewed
            ? "reviewed"
            : row.completed
              ? "pending"
              : "progress";

        return `
          <button
            class="dashboard-session-row"
            data-open-section="students"
            type="button"
          >
            <div>
              <strong>
                ${escapeHtml(
                  row.session
                    .student_name_snapshot ||
                  "未填姓名"
                )}
              </strong>

              <span>
                ${escapeHtml(
                  row.session.test_type ||
                  "speaking"
                )}
                ·
                ${escapeHtml(
                  formatDashboardTime(
                    row.session.started_at
                  )
                )}
              </span>
            </div>

            <div class="dashboard-session-status">
              ${
                row.averageScore !== null
                  ? `<strong>${row.averageScore}</strong>`
                  : ""
              }

              <span class="${badgeClass}">
                ${status}
              </span>
            </div>
          </button>
        `;
      })
      .join("")
  );

  dashboardRecentSessions
    .querySelectorAll(
      "[data-open-section]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          showPortalSection(
            button.dataset.openSection
          );
        }
      );
    });
}


async function loadTeacherPortalData() {
  setConnectionStatus(
    "loading",
    "正在連線"
  );

  if (refreshButton) {
    refreshButton.disabled = true;
  }

  try {
    const [
      questionResult,
      testResult,
      mappingResult,
      dashboardOverview
    ] = await Promise.all([
      supabaseClient
        .from("question_bank")
        .select(
          [
            "id",
            "question_code",
            "section_type",
            "question_type",
            "title",
            "directions",
            "passage",
            "prompt",
            "image_url",
            "audio_url",
            "preparation_time",
            "response_time",
            "timer_group",
            "shared_response_time",
            "status",
            "updated_at"
          ].join(",")
        )
        .order(
          "question_code",
          {
            ascending: true
          }
        ),

      supabaseClient
        .from("tests")
        .select(
          [
            "id",
            "test_code",
            "test_name",
            "test_type",
            "description",
            "status",
            "version",
            "published_at",
            "updated_at"
          ].join(",")
        )
        .order(
          "updated_at",
          {
            ascending: false
          }
        ),

      supabaseClient
        .from("test_questions")
        .select(
          "id,test_id,question_id,question_order"
        ),

      typeof DashboardService !== "undefined"
        ? DashboardService.getOverview()
        : Promise.reject(
            new Error(
              "DashboardService 未載入，請確認 teacher.html 的 dashboard-service.js。"
            )
          )
    ]);

    if (questionResult.error) {
      throw questionResult.error;
    }

    if (testResult.error) {
      throw testResult.error;
    }

    if (mappingResult.error) {
      throw mappingResult.error;
    }

    portalState.questions =
      questionResult.data || [];

    portalState.tests =
      testResult.data || [];

    portalState.mappings =
      mappingResult.data || [];

    renderDashboard();
    renderDashboardOverview(
      dashboardOverview
    );
    renderQuestionTable();
    renderTestCards();

    setConnectionStatus(
      "success",
      "Supabase 已連線"
    );

  } catch (error) {
    console.error(
      "老師後台資料載入失敗：",
      error
    );

    setConnectionStatus(
      "error",
      "讀取失敗"
    );

    setText(
      systemStatus,
      "資料載入異常"
    );

    setHtml(
      dashboardTestList,
      `
        <div class="empty-state">
          無法讀取資料：${escapeHtml(
            error.message
          )}
        </div>
      `
    );

    setHtml(
      dashboardRecentSessions,
      `
        <div class="empty-state">
          無法讀取今日測驗資料。
        </div>
      `
    );

    setHtml(
      questionTableBody,
      `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              無法讀取題庫，請查看 Console。
            </div>
          </td>
        </tr>
      `
    );

    setHtml(
      testCardGrid,
      `
        <div class="empty-state panel-card">
          無法讀取測驗資料。
        </div>
      `
    );

  } finally {
    if (refreshButton) {
      refreshButton.disabled = false;
    }
  }
}


function renderDashboard() {
  const activeQuestions =
    portalState.questions.filter(
      (question) =>
        question.status === "active"
    );

  const activeTests =
    portalState.tests.filter(
      (test) =>
        test.status === "active"
    );

  setText(
    activeQuestionCount,
    activeQuestions.length
  );

  setText(
    activeTestCount,
    activeTests.length
  );

  setText(
    mappingCount,
    portalState.mappings.length
  );

  setText(
    systemStatus,
    activeQuestions.length > 0 &&
    activeTests.length > 0
      ? "學生端可載入"
      : "等待啟用資料"
  );

  if (dashboardTestList) {
    if (activeTests.length === 0) {
      setHtml(
        dashboardTestList,
        `
          <div class="empty-state">
            尚無啟用中的測驗。
          </div>
        `
      );
    } else {
      setHtml(
        dashboardTestList,
        activeTests
          .slice(0, 5)
          .map((test) => {
            const count =
              portalState.mappings
                .filter(
                  (mapping) =>
                    mapping.test_id ===
                    test.id
                )
                .length;

            return `
              <div class="simple-list-item">

                <div>
                  <strong>
                    ${escapeHtml(
                      test.test_name
                    )}
                  </strong>

                  <span>
                    ${escapeHtml(
                      test.test_code
                    )}
                    · ${count} 題
                  </span>
                </div>

                <span class="status-badge active">
                  Active
                </span>

              </div>
            `;
          })
          .join("")
      );
    }
  } else {
    console.warn(
      "dashboardTestList 不存在，已略過啟用測驗摘要。"
    );
  }

  if (!questionTypeSummary) {
    console.info(
      "目前 Dashboard 版型未放置 questionTypeSummary，已略過題型分布。"
    );

    return;
  }

  const typeCounts =
    activeQuestions.reduce(
      (summary, question) => {
        const key =
          question.question_type ||
          "other";

        summary[key] =
          (summary[key] || 0) + 1;

        return summary;
      },
      {}
    );

  const typeEntries =
    Object.entries(typeCounts)
      .sort(
        (a, b) => b[1] - a[1]
      );

  if (typeEntries.length === 0) {
    setHtml(
      questionTypeSummary,
      `
        <div class="empty-state">
          尚無啟用題目。
        </div>
      `
    );

    return;
  }

  const maximum =
    Math.max(
      ...typeEntries.map(
        ([, count]) => count
      )
    );

  setHtml(
    questionTypeSummary,
    typeEntries
      .map(([type, count]) => {
        const percentage =
          Math.round(
            (count / maximum) * 100
          );

        return `
          <div class="type-row">

            <span class="type-row-label">
              ${escapeHtml(
                getQuestionTypeLabel(type)
              )}
            </span>

            <div class="type-row-bar">
              <span
                style="width: ${percentage}%"
              ></span>
            </div>

            <strong class="type-row-count">
              ${count}
            </strong>

          </div>
        `;
      })
      .join("")
  );
}


function getFilteredQuestions() {
  const keyword =
    questionSearch.value
      .trim()
      .toLowerCase();

  const selectedType =
    questionTypeFilter.value;

  return portalState.questions.filter(
    (question) => {
      const matchesType =
        !selectedType ||
        question.question_type ===
          selectedType;

      const searchTarget = [
        question.question_code,
        question.question_type,
        question.title,
        question.passage,
        question.prompt
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesKeyword =
        !keyword ||
        searchTarget.includes(keyword);

      return (
        matchesType &&
        matchesKeyword
      );
    }
  );
}


function getPart4GroupKey(question) {
  if (
    question?.section_type !== "speaking" ||
    question?.question_type !== "respond_information"
  ) {
    return "";
  }

  const code = String(question.question_code || "");
  const match = code.match(/^(SPK-P4-.+)-Q(?:08|09|10)$/i);
  return match ? match[1] : "";
}


function getPart4QuestionNumber(question) {
  const code = String(question?.question_code || "");
  const match = code.match(/-Q(08|09|10)$/i);
  return match ? Number(match[1]) : null;
}


function buildQuestionBankRows(questions) {
  const rows = [];
  const handledGroups = new Set();

  questions.forEach((question) => {
    const groupKey = getPart4GroupKey(question);

    if (!groupKey) {
      rows.push({
        kind: "single",
        question
      });
      return;
    }

    if (handledGroups.has(groupKey)) return;
    handledGroups.add(groupKey);

    const groupQuestions = questions
      .filter((item) => getPart4GroupKey(item) === groupKey)
      .sort(
        (a, b) =>
          (getPart4QuestionNumber(a) || 0) -
          (getPart4QuestionNumber(b) || 0)
      );

    rows.push({
      kind: "part4-group",
      groupKey,
      questions: groupQuestions
    });
  });

  return rows;
}


function renderQuestionTable() {
  const questions = getFilteredQuestions();

  if (questions.length === 0) {
    questionTableBody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            找不到符合條件的題目。
          </div>
        </td>
      </tr>
    `;
    return;
  }

  const rows = buildQuestionBankRows(questions);

  questionTableBody.innerHTML = rows
    .map((row) => {
      if (row.kind === "part4-group") {
        const group = row.questions;
        const first = group[0] || {};
        const title = String(first.title || "Part 4 題組")
          .replace(/\s*-\s*Question\s*(8|9|10)\s*$/i, "");

        const q8 = group.find((q) => getPart4QuestionNumber(q) === 8);
        const q9 = group.find((q) => getPart4QuestionNumber(q) === 9);
        const q10 = group.find((q) => getPart4QuestionNumber(q) === 10);

        const complete = Boolean(q8 && q9 && q10);
        const allActive =
          group.length > 0 &&
          group.every((q) => q.status === "active");

        const informationSeconds = (() => {
          const directions = String(first.directions || "");
          const match = directions.match(/P4_INFO_SECONDS\s*=\s*(\d+)/i);
          return match ? Number(match[1]) : 45;
        })();

        const audioCount = group.filter((q) => q.audio_url).length;
        const hasImage = group.some((q) => q.image_url);

        const timeLabel = (q) =>
          q
            ? `${Number(q.preparation_time || 0)}s / ${Number(q.response_time || 0)}s`
            : "缺少";

        return `
          <tr class="part4-group-row">
            <td>
              <strong>${escapeHtml(row.groupKey)}</strong>
              <div class="question-main-text">
                <span>Q8–Q10 題組</span>
              </div>
            </td>

            <td>
              ${escapeHtml(getQuestionTypeLabel("respond_information"))}
            </td>

            <td>
              <div class="question-main-text">
                <strong>${escapeHtml(title)}</strong>
                <span>
                  Information ${informationSeconds}s
                  · Q8 ${escapeHtml(timeLabel(q8))}
                  · Q9 ${escapeHtml(timeLabel(q9))}
                  · Q10 ${escapeHtml(timeLabel(q10))}
                </span>
                <span>
                  ${hasImage ? "Information 圖片 ✓" : "Information 圖片缺少"}
                  · 題目音檔 ${audioCount}/3
                  ${complete ? "" : " · 題組未完整"}
                </span>
              </div>
            </td>

            <td>${informationSeconds} 秒</td>

            <td>
              Q8 ${q8 ? Number(q8.response_time || 0) : "—"} /
              Q9 ${q9 ? Number(q9.response_time || 0) : "—"} /
              Q10 ${q10 ? Number(q10.response_time || 0) : "—"} 秒
            </td>

            <td>
              <span class="status-badge ${allActive ? "active" : "draft"}">
                ${allActive ? "active" : "draft"}
              </span>
            </td>

            <td>
              <button
                class="table-action"
                type="button"
                data-edit-part4-group="${escapeHtml(row.groupKey)}"
              >
                編輯題組
              </button>
            </td>
          </tr>
        `;
      }

      const question = row.question;
      const preview = getQuestionPreview(question);

      return `
        <tr>
          <td>
            <strong>${escapeHtml(question.question_code)}</strong>
          </td>

          <td>
            ${escapeHtml(getQuestionTypeLabel(question.question_type))}
          </td>

          <td>
            <div class="question-main-text">
              <strong>
                ${escapeHtml(question.title || "未設定標題")}
              </strong>
              <span title="${escapeHtml(preview)}">
                ${escapeHtml(preview)}
              </span>
            </div>
          </td>

          <td>${Number(question.preparation_time || 0)} 秒</td>
          <td>${Number(question.response_time || 0)} 秒</td>

          <td>
            <span class="status-badge ${escapeHtml(question.status)}">
              ${escapeHtml(question.status)}
            </span>
          </td>

          <td>
            <button
              class="table-action"
              type="button"
              data-edit-question="${escapeHtml(question.id)}"
            >
              編輯
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  document
    .querySelectorAll("[data-edit-question]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const question = portalState.questions.find(
          (item) => item.id === button.dataset.editQuestion
        );

        showComingSoonModal(
          "題目編輯器",
          question
            ? `下一階段會開放編輯「${question.question_code}」，並提供學生端即時預覽。`
            : "下一階段會開放題目編輯功能。"
        );
      });
    });

  document
    .querySelectorAll("[data-edit-part4-group]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const groupKey = button.dataset.editPart4Group;
        const group = portalState.questions
          .filter((q) => getPart4GroupKey(q) === groupKey)
          .sort(
            (a, b) =>
              (getPart4QuestionNumber(a) || 0) -
              (getPart4QuestionNumber(b) || 0)
          );

        const first = group[0];
        if (
          first &&
          typeof QuestionEditor !== "undefined" &&
          typeof QuestionEditor.open === "function"
        ) {
          QuestionEditor.open(first);
          return;
        }

        console.warn(
          "Part 4 題組編輯器尚未載入：",
          groupKey,
          group.length
        );
      });
    });
}


function renderTestCards() {
  if (portalState.tests.length === 0) {
    testCardGrid.innerHTML = `
      <div class="empty-state panel-card">
        尚無測驗資料，請點選「建立測驗」。
      </div>
    `;
    return;
  }

  testCardGrid.innerHTML = portalState.tests.map((test) => {
    const count = portalState.mappings.filter((mapping) => mapping.test_id === test.id).length;
    const isActive = test.status === "active";
    return `
      <article class="test-management-card">
        <span class="status-badge ${escapeHtml(test.status)}">${escapeHtml(test.status)}</span>
        <h3>${escapeHtml(test.test_name)}</h3>
        <p>${escapeHtml(test.description || "尚未設定測驗說明。")}</p>
        <div class="test-card-meta">
          <span>${escapeHtml(test.test_code)} · V${escapeHtml(test.version || 1)}</span>
          <strong>${count} 題</strong>
        </div>
        <div class="test-card-actions">
          <button
            class="edit-test"
            type="button"
            data-edit-test="${escapeHtml(test.id)}"
          >
            編輯／組卷
          </button>

          ${
            isActive
              ? '<button type="button" disabled>目前已發布</button>'
              : `<button
                   class="publish-test"
                   type="button"
                   data-publish-test="${escapeHtml(test.id)}"
                 >
                   快速發布
                 </button>`
          }

          ${
            portalState?.auth?.profile?.role === "admin"
              ? `<button
                   class="danger-action"
                   type="button"
                   data-delete-test="${escapeHtml(test.id)}"
                 >
                   刪除測驗
                 </button>`
              : ""
          }
        </div>
      </article>`;
  }).join("");

  document.querySelectorAll("[data-edit-test]").forEach((button) => {
    button.addEventListener("click", () => {
      const test = portalState.tests.find((item) => item.id === button.dataset.editTest);
      if (test) TestBuilder.open(test);
    });
  });

  document.querySelectorAll("[data-publish-test]").forEach((button) => {
    button.addEventListener("click", async () => {
      const test = portalState.tests.find((item) => item.id === button.dataset.publishTest);
      const questionIds = portalState.mappings
        .filter((mapping) => mapping.test_id === test.id)
        .sort((a, b) => a.question_order - b.question_order)
        .map((mapping) => mapping.question_id);
      const questions = questionIds.map((id) => portalState.questions.find((q) => q.id === id)).filter(Boolean);
      const validation =
        TestBuilderService.validate(
          test,
          questions
        );

      if (validation.errors.length) {
        window.alert(
          `無法發布：\n${validation.errors.join("\n")}`
        );
        return;
      }
      if (!window.confirm(`確定發布「${test.test_name}」嗎？`)) return;
      try {
        await TestBuilderService.publishTest(test.id);
        await loadTeacherPortalData();
        window.alert("發布成功，學生端重新整理後即可使用。");
      } catch (error) {
        window.alert(`發布失敗：${error.message}`);
      }
    });
  });


  document
    .querySelectorAll(
      "[data-delete-test]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        async () => {
          const test =
            portalState.tests.find(
              (item) =>
                item.id ===
                button.dataset.deleteTest
            );

          if (!test) {
            return;
          }

          const confirmed =
            window.confirm(
              `確定處理「${test.test_name}」嗎？\n\n` +
              "若尚無學生作答紀錄，將永久刪除測驗與組卷設定。\n" +
              "若已有學生作答紀錄，系統會保留資料並改為停用。"
            );

          if (!confirmed) {
            return;
          }

          button.disabled = true;
          button.textContent =
            "處理中……";

          try {
            const result =
              await TestBuilderService
                .deleteTestSafely(
                  test.id
                );

            await loadTeacherPortalData();

            if (
              result.action ===
              "deleted"
            ) {
              window.alert(
                `「${test.test_name}」已永久刪除。`
              );
            } else {
              window.alert(
                `「${test.test_name}」已有 ${result.sessionCount} 筆學生作答紀錄，因此保留歷史資料並改為停用。`
              );
            }
          } catch (error) {
            console.error(
              "測驗刪除／停用失敗：",
              error
            );

            window.alert(
              `處理失敗：${error.message}`
            );

            button.disabled = false;
            button.textContent =
              "刪除測驗";
          }
        }
      );
    });
}



function showComingSoonModal(
  title,
  text
) {
  modalTitle.textContent = title;
  modalText.textContent = text;

  comingSoonModal.classList.remove(
    "hidden"
  );
}


function closeComingSoonModal() {
  comingSoonModal.classList.add(
    "hidden"
  );
}


navItems.forEach((item) => {
  item.addEventListener(
    "click",
    () => {
      showPortalSection(
        item.dataset.section
      );
    }
  );
});


document
  .querySelectorAll(
    "[data-open-section]"
  )
  .forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        showPortalSection(
          button.dataset.openSection
        );
      }
    );
  });


safeAddEventListener(
  questionSearch,
  "input",
  renderQuestionTable
);


safeAddEventListener(
  questionTypeFilter,
  "change",
  renderQuestionTable
);


safeAddEventListener(
  refreshButton,
  "click",
  loadTeacherPortalData
);


safeAddEventListener(
  newQuestionButton,
  "click",
  () => {
    showComingSoonModal(
      "新增題目",
      "下一階段會加入完整題目表單、圖片／音檔上傳，以及學生端即時預覽。"
    );
  }
);


safeAddEventListener(
  newTestButton,
  "click",
  () => {
    TestBuilder.open();
  }
);


closeModalButton.addEventListener(
  "click",
  closeComingSoonModal
);


modalConfirmButton.addEventListener(
  "click",
  closeComingSoonModal
);


comingSoonModal.addEventListener(
  "click",
  (event) => {
    if (
      event.target ===
      comingSoonModal
    ) {
      closeComingSoonModal();
    }
  }
);


logoutButton.addEventListener(
  "click",
  async () => {
    const confirmed =
      window.confirm(
        "確定要登出老師後台嗎？"
      );

    if (!confirmed) {
      return;
    }

    logoutButton.disabled = true;
    logoutButton.textContent =
      "正在登出……";

    try {
      await signOutTeacher();
    } catch (error) {
      console.error(
        "登出失敗：",
        error
      );

      window.alert(
        "登出失敗，請稍後再試。"
      );

      logoutButton.disabled = false;
      logoutButton.textContent =
        "登出老師後台";
    }
  }
);


window.addEventListener(
  "DOMContentLoaded",
  async () => {
    // 第一階段：只做老師權限驗證。
    // 權限失敗由 requireTeacherAccess() 自己負責導回登入頁。
    let authContext = null;

    try {
      authContext =
        await requireTeacherAccess();
    } catch (error) {
      console.error(
        "老師權限驗證發生未預期錯誤：",
        error
      );

      // 不把一般 JavaScript 初始化錯誤偽裝成 access_denied。
      return;
    }

    if (!authContext) {
      return;
    }

    portalState.auth =
      authContext;

    renderSignedInUser(
      authContext
    );

    revealTeacherPortal();

    // 第二階段：初始化老師後台功能。
    // 這裡即使某個模組出錯，也不能把已通過驗證的老師登出。
    try {
      if (
        typeof StudentRecordsModule !==
        "undefined"
      ) {
        StudentRecordsModule.init();
      } else {
        console.warn(
          "StudentRecordsModule 未載入，學生紀錄功能暫時不可用。"
        );
      }

      if (
        typeof TestBuilder !==
        "undefined"
      ) {
        TestBuilder.init();
      } else {
        console.warn(
          "TestBuilder 未載入，測驗管理功能暫時不可用。"
        );
      }

      if (
        typeof SpeakingDirectionsModule !==
        "undefined"
      ) {
        SpeakingDirectionsModule.init();
      } else {
        console.warn(
          "SpeakingDirectionsModule 未載入，口說 Directions 功能暫時不可用。"
        );
      }

      await loadTeacherPortalData();

    } catch (error) {
      console.error(
        "老師後台功能初始化失敗：",
        error
      );

      // 保留登入狀態與後台畫面，方便查看 Console 排錯。
      setConnectionStatus(
        "error",
        "部分功能載入失敗"
      );

      if (systemStatus) {
        systemStatus.textContent =
          "部分功能載入異常";
      }
    }
  }
);
