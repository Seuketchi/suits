// The character files hold to the repo's rules (CLAUDE.md) and to what they promise.
//
//   node --test test/characters/characters.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(".");
const read = (...p) => readFileSync(join(root, ...p), "utf8");
const characters = readdirSync(join(root, "skills/characters"), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

// Skills a character only offers to the owner, which are not in this repo.
const OFFERED = new Set(["rabbit-hole"]);

const section = (source, title) => {
  const m = source.match(new RegExp(`^## ${title}\\s*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"));
  return m ? m[1] : "";
};
const frontmatter = (source) => source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
const named = (source) => [...source.matchAll(/`\/(?:suits:)?([a-z][a-z0-9-]*)`/g)].map((m) => m[1]);
const toolDir = (name) => ["tools", "characters"].map((b) => join("skills", b, name)).find((d) => existsSync(join(root, d, "SKILL.md")));

describe("characters", () => {
  test("there is at least one", () => assert.ok(characters.length > 0));

  for (const name of characters) {
    const source = read("skills/characters", name, "SKILL.md");

    describe(name, () => {
      for (const title of ["When to call", "Hard rules", "Hand over", "Voice"]) {
        test(`has a "${title}" section`, () => assert.ok(section(source, title).trim().length > 0));
      }

      test("calls only skills that exist here", () => {
        const missing = named(source).filter((n) => !OFFERED.has(n) && !toolDir(n));
        assert.deepEqual([...new Set(missing)], []);
      });

      test("calls no skill that only a person can start", () => {
        const userOnly = named(source).filter((n) => {
          const dir = toolDir(n);
          return dir && /^disable-model-invocation:\s*true$/m.test(frontmatter(read(dir, "SKILL.md")));
        });
        assert.deepEqual([...new Set(userOnly)], []);
      });

      test("every skill it calls is in the plugin", () => {
        const plugin = JSON.parse(read(".claude-plugin/plugin.json")).skills.map((p) => p.replace(/^\.\//, ""));
        const missing = named(source).filter((n) => toolDir(n) && !plugin.includes(toolDir(n)));
        assert.deepEqual([...new Set(missing)], []);
      });

      test("says in When to call that the default is not to call", () => {
        assert.match(section(source, "When to call"), /default is not to call/i);
      });

      test("names no workflow tool and no team size", () => {
        const prose = source.replace(/`[^`\n]*`/g, ""); // tool names such as `/test-kitchen` are fine
        assert.doesNotMatch(prose, /\b(kitchen|head chef|cooks?|stations?|tickets? board)\b/i);
        assert.doesNotMatch(prose, /\b(six|seven|eight)\s+(characters|people|members)\b/i);
      });

      test("has a sample line of 30 words or fewer", () => {
        const voice = section(source, "Voice");
        const samples = [...voice.matchAll(/^(?:>|Sample:)\s*"?(.+?)"?\s*$/gm)].map((m) => m[1]);
        assert.ok(samples.length > 0, "no sample line (a blockquote or a line starting with Sample:)");
        for (const s of samples) assert.ok(s.split(/\s+/).length <= 30, `too long: ${s}`);
      });

      test("keeps the voice off anything written for other people", () => {
        assert.match(section(source, "Voice"), /(plain|professional)/i);
      });
    });
  }
});

// The owner's writing rules (CLAUDE.md), enforced on every skill, characters and tools alike.

const skillFiles = (dir) =>
  readdirSync(join(root, dir), { withFileTypes: true }).flatMap((e) => {
    const path = join(dir, e.name);
    if (e.isDirectory()) return skillFiles(path);
    return e.name === "SKILL.md" ? [path] : [];
  });

// Words about how this work is run, which have no place in skill text.
const WORKFLOW_WORDS = [
  ["kitchen", /\bkitchens?\b/i],
  ["head chef", /\bhead chefs?\b/i],
  ["cook", /\bcooks?\b/i],
  ["station", /\bstations?\b/i],
  ["ticket board", /\btickets? boards?\b/i],
  ["assistant", /\bassistants?\b/i],
  ["agent", /\b(?:sub-?)?agents?\b/i],
];

