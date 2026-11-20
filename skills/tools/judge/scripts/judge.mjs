#!/usr/bin/env node
// Small typed questions asked of Jev (TypeSafe). An answer is taken only when it
// clears the question's floor; otherwise the character decides as it would
// without one. Every judgment is logged, the final decision is recorded against
// it, and `report` suggests floors from that record.
//
//   node judge.mjs questions                          list the questions
//   node judge.mjs ask <id[,id...]> <state.json|->    ask one or more questions in one request
//   node judge.mjs ask-each <id> <state.json|->       ask one question of every entry in state.items
//   node judge.mjs record <judgment id> <final>       log what was decided in the end
//   node judge.mjs report [--save]                    agreement by confidence; --save raises floors
//
// Key: $TYPESAFE_API_KEY, else the file named by $TYPESAFE_API_KEY_FILE.
// Log: $XDG_STATE_HOME/suits-judge/judgments.jsonl.
// Config: $XDG_CONFIG_HOME/suits-judge/ — floors.json (fitted floors), allow.json
// ({"owners": ["<github owner>", ...]}: repositories whose code may be sent).
import { randomUUID, createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ENDPOINT = "https://api.typesafe.ai/v1/systemone";
// Pinned, so a model change shows up as a change here and not as drift in the log.
export const MODEL = "jev-1.13.0";
// The paired "does any option fit" question must clear this for a Choice to be taken.
export const FITS_FLOOR = 0.7;
// Long fields (diffs, files) are cut to this many characters before they are sent.
export const FIELD_CAP = 20000;
export const NONE_FITS = "none-fits";

const option = (what, notFor, examples) => ({ what, not_for: notFor, examples });

export const QUESTIONS = {
  owner: {
    kind: "choice",
    floor: 0.7,
    sendsCode: false,
    instructions: {
      question:
        "`request` is what the owner asked for, in their own words. Which one character owns it? When it is two jobs, name the owner of the first. Something broken goes to `rachel` first, before anyone fixes it.",
    },
    options: {
      donna: option(
        "Writing for the owner: a document, an email, a brief, minutes, a deck from a structure already set, a pull request body, a short reply to a teammate, a reminder or tickler, triage of open pull requests",
        "deciding whether to build, research, reviewing code",
        "draft a proposal; write the minutes of today's meeting; reply to my teammate in the thread",
      ),
      rachel: option(
        "An outside fact, sources for a claim, a literature question, or something broken, failing, wrong or slow that needs its cause found",
        "what our own code does; building the fix",
        "find papers on edge RL; why does the build fail since Monday; is this library still maintained",
      ),
      mike: option(
        "What our own code or system does today, why it is the way it is, or what a change would touch",
        "outside facts; whether to build it",
        "how does our retry logic work; what calls this function; why did we pick SQLite",
      ),
      harvey: option(
        "Whether to build and on what budget, a pitch or its structure, a negotiation, a call on scope, money or a rule",
        "planning decided work into tickets; writing the deck itself",
        "should we build offline mode; structure my pitch for demo day; can we take this client's terms",
      ),
      jessica: option(
        "A plan for decided work, tickets, a status, risks, whether a release is ready",
        "whether to build; the build itself",
        "break this spec into tickets; where are we on the release; what is blocking the migration",
      ),
      louis: option(
        "A diff, change or pull request to check, or a done test to write",
        "building the change; deciding whether to make it",
        "review PR 42; check this diff before I merge; write the done test for the export feature",
      ),
      associates: option(
        "A decided ticket to build with its done test, or a small fix such as a typo",
        "work with no decision or no done test yet; finding a bug's cause",
        "implement ticket 7; fix the typo in the README; build the endpoint per this done test",
      ),
      retro: option(
        "A look back at a batch of work that has closed",
        "anything still in progress",
        "run a retro on last week's PRs; what went wrong in the release batch",
      ),
    },
  },
  "comment-kind": {
    kind: "choice",
    floor: 0.8,
    sendsCode: true,
    instructions: {
      question:
        "`comment` is one review comment on a pull request (`hunk`, when present, is the code it points at). What kind of comment is it?",
    },
    options: {
      defect: option(
        "It claims the code is wrong: a bug, a crash, a wrong result, or a security or data problem",
        "a request to restructure working code",
        "this divides by zero when the list is empty; the token is logged in plain text",
      ),
      "change-request": option(
        "It asks for a concrete change that is not about correctness: rename, extract, add a test, handle a case",
        "claims that the code is wrong today",
        "please add a test for the empty case; extract this into a helper",
      ),
      preference: option(
        "Style or taste, with no rule, bug or requirement cited",
        "anything that cites a rule or a spec line",
        "I'd use a ternary here; I prefer early returns",
      ),
      question: option(
        "It asks why or how, without asking for a change",
        "a change phrased as a question when the change is clearly wanted",
        "why a map and not a set here?",
      ),
      acknowledgement: option(
        "Praise, thanks or approval that needs no action",
        "anything asking for a change",
        "nice cleanup; LGTM",
      ),
    },
  },
  "touches-money": {
    kind: "noul",
    floor: 0.7,
    sendsCode: true,
    instructions: {
      question:
        "Does `diff` (or `spec`, when given) change how amounts, fees, limits, rates, rounding, currency or balances are computed, stored, compared or shown?",
      examples_yes: "a fee rounded to cents; a balance column added; a currency converted; a transfer limit checked",
      examples_no: "a button colour; a log message; a test fixture with a price in a name only",
    },
    whenTrue: "The change touches money and needs the money check",
    whenFalse: "Nothing in the change touches money",
  },
  "touches-trust-boundary": {
    kind: "noul",
    floor: 0.7,
    sendsCode: true,
    instructions: {
      question:
        "Does `diff` touch parsing of files or uploads, command execution, deserialization, query building, authentication or authorization, secrets or keys, outbound requests built from input, file paths from input, or new or bumped dependencies?",
      examples_yes: "a SQL string built from a parameter; a new npm dependency; a path joined from a request field; a token check changed",
      examples_no: "a copy change; a CSS change; a refactor inside one pure function with fixed inputs",
    },
    whenTrue: "The change touches a trust boundary and needs the security pass",
    whenFalse: "Nothing in the change touches a trust boundary",
  },
  "falls-short": {
    kind: "noul",
    floor: 0.7,
    sendsCode: true,
    instructions: {
      question:
        "`done_test` is what the work had to meet, one line per rule, and `diff` is the change actually made, read from the repository. Does the change fall short: a line of `done_test` it does not meet, or work left half-finished?",
      examples_yes: "a done-test line asks for an empty-list case and the diff has none; a new function body is a stub or a TODO; a test is skipped or deleted to pass",
      examples_no: "every done-test line has matching code and a test; a TODO left in an untouched file",
    },
    whenTrue: "The work does not yet meet its done test",
    whenFalse: "The work meets every line of its done test and looks finished",
  },
  "red-flag": {
    kind: "noul",
    floor: 0.7,
    sendsCode: true,
    instructions: {
      question:
        "`finding` is one finding about a bug or a problem, in plain words. Is it a red flag: the cause is a design flaw, it changes scope, it involves money, it breaks a rule, the cause has no owner, only a guardrail is proposed for a design cause, or the failure was silent for a long time?",
      examples_yes: "customers were charged twice for three weeks and nobody noticed; the fix needs a schema change nobody planned; the module that fails has no maintainer",
      examples_no: "a typo in an error message; an off-by-one in a loop, caught by a test the same day",
    },
    whenTrue: "The owner must hear of it at once",
    whenFalse: "An ordinary finding with none of those marks",
  },
  "rule-duplicate": {
    kind: "noul",
    floor: 0.8,
    sendsCode: true,
    instructions: {
      question:
        "`new_rule` is a rule proposed for review or for a check, and `item` is a rule that already exists. Does `item` already require what `new_rule` requires, so adding `new_rule` would say nothing new?",
      examples_yes: "new: 'every amount carries its currency'; existing: 'an amount never travels without its currency code'",
      examples_no: "new: 'round half to even'; existing: 'name the rounding mode at one point' (the existing rule asks for a named mode, not this one)",
    },
    whenTrue: "The existing rule already says it; the new one adds nothing",
    whenFalse: "The new rule says something the existing one does not",
  },
};

const stateDirDefault = () => join(process.env.XDG_STATE_HOME || join(homedir(), ".local", "state"), "suits-judge");
const configDirDefault = () => join(process.env.XDG_CONFIG_HOME || join(homedir(), ".config"), "suits-judge");

function loadKey() {
  if (process.env.TYPESAFE_API_KEY) return process.env.TYPESAFE_API_KEY;
  const file = process.env.TYPESAFE_API_KEY_FILE;
  if (file && existsSync(file)) return readFileSync(file, "utf8").trim() || null;
  return null;
}

const readJson = (file, fallback) => (existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : fallback);
export const loadFloors = (configDir = configDirDefault()) => readJson(join(configDir, "floors.json"), {});

// A fitted floor can make a question stricter, never looser than written.
export function floorFor(id, configDir) {
  return Math.max(QUESTIONS[id].floor, loadFloors(configDir)[id] ?? 0);
}

export function saveFloors(floors, configDir = configDirDefault()) {
  const kept = Object.fromEntries(Object.entries(floors).map(([id, f]) => [id, Math.max(QUESTIONS[id]?.floor ?? f, f)]));
  mkdirSync(configDir, { recursive: true });
  writeFileSync(join(configDir, "floors.json"), JSON.stringify({ ...loadFloors(configDir), ...kept }, null, 2) + "\n");
  return kept;
}

function log(row, stateDir) {
  mkdirSync(stateDir, { recursive: true });
  appendFileSync(join(stateDir, "judgments.jsonl"), JSON.stringify(row) + "\n");
}

// The GitHub owner of a repository's origin, or null.
export function repoOwner(repo) {
  try {
    const url = execFileSync("git", ["-C", repo, "remote", "get-url", "origin"], { encoding: "utf8" }).trim();
    return url.match(/github\.com[:/]([^/]+)\//)?.[1] ?? null;
  } catch {
    return null;
  }
}

// Why the code in `state` may not be sent, or null when it may.
export function codeBlocked(state, { configDir = configDirDefault(), ownerOf = repoOwner } = {}) {
  const owners = readJson(join(configDir, "allow.json"), {}).owners ?? [];
  if (!state.repo) return "no `repo` in the state: code is sent only from a repository on the allow list";
  const owner = ownerOf(state.repo);
  if (!owner) return `no GitHub origin for ${state.repo}`;
  if (!owners.includes(owner)) return `${owner} is not in allow.json: its code is not sent`;
  return null;
}

const SECRET = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
  /\b(?:ghp|gho|ghs|github_pat|sk|sk-ant|xox[abp]|AKIA)[-_A-Za-z0-9]{12,}\b/g,
  /\b((?:api[_-]?key|token|secret|password|passwd)\s*[:=]\s*)["']?[^\s"']{6,}/gi,
];

// Secrets out, long fields cut, the repository path dropped (the owner check has used it).
export function trimState(state) {
  const clean = (v) => {
    if (typeof v === "string") {
      let s = SECRET.reduce((t, re) => t.replace(re, (m, keep) => (typeof keep === "string" ? `${keep}[redacted]` : "[redacted]")), v);
      if (s.length > FIELD_CAP) s = `${s.slice(0, FIELD_CAP)}\n[cut at ${FIELD_CAP} characters]`;
      return s;
    }
    if (Array.isArray(v)) return v.map(clean);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x)]));
    return v;
  };
  const { repo, ...rest } = state;
  return clean(rest);
}

