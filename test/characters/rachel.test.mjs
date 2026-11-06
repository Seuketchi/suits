// rachel's SKILL.md keeps what the research found a root-cause look needs (docs/characters/rachel/references.md).
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const skill = readFileSync("skills/characters/rachel/SKILL.md", "utf8");

describe("rachel", () => {
  test("she writes causes with a trigger, not one cause", () => {
    assert.match(skill, /\*\*causes\*\*, not "the cause"/);
    assert.match(skill, /the trigger/);
  });
  test("the four questions include why it was not caught earlier", () => {
    for (const q of ["Deeper", "Sideways", "Back up", "Not caught earlier"]) assert.match(skill, new RegExp(`\\*\\*${q}:\\*\\*`));
  });
  test("not found is valid only with the search stated", () => {
    assert.match(skill, /Not found\* is valid only with the search stated/);
  });
  test("a fix is said to be a guardrail or a design change", () => {
    assert.match(skill, /guardrail.*design change/s);
  });
  test("a cause never ends on a person", () => {
    assert.match(skill, /never names a person or "human error"/);
  });
  test("three timestamps and typed items for the owner to assign", () => {
    assert.match(skill, /introduced.*first possible detection.*found/s);
    assert.match(skill, /prevent, sweep, redesign, detect or mitigate/);
    assert.match(skill, /She assigns none/);
  });
  test("she edits nothing", () => {
    assert.match(skill, /\*\*Edit nothing\.\*\*/);
  });
});
