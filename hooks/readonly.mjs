// What the read-only versions of louis, mike and rachel may run in `Bash`
// (ADR 0009), as pure functions: no `$`, no file reads. `register.tsx` asks
// these on every `Bash` call a subagent makes.
//
// The check allows a short list of read commands and denies the rest. Anything
// it cannot follow with certainty is denied: redirection to a file, command
// substitution, variables, brace and glob expansion, groups, background jobs,
// comments, a line continuation, an unclosed quote. A command line is allowed
// only when every part of it, split at `;`, a newline, `&&`, `||` and `|`, is
// an allowed read. A command whose options can write or run a program is read
// against a list of the options it may have; any other option is denied.

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
const EXPANDS = /[(\w@*#?!$'"{[-]/;
const EXPANDS_IN_QUOTES = /[(\w@*#?!${[-]/;
// Unquoted, these build words the check never sees: `{-delete,}`, `*`, `?`, `[a]`.
const GLOB = "{}*?[";
const CONTROL = /[\x00-\x08\x0b-\x1f\x7f]/;

// Splits a command line into segments of words with the quotes removed, or
// says why it cannot. A segment is the words between two operators.
function split(command) {
  const segments = [];
  let words = [];
  let word = null;
  let quoted = false; // the word has a quoted or escaped part
  let previous = null; // the operator that ended the last segment
  let why;

  const endWord = () => {
    if (word !== null) words.push(word);
    word = null;
    quoted = false;
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
      const fd = word !== null && !quoted && /^\d+$/.test(word);
      const m = rest.match(TO_NULL) ?? rest.match(TO_FD);
      if (!m) why = "redirection (>) can write a file";
      else {
        if (fd) {
          word = null;
          quoted = false;
        } else endWord();
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
        quoted = true;
        i++;
      }
    } else if (c === "'") {
      const end = command.indexOf("'", i + 1);
      if (end < 0) why = "a quote is not closed";
      else {
        word = (word ?? "") + command.slice(i + 1, end);
        quoted = true;
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
      quoted = true;
      i = j;
    } else if (c === "$") {
      if (command[i + 1] !== undefined && EXPANDS.test(command[i + 1])) {
        why = command[i + 1] === "(" ? "command substitution cannot be checked" : "variable expansion cannot be checked";
      } else word = (word ?? "") + c;
    } else if (GLOB.includes(c)) why = `an unquoted ${c} (expansion) cannot be checked`;
    else word = (word ?? "") + c;
  }

  if (why === undefined) why = endSegment("end");
  return why === undefined ? { segments } : { why };
}

// --- the commands that read --------------------------------------------------

// Each entry takes the words after the command and returns why they are not a
// read, or nothing. A command with no entry is not a read command.

// Reads the options of `args` against what a command may have, and returns
// its operands, or why not. Only the names listed are allowed, spelled out in
// full: a prefix such as `--out` is not `--output`. `short` and `long` take no
// value; `shortValue` and `longValue` take one, attached or as the next word.
function operandsOf(name, spec, args) {
  const short = spec.short ?? "";
  const shortValue = spec.shortValue ?? "";
  const long = new Set(spec.long ?? []);
  const longValue = new Set(spec.longValue ?? []);
  const operands = [];
  const refuse = (option) => ({ why: `${name} option ${option} is not on the list of reads` });
  const missing = (option) => ({ why: `${name} option ${option} needs a value` });

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--") {
      operands.push(...args.slice(i + 1));
      break;
    }
    if (a === "-" || !a.startsWith("-")) operands.push(a);
    else if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      const option = eq < 0 ? a.slice(2) : a.slice(2, eq);
      if (long.has(option) && eq < 0) continue;
      if (!longValue.has(option)) return refuse(a);
      if (eq < 0 && ++i >= args.length) return missing(a);
    } else {
      for (let j = 1; j < a.length; j++) {
        if (short.includes(a[j])) continue;
        if (!shortValue.includes(a[j])) return refuse(a);
        if (j === a.length - 1 && ++i >= args.length) return missing(a);
        break;
      }
    }
  }
  return { operands };
}

const plain = () => undefined;
const withOptions = (name, spec, extra) => (args) => {
  const { operands, why } = operandsOf(name, spec, args);
  return why ?? extra?.(operands);
};

// Primaries that test or print. Every primary that deletes, runs a program or
// writes a file (-delete, -exec*, -ok*, -fprint*, -fls) is missing on purpose.
const FIND_PRIMARIES = new Set(
  ("name iname path ipath wholename iwholename regex iregex regextype type xtype size mtime atime ctime mmin amin cmin " +
    "newer anewer cnewer perm user group uid gid empty maxdepth mindepth depth d print print0 prune not and or o a " +
    "lname ilname samefile executable readable writable links inum xdev mount follow nouser nogroup true false quit " +
    "printf ls noleaf daystart")
    .split(" ")
    .map((p) => `-${p}`),
);

function checkFind(args) {
  for (const a of args) {
    if (!a.startsWith("-") || a === "-") continue;
    if (!["-H", "-L", "-P"].includes(a) && !FIND_PRIMARIES.has(a) && !/^-newer[acBmt][acBmt]$/.test(a)) {
      return `find ${a} is not on the list of reads`;
    }
  }
  return undefined;
}

const SORT = {
  short: "bdfghiMnRrsuVcCzZm",
  shortValue: "ktS",
  long: "reverse numeric-sort ignore-case unique stable human-numeric-sort version-sort general-numeric-sort month-sort random-sort ignore-leading-blanks dictionary-order ignore-nonprinting check merge zero-terminated".split(" "),
  longValue: ["key", "field-separator", "buffer-size"],
};
const UNIQ = {
  short: "cdDiuz",
  shortValue: "fsw",
  long: "count repeated all-repeated ignore-case unique zero-terminated".split(" "),
  longValue: ["skip-fields", "skip-chars", "check-chars"],
};
const FILE = {
  short: "bhikLnNps",
  long: "brief mime mime-type mime-encoding dereference no-dereference keep-going special-files".split(" "),
};
const RG = {
  short: "iIsSnNHhlLcovwxFuUaq",
  shortValue: "eftTgABCmjMrdE",
  long: ("files-with-matches files-without-match count count-matches line-number no-line-number with-filename no-filename " +
    "ignore-case smart-case case-sensitive fixed-strings word-regexp line-regexp invert-match hidden no-ignore only-matching " +
    "files heading no-heading json multiline column stats pretty vimgrep no-messages follow text null quiet unrestricted " +
    "no-ignore-vcs no-ignore-parent trim line-buffered no-config include-zero crlf").split(" "),
  longValue: ("regexp file type type-not glob iglob max-count after-context before-context context max-depth max-columns " +
    "replace threads color colors sort sortr path-separator encoding").split(" "),
};
const GH_API = {
  short: "i",
  shortValue: "qtHp",
  long: ["include", "paginate", "slurp", "silent", "verbose"],
  longValue: ["jq", "template", "header", "cache", "hostname", "preview"],
};

// Commands with no option that writes a file or runs a program are not read
// against a list of options.
const COMMANDS = {
  cat: plain,
  ls: plain,
  head: plain,
  tail: plain,
  wc: plain,
  pwd: plain,
  echo: plain,
  printf: plain,
  cut: plain,
  tr: plain,
  basename: plain,
  dirname: plain,
  stat: plain,
  du: plain,
  df: plain,
  which: plain,
  diff: plain,
  jq: plain,
  grep: plain,
  egrep: plain,
  fgrep: plain,
  true: plain,
  false: plain,
  rg: withOptions("rg", RG),
  find: checkFind,
  sort: withOptions("sort", SORT),
  // `uniq in out` writes `out`: a lone `-` is the input, so it counts as a file.
  uniq: withOptions("uniq", UNIQ, (files) => (files.length > 1 ? "uniq with two files writes the second" : undefined)),
  file: withOptions("file", FILE),
  git: checkGit,
  gh: checkGh,
};

const GIT_READS = new Set([
  "log", "show", "diff", "grep", "blame", "annotate", "status", "ls-files", "ls-tree", "rev-parse", "rev-list",
  "cat-file", "shortlog", "describe", "merge-base", "show-ref", "for-each-ref", "name-rev", "diff-tree", "diff-files",
  "diff-index", "range-diff", "cherry", "whatchanged", "count-objects", "check-ignore", "version",
]);
const GIT_BRANCH_FLAGS = new Set(["--show-current", "-a", "--all", "-r", "--remotes", "--list", "-v", "-vv", "--verbose", "--no-color", "--color"]);
const GIT_CONFIG_FLAGS = new Set(["--global", "--local", "--system", "--worktree", "--show-origin", "--show-scope", "--name-only", "-z", "--null", "--includes", "--no-includes"]);
// Long options that write a file or run a program. git accepts any unambiguous
// prefix of an option, so a word that starts one of these names is denied.
const GIT_LONG_BAD = ["output", "ext-diff", "open-files-in-pager"];

function checkGit(args) {
  let i = 0;
  while (i < args.length && args[i].startsWith("-")) {
    const a = args[i];
    // No -C: a repository inside the tree can set a program in its own config.
    if (a === "--no-pager" || a === "--no-optional-locks") i++;
    else return `git ${a} can run a program or change a setting`;
  }
  const sub = args[i];
  if (sub === undefined) return "git needs a subcommand to be read";
  const rest = args.slice(i + 1);
  const not = `git ${sub} is not a read command`;

  const bad = rest.find((a) => {
    if (a === "--") return false;
    if (a.startsWith("--")) {
      const name = a.slice(2).split("=")[0];
      return GIT_LONG_BAD.some((full) => full.startsWith(name));
    }
    return sub === "grep" && /^-[^-]*O/.test(a);
  });
  if (bad !== undefined) return `git ${sub} ${bad} can write a file or run a program`;

  if (GIT_READS.has(sub)) return undefined;
  if (sub === "branch") return rest.every((a) => GIT_BRANCH_FLAGS.has(a)) ? undefined : not;
  if (sub === "config") {
    const [action, ...others] = rest;
    const reads = ["--get", "--get-all", "--get-regexp", "--list", "-l"].includes(action);
    return reads && others.every((a) => !a.startsWith("-") || GIT_CONFIG_FLAGS.has(a)) ? undefined : not;
  }
  if (sub === "remote") {
    const verbose = rest.length === 1 && (rest[0] === "-v" || rest[0] === "--verbose");
    const named = (rest[0] === "get-url" || rest[0] === "show") && rest.length === 2 && !rest[1].startsWith("-");
    return rest.length === 0 || verbose || named ? undefined : not;
  }
  if (sub === "stash") return rest[0] === "list" || rest[0] === "show" ? undefined : not;
  if (sub === "tag") return (rest[0] === "-l" || rest[0] === "--list") && rest.slice(1).every((a) => !a.startsWith("-")) ? undefined : not;
  if (sub === "worktree") return rest[0] === "list" && rest.slice(1).every((a) => ["--porcelain", "-v", "--verbose", "-z"].includes(a)) ? undefined : not;
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
  if (group === "api") return operandsOf("gh api", GH_API, args.slice(i + 1)).why;
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
