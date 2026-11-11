// donna triages open pull requests, and only drafts: she never comments, closes, merges or pushes.
//
//   node --test test/donna/pr-triage.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const skill = readFileSync("skills/characters/donna/SKILL.md", "utf8");
const doc = readFileSync("docs/characters/donna.md", "utf8");
const file = "skills/characters/donna/secretary/PR-TRIAGE.md";
const triage = existsSync(file) ? readFileSync(file, "utf8") : "";

describe("donna's pull request triage", () => {
  test("the description mentions triage of open pull requests", () => {
    const description = skill.match(/^description: (.*)$/m)[1];
    assert.match(description, /triage of open pull requests/);
  });
  test("the Pick the job table has a row that links secretary/PR-TRIAGE.md", () => {
    const row = skill.split("\n").find((l) => l.includes("(secretary/PR-TRIAGE.md)")) ?? "";
    assert.match(row, /^\| .*pull requests?.* \| \[secretary\/PR-TRIAGE\.md\]\(secretary\/PR-TRIAGE\.md\) \|/i);
  });
  test("the file exists and lists open pull requests with gh pr list", () => {
    assert.ok(triage.length > 0, `${file} is missing`);
    assert.match(triage, /`gh pr list --state open --json number,title,headRefName,updatedAt,isDraft,files`/);
  });
  test("it recommends fold, supersede or keep, each with one line of evidence", () => {
    for (const word of ["fold", "supersede", "keep"]) assert.match(triage, new RegExp(`\\*\\*${word}\\*\\*`), word);
    assert.match(triage, /one line of evidence/);
  });
  test("it drafts the fold body with /suits:pr and the closing comment", () => {
    assert.match(triage, /`\/suits:pr`/);
    assert.match(triage, /Superseded by #N, which carries this change\. Closing unmerged\./);
    assert.match(triage, /draft/i);
  });
  test("it never comments, closes, merges or pushes", () => {
    assert.match(triage, /She never comments, closes, merges or pushes\./);
  });
  test("her docs page lists the job", () => {
    assert.match(doc, /\| [^\n]*pull requests[^\n]*\| \[secretary\/PR-TRIAGE\.md\]/i);
  });
});
