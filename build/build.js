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
const C = (f) => fs.readFileSync(path.join(__dirname, "content", f), "utf8").replace(/\{icon:(\w+)\}/g, (m, n) => L.icon(n));
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

const TINTS = { ribbon: "#D9467A", heart: "#E0533D", bone: "#D98A1E", walk: "#C46A1A", spine: "#7A56C4", brain: "#4E5BD1", drop: "#1E86C9", fertility: "#2E9D6B" };
function treatmentCard(rel, t) {
  return `<a class="card-link tinted" style="--tint:${TINTS[t.icon] || "#0E5E6F"}" href="${rel}treatments/${t.slug}/"><div class="icon">${icon(t.icon)}</div><h3>${esc(t.name)}</h3><p>${esc(t.short)}</p><span class="more">Learn more ${icon("arrow")}</span></a>`;
}
function cityCard(rel, c) {
  return `<a class="card-link" href="${rel}cities/${c.slug}/"><div class="icon">${icon("pin")}</div><h3>${esc(c.name)}</h3><p>${esc(c.lead.split(". ")[0])}.</p><span class="more">Treatment in ${esc(c.name)} ${icon("arrow")}</span></a>`;
}
function guideCard(rel, g) {
  return `<a class="card-link" href="${rel}guides/${g.slug}/"><div class="icon">${icon(g.icon)}</div><h3>${esc(g.h1)}</h3><p>${esc(g.lead.split(". ")[0])}.</p><span class="more">Read it ${icon("arrow")}</span></a>`;
}
function helpGrid() {
  return `<div class="grid grid-3 m-scroll">${COMMON_HELP.map(([ic, h, p]) => `<div class="card"><div class="icon">${icon(ic)}</div><h3>${h}</h3><p>${p}</p></div>`).join("")}</div>`;
}
function pageHero(rel, crumbs, h1, lead, actions, meta) {
  return `<section class="page-hero"><div class="container">${L.breadcrumb(rel, crumbs)}<h1>${esc(h1)}</h1><p class="lead">${esc(lead)}</p>${actions || ""}${meta ? `<p class="meta-line">${meta}</p>` : ""}</div></section>`;
}
const heroActions = (rel, condition) => `<div class="hero-actions"><a class="btn btn-primary" href="${rel}?condition=${encodeURIComponent(condition || "")}#start">Get my free treatment plan</a><a class="btn btn-wa" href="#" data-wa-link hidden>${icon("chat")} Chat on WhatsApp</a></div>`;

// ------------------------------------------------------------------ VISUALS
function routeMap() {
  const from = [["Patna", 0], ["Gorakhpur", 1], ["Ranchi", 2], ["Raipur", 3], ["Siliguri", 4], ["Kathmandu", 5], ["Dhaka", 6], ["Nairobi", 7]];
  const to = [["Delhi NCR", 0], ["Mumbai", 1], ["Hyderabad", 2], ["Bengaluru", 3], ["Chennai", 4]];
  const links = [[0, 0], [1, 0], [5, 0], [0, 1], [3, 1], [7, 1], [2, 2], [3, 2], [7, 3], [4, 4], [6, 4], [2, 4]];
  const fy = (i) => 30 + i * 40, ty = (j) => 50 + j * 64;
  const paths = links.map(([i, j], k) => {
    const d = `M150 ${fy(i)} C 320 ${fy(i)}, 450 ${ty(j)}, 625 ${ty(j)}`;
    return `<path class="rm-line" d="${d}" style="--k:${k}"/><circle class="rm-dot" r="4"><animateMotion dur="${3.2 + (k % 4) * 0.6}s" begin="${(k * 0.45).toFixed(2)}s" repeatCount="indefinite" path="${d}"/></circle>`;
  }).join("");
  return `<figure class="routemap" aria-label="Illustration: routes from smaller cities and other countries to India's medical cities">
  <svg viewBox="0 0 800 340" role="img" aria-hidden="true">
    ${paths}
    ${from.map(([n, i]) => `<g class="rm-from"><circle cx="150" cy="${fy(i)}" r="6"/><text x="138" y="${fy(i) + 5}" text-anchor="end">${n}</text></g>`).join("")}
    ${to.map(([n, j]) => `<g class="rm-to"><circle cx="625" cy="${ty(j)}" r="11"/><circle class="rm-ping" cx="625" cy="${ty(j)}" r="11"/><text x="646" y="${ty(j) + 6}">${n}</text></g>`).join("")}
  </svg>
  <figcaption>A few of the routes families take. We plan the travel, the room and the help at the other end.</figcaption></figure>`;
}

