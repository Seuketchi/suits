// rachel's SKILL.md keeps what the research found a root-cause look needs (docs/characters/rachel/references.md).
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const skill = readFileSync("skills/characters/rachel/SKILL.md", "utf8");
const audit = readFileSync("skills/tools/root-cause-audit/SKILL.md", "utf8");
const auditDoc = readFileSync("docs/tools/root-cause-audit.md", "utf8");
const section = (source, title) => source.split(/^## /m).find((s) => s.startsWith(title)) ?? "";

describe("rachel", () => {
  test("her voice is determined, prepared and earns the claim herself, not sceptical", () => {
    const voice = section(skill, "Voice");
    assert.match(voice, /^Stance: .*determined/m);
    assert.match(voice, /^Stance: .*prepared/m);
    assert.match(voice, /^Stance: .*herself/m);
    assert.doesNotMatch(voice, /sceptic/i);
  });
  test("her SKILL.md does not keep a copy of the audit method", () => {
    assert.doesNotMatch(skill, /four questions/i);
    assert.doesNotMatch(skill, /Not caught earlier/);
    assert.doesNotMatch(skill, /^## The look at a bug/m);
    assert.doesNotMatch(skill, /^\d\. \*\*(Deeper|Sideways|Back up):\*\*/m);
  });
  test("on a bug she calls the audit; the table says so in one line", () => {
    assert.match(section(skill, "What she does"), /bug.*`\/suits:root-cause-audit`/);
    assert.match(section(skill, "What she does"), /writes the trigger and the causes \|/);
  });
  test("she keeps mike's check of her framing and names a side thread under Open questions, never a tool", () => {
    assert.match(skill, /Mike checks her framing/);
    assert.doesNotMatch(skill, /rabbit-hole/);
    assert.match(section(skill, "Hard rules").match(/^7\. [^\n]*/m)?.[0] ?? "", /Open questions/);
  });
  test("a red flag is the list of cases she tells the owner at once, and it goes to harvey with mike's check", () => {
    const rule4 = section(skill, "Hard rules").match(/^4\. [^\n]*/m)?.[0] ?? "";
    assert.match(rule4, /design flaw[^\n]*silent for a long time\. Each of these is a red flag\./);
    assert.match(rule4, /a red flag goes to him with mike's check of its facts/);
    assert.match(rule4, /Nothing is fixed until the owner decides\./);
  });
  test("her docs page says a red flag goes to harvey with mike's check", () => {
    const doc = readFileSync("docs/characters/rachel.md", "utf8");
    assert.match(doc, /red flag[^\n]*mike's check/);
  });
  test("her hand-over keeps typed items for the owner and she assigns none", () => {
    assert.match(skill, /prevent, sweep, redesign, detect or mitigate/);
    assert.match(skill, /She assigns none/);
  });
  test("her docs page says three directions, not four questions", () => {
    const doc = readFileSync("docs/characters/rachel.md", "utf8");
    assert.doesNotMatch(doc, /four questions/i);
    assert.match(section(doc, "It's working if"), /three directions/);
  });
  describe("if a server is connected", () => {
    const body = () => {
      const m = skill.match(/^## If a server is connected\n([\s\S]*?)(?=^## )/m);
      assert.ok(m, "no ## If a server is connected section");
      return m[1];
    };
    test("sits between Hard rules and Working with the others", () => {
      const at = (h) => skill.indexOf(`\n## ${h}\n`);
      assert.ok(at("Hard rules") > -1);
      assert.ok(at("Hard rules") < at("If a server is connected"));
      assert.ok(at("If a server is connected") < at("Working with the others"));
    });
    test("names the kind of server, and no product", () => {
      assert.match(body(), /web search or documentation server/);
      assert.match(body(), /primary source/);
    });
    test("says what she does without one", () => {
      assert.match(body(), /[Ww]ithout one/);
      assert.match(body(), /fetch/);
    });
    test("a search result is a lead, not evidence, and she cites the primary source", () => {
      const s = body();
      assert.match(s, /search result is a lead, not evidence/);
      assert.match(s, /cites the primary source/);
    });
    test("is three to five lines", () => {
      const n = body().trim().split("\n").length;
      assert.ok(n >= 3 && n <= 5, `${n} lines`);
    });
  });

  // The rachel-root-cause eval failed three graders at baseline (docs/characters/rachel.md, evals/rachel-root-cause).
  describe("hand over, as the eval found it", () => {
    const handOver = () => section(skill, "Hand over");
    const item = (n) => handOver().match(new RegExp(`^${n}\\. [^\\n]*`, "m"))?.[0] ?? "";

    test("a brief that names the cause gets it checked, not confirmed, and the other causes still listed", () => {
      const first = item(1);
      assert.match(first, /trigger and the main cause, tagged/);
      assert.match(first, /names the cause/);
      assert.match(first, /checked, not confirmed/);
      assert.match(first, /gives the others too/);
    });
    test("she does not ask for data in place of the other causes: one she cannot source is inferred with to confirm", () => {
      const first = item(1);
      assert.match(first, /does not ask for data in place of the other causes/);
      assert.match(first, /inferred/);
      assert.match(first, /`to confirm:`/);
    });
    test("a named cause that does not account for what was reported says what it leaves out", () => {
      assert.match(item(1), /does not account for/);
    });
    test("the first line is the trigger and the main cause: no label, greeting or caveat before it, and only the three tags", () => {
      const first = item(1);
      assert.match(first, /The reply's first line is the trigger and the main cause/);
      assert.match(first, /no label, greeting or caveat before it/);
      assert.match(first, /Tags are found, not found or inferred and no other/);
    });
    test("a decision is the owner's and goes in the red flag, not in an item", () => {
      const typed = item(4);
      assert.doesNotMatch(typed, /say whose it is/);
      assert.match(typed, /decision[^\n]*(red flag|owner)[^\n]*not in an item/);
    });
    test("the red flag comes before every cause, even where a tool lists the causes first", () => {
      assert.match(item(2), /before the other causes/);
    });
    test("a red flag is the second thing she writes, with harvey and the owner's decision", () => {
      const flag = item(2);
      assert.match(flag, /red flag/);
      assert.match(flag, /straight after the first line/);
      assert.match(flag, /not at the end/);
      assert.match(flag, /money/);
      assert.match(flag, /harvey validates it/);
      assert.match(flag, /mike's check of its facts/);
      assert.match(flag, /nothing is fixed until the owner decides/i);
    });
    test("working alone, the red flag is in the message to whoever sent the brief, naming harvey", () => {
      assert.match(item(2), /Working alone[^\n]*message to whoever sent the brief[^\n]*harvey/);
    });
    test("every cause gets one typed item, an inferred cause too, and an item names no person, character or team", () => {
      const typed = item(4);
      assert.match(typed, /One typed item per cause/);
      assert.match(typed, /prevent, sweep, redesign, detect or mitigate/);
      assert.match(typed, /Every cause gets one, an inferred cause too/);
      assert.match(typed, /She assigns none/);
      assert.match(typed, /names no person, character or team/);
    });
  });

  test("she edits nothing", () => {
    assert.match(skill, /\*\*Edit nothing\.\*\*/);
  });

  test("she calls the root-cause audit only when the task is a bug", () => {
    const when = section(skill, "When to call");
    assert.match(when, /\| `\/suits:root-cause-audit` \| the task is a bug/);
    assert.match(section(skill, "What she does"), /`\/suits:root-cause-audit`/);
  });
  test("the hand-off table has the audit's inputs and its decision route", () => {
    const table = section(skill, "Working with the others");
    assert.match(table, /fix diff/);
    assert.match(table, /rachel \| harvey \|/);
  });
  test("a hard rule keeps the audit read-only and calls it by name", () => {
    assert.match(section(skill, "Hard rules"), /`\/suits:root-cause-audit`.*(edits no code|edits nothing|read-only)/s);
  });
});

describe("root-cause-audit", () => {
  test("it is a model-invoked skill named for its folder", () => {
    assert.match(audit, /^---\nname: root-cause-audit\ndescription: .+\n---/);
    assert.doesNotMatch(audit, /disable-model-invocation/);
  });
  test("it reads the fix diff and what mike hands her, and edits no code", () => {
    assert.match(audit, /fix diff/);
    assert.match(audit, /mike/i);
    assert.match(audit, /Edit no code|edits no code|Read only/);
  });
  test("it looks in three fixed directions, each with a heading", () => {
    for (const d of ["Deeper", "Sideways", "Back up"]) assert.match(audit, new RegExp(`^### ${d}\\b`, "m"));
  });
  test("each finding is tagged found, not found or inferred", () => {
    assert.match(audit, /found, not found or inferred/);
  });
  test("not found needs a searched: line, inferred needs a to confirm: clause", () => {
    assert.match(audit, /`searched:`/);
    assert.match(audit, /`to confirm:`/);
  });
  test("it returns open questions and what to check next", () => {
    assert.match(audit, /Open questions/);
    assert.match(audit, /Check next/);
  });
  test("a finding that needs a decision goes to harvey", () => {
    assert.match(audit, /harvey/);
    assert.match(audit, /design flaw.*scope.*money.*rule/s);
  });
  test("it tells the guardrail from the design change", () => {
    assert.match(audit, /guardrail.*design change/s);
  });
  test("a cause never names a person", () => {
    assert.match(audit, /never names a person or "human error"/);
  });
  test("a thread outside the bug goes under Open questions, not followed, and offers no tool", () => {
    assert.doesNotMatch(audit, /rabbit-hole/);
    const thread = section(audit, "A thread outside the bug");
    assert.match(thread, /Do not follow it/);
    assert.match(thread, /Open questions/);
  });
  test("sideways also searches the sibling repos the project names, for the same flaw and for callers", () => {
    const sideways = section(audit.replace(/^### /gm, "## "), "Sideways");
    assert.match(sideways, /`## Sibling repos`/);
    assert.match(sideways, /`CLAUDE\.md`[\s\S]*`CONTEXT\.md`/);
    assert.match(sideways, /same flaw/);
    assert.match(sideways, /every caller of the changed code/);
    assert.match(sideways, /`searched:`[^\n]*each (sibling )?repo/);
    assert.match(sideways, /`no sibling repos named`/);
  });
  test("causes, plural, with a trigger and three timestamps", () => {
    assert.match(audit, /\*\*Causes\*\*, plural/);
    assert.match(audit, /\*\*Trigger:\*\*/);
    assert.match(audit, /introduced.*first possible detection.*found/s);
  });
  test("what would have noticed it earlier is asked under Deeper", () => {
    assert.match(section(audit.replace(/^### /gm, "## "), "Deeper"), /would have noticed it earlier/);
  });
  test("typed items for the owner to assign, and the audit assigns none", () => {
    assert.match(audit, /prevent, sweep, redesign, detect or mitigate/);
    assert.match(audit, /the audit assigns none/);
  });
  test("its docs page has the four sections", () => {
    for (const t of ["What it does", "When to reach for it", "Common questions", "It's working if"]) assert.match(auditDoc, new RegExp(`^## ${t}$`, "m"));
  });
  test("it is shipped: plugin.json and the tools README list it", () => {
    assert.match(readFileSync(".claude-plugin/plugin.json", "utf8"), /"\.\/skills\/tools\/root-cause-audit"/);
    assert.match(readFileSync("skills/tools/README.md", "utf8"), /\]\(\.\/root-cause-audit\/SKILL\.md\)/);
  });
});
