/**
 * 안전보건 교육 앱 — 학습 기록 수신 (Google Apps Script)
 * 시트 2개를 자동으로 만듭니다.
 *   기록 : 한 번 보낼 때마다 한 줄 (시간, 이름, 기기, 언어, 종류, 내용, 점수, 읽은 단원 수)
 *   요약 : 사람(이름+기기)별 한 줄 (읽은 단원 수, 퀴즈 최고점, 마지막 기록)
 */
const LOG = "기록";
const SUM = "요약";
const LANG = { ko: "한국어", tl: "Filipino", th: "ไทย", vi: "Tiếng Việt" };

function sheet_(name, header) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(header);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, header.length).setFontWeight("bold").setBackground("#F5B800");
  }
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
    const kind = { register: "이름 등록", lesson: "단원 완료", quiz: "퀴즈" }[d.type] || d.type;
    const what = d.type === "lesson" ? String(d.title || d.id || "") : "";
    const score = d.type === "quiz" ? d.score + " / " + d.total : "";

    sheet_(LOG, ["시간", "이름", "기기", "언어", "종류", "내용", "점수", "읽은 단원 수"])
      .appendRow([when, name, dev, lang, kind, what, score, d.count || ""]);

    const sum = sheet_(SUM, ["이름", "기기", "언어", "읽은 단원 수", "전체 단원", "퀴즈 최고점", "마지막 기록"]);
    const rows = sum.getDataRange().getValues();
    let r = rows.findIndex((x, i) => i > 0 && x[0] === name && String(x[1]) === dev);
    if (r < 0) { sum.appendRow([name, dev, lang, 0, d.total || "", "", when]); r = sum.getLastRow(); } else { r += 1; }
    const cur = sum.getRange(r, 1, 1, 7).getValues()[0];
    if (d.count != null) cur[3] = Math.max(Number(cur[3]) || 0, Number(d.count) || 0);
    if (d.type === "lesson" && d.total) cur[4] = d.total;
    if (d.type === "quiz") cur[5] = Math.max(Number(cur[5]) || 0, Number(d.score) || 0);
    cur[2] = lang; cur[6] = when;
    sum.getRange(r, 1, 1, 7).setValues([cur]);
    return out_("ok");
  } catch (err) {
    return out_("error: " + err);
  } finally {
    lock.releaseLock();
  }
}

function doGet() { return out_("safety-edu log ok"); }
function out_(t) { return ContentService.createTextOutput(t).setMimeType(ContentService.MimeType.TEXT); }
