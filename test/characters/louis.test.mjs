// louis's files keep what the research found a review needs (docs/characters/louis/references.md).
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const skill = readFileSync("skills/characters/louis/SKILL.md", "utf8");
const money = readFileSync("skills/tools/money-check/SKILL.md", "utf8");

describe("louis reviews in one pass", () => {
  const row = skill.split("\n").find((l) => l.startsWith("| `/suits:code-review` | there is a diff")) ?? "";
  test("the code-review row says one pass", () => {
    assert.match(row, /one pass/i);
    assert.doesNotMatch(row, /sub-?agent/i);
  });
  test("rule 7 says one pass and starts no other session", () => {
    const rule = skill.split("\n").find((l) => /^7\. /.test(l)) ?? "";
    assert.match(rule, /\*\*One pass\.\*\*/);
    assert.match(rule, /starts no other session/);
  });
  test("his file names no sub-agent", () => {
    assert.doesNotMatch(skill, /sub-?agents?/i);
  });
});

describe("louis", () => {
  test("a comment starts with one prefix line that carries both rulings", () => {
    assert.match(skill, /`BLOCKER, verified:`/);
    assert.match(skill, /`SHOULD FIX, disputed:`/);
    assert.match(skill, /`SUGGESTION, verified:`/);
  });
  test("a suggestion is never required, and is not never fixed", () => {
    assert.match(skill, /A SUGGESTION is never required/);
    assert.doesNotMatch(skill, /never fixed in the round/);
  });
  test("severity above a suggestion needs a cited rule", () => {
    assert.match(skill, /no rule or spec line is at most a SUGGESTION/);
  });
  test("a pass can carry conditions and says what it certifies", () => {
    assert.match(skill, /`passes with N conditions: <list>`/);
    assert.match(skill, /`Checked:` and `Not checked:`/);
  });
  test("cheap, failed round and disputed are defined", () => {
    assert.match(skill, /"Cheap" means/);
    assert.match(skill, /A failed round\*\* is a round that ends with an open BLOCKER/);
    assert.match(skill, /If one exchange does not settle it, it goes to harvey/);
  });
  test("the done test is a checkable line", () => {
    assert.match(skill, /`Dn: <rule>\. Check: <command or file:line>\. Expect: <value>`/);
  });
  test("the money check has ten items, each with a worked number", () => {
    const rows = money.split("\n").filter((l) => /^\| [a-j] \|/.test(l));
    assert.equal(rows.length, 10);
    for (const r of rows) assert.ok(r.split("|")[3].trim().length > 0, `no worked number: ${r}`);
  });
  test("the numbers check is a tool, and leaves louis's folder", () => {
    assert.ok(!existsSync("skills/characters/louis/MONEY.md"));
    assert.match(money, /^name: money-check$/m);
    assert.match(money, /amounts, fees, limits, rates, rounding, currency or balances/);
    assert.match(money, /Item g is a judgement/);
  });
  test("louis calls it by name, only on a money trigger, and links no file in his folder", () => {
    assert.match(skill, /`\/suits:money-check` \| the diff or spec touches amounts, fees, limits, rates, rounding, currency or balances/);
    assert.match(skill, /A diff with no money in it skips this/);
    assert.doesNotMatch(skill, /MONEY\.md/);
  });
  test("the hand-off table and the hard rules name the tool", () => {
    const handoff = skill.split("## Working with the others")[1];
    assert.match(handoff, /money-check/);
    const hard = skill.split("## Hard rules")[1].split("##")[0];
    assert.match(hard, /\/suits:money-check/);
    assert.match(hard, /which party gains the remainder/);
  });
  test("the tool is promoted: plugin.json, tools README and a docs page", () => {
    assert.match(readFileSync(".claude-plugin/plugin.json", "utf8"), /"\.\/skills\/tools\/money-check"/);
    assert.match(readFileSync("skills/tools/README.md", "utf8"), /\(\.\/money-check\/SKILL\.md\)/);
    const page = readFileSync("docs/tools/money-check.md", "utf8");
    for (const h of ["What it does", "When to reach for it", "Common questions", "It's working if"]) {
      assert.match(page, new RegExp(`^## ${h}$`, "m"));
    }
  });
  test("his docs page points at the tool, not the old file", () => {
    const page = readFileSync("docs/characters/louis.md", "utf8");
    assert.doesNotMatch(page, /MONEY\.md/);
    assert.match(page, /money-check/);
  });
  test("his voice sample is a defect that is real", () => {
    assert.doesNotMatch(skill, /100\.004 (through|passes)/);
  });
});
