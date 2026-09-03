"use strict";

const qe = {
  backdrop: document.getElementById("questionEditorBackdrop"),
  form: document.getElementById("questionEditorForm"),
  heading: document.getElementById("questionEditorHeading"),
  id: document.getElementById("qeId"),
  code: document.getElementById("qeCode"),
  status: document.getElementById("qeStatus"),
  section: document.getElementById("qeSection"),
  type: document.getElementById("qeType"),
  title: document.getElementById("qeTitle"),
  directions: document.getElementById("qeDirections"),
  passage: document.getElementById("qePassage"),
  prompt: document.getElementById("qePrompt"),
  prep: document.getElementById("qePrep"),
  response: document.getElementById("qeResponse"),
  individualTimingRow:document.getElementById("qeIndividualTimingRow"),
  timerGroup: document.getElementById("qeTimerGroup"),
  sharedResponse: document.getElementById("qeSharedResponse"),
  sharedTimingRow: document.getElementById("qeSharedTimingRow"),
  image: document.getElementById("qeImage"),
  audio: document.getElementById("qeAudio"),
  imageUrl: document.getElementById("qeImageUrl"),
  audioUrl: document.getElementById("qeAudioUrl"),
  imageResult: document.getElementById("qeImageResult"),
  clearImage: document.getElementById("qeClearImage"),
  audioResult: document.getElementById("qeAudioResult"),
  transcribeAudio:
    document.getElementById(
      "qeTranscribeAudio"
    ),
  transcriptResult:
    document.getElementById(
      "qeTranscriptResult"
    ),
  message: document.getElementById("qeMessage"),
  save: document.getElementById("qeSave"),
  remove: document.getElementById("qeDelete"),
  previewCode: document.getElementById("qePreviewCode"),
  previewStatus: document.getElementById("qePreviewStatus"),
  previewType: document.getElementById("qePreviewType"),
  previewTime: document.getElementById("qePreviewTime"),
  previewDirections: document.getElementById("qePreviewDirections"),
  previewTitle: document.getElementById("qePreviewTitle"),
  previewPassage: document.getElementById("qePreviewPassage"),
  previewPrompt: document.getElementById("qePreviewPrompt"),
  previewImage: document.getElementById("qePreviewImage"),
  previewAudio: document.getElementById("qePreviewAudio")
};

function syncQuestionTypeOptions() {
  const section = qe.section.value;

  const speakingOptions = [
    { value: "read_aloud", label: "Read Aloud" },
    { value: "describe_picture", label: "Describe Picture" },
    { value: "respond_question", label: "Respond to Questions" },
    { value: "respond_information", label: "Using Information" },
    { value: "express_opinion", label: "Express an Opinion" }
  ];

  const writingOptions = [
    { value: "write_sentence", label: "Write a Sentence Based on a Picture" },
    { value: "respond_written_request", label: "Respond to a Written Request" },
    { value: "opinion_essay", label: "Write an Opinion Essay" }
  ];

  const options =
    section === "writing"
      ? writingOptions
      : speakingOptions;

  const currentValue = qe.type.value;

  qe.type.innerHTML = options
    .map(
      (item) =>
        `<option value="${item.value}">${item.label}</option>`
    )
    .join("");

  if (options.some((item) => item.value === currentValue)) {
    qe.type.value = currentValue;
  }
}

let qeImageUploadToken = 0;
let qeNewlyUploadedImageUrl = "";

