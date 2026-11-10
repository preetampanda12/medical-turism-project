/**
 * IRYNT BACKEND (free, on Google Sheets + Apps Script)
 * =====================================================
 * One Google Sheet holds everything:
 *   Cases     – every patient enquiry and its progress
 *   Updates   – timeline notes (internal, or visible to the patient)
 *   Partners  – hospitals, stays, cabs, assistants, pharmacies…
 *   Packages  – treatment plans (versions, draft / published)
 *   Team      – coordinators and their access keys
 *
 * SETUP (details in docs/01-setup-guide.md)
 *   1. New Google Sheet → Extensions → Apps Script → paste this file → Save.
 *   2. Set NOTIFY_EMAIL below (optional).
 *   3. Run "setup" once and allow permissions. Your admin ACCESS KEY is
 *      written in the "Team" sheet (also shown in the execution log).
 *   4. Deploy → New deployment → Web app
 *        Execute as: Me    |    Who has access: Anyone
 *      Copy the Web app URL into assets/config.js → sheetEndpoint.
 *   After editing this code: Deploy → Manage deployments → Edit → New version.
 */

var NOTIFY_EMAIL = ""; // e.g. "you@gmail.com" – leave empty to skip email alerts
var SLA_HOURS = 2;

var STATUSES = [
  "New", "Contacted", "Reports received", "Sent to hospitals",
  "Estimates received", "Package sent", "Confirmed", "In treatment",
  "Follow-up", "Closed - completed", "Closed - lost"
];

var CASE_COLS = [
  ["caseId", "Case ID"], ["submittedAt", "Submitted at"], ["filledFor", "Filled for"],
  ["contactName", "Contact name"], ["phone", "Phone"], ["email", "Email"],
  ["country", "Country"], ["city", "City"], ["patientName", "Patient name"],
  ["patientAge", "Age"], ["patientGender", "Gender"], ["condition", "Condition"],
  ["problem", "Problem"], ["diagnosed", "Diagnosed"], ["advised", "Treatment advised"],
  ["preferredCity", "Preferred city"], ["timeline", "Timeline"], ["budget", "Budget"],
  ["insurance", "Insurance"], ["services", "Services needed"], ["contactPref", "Contact via"],
  ["bestTime", "Best time"], ["consent", "Consent"], ["source", "Source"],
  ["status", "Status"], ["coordinator", "Coordinator"], ["firstContactAt", "First contact at"],
  ["minutesToContact", "Minutes to first contact"], ["hospitalsAsked", "Hospitals asked"],
  ["hospitalChosen", "Hospital chosen"], ["packageSentOn", "Package sent on"],
  ["nextAction", "Next action"], ["notes", "Notes"], ["trackToken", "Track token"],
  ["updatedAt", "Last updated"]
];
var INTAKE_KEYS = CASE_COLS.slice(0, 24).map(function (c) { return c[0]; });

var TABLES = {
  Cases: CASE_COLS,
  Updates: [["id", "ID"], ["caseId", "Case ID"], ["at", "At"], ["by", "By"],
            ["visibility", "Visibility"], ["text", "Text"]],
  Partners: [["id", "ID"], ["type", "Type"], ["name", "Name"], ["city", "City"], ["area", "Area"],
             ["contactPerson", "Contact person"], ["phone", "Phone"], ["email", "Email"],
             ["accreditation", "Accreditation"], ["specialties", "Specialties"], ["rate", "Rate"],
             ["rateUnit", "Rate unit"], ["terms", "Fee terms (internal)"],
             ["status", "Partnership status"], ["notes", "Notes"],
             ["lastContacted", "Last contacted"], ["updatedAt", "Last updated"]],
  Packages: [["id", "ID"], ["caseId", "Case ID"], ["version", "Version"], ["createdAt", "Created at"],
             ["createdBy", "Created by"], ["status", "Status"], ["json", "Plan JSON"]],
  Team: [["name", "Name"], ["email", "Email"], ["phone", "WhatsApp"], ["role", "Role"],
         ["key", "Access key"], ["active", "Active"]]
};