// The wire form of one question, and its paired "does any option fit" for a Choice.
export function wire(id, about) {
  const q = QUESTIONS[id];
  const instructions = about === undefined ? q.instructions : { about, question: q.instructions };
  if (q.kind === "noul") {
    return { [id]: { type: "noul", instructions, criteria: { true: q.whenTrue, false: q.whenFalse } } };
  }
  const options = { ...q.options, [NONE_FITS]: option("None of the other options describes it", "anything another option describes", "") };
  return {
    [id]: { type: "choice", instructions, criteria: options },
    [`${id}.fits`]: {
      type: "noul",
      instructions: { about, question: `Does one of these options fit? ${q.instructions.question}`, options: q.options },
      criteria: { true: "One of the listed options describes it", false: "None of the listed options describes it" },
    },
  };
}

// Reads one question's answer into { answer, probabilities, confidence, decided }.
export function read(id, answers, key = id, floor = QUESTIONS[id].floor) {
  const q = QUESTIONS[id];
  const a = answers?.[key];
  if (!a) return { answer: undefined, decided: false, error: "no answer for this question" };
  if (q.kind === "noul") {
    const p = a.noul;
    const answer = p >= 0.5 ? "yes" : "no";
    // Yes means escalate. Only a yes is ever taken; a no leaves the call to the character.
    return { answer, probabilities: { yes: p }, confidence: Math.max(p, 1 - p), decided: answer === "yes" && p >= floor };
  }
  const fits = answers?.[`${key}.fits`]?.noul;
  const decided = a.choice !== NONE_FITS && typeof a.confidence === "number" && a.confidence >= floor && typeof fits === "number" && fits >= FITS_FLOOR;
  return { answer: a.choice, probabilities: a.probabilities, confidence: a.confidence, fits, decided };
}

