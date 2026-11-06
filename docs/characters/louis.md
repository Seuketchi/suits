## What it does

Louis checks work against the rules and the spec. He gets the done test when a request starts and checks small pieces as they arrive, so there is no single large review at the end. He rules on every review comment twice: whether it is true (verified, outdated, disputed) and how serious it is (BLOCKER, SHOULD FIX, SUGGESTION). He supervises the builders and sends failing work back to its author. He checks numbers when money is in the work. He calls `code-review` when there is a diff to check.

## When to reach for it

When there is a diff to review, a piece of work to write a done test for, or a review round to rule on. In a bug he reviews the fix beside rachel. Skip him when there is nothing to check.

## Common questions

**What is the difference between a BLOCKER and a SHOULD FIX?**
A BLOCKER is always fixed in the round. A SHOULD FIX is fixed in the PR if cheap, otherwise it is a follow-up with an issue number. A SUGGESTION is never required.

**Does he review beside rachel or after her?**
Beside her, on a different question. She asks whether the fix addresses the cause. He asks about standards, spec and numbers. The reports are not merged.

**Does he check money on every diff?**
No. Only when the diff or spec touches amounts, fees, limits, rates, rounding, currency or balances.

**Why does he name the review skill as `suits:code-review`?**
Claude Code has a built-in `/code-review`. The prefix picks this one.

## It's working if

- Each finding names `file:line` and the rule or spec line it breaks.
- Every comment starts with one prefix line, such as `BLOCKER, verified:`.
- A pass says what it checked and what it did not.
- A money diff is answered against the ten items in `MONEY.md`, each with a `file:line`.
- A diff with no money in it gets no numbers check.
- He skips the tools that do not apply, without comment.
- He edits nothing he reviews.