const CHAT = [
  ["in", "Namaste. Papa ko Patna mein angiography bola hai. Delhi mein karwana chahte hain, kahan jaayein?"],
  ["out", "Namaste Ravi ji, main Priya, Irynt se. Aap reports ki photo bhej dijiye, main abhi dekhti hoon."],
  ["in", "📄 📄 📄  3 photos"],
  ["out", "Mil gayi, thank you. Do achhe hospitals se baat karke shaam tak dono ka estimate bhejti hoon."],
  ["plan", ""],
  ["in", "Aur rehne ka kya hoga? Mummy bhi saath aayengi."],
  ["out", "Hospital se 5 minute pe ek room dekh liya hai, lift wala. Station pe cab bhi aa jaayegi 🙂"],
  ["in", "Bahut badi tension khatam ho gayi. Thank you 🙏"],
];
function chatDemo() {
  const msg = ([who, text], i) => who === "plan"
    ? `<div class="msg out plan-msg" style="--i:${i}"><b>Treatment plan · 2 options</b><span class="pm-row"><span>Option A · Heart hospital</span><b>₹2,95,000</b></span><span class="pm-row"><span>Option B · Multispeciality</span><b>₹3,20,000</b></span><small>Estimates exactly as the hospitals gave them</small></div>`
    : `<div class="msg ${who}" style="--i:${i}">${esc(text)}</div>`;
  return `<div class="phone" aria-label="Example WhatsApp conversation">
    <div class="phone-notch"></div>
    <div class="phone-head"><span class="ph-avatar">P</span><span><b>Priya · Irynt</b><small>usually replies within 2 hours</small></span></div>
    <div class="chat" id="chat-demo">${CHAT.map(msg).join("")}<div class="typing" aria-hidden="true"><span></span><span></span><span></span></div></div>
    <div class="phone-foot"><span>Type a message</span>${icon("chat")}</div>
  </div>`;
}

// ------------------------------------------------------------------ HOME
const HOME_FAQ = [
  ["Do I have to pay Irynt anything?", "No. Finding hospitals, getting estimates, booking appointments and helping with insurance papers is free for you. Some extras do cost money, like a room, a cab or a helper at the hospital. We'll always tell you the price first, and you can say no."],
  ["Then how do you make money?", "Hospitals and some of our partners (rooms, cabs) pay us a fee for sending patients. We're upfront about it. The estimate you see is exactly what the hospital gave us, and we don't add anything on top."],
  ["Are you doctors? Will you tell us which treatment to take?", "No, we're not doctors and we won't advise on treatment. The hospital's specialists do that. Our job is everything around it: finding the right place, arranging travel and stay, and keeping things on track."],
  ["Which hospitals do you work with?", "Only hospitals accredited by NABH or JCI, in the big medical cities. For your case we'll usually get you two or three options so you can compare the doctor, the cost and how long you'll need to stay."],
  ["Is my medical information safe with you?", "Yes. We only send your reports to hospitals you agree to, and only for your treatment. We don't sell or share your data with anyone else."],
  ["Can you help with long treatments like cancer?", "Yes, and honestly that's where we're most useful. Monthly rooms near the hospital, cabs for every visit, medicines, and someone to help the family member who's staying with the patient."],
  ["We live outside India. Can you still help?", "Yes. We get the hospital's letter for your medical visa, pick you up from the airport, arrange a place to stay and a translator if you need one, and check on you every day."],
  ["What if it's an emergency?", "Please don't wait for us. Call 112 in India (or your local emergency number) or go straight to the nearest hospital."],
];

const COMPARE = [
  ["Choosing a hospital", "Asking relatives, Googling, hoping for the best", "Two or three good options for your case, compared for you"],
  ["Knowing the cost", "Every hospital's estimate looks different", "Each estimate explained in simple words"],
  ["Getting a reply", "Waiting on hold with hospital call centres", "A call back within 2 hours"],
  ["Finding a room", "Searching after you arrive, often overpaying", "A room near the hospital, sorted before you travel"],
  ["Getting around", "Haggling with autos and cabs every day", "Pickup and cabs arranged for you"],
  ["Insurance", "Running between the insurance desk and the TPA", "Forms and papers prepared with you"],
  ["After discharge", "Mostly on your own", "Reminders and follow-up visits planned"],
];

