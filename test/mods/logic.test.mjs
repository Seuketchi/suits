import assert from "node:assert/strict";
import test from "node:test";

import { HELPER_DENY, HELPER_PROMPT, HELPER_TOAST, MAX_SUBJECT, NO_FILE_TEXT, decide, characterOf, charactersFrom, describeInput, helperOn, parseRules, rulesReport, searchDirs, statusFor, toastFor, unreadableRules, warnNotes } from "../../hooks/logic.mjs";

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

test("a file that is not a rules file is reported as broken, not thrown", () => {
  for (const text of ["{ nope", "[]", "null", '{"never": {}}', '{"warn": "x"}']) {
    const parsed = parseRules(text);
    assert.equal(parsed.status, "broken", text);
    assert.ok(parsed.reason.length > 0);
  }
});

test("one bad rule drops only that rule; the valid ones stay in force", () => {
  const text = JSON.stringify({
    never: [
      { id: "no-id-why" },
      { id: "bad-regex", why: "w", match: "(" },
      { id: "no-vault", why: "the vault is changed only by its owners", match: "vault/" },
    ],
    warn: [{ id: "bad-tools", why: "w", match: "x", tools: "Bash" }],
  });
  const parsed = parseRules(text);
  assert.equal(parsed.status, "ok");
  assert.deepEqual(parsed.rules.never.map((r) => r.id), ["no-vault"]);
  assert.deepEqual(parsed.rules.warn, []);
  assert.equal(parsed.problems.length, 3);
  assert.match(parsed.problems.join("\n"), /never\[0\].*"why"|never\[0\].*"match"/);
  assert.match(parsed.problems.join("\n"), /never\[1\].*regular expression/);
  assert.match(parsed.problems.join("\n"), /warn\[0\].*tools/);
  assert.equal(decide(parsed.rules, { tool: "Edit", file_path: "/r/vault/a" }).action, "block");
});

test("a valid file has no problems", () => {
  assert.deepEqual(parseRules(FILE).problems, []);
});

test("a match that can run away is a bad rule, and only that rule is dropped", () => {
  for (const match of ["(a+)+$", "(a*)*b", "(x+x+)+y", "((a+)b)+", "(?:a|b+)*c", "(a{2,})+", "(\\w+\\s?)*$"]) {
    const parsed = parseRules(JSON.stringify({ never: [{ id: "slow", why: "w", match }, { id: "ok", why: "w", match: "fine" }] }));
    assert.equal(parsed.status, "ok", match);
    assert.deepEqual(parsed.rules.never.map((r) => r.id), ["ok"], match);
    assert.match(parsed.problems[0], /never\[0\].*(repeat|backtrack|quantif)/i, match);
  }
});

test("ordinary matches are not mistaken for runaway ones", () => {
  for (const match of ["\\b(mvn|gradle)\\b.*\\btest\\b", "(?:https?://)?host", "(abc)+", "[(a+)+]x", "\\(a+\\)+", "(?<name>a|b)c+", "(?=a+)b", "(a)(b)+", "x*(y)"]) {
    const parsed = parseRules(JSON.stringify({ never: [{ id: "r", why: "w", match }] }));
    assert.equal(parsed.rules?.never.length, 1, `${match}: ${parsed.problems}`);
  }
});

test("only the first MAX_SUBJECT characters of the input are tested", () => {
  const r = parseRules(JSON.stringify({ never: [{ id: "tail", why: "w", match: "needle" }] })).rules;
  const hay = "x".repeat(MAX_SUBJECT);
  assert.equal(decide(r, { tool: "Bash", command: `${hay}needle` }).action, "pass");
  assert.equal(decide(r, { tool: "Bash", command: `needle${hay}` }).action, "block");
});

test("an unreadable file is broken, so it is reported and no rule is applied silently", () => {
  const parsed = unreadableRules("EACCES");
  assert.equal(parsed.status, "broken");
  assert.match(parsed.reason, /EACCES/);
  assert.match(rulesReport("/p/.claude/suits-rules.json", parsed), /could not be read/);
});

test("NotebookEdit is matched on its notebook_path", () => {
  assert.equal(describeInput({ tool: "NotebookEdit", notebook_path: "/r/vault/n.ipynb", new_source: "x" }), "/r/vault/n.ipynb");
  const nb = parseRules(JSON.stringify({ never: [{ id: "nb", why: "w", tools: ["NotebookEdit"], match: "vault/" }] })).rules;
  assert.equal(decide(nb, { tool: "NotebookEdit", notebook_path: "/r/vault/n.ipynb" }).action, "block");
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

test("/suits-rules lists the rules that were dropped, and why", () => {
  const parsed = parseRules(JSON.stringify({ never: [{ id: "a" }, { id: "ok", why: "w", match: "m" }] }));
  const text = rulesReport("/p", parsed);
  assert.match(text, /^never\tok\tw\tall\tm$/m);
  assert.match(text, /^ignored\tnever\[0\]/m);
});

test("SUITS_HELPER unset, 0 and 1 give off, off and on", () => {
  assert.equal(helperOn(undefined), false);
  assert.equal(helperOn(""), false);
  assert.equal(helperOn("0"), false);
  assert.equal(helperOn(" 0 "), false);
  assert.equal(helperOn("1"), true);
  assert.equal(helperOn("yes"), true);
});

test("the helper texts say what to do and point at Working alone", () => {
  assert.equal(HELPER_DENY, "This session is a helper: do the work yourself in one pass (Working alone).");
  assert.equal(HELPER_TOAST, "suits blocked a new session: helper mode");
  assert.match(HELPER_PROMPT, /Helper mode is on: follow the Working alone section of the character you are running\./);
});

test("the characters are the folders under skills/characters in plugin.json", () => {
  const manifest = JSON.stringify({
    skills: ["./skills/characters/louis", "./skills/characters/donna", "./skills/tools/tdd"],
  });
  assert.deepEqual(charactersFrom(manifest), ["louis", "donna"]);
  assert.deepEqual(charactersFrom("{ nope"), []);
  assert.deepEqual(charactersFrom("{}"), []);
});

test("the status line names the character, adds helper, and shows helper alone", () => {
  assert.equal(statusFor("louis", false), "louis");
  assert.equal(statusFor("louis", true), "louis · helper");
  assert.equal(statusFor(undefined, true), "helper");
  assert.equal(statusFor(undefined, false), undefined);
});

test("only a skill named suits:<character> is a character", () => {
  const characters = ["louis", "donna"];
  assert.equal(characterOf("suits:louis", characters), "louis");
  assert.equal(characterOf("suits:tdd", characters), undefined);
  assert.equal(characterOf("louis", characters), undefined);
  assert.equal(characterOf("other:louis", characters), undefined);
});
