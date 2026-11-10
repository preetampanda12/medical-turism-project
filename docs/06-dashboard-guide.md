# Coordinator Dashboard Guide

Dashboard kholo: `…/dashboard.html`. Login apni **access key** se karo (Team sheet mein milegi).

## Roz ka routine
**Subah (15 min)**
1. **Cases** page kholo aur **"Overdue only"** tick karo. Laal wale cases ko sabse pehle call karo.
2. **Next action** column dekho. Aaj kya-kya karna hai, wahi aapki to-do list hai.
3. In-treatment patients ko daily check-in message bhejo (template: *Daily check-in*).

**Din bhar:** naya case aaye (email alert) to 2 ghante ke andar call karo.

**Shaam:** har case ka "Next action" update karo.

## Ek case ka poora flow

| Step | Dashboard mein kya karna hai | Status |
|---|---|---|
| 1. Naya case aaya | Case kholo → patient details padho | New |
| 2. Call kiya | **"✓ Mark contacted now"** dabao (response time apne aap record hota hai). Template *Ask for reports* bhejo. | Contacted |
| 3. Reports aayi | Doctor advisor ko dikhao. Template *Consent to share* bhejo. | Reports received |
| 4. Hospitals ko bheja | Timeline mein "Visible to patient" update daalo | Sent to hospitals |
| 5. Estimates aaye | "Hospitals asked" bharo | Estimates received |
| 6. Plan banao | **📋 Build treatment plan** → hospitals aur services chuno → **Publish to patient** | Package sent (apne aap) |
| 7. Patient ko bhejo | Template *Plan is ready* (tracking link ke saath) → Open in WhatsApp | |
| 8. Patient ne haan kaha | "Hospital chosen" bharo, booking karo | Confirmed |
| 9. Ilaj chal raha | Roz check-in, timeline updates | In treatment |
| 10. Ghar laute | Template *Back home*, follow-up reminders | Follow-up |
| 11. Khatam | | Closed - completed |

Patient ne mana kar diya ya jawab nahi diya → `Closed - lost`, aur Notes mein wajah likho. Isse aage seekhne mein madad milegi.

## Treatment plan builder
- **Hospital options (max 3):** "Pick from partner hospitals" se chuno to naam, city aur accreditation apne aap bhar jaate hain. Estimate **wahi likho jo hospital ne diya.**
- **Recommended:** jo option aap suggest karte ho, use mark karo.
- **Services:** patient ne form mein jo help maangi thi, wo pehle se jud jaati hai. Partner chuno to rate apne aap bhar jaata hai. Qty (raatein, trips, din) bharo.
- **Included free:** jo cheez free hai (insurance help, visa letter) usme "Included free" tick karo.
- Right side ka **preview** wahi hai jo patient dekhega.
- **Save draft:** sirf team dekhegi. **Publish:** patient ke tracking page par dikh jaayega.
- **Print / PDF:** print dialog mein "Save as PDF" chuno. Yeh PDF WhatsApp par bhi bhej sakte ho.
- Plan badalna ho to "Edit latest" karo. Har baar naya version banta hai aur purane versions history mein rehte hain.

## Timeline: Internal vs Visible to patient
- **Internal note:** sirf team dekhegi (jaise "Hospital B ka jawab slow hai").
- **Visible to patient:** tracking page par dikhega. Saaf aur vinamra bhasha mein likho.

## Tracking link
Har case ka ek private link hota hai. Ise sirf usi patient ko bhejo. Link mein secret code hai, isliye bina link ke koi aur case nahi dekh sakta.

## Partners page
Hospitals, stays, cabs, assistants, pharmacies sab yahan rakho. "Fee terms" column **sirf internal** hai, patient ko kabhi nahi dikhta. "Inactive" partners plan builder mein nahi aate.

## Galti ho jaaye to
Saara data aapki Google Sheet mein hai. Wahan seedha edit kar sakte ho (Case ID aur Track token column mat badalna).
