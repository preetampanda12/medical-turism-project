# SEO aur Traffic Growth Plan

Website ab SEO ke liye taiyaar hai. Lekin **traffic apne aap nahi aata**: Google ko naye site par bharosa karne mein aam taur par 3–6 mahine lagte hain. Yeh plan follow karo.

## Website mein kya bana hua hai
- **30 pages**: homepage, 8 treatment pages, 5 city pages, 5 guides, international patients, about, contact, partner, legal pages
- Har page ka alag **title, description, canonical URL** aur **social share image**
- **Structured data (JSON-LD)**: Organization, Breadcrumb, FAQ, Article, Service
- `sitemap.xml` aur `robots.txt`
- Mobile-friendly, tez (koi heavy framework nahi), har page par ek hi H1
- Internal linking: treatment ↔ city ↔ guide pages aapas mein jude hain
- Automatic SEO test (`node tests/seo.test.js`): broken links aur duplicate titles pakadta hai

## Content kaise badlein
Pages haath se edit mat karo. Content in files mein hai:
- `build/content/treatments.js`: treatment pages
- `build/content/cities.js`: city pages
- `build/content/guides.js`: guides
- `build/build.js`: homepage, about, contact, international

Badlav ke baad yeh command chalao, saare pages dobara ban jaayenge:
```bash
node build/build.js
```
Apna domain lene ke baad URL badal kar build karo:
```bash
SITE_URL=https://irynt.in node build/build.js
```

---

## Hafta 1: Launch ke turant baad
1. **Google Search Console** (free): search.google.com/search-console par site add karo, verify karo, aur `sitemap.xml` submit karo.
2. **Google Business Profile** (free): "Irynt – Medical travel coordinator" naam se banao. Isse "medical tourism near me" jaisi local searches mein dikhoge.
3. **Bing Webmaster Tools** (free): sitemap wahan bhi submit karo.
4. **Apna domain** (`irynt.in` / `irynt.com`, ₹600–1,200/saal) jaldi lo. `github.io` subdomain par `robots.txt` kaam nahi karta aur brand bhi kamzor lagta hai.

## Mahina 1–3: Trust (E-E-A-T)
Google medical topics par bahut sakht hai (inhe "Your Money or Your Life" category kehte hain). Isliye:
- [ ] **About page** par founder ka naam, photo aur kahani daalo (`build/build.js` mein comment hai)
- [ ] **Doctor advisor** se treatment pages review karwao, aur unka naam "Medically reviewed by Dr. ___" ke roop mein add karo
- [ ] Har asli patient se **Google review** maango (fake review kabhi mat likhna, ban ho sakta hai)
- [ ] Asli patient stories (unki permission ke saath, naam badal kar bhi chalega)

## Mahina 1–6: Content calendar (har hafte 1 naya page)
Logon ki asli searches ko target karo. Ideas:

| Type | Example topics |
|---|---|
| Hindi guides | "Delhi mein ilaj ke liye kahan rukein", "Ayushman card se surgery kaise karwayein" |
| Cost-factor guides | "Bypass surgery ka kharcha kin cheezon par depend karta hai" |
| Condition guides | "Angiography ke baad kya hota hai", "Knee replacement ke baad recovery" |
| Country pages | "Treatment in India from Bangladesh / Nepal / Nigeria / Kenya / Iraq" |
| City + treatment | "Cancer treatment in Mumbai for outstation patients" |

Har naya guide `build/content/guides.js` mein ek object jodkar ban jaata hai.

**Asli cost data:** jab 10–20 cases ke asli hospital estimates aa jaayein, to treatment pages par "typical estimate range" daalo, source ke saath ("Based on estimates shared with Irynt patients in 2026"). Yeh competitors jaisa sabse strong SEO content hai, aur aapka hoga asli data par.

## Backlinks (doosri websites se link)
- Local news / startup blogs mein apni kahani bhejo
- Partner hospitals, guest houses aur NGOs se "Partner" link maango
- Quora / Reddit par asli sawaalon ke helpful jawab do (spam mat karna)
- Patient support groups (cancer, kidney) mein madad karo

## Social + WhatsApp
- **YouTube Shorts / Instagram Reels**: "Delhi mein hospital ke paas kahan rukein", "Treatment ke liye kya saath le jaayein" (har guide ko video bana do)
- Har video ke description mein website link
- WhatsApp status par har hafte ek tip

## Kya measure karna hai (har mahine)
| Metric | Kahan dekhein |
|---|---|
| Google se kitne clicks aaye | Search Console → Performance |
| Kaunse pages rank ho rahe hain | Search Console → Pages |
| Form submissions | Dashboard → Cases (Source = website) |
| Kitne cases plan tak pahunche | Dashboard → status counts |

## Mat karna ❌
- Copy-paste content (Google penalty lagti hai)
- Fake reviews ya fake "10,000+ patients" jaise numbers
- "Guaranteed cure" ya "sabse sasta" jaise daave
- Kisi hospital ka naam "partner" likhna jab tak MoU sign na ho
