# Irynt

**Your complete treatment journey, planned and handled.**

Irynt is a medical travel and care coordination service. A patient shares their health problem, a personal coordinator contacts them within 2 hours, and builds a complete treatment plan: hospital options, travel, stay, personal assistant, medicines, insurance help and follow-up.

Plain HTML/CSS/JS with no build step. Hosted free on GitHub Pages, with a free backend on Google Sheets + Apps Script.

## What's inside

| Page | What it does |
|---|---|
| `index.html` | Public website + patient intake form → case ID + private tracking link |
| `dashboard.html` | Coordinator dashboard: cases, SLA timer, case page, WhatsApp templates (EN/HI), timeline |
| `dashboard.html#/case/<id>/plan` | **Package builder**: up to 3 hospital options + services from partners → live preview → draft / publish → print / PDF |
| `dashboard.html#/partners` | **Partner directory**: hospitals, stays, cabs, assistants, pharmacies… with rates and MoU status |
| `track.html` | **Patient tracking page**: progress steps, coordinator, public updates, published plan |
| `partner.html` | "Partner with Irynt" page + printable one-pager for hospitals |
| `privacy.html`, `terms.html`, `consent.html` | Legal drafts (review with a lawyer) |

| Code | |
|---|---|
| `backend/google-apps-script.gs` | The whole backend: Cases, Updates, Partners, Packages, Team (access keys) |
| `assets/config.js` | **The only file you edit**: WhatsApp number, email, Apps Script URL |
| `assets/api.js` | API client: live (Apps Script) or demo (in-browser) |
| `assets/gas-emulator.js` | Runs the real backend code in the browser for demo mode and tests |
| `assets/core.js` | Plan maths, plan rendering, WhatsApp templates, statuses |
| `assets/dashboard.js` | Dashboard app |

| Docs (Hinglish) | |
|---|---|
| `docs/01-setup-guide.md` | Demo → Google Sheet → config → GitHub Pages → live test |
| `docs/02-whatsapp-scripts.md` | Greeting, away message, quick replies |
| `docs/03-first-call-checklist.md` | Coordinator's first call |
| `docs/04-partner-pitch-kit.md` | Hospital/stay/cab pitch: emails, call script, objections |
| `docs/05-facilitation-agreement-template.md` | Hospital agreement draft (lawyer review needed) |
| `docs/06-dashboard-guide.md` | Daily routine and the case flow in the dashboard |

## Try it now (demo mode)

```bash
python3 -m http.server 8080
```
Open http://localhost:8080 (website) and http://localhost:8080/dashboard.html → **Open demo dashboard**.
Demo data is stored only in your browser.

## Tests

```bash
node tests/backend.test.js
```
```bash
node tests/e2e.test.js
```
`backend.test.js` runs the Apps Script code with an emulator (17 checks). `e2e.test.js` uses Playwright to drive the full flow in a browser, in demo mode and in live mode against a fake Apps Script URL (31 checks).

## Go live
Follow `docs/01-setup-guide.md`.

## Roadmap
- **Phase 4:** international version (more languages, visa documents, online payments), partner self-service portal
