---
name: senior
description: Before a non-trivial change: new feature, refactor, migration, API or schema change, dependency choice, or a "how should we…" question. A senior developer's judgment on what to build and whether to. Skip typos and one-line fixes.
---

Work the change in a senior developer's order. The leading word is **blast radius**: before touching anything, know what the change can break, who finds out, and whether it can be undone. A senior spends effort in proportion to it.

Size the effort first. A change with no callers, no data and an obvious undo (a typo, a rename inside one file) skips to step 5. Everything else runs the steps in order.

This skill is the judgment layer. It decides what to build and whether to; `/tdd`, `/debug`, `/codebase-design` and `/taste` do the work.

## Steps

1. **Read first, then ask.** Read what the ask touches: neighbouring code, `CONTEXT.md`, ADRs, an existing helper or dependency. Then write the outcome wanted and who it's for in one sentence, next to the solution the user named. Ask only what the code can't answer and the answer would change the approach, at most three questions; proceed on stated assumptions and say which.
   Done when the need is written down and you can cite by `file:line` the pattern you'll extend, or say none exists.
2. **Size the blast radius.** List the callers and consumers, the data touched, and the way back. For a bug, find every caller of the function and fix the root cause once, in the shared code. Mark each one-way door (migrations, deletes, public API, published packages, deploys, anything sent to another person or system).
   Done when every caller is listed and every one-way door is named and agreed by the user before you act on it.
3. **Choose the smallest change that meets the need.** Take the first rung that fully works:
   1. It doesn't need to exist: skip what nobody asked for and name it.
   2. The codebase already does it: use that helper or pattern.
   3. The standard library or platform does it.
   4. An installed dependency does it. A few lines never justify a new one.
   5. One line a reader gets at a glance.
   6. The minimum new code.

   Small in the solution, never in the job: finish every caller, test and fixture the change breaks, and keep the validation and error handling of any code you move or merge. Never cut validation at trust boundaries, error handling that prevents data loss, security, accessibility, or anything the user asked for. A shortcut with a known limit gets a one-line comment, `shortcut: <limit>, <when to upgrade>`. Park the refactors you noticed as follow-ups.
   Done when the plan fits in a few sentences, names its rung and the alternative it beat with a line of reason, and a **not doing** list sits beside it.
4. **Build in thin slices, each one run.** Features and fixes go through `/tdd`; a bug that resists goes to `/debug`; a seam or interface you can't place goes to `/codebase-design`; a design question that thinking can't settle goes to `/sample`. New risky logic (a branch, a parser, money, security) ships with a test.
   Done when every slice has been run, its result observed, and every caller from step 2 is updated or confirmed unaffected.
5. **Review your own diff cold,** as the reviewer would, and run `/taste` on anything substantial. Look for: a test that fails without the change, the error path, the rollback, secrets, dead code, a name that needs a comment.
   Done when nothing in the diff would draw a "why?" that the code or the write-up doesn't already answer.
6. **Report.** Lead with the result. Then what changed and why, what you did not verify, follow-ups, and any decision that is still the user's.
   Done when every "works" or "passes" names the command that showed it, run after your last edit; anything else is marked assumed.

## Push back before building

Say so, with the reason and a better path, before writing code, when:

- the request defeats its own goal;
- a smaller or existing route meets the need;
- the change is a one-way door the user hasn't weighed;
- the scope has grown past what the need justifies.

Disagree once, clearly; then commit to what the user decides.

---

The ladder in step 3 and the never-cut list come from [ponytail](https://github.com/DietrichGebert/ponytail), MIT License, Copyright (c) 2026 DietrichGebert. Evidence: [findings](../../../docs/in-progress/senior/findings.md).
