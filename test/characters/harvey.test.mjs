// harvey's SKILL.md keeps what the research found real decision records need (docs/characters/harvey/references.md).
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const skill = readFileSync("skills/characters/harvey/SKILL.md", "utf8");
const prep = existsSync("skills/tools/negotiation-prep/SKILL.md") ? readFileSync("skills/tools/negotiation-prep/SKILL.md", "utf8") : "";
const section = (source, title) => source.split(/^## /m).find((s) => s.startsWith(title)) ?? "";

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
  test("a red flag that arrives without mike's check is needs more, and mike fetches it", () => {
    const rule5 = section(skill, "Hard rules").match(/^5\. [^\n]*/m)?.[0] ?? "";
    assert.match(rule5, /A red flag \([^)]*\) that arrives without mike's check is `needs more`, and mike fetches it/);
    assert.match(rule5, /does not redo that check/);
  });
  test("the bug call waits for rachel's cause and mike's check, and is still made before work starts", () => {
    const rule1 = section(skill, "Hard rules").match(/^1\. [^\n]*/m)?.[0] ?? "";
    assert.match(rule1, /the bug call \(whether and how to build the fix for a bug\)/);
    assert.match(rule1, /once rachel's cause and mike's check are in/);
    assert.match(rule1, /before any work starts/);
  });
  test("the exceptions at the close are listed", () => {
    assert.match(skill, /three or more functions/);
  });
  test("he does not sign off everything", () => {
    assert.match(skill, /does not sign off every request/);
    assert.match(skill, /Exceptions only at the close/);
  });

  describe("negotiation prep", () => {
    test("is its own tool with the five rows, and harvey no longer carries them", () => {
      assert.match(prep, /^name: negotiation-prep$/m);
      for (const label of ["Our interests", "Their interests", "Alternatives", "Walk-away", "Authority"]) {
        assert.match(prep, new RegExp(`^${label}: `, "m"), `missing "${label}:"`);
      }
      assert.doesNotMatch(skill, /^## Negotiation/m);
    });
    test("our interests are ranked and the walk-away point carries an objective criterion", () => {
      assert.match(prep, /^Our interests: .*ranked/m);
      assert.match(prep, /^Walk-away: .*objective criterion/m);
    });
    test("the alternatives row names ours and guesses theirs, and never states a false one", () => {
      assert.match(prep, /^Alternatives: .*ours.*(guess|theirs)/m);
      assert.match(prep, /decline to answer or answer truthfully/);
      assert.match(prep, /never invent one/);
    });
    test("anything above his authority goes to the owner", () => {
      assert.match(prep, /^Authority: .*above .*owner/m);
    });
    test("harvey calls it only when a negotiation is the task", () => {
      const rows = section(skill, "When to call");
      assert.match(rows, /^\| `\/negotiation-prep` \| a negotiation .*is the task/m);
    });
    test("the hand-off table and hard rules name it", () => {
      assert.match(section(skill, "Working with the others"), /negotiation-prep/);
      assert.match(section(skill, "Hard rules"), /negotiation-prep.*owner/s);
    });
    test("it is wired in: plugin, bucket README and docs page", () => {
      assert.match(readFileSync(".claude-plugin/plugin.json", "utf8"), /"\.\/skills\/tools\/negotiation-prep"/);
      assert.match(readFileSync("skills/tools/README.md", "utf8"), /\]\(\.\/negotiation-prep\/SKILL\.md\)/);
      const page = readFileSync("docs/tools/negotiation-prep.md", "utf8");
      for (const title of ["What it does", "When to reach for it", "Common questions", "It's working if"]) {
        assert.match(page, new RegExp(`^## ${title}$`, "m"));
      }
    });
  });
});
