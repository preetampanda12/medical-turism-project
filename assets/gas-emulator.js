/*
 * A tiny in-browser stand-in for Google Sheets + Apps Script.
 * It runs the REAL backend/google-apps-script.gs code, so "demo mode"
 * behaves exactly like the live system. Demo data lives only in this
 * browser (localStorage). Also used by the automated tests (Node).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.IryntGasEmulator = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function create(gsSource, storage) {
    // storage: { load(): object|null, save(object) }
    var db = (storage && storage.load()) || { sheets: {}, order: [] };
    function persist() { if (storage) storage.save(db); }

    function chain() {
      var p = new Proxy(function () {}, {
        get: function (t, k) { return k === "build" ? function () { return {}; } : function () { return p; }; },
        apply: function () { return p; }
      });
      return p;
    }

    function normalise(v) {
      if (v instanceof Date) return v.toISOString();
      if (typeof v === "string" && v.charAt(0) === "'") return v.slice(1); // Sheets hides the apostrophe
      return v == null ? "" : v;
    }

    function Sheet(name) {
      var rows = db.sheets[name];
      function width() { return rows.reduce(function (m, r) { return Math.max(m, r.length); }, 0); }
      function cell(r, c) { var row = rows[r - 1]; return row && row[c - 1] !== undefined ? row[c - 1] : ""; }
      var self = {
        getName: function () { return name; },
        getLastRow: function () { return rows.length; },
        getLastColumn: function () { return width(); },
        appendRow: function (vals) { rows.push(vals.map(normalise)); persist(); return self; },
        deleteRow: function (r) { rows.splice(r - 1, 1); persist(); return self; },
        getDataRange: function () { return self.getRange(1, 1, Math.max(rows.length, 1), Math.max(width(), 1)); },
        getRange: function (r, c, nr, nc) {
          nr = nr || 1; nc = nc || 1;
          var range = {
            getValues: function () {
              var out = [];
              for (var i = 0; i < nr; i++) {
                if (r + i > rows.length) break;
                var line = [];
                for (var j = 0; j < nc; j++) line.push(cell(r + i, c + j));
                out.push(line);
              }
              return out.length ? out : [[]];
            },
            setValues: function (vals) {
              vals.forEach(function (line, i) {
                while (rows.length < r + i) rows.push([]);
                var row = rows[r + i - 1];
                line.forEach(function (v, j) {
                  while (row.length < c + j - 1) row.push("");
                  row[c + j - 1] = normalise(v);
                });
              });
              persist();
              return range;
            },
            setFormula: function () { return range; },
            setDataValidation: function () { return range; },
            setNumberFormat: function () { return range; },
            setFontWeight: function () { return range; },
            setBackground: function () { return range; },
            setFontColor: function () { return range; }
          };
          return range;
        },
        setFrozenRows: function () { return self; },
        setFrozenColumns: function () { return self; },
        setColumnWidth: function () { return self; },
        setConditionalFormatRules: function () { return self; }
      };
      return self;
    }

    var ss = {
      getSheetByName: function (n) { return db.sheets[n] ? Sheet(n) : null; },
      insertSheet: function (n) { db.sheets[n] = []; db.order.push(n); persist(); return Sheet(n); },
      getUrl: function () { return "about:blank#demo-sheet"; }
    };

    var mails = [];
    var env = {
      SpreadsheetApp: {
        getActiveSpreadsheet: function () { return ss; },
        newDataValidation: chain,
        newConditionalFormatRule: chain
      },
      ContentService: {
        MimeType: { JSON: "application/json" },
        createTextOutput: function (s) {
          var out = { content: s, setMimeType: function () { return out; }, getContent: function () { return s; } };
          return out;
        }
      },
      LockService: { getScriptLock: function () { return { waitLock: function () {}, releaseLock: function () {} }; } },
      MailApp: { sendEmail: function (m) { mails.push(m); } },
      Logger: { log: function () {} },
      Utilities: {
        getUuid: function () {
          var c = (typeof crypto !== "undefined" && crypto.getRandomValues) ? crypto : require("crypto").webcrypto;
          var b = new Uint8Array(16); c.getRandomValues(b);
          var h = Array.prototype.map.call(b, function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
          return h.slice(0, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16) + "-" + h.slice(16, 20) + "-" + h.slice(20);
        }
      }
    };

    var names = Object.keys(env);
    var fn = new Function(names.join(","), gsSource + "\n;return { doPost: doPost, doGet: doGet, setup: setup };");
    var api = fn.apply(null, names.map(function (n) { return env[n]; }));

    function post(body) {
      var e = typeof body === "string"
        ? { postData: { type: "text/plain", contents: body }, parameter: {} }
        : { postData: { type: "application/x-www-form-urlencoded", contents: "" }, parameter: body };
      return JSON.parse(api.doPost(e).getContent());
    }

    return {
      setup: function () { api.setup(); },
      post: post,
      call: function (req) { return post(JSON.stringify(req)); },
      adminKey: function () {
        var team = db.sheets.Team || [];
        var h = team[0] || [];
        var ki = h.indexOf("Access key"), ri = h.indexOf("Role");
        for (var i = 1; i < team.length; i++) if (team[i][ri] === "admin") return team[i][ki];
        return null;
      },
      addRow: function (name, values) { ss.getSheetByName(name).appendRow(values); },
      isEmpty: function () { return !db.sheets.Team || db.sheets.Team.length < 2; },
      mails: mails,
      raw: db
    };
  }

  return { create: create };
});
