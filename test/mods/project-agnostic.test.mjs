import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { parseRules } from "../../hooks/logic.mjs";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// The files that ship in hooks/. The tests there carry made-up rules of
// their own, so they are not part of what is checked.
const shipped = () =>
  readdirSync(join(repo, "hooks"))
    .filter((name) => !/\.test\.[a-z]+$/.test(name))
    .map((name) => [name, readFileSync(join(repo, "hooks", name), "utf8")]);

// A rule written into code: a "never" or "warn" list with an entry in it, or
// an object that pairs a rule's "match" with a pattern.
export const ownRule = (source) =>
  /["']?(never|warn)["']?\s*:\s*\[\s*[{"'`]/.test(source) || /["']?match["']?\s*:\s*["'`/]/.test(source);

test("hooks/ holds no rule of its own", () => {
  const files = shipped();
  assert.ok(files.length >= 3, "expected hooks.json, register.ts and logic.mjs");
  for (const [name, source] of files) {
    assert.equal(ownRule(source), false, `${name} carries a rule: rules come only from the rules file`);
  }
});

test("the scan catches a rule written into code", () => {
  assert.equal(ownRule('const r = { never: [{ id: "x" }] }'), true);
  assert.equal(ownRule('{ "warn": ["a"] }'), true);
  assert.equal(ownRule('const r = { id: "x", match: "deploy" }'), true);
  assert.equal(ownRule("const none = { never: [], warn: [] }"), false);
});

test("hooks/ names no real project and no orchestrator", () => {
  for (const [name, source] of shipped()) {
    assert.doesNotMatch(source, /KITCHEN_/, `${name} reads a variable of one orchestrator`);
    assert.doesNotMatch(source, /kitchen/i, `${name} names an orchestrator`);
    assert.doesNotMatch(source, /asenso/i, `${name} names a project`);
  }
});

test("the README's rules-file example parses", () => {
  const readme = readFileSync(join(repo, "README.md"), "utf8");
  const mods = readme.split(/^## Mods$/m)[1]?.split(/^## /m)[0];
  assert.ok(mods, "README.md has a Mods section");
  const example = mods.match(/```json\n([\s\S]*?)\n```/)?.[1];
  assert.ok(example, "the Mods section holds a json example");
  const parsed = parseRules(example);
  assert.equal(parsed.status, "ok", parsed.reason);
  assert.ok(parsed.rules.never.length >= 1 && parsed.rules.warn.length >= 1, "the example shows both lists");
});