write("", L.page({
  path: "", section: "home", data,
  title: "Irynt – Medical Treatment in India, From Hospital to Home",
  description: "Coming to a big city for treatment? We find the right hospital, show you the real estimate, and sort out your stay, travel and help for your family.",
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
        <p class="eyebrow">For families travelling for treatment</p>
        <h1>Coming to a big city for treatment? <span>We'll take care of the rest.</span></h1>
        <p class="lead">Tell us what the doctor has said. Someone from our team will call you back within <b data-response-hours>2</b> hours. We'll help you pick the right hospital, show you what it will really cost, and sort out where you'll stay, how you'll get around and who will help your family while you're there.</p>
        <div class="hero-actions">
          <a href="#start" class="btn btn-primary">Get my free treatment plan</a>
          <a href="#" class="btn btn-wa" data-wa-link hidden>${icon("chat")} Chat on WhatsApp</a>
        </div>
        <ul class="hero-points">
          <li>${icon("check")}Our help costs you nothing</li>
          <li>${icon("check")}You see the hospital's own estimate</li>
          <li>${icon("check")}One person looks after you throughout</li>
          <li>${icon("check")}For families in India and abroad</li>
        </ul>
      </div>
      <div class="hero-visual">
        <svg class="ecg" viewBox="0 0 600 140" preserveAspectRatio="none" aria-hidden="true"><path d="M0 80 H170 l14 -26 l12 52 l16 -92 l16 104 l14 -50 l10 12 H330 l12 -18 l10 30 l10 -12 H600"/></svg>
        <div class="float-badge b1"><span class="fb-ico">${icon("check")}</span><span><b>3 hospital estimates</b><small>ready to compare</small></span></div>
        ${C("plan-card.html")}
        <div class="float-badge b2"><span class="fb-ico amber">${icon("bed")}</span><span><b>Room near the hospital</b><small>booked for 12 nights</small></span></div>
      </div>
    </div>
  </section>
  <section class="stats" aria-label="What you can expect">
    <div class="container">
      <div class="stats-grid">
        <div class="stat"><b>2<em>hrs</em></b><span>to get a call back from us</span></div>
        <div class="stat"><b>₹0</b><span>what our help costs you</span></div>
        <div class="stat"><b>2–3</b><span>hospitals compared for your case</span></div>
        <div class="stat"><b>1</b><span>person who stays with you throughout</span></div>
      </div>
      <ul class="stat-chips"><li>${icon("shield")}Only NABH / JCI hospitals</li><li>${icon("search")}No hidden charges</li><li>${icon("language")}Hindi &amp; English</li></ul>
    </div>
  </section>

  <section class="section" id="treatments">
    <div class="container">
      <div class="section-head center"><p class="eyebrow">Treatments</p><h2>What we can help with</h2>
      <p class="lead">Mostly bigger treatments, the kind where you could be away from home for weeks and the room, the travel and the family matter almost as much as the hospital.</p></div>
      <div class="grid grid-4 m-compact">${treatments.map((t) => treatmentCard(rel, t)).join("")}</div>
    </div>
  </section>

  <section class="section chat-section" id="chat">
    <div class="container chat-grid">
      <div class="chat-copy">
        <p class="eyebrow">What it's like</p>
        <h2>Like having someone you know at the hospital</h2>
        <p class="lead">Most of it happens on WhatsApp, in Hindi or English. You send the reports, we come back with options, and there's always someone a message away.</p>
        <ul class="checklist">
          <li>${icon("check")}<span>A real person replies, not a chatbot</span></li>
          <li>${icon("check")}<span>Your reports only go to hospitals you say yes to</span></li>
          <li>${icon("check")}<span>Estimates shared exactly as the hospital gave them</span></li>
        </ul>
        <div class="hero-actions"><a class="btn btn-primary" href="#start">Start a conversation</a><button type="button" class="btn btn-ghost" id="chat-replay">↺ Play again</button></div>
        <p class="hint">Example conversation. Names and prices are for illustration.</p>
      </div>
      ${chatDemo()}
    </div>
  </section>

  <section class="section section-alt" id="how">
    <div class="container">
      <div class="section-head center"><p class="eyebrow">How it works</p><h2>From first call to coming home</h2><p class="lead">Five simple steps. You can stop at any point, no questions asked.</p></div>
      <div class="journey" id="journey">
      <div class="journey-track" aria-hidden="true"><span class="jt-fill"></span>
        <i>${icon("chat")}</i><i>${icon("phone")}</i><i>${icon("hospital")}</i><i>${icon("doc")}</i><i>${icon("route")}</i>
      </div>
      <ol class="steps">
        <li><h3>Tell us what's wrong</h3><p>Fill the form or just WhatsApp us. Send reports if you have them. It's fine if you don't.</p></li>
        <li><h3>We call you</h3><p>Usually within <span data-response-hours>2</span> hours, between 9 AM and 9 PM. We'll ask a few questions and mostly listen.</p></li>
        <li><h3>We ask the hospitals</h3><p>We send your reports to two or three good hospitals and get their opinion and cost back.</p></li>
        <li><h3>You decide</h3><p>Hospital, room, travel and help, all in one plan. You choose what you want and skip what you don't.</p></li>
        <li><h3>We stay in touch</h3><p>We check on you every day during treatment, and remind you about medicines and check-ups once you're home.</p></li>
      </ol>
      </div>
    </div>
  </section>

  <section class="section" id="plan">
    <div class="container">
      <div class="section-head center"><p class="eyebrow">Services</p><h2>What we can arrange for you</h2><p class="lead">Take only what you need.</p></div>
      <div class="grid grid-4 m-scroll bento">
        <div class="card"><div class="icon">${icon("hospital")}</div><h3>Hospital &amp; doctor</h3><p>Hospitals that are good at your particular treatment, not just the biggest names. You get two or three options with each hospital's own estimate, side by side.</p><span class="bento-tag">${icon("shield")} NABH / JCI accredited only</span>
          <div class="bento-mock" aria-hidden="true"><div class="bm-row rec"><span><b>Option A</b> Heart hospital</span><b>₹2,95,000</b><em>Recommended</em></div><div class="bm-row"><span><b>Option B</b> Multispeciality</span><b>₹3,20,000</b></div><small>Example comparison</small></div></div>
        <div class="card"><div class="icon">${icon("plane")}</div><h3>Travel</h3><p>Train or flight tickets, someone to pick you up when you arrive, and cabs to the hospital.</p></div>
        <div class="card"><div class="icon">${icon("bed")}</div><h3>A room nearby</h3><p>Clean, affordable rooms close to the hospital, by the day or by the month.</p></div>
        <div class="card"><div class="icon">${icon("assistant")}</div><h3>A helping hand</h3><p>Someone to stand in queues, run errands and be with you on the busy days.</p></div>
        <div class="card"><div class="icon">${icon("pill")}</div><h3>Medicines</h3><p>Medicines picked up and delivered to where you're staying.</p></div>
        <div class="card"><div class="icon">${icon("shield")}</div><h3>Insurance papers</h3><p>We help with cashless and claim forms so you're not stuck at the insurance desk.</p></div>
        <div class="card"><div class="icon">${icon("wallet")}</div><h3>Paying for it</h3><p>If money is tight, we'll tell you about medical loans and EMI options.</p></div>
        <div class="card"><div class="icon">${icon("phone")}</div><h3>After you're home</h3><p>Reminders for medicines and tests, and help planning the next visit.</p></div>
      </div>
      <p class="swipe-hint">Swipe to see more →</p>
    </div>
  </section>

  <section class="section section-alt" id="why">
    <div class="container">
      <div class="section-head center"><p class="eyebrow">Why us</p><h2>Doing it yourself vs. with Irynt</h2></div>
      <div class="table-scroll"><table class="compare">
        <thead><tr><th scope="col"></th><th scope="col">On your own</th><th scope="col" class="us">With Irynt</th></tr></thead>
        <tbody>${COMPARE.map(([a, b, c]) => `<tr><th scope="row">${a}</th><td class="no" data-label="On your own">${icon("x")}${b}</td><td class="us yes" data-label="With Irynt">${icon("check")}${c}</td></tr>`).join("")}</tbody>
      </table></div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="band">
        <p class="eyebrow" style="color: var(--accent)">Our promise</p>
        <h2>No hidden commissions. No surprise bills.</h2>
        <p>Many families have had a bad experience with medical agents. That's exactly why we work the way we do.</p>
        <div class="grid grid-2" style="margin-top: 24px">
          <div class="card"><h3>We call back fast</h3><p>Within <span data-response-hours>2</span> hours, between <span data-working-hours>9 AM – 9 PM IST</span>. A real person, not a bot.</p></div>
          <div class="card"><h3>You see the real estimate</h3><p>We pass on what the hospital gives us, as it is. And we'll tell you how we get paid.</p></div>
          <div class="card"><h3>We look after the family too</h3><p>Whoever comes with the patient needs a bed, food and a bit of help. We plan for them as well.</p></div>
          <div class="card"><h3>Doctors make the medical calls</h3><p>We're coordinators, not doctors. We'll never push you towards a treatment.</p></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section section-alt" id="cities">
    <div class="container">
      <div class="section-head center"><p class="eyebrow">Cities</p><h2>Where families usually go</h2><p class="lead">We know where to stay, how to get around and which hospitals to look at in each of these cities.</p></div>
      <div class="grid grid-3 m-scroll">${cities.map((c) => cityCard(rel, c)).join("")}
        <a class="card-link" href="${rel}international-patients/"><div class="icon">${icon("globe")}</div><h3>Coming from abroad?</h3><p>Visa letter, airport pickup, a translator and someone to call every day.</p><span class="more">For international patients ${icon("arrow")}</span></a>
      </div>
      <p class="swipe-hint">Swipe to see more →</p>
    </div>
  </section>

  <section class="section" id="guides">
    <div class="container">
      <div class="section-head center"><p class="eyebrow">Guides</p><h2>Worth reading before you travel</h2></div>
      <div class="grid grid-3 m-scroll">${guides.slice(0, 3).map((g) => guideCard(rel, g)).join("")}</div>
      <p class="center" style="margin-top:20px"><a href="${rel}guides/">See all guides →</a></p>
    </div>
  </section>

${C("intake-form.html")}
  <section class="section section-alt" id="faq">
    <div class="container">
      <div class="section-head center"><p class="eyebrow">Questions</p><h2>Questions people ask us</h2></div>
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
  body: (rel) => pageHero(rel, [["", "Home"], ["treatments/", "Treatments"]], "Treatments we help with", "Pick a treatment to see what usually happens, which reports to keep ready, and how long you may need to stay in the city.", heroActions(rel, "")) +
    `<section class="section"><div class="container"><div class="grid grid-4 m-compact">${treatments.map((t) => treatmentCard(rel, t)).join("")}</div>
    <p class="muted" style="margin-top:24px">Don't see yours here? We help with a lot more, like liver problems, eye surgery and second opinions. <a href="${rel}?condition=Other#start">Just tell us what you need</a>.</p></div></section>` + L.ctaBand(rel),
}), { priority: "0.9" });

