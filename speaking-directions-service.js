"use strict";

const SpeakingDirectionsService = {
  TABLE: "speaking_directions",
  BUCKET: "question-assets",

  async list() {
    const { data, error } =
      await supabaseClient
        .from(this.TABLE)
        .select(
          "id,part_number,title,directions_text,audio_url,status,created_at,updated_at"
        )
        .order("part_number", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async save(record) {
    const payload = {
      part_number: Number(record.part_number),
      title:
        String(record.title || "").trim() ||
        `Speaking Part ${record.part_number} Directions`,
      directions_text:
        String(record.directions_text || "").trim(),
      audio_url: record.audio_url || null,
      status: record.status || "active",
      updated_at: new Date().toISOString()
    };

    const { data, error } =
      await supabaseClient
        .from(this.TABLE)
        .upsert(payload, {
          onConflict: "part_number"
        })
        .select()
        .single();

    if (error) throw error;
    return data;
  },

  async uploadAudio(partNumber, file) {
    if (!file) return null;

    const ext =
      file.name?.split(".").pop() || "mp3";

    const path =
      `speaking-directions/part-${partNumber}-${crypto.randomUUID()}.${ext}`;

    const { error } =
      await supabaseClient.storage
        .from(this.BUCKET)
        .upload(path, file, {
          upsert: false,
          contentType:
            file.type || "audio/mpeg"
        });

    if (error) throw error;

    const { data } =
      supabaseClient.storage
        .from(this.BUCKET)
        .getPublicUrl(path);

    return data?.publicUrl || null;
  }
};

const SpeakingDirectionsModule = (() => {
  const state = {
    rows: [],
    editingPart: null,
    uploadedAudioUrl: null
  };

  const el = {};
  let initialized = false;

  function cache() {
    [
      ["grid", "speakingDirectionsGrid"],
      ["statusBox", "speakingDirectionsStatus"],
      ["refresh", "refreshDirectionsButton"],
      ["modal", "speakingDirectionModal"],
      ["modalTitle", "speakingDirectionModalTitle"],
      ["part", "sdPartNumber"],
      ["status", "sdStatus"],
      ["title", "sdTitle"],
      ["text", "sdDirectionsText"],
      ["audioFile", "sdAudioFile"],
      ["audioCurrent", "sdAudioCurrent"],
      ["audioPreview", "sdAudioPreview"],
      ["cancel", "sdCancelButton"],
      ["close", "sdCloseButton"],
      ["transcribe", "sdTranscribeButton"],
      ["save", "sdSaveButton"],
      ["transcriptResult", "sdTranscriptResult"]
    ].forEach(([key, id]) => {
      el[key] = document.getElementById(id);
    });
  }

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function rowFor(part) {
    return state.rows.find(
      (r) => Number(r.part_number) === Number(part)
    ) || null;
  }

  function range(part) {
    return {
      1: "Q1–Q2",
      2: "Q3–Q4",
      3: "Q5–Q7",
      4: "Q8–Q10",
      5: "Q11"
    }[part] || "—";
  }

  function render() {
    const parts = [1,2,3,4,5];

    el.grid.innerHTML = parts.map((part) => {
      const row = rowFor(part);

      return `
        <article class="test-management-card">
          <span class="status-badge ${esc(row?.status || "draft")}">
            ${esc(row?.status || "draft")}
          </span>

          <h3>Speaking Part ${part}</h3>

          <p>
            ${esc(row?.title || `Speaking Part ${part} Directions`)}
          </p>

          <div class="test-card-meta">
            <span>對應 ${range(part)}</span>
            <strong>
              ${row?.audio_url ? "已有音檔" : "尚無音檔"}
            </strong>
          </div>

          <p>
            ${esc(row?.directions_text || "尚未設定 Direction 文字。")}
          </p>

          <div class="test-card-actions">
            <button
              class="edit-test"
              type="button"
              data-edit-direction="${part}"
            >
              編輯 Direction
            </button>
          </div>
        </article>
      `;
    }).join("");

    el.grid
      .querySelectorAll("[data-edit-direction]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          open(Number(button.dataset.editDirection));
        });
      });
  }

  async function load() {
    if (!el.grid) return;

    if (el.statusBox) {
      el.statusBox.classList.remove("hidden");
      el.statusBox.textContent =
        "正在載入口說 Directions……";
    }

    try {
      state.rows =
        await SpeakingDirectionsService.list();

      render();

      el.statusBox?.classList.add("hidden");
    } catch (error) {
      console.error("Directions 載入失敗：", error);

      if (el.statusBox) {
        el.statusBox.textContent =
          `載入失敗：${error.message}`;
      }
    }
  }

  function open(part) {
    const row = rowFor(part);

    state.editingPart = part;
    state.uploadedAudioUrl =
      row?.audio_url || null;

    el.part.value = part;
    el.status.value = row?.status || "active";
    el.title.value =
      row?.title || `Speaking Part ${part} Directions`;
    el.text.value =
      row?.directions_text || "";
    el.audioFile.value = "";

    if (row?.audio_url) {
      el.audioCurrent.textContent =
        "目前已有 Direction 音檔。";
      el.audioPreview.src = row.audio_url;
      el.audioPreview.classList.remove("hidden");
    } else {
      el.audioCurrent.textContent =
        "尚未設定 Direction 音檔。";
      el.audioPreview.removeAttribute("src");
      el.audioPreview.classList.add("hidden");
    }

    el.transcriptResult?.classList.add("hidden");

    el.modalTitle.textContent =
      `Speaking Part ${part} Direction`;

    el.modal.classList.remove("hidden");
  }

  function close() {
    el.modal.classList.add("hidden");
    state.editingPart = null;
    state.uploadedAudioUrl = null;
  }

  async function ensureAudioUploaded() {
    const file =
      el.audioFile.files?.[0];

    if (!file) {
      return state.uploadedAudioUrl;
    }

    const url =
      await SpeakingDirectionsService
        .uploadAudio(
          state.editingPart,
          file
        );

    state.uploadedAudioUrl = url;

    el.audioCurrent.textContent =
      "新音檔已上傳。";

    el.audioPreview.src = url;
    el.audioPreview.classList.remove("hidden");

    return url;
  }

  async function transcribe() {
    try {
      el.transcribe.disabled = true;
      el.transcribe.textContent =
        "AI 轉錄中……";

      const audioUrl =
        await ensureAudioUploaded();

      if (!audioUrl) {
        throw new Error(
          "請先選擇 Direction 音檔。"
        );
      }

      if (
        typeof TranscriptionService ===
        "undefined"
      ) {
        throw new Error(
          "逐字稿服務尚未載入。"
        );
      }

      const text =
        await TranscriptionService
          .transcribeAudioUrl(audioUrl);

      el.text.value = text;

      if (el.transcriptResult) {
        el.transcriptResult.textContent =
          "逐字稿已產生，請確認後再儲存。";
        el.transcriptResult.classList.remove("hidden");
      }

    } catch (error) {
      console.error(
        "Direction AI 轉錄失敗：",
        error
      );

      if (el.transcriptResult) {
        el.transcriptResult.textContent =
          `轉錄失敗：${error.message}`;
        el.transcriptResult.classList.remove("hidden");
      }

    } finally {
      el.transcribe.disabled = false;
      el.transcribe.textContent =
        "AI 轉逐字稿";
    }
  }

  async function save() {
    const part = Number(state.editingPart);
    if (!part) return;

    el.save.disabled = true;
    el.save.textContent = "正在儲存……";

    try {
      const audioUrl =
        await ensureAudioUploaded();

      await SpeakingDirectionsService.save({
        part_number: part,
        title: el.title.value,
        directions_text: el.text.value,
        audio_url: audioUrl,
        status: el.status.value
      });

      await load();
      close();

      window.alert(
        `Speaking Part ${part} Direction 已儲存。`
      );

    } catch (error) {
      console.error(
        "Direction 儲存失敗：",
        error
      );

      window.alert(
        `儲存失敗：${error.message}`
      );

    } finally {
      el.save.disabled = false;
      el.save.textContent =
        "儲存 Direction";
    }
  }

  function init() {
    if (initialized) return;

    cache();

    if (!el.grid || !el.modal) {
      console.warn(
        "Speaking Directions HTML 尚未載入。"
      );
      return;
    }

    el.refresh?.addEventListener("click", load);
    el.cancel?.addEventListener("click", close);
    el.close?.addEventListener("click", close);
    el.transcribe?.addEventListener("click", transcribe);
    el.save?.addEventListener("click", save);

    el.modal.addEventListener("click", (event) => {
      if (event.target === el.modal) {
        close();
      }
    });

    initialized = true;
  }

  return {
    init,
    load,
    open
  };
})();

window.SpeakingDirectionsService =
  SpeakingDirectionsService;

window.SpeakingDirectionsModule =
  SpeakingDirectionsModule;
