# Rules come from a project rules file

Date: 2026-11-11

## Context

Some projects have rules a session must not break: a folder only its owners change, or a command that must not run twice at once. Writing those rules into this plugin would tie it to one project, and a session could not tell which project's rules apply. Claude Code can run hooks on every tool call, which is where a rule can be enforced rather than only asked for.

## Decision

The plugin ships a mod in `hooks/`, and the mod holds no rule of its own. A project lists its rules in `.claude/suits-rules.json`: a `never` list and a `warn` list, each rule an `id`, a `why`, an optional `tools` list and a `match` regular expression. The mod looks for the file from the session's start folder up to the git root.

- A `never` match is denied with `<id>: <why>`, and the owner sees a toast.
- A `warn` match runs. The owner sees a toast and the model reads the `why` after the tool's result.
- With no file, every call passes. A file that is not valid JSON, or that exists but cannot be read, is reported once and none of its rules apply, so a mistake in the file never stops work. A read that fails on a file that exists is never taken for no file.
- One bad rule drops only that rule and is reported once; the valid `never` and `warn` rules in the same file stay in force. A rule is bad when a field is missing, `match` is not a regular expression, or `match` repeats a group that already repeats (`(a+)+`), which can freeze every call. Input longer than 4 KB is cut off before it is tested, for the same reason.
- If the check itself fails, the call goes through and a toast says it was not checked.
- A warning is toasted only for a call that ran.
- `/suits-rules` shows the file, or says there is none.

The decisions are pure functions in `hooks/logic.mjs`, tested with `node:test` and no Claude Code install. `hooks/register.ts` only reads the file and calls them, and is tested with `claude plugin test .`. A test fails if `hooks/` carries a rule of its own or reads the environment.

## Consequences

- A project adds, changes or drops a rule by editing its own file. This repo never holds a real project's rules, in code, tests or docs.
- Hooks fire inside every session the owner's session starts, so the same rules hold there.
- There is no per-project off switch except the file itself.
- The command is named `suits-rules`, typed `/suits-rules`: a mod registers a bare name, so the suits name is part of it and it cannot clash with another plugin's `/rules`.
- CI pins a Claude Code build that reads `hooks.json` modules and runs `claude plugin test .`, which needs no login.
