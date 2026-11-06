// The character files hold to the repo's rules (CLAUDE.md) and to what they promise.
//
//   node --test test/characters/characters.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

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
        assert.doesNotMatch(source, /\b(kitchen|head chef|cooks?|stations?|tickets? board)\b/i);
        assert.doesNotMatch(source, /\b(six|seven|eight)\s+(characters|people|members)\b/i);
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
