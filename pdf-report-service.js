"use strict";

const PdfReportService = {
  e(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  },

  date(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("zh-TW", {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(date);
  },

  averages(scores) {
    const result = {};
    const keys = [
      "pronunciation",
      "intonation",
      "grammar",
      "vocabulary",
      "content",
      "overall"
    ];

    keys.forEach((key) => {
      const values = scores
        .map((score) => Number(score?.[key]))
        .filter(Number.isFinite);

      result[key] = values.length
        ? Number(
            (
              values.reduce((sum, value) => sum + value, 0) /
              values.length
            ).toFixed(2)
          )
        : null;
    });

    return result;
  },

  estimateToeicScore(overall) {
    const value = Number(overall);
    if (!Number.isFinite(value)) return null;
    const bounded = Math.min(5, Math.max(0, value));
    return Math.round((((bounded / 5) * 200) / 10)) * 10;
  },

  build({ session, responses, questions, scores, aiAssessments = [] }) {
    const qMap = new Map(
      questions.map((question) => [question.id, question])
    );

    const sMap = new Map(
      scores.map((score) => [score.response_id, score])
    );

    const avg = this.averages(scores);
    const estimatedToeicScore = this.estimateToeicScore(avg.overall);
    const totalScoreText = estimatedToeicScore === null
      ? "— / 200"
      : `${estimatedToeicScore} / 200`;
    const transcriptMap = new Map(
      (aiAssessments || []).map((item) => [item.response_id, item.transcript || ""])
    );
    const teachers = [
      ...new Set(
        scores
          .map((score) => score.teacher_name)
          .filter(Boolean)
      )
    ];

    const rows = responses.map((response) => {
      const question = qMap.get(response.question_id);
      const score = sMap.get(response.id);
      const code =
        question?.question_code ||
        response.question_code_snapshot ||
        `Q${response.question_order}`;
      const title =
        question?.title ||
        question?.prompt ||
        question?.passage ||
        "Speaking Question";

      return `
        <tr>
          <td><strong>${this.e(code)}</strong><span>${this.e(title)}</span></td>
          <td>${score?.pronunciation ?? "—"}</td>
          <td>${score?.intonation ?? "—"}</td>
          <td>${score?.grammar ?? "—"}</td>
          <td>${score?.vocabulary ?? "—"}</td>
          <td>${score?.content ?? "—"}</td>
          <td><strong>${score?.overall ?? "—"}</strong></td>
          <td>${this.e(score?.teacher_comment || "—")}</td>
        </tr>`;
    }).join("");

    return `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<title>${this.e(session.student_name_snapshot || "Student")} TOEIC Speaking Report</title>
<style>
@page{size:A4;margin:14mm}
*{box-sizing:border-box}
body{margin:0;color:#2f2939;background:#fff;font-family:"Microsoft JhengHei","Noto Sans TC",Arial,sans-serif;font-size:11px;line-height:1.5}
.header{padding-bottom:15px;display:flex;justify-content:space-between;gap:22px;border-bottom:2px solid #6d4cbe}
.brand{color:#6d4cbe;font-size:12px;font-weight:900;letter-spacing:.08em}
h1{margin:6px 0 3px;font-size:24px}.muted{color:#756e7f}
.hero{min-width:165px;padding:12px 16px;color:#fff;background:#6d4cbe;border-radius:14px;text-align:center}
.hero span,.hero strong,.hero small{display:block}.hero span{font-size:9px}.hero strong{font-size:28px}.hero small{margin-top:4px;font-size:8px;opacity:.9}
.total-score{margin-top:14px;padding:13px 16px;display:flex;align-items:center;justify-content:space-between;gap:16px;border:2px solid #6d4cbe;border-radius:12px;background:#f7f3ff}
.total-score span{font-size:10px;font-weight:800;color:#5f4b89}.total-score strong{font-size:24px;color:#6d4cbe}
.score-note{margin-top:7px;color:#756e7f;font-size:8px}
.meta{margin-top:16px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.card{padding:9px 10px;background:#f7f4fb;border:1px solid #e8e2ef;border-radius:9px}
.card span,.card strong{display:block}.card span{color:#766f80;font-size:8px;font-weight:700}.card strong{margin-top:3px;font-size:10px;word-break:break-word}
h2{margin:19px 0 8px;font-size:14px}
.abilities{display:grid;grid-template-columns:repeat(6,1fr);gap:7px}
.ability{padding:9px 6px;border:1px solid #ded7e7;border-radius:9px;text-align:center}
.ability span,.ability strong{display:block}.ability span{color:#756e7f;font-size:7.5px;font-weight:700}.ability strong{margin-top:4px;color:#6d4cbe;font-size:17px}
table{width:100%;border-collapse:collapse;table-layout:fixed}thead{display:table-header-group}tr{page-break-inside:avoid}
th,td{padding:6px 5px;vertical-align:top;border:1px solid #ded7e7}th{background:#f1ecf8;font-size:7.5px}td{font-size:8px}
td:first-child{width:22%}td:first-child strong,td:first-child span{display:block}td:first-child span{color:#756e7f}
th:not(:first-child),td:not(:first-child){text-align:center}th:last-child,td:last-child{width:22%;text-align:left}
.footer{margin-top:16px;padding-top:9px;display:flex;justify-content:space-between;color:#81798a;border-top:1px solid #ded7e7;font-size:7.5px}
.notice{margin-bottom:12px;padding:9px;background:#f1ecf8;border-radius:8px;text-align:center}
@media print{.notice{display:none}}
</style>
</head>
<body>
<div class="notice">請在列印視窗選擇「另存為 PDF」。</div>
<header class="header">
  <div><div class="brand">ASPECT ENGLISH</div><h1>TOEIC Speaking Report</h1><div class="muted">Teacher-reviewed speaking assessment</div></div>
  <div class="hero"><span>Overall / 5</span><strong>${avg.overall ?? "—"}</strong><small>Estimated TOEIC ${totalScoreText}</small></div>
</header>
<section class="meta">
  <div class="card"><span>學生姓名</span><strong>${this.e(session.student_name_snapshot || "未填姓名")}</strong></div>
  <div class="card"><span>測驗類型</span><strong>${this.e(session.test_type || "speaking")}</strong></div>
  <div class="card"><span>測驗編號</span><strong>${this.e(session.test_id_text || "—")}</strong></div>
  <div class="card"><span>測驗時間</span><strong>${this.e(this.date(session.started_at))}</strong></div>
  <div class="card"><span>完成題數</span><strong>${responses.length}</strong></div>
  <div class="card"><span>已評分題數</span><strong>${scores.length} / ${responses.length}</strong></div>
  <div class="card"><span>評分老師</span><strong>${this.e(teachers.join("、") || "—")}</strong></div>
  <div class="card"><span>產生時間</span><strong>${this.e(this.date(new Date().toISOString()))}</strong></div>
</section>
<section class="total-score">
  <span>ESTIMATED TOEIC TOTAL SCORE</span>
  <strong>${totalScoreText}</strong>
</section>
<div class="score-note">分數由本系統老師評分 Overall 換算為 0–200 預估分數，並四捨五入至 10 分級距；非 ETS 官方成績。</div>
<h2>能力平均</h2>
<section class="abilities">
  ${[
    ["Pronunciation", avg.pronunciation],
    ["Intonation", avg.intonation],
    ["Grammar", avg.grammar],
    ["Vocabulary", avg.vocabulary],
    ["Content", avg.content],
    ["Overall", avg.overall]
  ].map(([label, value]) => `<div class="ability"><span>${label}</span><strong>${value ?? "—"}</strong></div>`).join("")}
</section>
<h2>逐題評分</h2>
<table>
<thead><tr><th>題目</th><th>Pron.</th><th>Int.</th><th>Gram.</th><th>Vocab.</th><th>Content</th><th>Overall</th><th>老師評語</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<footer class="footer"><span>Aspect English - TOEIC SW Assessment Platform</span><span>本報告為老師評閱結果，非 ETS 官方成績單。</span></footer>
<script>window.addEventListener("load",()=>setTimeout(()=>window.print(),300));</script>
</body>
</html>`;
  },

  export(data) {
    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      throw new Error("瀏覽器封鎖了報告視窗，請允許彈出式視窗。");
    }
    reportWindow.document.open();
    reportWindow.document.write(this.build(data));
    reportWindow.document.close();
  }
};
