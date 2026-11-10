/* Subtle motion: scroll reveal, header on scroll. Respects "reduce motion". */
(function () {
  "use strict";
  window.__irMotion = true;
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header shadow / compact on scroll
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  var SELECTORS = [
    ".section-head", ".grid > *", ".steps > li", ".compare tbody tr", ".band", ".cta-band",
    ".trust-strip li", ".facts .fact", ".faq details", ".prose > h2", ".prose > p", ".prose > ul",
    ".prose > table", ".prose > .callout", ".aside-box"
  ].join(",");

  var items = Array.prototype.slice.call(document.querySelectorAll(SELECTORS))
    .filter(function (el) { return !el.closest(".hero"); });

  if (reduce || !("IntersectionObserver" in window)) {
    root.classList.add("reveal-all");
    return;
  }

  // Stagger siblings inside the same parent
  items.forEach(function (el) {
    el.classList.add("rv");
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return items.indexOf(c) >= 0; });
    var i = sibs.indexOf(el);
    el.style.setProperty("--rv-d", Math.min(i, 8) * 70 + "ms");
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  items.forEach(function (el) { io.observe(el); });
})();

/* Chat demo, journey progress, stats */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Stats pop in
  var stats = document.querySelectorAll(".stat");
  if (stats.length && !reduce && "IntersectionObserver" in window) {
    stats.forEach(function (s, i) { s.style.setProperty("--rv-d", i * 120 + "ms"); });
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); so.unobserve(e.target); } });
    }, { threshold: 0.4 });
    stats.forEach(function (s) { so.observe(s); });
  } else {
    stats.forEach(function (s) { s.classList.add("in"); });
  }

  // ---- Chat demo plays message by message
  var chat = document.getElementById("chat-demo");
  if (chat) {
    var msgs = Array.prototype.slice.call(chat.querySelectorAll(".msg"));
    var typing = chat.querySelector(".typing");
    var timers = [];
    var play = function () {
      timers.forEach(clearTimeout); timers = [];
      if (reduce) return;
      chat.classList.add("playing");
      msgs.forEach(function (m) { m.classList.remove("shown"); });
      var t = 400;
      msgs.forEach(function (m, i) {
        var out = m.classList.contains("out");
        var len = (m.textContent || "").length;
        timers.push(setTimeout(function () { typing.className = "typing on" + (out ? " out" : ""); chat.appendChild(typing); }, t));
        t += out ? Math.min(1600, 600 + len * 12) : Math.min(1300, 500 + len * 8);
        timers.push(setTimeout(function () { typing.className = "typing"; m.classList.add("shown"); chat.insertBefore(m, typing); }, t));
        t += 500;
      });
      timers.push(setTimeout(function () { typing.className = "typing"; }, t));
    };
    var started = false;
    if ("IntersectionObserver" in window) {
      var co = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting && !started) { started = true; play(); co.disconnect(); }
      }, { threshold: 0.35 });
      co.observe(chat);
    }
    var replay = document.getElementById("chat-replay");
    if (replay) { if (reduce) replay.hidden = true; else replay.addEventListener("click", play); }
  }

  // ---- Journey line fills as you scroll
  var j = document.getElementById("journey");
  if (j) {
    var nodes = j.querySelectorAll(".journey-track i");
    var cards = j.querySelectorAll(".steps li");
    var update = function () {
      var r = j.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
      j.style.setProperty("--p", p.toFixed(3));
      var lit = Math.round(p * (nodes.length - 1) + 0.5);
      for (var k = 0; k < nodes.length; k++) {
        nodes[k].classList.toggle("lit", k < lit);
        if (cards[k]) cards[k].classList.toggle("lit", k < lit);
      }
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }
})();

/* Mobile sticky CTA: show after the hero, hide while the form is on screen */
(function () {
  var bar = document.querySelector("[data-mobile-cta]");
  if (!bar) return;
  var form = document.getElementById("start");
  var formVisible = false;
  if (form && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { formVisible = es[0].isIntersecting; tick(); }, { threshold: 0.05 }).observe(form);
  }
  function tick() {
    var show = window.scrollY > 520 && !formVisible;
    bar.classList.toggle("show", show);
    bar.setAttribute("aria-hidden", show ? "false" : "true");
    bar.querySelectorAll("a").forEach(function (a) { a.tabIndex = show ? 0 : -1; });
  }
  window.addEventListener("scroll", tick, { passive: true });
  tick();
})();
