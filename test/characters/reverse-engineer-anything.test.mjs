// The reverse-engineer-anything entry stays short, and its reference files are reachable from it.
//
//   node --test test/characters/reverse-engineer-anything.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const skillDir = join(root, "skills/tools/reverse-engineer-anything");
const entry = readFileSync(join(skillDir, "SKILL.md"), "utf8");
const refDir = join(skillDir, "references");
const references = readdirSync(refDir).filter((f) => f.endsWith(".md"));

// The rule the owner set for shipped builds; the entry states it itself (Harvey gates on the same rule).
const RIGHTS_CHECK = "Run this only on an artifact the owner owns, has rights to, or named in the request.";

describe("reverse-engineer-anything", () => {
  test("the entry is at most 200 lines", () => {
    const lines = entry.split("\n").length - (entry.endsWith("\n") ? 1 : 0);
    assert.ok(lines <= 200, `SKILL.md is ${lines} lines`);
  });

  test("every reference file is linked from the entry", () => {
    assert.ok(references.length > 0, "no reference files");
    for (const file of references) {
      assert.ok(entry.includes(`references/${file}`), `${file} is not linked from SKILL.md`);
    }
  });

  test("every reference the entry links to exists", () => {
    for (const [, target] of entry.matchAll(/\]\((references\/[^)#\s]+)/g)) {
      assert.ok(existsSync(join(skillDir, target)), `${target} is linked but missing`);
    }
  });

  test("the rights check is in the entry", () => {
    assert.ok(entry.includes(RIGHTS_CHECK), "the rights-check line is not in SKILL.md");
  });
});