function qeMessage(text, type = "error") {
  qe.message.textContent = text;
  qe.message.className = `editor-message ${type}`;
}
function qeClearMessage() {
  qe.message.className = "editor-message hidden";
  qe.message.textContent = "";
}
function qeData() {
  return {
    question_code: qe.code.value,
    status: qe.status.value,
    section_type: qe.section.value,
    question_type: qe.type.value,
    title: qe.title.value,
    directions: qe.directions.value,
    passage: qe.passage.value,
    prompt: qe.prompt.value,
    preparation_time: qe.prep.value,
    response_time: qe.response.value,
    timer_group: qe.timerGroup?.value || "",
    shared_response_time:
      qe.section.value === "writing"
        ? Math.round(
            Number(qe.sharedResponse?.value || 0) * 60
          )
        : Number(qe.sharedResponse?.value || 0),
    image_url: qe.imageUrl.value,
    audio_url: qe.audioUrl.value
  };
}
function syncQuestionTimingFields() {
  const isWriting =
    qe.section.value === "writing";

  // Speaking：顯示單題時間
  // Writing：隱藏單題時間
  qe.individualTimingRow?.classList.toggle(
    "hidden",
    isWriting
  );

  // Writing：顯示共用時間
  // Speaking：隱藏共用時間
  qe.sharedTimingRow?.classList.toggle(
    "hidden",
    !isWriting
  );

  if (isWriting) {
    // Writing 不使用 preparation / response time
    qe.prep.value = "0";
    qe.response.value = "0";
  } else {
    // 新增 Speaking 題目時如果原本為 0，
    // 自動恢復預設時間
    if (Number(qe.prep.value) === 0) {
      qe.prep.value = "45";
    }

    if (Number(qe.response.value) === 0) {
      qe.response.value = "45";
    }
  }
}

function formatWritingMinutes(seconds) {
  const totalSeconds =
    Math.max(0, Number(seconds) || 0);

  const minutes =
    totalSeconds / 60;

  return Number.isInteger(minutes)
    ? `${minutes} min`
    : `${minutes.toFixed(1)} min`;
}

function qePreview() {
  const d = qeData();
  syncQuestionTimingFields();
  qe.previewCode.textContent = d.question_code || "NEW QUESTION";
  qe.previewStatus.textContent = d.status;
  qe.previewStatus.className = `status-badge ${d.status}`;
  qe.previewType.textContent = typeof getQuestionTypeLabel === "function"
    ? getQuestionTypeLabel(d.question_type) : d.question_type;
  if (d.section_type === "writing") {
  qe.previewTime.textContent =
    d.shared_response_time > 0
      ? `Shared Time ${formatWritingMinutes(d.shared_response_time)}`
      : "Shared Time —";
} else {
  qe.previewTime.textContent =
    `Preparation ${Number(d.preparation_time || 0)}s · Response ${Number(d.response_time || 0)}s`;
}
  qe.previewDirections.textContent = d.directions || "Directions will appear here.";
  qe.previewTitle.textContent = d.title || "題目標題";
  qe.previewPassage.textContent = d.passage || "Passage content will appear here.";
  qe.previewPrompt.textContent = d.prompt || "Prompt will appear here.";
  qe.previewImage.classList.toggle("hidden", !d.image_url);
  if (d.image_url) qe.previewImage.src = d.image_url;
  qe.previewAudio.classList.toggle("hidden", !d.audio_url);
  if (d.audio_url) qe.previewAudio.src = d.audio_url;
}
function qeReset() {
  qe.form.reset();
  qe.id.value = "";
  qe.status.value = "draft";
  qe.section.value = "speaking";
  syncQuestionTypeOptions();
  qe.type.value = "read_aloud";
  qe.prep.value = "45";
  qe.response.value = "45";
  if (qe.timerGroup) qe.timerGroup.value = "";
  if (qe.sharedResponse) qe.sharedResponse.value = "0";
  syncQuestionTimingFields();
  qe.imageUrl.value = "";
  qe.audioUrl.value = "";
  qe.imageResult.classList.add("hidden");
  qe.clearImage.classList.add("hidden");
  qe.audioResult.classList.add("hidden");
  qeImageUploadToken += 1;
  qeNewlyUploadedImageUrl = "";
  qe.remove.classList.add("hidden");
  qeClearMessage();
  qePreview();
}
function qeOpen(question = null) {
  qeReset();
  qe.heading.textContent = question ? "編輯題目" : "新增題目";
  if (question) {
    qe.id.value = question.id || "";
    qe.code.value = question.question_code || "";
    qe.status.value = question.status || "draft";
    qe.section.value = question.section_type || "speaking";
    syncQuestionTypeOptions();
    qe.type.value = question.question_type || "read_aloud";
    qe.title.value = question.title || "";
    qe.directions.value = question.directions || "";
    qe.passage.value = question.passage || "";
    qe.prompt.value = question.prompt || "";
    qe.prep.value = Number(question.preparation_time || 0);
    qe.response.value = Number(question.response_time || 0);
    if (qe.timerGroup) qe.timerGroup.value = question.timer_group || "";
    if (qe.sharedResponse) {
      const storedSharedSeconds =
        Number(question.shared_response_time || 0);

      qe.sharedResponse.value =
        qe.section.value === "writing"
          ? storedSharedSeconds / 60
          : storedSharedSeconds;
    }
    syncQuestionTimingFields();
    qe.imageUrl.value = question.image_url || "";
    qe.audioUrl.value = question.audio_url || "";
    if (question.image_url) {
      qe.imageResult.textContent = "已載入原圖片";
      qe.imageResult.classList.remove("hidden");
      qe.clearImage.classList.remove("hidden");
    }
    if (question.audio_url) {
      qe.audioResult.textContent = "已載入原音檔";
      qe.audioResult.classList.remove("hidden");
    }
    if (portalState?.auth?.profile?.role === "admin") {
      qe.remove.classList.remove("hidden");
    }
  }
  qePreview();
  qe.backdrop.classList.remove("hidden");
  document.body.classList.add("editor-open");
  setTimeout(() => qe.code.focus(), 30);
}

