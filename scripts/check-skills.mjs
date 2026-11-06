#!/usr/bin/env node
// Checks this repo's own rules (CLAUDE.md):
// - every skill under skills/characters and skills/tools has a SKILL.md whose
//   `name` is its folder and which has a description;
// - every skill is in plugin.json's `skills`, is listed in its bucket README
//   under User-invoked or Model-invoked to match `disable-model-invocation`,
//   and has a docs/<bucket>/<skill>.md page with the four standard sections;
// - every character's SKILL.md has a "Voice" and a "When to call" section;
// - nothing in plugin.json points at a missing skill;
// - every relative link in a Markdown file resolves.
// Then, if `claude` is on PATH, runs `claude plugin validate`, failing on any
// error or on any warning not listed in ACCEPTED_WARNINGS.
// Exits 1 with one line per problem.

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const BUCKETS = ["characters", "tools"];
const DOC_SECTIONS = ["What it does", "When to reach for it", "Common questions", "It's working if"];

// The repo root is the plugin root, so this repo's CLAUDE.md sits where a
// plugin's would; it is for working here, not plugin context. The plugin has
// no version on purpose: Claude Code then versions it by commit.
const ACCEPTED_WARNINGS = [
  /^CLAUDE\.md at the plugin root is not loaded as project context/,
  /^No version specified/,
];

const problems = [];
const read = (...parts) => readFileSync(join(repo, ...parts), "utf8");
const tracked = (path) => execFileSync("git", ["ls-files", "--", path], { cwd: repo, encoding: "utf8" }).trim() !== "";

function frontmatter(source) {
  const block = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  const field = (key) => block.match(new RegExp(`^${key}:\\s*(.*)$`, "m"))?.[1]?.trim();
  return {
    name: field("name"),
    description: field("description"),
    userInvoked: field("disable-model-invocation") === "true",
  };
}

// The skills linked under a `## <heading>` of a README, by folder name.
function linkedUnder(readme, heading) {
  const section = readme.split(/^## /m).find((s) => s.startsWith(heading)) ?? "";
  return new Set([...section.matchAll(/\]\(\.\/([\w-]+)\/SKILL\.md\)/g)].map((m) => m[1]));
}

const hasHeading = (source, title) => new RegExp(`^#{2,3} ${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m").test(source);

const plugin = JSON.parse(read(".claude-plugin", "plugin.json"));
const shipped = new Set(plugin.skills.map((p) => p.replace(/^\.\//, "")));
const found = new Set();

for (const bucket of BUCKETS) {
  const bucketDir = join(repo, "skills", bucket);
  const bucketReadme = read("skills", bucket, "README.md");
  const skills = readdirSync(bucketDir).filter(
    (d) => statSync(join(bucketDir, d)).isDirectory() && tracked(`skills/${bucket}/${d}`),
  );

  for (const skill of skills) {
    const where = `skills/${bucket}/${skill}`;
    found.add(where);
    if (!existsSync(join(bucketDir, skill, "SKILL.md"))) {
      problems.push(`${where}: no SKILL.md`);
      continue;
    }
    const source = read("skills", bucket, skill, "SKILL.md");
    const meta = frontmatter(source);
    if (meta.name !== skill) problems.push(`${where}: frontmatter name is "${meta.name}", folder is "${skill}"`);
    if (!meta.description) problems.push(`${where}: no description`);
    if (!shipped.has(where)) problems.push(`${where}: not in plugin.json's skills`);

    const group = meta.userInvoked ? "User-invoked" : "Model-invoked";
    if (!linkedUnder(bucketReadme, group).has(skill)) problems.push(`${where}: should be under "${group}" in skills/${bucket}/README.md`);

    const doc = join("docs", bucket, `${skill}.md`);
    if (!existsSync(join(repo, doc))) {
      problems.push(`${where}: no ${doc}`);
    } else {
      const page = read(doc);
      for (const title of DOC_SECTIONS) if (!hasHeading(page, title)) problems.push(`${doc}: no "${title}" section`);
    }

    if (bucket === "characters") {
      for (const title of ["Voice", "When to call"]) if (!hasHeading(source, title)) problems.push(`${where}: no "${title}" section`);
    }
  }
}

for (const entry of shipped) {
  if (!found.has(entry)) problems.push(`plugin.json: ${entry} is not a tracked skill folder`);
}

// Relative links, outside fenced code blocks.
function markdownFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const path = join(dir, e.name);
    if (e.isDirectory()) return e.name === "node_modules" || e.name.startsWith(".") ? [] : markdownFiles(path);
    return e.name.endsWith(".md") ? [path] : [];
  });
}
const rootMarkdown = readdirSync(repo).filter((f) => f.endsWith(".md")).map((f) => join(repo, f));
for (const file of [...rootMarkdown, ...markdownFiles(join(repo, "skills")), ...markdownFiles(join(repo, "docs"))]) {
  const prose = readFileSync(file, "utf8").replace(/^(```|~~~)[\s\S]*?^\1/gm, "").replace(/`[^`\n]*`/g, "");
  for (const [, target] of prose.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    // Skip URLs, anchors, absolute paths, and bare-word placeholders like `(url)`.
    if (/^(?:[a-z][\w+.-]*:|#|\/)/i.test(target) || /^[\w-]+$/.test(target)) continue;
    const path = decodeURIComponent(target.split("#")[0]);
    if (path && !existsSync(join(dirname(file), path))) problems.push(`${relative(repo, file)}: broken link ${target}`);
  }
}

let validated = "skipped (no `claude` on PATH)";
try {
  execFileSync("claude", ["--version"], { stdio: "ignore" });
  let output;
  try {
    output = execFileSync("claude", ["plugin", "validate", repo, "--json"], { encoding: "utf8" });
  } catch (error) {
    output = error.stdout; // exits 1 on errors; the JSON report is still on stdout
  }
  const report = JSON.parse(output);
  for (const target of [report.manifest, ...(report.contents ?? [])].filter(Boolean)) {
    const file = relative(repo, target.file);
    for (const e of target.errors) problems.push(`plugin validate: ${file}: ${e.path}: ${e.message}`);
    for (const w of target.warnings) {
      if (!ACCEPTED_WARNINGS.some((re) => re.test(w.message))) problems.push(`plugin validate: ${file}: ${w.path}: ${w.message}`);
    }
  }
  validated = "ran";
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} problem(s). plugin validate: ${validated}.`);
  process.exit(1);
}
console.log(`Skills check passed. plugin validate: ${validated}.`);
