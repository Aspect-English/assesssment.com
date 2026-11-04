"use strict";

const instructionsTitle =
  document.getElementById("instructionsTitle");

const instructionList =
  document.getElementById("instructionList");

const pages = {
  start: document.getElementById("startPage"),
  speaker: document.getElementById("speakerPage"),
  microphone: document.getElementById("microphonePage"),
  ready: document.getElementById("readyPage"),
  instructions: document.getElementById("instructionsPage"),

  speaking: document.getElementById("speakingPage"),

  // TOEIC Writing
  writingStart: document.getElementById("writingStartPage"),
  writingDirectionsPage: document.getElementById("writingDirectionsPage"),
  writing: document.getElementById("writingPage"),

  completed: document.getElementById("completedPage")
};

const studentNameInput =
  document.getElementById("studentName");

const testTypeSelect =
  document.getElementById("testType");

const startButton =
  document.getElementById("startButton");

const startError =
  document.getElementById("startError");

const playSpeakerTestButton =
  document.getElementById("playSpeakerTestButton");

const speakerPassButton =
  document.getElementById("speakerPassButton");

const speakerRetryButton =
  document.getElementById("speakerRetryButton");

const speakerStatus =
  document.getElementById("speakerStatus");

const deviceHelpBackdrop =
  document.getElementById(
    "deviceHelpBackdrop"
  );

const deviceHelpTitle =
  document.getElementById(
    "deviceHelpTitle"
  );

const deviceHelpSubtitle =
  document.getElementById(
    "deviceHelpSubtitle"
  );

const deviceHelpSteps =
  document.getElementById(
    "deviceHelpSteps"
  );

const detectedMicrophoneName =
  document.getElementById(
    "detectedMicrophoneName"
  );

const closeDeviceHelpButton =
  document.getElementById(
    "closeDeviceHelpButton"
  );

const deviceHelpCancelButton =
  document.getElementById(
    "deviceHelpCancelButton"
  );

const retryDeviceTestButton =
  document.getElementById(
    "retryDeviceTestButton"
  );

const writingNextButton =
  document.getElementById("writingNextButton");

let currentDeviceHelpType = null;


const startRecordingButton =
  document.getElementById("startRecordingButton");

const recordAgainButton =
  document.getElementById("recordAgainButton");

const microphonePassButton =
  document.getElementById("microphonePassButton");

const microphoneError =
  document.getElementById("microphoneError");

const microphoneHelpButton =
  document.getElementById(
    "microphoneHelpButton"
  );


const recordingPlayback =
  document.getElementById("recordingPlayback");

const recordingIndicator =
  document.getElementById("recordingIndicator");

const recordingText =
  document.getElementById("recordingText");

const volumeBar =
  document.getElementById("volumeBar");

const volumeText =
  document.getElementById("volumeText");

const summaryName =
  document.getElementById("summaryName");

const summaryTestId =
  document.getElementById("summaryTestId");

const summaryTestType =
  document.getElementById("summaryTestType");

const continueButton =
  document.getElementById("continueButton");

const playDirectionButton =
  document.getElementById("playDirectionButton");

const directionStatus =
  document.getElementById("directionStatus");

const beginTestButton =
  document.getElementById("beginTestButton");

const assessmentQuestionCounter =
  document.getElementById("assessmentQuestionCounter");

const assessmentPartLabel =
  document.getElementById("assessmentPartLabel");

const assessmentQuestionType =
  document.getElementById("assessmentQuestionType");

const assessmentPromptArea =
  document.getElementById("assessmentPromptArea");

const assessmentPromptText =
  document.getElementById("assessmentPromptText");

const assessmentPromptImage =
  document.getElementById("assessmentPromptImage");

const assessmentAudioPrompt =
  document.getElementById("assessmentAudioPrompt");

const assessmentAudioStatus =
  document.getElementById("assessmentAudioStatus");

const assessmentInformationCard =
  document.getElementById("assessmentInformationCard");

const preparationTimerCard =
  document.getElementById("preparationTimerCard");

const responseTimerCard =
  document.getElementById("responseTimerCard");

const preparationTimerValue =
  document.getElementById("preparationTimerValue");

const responseTimerValue =
  document.getElementById("responseTimerValue");

const assessmentStageText =
  document.getElementById("assessmentStageText");

const assessmentRecordingDot =
  document.getElementById("assessmentRecordingDot");

const assessmentProgressValue =
  document.getElementById("assessmentProgressValue");

const stageLabel =
  document.getElementById("stageLabel");

const questionTimer =
  document.getElementById("questionTimer");

const questionStatus =
  document.getElementById("questionStatus");

const formalRecordingIndicator =
  document.getElementById("formalRecordingIndicator");

const formalRecordingText =
  document.getElementById("formalRecordingText");

const completedStudentName =
  document.getElementById("completedStudentName");

const completedTestId =
  document.getElementById("completedTestId");

const completedRecordingStatus =
  document.getElementById("completedRecordingStatus");

const finalRecordingPlayback =
  document.getElementById("finalRecordingPlayback");

const restartTestButton =
  document.getElementById("restartTestButton");

// ========================================
// TOEIC Writing DOM
// ========================================

const writingQuestionCounter =
  document.getElementById("writingQuestionCounter");

const writingMainTimer =
  document.getElementById("writingMainTimer");

const writingDirections =
  document.getElementById("writingDirections");

const writingStartContinueButton = document.getElementById("writingStartContinueButton");
const writingDirectionsContinueButton = document.getElementById("writingDirectionsContinueButton");
const writingDirectionsContinueButtonBottom = document.getElementById("writingDirectionsContinueButtonBottom");
const writingDirectionsScreenTitle = document.getElementById("writingDirectionsScreenTitle");
const writingDirectionsScreenText = document.getElementById("writingDirectionsScreenText");

let writingPartDirections = {};
let pendingWritingPartIndex = 0;

const writingQuestionContent =
  document.getElementById("writingQuestionContent");

const writingQuestionImage =
  document.getElementById("writingQuestionImage");

const writingAnswer =
  document.getElementById("writingAnswer");

const writingCutButton =
  document.getElementById("writingCutButton");

const writingPasteButton =
  document.getElementById("writingPasteButton");

const writingUndoButton =
  document.getElementById("writingUndoButton");

const writingRedoButton =
  document.getElementById("writingRedoButton");

const writingWordCountToggle =
  document.getElementById("writingWordCountToggle");

const writingWordCount =
  document.getElementById("writingWordCount");

const writingSecurityNotice =
  document.getElementById(
    "writingSecurityNotice"
  );

let writingSecurityActive = false;
let writingFocusViolationCount = 0;

// V5.5.2 — 正式測驗防切換模式
let assessmentSecurityActive = false;
let assessmentSecurityTerminating = false;
let assessmentFullscreenEntered = false;
let assessmentSecurityArmedAt = 0;

const testData = {
  studentName: "",
  testType: "",
  testTypeText: "",
  testId: "",
  startedAt: null,
  sessionId: null
};

let mediaRecorder = null;
let mediaStream = null;
let recordedChunks = [];
let audioContext = null;
let analyser = null;
let animationFrameId = null;
let recordingTimer = null;
let questionCountdownInterval = null;
let formalRecordingBlob = null;
let formalRecordingUrl = null;
let formalRecordingStartedAt = null;
let formalRecordingDuration = 0;

const demoQuestion = {
  preparationTime: 5,
  responseTime: 10
};

const SPEECH_RECORDING_BITRATE =
  128000;

function getSpeechAudioConstraints() {
  return {
    channelCount: {
      ideal: 1
    },
    sampleRate: {
      ideal: 48000
    },
    sampleSize: {
      ideal: 16
    },
    echoCancellation: {
      ideal: true
    },
    noiseSuppression: {
      ideal: true
    },
    autoGainControl: {
      ideal: true
    },
    latency: {
      ideal: 0.01
    }
  };
}

function createSpeechMediaRecorder(
  stream,
  mimeType = ""
) {
  const options = {
    audioBitsPerSecond:
      SPEECH_RECORDING_BITRATE
  };

  if (mimeType) {
    options.mimeType = mimeType;
  }

  try {
    return new MediaRecorder(
      stream,
      options
    );
  } catch (error) {
    console.warn(
      "瀏覽器不支援高品質錄音設定，改用相容模式：",
      error
    );

    return mimeType
      ? new MediaRecorder(
          stream,
          { mimeType }
        )
      : new MediaRecorder(stream);
  }
}



/**
 * 切換頁面
 */
function showPage(pageName) {
  Object.values(pages).forEach((page) => {
    page.classList.remove("active");
  });

  pages[pageName].classList.add("active");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/**
 * 產生測驗編號
 * 範例：SW-20260717-163501-482
 */
function generateTestId() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  const hour = String(
    now.getHours()
  ).padStart(2, "0");

  const minute = String(
    now.getMinutes()
  ).padStart(2, "0");

  const second = String(
    now.getSeconds()
  ).padStart(2, "0");

  const randomNumber = Math.floor(
    100 + Math.random() * 900
  );

  return (
    `SW-${year}${month}${day}-` +
    `${hour}${minute}${second}-` +
    `${randomNumber}`
  );
}


/**
 * 首頁：進入設備測試
 */
startButton.addEventListener("click", async () => {
  const studentName =
    studentNameInput.value.trim();

  const testType =
    testTypeSelect.value;

  if (!studentName) {
    startError.textContent = "請輸入學生姓名。";
    studentNameInput.focus();
    return;
  }

  if (!testType) {
    startError.textContent = "請選擇測驗類型。";
    testTypeSelect.focus();
    return;
  }

  startError.textContent = "";

  testData.studentName = studentName;
  testData.testType = testType;

  testData.testTypeText =
    testTypeSelect.options[
      testTypeSelect.selectedIndex
    ].text;

testData.testId = generateTestId();
testData.startedAt = new Date().toISOString();

console.log("本次測驗資料：", testData);

startButton.disabled = true;
startButton.textContent = "正在建立測驗……";

try {
  const session = await createTestSession(
    testData,
    1
  );

  testData.sessionId = session.id;

  console.log(
    "Supabase Session ID：",
    testData.sessionId
  );

  // 依測驗類型決定下一個流程
if (testData.testType === "writing") {
  // 純寫作不需要麥克風測試
  summaryName.textContent =
    testData.studentName;

  summaryTestId.textContent =
    testData.testId;

  summaryTestType.textContent =
    testData.testTypeText;

  showPage("ready");
} else {
  // Speaking / Full / Quick：進入耳機測試後自動播放
  try {
    unlockAssessmentAudio();
  } catch (error) {
    console.warn("音訊解鎖失敗：", error);
  }

  showPage("speaker");

  window.setTimeout(
    () => playSpeakerTestAudio({
      isAutomatic: true
    }),
    120
  );
}

} catch (error) {
  console.error("無法建立測驗：", error);

  startError.textContent =
    "目前無法建立測驗，請確認網路連線後再試一次。";

} finally {
  startButton.disabled = false;
  startButton.textContent = "進入設備測試";
}
});


const deviceHelpContent = {
  speaker: {
    title: "聽不到測試聲音",
    subtitle:
      "請先確認耳機、喇叭與 Windows 音訊輸出設定。",
    steps: [
      "確認耳機或喇叭已正確連接，且裝置沒有靜音。",
      "點擊 Windows 工作列右下角的喇叭圖示，將音量調高。",
      "點擊喇叭圖示旁的輸出裝置選單，選擇目前使用的耳機或喇叭。",
      "若使用藍牙耳機，請確認已連線且電量充足。",
      "關閉其他正在播放聲音的程式，再回來重新測試。"
    ]
  },

  microphone: {
    title: "麥克風沒有聲音",
    subtitle:
      "請確認瀏覽器權限、麥克風選擇與裝置連線。",
    steps: [
      "確認麥克風或耳機已正確連接，且實體靜音鍵沒有開啟。",
      "查看網址列左側的鎖頭或網站設定圖示，將「麥克風」設為允許。",
      "到 Windows 設定 → 系統 → 音效 → 輸入，選擇目前使用的麥克風。",
      "對著麥克風說話，確認 Windows 的輸入音量指示條會移動。",
      "若仍無聲音，拔除並重新連接裝置，或重新啟動藍牙耳機。"
    ]
  }
};


async function detectAudioDevices() {
  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.enumerateDevices
  ) {
    detectedMicrophoneName.textContent =
      "瀏覽器無法列出音訊裝置。";

    return;
  }

  try {
    const devices =
      await navigator.mediaDevices
        .enumerateDevices();

    const microphones =
      devices.filter(
        (device) =>
          device.kind === "audioinput"
      );

    detectedMicrophoneName.textContent =
      microphones.length
        ? microphones
            .map(
              (device, index) =>
                device.label ||
                `麥克風 ${index + 1}`
            )
            .join("、")
        : "未偵測到麥克風，請確認裝置已連接。";

  } catch (error) {
    console.warn(
      "無法取得音訊裝置清單：",
      error
    );

    detectedMicrophoneName.textContent =
      "無法取得裝置資訊，請先允許麥克風權限。";
  }
}


async function openDeviceHelp(type) {
  const content =
    deviceHelpContent[type];

  if (!content) {
    return;
  }

  currentDeviceHelpType = type;

  deviceHelpTitle.textContent =
    content.title;

  deviceHelpSubtitle.textContent =
    content.subtitle;

  deviceHelpSteps.innerHTML =
    content.steps
      .map(
        (step) =>
          `<li>${step}</li>`
      )
      .join("");

  deviceHelpBackdrop.classList.remove(
    "hidden"
  );

  document.body.classList.add(
    "device-help-open"
  );

  await detectAudioDevices();
}