var DATE_KEYS = { submittedAt: 1, firstContactAt: 1, packageSentOn: 1, updatedAt: 1, at: 1, createdAt: 1, lastContacted: 1 };

// ---------------------------------------------------------------- setup

function setup() {
  Object.keys(TABLES).forEach(function (name) { sheet_(name); });
  var sh = sheet_("Cases");
  var col = function (key) { return headerIndex_(sh, key) + 1; };

  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(STATUSES, true).setAllowInvalid(false).build();
  sh.getRange(2, col("status"), 2000, 1).setDataValidation(statusRule);

  var overdue = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied("=AND($" + letter_(col("status")) + "2=\"New\", NOW()-$" +
      letter_(col("submittedAt")) + "2 > " + SLA_HOURS + "/24)")
    .setBackground("#F8D7DA")
    .setRanges([sh.getRange(2, 1, 2000, CASE_COLS.length)])
    .build();
  sh.setConditionalFormatRules([overdue]);
  sh.setFrozenColumns(1);
  sh.setColumnWidth(col("problem"), 320);

  if (readAll_("Team").length === 0) {
    var key = newKey_();
    insert_("Team", { name: "Admin", email: NOTIFY_EMAIL, phone: "", role: "admin", key: key, active: "Yes" });
    Logger.log("Your admin access key: " + key + "  (also saved in the Team sheet)");
  }
}

// ---------------------------------------------------------------- web entry points

function doGet() {
  return json_({ ok: true, data: { service: "irynt", time: new Date().toISOString() } });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var req = null;
    var pd = e && e.postData;
    if (pd && pd.contents && /json|text\/plain/i.test(pd.type || "")) {
      try { req = JSON.parse(pd.contents); } catch (ignore) { req = null; }
    }
    if (req && req.action) return json_({ ok: true, data: handle_(req) });
    return json_({ ok: true, data: intake_((e && e.parameter) || {}) });
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  } finally {
    lock.releaseLock();
  }
}

function handle_(req) {
  if (req.action === "track") return track_(req);
  if (req.action === "intake") return intake_(req.data || {});

  var user = auth_(req.key);
  switch (req.action) {
    case "login": return { name: user.name, role: user.role, phone: user.phone };
    case "listTeam": return readAll_("Team").filter(isActive_).map(function (t) {
      return { name: t.name, phone: t.phone, role: t.role };
    });
    case "listCases": return readAll_("Cases").map(strip_).sort(byDesc_("submittedAt"));
    case "getCase": return getCase_(req.caseId);
    case "createCase": return createCase_(req.data || {}, user);
    case "updateCase": return updateCase_(req.caseId, req.patch || {}, user);
    case "addUpdate": return addUpdate_(req.caseId, req.text, req.visibility, user.name);
    case "listPartners": return readAll_("Partners").map(strip_).sort(function (a, b) {
      return String(a.type).localeCompare(String(b.type)) || String(a.name).localeCompare(String(b.name));
    });
    case "savePartner": return savePartner_(req.partner || {});
    case "deletePartner": return deleteById_("Partners", req.id);
    case "savePackage": return savePackage_(req.caseId, req.plan, !!req.publish, user);
    default: throw new Error("Unknown action: " + req.action);
  }
}

// ---------------------------------------------------------------- cases

function intake_(p) {
  var data = {};
  INTAKE_KEYS.forEach(function (k) { if (p[k] != null) data[k] = p[k]; });
  if (data.caseId && findBy_("Cases", "caseId", data.caseId)) {
    return strip_(findBy_("Cases", "caseId", data.caseId));
  }
  data.trackToken = /^[a-f0-9]{16,64}$/i.test(String(p.trackToken || "")) ? String(p.trackToken) : "";
  data.source = data.source || "website";
  var c = createCase_(data, null);
  notify_(c);
  return { caseId: c.caseId };
}

