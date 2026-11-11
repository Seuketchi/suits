// The behaviour evals run by hand with `claude plugin eval`; CI does not run them (D17). A change is
// done when it is merged with a test that proves it (D18).
//
//   node --test test/characters/evals.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const CASES = ["louis-one-pass", "working-alone-handoff", "research-no-redelegation", "pr-triage-routes-to-donna", "helper-no-session"];
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

  test("there are no other case folders than the five", () => {
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

  test("the helper case is a helper told to review in parallel, and checks that no session starts", () => {
    const prompt = readFileSync("evals/helper-no-session/prompt.md", "utf8");
    assert.match(prompt, /^---\nmax_turns: \d+\ntimeout_seconds: \d+\nallowed_tools: \[Skill, Agent,[^\]]*\]\n---\n\/suits:louis /);
    assert.match(prompt, /in parallel/);
    const found = graders("helper-no-session").map((g) => readFileSync(join("evals/helper-no-session/graders", g), "utf8"));
    assert.ok(found.length >= 2, "a grader for the trace and one for the message");
    assert.ok(found.some((t) => /^---\ntype: llm\nfocus: trace\n---/.test(t) && /Agent/.test(t) && /helper/i.test(t)), "no trace grader on the Agent tool");
    assert.ok(found.some((t) => /^---\ntype: llm\nfocus: last_message\n---/.test(t)), "no grader on the final message");
  });

  test("every case sets the same prompt keys, all of them documented by plugin eval", () => {
    for (const name of CASES) {
      const front = readFileSync(join("evals", name, "prompt.md"), "utf8").match(/^---\n([\s\S]*?)\n---/)[1];
      for (const key of front.split("\n").map((l) => l.split(":")[0])) assert.ok(["max_turns", "timeout_seconds", "allowed_tools"].includes(key), `${name}: ${key}`);
    }
  });

  test("evals/README.md lists the helper case, and says it needs SUITS_HELPER=1", () => {
    const text = readFileSync("evals/README.md", "utf8");
    assert.match(text, /^\| `helper-no-session` \|[^\n]*\|$/m);
    assert.match(text, /SUITS_HELPER=1/);
    assert.match(text, /Five cases/);
  });

  test("evals/README.md says how to run them by hand, with the tool grants two cases need", () => {
    const text = readFileSync("evals/README.md", "utf8");
    assert.match(text, /claude plugin eval/);
    assert.match(text, /--allow-tools[^\n]*Write[^\n]*WebFetch[^\n]*WebSearch/);
    assert.match(text, /not a gate/i);
  });

  test("the working-alone case does not claim code the run cannot see", () => {
    const text = readFileSync("evals/working-alone-handoff/prompt.md", "utf8");
    assert.match(text, /not (?:available|checked out)[^\n]*assum/i);
  });

  test("no case names a real person", () => {
    for (const name of CASES) {
      const text = readFileSync(join("evals", name, "prompt.md"), "utf8") + graders(name).map((g) => readFileSync(join("evals", name, "graders", g), "utf8")).join("\n");
      assert.doesNotMatch(text, /Tristan/, name);
    }
  });

  test("the triage case gives the list, does not waive the fetch, and checks that no pull request is invented", () => {
    const prompt = readFileSync("evals/pr-triage-routes-to-donna/prompt.md", "utf8");
    assert.doesNotMatch(prompt, /don't need to fetch|do not need to fetch/i);
    assert.match(prompt, /no network access/i);
    const found = graders("pr-triage-routes-to-donna").map((g) => readFileSync(join("evals/pr-triage-routes-to-donna/graders", g), "utf8")).filter((t) => /invent/i.test(t));
    assert.equal(found.length, 1, "no grader checks that the list given is the one used");
    assert.match(found[0], /^---\ntype: llm\nfocus: (?:trace|last_message)\n---/);
    for (const n of ["#41", "#44", "#52", "#58"]) assert.match(found[0], new RegExp(n));
  });

  test("the working-alone case reads the tickets from the whole message with a regex, not a judge that sees only its start", () => {
    const g = readFileSync("evals/working-alone-handoff/graders/tickets-carry-blockers-and-files.md", "utf8");
    assert.match(g, /^---\ntype: regex\ntarget: last_message\nmatch: contains\n---\n/);
    const pattern = g.split("---\n")[2].trim();
    const re = new RegExp(pattern);
    assert.ok(re.test("T1 CSV writer. Blocked by: none. Owns: src/report/csv.js (assumed)"));
    assert.ok(re.test("T1 CSV writer. Depends on: nothing. Files: src/report/csv.js (assumed)"));
    assert.ok(!re.test("A plan with no tickets in it."));
    assert.ok(!re.test("T1 CSV writer. Blocked by: nothing."), "blockers without files");
  });

  test("the triage judge is given the list, so it can check that none was invented", () => {
    const g = readFileSync("evals/pr-triage-routes-to-donna/graders/uses-the-list-given.md", "utf8");
    for (const file of ["src/fee.js", "test/fee.test.js", "src/caps.js", "test/caps.test.js", "src/round.js", "README.md"]) assert.match(g, new RegExp(file.replace(/\./g, "\\.")), file);
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

  test("those two sentences are their own paragraph, directly after the one about the lists", () => {
    const paragraphs = readFileSync("CLAUDE.md", "utf8").split(/\n\n+/);
    const at = paragraphs.findIndex((p) => p.startsWith("A change is done when it is merged with a test that proves it."));
    assert.ok(at > 0, "no paragraph starts with the done rule");
    assert.equal(paragraphs[at], "A change is done when it is merged with a test that proves it. Run `claude plugin eval` by hand after changing a skill's behaviour; CI does not run it.");
    assert.match(paragraphs[at - 1], /^After adding, moving or renaming a skill/);
    assert.doesNotMatch(paragraphs[at - 1], /A change is done|claude plugin eval/);
  });
});
