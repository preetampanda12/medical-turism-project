// Treatment landing pages. Medical information is kept general and conservative;
// every page reminds readers that the treating doctor decides. Have your doctor
// advisor review these pages and add their name as medical reviewer.
"use strict";

const COMMON_HELP = [
  ["search", "Hospital options", "2–3 options with real quotes."],
  ["calendar", "Appointments", "Booked and confirmed."],
  ["bed", "A room nearby", "Clean and close to the hospital."],
  ["car", "Pickup and cabs", "Station, airport and every visit."],
  ["assistant", "A helping hand", "For queues and busy days."],
  ["shield", "Insurance and payment", "Cashless forms, loans and EMI."],
];

const T = [
  {
    slug: "cancer-treatment-in-india",
    name: "Cancer Treatment",
    short: "Surgery, chemo, radiation, second opinions.",


    icon: "ribbon",
    condition: "Cancer",
    title: "Cancer Treatment in India: Hospitals & Stay Planning | Irynt",
    description: "Planning cancer treatment in India? Get opinions from accredited cancer centres, compare original estimates and plan a long stay near the hospital.",
    h1: "Cancer treatment in India",

    lead: "Specialist opinions fast, honest comparisons, and a stay planned around treatment.",


    facts: [["Typical approach", "Team-based plan: surgery, chemo, radiation or a mix"], ["Time away from home", "Weeks to months, depending on the plan"], ["Key report", "Biopsy / histopathology report"], ["Good to have", "PET-CT or CT/MRI, blood tests"]],
    sections: [
      ["How cancer treatment is planned", `<p>Most large cancer centres in India plan treatment through a <b>multidisciplinary team</b>: surgical, medical and radiation oncologists review the reports together. The plan depends on the type of cancer, its stage, the patient's overall health and their preferences.</p>
<p>The main treatment options are:</p>
<ul><li><b>Surgery</b> to remove the tumour, sometimes with reconstruction.</li><li><b>Chemotherapy</b>, usually given in cycles a few weeks apart.</li><li><b>Radiation therapy</b>, often given on weekdays over several weeks.</li><li><b>Targeted therapy and immunotherapy</b> for certain cancers, based on specific test results.</li></ul>
<div class="callout"><p>A <b>second opinion</b> before starting treatment is common and sensible. With complete reports, many hospitals can share an initial opinion before you travel.</p></div>`],
      ["Reports to share for an opinion", `<ul class="checklist">
<li>${"{check}"}<span><b>Biopsy / histopathology report</b>, and immunohistochemistry (IHC) if done. This is the most important document.</span></li>
<li>${"{check}"}<span><b>Imaging</b>: PET-CT, CT or MRI reports, and the scan images/CD if available.</span></li>
<li>${"{check}"}<span><b>Recent blood tests</b> (complete blood count, kidney and liver function).</span></li>
<li>${"{check}"}<span><b>Treatment so far</b>: discharge summaries, chemotherapy or radiation details, surgery notes.</span></li>
<li>${"{check}"}<span>A short note on current symptoms and other conditions (diabetes, heart disease).</span></li></ul>
<p>Not sure what you have? Just send whatever's in the folder on WhatsApp. We'll tell you if anything is missing.</p>`],
      ["Planning a longer stay", `<p>In our experience, the hardest part of cancer treatment for families is often the stay, not the hospital. It usually happens in three phases:</p>
<table><thead><tr><th>Phase</th><th>What happens</th><th>What we arrange</th></tr></thead><tbody>
<tr><td>Evaluation</td><td>Consultation, scans and tests, team review</td><td>Short stay near the hospital, cabs, appointment booking</td></tr>
<tr><td>Treatment</td><td>Surgery and/or chemo and radiation cycles</td><td>Monthly room rates, assistant on key days, medicine delivery, food options for the family</td></tr>
<tr><td>Follow-up</td><td>Scans and review visits</td><td>Travel planning for each visit, reminders, coordination with your local doctor</td></tr></tbody></table>
<p>Whether some cycles can be continued closer to home is a medical decision. Ask the treating oncologist; we will plan around their answer.</p>`],
      ["What affects the cost", `<p>Cancer treatment costs vary a lot, so we won't throw a single number at you. It mainly depends on:</p>
<ul><li>Type and stage of cancer, and the treatment plan chosen</li><li>Number of chemotherapy cycles and radiation sessions</li><li>Medicines used: generic or branded, targeted therapy or immunotherapy</li><li>Surgery type, length of hospital stay and room category</li><li>Scans and tests during treatment</li></ul>
<p>We'll show you each hospital's <b>written estimate exactly as they gave it</b>, and help you ask what's included and what isn't.</p>`],
    ],
    faqs: [
      ["Can I get a cancer treatment opinion before travelling?", "Often, yes. If you share the biopsy report, scans and blood tests, many hospitals can give an initial opinion and estimate before you travel. A final plan is made after the doctor examines the patient."],
      ["How long will we need to stay for cancer treatment?", "It depends on the plan. Evaluation may take several days; chemotherapy and radiation can continue for weeks or months. Your coordinator plans the stay phase by phase once the doctors share the treatment plan."],
      ["Can a family member stay with the patient?", "Yes. We plan stays that work for both the patient and the person caring for them, including food options and help during busy hospital days."],
      ["Does insurance or Ayushman Bharat cover cancer treatment?", "Many policies and government schemes cover cancer treatment, but coverage depends on the policy, the hospital and the procedure. We help with pre-authorisation and paperwork; the insurer decides what is covered."],
    ],
    related: ["heart-surgery-in-india", "neurosurgery-in-india", "kidney-care-and-dialysis-in-india"],
  },
  {
    slug: "heart-surgery-in-india",
    name: "Heart Surgery & Cardiac Care",
    short: "Angiography, stents, bypass, valves.",


    icon: "heart",
    condition: "Heart",
    title: "Heart Surgery in India: Bypass & Angioplasty | Irynt",
    description: "Compare accredited heart hospitals in India for angioplasty, bypass (CABG) or valve surgery. Original estimates, nearby stay and family support.",
    h1: "Heart surgery and cardiac care in India",

    lead: "A cardiologist's opinion fast. We handle the rest.",


    facts: [["Common procedures", "Angiography, angioplasty, CABG, valve surgery"], ["Hospital stay", "From a day (angiography) to about a week or more (surgery)"], ["Key reports", "ECG, echo, angiography report"], ["Plan to stay nearby", "Usually 1–3 weeks for surgery"]],
    sections: [
      ["Common cardiac procedures", `<ul><li><b>Coronary angiography</b>: a test that shows blockages in the heart's arteries.</li><li><b>Angioplasty with stent</b>: opening a blocked artery through a catheter.</li><li><b>Bypass surgery (CABG)</b>: creating new routes for blood flow around blockages.</li><li><b>Valve repair or replacement</b>: surgical or, in selected patients, catheter-based (such as TAVI).</li><li><b>Pacemaker and other device procedures</b>.</li></ul>
<div class="callout warn"><p><b>Chest pain, breathlessness at rest or fainting can be an emergency.</b> Call 112 or go to the nearest hospital first. Plan travel only when doctors say it is safe.</p></div>`],
      ["Reports to share", `<ul class="checklist"><li>${"{check}"}<span>ECG and echocardiography (echo) reports</span></li><li>${"{check}"}<span>Angiography report and CD, if already done</span></li><li>${"{check}"}<span>TMT / stress test, if done</span></li><li>${"{check}"}<span>Blood tests including kidney function and blood sugar</span></li><li>${"{check}"}<span>Current medicines, especially blood thinners</span></li></ul>`],
      ["How long to plan for", `<table><thead><tr><th>Procedure</th><th>Typical planning</th></tr></thead><tbody>
<tr><td>Angiography</td><td>Often a day-care or short stay; plan 2–4 days in the city</td></tr>
<tr><td>Angioplasty</td><td>Usually a short hospital stay; plan about a week in the city</td></tr>
<tr><td>Bypass or valve surgery</td><td>Often around a week in hospital; plan roughly 2–3 weeks in the city for recovery and the first review</td></tr></tbody></table>
<p>These are general planning guides. Your cardiologist or surgeon will confirm the actual timeline for the patient.</p>`],
      ["What affects the cost", `<ul><li>The procedure and whether more than one is needed</li><li>Number and type of stents, or type of valve</li><li>Days in ICU and in the ward, and room category</li><li>Age and other conditions (diabetes, kidney disease)</li><li>Surgeon and hospital</li></ul><p>You'll see each hospital's estimate as they gave it, and we'll go through what's included with you.</p>`],
    ],
    faqs: [
      ["Can I compare bypass surgery estimates from different hospitals?", "Yes. With the angiography report and other tests, we request opinions and written estimates from 2–3 accredited hospitals and show them side by side."],
      ["How soon can the patient travel home after heart surgery?", "Travel is decided by the surgeon, usually after the first review. We plan the stay so that you are close to the hospital until the doctor says it is safe to travel."],
      ["Do you arrange travel for a patient who can't walk long distances?", "Yes. Tell your coordinator; we arrange wheelchair assistance at stations and airports where available, and suitable cabs."],
      ["Is angioplasty always needed after angiography?", "No. Treatment depends on what the angiography shows and on the cardiologist's assessment. Options include medicines, angioplasty or bypass surgery."],
    ],
    related: ["knee-replacement-in-india", "kidney-care-and-dialysis-in-india", "cancer-treatment-in-india"],
  },
  {
    slug: "knee-replacement-in-india",
    name: "Knee Replacement",
    short: "One or both knees, physio planned.",


    icon: "bone",
    condition: "Bones & joints",
    title: "Knee Replacement in India: Cost Factors & Planning | Irynt",
    description: "Planning knee replacement in India? Compare accredited hospitals, understand what affects the cost, and plan your stay and physiotherapy.",
    h1: "Knee replacement surgery in India",

    lead: "Surgery takes hours. Recovery takes planning. We do both.",


    facts: [["Types", "Total (TKR) or partial knee replacement"], ["Hospital stay", "Often around 3–5 days"], ["Plan to stay nearby", "About 2–3 weeks"], ["Key reports", "Standing X-rays of both knees"]],
    sections: [
      ["When is knee replacement considered?", `<p>Orthopaedic surgeons usually consider knee replacement when arthritis causes severe pain and stiffness that limit daily life, and when medicines, physiotherapy, weight management or injections no longer help enough.</p>
<p>Options include <b>total knee replacement</b>, <b>partial (unicompartmental) replacement</b> for selected patients, and replacing <b>one or both knees</b> in the same admission or in stages. The surgeon recommends the option after examining the patient.</p>`],
      ["Reports to share", `<ul class="checklist"><li>${"{check}"}<span>Standing X-rays of both knees (front and side views)</span></li><li>${"{check}"}<span>Recent blood tests, blood sugar and ECG</span></li><li>${"{check}"}<span>List of current medicines and other conditions</span></li><li>${"{check}"}<span>Any earlier surgery on the knee</span></li></ul>`],
      ["Recovery and how long to stay", `<p>Physiotherapy usually starts within a day or two of surgery, and most patients walk with support before discharge. Many surgeons review the wound and remove stitches or clips around two weeks after surgery, so families often plan <b>about 2–3 weeks</b> in the city.</p>
<p>A ground-floor room or a building with a lift, a western toilet and a short ride to the hospital make a real difference. We choose stays with these in mind.</p>`],
      ["What affects the cost", `<ul><li>One knee or both knees</li><li>Type of implant chosen with the surgeon</li><li>Room category and days in hospital</li><li>Other health conditions that need extra care</li><li>Physiotherapy sessions after discharge</li></ul>`],
    ],
    faqs: [
      ["Should both knees be replaced at the same time?", "It depends on the patient's age, health and the surgeon's assessment. Some patients have both knees done in one admission; others in two stages. We share each hospital's recommendation and estimate for the options."],
      ["Can knee replacement be done under Ayushman Bharat or insurance?", "Knee replacement is covered by many insurance policies and government schemes, at empanelled hospitals. We help check eligibility and handle pre-authorisation paperwork."],
      ["When can the patient climb stairs and travel?", "Most patients climb stairs with support before discharge, but travel home depends on the surgeon's review. We plan the stay until that review."],
      ["Do you arrange physiotherapy after discharge?", "Yes. We can arrange sessions at the hospital or at your stay, and help find a physiotherapist in your home city."],
    ],
    related: ["hip-replacement-in-india", "spine-surgery-in-india", "heart-surgery-in-india"],
  },
  {
    slug: "hip-replacement-in-india",
    name: "Hip Replacement",
    short: "Hip replacement and redo surgery.",


    icon: "walk",
    condition: "Bones & joints",
    title: "Hip Replacement in India: Hospitals & Recovery | Irynt",
    description: "Compare accredited hospitals for hip replacement in India. Understand cost factors, reports needed and recovery time, and get a complete stay and travel plan.",
    h1: "Hip replacement surgery in India",

    lead: "Compare surgeons, then recover in an easy, safe room.",


    facts: [["Types", "Total hip replacement, revision surgery"], ["Hospital stay", "Often around 3–5 days"], ["Plan to stay nearby", "About 2–3 weeks"], ["Key reports", "X-ray of the pelvis and both hips"]],
    sections: [
      ["When is hip replacement considered?", `<p>Surgeons consider hip replacement for severe hip pain and stiffness from arthritis, avascular necrosis or certain fractures, when other treatment no longer helps. <b>Revision surgery</b> replaces an older implant that has worn out or loosened.</p>
<div class="callout warn"><p>A fall followed by inability to stand or walk is an emergency. Please go to the nearest hospital first.</p></div>`],
      ["Reports to share", `<ul class="checklist"><li>${"{check}"}<span>X-ray of the pelvis with both hips; MRI if done</span></li><li>${"{check}"}<span>Blood tests, blood sugar, ECG</span></li><li>${"{check}"}<span>Details of any earlier hip surgery or implant</span></li><li>${"{check}"}<span>Current medicines and other conditions</span></li></ul>`],
      ["Recovery and how long to stay", `<p>Walking with support usually starts soon after surgery. Patients are taught movement precautions to protect the new joint. Plan for <b>about 2–3 weeks</b> in the city until the first review, in a stay with a lift or ground-floor room, a raised or western toilet and a short ride to the hospital.</p>`],
      ["What affects the cost", `<ul><li>Primary replacement or revision surgery</li><li>Type of implant and bearing surface</li><li>Room category and days in hospital</li><li>Other health conditions</li><li>Physiotherapy after discharge</li></ul>`],
    ],
    faqs: [
      ["Is hip replacement different from knee replacement in recovery?", "Both need physiotherapy and a few weeks of careful movement. Hip patients also learn specific precautions for sitting and bending. Your surgeon and physiotherapist will guide you."],
      ["Can elderly patients travel for hip replacement?", "Many do. We plan travel with wheelchair assistance where available, a comfortable stay and help on admission and discharge days."],
      ["How do I compare hip replacement hospitals?", "Look at the surgeon's experience with the specific surgery, accreditation, what the estimate includes and how follow-up will work. We put these side by side for you."],
    ],
    related: ["knee-replacement-in-india", "spine-surgery-in-india", "neurosurgery-in-india"],
  },
  {
    slug: "spine-surgery-in-india",
    name: "Spine Surgery",
    short: "Slip disc, nerves, fusion. Opinion first.",


    icon: "spine",
    condition: "Brain & spine",
    title: "Spine Surgery in India: Opinions & Planning | Irynt",
    description: "Advised spine surgery? Get opinions from accredited spine centres in India, compare estimates, and plan travel and stay with one coordinator.",
    h1: "Spine surgery in India",

    lead: "Many backs heal without surgery. Get a proper opinion first.",


    facts: [["Common conditions", "Slip disc, stenosis, spondylolisthesis"], ["First step", "Specialist review of MRI"], ["Hospital stay", "From 1–2 days to about a week"], ["Key report", "MRI of the affected region"]],
    sections: [
      ["Do I need spine surgery?", `<p>For many people, back and neck pain improves with time, medicines, physiotherapy or injections. Surgery is usually considered when there is severe nerve compression, weakness, or pain that does not improve with other treatment. Spine surgeons and neurosurgeons both treat spine conditions.</p>
<div class="callout warn"><p><b>Sudden weakness in the legs, numbness around the groin, or loss of bladder or bowel control needs emergency care.</b> Go to the nearest hospital immediately.</p></div>`],
      ["Common spine procedures", `<ul><li><b>Discectomy / microdiscectomy</b> for a slipped (herniated) disc</li><li><b>Decompression (laminectomy)</b> for spinal stenosis</li><li><b>Spinal fusion</b> for instability</li><li><b>Minimally invasive and endoscopic</b> options for selected patients</li></ul>`],
      ["Reports to share", `<ul class="checklist"><li>${"{check}"}<span>MRI report and images of the affected area (neck or lower back)</span></li><li>${"{check}"}<span>X-rays, including any flexion-extension views</span></li><li>${"{check}"}<span>Notes on symptoms: pain, numbness, weakness, how long</span></li><li>${"{check}"}<span>Treatment so far: medicines, physiotherapy, injections</span></li></ul>`],
      ["What affects the cost", `<ul><li>Type of surgery and number of levels treated</li><li>Implants (screws, rods, cages) if fusion is needed</li><li>Minimally invasive or open technique</li><li>Days in hospital and room category</li></ul>`],
    ],
    faqs: [
      ["Can I get a spine opinion online with my MRI?", "Yes. Send your MRI report and images; we share them with spine specialists at 2–3 accredited hospitals for an opinion before you travel."],
      ["Is minimally invasive spine surgery always better?", "Not always. It suits certain conditions and patients. The surgeon will recommend the technique that is safest and most effective for the specific problem."],
      ["How long should I plan to stay after spine surgery?", "It ranges from a few days to two weeks or more, depending on the procedure. We plan the stay around the surgeon's advice."],
    ],
    related: ["neurosurgery-in-india", "knee-replacement-in-india", "hip-replacement-in-india"],
  },
  {
    slug: "neurosurgery-in-india",
    name: "Brain & Neurosurgery",
    short: "Brain tumours, epilepsy and more.",


    icon: "brain",
    condition: "Brain & spine",
    title: "Neurosurgery & Brain Tumour Treatment in India | Irynt",
    description: "Opinions from accredited neuro centres in India for brain tumours, epilepsy and more. Compare estimates and plan stay, travel and rehabilitation.",
    h1: "Brain and neurosurgery in India",

    lead: "Experienced neuro specialists, clear answers, rehab planned.",


    facts: [["Common reasons", "Brain tumour, epilepsy, movement disorders"], ["Key reports", "MRI brain, neurologist notes"], ["Hospital stay", "Varies widely by procedure"], ["Often needed", "Rehabilitation after discharge"]],
    sections: [
      ["Conditions we coordinate", `<ul><li><b>Brain and pituitary tumours</b>: surgery, radiation and follow-up</li><li><b>Epilepsy</b> that does not respond to medicines: evaluation for surgery</li><li><b>Movement disorders</b> such as Parkinson's disease: evaluation for procedures like deep brain stimulation in selected patients</li><li><b>Hydrocephalus, aneurysms and vascular conditions</b></li><li><b>Rehabilitation</b> after stroke or brain surgery</li></ul>
<div class="callout warn"><p>Sudden weakness on one side, slurred speech, a severe sudden headache or a seizure needs <b>emergency care now</b>. Call 112.</p></div>`],
      ["Reports to share", `<ul class="checklist"><li>${"{check}"}<span>MRI or CT brain report and images</span></li><li>${"{check}"}<span>Neurologist or neurosurgeon notes</span></li><li>${"{check}"}<span>EEG reports (for epilepsy)</span></li><li>${"{check}"}<span>Biopsy report, if any</span></li><li>${"{check}"}<span>Current medicines with doses</span></li></ul>`],
      ["Planning the stay and rehabilitation", `<p>After brain surgery, patients may spend time in intensive care, then the ward, and may need physiotherapy, speech or occupational therapy. Families often need a longer stay than they expect. We plan accommodation close to the hospital, an assistant on the hardest days and transport suited to the patient's mobility.</p>`],
      ["What affects the cost", `<ul><li>The condition and the procedure</li><li>Use of advanced technology (navigation, intraoperative imaging)</li><li>Days in ICU and ward</li><li>Radiation or other treatment after surgery</li><li>Rehabilitation needs</li></ul>`],
    ],
    faqs: [
      ["Can I get a neurosurgery opinion with my MRI?", "Yes. Share the MRI report and images and the doctor's notes. We send them to neuro specialists at 2–3 accredited hospitals for an opinion and estimate."],
      ["How long will the patient be in hospital after brain surgery?", "It varies a lot by procedure and recovery. The neurosurgeon will give an estimate; we plan the family's stay accordingly and adjust as needed."],
      ["Do you help with rehabilitation after discharge?", "Yes. We help arrange physiotherapy and other therapy sessions and plan follow-up visits."],
    ],
    related: ["spine-surgery-in-india", "cancer-treatment-in-india", "heart-surgery-in-india"],
  },
  {
    slug: "kidney-care-and-dialysis-in-india",
    name: "Kidney Care & Dialysis",
    short: "Dialysis on the go, stones, urology.",


    icon: "drop",
    condition: "Kidney & urology",
    title: "Kidney Care & Dialysis in India for Travellers | Irynt",
    description: "Kidney stones, kidney disease or dialysis while travelling in India: get specialist opinions, book dialysis sessions and plan your stay.",
    h1: "Kidney care and dialysis in India",

    lead: "Dialysis booked around your trip. The right urologist for the rest.",


    facts: [["We coordinate", "Nephrology, urology, dialysis sessions"], ["Dialysis travel", "Sessions booked in advance"], ["Key reports", "Kidney function tests, ultrasound/CT"], ["Plan ahead", "Bring the latest dialysis prescription"]],
    sections: [
      ["What we help with", `<ul><li><b>Dialysis while travelling</b>: booking haemodialysis sessions near your stay, for patients travelling for any treatment</li><li><b>Kidney stones</b>: opinions on treatment options such as lithotripsy or endoscopic procedures</li><li><b>Chronic kidney disease</b>: nephrology opinions and long-term care planning</li><li><b>Prostate and urology conditions</b></li></ul>
<div class="callout"><p>Irynt does not arrange organ donors. Kidney transplantation in India follows a strict legal approval process under the Transplantation of Human Organs and Tissues Act; we can only help approved families with travel and stay.</p></div>`],
      ["Dialysis on the move: what to send", `<ul class="checklist"><li>${"{check}"}<span>Latest dialysis prescription (frequency, duration, dialyser, heparin)</span></li><li>${"{check}"}<span>Recent blood tests including viral markers (HBsAg, HCV, HIV), usually required by dialysis centres</span></li><li>${"{check}"}<span>Vascular access details (fistula or catheter)</span></li><li>${"{check}"}<span>Nephrologist's note and current medicines</span></li></ul>
<p>Dialysis centres often have limited slots. Please tell us your travel dates as early as possible.</p>`],
      ["What affects the cost", `<ul><li>Number of dialysis sessions and the centre chosen</li><li>For procedures: the technique, equipment and days in hospital</li><li>Tests and medicines</li></ul>`],
    ],
    faqs: [
      ["Can you book dialysis for a patient travelling for another treatment?", "Yes. Share the dialysis prescription and recent reports, and we book sessions at a centre close to the stay and the treating hospital."],
      ["Do you arrange kidney transplants?", "We do not arrange donors. Transplants in India require legal approval from an authorisation committee. For approved cases, we can help with travel and stay only."],
      ["Which reports are needed for a kidney stone opinion?", "Usually an ultrasound or CT scan report (KUB), urine and kidney function tests, and notes on symptoms."],
    ],
    related: ["heart-surgery-in-india", "cancer-treatment-in-india", "neurosurgery-in-india"],
  },
  {
    slug: "ivf-treatment-in-india",
    name: "IVF & Fertility",
    short: "Registered clinics, quiet stays.",


    icon: "fertility",
    condition: "Fertility / IVF",
    title: "IVF Treatment in India: Clinics & Stay Planning | Irynt",
    description: "Planning IVF in India? Get opinions from registered fertility clinics, understand the steps and timeline, and plan a discreet, comfortable stay.",
    h1: "IVF and fertility treatment in India",

    lead: "Registered clinics, a clear timeline and a calm place to stay.",


    facts: [["One IVF cycle", "Often several weeks from start to embryo transfer"], ["Clinics", "Registered under India's ART law"], ["Key reports", "Hormone tests, ultrasound, semen analysis"], ["Our focus", "Discreet, comfortable stays"]],
    sections: [
      ["How an IVF cycle usually works", `<ol><li><b>Evaluation</b>: tests for both partners and a consultation.</li><li><b>Ovarian stimulation</b>: daily injections and monitoring scans for about 10–14 days.</li><li><b>Egg retrieval</b>: a short procedure, usually as a day case.</li><li><b>Fertilisation and embryo culture</b> in the laboratory.</li><li><b>Embryo transfer</b>, fresh or frozen, as the doctor advises.</li></ol>
<p>The exact protocol and timeline are decided by the fertility specialist.</p>`],
      ["The law in India", `<p>Fertility clinics and ART banks in India must be registered under the <b>Assisted Reproductive Technology (Regulation) Act, 2021</b>, which also sets rules on who can access treatment. <b>Commercial surrogacy is banned</b> under the Surrogacy (Regulation) Act, 2021, and Irynt does not coordinate surrogacy. Please confirm your eligibility with the clinic before planning travel.</p>`],
      ["Reports to share", `<ul class="checklist"><li>${"{check}"}<span>Hormone tests (such as AMH, FSH, LH, TSH, prolactin)</span></li><li>${"{check}"}<span>Pelvic ultrasound reports</span></li><li>${"{check}"}<span>Semen analysis</span></li><li>${"{check}"}<span>Details of any earlier fertility treatment</span></li></ul>`],
      ["What affects the cost", `<ul><li>The protocol and medicines used</li><li>Additional procedures (ICSI, embryo freezing, genetic testing where allowed)</li><li>Number of cycles</li><li>Length of stay in the city</li></ul>`],
    ],
    faqs: [
      ["How long do we need to stay in the city for IVF?", "Many couples plan about 3–4 weeks for one fresh cycle, but this varies. Some evaluations and the early stimulation phase can be started at home under guidance; the clinic will advise."],
      ["Can international couples have IVF in India?", "Eligibility rules apply under India's ART law. Please check with the clinic first. We do not coordinate surrogacy, which is restricted in India."],
      ["Is my information kept private?", "Yes. We share your reports only with clinics you approve, and our coordinators are trained to be discreet."],
    ],
    related: ["cancer-treatment-in-india", "knee-replacement-in-india", "heart-surgery-in-india"],
  },
];

module.exports = { treatments: T, COMMON_HELP };
