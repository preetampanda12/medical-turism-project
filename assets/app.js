(function () {
  "use strict";

  var cfg = window.IRYNT_CONFIG || {};
  var waNumber = String(cfg.whatsappNumber || "").replace(/\D/g, "");
  var hasWa = waNumber.length >= 8;

  function waLink(text) {
    return "https://wa.me/" + waNumber + (text ? "?text=" + encodeURIComponent(text) : "");
  }

  // ---- Fill config values into the page ----
  document.querySelectorAll("[data-response-hours]").forEach(function (el) {
    el.textContent = cfg.responseHours || 2;
  });
  document.querySelectorAll("[data-working-hours]").forEach(function (el) {
    if (cfg.workingHours) el.textContent = cfg.workingHours;
  });

  if (hasWa) {
    var hello = "Hello Irynt, I need help planning a treatment.";
    document.querySelectorAll("[data-wa-link]").forEach(function (a) {
      a.href = waLink(hello);
      a.target = "_blank";
      a.rel = "noopener";
      a.hidden = false;
    });
    document.querySelectorAll("[data-wa-item]").forEach(function (el) { el.hidden = false; });
    var fl = document.querySelector("[data-wa-float]");
    if (fl) { fl.href = waLink(hello); fl.classList.add("show"); }
  }

  if (cfg.email) {
    document.querySelectorAll("[data-email-link]").forEach(function (a) {
      a.href = "mailto:" + cfg.email;
      a.textContent = cfg.email;
    });
    document.querySelectorAll("[data-email-item]").forEach(function (el) { el.hidden = false; });
  }

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Mobile menu ----
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---- Intake form ----
  var form = document.getElementById("intake-form");
  if (!form) return;
  var errorEl = document.getElementById("form-error");

  // Pre-select the condition when arriving from a treatment page (?condition=Heart#start).
  try {
    var pre = new URLSearchParams(location.search).get("condition");
    if (pre) {
      Array.prototype.forEach.call(form.querySelectorAll('input[name="condition"]'), function (r) { if (r.value === pre) r.checked = true; });
    }
  } catch (e) { /* ignore */ }
  var successEl = document.getElementById("success");

  function makeCaseId() {
    var d = new Date();
    var ymd = String(d.getFullYear()).slice(2) +
      String(d.getMonth() + 1).padStart(2, "0") +
      String(d.getDate()).padStart(2, "0");
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var rnd = "";
    var arr = new Uint32Array(4);
    (window.crypto || window.msCrypto).getRandomValues(arr);
    for (var i = 0; i < 4; i++) rnd += chars[arr[i] % chars.length];
    return "IRY-" + ymd + "-" + rnd;
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.add("show");
  }

  function collect() {
    var fd = new FormData(form);
    var data = {};
    fd.forEach(function (value, key) {
      if (key === "services") return;
      data[key] = String(value).trim();
    });
    data.services = fd.getAll("services").join(", ");
    data.consent = form.consent.checked ? "Yes" : "No";
    return data;
  }

  function validate(scope) {
    scope = scope || form;
    var firstBad = null;
    scope.querySelectorAll(".invalid").forEach(function (el) { el.classList.remove("invalid"); });
    scope.querySelectorAll("[required]").forEach(function (el) {
      var ok;
      if (el.type === "radio") {
        ok = !!form.querySelector('input[name="' + el.name + '"]:checked');
        var group = el.closest(".tiles, .radio-row");
        if (group) group.classList.toggle("invalid-group", !ok);
      } else if (el.type === "checkbox") {
        ok = el.checked;
      } else {
        ok = el.value.trim() !== "";
      }
      if (!ok) {
        if (el.type !== "radio" && el.type !== "checkbox") el.classList.add("invalid");
        if (!firstBad) firstBad = el;
      }
    });
    if (scope.contains(form.phone)) {
      var phone = form.phone.value.replace(/\D/g, "");
      if (form.phone.value.trim() && phone.length < 8) {
        form.phone.classList.add("invalid");
        if (!firstBad) firstBad = form.phone;
      }
    }
    if (scope.contains(form.email) && form.email.value.trim() && !/^\S+@\S+\.\S+$/.test(form.email.value.trim())) {
      form.email.classList.add("invalid");
      if (!firstBad) firstBad = form.email;
    }
    return firstBad;
  }

  function errorFor(bad) {
    if (bad.id === "consent") return "Please accept the consent to continue.";
    if (bad.name === "condition") return "Please choose the type of health problem.";
    if (bad.name === "filledFor") return "Please tell us who this is for.";
    if (bad.id === "phone" && bad.value.trim()) return "Please enter a valid phone number with country code.";
    return "Please fill the highlighted fields.";
  }

  // ---- Wizard: one step at a time ----
  var steps = Array.prototype.slice.call(form.querySelectorAll(".wz-step"));
  var cur = 0;
  var backBtn = document.getElementById("wz-back");
  var nextBtn = document.getElementById("wz-next");
  var submitBtn = document.getElementById("wz-submit");
  var countEl = document.getElementById("wz-count");
  var fillEl = document.getElementById("wz-fill");
  var dots = Array.prototype.slice.call(form.querySelectorAll(".wz-steps li"));

  function showStep(i, dir) {
    if (!steps.length) return;
    cur = Math.max(0, Math.min(i, steps.length - 1));
    steps.forEach(function (st, k) {
      st.hidden = k !== cur;
      st.classList.remove("enter-fwd", "enter-back");
    });
    if (dir) { void steps[cur].offsetWidth; steps[cur].classList.add(dir > 0 ? "enter-fwd" : "enter-back"); }
    dots.forEach(function (d, k) { d.classList.toggle("on", k === cur); d.classList.toggle("done", k < cur); });
    if (fillEl) fillEl.style.width = ((cur + 1) / steps.length * 100) + "%";
    if (countEl) countEl.textContent = "Step " + (cur + 1) + " of " + steps.length;
    if (backBtn) backBtn.hidden = cur === 0;
    if (nextBtn) nextBtn.hidden = cur === steps.length - 1;
    if (submitBtn) submitBtn.hidden = cur !== steps.length - 1;
    errorEl.classList.remove("show");
  }

  function goNext() {
    var bad = validate(steps[cur]);
    if (bad) { showError(errorFor(bad)); bad.focus(); return; }
    showStep(cur + 1, 1);
    var first = steps[cur].querySelector("input:not([type=hidden]), select, textarea");
    if (first && window.matchMedia && !window.matchMedia("(max-width: 600px)").matches) first.focus({ preventScroll: true });
    var top = form.getBoundingClientRect().top;
    if (top < 0) form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (steps.length) {
    nextBtn.addEventListener("click", goNext);
    backBtn.addEventListener("click", function () { showStep(cur - 1, -1); });
    form.querySelectorAll(".tiles input").forEach(function (r) {
      r.addEventListener("change", function () { r.closest(".tiles").classList.remove("invalid-group"); });
    });
    showStep(0);
  }

  function summary(d) {
    return [
      "Hello Irynt, here are my details.",
      "Case ID: " + d.caseId,
      "Name: " + d.contactName + " (" + d.filledFor + ")",
      "Phone: " + d.phone,
      "From: " + d.city + ", " + d.country,
      "Patient: " + d.patientName + ", " + d.patientAge + (d.patientGender ? ", " + d.patientGender : ""),
      "Problem type: " + d.condition,
      "Details: " + d.problem,
      d.advised ? "Treatment advised: " + d.advised : "",
      "Preferred city: " + d.preferredCity,
      "Timeline: " + d.timeline,
      "Help needed: " + (d.services || "-"),
      "",
      "I will now send my medical reports here."
    ].filter(function (l) { return l !== ""; }).join("\n");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorEl.classList.remove("show");

    // Enter key on an earlier step moves forward instead of submitting.
    if (steps.length && cur < steps.length - 1) { goNext(); return; }

    var bad = validate();
    if (bad) {
      var stepOf = steps.length ? steps.indexOf(bad.closest(".wz-step")) : -1;
      if (stepOf >= 0 && stepOf !== cur) showStep(stepOf, -1);
      showError(errorFor(bad));
      bad.focus();
      return;
    }

    // Demo: no Google Sheet yet, but running locally (or demoMode on) → save in this browser.
    var demoOk = !cfg.sheetEndpoint && window.IryntAPI &&
      (cfg.demoMode === true || /^(localhost|127\.0\.0\.1|)$/.test(location.hostname));
    var saves = !!cfg.sheetEndpoint || demoOk;

    if (!saves && !hasWa) {
      showError("This form is not connected yet. Site owner: add your WhatsApp number or Google Sheet link in assets/config.js.");
      return;
    }

    var data = collect();
    data.caseId = makeCaseId();
    data.submittedAt = new Date().toISOString();
    data.source = "website";
    data.trackToken = window.Irynt ? Irynt.randomHex(16) : "";

    var btn = submitBtn || form.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Sending…";

    var send = saves
      ? IryntAPI.submitIntake(data).catch(function () { /* WhatsApp below is the backup channel */ })
      : Promise.resolve();

    send.then(function () {
      document.getElementById("case-id").textContent = data.caseId;
      var tr = document.getElementById("success-track");
      if (tr && saves && data.trackToken) {
        var url = Irynt.trackUrl(data.caseId, data.trackToken);
        tr.querySelector("a").href = url;
        tr.hidden = false;
      }
      var waBtn = document.getElementById("success-wa");
      if (hasWa) {
        waBtn.href = waLink(summary(data));
      } else {
        waBtn.hidden = true;
        document.getElementById("success-wa-text").innerHTML =
          "<b>Next step:</b> keep your medical reports ready. Your coordinator will tell you how to share them.";
      }
      form.style.display = "none";
      var card = form.closest(".wizard-card");
      if (card) card.classList.add("is-done");
      successEl.classList.add("show");
      successEl.focus();
      successEl.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();
