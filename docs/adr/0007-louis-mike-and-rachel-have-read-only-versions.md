# Louis, mike and rachel have read-only versions

Date: 2026-11-11

## Context

Louis, mike and rachel edit nothing, and when working alone they start no other session (ADR 0003). Both were sentences in a skill. A session that ignored the sentences could still edit a file, write one, or start another session.

## Decision

Each of the three has a definition another session can start, in `agents/louis.md`, `agents/mike.md` and `agents/rachel.md`. Claude Code finds the folder by itself, so `plugin.json` has no `agents` key. A definition is the front matter below and a short body that runs the skill (`/suits:louis`) and follows its **Working alone** section.

- `tools` is an allow-list and is never left out, because leaving it out inherits every tool. It is `Read, Grep, Glob, Bash, Skill`; rachel adds `WebFetch` and `WebSearch`.
- It has no `Edit`, `Write`, `NotebookEdit`, `MultiEdit`, `Agent` or `Task`. A version with none of them can neither change a file nor start another session.
- It sets no `model` or `effort`; the version inherits them.
- `npm run test:characters` reads every file in `agents/` and fails on a banned tool, a missing `tools` line, a missing `Read`, or a body that drops the limits.

## What is enforced, and what is not

- Enforced by the tool list: no file edit through `Edit`, `Write`, `NotebookEdit` or `MultiEdit`, and no other session through `Agent` or `Task`.
- Not enforced: `Bash`. It stays, because louis and mike need `git` and `gh` to read, and the format cannot limit `Bash` to reading: an entry with a pattern in `disallowedTools` removes the whole tool, and a pattern in `tools` is not documented. The body tells the version to use `Bash` only to read, and says in one line that the file cannot limit it. That sentence is the only limit on `Bash`.
- Not used: connected servers. Listing `tools` drops every server tool not named, and naming them by wildcard would also admit their write tools. A read-only version uses no server and falls back as ADR 0006 says. The full skill in the owner's own session still uses one.

## Consequences

- "Edit nothing" and "one pass" hold by construction for these three, except through `Bash`.
- The definitions have the same names as the skills (`suits:louis` and so on). A hand start of `claude --agent suits:louis` loaded the definition and ran the `suits:louis` skill, so the two do not clash and the files keep the character's name.
- A character added later that must be read-only gets a file in `agents/` and an entry in the test.
