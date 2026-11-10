// End-to-end browser tests (Playwright). Run: node tests/e2e.test.js [screenshotDir]
// 1) DEMO mode: website form → dashboard → partners → plan builder → publish → patient tracking page.
// 2) LIVE mode: same pages against a fake Apps Script URL served by the real backend code.
const http = require("http");
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { chromium, devices } = require("playwright");
const Emu = require("../assets/gas-emulator.js");

const ROOT = path.join(__dirname, "..");
const SHOTS = process.argv[2] || "";
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".gs": "text/plain", ".png": "image/png", ".webmanifest": "application/manifest+json" };
let pass = 0;
const ok = (m) => { pass++; console.log("  ✓ " + m); };
const shot = (page, name, opts) => SHOTS ? page.screenshot({ path: path.join(SHOTS, name + ".png"), ...(opts || {}) }) : null;

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
      const file = path.join(ROOT, p.endsWith("/") ? p + "index.html" : p);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
      fs.createReadStream(file).pipe(res);
    });
    srv.listen(0, "127.0.0.1", () => resolve(srv));
  });
}

async function fillIntake(page, who, opts) {
  // Step 1 – problem
  if (opts && opts.checkWizard) {
    assert.strictEqual(await page.textContent("#wz-count"), "Step 1 of 4");
    await page.click("#wz-next");
    assert.ok((await page.textContent("#form-error")).includes("type of health problem"));
    assert.ok(await page.isHidden("#patientName"));
  }
  await page.click('.tile:has(input[value="Heart"])');
  await page.fill("#problem", "Breathlessness, doctor advised valve replacement.");
  await page.click("#wz-next");
  // Step 2 – patient
  await page.fill("#patientName", who.patient);
  await page.fill("#patientAge", "61");
  if (opts && opts.checkWizard) {
    await page.click("#wz-back");
    assert.strictEqual(await page.inputValue("#problem"), "Breathlessness, doctor advised valve replacement.");
    await page.click("#wz-next");
    assert.strictEqual(await page.inputValue("#patientName"), who.patient);
  }
  await page.click("#wz-next");
  // Step 3 – plan
  await page.click('.chip-check:has(input[value="Stay near hospital"])');
  await page.click('.chip-check:has(input[value="Pickup & local cab"])');
  await page.click("#wz-next");
  // Step 4 – contact
  if (opts && opts.checkWizard) {
    assert.strictEqual(await page.textContent("#wz-count"), "Step 4 of 4");
    await page.click("#wz-submit");
    assert.ok(await page.isVisible("#form-error"));
  }
  await page.check("input[name=filledFor][value=Myself]");
  await page.fill("#contactName", who.name);
  await page.fill("#phone", who.phone);
  await page.fill("#city", who.city);
  await page.check("#consent");
  await page.click("#wz-submit");
  await page.waitForSelector("#success.show");
  const caseId = (await page.textContent("#case-id")).trim();
  const track = await page.getAttribute("#success-track a", "href");
  return { caseId, track };
}