function closeDeviceHelp() {
  deviceHelpBackdrop.classList.add(
    "hidden"
  );

  document.body.classList.remove(
    "device-help-open"
  );
}


/**
 * 播放聲音測試
 *
 * 第一版先使用瀏覽器英文語音。
 * 後續會改成你們自己的 Direction 音檔。
 */
let speakerTestLoopActive = false;

function stopSpeakerTestAudioLoop() {
  speakerTestLoopActive = false;
  try { window.speechSynthesis?.cancel(); } catch (error) {}
}

function playSpeakerTestAudio({
  isAutomatic = false
} = {}) {
  speakerTestLoopActive = true;
  if (!("speechSynthesis" in window)) {
    speakerStatus.textContent =
      "目前瀏覽器無法播放測試語音。";

    playSpeakerTestButton.classList.remove(
      "hidden"
    );
    return;
  }

  window.speechSynthesis.cancel();

  const message =
    new SpeechSynthesisUtterance(
      "Welcome to the speaking and writing placement test. " +
      "Please adjust your headset volume to a comfortable level."
    );

  message.lang = "en-US";
  message.rate = 0.9;
  message.volume = 1;

  message.onstart = () => {
    speakerStatus.textContent =
      "正在自動播放測試聲音……";

    // V5.0.4：聲音一開始播放就允許學生確認。
    // 循環播放不應把「聽得清楚，下一步」鎖住，
    // 否則 PWA 的 speechSynthesis 若長時間不觸發 onend，
    // 學生會永遠無法進入下一步。
    speakerPassButton.disabled = false;

    playSpeakerTestButton.classList.add(
      "hidden"
    );
  };

  message.onend = () => {
    if (!speakerTestLoopActive) return;

    speakerStatus.textContent =
      "測試聲音持續播放中，請調整至舒適音量。";
    speakerPassButton.disabled = false;

    // 持續循環播放，直到學生按「聽得清楚，下一步」。
    window.setTimeout(() => {
      if (speakerTestLoopActive) {
        playSpeakerTestAudio({ isAutomatic: true });
      }
    }, 450);
  };

  message.onerror = () => {
    speakerStatus.textContent =
      "自動播放未成功，請重新播放測試聲音。";

    // 不把流程永久鎖死；重新播放按鈕仍可使用。
    speakerPassButton.disabled = false;
    playSpeakerTestButton.classList.remove(
      "hidden"
    );
  };

  try {
    window.speechSynthesis.speak(message);
  } catch (error) {
    console.warn(
      "測試音檔自動播放失敗：",
      error
    );

    message.onerror();
  }
}

playSpeakerTestButton.addEventListener(
  "click",
  () => playSpeakerTestAudio()
);


/**
 * 耳機測試通過
 */
speakerPassButton.addEventListener("click", () => {
  stopSpeakerTestAudioLoop();
  showPage("microphone");
});


/**
 * 聽不到聲音
 */
speakerRetryButton.addEventListener(
  "click",
  async () => {
    speakerPassButton.disabled = true;

    await openDeviceHelp(
      "speaker"
    );
  }
);


/**
 * 建立提示音
 */
function playBeep({
  frequency = 880,
  duration = 180,
  volume = 0.65
} = {}) {
  const context =
    new (
      window.AudioContext ||
      window.webkitAudioContext
    )();

  const oscillator =
    context.createOscillator();

  const gain =
    context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  gain.gain.value = volume;

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start();

  setTimeout(() => {
    oscillator.stop();
    context.close();
  }, duration);
}


/**
 * 開始偵測麥克風音量
 */
function startVolumeMeter(stream) {
  audioContext =
    new (
      window.AudioContext ||
      window.webkitAudioContext
    )();

  analyser = audioContext.createAnalyser();

  analyser.fftSize = 256;

  const source =
    audioContext.createMediaStreamSource(stream);

  source.connect(analyser);

  const dataArray =
    new Uint8Array(analyser.frequencyBinCount);

  function updateVolume() {
    analyser.getByteFrequencyData(dataArray);

    const average =
      dataArray.reduce(
        (sum, value) => sum + value,
        0
      ) / dataArray.length;

    const percentage =
      Math.min(100, average * 1.6);

    volumeBar.style.width =
      `${percentage}%`;

    if (average < 3) {
      volumeText.textContent =
        "沒有偵測到明顯聲音";
    } else if (average < 12) {
      volumeText.textContent =
        "音量偏小，請靠近麥克風";
    } else if (average < 45) {
      volumeText.textContent =
        "音量良好";
    } else {
      volumeText.textContent =
        "音量較大，請稍微遠離麥克風";
    }

    animationFrameId =
      requestAnimationFrame(updateVolume);
  }

  updateVolume();
}


/**
 * 停止麥克風串流
 */
function stopMediaStream() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  if (mediaStream) {
    mediaStream
      .getTracks()
      .forEach((track) => track.stop());

    mediaStream = null;
  }

  volumeBar.style.width = "0%";
}


function showMicrophoneHelp() {
  openDeviceHelp("microphone");
}


/**
 * 開始麥克風錄音測試
 */
async function startMicrophoneTest() {
  microphoneError.textContent = "";

  recordingPlayback.classList.add("hidden");
  recordingPlayback.removeAttribute("src");

  recordAgainButton.disabled = true;
  microphonePassButton.disabled = true;
  startRecordingButton.disabled = true;

  recordedChunks = [];

  try {
    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      throw new Error(
        "目前瀏覽器不支援麥克風錄音功能。"
      );
    }

    mediaStream =
      await navigator.mediaDevices.getUserMedia({
        audio:
          getSpeechAudioConstraints()
      });

    startVolumeMeter(mediaStream);

    let mimeType = "";

    if (
      MediaRecorder.isTypeSupported(
        "audio/webm;codecs=opus"
      )
    ) {
      mimeType = "audio/webm;codecs=opus";
    } else if (
      MediaRecorder.isTypeSupported("audio/webm")
    ) {
      mimeType = "audio/webm";
    }

    mediaRecorder =
      createSpeechMediaRecorder(
        mediaStream,
        mimeType
      );

    mediaRecorder.addEventListener(
      "dataavailable",
      (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      }
    );

    mediaRecorder.addEventListener(
      "stop",
      handleRecordingStopped
    );

    recordingIndicator.classList.add("active");
    recordingText.textContent =
      "準備開始錄音……";

    recordingText.textContent =
      "請等待提示音……";

    await new Promise((resolve) => {
      playBeep({
        frequency: 880,
        duration: 220
      });

      window.setTimeout(
        resolve,
        360
      );
    });

    mediaRecorder.start();

    recordingText.textContent =
      "錄音中，請朗讀句子";

    recordingTimer = setTimeout(() => {
      stopMicrophoneTest();
    }, 5000);

  } catch (error) {
    console.error(error);

    microphoneError.textContent =
      error.message ||
      "無法使用麥克風，請檢查瀏覽器權限。";

    startRecordingButton.disabled = false;

    recordingIndicator.classList.remove("active");
    recordingText.textContent = "麥克風測試失敗";

    stopMediaStream();
  }
}


/**
 * 停止錄音測試
 */
function stopMicrophoneTest() {
  if (recordingTimer) {
    clearTimeout(recordingTimer);
    recordingTimer = null;
  }

  if (
    mediaRecorder &&
    mediaRecorder.state !== "inactive"
  ) {
    mediaRecorder.stop();
  }

  playBeep({
    frequency: 620,
    duration: 240,
    volume: 0.58
  });

  recordingIndicator.classList.remove("active");
  recordingText.textContent =
    "錄音完成，請播放確認";
}


/**
 * 錄音完成後建立播放檔案
 */
function handleRecordingStopped() {
  const recordingBlob = new Blob(
    recordedChunks,
    {
      type:
        mediaRecorder.mimeType ||
        "audio/webm"
    }
  );

  const recordingUrl =
    URL.createObjectURL(recordingBlob);

  recordingPlayback.src = recordingUrl;
  recordingPlayback.classList.remove("hidden");

  recordAgainButton.disabled = false;
  microphonePassButton.disabled = false;
  startRecordingButton.disabled = true;

  stopMediaStream();

  volumeText.textContent =
    "錄音完成，請播放錄音確認";
}


/**
 * 開始錄音按鈕
 */
startRecordingButton.addEventListener(
  "click",
  startMicrophoneTest
);


/**
 * 重新錄音
 */
recordAgainButton.addEventListener(
  "click",
  startMicrophoneTest
);


/**
 * 麥克風測試通過
 */
microphonePassButton.addEventListener(
  "click",
  () => {
    summaryName.textContent =
      testData.studentName;

    summaryTestId.textContent =
      testData.testId;

    summaryTestType.textContent =
      testData.testTypeText;

    showPage("ready");
  }
);

function renderInstructionsByTestType() {
  if (testData.testType === "writing") {
    instructionsTitle.textContent =
      "Writing Test Instructions";

    instructionList.innerHTML = `
      <div class="instruction-item">
        <span class="instruction-number">1</span>
        <div>
          <strong>請依題目要求完成作答</strong>
          <p>
            寫作測驗將依題型顯示圖片、書面要求或意見題目。
          </p>
        </div>
      </div>

      <div class="instruction-item">
        <span class="instruction-number">2</span>
        <div>
          <strong>請留意右上角倒數時間</strong>
          <p>
            時間結束後，系統會自動結束該題並進入下一題。
          </p>
        </div>
      </div>

      <div class="instruction-item">
        <span class="instruction-number">3</span>
        <div>
          <strong>請在右側作答區輸入答案</strong>
          <p>
            可使用 Cut、Paste、Undo、Redo，並可顯示或隱藏 Word Count。
          </p>
        </div>
      </div>

      <div class="instruction-item">
        <span class="instruction-number">4</span>
        <div>
          <strong>測驗期間請勿重新整理或關閉頁面</strong>
          <p>
            避免造成尚未儲存的答案遺失。
          </p>
        </div>
      </div>
    `;

    directionStatus.textContent =
      "請閱讀寫作測驗說明，準備好後開始測驗。";

    playDirectionButton.classList.add("hidden");

    beginTestButton.disabled = false;

    return;
  }

  instructionsTitle.textContent =
    "Speaking Test Instructions";

  instructionList.innerHTML = `
    <div class="instruction-item">
      <span class="instruction-number">1</span>
      <div>
        <strong>請全程配戴耳機</strong>
        <p>
          測驗進行時，請勿取下耳機或調整設備。
        </p>
      </div>
    </div>

    <div class="instruction-item">
      <span class="instruction-number">2</span>
      <div>
        <strong>請留意右上角倒數時間</strong>
        <p>
          畫面會顯示準備時間與回答時間。
        </p>
      </div>
    </div>

    <div class="instruction-item">
      <span class="instruction-number">3</span>
      <div>
        <strong>聽到提示音後開始回答</strong>
        <p>
          系統會自動開始錄音，不需要按下任何按鈕。
        </p>
      </div>
    </div>

    <div class="instruction-item">
      <span class="instruction-number">4</span>
      <div>
        <strong>時間到後會自動停止</strong>
        <p>
          請勿重新整理、關閉網頁或返回上一頁。
        </p>
      </div>
    </div>
  `;

  directionStatus.textContent =
    "請先播放測驗說明音檔。";

  playDirectionButton.classList.remove("hidden");

  beginTestButton.disabled = true;
}

/**
 * 下一階段目前先顯示提示
 */
continueButton.addEventListener("click", () => {
  renderInstructionsByTestType();
  showPage("instructions");
});

/**
 * 將秒數顯示為 00:00
 */
function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);

  const minutes = Math.floor(safeSeconds / 60);

  const remainingSeconds =
    safeSeconds % 60;

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(remainingSeconds).padStart(2, "0")
  );
}


/**
 * 共用倒數計時器
 */
function runCountdown({
  seconds,
  label,
  statusText,
  onComplete
}) {
  if (questionCountdownInterval) {
    clearInterval(questionCountdownInterval);
  }

  let remaining = seconds;

  stageLabel.textContent = label;
  questionStatus.textContent = statusText;
  questionTimer.textContent =
    formatTime(remaining);

  questionCountdownInterval =
    setInterval(() => {
      remaining -= 1;

      questionTimer.textContent =
        formatTime(remaining);

      if (remaining <= 0) {
        clearInterval(
          questionCountdownInterval
        );

        questionCountdownInterval = null;

        onComplete();
      }
    }, 1000);
}


/**
 * 播放測驗說明
 */
playDirectionButton.addEventListener(
  "click",
  () => {
    if (!("speechSynthesis" in window)) {
      directionStatus.textContent =
        "瀏覽器無法播放英文說明。";

      return;
    }

    window.speechSynthesis.cancel();

    const direction =
      new SpeechSynthesisUtterance(
        "In this part of the test, " +
        "you will read a text aloud. " +
        "You will have time to prepare. " +
        "Then you will hear a beep. " +
        "Begin reading after the beep."
      );

    direction.lang = "en-US";
    direction.rate = 0.88;
    direction.volume = 1;

    direction.onstart = () => {
      directionStatus.textContent =
        "正在播放英文測驗說明……";

      playDirectionButton.disabled = true;
      beginTestButton.disabled = true;
    };

    direction.onend = () => {
      directionStatus.textContent =
        "播放完成，準備好後請開始測驗。";

      playDirectionButton.disabled = false;
      beginTestButton.disabled = false;
    };

    direction.onerror = () => {
      directionStatus.textContent =
        "播放失敗，請重新播放。";

      playDirectionButton.disabled = false;
    };

    window.speechSynthesis.speak(direction);
  }
);


