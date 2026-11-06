#!/usr/bin/env node
// morning-brief's only way to write anything. The headless session may run
// read-only `gh` commands and this script, nothing else — so every write it
// can make is one of the two below, checked against the user config:
//
//   node brief.mjs config                         print the config and your login
//   node brief.mjs history                        print the last 14 days' briefs
//   node brief.mjs save "<summary>" < body.md     write today's brief file, notify
//   node brief.mjs pending-review <owner/repo> <pr> < body.md
//                                                 start a PENDING review (never submitted)
//   node brief.mjs run [--force]                  once a day: start the headless session
//
// Config: $MORNING_BRIEF_CONFIG, else ~/.config/morning-brief/config.json
//   { "repos": ["owner/repo", ...], "briefDir": "~/briefs", "onSave": ["cmd", "arg"] }
//   briefDir and onSave are optional. onSave runs after each save with one more
//   argument: counts worked out here from the brief's headings, e.g.
//   "2 reviews, 1 your PRs, 18 assigned, 5 triage" — never text the model wrote,
//   so a ping sent off the machine carries no titles.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = resolve(HERE, "..");

function fail(message) {
  process.stderr.write(`morning-brief: ${message}\n`);
  process.exit(1);
}

export function loadConfig(path = process.env.MORNING_BRIEF_CONFIG || join(homedir(), ".config/morning-brief/config.json")) {
  if (!existsSync(path)) fail(`no config at ${path} — see the skill's "Config" section`);
  const config = JSON.parse(readFileSync(path, "utf8"));
  const repo = /^[\w.-]+\/[\w.-]+$/;
  if (!Array.isArray(config.repos) || !config.repos.length || !config.repos.every((r) => repo.test(r))) {
    fail(`config "repos" must be a non-empty list of owner/repo`);
  }
  const briefDir = (config.briefDir ?? "~/briefs").replace(/^~(?=\/|$)/, homedir());
  if (config.onSave !== undefined && (!Array.isArray(config.onSave) || !config.onSave.length || !config.onSave.every((a) => typeof a === "string"))) {
    fail(`config "onSave" must be a non-empty list of strings`);
  }
  const onSave = config.onSave?.map((a) => a.replace(/^~(?=\/|$)/, homedir()));
  return { repos: config.repos, briefDir, onSave };
}

const today = () => new Date().toLocaleDateString("en-CA");

const gh = (args, input) => execFileSync("gh", args, { encoding: "utf8", input });

function readBody() {
  const body = readFileSync(0, "utf8").trim();
  if (!body) fail("empty body on stdin");
  return body;
}

function history(config) {
  if (!existsSync(config.briefDir)) return;
  const files = readdirSync(config.briefDir).filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f)).sort().slice(-14);
  for (const f of files) process.stdout.write(`===== ${f}\n${readFileSync(join(config.briefDir, f), "utf8")}\n`);
}

const SECTIONS = [["Needs your review", "reviews"], ["Your PRs", "your PRs"], ["Assigned to you", "assigned"], ["Triage suggestions", "triage"]];

export function countBrief(body) {
  const counts = [];
  for (const chunk of body.split(/^## /m).slice(1)) {
    const section = SECTIONS.find(([heading]) => chunk.startsWith(heading));
    if (!section) continue;
    const lines = chunk.split("\n");
    const more = lines.map((l) => /^(?:- )?\+(\d+) more/.exec(l)).find(Boolean);
    const items = lines.filter((l) => /^- /.test(l) && !/^- \+\d+ more/.test(l)).length;
    const n = items + (more ? Number(more[1]) : 0);
    if (n) counts.push(`${n} ${section[1]}`);
  }
  return counts.join(", ") || "nothing waiting";
}

function save(config, summary) {
  const body = readBody();
  mkdirSync(config.briefDir, { recursive: true });
  const file = join(config.briefDir, `${today()}.md`);
  writeFileSync(file, body + "\n");
  // A missing notifier isn't a failed brief: the file is what matters.
  spawnSync("notify-send", ["--app-name=Morning brief", "Brief ready", summary || file], { stdio: "ignore" });
  if (config.onSave) {
    const [cmd, ...args] = config.onSave;
    const ping = spawnSync(cmd, [...args, countBrief(body)], { stdio: ["ignore", "ignore", "pipe"], encoding: "utf8", timeout: 30000 });
    if (ping.status !== 0) process.stderr.write(`morning-brief: onSave failed (${ping.error?.message ?? ping.stderr.trim()}); the brief is saved\n`);
  }
  process.stdout.write(`saved ${file}\n`);
}

function pendingReview(config, repo, pr) {
  if (!config.repos.includes(repo)) fail(`${repo} is not in config "repos"`);
  if (!/^\d+$/.test(pr ?? "")) fail("PR number must be digits");
  const login = gh(["api", "user", "--jq", ".login"]).trim();
  const reviews = JSON.parse(gh(["api", `repos/${repo}/pulls/${pr}/reviews`, "--paginate"]));
  if (reviews.some((r) => r.state === "PENDING" && r.user?.login === login)) {
    process.stdout.write(`${repo}#${pr} already has your pending review; left it alone\n`);
    return;
  }
  // No "event" field: GitHub keeps the review PENDING, visible only to you.
  gh(["api", "--method", "POST", `repos/${repo}/pulls/${pr}/reviews`, "--input", "-"], JSON.stringify({ body: readBody() }));
  process.stdout.write(`pending review started on ${repo}#${pr}\n`);
}

function run(config) {
  const stateDir = join(process.env.XDG_STATE_HOME || join(homedir(), ".local/state"), "morning-brief");
  const stamp = join(stateDir, "last-run");
  if (existsSync(stamp) && readFileSync(stamp, "utf8").trim() === today() && !process.argv.includes("--force")) {
    process.stdout.write(`already ran today (${today()})\n`);
    return;
  }
  mkdirSync(stateDir, { recursive: true });
  const script = join(HERE, "brief.mjs");
  const skill = join(SKILL_DIR, "SKILL.md");
  const allowed = [
    `Read(${skill})`,
    ...["issue list", "issue view", "pr list", "pr view", "pr diff", "pr checks", "search issues", "search prs"].map((c) => `Bash(gh ${c}:*)`),
    `Bash(node ${script} config)`,
    `Bash(node ${script} history)`,
    `Bash(node ${script} save:*)`,
    `Bash(node ${script} pending-review:*)`,
  ];
  const result = spawnSync("claude", [
    "-p", `Read ${skill} and follow it. This is the scheduled run. <this-skill> is ${SKILL_DIR}. Today is ${today()}.`,
    "--permission-mode", "dontAsk",
    "--allowedTools", ...allowed,
  ], { stdio: ["ignore", "inherit", "inherit"] });
  if (result.status === 0) writeFileSync(stamp, today() + "\n");
  process.exit(result.status ?? 1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [command, ...rest] = process.argv.slice(2);
  const config = loadConfig();
  if (command === "config") {
    const login = gh(["api", "user", "--jq", ".login"]).trim();
    process.stdout.write(JSON.stringify({ login, repos: config.repos, briefDir: config.briefDir }, null, 2) + "\n");
  } else if (command === "history") history(config);
  else if (command === "save") save(config, rest[0]);
  else if (command === "pending-review") pendingReview(config, rest[0], rest[1]);
  else if (command === "run") run(config);
  else fail("usage: brief.mjs config | history | save '<summary>' | pending-review <owner/repo> <pr> | run [--force]");
}
