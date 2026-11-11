#!/usr/bin/env node
// Head-to-head runner: the same tasks, one arm at a time, scored by outcome graders.
//
//   node evals/head-to-head/run.mjs run    [--arm a,b] [--task t,u] [--runs 3] [--model sonnet]
//                                          [--max-budget-usd 1.5] [--out DIR] [--dry]
//   node evals/head-to-head/run.mjs rejudge [--judge-model sonnet] [--out DIR]
//   node evals/head-to-head/run.mjs report [--out DIR]
//
// An arm is a name in arms.json: { "pluginDir": path | null, "env": {...} }. The arm "baseline" has no
// plugin. Each run happens in a fresh temp folder (a copy of the task's fixture, if it has one), through
// `claude -p`, with `--setting-sources project` so user-level settings do not decide what is loaded.
// Plugin folders are given with --plugin-dir; nothing is installed into ~/.claude.
//
// Scoring is per task: the share of rubric items that pass. `judge` items are decided by a separate,
// plugin-free `claude -p` call that sees only the task prompt, the final answer and the tool names used,
// never the arm. `no_edit`, `tree_unchanged`, `regex` and `tool_used` items are decided in code.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const mode = argv.shift();
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
const flag = (name) => argv.includes(`--${name}`);

const OUT = resolve(opt("out", join(HERE, "results")));
const tasksFile = JSON.parse(readFileSync(join(HERE, "tasks.json"), "utf8"));
const ARMS_DIR = process.env.H2H_ARMS_DIR ?? "";
const arms = JSON.parse(readFileSync(join(HERE, "arms.json"), "utf8").replaceAll("ARMS_DIR", ARMS_DIR));

const EDIT_TOOLS = new Set(["Edit", "Write", "NotebookEdit"]);
const WRITING_BASH = /(^|[\s;&|])(rm|mv|cp|tee|touch|mkdir|sed\s+-i|git\s+(commit|add|checkout|reset|apply))\b|>>?\s*[^\s&]/;

function snapshot(dir) {
  const h = createHash("sha256");
  const walk = (d) => {
    for (const name of readdirSync(d).sort()) {
      if (name === ".git" || name === "node_modules") continue;
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else h.update(p.slice(dir.length) + "\0" + readFileSync(p));
    }
  };
  walk(dir);
  return h.digest("hex");
}

function parseStream(stdout) {
  const trace = [];
  let init = null;
  let result = null;
  for (const line of stdout.split("\n")) {
    if (!line.trim()) continue;
    let ev;
    try {
      ev = JSON.parse(line);
    } catch {
      continue;
    }
    if (ev.type === "system" && ev.subtype === "init") init = ev;
    else if (ev.type === "assistant") {
      for (const c of ev.message?.content ?? []) if (c.type === "tool_use") trace.push({ name: c.name, input: c.input });
    } else if (ev.type === "result") result = ev;
  }
  return { trace, init, result };
}

function runOnce({ arm, task, model, budget, runIndex }) {
  const cfg = arms[arm];
  const work = mkdtempSync(join(tmpdir(), `h2h-${arm}-${task.id}-`));
  if (task.fixture) cpSync(join(HERE, "fixtures", task.fixture), work, { recursive: true });
  const before = snapshot(work);
  const args = [
    "-p", task.prompt,
    "--model", model,
    "--output-format", "stream-json", "--verbose",
    "--no-session-persistence",
    "--setting-sources", "project",
    "--permission-mode", "dontAsk",
    "--allowedTools", `Skill Agent ${task.allowedTools}`,
    "--max-budget-usd", String(budget),
  ];
  if (cfg.pluginDir) args.push("--plugin-dir", resolve(cfg.pluginDir));
  const env = { ...process.env, ...(cfg.env ?? {}) };
  for (const k of ["CLAUDE_CODE_PLUGIN_DIRS", "CLAUDECODE", "CLAUDE_CODE_CHILD_SESSION", "CLAUDE_CODE_ENTRYPOINT", "SUITS_HELPER"]) delete env[k];
  const t0 = Date.now();
  const p = spawnSync("claude", args, { cwd: work, env, encoding: "utf8", maxBuffer: 256 * 1024 * 1024, timeout: 15 * 60 * 1000 });
  const wallMs = Date.now() - t0;
  const { trace, init, result } = parseStream(p.stdout ?? "");
  const after = snapshot(work);
  rmSync(work, { recursive: true, force: true });
  const u = result?.usage ?? {};
  return {
    arm, task: task.id, run: runIndex, model, wallMs,
    exit: p.status, error: result?.is_error ? result?.result : (p.status ? (p.stderr ?? "").slice(0, 500) : null),
    answer: result?.result ?? "",
    trace: trace.map((t) => ({ name: t.name, cmd: t.input?.command, skill: t.input?.skill })),
    treeChanged: before !== after,
    skillsLoaded: init?.skills ?? null,
    pluginsLoaded: init?.plugins ?? null,
    tokens: {
      input: u.input_tokens ?? 0, output: u.output_tokens ?? 0,
      cacheRead: u.cache_read_input_tokens ?? 0, cacheWrite: u.cache_creation_input_tokens ?? 0,
    },
    costUsd: result?.total_cost_usd ?? 0,
    turns: result?.num_turns ?? null,
  };
}

