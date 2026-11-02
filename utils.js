"use strict";

/**
 * 產生 UUID
 */
function generateUUID() {

    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
      return globalThis.crypto.randomUUID();
    }
    throw new Error("此網址不支援安全錄音與 UUID。請在本機使用 http://localhost:5501，其他裝置請改用 HTTPS 網址。");

}

/**
 * 取得目前時間
 */
function nowISO() {

    return new Date().toISOString();

}
/**
 * 將 UTC 時間顯示為台灣時間
 */
function formatTaiwanTime(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "zh-TW",
    {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }
  ).format(date);
}


/**
 * 將秒數顯示為 mm:ss
 */
function formatAudioDuration(seconds) {
  const totalSeconds =
    Math.max(
      0,
      Math.round(Number(seconds) || 0)
    );

  const minutes =
    Math.floor(totalSeconds / 60);

  const remainingSeconds =
    totalSeconds % 60;

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(remainingSeconds).padStart(2, "0")
  );
}

/**
 * 讀取音檔 Blob 的實際時長
 */
function getAudioDuration(audioBlob) {
  return new Promise((resolve, reject) => {
    if (!audioBlob || audioBlob.size === 0) {
      reject(new Error("錄音檔案是空的。"));
      return;
    }

    const audio = document.createElement("audio");
    const audioUrl = URL.createObjectURL(audioBlob);

    audio.preload = "metadata";

audio.addEventListener(
  "loadedmetadata",
  () => {
    const finish = () => {
      const duration = audio.duration;

      if (Number.isFinite(duration) && duration > 0) {
        URL.revokeObjectURL(audioUrl);
        resolve(Number(duration.toFixed(2)));
      } else {
        URL.revokeObjectURL(audioUrl);
        reject(new Error("無法取得有效的音檔時長。"));
      }
    };

    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      finish();
      return;
    }

    // Chrome / WebM duration = Infinity 修正
    audio.currentTime = Number.MAX_SAFE_INTEGER;

    audio.addEventListener(
      "timeupdate",
      () => {
        audio.currentTime = 0;
        finish();
      },
      { once: true }
    );
  },
  { once: true }
);
    audio.addEventListener(
      "error",
      () => {
        URL.revokeObjectURL(audioUrl);

        reject(
          new Error("讀取音檔時長失敗。")
        );
      },
      { once: true }
    );

    audio.src = audioUrl;
  });
}