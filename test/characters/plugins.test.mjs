// The marketplace ships two plugins: the skills, with no hooks, and the hooks
// apart (ADR 0011), so the skills load wherever hook plugins are turned off.
//
//   node --test test/characters/plugins.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const json = (file) => JSON.parse(readFileSync(file, "utf8"));

test("the skills plugin registers no hooks", () => {
  assert.equal(existsSync("hooks/hooks.json"), false, "hooks/hooks.json at the root makes the skills plugin a hook plugin");
  assert.equal(json(".claude-plugin/plugin.json").hooks, undefined, "plugin.json must not name hooks");
});

test("the marketplace lists the skills and the hooks as two plugins", () => {
  const plugins = Object.fromEntries(json(".claude-plugin/marketplace.json").plugins.map((p) => [p.name, p.source]));
  assert.deepEqual(plugins, { suits: "./", "suits-hooks": "./plugins/suits-hooks" });
  assert.equal(json("plugins/suits-hooks/.claude-plugin/plugin.json").name, "suits-hooks");
  assert.ok(existsSync("plugins/suits-hooks/hooks/hooks.json"));
});

test("the hooks hold the read-only guard to the skills plugin's definitions", () => {
  const source = readFileSync("plugins/suits-hooks/hooks/register.tsx", "utf8");
  assert.match(source, /const SKILLS_PLUGIN = 'suits'/);
  assert.match(source, /readOnlyCharacter\(await agentType\(\$, e\.agentId\), SKILLS_PLUGIN\)/);
});
