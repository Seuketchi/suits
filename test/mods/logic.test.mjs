import assert from "node:assert/strict";
import test from "node:test";

import { NO_FILE_TEXT, decide, parseRules, rulesReport, searchDirs, toastFor, warnNotes } from "../../hooks/logic.mjs";

const FILE = JSON.stringify({
  never: [
    { id: "no-vault", why: "the vault is changed only by its owners", tools: ["Edit", "Write", "Bash"], match: "vault/" },
  ],
  warn: [
    { id: "one-build", why: "two builds at once exhaust the shared box", tools: ["Bash"], match: "\\bbuild\\b" },
  ],
});

const rules = () => {
  const parsed = parseRules(FILE);
  assert.equal(parsed.status, "ok");
  return parsed.rules;
};

test("a valid file parses into its never and warn rules", () => {
  const parsed = parseRules(FILE);
  assert.equal(parsed.status, "ok");
  assert.equal(parsed.rules.never[0].id, "no-vault");
  assert.equal(parsed.rules.warn[0].id, "one-build");
});

test("a file with only one list is valid", () => {
  const parsed = parseRules(JSON.stringify({ warn: [{ id: "a", why: "b", match: "c" }] }));
  assert.equal(parsed.status, "ok");
  assert.deepEqual(parsed.rules.never, []);
});

test("a missing file means no rules", () => {
  assert.deepEqual(parseRules(undefined), { status: "missing" });
});

test("a broken file is reported, not thrown", () => {
  for (const text of ["{ nope", "[]", '{"never": [{"id": "x"}]}', '{"never": [{"id":"x","why":"y","match":"("}]}']) {
    const parsed = parseRules(text);
    assert.equal(parsed.status, "broken", text);
    assert.ok(parsed.reason.length > 0);
  }
});

test("a never match on an Edit path blocks with '<id>: <why>'", () => {
  const d = decide(rules(), { tool: "Edit", file_path: "/repo/vault/a.txt", old_string: "x", new_string: "y" });
  assert.equal(d.action, "block");
  assert.equal(d.message, "no-vault: the vault is changed only by its owners");
});

test("a never match on a Bash command blocks", () => {
  const d = decide(rules(), { tool: "Bash", command: "rm -rf vault/old" });
  assert.equal(d.action, "block");
  assert.equal(d.id, "no-vault");
});

test("a warn match warns with '<id>: <why>'", () => {
  const d = decide(rules(), { tool: "Bash", command: "make build" });
  assert.equal(d.action, "warn");
  assert.equal(d.hits[0].message, "one-build: two builds at once exhaust the shared box");
});

test("no match passes", () => {
  assert.deepEqual(decide(rules(), { tool: "Bash", command: "ls" }), { action: "pass" });
});

test("a never match wins over a warn match", () => {
  const d = decide(rules(), { tool: "Bash", command: "build vault/x" });
  assert.equal(d.action, "block");
});

test("tools narrows the match", () => {
  assert.deepEqual(decide(rules(), { tool: "Read", file_path: "/repo/vault/a.txt" }), { action: "pass" });
  assert.deepEqual(decide(rules(), { tool: "Edit", file_path: "/repo/build" }), { action: "pass" });
});

test("a rule without tools covers every tool, matching other tools' input as JSON", () => {
  const all = parseRules(JSON.stringify({ never: [{ id: "no-secret", why: "w", match: "secret" }] })).rules;
  assert.equal(decide(all, { tool: "Grep", pattern: "secret" }).action, "block");
  assert.equal(decide(all, { tool: "Read", file_path: "/a/secret.txt" }).action, "block");
  assert.equal(decide(all, { tool: "Grep", pattern: "other" }).action, "pass");
});

test("the engine's reserved keys are not part of the input matched", () => {
  const all = parseRules(JSON.stringify({ never: [{ id: "x", why: "w", match: "toolu_01" }] })).rules;
  assert.equal(decide(all, { tool: "Grep", pattern: "a", tool_use_id: "toolu_01" }).action, "pass");
});

test("no rules passes every call", () => {
  assert.deepEqual(decide(undefined, { tool: "Bash", command: "rm -rf /" }), { action: "pass" });
});

test("the search looks from the start directory up to the root", () => {
  assert.deepEqual(searchDirs("/a/b/c"), ["/a/b/c", "/a/b", "/a", "/"]);
  assert.deepEqual(searchDirs("/"), ["/"]);
  assert.deepEqual(searchDirs("/a/b/"), ["/a/b", "/a", "/"]);
});

test("toasts name the rule and what it did", () => {
  const block = decide(rules(), { tool: "Bash", command: "ls vault/" });
  assert.equal(toastFor(block, "Bash"), "suits blocked Bash: no-vault: the vault is changed only by its owners");
  const warn = decide(rules(), { tool: "Bash", command: "make build" });
  assert.equal(toastFor(warn, "Bash"), "suits warning: one-build: two builds at once exhaust the shared box");
  assert.equal(toastFor({ action: "pass" }, "Bash"), undefined);
});

test("a warning is told to the model as one line per rule", () => {
  const warn = decide(rules(), { tool: "Bash", command: "make build" });
  assert.deepEqual(warnNotes(warn), ["suits warning: one-build: two builds at once exhaust the shared box"]);
  assert.deepEqual(warnNotes({ action: "pass" }), []);
});

test("/suits-rules shows the path and one line per rule, or says there is no file", () => {
  const text = rulesReport("/repo/.claude/suits-rules.json", parseRules(FILE));
  assert.match(text, /^\/repo\/\.claude\/suits-rules\.json$/m);
  assert.match(text, /^never\tno-vault\tthe vault is changed only by its owners\tEdit,Write,Bash\tvault\/$/m);
  assert.match(text, /^warn\tone-build\t.*\tBash\t\\bbuild\\b$/m);
  assert.equal(rulesReport(undefined, { status: "missing" }), NO_FILE_TEXT);
  assert.match(NO_FILE_TEXT, /No suits rules file here \(\.claude\/suits-rules\.json\)\. The rule hooks are off\./);
  const broken = rulesReport("/repo/.claude/suits-rules.json", parseRules("{ nope"));
  assert.match(broken, /could not be read/);
  assert.match(broken, /ignored/);
});

test("a rule with no tools is listed as every tool", () => {
  const text = rulesReport("/p", parseRules(JSON.stringify({ warn: [{ id: "a", why: "b", match: "c" }] })));
  assert.match(text, /^warn\ta\tb\tall\tc$/m);
});
