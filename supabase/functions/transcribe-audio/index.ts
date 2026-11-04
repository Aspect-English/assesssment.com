import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

function cleanText(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
}

function limitText(value: string, max = 5000) {
  if (value.length <= max) return value;
  return value.slice(0, max);
}

function buildTranscriptionPrompt(question: any) {
  if (!question) return "";

  const questionType = cleanText(question.question_type);
  const title = cleanText(question.title);
  const directions = cleanText(question.directions);
  const passage = cleanText(question.passage);
  const prompt = cleanText(question.prompt);

  const contextParts: string[] = [];

  if (title) {
    contextParts.push(`Title: ${title}`);
  }

  if (questionType) {
    contextParts.push(`Question type: ${questionType}`);
  }

  // Read Aloud 最重要的是 passage。
  if (questionType === "read_aloud") {
    if (passage) {
      contextParts.push(`Reference passage: ${passage}`);
    }
  } else {
    // 其他題型依實際存在的資料提供情境。
    if (directions) {
      contextParts.push(`Directions: ${directions}`);
    }

    if (passage) {
      contextParts.push(`Situation / provided information: ${passage}`);
    }

    if (prompt) {
      contextParts.push(`Question / prompt: ${prompt}`);
    }
  }

  if (!contextParts.length) return "";

  const instruction = `
Strict verbatim transcription of a TOEIC student's spoken English.
Transcribe ALL audible words in chronological order, including repeated words,
repeated phrases, fillers (um, uh), hesitations, false starts, incomplete phrases,
and self-corrections. Never collapse repetitions, even if identical.
For example, if the speaker says "is tapping, is tapping", write both occurrences.
If the speaker says "is writing something on" twice, write it twice.
Preserve nonstandard grammar verbatim, such as "they may discussing".
Do not rewrite grammar, paraphrase, summarize, or insert missing words.
Pay special attention to the final seconds; do not omit an audible ending.
Only write words that are actually audible; never infer words from the question.
${questionType === "read_aloud" && passage ? `Potential vocabulary only (not a script to copy): ${passage}` : ""}
`;

  return limitText(
    instruction.replace(/\n[ \t]+/g, "\n").trim(),
    6000,
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return json(
      { error: "Method not allowed" },
      405,
    );
  }

  try {
    console.log("STEP 1: request received");

    const openaiKey =
      Deno.env.get("OPENAI_API_KEY");

    if (!openaiKey) {
      throw new Error(
        "OPENAI_API_KEY 尚未設定",
      );
    }

    const body = await req.json();

    const responseId = body?.responseId;
    const legacyAudioUrl = body?.audioUrl;

    console.log(
      "STEP 2: responseId =",
      responseId,
    );

    let audioBlob: Blob;
    let filename = "recording.webm";

    let responseRecord: any = null;
    let questionRecord: any = null;

    let userId: string | null = null;
    let admin: any = null;

    if (responseId) {
      const url =
        Deno.env.get("SUPABASE_URL");

      const anon =
        Deno.env.get(
          "SUPABASE_ANON_KEY",
        );

      const service =
        Deno.env.get(
          "SUPABASE_SERVICE_ROLE_KEY",
        );

      if (!url || !anon || !service) {
        throw new Error(
          "Supabase server secrets are incomplete.",
        );
      }

      const authHeader =
        req.headers.get(
          "Authorization",
        ) || "";

      const userClient =
        createClient(url, anon, {
          global: {
            headers: {
              Authorization:
                authHeader,
            },
          },
        });

      admin =
        createClient(url, service);

      const {
        data: userData,
        error: userError,
      } =
        await userClient.auth.getUser();

      if (userError) {
        console.error(
          "AUTH ERROR:",
          userError,
        );
      }

      if (!userData.user) {
        return json(
          {
            error:
              "Authentication required.",
          },
          401,
        );
      }

      userId = userData.user.id;

      console.log(
        "STEP 3: authenticated user =",
        userId,
      );

      const {
        data: profile,
        error: profileError,
      } =
        await admin
          .from("profiles")
          .select(
            "id,role,status",
          )
          .eq("id", userId)
          .single();

      if (profileError) {
        throw profileError;
      }

      if (
        !profile ||
        profile.status !== "active" ||
        !["teacher", "admin"].includes(
          profile.role,
        )
      ) {
        return json(
          {
            error:
              "Teacher access required.",
          },
          403,
        );
      }

      console.log(
        "STEP 4: teacher verified",
      );

      const {
        data: record,
        error: recordError,
      } =
        await admin
          .from("responses")
          .select(
            `
            id,
            session_id,
            question_id,
            question_order,
            recording_bucket,
            recording_path,
            mime_type
          `,
          )
          .eq("id", responseId)
          .single();

      if (recordError) {
        throw recordError;
      }

      if (!record) {
        return json(
          {
            error:
              "Response record not found.",
          },
          404,
        );
      }

      if (!record.recording_path) {
        return json(
          {
            error:
              "此作答沒有可轉錄的錄音檔。",
          },
          400,
        );
      }

      responseRecord = record;

      console.log(
        "STEP 5: response record found",
      );

      // V5.9.0：
      // 用 responses.question_id 尋找 question_bank，
      // 取得題目內容作為 speech recognition context。
      if (record.question_id) {
        const {
          data: question,
          error: questionError,
        } =
          await admin
            .from("question_bank")
            .select(
              `
              id,
              question_code,
              section_type,
              question_type,
              title,
              directions,
              passage,
              prompt
            `,
            )
            .eq("id", record.question_id)
            .maybeSingle();

        if (questionError) {
          // 題目 context 不是轉錄必要條件，
          // 查詢失敗仍繼續使用純音檔轉錄。
          console.warn(
            "QUESTION CONTEXT WARNING:",
            questionError.message,
          );
        } else if (question) {
          questionRecord = question;

          console.log(
            "STEP 5A: question context found =",
            question.question_code,
            question.question_type,
          );
        } else {
          console.warn(
            "STEP 5A: no question_bank row found",
          );
        }
      }

      const bucket =
        record.recording_bucket ||
        "speaking-recordings";

      const {
        data: audio,
        error: audioError,
      } =
        await admin.storage
          .from(bucket)
          .download(
            record.recording_path,
          );

      if (audioError || !audio) {
        throw new Error(
          audioError?.message ||
            "Unable to download recording.",
        );
      }

      audioBlob = audio;

      if (audioBlob.size < 1000) {
        throw new Error("錄音檔過小，請確認學生錄音是否完整上傳。");
      }

      console.log(
        "STEP 6: audio downloaded",
        audioBlob.size,
      );

      const extension =
        record.mime_type?.includes(
          "mp4",
        )
          ? "m4a"
          : record.mime_type?.includes(
                "mpeg",
              )
            ? "mp3"
            : record.mime_type?.includes(
                  "wav",
                )
              ? "wav"
              : "webm";

      filename =
        `student-response.${extension}`;
    } else if (legacyAudioUrl) {
      const audioResponse =
        await fetch(legacyAudioUrl);

      if (!audioResponse.ok) {
        throw new Error(
          "無法下載題目音檔",
        );
      }

      audioBlob =
        await audioResponse.blob();

      filename =
        "question-audio.mp3";
    } else {
      throw new Error(
        "缺少 responseId 或 audioUrl",
      );
    }

    if (audioBlob.size > 25 * 1024 * 1024) {
      throw new Error("錄音檔超過 25 MB，請先壓縮或分段處理。");
    }

    const transcriptionModel =
      Deno.env.get(
        "OPENAI_TRANSCRIPTION_MODEL",
      ) ||
      "gpt-4o-transcribe";

    console.log(
      "STEP 7: calling OpenAI",
      transcriptionModel,
    );

    const form =
      new FormData();

    form.append(
      "file",
      new File(
        [audioBlob],
        filename,
        {
          type:
            audioBlob.type ||
            "audio/webm",
        },
      ),
    );

    form.append(
      "model",
      transcriptionModel,
    );

    form.append(
      "language",
      "en",
    );

    const transcriptionPrompt =
      buildTranscriptionPrompt(questionRecord) ||
      `Strict verbatim English transcription. Preserve every audible repetition, filler, false start, and grammatical error. Never merge repeated phrases or omit audible final words. Do not invent words.`;

    if (transcriptionPrompt) {
      form.append(
        "prompt",
        transcriptionPrompt,
      );

      console.log(
        "STEP 7A: question-aware prompt attached",
        {
          questionCode:
            questionRecord?.question_code,
          questionType:
            questionRecord?.question_type,
          promptLength:
            transcriptionPrompt.length,
        },
      );
    } else {
      console.log(
        "STEP 7A: no question context; using audio only",
      );
    }

    const response =
      await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${openaiKey}`,
          },
          body: form,
        },
      );

    const result =
      await response.json();

    console.log(
      "STEP 8: OpenAI status =",
      response.status,
    );

    if (!response.ok) {
      throw new Error(
        result?.error?.message ||
          "轉錄 API 發生錯誤",
      );
    }

    const transcript =
      String(
        result?.text || "",
      ).trim();

    console.log(
      "STEP 9: transcript length =",
      transcript.length,
    );

    if (!transcript) {
      throw new Error(
        "轉錄結果為空白",
      );
    }

    // 若要啟用二次辨識，設定環境變數 TRANSCRIPTION_SECOND_PASS=true。
    // 第二次採不含題目提示的辨識，僅供老師比對，不自動合併或改寫學生原話。
    let verificationTranscript: string | null = null;
    let verificationWarning: string | null = null;
    if (responseRecord && Deno.env.get("TRANSCRIPTION_SECOND_PASS") === "true") {
      console.log("STRICT VERBATIM: second pass started");
      try {
        const verificationForm = new FormData();
        verificationForm.append("file", new File([audioBlob], filename, { type: audioBlob.type || "audio/webm" }));
        verificationForm.append("model", transcriptionModel);
        verificationForm.append("language", "en");
        const verificationResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${openaiKey}` },
          body: verificationForm,
        });
        const verificationResult = await verificationResponse.json();
        if (!verificationResponse.ok) throw new Error(verificationResult?.error?.message || "Second pass failed");
        verificationTranscript = String(verificationResult?.text || "").trim() || null;
        console.log("STRICT VERBATIM: second pass completed", verificationTranscript?.length || 0);
        if (verificationTranscript && verificationTranscript !== transcript) {
          verificationWarning = "兩次辨識結果不同，請老師播放原始錄音核對。";
        }
      } catch (verificationError) {
        console.warn("SECOND PASS WARNING:", verificationError);
        verificationWarning = "第二次辨識未成功；已保留第一次結果。";
      }
    }

    let assessment = null;

    if (
      responseRecord &&
      admin &&
      userId
    ) {
      const {
        data: saved,
        error: saveError,
      } =
        await admin
          .from(
            "ai_assessments",
          )
          .upsert(
            {
              session_id:
                responseRecord.session_id,

              response_id:
                responseRecord.id,

              question_id:
                responseRecord.question_id,

              question_order:
                responseRecord.question_order,

              transcript,

              transcription_model:
                transcriptionModel,

              requested_by:
                userId,

              error_message:
                null,
            },
            {
              onConflict:
                "response_id",
            },
          )
          .select("*")
          .single();

      if (saveError) {
        throw saveError;
      }

      assessment = saved;

      console.log(
        "STEP 10: transcript saved",
      );
    }

    return json({
      text: transcript,
      transcript,
      assessment,
      verificationTranscript,
      verificationWarning,
      transcriptionMode: "strict_verbatim",

      // 方便我們測試 V5.9.0 是否真的抓到題目 context。
      contextUsed:
        Boolean(questionRecord),

      questionCode:
        questionRecord?.question_code ||
        null,

      questionType:
        questionRecord?.question_type ||
        null,
    });
  } catch (error) {
    console.error(
      "TRANSCRIBE ERROR:",
      error,
    );

    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      400,
    );
  }
});