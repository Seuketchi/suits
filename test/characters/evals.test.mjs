// The behaviour evals run by hand with `claude plugin eval`; CI does not run them (D17). A change is
// done when it is merged with a test that proves it (D18).
//
//   node --test test/characters/evals.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const CASES = ["louis-one-pass", "working-alone-handoff", "research-no-redelegation", "pr-triage-routes-to-donna"];
const graders = (name) => (existsSync(join("evals", name, "graders")) ? readdirSync(join("evals", name, "graders")).filter((f) => f.endsWith(".md")) : []);

describe("evals", () => {
  for (const name of CASES) {
    describe(name, () => {
      test("has a prompt with frontmatter, and the prompt starts a skill of this plugin or asks the owner's question", () => {
        const file = join("evals", name, "prompt.md");
        assert.ok(existsSync(file), `${file} is missing`);
        const prompt = readFileSync(file, "utf8");
        assert.match(prompt, /^---\n[\s\S]*?\bmax_turns: \d+[\s\S]*?\n---\n/);
        assert.ok(prompt.replace(/^---\n[\s\S]*?\n---\n/, "").trim().length > 40, "the prompt is empty");
      });

      test("has at least one grader, each with a type", () => {
        const found = graders(name);
        assert.ok(found.length > 0, `evals/${name}/graders has no grader`);
        for (const g of found) assert.match(readFileSync(join("evals", name, "graders", g), "utf8"), /^---\ntype: (?:llm|regex|file_exists|tool_used|tool_order)\n/, g);
      });
    });
  }

  test("there are no other case folders than the four", () => {
    const dirs = readdirSync("evals", { withFileTypes: true }).filter((e) => e.isDirectory() && e.name !== "results").map((e) => e.name).sort();
    assert.deepEqual(dirs, [...CASES].sort());
  });

  test("louis's case keeps him read-only and in one pass", () => {
    const text = readFileSync("evals/louis-one-pass/prompt.md", "utf8");
    assert.match(text, /\/suits:louis/);
    const all = graders("louis-one-pass").map((g) => readFileSync(join("evals/louis-one-pass/graders", g), "utf8")).join("\n");
    assert.match(all, /Edit|Write/);
    assert.match(all, /Agent/);
  });

  test("the working-alone case checks that the hand-off is a message", () => {
    const all = graders("working-alone-handoff").map((g) => readFileSync(join("evals/working-alone-handoff/graders", g), "utf8")).join("\n");
    assert.match(readFileSync("evals/working-alone-handoff/prompt.md", "utf8"), /work alone/);
    assert.match(all, /message/i);
  });

  test("the research case starts the tool and checks nothing is re-delegated", () => {
    assert.match(readFileSync("evals/research-no-redelegation/prompt.md", "utf8"), /\/suits:research/);
    const all = graders("research-no-redelegation").map((g) => readFileSync(join("evals/research-no-redelegation/graders", g), "utf8")).join("\n");
    assert.match(all, /Agent/);
  });

  test("the triage case routes to donna and fails on any comment, close, merge or push", () => {
    const all = graders("pr-triage-routes-to-donna").map((g) => readFileSync(join("evals/pr-triage-routes-to-donna/graders", g), "utf8")).join("\n");
    assert.match(all, /tool: Skill/);
    assert.match(all, /donna/);
    assert.match(all, /gh pr \(?comment/);
    assert.match(all, /git push/);
  });

  test("CI does not run the evals", () => {
    for (const f of readdirSync(".github/workflows")) assert.doesNotMatch(readFileSync(join(".github/workflows", f), "utf8"), /plugin eval/, f);
  });

  test("results are not committed", () => {
    assert.match(readFileSync(".gitignore", "utf8"), /^evals\/results\/$/m);
  });

  test("CLAUDE.md says the evals are run by hand, and what done means", () => {
    const claude = readFileSync("CLAUDE.md", "utf8");
    assert.match(claude, /Run `claude plugin eval` by hand after changing a skill's behaviour; CI does not run it\./);
    assert.match(claude, /A change is done when it is merged with a test that proves it\./);
  });
});
