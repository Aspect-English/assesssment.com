"use strict";

const TestBuilderService = {
  async createTest(payload) {
    const record = {
      test_code: payload.test_code.trim(),
      test_name: payload.test_name.trim(),
      test_type: payload.test_type || "speaking",
      description: payload.description.trim() || null,
      version: Number(payload.version || 1),
      status: "draft"
    };
    const { data, error } = await supabaseClient.from("tests").insert(record).select("*").single();
    if (error) throw error;
    return data;
  },

  async updateTest(id, payload) {
    const record = {
      test_code: payload.test_code.trim(),
      test_name: payload.test_name.trim(),
      test_type: payload.test_type || "speaking",
      description: payload.description.trim() || null,
      version: Number(payload.version || 1)
    };
    const { data, error } = await supabaseClient.from("tests").update(record).eq("id", id).select("*").single();
    if (error) throw error;
    return data;
  },

  async getQuestionIds(testId) {
    const { data, error } = await supabaseClient.from("test_questions")
      .select("question_id,question_order")
      .eq("test_id", testId)
      .order("question_order", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async saveQuestions(testId, questionIds) {
    const { error: deleteError } = await supabaseClient.from("test_questions").delete().eq("test_id", testId);
    if (deleteError) throw deleteError;
    if (!questionIds.length) return [];
    const rows = questionIds.map((questionId, index) => ({
      test_id: testId,
      question_id: questionId,
      question_order: index + 1,
      is_required: true
    }));
    const { data, error } = await supabaseClient.from("test_questions").insert(rows).select("*");
    if (error) throw error;
    return data || [];
  },

  validate(test, questions) {
    const errors = [];
    const warnings = [];

    if (!test.test_name || !test.test_code) {
      errors.push("測驗名稱與代碼不可空白。");
    }

    if (!questions.length) {
      errors.push("測驗至少需要加入 1 題。");
    }

    const ids = questions.map((q) => q.id);
    if (new Set(ids).size !== ids.length) {
      errors.push("試卷中有重複題目。");
    }

    const codes = questions.map((q) => q.question_code);
    if (new Set(codes).size !== codes.length) {
      errors.push("試卷中有重複的題目代碼。");
    }

    const part4Questions = questions.filter(
      (q) =>
        q.section_type === "speaking" &&
        q.question_type === "respond_information"
    );

    // Part 4 現在是 Q8–Q10 題組，不再用舊的「單題必須有文字內容」規則。
    if (part4Questions.length) {
      if (part4Questions.length !== 3) {
        errors.push(
          `Part 4 題組需要完整加入 Q8、Q9、Q10，目前只有 ${part4Questions.length} 題。`
        );
      }

      const expected = [8, 9, 10];
      expected.forEach((number, offset) => {
        const q =
          part4Questions.find((item) => {
            const code = String(item.question_code || "");
            return new RegExp(`-Q0?${number}$`, "i").test(code);
          }) ||
          part4Questions[offset];

        if (!q) {
          errors.push(`Part 4 缺少 Question ${number}。`);
          return;
        }

        const label = `Part 4 Question ${number}（${q.question_code || "未命名"}）`;

        if (q.status !== "active") {
          errors.push(`${label}尚未啟用。`);
        }

        if (!q.image_url) {
          errors.push(`${label}缺少共用 Information 圖片。`);
        }

        // 正式 Part 4 問題以音檔呈現，Question/Prompt 文字可留白。
        if (!q.audio_url) {
          errors.push(`${label}缺少題目音檔。`);
        }

        if (Number(q.response_time || 0) <= 0) {
          errors.push(`${label}回答時間未設定。`);
        }

        if (Number(q.preparation_time || 0) < 0) {
          errors.push(`${label}準備時間不可小於 0。`);
        }
      });

      const sharedAudioPresent = part4Questions.some((q) =>
        /P4_INFO_AUDIO_URL\s*=\s*\S+/i.test(String(q.directions || ""))
      );

      if (!sharedAudioPresent) {
        warnings.push(
          "Part 4 尚未設定共用 Information 音檔；此欄位為選填，如不需要可忽略。"
        );
      }
    }

    questions.forEach((q, index) => {
      const label = `第 ${index + 1} 題（${q.question_code || "未命名"}）`;

      const isPart4 =
        q.section_type === "speaking" &&
        q.question_type === "respond_information";

      // Part 4 已由上方題組規則統一檢查，避免重複或使用舊單題規則。
      if (isPart4) return;

      if (q.status !== "active") {
        errors.push(`${label}尚未啟用。`);
      }

      if (!q.title && !q.prompt && !q.passage) {
        errors.push(`${label}沒有題目內容。`);
      }

      // Writing 使用共用計時，不檢查單題 response_time
      if (q.section_type === "writing") {
        const timerGroup =
          String(q.timer_group || "").trim();

        const sharedResponseTime =
          Number(q.shared_response_time || 0);

        if (!timerGroup) {
          errors.push(
            `${label}共用計時群組未設定。`
          );
        }

        if (sharedResponseTime <= 0) {
          errors.push(
            `${label}共用作答時間未設定。`
          );
        }
      } else {
        if (Number(q.response_time || 0) <= 0) {
          errors.push(
            `${label}回答時間未設定。`
          );
        }
      }

      if (Number(q.preparation_time || 0) < 0) {
        errors.push(`${label}準備時間不可小於 0。`);
      }

      if (q.question_type === "describe_picture" && !q.image_url) {
        warnings.push(`${label}為圖片描述題，但尚未設定圖片。`);
      }

      if (
        q.question_type === "respond_question" &&
        !q.audio_url
      ) {
        warnings.push(`${label}沒有題目音檔，請確認是否由系統語音或現場播放。`);
      }

      if (q.question_type === "express_opinion" && !q.prompt) {
        warnings.push(`${label}為意見題，但 Prompt 為空白。`);
      }
    });

    return {
      errors: [...new Set(errors)],
      warnings: [...new Set(warnings)]
    };
  },

  async getSessionCount(testId) {
    const { count, error } =
      await supabaseClient
        .from("test_sessions")
        .select("id", {
          count: "exact",
          head: true
        })
        .eq("test_id", testId);

    if (error) {
      throw new Error(
        `無法檢查學生作答紀錄：${error.message}`
      );
    }

    return Number(count || 0);
  },

  async deactivateTest(testId) {
    const { data, error } =
      await supabaseClient
        .from("tests")
        .update({
          status: "inactive"
        })
        .eq("id", testId)
        .select("*")
        .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async deleteTestSafely(testId) {
    if (!testId) {
      throw new Error("缺少 testId。");
    }

    const sessionCount =
      await this.getSessionCount(testId);

    if (sessionCount > 0) {
      const test =
        await this.deactivateTest(
          testId
        );

      return {
        action: "deactivated",
        sessionCount,
        test
      };
    }

    const { error: mappingError } =
      await supabaseClient
        .from("test_questions")
        .delete()
        .eq("test_id", testId);

    if (mappingError) {
      throw mappingError;
    }

    const { error: testError } =
      await supabaseClient
        .from("tests")
        .delete()
        .eq("id", testId);

    if (testError) {
      throw testError;
    }

    return {
      action: "deleted",
      sessionCount: 0
    };
  },

  async publishTest(testId) {
    const { data, error } = await supabaseClient
      .rpc("publish_test_atomic", {
        target_test_id: testId
      });

    if (error) throw error;
    return data;
  }
};

window.TestBuilderService = TestBuilderService;
