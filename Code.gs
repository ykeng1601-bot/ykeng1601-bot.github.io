/**
 * 안전보건 교육 앱 — 학습 기록 수신 (Google Apps Script)
 *   기록 : 보낼 때마다 한 줄 (시간, 이름, 기기, 언어, 종류, 내용, 점수, 읽은 단원 수, 학습 시간(분), 누적 학습 시간(분))
 *   요약 : 사람(이름+기기)별 한 줄 (읽은 단원 수, 퀴즈 최고점, 총 학습 시간(분), 마지막 기록)
 */
const LOG = "기록";
const SUM = "요약";
const LANG = { ko: "한국어", tl: "Filipino", th: "ไทย", vi: "Tiếng Việt" };
const LOG_HEAD = ["시간", "이름", "기기", "언어", "종류", "내용", "점수", "읽은 단원 수", "학습 시간(분)", "누적 학습 시간(분)"];
const SUM_HEAD = ["이름", "기기", "언어", "읽은 단원 수", "전체 단원", "퀴즈 최고점", "총 학습 시간(분)", "마지막 기록"];

function sheet_(name, header) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(header);
    sh.setFrozenRows(1);
  }
  sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight("bold").setBackground("#F5B800");
  return sh;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents || "{}");
    const name = String(d.name || "").slice(0, 40).trim();
    if (!name) return out_("no name");
    const dev = String(d.dev || "").slice(0, 8);
    const when = d.time ? new Date(d.time) : new Date();
    const lang = LANG[d.lang] || d.lang || "";
    const kind = { register: "이름 등록", lesson: "단원 완료", time: "학습", quiz: "퀴즈" }[d.type] || d.type;
    const what = (d.type === "lesson" || d.type === "time") ? String(d.title || d.id || "") : "";
    const score = d.type === "quiz" ? d.score + " / " + d.total : "";
    const min = d.min != null ? Number(d.min) : "";
    const totalMin = d.totalMin != null ? Number(d.totalMin) : "";

    sheet_(LOG, LOG_HEAD).appendRow([when, name, dev, lang, kind, what, score, d.count || "", min, totalMin]);

    const sum = sheet_(SUM, SUM_HEAD);
    const rows = sum.getDataRange().getValues();
    let r = rows.findIndex((x, i) => i > 0 && x[0] === name && String(x[1]) === dev);
    if (r < 0) { sum.appendRow([name, dev, lang, 0, d.total || "", "", 0, when]); r = sum.getLastRow(); } else { r += 1; }
    const cur = sum.getRange(r, 1, 1, 8).getValues()[0];
    if (d.count != null) cur[3] = Math.max(Number(cur[3]) || 0, Number(d.count) || 0);
    if (d.type === "lesson" && d.total) cur[4] = d.total;
    if (d.type === "quiz") cur[5] = Math.max(Number(cur[5]) || 0, Number(d.score) || 0);
    if (totalMin !== "") cur[6] = Math.max(Number(cur[6]) || 0, totalMin);
    cur[2] = lang; cur[7] = when;
    sum.getRange(r, 1, 1, 8).setValues([cur]);
    return out_("ok");
  } catch (err) {
    return out_("error: " + err);
  } finally {
    lock.releaseLock();
  }
}

function doGet() { return out_("safety-edu log ok"); }
function out_(t) { return ContentService.createTextOutput(t).setMimeType(ContentService.MimeType.TEXT); }
