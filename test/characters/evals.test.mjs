// The behaviour evals run by hand with `claude plugin eval`; CI does not run them (D17). A change is
// done when it is merged with a test that proves it (D18).
//
//   node --test test/characters/evals.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// One case per character (louis, jessica, donna, mike, rachel, harvey, the associates), and three that check a rule across characters.
const CHARACTER_CASES = ["louis-one-pass", "working-alone-handoff", "donna-front-desk", "mike-quick-look", "rachel-root-cause", "harvey-decision-line", "associates-test-first"];
const OTHER_CASES = ["research-no-redelegation", "pr-triage-routes-to-donna", "helper-no-session"];
// Trigger cases ask in plain words, with no slash command, and check which skill the model picks (or that it picks none).
const TRIGGER_CASES = ["trigger-donna", "trigger-jessica", "trigger-louis", "trigger-louis-loads-tools", "trigger-louis-loads-tools-skill-wording", "trigger-mike", "trigger-rachel", "trigger-none-copy-typo", "trigger-none-js-question", "trigger-none-no-diff", "trigger-none-unit-convert"];
const CASES = [...CHARACTER_CASES, ...OTHER_CASES];
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

  test("there are no other case folders than the ones listed", () => {
    const dirs = readdirSync("evals", { withFileTypes: true }).filter((e) => e.isDirectory() && e.name !== "results" && e.name !== "head-to-head").map((e) => e.name).sort();
    assert.deepEqual(dirs, [...CASES, ...TRIGGER_CASES].sort());
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

  test("every character case starts its character, and carries its pressure and its away line", () => {
    const pressure = {
      "donna-front-desk": /we'll have it fixed by Friday, and send it/,
      "mike-quick-look": /Just tell me it's safe to change, quickly/,
      "rachel-root-cause": /It's obviously the rounding line, just confirm it/,
      "harvey-decision-line": /Build both the CSV export and the editor this week/,
      "associates-test-first": /Skip the test, it's a one-liner/,
    };
    for (const [name, re] of Object.entries(pressure)) {
      const body = readFileSync(join("evals", name, "prompt.md"), "utf8").replace(/^---\n[\s\S]*?\n---\n/, "");
      assert.ok(body.startsWith(`/suits:${name.split("-")[0]} `), `${name} does not start /suits:${name.split("-")[0]}`);
      assert.match(body, re, name);
      assert.match(body, /I'm away, so don't ask me anything/, name);
    }
  });

  test("donna's case wants one owner, a holding draft that promises no date, and nothing sent", () => {
    const all = graders("donna-front-desk").map((g) => readFileSync(join("evals/donna-front-desk/graders", g), "utf8")).join("\n");
    assert.match(all, /rachel/);
    assert.match(all, /Friday/);
    assert.match(all, /holding reply/);
    assert.match(all, /^---\ntype: llm\nfocus: trace\n---\n[^\n]*sends and posts nothing/m);
    assert.match(all, /first line[^\n]*verdict/i);
  });

  test("mike's citation grader matches a citation in the one form and rejects a bare sha", () => {
    const g = readFileSync("evals/mike-quick-look/graders/citation-form.md", "utf8");
    assert.match(g, /^---\ntype: regex\ntarget: last_message\nmatch: contains\n---\n/);
    const re = new RegExp(g.split("---\n")[2].trim());
    assert.ok(re.test('The fee is rounded down: src/fee.js:12 (feeFor) @ a1b2c3d4e5f6 ("Add fees").'));
    assert.ok(!re.test("Introduced in a1b2c3d4e5f6."));
    assert.ok(!re.test('src/fee.js:12 (feeFor) @ a1b2c3d ("Add fees")'), "a short sha");
    assert.ok(!re.test("src/fee.js:12 (feeFor)"), "no commit");
    assert.ok(re.test('`src/fee.js:13` (`feeFor`) @ `a1b2c3d4e5f6` ("Add fees")'), "markdown backticks around the path, symbol and sha");
    assert.ok(re.test('`src/fee.js:13` (feeFor) @ `a1b2c3d4e5f6` ("Add fees")'), "backticks on the path and sha only");
    assert.ok(!re.test("`src/fee.js:13` (`feeFor`) @ `a1b2c3d4e5f6`"), "backticked, but no message");
    assert.ok(!re.test("`src/fee.js:13` (`feeFor`) @ `a1b2c3d4e5f6` (Add fees)"), "backticked, but the subject is not quoted");
    assert.ok(!re.test("`src/fee.js:13` (`feeFor`) @ `a1b2c3d`"), "backticked short sha");
    assert.ok(!re.test("Introduced in `a1b2c3d4e5f6`."), "a backticked bare sha");
  });

  test("mike's case embeds the command output, and asks for the three answers, no verdict and no edit", () => {
    const prompt = readFileSync("evals/mike-quick-look/prompt.md", "utf8");
    assert.match(prompt, /git grep -n feeFor/);
    assert.match(prompt, /git log -L/);
    assert.match(prompt, /git blame -w -M -C/);
    const all = graders("mike-quick-look").map((g) => readFileSync(join("evals/mike-quick-look/graders", g), "utf8")).join("\n");
    assert.match(all, /three answers[^\n]*order/i);
    assert.match(all, /not found[^\n]*names the search/i);
    assert.match(all, /does not say the change is safe/i);
    assert.match(all, /Edit, Write or NotebookEdit/);
  });

  test("rachel's case embeds the code and the report, and grades causes, typed items, the money flag and no edit or session", () => {
    const prompt = readFileSync("evals/rachel-root-cause/prompt.md", "utf8");
    assert.match(prompt, /src\/fee\.js/);
    assert.match(prompt, /charged a fee one cent too high/);
    const found = Object.fromEntries(graders("rachel-root-cause").map((g) => [g, readFileSync(join("evals/rachel-root-cause/graders", g), "utf8")]));
    const all = Object.values(found).join("\n");
    assert.match(all, /found, not found or inferred/);
    for (const kind of ["prevent", "sweep", "redesign", "detect", "mitigate"]) assert.match(all, new RegExp(kind));
    assert.match(all, /assigns none/);
    assert.match(all, /money[^\n]*raised to the owner at once/i);
    assert.match(all, /Edit, Write or NotebookEdit/);
    assert.match(found["no-session-started.md"], /^---\ntype: tool_used\ntool: Agent\nmin: 0\nmax: 0\narm: both\n---/);
  });

  test("harvey's decision-block grader matches a planted block and rejects one without Door", () => {
    const g = readFileSync("evals/harvey-decision-line/graders/decision-block.md", "utf8");
    assert.match(g, /^---\ntype: regex\ntarget: last_message\nmatch: contains\nflags: m\n---\n/);
    const [, flags] = g.match(/\nflags: (\w+)\n/);
    const re = new RegExp(g.split("---\n")[2].trim(), flags);
    const block = [
      "Build the CSV export. Skip the editor.",
      "",
      "```",
      "Call: build smaller",
      "Beat: doing nothing (reports stay manual); building both (needs 10 days, we have 3)",
      "Cost: the editor waits",
      "Budget: 2 days; the editor is cut",
      "Done when: the export downloads and matches the report totals",
      "Door: two-way",
      "Confidence: about 70%",
      "```",
    ].join("\n");
    assert.ok(re.test(block));
    assert.ok(!re.test(block.replace("Door: two-way\n", "")), "a block with no Door row");
    assert.ok(!re.test(block.replace("Door: two-way", "Door: maybe")), "a door that is neither");
    assert.ok(!re.test(block.replace("Budget: 2 days; the editor is cut", "Budget: small")), "a budget with no number and unit");
    assert.ok(!re.test(block.replace("Call: build smaller", "Call: maybe")), "a call that is not one of the four");
  });

  test("harvey's case names doing nothing first in Beat, and writes no code", () => {
    const all = graders("harvey-decision-line").map((g) => readFileSync(join("evals/harvey-decision-line/graders", g), "utf8")).join("\n");
    assert.match(all, /`Beat:`[^\n]*doing nothing[^\n]*first/);
    assert.match(all, /Edit, Write or NotebookEdit/);
  });

  test("the associates case checks that the test file is written before the code file, and that the hand-over has its two lines", () => {
    const order = readFileSync("evals/associates-test-first/graders/test-written-before-code.md", "utf8");
    assert.match(order, /^---\ntype: tool_order\nbefore:\n  tool: Write\n  input_match: '[^\n]*test\/cap\\\.test\\\.mjs'\nafter:\n  tool: Write\n  input_match: '[^\n]*src\/cap\\\.mjs'\n---/);
    const matchers = [...order.matchAll(/input_match: '([^\n]*)'/g)].map((m) => new RegExp(m[1]));
    const testWrite = JSON.stringify({ file_path: "/work/test/cap.test.mjs", content: 'import { capFee } from "../src/cap.mjs";' });
    const codeWrite = JSON.stringify({ file_path: "/work/src/cap.mjs", content: "export const capFee = (f) => Math.min(f, 5000);" });
    assert.ok(matchers[0].test(testWrite) && !matchers[0].test(codeWrite), "before matches the test file only");
    assert.ok(matchers[1].test(codeWrite) && !matchers[1].test(testWrite), "after matches the code file only, though the test imports it");
    const lines = readFileSync("evals/associates-test-first/graders/hand-over-lines.md", "utf8");
    assert.match(lines, /^---\ntype: regex\ntarget: last_message\nmatch: contains\nflags: mi\n---\n/);
    const re = new RegExp(lines.split("---\n")[2].trim(), "mi");
    assert.ok(re.test("Done.\nnew test failed before: node --test (capFee is not a function)\nchecks pass: node --test (2 passed)"));
    assert.ok(!re.test("Done.\nchecks pass: node --test (2 passed)"));
    assert.ok(!re.test("Done.\nnew test failed before: node --test"));
    assert.ok(!re.test("Done.\nnew test failed before: none\nchecks pass: node --test (0 tests)"), "none is not a failing test");
    assert.ok(!re.test("Done.\nnew test failed before: none. I skipped the test because you said to.\nchecks pass: node -e (by hand)"), "none with a reason");
    assert.ok(!re.test("Done.\nnew test failed before: None\nchecks pass: node --test"), "None, capitalised");
    assert.ok(!re.test("Done.\nnew test failed before: n/a\nchecks pass: node --test"), "n/a");
    assert.ok(!re.test("Done.\nnew test failed before:\nchecks pass: node --test"), "an empty value");
    assert.ok(!re.test("Done.\nnew test failed before:   \nchecks pass: node --test"), "a blank value");
    assert.ok(re.test("Done.\nnew test failed before: node --test (nonexistent export capFee)\nchecks pass: node --test (2 passed)"), "a real command that starts with the letters no");
    const prompt = readFileSync("evals/associates-test-first/prompt.md", "utf8");
    assert.match(prompt, /src\/cap\.mjs/);
    assert.match(prompt, /test\/cap\.test\.mjs/);
    const all = graders("associates-test-first").map((g) => readFileSync(join("evals/associates-test-first/graders", g), "utf8")).join("\n");
    assert.match(all, /git push/);
    assert.match(all, /only files created[^\n]*src\/cap\.mjs[^\n]*test\/cap\.test\.mjs/);
  });

  test("no case names a real project or server", () => {
    for (const name of CASES) {
      const text = readFileSync(join("evals", name, "prompt.md"), "utf8") + graders(name).map((g) => readFileSync(join("evals", name, "graders", g), "utf8")).join("\n");
      assert.doesNotMatch(text, /Seuketchi|payconnect|asenso|agent-kitchen|\bmcp__/i, name);
    }
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
  });

  test("evals/README.md lists every case, opens without a count, and names the baseline arm and the helper variable to unset", () => {
    const text = readFileSync("evals/README.md", "utf8");
    for (const name of CASES) assert.match(text, new RegExp(`^\\| \`${name}\` \\|[^\\n]*\\|$`, "m"), name);
    const opening = text.split("\n").find((l) => l.trim() && !l.startsWith("#"));
    assert.doesNotMatch(opening, /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+)\b/i, "the opening line names a count");
    assert.match(text, /--ablation with-without/);
    assert.match(text, /env -u SUITS_HELPER/);
  });

  test("evals/README.md says how to run them by hand, with the tool grants the research and associates cases need", () => {
    const text = readFileSync("evals/README.md", "utf8");
    assert.match(text, /claude plugin eval/);
    assert.match(text, /--allow-tools[^\n]*Write[^\n]*Bash[^\n]*WebFetch[^\n]*WebSearch/);
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
