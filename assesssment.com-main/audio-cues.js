"use strict";

let assessmentAudioContext = null;

function unlockAssessmentAudio() {
  if (!assessmentAudioContext) {
    assessmentAudioContext = new (
      window.AudioContext ||
      window.webkitAudioContext
    )();
  }

  if (
    assessmentAudioContext.state ===
    "suspended"
  ) {
    assessmentAudioContext.resume();
  }

  return assessmentAudioContext;
}

function playAssessmentBeep({
  frequency = 1000,
  duration = 180,
  volume = 0.14,
  gap = 0,
  count = 1
} = {}) {
  return new Promise((resolve) => {
    const context =
      unlockAssessmentAudio();

    const playOne = (index) => {
      const oscillator =
        context.createOscillator();

      const gain =
        context.createGain();

      const startAt =
        context.currentTime;

      oscillator.type = "sine";

      oscillator.frequency
        .setValueAtTime(
          frequency,
          startAt
        );

      gain.gain
        .setValueAtTime(
          0.0001,
          startAt
        );

      gain.gain
        .exponentialRampToValueAtTime(
          volume,
          startAt + 0.012
        );

      gain.gain
        .exponentialRampToValueAtTime(
          0.0001,
          startAt + duration / 1000
        );

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(startAt);
      oscillator.stop(
        startAt + duration / 1000
      );

      if (index + 1 < count) {
        window.setTimeout(
          () => playOne(index + 1),
          duration + gap
        );
      } else {
        window.setTimeout(
          resolve,
          duration + 30
        );
      }
    };

    playOne(0);
  });
}


function playAssessmentVoiceCue(text) {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    const message =
      new SpeechSynthesisUtterance(text);

    message.lang = "en-US";
    message.rate = 0.88;
    message.volume = 1;

    message.onend = resolve;
    message.onerror = () => resolve();

    try {
      window.speechSynthesis.speak(message);
    } catch (error) {
      console.warn(
        "Assessment voice cue failed:",
        error
      );
      resolve();
    }
  });
}

async function playPreparationFinishedSound() {
  await playAssessmentBeep({
    frequency: 1000,
    duration: 170,
    volume: 0.13
  });
}

async function playResponseStartSound() {
  await playAssessmentBeep({
    frequency: 1250,
    duration: 220,
    volume: 0.16
  });
}

async function playResponseFinishedSound() {
  await playAssessmentBeep({
    frequency: 700,
    duration: 135,
    volume: 0.13,
    gap: 75,
    count: 2
  });
}
