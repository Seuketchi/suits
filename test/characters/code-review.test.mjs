// code-review has a one-pass mode for a session that cannot start another one (ADR 0003).
//
//   node --test test/characters/code-review.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const skill = readFileSync("skills/tools/code-review/SKILL.md", "utf8");
const description = skill.match(/^description: (.*)$/m)[1];
const onePass = skill.match(/^## One pass\s*\n([\s\S]*?)(?=^## |(?![\s\S]))/m)?.[1] ?? "";

describe("code-review: one pass", () => {
  test("the description says it can run in one pass when asked", () => {
    assert.match(description, /one pass/i);
  });
  test("has a One pass section", () => {
    assert.ok(onePass.length > 0, "no ## One pass section");
  });
  test("it is used when asked, or when no other session can be started", () => {
    assert.match(onePass, /asks? for it|when asked/i);
    assert.match(onePass, /no (?:way|other session)|cannot start/i);
  });
  test("it pins the diff from gh pr diff or git show when the branch is not checked out", () => {
    assert.match(onePass, /`gh pr diff <n>`/);
    assert.match(onePass, /`git show <sha>`/);
    assert.match(onePass, /not checked out/i);
  });
  test("it runs Standards, then Spec, itself, each in its own section", () => {
    assert.match(onePass, /Standards[^.\n]*then[^.\n]*Spec/);
    assert.match(onePass, /`## Standards`/);
    assert.match(onePass, /`## Spec`/);
    assert.ok(onePass.indexOf("`## Standards`") < onePass.indexOf("`## Spec`"));
  });
  test("the parallel default stays for a normal session", () => {
    assert.match(skill, /parallel sub-agent/);
    assert.match(skill, /### 4\. Spawn both sub-agents in parallel/);
  });
});
