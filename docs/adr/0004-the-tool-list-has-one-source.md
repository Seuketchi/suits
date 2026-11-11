# The tool list has one source

Date: 2026-11-11

## Context

The list of skills was written by hand in four places: `plugin.json`'s `skills`, the root README's tool lists, and the two bucket READMEs, which also say who calls each tool. Adding or renaming a skill meant four edits, and a missed one was found only when a check failed. A tool's callers were also written twice, once in a character's When to call table and again in a "Called by" tail.

## Decision

The skill folders are the source: each `skills/<bucket>/<name>/SKILL.md` and its `disable-model-invocation`, and each character's **When to call** table, which says who calls a tool. `scripts/lists.mjs` builds the copies from them.

- `npm run lists` (`--write`) rewrites `plugin.json`'s `skills`, the root README's User-invoked and Model-invoked tool lists, the grouping of both bucket READMEs, and each tool's "Called by" tail.
- `--check` exits 1 and names each copy that has drifted. `npm run check-skills` runs it, so CI fails on a stale copy.
- The one-line summary of each skill in the bucket READMEs stays hand-written and is kept by name. So is the whole line of a user-invoked tool, since its offer ("offered by louis") is not in any table.

Running `npm run lists` first is now the first step after adding, moving or renaming a skill.

## Consequences

- One edit adds a skill: the folder, with a summary line in its bucket README if the default (the first sentence of its description) is not enough.
- `check-skills.mjs` no longer checks the plugin listing or the README grouping on its own; the generator's output is that check, so the fact is checked once.
- The README tests in `test/characters/characters.test.mjs` stay. They read the generated files, so they stay as a second proof that the generator is right.
