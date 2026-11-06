// jessica's files keep what the research found a plan and a status need (docs/characters/jessica/references.md).
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const skill = readFileSync("skills/characters/jessica/SKILL.md", "utf8");
const artifacts = readFileSync("skills/characters/jessica/ARTIFACTS.md", "utf8");

describe("jessica", () => {
  test("the four states are defined, and replan is one of them", () => {
    for (const w of ["On track", "At risk", "Blocked", "Replan"]) assert.match(skill, new RegExp(`\\*\\*${w}:\\*\\*`));
  });
  test("every date is labelled and every status says as of", () => {
    assert.match(skill, /baseline, forecast or actual/);
    assert.match(skill, /as of <date>/);
  });
  test("live has named stages", () => {
    assert.match(skill, /merged, build submitted, in review, rolling out at N percent, at 100 percent/);
  });
  test("aged is defined from the date work started", () => {
    assert.match(skill, /today minus the date the ticket moved to in progress/);
    assert.match(skill, /85th percentile/);
    assert.match(skill, /5 working days/);
  });
  test("a status has a decision line and no percent complete", () => {
    assert.match(skill, /Decision needed: <what, by whom, by when>/);
    assert.match(skill, /No percent complete/);
  });
  test("two tickets that share a file need a blocker path", () => {
    assert.match(skill, /share a file need a blocker path/);
  });
  test("nice-to-haves are marked and cut before an extension", () => {
    assert.match(skill, /`~`/);
    assert.match(skill, /nice-to-haves to cut before she asks to extend/);
  });
  test("the risk log has owner, raised and review-by columns", () => {
    assert.match(artifacts, /`owner` \| `status` \| `raised` \| `review-by`/);
  });
  test("the go-live check is capped at 30 lines and lists evidence", () => {
    assert.match(artifacts, /At most 30 lines/);
    assert.match(artifacts, /the evidence, and the result/);
  });
});
