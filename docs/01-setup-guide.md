# Irynt Phase 1: Setup Guide (₹0 mein live karna)

Is guide mein 4 steps hain. Kul time lagbhag 1 ghanta.

---

## Step 1: WhatsApp Business setup (10 min)

1. Phone mein **WhatsApp Business** app install karo (free). Ek alag number ho to best, warna apna number bhi chalega.
2. Business profile bharo:
   - Name: **Irynt**
   - Category: *Medical & Health*
   - Description: *Your complete treatment journey, planned and handled. Hospital, travel, stay, medicines & insurance help.*
   - Hours: 9 AM – 9 PM
   - Profile photo: `assets/logo.svg` ka PNG (kisi bhi free SVG-to-PNG converter se bana lo)
3. **Quick replies** aur **labels** set karo. Iske scripts `docs/02-whatsapp-scripts.md` mein hain.

## Step 2: Website config (2 min)

`assets/config.js` kholo aur bharo:

```js
whatsappNumber: "919876543210",   // country code ke saath, bina + ke
email: "hello@yourmail.com",       // optional
sheetEndpoint: "",                 // Step 3 ke baad bharna
```

Agar WhatsApp number aur Sheet link dono khaali hain, to form submit nahi hoga aur owner ke liye message dikhayega. Isse koi lead chupchaap gum nahi hogi.

## Step 3: Google Sheet case tracker (15 min, free)

Isse har form submission aapki Google Sheet mein nayi row ban jaayega aur aapko email alert bhi aayega.

1. Google Drive mein nayi **Google Sheet** banao, naam rakho `Irynt Cases`.
2. Menu: **Extensions → Apps Script**.
3. Wahan ka saara code hatao aur `backend/google-apps-script.gs` ka poora code paste karo.
4. Upar `NOTIFY_EMAIL = "aapka@gmail.com"` likho. **Save** karo.
5. Function dropdown mein **`setup`** chuno aur **Run** dabao. Google permission maangega: *Allow*. ("Unsafe" warning aaye to *Advanced → Go to project* dabao. Yeh aapka apna script hai.)
6. **Deploy → New deployment →** type *Web app*:
   - Execute as: **Me**
   - Who has access: **Anyone**
   - **Deploy** dabao aur jo **Web app URL** mile use copy karo.
7. Wo URL `assets/config.js` mein `sheetEndpoint` mein paste karo.

**Sheet mein kya milega:**
- Har case ki row, `Status = New` ke saath
- Status dropdown: New → Contacted → Reports received → Sent to hospitals → … → Closed
- **2 ghante se purana "New" case laal ho jaata hai** (yeh aapka SLA alarm hai)
- "First contact at" mein call ka time bharo, to "Minutes to first contact" apne aap calculate hoga

> Script code badlo to **Deploy → Manage deployments → Edit → New version** karna zaroori hai.

## Step 4: Website live karo, free (GitHub Pages)

1. GitHub par repo `irynt` banao (account `preetampanda12`). Code main push kar dunga, ya aap khud upload kar sakte ho.
2. Repo → **Settings → Pages → Source: Deploy from a branch → Branch: `main` / root → Save**.
3. 1-2 minute mein site live ho jaayegi: `https://preetampanda12.github.io/irynt/`

**Apna domain (baad mein, jab paisa ho):** `irynt.com` ya `irynt.in` lagbhag ₹600–1,200/saal mein milta hai. Settings → Pages → Custom domain mein daal dena.

---

## Launch se pehle checklist

- [ ] `config.js` mein WhatsApp number bhara
- [ ] Google Sheet connected hai aur ek test form bhar ke row aayi
- [ ] Test submission ke baad WhatsApp button sahi number par khulta hai
- [ ] `privacy.html`, `terms.html`, `consent.html` mein saare `[BRACKET]` wale items bhare
- [ ] Legal pages ek baar lawyer ko dikhaye (bahut se lawyers ₹1–3k mein review kar dete hain)
- [ ] Doctor advisor fix hai jo reports dekh sake
- [ ] Kam se kam 2–3 hospitals se baat ho chuki hai, taaki pehla case aaye to bhej sako
