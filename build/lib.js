// Shared layout, icons and SEO helpers for the static site build.
"use strict";

const SITE = {
  name: "Irynt",
  // Change this when you connect a custom domain (or set SITE_URL when building).
  url: (process.env.SITE_URL || "https://preetampanda12.github.io/irynt").replace(/\/$/, ""),
  tagline: "Your complete treatment journey, planned and handled.",
  locale: "en_IN",
  updated: "2026-11-10",
};
SITE.updatedLabel = new Date(SITE.updated + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const ICONS = {
  hospital: '<path d="M4 21V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v16"/><path d="M2 21h20"/><path d="M12 8v6M9 11h6"/><path d="M10 21v-3h4v3"/>',
  plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  bed: '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>',
  assistant: '<circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="m16 11 2 2 4-4"/>',
  pill: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  wallet: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M16 15h2"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
  heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/><path d="M3.5 12h4l2-3 3 6 2-3h6"/>',
  ribbon: '<path d="M12 2a4 4 0 0 0-4 4c0 3 4 7 4 7s4-4 4-7a4 4 0 0 0-4-4z"/><path d="M9 10.5 5 21l3.5-2 1.7 2.5L12 13"/><path d="M15 10.5 19 21l-3.5-2-1.7 2.5L12 13"/>',
  bone: '<path d="M17 10c.7-.7 1.7-.7 2.4 0a1.7 1.7 0 0 0 2.4-2.4 1.7 1.7 0 0 0-2.4-2.4 1.7 1.7 0 0 0-2.4-2.4c-.7.7-.7 1.7 0 2.4L7 15.1c-.7-.7-1.7-.7-2.4 0a1.7 1.7 0 0 0-2.4 2.4 1.7 1.7 0 0 0 2.4 2.4 1.7 1.7 0 0 0 2.4 2.4c.7-.7.7-1.7 0-2.4z"/>',
  walk: '<circle cx="13" cy="4" r="2"/><path d="m9 20 2-6 3 3v5"/><path d="m7 10 4-3 3 3 3 1"/><path d="m11 14-2-4"/>',
  spine: '<rect x="9" y="2" width="6" height="4" rx="1"/><rect x="9" y="9" width="6" height="4" rx="1"/><rect x="9" y="16" width="6" height="4" rx="1"/><path d="M12 6v3M12 13v3M12 20v2M6 4h2M16 4h2M6 11h2M16 11h2M6 18h2M16 18h2"/>',
  brain: '<path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3 3 3 0 0 0 3-1V4a3 3 0 0 0-3-1z"/><path d="M15 3a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3 3 3 0 0 1-3-1V4a3 3 0 0 1 3-1z"/>',
  drop: '<path d="M12 22a7 7 0 0 0 7-7c0-4-7-13-7-13S5 11 5 15a7 7 0 0 0 7 7z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
  fertility: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/>',
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  car: '<path d="M5 17h14v-5l-2-5H7l-2 5z"/><path d="M5 12h14"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/>',
  language: '<path d="M4 5h8M8 3v2M6 5c0 4 3 7 6 8M10 5c0 3-3 6-6 8"/><path d="m13 21 4-9 4 9M14.5 18h5"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
};

function icon(name, cls) {
  const body = ICONS[name] || ICONS.check;
  return `<svg class="ico${cls ? " " + cls : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// path: "" for home, "treatments/" for a hub, "treatments/knee-replacement-in-india/", or a file like "privacy.html"
function relFor(path) {
  const depth = path.endsWith("/") ? path.split("/").length - 1 : path.split("/").length - 1;
  return depth > 0 ? "../".repeat(depth) : "";
}
function absUrl(path) { return SITE.url + "/" + path; }

const NAV = [
  ["treatments/", "Treatments", "treatments"],
  ["cities/", "Cities", "cities"],
  ["international-patients/", "International", "international"],
  ["guides/", "Guides", "guides"],
  ["about/", "About", "about"],
];

function header(rel, section) {
  return `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container nav">
    <a href="${rel || "./"}" class="brand" aria-label="Irynt home"><img src="${rel}assets/logo.svg" alt="" width="36" height="36">irynt</a>
    <button class="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links">☰</button>
    <nav class="nav-links" id="nav-links" aria-label="Main">
      ${NAV.map(([href, label, key]) => `<a href="${rel}${href}"${section === key ? ' aria-current="page"' : ""}>${label}</a>`).join("\n      ")}
      <a href="${rel}#start" class="btn btn-primary">Get free treatment plan</a>
    </nav>
  </div>
</header>`;
}

function footer(rel, data) {
  const col = (title, items) => `<div><h3>${title}</h3><ul>${items.map(([href, label]) => `<li><a href="${rel}${href}">${esc(label)}</a></li>`).join("")}</ul></div>`;
  return `<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <a href="${rel || "./"}" class="brand"><img src="${rel}assets/logo.svg" alt="" width="36" height="36">irynt</a>
        <p>${esc(SITE.tagline)} Care coordination for patients travelling within India and from abroad.</p>
        <ul>
          <li data-wa-item hidden><a href="#" data-wa-link>WhatsApp us</a></li>
          <li data-email-item hidden><a href="#" data-email-link></a></li>
          <li>Hours: <span data-working-hours>9 AM – 9 PM IST</span></li>
        </ul>
      </div>
      ${col("Treatments", data.treatments.map((t) => [`treatments/${t.slug}/`, t.name]))}
      ${col("Cities", data.cities.map((c) => [`cities/${c.slug}/`, "Treatment in " + c.name]))}
      ${col("Guides", [["international-patients/", "International patients"]].concat(data.guides.map((g) => [`guides/${g.slug}/`, g.short])))}
      ${col("Company", [["about/", "About Irynt"], ["contact/", "Contact"], ["partner.html", "Partner with us"], ["track.html", "Track your case"], ["privacy.html", "Privacy Policy"], ["terms.html", "Terms & Disclaimer"], ["consent.html", "Patient Consent"]])}
    </div>
    <p class="disclaimer">Irynt is a medical travel and care coordination service. Irynt is not a hospital, clinic or medical practitioner and does not provide medical advice, diagnosis or treatment. Information on this website is general and is not a substitute for advice from a qualified doctor. Not for emergencies: call 112 (India) or your local emergency number. © <span id="year">2026</span> Irynt.</p>
  </div>
</footer>
<a href="#" class="wa-float" data-wa-float aria-label="Chat on WhatsApp" target="_blank" rel="noopener">${icon("chat")}</a>`;
}

function breadcrumb(rel, items) {
  // items: [[path, label], ...] – last one is the current page
  return `<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${items.map(([p, label], i) =>
    i === items.length - 1 ? `<li aria-current="page">${esc(label)}</li>` : `<li><a href="${rel}${p}">${esc(label)}</a></li>`).join("")}</ol></nav>`;
}

function breadcrumbSchema(items) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map(([p, label], i) => ({ "@type": "ListItem", position: i + 1, name: label, item: absUrl(p) })) };
}

function faqSchema(faqs) {
  return { "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a.replace(/<[^>]+>/g, "") } })) };
}

function faqHtml(faqs) {
  return `<div class="faq">${faqs.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${a}</p></details>`).join("")}</div>`;
}

const ORG = () => ({
  "@context": "https://schema.org", "@type": "Organization", "@id": SITE.url + "/#org",
  name: SITE.name, url: SITE.url + "/", logo: SITE.url + "/assets/logo.png",
  description: "Medical travel and care coordination for patients seeking treatment in India.",
  areaServed: "IN",
});

function page(o) {
  // o: { path, title, description, section, body, schema: [], noindex, ogType, scripts: [], data, extraHead }
  const rel = o.absBase ? SITE.url + "/" : relFor(o.path);
  const canonical = absUrl(o.path);
  const schema = [ORG()].concat(o.schema || []);
  const scripts = ["assets/config.js"].concat(o.scripts || []).concat(["assets/app.js"]);
  return `<!doctype html>
<html lang="en-IN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(o.title)}</title>
  <meta name="description" content="${esc(o.description)}">
  <link rel="canonical" href="${canonical}">
  ${o.noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
  <meta name="theme-color" content="#0E5E6F">
  <meta property="og:site_name" content="Irynt">
  <meta property="og:type" content="${o.ogType || "website"}">
  <meta property="og:title" content="${esc(o.title)}">
  <meta property="og:description" content="${esc(o.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE.url}/assets/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="${SITE.locale}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${rel}assets/logo.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="${rel}assets/logo.png">
  <link rel="manifest" href="${rel}site.webmanifest">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${rel}assets/styles.css">
${schema.map((s) => `  <script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n")}
</head>
<body>
${header(rel, o.section)}
<main id="main">
${o.body(rel)}
</main>
${footer(rel, o.data)}
${scripts.map((s) => `<script src="${rel}${s}"></script>`).join("\n")}
</body>
</html>
`;
}

function ctaBand(rel, condition, title, text) {
  const q = condition ? `?condition=${encodeURIComponent(condition)}` : "";
  return `<section class="section" style="padding-top:24px"><div class="container"><div class="cta-band">
  <div><h2>${esc(title || "Get your free treatment plan")}</h2><p>${esc(text || "Tell us the problem. A personal coordinator calls you within 2 working hours with hospital options and a complete plan for travel, stay and support.")}</p></div>
  <div class="btn-row"><a class="btn btn-light" href="${rel}${q}#start">Get my free plan ${icon("arrow")}</a><a class="btn btn-wa" href="#" data-wa-link hidden>${icon("chat")} WhatsApp</a></div>
</div></div></section>`;
}

function asideCta(rel, condition, extra) {
  const q = condition ? `?condition=${encodeURIComponent(condition)}` : "";
  return `<div class="aside-box cta"><h2>Free treatment plan</h2><p>Share your reports. Get 2–3 accredited hospital options, original estimates and a complete travel and stay plan.</p>
  <a class="btn btn-light" href="${rel}${q}#start">Get my plan ${icon("arrow")}</a><a class="btn btn-wa" href="#" data-wa-link hidden>${icon("chat")} WhatsApp us</a></div>${extra || ""}`;
}

module.exports = { SITE, ICONS, icon, esc, relFor, absUrl, page, breadcrumb, breadcrumbSchema, faqSchema, faqHtml, ctaBand, asideCta };