/**
 * 將秒數顯示為 00:00
 */
function formatAssessmentTime(seconds) {
  const safeSeconds =
    Math.max(0, Number(seconds) || 0);

  const minutes =
    Math.floor(safeSeconds / 60);

  const remainingSeconds =
    Math.floor(safeSeconds % 60);

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(remainingSeconds).padStart(2, "0")
  );
}


/**
 * 顯示各題型內容
 */
function getSpeakingQuestionDisplayTitle(question) {
  const part = Number(question?.part);

  if (part === 1) {
    return "Read a Text Aloud";
  }

  if (part === 2) {
    return "Describe a Picture";
  }

  if (part === 3) {
    return "Respond to Questions";
  }

  if (part === 4) {
    return "Respond to Questions Using Information Provided";
  }

  if (part === 5) {
    return "Express an Opinion";
  }

  const storedTitle = String(question?.title || "").trim();

  // 如果資料庫 title 誤存成 Directions，也不要顯示在正式題目。
  if (/direction/i.test(storedTitle)) {
    return `Speaking Part ${part || ""}`.trim();
  }

  return storedTitle || "TOEIC Speaking";
}


function renderAssessmentQuestion(question) {
  const isPart4FormalQuestion =
    Number(question?.part) === 4 &&
    question?.type === "respond_information";

  if (!isPart4FormalQuestion) {
    hidePart4ToeicTimerBoard();
  }
  assessmentPromptText.classList.add("hidden");
  assessmentPromptImage.classList.add("hidden");
  assessmentAudioPrompt.classList.add("hidden");
  assessmentInformationCard.classList.add("hidden");

  assessmentPromptImage.removeAttribute("src");

  if (question.type === "describe_picture") {
    if (question.promptImagePath) {
      assessmentPromptImage.src =
        question.promptImagePath;

      assessmentPromptImage.classList.remove(
        "hidden"
      );
    } else {
      assessmentPromptText.textContent =
        "圖片題素材尚未設定，之後將由 question_bank 載入。";

      assessmentPromptText.classList.remove(
        "hidden"
      );
    }

    return;
  }

  if (question.type === "respond_information") {
    const infoText = String(question.informationText || "").trim();

    if (question.promptImagePath) {
      assessmentPromptImage.src = question.promptImagePath;
      assessmentPromptImage.classList.remove("hidden");
    }

    if (infoText) {
      assessmentInformationCard.textContent = infoText;
      assessmentInformationCard.classList.remove("hidden");
    }

    const promptText =
      String(question.promptText || "").trim();

    if (promptText) {
      assessmentPromptText.textContent = promptText;
      assessmentPromptText.classList.remove("hidden");
    } else {
      assessmentPromptText.textContent = "";
      assessmentPromptText.classList.add("hidden");
    }

    assessmentAudioPrompt.classList.remove("hidden");
    assessmentAudioStatus.textContent = "Listen to the question.";
    return;
  }

  if (question.type === "respond_question") {
    // V5.3.5 Part 3: only the CURRENT question is rendered.
    // The assessment engine advances Q5 -> Q6 -> Q7 only after the
    // previous response timer finishes, recording stops, and the answer
    // is saved. Future questions therefore never appear early.
    if (Number(question.part) === 3) {
      const contextText =
        String(question.passage || "").trim();

      if (contextText) {
        assessmentInformationCard.textContent =
          contextText;
        assessmentInformationCard.classList.remove(
          "hidden"
        );
      }

      assessmentPromptText.textContent =
        question.promptText ||
        "Question text has not been set.";
      assessmentPromptText.classList.remove(
        "hidden"
      );

      assessmentAudioPrompt.classList.remove(
        "hidden"
      );
      assessmentAudioStatus.textContent =
        "Listen to the question.";

      return;
    }

    assessmentAudioPrompt.classList.remove(
      "hidden"
    );

    assessmentAudioStatus.textContent =
      "Listen to the question.";

    return;
  }

  assessmentPromptText.textContent =
    question.promptText ||
    "題目內容尚未設定。";

  assessmentPromptText.classList.remove(
    "hidden"
  );
}


/**
 * 播放口說題目音訊
 * 目前先以瀏覽器英文語音代替正式音檔。
 */
function playAssessmentPrompt(
  question,
  repeatIndex,
  totalRepeats
) {
  assessmentAudioStatus.textContent =
    totalRepeats > 1
      ? `Playing ${repeatIndex} of ${totalRepeats}`
      : "Playing the question";

  // 優先播放老師後台上傳的 Q8 / Q9 / Q10 題目音檔。
  // 沒有上傳音檔時，才使用瀏覽器英文 TTS 作為備援。
  if (question?.promptAudioPath) {
    return playAudioFile(question.promptAudioPath);
  }

  return new Promise((resolve, reject) => {
    if (!("speechSynthesis" in window)) {
      reject(new Error("瀏覽器無法播放題目語音。"));
      return;
    }

    window.speechSynthesis.cancel();
    const message = new SpeechSynthesisUtterance(
      question.promptText || "Please respond to the question."
    );
    message.lang = "en-US";
    message.rate = 0.88;
    message.volume = 1;
    message.onend = resolve;
    message.onerror = reject;
    window.speechSynthesis.speak(message);
  });
}


/**
 * 開始單題正式錄音
 */
async function startAssessmentRecording(question) {
  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    throw new Error(
      "目前瀏覽器不支援麥克風錄音。"
    );
  }

  mediaStream =
    await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

  recordedChunks = [];

  let mimeType = "";

  if (
    MediaRecorder.isTypeSupported(
      "audio/webm;codecs=opus"
    )
  ) {
    mimeType = "audio/webm;codecs=opus";
  } else if (
    MediaRecorder.isTypeSupported("audio/webm")
  ) {
    mimeType = "audio/webm";
  }

  mediaRecorder =
    createSpeechMediaRecorder(
      mediaStream,
      mimeType
    );

  mediaRecorder.addEventListener(
    "dataavailable",
    (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    }
  );

  const stoppedPromise =
    new Promise((resolve) => {
      mediaRecorder.addEventListener(
        "stop",
        () => {
          resolve(
            new Blob(recordedChunks, {
              type:
                mediaRecorder.mimeType ||
                "audio/webm"
            })
          );
        },
        { once: true }
      );
    });

  mediaRecorder.start();

  return {
    startedAt: performance.now(),
    stoppedPromise
  };
}


/**
 * 停止單題正式錄音
 */
async function stopAssessmentRecording(
  question,
  recordingContext
) {
  const measuredDuration =
    Number(
      (
        (
          performance.now() -
          recordingContext.startedAt
        ) / 1000
      ).toFixed(2)
    );

  if (
    mediaRecorder &&
    mediaRecorder.state !== "inactive"
  ) {
    mediaRecorder.stop();
  }

  const audioBlob =
    await recordingContext.stoppedPromise;

  stopMediaStream();

  let actualDuration = measuredDuration;

  try {
    actualDuration =
      await getAudioDuration(audioBlob);
  } catch (error) {
    console.warn(
      "無法從音檔讀取時長，改用錄音計時：",
      error
    );
  }

  return {
    audioBlob,
    durationSeconds: actualDuration
  };
}


/**
 * 上傳單題錄音並寫入 responses
 */
async function persistAssessmentResponse(
  question,
  recordingResult
) {
  const audioBlob =
    recordingResult.audioBlob;

  if (!audioBlob || audioBlob.size === 0) {
    throw new Error("本題錄音檔案是空的。");
  }

  const uploadId =
    generateUUID();

  const extension =
    audioBlob.type.includes("ogg")
      ? "ogg"
      : audioBlob.type.includes("mp4")
        ? "mp4"
        : "webm";

  const filePath =
    `${testData.testId}/question${question.order}-${uploadId}.${extension}`;

  await uploadRecording(
    audioBlob,
    filePath
  );

  await saveResponse({
    uploadId,
    sessionId:
      testData.sessionId,
    questionId:
      question.id || null,
    questionCodeSnapshot:
      question.code,
    questionOrder:
      question.order,
    questionNumber:
      question.order,
    responseType:
      "audio",
    recordingBucket:
      "speaking-recordings",
    recordingPath:
      filePath,
    mimeType:
      audioBlob.type ||
      "audio/webm",
    fileSize:
      audioBlob.size,
    durationSeconds:
      recordingResult.durationSeconds,
    uploadStatus:
      "uploaded",
    retryCount:
      0,
    answeredAt:
      new Date().toISOString(),
    uploadedAt:
      new Date().toISOString()
  });

  await updateCurrentQuestion(
    testData.sessionId,
    question.order
  );

  formalRecordingBlob = audioBlob;

  if (formalRecordingUrl) {
    URL.revokeObjectURL(
      formalRecordingUrl
    );
  }

  formalRecordingUrl =
    URL.createObjectURL(audioBlob);

  // 完成頁不顯示正式錄音播放器
}




let speakingPart4InfoShown = false;

function getPart4InfoSeconds(question) {
  const directions = String(question?.directions || "");
  const match = directions.match(/P4_INFO_SECONDS\s*=\s*(\d+)/i);
  return match ? Math.max(1, Number(match[1])) : 45;
}

function getPart4InfoAudioUrl(question) {
  const directions = String(question?.directions || "");
  const match = directions.match(/P4_INFO_AUDIO_URL\s*=\s*(\S+)/i);
  return match ? match[1].trim() : "";
}

function playAudioFile(url) {
  return new Promise((resolve, reject) => {
    if (!url) return resolve();
    const audio = new Audio(url);
    audio.preload = "auto";
    audio.volume = 1;
    audio.onended = resolve;
    audio.onerror = () => reject(new Error("音檔播放失敗。"));
    audio.play().catch(reject);
  });
}


function hidePart4ToeicTimerBoard() {
  document
    .getElementById("part4ToeicTimerBoard")
    ?.classList.add("hidden");
}


function ensurePart4ToeicTimerBoard() {
  let board = document.getElementById("part4ToeicTimerBoard");
  if (board) return board;

  board = document.createElement("div");
  board.id = "part4ToeicTimerBoard";
  board.className = "part4-toeic-timer-board hidden";

  board.innerHTML = `
    <div class="part4-information-timer">
      <div class="part4-timer-box part4-information-timer-box">
        <div class="part4-timer-label">PREPARATION TIME</div>
        <div
          class="part4-timer-value"
          data-part4-info-timer
        >00:45</div>
      </div>
    </div>

    <div class="part4-question-timers">
      <div class="part4-timer-column" data-part4-q="8">
        <div class="part4-timer-box">
          <div class="part4-timer-label">PREPARATION TIME</div>
          <div class="part4-timer-value" data-kind="prep">00:03</div>
        </div>
        <div class="part4-timer-box">
          <div class="part4-timer-label">RESPONSE TIME</div>
          <div class="part4-timer-value" data-kind="response">00:15</div>
        </div>
      </div>

      <div class="part4-timer-column" data-part4-q="9">
        <div class="part4-timer-box">
          <div class="part4-timer-label">PREPARATION TIME</div>
          <div class="part4-timer-value" data-kind="prep">00:03</div>
        </div>
        <div class="part4-timer-box">
          <div class="part4-timer-label">RESPONSE TIME</div>
          <div class="part4-timer-value" data-kind="response">00:15</div>
        </div>
      </div>

      <div class="part4-timer-column" data-part4-q="10">
        <div class="part4-timer-box">
          <div class="part4-timer-label">PREPARATION TIME</div>
          <div class="part4-timer-value" data-kind="prep">00:03</div>
        </div>
        <div class="part4-timer-box">
          <div class="part4-timer-label">RESPONSE TIME</div>
          <div class="part4-timer-value" data-kind="response">00:30</div>
        </div>
      </div>
    </div>
  `;

  const host =
    document.getElementById("assessmentMedia") ||
    document.getElementById("assessmentQuestionContent") ||
    assessmentPromptText?.parentElement ||
    responseTimerCard?.parentElement;

  if (host) host.appendChild(board);

  return board;
}


function formatPart4Clock(seconds) {
  const safeSeconds =
    Math.max(0, Number(seconds) || 0);

  const minutes =
    Math.floor(safeSeconds / 60);

  const remainder =
    Math.floor(safeSeconds % 60);

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(remainder).padStart(2, "0")
  );
}


function getPart4QuestionNumber(question) {
  const code =
    String(
      question?.code ||
      question?.question_code ||
      ""
    );

  const codeMatch =
    code.match(/-Q0?(8|9|10)$/i);

  if (codeMatch) {
    return Number(codeMatch[1]);
  }

  const candidates = [
    question?.question_number,
    question?.questionNumber,
    question?.number,
    question?.order_number,
    question?.order
  ];

  for (const value of candidates) {
    const n = Number(value);
    if ([8, 9, 10].includes(n)) {
      return n;
    }
  }

  return null;
}


function resetPart4TimerBoard(question) {
  const board =
    ensurePart4ToeicTimerBoard();

  const infoSeconds =
    getPart4InfoSeconds(question);

  const infoTimer =
    board.querySelector(
      "[data-part4-info-timer]"
    );

  if (infoTimer) {
    infoTimer.textContent =
      formatPart4Clock(infoSeconds);
  }

  const defaults = {
    8: { prep: 3, response: 15 },
    9: { prep: 3, response: 15 },
    10: { prep: 3, response: 30 }
  };

  board
    .querySelectorAll(
      ".part4-timer-column"
    )
    .forEach((column) => {
      const number =
        Number(column.dataset.part4Q);

      const values =
        defaults[number];

      column
        .querySelector(
          '[data-kind="prep"]'
        )
        .textContent =
          formatPart4Clock(
            values.prep
          );

      column
        .querySelector(
          '[data-kind="response"]'
        )
        .textContent =
          formatPart4Clock(
            values.response
          );

      column.classList.remove(
        "is-active",
        "is-complete"
      );
    });
}


