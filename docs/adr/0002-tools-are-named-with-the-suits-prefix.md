# Every tool is named with the `suits:` prefix

Date: 2026-11-11

## Context

ADR 0001 says moved skills are called `suits:<name>`. The skill text and the docs pages still wrote them bare (for example the bare form of the `tdd` and `code-review` tools). A bare name works only when no other plugin or local skill has the same name, and several of these tools exist under that name elsewhere. A character that told the model to run the bare `tdd` could run the wrong one.

## Decision

Every reference to a skill shipped in this repo is written `/suits:<name>`, in all Markdown under `skills/` and `docs/`: the characters, the tools, their reference files, both bucket READMEs and the docs pages. Where a character is told to run another character, that is `/suits:<name>` too. Paths and names that are not skills here (`/tmp`, `/rabbit-hole`) are left as they are.

`test/characters/characters.test.mjs` scans skill text and docs pages and fails on a code span `/<name>` where `<name>` is a skill in this repo. Its self-test plants a bare tool name and sees the scan fire.

## Consequences

- A new skill is referenced with the prefix from the start; the scan stops a bare reference from coming back.
- A tool that is renamed or moved is repointed everywhere in one step, as ADR 0001 already asks.
- The prefix is part of the name the owner types, so docs pages show it too.
