// donna docs check.sh: each measured rule fails a document that breaks it, and passes one that does not.
// Needs headless Chrome and poppler; skips when either is missing.
//
//   node --test test/donna/check.test.mjs
import { describe, test, before } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, copyFileSync, cpSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const donna = resolve("skills/characters/donna/docs");
const styles = join(donna, "styles");
const have = (cmd) => spawnSync("sh", ["-c", `command -v ${cmd}`]).status === 0;
const ready = (have("google-chrome") || have("chromium") || process.env.CHROME) && have("pdftotext") && have("pdffonts");
const opts = { skip: ready ? false : "needs Chrome and poppler" };

const para = "Press the button and give the code from your authenticator app. The page then tells you what happens next, and you carry on.";
const para2 = "Keep the receipt. Banks ask for it when a transfer goes missing.";
const para3 = "Print two copies and sign both before Friday.";
const GOOD = `<h1>A short test document</h1><h2>First section</h2><p>${para}</p><h3>A detail</h3><p>${para2}</p>
<div class="asks"><div class="ask"><p class="what"><span class="k">Send</span> the signed form.</p><p class="why"><span class="k">Why</span> We cannot start without it.</p></div></div>
<figure><svg width="80" height="40"><rect width="80" height="40" fill="#1f4e79"/></svg><figcaption>A blue box.</figcaption></figure>`;
const LEDGER_OK = "| Claim | Source | Source's words | Status |\n|---|---|---|---|\n| The form is signed | source.txt | the form must be signed | verified |\n";

let dir;
before(() => {
  dir = mkdtempSync(join(tmpdir(), "donna-check-"));
  copyFileSync(join(styles, "letterhead.css"), join(dir, "print.css"));
  copyFileSync(join(styles, "academic.css"), join(dir, "academic.css"));
  copyFileSync(join(styles, "engineering.css"), join(dir, "engineering.css"));
  cpSync(join(styles, "fonts"), join(dir, "fonts"), { recursive: true });
  writeFileSync(join(dir, "source.txt"), "Rule 4: the form must be signed\nbefore it is sent.\n");
  writeFileSync(join(dir, "ok.md"), LEDGER_OK);
  writeFileSync(join(dir, "wrong.md"), LEDGER_OK.replace("the form must be signed", "the form must be stamped"));
  writeFileSync(join(dir, "nosource.md"), LEDGER_OK.replace("| source.txt |", "| |"));
});

let n = 0;
function run(body, extra = ["--claims", "ok.md"], css = "", links = '<link rel="stylesheet" href="print.css">', cls = "") {
  const name = `doc${++n}`;
  writeFileSync(join(dir, `${name}.html`), `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>t</title>
${links}<style>${css}</style></head><body${cls ? ` class="${cls}"` : ""}>${body}</body></html>`);
  const pdf = spawnSync(join(donna, "scripts/print.sh"), [`${name}.html`, `${name}.pdf`], { cwd: dir, encoding: "utf8" });
  assert.equal(pdf.status, 0, pdf.stderr);
  const r = spawnSync(join(donna, "scripts/check.sh"), [`${name}.html`, `${name}.pdf`, ...extra], { cwd: dir, encoding: "utf8" });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
}
const failed = (r, rule) => assert.ok(r.code !== 0 && new RegExp(`^FAIL ${rule}`, "m").test(r.out), `want FAIL ${rule}, got ${r.code}\n${r.out}`);