function judge(task, run, items, judgeModel) {
  if (!items.length) return {};
  const tools = [...new Set(run.trace.map((t) => t.name))].join(", ") || "none";
  const prompt = [
    "You are grading one answer to a task. Grade only the outcome: what the answer says and does.",
    "Ignore style, length, format, tone and any persona. Do not give credit for claims the answer does not make.",
    "",
    "TASK GIVEN TO THE ASSISTANT:", task.prompt, "",
    "TOOLS THE ASSISTANT CALLED: " + tools, "",
    "FINAL ANSWER:", run.answer || "(empty)", "",
    "For each item, answer true only if the final answer clearly satisfies it.",
    'Reply with one JSON object and nothing else, mapping each item id to true or false, e.g. {"a": true, "b": false}.', "",
    "ITEMS:", ...items.map((i) => `- ${i.id}: ${i.text}`),
  ].join("\n");
  const p = spawnSync("claude", ["-p", prompt, "--model", judgeModel, "--output-format", "text", "--no-session-persistence", "--setting-sources", "project", "--disable-slash-commands", "--tools", ""], {
    encoding: "utf8", cwd: tmpdir(), timeout: 5 * 60 * 1000,
    env: Object.fromEntries(Object.entries(process.env).filter(([k]) => !["CLAUDE_CODE_PLUGIN_DIRS", "CLAUDECODE", "CLAUDE_CODE_CHILD_SESSION", "CLAUDE_CODE_ENTRYPOINT", "SUITS_HELPER"].includes(k))),
  });
  const m = (p.stdout ?? "").match(/\{[\s\S]*\}/);
  try {
    return JSON.parse(m[0]);
  } catch {
    return null;
  }
}

function score(task, run, judgeModel) {
  const verdicts = {};
  const judged = task.rubric.filter((i) => i.kind === "judge");
  const j = run.error && !run.answer ? {} : judge(task, run, judged, judgeModel);
  for (const item of task.rubric) {
    if (item.kind === "judge") verdicts[item.id] = j ? j[item.id] === true : null;
    else if (item.kind === "no_edit") verdicts[item.id] = !run.treeChanged && !run.trace.some((t) => EDIT_TOOLS.has(t.name) || (t.name === "Bash" && WRITING_BASH.test(t.cmd ?? "")));
    else if (item.kind === "tree_unchanged") verdicts[item.id] = !run.treeChanged;
    else if (item.kind === "regex") verdicts[item.id] = new RegExp(item.pattern, "i").test(run.answer);
    else if (item.kind === "tool_used") verdicts[item.id] = run.trace.some((t) => item.tools.includes(t.name));
  }
  // An item marked "info" is recorded but not scored (for example a write that the prompt did not forbid).
  const scored = task.rubric.filter((i) => !i.info).map((i) => verdicts[i.id]);
  return { verdicts, score: scored.includes(null) ? null : scored.filter(Boolean).length / scored.length, judgeFailed: scored.includes(null) };
}

