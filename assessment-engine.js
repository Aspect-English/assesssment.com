"use strict";

class AssessmentEngine extends EventTarget {
  constructor(options = {}) {
    super();

    this.questions =
      Array.isArray(options.questions)
        ? [...options.questions]
        : [];

    this.currentIndex = -1;
    this.currentQuestion = null;
    this.state = "IDLE";
    this.timerId = null;
    this.isRunning = false;

    this.handlers = {
      beforeQuestion:
        options.beforeQuestion ||
        (async () => {}),
      playPrompt:
        options.playPrompt ||
        (async () => {}),

      startRecording:
        options.startRecording,

      stopRecording:
        options.stopRecording,

      persistResponse:
        options.persistResponse
    };
  }

  emit(name, detail = {}) {
    this.dispatchEvent(
      new CustomEvent(name, { detail })
    );
  }

  setState(state, detail = {}) {
    const previousState = this.state;
    this.state = state;

    this.emit("statechange", {
      state,
      previousState,
      question: this.currentQuestion,
      ...detail
    });
  }

  clearTimer() {
    if (this.timerId) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  countdown(state, seconds) {
    return new Promise((resolve) => {
      this.clearTimer();

      let remaining =
        Math.max(
          0,
          Math.floor(Number(seconds) || 0)
        );

      this.setState(state);

      this.emit("tick", {
        state,
        remainingSeconds: remaining,
        question: this.currentQuestion
      });

      if (remaining === 0) {
        resolve();
        return;
      }

      this.timerId =
        window.setInterval(() => {
          remaining -= 1;

          this.emit("tick", {
            state,
            remainingSeconds: remaining,
            question: this.currentQuestion
          });

          if (remaining <= 0) {
            this.clearTimer();
            resolve();
          }
        }, 1000);
    });
  }

  async start() {
    if (this.isRunning) {
      return;
    }

    if (this.questions.length === 0) {
      throw new Error("沒有可執行的口說題目。");
    }

    this.isRunning = true;
    this.currentIndex = 0;

    await this.runCurrentQuestion();
  }

  async runCurrentQuestion() {
    this.currentQuestion =
      this.questions[this.currentIndex];

    if (!this.currentQuestion) {
      await this.finish();
      return;
    }

    this.emit("questionchange", {
      question: this.currentQuestion,
      currentIndex: this.currentIndex,
      total: this.questions.length
    });

    const question = this.currentQuestion;

    // V5.3.2:
    // 每題正式流程開始前，先等待 Part Direction 播放完成。
    // 這不依賴題目本身是否有 audioRepeatCount，
    // 因此 Read Aloud / Describe Picture 等也能正常播放 Direction。
    await this.handlers.beforeQuestion(
      question,
      this.currentIndex,
      this.questions.length
    );

    // V5.3.5: Part 3 (Q5–Q7) sequential flow.
    // The current question is the only Part 3 question rendered by app.js.
    // For Part 3, play/read the question first, then give the 3-second
    // preparation window. Q6/Q7 are not rendered until the previous
    // response has finished and been saved.
    const isSequentialPart3 =
      Number(question.part) === 3 &&
      question.type === "respond_question";

    const preparationSeconds =
      isSequentialPart3
        ? Math.max(
            0,
            Number(question.preparationSeconds) || 3
          )
        : Math.max(
            0,
            Number(question.preparationSeconds) || 0
          );

    const playPrompt = async () => {
      if (question.audioRepeatCount > 0) {
        this.setState("PROMPT_PLAYBACK");

        for (
          let index = 0;
          index < question.audioRepeatCount;
          index += 1
        ) {
          await this.handlers.playPrompt(
            question,
            index + 1,
            question.audioRepeatCount
          );
        }
      }
    };

    const runPreparation = async () => {
      if (preparationSeconds <= 0) return;

      this.setState("PREPARATION_CUE");

      await playAssessmentVoiceCue(
        "Begin preparing now."
      );

      await this.countdown(
        "PREPARATION",
        preparationSeconds
      );
    };

    if (isSequentialPart3) {
      await playPrompt();
      await runPreparation();
    } else {
      await runPreparation();
      await playPrompt();
    }

    if (question.preResponseDelaySeconds > 0) {
      await this.countdown(
        "PRE_RESPONSE_DELAY",
        question.preResponseDelaySeconds
      );
    }

    this.setState("RESPONSE_CUE");

    await playAssessmentVoiceCue(
      "Begin speaking now."
    );

    await playResponseStartSound();

    this.setState("RECORDING");

    const recordingContext =
      await this.handlers.startRecording(
        question
      );

    await this.countdown(
      "RECORDING",
      question.responseSeconds
    );

    const recordingResult =
      await this.handlers.stopRecording(
        question,
        recordingContext
      );

    await playResponseFinishedSound();

    this.setState("UPLOADING");

    await this.handlers.persistResponse(
      question,
      recordingResult
    );

    this.emit("responsesaved", {
      question,
      result: recordingResult
    });

    this.currentIndex += 1;

    if (
      this.currentIndex >=
      this.questions.length
    ) {
      await this.finish();
      return;
    }

    this.setState("NEXT_QUESTION");

    await this.runCurrentQuestion();
  }

  async finish() {
    this.clearTimer();
    this.isRunning = false;
    this.setState("FINISHED");

    this.emit("finished", {
      total: this.questions.length
    });
  }

  abort(reason = "測驗已中止") {
    this.clearTimer();
    this.isRunning = false;
    this.setState("ABORTED", { reason });
  }
}
