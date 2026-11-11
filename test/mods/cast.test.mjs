import assert from "node:assert/strict";
import test from "node:test";

import {
  ACTION_LOG_PATH,
  EMPTY_CAST,
  MAX_ACTION_ROWS,
  MAX_HANDOFFS,
  actionLogLines,
  castEvent,
  castRows,
  isActionLogPath,
  paneText,
  parseActionLog,
} from "../../hooks/logic.mjs";

const CHARACTERS = ["harvey", "mike", "louis", "donna"];
const take = (board, name, loop) => castEvent(board, { kind: "skill", skill: `suits:${name}`, loop }, CHARACTERS);
const tool = (board, name, loop) => castEvent(board, { kind: "tool", tool: name, loop }, CHARACTERS);

test("the first character to take the work makes no hand-off", () => {
  const board = take(EMPTY_CAST, "harvey", "");
  assert.equal(board.holder, "harvey");
  assert.deepEqual(board.handoffs, []);
});

test("one character after another makes a hand-off, oldest first", () => {
  let board = take(EMPTY_CAST, "harvey", "");
  board = take(board, "mike", "");
  board = take(board, "louis", "");
  assert.equal(board.holder, "louis");
  assert.deepEqual(board.handoffs, [
    { from: "harvey", to: "mike" },
    { from: "mike", to: "louis" },
  ]);
  assert.deepEqual(castRows(board).handoffs, ["harvey → mike", "mike → louis"]);
});

test("the same character again changes nothing", () => {
  const once = take(EMPTY_CAST, "harvey", "");
  assert.deepEqual(take(once, "harvey", ""), once);
});

test("a skill prompt (no loop) for a character a loop already holds changes nothing", () => {
  let board = take(EMPTY_CAST, "harvey", "");
  board = take(board, "mike", "sub-1");
  const prompt = castEvent(board, { kind: "skill", skill: "suits:mike", pluginName: "suits" }, CHARACTERS);
  assert.deepEqual(prompt, board);
});

test("a skill prompt (no loop) for a character no loop holds goes to the main loop", () => {
  const board = castEvent(EMPTY_CAST, { kind: "skill", skill: "suits:mike", pluginName: "suits" }, CHARACTERS);
  assert.equal(board.holder, "mike");
  assert.equal(board.loops[""], "mike");
});

test("a bare skill name counts as a character only for this plugin", () => {
  const own = castEvent(EMPTY_CAST, { kind: "skill", skill: "mike", pluginName: "suits" }, CHARACTERS);
  assert.equal(own.holder, "mike");
  const other = castEvent(EMPTY_CAST, { kind: "skill", skill: "mike", pluginName: "other" }, CHARACTERS);
  assert.equal(other.holder, "");
});

test("a tool call is credited to the character holding its loop", () => {
  let board = take(EMPTY_CAST, "harvey", "");
  board = take(board, "mike", "sub-1");
  board = tool(board, "Bash", "sub-1");
  board = tool(board, "Edit", "");
  assert.deepEqual(board.lastTool, { mike: "Bash", harvey: "Edit" });
  board = tool(board, "Read", "sub-1");
  assert.equal(board.lastTool.mike, "Read");
});

test("a tool call in a loop no character holds is credited to no one", () => {
  const board = take(EMPTY_CAST, "harvey", "");
  assert.deepEqual(tool(board, "Bash", "sub-9"), board);
  assert.deepEqual(tool(EMPTY_CAST, "Bash", ""), EMPTY_CAST);
});

test("a tool call with no loop is the main loop's", () => {
  const board = tool(take(EMPTY_CAST, "harvey", ""), "Bash");
  assert.equal(board.lastTool.harvey, "Bash");
});

test("a tool call keeps its name only, never its arguments", () => {
  const board = castEvent(take(EMPTY_CAST, "harvey", ""), { kind: "tool", tool: "mcp__suits__suits_checklist", loop: "", input: { steps: ["x"] } }, CHARACTERS);
  assert.deepEqual(board.lastTool, { harvey: "mcp__suits__suits_checklist" });
});

