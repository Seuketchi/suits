// The judge tool: Jev's answer is taken only when confident, only routes or adds
// checks, sends code only from allowed repositories, and floors only get stricter.
//
//   node --test test/characters/judge.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { QUESTIONS, ask, floorFor, saveFloors, report, trimState, NONE_FITS } from "../../skills/tools/judge/scripts/judge.mjs";

const dirs = () => {
  const root = mkdtempSync(join(tmpdir(), "suits-judge-"));
  return { stateDir: join(root, "state"), configDir: join(root, "config") };
};
const allow = (configDir, owners) => {
  mkdirSync(configDir, { recursive: true });
  writeFileSync(join(configDir, "allow.json"), JSON.stringify({ owners }));
};
// A fake TypeSafe that records what it was sent and answers with `answers`.
const fake = (answers) => {
  const calls = [];
  const fetch = async (_url, init) => {
    calls.push(JSON.parse(init.body));
    return { ok: true, status: 200, headers: { get: () => "req-1" }, json: async () => ({ model: "jev-1.13.0", answers }), text: async () => "" };
  };
  return { fetch, calls };
};
const choice = (pick, confidence) => ({ type: "choice", choice: pick, probabilities: { [pick]: confidence }, confidence });
const noul = (p) => ({ type: "noul", noul: p });

describe("judge: owner", () => {
  test("a confident pick that fits is decided", async () => {
    const { fetch, calls } = fake({ owner: choice("rachel", 0.9), "owner.fits": noul(0.95) });
    const [r] = await ask(["owner"], { request: "the build fails since Monday" }, { key: "k", fetch, ...dirs() });
    assert.equal(r.answer, "rachel");
    assert.equal(r.decided, true);
    assert.equal(calls.length, 1);
    assert.ok(calls[0].questions["owner.fits"], "every choice is paired with a does-any-option-fit question");
    assert.ok(calls[0].questions.owner.criteria[NONE_FITS], "every choice offers none-fits");
  });

  test("none-fits, a low fit, or a low confidence is never decided", async () => {
    for (const answers of [
      { owner: choice(NONE_FITS, 0.99), "owner.fits": noul(0.99) },
      { owner: choice("mike", 0.95), "owner.fits": noul(0.4) },
      { owner: choice("mike", 0.5), "owner.fits": noul(0.99) },
    ]) {
      const [r] = await ask(["owner"], { request: "x" }, { key: "k", fetch: fake(answers).fetch, ...dirs() });
      assert.equal(r.decided, false, JSON.stringify(answers));
    }
  });

  test("no key: nothing is sent and nothing is decided", async () => {
    const { fetch, calls } = fake({});
    const [r] = await ask(["owner"], { request: "x" }, { key: null, fetch, ...dirs() });
    assert.equal(r.decided, false);
    assert.match(r.error, /no TypeSafe key/);
    assert.equal(calls.length, 0);
  });

  test("offers every character the front desk routes to", () => {
    const ask = readFileSync("skills/tools/ask-donna/SKILL.md", "utf8");
    const owners = [...ask.matchAll(/^\| [^|]+ \| `(\w+)`/gm)].map((m) => m[1]);
    for (const o of owners) assert.ok(QUESTIONS.owner.options[o], `owner question is missing ${o}`);
  });
});

describe("judge: the gates", () => {
  const code = { repo: "/r", diff: "+ fee = round(amount * 0.015, 2)" };
  const opts = (configDir, extra) => ({ key: "k", configDir, ownerOf: () => "Seuketchi", ...extra });

  test("both gates go in one request, and only a confident yes is decided", async () => {
    const d = dirs();
    allow(d.configDir, ["Seuketchi"]);
    const { fetch, calls } = fake({ "touches-money": noul(0.92), "touches-trust-boundary": noul(0.03) });
    const [money, trust] = await ask(["touches-money", "touches-trust-boundary"], code, opts(d.configDir, { fetch, stateDir: d.stateDir }));
    assert.equal(calls.length, 1);
    assert.deepEqual([money.answer, money.decided], ["yes", true]);
    assert.deepEqual([trust.answer, trust.decided], ["no", false], "a no never lets a check be skipped");
  });

  test("code is not sent from a repository off the allow list", async () => {
    const d = dirs();
    allow(d.configDir, ["Seuketchi"]);
    const { fetch, calls } = fake({});
    const results = await ask(["touches-money"], code, { ...opts(d.configDir, { fetch, stateDir: d.stateDir }), ownerOf: () => "some-employer" });
    assert.equal(calls.length, 0);
    assert.match(results[0].error, /not sent/);
    const none = await ask(["touches-money"], code, { ...opts(join(d.configDir, "empty"), { fetch, stateDir: d.stateDir }) });
    assert.match(none[0].error, /not sent/, "no allow list means nothing is sent");
    assert.equal(calls.length, 0);
  });

  test("the repository path, secrets and long fields do not leave the machine", () => {
    const sent = trimState({ repo: "/home/me/work", diff: `token = "abcdef123456"\n${"x".repeat(30000)}`, key: "ghp_abcdefghijklmnop1234" });
    assert.equal(sent.repo, undefined);
    assert.doesNotMatch(sent.diff, /abcdef123456/);
    assert.match(sent.diff, /cut at 20000/);
    assert.equal(sent.key, "[redacted]");
  });
});

