"use strict";

const TestBuilder = (() => {
  const state = { test: null, selected: [], filtered: [], dirty: false, previewIndex: 0, validation: null };
  const $ = (id) => document.getElementById(id);

  function selectedQuestions() {
    return state.selected.map((id) => portalState.questions.find((q) => q.id === id)).filter(Boolean);
  }

  function markDirty(value = true) {
    state.dirty = value;
    const heading = $("tbHeading");
    if (heading) heading.textContent = `${state.test ? "編輯與組卷" : "建立測驗"}${value ? " *" : ""}`;
  }

  function open(test = null) {
    state.test = test;
    state.selected = [];
    state.dirty = false;
    $("tbHeading").textContent = test ? "編輯與組卷" : "建立測驗";
    $("tbId").value = test?.id || "";
    $("tbCode").value = test?.test_code || "";
    $("tbName").value = test?.test_name || "";
    $("tbVersion").value = test?.version || 1;
    $("tbTestType").value = test?.test_type || "";
    $("tbDescription").value = test?.description || "";
    $("tbSearch").value = "";
    $("tbTypeFilter").value = "";
    $("tbSelectAll").checked = false;
    $("tbMessage").classList.add("hidden");
    $("tbPublish").disabled = !test;
    $("testBuilderBackdrop").classList.remove("hidden");
    document.body.classList.add("editor-open");
    if (test) {
      TestBuilderService.getQuestionIds(test.id).then((rows) => {
        state.selected = rows.map((row) => row.question_id);
        render();
      }).catch(showError);
    } else {
      render();
    }
  }

  function close(force = false) {
    if (!force && state.dirty && !window.confirm("尚有未儲存的變更，確定要關閉嗎？")) return;
    $("testBuilderBackdrop").classList.add("hidden");
    document.body.classList.remove("editor-open");
    state.dirty = false;
  }

  function showError(error) {
    const box = $("tbMessage");
    box.textContent = error?.message || String(error);
    box.className = "editor-message error";
  }

  function showSuccess(message) {
    const box = $("tbMessage");
    box.textContent = message;
    box.className = "editor-message success";
  }

  function render() {
    const keyword = $("tbSearch").value.trim().toLowerCase();
    const type = $("tbTypeFilter").value;
    const testType = $("tbTestType").value;

    const speakingTypes = [
    "read_aloud",
    "describe_picture",
    "respond_question",
    "respond_information",
    "express_opinion"
];
    state.filtered = portalState.questions.filter((q) => {
  if (state.selected.includes(q.id)) return false;

  // 依測驗類型自動篩選題庫
  if (testType === "speaking" && !speakingTypes.includes(q.question_type)) {
    return false;
  }

  if (testType === "writing" && speakingTypes.includes(q.question_type)) {
    return false;
  }

  // full = 口說＋寫作，因此不額外排除題型
  // quick 暫時也顯示全部，下一步再設定快速檢測專用題目

  // 題型下拉篩選
  if (type && q.question_type !== type) {
    return false;
  }

  // 關鍵字搜尋
  const haystack =
    `${q.question_code} ${q.title || ""} ${q.prompt || ""} ${q.question_type}`
      .toLowerCase();

  return !keyword || haystack.includes(keyword);
});

    $("tbAvailableCount").textContent = `${state.filtered.length} 題可加入`;
    $("tbSelectAll").checked = false;
    $("tbBankList").innerHTML = state.filtered.length ? state.filtered.map((q) => `
      <label class="builder-question-row">
        <input type="checkbox" value="${escapeHtml(q.id)}" data-bank-question>
        <span><strong>${escapeHtml(q.question_code)}</strong><small>${escapeHtml(getQuestionTypeLabel(q.question_type))} · ${escapeHtml(q.title || getQuestionPreview(q))}</small></span>
      </label>`).join("") : '<div class="empty-state compact">沒有可加入的題目。</div>';

    const questions = selectedQuestions();
    $("tbSelectedList").innerHTML = questions.length ? questions.map((q, index) => `
      <div class="builder-selected-row" draggable="true" data-drag-id="${escapeHtml(q.id)}">
        <span class="builder-drag-handle" title="拖曳排序">⋮⋮</span>
        <span class="builder-order">${index + 1}</span>
        <span class="builder-question-copy"><strong>${escapeHtml(q.question_code)}</strong><small>${escapeHtml(getQuestionTypeLabel(q.question_type))} · 回答 ${Number(q.response_time || 0)} 秒</small></span>
        <div class="builder-row-actions">
          <button type="button" data-move-up="${escapeHtml(q.id)}" ${index === 0 ? "disabled" : ""}>↑</button>
          <button type="button" data-move-down="${escapeHtml(q.id)}" ${index === questions.length - 1 ? "disabled" : ""}>↓</button>
          <button type="button" data-remove="${escapeHtml(q.id)}">移除</button>
        </div>
      </div>`).join("") : '<div class="empty-state compact">尚未加入題目。</div>';
    $("tbQuestionCount").textContent = `${questions.length} 題`;
    bindRows();
  }

  function bindRows() {
    document.querySelectorAll("[data-move-up]").forEach((button) => button.onclick = () => move(button.dataset.moveUp, -1));
    document.querySelectorAll("[data-move-down]").forEach((button) => button.onclick = () => move(button.dataset.moveDown, 1));
    document.querySelectorAll("[data-remove]").forEach((button) => button.onclick = () => {
      state.selected = state.selected.filter((id) => id !== button.dataset.remove);
      markDirty();
      render();
    });

    let draggedId = null;
    document.querySelectorAll("[data-drag-id]").forEach((row) => {
      row.addEventListener("dragstart", () => { draggedId = row.dataset.dragId; row.classList.add("dragging"); });
      row.addEventListener("dragend", () => { draggedId = null; row.classList.remove("dragging"); document.querySelectorAll(".drag-over").forEach((el) => el.classList.remove("drag-over")); });
      row.addEventListener("dragover", (event) => { event.preventDefault(); if (draggedId && draggedId !== row.dataset.dragId) row.classList.add("drag-over"); });
      row.addEventListener("dragleave", () => row.classList.remove("drag-over"));
      row.addEventListener("drop", (event) => {
        event.preventDefault();
        row.classList.remove("drag-over");
        const targetId = row.dataset.dragId;
        const from = state.selected.indexOf(draggedId);
        const to = state.selected.indexOf(targetId);
        if (from < 0 || to < 0 || from === to) return;
        state.selected.splice(from, 1);
        state.selected.splice(to, 0, draggedId);
        markDirty();
        render();
      });
    });
  }

  function move(id, offset) {
    const index = state.selected.indexOf(id);
    const target = index + offset;
    if (index < 0 || target < 0 || target >= state.selected.length) return;
    [state.selected[index], state.selected[target]] = [state.selected[target], state.selected[index]];
    markDirty();
    render();
  }

  function addChecked() {
    const ids = [...document.querySelectorAll("[data-bank-question]:checked")].map((input) => input.value);
    if (!ids.length) return showError(new Error("請先勾選要加入的題目。"));
    state.selected.push(...ids.filter((id) => !state.selected.includes(id)));
    markDirty();
    render();
  }

  async function save() {
    const payload = {
      test_code: $("tbCode").value,
      test_name: $("tbName").value,
      test_type: $("tbTestType").value,
      description: $("tbDescription").value,
      version: $("tbVersion").value
    };
    if (
  !payload.test_code.trim() ||
  !payload.test_name.trim() ||
  !payload.test_type
) {
  throw new Error("請填寫測驗代碼、名稱並選擇測驗類型。");
}
    const saveButton = $("tbSave");
    saveButton.disabled = true;
    saveButton.textContent = "儲存中……";
    try {
      state.test = state.test
        ? await TestBuilderService.updateTest(state.test.id, payload)
        : await TestBuilderService.createTest(payload);
      await TestBuilderService.saveQuestions(state.test.id, state.selected);
      $("tbId").value = state.test.id;
      $("tbPublish").disabled = false;
      markDirty(false);
      showSuccess("測驗與題目順序已儲存。");
      await loadTeacherPortalData();
      return state.test;
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = "儲存草稿";
    }
  }

  function renderValidationReport(report, test) {
    state.validation = { report, test };

    const errorBox = $("pvErrors");
    const warningBox = $("pvWarnings");

    errorBox.innerHTML = report.errors.length
      ? report.errors.map((message) => `
          <div class="validator-item error">
            <strong>✕</strong>
            <span>${escapeHtml(message)}</span>
          </div>`).join("")
      : `
          <div class="validator-item success">
            <strong>✓</strong>
            <span>沒有阻擋發布的錯誤。</span>
          </div>`;

    warningBox.innerHTML = report.warnings.length
      ? report.warnings.map((message) => `
          <div class="validator-item warning">
            <strong>!</strong>
            <span>${escapeHtml(message)}</span>
          </div>`).join("")
      : `
          <div class="validator-item success">
            <strong>✓</strong>
            <span>沒有額外提醒。</span>
          </div>`;

    $("pvSummary").textContent =
      `「${test.test_name}」共 ${state.selected.length} 題，` +
      `${report.errors.length} 項錯誤、${report.warnings.length} 項提醒。`;

    $("pvConfirm").disabled = report.errors.length > 0;
    $("pvConfirm").textContent = report.warnings.length
      ? "忽略提醒並發布"
      : "確認發布";

    $("publishValidatorBackdrop").classList.remove("hidden");
  }

  function closeValidationReport() {
    $("publishValidatorBackdrop").classList.add("hidden");
  }

  async function preparePublish() {
    try {
      const test = await save();
      const report = TestBuilderService.validate(test, selectedQuestions());
      renderValidationReport(report, test);
    } catch (error) {
      showError(error);
    }
  }

  async function confirmPublish() {
    const context = state.validation;
    if (!context || context.report.errors.length) return;

    const button = $("pvConfirm");
    button.disabled = true;
    button.textContent = "發布中……";

    try {
      await TestBuilderService.publishTest(context.test.id);
      closeValidationReport();
      state.test.status = "active";
      showSuccess("發布成功！學生端重新整理後會載入此測驗。");
      await loadTeacherPortalData();
    } catch (error) {
      closeValidationReport();
      showError(error);
    } finally {
      button.disabled = false;
      button.textContent = "確認發布";
    }
  }

  function openPreview() {
    const questions = selectedQuestions();
    if (!questions.length) return showError(new Error("請先加入至少一題再預覽。"));
    state.previewIndex = 0;
    $("tpHeading").textContent = $("tbName").value.trim() || "試卷預覽";
    $("tpMeta").textContent = `共 ${questions.length} 題｜依目前尚未儲存的排序預覽`;
    $("testPreviewBackdrop").classList.remove("hidden");
    renderPreview();
  }

  function closePreview() { $("testPreviewBackdrop").classList.add("hidden"); }

  function renderPreview() {
    const questions = selectedQuestions();
    const q = questions[state.previewIndex];
    if (!q) return closePreview();
    $("tpQuestionList").innerHTML = questions.map((item, index) => `<button type="button" data-preview-index="${index}" class="${index === state.previewIndex ? "active" : ""}"><span>${index + 1}</span><div><strong>${escapeHtml(item.question_code)}</strong><small>${escapeHtml(getQuestionTypeLabel(item.question_type))}</small></div></button>`).join("");
    document.querySelectorAll("[data-preview-index]").forEach((button) => button.onclick = () => { state.previewIndex = Number(button.dataset.previewIndex); renderPreview(); });
    $("tpQuestionNumber").textContent = `Question ${state.previewIndex + 1} of ${questions.length}`;
    $("tpQuestionType").textContent = getQuestionTypeLabel(q.question_type);
    $("tpDirections").textContent = q.directions || "";
    $("tpDirections").classList.toggle("hidden", !q.directions);
    $("tpTitle").textContent = q.title || "";
    $("tpPassage").textContent = q.passage || "";
    $("tpPassage").classList.toggle("hidden", !q.passage);
    $("tpPrompt").textContent = q.prompt || "";
    $("tpPrompt").classList.toggle("hidden", !q.prompt);
    if (q.image_url) { $("tpImage").src = q.image_url; $("tpImage").classList.remove("hidden"); } else { $("tpImage").removeAttribute("src"); $("tpImage").classList.add("hidden"); }
    if (q.audio_url) { $("tpAudio").src = q.audio_url; $("tpAudio").classList.remove("hidden"); } else { $("tpAudio").removeAttribute("src"); $("tpAudio").classList.add("hidden"); }
    $("tpTiming").textContent = `準備 ${Number(q.preparation_time || 0)} 秒｜回答 ${Number(q.response_time || 0)} 秒`;
    $("tpPrev").disabled = state.previewIndex === 0;
    $("tpNext").disabled = state.previewIndex === questions.length - 1;
  }

  function init() {
    $("tbClose").onclick = () => close();
    $("tbCancel").onclick = () => close();
    $("tbSearch").oninput = render;
    $("tbTypeFilter").onchange = render;
    $("tbTestType").onchange = render;
    $("tbSelectAll").onchange = (event) => document.querySelectorAll("[data-bank-question]").forEach((input) => { input.checked = event.target.checked; });
    $("tbAddSelected").onclick = addChecked;
    $("tbSave").onclick = () => save().catch(showError);
    $("tbPublish").onclick = preparePublish;
    $("tbPreview").onclick = openPreview;
    $("pvClose").onclick = closeValidationReport;
    $("pvCancel").onclick = closeValidationReport;
    $("pvConfirm").onclick = confirmPublish;
    $("publishValidatorBackdrop").onclick = (event) => {
      if (event.target === $("publishValidatorBackdrop")) closeValidationReport();
    };
    ["tbCode", "tbName", "tbVersion", "tbTestType","tbDescription"].forEach((id) => $(id).addEventListener("input", () => markDirty()));
    $("testBuilderBackdrop").onclick = (event) => { if (event.target === $("testBuilderBackdrop")) close(); };
    $("tpClose").onclick = closePreview;
    $("tpPrev").onclick = () => { if (state.previewIndex > 0) { state.previewIndex -= 1; renderPreview(); } };
    $("tpNext").onclick = () => { if (state.previewIndex < selectedQuestions().length - 1) { state.previewIndex += 1; renderPreview(); } };
    $("testPreviewBackdrop").onclick = (event) => { if (event.target === $("testPreviewBackdrop")) closePreview(); };
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (!$("publishValidatorBackdrop").classList.contains("hidden")) closeValidationReport();
      else if (!$("testPreviewBackdrop").classList.contains("hidden")) closePreview();
      else if (!$("testBuilderBackdrop").classList.contains("hidden")) close();
    });
  }

  return { init, open };
})();