function setPart4InformationTimer(seconds) {
  const board =
    ensurePart4ToeicTimerBoard();

  board.classList.remove("hidden");

  const value =
    board.querySelector(
      "[data-part4-info-timer]"
    );

  if (value) {
    value.textContent =
      formatPart4Clock(seconds);
  }
}


function setPart4TimerBoardState(
  question,
  phase,
  seconds
) {
  if (
    Number(question?.part) !== 4 ||
    question?.type !==
      "respond_information"
  ) {
    document
      .getElementById(
        "part4ToeicTimerBoard"
      )
      ?.classList.add("hidden");

    return;
  }

  const board =
    ensurePart4ToeicTimerBoard();

  board.classList.remove("hidden");

  const qn =
    getPart4QuestionNumber(
      question
    );

  if (!qn) {
    return;
  }

  const prep =
    Number(
      question?.preparationSeconds ??
      question?.preparation_time ??
      question?.preparationTime ??
      3
    ) || 3;

  const response =
    Number(
      question?.responseSeconds ??
      question?.response_time ??
      question?.responseTime ??
      (qn === 10 ? 30 : 15)
    ) ||
    (qn === 10 ? 30 : 15);

  const column =
    board.querySelector(
      `[data-part4-q="${qn}"]`
    );

  if (column) {
    const prepValue =
      column.querySelector(
        '[data-kind="prep"]'
      );

    const responseValue =
      column.querySelector(
        '[data-kind="response"]'
      );

    if (phase === "prep") {
      prepValue.textContent =
        formatPart4Clock(seconds);

      responseValue.textContent =
        formatPart4Clock(response);
    }

    if (phase === "response") {
      prepValue.textContent =
        "00:00";

      responseValue.textContent =
        formatPart4Clock(seconds);
    }

    if (phase === "idle") {
      prepValue.textContent =
        formatPart4Clock(prep);

      responseValue.textContent =
        formatPart4Clock(response);
    }
  }

  board
    .querySelectorAll(
      ".part4-timer-column"
    )
    .forEach((item) => {
      const n =
        Number(item.dataset.part4Q);

      item.classList.toggle(
        "is-active",
        n === qn
      );

      item.classList.toggle(
        "is-complete",
        n < qn
      );
    });
}


async function showPart4InformationPage(question) {
  if (
    speakingPart4InfoShown ||
    Number(question?.part) !== 4 ||
    question?.type !== "respond_information"
  ) return;

  speakingPart4InfoShown = true;

  // Part 4 Direction 播完後，先播放正式準備提示與 Beep，
  // 再進入 Information 閱讀頁。
  assessmentQuestionType.textContent = "Part 4 — Using Information";
  assessmentQuestionCounter.textContent = "Questions 8–10";
  assessmentStageText.textContent = "Begin preparing now";

  preparationTimerCard.classList.add("hidden");
  responseTimerCard.classList.add("hidden");
  assessmentPromptText.classList.add("hidden");
  assessmentAudioPrompt.classList.add("hidden");

  try {
    await playAssessmentVoiceCue(
      "Begin preparing now."
    );
  } catch (error) {
    console.warn(
      "Part 4 preparation voice cue failed:",
      error
    );
  }

  try {
    await playResponseStartSound();
  } catch (error) {
    console.warn(
      "Part 4 preparation beep failed:",
      error
    );
  }

  assessmentStageText.textContent = "Read the information";
  const part4Board = ensurePart4ToeicTimerBoard();
  part4Board.classList.remove("hidden");
  setPart4TimerBoardState(
    { ...question, question_number: 8 },
    "idle",
    3
  );

  const infoText = String(question?.informationText || "").trim();
  if (infoText) {
    assessmentInformationCard.textContent = infoText;
    assessmentInformationCard.classList.remove("hidden");
  } else {
    assessmentInformationCard.classList.add("hidden");
  }

  if (question?.promptImagePath) {
    assessmentPromptImage.src = question.promptImagePath;
    assessmentPromptImage.classList.remove("hidden");
  } else {
    assessmentPromptImage.classList.add("hidden");
  }

  const sharedInfoAudioUrl = getPart4InfoAudioUrl(question);
  if (sharedInfoAudioUrl) {
    assessmentAudioPrompt.classList.remove("hidden");
    assessmentAudioStatus.textContent =
      "Playing Information audio";

    try {
      await playAudioFile(sharedInfoAudioUrl);
    } catch (error) {
      console.warn(
        "Part 4 Information audio failed:",
        error
      );
    } finally {
      assessmentAudioPrompt.classList.add("hidden");
    }
  }

  // 共用音檔播完後才開始 Information 閱讀時間。
  assessmentStageText.textContent =
    "Read the information";

  const informationSeconds =
    getPart4InfoSeconds(question);

  resetPart4TimerBoard(question);

  for (
    let remaining =
      informationSeconds;
    remaining > 0;
    remaining -= 1
  ) {
    setPart4InformationTimer(
      remaining
    );

    await delay(1000);
  }

  setPart4InformationTimer(0);
}

function getPart3IntroSeconds(question) {
  const directions =
    String(question?.directions || "");

  const match =
    directions.match(
      /P3_INTRO_SECONDS\s*=\s*(\d+)/i
    );

  return match
    ? Math.max(1, Number(match[1]))
    : 10;
}


function getPart3SituationAudioUrl(question, allQuestions = []) {
  // Prefer the current question, but also scan Q5-Q7.
  // Teacher batch editing may preserve the shared Situation audio marker
  // on any one of the Part 3 rows, so the student must not assume Q5 owns it.
  const candidates = [
    question,
    ...(Array.isArray(allQuestions) ? allQuestions : [])
  ].filter((item, index, arr) =>
    item &&
    Number(item.part) === 3 &&
    item.type === "respond_question" &&
    arr.indexOf(item) === index
  );

  for (const item of candidates) {
    const directions = String(item?.directions || "");
    const match = directions.match(
      /P3_SITUATION_AUDIO\s*=\s*(\S+)/i
    );
    if (match?.[1]) {
      return String(match[1]).trim();
    }
  }

  return "";
}


async function showPart3IntroPage(question, allQuestions = []) {
  if (
    speakingPart3IntroShown ||
    Number(question?.part) !== 3 ||
    question?.type !== "respond_question"
  ) {
    return;
  }

  speakingPart3IntroShown = true;

  const passage =
    String(question?.passage || "").trim();

  if (!passage) {
    return;
  }

  // 題組說明頁：只顯示 Situation / Passage。
  // 不顯示 Q5、Q6、Q7，也不顯示 Preparation / Response 計時器。
  assessmentQuestionType.textContent =
    "Part 3 — Respond to Questions";

  assessmentQuestionCounter.textContent =
    "Questions 5–7";

  assessmentStageText.textContent =
    "Read the situation";

  preparationTimerCard.classList.add(
    "hidden"
  );

  responseTimerCard.classList.add(
    "hidden"
  );

  assessmentPromptText.textContent =
    passage;

  assessmentPromptText.classList.remove(
    "hidden"
  );

  assessmentPromptImage.classList.add(
    "hidden"
  );

  assessmentAudioPrompt.classList.add(
    "hidden"
  );

  assessmentInformationCard.classList.add(
    "hidden"
  );

  const situationAudioUrl =
    getPart3SituationAudioUrl(question, allQuestions);

  if (situationAudioUrl) {
    assessmentStageText.textContent =
      "Listen to the information";

    assessmentAudioPrompt.textContent =
      "🔊 Listen to the information.";

    assessmentAudioPrompt.classList.remove(
      "hidden"
    );

    try {
      await playAudioFile(
        situationAudioUrl
      );
    } catch (error) {
      console.error(
        "Part 3 Situation audio failed:",
        error
      );

      assessmentStageText.textContent =
        "Situation audio error";

      throw new Error(
        "Part 3 Situation 音檔無法播放，測驗已暫停。請通知工作人員。"
      );
    } finally {
      assessmentAudioPrompt.classList.add(
        "hidden"
      );
    }
  } else {
    // 相容既有 Part 3 題組。
    const seconds =
      getPart3IntroSeconds(question);

    await delay(seconds * 1000);
  }

  assessmentPromptText.classList.add(
    "hidden"
  );
}


/**
 * 建立並綁定 Assessment Engine
 */
function createSpeakingAssessmentEngine(questions) {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("沒有可執行的口說題目。");
  }

  const engine =
    new AssessmentEngine({
      questions,
      beforeQuestion:
        async (
          question,
          currentIndex
        ) => {
          await playSpeakingDirectionIfNeeded(
            question,
            currentIndex
          );

          // Part 3 在 Direction 後先顯示一次共用題組說明頁。
          // 說明頁結束後才正式進入 Q5。
          await showPart3IntroPage(
            question,
            questions
          );

          // Part 4 在 Direction 後先顯示共用 Information 頁。
          // 讀取完成後才進入 Q8；Q9/Q10 不會提前出現。
          await showPart4InformationPage(
            question
          );

          // Part 4 使用圖片下方專用 Q8/Q9/Q10 計時器，
          // 不再顯示頁面底部大型通用計時器。
          const isPart4Question =
            Number(question.part) === 4 &&
            question.type ===
              "respond_information";

          preparationTimerCard.classList.toggle(
            "hidden",
            isPart4Question
          );

          responseTimerCard.classList.toggle(
            "hidden",
            isPart4Question
          );

          preparationTimerValue.textContent =
            formatAssessmentTime(
              Number(question.part) === 3 &&
              question.type === "respond_question"
                ? (Number(question.preparationSeconds) || 3)
                : question.preparationSeconds
            );

          responseTimerValue.textContent =
            formatAssessmentTime(
              question.responseSeconds
            );

          // Direction 播完後重新渲染目前正式題目，
          // 避免 Direction 畫面殘留。
          renderAssessmentQuestion(
            question
          );

          const resolvedPart =
            resolveSpeakingPart(
              question,
              currentIndex
            ) || question.part || "";

          assessmentPartLabel.textContent =
            [1, 2].includes(Number(resolvedPart))
              ? `Question ${currentIndex + 1} of ${questions.length}`
              : `Speaking Part ${resolvedPart}`;

          assessmentQuestionType.textContent =
            getSpeakingQuestionDisplayTitle(
              question
            );
        },

      playPrompt:
        playAssessmentPrompt,
      startRecording:
        startAssessmentRecording,
      stopRecording:
        stopAssessmentRecording,
      persistResponse:
        persistAssessmentResponse
    });

  engine.addEventListener("assessmenterror", (event) => {
    const { message, question, currentIndex } = event.detail;
    const detail = `第 ${currentIndex + 1} 題 (${question?.code || "未知題號"})：${message}`;
    console.error("口說測驗停止，請檢查 Console / Network：", detail);
    assessmentStageText.textContent = "測驗暫停：儲存或切題失敗";
    assessmentQuestionType.textContent = "請通知工作人員";
    assessmentPromptText.textContent = detail + "。請勿關閉本頁，先截圖並通知工作人員。";
    assessmentPromptText.classList.remove("hidden");
    completedRecordingStatus.textContent = "測驗尚未完成：" + detail;
  });

  engine.addEventListener(
    "questionchange",
    (event) => {
      const {
        question,
        currentIndex,
        total
      } = event.detail;

      assessmentPartLabel.textContent =
        [1, 2].includes(Number(question.part))
          ? `Question ${currentIndex + 1} of ${total}`
          : `Speaking Part ${question.part}`;

      assessmentQuestionType.textContent =
        getSpeakingQuestionDisplayTitle(
          question
        );

      assessmentQuestionCounter.textContent =
        `Question ${currentIndex + 1} of ${total}`;

      assessmentProgressValue.style.width =
        `${((currentIndex + 1) / total) * 100}%`;

      preparationTimerValue.textContent =
        formatAssessmentTime(
          question.preparationSeconds
        );

      responseTimerValue.textContent =
        formatAssessmentTime(
          question.responseSeconds
        );

      if (
        Number(question.part) === 4 &&
        question.type ===
          "respond_information"
      ) {
        setPart4TimerBoardState(
          question,
          "idle",
          question.preparationSeconds
        );
      }

      // Direction 由 Engine 開始前統一播放，這裡只渲染正式題目。
      renderAssessmentQuestion(question);
    }
  );

  engine.addEventListener(
    "statechange",
    (event) => {
      const { state } = event.detail;

      const labels = {
        PREPARATION_CUE:
          "Begin preparing now",
        PREPARATION:
          "Preparation",
        PROMPT_PLAYBACK:
          "Listen to the question",
        PRE_RESPONSE_DELAY:
          "Get ready",
        RESPONSE_CUE:
          "Begin speaking now",
        RECORDING:
          "Recording",
        UPLOADING:
          "Saving response",
        STOPPING_RECORDING:
          "Finishing recording",
        ERROR:
          "Test paused: save/transition error",
        NEXT_QUESTION:
          "Loading next question",
        FINISHED:
          "Completed",
        ABORTED:
          "Test stopped"
      };

      assessmentStageText.textContent =
        labels[state] || state;

      preparationTimerCard.classList.toggle(
        "active",
        state === "PREPARATION" ||
        state === "PRE_RESPONSE_DELAY"
      );

      responseTimerCard.classList.toggle(
        "active",
        state === "RECORDING"
      );

      assessmentRecordingDot.classList.toggle(
        "active",
        state === "RECORDING"
      );
    }
  );

  engine.addEventListener(
    "tick",
    (event) => {
      const {
        state,
        remainingSeconds,
        question
      } = event.detail;

      if (state === "PREPARATION") {
        preparationTimerValue.textContent =
          formatAssessmentTime(
            remainingSeconds
          );

        responseTimerValue.textContent =
          formatAssessmentTime(
            question.responseSeconds
          );

        if (
          Number(question.part) === 4 &&
          question.type ===
            "respond_information"
        ) {
          setPart4TimerBoardState(
            question,
            "prep",
            remainingSeconds
          );
        }
      }

      if (state === "PRE_RESPONSE_DELAY") {
        preparationTimerValue.textContent =
          formatAssessmentTime(
            remainingSeconds
          );
      }

      if (state === "RECORDING") {
        preparationTimerValue.textContent =
          "00:00";

        responseTimerValue.textContent =
          formatAssessmentTime(
            remainingSeconds
          );

        if (
          Number(question.part) === 4 &&
          question.type ===
            "respond_information"
        ) {
          setPart4TimerBoardState(
            question,
            "response",
            remainingSeconds
          );
        }
      }
    }
  );

  engine.addEventListener(
    "finished",
    async () => {
      // Full 模式：Speaking 完成後必須接續 Writing，不能直接完成整份測驗。
      if (["full", "quick"].includes(testData.testType)) {
        speakingAssessmentEngine = null;
        await startWritingAssessmentPhase(writingQuestions);
        return;
      }

      showCompletedPage();
    }
  );

  return engine;
}


