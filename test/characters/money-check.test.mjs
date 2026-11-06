// The money-check tool: its trigger, its item g, and what it leaves to the caller.
//
//   node --test test/characters/money-check.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const raw = readFileSync("skills/tools/money-check/SKILL.md", "utf8");
const head = raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
const body = raw.slice(raw.indexOf("\n---", 4) + 4);

describe("money-check", () => {
  test("the description is pinned, with the use-only-when and skip sentences", () => {
    assert.match(
      head,
      /^description: A ten-item check on how a diff or spec handles amounts, fees, limits, rates, rounding, currency or balances, each answered with a file:line\. Use only when the work touches money\. Skip when it does not\.$/m,
    );
    assert.match(head, /Use only when the work touches money\. Skip when it does not\./);
  });

  test("a diff with no money in it skips the check", () => {
    assert.match(body, /A diff with no money in it skips this/);
  });

  test("item g says whether the limit is read before or after rounding", () => {
    const row = raw.split("\n").find((l) => /^\| g \|/.test(l)) ?? "";
    assert.match(row, /at the place it moves \(before or after rounding\)\./);
    assert.match(row.split("|")[3], /A limit in USD is not compared with a JPY figure\./);
  });

  test("the assumption on item g goes on the Checked: line of the hand-over", () => {
    assert.match(body, /Item g is a judgement/);
    assert.match(body, /assumption[^.\n]*`Checked:` line of the hand-over/);
  });

  test("it names no caller and cites no research", () => {
    assert.doesNotMatch(raw, /\b(louis|jessica|harvey|donna|rachel|mike|associates)\b/i);
    assert.doesNotMatch(raw, /no source|research|\bstudy\b|\bpapers?\b/i);
  });
});