// V5.5.4：提供 teacher.js 題庫列直接開啟編輯器。
// 舊版 teacher.js 會尋找 QuestionEditor.open，
// 但 question-editor.js 原本沒有輸出此 API，因而誤顯示「Part 4 題組 / 我知道了」。
window.QuestionEditor = window.QuestionEditor || {};
window.QuestionEditor.open = function(question = null) {
  qeOpen(question);

  // Part 4 題目進入編輯器時保持題組模式。
  if (
    question?.section_type === "speaking" &&
    question?.question_type === "respond_information"
  ) {
    window.setTimeout(() => {
      window.syncPart4BatchPanel?.();
    }, 0);
  }
};

function qeClose() {
  qe.backdrop.classList.add("hidden");
  document.body.classList.remove("editor-open");
}

async function qeUpload(file, kind) {
  if (!file) return;

  const result =
    kind === "image"
      ? qe.imageResult
      : qe.audioResult;

  const target =
    kind === "image"
      ? qe.imageUrl
      : qe.audioUrl;

  const uploadToken =
    kind === "image"
      ? ++qeImageUploadToken
      : 0;

  result.textContent =
    `正在上傳 ${file.name}……`;

  result.classList.remove("hidden");

  if (kind === "image") {
    qe.clearImage.classList.remove(
      "hidden"
    );
  }

  try {
    const uploadedUrl =
      await uploadQuestionAsset(
        file,
        kind === "image"
          ? "images"
          : "audio"
      );

    if (
      kind === "image" &&
      uploadToken !==
        qeImageUploadToken
    ) {
      await deleteQuestionAssetByPublicUrl(
        uploadedUrl
      );

      return;
    }

    target.value = uploadedUrl;

    if (kind === "image") {
      qeNewlyUploadedImageUrl =
        uploadedUrl;
    }

    result.textContent =
      `已上傳：${file.name}`;

    qePreview();

  } catch (error) {
    result.textContent =
      `上傳失敗：${error.message}`;

    qeMessage(
      "素材上傳失敗，請確認檔案格式、大小與 Storage 權限。",
      "error"
    );
  }
}


