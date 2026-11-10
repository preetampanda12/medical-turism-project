/* Shared helpers for the dashboard, package builder and tracking page. */
(function (g) {
  "use strict";

  var STATUSES = [
    "New", "Contacted", "Reports received", "Sent to hospitals",
    "Estimates received", "Package sent", "Confirmed", "In treatment",
    "Follow-up", "Closed - completed", "Closed - lost"
  ];

  // What the patient sees on the tracking page.
  var STAGES = [
    { label: "Request received", statuses: ["New"] },
    { label: "Coordinator assigned", statuses: ["Contacted"] },
    { label: "Reports reviewed", statuses: ["Reports received"] },
    { label: "Hospital opinions", statuses: ["Sent to hospitals", "Estimates received"] },
    { label: "Plan ready", statuses: ["Package sent"] },
    { label: "Confirmed", statuses: ["Confirmed"] },
    { label: "In treatment", statuses: ["In treatment"] },
    { label: "Back home", statuses: ["Follow-up", "Closed - completed"] }
  ];

  function stageIndex(status) {
    for (var i = 0; i < STAGES.length; i++) if (STAGES[i].statuses.indexOf(status) >= 0) return i;
    return -1;
  }

  var PARTNER_TYPES = ["Hospital", "Stay", "Cab", "Assistant", "Pharmacy", "Insurance", "Loan", "Translator", "Diagnostics", "Other"];
  var PARTNER_STATUSES = ["Prospect", "Contacted", "Meeting done", "MoU signed", "Inactive"];
  var RATE_UNITS = ["per night", "per month", "per day", "per trip", "per package", "fixed"];
  var SERVICE_TYPES = ["Stay", "Cab", "Assistant", "Pharmacy", "Translator", "Travel booking", "Visa letter", "Insurance", "Loan", "Diagnostics", "Other"];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function num(v) { var n = parseFloat(String(v == null ? "" : v).replace(/[^\d.\-]/g, "")); return isNaN(n) ? 0 : n; }

  function money(n, cur) {
    cur = cur || "INR";
    try {
      return new Intl.NumberFormat(cur === "INR" ? "en-IN" : "en-US", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(num(n));
    } catch (e) { return cur + " " + Math.round(num(n)); }
  }

  function fmtDate(iso) {
    if (!iso) return "";
    var d = new Date(iso); if (isNaN(d)) return String(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }
  function fmtDateTime(iso) {
    if (!iso) return "";
    var d = new Date(iso); if (isNaN(d)) return String(iso);
    return d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  }
  function duration(mins) {
    mins = Math.max(0, Math.round(mins));
    if (mins < 60) return mins + "m";
    if (mins < 60 * 48) return Math.floor(mins / 60) + "h " + (mins % 60) + "m";
    return Math.floor(mins / 1440) + "d";
  }
  function minutesSince(iso) { var d = new Date(iso); return isNaN(d) ? 0 : (Date.now() - d.getTime()) / 60000; }

  // ---------- package maths ----------
  function calcPlan(plan) {
    var services = (plan.services || []).map(function (s) {
      var total = s.included ? 0 : num(s.unitPrice) * (num(s.qty) || 0);
      return Object.assign({}, s, { total: total });
    });
    var servicesTotal = services.reduce(function (a, s) { return a + s.total; }, 0);
    var options = (plan.hospitalOptions || []).map(function (o) {
      return Object.assign({}, o, { total: num(o.estimate) + servicesTotal });
    });
    return { services: services, servicesTotal: servicesTotal, options: options };
  }

  var DEFAULT_FREE = [
    "Personal coordinator from start to follow-up",
    "Hospital comparison and appointment booking",
    "Insurance and claim paperwork support",
    "Follow-up reminders after you return home"
  ];
  var DISCLOSURE = "Hospital estimates are shared exactly as provided by the hospital. Final hospital bills can change based on medical needs during treatment. " +
    "Irynt is a care coordinator, not a hospital or doctor; all medical decisions are made by the treating doctors. " +
    "Irynt may receive a facilitation fee from hospitals and service partners; this is never added to the estimates shown here.";

  function renderPlan(plan, opts) {
    opts = opts || {};
    var cur = plan.currency || "INR";
    var c = calcPlan(plan);
    var h = [];
    h.push('<article class="plan-doc">');
    h.push('<header class="pd-head"><div class="pd-brand"><img src="' + (opts.base || "") + 'assets/logo.svg" alt=""><span>irynt</span></div>' +
      '<div class="pd-meta"><b>Treatment Plan</b><span>Case ' + esc(plan.caseId || "") + (plan.version ? " · v" + esc(plan.version) : "") + '</span>' +
      '<span>Prepared ' + esc(fmtDate(plan.createdAt || new Date().toISOString())) + (plan.validUntil ? " · Valid until " + esc(fmtDate(plan.validUntil)) : "") + "</span></div></header>");

    h.push('<section class="pd-for"><div><small>Prepared for</small><b>' + esc(plan.patientName || "Patient") + "</b></div>" +
      (plan.title ? '<div><small>Treatment</small><b>' + esc(plan.title) + "</b></div>" : "") +
      (plan.coordinator ? '<div><small>Your coordinator</small><b>' + esc(plan.coordinator) + (plan.coordinatorPhone ? " · " + esc(plan.coordinatorPhone) : "") + "</b></div>" : "") +
      "</section>");

    if (c.options.length) {
      h.push('<h3 class="pd-h">1. Hospital options</h3><div class="pd-options">');
      c.options.forEach(function (o, i) {
        h.push('<div class="pd-option' + (o.recommended ? " rec" : "") + '">' +
          (o.recommended ? '<span class="pd-badge">Recommended</span>' : "") +
          '<div class="pd-letter">Option ' + String.fromCharCode(65 + i) + "</div>" +
          "<h4>" + esc(o.hospital || "Hospital") + "</h4>" +
          '<p class="pd-sub">' + esc([o.city, o.accreditation].filter(Boolean).join(" · ")) + "</p>" +
          '<dl>' +
          (o.doctor ? "<dt>Doctor</dt><dd>" + esc(o.doctor) + "</dd>" : "") +
          (o.procedure ? "<dt>Procedure</dt><dd>" + esc(o.procedure) + "</dd>" : "") +
          (o.hospitalDays ? "<dt>Hospital stay</dt><dd>" + esc(o.hospitalDays) + " days</dd>" : "") +
          "<dt>Hospital estimate</dt><dd><b>" + money(o.estimate, cur) + "</b></dd>" +
          "</dl>" +
          (o.notes ? '<p class="pd-note">' + esc(o.notes) + "</p>" : "") +
          "</div>");
      });
      h.push("</div>");
    }

    if (c.services.length) {
      h.push('<h3 class="pd-h">2. Travel, stay &amp; support</h3><table class="pd-table"><thead><tr><th>Service</th><th>Details</th><th class="r">Cost</th></tr></thead><tbody>');
      c.services.forEach(function (s) {
        var detail = [s.provider, s.description].filter(Boolean).join(" – ");
        var cost = s.included ? '<span class="pd-free">Included</span>'
          : money(s.total, cur) + '<small>' + money(s.unitPrice, cur) + " × " + esc(s.qty || 0) + " " + esc(s.unit || "") + "</small>";
        h.push("<tr><td><b>" + esc(s.type || "Service") + "</b></td><td>" + esc(detail) + '</td><td class="r">' + cost + "</td></tr>");
      });
      h.push('</tbody><tfoot><tr><td colspan="2">Support services total</td><td class="r"><b>' + money(c.servicesTotal, cur) + "</b></td></tr></tfoot></table>");
    }

    if (c.options.length) {
      h.push('<h3 class="pd-h">3. Estimated total</h3><table class="pd-table pd-totals"><thead><tr><th>Option</th><th class="r">Hospital</th><th class="r">Support</th><th class="r">Total</th></tr></thead><tbody>');
      c.options.forEach(function (o, i) {
        h.push("<tr><td>Option " + String.fromCharCode(65 + i) + " – " + esc(o.hospital || "") + '</td><td class="r">' + money(o.estimate, cur) +
          '</td><td class="r">' + money(c.servicesTotal, cur) + '</td><td class="r"><b>' + money(o.total, cur) + "</b></td></tr>");
      });
      h.push("</tbody></table>");
    }

    var free = (plan.freeServices && plan.freeServices.length ? plan.freeServices : DEFAULT_FREE);
    h.push('<h3 class="pd-h">Included free</h3><ul class="pd-free-list">' + free.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>");

    if (plan.notes) h.push('<h3 class="pd-h">Next steps &amp; notes</h3><p class="pd-notes">' + esc(plan.notes).replace(/\n/g, "<br>") + "</p>");
    h.push('<p class="pd-disclosure">' + esc(DISCLOSURE) + "</p>");
    h.push("</article>");
    return h.join("");
  }

  // ---------- WhatsApp templates ----------
  var TEMPLATES = {
    hi: { label: "First message",
      en: "Hello {name}, this is {coordinator} from Irynt. I'll be your personal coordinator for case {caseId}. Is this a good time for a 10-minute call to understand {patient}'s condition?",
      hi: "Namaste {name} ji, main {coordinator}, Irynt se. Case {caseId} ke liye main aapka personal coordinator hoon. Kya abhi 10 minute baat ho sakti hai, {patient} ji ki takleef samajhne ke liye?" },
    reports: { label: "Ask for reports",
      en: "To get opinions from hospitals, please send clear photos or PDFs of:\n1. Latest doctor's prescription / notes\n2. Scan reports (MRI, CT, X-ray, PET)\n3. Blood tests (last 1 month)\n4. Biopsy report (for cancer)\n5. Discharge summary, if any\nYour reports are shared only with hospitals you approve.",
      hi: "Hospitals se opinion lene ke liye yeh reports ki saaf photo ya PDF bhejein:\n1. Doctor ka latest parcha\n2. Scan reports (MRI, CT, X-ray, PET)\n3. Blood tests (pichhle 1 mahine ke)\n4. Biopsy report (cancer mein)\n5. Discharge summary, agar ho\nAapki reports sirf unhi hospitals ko jaayengi jinke liye aap haan kahenge." },
    consent: { label: "Consent to share",
      en: "Before I share the reports, please confirm: may I send {patient}'s reports to {hospitals} for an opinion and cost estimate? Please reply YES.",
      hi: "Reports bhejne se pehle confirm karein: kya main {patient} ji ki reports {hospitals} ko opinion aur kharche ke estimate ke liye bhej doon? Kripya HAAN likhein." },
    update: { label: "Waiting for hospitals",
      en: "Update on case {caseId}: reports have been sent to the hospitals. We usually get opinions within 24–72 hours. You can follow progress here: {trackLink}",
      hi: "Case {caseId} ka update: reports hospitals ko bhej di gayi hain. Aam taur par 24–72 ghante mein opinion aata hai. Progress yahan dekhein: {trackLink}" },
    plan: { label: "Plan is ready",
      en: "{name}, the treatment plan for {patient} is ready 📋 It compares hospitals with each hospital's original estimate, plus stay, travel and support. View it here: {trackLink}\nHappy to explain on a call.",
      hi: "{name} ji, {patient} ji ka treatment plan taiyaar hai 📋 Isme hospitals ki tulna original estimate ke saath hai, aur rehne, travel aur madad ke options bhi. Yahan dekhein: {trackLink}\nCall par samjha bhi sakta hoon." },
    track: { label: "Tracking link",
      en: "You can follow your case {caseId} anytime here: {trackLink}",
      hi: "Aap apne case {caseId} ki progress kabhi bhi yahan dekh sakte hain: {trackLink}" },
    daily: { label: "Daily check-in",
      en: "Good morning {name} 🙏 How is {patient} today? Do you need anything: medicines, food, a cab or help at the hospital?",
      hi: "Suprabhat {name} ji 🙏 Aaj {patient} ji kaise hain? Kuch chahiye: dawai, khana, cab ya hospital mein madad?" },
    home: { label: "Back home",
      en: "So glad {patient} is heading home 🙏 I'll remind you about medicines and the follow-up visit. If Irynt helped you, a short review would help other families find us.",
      hi: "Bahut khushi hai ki {patient} ji ghar ja rahe hain 🙏 Main dawaiyon aur follow-up visit ki yaad dilata rahunga. Agar Irynt se madad mili, to ek chhota review doosre parivaaron ki madad karega." },
    medical: { label: "Not medical advice",
      en: "I'm a care coordinator, not a doctor, so I can't advise on medicines or treatment. I'll get this answered by the specialist. Meanwhile, please follow your current doctor's advice.",
      hi: "Main coordinator hoon, doctor nahi, isliye dawai ya ilaj par salah nahi de sakta. Yeh sawaal specialist se poochh kar bataunga. Tab tak apne abhi wale doctor ki salah maanein." },
    emergency: { label: "Emergency",
      en: "This sounds urgent. Please call 112 or go to the nearest hospital emergency right now. We'll help with everything else afterwards.",
      hi: "Yeh emergency lag rahi hai. Kripya abhi 112 par call karein ya turant nazdeeki hospital ki emergency mein jaayein. Baaki sab mein hum baad mein madad karenge." }
  };

  function fill(tpl, vars) {
    return String(tpl).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null && vars[k] !== "" ? vars[k] : m; });
  }

  function waUrl(phone, text) {
    var digits = String(phone || "").replace(/\D/g, "");
    return "https://wa.me/" + digits + (text ? "?text=" + encodeURIComponent(text) : "");
  }

  function trackUrl(caseId, token) {
    var u = new URL("track.html", location.href);
    u.search = "?id=" + encodeURIComponent(caseId) + "&t=" + encodeURIComponent(token);
    return u.toString();
  }

  function randomHex(bytes) {
    var a = new Uint8Array(bytes || 16);
    crypto.getRandomValues(a);
    return Array.prototype.map.call(a, function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
  }

  g.Irynt = {
    STATUSES: STATUSES, STAGES: STAGES, stageIndex: stageIndex,
    PARTNER_TYPES: PARTNER_TYPES, PARTNER_STATUSES: PARTNER_STATUSES, RATE_UNITS: RATE_UNITS, SERVICE_TYPES: SERVICE_TYPES,
    esc: esc, num: num, money: money, fmtDate: fmtDate, fmtDateTime: fmtDateTime, duration: duration, minutesSince: minutesSince,
    calcPlan: calcPlan, renderPlan: renderPlan, DEFAULT_FREE: DEFAULT_FREE,
    TEMPLATES: TEMPLATES, fill: fill, waUrl: waUrl, trackUrl: trackUrl, randomHex: randomHex
  };
})(window);