function createCase_(data, user) {
  var now = new Date();
  var c = {};
  CASE_COLS.forEach(function (col) { c[col[0]] = data[col[0]] != null ? data[col[0]] : ""; });
  c.caseId = c.caseId || newCaseId_();
  c.submittedAt = c.submittedAt ? new Date(c.submittedAt) : now;
  if (isNaN(c.submittedAt.getTime())) c.submittedAt = now;
  c.status = STATUSES.indexOf(c.status) >= 0 ? c.status : "New";
  c.trackToken = c.trackToken || newToken_();
  c.source = c.source || (user ? "dashboard" : "website");
  c.coordinator = c.coordinator || (user && user.role !== "admin" ? user.name : "");
  c.minutesToContact = "";
  c.updatedAt = now;
  insert_("Cases", c);
  addUpdate_(c.caseId, "We have received your request. A coordinator will contact you shortly.", "patient", "Irynt");
  return strip_(findBy_("Cases", "caseId", c.caseId));
}

function getCase_(caseId) {
  var c = findBy_("Cases", "caseId", caseId);
  if (!c) throw new Error("Case not found");
  return {
    "case": strip_(c),
    updates: readAll_("Updates").filter(function (u) { return u.caseId === caseId; }).map(strip_).sort(byAsc_("at")),
    packages: readAll_("Packages").filter(function (p) { return p.caseId === caseId; }).map(function (p) {
      var o = strip_(p); o.plan = parse_(p.json); delete o.json; return o;
    }).sort(function (a, b) { return Number(b.version) - Number(a.version); })
  };
}

function updateCase_(caseId, patch, user) {
  var c = findBy_("Cases", "caseId", caseId);
  if (!c) throw new Error("Case not found");
  var locked = { caseId: 1, trackToken: 1, submittedAt: 1, source: 1, minutesToContact: 1, updatedAt: 1, _row: 1 };
  var oldStatus = c.status;
  Object.keys(patch).forEach(function (k) {
    if (locked[k] || !CASE_COLS.some(function (col) { return col[0] === k; })) return;
    c[k] = patch[k];
  });
  if (STATUSES.indexOf(c.status) < 0) c.status = oldStatus;

  if (c.status !== oldStatus) {
    if (oldStatus === "New" && !c.firstContactAt) c.firstContactAt = new Date().toISOString();
    addUpdate_(caseId, "Status: " + oldStatus + " → " + c.status, "internal", user.name);
  }
  if (c.firstContactAt && c.minutesToContact === "") {
    var mins = Math.round((new Date(c.firstContactAt) - new Date(c.submittedAt)) / 60000);
    c.minutesToContact = isNaN(mins) ? "" : Math.max(0, mins);
  }
  c.updatedAt = new Date();
  write_("Cases", c);
  return strip_(findBy_("Cases", "caseId", caseId));
}

function addUpdate_(caseId, text, visibility, by) {
  if (!findBy_("Cases", "caseId", caseId)) throw new Error("Case not found");
  text = String(text || "").trim();
  if (!text) throw new Error("Update text is empty");
  var u = { id: newToken_().slice(0, 12), caseId: caseId, at: new Date(), by: by || "",
            visibility: visibility === "patient" ? "patient" : "internal", text: text };
  insert_("Updates", u);
  return strip_(findBy_("Updates", "id", u.id));
}

// ---------------------------------------------------------------- partners

function savePartner_(p) {
  var existing = p.id ? findBy_("Partners", "id", p.id) : null;
  if (p.id && !existing) throw new Error("Partner not found");
  var obj = existing || {};
  TABLES.Partners.forEach(function (col) { if (p[col[0]] != null && col[0] !== "id") obj[col[0]] = p[col[0]]; });
  if (!String(obj.name || "").trim()) throw new Error("Partner name is required");
  obj.updatedAt = new Date();
  if (existing) { write_("Partners", obj); }
  else { obj.id = "P-" + newToken_().slice(0, 8); insert_("Partners", obj); }
  return strip_(findBy_("Partners", "id", obj.id));
}

