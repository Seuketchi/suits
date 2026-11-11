// harvey advises on the model tier for a job, by tier name only.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const skill = readFileSync("skills/characters/harvey/SKILL.md", "utf8");
const rules = skill.split(/^## /m).find((s) => s.startsWith("Hard rules")) ?? "";
const rule = rules.match(/^\d+\. \*\*Model\.\*\*[^\n]*/m)?.[0] ?? "";

describe("harvey's model advice", () => {
  test("a hard rule recommends the most capable model only when a mistake is costly and the answer is not obvious", () => {
    assert.ok(rule, "no Model rule under Hard rules");
    assert.match(rule, /the most capable model/);
    assert.match(rule, /only when/i);
    assert.match(rule, /costly/);
    assert.match(rule, /not obvious/);
  });
  test("it gives the examples: a design others build on, a risk review before release, a bug that failed twice", () => {
    assert.match(rule, /design others build on/);
    assert.match(rule, /security, money or data-loss review before release/);
    assert.match(rule, /the usual model has failed on twice/);
  });
  test("routine work gets the everyday model, with the reason", () => {
    assert.match(rule, /the everyday model is enough/);
    assert.match(rule, /because/i);
  });
  test("he only advises: the owner decides", () => {
    assert.match(rule, /owner decides/);
  });
  test("it names tiers, never a model id or a vendor's product name", () => {
    assert.doesNotMatch(
      skill,
      /\b(claude|anthropic|openai|gpt|gemini|llama|mistral|opus|sonnet|haiku|fable)\b|\b[a-z]+-\d+(?:[.-]\d+)*\b/i,
    );
  });
});
