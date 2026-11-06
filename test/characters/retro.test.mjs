// The retro tool: what it reads, what it writes, who starts it, and how louis offers it.
//
//   node --test test/characters/retro.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const skill = () => readFileSync("skills/tools/retro/SKILL.md", "utf8");
const louis = () => readFileSync("skills/characters/louis/SKILL.md", "utf8");
const louisPage = () => readFileSync("docs/characters/louis.md", "utf8");
const section = (source, title) =>
  source.match(new RegExp(`^## ${title}\\s*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"))?.[1] ?? "";
const at = (source, re) => {
  const i = source.search(re);
  assert.ok(i >= 0, `not found: ${re}`);
  return i;
};

describe("retro: the tool", () => {
  test("is named retro, has a description, and only a person starts it", () => {
    const head = skill().match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
    assert.match(head, /^name: retro$/m);
    assert.match(head, /^description: \S/m);
    assert.match(head, /^disable-model-invocation: true$/m);
  });

  test("reads the logs, then louis's rulings, then transcripts, in that order", () => {
    const steps = section(skill(), "Inputs");
    const log = at(steps, /action log and (the )?decision log/i);
    const rulings = at(steps, /louis's rulings/i);
    const transcripts = at(steps, /transcripts/i);
    assert.ok(log < rulings && rulings < transcripts, "inputs are out of order");
    assert.match(steps, /batch's lines only/i);
    assert.match(steps, /prefix lines/i);
    assert.match(steps, /open BLOCKERs/);
    assert.match(steps, /only for an item the first two flagged/i);
    assert.match(steps, /never a sweep/i);
  });

  test("names the four signals with the place each one is read in the logs", () => {
    const signals = section(skill(), "Signals");
    assert.match(signals, /bounced[^\n]*(logged loops|failed rounds)/i);
    assert.match(signals, /over budget[^\n]*Budget[^\n]*State/i);
    assert.match(signals, /reversed[^\n]*decision block[^\n]*replaces/i);
    assert.match(signals, /missing fields[^\n]*no Budget or Next/i);
  });

  test("says a missing field is unverified because the logs are free text", () => {
    assert.match(section(skill(), "Signals"), /free text[^.]*a missing field can only mean[^.]*no Budget or Next/i);
  });

  test("classes each finding by the five categories and keeps a signal that fits none", () => {
    const body = section(skill(), "Categories");
    for (const c of ["navigation", "automated check", "coding standard", "new skill", "information access"]) {
      assert.match(body, new RegExp(`\\*\\*${c}:?\\*\\*`, "i"), c);
    }
    assert.match(body, /fits none[^.]*process finding[^.]*(donna|jessica)/i);
    assert.match(body, /not dropped/i);
  });

  test("quotes the line or round each finding comes from, and drops one it cannot trace", () => {
    const out = section(skill(), "Output");
    assert.match(out, /quotes the (log )?line or (the )?round it comes from/i);
    assert.match(out, /cannot be traced[^.]*dropped/i);
    assert.match(out, /most serious first/i);
  });

  test("sorts mechanical findings to a check and judgement calls to a review rule for louis", () => {
    const sort = section(skill(), "Sorting");
    assert.match(sort, /mechanical[^\n]*(fixed pattern|banned call|file location)/i);
    assert.match(sort, /proposed check[^\n]*(lint rule|hook|CI job)/i);
    assert.match(sort, /check[^.]*default over (a )?written rule/i);
    assert.match(sort, /judgement[^\n]*proposed review rule for louis/i);
  });

  test("a proposed rule for louis goes to the owner and harvey, and never into his file", () => {
    const sort = section(skill(), "Sorting");
    assert.match(sort, /owner and harvey/i);
    assert.match(sort, /nothing changes until the owner agrees/i);
    assert.doesNotMatch(skill(), /(write|edit|add|append)[^.\n]*skills\/characters\/louis/i);
  });

  test("edits nothing: no existing file, no commit, no push; one new file in the notes directory", () => {
    const out = section(skill(), "Edits nothing");
    assert.match(out, /edits no existing file/i);
    assert.match(out, /no commit/i);
    assert.match(out, /pushes nothing/i);
    assert.match(out, /new file in the notes directory/i);
    assert.match(out, /does not write (that|the) digest/i);
    assert.match(out, /verdict first[^.]*at most three changes[^.]*decisions[^.]*pick/i);
  });

  test("stays out of the background queue and the writing-style step", () => {
    assert.doesNotMatch(skill(), /writing-for-agents/);
    assert.doesNotMatch(skill(), /AUTO\.md|auto\.py|\bqueue\b|SessionEnd/i);
  });

  test("uses none of the words kept out of text meant for others", () => {
    const prose = (s) => s.replace(/`[^`\n]*`/g, "");
    const words = /\b(agents?|cooks?|kitchens?|assistants?|head chefs?|stations?|ticket boards?)\b/i;
    assert.doesNotMatch(prose(skill()), words);
    assert.doesNotMatch(prose(readFileSync("docs/tools/retro.md", "utf8")), words);
  });
});