let speakingDirectionFallbackQuestionIndex = -1;
let speakingDirectionsByPart = new Map();
let speakingPart3IntroShown = false;
  speakingPart4InfoShown = false;
let speakingDirectionPlayedParts = new Set();

async function prepareSpeakingDirections(selectedQuestions = []) {
  speakingDirectionsByPart = new Map();
  speakingDirectionPlayedParts = new Set();
  speakingDirectionFallbackQuestionIndex = -1;
  speakingPart3IntroShown = false;
  speakingPart4InfoShown = false;

  if (
    typeof window.loadSpeakingDirections !==
    "function"
  ) {
    throw new Error(
      "Direction service is not available."
    );
  }

  assessmentStageText.textContent =
    "Loading Directions";

  const selectedParts = Array.isArray(selectedQuestions)
    ? selectedQuestions.map((q, index) => resolveSpeakingPart(q, index)).filter(Boolean)
    : [];
  const requiredParts = [...new Set(selectedParts)];
  let lastError = null;

  // PWA / 網路環境下最多重試 4 次。
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const rows =
        await window.loadSpeakingDirections();

      const nextMap = new Map();

      (rows || []).forEach((row) => {
        const part = Number(row.part_number);

        if (
          Number.isInteger(part) &&
          part >= 1 &&
          part <= 5
        ) {
          nextMap.set(part, row);
        }
      });

      const missingParts =
        requiredParts.filter(
          (part) => !nextMap.has(part)
        );

      if (missingParts.length > 0) {
        throw new Error(
          `Direction 尚未完整載入：Part ${missingParts.join(", ")}`
        );
      }

      speakingDirectionsByPart = nextMap;

      // 預先要求瀏覽器載入 Direction 音檔。
      // 不在這裡播放，正式進入各 Part 時才播放。
      nextMap.forEach((direction) => {
        if (!direction?.audio_url) return;

        try {
          const audio = new Audio();
          audio.preload = "auto";
          audio.src = direction.audio_url;
          audio.load();
        } catch (error) {
          console.warn(
            "Direction audio preload failed:",
            error
          );
        }
      });

      console.log(
        "[Speaking Directions] ready:",
        Array.from(nextMap.keys())
      );

      assessmentStageText.textContent =
        "Directions ready";

      return;
    } catch (error) {
      lastError = error;

      console.warn(
        `[Speaking Directions] attempt ${attempt}/4 failed:`,
        error
      );

      assessmentStageText.textContent =
        attempt < 4
          ? `Loading Directions... (${attempt}/4)`
          : "Directions could not be loaded";

      if (attempt < 4) {
        await delay(900);
      }
    }
  }

  throw new Error(
    lastError?.message ||
    "Directions could not be loaded. Please notify staff."
  );
}

function resolveSpeakingPart(question, formalQuestionIndex = null) {
  // Match by actual question type first: custom/quick tests do not use full-test numbering.
  const type = String(question?.type || question?.question_type || question?.questionType || "").toLowerCase();
  const typeParts = {
    read_aloud: 1,
    describe_picture: 2,
    respond_question: 3,
    respond_information: 4,
    express_opinion: 5
  };
  if (typeParts[type]) return typeParts[type];

  const section = String(question?.sectionType || question?.section_type || "").toLowerCase();
  const code = String(question?.code || question?.question_code || "");
  if (section.includes("speaking") || section === "speaking" || /^((QUICK|SPK)-)/i.test(code)) {
    const codePart = code.match(/-P([1-5])(?:-|$)/i);
    if (codePart) return Number(codePart[1]);
  }

  const explicitPart = Number(question?.part ?? question?.partNumber ?? question?.part_number ?? 0);
  if (Number.isInteger(explicitPart) && explicitPart >= 1 && explicitPart <= 5) return explicitPart;

  // Only legacy full-test records may fall back to fixed question numbering.
  if (testData?.testType === "full" || testData?.testType === "speaking") {
    const explicitNumber = Number(question?.questionNumber ?? question?.question_number ?? question?.number ?? 0);
    const q = explicitNumber || (Number.isInteger(formalQuestionIndex) ? formalQuestionIndex + 1 : 0);
    if (q >= 1 && q <= 2) return 1;
    if (q >= 3 && q <= 4) return 2;
    if (q >= 5 && q <= 7) return 3;
    if (q >= 8 && q <= 10) return 4;
    if (q === 11) return 5;
  }
  console.warn("Unable to determine speaking Part for Directions:", question?.code || question?.id);
  return 0;
}

async function playSpeakingDirectionAudio(url) {
  if (!url) {
    throw new Error("Direction audio URL is missing.");
  }

  let webAudioError = null;

  // 第一層：Web Audio。PWA 已在「開始測驗」點擊時解鎖 AudioContext。
  try {
    const context = unlockAssessmentAudio();

    if (context?.state === "suspended") {
      await context.resume();
    }

    const response =
      await fetch(url, {
        cache: "no-store"
      });

    if (!response.ok) {
      throw new Error(
        `Direction audio HTTP ${response.status}`
      );
    }

    const bytes =
      await response.arrayBuffer();

    const buffer =
      await context.decodeAudioData(
        bytes.slice(0)
      );

    await new Promise(
      (resolve, reject) => {
        const source =
          context.createBufferSource();

        source.buffer = buffer;
        source.connect(
          context.destination
        );

        source.onended = resolve;

        try {
          source.start(0);
        } catch (error) {
          reject(error);
        }
      }
    );

    return;
  } catch (error) {
    webAudioError = error;
    console.warn(
      "Web Audio Direction failed; trying HTMLAudio:",
      error
    );
  }

  // 第二層：HTMLAudio。失敗時要 reject，不能像舊版一樣直接 resolve。
  await new Promise((resolve, reject) => {
    const audio = new Audio();
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const fail = (error) => {
      if (settled) return;
      settled = true;
      reject(
        error ||
        webAudioError ||
        new Error(
          "Direction audio playback failed."
        )
      );
    };

    audio.preload = "auto";
    audio.src = url;
    audio.onended = finish;
    audio.onerror = () =>
      fail(
        new Error(
          "Direction audio could not be loaded."
        )
      );

    const result = audio.play();

    if (result?.catch) {
      result.catch(fail);
    }
  });
}

async function playSpeakingDirectionIfNeeded(
  question,
  formalQuestionIndex = null
) {
  // Part 4 專用 45 秒＋Q8/Q9/Q10 計時板只屬於正式 Part 4。
  // Direction 頁（包含 Part 4 自己）都不顯示。
  hidePart4ToeicTimerBoard();
  const part =
    resolveSpeakingPart(
      question,
      formalQuestionIndex
    );

  if (
    !part ||
    speakingDirectionPlayedParts.has(part)
  ) {
    return;
  }

  const direction =
    speakingDirectionsByPart.get(part);

  if (!direction) {
    throw new Error(
      `Part ${part} Direction 尚未載入，測驗已暫停。請通知工作人員。`
    );
  }

  assessmentPartLabel.textContent =
    `Part ${part} Direction`;

  assessmentQuestionType.textContent =
    direction.title ||
    `Speaking Part ${part} Directions`;

  assessmentPromptText.textContent =
    direction.directions_text ||
    "";

  assessmentPromptText.classList.remove(
    "hidden"
  );

  assessmentAudioPrompt.classList.add(
    "hidden"
  );

  assessmentStageText.textContent =
    "Directions";

  // Direction 畫面不顯示 Preparation / Response 計時器。
  preparationTimerCard.classList.add(
    "hidden"
  );

  responseTimerCard.classList.add(
    "hidden"
  );

  preparationTimerValue.textContent = "";
  responseTimerValue.textContent = "";

  assessmentQuestionCounter.textContent =
    `Speaking Part ${part}`;

  assessmentPromptImage.classList.add(
    "hidden"
  );

  assessmentInformationCard.classList.add(
    "hidden"
  );

  try {
    if (direction.audio_url) {
      await playSpeakingDirectionAudio(
        direction.audio_url
      );

    } else if (
      direction.directions_text &&
      "speechSynthesis" in window
    ) {
      await new Promise((resolve, reject) => {
        const msg =
          new SpeechSynthesisUtterance(
            direction.directions_text
          );

        msg.lang = "en-US";
        msg.rate = 0.9;
        msg.onend = resolve;
        msg.onerror = () =>
          reject(
            new Error(
              `Part ${part} Direction speech playback failed.`
            )
          );

        window.speechSynthesis.speak(msg);
      });
    } else {
      throw new Error(
        `Part ${part} Direction 沒有可播放的音檔或文字。`
      );
    }
  } catch (error) {
    assessmentStageText.textContent =
      "Direction playback error";

    assessmentPromptText.textContent =
      `Part ${part} Direction 無法播放，測驗已暫停。請通知工作人員。`;

    assessmentPromptText.classList.remove(
      "hidden"
    );

    console.error(
      "Speaking Direction 播放失敗：",
      error
    );

    throw error;
  }

  // 只有真正播放完成才標記為已播放。
  speakingDirectionPlayedParts.add(part);

  await delay(350);
}

let speakingAssessmentEngine = null;

let writingQuestions = [];
let currentWritingQuestionIndex = 0;


let writingCountdownInterval = null;
let writingRemainingSeconds = 0;
let writingQuestionSubmitting = false;
// V5.6.1：追蹤本次 Writing 已成功寫入 responses 的題目，避免計時跳 Part 時遺漏未送出的題目紀錄。
let savedWritingQuestionKeys = new Set();
let writingCurrentPartKey = null;

function getWritingPartKey(question, index) {
  if (
    question?.type === "write_sentence" ||
    index <= 4
  ) {
    return "writing_part_1";
  }

  if (
    question?.type ===
      "respond_written_request" ||
    index === 5 ||
    index === 6
  ) {
    return "writing_part_2";
  }

  return "writing_part_3";
}

function stopWritingCountdown() {
  if (writingCountdownInterval) {
    clearInterval(writingCountdownInterval);
    writingCountdownInterval = null;
  }
}

function startWritingPartCountdown(
  partKey,
  sharedSeconds
) {
  stopWritingCountdown();

  writingCurrentPartKey = partKey;

  writingRemainingSeconds =
    Math.max(
      0,
      Number(sharedSeconds) || 0
    );

  writingMainTimer.textContent =
    formatAssessmentTime(
      writingRemainingSeconds
    );

  if (writingRemainingSeconds <= 0) {
    writingMainTimer.textContent = "00:00";
    return;
  }

  writingCountdownInterval =
    setInterval(() => {
      writingRemainingSeconds -= 1;

      writingMainTimer.textContent =
        formatAssessmentTime(
          writingRemainingSeconds
        );

      if (writingRemainingSeconds <= 0) {
        stopWritingCountdown();

        handleWritingPartTimeout();
      }
    }, 1000);
}

function ensureWritingPartCountdown(
  question,
  index
) {
  const partKey =
    question.timerGroup ||
    getWritingPartKey(question, index);

  let sharedSeconds =
    Number(
      question.sharedResponseSeconds || 0
    );

  // 舊資料備援
  // 尚未設定 Supabase 共用時間時，
  // 仍依 TOEIC Writing 標準時間運作。
  if (sharedSeconds <= 0) {
    if (
      question.type === "write_sentence" ||
      index <= 4
    ) {
      sharedSeconds = 8 * 60;
    } else if (
      question.type ===
        "respond_written_request" ||
      index === 5 ||
      index === 6
    ) {
      sharedSeconds = 20 * 60;
    } else {
      sharedSeconds = 30 * 60;
    }
  }

  // 只有換到不同 timer_group 才重設時間。
  if (
    writingCurrentPartKey !== partKey
  ) {
    startWritingPartCountdown(
      partKey,
      sharedSeconds
    );
  } else {
    writingMainTimer.textContent =
      formatAssessmentTime(
        writingRemainingSeconds
      );
  }
}