async function qeTranscribeUploadedAudio() {
  if (!qe.audioUrl.value) {
    qeMessage(
      "請先選擇並完成音檔上傳。",
      "error"
    );
    return;
  }

  if (
    typeof TranscriptionService ===
    "undefined"
  ) {
    qeMessage(
      "逐字稿服務尚未載入。",
      "error"
    );
    return;
  }

  qe.transcribeAudio.disabled = true;
  qe.transcribeAudio.textContent =
    "AI 轉錄中……";

  if (qe.transcriptResult) {
    qe.transcriptResult.textContent =
      "正在將音檔轉成逐字稿……";
    qe.transcriptResult.classList.remove(
      "hidden"
    );
  }

  try {
    const transcript =
      await TranscriptionService
        .transcribeAudioUrl(
          qe.audioUrl.value
        );

    // 依 TOEIC 題型，逐字稿優先填入 Prompt；
    // Read Aloud 若 Passage 為空則填 Passage。
    if (
      qe.type.value === "read_aloud" &&
      !qe.passage.value.trim()
    ) {
      qe.passage.value = transcript;
    } else {
      qe.prompt.value = transcript;
    }

    if (qe.transcriptResult) {
      qe.transcriptResult.textContent =
        "逐字稿已產生，請確認文字後再儲存題目。";
    }

    qePreview();

  } catch (error) {
    console.error(
      "AI 逐字稿失敗：",
      error
    );

    if (qe.transcriptResult) {
      qe.transcriptResult.textContent =
        `逐字稿失敗：${error.message}`;
    }

    qeMessage(
      "目前無法產生逐字稿，請確認 Supabase Edge Function 與 API 金鑰。",
      "error"
    );

  } finally {
    qe.transcribeAudio.disabled = false;
    qe.transcribeAudio.textContent =
      "AI 轉逐字稿";
  }
}


async function qeClearImage() {
  qeImageUploadToken += 1;

  const uploadedUrl =
    qeNewlyUploadedImageUrl;

  qe.image.value = "";
  qe.imageUrl.value = "";
  qeNewlyUploadedImageUrl = "";

  qe.imageResult.textContent =
    qe.id.value
      ? "已移除圖片；請儲存題目後生效。"
      : "已取消圖片。";

  qe.imageResult.classList.remove(
    "hidden"
  );

  qe.clearImage.classList.add(
    "hidden"
  );

  qePreview();

  if (uploadedUrl) {
    await deleteQuestionAssetByPublicUrl(
      uploadedUrl
    );
  }
}

qe.form.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Part 4 題組模式由專用的「儲存 Part 4 題組」按鈕處理，
  // 避免誤觸通用「儲存題目」造成沒有反應或要求單題代碼。
  const part4Panel = document.getElementById("qePart4BatchPanel");
  if (
    qe.section?.value === "speaking" &&
    qe.type?.value === "respond_information" &&
    part4Panel &&
    !part4Panel.classList.contains("hidden")
  ) {
    return;
  }

  qeClearMessage();
  if (!qe.code.value.trim()) {
    qeMessage("請輸入題目代碼。");
    return;
  }
  qe.save.disabled = true;
  qe.save.textContent = "正在儲存……";
  try {
    if (qe.id.value) await updateQuestion(qe.id.value, qeData());
    else await createQuestion(qeData());
    qeMessage("題目已儲存。", "success");
    await loadTeacherPortalData();
    setTimeout(qeClose, 500);
  } catch (error) {
    qeMessage(error.code === "23505" ? "題目代碼已存在。" : `儲存失敗：${error.message}`);
  } finally {
    qe.save.disabled = false;
    qe.save.textContent = "儲存題目";
  }
});

qe.remove.addEventListener("click", async () => {
  if (!qe.id.value || !confirm("確定永久刪除此題目嗎？")) return;
  try {
    await deleteQuestion(qe.id.value);
    await loadTeacherPortalData();
    qeClose();
  } catch (error) {
    if (error?.code === "QUESTION_IN_USE") {
      qeMessage(
        "無法刪除：此題目已加入測驗。請先到「測驗組卷」移除此題並儲存，再回來刪除。",
        "error"
      );
    } else {
      qeMessage(`刪除失敗：${error.message}`, "error");
    }
  }
});

qe.section.addEventListener("change", () => {
  syncQuestionTypeOptions();
  syncQuestionTimingFields();
  qePreview();
});

[qe.code, qe.status, qe.section, qe.type, qe.title, qe.directions, qe.passage, qe.prompt, qe.prep, qe.response, qe.timerGroup, qe.sharedResponse].filter(Boolean)
  .forEach(el => {
    el.addEventListener("input", qePreview);
    el.addEventListener("change", qePreview);
  });
qe.image.addEventListener(
  "change",
  () =>
    qeUpload(
      qe.image.files?.[0],
      "image"
    )
);

qe.clearImage.addEventListener(
  "click",
  qeClearImage
);
qe.audio.addEventListener(
  "change",
  () =>
    qeUpload(
      qe.audio.files?.[0],
      "audio"
    )
);

