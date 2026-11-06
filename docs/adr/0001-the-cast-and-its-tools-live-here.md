# The characters and the tools they call live in one repo

Date: 2026-11-06

## Context

The skills the characters call were spread over a general skills repo, a folder of local skills that no repo tracks, and branches in progress. Several are renamed copies of skills by other authors. Porting upstream changes needed one round per repo, and a character's tools could change under it without it being in the same place.

## Decision

This repo holds the characters and every tool they call. The skills move in from the general repo with their upstream log, the upstream check script, the port routine and their tests, so one repo has one port round and one maintainer drafts every upstream port. Tools are moved, not copied: each file has one owner. Tools carry the upstream author's names where one exists.

The plugin is named `suits`. Moved skills are called `suits:<name>` instead of the old prefix.

## Consequences

- Anything that names a moved skill must be repointed in the same step as the move.
- The general repo stops listing the moved skills in the same pull request that removes them, and its router skill is updated then.
- Every skill here is promoted from the start, because the characters call it.
- Deleting a skill from the general repo is the one step that cannot be taken back quietly: sessions that still name it break. It comes last.
