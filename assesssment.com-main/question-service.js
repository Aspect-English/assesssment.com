"use strict";

const QuestionService = {
  async loadByTestId(testId) {
    if (!testId) {
      throw new Error("缺少 testId。");
    }

    const { data, error } =
      await supabaseClient
        .from("test_questions")
        .select(`
          question_order,
          is_required,
          question_bank (
            id,
            question_code,
            section_type,
            question_type,
            title,
            directions,
            passage,
            prompt,
            image_url,
            audio_url,
           preparation_time,
            response_time,
            timer_group,
            shared_response_time,
            status
          )
        `)
        .eq("test_id", testId)
        .order("question_order", {
          ascending: true
        });

    if (error) {
      console.error("讀取測驗題目失敗：", error);
      throw error;
    }

    const questions =
      (Array.isArray(data) ? data : [])
        .filter((row) => {
          return (
            row.question_bank &&
            row.question_bank.status === "active"
          );
        })
        .map((row) => {
          return this.mapQuestion(
            row.question_bank,
            row.question_order,
            row.is_required
          );
        });

    if (questions.length === 0) {
      throw new Error(
        "此測驗目前沒有可使用的題目。"
      );
    }

    return questions;
  },

  mapQuestion(record, order, isRequired) {
    const code =
      record.question_code || "";

    const partMatch =
      code.match(/-P(\d+)-/i);

    const part =
      partMatch
        ? Number(partMatch[1])
        : this.inferPart(
            record.question_type
          );

    const questionType =
      record.question_type;

    return {
      id: record.id,
      order: Number(order),
      code,
      part,
      type: questionType,
      sectionType: record.section_type || "",

      title:
        record.title ||
        this.getDefaultTitle(questionType),

      directions:
        record.directions || "",

      promptText:
        record.prompt ||
        record.passage ||
        "",

      passage:
        record.passage || "",

      informationText:
        questionType ===
        "respond_information"
          ? record.passage || ""
          : "",

      promptImagePath:
        record.image_url || "",

      promptAudioPath:
        record.audio_url || "",

      preparationSeconds:
        Number(
          record.preparation_time || 0
        ),

      responseSeconds:
        Number(
          record.response_time || 0
        ),
      
      timerGroup:
        record.timer_group || "",

      sharedResponseSeconds:
        Number(
          record.shared_response_time || 0
        ),

      // Part 3 / Part 4 已經有各題 Preparation 秒數，
      // 不再額外加第二段 3 秒 Get ready 倒數。
      preResponseDelaySeconds:
        (
          [3, 4].includes(part) &&
          [
            "respond_question",
            "respond_information"
          ].includes(questionType)
        )
          ? 0
          : (
              [
                "respond_question",
                "respond_information"
              ].includes(questionType)
                ? 3
                : 0
            ),

      // Q10 上傳的正式音檔本身已包含兩次朗讀，
      // 因此系統層只播放檔案 1 次，避免變成總共 4 次。
      audioRepeatCount:
        [
          "respond_question",
          "respond_information"
        ].includes(questionType)
          ? 1
          : 0,

      scoreMax:
        Number(order) === 11 ? 5 : 3,

      isRequired:
        isRequired !== false
    };
  },

  inferPart(questionType) {
    const mapping = {
      read_aloud: 1,
      describe_picture: 2,
      respond_question: 3,
      respond_information: 4,
      express_opinion: 5
    };

    return mapping[questionType] || 1;
  },

  getDefaultTitle(questionType) {
    const mapping = {
      read_aloud:
        "Read a text aloud",
      describe_picture:
        "Describe a picture",
      respond_question:
        "Respond to questions",
      respond_information:
        "Respond using information provided",
      express_opinion:
        "Express an opinion"
    };

    return (
      mapping[questionType] ||
      "Speaking Question"
    );
  }
};

async function loadSpeakingAssessmentQuestions() {
  try {
    const test =
      await TestService.getActiveTestByCode();

    const questions =
      await QuestionService.loadByTestId(test.id);

    console.log(
      "已從 Supabase 載入口說題目：",
      {
        test,
        questionCount: questions.length
      }
    );

    return {
      source: "supabase",
      test,
      questions
    };

  } catch (error) {
    console.warn(
      "Supabase 題庫載入失敗，改用本機備援：",
      error
    );

    return {
      source: "local-fallback",
      test: {
        id: null,
        code: "LOCAL-SPEAKING-FALLBACK",
        name: "多益口說完整模擬（本機備援）",
        type: "speaking",
        version: 1
      },
      questions: getSpeakingQuestions()
    };
  }
}

