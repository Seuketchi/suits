// the associates' SKILL.md keeps what the research found a build hand-over needs (docs/characters/associates/references.md).
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const skill = readFileSync("skills/characters/associates/SKILL.md", "utf8");
const doc = readFileSync("docs/characters/associates.md", "utf8");
const section = (source, title) => source.split(/^## /m).find((s) => s.startsWith(title)) ?? "";

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
    assert.match(skill, /`checks pass: <command>`/);
    assert.match(skill, /done or partial/);
  });
  test("refactoring is its own commit", () => {
    assert.match(skill, /its own commit after green/);
  });
  test("a sample commit message has a short first line", () => {
    const m = skill.match(/^> (Reject inputs[^\n]*)/m);
    assert.ok(m, "no sample commit");
  });
  test("a builder checks the diff before delivering, for tests, null, stale values, comments and catches", () => {
    assert.match(skill, /11\. \*\*Check your diff before you deliver\.\*\*/);
    assert.match(skill, /has a test that fails without it/);
    assert.match(skill, /null, races and stale values/);
    assert.match(skill, /name no callers/);
    assert.match(skill, /Each catch logs, or says why not/);
  });
  test("every claim is verified against the real system, with the unverified named", () => {
    assert.match(skill, /12\. \*\*Verify every claim\*\*/);
    assert.match(skill, /against the real system, and give the evidence/);
    assert.match(skill, /unverified, and say how to check it/);
  });
  test("a cause raised as a red flag is not fixed until the owner decides, inside rule 2", () => {
    const rule2 = section(skill, "Hard rules").match(/^2\. [^\n]*/m)?.[0] ?? "";
    assert.match(rule2, /raises a cause as a red flag \([^)]*\), nothing is fixed until the owner decides/);
  });
  test("the docs page's working-if section has rules 11 and 12", () => {
    const working = section(doc, "It's working if");
    assert.match(working, /each added branch has a test that fails without it/);
    assert.match(working, /checked against the real system with the evidence given/);
    assert.match(working, /named as unverified with how to check it/);
  });
  test("rule 10 runs the widest check the run allows, and says what did not run and why", () => {
    const rule10 = section(skill, "Hard rules").match(/^10\. [^\n]*/m)?.[0] ?? "";
    assert.match(rule10, /\*\*Run the widest check the run allows,\*\*/);
    assert.match(rule10, /the whole suite when it can finish, otherwise the check the ticket names/);
    assert.match(rule10, /say which command showed what, and what did not run and why/i);
    assert.match(rule10, /a time cap, a shared slot/);
    assert.doesNotMatch(skill, /Run the whole suite, not only the new test/);
  });
  test("line 6 says heavy test runs take turns in one shared slot", () => {
    const intro = skill.split("\n")[5] ?? "";
    assert.match(intro, /up to three in parallel/);
    assert.match(intro, /Heavy test runs \(a whole suite, a test database\) take turns in one shared slot unless the run says otherwise/);
  });
  test("the hand-over says checks pass and not run, not suite passes", () => {
    const hand = section(skill, "Hand over");
    assert.match(hand, /`checks pass: <command>`/);
    assert.match(hand, /`not run: <what, why>`/);
    assert.doesNotMatch(skill, /suite passes/);
  });
  test("the docs page's working-if matches the widest-check hand-over", () => {
    const working = section(doc, "It's working if");
    assert.match(working, /`new test failed before`, `checks pass`, `not run`/);
    assert.match(working, /the widest check the run allows passes/);
    assert.doesNotMatch(working, /suite passes/);
    assert.match(section(doc, "What it does") + section(doc, "Common questions"), /shared slot/);
  });
  test("the hard rules run 1 to 12 in order", () => {
    const nums = [...skill.matchAll(/^(\d+)\. \*\*/gm)].map((m) => Number(m[1]));
    assert.deepEqual(nums, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
});
