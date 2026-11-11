# Every character can work alone

Date: 2026-11-11

## Context

Some sessions run a character with no way to start another session, or are told not to: the character is one step of a larger job, and a message back to whoever sent the brief is the only hand-off it has. A character that tried to start a second session, or to check a branch out to read a pull request, either failed or fanned out. Louis's review in particular started two extra sessions for every diff.

## Decision

Every character, the associates included, has a `## Working alone` section before **Hand over**. It applies when the brief says to work alone, when the session says helper mode is on, or when there is no way to start another session. It says:

- start no other session, and do the work of any such tool yourself, in one pass;
- a hand-off to another character is a message to whoever sent the brief, in the character's own hand-over format, naming the character it is meant for;
- read a pull request with `gh pr diff <n>` and a commit with `git show <sha>`, never by checking a branch out;
- for a job of three or more steps, list them with `suits_checklist` and mark each done, when that tool is present.

Jessica, working alone, writes the tickets in her hand-over and does not write to the board.

`/suits:code-review` has a **One pass** mode for the same case: it pins the diff from `gh pr diff` or `git show`, then runs Standards and Spec itself, each in its own section. The parallel default stays for a normal session. Louis always uses the one-pass mode.

## Consequences

- A hand-off is the same message whether a character works alone or not; only the way it is sent differs.
- Louis's file no longer tells the model to start another session, so his entry in the workflow-word allow-list is gone.
- The section is the same in every character, and `test/characters/characters.test.mjs` checks each one.