describe("retro: promoted", () => {
  test("is in the plugin once, between research and reverse-engineer-anything, with no version", () => {
    const raw = readFileSync(".claude-plugin/plugin.json", "utf8");
    const skills = JSON.parse(raw).skills;
    assert.equal(skills.filter((s) => s === "./skills/tools/retro").length, 1);
    const i = skills.indexOf("./skills/tools/retro");
    assert.equal(skills[i - 1], "./skills/tools/research");
    assert.equal(skills[i + 1], "./skills/tools/reverse-engineer-anything");
    assert.equal(JSON.parse(raw).version, undefined);
  });

  test("is listed under User-invoked and not under Model-invoked", () => {
    const readme = readFileSync("skills/tools/README.md", "utf8");
    const user = section(readme, "User-invoked");
    assert.match(user, /^- \*\*\[retro\]\(\.\/retro\/SKILL\.md\)\*\*: /m);
    assert.doesNotMatch(user, /None yet/);
    assert.doesNotMatch(section(readme, "Model-invoked"), /retro\/SKILL\.md/);
  });

  test("has a docs page with the four sections", () => {
    const page = readFileSync("docs/tools/retro.md", "utf8");
    for (const h of ["What it does", "When to reach for it", "Common questions", "It's working if"]) {
      assert.match(page, new RegExp(`^## ${h}$`, "m"));
    }
  });
});

describe("retro: louis offers it and does not call it", () => {
  test("the offer is a row in What he does with no tool, saying he does not run it", () => {
    const row = section(louis(), "What he does")
      .split("\n")
      .find((l) => /retro/i.test(l));
    assert.ok(row, "no retro row in What he does");
    assert.match(row, /^\| A batch closes \|/);
    assert.match(row, /offers the owner/i);
    assert.match(row, /does not run it/i);
    assert.match(row, /\| none \|$/);
  });

  test("When to call has no retro row, and the default is still not to call", () => {
    const when = section(louis(), "When to call");
    assert.doesNotMatch(when, /retro/i);
    assert.match(when, /The default is not to call\./);
  });

  test("the offer is plain prose: no backticked name for the retro skill", () => {
    const names = /`\/(suits:)?retro`/;
    assert.doesNotMatch(louis(), names);
    assert.doesNotMatch(louisPage(), names);
    assert.match(louis(), /the retro skill/);
  });

  test("the owner starts it, and louis would be grading his own rounds if he did", () => {
    const rule = louis().match(/^[^\n]*retro skill[^\n]*$/m)?.[0] ?? "";
    assert.match(louis(), /the owner starts it/i);
    assert.match(louis(), /grading his own rounds/i);
    assert.match(rule, /one line/i);
  });

  test("his docs page names the batch-close offer and checks for it", () => {
    const page = louisPage();
    assert.match(section(page, "When to reach for it") + section(page, "Common questions"), /close of a batch/i);
    assert.match(section(page, "It's working if"), /offers a retro at the close of a batch and never runs it/i);
  });

  test("hard rule 3 is unchanged", () => {
    assert.match(louis(), /3\. \*\*Edit nothing he reviews\.\*\* Findings go back to the author\./);
  });
});