treatments.forEach((t) => {
  const crumbs = [["", "Home"], ["treatments/", "Treatments"], [`treatments/${t.slug}/`, t.name]];
  const allFaqs = t.faqs.concat([["Do we have to pay Irynt?", "No, our help is free. If you want a room, cabs or a helper, we'll tell you the price first. The hospital's estimate is passed on to you exactly as they gave it."]]);
  write(`treatments/${t.slug}/`, L.page({
    path: `treatments/${t.slug}/`, section: "treatments", data, ogType: "article",
    title: t.title, description: t.description,
    schema: [L.breadcrumbSchema(crumbs), L.faqSchema(allFaqs),
      { "@context": "https://schema.org", "@type": "WebPage", name: t.h1, description: t.description, url: L.absUrl(`treatments/${t.slug}/`), dateModified: L.SITE.updated, about: { "@type": "MedicalProcedure", name: t.name }, publisher: { "@id": L.SITE.url + "/#org" } }],
    body: (rel) => pageHero(rel, crumbs, t.h1, t.lead, heroActions(rel, t.condition), `Last reviewed ${L.SITE.updatedLabel} · General information, not medical advice`) +
      `<div class="container content-grid"><article class="prose">
        <div class="facts">${t.facts.map(([k, v]) => `<div class="fact"><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join("")}</div>
        ${t.sections.map(([h, html], i) => `<h2 id="s${i + 1}">${esc(h)}</h2>${fill(html)}`).join("\n")}
        <h2 id="help">What we can do for you</h2>
        <p>You'll have one person from our team looking after you, from the first call until you're back home. Here's what they can sort out:</p>
      </article>
      <aside class="aside">${L.asideCta(rel, t.condition, `<div class="aside-box"><h2>On this page</h2><ul class="toc">${t.sections.map(([h], i) => `<li><a href="#s${i + 1}">${esc(h)}</a></li>`).join("")}<li><a href="#help">What we can do</a></li><li><a href="#faq">Common questions</a></li></ul></div>`)}</aside></div>
      <div class="container" style="padding-bottom:16px">${helpGrid()}</div>
      <section class="section" id="faq" style="padding-top:40px"><div class="container"><h2 class="center">Common questions about ${esc(t.name.toLowerCase())}</h2>${L.faqHtml(allFaqs)}</div></section>
      ${L.ctaBand(rel, t.condition, "Want us to look at your case?")}
      <section class="related"><div class="container"><h2>You might also want to read</h2><div class="grid grid-3 m-scroll">${t.related.map((s) => treatmentCard(rel, byslug(s))).join("")}</div>
      <p style="margin-top:18px" class="muted">Cities we help in: ${cities.map((c) => `<a href="${rel}cities/${c.slug}/">${esc(c.name)}</a>`).join(" · ")}</p></div></section>`,
  }), { priority: "0.8" });
});

// ------------------------------------------------------------------ CITIES
write("cities/", L.page({
  path: "cities/", section: "cities", data,
  title: "Treatment in India's Top Medical Cities | Irynt",
  description: "Planning treatment in Delhi NCR, Mumbai, Chennai, Bengaluru or Hyderabad? Get accredited hospital options, stays near the hospital and local travel arranged.",
  schema: [L.breadcrumbSchema([["", "Home"], ["cities/", "Cities"]])],
  body: (rel) => pageHero(rel, [["", "Home"], ["cities/", "Cities"]], "Cities we help in", "Most families travel to one of these five cities. We know the hospitals, where to stay nearby and how to get around in each.", heroActions(rel, "")) +
    `<section class="section"><div class="container"><div class="grid grid-3">${cities.map((c) => cityCard(rel, c)).join("")}</div></div></section>` + L.ctaBand(rel),
}), { priority: "0.8" });

cities.forEach((c) => {
  const crumbs = [["", "Home"], ["cities/", "Cities"], [`cities/${c.slug}/`, c.name]];
  const faqs = [
    [`Which hospital in ${c.name} should we go to?`, `It depends on the treatment. Send us your reports and we'll ask two or three suitable hospitals in ${c.name} for their opinion and cost, then go through them with you.`],
    [`Can you find us a room near the hospital in ${c.name}?`, "Yes. We'll suggest rooms we've checked ourselves, close to your hospital, by the day or by the month. You'll see the price before anything is booked."],
    [`Will someone pick us up in ${c.name}?`, "Yes, from the airport or the railway station. We can also arrange cabs for every hospital visit."],
  ];
  write(`cities/${c.slug}/`, L.page({
    path: `cities/${c.slug}/`, section: "cities", data,
    title: c.title, description: c.description,
    schema: [L.breadcrumbSchema(crumbs), L.faqSchema(faqs)],
    body: (rel) => pageHero(rel, crumbs, c.h1, c.lead, heroActions(rel, "")) +
      `<div class="container content-grid"><article class="prose">
        <h2 id="arrive">Getting to ${esc(c.name)}</h2><p>${esc(c.arrive)}</p><p>Just tell us when your train or flight gets in. Someone will be there to take you to your room or straight to the hospital.</p>
        <h2 id="tips">A few things worth knowing</h2><ul class="checklist">${c.tips.map((tip) => `<li>${CHECK}<span>${esc(tip)}</span></li>`).join("")}</ul>
        <h2 id="treatments">What families come to ${esc(c.name)} for</h2>
        <ul>${c.specialties.map((s) => `<li><a href="${rel}treatments/${s}/">${esc(byslug(s).name)}</a></li>`).join("")}</ul>
        <h2 id="help">How we can help in ${esc(c.name)}</h2>
        <p>We'll find the right hospitals in ${esc(c.name)} for your case, show you what each one has quoted, and take care of the room, the cabs and anything else your family needs while you're there.</p>
      </article><aside class="aside">${L.asideCta(rel, "")}</aside></div>
      <div class="container" style="padding-bottom:16px">${helpGrid()}</div>
      <section class="section" style="padding-top:40px"><div class="container"><h2 class="center">Questions about ${esc(c.name)}</h2>${L.faqHtml(faqs)}</div></section>
      ${L.ctaBand(rel, "", `Coming to ${c.name} for treatment?`)}
      <section class="related"><div class="container"><h2>Other cities</h2><div class="grid grid-3 m-scroll">${cities.filter((x) => x.slug !== c.slug).slice(0, 3).map((x) => cityCard(rel, x)).join("")}</div></div></section>`,
  }), { priority: "0.7" });
});

// ------------------------------------------------------------------ GUIDES
write("guides/", L.page({
  path: "guides/", section: "guides", data,
  title: "Patient Guides: Planning Treatment in India | Irynt",
  description: "Free, practical guides for patients and families: medical visas, choosing a hospital, reading cost estimates, cashless insurance and a travel checklist.",
  schema: [L.breadcrumbSchema([["", "Home"], ["guides/", "Guides"]])],
  body: (rel) => pageHero(rel, [["", "Home"], ["guides/", "Guides"]], "Guides for patients and families", "Things we wish every family knew before travelling for treatment. Short, practical and free.") +
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
    body: (rel) => pageHero(rel, crumbs, g.h1, g.lead, "", `Written by the Irynt team · Updated ${L.SITE.updatedLabel}`) +
      `<div class="container content-grid"><article class="prose">${fill(g.body)}
      <h2 id="faq">Common questions</h2>${L.faqHtml(g.faqs)}</article>
      <aside class="aside">${L.asideCta(rel, "", headings.length ? `<div class="aside-box"><h2>In this guide</h2><ul class="toc">${headings.map(([id, h]) => `<li><a href="#${id}">${esc(h)}</a></li>`).join("")}</ul></div>` : "")}</aside></div>
      ${L.ctaBand(rel)}
      <section class="related"><div class="container"><h2>More guides</h2><div class="grid grid-3 m-scroll">${guides.filter((x) => x.slug !== g.slug).slice(0, 3).map((x) => guideCard(rel, x)).join("")}</div></div></section>`,
  }), { priority: "0.6" });
});

