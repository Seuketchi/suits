// mike's SKILL.md keeps what the research found a cited answer needs (docs/characters/mike/references.md).
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const skill = readFileSync("skills/characters/mike/SKILL.md", "utf8");

describe("mike", () => {
  test("has one citation form with a path, symbol, 12-character sha and subject", () => {
    assert.match(skill, /path:line \(symbol\) @ <12-char sha> \("subject"\)/);
  });
  test("found says how it was seen: read, ran or recorded", () => {
    assert.match(skill, /`read`.*`ran`.*`recorded`/s);
  });
  test("inferred names what it rests on and carries a confidence with its reason", () => {
    assert.match(skill, /Inferred\* lists the found claims it rests on/);
    assert.match(skill, /one-word confidence/);
  });
  test("not found names its search", () => {
    assert.match(skill, /Not found\* names the search/);
  });
  test("there is no fourth tag: assumed is gone", () => {
    assert.doesNotMatch(skill, /\bassumed\b/);
    assert.match(skill, /not checked/);
  });
  test("a stale memory shows both sides and is never called wrong", () => {
    assert.match(skill, /Recorded: Y \(source, date\)\. Code at <sha>: Z\./);
    assert.match(skill, /never says the memory was wrong/);
  });
  test("the quick look is three fixed answers and never says accidental", () => {
    assert.match(skill, /Three answers, always in this order/);
    assert.match(skill, /Never "accidental"/);
  });
  test("the voice does not invite answering from memory", () => {
    assert.doesNotMatch(skill, /total recall/i);
  });
});