async function post(doFetch, key, body) {
  let last;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, 500 * 2 ** attempt + Math.random() * 250));
    let res;
    try {
      res = await doFetch(ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      });
    } catch (error) {
      last = `TypeSafe unreachable: ${error.message}`;
      continue;
    }
    if (res.ok) return { body: await res.json(), requestId: res.headers?.get?.("x-typesafe-request-id") ?? null };
    last = `TypeSafe answered ${res.status}: ${(await res.text()).slice(0, 200)}`;
    if (![408, 429, 529].includes(res.status) && res.status < 500) break;
  }
  return { error: last };
}

// Asks `ids` against one state, or one question of every entry in `items`, in one
// request. Returns one result per question (per item for `items`), each with its
// own judgment id. Never throws on a missing key, a blocked repository or a failed
// call: the character decides instead.
export async function ask(ids, state, opts = {}) {
  ids = [].concat(ids);
  for (const id of ids) if (!QUESTIONS[id]) throw new Error(`unknown question "${id}"; known: ${Object.keys(QUESTIONS).join(", ")}`);
  const { fetch: doFetch = fetch, stateDir = stateDirDefault(), configDir = configDirDefault(), ownerOf, items } = opts;
  const key = opts.key === undefined ? loadKey() : opts.key;
  const slots = items
    ? items.map((item, i) => ({ id: ids[0], key: `${ids[0]}#${i}`, about: item }))
    : ids.map((id) => ({ id, key: id }));
  const results = slots.map((s) => ({ id: randomUUID(), question: s.id, key: s.key, floor: floorFor(s.id, configDir), decided: false }));
  const fail = (error) => results.map((r) => ({ ...r, error }));

  if (!key) return fail("no TypeSafe key: set TYPESAFE_API_KEY or TYPESAFE_API_KEY_FILE");
  if (ids.some((id) => QUESTIONS[id].sendsCode)) {
    const blocked = codeBlocked(state, { configDir, ownerOf });
    if (blocked) return fail(`not sent: ${blocked}`);
  }

  const questions = {};
  for (const s of slots) for (const [k, v] of Object.entries(wire(s.id, s.about === undefined ? undefined : trimState({ item: s.about }).item))) questions[k.replace(s.id, s.key)] = v;
  const sent = trimState(state);
  const { body, requestId, error } = await post(doFetch, key, { model: MODEL, state: sent, questions });
  if (error) return fail(error);

  const hash = createHash("sha256").update(JSON.stringify(sent)).digest("hex").slice(0, 16);
  return results.map((r) => {
    const out = { ...r, model: body.model, ...read(r.question, body.answers, r.key, r.floor) };
    log({ id: out.id, at: new Date().toISOString(), question: r.question, model: body.model, requestId, state: hash, answer: out.answer, probabilities: out.probabilities, confidence: out.confidence, fits: out.fits, floor: r.floor, decided: out.decided }, stateDir);
    return out;
  });
}

