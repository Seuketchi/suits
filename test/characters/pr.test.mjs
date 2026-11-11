// The pr tool: the repo's PR template first, no attribution unless asked, and outdated bot comments
// hidden, never deleted.
//
//   node --test test/characters/pr.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const skill = () => readFileSync("skills/tools/pr/SKILL.md", "utf8");
const head = () => skill().match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
const section = (source, title) =>
  source.match(new RegExp(`^## ${title}\\s*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"))?.[1] ?? "";

describe("pr: the repo's template", () => {
  test("looks for the template at the usual paths before it writes a body", () => {
    const text = skill();
    for (const path of [
      ".github/pull_request_template.md",
      ".github/PULL_REQUEST_TEMPLATE.md",
      ".github/PULL_REQUEST_TEMPLATE/",
      "docs/pull_request_template.md",
    ]) {
      assert.ok(text.includes(path), `template path missing: ${path}`);
    }
    const look = text.indexOf("PULL_REQUEST_TEMPLATE");
    const threePart = text.indexOf("three parts");
    assert.ok(look >= 0 && threePart >= 0 && look < threePart, "the template must come before the three-part body");
  });

  test("fills every section of a template, in its order", () => {
    assert.match(skill(), /every section/i);
    assert.match(skill(), /in its order/i);
  });

  test("uses the three-part body only when there is no template", () => {
    assert.match(skill(), /three[- ]part body[^.\n]*only[^.\n]*no (PR )?template|only when there is no template/i);
  });

  test("puts Summary, Evidence and Merge Danger inside the template sections that fit", () => {
    const text = skill();
    assert.match(text, /Summary[\s\S]*Evidence[\s\S]*Merge Danger[^.\n]*(fit|sections? that fit)/i);
  });
});

describe("pr: attribution", () => {
  test("adds no attribution line unless the session's instructions or the owner ask for one", () => {
    assert.match(skill(), /no attribution/i);
    assert.match(skill(), /unless[^.\n]*(session'?s instructions|owner)[^.\n]*ask/i);
  });

  test("writes no attribution line of its own", () => {
    const lines = skill().split("\n");
    const bad = lines.filter((l) => /^\s*(Co-Authored-By:|🤖 Generated with)/.test(l));
    assert.deepEqual(bad, []);
  });
});

describe("pr: outdated bot comments", () => {
  test("hides an outdated bot comment as OUTDATED through minimizeComment", () => {
    const text = skill();
    assert.match(text, /minimizeComment/);
    assert.match(text, /OUTDATED/);
    assert.match(text, /hide/i);
  });

  test("never deletes a comment", () => {
    const text = skill();
    assert.match(text, /never delete/i);
    assert.doesNotMatch(text, /deleteIssueComment|deletePullRequestReviewComment|-X DELETE|--method DELETE/);
  });

  test("the description names bot comments", () => {
    assert.match(head(), /^description: Use when writing a PR body, or tidying a PR's outdated bot comments\.$/m);
  });
});

describe("pr: the three-part body", () => {
  test("keeps the three parts for a repo with no template", () => {
    const body = skill();
    for (const part of ["## Summary", "## Evidence", "## Merge Danger"]) {
      assert.ok(body.includes(part), `missing ${part}`);
    }
    assert.ok(section(body, "Evidence").length > 0);
  });
});