describe("judge: comment-kind", () => {
  test("ask-each puts every comment in one request and answers each", async () => {
    const d = dirs();
    allow(d.configDir, ["Seuketchi"]);
    const { fetch, calls } = fake({
      "comment-kind#0": choice("preference", 0.9),
      "comment-kind#0.fits": noul(0.9),
      "comment-kind#1": choice("defect", 0.95),
      "comment-kind#1.fits": noul(0.9),
    });
    const results = await ask(["comment-kind"], { repo: "/r" }, { key: "k", fetch, ownerOf: () => "Seuketchi", items: [{ comment: "I'd use a ternary" }, { comment: "divides by zero" }], ...d });
    assert.equal(calls.length, 1);
    assert.deepEqual(results.map((r) => [r.answer, r.decided]), [["preference", true], ["defect", true]]);
    assert.notEqual(results[0].id, results[1].id);
  });
});

describe("judge: floors", () => {
  test("a fitted floor can raise a question's floor and never lower it", () => {
    const { configDir } = dirs();
    saveFloors({ owner: 0.5, "touches-money": 0.9 }, configDir);
    assert.equal(floorFor("owner", configDir), QUESTIONS.owner.floor);
    assert.equal(floorFor("touches-money", configDir), 0.9);
  });

  test("report counts agreement and overrides of decided answers", () => {
    const rows = [];
    for (let i = 0; i < 20; i++) rows.push({ id: `a${i}`, question: "owner", answer: "mike", confidence: 0.95, decided: true }, { id: `a${i}`, outcome: "mike" });
    rows.push({ id: "b", question: "owner", answer: "mike", confidence: 0.92, decided: true }, { id: "b", outcome: "rachel" });
    const r = report(rows).owner;
    assert.equal(r.overrides, 1);
    assert.equal(r.bands["0.9-1.0"].total, 21);
    assert.equal(r.suggestedFloor, 0.9);
  });
});

describe("judge: the characters use it", () => {
  const whenToCall = (file) => readFileSync(file, "utf8").match(/^## When to call\s*\n([\s\S]*?)(?=^## )/m)?.[1] ?? "";
  test("donna asks the owner question before naming an owner", () => {
    assert.match(whenToCall("skills/characters/donna/SKILL.md"), /`\/suits:judge` \| a request comes in[^\n]*`owner`/);
  });
  test("louis asks both gates and comment-kind, and a gate's yes only adds a check", () => {
    const row = whenToCall("skills/characters/louis/SKILL.md").split("\n").find((l) => l.startsWith("| `/suits:judge`")) ?? "";
    assert.match(row, /`touches-money` and `touches-trust-boundary` in one request/);
    assert.match(row, /`comment-kind` of every comment in one request/);
    assert.match(row, /anything else leaves the call to the triggers below/);
  });
  test("ask-donna may ask the owner question and nothing else", () => {
    assert.match(readFileSync("skills/tools/ask-donna/SKILL.md", "utf8"), /The one exception is the `owner` question of `\/suits:judge`/);
  });
});

describe("judge: falls-short, red-flag, rule-duplicate", () => {
  const d = () => {
    const x = dirs();
    allow(x.configDir, ["Seuketchi"]);
    return x;
  };
  const opts = (x, fetch, extra = {}) => ({ key: "k", fetch, ownerOf: () => "Seuketchi", ...x, ...extra });

  test("each is a yes-means-escalate question that sends repository content", () => {
    for (const id of ["falls-short", "red-flag", "rule-duplicate"]) {
      assert.equal(QUESTIONS[id].kind, "noul", id);
      assert.equal(QUESTIONS[id].sendsCode, true, id);
    }
  });

  test("falls-short: a confident yes holds the work; a no never passes it", async () => {
    const state = { repo: "/r", done_test: "D1: empty list returns []", diff: "+ return xs.map(f)" };
    const [held] = await ask(["falls-short"], state, opts(d(), fake({ "falls-short": noul(0.9) }).fetch));
    assert.deepEqual([held.answer, held.decided], ["yes", true]);
    const [ok] = await ask(["falls-short"], state, opts(d(), fake({ "falls-short": noul(0.02) }).fetch));
    assert.deepEqual([ok.answer, ok.decided], ["no", false]);
  });

  test("red-flag is refused without an allowed repository", async () => {
    const { fetch, calls } = fake({});
    const [r] = await ask(["red-flag"], { finding: "charged twice for weeks" }, opts(d(), fetch));
    assert.match(r.error, /not sent/);
    assert.equal(calls.length, 0);
  });

  test("rule-duplicate asks every existing rule in one request", async () => {
    const { fetch, calls } = fake({ "rule-duplicate#0": noul(0.1), "rule-duplicate#1": noul(0.93) });
    const results = await ask(["rule-duplicate"], { repo: "/r", new_rule: "every amount carries its currency" }, opts(d(), fetch, { items: ["name the rounding mode", "an amount never travels without its currency code"] }));
    assert.equal(calls.length, 1);
    assert.deepEqual(results.map((r) => r.decided), [false, true]);
  });

  test("louis, rachel and retro ask them", () => {
    const louis = readFileSync("skills/characters/louis/SKILL.md", "utf8");
    assert.match(louis, /asks `falls-short` with the done test and the diff from git, never the builder's message/);
    assert.match(louis, /passes it only by overruling, naming the done-test lines he checked/);
    assert.match(readFileSync("skills/characters/rachel/SKILL.md", "utf8"), /`\/suits:judge` \| a finding is ready to hand over[^\n]*`red-flag`/);
    assert.match(readFileSync("skills/tools/retro/SKILL.md", "utf8"), /`rule-duplicate` question of `\/suits:judge`/);
  });
});