test("a skill that is not a character is labelled as a slash command and credited like a tool", () => {
  let board = take(EMPTY_CAST, "harvey", "");
  board = castEvent(board, { kind: "skill", skill: "suits:tdd", loop: "" }, CHARACTERS);
  assert.equal(board.lastTool.harvey, "/suits:tdd");
  assert.equal(board.holder, "harvey");
  board = castEvent(board, { kind: "skill", skill: "commit", loop: "" }, CHARACTERS);
  assert.equal(board.lastTool.harvey, "/commit");
});

test("castRows gives one tool row per character, in the order each first took the work", () => {
  let board = take(EMPTY_CAST, "harvey", "");
  board = tool(board, "Read", "");
  board = take(board, "mike", "");
  board = tool(board, "Bash", "");
  assert.deepEqual(castRows(board), {
    holder: "mike",
    handoffs: ["harvey → mike"],
    tools: [
      { character: "harvey", tool: "Read" },
      { character: "mike", tool: "Bash" },
    ],
  });
});

test("castRows on an empty board is empty", () => {
  assert.deepEqual(castRows(EMPTY_CAST), { holder: "", handoffs: [], tools: [] });
});

test("handoffs keep only the newest MAX_HANDOFFS", () => {
  let board = take(EMPTY_CAST, "harvey", "");
  for (let i = 0; i < MAX_HANDOFFS + 5; i++) board = take(board, i % 2 === 0 ? "mike" : "harvey", "");
  assert.equal(board.handoffs.length, MAX_HANDOFFS);
  // hand-offs 1 to 5 are gone: the list starts at the sixth, mike → harvey, and ends at the holder
  assert.deepEqual(board.handoffs[0], { from: "mike", to: "harvey" });
  assert.equal(board.handoffs.at(-1).to, board.holder);
});

test("a malformed event returns the board unchanged", () => {
  const board = take(EMPTY_CAST, "harvey", "");
  for (const event of [undefined, null, 7, "skill", {}, { kind: "nope" }, { kind: "skill" }, { kind: "skill", skill: 3 }, { kind: "tool" }, { kind: "tool", tool: "" }, { kind: "tool", tool: 3 }, { kind: "tool", tool: "Bash", loop: 4 }]) {
    assert.deepEqual(castEvent(board, event, CHARACTERS), board);
  }
  assert.deepEqual(castEvent(board, { kind: "skill", skill: "suits:mike", loop: "" }, undefined), board);
});

test("castEvent does not change the board it is given", () => {
  const board = take(EMPTY_CAST, "harvey", "");
  const frozen = JSON.stringify(board);
  take(board, "mike", "");
  tool(board, "Bash", "");
  assert.equal(JSON.stringify(board), frozen);
  assert.deepEqual(EMPTY_CAST, { holder: "", loops: {}, handoffs: [], lastTool: {} });
});

const TABLE = `# Action log

| ID | Owner | Task | Due | Status |
| --- | --- | --- | --- | --- |
| A-014 | Maria Santos | Send the signed UAT results | 18 November 2026 | open |
| A-015 | Ben Cruz | Book the venue | | parked |
| A-016 | Ana Reyes | Pay the vendor | 1 October 2026 | done |
`;

test("parseActionLog reads the table", () => {
  assert.deepEqual(parseActionLog(TABLE), {
    status: "ok",
    rows: [
      { id: "A-014", owner: "Maria Santos", task: "Send the signed UAT results", due: "18 November 2026", status: "open" },
      { id: "A-015", owner: "Ben Cruz", task: "Book the venue", due: "", status: "parked" },
      { id: "A-016", owner: "Ana Reyes", task: "Pay the vendor", due: "1 October 2026", status: "done" },
    ],
  });
});

test("parseActionLog matches columns by name, any case and any order, and Due is optional", () => {
  const log = parseActionLog("| status | TASK | owner | Id |\n|:--|--:|:-:|---|\n| open | Call them | Ben | A-1 |\n");
  assert.deepEqual(log, { status: "ok", rows: [{ id: "A-1", owner: "Ben", task: "Call them", due: "", status: "open" }] });
});

