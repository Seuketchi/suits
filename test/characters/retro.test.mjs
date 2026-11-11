// The retro tool: what it reads, what it writes, who starts it, and how jessica offers it.
//
//   node --test test/characters/retro.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const skill = () => readFileSync("skills/tools/retro/SKILL.md", "utf8");
const louis = () => readFileSync("skills/characters/louis/SKILL.md", "utf8");
const louisPage = () => readFileSync("docs/characters/louis.md", "utf8");
const jessica = () => readFileSync("skills/characters/jessica/SKILL.md", "utf8");
const jessicaPage = () => readFileSync("docs/characters/jessica.md", "utf8");
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
    const log = at(steps, /action log[^\n]*decision log/i);
    const rulings = at(steps, /louis's rulings/i);
    const transcripts = at(steps, /transcripts/i);
    assert.ok(log < rulings && rulings < transcripts, "inputs are out of order");
    assert.match(steps, /batch's entries only/i);
    assert.match(steps, /run's board when there was no action log/i);
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

  test("classes each finding by a category and keeps a signal that fits none", () => {
    const body = section(skill(), "Categories");
    for (const c of [
      "navigation",
      "automated check",
      "coding standard",
      "new skill",
      "information access",
      "tool economy",
      "steering files",
      "no-ops",
    ]) {
      assert.match(body, new RegExp(`\\*\\*${c}:?\\*\\*`, "i"), c);
    }
    assert.match(body, /fits none[^.]*process finding[^.]*(donna|jessica)/i);
    assert.match(body, /not dropped/i);
  });

  test("notes that review, not implementation, enforces the coding standards", () => {
    assert.match(section(skill(), "Categories"), /review[^.]*enforces[^.]*coding standards[^.]*not implementation/i);
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

  test("a proposed rule for louis goes to the owner and harvey, and nothing changes until the owner agrees", () => {
    const sort = section(skill(), "Sorting");
    assert.match(sort, /owner and harvey/i);
    assert.match(sort, /nothing changes until the owner agrees/i);
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

  test("names its findings file and the one directory it may create", () => {
    const out = section(skill(), "Edits nothing");
    assert.match(out, /`notes\/retro-<batch>\.md`/);
    assert.match(out, /when the notes directory is missing, it is the one directory the tool may create/i);
    const page = readFileSync("docs/tools/retro.md", "utf8");
    assert.match(section(page, "What it does"), /`notes\/retro-<batch>\.md`/);
    assert.match(section(page, "What it does"), /notes directory is missing[^.]*creates that directory and nothing else/i);
    assert.match(section(page, "It's working if"), /`notes\/retro-<batch>\.md`[^\n]*notes directory[^\n]*created[^\n]*no other file changes/i);
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

describe("retro: jessica offers it and does not call it", () => {
  test("the offer is a row in What she does with no tool, saying she does not run it", () => {
    const row = section(jessica(), "What she does")
      .split("\n")
      .find((l) => /retro/i.test(l));
    assert.ok(row, "no retro row in What she does");
    assert.match(row, /^\| A batch closes \|/);
    assert.match(row, /offers the owner/i);
    assert.match(row, /does not run it/i);
    assert.match(row, /\| none \|$/);
  });

  test("When to call has no retro row, and the default is still not to call", () => {
    const when = section(jessica(), "When to call");
    assert.doesNotMatch(when, /retro/i);
    assert.match(when, /The default is not to call\./);
  });

  test("the offer is plain prose: no backticked name for the retro skill", () => {
    const names = /`\/(suits:)?retro`/;
    assert.doesNotMatch(jessica(), names);
    assert.doesNotMatch(jessicaPage(), names);
    assert.match(jessica(), /the retro skill/);
  });

  test("the owner starts it, and the offer is one line", () => {
    const rule = jessica().match(/^[^\n]*retro skill[^\n]*$/m)?.[0] ?? "";
    assert.match(jessica(), /the owner starts it/i);
    assert.match(rule, /one line/i);
  });

  test("her docs page names the batch-close offer and checks for it", () => {
    const page = jessicaPage();
    assert.match(section(page, "When to reach for it") + section(page, "Common questions"), /close of a batch/i);
    assert.match(section(page, "It's working if"), /offers a retro at the close of a batch and never runs it/i);
  });

  test("a rule the retro proposes for any character, jessica included, goes through the owner and harvey", () => {
    const body = section(jessica(), "The retro offer");
    assert.match(body, /any rule the retro proposes for a character, jessica included, goes through the owner and harvey, never straight into that character's file/i);
    assert.doesNotMatch(body, /for louis/i);
    assert.match(section(jessicaPage(), "Common questions"), /rule for any character, jessica included[^.]*goes to you and harvey, not into that character's file/i);
  });

  test("a rule for louis the retro proposes still goes to the owner and harvey, and the retro pages say jessica offers it", () => {
    assert.match(skill(), /Jessica may offer it when a batch closes/);
    assert.doesNotMatch(skill(), /Louis may offer it/);
    const page = readFileSync("docs/tools/retro.md", "utf8");
    assert.match(page, /Jessica offers it when a batch closes but does not run it/);
    assert.doesNotMatch(page, /Louis offers it/);
    assert.match(section(page, "Common questions"), /Why can't jessica run it\?/);
    assert.match(section(page, "Common questions"), /proposed rule for louis goes to you and harvey/);
  });
});

describe("retro: louis no longer offers it", () => {
  test("his skill and his page do not mention the retro", () => {
    assert.doesNotMatch(louis(), /retro/i);
    assert.doesNotMatch(louisPage(), /retro/i);
  });

  test("hard rule 3 is unchanged", () => {
    assert.match(louis(), /3\. \*\*Edit nothing he reviews\.\*\* Findings go back to the author\./);
  });
});
