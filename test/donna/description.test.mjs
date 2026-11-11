// donna's description is what the model reads to decide whether to load her: it opens with the use case.
//
//   node --test test/donna/description.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const description = readFileSync("skills/characters/donna/SKILL.md", "utf8").match(/^description: (.*)$/m)?.[1] ?? "";

describe("donna's description", () => {
  test("opens with the use case, not with who she is", () => {
    assert.match(description, /^Use (for|when) /);
  });
  test("still says she drafts and tracks and never sends, signs or commits for the owner", () => {
    assert.match(description, /never sends, signs or commits on the owner's behalf/);
  });
  test("is no longer than before", () => {
    assert.ok(description.length <= 720, `description is ${description.length} characters`);
  });
});
