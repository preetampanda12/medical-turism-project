# Irynt

**Your complete treatment journey, planned and handled.**

Irynt is a medical travel and care coordination service. A patient shares their health problem, a personal coordinator contacts them within 2 hours, and builds a complete treatment plan: hospital, travel, stay, personal assistant, medicines, insurance help and follow-up.

## Phase 1 (this repo)

| Part | File |
|---|---|
| Website (single page, mobile friendly) | `index.html`, `assets/styles.css`, `assets/app.js` |
| Site settings (WhatsApp, email, Sheet link) | `assets/config.js` |
| Patient intake form → case ID → WhatsApp + Google Sheet | `assets/app.js` |
| Free case tracker backend (Google Sheets + Apps Script) | `backend/google-apps-script.gs` |
| Privacy Policy, Terms & Disclaimer, Patient Consent (drafts) | `privacy.html`, `terms.html`, `consent.html` |
| Setup guide | `docs/01-setup-guide.md` |
| WhatsApp greeting, away message and quick replies | `docs/02-whatsapp-scripts.md` |
| Coordinator first-call checklist | `docs/03-first-call-checklist.md` |

No build step and no server. It is plain HTML/CSS/JS, hosted free on GitHub Pages.

## Run locally

```bash
python3 -m http.server 8080
```
Then open http://localhost:8080

## Go live
Follow `docs/01-setup-guide.md`.

## Roadmap
- **Phase 2:** Coordinator dashboard + package builder (PDF treatment plan)
- **Phase 3:** Partner directory (hospitals, stays, cabs, pharmacies) + patient tracking link + hospital pitch kit
- **Phase 4:** International version (more languages, visa docs, payments)
