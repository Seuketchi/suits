#!/usr/bin/env node
// Keeps the tool list in one source (ADR 0004). The source is the skill folders,
// `skills/<bucket>/<name>/SKILL.md` (its `disable-model-invocation`), and each
// character's "When to call" table, which says who calls a tool. From that it
// builds the copies:
//
// - `.claude-plugin/plugin.json`'s `skills`;
// - the root README's "User-invoked" and "Model-invoked" tool lists;
// - the User-invoked / Model-invoked grouping of `skills/tools/README.md` and
//   `skills/characters/README.md`, and each tool's "Called by" tail.
//
// The one-line summaries in the bucket READMEs are written by hand and kept by
// name, and so is the whole line of a user-invoked tool ("Started by the owner;
// offered by louis."), which no table can say.
//
//   node scripts/lists.mjs --write   rewrite the copies
//   node scripts/lists.mjs --check   exit 1, naming each copy that has drifted
//
// `--root <dir>` points either mode at another checkout (the tests use a copy).

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const BUCKETS = ["characters", "tools"];
const PLUGIN = ".claude-plugin/plugin.json";
const ROOT_README = "README.md";
const bucketReadme = (bucket) => `skills/${bucket}/README.md`;

const read = (root, file) => readFileSync(join(root, file), "utf8");

function frontmatter(source) {
  const block = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  const field = (key) => block.match(new RegExp(`^${key}:\\s*(.*)$`, "m"))?.[1]?.trim();
  return { description: field("description")?.replace(/^"(.*)"$/, "$1"), userInvoked: field("disable-model-invocation") === "true" };
}

// Every skill folder of a bucket, sorted by name.
function skillsOf(root, bucket) {
  const dir = join(root, "skills", bucket);
  return readdirSync(dir)
    .filter((n) => statSync(join(dir, n)).isDirectory() && existsSync(join(dir, n, "SKILL.md")))
    .sort()
    .map((name) => ({ name, bucket, ...frontmatter(read(root, `skills/${bucket}/${name}/SKILL.md`)) }));
}

// The tools a character's "When to call" table names, as `/suits:<name>` or `/<name>`.
function calledBy(root, characters, tool) {
  return characters
    .filter((c) => {
      const source = read(root, `skills/characters/${c.name}/SKILL.md`);
      const table = source.match(/^## When to call\s*\n([\s\S]*?)(?=^## |(?![\s\S]))/m)?.[1] ?? "";
      return [...table.matchAll(/^\| `\/(?:suits:)?([a-z][a-z0-9-]*)`/gm)].some((m) => m[1] === tool);
    })
    .map((c) => c.name);
}

// Replaces what sits under a heading line, up to the next heading, keeping the rest byte for byte.
function replaceUnder(text, heading, body) {
  const start = text.indexOf(`\n${heading}\n`);
  if (start < 0) throw new Error(`no "${heading}" heading`);
  const from = start + heading.length + 2;
  const next = text.slice(from).search(/^#{1,6} /m);
  const to = next < 0 ? text.length : from + next;
  return `${text.slice(0, from)}\n${body}\n${next < 0 ? "" : "\n"}${text.slice(to)}`;
}

const lines = (items) => (items.length > 0 ? items.join("\n") : "None yet.");

// The text of a README bullet that is kept by name: `- **[name](./name/SKILL.md)**: <text>`.
const bucketBullets = (text) => new Map([...text.matchAll(/^- \*\*\[([\w-]+)\]\(\.\/\1\/SKILL\.md\)\*\*: (.*)$/gm)].map((m) => [m[1], m[2]]));
const rootBullets = (text) => new Map([...text.matchAll(/^- `([\w-]+)`: (.*)$/gm)].map((m) => [m[1], m[2]]));
const firstSentence = (s = "") => s.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? s;

// What each copy should say, as { file: text }, given the repo at `root`.
export function expected(root) {
  const characters = skillsOf(root, "characters");
  const tools = skillsOf(root, "tools");
  const out = {};

  const plugin = JSON.parse(read(root, PLUGIN));
  plugin.skills = [...characters, ...tools].map((s) => `./skills/${s.bucket}/${s.name}`);
  out[PLUGIN] = `${JSON.stringify(plugin, null, 2)}\n`;

  for (const bucket of BUCKETS) {
    const file = bucketReadme(bucket);
    let text = read(root, file);
    const kept = bucketBullets(text);
    const bullet = (s) => {
      const summary = (kept.get(s.name) ?? firstSentence(s.description)).replace(/ Called by .*\.$/, "");
      if (s.userInvoked) return `- **[${s.name}](./${s.name}/SKILL.md)**: ${kept.get(s.name) ?? summary}`;
      const callers = bucket === "tools" ? calledBy(root, characters, s.name) : [];
      return `- **[${s.name}](./${s.name}/SKILL.md)**: ${summary}${callers.length > 0 ? ` Called by ${callers.join(", ")}.` : ""}`;
    };
    const skills = bucket === "characters" ? characters : tools;
    text = replaceUnder(text, "## User-invoked", lines(skills.filter((s) => s.userInvoked).map(bullet)));
    text = replaceUnder(text, "## Model-invoked", lines(skills.filter((s) => !s.userInvoked).map(bullet)));
    out[file] = text;
  }

  let text = read(root, ROOT_README);
  const kept = rootBullets(text);
  const bullet = (s) => {
    if (s.userInvoked) return `- \`${s.name}\`: ${kept.get(s.name) ?? "started by the owner."}`;
    const callers = calledBy(root, characters, s.name);
    return `- \`${s.name}\`: ${callers.length > 0 ? `called by ${callers.join(", ")}.` : "called by no character."}`;
  };
  text = replaceUnder(text, "### User-invoked", lines(tools.filter((s) => s.userInvoked).map(bullet)));
  text = replaceUnder(text, "### Model-invoked", lines(tools.filter((s) => !s.userInvoked).map(bullet)));
  out[ROOT_README] = text;

  return out;
}

// The copies that differ from what they should say.
export function drifted(root) {
  return Object.entries(expected(root)).filter(([file, text]) => read(root, file) !== text).map(([file]) => file);
}

function main(argv) {
  const mode = argv.find((a) => a === "--write" || a === "--check");
  const at = argv.indexOf("--root");
  const root = resolve(at >= 0 ? argv[at + 1] : join(dirname(fileURLToPath(import.meta.url)), ".."));
  if (!mode || (at >= 0 && !argv[at + 1])) {
    console.error("usage: node scripts/lists.mjs --write | --check [--root <dir>]");
    return 2;
  }
  const want = expected(root);
  const stale = Object.keys(want).filter((file) => read(root, file) !== want[file]);
  if (mode === "--write") {
    for (const file of stale) writeFileSync(join(root, file), want[file]);
    console.log(stale.length > 0 ? `Rewrote ${stale.join(", ")}.` : "The lists are up to date.");
    return 0;
  }
  if (stale.length > 0) {
    console.error(stale.map((file) => `${file}: out of date with the skill folders; run npm run lists`).join("\n"));
    return 1;
  }
  console.log("The lists are up to date.");
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) process.exit(main(process.argv.slice(2)));
