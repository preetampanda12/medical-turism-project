// Backend tests: runs the real Apps Script code inside the emulator.
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const Emu = require("../assets/gas-emulator.js");

const src = fs.readFileSync(path.join(__dirname, "../backend/google-apps-script.gs"), "utf8");
const emu = Emu.create(src, null);
emu.setup();
const key = emu.adminKey();
assert.ok(key && key.startsWith("irk_"), "admin key created");
const call = (action, extra = {}) => {
  const r = emu.call({ action, key, ...extra });
  if (!r.ok) throw new Error(action + ": " + r.error);
  return r.data;
};
let pass = 0; const ok = (m) => { pass++; console.log("  ✓ " + m); };

// auth
assert.strictEqual(emu.call({ action: "listCases", key: "bad" }).ok, false); ok("bad key rejected");
assert.strictEqual(call("login").role, "admin"); ok("login");

// website intake (form-encoded, like the public form)
const token = "a1b2c3d4e5f60718293a4b5c6d7e8f90";
const r = emu.post({ caseId: "IRY-261110-TEST", contactName: "Ravi", phone: "+91 98765 43210", city: "Patna",
  country: "India", patientName: "Sita Devi", patientAge: "58", condition: "Heart", problem: "=HYPERLINK(\"x\")",
  services: "Stay near hospital", consent: "Yes", trackToken: token, submittedAt: new Date(Date.now() - 3 * 3600e3).toISOString() });
assert.ok(r.ok); ok("intake saved");
emu.post({ caseId: "IRY-261110-TEST", contactName: "dup" });
let cases = call("listCases");
assert.strictEqual(cases.length, 1); ok("duplicate intake ignored");
assert.strictEqual(cases[0].phone, "+91 98765 43210"); ok("phone kept");
assert.strictEqual(cases[0].status, "New");

// tracking
assert.strictEqual(emu.call({ action: "track", caseId: "IRY-261110-TEST", token: "wrong" }).ok, false); ok("track wrong token rejected");
let t = emu.call({ action: "track", caseId: "IRY-261110-TEST", token }).data;
assert.strictEqual(t.patientFirstName, "Sita"); assert.strictEqual(t.updates.length, 1); assert.strictEqual(t.plan, null);
assert.strictEqual(t.phone, undefined); ok("track returns limited public info");

// partners
const h = call("savePartner", { partner: { type: "Hospital", name: "Demo Heart Hospital", city: "Delhi NCR", accreditation: "NABH" } });
assert.ok(h.id.startsWith("P-")); ok("partner created");
const h2 = call("savePartner", { partner: { id: h.id, rate: 1200 } });
assert.strictEqual(h2.name, "Demo Heart Hospital"); assert.strictEqual(h2.rate, 1200); ok("partner updated (merge)");
const tmp = call("savePartner", { partner: { type: "Cab", name: "Temp cab" } });
call("deletePartner", { id: tmp.id });
assert.strictEqual(call("listPartners").length, 1); ok("partner deleted");

// case update + SLA
let c = call("updateCase", { caseId: "IRY-261110-TEST", patch: { status: "Contacted", coordinator: "Admin", trackToken: "hack" } });
assert.strictEqual(c.status, "Contacted"); assert.ok(c.firstContactAt); assert.ok(c.minutesToContact >= 179, "minutes " + c.minutesToContact);
assert.strictEqual(c.trackToken, token); ok("status change sets first contact + minutes; token locked");
call("updateCase", { caseId: "IRY-261110-TEST", patch: { status: "Nonsense" } });
assert.strictEqual(call("getCase", { caseId: "IRY-261110-TEST" }).case.status, "Contacted"); ok("invalid status ignored");

// updates
call("addUpdate", { caseId: "IRY-261110-TEST", text: "Reports sent to 3 hospitals", visibility: "patient" });
call("addUpdate", { caseId: "IRY-261110-TEST", text: "Internal: hospital A slow", visibility: "internal" });
t = emu.call({ action: "track", caseId: "IRY-261110-TEST", token }).data;
assert.ok(t.updates.every(u => !u.text.startsWith("Internal")) && t.updates.length === 2); ok("internal notes hidden from patient");

// packages
const plan = { currency: "INR", hospitalOptions: [{ hospital: "Demo Heart Hospital", estimate: 250000 }], services: [] };
let pk = call("savePackage", { caseId: "IRY-261110-TEST", plan, publish: false });
assert.strictEqual(pk.version, 1); assert.strictEqual(pk.status, "draft");
assert.strictEqual(emu.call({ action: "track", caseId: "IRY-261110-TEST", token }).data.plan, null); ok("draft not visible to patient");
pk = call("savePackage", { caseId: "IRY-261110-TEST", plan, publish: true });
assert.strictEqual(pk.version, 2);
t = emu.call({ action: "track", caseId: "IRY-261110-TEST", token }).data;
assert.strictEqual(t.plan.version, 2); assert.strictEqual(t.status, "Package sent"); ok("published plan visible, status → Package sent");
const full = call("getCase", { caseId: "IRY-261110-TEST" });
assert.strictEqual(full.packages.length, 2); assert.strictEqual(full.packages[0].version, 2); ok("package history");
assert.strictEqual(full.case.hospitalsAsked, "Demo Heart Hospital");

// dashboard-created case
const nc = call("createCase", { data: { contactName: "Amina", phone: "+234 800 000 0000", patientName: "Musa", condition: "Cancer", country: "Nigeria" } });
assert.ok(/^IRY-\d{6}-[A-Z2-9]{4}$/.test(nc.caseId)); assert.strictEqual(nc.source, "dashboard"); assert.ok(nc.trackToken.length >= 16); ok("manual case created");

// formula injection
const injected = emu.raw.sheets.Cases.find(r => r[0] === "IRY-261110-TEST");
assert.ok(String(injected[12]).startsWith("=")); // emulator strips the apostrophe like Sheets displays
console.log(`\nBackend: ${pass} checks passed`);