export function record(id, outcome, stateDir = stateDirDefault()) {
  log({ id, at: new Date().toISOString(), outcome }, stateDir);
}

// Agreement between the judge's answer and the recorded outcome, per 0.1
// confidence band, and the lowest floor whose judgments at or above it agree 95%
// of the time (over at least 10 of them).
export function report(rows) {
  const outcomes = new Map(rows.filter((r) => r.outcome !== undefined).map((r) => [r.id, r.outcome]));
  const judged = rows.filter((r) => r.question && outcomes.has(r.id) && typeof r.confidence === "number");
  const out = {};
  for (const r of judged) {
    const q = (out[r.question] ??= { bands: {}, overrides: 0, suggestedFloor: null });
    const lo = Math.min(Math.floor(r.confidence * 10), 9) / 10;
    const band = (q.bands[`${lo.toFixed(1)}-${(lo + 0.1).toFixed(1)}`] ??= { total: 0, agreed: 0 });
    band.total++;
    if (r.answer === outcomes.get(r.id)) band.agreed++;
    else if (r.decided) q.overrides++;
  }
  for (const [question, q] of Object.entries(out)) {
    const mine = judged.filter((r) => r.question === question);
    // Only floors with judgments in their own band: a floor in an empty band
    // would claim accuracy the log has no evidence for.
    const candidates = [...new Set(Object.keys(q.bands).map((b) => Number(b.split("-")[0])))].sort((a, b) => b - a);
    for (const floor of candidates) {
      const above = mine.filter((r) => r.confidence >= floor);
      const agreed = above.filter((r) => r.answer === outcomes.get(r.id)).length;
      if (above.length >= 10 && agreed / above.length >= 0.95) q.suggestedFloor = floor;
      else if (q.suggestedFloor !== null) break;
    }
  }
  return out;
}