function renderWritingQuestion(
  question,
  index,
  total
) {
  writingQuestionCounter.textContent =
    `Question ${index + 1} of ${total}`;

  writingAnswer.value = "";
  writingWordCount.textContent = "0";
  // 每一題各自從空白答案開始建立 Undo / Redo 歷史。
  if (typeof resetWritingHistory === "function") resetWritingHistory();

  // Writing Part 1–3：優先使用老師後台設定的固定 Directions。
  const writingPart = question.type === "write_sentence" ? 1
    : question.type === "respond_written_request" ? 2
    : question.type === "opinion_essay" ? 3 : null;
  const fallbackDirections = {
    1: "Directions: Write ONE sentence based on the picture. Use the TWO words or phrases under the picture. You may change the forms of the words and you may use them in any order.",
    2: "Directions: Read the information below. You will have 10 minutes to read and answer each e-mail.",
    3: "Directions: Read the question below. You have 30 minutes to plan, write, and revise your essay."
  };
  const savedPartDirection = writingPartDirections[writingPart];
  writingDirections.textContent =
    (savedPartDirection && savedPartDirection.text) ||
    question.directions ||
    fallbackDirections[writingPart] ||
    "Read the question and write your response.";

  writingQuestionContent.textContent = "";

  writingQuestionImage.classList.add("hidden");
  writingQuestionImage.removeAttribute("src");

  // Q1–5：圖片造句
  if (question.type === "write_sentence") {
    writingQuestionContent.textContent =
      question.promptText ||
      "Write one sentence based on the picture.";

    if (question.promptImagePath) {
      writingQuestionImage.src =
        question.promptImagePath;
      writingQuestionImage.classList.remove("hidden");
    }
  }

  // Q6–7：回覆書面要求（老師端 V5.19.2：完整 Email 題目可直接存於 image_url，作答要求存於 prompt）
  else if (question.type === "respond_written_request") {
    // passage 是舊版相容欄位；promptText 會映射老師端 question_bank.prompt。
    const part2Text = [question.passage || "", question.promptText || ""]
      .filter((value, index, arr) => value && arr.indexOf(value) === index)
      .join("\n\n");
    writingQuestionContent.textContent = part2Text;

    // V5.19.2 允許老師只上傳完整 Email 題目圖片，因此 Part 2 必須顯示 image_url。
    if (question.promptImagePath) {
      writingQuestionImage.src = question.promptImagePath;
      writingQuestionImage.classList.remove("hidden");
    }
  }

  // Q8：Opinion Essay（prompt 為題目；若老師有上傳 image_url 也一併顯示）
  else if (question.type === "opinion_essay") {
    writingQuestionContent.textContent =
      question.promptText ||
      question.passage ||
      "Write an essay in response to the question.";

    if (question.promptImagePath) {
      writingQuestionImage.src = question.promptImagePath;
      writingQuestionImage.classList.remove("hidden");
    }
  }

  ensureWritingPartCountdown(question, index);

  writingNextButton.textContent =
    index === total - 1 ? "Submit" : "Next";

  writingNextButton.disabled = false;
  writingAnswer.focus();
}

function getWritingPartNumber(question, index) {
  const key = getWritingPartKey(question, index);
  if (key === "writing_part_1") return 1;
  if (key === "writing_part_2") return 2;
  return 3;
}

function getWritingDirectionFallback(part) {
  const fallbacks = {
    1: {
      title: "Questions 1–5: Write a sentence based on a picture",
      text: "Directions: In this part of the test, you will write ONE sentence based on a picture. With each picture, you will be given TWO words or phrases that you must use in your sentence. You can change the forms of the words and use them in any order. Your sentence will be scored on appropriate grammar and relevance to the picture.\n\nYou will have 8 minutes to complete this part of the test."
    },
    2: {
      title: "Questions 6–7: Respond to a written request",
      text: "Directions: In this part of the test, you will write a response to an e-mail. Your response will be scored on the quality and variety of your sentences, vocabulary, and organization.\n\nQuestions 6 and 7 share a total response time of 20 minutes in this practice test."
    },
    3: {
      title: "Question 8: Write an opinion essay",
      text: "Directions: In this part of the test, you will write an essay in response to a question that asks you to state, explain, and support your opinion. An effective essay typically contains at least 300 words. Your response will be scored on support with reasons and/or examples, grammar, vocabulary, and organization.\n\nYou will have 30 minutes to plan, write, and revise your essay."
    }
  };
  return fallbacks[part] || { title: "Writing Directions", text: "Read the directions and click Continue to begin." };
}

function showWritingPartDirections(index) {
  pendingWritingPartIndex = index;
  const question = writingQuestions[index];
  if (!question) return;
  const part = getWritingPartNumber(question, index);
  const saved = writingPartDirections[part] || {};
  const fallback = getWritingDirectionFallback(part);
  writingDirectionsScreenTitle.textContent = saved.title || fallback.title;
  writingDirectionsScreenText.textContent = saved.text || fallback.text;
  showPage("writingDirectionsPage");
}

function beginPendingWritingPart() {
  const index = pendingWritingPartIndex;
  currentWritingQuestionIndex = index;
  showPage("writing");
  renderWritingQuestion(writingQuestions[index], index, writingQuestions.length);
}

function showWritingStartScreen() {
  stopWritingCountdown();
  writingCurrentPartKey = null;
  writingRemainingSeconds = 0;
  showPage("writingStart");
}

writingStartContinueButton?.addEventListener("click", () => showWritingPartDirections(0));
writingDirectionsContinueButton?.addEventListener("click", beginPendingWritingPart);
writingDirectionsContinueButtonBottom?.addEventListener("click", beginPendingWritingPart);

async function ensureAllWritingResponseRows() {
  // V5.6.1：完整模擬的學生紀錄必須保留每一題 Writing。
  // 若某題因 Part 時間到而來不及逐題按 Next，仍建立空白 text response，
  // 讓老師端可以看到該題，而不是整題從學生紀錄消失。
  for (const question of writingQuestions) {
    const key = String(question?.id || question?.code || question?.order || "");
    if (!key || savedWritingQuestionKeys.has(key)) continue;
    await saveWritingResponse(question, "");
  }
}

async function completeWritingTest(statusText) {
  deactivateAssessmentSecurityMode();
  stopWritingCountdown();

  await ensureAllWritingResponseRows();

  await updateTestSessionState(
    testData.sessionId,
    {
      status: "completed",
      currentQuestion: writingQuestions.length
    }
  );

  completedStudentName.textContent =
    testData.studentName;

  completedTestId.textContent =
    testData.testId;

  completedRecordingStatus.textContent =
    statusText || "寫作作答已完成";

  showPage("completed");
}

async function handleWritingPartTimeout() {
  if (writingQuestionSubmitting) {
    return;
  }

  const question =
    writingQuestions[currentWritingQuestionIndex];

  if (!question) {
    return;
  }

  writingQuestionSubmitting = true;
  writingNextButton.disabled = true;

  const timedOutPartKey =
    question.timerGroup ||
    getWritingPartKey(
      question,
      currentWritingQuestionIndex
    );

  try {
    // 先儲存時間到當下正在作答的題目
    await saveWritingResponse(
      question,
      writingAnswer.value
    );

    // 同一 Part 中尚未逐題送出的題目，也建立空白作答紀錄。
    // 例如 Part 1 時間到停在 Q4，Q5 仍會出現在老師端並標示為未作答。
    let skippedIndex = currentWritingQuestionIndex + 1;
    while (skippedIndex < writingQuestions.length) {
      const skippedQuestion = writingQuestions[skippedIndex];
      const skippedPartKey = skippedQuestion.timerGroup || getWritingPartKey(skippedQuestion, skippedIndex);
      if (skippedPartKey !== timedOutPartKey) break;
      await saveWritingResponse(skippedQuestion, "");
      skippedIndex += 1;
    }

    // 尋找下一個不同 timer_group 的題目
    let nextIndex =
      currentWritingQuestionIndex + 1;

    while (
      nextIndex < writingQuestions.length
    ) {
      const nextQuestion =
        writingQuestions[nextIndex];

      const nextPartKey =
        nextQuestion.timerGroup ||
        getWritingPartKey(
          nextQuestion,
          nextIndex
        );

      if (nextPartKey !== timedOutPartKey) {
        break;
      }

      nextIndex += 1;
    }

    // 已經沒有下一個 Part
    // 代表整份 Writing 測驗完成
    if (nextIndex >= writingQuestions.length) {
      await completeWritingTest(
        "寫作時間到，系統已自動送出"
      );

      return;
    }

    // 進入下一個 Part
    currentWritingQuestionIndex =
      nextIndex;

    writingCurrentPartKey = null;

    await updateCurrentQuestion(
      testData.sessionId,
      currentWritingQuestionIndex + 1
    );

    showWritingPartDirections(currentWritingQuestionIndex);

  } catch (error) {
    console.error(
      "Writing 時間到自動儲存失敗：",
      error
    );

    alert(
      "本題自動儲存失敗，請通知工作人員。"
    );

    writingNextButton.disabled = false;

  } finally {
    writingQuestionSubmitting = false;
  }
}

async function handleWritingSubmit() {
  if (writingQuestionSubmitting) {
    return;
  }

  const question =
    writingQuestions[currentWritingQuestionIndex];

  if (!question) {
    return;
  }

  writingQuestionSubmitting = true;
  writingNextButton.disabled = true;

  const answerText = writingAnswer.value;

  try {
    await saveWritingResponse(question, answerText);

    const isLastQuestion =
      currentWritingQuestionIndex >=
      writingQuestions.length - 1;

    if (isLastQuestion) {
      await completeWritingTest("寫作作答已完成");
      return;
    }

    const previousPartKey = question.timerGroup || getWritingPartKey(question, currentWritingQuestionIndex);
    currentWritingQuestionIndex += 1;

    await updateCurrentQuestion(
      testData.sessionId,
      currentWritingQuestionIndex + 1
    );

    const nextQuestion = writingQuestions[currentWritingQuestionIndex];
    const nextPartKey = nextQuestion.timerGroup || getWritingPartKey(nextQuestion, currentWritingQuestionIndex);
    if (nextPartKey !== previousPartKey) {
      stopWritingCountdown();
      writingCurrentPartKey = null;
      showWritingPartDirections(currentWritingQuestionIndex);
    } else {
      renderWritingQuestion(
        nextQuestion,
        currentWritingQuestionIndex,
        writingQuestions.length
      );
    }
  } catch (error) {
    console.error("Writing 作答儲存失敗：", error);
    writingNextButton.disabled = false;

    // 儲存失敗時不重設 Part 時間，只讓原倒數繼續。
    if (!writingCountdownInterval && writingRemainingSeconds > 0) {
      writingCountdownInterval = setInterval(() => {
        writingRemainingSeconds -= 1;
        writingMainTimer.textContent =
          formatAssessmentTime(writingRemainingSeconds);

        if (writingRemainingSeconds <= 0) {
          stopWritingCountdown();
          handleWritingPartTimeout();
        }
      }, 1000);
    }

    alert("本題儲存失敗，請確認網路連線後再試一次。");
  } finally {
    writingQuestionSubmitting = false;
  }
}

writingNextButton.addEventListener("click", () => {
  handleWritingSubmit();
});


function isFormalAssessmentPageActive() {
  return (
    assessmentSecurityActive &&
    (
      pages.speaking?.classList.contains("active") ||
      pages.writing?.classList.contains("active")
    )
  );
}


async function activateAssessmentSecurityMode() {
  try {
    sessionStorage.removeItem(
      "toeicAssessmentTerminated"
    );
    sessionStorage.removeItem(
      "toeicAssessmentTerminationReason"
    );
  } catch (error) {}

  assessmentSecurityActive = true;
  assessmentSecurityTerminating = false;
  assessmentFullscreenEntered = false;
  assessmentSecurityArmedAt = Date.now();

  // 瀏覽器無法真正禁止 Alt+Tab，但可在使用者點擊「開始測驗」時
  // 進入全螢幕，並偵測離開分頁、切換視窗或退出全螢幕。
  if (
    document.documentElement.requestFullscreen &&
    !document.fullscreenElement
  ) {
    try {
      await document.documentElement.requestFullscreen();
      assessmentFullscreenEntered = true;
    } catch (error) {
      console.warn(
        "無法進入全螢幕，仍會偵測切換分頁／視窗：",
        error
      );
    }
  } else if (document.fullscreenElement) {
    assessmentFullscreenEntered = true;
  }
}


function deactivateAssessmentSecurityMode() {
  assessmentSecurityActive = false;
  assessmentSecurityTerminating = false;
  assessmentFullscreenEntered = false;
  assessmentSecurityArmedAt = 0;
}


