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