qe.transcribeAudio?.addEventListener(
  "click",
  qeTranscribeUploadedAudio
);
document.getElementById("qeClose").addEventListener("click", qeClose);
document.getElementById("qeCancel").addEventListener("click", qeClose);
qe.backdrop.addEventListener("click", e => { if (e.target === qe.backdrop) qeClose(); });

window.addEventListener("DOMContentLoaded", () => {
  const newButton = document.getElementById("newQuestionButton");
  if (newButton) {
    const clone = newButton.cloneNode(true);
    newButton.replaceWith(clone);
    clone.addEventListener("click", () => qeOpen());
  }
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-edit-question]");
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const question = portalState.questions.find(item => item.id === button.dataset.editQuestion);
    if (question) qeOpen(question);
  }, true);
});


/* =========================================================
   V5.3.6 - Speaking Part 3 backend batch builder
   ========================================================= */
(function initPart3BatchBuilder(){
  const panel = document.getElementById("qePart3BatchPanel");
  const batchSave = document.getElementById("qePart3BatchSave");
  const batchToggle = document.getElementById("qePart3BatchToggle");
  const section = document.getElementById("qeSection");
  const type = document.getElementById("qeType");
  const standardFields = [
    document.getElementById("qeCode")?.closest(".editor-field"),
    document.getElementById("qeTitle")?.closest(".editor-field"),
    document.getElementById("qeDirections")?.closest(".editor-field"),
    document.getElementById("qePassage")?.closest(".editor-field"),
    document.getElementById("qePrompt")?.closest(".editor-field"),
    document.getElementById("qeIndividualTimingRow"),
    document.querySelector("#qeImage")?.closest(".asset-box"),
    document.querySelector("#qeAudio")?.closest(".asset-box")
  ].filter(Boolean);

  let batchMode = true;

  function isPart3(){
    return section?.value === "speaking" && type?.value === "respond_question";
  }

  function sync(){
    if (!panel) return;
    const show = isPart3();
    panel.classList.toggle("hidden", !show || !batchMode);
    standardFields.forEach(el => el.classList.toggle("hidden", show && batchMode));
    if (batchToggle) batchToggle.textContent = batchMode ? "切換為單題模式" : "切換為題組模式";
  }

  window.syncPart3BatchPanel = sync;

  section?.addEventListener("change", () => setTimeout(sync, 0));
  type?.addEventListener("change", sync);
  batchToggle?.addEventListener("click", () => {
    batchMode = !batchMode;
    sync();
  });

  async function saveBatch(){
    const codeRaw = document.getElementById("qePart3GroupCode")?.value.trim() || "";
    const title = document.getElementById("qePart3GroupTitle")?.value.trim() || "Part 3 Question Set";
    const passage = document.getElementById("qePart3Passage")?.value.trim() || "";
    const status = document.getElementById("qeStatus")?.value || "draft";
    const introSeconds = Math.max(
      1,
      Number(
        document.getElementById("qePart3IntroSeconds")?.value || 10
      )
    );
    const cleanCode = codeRaw.toUpperCase().replace(/[^A-Z0-9_-]/g, "");

    const rows = [5,6,7].map(n => ({
      n,
      prompt: document.getElementById(`qePart3Q${n}`)?.value.trim() || "",
      prep: Number(document.getElementById(`qePart3Q${n}Prep`)?.value || 0),
      response: Number(document.getElementById(`qePart3Q${n}Response`)?.value || 0)
    }));

    if (!cleanCode) return qeMessage("請輸入 Part 3 題組代碼，例如 GYM01。");
    if (!passage) return qeMessage("請輸入 Q5–Q7 共用的 Situation / Passage。");
    if (rows.some(r => !r.prompt)) return qeMessage("請完整輸入 Question 5、6、7。");

    batchSave.disabled = true;
    batchSave.textContent = "正在建立 Q5–Q7…";
    qeClearMessage();

    const created = [];
    try {
      for (const row of rows) {
        const payload = {
          question_code: `SPK-P3-${cleanCode}-Q${String(row.n).padStart(2,"0")}`,
          status,
          section_type: "speaking",
          question_type: "respond_question",
          title: `${title} - Question ${row.n}`,
          directions: `P3_INTRO_SECONDS=${introSeconds}`,
          passage,
          prompt: row.prompt,
          preparation_time: row.prep,
          response_time: row.response,
          timer_group: "",
          shared_response_time: null,
          image_url: "",
          audio_url: ""
        };
        const result = await createQuestion(payload);
        created.push(result);
      }

      qeMessage(
        `Part 3 題組建立完成：Q5 ${rows[0].response}s、Q6 ${rows[1].response}s、Q7 ${rows[2].response}s。接著可逐題上傳音檔，再到測驗組卷加入這三題。`,
        "success"
      );
      await loadTeacherPortalData();
    } catch (error) {
      console.error("Part 3 batch create failed:", error);
      qeMessage(
        error?.code === "23505"
          ? "題目代碼已存在。請更換題組代碼後再試。"
          : `Part 3 題組建立失敗：${error?.message || error}`,
        "error"
      );
    } finally {
      batchSave.disabled = false;
      batchSave.textContent = "一次建立 Q5–Q7";
    }
  }

  batchSave?.addEventListener("click", saveBatch);
  window.addEventListener("DOMContentLoaded", () => setTimeout(sync, 100));
  setTimeout(sync, 0);
})();


