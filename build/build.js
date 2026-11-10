#!/usr/bin/env node
// Builds the public website: home, treatment/city/guide pages, sitemap and robots.txt.
// Run:  node build/build.js        (set SITE_URL=https://yourdomain.com for a custom domain)
"use strict";
const fs = require("fs");
const path = require("path");
const L = require("./lib");
const { treatments, COMMON_HELP } = require("./content/treatments");
const cities = require("./content/cities");
const guides = require("./content/guides");

const ROOT = path.join(__dirname, "..");
const C = (f) => fs.readFileSync(path.join(__dirname, "content", f), "utf8");
const data = { treatments, cities, guides };
const { icon, esc } = L;
const written = [];
const CHECK = icon("check");
const fill = (html) => html.split("{check}").join(CHECK);
const byslug = (slug) => treatments.find((t) => t.slug === slug);

function write(p, html, opts) {
  const file = p === "" ? "index.html" : p.endsWith("/") ? p + "index.html" : p;
  const full = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
  written.push({ path: p, sitemap: !(opts && opts.nositemap), priority: (opts && opts.priority) || "0.7" });
}

function treatmentCard(rel, t) {
  return `<a class="card-link" href="${rel}treatments/${t.slug}/"><div class="icon">${icon(t.icon)}</div><h3>${esc(t.name)}</h3><p>${esc(t.short)}</p><span class="more">Learn more ${icon("arrow")}</span></a>`;
}
function cityCard(rel, c) {
  return `<a class="card-link" href="${rel}cities/${c.slug}/"><div class="icon">${icon("pin")}</div><h3>${esc(c.name)}</h3><p>${esc(c.lead.split(". ")[0])}.</p><span class="more">Plan treatment in ${esc(c.name)} ${icon("arrow")}</span></a>`;
}
function guideCard(rel, g) {
  return `<a class="card-link" href="${rel}guides/${g.slug}/"><div class="icon">${icon(g.icon)}</div><h3>${esc(g.h1)}</h3><p>${esc(g.lead.split(". ")[0])}.</p><span class="more">Read the guide ${icon("arrow")}</span></a>`;
}
function helpGrid() {
  return `<div class="grid grid-3">${COMMON_HELP.map(([ic, h, p]) => `<div class="card"><div class="icon">${icon(ic)}</div><h3>${h}</h3><p>${p}</p></div>`).join("")}</div>`;
}
function pageHero(rel, crumbs, h1, lead, actions, meta) {
  return `<section class="page-hero"><div class="container">${L.breadcrumb(rel, crumbs)}<h1>${esc(h1)}</h1><p class="lead">${esc(lead)}</p>${actions || ""}${meta ? `<p class="meta-line">${meta}</p>` : ""}</div></section>`;
}
const heroActions = (rel, condition) => `<div class="hero-actions"><a class="btn btn-primary" href="${rel}?condition=${encodeURIComponent(condition || "")}#start">Get my free treatment plan</a><a class="btn btn-wa" href="#" data-wa-link hidden>${icon("chat")} Chat on WhatsApp</a></div>`;

// ------------------------------------------------------------------ HOME
const HOME_FAQ = [
  ["Is Irynt's service free?", "Yes, care coordination (finding hospitals, comparing estimates, booking appointments, insurance paperwork help and follow-up) is free for patients. Optional services such as a personal assistant, stay, cabs or medicines have a cost, and we always tell you the price before you confirm anything."],
  ["How does Irynt make money?", "Partner hospitals and service providers may pay Irynt a facilitation fee for coordinating patients. We tell you this openly, show you the hospital's own estimate, and never add hidden charges to it. You are free to choose any option, or none."],
  ["Are you a hospital? Do you give medical advice?", "No. Irynt is a care coordination service. We do not diagnose or treat. All medical opinions and treatment come from qualified doctors at the hospital you choose."],
  ["Which hospitals do you work with?", "We work with hospitals accredited by recognised bodies such as NABH or JCI, in major medical cities across India. We share 2–3 options for your case so you can compare doctors, costs and recovery time."],
  ["Is my medical information safe?", "Your reports are shared only with the hospitals and doctors you approve, only for your treatment. We do not sell your data."],
  ["Can you help if my treatment is long, like cancer treatment?", "Yes. This is where we help most: longer stays near the hospital, monthly room options, medicine refills, cabs for each visit and support for the family member staying with the patient."],
  ["I live outside India. Can you help?", "Yes. We arrange the hospital invitation letter for the medical visa, airport pickup, stay, translator and daily support during treatment."],
  ["What if it's an emergency?", "Irynt is not an emergency service. In an emergency, call 112 in India or your local emergency number, or go to the nearest hospital immediately."],
];

