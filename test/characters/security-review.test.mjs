// The security-review tool: it exists, is promoted, louis calls it on a stated trigger, and it writes nothing.
//
//   node --test test/characters/security-review.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";

const path = "skills/tools/security-review/SKILL.md";
const raw = existsSync(path) ? readFileSync(path, "utf8") : "";
const head = raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
const body = raw.slice(raw.indexOf("\n---", 4) + 4);
const louis = readFileSync("skills/characters/louis/SKILL.md", "utf8");
const AREAS = ["files, images and uploads", "Shell, command and remote execution", "Deserialization", "SQL and query building", "Authentication, authorization and session", "Secrets and keys", "Outbound network", "File paths from input", "Dependencies"];

describe("security-review", () => {
  test("the tool exists, is named, and says when to use it and when to skip", () => {
    assert.ok(existsSync(path), `${path} is missing`);
    assert.match(head, /^name: security-review$/m);
    assert.match(head, /Use only when the diff touches untrusted input or a trust boundary\. Skip when it does not\./);
  });

  test("it has a row for each of the nine areas, each with a look-for and an evidence cell", () => {
    const rows = body.split("\n").filter((l) => /^\| [1-9] \|/.test(l));
    assert.equal(rows.length, 9);
    for (const area of AREAS) assert.ok(rows.some((r) => r.includes(area)), `no row for ${area}`);
    for (const r of rows) {
      const cells = r.split("|").map((c) => c.trim());
      assert.ok(cells[3].length > 0 && cells[4].length > 0, `missing look-for or evidence: ${r}`);
    }
  });

  test("findings use the review prefix lines, need a rule, and cite file:line", () => {
    for (const p of ["BLOCKER, verified:", "SHOULD FIX, verified:", "SUGGESTION, verified:"]) assert.ok(body.includes(`\`${p}\``), p);
    assert.match(body, /file:line/);
    assert.match(body, /CWE/);
    assert.match(body, /no rule, spec line or CWE id is at most a SUGGESTION/);
  });

  test("it ends with a Not checked: line and never calls a diff secure", () => {
    assert.match(body, /`Not checked:` line/);
    assert.match(body, /runtime and deployment configuration, infrastructure/);
    assert.match(body, /does not say the diff is secure/);
  });

  test("it carries no write instruction and starts nothing", () => {
    assert.match(body, /read-only/);
    assert.match(body, /runs no exploit, edits nothing, installs nothing and starts no other session/);
    assert.doesNotMatch(raw, /\b(commit|push|git add|git apply|git checkout|npm install|pip install|rm -|sed -i|tee )\b/i);
    assert.doesNotMatch(raw, /\b(Edit|Write|NotebookEdit|MultiEdit)\b/);
    assert.doesNotMatch(raw, /\b(spawn|sub-?agent)/i);
  });

  test("the upload, execution and request rows carry the evidence the review asked for", () => {
    const row = (n) => body.split("\n").find((l) => l.startsWith(`| ${n} |`)) ?? "";
    for (const w of ["width * height", "CWE-190", "CWE-400", "CWE-787", "CWE-125", "Content-Type", "msl:", "SVG", "nosniff", "CWE-79"]) assert.ok(row(1).includes(w), `row 1 lacks ${w}`);
    for (const w of ["executable or command name", "dynamic `import`", "download followed by running", "${{ github.event", "`run:`"]) assert.ok(row(2).includes(w), `row 2 lacks ${w}`);
    assert.match(row(7), /after DNS resolution|resolved address/);
    assert.match(row(7), /every redirect/);
  });

  test("it names no character", () => {
    assert.doesNotMatch(raw, /\b(louis|jessica|harvey|donna|rachel|mike|associates)\b/i);
  });
});

describe("louis calls security-review", () => {
  test("a row in When to call states the trigger and the skip", () => {
    const when = louis.split("## When to call")[1].split("\n## ")[0];
    const row = when.split("\n").find((l) => l.startsWith("| `/suits:security-review`")) ?? "";
    assert.ok(row, "no When to call row");
    assert.match(row, /command execution, deserialization, query building, authentication or authorization, secrets or keys/);
    assert.match(row, /A diff with none of these skips this\./);
  });

  test("the situation table and the hand-off table name it", () => {
    assert.match(louis.split("## What he does")[1].split("##")[0], /\/suits:security-review/);
    assert.match(louis.split("## Working with the others")[1], /security-review/);
  });

  test("his rule counts a CWE id as a source, and security findings go under Standards", () => {
    assert.match(louis, /rule, spec line or CWE id from `\/suits:security-review`/);
    assert.match(louis, /Security findings from `\/suits:security-review` go under the Standards heading/);
  });

  test("his read-only version can run the skill and still has no write tool", () => {
    const tools = readFileSync("agents/louis.md", "utf8").match(/^tools: (.*)$/m)?.[1].split(/,\s*/) ?? [];
    assert.ok(tools.includes("Skill") && tools.includes("Read") && tools.includes("Grep"));
    for (const t of ["Edit", "Write", "NotebookEdit", "MultiEdit", "Agent", "Task"]) assert.ok(!tools.includes(t), t);
  });
});

describe("security-review is promoted", () => {
  test("plugin.json, the tools README, the root README and a docs page list it", () => {
    assert.match(readFileSync(".claude-plugin/plugin.json", "utf8"), /"\.\/skills\/tools\/security-review"/);
    assert.match(readFileSync("skills/tools/README.md", "utf8"), /\(\.\/security-review\/SKILL\.md\)/);
    assert.match(readFileSync("README.md", "utf8"), /^- `security-review`: called by louis\.$/m);
    const page = readFileSync("docs/tools/security-review.md", "utf8");
    for (const h of ["What it does", "When to reach for it", "Common questions", "It's working if"]) assert.match(page, new RegExp(`^## ${h}$`, "m"));
    assert.match(page, /\/suits:security-review/);
    assert.match(readFileSync("docs/characters/louis.md", "utf8"), /security-review/);
  });
});

describe("the security-review eval", () => {
  test("a case with a prompt that starts louis and graders that check the finding and read-only", () => {
    assert.match(readFileSync("evals/louis-security-review/prompt.md", "utf8"), /\/suits:louis/);
    const graders = readdirSync("evals/louis-security-review/graders").filter((f) => f.endsWith(".md"));
    assert.ok(graders.length >= 3);
    const all = graders.map((g) => readFileSync(`evals/louis-security-review/graders/${g}`, "utf8")).join("\n");
    assert.match(all, /Edit|Write/);
    assert.match(all, /CWE-78|command injection/i);
    assert.match(readFileSync("evals/louis-security-review/graders/calls-the-tool.md", "utf8"), /Skill call whose name ends in `security-review`/);
    assert.doesNotMatch(readFileSync("evals/louis-security-review/graders/calls-the-tool.md", "utf8"), /or says/);
    assert.match(readFileSync("evals/louis-one-pass/graders/no-security-review.md", "utf8"), /no Skill call whose name ends in `security-review`/);
    assert.match(all, /Not checked:/);
  });
});
