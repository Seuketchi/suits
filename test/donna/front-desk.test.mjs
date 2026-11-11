// donna's front-desk steps: one owner per request, and an unrelated ask is a new request.
//
//   node --test test/donna/front-desk.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const skill = readFileSync("skills/characters/donna/SKILL.md", "utf8");
const doc = readFileSync("docs/characters/donna.md", "utf8");
const section = (source, title) => source.split(/^## /m).find((s) => s.startsWith(title)) ?? "";

describe("donna's front desk", () => {
  test("step 1 says an unrelated ask is a new request with its own owner and its own log line", () => {
    const step1 = section(skill, "At the front desk").match(/^1\. [^\n]*/m)?.[0] ?? "";
    assert.match(step1, /An unrelated ask is a new request, with its own owner and its own log line\./);
  });
  test("the steps still run 1 to 6", () => {
    const nums = [...section(skill, "At the front desk").matchAll(/^(\d+)\. \*\*/gm)].map((m) => Number(m[1]));
    assert.deepEqual(nums, [1, 2, 3, 4, 5, 6]);
  });
  test("her docs page's one-owner bullet carries the same fact", () => {
    const bullet = section(doc, "At the front desk").match(/^- \*\*One owner\.\*\*[^\n]*/m)?.[0] ?? "";
    assert.match(bullet, /unrelated ask is a new request[^\n]*own owner[^\n]*own log line/);
  });
  test("step 2 lets the run's board stand in for the action log, and the decision log is always kept", () => {
    const step2 = section(skill, "At the front desk").match(/^2\. [^\n]*/m)?.[0] ?? "";
    assert.match(step2, /When the run keeps its own board of tickets, the board is the action log: write no action-log line\./);
    assert.match(step2, /The decision log is kept in every case\./);
  });
  test("the only-writer line and One record follow, and neither says ticket board", () => {
    const desk = section(skill, "At the front desk");
    assert.match(desk, /Donna is the only writer of the decision log, and of the action log when the run has no board of its own\./);
    const record = skill.match(/^- \*\*One record\.\*\*[^\n]*/m)?.[0] ?? "";
    assert.match(record, /board/);
    assert.match(record, /decision log at `donna\/decision-log\.md`/);
    assert.doesNotMatch(skill, /\btickets? boards?\b/i);
  });
  test("her docs page says the board can be the action log", () => {
    const bullet = section(doc, "At the front desk").match(/^- \*\*Two logs, one writer\.\*\*[^\n]*/m)?.[0] ?? "";
    assert.match(bullet, /board/);
    assert.match(bullet, /decision log/);
  });
});

describe("the chat reply", () => {
  const claude = readFileSync("CLAUDE.md", "utf8");
  const rule = claude.split("\n").find((l) => /machine-made look/.test(l)) ?? "";
  test("CLAUDE.md keeps documents and emails in English and allows Taglish only in a chat reply to a teammate", () => {
    assert.match(rule, /Documents and emails are in English\./);
    assert.match(rule, /A chat reply to a teammate may be in Taglish when the owner asks or the thread is in it\./);
    assert.doesNotMatch(claude, /English only/);
    assert.equal(claude.match(/Taglish/g).length, 1);
  });
  test("donna's table has a chat-reply row that is never sent", () => {
    const row = skill.split("\n").find((l) => l.startsWith("| A reply to a teammate in chat |")) ?? "";
    assert.match(row, /\| none \|/);
    assert.match(row, /a short draft in the thread's language \(English or Taglish\), never sent/);
  });
  test("her docs page lists the chat reply, and her email file stays English", () => {
    assert.match(doc, /A reply to a teammate in chat[^\n]*Taglish/);
    assert.match(readFileSync("skills/characters/donna/email/EMAIL.md", "utf8"), /English/);
  });
});