function readRows(stateDir = stateDirDefault()) {
  const file = join(stateDir, "judgments.jsonl");
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
}

const readState = (source) => JSON.parse(source === "-" ? readFileSync(0, "utf8") : readFileSync(source, "utf8"));

async function main([command, ...args]) {
  switch (command) {
    case "questions":
      for (const [id, q] of Object.entries(QUESTIONS)) {
        const answers = q.kind === "noul" ? "yes | no (only a yes is taken)" : Object.keys(q.options).join(" | ");
        console.log(`${id}\tfloor ${floorFor(id)}\t${q.sendsCode ? "sends code" : "no code"}\t${answers}`);
      }
      return;
    case "ask": {
      const [ids, source] = args;
      if (!ids || !source) throw new Error("usage: judge.mjs ask <id[,id...]> <state.json|->");
      console.log(JSON.stringify(await ask(ids.split(","), readState(source)), null, 2));
      return;
    }
    case "ask-each": {
      const [id, source] = args;
      if (!id || !source) throw new Error("usage: judge.mjs ask-each <id> <state.json|->");
      const { items, ...state } = readState(source);
      if (!Array.isArray(items) || !items.length) throw new Error("ask-each needs a non-empty `items` array in the state");
      console.log(JSON.stringify(await ask([id], state, { items }), null, 2));
      return;
    }
    case "record": {
      const [id, outcome] = args;
      if (!id || !outcome) throw new Error("usage: judge.mjs record <judgment id> <final answer>");
      record(id, outcome);
      return;
    }
    case "report": {
      const r = report(readRows());
      console.log(JSON.stringify(r, null, 2));
      if (args.includes("--save")) {
        const kept = saveFloors(Object.fromEntries(Object.entries(r).filter(([, q]) => q.suggestedFloor !== null).map(([id, q]) => [id, q.suggestedFloor])));
        console.log(`saved floors (never below the written ones): ${JSON.stringify(kept)}`);
      }
      return;
    }
    default:
      throw new Error("usage: judge.mjs questions | ask <id[,id...]> <state> | ask-each <id> <state> | record <id> <final> | report [--save]");
  }
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`judge: ${error.message}\n`);
    process.exit(1);
  });
}
