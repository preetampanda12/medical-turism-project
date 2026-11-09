# Irynt WhatsApp Scripts

WhatsApp Business → **Settings → Business tools → Quick replies** mein inhe save karo. Shortcut (jaise `/hi`) type karte hi poora message aa jaayega.

Har script do bhasha mein hai: English (international patients ke liye) aur Hinglish (Indian patients ke liye). Patient jis bhasha mein likhe, usi mein jawab do.

---

## Labels (WhatsApp Business → Labels)
Inhe Google Sheet ke Status jaisa hi rakho:
`🟡 New` · `📞 Contacted` · `📄 Reports received` · `🏥 Sent to hospitals` · `💰 Package sent` · `✅ Confirmed` · `🛏️ In treatment` · `🔁 Follow-up` · `⚫ Closed`

---

## Automatic messages

### Greeting message (Business tools → Greeting message)
**EN:** Hello and welcome to Irynt 🙏 We help you plan your complete treatment journey: the right hospital, travel, stay, medicines and insurance help. Please tell us the patient's name, age, city and the health problem. A coordinator will reply within 2 hours (9 AM – 9 PM IST).
⚠️ For emergencies, call 112 or go to the nearest hospital.

**HI:** Namaste, Irynt mein aapka swagat hai 🙏 Hum aapke ilaj ka poora safar plan karte hain: sahi hospital, travel, rehna, dawai aur insurance mein madad. Kripya patient ka naam, umar, shehar aur bimari ke baare mein batayein. Hamare coordinator 2 ghante ke andar (subah 9 se raat 9 baje) jawab denge.
⚠️ Emergency ho to 112 par call karein ya turant nazdeeki hospital jaayein.

### Away message (after hours)
**EN:** Thank you for reaching Irynt. Our team is offline right now (9 AM – 9 PM IST). Your message is saved and a coordinator will contact you first thing in the morning. For emergencies, call 112.

**HI:** Irynt se sampark karne ke liye dhanyavaad. Abhi hamari team offline hai (subah 9 se raat 9 baje). Aapka message save ho gaya hai, subah sabse pehle coordinator aapse sampark karenge. Emergency ke liye 112 par call karein.

---

## Quick replies

### `/hi`: first reply after the form
**EN:** Hello {name}, this is {coordinator} from Irynt. I'll be your personal coordinator for case {case ID}. Is this a good time for a 10-minute call to understand {patient}'s condition?

**HI:** Namaste {name} ji, main {coordinator}, Irynt se. Case {case ID} ke liye main aapka personal coordinator hoon. Kya abhi 10 minute baat ho sakti hai, {patient} ji ki takleef samajhne ke liye?

### `/reports`: ask for reports
**EN:** To get opinions from hospitals, please send clear photos or PDFs of:
1. Latest doctor's prescription / notes
2. Scan reports (MRI, CT, X-ray, PET) and the report text
3. Blood test reports (last 1 month)
4. Biopsy / histopathology report (for cancer)
5. Discharge summary, if any earlier hospital stay
Your reports are shared only with hospitals you approve.

**HI:** Hospitals se opinion lene ke liye yeh reports ki saaf photo ya PDF bhejein:
1. Doctor ka latest parcha / note
2. Scan reports (MRI, CT, X-ray, PET) aur unki report
3. Blood test reports (pichhle 1 mahine ki)
4. Biopsy report (cancer ke case mein)
5. Pehle kahin bharti hue the to discharge summary
Aapki reports sirf unhi hospitals ko bheji jaayengi jinke liye aap haan kahenge.

### `/consent`: before sending to hospitals
**EN:** Before I share the reports, please confirm: may I send {patient}'s reports to {Hospital A}, {Hospital B} and {Hospital C} for an opinion and cost estimate? Please reply YES.

**HI:** Reports bhejne se pehle confirm karein: kya main {patient} ji ki reports {Hospital A}, {Hospital B} aur {Hospital C} ko opinion aur kharche ke estimate ke liye bhej doon? Kripya HAAN likhein.

