// harvey's SKILL.md keeps what the research found real decision records need (docs/characters/harvey/references.md).
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const skill = readFileSync("skills/characters/harvey/SKILL.md", "utf8");

describe("harvey", () => {
  test("the decision line has every labelled row", () => {
    for (const label of ["Call", "Beat", "Cost", "Budget", "Done when", "Door", "Confidence", "Revisit", "Why", "Agreed by"]) {
      assert.match(skill, new RegExp(`^${label}: `, "m"), `missing "${label}:"`);
    }
  });
  test("a call can be no, and not now needs a trigger", () => {
    assert.match(skill, /^Call: build \| build smaller \| not now \| no$/m);
    assert.match(skill, /Revisit: .*required for not now/);
  });
  test("the status quo is the first alternative", () => {
    assert.match(skill, /status quo first/i);
  });
  test("the budget is a number with a unit and is not extended", () => {
    assert.match(skill, /Budget: a number with a unit/);
    assert.match(skill, /not extended/);
  });
  test("disagreement has a time and is reopened only by new facts", () => {
    assert.match(skill, /within a stated time/);
    assert.match(skill, /Only new facts reopen/);
  });
  test("a finding he did not check is needs more, naming the gap", () => {
    assert.match(skill, /needs more.*what is missing and who fetches it/s);
  });
  test("the exceptions at the close are listed", () => {
    assert.match(skill, /three or more functions/);
  });
  test("he does not sign off everything", () => {
    assert.match(skill, /does not sign off every request/);
    assert.match(skill, /Exceptions only at the close/);
  });
});
