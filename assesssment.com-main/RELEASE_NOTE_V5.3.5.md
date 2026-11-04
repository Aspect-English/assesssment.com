# V5.3.5 — Part 3 Sequential Questions

- Part 3 Q5–Q7 are revealed sequentially.
- While Q5 is active, Q6/Q7 are not rendered; while Q6 is active, Q7 is not rendered.
- The next question appears only after the current response timer ends, recording stops, and the response is saved.
- Part 3 supports per-question response times from the teacher question bank (e.g. Q5 15s, Q6 15s, Q7 30s).
- Part 3 uses a 3-second preparation fallback when preparation_time is 0/empty.
- Part 3 prompt order: question playback -> Begin preparing now -> preparation countdown -> Begin speaking now -> beep -> recording/response countdown.
- Part 3 can show a shared scenario/context from the question bank `passage` field plus the current question from `prompt`.

## Teacher setup
For Q5/Q6/Q7 set:
- question_code containing P3, e.g. SPK-P3-Q5 / Q6 / Q7
- question_type: respond_question
- passage: shared scenario/context (same text may be stored on all 3 questions)
- prompt: only that question's text
- preparation_time: 3
- response_time: 15 / 15 / 30 (or another value as needed)
