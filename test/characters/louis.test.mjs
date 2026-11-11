// louis's files keep what the research found a review needs (docs/characters/louis/references.md).
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const skill = readFileSync("skills/characters/louis/SKILL.md", "utf8");
const money = readFileSync("skills/tools/money-check/SKILL.md", "utf8");

describe("louis puts the verdict on the first line", () => {
  const handOver = skill.split("## Hand over")[1]?.split("\n## ")[0] ?? "";
  test("the verdict is the first line of every reply, even when a done test is also written", () => {
    assert.match(handOver, /The verdict is the first line of every reply, before a title, a preface or a done test\./);
  });
  test("a done test written in the same reply comes after the verdict", () => {
    assert.match(handOver, /A done test written in the same reply goes after the verdict/);
  });
  test("a finding opens with its prefix line, and file:line comes after it", () => {
    assert.doesNotMatch(handOver, /each finding with its prefix line and `file:line`/);
    const at = handOver.indexOf("each finding opens with its prefix line");
    assert.ok(at >= 0, "the hand-over does not say a finding opens with its prefix line");
    const sentence = handOver.slice(at).split("\n")[0];
    assert.ok(sentence.indexOf("prefix line") < sentence.indexOf("`file:line`"), "file:line is named before the prefix line");
    assert.match(sentence, /, then `file:line`/);
  });
  test("the joint-list row says the axes sit under their own headings, as rule 2 does", () => {
    const row = skill.split("\n").find((l) => l.startsWith("| louis and rachel | donna |")) ?? "";
    assert.match(row, /one consolidated list, the two axes under their own headings/);
    assert.doesNotMatch(skill, /side by side/);
  });
  test("rule 2 keeps the axes under their own headings, not side by side in one list", () => {
    const rule = skill.split("\n").find((l) => /^2\. \*\*Two axes/.test(l)) ?? "";
    assert.match(rule, /under a Standards heading and a Spec heading, each most serious first/);
    assert.doesNotMatch(rule, /side by side/);
  });
  test("the hand-over puts the findings under a Standards heading and a Spec heading, each most serious first", () => {
    assert.match(handOver, /Then the findings, under a Standards heading and a Spec heading, each most serious first; each finding opens with its prefix line \(such as `BLOCKER, verified:`\), then `file:line`\./);
    assert.doesNotMatch(handOver, /findings, most serious first/);
  });
  test("his docs page says the same, in a Common questions entry", () => {
    const docs = readFileSync("docs/characters/louis.md", "utf8");
    const questions = docs.split(/^## Common questions/m)[1]?.split(/^## /m)[0] ?? "";
    assert.match(questions, /verdict[^\n]*first line/i);
  });
});

describe("louis keeps a done test out of a review of a diff (eval louis-one-pass, verdict-and-two-axes)", () => {
  const handOver = skill.split("## Hand over")[1]?.split("\n## ")[0] ?? "";
  const row = skill.split("\n").find((l) => l.startsWith("| A request starts")) ?? "";
  test("a brief that hands over a diff to review gets no done test", () => {
    assert.match(row, /brief that hands over a diff to review is the review itself/);
    assert.match(handOver, /When the brief hands over a diff to review, write no done test/);
  });
  test("a done test that is written goes last, never between the verdict and the Standards heading", () => {
    assert.match(handOver, /goes after the verdict and after the findings, never between them/);
  });
});

describe("louis reviews in one pass", () => {
  const row = skill.split("\n").find((l) => l.startsWith("| `/suits:code-review` | there is a diff")) ?? "";
  test("the code-review row says one pass", () => {
    assert.match(row, /He asks for its one-pass mode/);
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

describe("louis reviews a merge resolution with remerge-diff", () => {
  const row = skill.split("\n").find((l) => l.startsWith("| A merge with resolved conflicts arrives")) ?? "";
  const handOver = skill.split("## Hand over")[1]?.split("\n## ")[0] ?? "";
  const docs = readFileSync("docs/characters/louis.md", "utf8");

  test("the What he does table reads git show --remerge-diff for each conflicted merge, and reads each conflicted file", () => {
    assert.match(row, /`git show --remerge-diff <merge>`/);
    assert.match(row, /for each conflicted merge/);
    assert.match(row, /for each conflicted file names what each side meant and whether the result keeps both/);
    assert.match(row, /\| none \|$/);
  });
  test("the hand-over names the three per-file verdicts with file:line and the commit each side came from", () => {
    assert.match(handOver, /`both kept`/);
    assert.match(handOver, /`ours lost`/);
    assert.match(handOver, /`theirs lost`/);
    assert.match(handOver, /per conflicted file/);
    assert.match(handOver, /commit each side came from/);
  });
  test("a lost side is a BLOCKER that cites the commit it came from", () => {
    assert.match(skill, /A lost side is a `BLOCKER` citing the commit it came from|A lost side is a BLOCKER citing the commit it came from/);
  });
  test("his docs page lists the merge check under It's working if", () => {
    const working = docs.split("## It's working if")[1] ?? "";
    assert.match(working, /merge/i);
    assert.match(working, /remerge-diff/);
    assert.match(working, /both kept|ours lost|theirs lost/);
  });
  test("the merge check still starts no other session", () => {
    assert.doesNotMatch(row, /sub-?agent/i);
    assert.doesNotMatch(handOver, /sub-?agent/i);
  });
});

describe("louis has a read-only version, and his docs page says so", () => {
  const docs = readFileSync("docs/characters/louis.md", "utf8");
  const questions = docs.split(/^## Common questions/m)[1]?.split(/^## /m)[0] ?? "";
  test("a Common questions entry asks whether another session can start a read-only louis", () => {
    assert.match(questions, /\*\*Can another session start a read-only louis\?\*\*/);
  });
  test("the entry says what it cannot do and what it cannot limit, without the word agent", () => {
    const entry = questions.split("**Can another session start a read-only louis?**")[1]?.split(/\n\*\*/)[0] ?? "";
    assert.match(entry, /agents\/louis\.md/);
    assert.match(entry, /edit|write/i);
    assert.match(entry, /no other session/i);
    assert.match(entry, /`Bash`/);
    assert.doesNotMatch(entry, /\bagents?\b(?!\/)/i);
  });
  test("the page keeps its four sections", () => {
    for (const h of ["What it does", "When to reach for it", "Common questions", "It's working if"]) {
      assert.match(docs, new RegExp(`^## ${h}$`, "m"));
    }
  });
});