// ------------------------------------------------------------------ INTERNATIONAL
const INTL_FAQ = [
  ["Can you get me the Indian medical visa?", "We can't apply for you, but we get the hospital's invitation letter and help you get your papers in order. You then apply on the official Government of India visa website."],
  ["Can my family come with me?", "Yes. Under the current rules, up to two family members can usually come on e-Medical Attendant visas. We'll find a place for them to stay too."],
  ["I don't speak English or Hindi. Is that a problem?", "Not at all. Tell us your language and we'll arrange a translator for your doctor visits."],
  ["How do I pay the hospital?", "You pay the hospital directly, the way they ask. Before you travel, we'll explain how much deposit they need and how the rest is paid."],
];
write("international-patients/", L.page({
  path: "international-patients/", section: "international", data,
  title: "Medical Treatment in India for International Patients | Irynt",
  description: "Coming to India for treatment? Get hospital opinions, the medical visa letter, airport pickup, stay, translator and daily support from one coordinator.",
  schema: [L.breadcrumbSchema([["", "Home"], ["international-patients/", "International patients"]]), L.faqSchema(INTL_FAQ)],
  body: (rel) => pageHero(rel, [["", "Home"], ["international-patients/", "International patients"]], "Coming to India for treatment from abroad", "You'll get hospital opinions before you book a ticket. After that we help with the visa letter, pick you up at the airport, and stay in touch every day until you're home again.", heroActions(rel, "")) +
    `<section class="section"><div class="container">
      <div class="section-head center"><h2>What happens, step by step</h2></div>
      <ol class="steps">
        <li><h3>Send your reports</h3><p>On WhatsApp or email. Our doctor advisor takes a look first.</p></li>
        <li><h3>Hear from hospitals</h3><p>Two or three hospitals send their opinion and a written estimate.</p></li>
        <li><h3>Get the visa letter</h3><p>Once you choose, we get the hospital's letter for your e-Medical visa.</p></li>
        <li><h3>Land in India</h3><p>We meet you at the airport and help with a SIM card, money exchange and your room.</p></li>
        <li><h3>Treatment, then home</h3><p>A translator if you need one, a daily call from us, and follow-up once you're back.</p></li>
      </ol>
    </div></section>
    <section class="section section-alt"><div class="container">
      <div class="grid grid-3">
        <div class="card"><div class="icon">${icon("doc")}</div><h3>Visa paperwork</h3><p>The hospital's letter and a checklist of what you'll need. <a href="${rel}guides/india-medical-visa-guide/">Read the visa guide</a>.</p></div>
        <div class="card"><div class="icon">${icon("plane")}</div><h3>Airport pickup</h3><p>Someone waiting for you when you land, to take you to your room or the hospital.</p></div>
        <div class="card"><div class="icon">${icon("language")}</div><h3>Translator</h3><p>Arabic, French, Bengali, Swahili, Russian and others. Just ask.</p></div>
        <div class="card"><div class="icon">${icon("bed")}</div><h3>A room nearby</h3><p>Rooms and small apartments with a kitchen, good for longer stays.</p></div>
        <div class="card"><div class="icon">${icon("wallet")}</div><h3>No surprises on cost</h3><p>The hospital's estimate in writing, and our prices for extras told upfront.</p></div>
        <div class="card"><div class="icon">${icon("phone")}</div><h3>Follow-up from home</h3><p>We set up video calls with your doctor and pass on reports after you leave.</p></div>
      </div>
    </div></section>
    <section class="section"><div class="container"><h2 class="center">What people come to India for</h2><div class="grid grid-4 m-compact" style="margin-top:24px">${treatments.map((t) => treatmentCard(rel, t)).join("")}</div></div></section>
    <section class="section section-alt"><div class="container"><h2 class="center">Questions from patients abroad</h2>${L.faqHtml(INTL_FAQ)}</div></section>
    ${L.ctaBand(rel, "", "Get hospital opinions before you travel")}`,
}), { priority: "0.9" });