describe("check.sh", opts, () => {
  test("a clean document passes every check", () => {
    const r = run(GOOD);
    assert.equal(r.code, 0, r.out);
    assert.match(r.out, /^PASS line length/m);
  });

  test("a line longer than 95 characters fails", () => {
    failed(run(`<p style="max-width:none;font-size:8pt">${(para + " ").repeat(3)}</p>`), "line length");
  });

  test("a fourth heading level fails", () => {
    failed(run(`${GOOD}<h4>Too deep</h4><p>${para}</p>`), "headings");
  });

  test("a second h1 fails", () => {
    failed(run(`${GOOD}<h1>Another title</h1>`), "headings");
  });

  test("an all-caps heading fails", () => {
    failed(run(`<h2>THIS HEADING SHOUTS</h2><p>${para}</p>`), "headings");
  });

  test("text under 4.5:1 contrast fails", () => {
    failed(run(`${GOOD}<p style="color:#aaaaaa">${para}</p>`), "contrast");
  });

  test("white text on its own coloured background is measured against it", () => {
    const r = run(`${GOOD}<div style="background:#1f4e79;color:#fff;padding:2mm"><p>${para3}</p></div>`);
    assert.equal(r.code, 0, r.out);
  });

  test("mathematics in MathML prints with an embedded math font and passes", () => {
    const r = run(`${GOOD}<p class="eq"><math display="block"><mi>d</mi><mo>=</mo><msub><mi>v</mi><mn>0</mn></msub><mi>t</mi><mo>+</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><mi>a</mi><msup><mi>t</mi><mn>2</mn></msup></math></p>`);
    assert.equal(r.code, 0, r.out);
    const fonts = spawnSync("pdffonts", [join(dir, `doc${n}.pdf`)], { encoding: "utf8" }).stdout;
    assert.match(fonts, /Math/, fonts);
  });

  test("text in a diagram is measured against the box it sits on", () => {
    const svg = (fill) => `<figure><svg width="200" height="60" viewBox="0 0 200 60"><rect x="0" y="0" width="200" height="60" fill="#456731"/><text x="10" y="35" font-size="14" fill="${fill}">Publish</text></svg><figcaption>A box.</figcaption></figure>`;
    assert.equal(run(`${GOOD}${svg("#ffffff")}`).code, 0);
    failed(run(`${GOOD}${svg("#7a9a66")}`), "contrast");
  });

  test("a figure with no caption fails", () => {
    failed(run(`${GOOD}<figure><svg width="40" height="20"></svg></figure>`), "figures");
  });

  test("a rounded or bordered image fails", () => {
    failed(run(`${GOOD}<figure><img alt="" width="40" height="20" style="border-radius:2mm" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="><figcaption>x</figcaption></figure>`), "image frames");
    failed(run(`${GOOD}<figure><img alt="" width="40" height="20" style="border:1px solid #ccc" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="><figcaption>x</figcaption></figure>`), "image frames");
  });

  test("a thick bar down the side of a box fails", () => {
    failed(run(`${GOOD}<div style="border-left:4pt solid #456731;background:#eef2f6;padding:3mm"><p>${para}</p></div>`), "side bars");
  });

  test("the answer and warning boxes carry no side bar", () => {
    const r = run(`${GOOD}<div class="answer"><p class="label">Before you start</p><p>${para3}</p></div><div class="callout"><p>Bring the original certificate to the counter.</p></div>`);
    assert.equal(r.code, 0, r.out);
  });

  test("a tracked uppercase kicker fails", () => {
    failed(run(`${GOOD}<p class="kicker" style="text-transform:uppercase;letter-spacing:2pt;font-size:9pt">Grade 10 Physics</p>`), "tropes");
    failed(run(`${GOOD}<p style="letter-spacing:2pt;font-size:9pt">GRADE 10 PHYSICS</p>`), "tropes");
  });

  test("plain uppercase, with no letter spacing, passes", () => {
    const r = run(`${GOOD}<p style="text-transform:uppercase;font-size:9pt">Candidate name</p>`);
    assert.equal(r.code, 0, r.out);
  });

  test("a middle-dot meta line fails", () => {
    failed(run(`${GOOD}<p>30 points · Due 3 March · Calculators allowed</p>`), "tropes");
    failed(run(`<header class="titleblock"><h1>Title</h1><p>For Ana · by Ben</p></header>${GOOD}`), "tropes");
  });

  test("a hero-sized title outside the cover fails, and the cover may have one", () => {
    failed(run(`<h1 style="font-size:30pt">A very large title</h1><p>${para}</p>`), "tropes");
    const r = run(`<section class="cover"><div class="cover-band"><h1 class="cover-title">Cover title</h1></div></section><h2>First</h2><p>${para}</p>`, ["--no-claims"]);
    assert.equal(r.code, 0, r.out);
  });

  test("a pill, a card and a shadow fail", () => {
    failed(run(`${GOOD}<span style="border-radius:10px;background:#eef2f6;padding:1mm 3mm">Draft</span>`), "tropes");
    failed(run(`${GOOD}<div style="border-radius:3mm;border:1px solid #ccc;padding:3mm"><p>${para}</p></div>`), "tropes");
    failed(run(`${GOOD}<div style="box-shadow:0 1px 4px #888;padding:3mm"><p>${para}</p></div>`), "tropes");
  });

  test("a gradient fails, on the cover band too", () => {
    failed(run(`<section class="cover"><div class="cover-band" style="background:linear-gradient(135deg,#1b3a63,#456731)"><h1 class="cover-title">Cover title</h1></div></section><h2>First</h2><p>${para}</p>`, ["--no-claims"]), "tropes");
    failed(run(`${GOOD}<div style="background:linear-gradient(90deg,#1f4e79,#456731);color:#fff;padding:3mm"><p>${para}</p></div>`), "tropes");
  });

  test("each of the three styles passes the checks on the same document", () => {
    const links = { letterhead: '<link rel="stylesheet" href="print.css">',
      academic: '<link rel="stylesheet" href="print.css"><link rel="stylesheet" href="academic.css">',
      engineering: '<link rel="stylesheet" href="print.css"><link rel="stylesheet" href="engineering.css">' };
    for (const [style, l] of Object.entries(links)) {
      const r = run(`<header class="lh"><div class="org"><b>Example</b><span>Unit</span></div></header>${GOOD}`, ["--claims", "ok.md"], "", l);
      assert.equal(r.code, 0, `${style}\n${r.out}`);
    }
  });

  test("a project's tokens restyle every style: the measured accent is the brand's", () => {
    writeFileSync(join(dir, "tokens.css"), ":root { --accent: #456731; --ink: #191d16; --muted: #43483e; --line: #c3c8bb; --tint: #eff1ee; }");
    for (const extra of ["", '<link rel="stylesheet" href="academic.css">', '<link rel="stylesheet" href="engineering.css">']) {
      const r = run(GOOD, ["--claims", "ok.md"], "", `<link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="print.css">${extra}`);
      assert.equal(r.code, 0, r.out);
      assert.match(r.out, /--c-accent 6\.49/, "the contrast line reads the brand accent #456731");
    }
  });

  test("a brand accent that is too light for text fails the contrast check", () => {
    writeFileSync(join(dir, "light.css"), ":root { --accent: #9ccf7f; }");
    failed(run(GOOD, ["--claims", "ok.md"], "", '<link rel="stylesheet" href="light.css"><link rel="stylesheet" href="print.css">'), "contrast");
  });

  test("use-style.sh copies the style, its layer and the fonts", () => {
    const out = join(dir, "styled");
    const r = spawnSync(join(donna, "scripts/use-style.sh"), ["engineering", out], { encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
    for (const f of ["print.css", "engineering.css", "fonts/IBMPlexSans-Regular.ttf"]) assert.ok(existsSync(join(out, f)), f);
    assert.equal(spawnSync(join(donna, "scripts/use-style.sh"), ["nope", out], { encoding: "utf8" }).status, 2);
  });

  test("numbered requirements print as R1, R2 and a stable id can replace the counter", () => {
    const r = run(`${GOOD}<ol class="reqs"><li>The node <strong>must</strong> wake every 900 s.</li><li data-id="R10">The node <strong>should</strong> keep unsent readings.</li></ol>`);
    assert.equal(r.code, 0, r.out);
    const text = spawnSync("pdftotext", ["-layout", join(dir, `doc${n}.pdf`), "-"], { encoding: "utf8" }).stdout;
    assert.match(text, /R1\s+The node must wake/);
    assert.match(text, /R10\s+The node should keep/);
  });

  test("a code block prints in an embedded monospace font, wraps inside the margins and passes", () => {
    const code = `{"v":1,"id":"sn-0042","moisture_pct":37.5,"soil_temp_c":21.4,"vbat_mv":3871,"rssi_dbm":-67,"boot":412,"queued":[1,2,3,4,5,6,7,8,9,10]}`;
    const r = run(`${GOOD}<pre><code>${code}</code></pre><p>Set <code>interval_s</code> to 900.</p>`);
    assert.equal(r.code, 0, r.out);
    const fonts = spawnSync("pdffonts", [join(dir, `doc${n}.pdf`)], { encoding: "utf8" }).stdout;
    assert.match(fonts, /Mono/i, fonts);
  });

  test("the state diagram template passes the contrast and caption checks as it is", () => {
    const svg = readFileSync(join(donna, "templates/state.svg"), "utf8").replace(/<\?xml[^>]*\?>\s*/, "");
    const r = run(`${GOOD}<figure>${svg}<figcaption>States of the node.</figcaption></figure>`);
    assert.equal(r.code, 0, r.out);
  });

  describe("prose that sounds machine-written", () => {
    const p = (t) => `<p>${t}</p>`;
    test("a stock opener fails", () => {
      failed(run(`${GOOD}${p("In today's fast-paced world, teams need a clear way to track their work.")}`), "prose");
      failed(run(`${GOOD}${p("It's worth noting that the form must be signed before it is sent.")}`), "prose");
    });
    test("the words delve, seamless, robust and leverage fail", () => {
      for (const w of ["We delve into the form and what it asks.", "The switch is seamless for the reader.", "The checks make the build robust.", "We leverage the reader's own data here."]) failed(run(`${GOOD}${p(w)}`), "prose");
    });
    test("a decorative em dash fails, and a dash alone in an empty table cell does not", () => {
      failed(run(`${GOOD}${p("The form is short \u2014 only four fields \u2014 and quick to fill in.")}`), "prose");
      const r = run(`${GOOD}<table><thead><tr><th>Item</th><th>Value</th></tr></thead><tbody><tr><td>Spare</td><td>\u2014</td></tr></tbody></table>`);
      assert.equal(r.code, 0, r.out);
    });
    test("an exclamation mark in prose fails", () => {
      failed(run(`${GOOD}${p("Press the button and you are done!")}`), "prose");
    });
    test("three rule-of-three lists in one document fail, and one does not", () => {
      const three = "The form is quick, simple, and clear. The page is fast, light, and plain. The code is short, tidy, and tested.";
      failed(run(`${GOOD}${p(three)}`), "prose");
      const r = run(`${GOOD}${p("The form asks for a name, a position and a date.")}`);
      assert.equal(r.code, 0, r.out);
    });
    test("a closing sentence that repeats its section fails", () => {
      failed(run(`<h2>Signing the form</h2>${p("The form must be signed by an officer of level 3 or above. The officer signs on the last page and sends the form back to us. In summary, the form must be signed by an officer of level 3 or above before it is sent back.")}`, ["--no-claims"]), "prose");
      failed(run(`<h2>Signing the form</h2>${p("The form must be signed by an officer of level 3 or above. The officer signs on the last page and sends it back. Overall, signing the form is an important step.")}`, ["--no-claims"]), "prose");
    });
    test("a quoted phrase, code and a prose-ok span are not judged", () => {
      const r = run(`${GOOD}${p("The reviewer wrote &ldquo;this is robust and seamless&rdquo; in the margin.")}${p("Set <code>robust_mode</code> to 1.")}<p class="prose-ok">A robust quotation from the source.</p>`);
      assert.equal(r.code, 0, r.out);
    });
  });

  test("an ask with no reason fails", () => {
    failed(run(`<div class="asks"><div class="ask"><p class="what">Send the signed form.</p></div></div>`), "asks");
  });

  test("an empty page fails", () => {
    failed(run(`<p>${para}</p><div style="break-before:page"></div><div style="break-before:page"></div><p>${para}</p>`), "empty pages");
  });

  test("no claims ledger fails, and --no-claims is the one way past it", () => {
    failed(run(GOOD, []), "claims");
    assert.equal(run(GOOD, ["--no-claims"]).code, 0);
  });

  test("a ledger row whose quote is not in its source fails", () => {
    failed(run(GOOD, ["--claims", "wrong.md"]), "claims");
  });

  test("a ledger row with no source fails", () => {
    failed(run(GOOD, ["--claims", "nosource.md"]), "claims");
  });

  test("an attachment named in the document must exist", () => {
    const body = `${GOOD}<p>Open <span class="file">missing-report.pdf</span>.</p>`;
    failed(run(body, ["--claims", "ok.md", "--files", dir]), "files");
    writeFileSync(join(dir, "present-report.pdf"), "x");
    const r = run(`${GOOD}<p>Open <span class="file">present-report.pdf</span>.</p>`, ["--claims", "ok.md", "--files", dir]);
    assert.equal(r.code, 0, r.out);
  });

  test("add-fields puts a text field over each sign-off blank and a checkbox in each tick row", { skip: have("pdfcraft-cli") ? false : "needs pdfcraft-cli" }, () => {
    const body = `<div class="asks"><div class="ask tick"><p class="what"><span class="k">Send</span> The signed form.</p><p class="why"><span class="k">Why</span> We cannot start without it.</p></div>
<div class="ask tick"><p class="what"><span class="k">Decide</span> The day to switch on.</p><p class="why"><span class="k">Why</span> The freeze starts on the 27th.</p></div>
<div class="ask tick"><p class="what"><span class="k">Name</span> The officer who approves.</p><p class="why"><span class="k">Why</span> Only they know who it is.</p></div></div>
<div class="signoff"><h2>Sign-off</h2><div class="fields"><div class="field"><span class="lbl">Name</span></div><div class="field"><span class="lbl">Position</span></div><div class="field"><span class="lbl">Date</span></div><div class="field"><span class="lbl">Signature</span></div></div></div>`;
    run(body, ["--no-claims"]);
    const r = spawnSync(join(donna, "scripts/add-fields.py"), [`doc${n}.pdf`, "fillable.pdf"], { cwd: dir, encoding: "utf8" });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const info = spawnSync("pdfcraft-cli", ["info", join(dir, "fillable.pdf")], { encoding: "utf8" }).stdout;
    assert.match(info, /"acroform_fields": 7/, info);
  });

  test("add-fields turns handwriting spaces and header fields into fields", { skip: have("pdfcraft-cli") ? false : "needs pdfcraft-cli" }, () => {
    const body = `<div class="fields header-block"><div class="field"><span class="lbl">Name</span></div><div class="field"><span class="lbl">Section</span></div><div class="field"><span class="lbl">Date</span></div><div class="field"><span class="lbl">Score</span></div></div>
<div class="problems"><div class="problem"><span class="points">[4]</span><p>Find the speed.</p><div class="space calc"><span class="lbl">Calculation</span></div><div class="space ans"><span class="lbl">Answer</span></div></div>
<div class="problem"><span class="points">[4]</span><p>Explain why. Answer in a sentence.</p><div class="space explain"><span class="lbl">Explain</span></div></div></div>`;
    run(body, ["--no-claims"]);
    const r = spawnSync(join(donna, "scripts/add-fields.py"), [`doc${n}.pdf`, "spaces.pdf"], { cwd: dir, encoding: "utf8" });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const info = spawnSync("pdfcraft-cli", ["info", join(dir, "spaces.pdf")], { encoding: "utf8" }).stdout;
    assert.match(info, /"acroform_fields": 7/, info);
  });

  // The safety rules of a company or legal draft (LEGAL.md, hard rules 3 and 4).
  const NOTICE = `<div class="notice"><p><strong>Draft for review by the company&rsquo;s counsel. Not legal advice. Not executed or notarized.</strong> Facts, names and amounts to be confirmed by the signers.</p></div>`;
  const FRAME = (blank) => `<div class="notary"><p class="head">TO BE COMPLETED BY THE NOTARY PUBLIC</p><p>BEFORE ME, a Notary Public for and in <span class="blank">${blank}</span>, personally appeared the signer.</p></div>`;
  const LEGAL_BODY = (notice, frame) => `${notice}<h1>Special Power of Attorney</h1><p>${para}</p>${frame}`;

  test("a legal draft with the review notice and an empty notary frame passes", () => {
    const r = run(LEGAL_BODY(NOTICE, FRAME("")), ["--no-claims"], "", undefined, "plain legal");
    assert.equal(r.code, 0, r.out);
    assert.match(r.out, /^PASS legal draft/m);
  });

  test("a legal draft without the review notice fails", () => {
    failed(run(LEGAL_BODY("", FRAME("")), ["--no-claims"], "", undefined, "plain legal"), "legal draft");
  });

  test("a legal draft whose review notice is not above the title fails", () => {
    failed(run(`<h1>Special Power of Attorney</h1>${NOTICE}<p>${para}</p>${FRAME("")}`, ["--no-claims"], "", undefined, "plain legal"), "legal draft");
  });

  test("a notary frame with a blank filled in fails", () => {
    failed(run(LEGAL_BODY(NOTICE, FRAME("Example City")), ["--no-claims"], "", undefined, "plain legal"), "legal draft");
  });

  test("a document that is not a legal draft is not held to the notice", () => {
    assert.equal(run(GOOD).code, 0);
  });

  test("legal.html keeps the review notice and both notary frames empty", () => {
    const html = readFileSync(join(donna, "templates/legal.html"), "utf8").replace(/<!--[\s\S]*?-->/g, "");
    assert.match(html, /<div class="notice">[\s\S]*Not legal advice\. Not executed or notarized\./);
    assert.ok(html.indexOf('class="notice"') < html.indexOf("<h1>"), "the notice comes before the title");
    const frames = html.match(/<div class="notary[^"]*"[\s\S]*?<\/div>/g) ?? [];
    assert.equal(frames.length, 2, "one frame for an acknowledgment, one for a jurat");
    for (const f of frames) assert.match(f, /TO BE COMPLETED BY THE NOTARY PUBLIC/);
    assert.match(frames.join(""), /SUBSCRIBED AND SWORN/);
    assert.match(frames.join(""), /free and voluntary act and deed/);
    const blanks = html.match(/<span class="blank[^"]*">[\s\S]*?<\/span>/g) ?? [];
    assert.ok(blanks.length > 10);
    for (const b of blanks) assert.match(b, /^<span class="blank[^"]*"><\/span>$/, "a notary blank stays empty");
  });
});