test("parseActionLog is missing for undefined and has no rows without the table", () => {
  assert.deepEqual(parseActionLog(undefined), { status: "missing" });
  assert.deepEqual(parseActionLog(""), { status: "ok", rows: [] });
  assert.deepEqual(parseActionLog("# Actions\n\nNothing here.\n"), { status: "ok", rows: [] });
  assert.deepEqual(parseActionLog("| ID | Owner |\n| --- | --- |\n| 1 | x |\n"), { status: "ok", rows: [] });
});

test("parseActionLog reads the first matching table only, and does not throw on odd input", () => {
  const text = "| Name | Note |\n| - | - |\n| a | b |\n\n" + TABLE + "\n| ID | Owner | Task | Status |\n| - | - | - | - |\n| B-1 | z | z | open |\n";
  assert.equal(parseActionLog(text).rows.length, 3);
  for (const odd of [null, 5, {}, "|", "||||", "| ID | Owner | Task | Status |", "| ID | Owner | Task | Status |\n|---|---|---|---|\n| only |"]) {
    assert.doesNotThrow(() => parseActionLog(odd));
  }
});

const row = (id, status, extra = {}) => ({ id, owner: "Ben", task: `Task ${id}`, due: "", status, ...extra });

test("actionLogLines for a missing log", () => {
  assert.deepEqual(actionLogLines({ status: "missing" }), ["No action log."]);
});

test("actionLogLines for a log with no actions", () => {
  assert.deepEqual(actionLogLines({ status: "ok", rows: [] }), ["No actions yet."]);
});

test("actionLogLines counts by status, leaves out done and dropped, and shows the due date when there is one", () => {
  const lines = actionLogLines(parseActionLog(TABLE));
  assert.deepEqual(lines, [
    "1 open, 1 parked, 1 done",
    "A-014 open Maria Santos: Send the signed UAT results (due 18 November 2026)",
    "A-015 parked Ben Cruz: Book the venue",
  ]);
  const log = { status: "ok", rows: [row("1", "open"), row("2", "parked"), row("3", "open"), row("4", "done"), row("5", "dropped"), row("6", "done")] };
  assert.equal(actionLogLines(log)[0], "2 open, 1 parked, 2 done, 1 dropped");
  assert.equal(actionLogLines(log).length, 4);
});

test("actionLogLines cuts at MAX_ACTION_ROWS with `and N more`", () => {
  const rows = Array.from({ length: MAX_ACTION_ROWS + 3 }, (_, i) => row(`A-${i}`, "open"));
  const lines = actionLogLines({ status: "ok", rows });
  assert.equal(lines.length, 1 + MAX_ACTION_ROWS + 1);
  assert.equal(lines[0], `${MAX_ACTION_ROWS + 3} open`);
  assert.equal(lines.at(-1), "and 3 more");
  const exact = actionLogLines({ status: "ok", rows: rows.slice(0, MAX_ACTION_ROWS) });
  assert.equal(exact.length, 1 + MAX_ACTION_ROWS);
  assert.ok(!exact.some((l) => l.startsWith("and ")));
});

test("actionLogLines with only closed actions gives just the count", () => {
  assert.deepEqual(actionLogLines({ status: "ok", rows: [row("1", "done")] }), ["1 done"]);
});

test("isActionLogPath", () => {
  assert.equal(ACTION_LOG_PATH, "donna/action-log.md");
  assert.equal(isActionLogPath("donna/action-log.md"), true);
  assert.equal(isActionLogPath("/home/x/proj/donna/action-log.md"), true);
  for (const no of ["/home/x/proj/notdonna/action-log.md", "donna/action-log.md.bak", "/home/x/donna/other.md", "action-log.md", "", undefined, null, 5, {}]) {
    assert.equal(isActionLogPath(no), false);
  }
});

test("paneText names the pane it answers for, and the checklist's text is unchanged", () => {
  assert.equal(paneText({ isPlaced: true }, "Cast"), "Cast pane opened.");
  assert.equal(paneText({ isPlaced: false, reason: "too narrow" }, "Cast"), "Cast pane is open but not shown: too narrow");
  assert.equal(paneText(undefined, "Cast"), "Cast pane is open but not shown: no surface draws it yet");
  assert.equal(paneText({ isPlaced: true }), "Checklist pane opened.");
  assert.equal(paneText({ isPlaced: false, reason: "too narrow" }), "Checklist pane is open but not shown: too narrow");
});
