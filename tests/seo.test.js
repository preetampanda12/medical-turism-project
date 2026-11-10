// SEO + link checks for every page in sitemap.xml. Run: node tests/seo.test.js
"use strict";
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const ROOT = path.join(__dirname, "..");

const sitemap = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
const base = sitemap.match(/<loc>([^<]+)<\/loc>/)[1].replace(/\/$/, "");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const fileFor = (u) => {
  let p = u.slice(base.length + 1);
  if (p === "" || p.endsWith("/")) p += "index.html";
  return path.join(ROOT, p);
};

let problems = [];
const titles = new Map(), descs = new Map();
let pages = 0, links = 0;

for (const u of urls.concat([base + "/404.html"])) {
  const file = fileFor(u);
  const rel = path.relative(ROOT, file);
  if (!fs.existsSync(file)) { problems.push(`${rel}: file missing`); continue; }
  const html = fs.readFileSync(file, "utf8");
  pages++;
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
  const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  const isPage = !u.endsWith("404.html");

  if (title.length < 20 || title.length > 65) problems.push(`${rel}: title length ${title.length}`);
  if (isPage && (desc.length < 70 || desc.length > 160)) problems.push(`${rel}: description length ${desc.length}`);
  if (isPage && canonical !== u) problems.push(`${rel}: canonical ${canonical} ≠ ${u}`);
  if (h1s !== 1) problems.push(`${rel}: ${h1s} <h1> tags`);
  if (!/<html lang="en-IN">/.test(html)) problems.push(`${rel}: missing lang`);
  if (!/og:image/.test(html)) problems.push(`${rel}: missing og:image`);
  if (isPage) {
    if (titles.has(title)) problems.push(`${rel}: duplicate title with ${titles.get(title)}`);
    if (descs.has(desc)) problems.push(`${rel}: duplicate description with ${descs.get(desc)}`);
    titles.set(title, rel); descs.set(desc, rel);
  }
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { problems.push(`${rel}: invalid JSON-LD`); }
  }
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt="/.test(m[0])) problems.push(`${rel}: <img> without alt`);

  // internal links must resolve
  if (u.endsWith("404.html")) continue;
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    let h = m[1];
    if (/^(https?:|mailto:|tel:|#|data:)/.test(h)) continue;
    links++;
    h = h.split("#")[0].split("?")[0];
    let target = path.resolve(path.dirname(file), h || ".");
    if (h === "" || h.endsWith("/") || h === "./" || h === ".") target = path.join(target, "index.html");
    if (!fs.existsSync(target)) problems.push(`${rel}: broken link ${m[1]}`);
  }
}

console.log(`SEO: checked ${pages} pages, ${links} internal links`);
if (problems.length) { console.log(problems.map((p) => "  ✗ " + p).join("\n")); process.exitCode = 1; }
else console.log("  ✓ unique titles & descriptions, one H1, canonical, OG image, valid JSON-LD, no broken links");
assert.ok(urls.length >= 25, "sitemap has " + urls.length + " URLs");
