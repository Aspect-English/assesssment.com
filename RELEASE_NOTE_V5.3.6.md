# V5.3.6 – Part 3 Backend Builder

- Teacher Question Editor now detects Speaking / Respond to Questions (Part 3).
- Adds a Part 3 batch builder for Q5, Q6, Q7.
- Shared Situation/Passage is entered once.
- Default timings: Q5 3/15, Q6 3/15, Q7 3/30.
- Generates question codes containing `-P3-` so the student app resolves Part 3 correctly.
- Questions are saved as three normal `question_bank` records, so existing Test Builder and editing flows continue to work.
- After creation, teachers can edit each question to upload its own audio.