// ------------------------------------------------------------------ ABOUT / CONTACT / PARTNER
write("about/", L.page({
  path: "about/", section: "about", data,
  title: "About Irynt: Honest Care Coordination for Treatment in India",
  description: "Irynt helps families plan treatment in India with one coordinator, original hospital estimates and no hidden mark-ups. How we work and what we promise.",
  schema: [L.breadcrumbSchema([["", "Home"], ["about/", "About"]])],
  body: (rel) => pageHero(rel, [["", "Home"], ["about/", "About"]], "About Irynt", "We help families who have to travel for treatment. Finding the right hospital shouldn't depend on whether you happen to know a doctor in the big city.") +
    `<div class="container content-grid"><article class="prose">
      <h2>Why we started</h2>
      <p>If you've ever taken a parent to a big city hospital, you'll know how it goes. You get off the train with a plastic folder full of reports and no idea where to start. The first few days go in finding the right doctor. The room near the hospital costs twice what it should. Someone has to stand at the insurance desk for hours. And all this while you're worried about the person you came with.</p>
      <p>We started Irynt so families don't have to figure all of that out alone. One person from our team stays with you from the first phone call until you're back home, and handles the running around so you can focus on the patient.</p>
      <!-- Add the founder's name, photo and a short personal story here. Real people build trust (and help SEO). -->
      <h2>What we promise you</h2>
      <ul class="checklist">
        <li>${CHECK}<span><b>You see the real estimate.</b> Whatever the hospital quotes, you see it as it is.</span></li>
        <li>${CHECK}<span><b>We're open about money.</b> Hospitals and some partners pay us a fee. It never gets added to your bill.</span></li>
        <li>${CHECK}<span><b>No deals with doctors.</b> We don't pay doctors for referrals, and we don't take money from them either.</span></li>
        <li>${CHECK}<span><b>Doctors decide treatment.</b> We'll never tell you which treatment to choose.</span></li>
        <li>${CHECK}<span><b>Your reports stay private.</b> They only go to hospitals you've said yes to.</span></li>
      </ul>
      <h2>Who we work with</h2>
      <p>Only NABH or JCI accredited hospitals. For rooms, cabs and helpers, we visit and check them ourselves first. If a partner treats a patient badly or overcharges, we stop working with them.</p>
    </article><aside class="aside">${L.asideCta(rel, "")}</aside></div>` + L.ctaBand(rel),
}), { priority: "0.5" });

