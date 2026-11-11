## What it does

`root-cause-audit` looks at a bug for what let it happen, not only which line was wrong. It reads the bug report, what mike found in our code, and the fix diff once there is one, and it edits no code.

It looks in three fixed directions: deeper (how was it possible), sideways (where else the same flaw lives, in our repo and in the sibling repos the project names) and back up (the design it belongs to, and whether the fix is a guardrail or a design change). It writes a trigger and its causes, each tagged found, not found or inferred, with the source. A *not found* names the search, and an *inferred* says what would confirm it.

It returns open questions and what to check next. A finding that needs a decision goes to you and to harvey at the same moment.

## When to reach for it

When the task is a bug: before anyone looks for the line to change, and again to check that the fix addresses the causes. It is called by rachel. Skip it for a fact outside our code (use `research`) or for what our code does today (use `stocktake`).

## Common questions

**Does it fix the bug?**
No. It names the causes. The fix goes to the builders, and their failing test must fail because of those causes.

**Why causes and not the cause?**
A trigger sets a failure off, and several conditions let it hurt. One line called "the cause" hides the rest.

**What does it do with a thread outside the bug?**
It names the thread to you under open questions and does not follow it.

**When does it interrupt?**
When the cause is a design flaw, the finding changes scope, it involves money or it breaks a rule. Harvey validates the finding on the same thread.

## It's working if

- It opens with the trigger and the main cause, tagged found, not found or inferred.
- All three directions are filled, or say nothing found.
- Every *not found* has a `searched:` line with the pattern and the paths.
- Every *inferred* has a `to confirm:` clause.
- No cause ends on a person or "human error".
- It ends with typed items for you to assign: prevent, sweep, redesign, detect or mitigate.
- It lists open questions and what to check next.
- It changes no file.
