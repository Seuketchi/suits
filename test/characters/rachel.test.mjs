// rachel's SKILL.md keeps what the research found a root-cause look needs (docs/characters/rachel/references.md).
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const skill = readFileSync("skills/characters/rachel/SKILL.md", "utf8");
const audit = readFileSync("skills/tools/root-cause-audit/SKILL.md", "utf8");
const auditDoc = readFileSync("docs/tools/root-cause-audit.md", "utf8");
const section = (source, title) => source.split(/^## /m).find((s) => s.startsWith(title)) ?? "";

describe("rachel", () => {
  test("her SKILL.md does not keep a copy of the audit method", () => {
    assert.doesNotMatch(skill, /four questions/i);
    assert.doesNotMatch(skill, /Not caught earlier/);
    assert.doesNotMatch(skill, /^## The look at a bug/m);
    assert.doesNotMatch(skill, /^\d\. \*\*(Deeper|Sideways|Back up):\*\*/m);
  });
  test("on a bug she calls the audit; the table says so in one line", () => {
    assert.match(section(skill, "What she does"), /bug.*`\/root-cause-audit`/);
    assert.match(section(skill, "What she does"), /writes the trigger and the causes \|/);
  });
  test("she keeps mike's check of her framing and the /rabbit-hole offer", () => {
    assert.match(skill, /Mike checks her framing/);
    assert.match(skill, /offers the owner a `\/rabbit-hole`/);
  });
  test("a red flag is the list of cases she tells the owner at once, and it goes to harvey with mike's check", () => {
    const rule4 = section(skill, "Hard rules").match(/^4\. [^\n]*/m)?.[0] ?? "";
    assert.match(rule4, /design flaw[^\n]*silent for a long time\. Each of these is a red flag\./);
    assert.match(rule4, /a red flag goes to him with mike's check of its facts/);
    assert.match(rule4, /Nothing is fixed until the owner decides\./);
  });
  test("her docs page says a red flag goes to harvey with mike's check", () => {
    const doc = readFileSync("docs/characters/rachel.md", "utf8");
    assert.match(doc, /red flag[^\n]*mike's check/);
  });
  test("her hand-over keeps typed items for the owner and she assigns none", () => {
    assert.match(skill, /prevent, sweep, redesign, detect or mitigate/);
    assert.match(skill, /She assigns none/);
  });
  test("her docs page says three directions, not four questions", () => {
    const doc = readFileSync("docs/characters/rachel.md", "utf8");
    assert.doesNotMatch(doc, /four questions/i);
    assert.match(section(doc, "It's working if"), /three directions/);
  });
  test("she edits nothing", () => {
    assert.match(skill, /\*\*Edit nothing\.\*\*/);
  });

  test("she calls the root-cause audit only when the task is a bug", () => {
    const when = section(skill, "When to call");
    assert.match(when, /\| `\/root-cause-audit` \| the task is a bug/);
    assert.match(section(skill, "What she does"), /`\/root-cause-audit`/);
  });
  test("the hand-off table has the audit's inputs and its decision route", () => {
    const table = section(skill, "Working with the others");
    assert.match(table, /fix diff/);
    assert.match(table, /rachel \| harvey \|/);
  });
  test("a hard rule keeps the audit read-only and calls it by name", () => {
    assert.match(section(skill, "Hard rules"), /`\/root-cause-audit`.*(edits no code|edits nothing|read-only)/s);
  });
});

describe("root-cause-audit", () => {
  test("it is a model-invoked skill named for its folder", () => {
    assert.match(audit, /^---\nname: root-cause-audit\ndescription: .+\n---/);
    assert.doesNotMatch(audit, /disable-model-invocation/);
  });
  test("it reads the fix diff and what mike hands her, and edits no code", () => {
    assert.match(audit, /fix diff/);
    assert.match(audit, /mike/i);
    assert.match(audit, /Edit no code|edits no code|Read only/);
  });
  test("it looks in three fixed directions, each with a heading", () => {
    for (const d of ["Deeper", "Sideways", "Back up"]) assert.match(audit, new RegExp(`^### ${d}\\b`, "m"));
  });
  test("each finding is tagged found, not found or inferred", () => {
    assert.match(audit, /found, not found or inferred/);
  });
  test("not found needs a searched: line, inferred needs a to confirm: clause", () => {
    assert.match(audit, /`searched:`/);
    assert.match(audit, /`to confirm:`/);
  });
  test("it returns open questions and what to check next", () => {
    assert.match(audit, /Open questions/);
    assert.match(audit, /Check next/);
  });
  test("a finding that needs a decision goes to harvey", () => {
    assert.match(audit, /harvey/);
    assert.match(audit, /design flaw.*scope.*money.*rule/s);
  });
  test("it tells the guardrail from the design change", () => {
    assert.match(audit, /guardrail.*design change/s);
  });
  test("a cause never names a person", () => {
    assert.match(audit, /never names a person or "human error"/);
  });
  test("a thread outside the bug is offered as a /rabbit-hole, not followed", () => {
    assert.match(audit, /`\/rabbit-hole`/);
  });
  test("causes, plural, with a trigger and three timestamps", () => {
    assert.match(audit, /\*\*Causes\*\*, plural/);
    assert.match(audit, /\*\*Trigger:\*\*/);
    assert.match(audit, /introduced.*first possible detection.*found/s);
  });
  test("what would have noticed it earlier is asked under Deeper", () => {
    assert.match(section(audit.replace(/^### /gm, "## "), "Deeper"), /would have noticed it earlier/);
  });
  test("typed items for the owner to assign, and the audit assigns none", () => {
    assert.match(audit, /prevent, sweep, redesign, detect or mitigate/);
    assert.match(audit, /the audit assigns none/);
  });
  test("its docs page has the four sections", () => {
    for (const t of ["What it does", "When to reach for it", "Common questions", "It's working if"]) assert.match(auditDoc, new RegExp(`^## ${t}$`, "m"));
  });
  test("it is shipped: plugin.json and the tools README list it", () => {
    assert.match(readFileSync(".claude-plugin/plugin.json", "utf8"), /"\.\/skills\/tools\/root-cause-audit"/);
    assert.match(readFileSync("skills/tools/README.md", "utf8"), /\]\(\.\/root-cause-audit\/SKILL\.md\)/);
  });
});
