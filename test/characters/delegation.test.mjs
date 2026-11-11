// The research and stocktake tools run in a background session, and must never start a second one (D7).
//
//   node --test test/characters/delegation.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(".");
const read = (...p) => readFileSync(join(root, ...p), "utf8");

const NO_RE_DELEGATION = /already a sub-agent.*do the work yourself.*never re-delegate/s;

for (const tool of ["research", "stocktake"]) {
  describe(`/suits:${tool}`, () => {
    test("does the work itself when already a sub-agent, and never re-delegates", () => {
      assert.match(read("skills/tools", tool, "SKILL.md"), NO_RE_DELEGATION);
    });
  });
}

// The research tool works inline unless the reading is broad (ADR 0010).
describe("/suits:research works inline by default", () => {
  const text = read("skills/tools/research/SKILL.md");
  const body = text.replace(/^---\n[\s\S]*?\n---\n/, "");
  const front = text.match(/^---\n([\s\S]*?)\n---/)[1];

  test("the default is to read and answer in the current session", () => {
    assert.match(body, /by default[^\n]*(inline|in the current session|yourself)/i);
    assert.doesNotMatch(body, /^Run the research in a \*\*background agent\*\*/m);
  });

  test("delegates only for several independent directions or reading too big for one context, in one line", () => {
    const line = body.split("\n").find((l) => /delegate/i.test(l) && /independent/i.test(l));
    assert.ok(line, "no line says when it delegates");
    assert.match(line, /several independent directions/);
    assert.match(line, /too (big|large) for one context/);
  });

  test("a delegated session runs on the cheaper sonnet model", () => {
    assert.match(body, /model[^\n]*`sonnet`/i);
  });

  test("a delegated brief has an objective, an output format, the sources to use and bounds", () => {
    for (const part of [/objective/i, /output format/i, /sources to use/i, /bounds/i]) assert.match(body, part);
  });

  test("still never re-delegates, and still writes the findings file", () => {
    assert.match(body, NO_RE_DELEGATION);
    assert.match(body, /\/suits:findings/);
    assert.match(body, /docs\/findings\/<topic>\.md/);
  });

  test("the description no longer promises a background agent", () => {
    assert.doesNotMatch(front, /background agent/);
  });

  test("the docs page says inline is the default", () => {
    const page = read("docs/tools/research.md");
    assert.match(page, /inline/i);
    assert.doesNotMatch(page, /defining move is that the reading runs as a \*\*background session\*\*/);
  });

  test("ADR 0010 records the model choice and why no agent file carries it", () => {
    const adr = read("docs/adr/0010-research-works-inline-and-delegates-on-sonnet.md");
    assert.match(adr, /^# /);
    assert.match(adr, /`sonnet`/);
    assert.match(adr, /agents\//);
    assert.match(adr, /inline/i);
  });
});