const COMPARE = [
  ["Finding the right hospital", "Asking relatives, searching online, guessing", "2–3 accredited options matched to the case, side by side"],
  ["Understanding the cost", "Different formats, unclear inclusions", "Original estimates, explained in plain language"],
  ["First response", "Waiting on hospital call centres", "A personal coordinator within 2 working hours"],
  ["Stay near the hospital", "Searching on arrival, overpaying", "Checked rooms close to the hospital, daily or monthly"],
  ["Travel and local cabs", "Arranged separately, often last-minute", "Pickup and cabs for every visit, planned"],
  ["Insurance paperwork", "Handled alone at the hospital desk", "Pre-authorisation documents prepared with you"],
  ["After you go home", "Usually on your own", "Medicine reminders, follow-ups and next-visit planning"],
];

write("", L.page({
  path: "", section: "home", data,
  title: "Irynt – Medical Treatment in India, Planned End to End",
  description: "Accredited hospitals, original cost estimates and a full plan for travel, stay and family support. A personal coordinator calls you within 2 hours.",
  scripts: ["assets/gas-emulator.js", "assets/core.js", "assets/api.js"],
  schema: [
    { "@context": "https://schema.org", "@type": "WebSite", name: "Irynt", url: L.SITE.url + "/" },
    { "@context": "https://schema.org", "@type": "Service", serviceType: "Medical travel and care coordination", provider: { "@id": L.SITE.url + "/#org" }, areaServed: ["IN", "BD", "NP", "NG", "KE", "IQ", "OM"], offers: { "@type": "Offer", price: "0", priceCurrency: "INR", description: "Care coordination is free for patients" } },
    L.faqSchema(HOME_FAQ),
  ],
  body: (rel) => `
  <section class="hero">
    <div class="container hero-grid">
      <div>
        <p class="eyebrow">Medical treatment in India · Care coordination</p>
        <h1>Your treatment in India, <span>planned end to end.</span></h1>
        <p class="lead">Tell us the health problem. A personal care coordinator contacts you within <b data-response-hours>2</b> hours, finds the right accredited hospital and doctor, and plans everything else: travel, stay, medicines, insurance help and support for your family.</p>
        <div class="hero-actions">
          <a href="#start" class="btn btn-primary">Get my free treatment plan</a>
          <a href="#" class="btn btn-wa" data-wa-link hidden>${icon("chat")} Chat on WhatsApp</a>
        </div>
        <ul class="hero-points">
          <li>${icon("check")}Care coordination is free</li>
          <li>${icon("check")}Original hospital estimates, no mark-ups</li>
          <li>${icon("check")}One coordinator from start to follow-up</li>
          <li>${icon("check")}For patients from India and abroad</li>
        </ul>
      </div>
      ${C("plan-card.html")}
    </div>
  </section>
  <div class="trust-strip"><ul>
    <li>${icon("shield")}NABH / JCI accredited hospitals</li>
    <li>${icon("clock")}First call within 2 working hours</li>
    <li>${icon("search")}Transparent, original estimates</li>
    <li>${icon("language")}Help in Hindi &amp; English</li>
  </ul></div>

  <section class="section" id="treatments">
    <div class="container">
      <div class="section-head center"><p class="eyebrow">Treatments we coordinate</p><h2>Specialist care at accredited hospitals across India</h2>
      <p class="lead">Especially for serious and long treatments, where the stay, medicines and family support matter as much as the hospital.</p></div>
      <div class="grid grid-4">${treatments.map((t) => treatmentCard(rel, t)).join("")}</div>
    </div>
  </section>

  <section class="section section-alt" id="how">
    <div class="container">
      <div class="section-head center"><p class="eyebrow">How it works</p><h2>From “where do we go?” to “we're home” in five steps</h2><p class="lead">You focus on getting better. We handle the rest.</p></div>
      <ol class="steps">
        <li><h3>Tell us the problem</h3><p>Fill a short form or message us on WhatsApp. Share reports if you have them.</p></li>
        <li><h3>Coordinator calls you</h3><p>Within <span data-response-hours>2</span> working hours, your personal coordinator calls to understand your needs.</p></li>
        <li><h3>Compare hospitals</h3><p>We get opinions and estimates from 2–3 accredited hospitals and show them side by side.</p></li>
        <li><h3>Get your full plan</h3><p>Hospital, travel, stay, assistant, medicines and insurance help, in one clear plan.</p></li>
        <li><h3>We stay with you</h3><p>Daily check-ins during treatment and follow-up after you return home.</p></li>
      </ol>
    </div>
  </section>

  <section class="section" id="plan">
    <div class="container">
      <div class="section-head center"><p class="eyebrow">Everything in one plan</p><h2>One coordinator. Every part of your treatment trip.</h2></div>
      <div class="grid grid-4">
        <div class="card"><div class="icon">${icon("hospital")}</div><h3>Right hospital &amp; doctor</h3><p>Accredited hospitals and experienced specialists matched to your condition and budget.</p></div>
        <div class="card"><div class="icon">${icon("plane")}</div><h3>Travel</h3><p>Train or flight bookings, airport and station pickup, and local cabs during treatment.</p></div>
        <div class="card"><div class="icon">${icon("bed")}</div><h3>Stay</h3><p>Clean, affordable rooms near the hospital for the patient and family, for days or months.</p></div>
        <div class="card"><div class="icon">${icon("assistant")}</div><h3>Personal assistant</h3><p>A helper for hospital visits, queues, paperwork and errands when you need one.</p></div>
        <div class="card"><div class="icon">${icon("pill")}</div><h3>Medicines</h3><p>Prescriptions filled through a pharmacy partner and delivered to where you stay.</p></div>
        <div class="card"><div class="icon">${icon("shield")}</div><h3>Insurance help</h3><p>Pre-authorisation, cashless claims and reimbursement paperwork handled with you.</p></div>
        <div class="card"><div class="icon">${icon("wallet")}</div><h3>Payment options</h3><p>Guidance on medical loans and EMI options if treatment cost is a worry.</p></div>
        <div class="card"><div class="icon">${icon("phone")}</div><h3>Follow-up</h3><p>After you go home: medicine reminders, test schedules and the next visit, planned.</p></div>
      </div>
    </div>
  </section>

  <section class="section section-alt" id="why">
    <div class="container">
      <div class="section-head center"><p class="eyebrow">Why families choose Irynt</p><h2>Doing it alone vs. with a coordinator</h2></div>
      <div class="table-scroll"><table class="compare">
        <thead><tr><th scope="col"></th><th scope="col">On your own</th><th scope="col" class="us">With Irynt</th></tr></thead>
        <tbody>${COMPARE.map(([a, b, c]) => `<tr><th scope="row">${a}</th><td class="no">${icon("x")}${b}</td><td class="us yes">${icon("check")}${c}</td></tr>`).join("")}</tbody>
      </table></div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="band">
        <p class="eyebrow" style="color: var(--accent)">The Irynt promise</p>
        <h2>We earn your trust before we earn anything else.</h2>
        <p>Medical travel has a reputation for hidden commissions and surprise bills. We built Irynt to be the opposite.</p>
        <div class="grid grid-2" style="margin-top: 24px">
          <div class="card"><h3>Fast first response</h3><p>A real person contacts you within <span data-response-hours>2</span> hours during working hours (<span data-working-hours>9 AM – 9 PM IST</span>).</p></div>
          <div class="card"><h3>Original hospital estimates</h3><p>We share the estimate exactly as the hospital gives it, and we tell you openly how Irynt is paid.</p></div>
          <div class="card"><h3>Care for the family too</h3><p>The person who travels with the patient needs a room, food and help too. We plan for them.</p></div>
          <div class="card"><h3>Doctors decide, not us</h3><p>We are coordinators, not doctors. Medical decisions always come from qualified specialists.</p></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section section-alt" id="cities">
    <div class="container">
      <div class="section-head center"><p class="eyebrow">Medical cities</p><h2>Treatment in India's leading medical cities</h2><p class="lead">We know where families can stay, how to get around and which hospitals to compare in each city.</p></div>
      <div class="grid grid-3">${cities.map((c) => cityCard(rel, c)).join("")}
        <a class="card-link" href="${rel}international-patients/"><div class="icon">${icon("globe")}</div><h3>Coming from abroad?</h3><p>Medical visa support, airport pickup, translator and daily help.</p><span class="more">International patients ${icon("arrow")}</span></a>
      </div>
    </div>
  </section>

  <section class="section" id="guides">
    <div class="container">
      <div class="section-head center"><p class="eyebrow">Free guides</p><h2>Plan with confidence</h2></div>
      <div class="grid grid-3">${guides.slice(0, 3).map((g) => guideCard(rel, g)).join("")}</div>
      <p class="center" style="margin-top:20px"><a href="${rel}guides/">See all guides →</a></p>
    </div>
  </section>

${C("intake-form.html")}
  <section class="section section-alt" id="faq">
    <div class="container">
      <div class="section-head center"><p class="eyebrow">Questions</p><h2>Frequently asked questions</h2></div>
      ${L.faqHtml(HOME_FAQ)}
    </div>
  </section>`,
}), { priority: "1.0" });