### `/update`: waiting for hospitals
**EN:** Update on case {case ID}: reports have been sent to {n} hospitals. We usually get opinions within 24–72 hours. I'll update you as soon as each one replies.

**HI:** Case {case ID} ka update: reports {n} hospitals ko bhej di gayi hain. Aam taur par 24–72 ghante mein opinion aa jaata hai. Har jawab aate hi main aapko bataunga.

### `/plan`: sending the package
**EN:** {name}, your treatment plan for {patient} is ready 📋 It compares {n} hospitals with each hospital's original estimate, plus stay, travel and support options. Please go through it and tell me which option you prefer. Happy to explain on a call.

**HI:** {name} ji, {patient} ji ka treatment plan taiyaar hai 📋 Isme {n} hospitals ki tulna hai, har hospital ka original estimate ke saath, aur rehne, travel aur madad ke options bhi hain. Dekh kar bataiye kaunsa option theek lagta hai. Call par samjha bhi sakta hoon.

### `/fee`: if asked how Irynt earns
**EN:** Good question. Our coordination is free for you. Partner hospitals and service providers may pay us a facilitation fee. We always show you the hospital's own estimate, with no mark-up, and you are free to pick any option.

**HI:** Bahut achha sawaal. Hamari coordination service aapke liye free hai. Partner hospitals aur service providers hamein facilitation fee de sakte hain. Hum hamesha hospital ka original estimate dikhate hain, bina kuch jode, aur aap koi bhi option chunne ke liye azaad hain.

### `/arrive`: travel confirmed
**EN:** All set ✅
• Arrival: {date, train/flight}, pickup by {driver name, phone}
• Stay: {address, maps link}
• Hospital appointment: {date, time, doctor, department}
• Your assistant: {name, phone}
Please carry: all reports, ID proof, insurance card, current medicines.

**HI:** Sab taiyaar hai ✅
• Pahunchna: {date, train/flight}, pickup: {driver ka naam, phone}
• Rehna: {address, maps link}
• Hospital appointment: {date, time, doctor, vibhag}
• Aapke assistant: {naam, phone}
Saath laayein: saari reports, ID proof, insurance card, chal rahi dawaiyan.

### `/daily`: daily check-in during treatment
**EN:** Good morning {name} 🙏 How is {patient} today? Do you need anything: medicines, food, a cab or help at the hospital?

**HI:** Suprabhat {name} ji 🙏 Aaj {patient} ji kaise hain? Kuch chahiye: dawai, khana, cab ya hospital mein koi madad?

### `/home`: after discharge
**EN:** So glad {patient} is heading home 🙏 I'll remind you about medicines and your follow-up visit on {date}. If you were happy with Irynt, a short review would help other families find us: {review link}

**HI:** Bahut khushi hai ki {patient} ji ghar ja rahe hain 🙏 Main dawaiyon aur {date} ke follow-up visit ki yaad dilata rahunga. Agar Irynt se aap santusht hain, to ek chhota review doosre parivaaron ki madad karega: {review link}

### `/emergency`
**EN:** This sounds urgent. Please call 112 or go to the nearest hospital emergency right now. We'll help with everything else afterwards.

**HI:** Yeh emergency lag rahi hai. Kripya abhi 112 par call karein ya turant nazdeeki hospital ki emergency mein jaayein. Baaki sab mein hum baad mein madad karenge.

### `/medical`: when asked for medical advice
**EN:** I'm a care coordinator, not a doctor, so I can't advise on medicines or treatment. I'll get this question answered by the specialist. Meanwhile, please follow your current doctor's advice.

**HI:** Main coordinator hoon, doctor nahi, isliye dawai ya ilaj par salah nahi de sakta. Yeh sawaal main specialist doctor se poochh kar bataunga. Tab tak apne abhi wale doctor ki salah maanein.
