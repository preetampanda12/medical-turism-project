// Generates assets/logo.png (512x512) and assets/og-image.png (1200x630) with Playwright.
// Run once after changing the logo or tagline:  node build/images.js
"use strict";
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");
const ROOT = path.join(__dirname, "..");
const logo = fs.readFileSync(path.join(ROOT, "assets/logo.svg"), "utf8");

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 512 } });
  await p.setContent(`<html><body style="margin:0">${logo.replace("<svg ", '<svg width="512" height="512" ')}</body></html>`);
  await p.screenshot({ path: path.join(ROOT, "assets/logo.png"), omitBackground: true });

  await p.setViewportSize({ width: 1200, height: 630 });
  await p.setContent(`<html><head><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@500&display=swap" rel="stylesheet"></head>
  <body style="margin:0;width:1200px;height:630px;font-family:'Plus Jakarta Sans',sans-serif;background:radial-gradient(900px 500px at 90% -10%,#1B8BA1 0%,rgba(27,139,161,0) 60%),#0B2A31;color:#fff;display:flex;flex-direction:column;justify-content:space-between;padding:72px;box-sizing:border-box">
    <div style="display:flex;align-items:center;gap:18px;font-size:44px;font-weight:800">${logo.replace("<svg ", '<svg width="72" height="72" ')}irynt</div>
    <div><div style="font-size:60px;font-weight:800;line-height:1.1;letter-spacing:-1.5px">Coming to a big city for treatment?<br><span style="color:#F4B860">We'll take care of the rest.</span></div>
    <div style="font-family:Inter,sans-serif;font-size:28px;color:#B9D3D9;margin-top:22px">The right hospital, the real estimate, and a room nearby</div></div>
  </body></html>`, { waitUntil: "networkidle" });
  await p.screenshot({ path: path.join(ROOT, "assets/og-image.png") });
  await b.close();
  console.log("assets/logo.png and assets/og-image.png created");
})();
