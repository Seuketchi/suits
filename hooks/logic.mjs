// The decisions of the rules hooks, as pure functions: no `$`, no file reads.
// `register.ts` reads the rules file and asks these what to do. Every rule
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
