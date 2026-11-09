/*
 * IRYNT SITE SETTINGS
 * -------------------
 * Fill these in before going live. This is the only file you need to edit
 * to connect the website to your WhatsApp, email and Google Sheet.
 */
window.IRYNT_CONFIG = {
  // Your WhatsApp Business number with country code, digits only, no "+".
  // Example for India: "919876543210"
  whatsappNumber: "",

  // Email shown on the site (optional).
  email: "",

  // Google Apps Script Web App URL (see docs/01-setup-guide.md, Step 3).
  // When set, every enquiry is saved as a new row in your Google Sheet.
  sheetEndpoint: "",

  // Promised first-response time in hours, and the hours you are available.
  responseHours: 2,
  workingHours: "9 AM – 9 PM IST, all days",
};
