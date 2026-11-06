// The slides tool: donna builds the deck, harvey's pitching sets the structure, and the deck goes through
// the same document checks as her PDFs by being called, not copied.
// The built-deck tests need headless Chrome and poppler; they skip when either is missing.
//
//   node --test test/donna/slides.test.mjs
import { describe, test, before } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, copyFileSync, readFileSync, readdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const tool = resolve("skills/tools/slides");
const donnaDocs = resolve("skills/characters/donna/docs");
const read = (p) => readFileSync(p, "utf8");
const skill = existsSync(join(tool, "SKILL.md")) ? read(join(tool, "SKILL.md")) : "";
const donna = read("skills/characters/donna/SKILL.md");

const have = (cmd) => spawnSync("sh", ["-c", `command -v ${cmd}`]).status === 0;
const ready = (have("google-chrome") || have("chromium") || process.env.CHROME) && have("pdftotext") && have("pdffonts") && have("pdfinfo");
const opts = { skip: ready ? false : "needs Chrome and poppler" };

describe("the slides tool", () => {
  test("it is a tool called slides, for a deck built from a pitch structure", () => {
    assert.match(skill, /^name: slides$/m);
    assert.match(skill, /^description: .*deck/m);
    assert.match(skill, /`\/pitching`/);
  });

  test("the structure is pitching's: the tool names it and does not restate its section table", () => {
    assert.doesNotMatch(skill, /Opening one-liner/);
    assert.doesNotMatch(skill, /Why current solutions fail/);
  });

  test("one point on each slide, and the title says what the slide claims", () => {
    assert.match(skill, /one point/i);
    assert.match(skill, /title (states|says) the claim|claim as (its|the) title/i);
  });

  test("it names the machine-made look to leave out, in its own words", () => {
    for (const w of [/kicker/i, /hero/i, /side bar/i, /card/i, /dot/i, /gradient/i]) assert.match(skill, w);
  });

  test("the prose and layout checks are called from the document checks, never copied", () => {
    assert.match(skill, /same (document )?checks/i);
    const writing = read(join(donnaDocs, "WRITING.md"));
    const all = readdirSync(tool, { recursive: true }).filter((f) => /\.(md|html|css)$/.test(f)).map((f) => read(join(tool, f))).join("\n");
    // sentences and list heads that are donna's own wording must not reappear here
    for (const line of writing.split("\n").filter((l) => l.length > 60)) {
      assert.ok(!all.includes(line.trim()), `copied from WRITING.md: ${line.slice(0, 60)}`);
    }
    assert.doesNotMatch(all, /\]\([^)]*(characters\/|\.\.\/)/, "a link out of the tool's folder");
  });

  test("it names print.sh and check.sh, with the build as print.sh <deck.html> <deck.pdf> and no link into donna's folder", () => {
    const build = skill.split("## Build and check")[1]?.split(/^## /m)[0] ?? "";
    assert.match(build, /`print\.sh <deck\.html> <deck\.pdf>`/);
    assert.match(build, /`check\.sh <deck\.html> <deck\.pdf> --claims claims\.md`/);
    assert.doesNotMatch(skill, /\]\([^)]*donna/);
  });

  test("it keeps a claims ledger, claims.md, and does not copy the ledger format", () => {
    const build = skill.split("## Build and check")[1]?.split(/^## /m)[0] ?? "";
    assert.match(build, /claims ledger[^.\n]*`claims\.md`/);
    assert.doesNotMatch(skill, /\| Claim \| Source/);
  });

  test("the machine-made-look list is a summary and check.sh is the authority", () => {
    const look = skill.split("## Leave out the machine-made look")[1]?.split(/^## /m)[0] ?? "";
    assert.match(look, /This list is a summary; `check\.sh` is the authority on what fails\./);
    const page = read("docs/tools/slides.md");
    const answer = page.split("**Why no icons, cards or gradients?**")[1]?.split("\n\n")[0] ?? "";
    assert.match(answer, /list in the skill is a summary; `check\.sh` is the authority on what fails/i);
  });

  test("it keeps the sources, the build and the speaker notes apart from the PDF", () => {
    assert.match(skill, /notes/i);
    assert.match(skill, /source/i);
    assert.match(skill, /one slide a page|a slide to a page|one page for each slide/i);
  });

  test("the slide numbers, figures and numbers on a slide have a source or are marked unchecked", () => {
    assert.match(skill, /unchecked|unverified/);
  });

  test("the unverified marker is donna's own: a mark element, and ask for structure rather than run harvey's tool", () => {
    assert.match(skill, /<mark class="unverified">/);
    assert.doesNotMatch(skill, /span\.unverified/);
    assert.doesNotMatch(skill, /run `\/pitching`/);
    assert.match(skill, /for a pitch it comes from harvey/);
  });

  test("it leaves donna's secretary files alone", () => {
    const files = readdirSync("skills/characters/donna/secretary").sort();
    assert.deepEqual(files, ["BRIEFING.md", "MEETING-BRIEF.md", "MINUTES.md", "RECORDS.md", "TICKLER.md"]);
  });
});

describe("donna and the slides tool", () => {
  test("the deck is a row in Pick the job, and no longer a file still to come", () => {
    const pick = donna.split("## Pick the job")[1].split("## When to call")[0];
    assert.match(pick, /deck|presentation|slides/i);
    assert.match(pick, /\/slides/);
    assert.doesNotMatch(pick, /Another ability \(a deck/);
  });

  test("/slides is a row in When to call, with a trigger stated as a fact about the task", () => {
    const when = donna.split("## When to call")[1].split("## Voice")[0];
    assert.match(when, /\| `\/slides` \| the task is a (deck|presentation)/);
    assert.match(when, /harvey/);
  });

  test("the hand-off table says harvey passes the pitch structure and donna builds the deck", () => {
    const handoff = donna.split("## Working with harvey")[1].split("\n## ")[0];
    assert.match(handoff, /\| harvey \| donna \|[^|]*pitch structure/);
    assert.match(handoff, /does not (change|rewrite)/i);
  });

  test("a finished deck goes to the owner, and to harvey only when a point will not fit on a slide", () => {
    const handoff = donna.split("## Working with harvey")[1].split("\n## ")[0];
    assert.doesNotMatch(handoff, /harvey, then the owner/);
    assert.match(handoff, /\| donna's finished deck \| the owner \|/);
    assert.match(handoff, /only when a point will not fit/i);
  });

  test("a hard rule keeps the deck to the structure and the owner's facts", () => {
    const hard = donna.split("## Hard rules")[1].split("\n## ")[0];
    assert.match(hard, /deck/i);
    assert.match(hard, /\/slides/);
    assert.match(hard, /traction|number/i);
  });
});

describe("promotion", () => {
  test("plugin.json, the tools README and the docs page list it", () => {
    assert.match(read(".claude-plugin/plugin.json"), /"\.\/skills\/tools\/slides"/);
    assert.match(read("skills/tools/README.md"), /\(\.\/slides\/SKILL\.md\)/);
    const page = read("docs/tools/slides.md");
    for (const h of ["What it does", "When to reach for it", "Common questions", "It's working if"]) {
      assert.match(page, new RegExp(`^## ${h.replace("'", "'")}$`, "m"));
    }
  });

  test("donna's own page says she builds decks", () => {
    assert.match(read("docs/characters/donna.md"), /deck/i);
    assert.match(read("docs/characters/donna.md"), /`\/slides`/);
  });
});

describe("a built deck", opts, () => {
  let dir;
  const build = (name) => {
    const pdf = spawnSync(join(donnaDocs, "scripts/print.sh"), [`${name}.html`, `${name}.pdf`], { cwd: dir, encoding: "utf8" });
    assert.equal(pdf.status, 0, pdf.stderr);
  };
  const check = (name) => {
    const r = spawnSync(join(donnaDocs, "scripts/check.sh"), [`${name}.html`, `${name}.pdf`, "--no-claims"], { cwd: dir, encoding: "utf8" });
    return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
  };

  before(() => {
    dir = mkdtempSync(join(tmpdir(), "slides-"));
    copyFileSync(join(tool, "slides.css"), join(dir, "slides.css"));
    copyFileSync(join(tool, "deck.html"), join(dir, "deck.html"));
  });

  test("the template prints one slide to a page, in landscape 16:9", () => {
    build("deck");
    const slides = (read(join(dir, "deck.html")).match(/<section class="slide/g) || []).length;
    assert.ok(slides >= 5, "the template shows the slide kinds");
    const info = spawnSync("pdfinfo", [join(dir, "deck.pdf")], { encoding: "utf8" }).stdout;
    assert.match(info, new RegExp(`^Pages:\\s+${slides}$`, "m"));
    const [, w, h] = info.match(/Page size:\s+([\d.]+) x ([\d.]+)/);
    assert.ok(Math.abs(w / h - 16 / 9) < 0.01, `page is ${w} x ${h}`);
  });

  test("the template passes the document checks", () => {
    const r = check("deck");
    assert.equal(r.code, 0, r.out);
    assert.match(r.out, /^PASS tropes/m);
    assert.match(r.out, /^PASS contrast/m);
  });

  test("an unverified mark is visible on the slide: a flat highlight that passes contrast", () => {
    const html = read(join(dir, "deck.html"));
    assert.match(html, /<mark class="unverified">/, "the template shows one");
    const css = read(join(dir, "slides.css"));
    assert.match(css, /mark\.unverified\s*\{[^}]*background:/);
    const profile = mkdtempSync(join(tmpdir(), "slides-chrome-"));
    const chrome = process.env.CHROME || ["google-chrome", "chromium"].find(have);
    const probe = join(dir, "probe.html");
    writeFileSync(probe, html.replace("</body>", `<script>var m=document.querySelector("mark.unverified"),s=getComputedStyle(m);
document.body.insertAdjacentHTML("beforeend","<pre id=r>"+JSON.stringify({bg:s.backgroundColor,fg:s.color})+"</pre>")</script></body>`));
    const dom = spawnSync(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", `--user-data-dir=${profile}`, "--virtual-time-budget=2000", "--dump-dom", `file://${probe}`], { encoding: "utf8" }).stdout;
    const got = JSON.parse(dom.match(/<pre id="r">(.*?)<\/pre>/)[1].replace(/&quot;/g, '"'));
    const rgb = (c) => c.match(/\d+/g).slice(0, 3).map(Number);
    const lum = ([r, g, b]) => { const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    assert.notEqual(got.bg, "rgba(0, 0, 0, 0)", "no highlight");
    const [a, b] = [lum(rgb(got.bg)), lum(rgb(got.fg))];
    assert.ok((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5, `contrast of ${got.fg} on ${got.bg}`);
    assert.match(spawnSync("pdftotext", [join(dir, "deck.pdf"), "-"], { encoding: "utf8" }).stdout, /\[00\]/);
  });

  test("speaker notes stay out of the PDF but are read by the prose check", () => {
    const html = read(join(dir, "deck.html"));
    assert.match(html, /<aside class="notes">/);
    const text = spawnSync("pdftotext", [join(dir, "deck.pdf"), "-"], { encoding: "utf8" }).stdout;
    const note = html.match(/<aside class="notes">\s*<p>([^<]{20,}?)<\/p>/)[1];
    assert.ok(!text.replace(/\s+/g, " ").includes(note.slice(0, 30)), "a note is printed on a slide");
    writeFileSync(join(dir, "dirty.html"), html.replace(note, "In today's fast-paced world, we leverage a robust platform."));
    build("dirty");
    const r = check("dirty");
    assert.ok(r.code !== 0 && /^FAIL prose/m.test(r.out), r.out);
  });

  test("a kicker above a slide title fails the same check that fails it in a PDF", () => {
    const html = read(join(dir, "deck.html"));
    const kicker = '<p style="letter-spacing:2px;text-transform:uppercase;font-size:10pt;margin:0">The problem</p>';
    writeFileSync(join(dir, "kicker.html"), html.replace(/<h2>/, `${kicker}<h2>`));
    build("kicker");
    const r = check("kicker");
    assert.ok(r.code !== 0 && /^FAIL tropes/m.test(r.out), r.out);
  });
});
