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
// Slash words in code spans that are paths, not skills.
const NOT_A_SKILL = new Set(["tmp"]);

const section = (source, title) => {
  const m = source.match(new RegExp(`^## ${title}\\s*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"));
  return m ? m[1] : "";
};
const frontmatter = (source) => source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
const named = (source) => [...source.matchAll(/`\/(?:suits:)?([a-z][a-z0-9-]*)`/g)].map((m) => m[1]);
const toolDir = (name) => ["tools", "characters"].map((b) => join("skills", b, name)).find((d) => existsSync(join(root, d, "SKILL.md")));
// Code spans that name a skill shipped here without the `suits:` prefix (ADR 0002): a slash span
// (`/tdd`, `/scrum 2026-09-03`) or the plain form "the `jessica` skill".
const bareNames = (source) =>
  [...source.matchAll(/`\/([a-z][a-z0-9-]*)(?=[`\s])|\bthe `([a-z][a-z0-9-]*)` skill\b/g)].map((m) => m[1] ?? m[2]).filter((n) => toolDir(n));
// Files that name a bare tool on purpose, each with why.
const BARE_ALLOWED = {
  "docs/tools/code-review.md": "names Claude Code's built-in /code-review, which this tool shares a name with",
  "docs/characters/louis.md": "names Claude Code's built-in /code-review, which the review skill shares a name with",
};
const bareNameOffenders = (files) =>
  files.filter((f) => !(f in BARE_ALLOWED)).map((f) => [f, bareNames(read(f))]).filter(([, n]) => n.length > 0).map(([f, n]) => `${f}: ${[...new Set(n)].join(", ")}`);

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

      test("has a Working alone section before Hand over", () => {
        const text = section(source, "Working alone");
        assert.ok(text.length > 0, "no ## Working alone section");
        assert.ok(source.indexOf("## Working alone") < source.indexOf("## Hand over"), "Working alone comes after Hand over");
        assert.match(text, /\b(?:gh pr diff|git show)\b/);
        assert.match(text, /hand-off[^.\n]* is a message/i);
        assert.match(text, /start no other session/i);
        assert.match(text, /to whoever sent the brief/);
        assert.match(text, /For a job of three or more steps, list them with `suits_checklist` and mark each done, when that tool is present\./);
      });

      test("explains Working alone in its docs page, under Common questions", () => {
        const page = read("docs/characters", `${name}.md`);
        assert.match(section(page, "Common questions"), /work(?:s|ing)? alone/i);
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

// What the scan skips: code spans (tool names such as `/test-kitchen`), and, in donna's LEGAL.md only,
// the legal terms of art, where "assistant secretary" and an attorney-in-fact's "agent" are the right words.
const LEGAL_FILE = "skills/characters/donna/docs/LEGAL.md";
const LEGAL_TERMS = /\bassistant secretary\b|\b(?:attorney-in-fact|special power of attorney)\b|\b(?:the|an|as my|and) agent\b/gi;
// Link targets are skipped too: a path such as `./test-kitchen.md` is a name, not prose.
const prose = (source, file = "") => {
  const text = source.replace(/`[^`\n]*`/g, "").replace(/\]\([^)\s]*\)/g, "]");
  return file === LEGAL_FILE ? text.replace(LEGAL_TERMS, "") : text;
};

export const workflowWords = (source, file) => WORKFLOW_WORDS.filter(([, re]) => re.test(prose(source, file))).map(([w]) => w);
export const teamSizePhrases = (source) => TEAM_SIZE.flatMap((re) => prose(source).match(new RegExp(re.source, "gi")) ?? []);

// Files that say one of these words on purpose, each with why. Anything not listed fails. An entry
// that no longer needs its place fails too, so the list only shrinks.
const WORKFLOW_WORD_ALLOWED = {
  "skills/characters/harvey/SKILL.md": "starts a sub-agent for the architecture survey, and says so first",
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
  test("skips tool names in code spans", () => {
    assert.deepEqual(workflowWords("Run `/test-kitchen` for that."), []);
  });
  test("skips the legal terms of art in LEGAL.md only", () => {
    assert.deepEqual(workflowWords("An assistant secretary's certificate.", LEGAL_FILE), []);
    assert.deepEqual(workflowWords("Appoint Maria as my true and lawful attorney-in-fact; the agent signs.", LEGAL_FILE), []);
    for (const text of ["Then the agent reads the file.", "Hand it to an agent.", "An assistant secretary signs."]) {
      assert.ok(workflowWords(text, "skills/tools/pr/SKILL.md").length > 0, text);
    }
  });
  test("finds a planted bare tool name", () => {
    assert.deepEqual(bareNames("Run `/tdd` first."), ["tdd"]);
    assert.deepEqual(bareNames("Type `/scrum 2026-09-03` to redraft."), ["scrum"]);
    assert.deepEqual(bareNames("Run the `jessica` skill and carry on."), ["jessica"]);
  });
  test("lets a prefixed tool name and a path through", () => {
    assert.deepEqual(bareNames("Run `/suits:tdd` first, then write to `/tmp`."), []);
    assert.deepEqual(bareNames("See the `/suits:code-review` skill, or the `pdf` skill if listed."), []);
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

// Docs pages that say one of these words on purpose, each with why.
const DOCS_WORD_ALLOWED = {
  "docs/characters/rachel/references.md": "cites Richard Cook, the author of How Complex Systems Fail",
};

const docFiles = (dir) =>
  readdirSync(join(root, dir), { withFileTypes: true }).flatMap((e) => {
    const path = join(dir, e.name);
    if (e.isDirectory()) return docFiles(path);
    return e.name.endsWith(".md") ? [path] : [];
  });

describe("docs pages", () => {
  const files = docFiles("docs");

  test("there are pages to scan", () => assert.ok(files.length > 0));

  test("name every tool with the suits: prefix", () => {
    assert.deepEqual(bareNameOffenders(files), []);
  });

  test("use no workflow-tool word, except where listed with a reason", () => {
    const offenders = files
      .map((f) => [f, workflowWords(read(f), f)])
      .filter(([f, words]) => words.length > 0 && !(f in DOCS_WORD_ALLOWED))
      .map(([f, words]) => `${f}: ${words.join(", ")}`);
    assert.deepEqual(offenders, []);
  });

  test("list no page that no longer needs its place", () => {
    const stale = Object.keys(DOCS_WORD_ALLOWED).filter((f) => !files.includes(f) || workflowWords(read(f), f).length === 0);
    assert.deepEqual(stale, []);
  });
});

describe("skill text", () => {
  const files = skillFiles("skills");

  test("there are skills to scan", () => assert.ok(files.length > characters.length));

  test("names only skills that exist here, or are offered", () => {
    const missing = files
      .map((f) => [f, named(read(f)).filter((n) => !OFFERED.has(n) && !NOT_A_SKILL.has(n) && !toolDir(n))])
      .filter(([, names]) => names.length > 0)
      .map(([f, names]) => `${f}: ${[...new Set(names)].join(", ")}`);
    assert.deepEqual(missing, []);
  });

  test("names every tool with the suits: prefix", () => {
    assert.deepEqual(bareNameOffenders(files), []);
  });

  test("uses no workflow-tool word, except where listed with a reason", () => {
    const offenders = files
      .map((f) => [f, workflowWords(read(f), f)])
      .filter(([f, words]) => words.length > 0 && !(f in WORKFLOW_WORD_ALLOWED))
      .map(([f, words]) => `${f}: ${words.join(", ")}`);
    assert.deepEqual(offenders, []);
  });

  test("lists no file that no longer needs its place", () => {
    const stale = Object.keys(WORKFLOW_WORD_ALLOWED).filter((f) => !files.includes(f) || workflowWords(read(f), f).length === 0);
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

// The associates are a working team, not a person, so they keep a plain voice with no persona block.
const NO_PERSONA = new Set(["associates"]);
const persona = characters.filter((n) => !NO_PERSONA.has(n));
const voiceLines = (name) => section(read("skills/characters", name, "SKILL.md"), "Voice").split("\n").filter((l) => l.trim());
const sampleLines = (name) => voiceLines(name).filter((l) => /^(?:>|Sample:)\s*\S/.test(l));

describe("working alone, in the shared terms", () => {
  test("CONTEXT.md defines the term", () => {
    assert.match(read("CONTEXT.md"), /^\*\*Working alone\*\*:/m);
  });
  test("jessica writes tickets in her hand-over, not on the board, when working alone", () => {
    const source = read("skills/characters/jessica/SKILL.md");
    assert.match(source, /working alone[^.\n]*(?:tickets|hand-over)[^.\n]*does not write to the board/i);
  });
  test("ADR 0003 records the mode", () => {
    const adr = read("docs/adr/0003-characters-can-work-alone.md");
    assert.match(adr, /^# /m);
    assert.match(adr, /^## Decision/m);
  });
});

describe("the voice rule in CLAUDE.md", () => {
  const rule = read("CLAUDE.md").split("\n").find((l) => /\*\*Voice\*\* section/.test(l)) ?? "";
  test("allows the voice block and no longer calls the voice a thin layer", () => {
    assert.doesNotMatch(rule, /thin layer/);
    assert.match(rule, /8 to 12 lines/);
    assert.match(rule, /two or three sample lines of 30 words or fewer/);
    assert.match(rule, /yields to every rule/);
  });
  test("keeps the limits on the voice", () => {
    assert.match(rule, /never lengthens an answer: verdict first, short/);
    assert.match(rule, /speaks only to the owner/);
    assert.match(rule, /plain professional register/);
    assert.match(rule, /`file:line` references and blockers/);
  });
  test("builds the traits in our own words and gives the associates no persona", () => {
    assert.match(rule, /no show dialogue, no catchphrases, no actor names/);
    assert.match(rule, /associates/);
  });
});

describe("the voice block", () => {
  for (const name of persona) {
    describe(name, () => {
      test("is the last section of the file", () => {
        const headings = [...read("skills/characters", name, "SKILL.md").matchAll(/^## (.+)$/gm)].map((m) => m[1]);
        assert.equal(headings.at(-1), "Voice");
      });
      test("is 8 to 12 lines", () => {
        const n = voiceLines(name).length;
        assert.ok(n >= 8 && n <= 12, `${n} lines`);
      });
      test("gives a stance, three habits, what it cares about, what it will not do and how it disagrees", () => {
        const lines = voiceLines(name);
        for (const label of ["Stance", "Habits", "Cares about", "Will not", "Disagrees"]) {
          assert.ok(lines.some((l) => l.startsWith(`${label}: `)), `no "${label}:" line`);
        }
        const habits = lines.find((l) => l.startsWith("Habits: ")).slice("Habits: ".length).replace(/\.$/, "");
        assert.equal(habits.split(";").filter((h) => h.trim()).length, 3, "not three habits");
      });
      test("has two or three sample lines of 30 words or fewer", () => {
        const samples = sampleLines(name).map((l) => l.replace(/^(?:>|Sample:)\s*"?/, "").replace(/"?\s*$/, ""));
        assert.ok(samples.length >= 2 && samples.length <= 3, `${samples.length} samples`);
        for (const s of samples) assert.ok(s.split(/\s+/).length <= 30, `too long: ${s}`);
      });
      test("ends on a precedence line: the voice yields to the rules, the format, the numbers and the plain register", () => {
        const line = voiceLines(name).find((l) => l.startsWith("The voice yields to "));
        assert.ok(line, "no line starting 'The voice yields to '");
        assert.match(line, /every rule/);
        assert.match(line, /hand-over format/);
        assert.match(line, /numbers/);
        assert.match(line, /`file:line` references/);
        assert.match(line, /blockers/);
        assert.match(line, /plain professional register/);
        assert.match(line, /anyone but the owner/);
      });
      test("labels each line when more than one character speaks", () => {
        assert.match(section(read("skills/characters", name, "SKILL.md"), "Voice"), /each line is labelled with the character's name/);
      });
      test("quotes no show and names no catchphrase", () => {
        const voice = section(read("skills/characters", name, "SKILL.md"), "Voice");
        assert.doesNotMatch(voice, /\*Suits\*|catchphrase/i);
      });
    });
  }

  for (const name of NO_PERSONA) {
    test(`${name} keeps its plain voice with no persona block`, () => {
      const voice = section(read("skills/characters", name, "SKILL.md"), "Voice");
      assert.doesNotMatch(voice, /^(Stance|Habits|Cares about|Will not|Disagrees): /m);
      assert.doesNotMatch(voice, /^The voice yields to /m);
    });
  }
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
  // A user-invoked tool has no caller: the owner starts it. Both READMEs must list it under User-invoked instead.
  const allTools = readdirSync(join(root, "skills/tools"), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
  const hasSkill = (t) => existsSync(join(root, "skills/tools", t, "SKILL.md"));
  const userInvoked = (t) => /^disable-model-invocation:\s*true$/m.test(frontmatter(read("skills/tools", t, "SKILL.md")));
  // A folder with no SKILL.md fails once, by name, in the test below, not as a bare ENOENT while the tests are being listed.
  const skills = allTools.filter(hasSkill);
  const tools = skills.filter((t) => !userInvoked(t));

  for (const tool of allTools) {
    test(`${tool}: the tool folder has a SKILL.md`, () => {
      assert.ok(hasSkill(tool), `skills/tools/${tool} has no SKILL.md`);
    });
  }

  const userBlock = (text) => text.split(/^#{2,3} /m).find((b) => b.startsWith("User-invoked")) ?? "";

  for (const tool of skills.filter(userInvoked)) {
    test(`${tool}: user-invoked, so both READMEs list it under User-invoked and not under Model-invoked`, () => {
      const rootReadme = read("README.md");
      const toolsReadme = read("skills/tools/README.md");
      assert.match(userBlock(rootReadme), new RegExp(`^- \`${tool}\`: `, "m"), "README.md");
      assert.match(userBlock(toolsReadme), new RegExp(`^- \\*\\*\\[${tool}\\]\\(\\./${tool}/SKILL\\.md\\)`, "m"), "skills/tools/README.md");
      assert.doesNotMatch(rootReadme.split(/^#{2,3} Model-invoked/m)[1] ?? "", new RegExp(`^- \`${tool}\``, "m"), "README.md model-invoked");
      assert.doesNotMatch(toolsReadme.split(/^## Model-invoked/m)[1] ?? "", new RegExp(`\\[${tool}\\]\\(`), "tools README model-invoked");
    });
  }
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