write("contact/", L.page({
  path: "contact/", section: "", data,
  title: "Contact Irynt: WhatsApp, Email & Treatment Enquiries",
  description: "Contact Irynt for a free treatment plan, partnership enquiries or help with an existing case. WhatsApp and email support, 9 AM to 9 PM IST.",
  schema: [L.breadcrumbSchema([["", "Home"], ["contact/", "Contact"]])],
  body: (rel) => pageHero(rel, [["", "Home"], ["contact/", "Contact"]], "Get in touch", "WhatsApp is the quickest way to reach us. If you want a treatment plan, the form takes about two minutes.") +
    `<section class="section"><div class="container"><div class="grid grid-3">
      <div class="card"><div class="icon">${icon("doc")}</div><h3>Need help with treatment?</h3><p>Fill the short form and we'll call you back within 2 hours (9 AM to 9 PM).</p><p style="margin-top:12px"><a class="btn btn-primary btn-sm" href="${rel}#start">Get my free plan</a></p></div>
      <div class="card"><div class="icon">${icon("chat")}</div><h3>WhatsApp &amp; email</h3><p>Hours: <span data-working-hours>9 AM – 9 PM IST</span>.</p><p style="margin-top:12px"><a class="btn btn-wa btn-sm" href="#" data-wa-link hidden>WhatsApp us</a> <a href="#" data-email-link></a></p></div>
      <div class="card"><div class="icon">${icon("route")}</div><h3>Already talking to us?</h3><p>Open the tracking link we sent you, or WhatsApp us your case ID.</p><p style="margin-top:12px"><a href="${rel}track.html">Track your case</a></p></div>
      <div class="card"><div class="icon">${icon("hospital")}</div><h3>Hospitals and partners</h3><p>Run a hospital, guest house or cab service? We'd love to talk.</p><p style="margin-top:12px"><a href="${rel}partner.html">Partner with Irynt</a></p></div>
      <div class="card"><div class="icon">${icon("clock")}</div><h3>Is it an emergency?</h3><p>Please don't message us. Call <b>112</b> in India or go to the nearest hospital now.</p></div>
    </div></div></section>`,
}), { priority: "0.5" });

