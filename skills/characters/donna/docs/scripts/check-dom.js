// Injected by check.sh into a copy of the document, run by headless Chrome (--dump-dom).
// Measures what the HTML says and Chrome computes; writes its JSON into the page, in a pre element with the id donna-check.
(function () {
  var res = { headings: [], contrast: [], figures: [], frames: [], bars: [], tropes: [], prose: [], asks: [], files: [], legal: [], isLegal: false, unverified: 0, tokens: [] };
  var q = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };

  // ---- headings: at most 3 levels, one h1, sentence case ----
  var levels = {}, h1 = 0;
  q("h1,h2,h3,h4,h5,h6").forEach(function (h) {
    var lv = +h.tagName[1]; levels[lv] = (levels[lv] || 0) + 1; if (lv === 1) h1++;
    var t = txt(h), letters = t.replace(/[^A-Za-z]/g, "");
    var caps = (letters.length > 3 && letters === letters.toUpperCase()) || getComputedStyle(h).textTransform === "uppercase";
    if (caps) res.headings.push("all-caps heading: " + t.slice(0, 50));
  });
  var used = Object.keys(levels).map(Number).sort();
  res.levels = used;
  if (used.some(function (l) { return l > 3; })) res.headings.push("uses h" + used[used.length - 1] + " (levels h1 to h3 only; two levels are better)");
  if (h1 > 1) res.headings.push(h1 + " h1 headings (one title per document)");

  // ---- contrast of every text colour against what is behind it ----
  function parse(c) { var m = c && c.match(/rgba?\(([^)]*)\)/); if (!m) return null; var p = m[1].split(/[ ,\/]+/).filter(Boolean).map(parseFloat); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
  function over(top, bot) { var a = top[3]; return [top[0] * a + bot[0] * (1 - a), top[1] * a + bot[1] * (1 - a), top[2] * a + bot[2] * (1 - a), 1]; }
  function lum(c) { var f = function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function backgrounds(el) { // every colour the text may sit on: a gradient gives all its stops
    var stack = [], n = el;
    while (n && n.nodeType === 1) {
      var s = getComputedStyle(n), bc = parse(s.backgroundColor), bi = s.backgroundImage || "";
      if (/gradient/.test(bi)) { var stops = (bi.match(/rgba?\([^)]*\)/g) || []).map(parse).filter(Boolean); if (stops.length) { stack.push({ list: stops }); break; } }
      if (bc && bc[3] > 0) { stack.push({ list: [bc] }); if (bc[3] === 1) break; }
      n = n.parentElement;
    }
    var bases = [[255, 255, 255, 1]];
    for (var i = stack.length - 1; i >= 0; i--) { var next = []; stack[i].list.forEach(function (c) { bases.forEach(function (b) { next.push(over(c, b)); }); }); bases = next; }
    return bases;
  }
  function svgBackgrounds(t) { // text in a diagram sits on the last rect drawn under its centre, else on the page
    var svg = t.ownerSVGElement, box = t.getBBox(), cx = box.x + box.width / 2, cy = box.y + box.height / 2, found = null;
    if (svg) q("rect", svg).forEach(function (r) {
      var x = +r.getAttribute("x") || 0, y = +r.getAttribute("y") || 0, w = parseFloat(r.getAttribute("width")), h = parseFloat(r.getAttribute("height")), f = parseColor(getComputedStyle(r).fill);
      if (f && cx >= x && cx <= x + w && cy >= y && cy <= y + h) found = f;
    });
    return found ? [found] : backgrounds(svg || t);
  }
  function parseColor(c) { var p = parse(c); return p && p[3] > 0 ? p : null; }
  q("body *").forEach(function (el) {
    var own = Array.prototype.some.call(el.childNodes, function (n) { return n.nodeType === 3 && n.nodeValue.trim(); });
    if (!own || /^(SCRIPT|STYLE|PRE)$/.test(el.tagName)) return;
    var s = getComputedStyle(el); if (s.display === "none" || s.visibility === "hidden") return;
    var inSvg = el instanceof SVGElement, fg = parse(inSvg ? s.fill : s.color); if (!fg) return;
    var px = parseFloat(s.fontSize), large = px >= 24 || (px >= 18.66 && +s.fontWeight >= 700), need = large ? 3 : 4.5, worst = 99;
    (inSvg ? svgBackgrounds(el) : backgrounds(el)).forEach(function (b) { worst = Math.min(worst, ratio(over(fg, b), b)); });
    if (worst < need) res.contrast.push(worst.toFixed(2) + " < " + need + ": \"" + txt(el).slice(0, 40) + "\" (" + s.color + ")");
  });
  // the footer lives in a page margin box, outside the DOM: measure the colour it reads
  var root = getComputedStyle(document.documentElement);
  ["--c-muted", "--c-ink", "--c-accent"].forEach(function (name) {   // the style's tokens: the project's value when it set one, else the style's own
    var v = root.getPropertyValue(name).trim(); if (!v) return;
    var probe = document.createElement("span"); probe.style.color = v; document.body.appendChild(probe);
    var c = parse(getComputedStyle(probe).color); document.body.removeChild(probe);
    if (c) { var r = ratio(c, [255, 255, 255, 1]); res.tokens.push(name + " " + r.toFixed(2)); if (r < 4.5) res.contrast.push(r.toFixed(2) + " < 4.5: token " + name + " " + v + " on white"); }
  });

  // ---- figures: a caption each, numbered in order ----
  var figs = q("figure"), refs = txt(document.body);
  figs.forEach(function (f, i) {
    var cap = f.querySelector("figcaption");
    if (!cap || !txt(cap)) { res.figures.push("figure " + (i + 1) + " has no caption"); return; }
    var pre = (getComputedStyle(cap, "::before").content || "").replace(/^["']|["']$/g, ""), typed = txt(cap).match(/^Figure\s+(\d+)/i);
    if (typed) { if (+typed[1] !== i + 1) res.figures.push("figure " + (i + 1) + " is captioned \"Figure " + typed[1] + "\""); }
    else if (!/^Figure\s/.test(pre)) res.figures.push("figure " + (i + 1) + " caption carries no number");
  });
  res.figureCount = figs.length;

  // ---- no frame, rounded corner or shadow on an image or icon ----
  q("img, svg, figure > *").forEach(function (e) {
    if (e.closest("svg") && e.tagName.toLowerCase() !== "svg") return;
    if (/^(FIGCAPTION|P|OL|UL|DIV)$/.test(e.tagName)) return;
    var s = getComputedStyle(e), why = [];
    if (parseFloat(s.borderTopWidth) > 0 && s.borderTopStyle !== "none") why.push("border");
    if (/[1-9]/.test(s.borderTopLeftRadius)) why.push("rounded corners");
    if (s.boxShadow !== "none") why.push("shadow");
    if (why.length) res.frames.push((e.getAttribute("alt") || e.tagName.toLowerCase()).slice(0, 30) + ": " + why.join(", "));
  });

  // ---- no thick accent bar down one side of a box (a generated-looking trope) ----
  q("body *").forEach(function (e) {
    if (/^(SCRIPT|STYLE|IMG|SVG)$/i.test(e.tagName) || e instanceof SVGElement) return;
    var s = getComputedStyle(e), w = parseFloat(s.borderLeftWidth), r = parseFloat(s.borderRightWidth), t = parseFloat(s.borderTopWidth), b = parseFloat(s.borderBottomWidth);
    if (s.borderLeftStyle !== "none" && w >= 2.5 && w > t + 1 && w > b + 1) res.bars.push("a " + w.toFixed(1) + "px side bar on <" + e.tagName.toLowerCase() + (e.className ? " class=" + e.className : "") + ">");
  });

  // ---- tropes: patterns of landing pages and generated documents that real documents do not use (WRITING.md, "Avoid") ----
  q("body *").forEach(function (e) {
    if (/^(SCRIPT|STYLE|PRE)$/i.test(e.tagName) || e instanceof SVGElement) return;
    var s = getComputedStyle(e); if (s.display === "none") return;
    var own = Array.prototype.some.call(e.childNodes, function (n) { return n.nodeType === 3 && n.nodeValue.trim(); });
    var t = txt(e).slice(0, 40), ls = parseFloat(s.letterSpacing);
    var letters = txt(e).replace(/[^A-Za-z]/g, "");
    if (own && ls > 0.3 && (s.textTransform === "uppercase" || (letters.length > 3 && letters === letters.toUpperCase())))
      res.tropes.push("tracked uppercase (an eyebrow or kicker): \"" + t + "\"");
    if (e.matches("header, .titleblock, .cover, .strip, h1") && /[\u00b7\u2022]/.test(e.innerText || e.textContent || "") && !e.parentElement.closest("header, .titleblock, .cover, .strip"))
      res.tropes.push("dot-separated meta line in the header: \"" + txt(e).replace(/^.*?(.{0,20}[\u00b7\u2022].{0,20}).*$/, "$1") + "\"");
    else if (e.tagName === "P" && ((txt(e).match(/ [\u00b7\u2022] /g) || []).length >= 2))
      res.tropes.push("dot-separated meta line: \"" + t + "\"");
    if (e.tagName === "H1" && !e.closest(".cover") && parseFloat(s.fontSize) > 26.7)
      res.tropes.push("hero-sized title (" + (parseFloat(s.fontSize) * 0.75).toFixed(0) + "pt) outside the cover: \"" + t + "\"");
    var rad = Math.max(parseFloat(s.borderTopLeftRadius) || 0, parseFloat(s.borderTopRightRadius) || 0, parseFloat(s.borderBottomRightRadius) || 0, parseFloat(s.borderBottomLeftRadius) || 0);
    var filled = (parse(s.backgroundColor) || [0, 0, 0, 0])[3] > 0, edged = parseFloat(s.borderTopWidth) > 0 && s.borderTopStyle !== "none";
    if (!/^(IMG|FIGURE)$/.test(e.tagName) && rad >= 2.5 && (filled || edged || /[1-9]/.test(s.boxShadow.replace(/none/, ""))))
      res.tropes.push("rounded card or pill (" + rad.toFixed(0) + "px radius)" + (t ? ": \"" + t + "\"" : ""));
    if (s.boxShadow !== "none") res.tropes.push("drop shadow" + (t ? ": \"" + t + "\"" : ""));
    if (/gradient/.test(s.backgroundImage)) res.tropes.push("gradient fill" + (t ? ": \"" + t + "\"" : ""));
  });

  // ---- the words: every block of running text, in order, with the h2 it sits under, for check-prose.py ----
  (function () {
    var sel = "h1,h2,h3,p,li,dt,dd,td,th,figcaption,blockquote", sec = "";
    q(sel).forEach(function (e) {
      if (e.querySelector(sel) || e.closest(".prose-ok, script, style, pre, svg")) return;     // only the innermost block; a quotation marked prose-ok is left alone
      var c = e.cloneNode(true);
      q("pre, code, kbd, samp, math, svg, .file, .prose-ok, script, style", c).forEach(function (n) { n.parentNode.removeChild(n); });
      q("br", c).forEach(function (n) { n.parentNode.replaceChild(document.createTextNode(" "), n); });
      var t = (c.textContent || "").replace(/\s+/g, " ").trim();
      var tag = e.tagName.toLowerCase();
      if (tag === "h2") sec = t;
      if (t) res.prose.push({ tag: tag, sec: sec, text: t });
    });
  })();

  // ---- every ask says what to send or decide, and why ----
  q(".ask").forEach(function (a, i) {
    var w = a.querySelector(".what"), y = a.querySelector(".why");
    if (!w || !txt(w)) res.asks.push("ask " + (i + 1) + " has no .what (what to send or decide)");
    if (!y || !txt(y)) res.asks.push("ask " + (i + 1) + " has no .why (why we need it)");
  });
  res.askCount = q(".ask").length;

  // ---- a company or legal draft (body class "legal"): the review notice leads page 1, and the notary's blanks stay empty ----
  res.isLegal = document.body.classList.contains("legal");
  if (res.isLegal) {
    var notice = document.querySelector(".notice"), title = document.querySelector("h1");
    if (!notice || !/Not legal advice/i.test(txt(notice)) || !/Not executed or notarized/i.test(txt(notice)))
      res.legal.push("no review notice (\"Not legal advice. Not executed or notarized.\") in a .notice box");
    else if (title && (notice.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_PRECEDING))
      res.legal.push("the review notice comes after the title; it leads page 1");
    q(".notary .blank").forEach(function (b) { if (txt(b)) res.legal.push("a notary blank is filled in: \"" + txt(b) + "\""); });
    q(".notary").forEach(function (n) { if (!/TO BE COMPLETED BY THE NOTARY PUBLIC/.test(n.textContent || "")) res.legal.push("a notary frame without \"TO BE COMPLETED BY THE NOTARY PUBLIC\""); });
  }

  // ---- files named for the reader, and claims left marked as unchecked ----
  q(".file:not(.theirs)").forEach(function (f) { res.files.push(txt(f)); });   // .theirs: a file the reader makes or returns, ours to name, not to ship
  res.unverified = q(".unverified").length;

  var out = document.createElement("pre"); out.id = "donna-check"; out.textContent = JSON.stringify(res); document.body.appendChild(out);
})();
