---
name: senior
description: Before a non-trivial change: new feature, refactor, migration, API or schema change, dependency choice, or a "how should we…" question. Also to review a PR or diff for blast radius and what it breaks. A senior developer's judgment on what to build and whether to. Skip typos and one-line fixes.
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

## Reviewing a PR

For a PR, branch or diff, yours or someone else's. Use the one the user names; with none named, the current branch against its merge-base with the default branch. This review is read-only: it never approves, merges, requests changes or posts a comment unless the user asks. Standards and spec checks belong to `/taste`; this review covers what a senior reads for beyond them.

1. **Run steps 1 and 2 on the diff.** Read the code the diff touches, not only the diff: a changed signature, return value or field breaks callers the diff never shows, so find every one. A fix applied in one caller while the shared function stays wrong is a finding.
   Done when the PR's need is written down and every changed signature or behaviour has had its callers searched.
2. **Hold the diff against step 3's ladder.** Look for code that shouldn't exist, a helper the repo already has (name its path), a dependency for a few lines, an abstraction with one user.
   Done when each added file and function has either survived the ladder or become a finding.
3. **Check what the PR shows.** Look for a test that fails without the change and a run of it; read a "works" with no command behind it as assumed. Risky new logic (a branch, a parser, money, security, a data write) with no test is a finding. Find the load the code will see in the repo (README, deploy config) and judge races, per-item queries and unbounded growth against it, saying which load you assumed.
   Done when every claim in the PR description is marked observed or assumed.
4. **Report in three tiers,** numbered across all of them so the user can say "fix 2 and 5": **Must fix** (a bug, a security hole, data loss, a break at the expected load), **Should fix** (untested risky logic, code that shouldn't exist, a one-way door the PR doesn't flag), **Nice to have**. Skip empty tiers. Each finding gives `file:line`, the concrete case ("this input leads to this wrong result"), and the smallest fix, preferring one that deletes code. Close with the merge call: one-way or two-way door, and the blast radius in a word.
   Done when each finding's lines have been re-read and its case holds, and the report ends with the merge call. A worry with no case stays out.

## Push back before building

Say so, with the reason and a better path, before writing code, when:

- the request defeats its own goal;
- a smaller or existing route meets the need;
- the change is a one-way door the user hasn't weighed;
- the scope has grown past what the need justifies.

Disagree once, clearly; then commit to what the user decides.

---

The ladder in step 3, the never-cut list, and the review's read-the-callers, case-or-no-finding and tier rules come from [ponytail](https://github.com/DietrichGebert/ponytail), MIT License, Copyright (c) 2026 DietrichGebert. Evidence: [findings](../../../docs/in-progress/senior/findings.md).