function deleteById_(table, id) {
  var row = findBy_(table, "id", id);
  if (!row) throw new Error("Not found");
  sheet_(table).deleteRow(row._row);
  return { deleted: id };
}

// ---------------------------------------------------------------- packages

function savePackage_(caseId, plan, publish, user) {
  var c = findBy_("Cases", "caseId", caseId);
  if (!c) throw new Error("Case not found");
  if (!plan || typeof plan !== "object") throw new Error("Plan is empty");
  var version = readAll_("Packages").filter(function (p) { return p.caseId === caseId; }).length + 1;
  var now = new Date();
  plan.caseId = caseId;
  plan.version = version;
  plan.createdAt = now.toISOString();
  var rec = { id: "PK-" + newToken_().slice(0, 8), caseId: caseId, version: version, createdAt: now,
              createdBy: user.name, status: publish ? "published" : "draft", json: JSON.stringify(plan) };
  insert_("Packages", rec);

  if (publish) {
    var patch = { packageSentOn: now.toISOString() };
    if (STATUSES.indexOf(c.status) < STATUSES.indexOf("Package sent")) patch.status = "Package sent";
    var chosen = (plan.hospitalOptions || []).map(function (h) { return h.hospital; }).filter(String).join(", ");
    if (chosen && !c.hospitalsAsked) patch.hospitalsAsked = chosen;
    updateCase_(caseId, patch, user);
    addUpdate_(caseId, "Your treatment plan (version " + version + ") is ready. Please review it below.", "patient", user.name);
  }
  var out = strip_(findBy_("Packages", "id", rec.id));
  out.plan = plan; delete out.json;
  return out;
}

// ---------------------------------------------------------------- public tracking

function track_(req) {
  var c = findBy_("Cases", "caseId", String(req.caseId || "").trim().toUpperCase());
  if (!c || !req.token || String(c.trackToken) !== String(req.token)) throw new Error("Case not found. Please check your link.");
  var team = readAll_("Team");
  var coord = team.filter(function (t) { return t.name && t.name === c.coordinator; })[0];
  var published = readAll_("Packages").filter(function (p) {
    return p.caseId === c.caseId && p.status === "published";
  }).sort(function (a, b) { return Number(b.version) - Number(a.version); })[0];
  return {
    caseId: c.caseId,
    patientFirstName: String(c.patientName || "").split(" ")[0],
    condition: c.condition,
    status: c.status,
    submittedAt: iso_(c.submittedAt),
    coordinator: c.coordinator ? { name: c.coordinator, phone: coord ? String(coord.phone || "") : "" } : null,
    updates: readAll_("Updates").filter(function (u) {
      return u.caseId === c.caseId && u.visibility === "patient";
    }).map(function (u) { return { at: iso_(u.at), text: u.text, by: u.by }; }).sort(byAsc_("at")),
    plan: published ? parse_(published.json) : null
  };
}

// ---------------------------------------------------------------- helpers

function auth_(key) {
  if (!key) throw new Error("Please sign in");
  var u = readAll_("Team").filter(function (t) {
    return t.key && String(t.key) === String(key) && isActive_(t);
  })[0];
  if (!u) throw new Error("Invalid access key");
  return u;
}

function isActive_(t) { return String(t.active).toLowerCase() !== "no" && t.active !== false; }

function notify_(c) {
  if (!NOTIFY_EMAIL) return;
  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: "New Irynt case " + c.caseId + " – " + c.condition + " – call within " + SLA_HOURS + "h",
      body: "Case: " + c.caseId + "\nName: " + c.contactName + " (" + c.filledFor + ")\nPhone: " + c.phone +
        "  |  Prefers: " + c.contactPref + ", " + c.bestTime + "\nFrom: " + c.city + ", " + c.country +
        "\nPatient: " + c.patientName + ", " + c.patientAge + "\nCondition: " + c.condition +
        "\nProblem: " + c.problem + "\nNeeds: " + c.services + "\n\nOpen sheet: " +
        SpreadsheetApp.getActiveSpreadsheet().getUrl()
    });
  } catch (ignore) { /* email quota or permission – the row is saved anyway */ }
}

function sheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  var cols = TABLES[name];
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, cols.length).setValues([cols.map(function (c) { return c[1]; })])
      .setFontWeight("bold").setBackground("#0E5E6F").setFontColor("#FFFFFF");
    sh.setFrozenRows(1);
  } else {
    // Add any missing columns (e.g. after upgrading from Phase 1).
    var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    cols.forEach(function (c) {
      if (headers.indexOf(c[1]) < 0) {
        headers.push(c[1]);
        sh.getRange(1, headers.length, 1, 1).setValues([[c[1]]]);
      }
    });
  }
  return sh;
}

function keyForHeader_(table, header) {
  var hit = TABLES[table].filter(function (c) { return c[1] === header; })[0];
  return hit ? hit[0] : null;
}

function headerIndex_(sh, key) {
  var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var col = CASE_COLS.filter(function (c) { return c[0] === key; })[0];
  return headers.indexOf(col[1]);
}

function readAll_(table) {
  var sh = sheet_(table);
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  var keys = values[0].map(function (h) { return keyForHeader_(table, h); });
  var out = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    if (row.every(function (v) { return v === "" || v == null; })) continue;
    var o = { _row: r + 1 };
    keys.forEach(function (k, i) { if (k) o[k] = DATE_KEYS[k] ? iso_(row[i]) : row[i]; });
    out.push(o);
  }
  return out;
}

function findBy_(table, key, value) {
  if (value == null || value === "") return null;
  return readAll_(table).filter(function (o) { return String(o[key]) === String(value); })[0] || null;
}

function rowFor_(table, sh, obj) {
  var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  return headers.map(function (h) {
    var k = keyForHeader_(table, h);
    if (!k) return "";
    var v = obj[k];
    if (v == null) return "";
    if (DATE_KEYS[k] && v !== "") { var d = new Date(v); return isNaN(d.getTime()) ? "" : d; }
    return k === "json" ? String(v) : clean_(v);
  });
}

function insert_(table, obj) {
  var sh = sheet_(table);
  sh.appendRow(rowFor_(table, sh, obj));
}

function write_(table, obj) {
  var sh = sheet_(table);
  var row = rowFor_(table, sh, obj);
  sh.getRange(obj._row, 1, 1, row.length).setValues([row]);
}

function strip_(o) {
  var c = {};
  Object.keys(o).forEach(function (k) { if (k !== "_row") c[k] = o[k]; });
  return c;
}

// Prevent spreadsheet formula injection and cap length.
function clean_(v) {
  if (typeof v === "number" || typeof v === "boolean" || v instanceof Date) return v;
  var s = String(v).slice(0, 5000);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function iso_(v) {
  if (v instanceof Date) return isNaN(v.getTime()) ? "" : v.toISOString();
  return v == null ? "" : String(v);
}

function parse_(s) { try { return JSON.parse(s); } catch (e) { return null; } }
function byDesc_(k) { return function (a, b) { return String(b[k]).localeCompare(String(a[k])); }; }
function byAsc_(k) { return function (a, b) { return String(a[k]).localeCompare(String(b[k])); }; }

function newToken_() { return Utilities.getUuid().replace(/-/g, ""); }
function newKey_() { return "irk_" + newToken_().slice(0, 20); }

function newCaseId_() {
  var d = new Date();
  var ymd = String(d.getFullYear()).slice(2) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
  var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (var tries = 0; tries < 20; tries++) {
    var id = "IRY-" + ymd + "-";
    for (var i = 0; i < 4; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
    if (!findBy_("Cases", "caseId", id)) return id;
  }
  throw new Error("Could not create a case ID");
}

function letter_(n) {
  var s = "";
  while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
