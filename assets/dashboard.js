/* Irynt coordinator dashboard: cases, case detail, package builder, partners. */
(function () {
  "use strict";
  var I = window.Irynt, A = window.IryntAPI, cfg = window.IRYNT_CONFIG || {};
  var esc = I.esc;
  var SLA_MIN = (cfg.responseHours || 2) * 60;
  var root = document.getElementById("root");
  var dlg = document.getElementById("dlg");

  var S = { user: null, team: [], cases: [], partners: [],
            filters: { q: "", status: "", coord: "", overdue: false, active: true },
            pfilters: { q: "", type: "", city: "", status: "" } };

  // ------------------------------------------------------------ utils
  function $(sel, el) { return (el || document).querySelector(sel); }
  function $$(sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); }
  function badge(status) { return '<span class="badge b-' + esc(String(status).replace(/[^a-z]/gi, "-")) + '">' + esc(status) + "</span>"; }
  function opts(list, selected, blank) {
    return (blank != null ? '<option value="">' + esc(blank) + "</option>" : "") +
      list.map(function (v) { return "<option" + (String(v) === String(selected) ? " selected" : "") + ">" + esc(v) + "</option>"; }).join("");
  }
  function toast(msg, err) {
    $$(".toast").forEach(function (old) { old.parentNode.removeChild(old); });
    var t = document.createElement("div");
    t.className = "toast" + (err ? " err" : "");
    t.setAttribute("role", "status");
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, err ? 5000 : 2600);
  }
  function fail(e) {
    if (e && e.auth) { A.setKey(""); S.user = null; renderLogin(e.message); return; }
    toast((e && e.message) || "Something went wrong", true);
  }
  function busy(btn, on, label) {
    if (!btn) return;
    if (on) { btn.dataset.label = btn.textContent; btn.disabled = true; btn.textContent = label || "Saving…"; }
    else { btn.disabled = false; btn.textContent = btn.dataset.label || btn.textContent; }
  }
  function copy(text) {
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(
      function () { toast("Copied"); },
      function () { window.prompt("Copy this:", text); });
  }
  function slaCell(c) {
    if (c.status === "New") {
      var m = I.minutesSince(c.submittedAt);
      return m > SLA_MIN ? '<span class="sla sla-late">Overdue ' + I.duration(m - SLA_MIN) + "</span>"
        : '<span class="sla sla-ok">Due in ' + I.duration(SLA_MIN - m) + "</span>";
    }
    if (c.minutesToContact !== "" && c.minutesToContact != null) {
      var late = Number(c.minutesToContact) > SLA_MIN;
      return '<span class="sla ' + (late ? "sla-late" : "sla-done") + '">Contacted in ' + I.duration(c.minutesToContact) + "</span>";
    }
    return "";
  }
  function isClosed(s) { return /^Closed/.test(s); }
  function coordPhone(name) {
    var t = S.team.filter(function (x) { return x.name === name; })[0];
    return t && t.phone ? String(t.phone) : (cfg.whatsappNumber || "");
  }
  function openDialog(html, wide) {
    dlg.className = "dlg" + (wide ? " dlg-wide" : "");
    dlg.innerHTML = html;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    var first = $("input, select, textarea", dlg); if (first) first.focus();
  }
  function closeDialog() { if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); }
  dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.closest("[data-close]")) closeDialog(); });

  function printPlan(plan) {
    var area = $("#print-area");
    area.innerHTML = I.renderPlan(plan);
    document.body.classList.add("printing");
    var done = function () { document.body.classList.remove("printing"); window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    setTimeout(function () { window.print(); }, 50);
    setTimeout(done, 3000);
  }

  // ------------------------------------------------------------ shell
  function shell(active, inner) {
    var demo = A.mode === "demo";
    root.innerHTML =
      (demo ? '<div class="demo-bar"><b>Demo mode.</b> Sample data, stored only in this browser. Connect your Google Sheet in <code>assets/config.js</code> to go live. <button type="button" data-act="reset-demo">Reset demo data</button></div>' : "") +
      '<header class="topbar"><div class="inner">' +
      '<a class="brand" href="#/cases"><img src="assets/logo.svg" alt="">irynt</a>' +
      '<nav class="topnav"><a href="#/cases" class="' + (active === "cases" ? "active" : "") + '">Cases</a>' +
      '<a href="#/partners" class="' + (active === "partners" ? "active" : "") + '">Partners</a>' +
      '<a href="index.html" target="_blank" rel="noopener">Website ↗</a></nav>' +
      '<div class="who">' + (demo ? '<span class="mode-badge">DEMO</span>' : "") +
      '<span class="who-name">' + esc(S.user.name) + "</span>" +
      '<button type="button" data-act="logout">Sign out</button></div>' +
      "</div></header>" +
      '<main class="page" id="page">' + (inner || '<div class="spinner">Loading…</div>') + "</main>";
  }

  root.addEventListener("click", function (e) {
    var a = e.target.closest("[data-act]");
    if (!a) return;
    if (a.dataset.act === "logout") { A.setKey(""); S.user = null; location.hash = ""; renderLogin(); }
    if (a.dataset.act === "reset-demo" && confirm("Reset all demo data?")) { A.resetDemo(); A.setKey(""); location.hash = ""; location.reload(); }
  });

  // ------------------------------------------------------------ login
  function renderLogin(msg) {
    var demo = A.mode === "demo";
    root.innerHTML = '<div class="login-wrap"><form class="login" id="login-form">' +
      '<div class="brand"><img src="assets/logo.svg" alt="">irynt</div>' +
      "<h1 style=\"font-size:1.4rem\">Coordinator sign in</h1>" +
      (msg ? '<p class="error-msg show">' + esc(msg) + "</p>" : "") +
      (demo ? '<p class="muted">No Google Sheet is connected yet, so this is a <b>demo</b> with sample data stored only in this browser.</p>' +
        '<button type="button" class="btn btn-primary" style="width:100%" id="demo-btn">Open demo dashboard</button><div class="or">or sign in with an access key</div>' : "") +
      '<div class="field"><label for="key">Access key</label><input type="text" id="key" autocomplete="off" placeholder="irk_…" required></div>' +
      '<button class="btn ' + (demo ? "btn-light" : "btn-primary") + '" style="width:100%">Sign in</button>' +
      '<p class="muted" style="margin-top:14px">Your access key is in the <b>Team</b> sheet of your Google Sheet.</p>' +
      "</form></div>";
    $("#login-form").addEventListener("submit", function (e) {
      e.preventDefault();
      login($("#key").value.trim(), e.submitter);
    });
    var d = $("#demo-btn");
    if (d) d.addEventListener("click", function () { A.demoKey().then(function (k) { login(k, d); }); });
  }

  function login(key, btn) {
    if (!key) return;
    busy(btn, true, "Signing in…");
    A.setKey(key);
    A.call("login").then(function (u) {
      S.user = u;
      return A.call("listTeam");
    }).then(function (team) {
      S.team = team;
      if (!location.hash || location.hash === "#") location.hash = "#/cases"; else route();
    }).catch(function (e) { A.setKey(""); busy(btn, false); renderLogin(e.message); });
  }

  // ------------------------------------------------------------ router
  function route() {
    if (!S.user) return;
    var h = location.hash.replace(/^#\/?/, "").split("/");
    if (h[0] === "case" && h[1] && h[2] === "plan") return renderBuilder(decodeURIComponent(h[1]));
    if (h[0] === "case" && h[1]) return renderCase(decodeURIComponent(h[1]));
    if (h[0] === "partners") return renderPartners();
    return renderCases();
  }
  window.addEventListener("hashchange", route);

  // ------------------------------------------------------------ cases list
  function renderCases() {
    shell("cases");
    A.call("listCases").then(function (cases) {
      S.cases = cases;
      drawCases();
    }).catch(fail);
  }

  function filteredCases() {
    var f = S.filters, q = f.q.toLowerCase();
    return S.cases.filter(function (c) {
      if (f.status && c.status !== f.status) return false;
      if (!f.status && f.active && isClosed(c.status)) return false;
      if (f.coord === "__none" && c.coordinator) return false;
      if (f.coord && f.coord !== "__none" && c.coordinator !== f.coord) return false;
      if (f.overdue && !(c.status === "New" && I.minutesSince(c.submittedAt) > SLA_MIN)) return false;
      if (q) {
        var hay = [c.caseId, c.patientName, c.contactName, c.phone, c.city, c.country, c.condition, c.problem].join(" ").toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
  }

  function drawCases() {
    var f = S.filters;
    var counts = {};
    S.cases.forEach(function (c) { counts[c.status] = (counts[c.status] || 0) + 1; });
    var overdue = S.cases.filter(function (c) { return c.status === "New" && I.minutesSince(c.submittedAt) > SLA_MIN; }).length;
    var list = filteredCases();

    var html = '<div class="page-head"><div><h1>Cases</h1><div class="sub">' + S.cases.length + " total · " +
      (overdue ? '<b style="color:#B3261E">' + overdue + " overdue</b>" : "none overdue") + "</div></div>" +
      '<button class="btn btn-primary" id="new-case">+ New case</button></div>' +
      '<div class="pipeline">' + I.STATUSES.filter(function (s) { return !isClosed(s); }).map(function (s) {
        return '<button type="button" data-status="' + esc(s) + '" class="' + (f.status === s ? "on" : "") + '"><b>' + (counts[s] || 0) + "</b>" + esc(s) + "</button>";
      }).join("") + "</div>" +
      '<div class="filters">' +
      '<input type="search" id="f-q" placeholder="Search name, phone, case ID, city…" value="' + esc(f.q) + '" aria-label="Search cases">' +
      '<select id="f-status" aria-label="Status">' + opts(I.STATUSES, f.status, "All open statuses") + "</select>" +
      '<select id="f-coord" aria-label="Coordinator"><option value="">All coordinators</option><option value="__none"' + (f.coord === "__none" ? " selected" : "") + ">Unassigned</option>" +
      S.team.map(function (t) { return "<option" + (f.coord === t.name ? " selected" : "") + ">" + esc(t.name) + "</option>"; }).join("") + "</select>" +
      '<label class="inline-check"><input type="checkbox" id="f-overdue"' + (f.overdue ? " checked" : "") + "> Overdue only</label>" +
      '<label class="inline-check"><input type="checkbox" id="f-active"' + (f.active ? " checked" : "") + "> Hide closed</label>" +
      "</div>" +
      '<div class="table-wrap"><table class="data"><thead><tr><th>Case</th><th>Patient</th><th>Condition</th><th>From</th><th>Status</th><th>Coordinator</th><th>Response</th><th>Next action</th></tr></thead><tbody>' +
      (list.length ? list.map(function (c) {
        return '<tr class="click" data-case="' + esc(c.caseId) + '" tabindex="0">' +
          "<td><b>" + esc(c.caseId) + "</b><small>" + esc(I.fmtDateTime(c.submittedAt)) + "</small></td>" +
          "<td>" + esc(c.patientName) + "<small>" + esc([c.patientAge, c.patientGender].filter(Boolean).join(", ")) + "</small></td>" +
          "<td>" + esc(c.condition) + "</td>" +
          "<td>" + esc(c.city) + "<small>" + esc(c.country) + "</small></td>" +
          "<td>" + badge(c.status) + "</td>" +
          "<td>" + (c.coordinator ? esc(c.coordinator) : '<span class="muted">Unassigned</span>') + "</td>" +
          "<td>" + slaCell(c) + "</td>" +
          "<td>" + esc(c.nextAction || "") + "</td></tr>";
      }).join("") : '<tr><td colspan="8" class="empty">No cases match these filters.</td></tr>') +
      "</tbody></table></div>";
    $("#page").innerHTML = html;

    $$(".pipeline button").forEach(function (b) {
      b.addEventListener("click", function () { f.status = f.status === b.dataset.status ? "" : b.dataset.status; drawCases(); });
    });
    $("#f-q").addEventListener("input", function (e) { f.q = e.target.value; redrawKeepFocus("#f-q"); });
    $("#f-status").addEventListener("change", function (e) { f.status = e.target.value; drawCases(); });
    $("#f-coord").addEventListener("change", function (e) { f.coord = e.target.value; drawCases(); });
    $("#f-overdue").addEventListener("change", function (e) { f.overdue = e.target.checked; drawCases(); });
    $("#f-active").addEventListener("change", function (e) { f.active = e.target.checked; drawCases(); });
    $$("tr[data-case]").forEach(function (tr) {
      var go = function () { location.hash = "#/case/" + encodeURIComponent(tr.dataset.case); };
      tr.addEventListener("click", go);
      tr.addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
    });
    $("#new-case").addEventListener("click", newCaseDialog);
  }

  function redrawKeepFocus(sel) {
    var el = $(sel), pos = el.selectionStart;
    drawCases();
    var n = $(sel); n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {}
  }

  function newCaseDialog() {
    openDialog('<form id="nc"><h2>New case</h2><p class="muted">For leads that came by WhatsApp, phone call or referral.</p>' +
      '<div class="form-grid">' +
      fieldHtml("contactName", "Contact name *", "", "text", true) +
      fieldHtml("phone", "Phone / WhatsApp *", "", "tel", true) +
      fieldHtml("patientName", "Patient name *", "", "text", true) +
      fieldHtml("patientAge", "Age", "", "number") +
      '<div class="field"><label for="nc-condition">Condition</label><select id="nc-condition" name="condition">' +
      opts(["Cancer", "Heart", "Bones & joints", "Brain & spine", "Kidney & urology", "Liver & digestive", "Fertility / IVF", "Eye", "Other", "Not sure"], "Not sure") + "</select></div>" +
      '<div class="field"><label for="nc-source">Lead source</label><select id="nc-source" name="source">' + opts(["WhatsApp", "Phone call", "Referral - doctor", "Referral - patient", "Agent", "Walk-in", "Other"], "WhatsApp") + "</select></div>" +
      fieldHtml("city", "City", "", "text") + fieldHtml("country", "Country", "India", "text") +
      '<div class="field full"><label for="nc-problem">Problem</label><textarea id="nc-problem" name="problem"></textarea></div>' +
      "</div>" +
      '<div class="actions"><button type="button" class="btn btn-light" data-close>Cancel</button><button class="btn btn-primary">Create case</button></div></form>');
    $("#nc").addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(e.target), data = {};
      fd.forEach(function (v, k) { data[k] = String(v).trim(); });
      if (!data.contactName || !data.phone || !data.patientName) { toast("Please fill the required fields", true); return; }
      data.consent = "Verbal / WhatsApp";
      var btn = e.submitter; busy(btn, true);
      A.call("createCase", { data: data }).then(function (c) {
        closeDialog(); toast("Case " + c.caseId + " created");
        location.hash = "#/case/" + encodeURIComponent(c.caseId);
      }).catch(function (err) { busy(btn, false); fail(err); });
    });
  }

  function fieldHtml(name, label, value, type, required, extra) {
    var id = "nc-" + name;
    return '<div class="field' + (extra ? " " + extra : "") + '"><label for="' + id + '">' + esc(label) + '</label><input id="' + id + '" name="' + name +
      '" type="' + (type || "text") + '" value="' + esc(value) + '"' + (required ? " required" : "") + "></div>";
  }

  // ------------------------------------------------------------ case detail
  function renderCase(caseId) {
    shell("cases");
    A.call("getCase", { caseId: caseId }).then(function (d) { drawCase(d); }).catch(fail);
  }

  function drawCase(d, keepTpl) {
    var c = d.case;
    var link = I.trackUrl(c.caseId, c.trackToken);
    var wa = I.waUrl(c.phone);
    var info = [
      ["Contact", esc(c.contactName) + (c.filledFor ? ' <span class="muted">(' + esc(c.filledFor) + ")</span>" : "")],
      ["Phone", '<a href="tel:' + esc(String(c.phone).replace(/[^\d+]/g, "")) + '">' + esc(c.phone) + '</a> · <a href="' + esc(wa) + '" target="_blank" rel="noopener">WhatsApp</a>'],
      ["Email", c.email ? '<a href="mailto:' + esc(c.email) + '">' + esc(c.email) + "</a>" : ""],
      ["From", esc([c.city, c.country].filter(Boolean).join(", "))],
      ["Patient", esc([c.patientName, c.patientAge, c.patientGender].filter(Boolean).join(", "))],
      ["Condition", esc(c.condition)],
      ["Diagnosed", esc(c.diagnosed)],
      ["Treatment advised", esc(c.advised)],
      ["Preferred city", esc(c.preferredCity)],
      ["Timeline", esc(c.timeline)],
      ["Budget", esc(c.budget)],
      ["Insurance", esc(c.insurance)],
      ["Help needed", esc(c.services)],
      ["Contact via", esc([c.contactPref, c.bestTime].filter(Boolean).join(", "))],
      ["Received", esc(I.fmtDateTime(c.submittedAt)) + ' <span class="muted">via ' + esc(c.source) + "</span>"],
      ["Consent", esc(c.consent)]
    ].filter(function (r) { return r[1]; });

    var tplKey = keepTpl || (c.status === "New" ? "hi" : c.status === "Package sent" ? "plan" : "update");
    var page = '<a class="crumb" href="#/cases">← All cases</a>' +
      '<div class="page-head"><div><h1>' + esc(c.caseId) + " · " + esc(c.patientName) + "</h1>" +
      '<div class="sub">' + badge(c.status) + " " + slaCell(c) + "</div></div>" +
      '<div class="btn-row">' + (c.status === "New" ? '<button class="btn btn-primary" id="mark-contacted">✓ Mark contacted now</button>' : "") +
      '<a class="btn btn-light" href="#/case/' + encodeURIComponent(c.caseId) + '/plan">📋 ' + (d.packages.length ? "Edit treatment plan" : "Build treatment plan") + "</a></div></div>" +
      '<div class="case-grid"><div>' +
      '<section class="panel"><h2>Patient details</h2><dl class="info">' + info.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + r[1] + "</dd>"; }).join("") + "</dl>" +
      (c.problem ? '<p class="problem">' + esc(c.problem) + "</p>" : "") + "</section>" +
      '<section class="panel"><h2>Manage case</h2><form id="manage"><div class="form-grid">' +
      '<div class="field"><label for="m-status">Status</label><select id="m-status" name="status">' + opts(I.STATUSES, c.status) + "</select></div>" +
      '<div class="field"><label for="m-coord">Coordinator</label><select id="m-coord" name="coordinator">' + opts(S.team.map(function (t) { return t.name; }), c.coordinator, "Unassigned") + "</select></div>" +
      '<div class="field full"><label for="m-next">Next action</label><input id="m-next" name="nextAction" value="' + esc(c.nextAction) + '" placeholder="e.g. Call back at 6 PM, chase hospital B"></div>' +
      '<div class="field"><label for="m-asked">Hospitals asked</label><input id="m-asked" name="hospitalsAsked" value="' + esc(c.hospitalsAsked) + '"></div>' +
      '<div class="field"><label for="m-chosen">Hospital chosen</label><input id="m-chosen" name="hospitalChosen" value="' + esc(c.hospitalChosen) + '"></div>' +
      '<div class="field full"><label for="m-notes">Internal notes</label><textarea id="m-notes" name="notes">' + esc(c.notes) + "</textarea></div>" +
      '</div><button class="btn btn-primary btn-sm">Save changes</button>' +
      (c.firstContactAt ? ' <span class="muted">First contact: ' + esc(I.fmtDateTime(c.firstContactAt)) + "</span>" : "") +
      "</form></section>" +
      "</div><div>" +
      '<section class="panel"><h2>WhatsApp message <span class="seg" role="group" aria-label="Language"><button type="button" data-lang="en" class="on">EN</button><button type="button" data-lang="hi">HI</button></span></h2>' +
      '<div class="field"><label for="tpl">Template</label><select id="tpl">' + Object.keys(I.TEMPLATES).map(function (k) {
        return '<option value="' + k + '"' + (k === tplKey ? " selected" : "") + ">" + esc(I.TEMPLATES[k].label) + "</option>";
      }).join("") + "</select></div>" +
      '<div class="field"><label for="tpl-text">Message (you can edit)</label><textarea id="tpl-text" rows="6"></textarea></div>' +
      '<div class="btn-row"><a class="btn btn-wa btn-sm" id="tpl-send" target="_blank" rel="noopener">Open in WhatsApp</a><button type="button" class="btn btn-light btn-sm" id="tpl-copy">Copy</button></div></section>' +
      '<section class="panel"><h2>Patient tracking link</h2><p class="muted">Share this with the patient. They can see progress and their published plan.</p>' +
      '<div class="copy-row"><input readonly id="track-link" value="' + esc(link) + '" aria-label="Tracking link"><button type="button" class="btn btn-light btn-sm" id="copy-link">Copy</button><a class="btn btn-light btn-sm" href="' + esc(link) + '" target="_blank" rel="noopener">Open</a></div></section>' +
      '<section class="panel"><h2>Treatment plans <a class="btn btn-light btn-sm" href="#/case/' + encodeURIComponent(c.caseId) + '/plan">' + (d.packages.length ? "Edit latest" : "+ Build") + "</a></h2>" +
      (d.packages.length ? '<ul class="pk-list">' + d.packages.map(function (p, i) {
        return '<li><span><b>Version ' + esc(p.version) + "</b> " + (p.status === "published" ? '<span class="badge b-Package-sent">Published</span>' : '<span class="badge">Draft</span>') +
          '<br><span class="muted">' + esc(I.fmtDateTime(p.createdAt)) + " · " + esc(p.createdBy) + "</span></span>" +
          '<span class="btn-row"><button type="button" class="btn btn-light btn-sm" data-view="' + i + '">View</button><button type="button" class="btn btn-light btn-sm" data-print="' + i + '">Print / PDF</button></span></li>';
      }).join("") + "</ul>" : '<p class="muted">No plan yet.</p>') + "</section>" +
      '<section class="panel"><h2>Timeline</h2><form id="upd"><div class="field"><label for="upd-text">Add an update</label><textarea id="upd-text" rows="3" placeholder="e.g. Reports sent to 3 hospitals"></textarea></div>' +
      '<div class="btn-row" style="align-items:center"><select id="upd-vis" style="width:auto"><option value="internal">Internal note (team only)</option><option value="patient">Visible to patient</option></select><button class="btn btn-primary btn-sm">Add</button></div></form>' +
      '<ul class="timeline">' + d.updates.slice().reverse().map(function (u) {
        return '<li class="' + esc(u.visibility) + '"><div>' + esc(u.text) + '</div><div class="meta">' + esc(I.fmtDateTime(u.at)) + " · " + esc(u.by) +
          '<span class="vis vis-' + esc(u.visibility) + '">' + (u.visibility === "patient" ? "Patient sees" : "Internal") + "</span></div></li>";
      }).join("") + "</ul></section>" +
      "</div></div>";
    $("#page").innerHTML = page;

    // WhatsApp templates
    var lang = "en";
    function hospitalsList() {
      var p = d.packages[0] && d.packages[0].plan;
      var names = p && p.hospitalOptions ? p.hospitalOptions.map(function (o) { return o.hospital; }).filter(Boolean) : [];
      return names.length ? names.join(", ") : (c.hospitalsAsked || "");
    }
    function vars() {
      return { name: String(c.contactName || "").split(" ")[0], patient: String(c.patientName || "").split(" ")[0], caseId: c.caseId,
               coordinator: c.coordinator || S.user.name, trackLink: link, hospitals: hospitalsList() };
    }
    function updTpl() {
      var t = I.TEMPLATES[$("#tpl").value];
      $("#tpl-text").value = I.fill(t[lang], vars());
      updSend();
    }
    function updSend() { $("#tpl-send").href = I.waUrl(c.phone, $("#tpl-text").value); }
    $("#tpl").addEventListener("change", updTpl);
    $("#tpl-text").addEventListener("input", updSend);
    $$(".seg button").forEach(function (b) {
      b.addEventListener("click", function () {
        lang = b.dataset.lang;
        $$(".seg button").forEach(function (x) { x.classList.toggle("on", x === b); });
        updTpl();
      });
    });
    updTpl();
    $("#tpl-copy").addEventListener("click", function () { copy($("#tpl-text").value); });
    $("#copy-link").addEventListener("click", function () { copy(link); });

    // Manage
    $("#manage").addEventListener("submit", function (e) {
      e.preventDefault();
      var patch = {};
      new FormData(e.target).forEach(function (v, k) { patch[k] = String(v); });
      var btn = e.submitter; busy(btn, true);
      A.call("updateCase", { caseId: c.caseId, patch: patch }).then(function () {
        toast("Saved"); return A.call("getCase", { caseId: c.caseId });
      }).then(function (nd) { drawCase(nd); }).catch(function (err) { busy(btn, false); fail(err); });
    });
    var mc = $("#mark-contacted");
    if (mc) mc.addEventListener("click", function () {
      busy(mc, true);
      A.call("updateCase", { caseId: c.caseId, patch: { status: "Contacted", coordinator: c.coordinator || S.user.name, firstContactAt: new Date().toISOString() } })
        .then(function () { toast("Marked as contacted"); return A.call("getCase", { caseId: c.caseId }); })
        .then(function (nd) { drawCase(nd, "reports"); }).catch(function (err) { busy(mc, false); fail(err); });
    });

    // Timeline
    $("#upd").addEventListener("submit", function (e) {
      e.preventDefault();
      var text = $("#upd-text").value.trim();
      if (!text) return;
      var btn = e.submitter; busy(btn, true);
      A.call("addUpdate", { caseId: c.caseId, text: text, visibility: $("#upd-vis").value }).then(function () {
        toast("Update added"); return A.call("getCase", { caseId: c.caseId });
      }).then(function (nd) { drawCase(nd, $("#tpl").value); }).catch(function (err) { busy(btn, false); fail(err); });
    });

    // Plans
    $$("[data-view]").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = d.packages[+b.dataset.view];
        openDialog('<form method="dialog" style="padding:16px">' + I.renderPlan(p.plan) +
          '<div class="actions"><button class="btn btn-light" data-close>Close</button></div></form>', true);
      });
    });
    $$("[data-print]").forEach(function (b) { b.addEventListener("click", function () { printPlan(d.packages[+b.dataset.print].plan); }); });
  }

  // ------------------------------------------------------------ package builder
  var SERVICE_FROM_NEED = [
    ["Stay near hospital", "Stay", "Room near hospital", "per night", 7],
    ["Stay & food for family", "Stay", "Stay and food for attendant", "per night", 7],
    ["Pickup & local cab", "Cab", "Pickup and hospital trips", "per trip", 4],
    ["Personal assistant", "Assistant", "Help at hospital", "per day", 3],
    ["Medicines / pharmacy", "Pharmacy", "Medicines delivered to stay", "fixed", 1],
    ["Train / flight booking", "Travel booking", "Tickets as per your dates (actual fare)", "fixed", 1],
    ["Translator", "Translator", "Translator for doctor visits", "per day", 2],
    ["Insurance claim help", "Insurance", "Cashless / claim paperwork", "fixed", 1, true],
    ["Medical visa & invitation letter", "Visa letter", "Hospital invitation letter for medical visa", "fixed", 1, true],
    ["Medical loan / EMI", "Loan", "Help applying for a medical loan / EMI", "fixed", 1, true]
  ];

  function newPlan(c) {
    var services = [];
    var needs = String(c.services || "").split(",").map(function (s) { return s.trim(); });
    SERVICE_FROM_NEED.forEach(function (m) {
      if (needs.indexOf(m[0]) >= 0) {
        services.push({ type: m[1], provider: "", partnerId: "", description: m[2], unitPrice: 0, unit: m[3], qty: m[4], included: !!m[5] });
      }
    });
    var valid = new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10);
    return {
      currency: /india/i.test(c.country || "India") ? "INR" : "USD",
      title: c.advised || "", patientName: c.patientName,
      coordinator: c.coordinator || S.user.name, coordinatorPhone: coordPhone(c.coordinator || S.user.name),
      validUntil: valid, hospitalOptions: [{ hospital: "", city: "", accreditation: "", doctor: "", procedure: c.advised || "", estimate: 0, hospitalDays: "", notes: "", recommended: true }],
      services: services, freeServices: I.DEFAULT_FREE.slice(),
      notes: "1. Tell us which option you prefer.\n2. We will confirm the appointment, travel and stay.\n3. Carry all reports, ID proof and insurance card."
    };
  }

  function renderBuilder(caseId) {
    shell("cases");
    Promise.all([A.call("getCase", { caseId: caseId }), A.call("listPartners")]).then(function (r) {
      S.partners = r[1];
      var d = r[0];
      var plan = d.packages.length ? JSON.parse(JSON.stringify(d.packages[0].plan)) : newPlan(d.case);
      delete plan.version; delete plan.createdAt;
      drawBuilder(d, plan);
    }).catch(fail);
  }

  function drawBuilder(d, plan) {
    var c = d.case;
    var hospitals = S.partners.filter(function (p) { return p.type === "Hospital" && p.status !== "Inactive"; });
    function partnerOpts(type, selected) {
      var list = S.partners.filter(function (p) { return p.type === type && p.status !== "Inactive"; });
      return '<option value="">— choose partner —</option>' + list.map(function (p) {
        return '<option value="' + esc(p.id) + '"' + (p.id === selected ? " selected" : "") + ">" + esc(p.name) + (p.city ? " · " + esc(p.city) : "") + "</option>";
      }).join("");
    }
    function inp(path, value, label, type, attrs) {
      var id = "b-" + path.replace(/\./g, "-");
      return '<div class="field"><label for="' + id + '">' + esc(label) + '</label><input id="' + id + '" data-k="' + path + '" type="' + (type || "text") +
        '" value="' + esc(value == null ? "" : value) + '"' + (attrs || "") + "></div>";
    }

    var form = '<a class="crumb" href="#/case/' + encodeURIComponent(c.caseId) + '">← Back to case</a>' +
      '<div class="page-head"><div><h1>Treatment plan · ' + esc(c.caseId) + '</h1><div class="sub">' + esc(c.patientName) + " · " + esc(c.condition) +
      (d.packages.length ? " · editing from version " + esc(d.packages[0].version) : " · new plan") + "</div></div></div>" +
      '<div class="builder"><div id="b-form">' +
      '<section class="panel"><h2>Plan details</h2><div class="form-grid">' +
      '<div class="full">' + inp("title", plan.title, "Treatment / procedure") + "</div>" +
      inp("patientName", plan.patientName, "Prepared for") +
      '<div class="field"><label for="b-currency">Currency</label><select id="b-currency" data-k="currency">' + opts(["INR", "USD", "EUR", "GBP", "AED", "BDT", "NPR"], plan.currency) + "</select></div>" +
      inp("coordinator", plan.coordinator, "Coordinator") + inp("coordinatorPhone", plan.coordinatorPhone, "Coordinator phone") +
      inp("validUntil", plan.validUntil, "Valid until", "date") +
      "</div></section>" +

      '<section class="panel"><h2>Hospital options <span class="muted">' + plan.hospitalOptions.length + ' of 3</span></h2>' +
      plan.hospitalOptions.map(function (o, i) {
        var pre = "hospitalOptions." + i + ".";
        return '<div class="opt-card"><header><b>Option ' + String.fromCharCode(65 + i) + '</b><span class="btn-row">' +
          '<label class="inline-check"><input type="radio" name="rec" data-rec="' + i + '"' + (o.recommended ? " checked" : "") + "> Recommended</label>" +
          '<button type="button" class="icon-btn" data-del-opt="' + i + '" aria-label="Remove option">✕</button></span></header>' +
          '<div class="field"><label for="hp-' + i + '">Pick from partner hospitals</label><select id="hp-' + i + '" data-hosp="' + i + '"><option value="">— choose or type below —</option>' +
          hospitals.map(function (h) { return '<option value="' + esc(h.id) + '"' + (h.id === o.partnerId ? " selected" : "") + ">" + esc(h.name) + " · " + esc(h.city) + "</option>"; }).join("") + "</select></div>" +
          '<div class="form-grid">' + inp(pre + "hospital", o.hospital, "Hospital name") + inp(pre + "city", o.city, "City") +
          inp(pre + "accreditation", o.accreditation, "Accreditation") + inp(pre + "doctor", o.doctor, "Doctor") +
          inp(pre + "procedure", o.procedure, "Procedure") + inp(pre + "estimate", o.estimate, "Hospital estimate (as given by hospital)", "number", ' min="0" step="any"') +
          inp(pre + "hospitalDays", o.hospitalDays, "Days in hospital", "number", ' min="0"') + inp(pre + "notes", o.notes, "Notes for patient") +
          "</div></div>";
      }).join("") +
      (plan.hospitalOptions.length < 3 ? '<button type="button" class="btn btn-light btn-sm" id="add-opt">+ Add hospital option</button>' : "") +
      "</section>" +

      '<section class="panel"><h2>Travel, stay &amp; support</h2>' +
      (plan.services.length ? "" : '<p class="muted">No services added.</p>') +
      plan.services.map(function (s, i) {
        var pre = "services." + i + ".";
        return '<div class="svc-row">' +
          '<div class="field"><label for="st-' + i + '">Service</label><select id="st-' + i + '" data-k="' + pre + 'type" data-redraw>' + opts(I.SERVICE_TYPES, s.type) + "</select></div>" +
          '<div class="field"><label for="sp-' + i + '">Partner</label><select id="sp-' + i + '" data-svc-partner="' + i + '">' + partnerOpts(s.type, s.partnerId) + "</select></div>" +
          inp(pre + "unitPrice", s.unitPrice, "Price", "number", ' min="0" step="any"' + (s.included ? " disabled" : "")) +
          '<div class="field"><label for="su-' + i + '">Unit</label><select id="su-' + i + '" data-k="' + pre + 'unit">' + opts(I.RATE_UNITS, s.unit) + "</select></div>" +
          inp(pre + "qty", s.qty, "Qty", "number", ' min="0" step="any"' + (s.included ? " disabled" : "")) +
          '<button type="button" class="icon-btn" data-del-svc="' + i + '" aria-label="Remove service">✕</button>' +
          '<div class="wide">' + inp(pre + "description", s.description, "Details shown to patient") + "</div>" +
          inp(pre + "provider", s.provider, "Provider name") +
          '<label class="inline-check" style="grid-column: span 2"><input type="checkbox" data-incl="' + i + '"' + (s.included ? " checked" : "") + "> Included free</label>" +
          "</div>";
      }).join("") +
      '<button type="button" class="btn btn-light btn-sm" id="add-svc" style="margin-top:10px">+ Add service</button></section>' +

      '<section class="panel"><h2>Included free &amp; notes</h2>' +
      '<div class="field"><label for="b-free">Included free (one per line)</label><textarea id="b-free" data-k="freeServicesText" rows="4">' + esc((plan.freeServices || []).join("\n")) + "</textarea></div>" +
      '<div class="field"><label for="b-notes">Next steps / notes</label><textarea id="b-notes" data-k="notes" rows="4">' + esc(plan.notes) + "</textarea></div></section>" +

      '<div class="sticky-actions btn-row"><button type="button" class="btn btn-light" id="save-draft">Save draft</button>' +
      '<button type="button" class="btn btn-primary" id="publish">Publish to patient</button>' +
      '<button type="button" class="btn btn-light" id="print">Print / PDF</button></div>' +
      '</div><div class="preview" id="b-preview" aria-label="Plan preview"></div></div>';
    $("#page").innerHTML = form;

    function preview() {
      var p = Object.assign({}, plan, { caseId: c.caseId, createdAt: new Date().toISOString() });
      $("#b-preview").innerHTML = I.renderPlan(p);
    }
    function setPath(path, value) {
      if (path === "freeServicesText") { plan.freeServices = value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean); return; }
      var parts = path.split("."), o = plan;
      for (var i = 0; i < parts.length - 1; i++) o = o[parts[i]];
      var last = parts[parts.length - 1];
      o[last] = /^(estimate|unitPrice|qty|hospitalDays)$/.test(last) ? (value === "" ? "" : I.num(value)) : value;
    }
    var redraw = function () { drawBuilder(d, plan); };

    $("#b-form").addEventListener("input", function (e) {
      var k = e.target.dataset.k;
      if (!k || e.target.tagName === "SELECT") return; // selects are handled on "change"
      setPath(k, e.target.value);
      preview();
    });
    $("#b-form").addEventListener("change", function (e) {
      var t = e.target;
      if (t.dataset.k && t.tagName === "SELECT") { setPath(t.dataset.k, t.value); if (t.hasAttribute("data-redraw")) { plan.services[+t.dataset.k.split(".")[1]].partnerId = ""; redraw(); } else preview(); }
      if (t.dataset.rec != null) { plan.hospitalOptions.forEach(function (o, i) { o.recommended = i === +t.dataset.rec; }); preview(); }
      if (t.dataset.hosp != null) {
        var h = S.partners.filter(function (p) { return p.id === t.value; })[0];
        var o = plan.hospitalOptions[+t.dataset.hosp];
        o.partnerId = t.value;
        if (h) { o.hospital = h.name; o.city = h.city; o.accreditation = h.accreditation; }
        redraw();
      }
      if (t.dataset.svcPartner != null) {
        var s = plan.services[+t.dataset.svcPartner];
        var p = S.partners.filter(function (x) { return x.id === t.value; })[0];
        s.partnerId = t.value;
        if (p) { s.provider = p.name; if (p.rate !== "" && p.rate != null) s.unitPrice = I.num(p.rate); if (p.rateUnit) s.unit = p.rateUnit; }
        redraw();
      }
      if (t.dataset.incl != null) { plan.services[+t.dataset.incl].included = t.checked; redraw(); }
    });
    $("#b-form").addEventListener("click", function (e) {
      var t = e.target;
      if (t.id === "add-opt") { plan.hospitalOptions.push({ hospital: "", estimate: 0, procedure: plan.title, recommended: !plan.hospitalOptions.length }); redraw(); }
      if (t.dataset.delOpt != null) { plan.hospitalOptions.splice(+t.dataset.delOpt, 1); redraw(); }
      if (t.id === "add-svc") { plan.services.push({ type: "Stay", provider: "", description: "", unitPrice: 0, unit: "per night", qty: 1 }); redraw(); }
      if (t.dataset.delSvc != null) { plan.services.splice(+t.dataset.delSvc, 1); redraw(); }
    });

    function save(publish, btn) {
      var problems = [];
      if (!plan.hospitalOptions.length) problems.push("Add at least one hospital option.");
      plan.hospitalOptions.forEach(function (o, i) {
        if (!String(o.hospital || "").trim()) problems.push("Option " + String.fromCharCode(65 + i) + ": hospital name is missing.");
        if (publish && !(I.num(o.estimate) > 0)) problems.push("Option " + String.fromCharCode(65 + i) + ": add the hospital's estimate.");
      });
      if (problems.length) { toast(problems[0], true); return; }
      if (publish && !confirm("Publish this plan? The patient will see it on their tracking page.")) return;
      busy(btn, true, publish ? "Publishing…" : "Saving…");
      A.call("savePackage", { caseId: c.caseId, plan: plan, publish: publish }).then(function (pk) {
        toast(publish ? "Published as version " + pk.version + ". Now send it on WhatsApp." : "Draft saved (version " + pk.version + ")");
        if (publish) {
          location.hash = "#/case/" + encodeURIComponent(c.caseId);
        } else {
          busy(btn, false);
          d.packages.unshift(pk);
        }
      }).catch(function (err) { busy(btn, false); fail(err); });
    }
    $("#save-draft").addEventListener("click", function (e) { save(false, e.target); });
    $("#publish").addEventListener("click", function (e) { save(true, e.target); });
    $("#print").addEventListener("click", function () { printPlan(Object.assign({}, plan, { caseId: c.caseId })); });
    preview();
  }

  // ------------------------------------------------------------ partners
  function renderPartners() {
    shell("partners");
    A.call("listPartners").then(function (list) { S.partners = list; drawPartners(); }).catch(fail);
  }

  function drawPartners() {
    var f = S.pfilters, q = f.q.toLowerCase();
    var cities = S.partners.map(function (p) { return p.city; }).filter(Boolean).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort();
    var list = S.partners.filter(function (p) {
      if (f.type && p.type !== f.type) return false;
      if (f.city && p.city !== f.city) return false;
      if (f.status && p.status !== f.status) return false;
      if (q && [p.name, p.area, p.contactPerson, p.phone, p.specialties, p.notes].join(" ").toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    var counts = {};
    S.partners.forEach(function (p) { counts[p.type] = (counts[p.type] || 0) + 1; });
    var signed = S.partners.filter(function (p) { return p.status === "MoU signed"; }).length;

    $("#page").innerHTML = '<div class="page-head"><div><h1>Partners</h1><div class="sub">' + S.partners.length + " partners · " + signed + " with MoU signed</div></div>" +
      '<button class="btn btn-primary" id="add-partner">+ Add partner</button></div>' +
      '<div class="pipeline">' + I.PARTNER_TYPES.filter(function (t) { return counts[t]; }).map(function (t) {
        return '<button type="button" data-type="' + esc(t) + '" class="' + (f.type === t ? "on" : "") + '"><b>' + counts[t] + "</b>" + esc(t) + "</button>";
      }).join("") + "</div>" +
      '<div class="filters"><input type="search" id="p-q" placeholder="Search name, area, contact, specialty…" value="' + esc(f.q) + '" aria-label="Search partners">' +
      '<select id="p-type" aria-label="Type">' + opts(I.PARTNER_TYPES, f.type, "All types") + "</select>" +
      '<select id="p-city" aria-label="City">' + opts(cities, f.city, "All cities") + "</select>" +
      '<select id="p-status" aria-label="Partnership status">' + opts(I.PARTNER_STATUSES, f.status, "Any status") + "</select></div>" +
      '<div class="table-wrap"><table class="data"><thead><tr><th>Partner</th><th>Type</th><th>Location</th><th>Contact</th><th>Rate</th><th>Status</th><th></th></tr></thead><tbody>' +
      (list.length ? list.map(function (p) {
        return "<tr><td><b>" + esc(p.name) + "</b><small>" + esc([p.accreditation, p.specialties].filter(Boolean).join(" · ")) + "</small></td>" +
          "<td>" + esc(p.type) + "</td><td>" + esc(p.city) + "<small>" + esc(p.area) + "</small></td>" +
          "<td>" + esc(p.contactPerson) + "<small>" + (p.phone ? '<a href="' + esc(I.waUrl(p.phone)) + '" target="_blank" rel="noopener">' + esc(p.phone) + "</a>" : "") + "</small></td>" +
          "<td>" + (p.rate !== "" && p.rate != null ? esc(I.money(p.rate, "INR")) + "<small>" + esc(p.rateUnit) + "</small>" : '<span class="muted">—</span>') + "</td>" +
          "<td>" + badge(p.status || "Prospect") + "</td>" +
          '<td><span class="btn-row"><button type="button" class="btn btn-light btn-sm" data-edit="' + esc(p.id) + '">Edit</button>' +
          '<button type="button" class="btn btn-danger btn-sm" data-delete="' + esc(p.id) + '">Delete</button></span></td></tr>';
      }).join("") : '<tr><td colspan="7" class="empty">' + (S.partners.length ? "No partners match these filters." : "No partners yet. Add your first hospital, stay or cab partner.") + "</td></tr>") +
      "</tbody></table></div>";

    $$(".pipeline button").forEach(function (b) { b.addEventListener("click", function () { f.type = f.type === b.dataset.type ? "" : b.dataset.type; drawPartners(); }); });
    $("#p-q").addEventListener("input", function (e) {
      f.q = e.target.value; var pos = e.target.selectionStart; drawPartners();
      var n = $("#p-q"); n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) {}
    });
    $("#p-type").addEventListener("change", function (e) { f.type = e.target.value; drawPartners(); });
    $("#p-city").addEventListener("change", function (e) { f.city = e.target.value; drawPartners(); });
    $("#p-status").addEventListener("change", function (e) { f.status = e.target.value; drawPartners(); });
    $("#add-partner").addEventListener("click", function () { partnerDialog({ type: f.type || "Hospital", status: "Prospect" }); });
    $$("[data-edit]").forEach(function (b) {
      b.addEventListener("click", function () { partnerDialog(S.partners.filter(function (p) { return p.id === b.dataset.edit; })[0]); });
    });
    $$("[data-delete]").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = S.partners.filter(function (x) { return x.id === b.dataset.delete; })[0];
        if (!confirm("Delete " + p.name + "?")) return;
        A.call("deletePartner", { id: p.id }).then(function () { toast("Deleted"); renderPartners(); }).catch(fail);
      });
    });
  }

  function partnerDialog(p) {
    var f = function (name, label, type, extra) {
      return '<div class="field' + (extra || "") + '"><label for="pf-' + name + '">' + esc(label) + '</label><input id="pf-' + name + '" name="' + name + '" type="' + (type || "text") +
        '" value="' + esc(p[name] == null ? "" : p[name]) + '"></div>';
    };
    openDialog('<form id="pf"><h2>' + (p.id ? "Edit partner" : "Add partner") + "</h2><div class=\"form-grid\">" +
      '<div class="field full"><label for="pf-name">Name *</label><input id="pf-name" name="name" required value="' + esc(p.name || "") + '"></div>' +
      '<div class="field"><label for="pf-type">Type</label><select id="pf-type" name="type">' + opts(I.PARTNER_TYPES, p.type) + "</select></div>" +
      '<div class="field"><label for="pf-status">Partnership status</label><select id="pf-status" name="status">' + opts(I.PARTNER_STATUSES, p.status || "Prospect") + "</select></div>" +
      f("city", "City") + f("area", "Area / landmark") +
      f("contactPerson", "Contact person") + f("phone", "Phone / WhatsApp", "tel") +
      f("email", "Email", "email") + f("accreditation", "Accreditation (NABH, JCI…)") +
      f("specialties", "Specialties / services", "text", " full") +
      f("rate", "Rate (₹)", "number") +
      '<div class="field"><label for="pf-rateUnit">Rate unit</label><select id="pf-rateUnit" name="rateUnit">' + opts(I.RATE_UNITS, p.rateUnit, "—") + "</select></div>" +
      f("terms", "Fee / commission terms (internal only)", "text", " full") +
      f("lastContacted", "Last contacted", "date") +
      '<div class="field full"><label for="pf-notes">Notes</label><textarea id="pf-notes" name="notes">' + esc(p.notes || "") + "</textarea></div>" +
      '</div><div class="actions"><button type="button" class="btn btn-light" data-close>Cancel</button><button class="btn btn-primary">Save partner</button></div></form>');
    var lc = $("#pf-lastContacted");
    if (lc && p.lastContacted) lc.value = String(p.lastContacted).slice(0, 10);
    $("#pf").addEventListener("submit", function (e) {
      e.preventDefault();
      var data = { id: p.id || "" };
      new FormData(e.target).forEach(function (v, k) { data[k] = String(v).trim(); });
      if (!data.name) { toast("Name is required", true); return; }
      if (data.rate !== "") data.rate = I.num(data.rate);
      if (!data.id) delete data.id;
      var btn = e.submitter; busy(btn, true);
      A.call("savePartner", { partner: data }).then(function () { closeDialog(); toast("Partner saved"); renderPartners(); })
        .catch(function (err) { busy(btn, false); fail(err); });
    });
  }

  // ------------------------------------------------------------ boot
  if (A.getKey()) {
    A.call("login").then(function (u) { S.user = u; return A.call("listTeam"); })
      .then(function (t) { S.team = t; route(); })
      .catch(function (e) { A.setKey(""); renderLogin(e.auth ? "" : e.message); });
  } else {
    renderLogin();
  }
})();
