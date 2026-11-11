// The decisions of the rules hooks, as pure functions: no `$`, no file reads.
// `register.tsx` reads the rules file and asks these what to do. Every rule
// comes from the project's own rules file; none is written here.

export const RULES_PATH = ".claude/suits-rules.json";

export const NO_FILE_TEXT = `No suits rules file here (${RULES_PATH}). The rule hooks are off.`;

// Keys the engine adds beside a tool's own arguments.
const RESERVED = new Set(["tool", "tool_use_id", "consent"]);
const PATH_TOOLS = new Set(["Edit", "Write", "Read", "MultiEdit", "NotebookEdit"]);

const fail = (reason) => ({ status: "broken", reason });

// The rules file stands there but could not be read. Nothing from it is
// applied, and it is reported like a file that does not parse.
export const unreadableRules = (message) => fail(`the file exists but could not be read (${message})`);

// Only this many characters (UTF-16, not bytes) of a call's input are tested, so a slow pattern
// cannot freeze a call on a long input.
export const MAX_SUBJECT = 4096;

// A filter, not a proof. It misses an alternation inside a repeated group,
// `(a|a)+$` (exponential), and adjacent overlapping repeats, `a+a+a+$`
// (polynomial). The cap on the input does not protect against these either.
// A quantified group that holds a quantifier (`(a+)+`, `(a*)*`) can backtrack
// without end. Returns true for a pattern that has one. It is conservative: a
// rule that trips it is dropped and reported, and can be written another way.
export function canRunAway(pattern) {
  const groups = [{ quantified: false }];
  const top = () => groups[groups.length - 1];
  let afterQuantifier = false;
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === "\\") {
      i++;
      afterQuantifier = false;
    } else if (c === "[") {
      for (i++; i < pattern.length && pattern[i] !== "]"; i++) if (pattern[i] === "\\") i++;
      afterQuantifier = false;
    } else if (c === "(") {
      groups.push({ quantified: false });
      if (pattern[i + 1] === "?") {
        i += 2;
        if (pattern[i] === "<" && pattern[i + 1] !== "=" && pattern[i + 1] !== "!") i = pattern.indexOf(">", i);
        else if (pattern[i] === "<") i++;
        if (i < 0) return false; // not a valid pattern; RegExp reports it
      }
      afterQuantifier = false;
    } else if (c === ")") {
      if (groups.length === 1) return false;
      const group = groups.pop();
      const next = pattern[i + 1];
      const repeats = next === "*" || next === "+" || (next === "{" && /^\{\d+(,\d*)?\}/.test(pattern.slice(i + 1)));
      if (repeats && group.quantified) return true;
      if (repeats || group.quantified) top().quantified = true;
      afterQuantifier = false;
    } else if (c === "*" || c === "+" || (c === "?" && !afterQuantifier) || (c === "{" && /^\{\d+(,\d*)?\}/.test(pattern.slice(i)))) {
      top().quantified = true;
      if (c === "{") i = pattern.indexOf("}", i);
      afterQuantifier = true;
    } else {
      afterQuantifier = false;
    }
  }
  return false;
}

const checkRule = (kind, rule, index) => {
  const where = `${kind}[${index}]`;
  if (rule === null || typeof rule !== "object" || Array.isArray(rule)) return `${where} is not an object`;
  for (const key of ["id", "why", "match"]) {
    if (typeof rule[key] !== "string" || rule[key] === "") return `${where} needs a "${key}" string`;
  }
  if (rule.tools !== undefined && !(Array.isArray(rule.tools) && rule.tools.every((t) => typeof t === "string"))) {
    return `${where}: "tools" must be a list of tool names`;
  }
  try {
    new RegExp(rule.match);
  } catch (error) {
    return `${where}: "match" is not a valid regular expression (${error.message})`;
  }
  if (canRunAway(rule.match)) {
    return `${where}: "match" repeats a group that already repeats, which can backtrack without end; write it another way`;
  }
  return undefined;
};

