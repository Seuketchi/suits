// The research and stocktake tools run in a background session, and must never start a second one (D7).
//
//   node --test test/characters/delegation.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(".");
const read = (...p) => readFileSync(join(root, ...p), "utf8");

const NO_RE_DELEGATION = /already a sub-agent.*do the work yourself.*never re-delegate/s;

for (const tool of ["research", "stocktake"]) {
  describe(`/suits:${tool}`, () => {
    test("does the work itself when already a sub-agent, and never re-delegates", () => {
      assert.match(read("skills/tools", tool, "SKILL.md"), NO_RE_DELEGATION);
    });
  });
}
