# Live cast board

Target path in the repository: `specs/live-cast-board.md`.

## Problem

While a job runs, the owner cannot see who is doing it. The status line names the last character skill used, and the checklist pane shows the job's steps, but nothing shows which character holds the work now, how the work passed from one character to the next, or what each character last did. When donna keeps an action log, the owner has to open the file to see what is open.

## Solution

A second pane in the existing suits mod, opened with `/suits-cast`. It is drawn from values the mod keeps for the session only, updated live by the mod's hooks on tool calls and skill prompts. It shows:

1. the character holding the work now;
2. the hand-offs so far, in order (`harvey → mike`, `mike → louis`);
3. the last tool each character called;
4. donna's action log, read-only, when `donna/action-log.md` is present.

Nothing is written to disk: no file, no `$.store`. The action log is read, never written.

## User stories

1. As the owner, I open `/suits-cast` and see which character holds the work, so I know who to ask.
2. As the owner, I see the hand-offs in order, so I can tell how the work got where it is.
3. As the owner, I see the last tool each character called (`Bash`, `Edit`, `/suits:tdd`), so I can tell whether a character is still working or stuck.
4. As the owner, when the project has `donna/action-log.md`, I see its open and parked actions and a count by status, and the pane updates when the log is edited during the session.
5. As the owner, I can trust the pane never changes my files and leaves nothing behind when the session ends.
6. As the owner, a failure in the board never blocks or changes a tool call.
7. As the owner of a project with no action log and no character used yet, the pane says so plainly instead of showing empty sections.

## Implementation decisions

Settled before this spec and not reopened: the board is a pane in the existing mod (`hooks/register.tsx`); it is fed by hook events, not by polling files; the action log is read-only; v1 shows the holder, the hand-offs and each character's last tool; nothing is stored on disk.

### Where the code goes

- Decisions stay pure in `hooks/logic.mjs` (no `$`, no file reads), as the mod's other decisions are. `hooks/register.tsx` only reads, feeds and draws.
- Values the pane draws from are `atom`s in `$.state` (held by the host for the session, kept across a hot reload, never on disk), declared in `types/index.d.ts` with a `shape` tag. No `$.store`, no `$.fs.write`.

### The board (pure, in `hooks/logic.mjs`)

```ts
type CastBoard = {
  holder: string                      // character holding the work now; '' for none
  loops: Record<string, string>       // loop id ('' is the main loop) -> character holding it
  handoffs: { from: string; to: string }[]  // oldest first, at most MAX_HANDOFFS
  lastTool: Record<string, string>    // character -> label of the last tool it called
}
type CastEvent =
  | { kind: 'skill'; skill: string; loop?: string; pluginName?: string }
  | { kind: 'tool'; tool: string; loop?: string }

export const EMPTY_CAST: CastBoard
export const MAX_HANDOFFS = 20
export function castEvent(board: CastBoard, event: CastEvent, characters: string[]): CastBoard
export function castRows(board: CastBoard): { holder: string; handoffs: string[]; tools: { character: string; tool: string }[] }
```

Rules `castEvent` follows:

- A `skill` event names a character when `characterOf(skill, characters, pluginName)` (already in `logic.mjs`) returns one.
  - With a `loop` (it came from a `Skill` tool call), that loop's holder becomes the character.
  - With no `loop` (it came from `skill.prompt`, which carries none): if some loop already holds that character, nothing changes, since the `Skill` call that raised it was already counted; otherwise the main loop (`''`) takes it.
  - When the board's `holder` changes from a non-empty `A` to a different `B`, `{ from: A, to: B }` is appended to `handoffs`; then `holder` becomes `B`. The first character to take the work makes no hand-off. A character taking a loop it already holds changes nothing.
  - `handoffs` keeps the newest `MAX_HANDOFFS`.
- A `skill` event that names no character is a tool call: the label is `/` plus the skill name (`/suits:tdd`, `/commit`), credited as below.
- A `tool` event is credited to the character holding its loop (`loops[loop ?? '']`). A call in a loop no character holds is credited to no one. The label is the tool's name as the event gives it (`Bash`, `mcp__suits__suits_checklist`). Arguments are never kept.
- `castEvent` never throws on an unknown or malformed event; it returns the board unchanged.

`castRows` gives the pane its lines: the holder; each hand-off as `from → to`; and one row per character in `lastTool`, in the order each character first took the work.

### The action log (pure, in `hooks/logic.mjs`)

```ts
type ActionRow = { id: string; owner: string; task: string; due: string; status: string }
type ActionLog = { status: 'missing' } | { status: 'ok'; rows: ActionRow[] }

export const ACTION_LOG_PATH = 'donna/action-log.md'
export const MAX_ACTION_ROWS = 10
export function parseActionLog(text: string | undefined): ActionLog
export function actionLogLines(log: ActionLog): string[]
export function isActionLogPath(path: unknown): boolean
```

