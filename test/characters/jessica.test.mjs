// jessica's files keep what the research found a plan and a status need (docs/characters/jessica/references.md).
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (p) => readFileSync(p, "utf8");
const skill = read("skills/characters/jessica/SKILL.md");
const TOOLS = ["raid-log", "critical-path", "status-report", "go-live-check"];
const tool = (name) => (existsSync(`skills/tools/${name}/SKILL.md`) ? read(`skills/tools/${name}/SKILL.md`) : "");
const section = (source, title) => source.match(new RegExp(`^## ${title}\\s*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"))?.[1] ?? "";
const raid = tool("raid-log");
const goLive = tool("go-live-check");
const critical = tool("critical-path");
const status = tool("status-report");

describe("jessica", () => {
  test("the four states are defined, and replan is one of them", () => {
    for (const w of ["On track", "At risk", "Blocked", "Replan"]) assert.match(skill, new RegExp(`\\*\\*${w}:\\*\\*`));
  });
  test("parked work shows as blocked on the owner, never late or aged", () => {
    const states = section(skill, "States, stages and age");
    assert.match(states, /parked/i);
    assert.match(states, /Blocked on the owner/);
    assert.match(states, /never (late|aged)|not (late|aged)/i);
    assert.match(states, /resurface date/i);
    assert.match(states, /age[^.\n]*(does not|doesn't) (run|count)|no age/i);
  });
  test("parked work is not surfaced on a cadence, and its age starts on the resurface date", () => {
    assert.match(section(skill, "What she does"), /surfaces it on a cadence[^|]*except parked work, before its resurface date/);
    assert.match(section(skill, "States, stages and age"), /A parked item's age starts on the resurface date/);
    assert.match(section(skill, "States, stages and age"), /released by the owner/);
    assert.match(read("docs/characters/jessica.md"), /raised before anyone asks, except parked work before its resurface date/);
  });
  test("every date is labelled and every status says as of", () => {
    assert.match(skill, /baseline, forecast or actual/);
    assert.match(skill, /as of <date>/);
  });
  test("live has named stages", () => {
    assert.match(skill, /merged, build submitted, in review, rolling out at N percent, at 100 percent/);
  });
  test("aged is defined from the date work started", () => {
    assert.match(skill, /today minus the date the ticket moved to in progress/);
    assert.match(skill, /85th percentile/);
    assert.match(skill, /5 working days/);
  });
  test("a status has a decision line and no percent complete", () => {
    assert.match(skill, /Decision needed: <what, by whom, by when>/);
    assert.match(skill, /No percent complete/);
  });
  test("two tickets that share a file need a blocker path", () => {
    assert.match(skill, /share a file need a blocker path/);
  });
  test("nice-to-haves are marked and cut before an extension", () => {
    assert.match(skill, /`~`/);
    assert.match(skill, /nice-to-haves to cut before she asks to extend/);
  });
  test("the risk log has owner, raised and review-by columns", () => {
    assert.match(raid, /`owner` \| `status` \| `raised` \| `review-by`/);
  });
  test("the go-live check returns a recommendation, not a verdict, and names who decides", () => {
    assert.match(goLive, /ends in a recommendation, not a verdict/);
    assert.match(section(goLive, "Findings"), /recommendation: go, no go, or go with conditions/);
    assert.match(section(goLive, "Findings"), /names the person who decides/);
    assert.match(section(read("docs/tools/go-live-check.md"), "What it does"), /recommendation of go, no go or go with conditions, and names the person who decides/);
    assert.match(section(read("docs/tools/go-live-check.md"), "Common questions"), /recommendation: go, no go or go with conditions, and the person who decides/);
  });
  test("rule 9 stays a short pointer to the tool and does not copy its lines", () => {
    const rule = section(skill, "Hard rules").match(/^9\. (.*)$/m)?.[1] ?? "";
    assert.match(rule, /recommendation, not a verdict/);
    assert.match(rule, /`\/go-live-check`/);
    assert.ok(rule.split(/(?<=[.!?])\s+/).length <= 2, `rule 9 is more than two sentences: ${rule}`);
    assert.doesNotMatch(rule, /its reason, its check and its evidence/);
    assert.doesNotMatch(rule, /no fix becomes a ticket/);
  });
  test("the go-live check is capped at 30 lines and lists evidence", () => {
    assert.match(goLive, /At most 30 lines/);
    assert.match(goLive, /the evidence, and the result/);
  });
});

describe("jessica's four tools", () => {
  test("each is its own skill, named for its folder, with a description", () => {
    for (const name of TOOLS) {
      const source = tool(name);
      assert.match(source, new RegExp(`^---\\nname: ${name}\\ndescription: .+`), `${name}/SKILL.md`);
    }
  });
  test("the artifacts file left jessica's folder", () => {
    assert.equal(existsSync("skills/characters/jessica/ARTIFACTS.md"), false);
    assert.doesNotMatch(skill, /ARTIFACTS\.md/);
    assert.doesNotMatch(skill, /still to build/);
  });
  test("each is shipped, listed under Model-invoked, and has a docs page", () => {
    const plugin = JSON.parse(read(".claude-plugin/plugin.json"));
    const readme = read("skills/tools/README.md");
    const modelInvoked = readme.split(/^## /m).find((s) => s.startsWith("Model-invoked")) ?? "";
    for (const name of TOOLS) {
      assert.ok(plugin.skills.includes(`./skills/tools/${name}`), `${name} in plugin.json`);
      assert.match(modelInvoked, new RegExp(`\\]\\(\\./${name}/SKILL\\.md\\)`), `${name} in README`);
      assert.ok(existsSync(`docs/tools/${name}.md`), `docs/tools/${name}.md`);
    }
  });
  test("jessica's When to call has one row per tool, each with a trigger", () => {
    const when = section(skill, "When to call");
    for (const name of TOOLS) assert.match(when, new RegExp(`^\\| \`/${name}\` \\| .{15,}`, "m"), name);
    assert.match(when, /external dependenc/);
    assert.match(when, /three or more tickets/);
    assert.match(when, /a release is next/);
  });
  test("the hand-off table and the hard rules name the new tools", () => {
    assert.match(section(skill, "Working with the others"), /go-live check/);
    assert.match(section(skill, "Working with the others"), /status report/);
    const rules = section(skill, "Hard rules");
    assert.match(rules, /`\/raid-log`/);
    assert.match(rules, /`\/critical-path`/);
    assert.match(rules, /`\/go-live-check`/);
  });
  test("the risk log: one row shape, a last column by kind, closed rows stay", () => {
    assert.match(raid, /`id` \| `kind` \| `text`/);
    for (const kind of ["mitigation", "how and when", "next step", "needed-by"]) assert.match(raid, new RegExp(kind));
    assert.match(raid, /closed row stays/i);
    assert.match(raid, /past `review-by`/);
    assert.match(raid, /`assumed`/);
  });
  test("the critical path is computed from blocker edges, with float and warnings", () => {
    assert.match(critical, /longest path/);
    assert.match(critical, /latest finish minus the earliest finish/);
    assert.match(critical, /cycle times/);
    for (const w of ["cycle", "no blockers and no dependents", "larger than the longest path"]) assert.match(critical, new RegExp(w));
  });
  test("the status report has the fixed order, no percent complete", () => {
    for (const w of ["Decision needed:", "No decision needed", "baseline", "as of", "top three risks", "No percent complete"]) {
      assert.match(status, new RegExp(w, "i"), w);
    }
  });
  test("the go-live check sizes to the release, blocks on findings, dates its conditions", () => {
    assert.match(goLive, /first store publication/);
    assert.match(goLive, /ticket that blocks the release/);
    assert.match(goLive, /each condition (is )?dated/i);
    assert.match(goLive, /`human`/);
  });
});
