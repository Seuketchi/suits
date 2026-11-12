// The ask-donna tool: a user-invoked router that names one owner and does no work.
//
//   node --test test/characters/ask-donna.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";

const skill = () => readFileSync("skills/tools/ask-donna/SKILL.md", "utf8");
const section = (source, title) =>
  source.match(new RegExp(`^## ${title}\\s*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"))?.[1] ?? "";
const shipped = () => new Set(JSON.parse(readFileSync(".claude-plugin/plugin.json", "utf8")).skills.map((p) => p.split("/").pop()));

describe("ask-donna: the tool", () => {
  test("is named ask-donna, has a description, and only a person starts it", () => {
    const head = skill().match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
    assert.match(head, /^name: ask-donna$/m);
    assert.match(head, /^description: \S/m);
    assert.match(head, /^disable-model-invocation: true$/m);
  });

  test("names one owner, never two, and sends a bug to rachel first", () => {
    const text = skill();
    assert.match(section(text, "Answer"), /Never two/);
    assert.match(text, /a bug goes to `rachel` first/);
  });

  test("asks one question when the situation is unclear, then routes", () => {
    assert.match(skill(), /ask one question, then route/i);
    assert.match(skill(), /Never ask a second one/);
  });

  test("does no work and starts nothing", () => {
    assert.match(skill(), /drafts nothing, runs no tool and starts no session/);
  });

  test("routes only to skills that ship here, each written with the prefix", () => {
    const have = shipped();
    const named = [...skill().matchAll(/`\/suits:([a-z][a-z0-9-]*)/g)].map((m) => m[1]);
    assert.ok(named.length >= 8, "the owner table names the characters");
    for (const name of named) assert.ok(have.has(name), `/suits:${name} is not shipped`);
    for (const character of ["donna", "rachel", "mike", "harvey", "jessica", "louis", "associates"]) {
      assert.ok(named.includes(character), `no route to ${character}`);
    }
    assert.ok(named.includes("retro"));
  });

  test("every guide it links exists, and every guide page is offered", () => {
    const links = [...skill().matchAll(/\]\(\.\.\/\.\.\/\.\.\/docs\/guides\/([\w-]+\.md)\)/g)].map((m) => m[1]);
    for (const page of links) assert.ok(existsSync(`docs/guides/${page}`), `docs/guides/${page} is missing`);
    const pages = readdirSync("docs/guides").filter((f) => f.endsWith(".md") && f !== "README.md");
    for (const page of pages) assert.ok(links.includes(page), `${page} is not offered`);
  });

  test("is listed under User-invoked and not under Model-invoked, and the quick start names it", () => {
    for (const file of ["README.md", "skills/tools/README.md"]) {
      const text = readFileSync(file, "utf8");
      const user = text.split(/^#{2,3} /m).find((b) => b.startsWith("User-invoked")) ?? "";
      const model = text.split(/^#{2,3} /m).find((b) => b.startsWith("Model-invoked")) ?? "";
      assert.match(user, /ask-donna/, `${file}: not under User-invoked`);
      assert.doesNotMatch(model, /ask-donna/, `${file}: under Model-invoked`);
    }
    const root = readFileSync("README.md", "utf8");
    assert.match(root, /\/suits:ask-donna/);
    assert.match(root, /\]\(docs\/guides\/README\.md\)/);
  });
});