async function loadWritingAssessmentQuestions() {
  try {
    const { data: tests, error: testError } =
      await supabaseClient
        .from("tests")
        .select(
          "id,test_code,test_name,test_type,status,version"
        )
        .eq("test_type", "writing")
        .eq("status", "active")
        .order("version", { ascending: false })
        .limit(1);

    if (testError) {
      throw testError;
    }

    const test = tests?.[0];

    if (!test) {
      throw new Error(
        "目前沒有已啟用的 Writing 測驗。"
      );
    }

    const questions =
      await QuestionService.loadByTestId(test.id);

    const writingQuestions =
      questions.filter(
        (question) =>
          [
            "write_sentence",
            "respond_written_request",
            "opinion_essay"
          ].includes(question.type)
      );

    if (!writingQuestions.length) {
      throw new Error(
        "Writing 測驗目前沒有可執行題目。"
      );
    }

    return {
      source: "supabase",
      test,
      questions: writingQuestions
    };

  } catch (error) {
    console.error(
      "Writing 題庫載入失敗：",
      error
    );
    throw error;
  }
}


async function loadFullAssessmentQuestions() {
  const { data: tests, error: testError } =
    await supabaseClient
      .from("tests")
      .select("id,test_code,test_name,test_type,status,version,updated_at")
      .eq("test_type", "full")
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(1);

  if (testError) throw testError;

  const test = tests?.[0];
  if (!test) {
    throw new Error("目前沒有已啟用的口說寫作完整模擬測驗。");
  }

  const questions = await QuestionService.loadByTestId(test.id);
  const speakingQuestions = questions.filter(q => q.sectionType === "speaking");
  const writingQuestions = questions.filter(q => q.sectionType === "writing");

  if (!speakingQuestions.length) {
    throw new Error("完整模擬測驗中沒有可執行的 Speaking 題目。");
  }
  if (!writingQuestions.length) {
    throw new Error("完整模擬測驗中沒有可執行的 Writing 題目。");
  }

  return { source: "supabase-full", test, questions, speakingQuestions, writingQuestions };
}

window.loadFullAssessmentQuestions = loadFullAssessmentQuestions;
async function loadQuickAssessmentQuestions() {
  const { data: tests, error } = await supabaseClient.from("tests")
    .select("id,test_code,test_name,test_type,status,version,updated_at")
    .eq("test_type", "quick").eq("status", "active")
    .order("updated_at", { ascending: false }).limit(1);
  if (error) throw error;
  const test = tests?.[0];
  if (!test) throw new Error("目前沒有已發布的口說寫作快速程度檢測，請先至老師後台建立並發布。");
  const questions = await QuestionService.loadByTestId(test.id);
  const speakingTypes = new Set(["read_aloud", "describe_picture", "respond_question", "respond_information", "express_opinion"]);
  const writingTypes = new Set(["write_sentence", "respond_written_request", "opinion_essay"]);
  const speakingQuestions = questions.filter(q => speakingTypes.has(q.type));
  const writingQuestions = questions.filter(q => writingTypes.has(q.type));
  if (!speakingQuestions.length || !writingQuestions.length) {
    throw new Error("快速程度檢測必須同時包含至少一道口說題與一道寫作題。");
  }
  return { source: "supabase-quick", test, questions, speakingQuestions, writingQuestions };
}
window.loadQuickAssessmentQuestions = loadQuickAssessmentQuestions;




async function loadSpeakingDirections() {
  const { data, error } =
    await supabaseClient
      .from("speaking_directions")
      .select(
        "part_number,title,directions_text,audio_url,status"
      )
      .order("part_number", {
        ascending: true
      });

  if (error) {
    console.error(
      "Speaking Directions 載入失敗：",
      error
    );

    throw new Error(
      `Speaking Directions 無法讀取：${error.message}`
    );
  }

  // 相容後台可能儲存 Active / active。
  return (data || []).filter(
    (row) =>
      String(row.status || "")
        .trim()
        .toLowerCase() === "active"
  );
}

window.loadSpeakingDirections =
  loadSpeakingDirections;


async function loadWritingDirections() {
  const { data, error } = await supabaseClient.from("writing_directions")
    .select("part_number,title,directions_text,status").order("part_number", { ascending: true });
  if (error) throw error;
  return (data || []).filter(row => String(row.status || "").trim().toLowerCase() === "active");
}