async function demoFlow(browser, base) {
  console.log("\nDEMO mode");
  const errors = [];
  const ctx = await browser.newContext({ viewport: { width: 1360, height: 900 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.addInitScript(() => { window.print = () => { window.__printed = (window.__printed || 0) + 1; }; });

  // 1. Website intake
  await page.goto(base + "/treatments/heart-surgery-in-india/");
  await page.click(".page-hero .btn-primary");
  await page.waitForSelector("#wz-count");
  assert.ok(await page.isChecked('input[name=condition][value="Heart"]')); ok("treatment page pre-selects condition in the form");
  await page.goto(base + "/index.html");
  const { caseId, track } = await fillIntake(page, { name: "Kavita Singh", phone: "+91 99887 76655", city: "Ranchi", patient: "Mohan Singh" }, { checkWizard: true });
  ok("multi-step form: validation per step, back keeps answers");
  assert.ok(/^IRY-\d{6}-[A-Z2-9]{4}$/.test(caseId)); ok("website form saved case " + caseId);
  assert.ok(track && track.includes("track.html?id=" + caseId)); ok("tracking link shown after submit");

  // 2. Tracking page before any work
  await page.goto(track);
  await page.waitForSelector(".steps-v");
  assert.ok((await page.textContent(".steps-v li.now")).includes("Request received")); ok("tracking page: stage 1");
  await page.goto(base + "/track.html?id=" + caseId + "&t=wrongtoken");
  await page.waitForSelector(".error-msg");
  ok("tracking page rejects wrong token");

  // 3. Dashboard login (demo)
  await page.goto(base + "/dashboard.html");
  await page.click("#demo-btn");
  await page.waitForSelector("table.data tbody tr[data-case]");
  const rows = await page.$$eval("tr[data-case]", (t) => t.map((r) => r.dataset.case));
  assert.ok(rows.includes(caseId) && rows.includes("IRY-DEMO-0001")); ok("dashboard lists new + sample cases (" + rows.length + ")");
  await shot(page, "dash-cases");
  await page.fill("#f-q", "Ranchi");
  assert.deepStrictEqual(await page.$$eval("tr[data-case]", (t) => t.map((r) => r.dataset.case)), [caseId]); ok("search filter");
  await page.fill("#f-q", "");
  await page.click('.pipeline button[data-status="New"]');
  const newOnly = await page.$$eval("tr[data-case] .badge", (b) => b.map((x) => x.textContent));
  assert.ok(newOnly.length >= 2 && newOnly.every((s) => s === "New")); ok("pipeline status filter");
  await page.click('.pipeline button[data-status="New"]');

  // 4. Case page: mark contacted, add updates, WhatsApp template
  await page.click(`tr[data-case="${caseId}"]`);
  await page.waitForSelector("#mark-contacted");
  await page.click("#mark-contacted");
  await page.waitForSelector(".page-head .badge.b-Contacted");
  assert.ok((await page.textContent(".page-head .sub")).includes("Contacted in")); ok("mark contacted → SLA recorded");
  assert.strictEqual(await page.$eval("#tpl", (x) => x.value), "reports"); // after contact → ask for reports
  await page.selectOption("#tpl", "hi");
  const waHref = await page.getAttribute("#tpl-send", "href");
  assert.ok(waHref.startsWith("https://wa.me/919988776655?text=") && decodeURIComponent(waHref).includes("Kavita")); ok("WhatsApp template uses patient's number and name");
  await page.click('.seg button[data-lang="hi"]');
  assert.ok((await page.inputValue("#tpl-text")).startsWith("Namaste Kavita ji")); ok("Hindi templates");
  await page.fill("#upd-text", "INTERNAL: patient prefers Delhi");
  await page.click("#upd button");
  await page.waitForSelector(".timeline li.internal >> text=INTERNAL: patient prefers Delhi");
  await page.fill("#upd-text", "Reports received and sent to 2 hospitals.");
  await page.selectOption("#upd-vis", "patient");
  await page.click("#upd button");
  await page.waitForSelector(".timeline li.patient >> text=Reports received and sent");
  ok("timeline: internal + patient updates");
  await page.selectOption("#m-status", "Estimates received");
  await page.fill("#m-next", "Build plan tonight");
  await page.click("#manage button");
  await page.waitForSelector(".page-head .badge.b-Estimates-received");
  ok("manage case: status + next action saved");
  await shot(page, "dash-case", { fullPage: true });

  // 5. Partners: add a hospital and a stay
  await page.click('.topnav a[href="#/partners"]');
  await page.waitForSelector("#add-partner");
  await page.click("#add-partner");
  await page.fill("#pf-name", "Test Valve Hospital");
  await page.selectOption("#pf-type", "Hospital");
  await page.fill("#pf-city", "Delhi NCR");
  await page.fill("#pf-accreditation", "NABH");
  await page.selectOption("#pf-status", "MoU signed");
  await page.click("#pf button.btn-primary");
  await page.waitForSelector("td >> text=Test Valve Hospital");
  await page.click("#add-partner");
  await page.fill("#pf-name", "Test Stay Rooms");
  await page.selectOption("#pf-type", "Stay");
  await page.fill("#pf-city", "Delhi NCR");
  await page.fill("#pf-rate", "1500");
  await page.selectOption("#pf-rateUnit", "per night");
  await page.click("#pf button.btn-primary");
  await page.waitForSelector("td >> text=Test Stay Rooms");
  ok("partners added");
  await page.selectOption("#p-type", "Stay");
  const stays = await page.$$eval("table.data tbody tr td:nth-child(2)", (t) => t.map((x) => x.textContent));
  assert.ok(stays.length >= 2 && stays.every((s) => s === "Stay")); ok("partner type filter");
  await page.click('tr:has-text("Test Stay Rooms") [data-edit]');
  await page.fill("#pf-notes", "AC, lift, 3 min walk");
  await page.click("#pf button.btn-primary");
  await page.waitForSelector("td >> text=Test Stay Rooms");
  ok("partner edited");
  await shot(page, "dash-partners");

  // 6. Package builder
  await page.goto(base + "/dashboard.html#/case/" + caseId + "/plan");
  await page.waitForSelector("#b-preview .plan-doc");
  const svcTypes = await page.$$eval('select[id^="st-"]', (s) => s.map((x) => x.value));
  assert.deepStrictEqual(svcTypes, ["Stay", "Cab"]); ok("builder pre-fills services from patient's needs");
  const hospVal = await page.$eval("#hp-0", (s) => [...s.options].find((o) => o.textContent.includes("Test Valve Hospital")).value);
  await page.selectOption("#hp-0", hospVal);
  await page.waitForFunction(() => document.querySelector("#b-hospitalOptions-0-hospital").value === "Test Valve Hospital");
  await page.fill("#b-hospitalOptions-0-estimate", "420000");
  await page.fill("#b-hospitalOptions-0-doctor", "Dr. Test (demo)");
  await page.click("#add-opt");
  const h2 = await page.$eval("#hp-1", (s) => [...s.options].find((o) => o.textContent.includes("Demo Heart Institute")).value);
  await page.selectOption("#hp-1", h2);
  await page.waitForFunction(() => document.querySelector("#b-hospitalOptions-1-hospital").value === "Demo Heart Institute");
  await page.fill("#b-hospitalOptions-1-estimate", "390000");
  const stayVal = await page.$eval("#sp-0", (s) => [...s.options].find((o) => o.textContent.includes("Test Stay Rooms")).value);
  await page.selectOption("#sp-0", stayVal);
  await page.waitForFunction(() => document.querySelector("#b-services-0-unitPrice").value === "1500");
  ok("partner pick auto-fills hospital details and stay rate");
  await page.fill("#b-services-0-qty", "10");
  await page.fill("#b-services-1-unitPrice", "500");
  await page.fill("#b-services-1-qty", "4");
  // totals: services = 1500*10 + 500*4 = 17,000 ; A = 4,37,000 ; B = 4,07,000
  const totals = await page.$$eval("#b-preview .pd-totals tbody tr td:last-child", (t) => t.map((x) => x.textContent));
  assert.deepStrictEqual(totals, ["₹4,37,000", "₹4,07,000"]); ok("live preview totals correct " + totals.join(" / "));
  await page.click("#print");
  await page.waitForFunction(() => window.__printed === 1);
  assert.ok((await page.innerHTML("#print-area")).includes("Test Valve Hospital")); ok("print / PDF renders the plan");
  await shot(page, "dash-builder");
  await page.click("#save-draft");
  await page.waitForSelector(".toast >> text=Draft saved");
  await page.click("#publish");
  await page.waitForSelector("#tpl");
  assert.strictEqual(await page.$eval("#tpl", (s) => s.value), "plan");
  assert.ok((await page.textContent(".pk-list")).includes("Published")); ok("draft + publish → case shows published plan, 'plan ready' template");

  // 7. Patient tracking page after publish
  await page.goto(track);
  await page.waitForSelector(".plan-doc");
  const now = await page.textContent(".steps-v li.now");
  assert.ok(now.includes("Plan ready"), now);
  const body = await page.textContent("main");
  assert.ok(body.includes("Reports received and sent to 2 hospitals")); assert.ok(!body.includes("INTERNAL"));
  assert.ok(body.includes("Test Valve Hospital") && body.includes("₹4,37,000"));
  ok("patient sees plan + public updates, not internal notes");
  await shot(page, "track-desktop", { fullPage: true });

  // 8. New case created from dashboard
  await page.goto(base + "/dashboard.html#/cases");
  await page.waitForSelector("#new-case");
  await page.click("#new-case");
  await page.fill("#nc-contactName", "Phone Lead");
  await page.fill("#nc-phone", "+91 90000 12345");
  await page.fill("#nc-patientName", "Walk In");
  await page.click("#nc button.btn-primary");
  await page.waitForSelector(".page-head h1 >> text=Walk In");
  ok("manual case from dashboard");

  // 9. Mobile layouts
  const m = await browser.newContext({ ...devices["iPhone 13"], storageState: await ctx.storageState() });
  const mp = await m.newPage();
  mp.on("pageerror", (e) => errors.push(e.message));
  for (const [url, name] of [[track, "track-mobile"], [base + "/partner.html", "partner-mobile"], [base + "/index.html", "home-mobile"], [base + "/treatments/knee-replacement-in-india/", "treatment-mobile"], [base + "/guides/india-medical-visa-guide/", "guide-mobile"], [base + "/cities/mumbai/", "city-mobile"]]) {
    await mp.goto(url);
    await mp.waitForLoadState("networkidle");
    const over = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(over <= 0, name + " overflows by " + over);
    if (name === "track-mobile") await shot(mp, name, { fullPage: true });
  }
  ok("no horizontal scroll on phone (track, partner, home)");
  await m.close();

  assert.deepStrictEqual(errors, []); ok("no JavaScript errors");
  await ctx.close();
}

async function liveFlow(browser, base) {
  console.log("\nLIVE mode (fake Apps Script URL → real backend code)");
  const src = fs.readFileSync(path.join(ROOT, "backend/google-apps-script.gs"), "utf8");
  const emu = Emu.create(src, null);
  emu.setup();
  const key = emu.adminKey();
  const ENDPOINT = "https://script.google.com/macros/s/TEST/exec";
  const errors = [];
  const ctx = await browser.newContext();
  await ctx.route(/\/assets\/config\.js(\?.*)?$/, (r) => r.fulfill({ contentType: "text/javascript",
    body: `window.IRYNT_CONFIG={whatsappNumber:"919000000000",email:"",sheetEndpoint:"${ENDPOINT}",responseHours:2,workingHours:"9 AM – 9 PM IST",demoMode:false};` }));
  let formPosts = 0, apiPosts = 0;
  await ctx.route(ENDPOINT, async (r) => {
    const req = r.request();
    const ct = req.headers()["content-type"] || "";
    let out;
    if (ct.includes("application/x-www-form-urlencoded")) {
      formPosts++;
      out = emu.post(Object.fromEntries(new URLSearchParams(req.postData())));
    } else {
      apiPosts++;
      assert.ok(!ct.includes("application/json"), "must not trigger CORS preflight");
      out = emu.call(JSON.parse(req.postData()));
    }
    r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(out) });
  });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto(base + "/index.html");
  const { caseId, track } = await fillIntake(page, { name: "Live Tester", phone: "+91 98111 22233", city: "Lucknow", patient: "Live Patient" });
  await page.waitForTimeout(300);
  assert.strictEqual(formPosts, 1); ok("website form posts to Apps Script (form-encoded, no-cors)");

  await page.goto(base + "/dashboard.html");
  assert.strictEqual(await page.$("#demo-btn"), null); ok("no demo button in live mode");
  await page.fill("#key", "wrong");
  await page.click("#login-form button.btn-primary");
  await page.waitForSelector(".error-msg >> text=Invalid access key");
  ok("wrong access key rejected");
  await page.fill("#key", key);
  await page.click("#login-form button.btn-primary");
  await page.waitForSelector(`tr[data-case="${caseId}"]`);
  ok("sign in with access key, case visible");
  await page.click(`tr[data-case="${caseId}"]`);
  await page.waitForSelector("#mark-contacted");
  await page.click("#mark-contacted");
  await page.waitForSelector(".page-head .badge.b-Contacted");
  ok("update case through API");

  await page.goto(track);
  await page.waitForSelector(".steps-v li.now");
  assert.ok((await page.textContent(".steps-v li.now")).includes("Coordinator assigned"));
  assert.ok((await page.textContent(".coord")).includes("Admin")); ok("tracking page via API");
  assert.ok(apiPosts > 5);
  assert.deepStrictEqual(errors, []); ok("no JavaScript errors");
  await ctx.close();
}

(async () => {
  const srv = await serve();
  const base = "http://127.0.0.1:" + srv.address().port;
  const browser = await chromium.launch();
  try {
    await demoFlow(browser, base);
    await liveFlow(browser, base);
    console.log(`\nE2E: ${pass} checks passed`);
  } catch (e) {
    console.error("\n✗ FAILED:", e.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
    srv.close();
  }
})();