async function terminateAssessmentForFocusViolation(reason) {
  if (
    !isFormalAssessmentPageActive() ||
    assessmentSecurityTerminating
  ) {
    return;
  }

  // 避免剛啟動 fullscreen 的瞬間事件被誤判。
  if (
    assessmentSecurityArmedAt &&
    Date.now() - assessmentSecurityArmedAt < 900
  ) {
    return;
  }

  assessmentSecurityTerminating = true;
  assessmentSecurityActive = false;
  writingSecurityActive = false;

  // 先在本機立即標記違規。
  // 不等待網路，避免分頁進入背景後 fetch 被瀏覽器延遲。
  try {
    sessionStorage.setItem(
      "toeicAssessmentTerminated",
      "1"
    );
    sessionStorage.setItem(
      "toeicAssessmentTerminationReason",
      String(reason || "偵測到離開測驗畫面")
    );
  } catch (error) {}

  try {
    window.speechSynthesis?.cancel();
  } catch (error) {}

  try {
    if (speakingAssessmentEngine) {
      speakingAssessmentEngine.abort(
        "測驗因切換視窗而終止"
      );
      speakingAssessmentEngine = null;
    }
  } catch (error) {
    console.warn("終止口說 Engine 失敗：", error);
  }

  try {
    stopWritingCountdown();
  } catch (error) {}

  try {
    if (
      mediaRecorder &&
      mediaRecorder.state !== "inactive"
    ) {
      mediaRecorder.stop();
    }
  } catch (error) {
    console.warn("停止錄音失敗：", error);
  }

  try {
    stopMediaStream();
  } catch (error) {}

  // 關鍵修正：
  // 完成頁要「立即」切換，不可以先 await Supabase。
  completedStudentName.textContent =
    testData.studentName || "—";

  completedTestId.textContent =
    testData.testId || "—";

  completedRecordingStatus.textContent =
    `測驗已終止：${reason}`;

  showPage("completed");

  // 資料庫狀態改為 terminated。
  // 放在畫面終止之後執行，網路慢也不會讓學生繼續作答。
  try {
    await updateTestSessionState(
      testData.sessionId,
      {
        status: "completed"
      }
    );
  } catch (error) {
    console.warn(
      "寫入切換視窗終止狀態失敗：",
      error
    );
  }

  try {
    if (
      document.fullscreenElement &&
      document.exitFullscreen
    ) {
      await document.exitFullscreen();
    }
  } catch (error) {}

  assessmentSecurityTerminating = false;
}

document.addEventListener(
  "visibilitychange",
  () => {
    if (
      isFormalAssessmentPageActive() &&
      document.hidden
    ) {
      terminateAssessmentForFocusViolation(
        "偵測到切換分頁或離開測驗視窗"
      );
    }
  }
);


window.addEventListener(
  "blur",
  () => {
    if (!isFormalAssessmentPageActive()) {
      return;
    }

    // visibilitychange 是主判斷；
    // blur 補捉切換到其他應用程式／視窗的情況。
    window.setTimeout(() => {
      if (
        isFormalAssessmentPageActive() &&
        !document.hasFocus()
      ) {
        terminateAssessmentForFocusViolation(
          "偵測到切換至其他視窗或應用程式"
        );
      }
    }, 180);
  }
);


window.addEventListener(
  "focus",
  () => {
    let terminated = false;
    let reason = "";

    try {
      terminated =
        sessionStorage.getItem(
          "toeicAssessmentTerminated"
        ) === "1";

      reason =
        sessionStorage.getItem(
          "toeicAssessmentTerminationReason"
        ) || "偵測到切換視窗";
    } catch (error) {}

    if (
      terminated &&
      (
        pages.speaking?.classList.contains("active") ||
        pages.writing?.classList.contains("active")
      )
    ) {
      assessmentSecurityActive = true;
      assessmentSecurityTerminating = false;
      assessmentSecurityArmedAt = 0;

      terminateAssessmentForFocusViolation(
        reason
      );
    }
  }
);


document.addEventListener(
  "fullscreenchange",
  () => {
    if (
      !isFormalAssessmentPageActive() ||
      !assessmentFullscreenEntered
    ) {
      return;
    }

    if (!document.fullscreenElement) {
      terminateAssessmentForFocusViolation(
        "偵測到離開全螢幕模式"
      );
    }
  }
);


function isWritingPageActive() {
  return (
    writingSecurityActive &&
    pages.writing?.classList.contains("active")
  );
}

function filterEnglishWritingText(value) {
  // Writing 作答僅允許英文字母、空白/換行與英文標點。
  // 數字、中文、其他語系文字與 Emoji 一律移除。
  return String(value || "")
    .replace(
      /[^A-Za-z\s.,!?;:'"()\-\/&@#$%+*=_[\]{}]/g,
      ""
    );
}

function showWritingSecurityWarning(message) {
  if (!writingSecurityNotice) {
    return;
  }

  writingSecurityNotice.textContent =
    message;

  writingSecurityNotice.classList.remove(
    "hidden"
  );

  writingSecurityNotice.classList.add(
    "is-warning"
  );

  window.setTimeout(() => {
    writingSecurityNotice.classList.remove(
      "is-warning"
    );
  }, 1800);
}

function activateWritingSecurityMode() {
  writingSecurityActive = true;
  writingFocusViolationCount = 0;

  if (writingSecurityNotice) {
    writingSecurityNotice.textContent =
      "測驗進行中：僅可輸入英文字母與英文標點。請使用題目頁面的 Cut、Paste、Undo、Redo；禁止右鍵與鍵盤複製貼上快捷鍵。切換分頁、視窗或離開全螢幕將立即結束測驗。";

    writingSecurityNotice.classList.remove(
      "hidden"
    );
  }

  // PWA / Browser 都無法禁止作業系統 Alt+Tab；
  // 這裡使用全螢幕 + 離開偵測降低誤切。
  if (
    document.documentElement.requestFullscreen &&
    !document.fullscreenElement
  ) {
    document.documentElement
      .requestFullscreen()
      .catch(() => {});
  }
}

function deactivateWritingSecurityMode() {
  writingSecurityActive = false;

  if (
    document.fullscreenElement &&
    document.exitFullscreen
  ) {
    document.exitFullscreen()
      .catch(() => {});
  }
}

writingAnswer?.addEventListener(
  "beforeinput",
  (event) => {
    if (!isWritingPageActive()) {
      return;
    }

    if (
      event.inputType?.startsWith("delete") ||
      event.inputType === "historyUndo" ||
      event.inputType === "historyRedo"
    ) {
      return;
    }

    if (
      typeof event.data === "string" &&
      event.data &&
      filterEnglishWritingText(
        event.data
      ) !== event.data
    ) {
      event.preventDefault();

      showWritingSecurityWarning(
        "Writing 僅允許英文字母與英文標點符號。"
      );
    }
  }
);

writingAnswer?.addEventListener(
  "paste",
  (event) => {
    if (!isWritingPageActive()) return;
    event.preventDefault();
    showWritingSecurityWarning(
      "Writing 測驗期間禁止貼上內容。"
    );
  }
);

["copy", "cut"].forEach((eventName) => {
  writingAnswer?.addEventListener(eventName, (event) => {
    if (!isWritingPageActive()) return;
    event.preventDefault();
    showWritingSecurityWarning(
      "Writing 測驗期間禁止複製或剪下內容。"
    );
  });
});

writingAnswer?.addEventListener("drop", (event) => {
  if (!isWritingPageActive()) return;
  event.preventDefault();
  showWritingSecurityWarning(
    "Writing 測驗期間禁止拖曳文字或檔案。"
  );
});

// IME / 語音輸入等若繞過 beforeinput，仍在 input 階段再次清理。
writingAnswer?.addEventListener("input", () => {
  if (!isWritingPageActive()) return;
  const original = writingAnswer.value;
  const filtered = filterEnglishWritingText(original);
  if (filtered === original) return;
  const caret = writingAnswer.selectionStart ?? filtered.length;
  writingAnswer.value = filtered;
  writingAnswer.setSelectionRange(
    Math.min(caret, filtered.length),
    Math.min(caret, filtered.length)
  );
  showWritingSecurityWarning(
    "已移除非英文字母或非英文標點內容。"
  );
});

window.addEventListener("keydown", (event) => {
  if (!isWritingPageActive()) return;
  const key = String(event.key || "").toLowerCase();
  if ((event.ctrlKey || event.metaKey) && ["c", "v", "x", "z", "y"].includes(key)) {
    event.preventDefault();
    showWritingSecurityWarning(
      "請使用題目頁面的 Cut、Paste、Undo、Redo 按鈕操作。"
    );
  }
});

document.addEventListener(
  "contextmenu",
  (event) => {
    if (!isWritingPageActive()) {
      return;
    }

    event.preventDefault();

    showWritingSecurityWarning(
      "Writing 測驗期間已停用右鍵。"
    );
  }
);

// V5.5.2：Writing 與 Speaking 都改由全域正式測驗防切換機制處理。
// 一旦切換視窗／分頁或退出全螢幕，測驗會立即終止。


async function saveWritingResponse(
  question,
  answerText
) {
  const text =
    String(answerText || "").trim();

  const uploadId = generateUUID();

  await saveResponse({
    uploadId,
    sessionId: testData.sessionId,
    questionId: question.id || null,
    questionCodeSnapshot: question.code || null,
    questionOrder: question.order,
    questionNumber: question.order,
    responseType: "text",
    textResponse: text,
    recordingBucket: null,
    recordingPath: null,
    mimeType: null,
    fileSize: null,
    durationSeconds: null,
    uploadStatus: "uploaded",
    retryCount: 0,
    answeredAt: new Date().toISOString(),
    uploadedAt: new Date().toISOString()
  });

  await updateCurrentQuestion(
    testData.sessionId,
    question.order
  );

  const savedKey = String(question?.id || question?.code || question?.order || "");
  if (savedKey) savedWritingQuestionKeys.add(savedKey);

  console.log("Writing 作答已儲存：", {
    question: question.code,
    order: question.order,
    textLength: text.length
  });
}


const SPEAKING_PRACTICE_QUESTION = {
  title: "Practice Question",
  prompt:
    "Please introduce yourself briefly. Say your name and one thing you enjoy doing.",
  preparationSeconds: 5,
  responseSeconds: 10
};

function delay(ms) {
  return new Promise(
    (resolve) => window.setTimeout(resolve, ms)
  );
}

async function runPracticeCountdown(
  seconds,
  target,
  label
) {
  let remaining =
    Math.max(0, Number(seconds) || 0);

  target.textContent =
    formatAssessmentTime(remaining);

  assessmentStageText.textContent =
    label;

  while (remaining > 0) {
    await delay(1000);
    remaining -= 1;
    target.textContent =
      formatAssessmentTime(remaining);
  }
}

async function runSpeakingPracticeQuestion() {
  assessmentQuestionCounter.textContent =
    "Practice Question";

  assessmentPartLabel.textContent =
    "Practice";

  assessmentQuestionType.textContent =
    "Microphone practice";

  assessmentPromptText.textContent =
    SPEAKING_PRACTICE_QUESTION.prompt;

  assessmentPromptText.classList.remove(
    "hidden"
  );

  assessmentPromptImage.classList.add(
    "hidden"
  );

  assessmentAudioPrompt.classList.add(
    "hidden"
  );

  assessmentInformationCard.classList.add(
    "hidden"
  );

  preparationTimerValue.textContent =
    formatAssessmentTime(
      SPEAKING_PRACTICE_QUESTION.preparationSeconds
    );

  responseTimerValue.textContent =
    formatAssessmentTime(
      SPEAKING_PRACTICE_QUESTION.responseSeconds
    );

  assessmentRecordingDot.classList.remove(
    "active"
  );

  // Practice 使用與正式題完全相同的計時器亮燈邏輯。
  preparationTimerCard.classList.remove("hidden");
  responseTimerCard.classList.remove("hidden");
  preparationTimerCard.classList.add("active");
  responseTimerCard.classList.remove("active");

  assessmentStageText.textContent =
    "Begin preparing now";

  await playAssessmentVoiceCue(
    "Begin preparing now."
  );

  await runPracticeCountdown(
    SPEAKING_PRACTICE_QUESTION.preparationSeconds,
    preparationTimerValue,
    "Practice preparation"
  );

  assessmentStageText.textContent =
    "Begin speaking now";

  await playAssessmentVoiceCue(
    "Begin speaking now."
  );

  try {
    await playResponseStartSound();
  } catch (error) {
    console.warn(
      "Practice beep 播放失敗：",
      error
    );
  }

  assessmentStageText.textContent =
    "Practice recording";

  preparationTimerCard.classList.remove("active");
  responseTimerCard.classList.add("active");

  assessmentRecordingDot.classList.add(
    "active"
  );

  let practiceStream = null;
  let practiceRecorder = null;

  try {
    practiceStream =
      await navigator.mediaDevices.getUserMedia({
        audio: getSpeechAudioConstraints()
      });

    const practiceChunks = [];

    practiceRecorder =
      createSpeechMediaRecorder(
        practiceStream
      );

    practiceRecorder.addEventListener(
      "dataavailable",
      (event) => {
        if (event.data?.size > 0) {
          practiceChunks.push(event.data);
        }
      }
    );

    practiceRecorder.start();

    await runPracticeCountdown(
      SPEAKING_PRACTICE_QUESTION.responseSeconds,
      responseTimerValue,
      "Practice recording"
    );

    if (
      practiceRecorder.state !==
      "inactive"
    ) {
      practiceRecorder.stop();
    }

    // Practice 錄音只用於讓學生熟悉流程，不寫入正式 responses。
    await delay(180);

  } finally {
    practiceStream
      ?.getTracks()
      .forEach(
        (track) => track.stop()
      );

    assessmentRecordingDot.classList.remove(
      "active"
    );
    preparationTimerCard.classList.remove("active");
    responseTimerCard.classList.remove("active");
  }

  try {
    await playResponseFinishedSound();
  } catch (error) {
    console.warn(
      "Practice 結束音播放失敗：",
      error
    );
  }

  assessmentStageText.textContent =
    "Practice completed";

  await delay(700);
}


async function startWritingAssessmentPhase(preloadedQuestions = null) {
  stopWritingCountdown();
  writingQuestionSubmitting = false;
  savedWritingQuestionKeys = new Set();
  writingCurrentPartKey = null;
  writingRemainingSeconds = 0;

  showPage("writing");
  activateWritingSecurityMode();

  writingDirections.textContent = "Writing questions are loading...";
  writingQuestionContent.textContent = "題目載入中……";

  try {
    if (!Array.isArray(preloadedQuestions) || !preloadedQuestions.length) {
      const assessmentData = await loadWritingAssessmentQuestions();
      writingQuestions = assessmentData.questions;
    } else {
      writingQuestions = preloadedQuestions;
    }

    try {
      const directionRows = await loadWritingDirections();
      writingPartDirections = Object.fromEntries(
        directionRows.map(row => [Number(row.part_number), {
          title: String(row.title || "").trim(),
          text: String(row.directions_text || "").trim()
        }])
      );
    } catch (directionError) {
      console.warn("Writing Directions 載入失敗，改用內建預設值：", directionError);
      writingPartDirections = {};
    }

    currentWritingQuestionIndex = 0;

    await updateTestSessionState(testData.sessionId, {
      status: "in_progress",
      currentQuestion: 0,
      totalQuestions: writingQuestions.length
    });

    showWritingStartScreen();
  } catch (error) {
    console.error("Writing 測驗載入失敗：", error);
    writingDirections.textContent = "Writing Test";
    writingQuestionContent.textContent =
      error.message || "目前無法載入 Writing 題目，請通知工作人員。";
    writingMainTimer.textContent = "--:--";
  }
}

/**
 * 開始完整 11 題口說測驗
 */
beginTestButton.addEventListener(
  "click",
  async () => {
    beginTestButton.disabled = true;

    // 正式測驗開始即啟用防切換模式。
    await activateAssessmentSecurityMode();

    // =============================
    // Writing Only
    // =============================
    if (testData.testType === "writing") {
      await startWritingAssessmentPhase();
      return;
    }


    // =============================
    // Speaking / Full / Quick
    // =============================

    unlockAssessmentAudio();

    showPage("speaking");

    assessmentStageText.textContent =
      "Practice is starting";

    try {
      // Load the actual assessment questions before validating the relevant Directions.
      assessmentStageText.textContent =
        "Loading formal questions";

      let assessmentData;

      if (["full", "quick"].includes(testData.testType)) {
        const fullAssessmentData = testData.testType === "quick"
          ? await loadQuickAssessmentQuestions()
          : await loadFullAssessmentQuestions();

        writingQuestions = fullAssessmentData.writingQuestions;
        assessmentData = {
          source: fullAssessmentData.source,
          test: fullAssessmentData.test,
          questions: fullAssessmentData.speakingQuestions
        };
      } else {
        assessmentData = await loadSpeakingAssessmentQuestions();
      }


      // 依本次正式題目的 Part 載入 Directions，缺少時禁止開始。
      try {
        await prepareSpeakingDirections(assessmentData.questions);
      } catch (directionError) {
        console.error(
          "Directions are required:",
          directionError
        );

        assessmentStageText.textContent =
          "Directions unavailable";

        assessmentQuestionType.textContent =
          "Speaking Test";

        assessmentPromptText.textContent =
          directionError.message ||
          "Directions 無法載入，請通知工作人員。";

        assessmentPromptText.classList.remove(
          "hidden"
        );

        preparationTimerCard.classList.add(
          "hidden"
        );

        responseTimerCard.classList.add(
          "hidden"
        );

        beginTestButton.disabled = false;
        return;
      }

      await runSpeakingPracticeQuestion();

      console.log(
        "本次題目來源：",
        assessmentData.source
      );

      await updateTestSessionState(
        testData.sessionId,
        {
          status: "in_progress",
          currentQuestion: 0,
          totalQuestions:
            assessmentData.questions.length
        }
      );

      speakingAssessmentEngine =
        createSpeakingAssessmentEngine(
          assessmentData.questions
        );

      await speakingAssessmentEngine.start();

    } catch (error) {
      console.error(
        "口說測驗執行失敗：",
        error
      );

      assessmentStageText.textContent =
        "測驗發生錯誤，請通知工作人員。";

      completedRecordingStatus.textContent =
        "測驗未完整完成";
    }
  }
);


/**
 * 顯示測驗完成頁
 */
async function showCompletedPage() {
  deactivateAssessmentSecurityMode();

  await updateTestSessionState(
    testData.sessionId,
    {
      status: "completed",
      currentQuestion:
        speakingAssessmentEngine
          ?.questions?.length ||
        0
    }
  );

  completedStudentName.textContent =
    testData.studentName;

  completedTestId.textContent =
    testData.testId;

  if (
    formalRecordingBlob &&
    formalRecordingBlob.size > 0
  ) {
    completedRecordingStatus.textContent =
      "錄音成功";
  } else {
    completedRecordingStatus.textContent =
      "未偵測到錄音檔案";
  }

  showPage("completed");
}


/**
 * 返回首頁
 */
restartTestButton.addEventListener(
  "click",
  () => {
    deactivateAssessmentSecurityMode();
    window.speechSynthesis.cancel();

    if (speakingAssessmentEngine) {
      speakingAssessmentEngine.abort("返回首頁");
      speakingAssessmentEngine = null;
    }

    if (questionCountdownInterval) {
      clearInterval(
        questionCountdownInterval
      );

      questionCountdownInterval = null;
    }

    stopWritingCountdown();
    deactivateWritingSecurityMode();

    writingQuestions = [];
    currentWritingQuestionIndex = 0;
    writingQuestionSubmitting = false;
    writingRemainingSeconds = 0;
    writingCurrentPartKey = null;

    if (writingAnswer) {
      writingAnswer.value = "";
    }

    if (writingWordCount) {
      writingWordCount.textContent = "0";
    }

    if (writingMainTimer) {
      writingMainTimer.textContent = "00:00";
    }

    stopMediaStream();

    studentNameInput.value = "";
    testTypeSelect.value = "";

    speakerPassButton.disabled = true;
    microphonePassButton.disabled = true;
    recordAgainButton.disabled = true;
    startRecordingButton.disabled = false;
    beginTestButton.disabled = true;

    speakerStatus.textContent =
      "尚未播放測試聲音";

    directionStatus.textContent =
      "請先播放測驗說明音檔。";

    recordingPlayback.classList.add(
      "hidden"
    );

    finalRecordingPlayback.removeAttribute(
      "src"
    );

    showPage("start");
  }
);

microphoneHelpButton.addEventListener(
  "click",
  showMicrophoneHelp
);


closeDeviceHelpButton.addEventListener(
  "click",
  closeDeviceHelp
);


deviceHelpCancelButton.addEventListener(
  "click",
  closeDeviceHelp
);


retryDeviceTestButton.addEventListener(
  "click",
  () => {
    const type =
      currentDeviceHelpType;

    closeDeviceHelp();

    if (type === "speaker") {
      playSpeakerTestButton.click();
      return;
    }

    if (type === "microphone") {
      startMicrophoneTest();
    }
  }
);


deviceHelpBackdrop.addEventListener(
  "click",
  (event) => {
    if (
      event.target ===
      deviceHelpBackdrop
    ) {
      closeDeviceHelp();
    }
  }
);


window.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Escape" &&
      !deviceHelpBackdrop.classList
        .contains("hidden")
    ) {
      closeDeviceHelp();
    }
  }
);