// `text` is the rules file's text, or undefined when there is no file.
// A file that is not a rules file at all is "broken". A bad rule inside a good
// file is dropped alone and listed in `problems`; the valid rules stay.
export function parseRules(text) {
  if (text === undefined) return { status: "missing" };
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    return fail(`not valid JSON (${error.message})`);
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    return fail('the top level must be an object with "never" and "warn" lists');
  }
  const rules = { never: [], warn: [] };
  const problems = [];
  for (const kind of ["never", "warn"]) {
    if (data[kind] === undefined) continue;
    if (!Array.isArray(data[kind])) return fail(`"${kind}" must be a list`);
    for (const [index, rule] of data[kind].entries()) {
      const problem = checkRule(kind, rule, index);
      if (problem) {
        problems.push(problem);
        continue;
      }
      const { id, why, match, tools } = rule;
      rules[kind].push({ id, why, match, ...(tools ? { tools } : {}) });
    }
  }
  return { status: "ok", rules, problems };
}

// What a rule's `match` is tested against: the path for the file tools, the
// command for Bash, any other tool's input as JSON.
export function describeInput(call) {
  if (PATH_TOOLS.has(call.tool) && typeof call.file_path === "string") return call.file_path;
  if (call.tool === "NotebookEdit" && typeof call.notebook_path === "string") return call.notebook_path;
  if (call.tool === "Bash" && typeof call.command === "string") return call.command;
  const input = {};
  for (const [key, value] of Object.entries(call)) if (!RESERVED.has(key)) input[key] = value;
  return JSON.stringify(input);
}

const applies = (rule, call, subject) =>
  (rule.tools === undefined || rule.tools.includes(call.tool)) && new RegExp(rule.match).test(subject);

const hit = (rule) => ({ id: rule.id, why: rule.why, message: `${rule.id}: ${rule.why}` });

// `call` is the tool.call input: { tool, ...the tool's arguments }.
// A `never` match blocks, and the first one decides. Otherwise every `warn`
// match is returned. Otherwise the call passes.
export function decide(rules, call) {
  if (!rules) return { action: "pass" };
  const subject = describeInput(call).slice(0, MAX_SUBJECT);
  const never = rules.never.find((rule) => applies(rule, call, subject));
  if (never) return { action: "block", ...hit(never) };
  const hits = rules.warn.filter((rule) => applies(rule, call, subject)).map(hit);
  return hits.length ? { action: "warn", hits } : { action: "pass" };
}

// Each directory from `start` up to the root, nearest first. The caller stops
// at the git root.
export function searchDirs(start) {
  const dirs = [];
  let dir = start.length > 1 ? start.replace(/\/+$/, "") : start;
  for (;;) {
    dirs.push(dir || "/");
    const parent = dir.slice(0, dir.lastIndexOf("/"));
    if (dir === "" || dir === "/" || parent === dir) break;
    dir = parent;
  }
  return dirs;
}

// The owner's toast for a decision; undefined when nothing happened.
export function toastFor(decision, tool) {
  if (decision.action === "block") return `suits blocked ${tool}: ${decision.message}`;
  if (decision.action === "warn") return decision.hits.map((h) => `suits warning: ${h.message}`).join("; ");
  return undefined;
}

// The lines the model reads after the tool's result.
export function warnNotes(decision) {
  return decision.action === "warn" ? decision.hits.map((h) => `suits warning: ${h.message}`) : [];
}

// The text of `/suits-rules`. `path` is where the file was found.
export function rulesReport(path, parsed) {
  if (parsed.status === "missing") return NO_FILE_TEXT;
  if (parsed.status === "broken") {
    return `${path}\nThe rules file could not be read: ${parsed.reason}. It is ignored, so every call passes.`;
  }
  const ignored = parsed.problems.map((problem) => `ignored\t${problem}`);
  const line = (kind, r) => [kind, r.id, r.why, r.tools ? r.tools.join(",") : "all", r.match].join("\t");
  return [path, ...parsed.rules.never.map((r) => line("never", r)), ...parsed.rules.warn.map((r) => line("warn", r)), ...ignored].join("\n");
}

// Helper mode: the one switch, `SUITS_HELPER`. Any value but empty or 0 turns
// it on. Whoever starts a session sets it; this plugin only reads it.
export const helperOn = (value) => value !== undefined && value.trim() !== "" && value.trim() !== "0";

export const HELPER_DENY = "This session is a helper: do the work yourself in one pass (Working alone).";
export const HELPER_TOAST = "suits blocked a new session: helper mode";
export const HELPER_PROMPT =
  "Helper mode is on: follow the Working alone section of the character you are running.";

