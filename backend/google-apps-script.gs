/**
 * IRYNT CASE TRACKER (free backend on Google Sheets)
 * ---------------------------------------------------
 * Every website enquiry becomes a row in the "Cases" sheet, and you get
 * an email alert. See docs/01-setup-guide.md (Step 3) for setup.
 *
 * 1. Create a new Google Sheet named "Irynt Cases".
 * 2. Extensions → Apps Script → paste this whole file → Save.
 * 3. Set NOTIFY_EMAIL below.
 * 4. Run the "setup" function once (allow permissions).
 * 5. Deploy → New deployment → Web app
 *      Execute as: Me   |   Who has access: Anyone
 *    Copy the Web app URL into assets/config.js → sheetEndpoint.
 */

var NOTIFY_EMAIL = ""; // e.g. "you@gmail.com" (leave empty to skip email alerts)
var SHEET_NAME = "Cases";
var SLA_HOURS = 2;

var FORM_FIELDS = [
  "caseId", "submittedAt", "filledFor", "contactName", "phone", "email",
  "country", "city", "patientName", "patientAge", "patientGender",
  "condition", "problem", "diagnosed", "advised", "preferredCity",
  "timeline", "budget", "insurance", "services", "contactPref",
  "bestTime", "consent", "source"
];

var HEADERS = [
  "Case ID", "Submitted at", "Filled for", "Contact name", "Phone", "Email",
  "Country", "City", "Patient name", "Age", "Gender",
  "Condition", "Problem", "Diagnosed", "Treatment advised", "Preferred city",
  "Timeline", "Budget", "Insurance", "Services needed", "Contact via",
  "Best time", "Consent", "Source",
  // Coordinator columns (filled by your team)
  "Status", "Coordinator", "First contact at", "Minutes to first contact",
  "Hospitals asked", "Hospital chosen", "Package sent on", "Next action", "Notes"
];

var STATUSES = [
  "New", "Contacted", "Reports received", "Sent to hospitals",
  "Estimates received", "Package sent", "Confirmed", "In treatment",
  "Follow-up", "Closed - completed", "Closed - lost"
];

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    .setFontWeight("bold").setBackground("#0E5E6F").setFontColor("#FFFFFF");
  sh.setFrozenRows(1);
  sh.setFrozenColumns(1);

  var col = function (name) { return HEADERS.indexOf(name) + 1; };

  // Status dropdown
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(STATUSES, true).setAllowInvalid(false).build();
  sh.getRange(2, col("Status"), 1000, 1).setDataValidation(statusRule);

  // Highlight "New" cases older than the SLA in red
  var statusLetter = columnLetter(col("Status"));
  var submittedLetter = columnLetter(col("Submitted at"));
  var overdue = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied("=AND($" + statusLetter + "2=\"New\", NOW()-$" + submittedLetter + "2 > " + SLA_HOURS + "/24)")
    .setBackground("#F8D7DA")
    .setRanges([sh.getRange(2, 1, 1000, HEADERS.length)])
    .build();
  sh.setConditionalFormatRules([overdue]);

  sh.getRange(2, col("Submitted at"), 1000, 1).setNumberFormat("dd-mmm-yyyy hh:mm");
  sh.getRange(2, col("First contact at"), 1000, 1).setNumberFormat("dd-mmm-yyyy hh:mm");
  sh.setColumnWidth(col("Problem"), 320);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var p = (e && e.parameter) || {};
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) { setup(); sh = ss.getSheetByName(SHEET_NAME); }

    var row = FORM_FIELDS.map(function (k) {
      var v = clean(p[k]);
      if (k === "submittedAt") return v ? new Date(v) : new Date();
      return v;
    });
    // Coordinator columns: Status = New, the rest blank.
    var firstContactCol = HEADERS.indexOf("First contact at") + 1;
    var submittedCol = HEADERS.indexOf("Submitted at") + 1;
    row.push("New", "", "", "", "", "", "", "", "");

    sh.appendRow(row);
    var r = sh.getLastRow();
    // Minutes to first contact, calculated once the coordinator fills "First contact at"
    sh.getRange(r, HEADERS.indexOf("Minutes to first contact") + 1).setFormula(
      "=IF(" + columnLetter(firstContactCol) + r + "=\"\",\"\",ROUND((" +
      columnLetter(firstContactCol) + r + "-" + columnLetter(submittedCol) + r + ")*1440))"
    );

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: "New Irynt case " + clean(p.caseId) + " – " + clean(p.condition) + " – call within " + SLA_HOURS + "h",
        body:
          "Case: " + clean(p.caseId) + "\n" +
          "Name: " + clean(p.contactName) + " (" + clean(p.filledFor) + ")\n" +
          "Phone: " + clean(p.phone) + "  |  Prefers: " + clean(p.contactPref) + ", " + clean(p.bestTime) + "\n" +
          "From: " + clean(p.city) + ", " + clean(p.country) + "\n" +
          "Patient: " + clean(p.patientName) + ", " + clean(p.patientAge) + "\n" +
          "Condition: " + clean(p.condition) + "\n" +
          "Problem: " + clean(p.problem) + "\n" +
          "Needs: " + clean(p.services) + "\n\n" +
          "Open sheet: " + ss.getUrl()
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Prevent spreadsheet formula injection and trim long input.
function clean(v) {
  var s = String(v == null ? "" : v).slice(0, 5000);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function columnLetter(n) {
  var s = "";
  while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}
