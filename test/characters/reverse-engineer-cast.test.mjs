// Who runs reverse-engineer-anything: mike does, with the rights check, and harvey does not.
//
//   node --test test/characters/reverse-engineer-cast.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (f) => readFileSync(f, "utf8");
const section = (source, title) =>
  source.match(new RegExp(`^## ${title}\\s*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"))?.[1] ?? "";
const RE = /reverse-engineer-anything/;

describe("reverse-engineer-anything: mike runs it", () => {
  const mike = () => read("skills/characters/mike/SKILL.md");

  test("its row in When to call stays, and no longer limits it to builds of ours", () => {
    const row = section(mike(), "When to call").split("\n").find((l) => RE.test(l));
    assert.ok(row, "no reverse-engineer-anything row");
    assert.match(row, /shipped build with no source at hand/);
    assert.doesNotMatch(row, /of ours/);
  });

  test("the rights check is his rule: owns, has rights to, or named in the request, else he asks first", () => {
    const rule = section(mike(), "Hard rules").split("\n").find((l) => RE.test(l)) ?? "";
    assert.match(rule, /^9\. \*\*Shipped builds\.\*\*/);
    assert.match(rule, /only on an artifact the owner owns, has rights to, or named in the request/);
    assert.match(rule, /Otherwise he asks first\./);
    assert.doesNotMatch(rule, /harvey/i);
  });

  test("his docs page carries the question", () => {
    const q = section(read("docs/characters/mike.md"), "Common questions");
    assert.match(q, /\*\*When does he run `reverse-engineer-anything`\?\*\*\nOnly on an artifact you own, have rights to, or named in the request\. Otherwise he asks first\./);
  });
});

describe("reverse-engineer-anything: harvey does not", () => {
  test("his skill does not name it", () => {
    assert.doesNotMatch(read("skills/characters/harvey/SKILL.md"), RE);
  });

  test("his docs page does not name it", () => {
    assert.doesNotMatch(read("docs/characters/harvey.md"), RE);
  });

  test("his rule numbering has no gap", () => {
    const rules = section(read("skills/characters/harvey/SKILL.md"), "Hard rules");
    const numbers = [...rules.matchAll(/^(\d+)\. /gm)].map((m) => Number(m[1]));
    assert.deepEqual(numbers, numbers.map((_, i) => i + 1));
  });

  test("no other rule or page still points to rule 6 for it", () => {
    assert.doesNotMatch(read("skills/characters/harvey/SKILL.md"), /rule 6 below/);
  });
});

describe("reverse-engineer-anything: the tool's callers", () => {
  test("lists name mike alone", () => {
    assert.match(read("skills/tools/README.md"), /Called by mike\.$/m);
    assert.match(read("README.md"), /^- `reverse-engineer-anything`: called by mike\.$/m);
  });

  test("its docs page puts the rights check on mike", () => {
    const page = read("docs/tools/reverse-engineer-anything.md");
    assert.doesNotMatch(page, /Harvey/);
    assert.match(page, /Mike runs it[^\n]*(own|rights)/);
  });
});

describe("reverse-engineer-anything: harvey hands it to mike", () => {
  test("his Working with the others table has a harvey to mike row for a shipped artifact", () => {
    const row = section(read("skills/characters/harvey/SKILL.md"), "Working with the others")
      .split("\n")
      .find((l) => /^\| harvey \| mike \|/.test(l));
    assert.ok(row, "no harvey to mike row");
    assert.match(row, /shipped artifact/);
    assert.doesNotMatch(row, RE);
  });
});