// The characters, from the folders plugin.json lists under skills/characters.
export function charactersFrom(manifestText) {
  let skills;
  try {
    skills = JSON.parse(manifestText).skills;
  } catch {
    return [];
  }
  if (!Array.isArray(skills)) return [];
  return skills
    .map((path) => (typeof path === "string" ? path.match(/^\.\/skills\/characters\/([^/]+)\/?$/)?.[1] : undefined))
    .filter((name) => name !== undefined);
}

// The character a skill stands for. A plugin skill arrives as `suits:<name>`
// (checked on a live session, by `/suits:louis` and by the Skill tool); a bare
// listed name counts when the event says the skill comes from this plugin.
// A tool is none.
export function characterOf(skill, characters, pluginName) {
  const name = skill.startsWith("suits:") ? skill.slice("suits:".length) : pluginName === "suits" ? skill : undefined;
  return name !== undefined && characters.includes(name) ? name : undefined;
}

// The status line text; undefined clears it.
export function statusFor(character, helper) {
  if (character) return helper ? `${character} · helper` : character;
  return helper ? "helper" : undefined;
}

// The checklist behind the `suits_checklist` tool and the pane. Steps are
// numbered from 1, as the pane shows them.
export const EMPTY_CHECKLIST = { steps: [], done: [] };
export const MAX_STEPS = 50;
export const MAX_STEP_LENGTH = 200;

// `current` is { steps, done }; `input` is what the model sent: `steps` sets the
// list (and clears what was done), `done` adds step numbers to those done.
// Anything it cannot use is left out and named in `notes`.
export function applyChecklist(current, input) {
  const notes = [];
  let { steps, done } = current;

  if (input.steps !== undefined) {
    const valid = Array.isArray(input.steps) && input.steps.length > 0 && input.steps.every((s) => typeof s === "string" && s.trim() !== "");
    if (valid) {
      if (input.steps.length > MAX_STEPS) notes.push(`only the first ${MAX_STEPS} steps are kept`);
      const kept = input.steps.slice(0, MAX_STEPS).map((s) => s.trim());
      const cut = kept.filter((s) => s.length > MAX_STEP_LENGTH).length;
      if (cut > 0) notes.push(`${cut} ${cut === 1 ? "step was" : "steps were"} cut to ${MAX_STEP_LENGTH} characters`);
      steps = kept.map((s) => s.slice(0, MAX_STEP_LENGTH));
      done = [];
    } else {
      notes.push('"steps" must be a non-empty list of non-empty strings; the list is unchanged');
    }
  }

  if (input.done !== undefined) {
    const numbers = Array.isArray(input.done) ? input.done : [input.done];
    const bad = numbers.filter((n) => !(Number.isInteger(n) && n >= 1 && n <= steps.length));
    if (bad.length > 0) notes.push(`ignored ${bad.join(", ")}: a step number is a whole number from 1 to ${steps.length}`);
    const good = numbers.filter((n) => Number.isInteger(n) && n >= 1 && n <= steps.length);
    done = [...new Set([...done, ...good])].sort((a, b) => a - b);
  }

  return { checklist: { steps, done }, notes };
}

export const checklistCount = ({ steps, done }) => `${done.length} of ${steps.length} done`;

export const checklistRows = ({ steps, done }) =>
  steps.map((text, i) => ({ number: i + 1, text, isDone: done.includes(i + 1) }));

// What the tool answers: the list as text, the count, and any notes.
export function checklistText(checklist, notes) {
  if (checklist.steps.length === 0) return "No steps yet. Call with steps to set them.";
  const lines = checklistRows(checklist).map((r) => `${r.number}. [${r.isDone ? "x" : " "}] ${r.text}`);
  return [...lines, checklistCount(checklist), ...notes].join("\n");
}

// What `/suits-checklist` and `/suits-cast` answer, from what `$.ui.open`
// returned: "opened" only when a surface draws the pane now, else why it does not.
export function paneText(opened, title = "Checklist") {
  if (opened && opened.isPlaced) return `${title} pane opened.`;
  return `${title} pane is open but not shown: ${opened?.reason ?? "no surface draws it yet"}`;
}

// The cast board: who holds the work, how it passed on, and the last tool each
// character called. Kept for the session by the caller; never written anywhere.
// `loops` maps a loop id ('' is the main loop) to the character holding it.
export const EMPTY_CAST = { holder: "", loops: {}, handoffs: [], lastTool: {} };
export const MAX_HANDOFFS = 20;

const isText = (value) => typeof value === "string" && value !== "";

