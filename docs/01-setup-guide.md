# Irynt Setup Guide (₹0 mein live karna)

Is guide mein 5 steps hain. Kul time lagbhag 1 ghanta. Setup se pehle **demo try karna ho to Step 0 dekho.**

---

## Step 0: Pehle demo try karo (5 min, koi setup nahi)

Computer par project folder mein yeh command chalao:
```bash
python3 -m http.server 8080
```
Ab browser mein kholo:
- **Website:** http://localhost:8080. Form bharo, case ID aur tracking link milega.
- **Dashboard:** http://localhost:8080/dashboard.html, phir **"Open demo dashboard"** dabao.
- **Tracking page:** form ke baad jo link mila, wo kholo.

Demo mein sample data hai (cases, partners, ek published plan). Yeh sirf aapke browser mein save hota hai. Dashboard ke upar **"Reset demo data"** se sab saaf ho jaata hai.

---

## Step 1: WhatsApp Business (10 min)

1. **WhatsApp Business** app install karo (free). Alag number ho to best.
2. Profile: Name **Irynt**, Category *Medical & Health*, Hours 9 AM – 9 PM.
3. Greeting, away message aur quick replies `docs/02-whatsapp-scripts.md` se daalo.
   (Dashboard mein bhi har case ke liye ready messages hain, EN + HI dono.)

## Step 2: Google Sheet backend (20 min, free)

Yahi aapka database, login aur API hai.

1. Google Drive mein nayi **Google Sheet** banao: `Irynt`.
2. **Extensions → Apps Script.** Wahan ka code hatao aur `backend/google-apps-script.gs` ka poora code paste karo.
3. Upar `NOTIFY_EMAIL = "aapka@gmail.com"` likho (naye case ka email alert aayega). **Save** karo.
4. Function dropdown mein **`setup`** chuno, **Run** dabao aur permission do. ("Unsafe" warning aaye to *Advanced → Go to project*. Yeh aapka apna script hai.)
5. Sheet mein 5 tabs ban jaayenge: **Cases, Updates, Partners, Packages, Team**.
6. **Team** tab kholo. Wahan `Admin` ki row mein **Access key** (`irk_…`) hai. **Yahi dashboard ka password hai, ise kisi ko mat bhejna.**
7. **Deploy → New deployment →** type *Web app*:
   - Execute as: **Me**
   - Who has access: **Anyone**
   - **Deploy** dabao aur **Web app URL** copy karo.

> Code badla to: **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.** URL wahi rahega.

**Naya coordinator jodna:** Team tab mein nayi row daalo: Name, Email, WhatsApp (jaise `919876543210`), Role `coordinator`, Access key (koi bhi lambi random string, jaise `irk_` ke baad 20 akshar), Active `Yes`. Hatana ho to Active `No` kar do.

## Step 3: Website config (2 min)

`assets/config.js` mein bharo:
```js
whatsappNumber: "919876543210",                        // bina + ke
email: "hello@yourmail.com",                            // optional
sheetEndpoint: "https://script.google.com/macros/s/…/exec",  // Step 2 ka URL
demoMode: false,
```
`sheetEndpoint` bharte hi website form, dashboard aur tracking page **live** ho jaate hain aur demo mode band ho jaata hai.

## Step 4: Free hosting (GitHub Pages)

1. GitHub par repo `irynt` banao (account `preetampanda12`) aur saari files upload karo.
2. **Settings → Pages → Deploy from a branch → `main` / root → Save.**
3. 1-2 minute mein site live ho jaayegi:
   - Website: `https://preetampanda12.github.io/irynt/`
   - Dashboard: `…/irynt/dashboard.html`
   - Partners page: `…/irynt/partner.html`

**Apna domain (baad mein):** `irynt.in` ya `irynt.com` lagbhag ₹600–1,200/saal mein. Settings → Pages → Custom domain.

## Step 5: Live test (10 min)

1. Website par apne doosre number se test form bharo.
2. Sheet ke **Cases** tab mein row aayi? Email aaya?
3. Dashboard mein access key se login karo. Case dikha?
4. "Mark contacted now" dabao, ek "Visible to patient" update daalo, ek test plan publish karo.
5. Tracking link kholo. Progress aur plan dikhe?
6. Test case ka Status `Closed - lost` kar do.

---

## Launch checklist
- [ ] `config.js` mein WhatsApp number aur `sheetEndpoint` bhare
- [ ] Step 5 ka live test pass hua
- [ ] Access key sirf aapke paas hai
- [ ] `privacy.html`, `terms.html`, `consent.html` ke `[BRACKET]` items bhare aur lawyer ne review kiya
- [ ] Doctor advisor fix hai
- [ ] Dashboard ke Partners mein kam se kam 2-3 hospitals, 2 stays aur 1 cab partner hain

## Limits (free plan)
- Google Apps Script: rozana lagbhag 100 email alerts (free Gmail account). Shuruaat ke liye kaafi hai.
- Ek Sheet mein hazaron cases aaram se chalte hain. Bahut bade ho jaayein to purane closed cases alag sheet mein archive kar dena.