// ========================================
// TOEIC Writing Answer Tools
// ========================================

let writingWordCountVisible = true;

// V5.5.5：測驗內部剪貼簿。只接受本答案框透過 Cut 按鈕剪下的文字，
// 不讀取 Windows / macOS 系統剪貼簿，避免外部內容透過 Paste 按鈕帶入。
let writingInternalClipboard = "";

// V5.5.6：Writing 內部 Undo / Redo 歷史，不依賴瀏覽器 execCommand。
let writingUndoStack = [];
let writingRedoStack = [];
let writingHistoryRestoring = false;

function getWritingSnapshot() {
  return {
    value: writingAnswer?.value ?? "",
    start: writingAnswer?.selectionStart ?? 0,
    end: writingAnswer?.selectionEnd ?? 0
  };
}

function resetWritingHistory() {
  writingUndoStack = [getWritingSnapshot()];
  writingRedoStack = [];
}

function recordWritingHistory() {
  if (writingHistoryRestoring || !writingAnswer) return;
  const next = getWritingSnapshot();
  const last = writingUndoStack[writingUndoStack.length - 1];
  if (last && last.value === next.value && last.start === next.start && last.end === next.end) return;
  writingUndoStack.push(next);
  if (writingUndoStack.length > 300) writingUndoStack.shift();
  writingRedoStack = [];
}

function restoreWritingSnapshot(snapshot) {
  if (!snapshot || !writingAnswer) return;
  writingHistoryRestoring = true;
  writingAnswer.value = snapshot.value;
  writingAnswer.focus();
  const max = writingAnswer.value.length;
  writingAnswer.setSelectionRange(
    Math.min(snapshot.start, max),
    Math.min(snapshot.end, max)
  );
  writingHistoryRestoring = false;
  updateWritingWordCount();
}


/**
 * 計算 Writing 字數
 */
function updateWritingWordCount() {
  const text = writingAnswer.value.trim();

  const count =
    text === ""
      ? 0
      : text.split(/\s+/).filter(Boolean).length;

  writingWordCount.textContent =
    String(count);
}


/**
 * Cut
 */
writingCutButton.addEventListener(
  "click",
  async () => {
    writingAnswer.focus();

    const start =
      writingAnswer.selectionStart;

    const end =
      writingAnswer.selectionEnd;

    if (start === end) {
      return;
    }

    const selectedText =
      writingAnswer.value.substring(
        start,
        end
      );

    writingInternalClipboard = filterEnglishWritingText(selectedText);

    writingAnswer.setRangeText(
      "",
      start,
      end,
      "start"
    );

    writingAnswer.dispatchEvent(
      new Event("input", {
        bubbles: true
      })
    );
  }
);


/**
 * Paste
 */
writingPasteButton.addEventListener(
  "click",
  async () => {
    writingAnswer.focus();

    if (!writingInternalClipboard) {
      showWritingSecurityWarning(
        "目前沒有可貼上的測驗內文字；請先使用 Cut 按鈕剪下答案內容。"
      );
      return;
    }

    const start = writingAnswer.selectionStart;
    const end = writingAnswer.selectionEnd;

    writingAnswer.setRangeText(
      writingInternalClipboard,
      start,
      end,
      "end"
    );

    writingAnswer.dispatchEvent(
      new Event("input", { bubbles: true })
    );
  }
);


/**
 * Undo
 */
writingUndoButton.addEventListener(
  "click",
  () => {
    writingAnswer.focus();
    if (writingUndoStack.length <= 1) return;
    const current = writingUndoStack.pop();
    writingRedoStack.push(current);
    restoreWritingSnapshot(writingUndoStack[writingUndoStack.length - 1]);
  }
);


/**
 * Redo
 */
writingRedoButton.addEventListener(
  "click",
  () => {
    writingAnswer.focus();
    if (!writingRedoStack.length) return;
    const next = writingRedoStack.pop();
    writingUndoStack.push(next);
    restoreWritingSnapshot(next);
  }
);


/**
 * 即時 Word Count
 */
writingAnswer.addEventListener(
  "input",
  () => {
    updateWritingWordCount();
    recordWritingHistory();
  }
);


/**
 * Hide / Show Word Count
 */
writingWordCountToggle.addEventListener(
  "click",
  () => {
    writingWordCountVisible =
      !writingWordCountVisible;

    writingWordCount.classList.toggle(
      "hidden",
      !writingWordCountVisible
    );

    writingWordCountToggle.textContent =
      writingWordCountVisible
        ? "Hide Word Count"
        : "Show Word Count";
  }
);

window.addEventListener(
  "DOMContentLoaded",
  async () => {
    console.log(
      "測驗模式：",
      isAssessmentDemoMode()
        ? "Demo 模式（縮短時間）"
        : "正式模式（使用老師設定時間）"
    );
    try {
      await testSupabaseConnection();
    } catch (error) {
      console.error(
        "網站目前無法讀取 Supabase：",
        error.message
      );
    }
  }
);


function installPart4TimerMirror() {
  if (window.__part4TimerMirrorInstalled) return;
  window.__part4TimerMirrorInstalled = true;

  const observeValue = (element, phase) => {
    if (!element) return;
    const observer = new MutationObserver(() => {
      const question = window.currentQuestion || window.currentSpeakingQuestion;
      if (!question || Number(question?.part) !== 4 || question?.type !== "respond_information") return;
      const raw = element.textContent || "";
      const match = raw.match(/(\d+):(\d+)/);
      if (!match) return;
      const seconds = Number(match[1]) * 60 + Number(match[2]);
      setPart4TimerBoardState(question, phase, seconds);
    });
    observer.observe(element, { childList: true, subtree: true, characterData: true });
  };

  const prepValue =
    document.getElementById("preparationTimer") ||
    document.getElementById("preparationTimerValue") ||
    preparationTimerCard?.querySelector(".timer-value, .assessment-timer-value, strong, span");

  const responseValue =
    document.getElementById("responseTimer") ||
    document.getElementById("responseTimerValue") ||
    responseTimerCard?.querySelector(".timer-value, .assessment-timer-value, strong, span");

  observeValue(prepValue, "prep");
  observeValue(responseValue, "response");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", installPart4TimerMirror);
} else {
  installPart4TimerMirror();
}

