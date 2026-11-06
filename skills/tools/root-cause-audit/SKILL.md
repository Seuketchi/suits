---
name: root-cause-audit
description: Frame the causes of a bug in three fixed directions: deeper, sideways, back up. Reads the fix diff and what the code researcher hands over, edits no code. Use when the task is a bug, before the fix and again to check it. Skip for anything that is not a bug.
---

A **root-cause audit** asks what let a bug happen, not only which line was wrong. It reads and reports; the fix is someone else's work.

## Inputs

- The bug report: what was seen, where, when.
- Mike's hand-off: what our code does at that place and what was decided there, with sources. Take his facts as checked; do not redo them.
- The fix diff, once there is one. Before it, the audit frames the causes the fix must address. After it, the audit says per cause whether the diff addresses it.

Read only. Edit no code, run nothing with side effects, and open no branch.

## Frame first

- **Trigger:** what set it off (an input, a deploy, a date). A trigger is not a cause: a mistyped value is a trigger, and the cause is the missing limit, check or owner.
- **Causes**, plural: each condition that let the trigger hurt. Never one cause as fact; each is necessary and only together are they sufficient.
- **Three timestamps:** introduced (commit or PR), first possible detection, found. The full audit adds a real timeline, and only for wrong numbers, data loss, a rollback, or a fix that blew its budget.

## The three directions

Look in all three. Each ends in a tag or in "nothing found" with the search stated. Do not present one chain as the whole analysis.

### Deeper

How was it possible? Keep asking "how" until the answer is a check, type, rule, owner or design that someone can change. Keep going while the answer is a symptom or a person. Add what would have noticed it earlier (a test, an alert, a review, a type) and why it did not.

### Sideways

Where else in our system does the same flaw live? This is a read, not a fix. State the search: the pattern and the paths. A `searched:` line with both is required for every *not found*.

### Back up

What design does this belong to, and is the design the problem? Say whether the fix, or the one proposed, is a guardrail (a reminder, an alert, a doc, "be careful") or a design change. When the design is the cause and only a guardrail is proposed, say so.

## Tag every finding

Each finding is tagged found, not found or inferred, with its source (`file:line`, commit, mike's hand-off).

- **found:** read at the cited place.
- **not found:** looked for and absent; `searched:` names the pattern and the paths.
- **inferred:** follows from what was read, or rests on knowing the outcome. A `to confirm:` clause says what would settle it.

A cause never names a person or "human error". Write what the system allowed.

## What goes back

1. **First line:** the trigger and the main cause, tagged.
2. **Causes:** the others, each with its tag and source, under the direction it came from.
3. **Items to assign:** one per cause, typed prevent, sweep, redesign, detect or mitigate. The owner assigns; the audit assigns none.
4. **Fix check** (once there is a diff): per cause, addressed, partly (interim, say what is left) or not addressed.
5. **Open questions:** each with who or what can answer it.
6. **Check next:** the one or two reads or runs that would turn an inferred into a found.

Write it up with the `/findings` skill, kind `audit`, when it is long enough to keep.

## When it needs a decision

A finding that needs a decision goes to the owner at once, and to harvey at the same moment, who validates it. Nothing is fixed until the owner decides. It is that when:

- the cause is a design flaw
- the finding changes scope (the same flaw lives elsewhere)
- it involves money
- it breaks a rule
- the cause has no owner, or only a guardrail is proposed for a design cause, or the failure was silent for a long time

Other findings go through the normal flow.

## A thread outside the bug

Do not follow it. Offer the owner a `/rabbit-hole` on it, and carry on.