write("partner.html", L.page({
  path: "partner.html", section: "", data,
  title: "Partner with Irynt: For Hospitals, Stays & Care Providers",
  description: "Irynt brings prepared, well-supported patients to accredited hospitals and trusted local providers. Learn how referrals work and what we ask of partners.",
  schema: [L.breadcrumbSchema([["", "Home"], ["partner.html", "Partner with us"]])],
  body: (rel) => pageHero(rel, [["", "Home"], ["partner.html", "Partner with us"]], "Work with Irynt", "We help patients from smaller cities and from abroad get to the right hospital. They arrive with their reports in order, a place to stay and someone helping them.",
      `<div class="hero-actions"><a class="btn btn-wa" data-partner-wa href="#" data-wa-link hidden>${icon("chat")} WhatsApp us</a><button type="button" class="btn btn-ghost" onclick="window.print()">Print one-pager</button></div>`) +
    `<section class="section"><div class="container"><h2>Why hospitals work with us</h2><p class="lead">Less chasing, fewer no-shows, and families who know what to expect.</p><div class="grid grid-3" style="margin-top:20px">
      <div class="card"><div class="icon">${icon("doc")}</div><h3>Cases that are ready</h3><p>We collect the reports, put them in order and have our doctor advisor look at them before they reach you.</p></div>
      <div class="card"><div class="icon">${icon("route")}</div><h3>Patients turn up on time</h3><p>Their travel, room and local cabs are already sorted, so appointments don't get missed.</p></div>
      <div class="card"><div class="icon">${icon("users")}</div><h3>One person to call</h3><p>Our coordinator deals with the family's questions and paperwork, so your staff don't have to.</p></div>
      <div class="card"><div class="icon">${icon("search")}</div><h3>Clean and honest</h3><p>Your estimate goes to the patient exactly as you give it. We never pay or take money from individual doctors.</p></div>
      <div class="card"><div class="icon">${icon("phone")}</div><h3>Patients come back for follow-up</h3><p>We remind them about tests and return visits, the way you've advised.</p></div>
      <div class="card"><div class="icon">${icon("globe")}</div><h3>From India and abroad</h3><p>Families from smaller Indian towns, and patients from other countries who need visa help.</p></div>
    </div></div></section>
    <section class="section section-alt"><div class="container content-grid" style="padding-top:0;padding-bottom:0"><div class="prose">
      <h2>How a referral works</h2><ol><li><b>Case sent</b>: patient summary and reports, with consent.</li><li><b>Your opinion and estimate</b>: ideally within 24–72 hours.</li><li><b>Patient chooses</b>: we present 2–3 options with your original estimate.</li><li><b>Admission</b>: we confirm dates, travel and stay. The patient pays the hospital directly.</li><li><b>Follow-up</b>: we stay in touch after discharge.</li></ol>
      <h2>What we ask of partners</h2><ul><li>A named point of contact (international desk, marketing or patient relations)</li><li>Timely opinions and written estimates</li><li>Fair, consistent pricing: the same or better than for walk-in patients</li><li>A clear, written facilitation agreement</li></ul>
      <h2>We're also looking for</h2><p>Clean, reasonably priced <b>rooms</b> near hospitals, <b>cab</b> drivers people can rely on, <b>care helpers</b>, <b>pharmacies</b> that deliver and <b>translators</b>.</p>
    </div><aside class="aside"><div class="aside-box cta"><h2>Let's talk</h2><p>Send us your name, your organisation and your city. We'll set up a quick call.</p><a class="btn btn-light" href="#" data-wa-link hidden>WhatsApp us</a><p style="margin-top:10px"><a href="#" data-email-link style="color:#fff"></a></p></div></aside></div></section>`,
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
  body: (rel) => `<section class="notfound"><div class="container"><h1>Page not found</h1><p class="lead" style="margin:0 auto 24px">Sorry, we couldn't find that page. It may have moved.</p><div class="hero-actions" style="justify-content:center"><a class="btn btn-primary" href="${L.SITE.url}/">Go to the homepage</a><a class="btn btn-ghost" href="${L.SITE.url}/treatments/">See treatments</a></div></div></section>`,
}), { nositemap: true });

// ------------------------------------------------------------------ SITEMAP / ROBOTS / MANIFEST
const urls = written.filter((w) => w.sitemap).map((w) => `  <url><loc>${L.absUrl(w.path)}</loc><lastmod>${L.SITE.updated}</lastmod><priority>${w.priority}</priority></url>`);
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /dashboard.html\nDisallow: /track.html\n\nSitemap: ${L.SITE.url}/sitemap.xml\n`);
fs.writeFileSync(path.join(ROOT, "site.webmanifest"), JSON.stringify({ name: "Irynt", short_name: "Irynt", start_url: "./", display: "standalone", background_color: "#FBFAF7", theme_color: "#0E5E6F", icons: [{ src: "assets/logo.png", sizes: "512x512", type: "image/png" }] }, null, 2) + "\n");

console.log(`Built ${written.length} pages + sitemap.xml (${urls.length} URLs), robots.txt, site.webmanifest for ${L.SITE.url}`);