// `event` is { kind: 'skill', skill, loop?, pluginName? } or { kind: 'tool', tool, loop? }.
// Returns the next board; an event it cannot use returns `board` unchanged.
export function castEvent(board, event, characters) {
  if (event === null || typeof event !== "object" || !Array.isArray(characters)) return board;
  if (event.loop !== undefined && typeof event.loop !== "string") return board;
  const loop = event.loop;

  let label;
  if (event.kind === "tool" && isText(event.tool)) {
    label = event.tool;
  } else if (event.kind === "skill" && isText(event.skill)) {
    const character = characterOf(event.skill, characters, event.pluginName);
    if (character === undefined) label = `/${event.skill}`;
    else return take(board, character, loop);
  } else {
    return board;
  }

  const key = loop ?? "";
  if (!Object.hasOwn(board.loops, key)) return board;
  const holder = board.loops[key];
  return { ...board, lastTool: { ...board.lastTool, [holder]: label } };
}

// A character takes a loop. A skill prompt carries no loop: the Skill call that
// raised it was already counted when some loop holds the character, else the
// main loop takes it.
function take(board, character, loop) {
  if (loop === undefined && Object.values(board.loops).includes(character)) return board;
  const into = loop ?? "";
  if (Object.hasOwn(board.loops, into) && board.loops[into] === character) return board;
  const handoffs =
    board.holder !== "" && board.holder !== character
      ? [...board.handoffs, { from: board.holder, to: character }].slice(-MAX_HANDOFFS)
      : board.handoffs;
  return { ...board, holder: character, loops: { ...board.loops, [into]: character }, handoffs };
}

// The pane's lines; one tool row per character, in the order each one's tool was first recorded.
export const castRows = (board) => ({
  holder: board.holder,
  handoffs: board.handoffs.map((h) => `${h.from} → ${h.to}`),
  tools: Object.entries(board.lastTool).map(([character, tool]) => ({ character, tool })),
});

// donna's action log, read-only. The caller finds the file the way it finds the rules file.
export const ACTION_LOG_PATH = "donna/action-log.md";
export const MAX_ACTION_ROWS = 10;

const cellsOf = (line) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
const isTableLine = (line) => line.trim().startsWith("|");
const isSeparator = (line) => isTableLine(line) && cellsOf(line).every((cell) => /^:?-+:?$/.test(cell));

// `text` is the file's text, or undefined when there is no file. Reads the first
// table with ID, Owner, Task and Status columns (Due optional), by name, any order.
export function parseActionLog(text) {
  if (typeof text !== "string") return { status: "missing" };
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (!isTableLine(lines[i])) continue;
    const names = cellsOf(lines[i]).map((cell) => cell.toLowerCase());
    if (!["id", "owner", "task", "status"].every((name) => names.includes(name))) continue;
    const column = (name) => names.indexOf(name);
    const rows = [];
    for (let j = i + 1; j < lines.length && isTableLine(lines[j]); j++) {
      if (isSeparator(lines[j])) continue;
      const cells = cellsOf(lines[j]);
      const at = (name) => (column(name) >= 0 ? (cells[column(name)] ?? "") : "");
      if (cells.every((cell) => cell === "")) continue;
      rows.push({ id: at("id"), owner: at("owner"), task: at("task"), due: at("due"), status: at("status") });
    }
    return { status: "ok", rows };
  }
  return { status: "ok", rows: [] };
}

const CLOSED = new Set(["done", "dropped"]);

export function actionLogLines(log) {
  if (log.status === "missing") return ["No action log."];
  if (log.rows.length === 0) return ["No actions yet."];
  const counts = new Map();
  for (const { status } of log.rows) counts.set(status, (counts.get(status) ?? 0) + 1);
  const count = [...counts].map(([status, n]) => `${n} ${status || "no status"}`).join(", ");
  const open = log.rows.filter((r) => !CLOSED.has(r.status.toLowerCase()));
  const shown = open.slice(0, MAX_ACTION_ROWS).map((r) => {
    const head = [r.id, r.status, r.owner].filter((part) => part !== "").join(" ");
    return `${head}: ${r.task}${r.due ? ` (due ${r.due})` : ""}`;
  });
  const cut = open.length - shown.length;
  return [count, ...shown, ...(cut > 0 ? [`and ${cut} more`] : [])];
}

export const isActionLogPath = (path) =>
  typeof path === "string" && (path === ACTION_LOG_PATH || path.endsWith(`/${ACTION_LOG_PATH}`));