// ------------------------------------------------------------------ TREATMENTS
write("treatments/", L.page({
  path: "treatments/", section: "treatments", data,
  title: "Treatments We Coordinate in India | Irynt",
  description: "Cancer care, heart surgery, joint replacement, spine and neuro care, kidney care and IVF. Compare accredited hospitals in India and get a full plan.",
  schema: [L.breadcrumbSchema([["", "Home"], ["treatments/", "Treatments"]])],
  body: (rel) => pageHero(rel, [["", "Home"], ["treatments/", "Treatments"]], "Treatments we coordinate in India", "We work with accredited hospitals for planned and long treatments. Choose a treatment to see what to expect, which reports to share and how we plan the stay around it.", heroActions(rel, "")) +
    `<section class="section"><div class="container"><div class="grid grid-4">${treatments.map((t) => treatmentCard(rel, t)).join("")}</div>
    <p class="muted" style="margin-top:24px">Don't see your treatment? We coordinate many other specialities too, including liver and digestive care, eye surgery and second opinions. <a href="${rel}?condition=Other#start">Tell us what you need</a>.</p></div></section>` + L.ctaBand(rel),
}), { priority: "0.9" });

treatments.forEach((t) => {
  const crumbs = [["", "Home"], ["treatments/", "Treatments"], [`treatments/${t.slug}/`, t.name]];
  const allFaqs = t.faqs.concat([["Is Irynt's coordination free?", "Yes. Coordination is free for patients. Optional services like stay, cabs or an assistant are priced upfront, and hospital estimates are shared exactly as given."]]);
  write(`treatments/${t.slug}/`, L.page({
    path: `treatments/${t.slug}/`, section: "treatments", data, ogType: "article",
    title: t.title, description: t.description,
    schema: [L.breadcrumbSchema(crumbs), L.faqSchema(allFaqs),
      { "@context": "https://schema.org", "@type": "WebPage", name: t.h1, description: t.description, url: L.absUrl(`treatments/${t.slug}/`), dateModified: L.SITE.updated, about: { "@type": "MedicalProcedure", name: t.name }, publisher: { "@id": L.SITE.url + "/#org" } }],
    body: (rel) => pageHero(rel, crumbs, t.h1, t.lead, heroActions(rel, t.condition), `Last reviewed ${L.SITE.updatedLabel} · General information, not medical advice`) +
      `<div class="container content-grid"><article class="prose">
        <div class="facts">${t.facts.map(([k, v]) => `<div class="fact"><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join("")}</div>
        ${t.sections.map(([h, html], i) => `<h2 id="s${i + 1}">${esc(h)}</h2>${fill(html)}`).join("\n")}
        <h2 id="help">How Irynt helps with ${esc(t.name.toLowerCase())}</h2>
        <p>One coordinator handles every part of the journey, from the first call to follow-up at home:</p>
      </article>
      <aside class="aside">${L.asideCta(rel, t.condition, `<div class="aside-box"><h2>On this page</h2><ul class="toc">${t.sections.map(([h], i) => `<li><a href="#s${i + 1}">${esc(h)}</a></li>`).join("")}<li><a href="#help">How Irynt helps</a></li><li><a href="#faq">FAQs</a></li></ul></div>`)}</aside></div>
      <div class="container" style="padding-bottom:16px">${helpGrid()}</div>
      <section class="section" id="faq" style="padding-top:40px"><div class="container"><h2 class="center">${esc(t.name)}: frequently asked questions</h2>${L.faqHtml(allFaqs)}</div></section>
      ${L.ctaBand(rel, t.condition, `Get a free ${t.name.toLowerCase()} plan`)}
      <section class="related"><div class="container"><h2>Related treatments</h2><div class="grid grid-3">${t.related.map((s) => treatmentCard(rel, byslug(s))).join("")}</div>
      <p style="margin-top:18px" class="muted">Popular cities: ${cities.map((c) => `<a href="${rel}cities/${c.slug}/">${esc(c.name)}</a>`).join(" · ")}</p></div></section>`,
  }), { priority: "0.8" });
});

// ------------------------------------------------------------------ CITIES
write("cities/", L.page({
  path: "cities/", section: "cities", data,
  title: "Treatment in India's Top Medical Cities | Irynt",
  description: "Planning treatment in Delhi NCR, Mumbai, Chennai, Bengaluru or Hyderabad? Get accredited hospital options, stays near the hospital and local travel arranged.",
  schema: [L.breadcrumbSchema([["", "Home"], ["cities/", "Cities"]])],
  body: (rel) => pageHero(rel, [["", "Home"], ["cities/", "Cities"]], "Treatment in India's leading medical cities", "We coordinate treatment at accredited hospitals in India's major medical cities, with practical help for families coming from other states and countries.", heroActions(rel, "")) +
    `<section class="section"><div class="container"><div class="grid grid-3">${cities.map((c) => cityCard(rel, c)).join("")}</div></div></section>` + L.ctaBand(rel),
}), { priority: "0.8" });

cities.forEach((c) => {
  const crumbs = [["", "Home"], ["cities/", "Cities"], [`cities/${c.slug}/`, c.name]];
  const faqs = [
    [`How do I choose a hospital in ${c.name}?`, `Share your reports with us. We get opinions and estimates from 2–3 accredited hospitals in ${c.name} that suit the treatment, and compare them with you.`],
    [`Can you find a stay near the hospital in ${c.name}?`, "Yes. We suggest checked rooms close to your hospital, for the patient and family, by the day or by the month, with prices shown before you book."],
    [`Do you arrange pickup in ${c.name}?`, "Yes. We arrange pickup from the airport or railway station and cabs for hospital visits."],
  ];
  write(`cities/${c.slug}/`, L.page({
    path: `cities/${c.slug}/`, section: "cities", data,
    title: c.title, description: c.description,
    schema: [L.breadcrumbSchema(crumbs), L.faqSchema(faqs)],
    body: (rel) => pageHero(rel, crumbs, c.h1, c.lead, heroActions(rel, "")) +
      `<div class="container content-grid"><article class="prose">
        <h2 id="arrive">Getting to ${esc(c.name)}</h2><p>${esc(c.arrive)}</p><p>Tell us your arrival time and we arrange pickup straight to your stay or the hospital.</p>
        <h2 id="tips">Practical tips for families</h2><ul class="checklist">${c.tips.map((tip) => `<li>${CHECK}<span>${esc(tip)}</span></li>`).join("")}</ul>
        <h2 id="treatments">Treatments families travel to ${esc(c.name)} for</h2>
        <ul>${c.specialties.map((s) => `<li><a href="${rel}treatments/${s}/">${esc(byslug(s).name)}</a></li>`).join("")}</ul>
        <h2 id="help">How Irynt helps in ${esc(c.name)}</h2>
        <p>We compare accredited hospitals in ${esc(c.name)} for your case, share each hospital's original estimate, and plan the stay, local travel and help your family needs.</p>
      </article><aside class="aside">${L.asideCta(rel, "")}</aside></div>
      <div class="container" style="padding-bottom:16px">${helpGrid()}</div>
      <section class="section" style="padding-top:40px"><div class="container"><h2 class="center">Questions about treatment in ${esc(c.name)}</h2>${L.faqHtml(faqs)}</div></section>
      ${L.ctaBand(rel, "", `Plan your treatment in ${c.name}`)}
      <section class="related"><div class="container"><h2>Other medical cities</h2><div class="grid grid-3">${cities.filter((x) => x.slug !== c.slug).slice(0, 3).map((x) => cityCard(rel, x)).join("")}</div></div></section>`,
  }), { priority: "0.7" });
});

// ------------------------------------------------------------------ GUIDES
write("guides/", L.page({
  path: "guides/", section: "guides", data,
  title: "Patient Guides: Planning Treatment in India | Irynt",
  description: "Free, practical guides for patients and families: medical visas, choosing a hospital, reading cost estimates, cashless insurance and a travel checklist.",
  schema: [L.breadcrumbSchema([["", "Home"], ["guides/", "Guides"]])],
  body: (rel) => pageHero(rel, [["", "Home"], ["guides/", "Guides"]], "Free guides for patients and families", "Practical, plain-language guides to help you plan treatment in another city or country.") +
    `<section class="section"><div class="container"><div class="grid grid-3">${guides.map((g) => guideCard(rel, g)).join("")}</div></div></section>` + L.ctaBand(rel),
}), { priority: "0.7" });

guides.forEach((g) => {
  const crumbs = [["", "Home"], ["guides/", "Guides"], [`guides/${g.slug}/`, g.short]];
  const headings = [...g.body.matchAll(/<h2 id="([^"]+)">([^<]+)<\/h2>/g)].map((m) => [m[1], m[2]]);
  write(`guides/${g.slug}/`, L.page({
    path: `guides/${g.slug}/`, section: "guides", data, ogType: "article",
    title: g.title, description: g.description,
    schema: [L.breadcrumbSchema(crumbs), L.faqSchema(g.faqs),
      { "@context": "https://schema.org", "@type": "Article", headline: g.h1, description: g.description, datePublished: L.SITE.updated, dateModified: L.SITE.updated,
        author: { "@type": "Organization", name: "Irynt Care Team", url: L.SITE.url + "/about/" }, publisher: { "@id": L.SITE.url + "/#org" }, mainEntityOfPage: L.absUrl(`guides/${g.slug}/`), image: L.SITE.url + "/assets/og-image.png" }],
    body: (rel) => pageHero(rel, crumbs, g.h1, g.lead, "", `By the Irynt Care Team · Updated ${L.SITE.updatedLabel}`) +
      `<div class="container content-grid"><article class="prose">${fill(g.body)}
      <h2 id="faq">Frequently asked questions</h2>${L.faqHtml(g.faqs)}</article>
      <aside class="aside">${L.asideCta(rel, "", headings.length ? `<div class="aside-box"><h2>In this guide</h2><ul class="toc">${headings.map(([id, h]) => `<li><a href="#${id}">${esc(h)}</a></li>`).join("")}</ul></div>` : "")}</aside></div>
      ${L.ctaBand(rel)}
      <section class="related"><div class="container"><h2>More guides</h2><div class="grid grid-3">${guides.filter((x) => x.slug !== g.slug).slice(0, 3).map((x) => guideCard(rel, x)).join("")}</div></div></section>`,
  }), { priority: "0.6" });
});

// ------------------------------------------------------------------ INTERNATIONAL
const INTL_FAQ = [
  ["Do you help with the Indian medical visa?", "We arrange the hospital's invitation letter and help you prepare documents. You apply on the official Government of India visa website."],
  ["Can my family come with me?", "Yes. Under current rules, usually up to two attendants can travel on e-Medical Attendant visas. We plan their stay too."],
  ["Do you provide translators?", "Yes, on request. Tell us your language and we will arrange a translator for doctor visits."],
  ["How do I pay the hospital?", "You pay the hospital directly as per its process. We explain the deposit and payment steps before you travel."],
];
write("international-patients/", L.page({
  path: "international-patients/", section: "international", data,
  title: "Medical Treatment in India for International Patients | Irynt",
  description: "Coming to India for treatment? Get hospital opinions, the medical visa letter, airport pickup, stay, translator and daily support from one coordinator.",
  schema: [L.breadcrumbSchema([["", "Home"], ["international-patients/", "International patients"]]), L.faqSchema(INTL_FAQ)],
  body: (rel) => pageHero(rel, [["", "Home"], ["international-patients/", "International patients"]], "Treatment in India for international patients", "India's accredited hospitals receive patients from around the world. We make the journey simple: opinions before you travel, the visa letter, and someone with you from arrival to follow-up.", heroActions(rel, "")) +
    `<section class="section"><div class="container">
      <div class="section-head center"><h2>Your journey with Irynt</h2></div>
      <ol class="steps">
        <li><h3>Share reports</h3><p>Send reports by WhatsApp or email. We review them with our doctor advisor.</p></li>
        <li><h3>Get opinions</h3><p>2–3 accredited hospitals share an opinion and written estimate.</p></li>
        <li><h3>Visa letter</h3><p>We arrange the hospital's invitation letter for your e-Medical visa.</p></li>
        <li><h3>Arrival</h3><p>Airport pickup, SIM card, currency exchange and your stay near the hospital.</p></li>
        <li><h3>Treatment &amp; home</h3><p>Translator, daily check-ins and follow-up after you return home.</p></li>
      </ol>
    </div></section>
    <section class="section section-alt"><div class="container">
      <div class="grid grid-3">
        <div class="card"><div class="icon">${icon("doc")}</div><h3>Medical visa support</h3><p>Hospital invitation letter and document checklist. <a href="${rel}guides/india-medical-visa-guide/">Read the visa guide</a>.</p></div>
        <div class="card"><div class="icon">${icon("plane")}</div><h3>Airport pickup</h3><p>Met at arrival and taken to your stay or straight to the hospital.</p></div>
        <div class="card"><div class="icon">${icon("language")}</div><h3>Translator</h3><p>Arabic, French, Bengali, Swahili, Russian and more, on request.</p></div>
        <div class="card"><div class="icon">${icon("bed")}</div><h3>Stay near the hospital</h3><p>Rooms and service apartments with kitchen access for long treatments.</p></div>
        <div class="card"><div class="icon">${icon("wallet")}</div><h3>Clear costs</h3><p>Original hospital estimates in writing, and optional services priced upfront.</p></div>
        <div class="card"><div class="icon">${icon("phone")}</div><h3>Follow-up from home</h3><p>We coordinate teleconsultations and reports after you return.</p></div>
      </div>
    </div></section>
    <section class="section"><div class="container"><h2 class="center">Treatments international patients come for</h2><div class="grid grid-4" style="margin-top:24px">${treatments.map((t) => treatmentCard(rel, t)).join("")}</div></div></section>
    <section class="section section-alt"><div class="container"><h2 class="center">Questions from international patients</h2>${L.faqHtml(INTL_FAQ)}</div></section>
    ${L.ctaBand(rel, "", "Get opinions before you travel")}`,
}), { priority: "0.9" });

// ------------------------------------------------------------------ ABOUT / CONTACT / PARTNER
write("about/", L.page({
  path: "about/", section: "about", data,
  title: "About Irynt: Honest Care Coordination for Treatment in India",
  description: "Irynt helps families plan treatment in India with one coordinator, original hospital estimates and no hidden mark-ups. How we work and what we promise.",
  schema: [L.breadcrumbSchema([["", "Home"], ["about/", "About"]])],
  body: (rel) => pageHero(rel, [["", "Home"], ["about/", "About"]], "We help families get the right treatment, without the chaos", "Irynt is a care coordination service for patients travelling to another city or country for treatment. We exist because finding the right hospital should not depend on who you know.") +
    `<div class="container content-grid"><article class="prose">
      <h2>Why we started Irynt</h2>
      <p>Every day, families from smaller towns travel to big cities for treatment. They arrive with a folder of reports, little information and a lot of fear. They spend days finding the right doctor, overpay for a room, and handle insurance paperwork alone, while also caring for someone who is unwell.</p>
      <p>Irynt brings all of that into one plan, handled by one coordinator who stays with the family from the first call until follow-up at home.</p>
      <!-- Add the founder's name, photo and a short personal story here. Real people build trust (and help SEO). -->
      <h2>What we promise</h2>
      <ul class="checklist">
        <li>${CHECK}<span><b>Original estimates.</b> We share each hospital's estimate exactly as given.</span></li>
        <li>${CHECK}<span><b>Open about how we are paid.</b> Hospitals and partners may pay us a facilitation fee; it is never added to your estimate.</span></li>
        <li>${CHECK}<span><b>No payments to doctors.</b> We never pay or accept referral fees from individual doctors.</span></li>
        <li>${CHECK}<span><b>Doctors decide.</b> We coordinate; qualified doctors make every medical decision.</span></li>
        <li>${CHECK}<span><b>Your data stays private.</b> Reports go only to hospitals you approve.</span></li>
      </ul>
      <h2>How we choose partners</h2>
      <p>We work with hospitals accredited by recognised bodies such as NABH or JCI, and with stays, cab operators and assistants we have checked ourselves. Partners that treat patients poorly or overcharge are removed.</p>
    </article><aside class="aside">${L.asideCta(rel, "")}</aside></div>` + L.ctaBand(rel),
}), { priority: "0.5" });

write("contact/", L.page({
  path: "contact/", section: "", data,
  title: "Contact Irynt: WhatsApp, Email & Treatment Enquiries",
  description: "Contact Irynt for a free treatment plan, partnership enquiries or help with an existing case. WhatsApp and email support, 9 AM to 9 PM IST.",
  schema: [L.breadcrumbSchema([["", "Home"], ["contact/", "Contact"]])],
  body: (rel) => pageHero(rel, [["", "Home"], ["contact/", "Contact"]], "Contact Irynt", "The fastest way to reach us is WhatsApp. For a treatment plan, the form takes about 3 minutes.") +
    `<section class="section"><div class="container"><div class="grid grid-3">
      <div class="card"><div class="icon">${icon("doc")}</div><h3>New treatment enquiry</h3><p>Fill the short form and a coordinator calls you within 2 working hours.</p><p style="margin-top:12px"><a class="btn btn-primary btn-sm" href="${rel}#start">Get my free plan</a></p></div>
      <div class="card"><div class="icon">${icon("chat")}</div><h3>WhatsApp &amp; email</h3><p>Hours: <span data-working-hours>9 AM – 9 PM IST</span>.</p><p style="margin-top:12px"><a class="btn btn-wa btn-sm" href="#" data-wa-link hidden>WhatsApp us</a> <a href="#" data-email-link></a></p></div>
      <div class="card"><div class="icon">${icon("route")}</div><h3>Existing case</h3><p>Use the tracking link your coordinator sent you, or message us with your case ID.</p><p style="margin-top:12px"><a href="${rel}track.html">Track your case</a></p></div>
      <div class="card"><div class="icon">${icon("hospital")}</div><h3>Hospitals &amp; partners</h3><p>Hospitals, stays, cab operators and translators: we'd like to hear from you.</p><p style="margin-top:12px"><a href="${rel}partner.html">Partner with Irynt</a></p></div>
      <div class="card"><div class="icon">${icon("clock")}</div><h3>Emergencies</h3><p>Irynt is not an emergency service. Call <b>112</b> in India or go to the nearest hospital.</p></div>
    </div></div></section>`,
}), { priority: "0.5" });

write("partner.html", L.page({
  path: "partner.html", section: "", data,
  title: "Partner with Irynt: For Hospitals, Stays & Care Providers",
  description: "Irynt brings prepared, well-supported patients to accredited hospitals and trusted local providers. Learn how referrals work and what we ask of partners.",
  schema: [L.breadcrumbSchema([["", "Home"], ["partner.html", "Partner with us"]])],
  body: (rel) => pageHero(rel, [["", "Home"], ["partner.html", "Partner with us"]], "Partner with Irynt", "We coordinate complete treatment journeys for patients from smaller cities and from abroad, and bring you patients who arrive prepared, informed and supported.",
      `<div class="hero-actions"><a class="btn btn-wa" data-partner-wa href="#" data-wa-link hidden>${icon("chat")} WhatsApp us</a><button type="button" class="btn btn-ghost" onclick="window.print()">Print one-pager</button></div>`) +
    `<section class="section"><div class="container"><h2>Why hospitals work with us</h2><div class="grid grid-3" style="margin-top:20px">
      <div class="card"><div class="icon">${icon("doc")}</div><h3>Pre-qualified cases</h3><p>Reports are collected, organised and reviewed by our doctor advisor before they reach your team.</p></div>
      <div class="card"><div class="icon">${icon("route")}</div><h3>Patients arrive ready</h3><p>Travel, stay near your hospital, local transport and an assistant are arranged.</p></div>
      <div class="card"><div class="icon">${icon("users")}</div><h3>One point of contact</h3><p>A dedicated coordinator handles family questions, paperwork and logistics.</p></div>
      <div class="card"><div class="icon">${icon("search")}</div><h3>Transparent and ethical</h3><p>Your estimate goes to the patient exactly as given. We never pay or accept fees from individual doctors.</p></div>
      <div class="card"><div class="icon">${icon("phone")}</div><h3>Follow-up continuity</h3><p>We help patients with reminders, tests and return visits as you advise.</p></div>
      <div class="card"><div class="icon">${icon("globe")}</div><h3>Domestic &amp; international</h3><p>Families from tier-2/3 Indian cities, and international patients needing visa support.</p></div>
    </div></div></section>
    <section class="section section-alt"><div class="container content-grid" style="padding-top:0;padding-bottom:0"><div class="prose">
      <h2>How a referral works</h2><ol><li><b>Case sent</b>: patient summary and reports, with consent.</li><li><b>Your opinion and estimate</b>: ideally within 24–72 hours.</li><li><b>Patient chooses</b>: we present 2–3 options with your original estimate.</li><li><b>Admission</b>: we confirm dates, travel and stay. The patient pays the hospital directly.</li><li><b>Follow-up</b>: we stay in touch after discharge.</li></ol>
      <h2>What we ask of partners</h2><ul><li>A named point of contact (international desk, marketing or patient relations)</li><li>Timely opinions and written estimates</li><li>Fair, consistent pricing: the same or better than for walk-in patients</li><li>A clear, written facilitation agreement</li></ul>
      <h2>Also looking for</h2><p>Clean, affordable <b>stays</b> near hospitals, reliable <b>cab</b> operators, trained <b>care assistants</b>, <b>pharmacies</b> that deliver and <b>translators</b>.</p>
    </div><aside class="aside"><div class="aside-box cta"><h2>Let's talk</h2><p>Message us with your organisation's name and city, and we'll set up a short call.</p><a class="btn btn-light" href="#" data-wa-link hidden>WhatsApp us</a><p style="margin-top:10px"><a href="#" data-email-link style="color:#fff"></a></p></div></aside></div></section>`,
}), { priority: "0.4" });

// ------------------------------------------------------------------ LEGAL + 404
[["privacy.html", "Privacy Policy", "How Irynt collects, uses and protects personal and health information, in line with India's Digital Personal Data Protection Act, 2023."],
 ["terms.html", "Terms & Disclaimer", "Terms of use for Irynt's medical travel and care coordination service, including what Irynt is and is not responsible for."],
 ["consent.html", "Patient Consent", "The consent patients give when requesting a treatment plan from Irynt: contact, sharing reports with approved hospitals and partners, and withdrawal."]].forEach(([file, name, desc]) => {
  write(file, L.page({
    path: file, section: "", data, title: `${name} | Irynt`, description: desc,
    body: () => `<!-- DRAFT: have a lawyer review this page and replace every [BRACKETED] item before launch. -->\n<div class="legal">${C("legal/" + file.replace(".html", ".html"))}</div>`,
  }), { priority: "0.2" });
});

write("404.html", L.page({
  path: "404.html", section: "", data, noindex: true, absBase: true, title: "Page not found | Irynt", description: "This page could not be found.",
  body: (rel) => `<section class="notfound"><div class="container"><h1>Page not found</h1><p class="lead" style="margin:0 auto 24px">The page you were looking for doesn't exist or has moved.</p><div class="hero-actions" style="justify-content:center"><a class="btn btn-primary" href="${L.SITE.url}/">Go to the homepage</a><a class="btn btn-ghost" href="${L.SITE.url}/treatments/">See treatments</a></div></div></section>`,
}), { nositemap: true });

// ------------------------------------------------------------------ SITEMAP / ROBOTS / MANIFEST
const urls = written.filter((w) => w.sitemap).map((w) => `  <url><loc>${L.absUrl(w.path)}</loc><lastmod>${L.SITE.updated}</lastmod><priority>${w.priority}</priority></url>`);
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /dashboard.html\nDisallow: /track.html\n\nSitemap: ${L.SITE.url}/sitemap.xml\n`);
fs.writeFileSync(path.join(ROOT, "site.webmanifest"), JSON.stringify({ name: "Irynt", short_name: "Irynt", start_url: "./", display: "standalone", background_color: "#FBFAF7", theme_color: "#0E5E6F", icons: [{ src: "assets/logo.png", sizes: "512x512", type: "image/png" }] }, null, 2) + "\n");

console.log(`Built ${written.length} pages + sitemap.xml (${urls.length} URLs), robots.txt, site.webmanifest for ${L.SITE.url}`);
