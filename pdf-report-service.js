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

  async createAudioLinks({ responses, questions }) {
    const endpoint = `${SUPABASE_CONFIG.url}/functions/v1/report-audio`;
    const session = (await supabaseClient.auth.getSession()).data.session;
    if (!session?.access_token) throw new Error("請先重新登入老師端，再匯出含音檔的成績單。");
    const items = [];
    const qMap = new Map(questions.map(q => [q.id, q]));
    for (const r of responses) {
      if (r.recording_path) items.push({ key: `${r.id}:student`, kind: "student", responseId: r.id });
      const q = qMap.get(r.question_id);
      if (q?.audio_url) items.push({ key: `${r.id}:question`, kind: "question", responseId: r.id });
    }
    if (!items.length) return {};
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}`, "apikey": SUPABASE_CONFIG.publishableKey },
      body: JSON.stringify({ items })
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || `音檔 QR Code 產生失敗 (${res.status})`);
    return body.links || {};
  },

  async createQrImages(links) {
    if (!window.QRCode?.toDataURL) throw new Error("QR Code 本機套件未載入，請重新整理網頁後再試。");
    const result = {};
    await Promise.all(Object.entries(links).map(async ([key, url]) => {
      result[key] = await window.QRCode.toDataURL(url, { width: 160, margin: 1, errorCorrectionLevel: "M" });
    }));
    return result;
  },

  build({ session, responses, questions, scores, aiAssessments = [], audioQrImages = {}, audioLinks = {} }) {
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
    const assessmentMap = new Map(
      (aiAssessments || []).map((item) => [item.response_id, item])
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

    const questionDetails = responses.map((response) => {
      const question = qMap.get(response.question_id);
      const score = sMap.get(response.id);
      const image = String(question?.image_url || "").trim();
      let imageHtml = "";
      if (image && !/^(?:data:|javascript:|blob:|\/\/)/i.test(image)) {
        const url = /^https:\/\//i.test(image)
          ? image
          : new URL(image.replace(/^\/+/, ""), new URL("./", window.location.href)).href;
        imageHtml = `<img class="question-image" src="${this.e(url)}" alt="題目圖片"/>`;
      }
      const assessment = assessmentMap.get(response.id) || {};
      const originalTranscript = String(assessment.original_transcript || assessment.raw_transcript || assessment.ai_transcript || assessment.transcript || "").trim();
      // Only a separately stored teacher revision is shown as a corrected version.
      const correctedTranscript = String(assessment.teacher_corrected_transcript || assessment.corrected_transcript || assessment.confirmed_transcript || "").trim();
      const transcriptHtml = response.recording_path ? `
        <div class="review-section"><div class="review-label">01 / STUDENT'S ORIGINAL TRANSCRIPT <span>學生原始逐字稿</span></div><div class="review-body original">${this.e(originalTranscript || "尚無逐字稿")}</div></div>
        <div class="review-section"><div class="review-label">02 / TEACHER'S CORRECTED VERSION <span>老師完整修正版</span></div><div class="review-body corrected">${this.e(correctedTranscript || "")}</div></div>
        <div class="review-section"><div class="review-label">03 / TEACHER'S FEEDBACK <span>老師評語與建議</span></div><div class="review-body feedback">${this.e(score?.teacher_comment || "")}</div></div>` : `
        <div class="review-section"><div class="review-label">STUDENT'S RESPONSE <span>學生作答</span></div><div class="review-body original">${this.e(response.text_response || "未提供作答內容")}</div></div>`;
      const qrHtml = [
        ["question", "題目音檔 / Question Audio"],
        ["student", "學生原始錄音 / Student Recording"]
      ].map(([kind, label]) => {
        const key = `${response.id}:${kind}`;
        const img = audioQrImages[key];
        const link = audioLinks[key];
        return img && link ? `<div class="audio-qr"><img src="${this.e(img)}" alt="${this.e(label)} QR Code"/><strong>${this.e(label)}</strong><small>掃描播放 · 30 天內有效</small><a href="${this.e(link)}">開啟音檔</a></div>` : "";
      }).join("");
      return `<section class="question-detail">
        <h3>Question ${this.e(response.question_order)} — ${this.e(question?.question_code || response.question_code_snapshot || "")}</h3>
        <div><strong>題目：</strong>${this.e(question?.title || question?.prompt || question?.passage || "題目內容未儲存")}</div>
        ${question?.directions ? `<div><strong>Directions：</strong>${this.e(question.directions)}</div>` : ""}
        ${question?.passage && question?.prompt ? `<div>${this.e(question.passage)}</div>` : ""}
        ${imageHtml}
        ${qrHtml ? `<div class="audio-qr-list">${qrHtml}</div>` : ""}
        ${transcriptHtml}
      </section>`;
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
.question-detail{break-inside:auto;border:1px solid #e4dced;padding:12px;margin:12px 0;border-radius:8px}.question-detail h3{font-size:12px;margin:0 0 8px}.question-detail div{white-space:pre-wrap;overflow-wrap:anywhere;margin:5px 0}.question-image{display:block;max-width:100%;max-height:230px;object-fit:contain;margin:9px 0}.answer{padding:8px;background:#f7f3fc;border-radius:6px}
.review-section{margin:13px 0;break-inside:avoid;page-break-inside:avoid}
.review-label{padding:7px 10px;border-left:3px solid #6d4cbe;background:#eee9f7;color:#503c7a;font-size:10px;font-weight:800}
.review-label span{float:right;color:#756e7f;font-size:9px;font-weight:600}
.review-body{padding:12px 14px;border:1px solid #e4dced;border-top:0;white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px;line-height:1.85}
.review-body.original{background:#fbfaff}.review-body.corrected{background:#fff}.review-body.feedback{background:#f9f7fc}
.audio-qr-list{display:flex;flex-wrap:wrap;gap:16px;margin:10px 0}.audio-qr{width:148px;display:flex;flex-direction:column;align-items:center;gap:3px;border:1px solid #ded7e7;padding:7px;border-radius:8px;text-align:center}.audio-qr img{width:110px;height:110px}.audio-qr strong{font-size:9px}.audio-qr small,.audio-qr a{font-size:8px;overflow-wrap:anywhere}
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
<h2>題目與學生作答</h2>
${questionDetails}
<footer class="footer"><span>Aspect English - TOEIC SW Assessment Platform</span><span>本報告為老師評閱結果，非 ETS 官方成績單。</span></footer>
<script>window.addEventListener("load",()=>setTimeout(()=>window.print(),300));</script>
</body>
</html>`;
  },

  async export(data) {
    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      throw new Error("瀏覽器封鎖了報告視窗，請允許彈出式視窗。");
    }
    reportWindow.document.write("<p style=\"font-family:sans-serif;padding:24px\">正在建立安全音檔連結與 QR Code，請稍候…</p>");
    try {
      const audioLinks = await this.createAudioLinks(data);
      const audioQrImages = await this.createQrImages(audioLinks);
      reportWindow.document.open();
      reportWindow.document.write(this.build({ ...data, audioLinks, audioQrImages }));
      reportWindow.document.close();
    } catch (error) {
      reportWindow.close();
      throw error;
    }
  }
};