document.addEventListener("click", (event) => {
  if (
    event.target?.id === "addQuestionButton" ||
    event.target?.closest?.("#addQuestionButton")
  ) {
    setTimeout(() => {
      window.syncPart3BatchPanel?.();
      window.syncPart4BatchPanel?.();
    }, 80);
  }
});


/* =========================================================
   V5.4.0 - Speaking Part 4 Information batch builder
   Direction -> Information page -> Q8 -> Q9 -> Q10
   ========================================================= */
(function initPart4BatchBuilder(){
  const panel = document.getElementById("qePart4BatchPanel");
  const batchSave = document.getElementById("qePart4BatchSave");
  const batchToggle = document.getElementById("qePart4BatchToggle");
  const section = document.getElementById("qeSection");
  const type = document.getElementById("qeType");
  const genericSaveButton = document.getElementById("qeSave");
  const standardFields = [
    document.getElementById("qeCode")?.closest(".editor-field"),
    document.getElementById("qeTitle")?.closest(".editor-field"),
    document.getElementById("qeDirections")?.closest(".editor-field"),
    document.getElementById("qePassage")?.closest(".editor-field"),
    document.getElementById("qePrompt")?.closest(".editor-field"),
    document.getElementById("qeIndividualTimingRow"),
    document.querySelector("#qeImage")?.closest(".asset-box"),
    document.querySelector("#qeAudio")?.closest(".asset-box")
  ].filter(Boolean);

  let batchMode = true;

  function isPart4(){
    return section?.value === "speaking" && type?.value === "respond_information";
  }

  function sync(){
    if (!panel) return;
    const show = isPart4();
    const part4BatchActive = show && batchMode;

    panel.classList.toggle("hidden", !part4BatchActive);
    standardFields.forEach(el => el.classList.toggle("hidden", part4BatchActive));

    // V5.4.6:
    // Part 4 題組模式已有 Information 45 秒，以及 Q8/Q9/Q10 各自的
    // Preparation / Response，因此禁止再顯示單題模式的通用計時欄位。
    const genericTiming = document.getElementById("qeIndividualTimingRow");
    if (genericTiming) {
      genericTiming.classList.toggle("hidden", part4BatchActive);
      genericTiming.setAttribute(
        "aria-hidden",
        part4BatchActive ? "true" : "false"
      );
    }

    if (batchToggle) {
      batchToggle.textContent =
        batchMode ? "切換為單題模式" : "切換為題組模式";
    }

    // Part 4 題組模式時，下方通用「儲存題目」會造成誤會：
    // 題組其實已由「儲存 Part 4 題組」完成，因此直接隱藏通用儲存按鈕。
    if (genericSaveButton) {
      genericSaveButton.classList.toggle("hidden", part4BatchActive);
      genericSaveButton.disabled = part4BatchActive;
      genericSaveButton.setAttribute(
        "aria-hidden",
        part4BatchActive ? "true" : "false"
      );
    }
  }

  window.syncPart4BatchPanel = sync;
  section?.addEventListener("change", () => setTimeout(sync, 0));
  type?.addEventListener("change", sync);
  batchToggle?.addEventListener("click", () => { batchMode = !batchMode; sync(); });

  const part4ImageInput = document.getElementById("qePart4Image");
  const part4ImageResult = document.getElementById("qePart4ImageResult");
  const part4ImagePreview = document.getElementById("qePart4ImagePreview");
  const part4ImageClear = document.getElementById("qePart4ImageClear");

  let part4ImageObjectUrl = "";

  function clearPart4ImageSelection() {
    if (part4ImageObjectUrl) URL.revokeObjectURL(part4ImageObjectUrl);
    part4ImageObjectUrl = "";
    if (part4ImageInput) part4ImageInput.value = "";
    if (part4ImageResult) part4ImageResult.textContent = "尚未選擇圖片";
    if (part4ImagePreview) {
      part4ImagePreview.removeAttribute("src");
      part4ImagePreview.classList.add("hidden");
    }
    part4ImageClear?.classList.add("hidden");
  }

  part4ImageInput?.addEventListener("change", e => {
    const f = e.target.files?.[0];
    if (!f) return clearPart4ImageSelection();

    if (part4ImageObjectUrl) URL.revokeObjectURL(part4ImageObjectUrl);
    part4ImageObjectUrl = URL.createObjectURL(f);

    if (part4ImageResult) part4ImageResult.textContent = `已選擇：${f.name}`;
    if (part4ImagePreview) {
      part4ImagePreview.src = part4ImageObjectUrl;
      part4ImagePreview.classList.remove("hidden");
    }
    part4ImageClear?.classList.remove("hidden");
  });

  part4ImageClear?.addEventListener("click", clearPart4ImageSelection);

  const part4AudioInput = document.getElementById("qePart4InformationAudio");
  const part4AudioResult = document.getElementById("qePart4InformationAudioResult");
  const part4AudioPreview = document.getElementById("qePart4AudioPreview");
  const part4AudioPreviewButton = document.getElementById("qePart4AudioPreviewButton");
  const part4AudioClear = document.getElementById("qePart4AudioClear");

  let part4AudioObjectUrl = "";

  function clearPart4AudioSelection() {
    if (part4AudioPreview) {
      part4AudioPreview.pause();
      part4AudioPreview.currentTime = 0;
      part4AudioPreview.removeAttribute("src");
    }
    if (part4AudioObjectUrl) URL.revokeObjectURL(part4AudioObjectUrl);
    part4AudioObjectUrl = "";
    if (part4AudioInput) part4AudioInput.value = "";
    if (part4AudioResult) part4AudioResult.textContent = "尚未選擇音檔";
    part4AudioPreviewButton?.classList.add("hidden");
    part4AudioClear?.classList.add("hidden");
    if (part4AudioPreviewButton) part4AudioPreviewButton.textContent = "▶ 試播音檔";
  }

  part4AudioInput?.addEventListener("change", e => {
    const f = e.target.files?.[0];
    if (!f) return clearPart4AudioSelection();

    if (part4AudioObjectUrl) URL.revokeObjectURL(part4AudioObjectUrl);
    part4AudioObjectUrl = URL.createObjectURL(f);

    if (part4AudioResult) part4AudioResult.textContent = `已選擇：${f.name}`;
    if (part4AudioPreview) part4AudioPreview.src = part4AudioObjectUrl;
    part4AudioPreviewButton?.classList.remove("hidden");
    part4AudioClear?.classList.remove("hidden");
  });

  part4AudioPreviewButton?.addEventListener("click", async () => {
    if (!part4AudioPreview?.src) return;

    if (!part4AudioPreview.paused) {
      part4AudioPreview.pause();
      part4AudioPreviewButton.textContent = "▶ 繼續播放";
      return;
    }

    try {
      await part4AudioPreview.play();
      part4AudioPreviewButton.textContent = "⏸ 暫停";
    } catch (error) {
      console.warn("Part 4 Information 音檔試播失敗：", error);
    }
  });

  part4AudioPreview?.addEventListener("ended", () => {
    if (part4AudioPreviewButton) part4AudioPreviewButton.textContent = "▶ 重新播放";
  });

  part4AudioClear?.addEventListener("click", clearPart4AudioSelection);

  async function saveBatch(){
    const codeRaw = document.getElementById("qePart4GroupCode")?.value.trim() || "";
    const cleanCode = codeRaw.toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    const title = document.getElementById("qePart4GroupTitle")?.value.trim() || "Part 4 Information Set";
    const informationText = document.getElementById("qePart4InformationText")?.value.trim() || "";
    const infoSeconds = Math.max(1, Number(document.getElementById("qePart4InfoSeconds")?.value || 45));
    const status = document.getElementById("qeStatus")?.value || "draft";
    const imageFile = document.getElementById("qePart4Image")?.files?.[0];
    const informationAudioFile = document.getElementById("qePart4InformationAudio")?.files?.[0] || null;

    const rows = [8,9,10].map(n => ({
      n,
      prompt: document.getElementById(`qePart4Q${n}`)?.value.trim() || "",
      prep: Number(document.getElementById(`qePart4Q${n}Prep`)?.value || 3),
      response: Number(document.getElementById(`qePart4Q${n}Response`)?.value || (n === 10 ? 30 : 15)),
      audioFile: document.getElementById(`qePart4Q${n}Audio`)?.files?.[0] || null
    }));

    if (!cleanCode) return qeMessage("請輸入 Part 4 題組代碼，例如 TOUR01。");
    if (!imageFile) return qeMessage("請上傳 Q8–Q10 共用的 Information 圖片。");

    batchSave.disabled = true;
    batchSave.textContent = "正在儲存 Part 4 題組…";
    qeClearMessage();

    try {
      const imageUrl = await uploadQuestionAsset(imageFile, `part4/${cleanCode}/information`);
      let informationAudioUrl = "";
      if (informationAudioFile) {
        informationAudioUrl = await uploadQuestionAsset(
          informationAudioFile,
          `part4/${cleanCode}/information-audio`
        );
      }
      const part4Meta = [
        `P4_INFO_SECONDS=${infoSeconds}`,
        informationAudioUrl ? `P4_INFO_AUDIO_URL=${informationAudioUrl}` : ""
      ].filter(Boolean).join("\n");

      let createdCount = 0;
      let updatedCount = 0;

      for (const row of rows) {
        const questionCode =
          `SPK-P4-${cleanCode}-Q${String(row.n).padStart(2,"0")}`;

        const existing =
          await findQuestionByCode(questionCode);

        let audioUrl = existing?.audio_url || "";

        if (row.audioFile) {
          audioUrl = await uploadQuestionAsset(
            row.audioFile,
            `part4/${cleanCode}/q${row.n}`
          );
        }

        const result =
          await createOrUpdateQuestionByCode({
            question_code: questionCode,
            status,
            section_type: "speaking",
            question_type: "respond_information",
            title: `${title} - Question ${row.n}`,
            directions: part4Meta,
            passage: informationText,
            prompt: row.prompt,
            preparation_time: row.prep,
            response_time: row.response,
            timer_group: "",
            shared_response_time: null,
            image_url: imageUrl || existing?.image_url || "",
            audio_url: audioUrl
          });

        if (result.action === "updated") updatedCount += 1;
        else createdCount += 1;
      }

      const actionText =
        updatedCount > 0
          ? `題組已儲存：更新 ${updatedCount} 題、新增 ${createdCount} 題`
          : `Part 4 題組建立完成：新增 ${createdCount} 題`;

      qeMessage(
        `${actionText}。Information ${infoSeconds}s → Q8 ${rows[0].response}s → Q9 ${rows[1].response}s → Q10 ${rows[2].response}s。`,
        "success"
      );
      await loadTeacherPortalData();
    } catch (error) {
      console.error("Part 4 batch create failed:", error);
      qeMessage(
        `Part 4 題組儲存失敗：${error?.message || error}`,
        "error"
      );
    } finally {
      batchSave.disabled = false;
      batchSave.textContent = "儲存 Part 4 題組";
    }
  }

  batchSave?.addEventListener("click", saveBatch);
  window.addEventListener("DOMContentLoaded", () => setTimeout(sync, 100));
  setTimeout(sync, 0);
})();

