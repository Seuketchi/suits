// donna's desk: when an MCP server with desk tools is connected, it is the one record for her logs.
//
//   node --test test/donna/desk.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(p, "utf8");
const skill = read("skills/characters/donna/SKILL.md");
const minutes = read("skills/characters/donna/secretary/MINUTES.md");
const tickler = read("skills/characters/donna/secretary/TICKLER.md");

describe("donna keeps her logs on a connected desk server", () => {
  test("a desk server with desk_log and desk_read is the one record, and the files are not also written", () => {
    assert.match(skill, /tools include `desk_log` and `desk_read`, that desk is the one record/);
    assert.match(skill, /do not also write the files/);
  });
  test("the desk is append-only: a correction names the entry it fixes", () => {
    assert.match(skill, /a correction is a new entry with `corrects` set/);
    assert.match(minutes, /a new entry that `corrects` the row/);
  });
  test("without a desk server the files stay the record", () => {
    assert.match(skill, /Without such a server, the files above are the record/);
  });
  test("the action log and the tickler each name their desk log", () => {
    assert.match(minutes, /the desk's `action` log/);
    assert.match(tickler, /the desk's `tickler` log/);
  });
});
