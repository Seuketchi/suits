// What the read-only versions of louis, mike and rachel may run in `Bash`
// (ADR 0009), as pure functions: no `$`, no file reads. `register.tsx` asks
// these on every `Bash` call a subagent makes.
//
// The check allows a short list of read commands and denies the rest. Anything
// it cannot follow with certainty is denied: redirection to a file, command
// substitution, variables, groups, background jobs, comments, a line
// continuation, an unclosed quote. A command line is allowed only when every
// part of it, split at `;`, a newline, `&&`, `||` and `|`, is an allowed read.

export const ADR = "ADR 0009";

const READ_ONLY = ["louis", "mike", "rachel"];

// Only this many characters of a command are read; a longer one is denied.
export const MAX_COMMAND = 16384;

// The character a subagent type names, when it is one of the read-only
// versions: `<plugin>:louis` and so on. Anything else is not held here.
export function readOnlyCharacter(type, plugin) {
  if (typeof type !== "string" || typeof plugin !== "string" || plugin === "") return undefined;
  if (!type.startsWith(`${plugin}:`)) return undefined;
  const name = type.slice(plugin.length + 1);
  return READ_ONLY.includes(name) ? name : undefined;
}

export const denyMessage = (name, why) =>
  `${name} is read-only (${ADR}): its shell may only read. ${why}. Report the command to the owner instead of running it.`;

const deny = (why) => ({ allowed: false, why });

// --- reading a command line ------------------------------------------------

