// the associates' SKILL.md keeps what the research found a build hand-over needs (docs/characters/associates/references.md).
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const skill = readFileSync("skills/characters/associates/SKILL.md", "utf8");

describe("associates", () => {
  test("test-first is grounded in seeing the test fail, not in the order", () => {
    assert.match(skill, /See the test fail, one test at a time/);
    assert.match(skill, /no claim is made that it does/);
  });
  test("a fix counts as failed when the cause is still there", () => {
    assert.match(skill, /test is green but the cause is still there/);
  });
  test("three failed fixes is the owner's rule and says what harvey receives", () => {
    assert.match(skill, /owner's own rule, and no source gives the number/);
    assert.match(skill, /one command that goes red.*ranked hypotheses/s);
  });
  test("shared files go back to jessica", () => {
    assert.match(skill, /Lockfiles, manifests and indexes belong to no associate/);
  });
  test("never push, and why", () => {
    assert.match(skill, /\*\*Never push\.\*\* Integrating is another person's step/);
  });
  test("the commit states problem, cause, change and check, with a 72-character first line", () => {
    assert.match(skill, /problem, the cause.*the one change, and how it was checked/s);
    assert.match(skill, /72 characters or fewer/);
  });
  test("the hand-over has the two command lines and says done or partial", () => {
    assert.match(skill, /`new test failed before: <command>`/);
    assert.match(skill, /`suite passes: <command>`/);
    assert.match(skill, /done or partial/);
  });
  test("refactoring is its own commit", () => {
    assert.match(skill, /its own commit after green/);
  });
  test("a sample commit message has a short first line", () => {
    const m = skill.match(/^> (Reject inputs[^\n]*)/m);
    assert.ok(m, "no sample commit");
  });
});
