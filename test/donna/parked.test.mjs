// donna's parked state: work the owner has paused waits on the owner, with a resurface date.
//
//   node --test test/donna/parked.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(p, "utf8");
const tickler = read("skills/characters/donna/secretary/TICKLER.md");
const skill = read("skills/characters/donna/SKILL.md");
const doc = read("docs/characters/donna.md");

describe("donna parks work the owner has paused", () => {
  test("the tickler has a parked entry on the owner's side, with a resurface date", () => {
    assert.match(tickler, /\| waiting on \| the owner \|[^\n]*\| parked \|$/m, "the example row: waiting on, the owner, parked");
    assert.doesNotMatch(tickler, /\| parked \| the owner/, "parked is a Status, not a Kind");
    assert.doesNotMatch(tickler, /\*\*Kind\*\* is[^\n]*`parked`/, "parked is not among the kinds");
    assert.match(tickler, /Kind `waiting on`, \*\*With\*\* the owner, Status `parked`/);
    assert.match(tickler, /busy or still handling/i);
    assert.match(tickler, /resurface date/i);
  });
  test("parked work is not started or nagged before its date", () => {
    assert.match(tickler, /never starts parked work/i);
    assert.match(tickler, /before (its|the) (resurface )?date/i);
    assert.match(tickler, /no nudge/i);
  });
  test("it is raised on the date, or earlier only when the owner asks", () => {
    assert.match(tickler, /raises it on (its|the) (resurface )?date/i);
    assert.match(tickler, /earlier only when the owner asks/i);
  });
  test("a parked item is not overdue or stale until its date", () => {
    assert.match(tickler, /not (counted )?(overdue|late)[^.\n]*stale|neither overdue nor stale/i);
  });
  test("released by the owner, both statuses go back, and the file for each is named", () => {
    assert.match(tickler, /Released by the owner: the tickler row's Status goes back to `open` and the action-log row's Status/);
  });
  test("the briefs and the meeting brief do not call a parked action overdue", () => {
    const briefing = read("skills/characters/donna/secretary/BRIEFING.md");
    const waiting = briefing.match(/\*\*Waiting on the owner:\*\*[^\n]*/)?.[0] ?? "";
    assert.match(briefing.match(/\*\*Due today\*\*[^\n]*/)?.[0] ?? "", /not parked rows before their resurface date/);
    assert.match(waiting, /not parked rows before their resurface date/);
    assert.match(read("skills/characters/donna/secretary/MEETING-BRIEF.md"), /An overdue one, parked rows excepted before their date, is flagged first, in plain words \("Overdue since 4 November"\)/);
  });
  test("the action log's Status line and the status report's blocked line carry parked", () => {
    assert.match(read("skills/characters/donna/secretary/MINUTES.md"), /\*\*Status\*\* is `open`, `done`, `dropped` or `parked`/);
    assert.match(read("skills/tools/status-report/SKILL.md"), /blocked: [^\n]*parked by the owner is blocked on the owner|blocked: [^\n]*owner parked is blocked on the owner, never late or aged/);
  });
  test("the action log has a parked state next to the others", () => {
    assert.match(skill, /`parked`/);
    assert.match(skill, /open[^.\n]*done[^.\n]*dropped[^.\n]*parked|parked[^.\n]*resurface date/i);
  });
  test("the docs page says what she does when you are busy", () => {
    assert.match(doc, /parked/i);
    assert.match(doc, /resurface/i);
  });
});
