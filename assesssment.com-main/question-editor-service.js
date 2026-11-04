"use strict";

const QUESTION_ASSET_BUCKET = "question-assets";

function normalizeQuestionPayload(data) {
  return {
    question_code: data.question_code.trim(),
    section_type: data.section_type,
    question_type: data.question_type,

    title:
      data.title?.trim() || null,

    directions:
      data.directions?.trim() || null,

    passage:
      data.passage?.trim() || null,

    prompt:
      data.prompt?.trim() || null,

    image_url:
      data.image_url || null,

    audio_url:
      data.audio_url || null,

    preparation_time:
      Number(data.preparation_time || 0),

    response_time:
      Number(data.response_time || 0),

    // Writing 共用計時群組
    timer_group:
      data.timer_group?.trim() || null,

    // Writing 共用作答時間
    shared_response_time:
      data.shared_response_time === null ||
      data.shared_response_time === undefined ||
      data.shared_response_time === ""
        ? null
        : Number(data.shared_response_time),

    status:
      data.status
  };
}

async function createQuestion(payload) {
  const { data, error } = await supabaseClient
    .from("question_bank")
    .insert(normalizeQuestionPayload(payload))
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

async function updateQuestion(id, payload) {
  const { data, error } = await supabaseClient
    .from("question_bank")
    .update(normalizeQuestionPayload(payload))
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}


async function findQuestionByCode(questionCode) {
  const code = String(questionCode || "").trim();
  if (!code) return null;

  const { data, error } = await supabaseClient
    .from("question_bank")
    .select("*")
    .eq("question_code", code)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

async function createOrUpdateQuestionByCode(payload) {
  const normalized = normalizeQuestionPayload(payload);
  const existing = await findQuestionByCode(normalized.question_code);

  if (existing?.id) {
    return {
      action: "updated",
      question: await updateQuestion(existing.id, normalized)
    };
  }

  return {
    action: "created",
    question: await createQuestion(normalized)
  };
}

async function deleteQuestion(id) {
  if (!id) {
    throw new Error("缺少題目 ID。");
  }

  // 先檢查是否仍被任何測驗引用，避免直接撞到 FK constraint。
  const { count, error: referenceError } =
    await supabaseClient
      .from("test_questions")
      .select("id", {
        count: "exact",
        head: true
      })
      .eq("question_id", id);

  if (referenceError) {
    throw referenceError;
  }

  if (Number(count || 0) > 0) {
    const error = new Error(
      "此題目目前已被測驗使用，請先到「測驗組卷」將此題移除並儲存，再回題庫刪除。"
    );
    error.code = "QUESTION_IN_USE";
    error.referenceCount = Number(count || 0);
    throw error;
  }

  const { error } = await supabaseClient
    .from("question_bank")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

function sanitizeFileName(name) {
  return name.normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

async function uploadQuestionAsset(file, folder) {
  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
  const { error } = await supabaseClient.storage
    .from(QUESTION_ASSET_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type
    });
  if (error) throw error;
  const { data } = supabaseClient.storage
    .from(QUESTION_ASSET_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}


function getQuestionAssetPathFromUrl(
  publicUrl
) {
  if (!publicUrl) {
    return null;
  }

  try {
    const url =
      new URL(publicUrl);

    const marker =
      `/storage/v1/object/public/${QUESTION_ASSET_BUCKET}/`;

    const markerIndex =
      url.pathname.indexOf(marker);

    if (markerIndex < 0) {
      return null;
    }

    return decodeURIComponent(
      url.pathname.slice(
        markerIndex + marker.length
      )
    );
  } catch (error) {
    return null;
  }
}

async function deleteQuestionAssetByPublicUrl(
  publicUrl
) {
  const path =
    getQuestionAssetPathFromUrl(
      publicUrl
    );

  if (!path) {
    return false;
  }

  const { error } =
    await supabaseClient.storage
      .from(QUESTION_ASSET_BUCKET)
      .remove([path]);

  if (error) {
    console.warn(
      "刪除未使用圖片失敗：",
      error
    );

    return false;
  }

  return true;
}