if (mode === "run") {
  const model = opt("model", "sonnet");
  const judgeModel = opt("judge-model", "haiku");
  const runs = Number(opt("runs", "3"));
  const budget = Number(opt("max-budget-usd", "1.5"));
  const wantArms = (opt("arm", Object.keys(arms).join(",")) ?? "").split(",");
  const wantTasks = opt("task", "")?.split(",").filter(Boolean);
  const tasks = tasksFile.tasks.filter((t) => !wantTasks.length || wantTasks.includes(t.id));
  mkdirSync(OUT, { recursive: true });
  for (const arm of wantArms) {
    if (!arms[arm]) throw new Error(`unknown arm ${arm}`);
    for (const task of tasks) {
      for (let r = 1; r <= runs; r++) {
        const file = join(OUT, `${arm}__${task.id}__${r}.json`);
        if (existsSync(file)) continue;
        if (flag("dry")) {
          console.log(`would run ${arm} ${task.id} #${r}`);
          continue;
        }
        const run = runOnce({ arm, task, model, budget, runIndex: r });
        Object.assign(run, score(task, run, judgeModel));
        writeFileSync(file, JSON.stringify(run, null, 2));
        console.log(`${arm} ${task.id} #${r}: score ${run.score?.toFixed(2)} tokens ${run.tokens.input + run.tokens.output + run.tokens.cacheRead + run.tokens.cacheWrite} ${Math.round(run.wallMs / 1000)}s ${run.error ? "ERROR " + run.error : ""}`);
      }
    }
  }
} else if (mode === "rejudge") {
  // Score the saved answers again with another judge model; the earlier verdicts are kept as judge1.
  const judgeModel = opt("judge-model", "sonnet");
  for (const f of readdirSync(OUT).filter((x) => x.endsWith(".json")).sort()) {
    const run = JSON.parse(readFileSync(join(OUT, f), "utf8"));
    if (run.judgeModel === judgeModel) continue;
    const task = tasksFile.tasks.find((t) => t.id === run.task);
    const prev = { model: run.judgeModel ?? "haiku", verdicts: run.verdicts, score: run.score };
    const again = score(task, run, judgeModel);
    Object.assign(run, again, { judgeModel, judge1: prev });
    writeFileSync(join(OUT, f), JSON.stringify(run, null, 2));
    console.log(`${f}: ${prev.score?.toFixed(2)} (${prev.model}) -> ${run.score?.toFixed(2)} (${judgeModel})`);
  }
} else if (mode === "report") {
  const rows = readdirSync(OUT).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(join(OUT, f), "utf8")));
  const cell = new Map();
  for (const r of rows) {
    const k = `${r.task}\t${r.arm}`;
    (cell.get(k) ?? cell.set(k, []).get(k)).push(r);
  }
  const armNames = [...new Set(rows.map((r) => r.arm))];
  const taskIds = tasksFile.tasks.map((t) => t.id).filter((id) => rows.some((r) => r.task === id));
  const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
  console.log("| task | " + armNames.map((a) => `${a} (score, runs, tokens, s)`).join(" | ") + " |");
  console.log("|---|" + armNames.map(() => "---").join("|") + "|");
  const totals = Object.fromEntries(armNames.map((a) => [a, []]));
  for (const id of taskIds) {
    const cols = armNames.map((a) => {
      const rs = cell.get(`${id}\t${a}`) ?? [];
      const ok = rs.filter((r) => r.score !== null && !r.error);
      if (!rs.length) return "-";
      totals[a].push(...ok.map((r) => r.score));
      const tok = mean(ok.map((r) => r.tokens.input + r.tokens.output + r.tokens.cacheRead + r.tokens.cacheWrite));
      return `${mean(ok.map((r) => r.score)).toFixed(2)}, ${ok.length}/${rs.length}, ${Math.round(tok / 1000)}k, ${Math.round(mean(ok.map((r) => r.wallMs)) / 1000)}`;
    });
    console.log(`| ${id} | ${cols.join(" | ")} |`);
  }
  console.log("| all tasks | " + armNames.map((a) => `${mean(totals[a]).toFixed(2)}, ${totals[a].length}`).join(" | ") + " |");
} else {
  console.error("usage: run.mjs run|report [options]");
  process.exit(2);
}
