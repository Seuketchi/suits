// louis's description is what the model reads to decide whether to load him: it opens with the
// plain asks people make ("look over this diff", "review before I merge"), not with who he is.
//
//   node --test test/characters/louis-description.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const description = readFileSync("skills/characters/louis/SKILL.md", "utf8").match(/^description: (.*)$/m)?.[1] ?? "";
const lead = description.split(/(?<=\.)\s/)[0];

describe("louis's description", () => {
  test("opens with the use case, not with who he is", () => {
    assert.match(description, /^Use (for|when) /);
  });
  test("leads with the natural asks: review, look over, check before merging", () => {
    for (const ask of [/review/i, /look(ing)? over/i, /before (it|they|I|we) (is |are )?merge/i, /diff|pull request|PR/i]) {
      assert.match(lead, ask);
    }
  });
  test("keeps the skip line and the rest of his role", () => {
    assert.match(description, /Skip (when|for) there is (no|nothing)/);
    assert.match(description, /done test/);
    assert.match(description, /supervises the builders/);
  });
  test("names no project", () => {
    assert.doesNotMatch(description, /suits/i);
  });
  test("is no longer than donna's", () => {
    assert.ok(description.length <= 720, `description is ${description.length} characters`);
  });
});
