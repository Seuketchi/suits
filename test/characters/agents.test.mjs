// The read-only versions of louis, mike and rachel (agents/) can neither change a file nor start
// another session, by their tool lists (ADR 0007), and their `Bash` is held to reading by a hook (ADR 0009).
//
//   node --test test/characters/agents.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { workflowWords } from "./characters.test.mjs";

const root = resolve(".");
const NAMES = ["louis", "mike", "rachel"];
const BANNED = ["Edit", "Write", "NotebookEdit", "MultiEdit", "Agent", "Task"];
const split = (source) => {
  const m = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  return { front: m?.[1] ?? "", body: m?.[2] ?? "" };
};
const field = (front, key) => front.match(new RegExp(`^${key}:\\s*(.*?)\\s*(?:#.*)?$`, "m"))?.[1];

describe("agents", () => {
  test("agents/ holds exactly the three read-only versions", () => {
    assert.deepEqual(existsSync(join(root, "agents")) ? readdirSync(join(root, "agents")).sort() : [], NAMES.map((n) => `${n}.md`));
  });

  for (const name of NAMES) {
    const file = `agents/${name}.md`;
    if (!existsSync(join(root, file))) {
      test(`${file} exists`, () => assert.fail(`${file} is missing`));
      continue;
    }
    const { front, body } = split(readFileSync(join(root, file), "utf8"));

    describe(name, () => {
      test("is named for its file and for a character", () => {
        assert.equal(field(front, "name"), name);
        assert.ok(existsSync(join(root, "skills/characters", name, "SKILL.md")));
      });

      test("says when to start it, read-only and one pass", () => {
        assert.match(field(front, "description") ?? "", /^Use when .*read-only.*one pass/i);
      });

      test("has an allow-list of tools with Read and none that writes or starts a session", () => {
        const tools = (field(front, "tools") ?? "").split(",").map((t) => t.trim()).filter(Boolean);
        assert.ok(tools.length > 0, "tools is missing, which would inherit every tool");
        assert.ok(tools.includes("Read"));
        assert.ok(tools.includes("Skill"));
        assert.deepEqual(tools.filter((t) => BANNED.includes(t) || /^mcp__/.test(t)), []);
        assert.equal(tools.includes("WebFetch"), name === "rachel");
        assert.equal(tools.includes("WebSearch"), name === "rachel");
      });

      test("sets no model", () => assert.equal(field(front, "model"), undefined));

      test("runs its skill and holds its limits", () => {
        assert.ok(body.includes(`/suits:${name}`));
        assert.match(body, /edit nothing/);
        assert.match(body, /start no other session/);
        assert.match(body, /Working alone/);
        assert.match(body, /`Bash`[^\n]*only to read/);
        assert.match(body, /A hook blocks any `Bash` command that writes/);
        assert.match(body, /ADR 0009/);
        assert.doesNotMatch(body, /cannot limit/);
      });

      test("uses none of the workflow words", () => assert.deepEqual(workflowWords(body, file), []));
    });
  }
});
