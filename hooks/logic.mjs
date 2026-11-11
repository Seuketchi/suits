// The decisions of the rules hooks, as pure functions: no `$`, no file reads.
// `register.ts` reads the rules file and asks these what to do. Every rule
// comes from the project's own rules file; none is written here.

export const RULES_PATH = ".claude/suits-rules.json";

export const NO_FILE_TEXT = `No suits rules file here (${RULES_PATH}). The rule hooks are off.`;

// Keys the engine adds beside a tool's own arguments.
const RESERVED = new Set(["tool", "tool_use_id", "consent"]);
const PATH_TOOLS = new Set(["Edit", "Write", "Read", "MultiEdit", "NotebookEdit"]);

const fail = (reason) => ({ status: "broken", reason });

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
  return undefined;
};

// `text` is the rules file's text, or undefined when there is no file.
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
  for (const kind of ["never", "warn"]) {
    if (data[kind] === undefined) continue;
    if (!Array.isArray(data[kind])) return fail(`"${kind}" must be a list`);
    for (const [index, rule] of data[kind].entries()) {
      const problem = checkRule(kind, rule, index);
      if (problem) return fail(problem);
    }
    rules[kind] = data[kind].map(({ id, why, match, tools }) => ({ id, why, match, ...(tools ? { tools } : {}) }));
  }
  return { status: "ok", rules };
}

// What a rule's `match` is tested against: the path for the file tools, the
// command for Bash, any other tool's input as JSON.
export function describeInput(call) {
  if (PATH_TOOLS.has(call.tool) && typeof call.file_path === "string") return call.file_path;
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
  const subject = describeInput(call);
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
  const line = (kind, r) => [kind, r.id, r.why, r.tools ? r.tools.join(",") : "all", r.match].join("\t");
  return [path, ...parsed.rules.never.map((r) => line("never", r)), ...parsed.rules.warn.map((r) => line("warn", r))].join("\n");
}
