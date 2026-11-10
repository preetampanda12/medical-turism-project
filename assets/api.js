/*
 * Irynt API client.
 *  - LIVE mode: talks to your Google Apps Script web app (config.sheetEndpoint).
 *  - DEMO mode: no endpoint set → runs the same backend code in this browser,
 *    with sample data stored only in this browser.
 */
(function (g) {
  "use strict";
  var cfg = g.IRYNT_CONFIG || {};
  var LIVE = !!cfg.sheetEndpoint;
  var KEY_STORE = "irynt_key";
  var DEMO_STORE = "irynt_demo_v2";
  var base = (g.IRYNT_BASE || "");
  var demoPromise = null;

  function store(kind) {
    try { return kind === "local" ? g.localStorage : g.sessionStorage; } catch (e) { return null; }
  }
  function getKey() { try { return (store("session") || {}).getItem(KEY_STORE) || ""; } catch (e) { return ""; } }
  function setKey(k) { try { var s = store("session"); if (s) { if (k) s.setItem(KEY_STORE, k); else s.removeItem(KEY_STORE); } } catch (e) {} }

  function demo() {
    if (demoPromise) return demoPromise;
    demoPromise = fetch(base + "backend/google-apps-script.gs").then(function (r) {
      if (!r.ok) throw new Error("Could not load demo backend");
      return r.text();
    }).then(function (src) {
      var mem = null;
      var storage = {
        load: function () { try { var s = store("local"); var v = s && s.getItem(DEMO_STORE); return v ? JSON.parse(v) : mem; } catch (e) { return mem; } },
        save: function (db) { mem = db; try { var s = store("local"); if (s) s.setItem(DEMO_STORE, JSON.stringify(db)); } catch (e) {} }
      };
      var emu = g.IryntGasEmulator.create(src, storage);
      if (emu.isEmpty()) seed(emu);
      return emu;
    });
    return demoPromise;
  }

  function call(action, payload) {
    var req = Object.assign({ action: action, key: getKey() }, payload || {});
    var p = LIVE
      ? fetch(cfg.sheetEndpoint, { method: "POST", body: JSON.stringify(req) }).then(function (r) { return r.json(); })
      : demo().then(function (emu) { return emu.call(req); });
    return p.then(function (res) {
      if (!res || !res.ok) {
        var err = new Error((res && res.error) || "Request failed");
        if (/sign in|access key/i.test(err.message)) err.auth = true;
        throw err;
      }
      return res.data;
    });
  }

  // ---------------- demo sample data ----------------
  function seed(emu) {
    emu.setup();
    var admin = emu.adminKey();
    emu.addRow("Team", ["Priya (demo)", "", "919000000001", "coordinator", "irk_demo_priya", "Yes"]);
    function c(action, extra) { var r = emu.call(Object.assign({ action: action, key: admin }, extra)); if (!r.ok) throw new Error(r.error); return r.data; }

    var P = [
      { type: "Hospital", name: "Demo Heart Institute", city: "Delhi NCR", area: "Sector 44", accreditation: "NABH, JCI", specialties: "Cardiac, Cardiac surgery", contactPerson: "International desk", phone: "+91 90000 00011", status: "MoU signed", terms: "Facilitation fee as per MoU", rate: "", rateUnit: "" },
      { type: "Hospital", name: "Demo Multispeciality Hospital", city: "Delhi NCR", area: "Saket", accreditation: "NABH", specialties: "Cardiac, Oncology, Ortho", contactPerson: "Marketing manager", phone: "+91 90000 00012", status: "MoU signed" },
      { type: "Hospital", name: "Demo Cancer Centre", city: "Mumbai", area: "Parel", accreditation: "NABH", specialties: "Oncology", contactPerson: "Patient relations", phone: "+91 90000 00013", status: "Meeting done" },
      { type: "Stay", name: "Demo Guest House", city: "Delhi NCR", area: "Near Sector 44", rate: 1200, rateUnit: "per night", contactPerson: "Owner", phone: "+91 90000 00021", status: "MoU signed", notes: "AC rooms, kitchen access, 5 min to hospital" },
      { type: "Stay", name: "Demo Service Apartment", city: "Mumbai", area: "Parel", rate: 28000, rateUnit: "per month", phone: "+91 90000 00022", status: "Contacted" },
      { type: "Cab", name: "Demo City Cabs", city: "Delhi NCR", rate: 600, rateUnit: "per trip", phone: "+91 90000 00031", status: "MoU signed" },
      { type: "Assistant", name: "Demo Care Helper", city: "Delhi NCR", rate: 900, rateUnit: "per day", phone: "+91 90000 00041", status: "MoU signed", notes: "Hindi, English" },
      { type: "Pharmacy", name: "Demo Pharmacy", city: "Delhi NCR", rate: "", rateUnit: "", phone: "+91 90000 00051", status: "Contacted", notes: "Delivers to stay" }
    ];
    var ids = P.map(function (p) { return c("savePartner", { partner: p }).id; });

    var ago = function (h) { return new Date(Date.now() - h * 3600e3).toISOString(); };
    emu.post({ caseId: "IRY-DEMO-0001", filledFor: "Family member / friend", contactName: "Ravi Kumar", phone: "+91 98765 43210", country: "India", city: "Patna",
      patientName: "Sita Devi", patientAge: "58", patientGender: "Female", condition: "Heart", problem: "Chest pain while walking for 2 months. Local doctor advised angiography.",
      diagnosed: "Yes", advised: "Angiography, possible bypass", preferredCity: "Delhi NCR", timeline: "Within 1 month", budget: "₹3–5 lakh", insurance: "Yes",
      services: "Hospital & doctor, Stay near hospital, Pickup & local cab, Personal assistant", contactPref: "WhatsApp", bestTime: "Evening", consent: "Yes",
      trackToken: "d3m0d3m0d3m0d3m0d3m0d3m0d3m00001", submittedAt: ago(30) });
    emu.post({ caseId: "IRY-DEMO-0002", filledFor: "Myself", contactName: "Amina Bello", phone: "+234 800 000 0000", country: "Nigeria", city: "Abuja",
      patientName: "Amina Bello", patientAge: "44", patientGender: "Female", condition: "Cancer", problem: "Breast lump, biopsy shows carcinoma. Looking for surgery and chemotherapy options.",
      diagnosed: "Yes", advised: "Surgery + chemotherapy", preferredCity: "No preference: suggest the best", timeline: "As soon as possible", insurance: "No",
      services: "Hospital & doctor, Medical visa & invitation letter, Stay near hospital, Translator", contactPref: "WhatsApp", bestTime: "Anytime", consent: "Yes",
      trackToken: "d3m0d3m0d3m0d3m0d3m0d3m0d3m00002", submittedAt: ago(5) });
    emu.post({ caseId: "IRY-DEMO-0003", filledFor: "Family member / friend", contactName: "Suresh Yadav", phone: "+91 91234 56789", country: "India", city: "Gorakhpur",
      patientName: "Ramesh Yadav", patientAge: "67", patientGender: "Male", condition: "Bones & joints", problem: "Severe knee pain both knees, difficulty walking.",
      diagnosed: "Not sure", preferredCity: "Delhi NCR", timeline: "In 1–3 months", insurance: "Government scheme (e.g. Ayushman Bharat)",
      services: "Hospital & doctor, Train / flight booking", contactPref: "Phone call", bestTime: "Morning", consent: "Yes",
      trackToken: "d3m0d3m0d3m0d3m0d3m0d3m0d3m00003", submittedAt: ago(0.5) });

    c("updateCase", { caseId: "IRY-DEMO-0001", patch: { status: "Contacted", coordinator: "Priya (demo)", firstContactAt: ago(29.2) } });
    c("updateCase", { caseId: "IRY-DEMO-0001", patch: { status: "Estimates received", nextAction: "Share plan with family", hospitalsAsked: "Demo Heart Institute, Demo Multispeciality Hospital" } });
    c("addUpdate", { caseId: "IRY-DEMO-0001", text: "Reports reviewed by our doctor advisor and sent to 2 accredited hospitals.", visibility: "patient" });
    c("addUpdate", { caseId: "IRY-DEMO-0001", text: "Both hospitals replied. Demo Heart Institute can schedule within 5 days.", visibility: "internal" });
    c("savePackage", { caseId: "IRY-DEMO-0001", publish: true, plan: {
      currency: "INR", title: "Coronary angiography + possible bypass surgery (CABG)", patientName: "Sita Devi",
      coordinator: "Priya (demo)", coordinatorPhone: "+91 90000 00001",
      validUntil: new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10),
      hospitalOptions: [
        { partnerId: ids[0], hospital: "Demo Heart Institute", city: "Delhi NCR", accreditation: "NABH, JCI", doctor: "Senior cardiac surgeon (demo)", procedure: "Angiography + CABG if needed", estimate: 340000, hospitalDays: 7, recommended: true, notes: "Earliest date in 5 days." },
        { partnerId: ids[1], hospital: "Demo Multispeciality Hospital", city: "Delhi NCR", accreditation: "NABH", doctor: "Cardiothoracic surgeon (demo)", procedure: "Angiography + CABG if needed", estimate: 295000, hospitalDays: 8 }
      ],
      services: [
        { type: "Stay", partnerId: ids[3], provider: "Demo Guest House", description: "Room for attendant, near hospital", unitPrice: 1200, unit: "per night", qty: 12 },
        { type: "Cab", partnerId: ids[5], provider: "Demo City Cabs", description: "Station pickup + hospital trips", unitPrice: 600, unit: "per trip", qty: 6 },
        { type: "Assistant", partnerId: ids[6], provider: "Demo Care Helper", description: "Help during admission and surgery days", unitPrice: 900, unit: "per day", qty: 4 },
        { type: "Insurance", provider: "Irynt", description: "Cashless pre-authorisation paperwork", included: true, unitPrice: 0, qty: 1 }
      ],
      notes: "1. Confirm your preferred option on WhatsApp.\n2. We will book the appointment and the stay.\n3. Carry all reports, ID and insurance card."
    } });
    c("updateCase", { caseId: "IRY-DEMO-0002", patch: { status: "Contacted", coordinator: "Admin", nextAction: "Collect biopsy + PET scan" } });
  }

  g.IryntAPI = {
    live: LIVE,
    mode: LIVE ? "live" : "demo",
    getKey: getKey,
    setKey: setKey,
    call: call,
    demoKey: function () { return demo().then(function (emu) { return emu.adminKey(); }); },
    resetDemo: function () { try { var s = store("local"); if (s) s.removeItem(DEMO_STORE); } catch (e) {} demoPromise = null; },
    submitIntake: function (data) {
      // Public website form. Live: form-encoded post (no-cors). Demo: local emulator.
      if (LIVE) {
        return fetch(cfg.sheetEndpoint, { method: "POST", mode: "no-cors", body: new URLSearchParams(data) });
      }
      return demo().then(function (emu) { return emu.post(data); });
    }
  };
})(window);