- `parseActionLog(undefined)` is `{ status: 'missing' }`. Otherwise it reads the first Markdown table whose header holds `ID`, `Owner`, `Task` and `Status` (matched by name, any case, any column order; `Due` optional), skipping the separator row. Cells are trimmed. A file with no such table is `{ status: 'ok', rows: [] }`. It never throws.
- `actionLogLines` gives: for `missing`, `No action log.`; otherwise a count line by status (`2 open, 1 parked, 4 done`, statuses in the order first seen; `No actions yet.` when there are none), then one line per row whose status is not `done` or `dropped`, as `A-014 open Maria Santos: Send the signed UAT results (due 18 November 2026)` (the due part left out when empty), at most `MAX_ACTION_ROWS`, then `and N more` when some are cut.
- `isActionLogPath(path)` is true when `path` is a string ending in `/donna/action-log.md` or equal to `donna/action-log.md`.
- The log is found the way the rules file is: `donna/action-log.md` in the session's start folder and each parent up to the git root (`searchDirs`), nearest first. Only that path; a log the owner keeps elsewhere is out of v1.

### The pane's command text

`paneText(opened)` today answers for the checklist only. It takes the pane's title as a second argument, defaulting to `Checklist`, so `/suits-cast` answers `Cast pane opened.` or `Cast pane is open but not shown: <reason>`. The checklist's text does not change.

### Wiring (in `hooks/register.tsx`)

- Two atoms: `cast` (`CastBoard`, shape `cast-1`) and `actionLog` (`ActionLog`, shape `action-log-1`), declared in `types/index.d.ts`.
- A `tool.call` hook on every tool. Before calling `next(e)` it feeds the board: a `Skill` call as `{ kind: 'skill', skill: e.skill, loop: e.agentId ?? '' }`, any other call as `{ kind: 'tool', tool: e.tool, loop: e.agentId ?? '' }`. It updates the board before `next(e)` so the `skill.prompt` the call raises finds the loop already held. After `next(e)`, when the call ran (no `deny`) and its `file_path` passes `isActionLogPath`, it reads the log again and updates `actionLog`. It returns what `next(e)` returned, unchanged. It has a `.catch` that calls `next(e)`: a board failure never stops or changes a call. It must also see `suits_checklist` calls, whose own hook answers without `next`; register it so it does, and prove it in the test.
- The existing `skill.prompt` hook also feeds `{ kind: 'skill', skill: e.skill, pluginName: e.pluginName }` (no loop). Its status-line behaviour is unchanged.
- `session.start` registers `/suits-cast` ("Open the cast pane: who holds the work, the hand-offs, and the action log.") and reads the action log once.
- `command.run` for `suits-cast` reads the action log again, then opens the pane `{ id: 'suits-cast', title: 'Cast' }` and answers `paneText(opened, 'Cast')`. Nothing else opens it.
- `ui.render` on `{ component: 'Pane', requestId: 'suits-cast' }` reads both atoms and draws plain `Text` lines: `Holding: <character>` or `No character yet.`; a `Hand-offs` line per hand-off or `No hand-offs yet.`; a `<character>: <tool>` line per character; then the action-log lines. No colours beyond `dimColor` for empty states.
- The mod reads no new environment variable and writes nothing: no `$.fs.write` or other write, no `$.store`.

### Docs

`README.md`'s **Mods** section gets a **Cast board** subsection after **Checklist**: what `/suits-cast` shows, that it opens only when asked, that it keeps nothing on disk, and that it reads `donna/action-log.md` from the start folder up to the git root and never writes it. Plain professional register; no workflow words.

## Testing decisions

- A good test checks what the owner sees or what a pure function returns, through its public interface, not how the hooks are wired.
- `hooks/logic.mjs` functions: `node --test` in `test/mods/`, like `test/mods/logic.test.mjs` (prior art).
- The pane and hooks: a `claude-code/testing` test in `hooks/`, like `hooks/checklist.test.tsx` (prior art), on the terminal and desktop surfaces, run by `claude plugin test .`.
- The read-only and nothing-on-disk rules: a source scan in `test/mods/project-agnostic.test.mjs`, like its environment scan (prior art), so a later change that writes cannot pass CI.
- `claude plugin eval` is run by hand, not in CI; no eval is needed for this change since no skill's behaviour changes.

## Out of scope

- A history that outlives the session, or any file written by the board.
- Writing to, or editing, the action log.
- An action log kept anywhere but `donna/action-log.md` under the start folder's tree.
- Showing tool arguments, timings, or a timeline.
- Opening the pane by itself, or changing the checklist pane and the status line.
- Telling apart two runs of the same character in parallel loops (each associate is one character).

## Further notes

- The `Skill` tool's own `tool.call` and the `skill.prompt` it raises can both reach the board; the "a loop already holds it" rule makes the second a no-op. If a live session shows `skill.prompt` arriving before the `tool.call` hook's update, that rule is the one to revisit.
- A delegated task's loop id comes from `tool.call`'s `agentId`; `skill.prompt` carries none. A character a delegated task takes through a slash command, not the `Skill` tool, is credited to the main loop.
