// donna's front-desk steps: one owner per request, and an unrelated ask is a new request.
//
//   node --test test/donna/front-desk.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const skill = readFileSync("skills/characters/donna/SKILL.md", "utf8");
const doc = readFileSync("docs/characters/donna.md", "utf8");
const section = (source, title) => source.split(/^## /m).find((s) => s.startsWith(title)) ?? "";

describe("donna's front desk", () => {
  test("step 1 says an unrelated ask is a new request with its own owner and its own log line", () => {
    const step1 = section(skill, "At the front desk").match(/^1\. [^\n]*/m)?.[0] ?? "";
    assert.match(step1, /An unrelated ask is a new request, with its own owner and its own log line\./);
  });
  test("the steps still run 1 to 6", () => {
    const nums = [...section(skill, "At the front desk").matchAll(/^(\d+)\. \*\*/gm)].map((m) => Number(m[1]));
    assert.deepEqual(nums, [1, 2, 3, 4, 5, 6]);
  });
  test("her docs page's one-owner bullet carries the same fact", () => {
    const bullet = section(doc, "At the front desk").match(/^- \*\*One owner\.\*\*[^\n]*/m)?.[0] ?? "";
    assert.match(bullet, /unrelated ask is a new request[^\n]*own owner[^\n]*own log line/);
  });
});