// A redirection that cannot write a file: stderr to stdout, and anything sent to /dev/null.
const TO_NULL = /^&?>>?\s*\/dev\/null(?=$|[\s;|&])/;
const TO_FD = /^>&\d(?=$|[\s;|&])/;
// `$` starts an expansion unless it ends a word or stands before a plain character.
const EXPANDS = /[(\w@*#?!$'"{-]/;
const EXPANDS_IN_QUOTES = /[(\w@*#?!${-]/;
const CONTROL = /[\x00-\x08\x0b-\x1f\x7f]/;

// Splits a command line into segments of words with the quotes removed, or
// says why it cannot. A segment is the words between two operators.
function split(command) {
  const segments = [];
  let words = [];
  let word = null;
  let previous = null; // the operator that ended the last segment
  let why;

  const endWord = () => {
    if (word !== null) words.push(word);
    word = null;
  };
  // Returns a reason when the segment that ends here is not well formed.
  const endSegment = (operator) => {
    endWord();
    if (words.length === 0) {
      const blankLine = operator === "\n" && (previous === null || previous === ";" || previous === "\n");
      const trailing = operator === "end" && (previous === ";" || previous === "\n") && segments.length > 0;
      if (!blankLine && !trailing) return operator === "end" && segments.length === 0 && previous === null ? "the command is empty" : operator === "end" ? "the command ends after an operator" : `an operator has nothing before it ("${operator.trim()}")`;
    } else {
      segments.push(words);
    }
    words = [];
    previous = operator;
    return undefined;
  };

  for (let i = 0; i < command.length && why === undefined; i++) {
    const c = command[i];
    const rest = command.slice(i);
    if (c === " " || c === "\t") endWord();
    else if (c === "\n") why = endSegment("\n");
    else if (c === ";") why = endSegment(";");
    else if (c === "|") {
      if (command[i + 1] === "&") why = '"|&" cannot be checked';
      else if (command[i + 1] === "|") {
        why = endSegment("||");
        i++;
      } else why = endSegment("|");
    } else if (c === "&") {
      if (command[i + 1] === "&") {
        why = endSegment("&&");
        i++;
      } else {
        const m = rest.match(TO_NULL);
        if (m) i += m[0].length - 1;
        else why = 'a background job ("&") cannot be checked';
      }
    } else if (c === ">") {
      // A file descriptor number just before it belongs to the redirection.
      const fd = word !== null && /^\d$/.test(word);
      const m = rest.match(TO_NULL) ?? rest.match(TO_FD);
      if (!m) why = "redirection (>) can write a file";
      else {
        if (fd) word = null;
        else endWord();
        i += m[0].length - 1;
      }
    } else if (c === "<") why = "redirection (<) cannot be checked";
    else if (c === "(" || c === ")") why = "a group or subshell cannot be checked";
    else if (c === "`") why = "command substitution cannot be checked";
    else if (c === "#" && word === null) why = "a comment cannot be checked";
    else if (c === "\\") {
      const next = command[i + 1];
      if (next === undefined || next === "\n") why = "a line continuation cannot be checked";
      else {
        word = (word ?? "") + next;
        i++;
      }
    } else if (c === "'") {
      const end = command.indexOf("'", i + 1);
      if (end < 0) why = "a quote is not closed";
      else {
        word = (word ?? "") + command.slice(i + 1, end);
        i = end;
      }
    } else if (c === '"') {
      let text = "";
      let j = i + 1;
      for (; j < command.length && command[j] !== '"' && why === undefined; j++) {
        const d = command[j];
        if (d === "`") why = "command substitution cannot be checked";
        else if (d === "$" && command[j + 1] !== undefined && EXPANDS_IN_QUOTES.test(command[j + 1])) {
          why = command[j + 1] === "(" ? "command substitution cannot be checked" : "variable expansion cannot be checked";
        } else if (d === "\\") {
          const next = command[j + 1];
          if (next === undefined || next === "\n") why = "a line continuation cannot be checked";
          else {
            text += "$`\"\\".includes(next) ? next : d + next;
            j++;
          }
        } else text += d;
      }
      if (why === undefined && j >= command.length) why = "a quote is not closed";
      word = (word ?? "") + text;
      i = j;
    } else if (c === "$") {
      if (command[i + 1] !== undefined && EXPANDS.test(command[i + 1])) {
        why = command[i + 1] === "(" ? "command substitution cannot be checked" : "variable expansion cannot be checked";
      } else word = (word ?? "") + c;
    } else word = (word ?? "") + c;
  }

  if (why === undefined) why = endSegment("end");
  return why === undefined ? { segments } : { why };
}

// --- the commands that read --------------------------------------------------

const flagged = (args, test) => args.find((a) => test(a));

// Each entry takes the words after the command and returns why they are not a
// read, or nothing. A command with no entry is not a read command.
const plain = () => undefined;
const without = (what, pattern) => (args) => {
  const bad = flagged(args, (a) => pattern.test(a));
  return bad === undefined ? undefined : `${what} ${bad} can write or run a program`;
};

const FIND_WRITES = new Set(["-delete", "-exec", "-execdir", "-ok", "-okdir", "-fprint", "-fprint0", "-fprintf", "-fls"]);

const COMMANDS = {
  cat: plain,
  tac: plain,
  ls: plain,
  head: plain,
  tail: plain,
  wc: plain,
  pwd: plain,
  echo: plain,
  printf: plain,
  cut: plain,
  tr: plain,
  column: plain,
  nl: plain,
  rev: plain,
  fold: plain,
  basename: plain,
  dirname: plain,
  realpath: plain,
  readlink: plain,
  stat: plain,
  du: plain,
  df: plain,
  which: plain,
  diff: plain,
  comm: plain,
  jq: plain,
  cd: plain,
  grep: plain,
  egrep: plain,
  fgrep: plain,
  true: plain,
  false: plain,
  rg: without("rg option", /^--(pre|hostname-bin)(=|$)/),
  find: (args) => {
    const bad = flagged(args, (a) => FIND_WRITES.has(a));
    return bad === undefined ? undefined : `find ${bad} can write or run a program`;
  },
  sort: without("sort option", /^(--output|--compress-program|-[A-Za-z]*o)/),
  // `uniq in out` writes `out`, so it takes one file at most.
  uniq: (args) => (args.filter((a) => !a.startsWith("-")).length > 1 ? "uniq with an output file can write it" : undefined),
  file: without("file option", /^(--compile|-[A-Za-z]*C)/),
  git: checkGit,
  gh: checkGh,
};

const GIT_READS = new Set([
  "log", "show", "diff", "grep", "blame", "annotate", "status", "ls-files", "ls-tree", "ls-remote", "rev-parse", "rev-list",
  "cat-file", "shortlog", "describe", "merge-base", "show-ref", "for-each-ref", "name-rev", "diff-tree", "diff-files",
  "diff-index", "range-diff", "cherry", "whatchanged", "count-objects", "check-ignore", "version",
]);
const GIT_BRANCH_FLAGS = new Set(["--show-current", "-a", "--all", "-r", "--remotes", "--list", "-v", "-vv", "--verbose", "--no-color", "--color"]);

function checkGit(args) {
  let i = 0;
  while (i < args.length && args[i].startsWith("-")) {
    const a = args[i];
    if (a === "-C") {
      if (args[i + 1] === undefined) return "git -C needs a directory";
      i += 2;
    } else if (a === "--no-pager" || a === "--no-optional-locks") i++;
    else return `git ${a} can run a program or change a setting`;
  }
  const sub = args[i];
  if (sub === undefined) return "git needs a subcommand to be read";
  const rest = args.slice(i + 1);
  const not = `git ${sub} is not a read command`;

  const bad = flagged(rest, (a) => /^--output(=|$)/.test(a) || a === "--ext-diff" || a === "--open-files-in-pager" || /^--open-files-in-pager=/.test(a) || (sub === "grep" && /^-O/.test(a)));
  if (bad !== undefined) return `git ${sub} ${bad} can write a file or run a program`;

  if (GIT_READS.has(sub)) return undefined;
  if (sub === "branch") return rest.every((a) => GIT_BRANCH_FLAGS.has(a)) ? undefined : not;
  if (sub === "config") return ["--get", "--get-all", "--get-regexp", "--list", "-l"].includes(rest[0]) ? undefined : not;
  if (sub === "remote") return rest.length === 0 || rest[0] === "-v" || ((rest[0] === "get-url" || rest[0] === "show") && rest.length === 2) ? undefined : not;
  if (sub === "stash") return rest[0] === "list" || rest[0] === "show" ? undefined : not;
  if (sub === "tag") return rest[0] === "-l" || rest[0] === "--list" ? undefined : not;
  if (sub === "worktree") return rest[0] === "list" ? undefined : not;
  return not;
}

const GH_READS = {
  pr: ["view", "diff", "list", "status", "checks"],
  issue: ["view", "list", "status"],
  run: ["view", "list"],
  repo: ["view", "list"],
  release: ["view", "list"],
  search: null, // every search reads
};

function checkGh(args) {
  let i = 0;
  while (i < args.length && args[i].startsWith("-")) {
    if (args[i] === "-R" || args[i] === "--repo") {
      if (args[i + 1] === undefined) return "gh --repo needs a repository";
      i += 2;
    } else if (/^--repo=/.test(args[i])) i++;
    else return `gh ${args[i]} is not a read option`;
  }
  const group = args[i];
  if (group === undefined) return "gh needs a command to be read";
  if (group === "api") {
    const bad = flagged(args.slice(i + 1), (a) => /^(--method|--field|--raw-field|--input|-X|-f|-F)/.test(a));
    return bad === undefined ? undefined : `gh api ${bad} can send a change`;
  }
  if (!Object.hasOwn(GH_READS, group)) return `gh ${group} is not a read command`;
  const allowed = GH_READS[group];
  if (allowed === null) return undefined;
  const action = args[i + 1];
  return allowed.includes(action) ? undefined : `gh ${group} ${action ?? ""}`.trim() + " is not a read command";
}

// --- the check ---------------------------------------------------------------

// { allowed: true }, or { allowed: false, why } with the part that stopped it.
export function checkReadOnly(command) {
  if (typeof command !== "string") return deny("the command is not text");
  if (command.length > MAX_COMMAND) return deny(`the command is longer than ${MAX_COMMAND} characters`);
  if (CONTROL.test(command)) return deny("the command has a control character");
  const { segments, why } = split(command);
  if (why !== undefined) return deny(why);

  for (const [name, ...args] of segments) {
    if (!Object.hasOwn(COMMANDS, name)) {
      return deny(/^\w+=/.test(name) ? `a variable assignment before a command (${name}) cannot be checked` : `${name} is not a read command`);
    }
    const reason = COMMANDS[name](args);
    if (reason !== undefined) return deny(reason);
  }
  return { allowed: true };
}