// Phrases that fix how many characters there are, or say so in a number.
const TEAM_SIZE = [
  /\b(?:two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)[ -](?:characters|team members|specialists|people|members)\b/i,
  /\b(?:team|cast|crew|roster) of (?:\d+|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/i,
  /\b\d+[ -](?:characters|team members|specialists|people|members)\b(?!\s+or\b)(?<!\b(?:under|than|of|to|at most|over|up to)\s\d+\s\w+)/i,
];

// What the scan skips: code spans (tool names such as `/test-kitchen`), and the legal terms of art in
// donna's LEGAL.md, where "assistant secretary" and an attorney-in-fact's "agent" are the right words.
const LEGAL_TERMS = /\bassistant secretary\b|\b(?:attorney-in-fact|special power of attorney)\b|\b(?:the|an|as my|and) agent\b/gi;
const prose = (source) => source.replace(/`[^`\n]*`/g, "").replace(LEGAL_TERMS, "");

export const workflowWords = (source) => WORKFLOW_WORDS.filter(([, re]) => re.test(prose(source))).map(([w]) => w);
export const teamSizePhrases = (source) => TEAM_SIZE.flatMap((re) => prose(source).match(new RegExp(re.source, "gi")) ?? []);

// Files that say one of these words on purpose, each with why. Anything not listed fails. An entry
// that no longer needs its place fails too, so the list only shrinks.
const WORKFLOW_WORD_ALLOWED = {
  "skills/characters/harvey/SKILL.md": "starts a sub-agent for the architecture survey, and says so first",
  "skills/characters/louis/SKILL.md": "starts the review's sub-agents, and says so first",
  "skills/tools/code-review/SKILL.md": "starts a sub-agent per review axis",
  "skills/tools/codebase-design/SKILL.md": "points to parallel sub-agents for design-it-twice",
  "skills/tools/diagnosing-bugs/SKILL.md": "a checklist item on a loop that runs unattended",
  "skills/tools/grilling/SKILL.md": "sends a sub-agent to look a fact up",
  "skills/tools/improve-codebase-architecture/SKILL.md": "starts a sub-agent to walk the codebase",
  "skills/tools/research/SKILL.md": "runs the research in a background agent",
  "skills/tools/reverse-engineer-anything/SKILL.md": "ported from morluto/rea, which is about agents and their environments",
  "skills/tools/source-finder/SKILL.md": "an example claim about reinforcement-learning agents",
  "skills/tools/stocktake/SKILL.md": "runs the audit in a background agent",
  "skills/tools/test-kitchen/SKILL.md": "the tool's own name and its metaphor",
  "skills/tools/to-tickets/SKILL.md": "labels tickets for an agent to pick up, as the tracker does",
};

describe("the scan itself", () => {
  test("finds a planted workflow word", () => {
    for (const word of ["the kitchen", "ask the head chef", "a cook", "the ticket board", "an assistant", "a sub-agent", "agents"]) {
      assert.ok(workflowWords(`Say ${word} here.`).length > 0, word);
    }
  });
  test("skips tool names in code spans and the legal terms of art", () => {
    assert.deepEqual(workflowWords("Run `/test-kitchen` for that."), []);
    assert.deepEqual(workflowWords("An assistant secretary's certificate."), []);
    assert.deepEqual(workflowWords("Appoint Maria as my true and lawful attorney-in-fact; the agent signs."), []);
  });
  test("finds a planted team size", () => {
    for (const phrase of ["a team of seven", "the six characters", "a crew of 5", "ten specialists", "7 team members"]) {
      assert.ok(teamSizePhrases(`We are ${phrase}.`).length > 0, phrase);
    }
  });
  test("lets a count that is not a team size through", () => {
    for (const phrase of ["under 60 characters", "72 characters or fewer", "up to three in parallel", "at most 3 associates"]) {
      assert.deepEqual(teamSizePhrases(`Keep it ${phrase}.`), [], phrase);
    }
  });
});

describe("skill text", () => {
  const files = skillFiles("skills");

  test("there are skills to scan", () => assert.ok(files.length > characters.length));

  test("uses no workflow-tool word, except where listed with a reason", () => {
    const offenders = files
      .map((f) => [f, workflowWords(read(f))])
      .filter(([f, words]) => words.length > 0 && !(f in WORKFLOW_WORD_ALLOWED))
      .map(([f, words]) => `${f}: ${words.join(", ")}`);
    assert.deepEqual(offenders, []);
  });

  test("lists no file that no longer needs its place", () => {
    const stale = Object.keys(WORKFLOW_WORD_ALLOWED).filter((f) => !files.includes(f) || workflowWords(read(f)).length === 0);
    assert.deepEqual(stale, []);
  });

  test("states no number of characters", () => {
    const offenders = files.map((f) => [f, teamSizePhrases(read(f))]).filter(([, p]) => p.length > 0).map(([f, p]) => `${f}: ${p.join("; ")}`);
    assert.deepEqual(offenders, []);
  });

  test("names no number of characters in the plugin, the package or the READMEs", () => {
    const places = [".claude-plugin/plugin.json", "package.json", "README.md", "skills/characters/README.md", "skills/tools/README.md"];
    const offenders = places.filter((p) => teamSizePhrases(read(p)).length > 0);
    assert.deepEqual(offenders, []);
  });

  test("names no number of characters in any skill's name or description", () => {
    const offenders = files.filter((f) => teamSizePhrases(frontmatter(read(f))).length > 0);
    assert.deepEqual(offenders, []);
  });
});

describe("the voice", () => {
  for (const name of characters) {
    test(`${name}'s Voice section names a register, what it avoids and a sample line`, () => {
      const voice = section(read("skills/characters", name, "SKILL.md"), "Voice");
      assert.match(voice, /\b(register|terse|plain|professional|dry|warm|calm|formal|direct)\b/i, "no register");
      assert.match(voice, /\b(avoid|never|no |not |without|skips?)\b/i, "says nothing it avoids");
      assert.match(voice, /^(?:>|Sample:)\s*\S/m, "no sample line");
    });

    test(`${name}'s voice speaks only to the owner`, () => {
      const voice = section(read("skills/characters", name, "SKILL.md"), "Voice");
      assert.match(voice, /\b(owner|owner's)\b/i, "does not say whom the voice is for");
      assert.match(voice, /plain,? professional|professional register|plain register/i, "does not give others the plain professional register");
    });
  }
});

describe("the READMEs say who calls each tool", () => {
  const tools = readdirSync(join(root, "skills/tools"), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
  // A character calls a tool when the tool is in its When to call table.
  const callersOf = (tool) =>
    characters.filter((c) => named(section(read("skills/characters", c, "SKILL.md"), "When to call")).includes(tool)).sort();
  const listed = (text) => text.split(/,\s*|\s+and\s+/).map((n) => n.replace(/\.$/, "").trim()).filter(Boolean).sort();

  for (const tool of tools) {
    test(`${tool}: both READMEs name the characters whose When to call has it`, () => {
      const expected = callersOf(tool);
      const root_ = read("README.md").match(new RegExp(`^- \`${tool}\`: called by (.+?)\\.$`, "m"))?.[1];
      const tools_ = read("skills/tools/README.md").match(new RegExp(`^- \\*\\*\\[${tool}\\][^\\n]*Called by (.+?)\\.$`, "m"))?.[1];
      assert.deepEqual(root_ && listed(root_), expected, "README.md");
      assert.deepEqual(tools_ && listed(tools_), expected, "skills/tools/README.md");
    });
  }
});
