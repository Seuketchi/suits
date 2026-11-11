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
  assert.ok(files.length >= 3, "expected hooks.json, register.tsx and logic.mjs");
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

// Every environment access in a source: `$.env.get(...)`, `$.env.set(...)`.
// The mod reads one variable, SUITS_HELPER, and sets none, so no switch of
// any orchestrator reaches it by another name.
export const envAccesses = (source) => [...source.matchAll(/\$\.env\b[^;\n]*/g)].map((m) => m[0].trim());
export const ALLOWED_ENV = '$.env.get("SUITS_HELPER")';
const doubleQuoted = (use) => use.replace(/'/g, '"');
// One entry per `$.env` that is not the allowed read. Counting occurrences
// against allowed reads means a second access on the same line fails too.
export const strayEnv = (source) => {
  const total = (source.match(/\$\.env\b/g) ?? []).length;
  const allowed = doubleQuoted(source).split(ALLOWED_ENV).length - 1;
  return Array.from({ length: total - allowed }, () => "$.env");
};

test("hooks/ source reads SUITS_HELPER and no other variable", () => {
  let reads = 0;
  for (const [name, source] of shipped()) {
    assert.deepEqual(strayEnv(source), [], `${name} touches the environment beyond SUITS_HELPER`);
    reads += envAccesses(source).length;
  }
  assert.ok(reads >= 1, "the helper switch is read");
});

test("the scan catches any other environment access", () => {
  assert.equal(strayEnv('const v = await $.env.get("SOME_NAME")').length, 1);
  assert.equal(strayEnv('await $.env.set("SUITS_HELPER", "1")').length, 1);
  assert.equal(strayEnv("const k = await $.env.get(name)").length, 1);
  assert.equal(strayEnv('const h = await $.env.get("SUITS_HELPER")').length, 0);
  assert.equal(strayEnv("const h = await $.env.get('SUITS_HELPER')").length, 0);
  assert.equal(strayEnv("const environment = 1").length, 0);
});

test("a second access on the same line as the allowed read is caught", () => {
  assert.equal(strayEnv('const a = [await $.env.get("SUITS_HELPER"), await $.env.get("HOME")]').length, 1);
  assert.equal(strayEnv('await $.env.get("SUITS_HELPER") && $.env.set("X", "1")').length, 1);
  assert.equal(strayEnv('await $.env.get("SUITS_HELPER") || await $.env.get("SUITS_HELPER")').length, 0);
});

// The mod writes nothing to disk and keeps no store: it reads files through
// `$.fs.read`, `$.fs.exists`, `$.fs.stat` and `$.fs.list`, and nothing else.
// Any other `$.fs` method, and any `$.store` use, is a write or a kept state.
export const READ_FS = ["read", "exists", "stat", "list"];
const allowedFs = new RegExp(`\\$\\.fs\\.(?:${READ_FS.join("|")})\\(`, "g");
// One entry per `$.fs` or `$.store` access that is not an allowed read. Counting
// occurrences against allowed reads means a write on the same line as a read
// fails too.
export const strayFs = (source) => {
  const fs = (source.match(/\$\.fs\b/g) ?? []).length - (source.match(allowedFs) ?? []).length;
  const store = (source.match(/\$\.store\b/g) ?? []).length;
  return [...Array.from({ length: fs }, () => "$.fs"), ...Array.from({ length: store }, () => "$.store")];
};

test("hooks/ source writes nothing to disk and keeps no store", () => {
  for (const [name, source] of shipped()) {
    assert.deepEqual(strayFs(source), [], `${name} writes to disk or keeps a store: only $.fs reads are allowed`);
  }
});

test("the scan catches a write to disk or a store", () => {
  assert.equal(strayFs("await $.fs.write(p, t)").length, 1);
  assert.equal(strayFs("await $.fs.remove(p)").length, 1);
  assert.equal(strayFs("await $.store.set(k, v)").length, 1);
  assert.equal(strayFs("await $.fs.read(p); await $.fs.write(p, t)").length, 1);
  assert.equal(strayFs("await $.fs.mkdir(p)").length, 1);
});

test("the scan passes the allowed reads", () => {
  assert.equal(strayFs("await $.fs.read(p)").length, 0);
  assert.equal(strayFs("await $.fs.exists(p)").length, 0);
  assert.equal(strayFs("await $.fs.stat(p)").length, 0);
  assert.equal(strayFs("await $.fs.list(p)").length, 0);
  assert.equal(strayFs("const files = await $.fs.list(p); await $.fs.read(files[0])").length, 0);
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
