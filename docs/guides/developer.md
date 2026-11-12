# Suits for a developer

Ask mike what the code does, the associates to build it test first, louis to review it, and donna to write the pull request body. Bugs go to rachel before anyone edits a line.

## Who it is for

You work in a codebase day to day: reading it, changing it, fixing it and shipping it. You want facts with `file:line` and a review that rules on every comment.

## The jobs

| Job | Who takes it | What you type | What you get back |
| --- | --- | --- | --- |
| Understand code you did not write | mike, with `/suits:stocktake` | `/suits:mike What does the retry logic in the payment client do today?` | The behaviour dated to a commit, each claim cited as `file:line`, and what he did not check |
| Build a feature or a fix | the associates, with `/suits:tdd` | `/suits:associates Implement ticket 12: reject expired coupons at checkout.` | A failing test first, then the smallest change that passes, with both commands in the hand-over |
| Chase a bug | rachel, with `/suits:root-cause-audit`, then the associates with `/suits:diagnosing-bugs` | `/suits:rachel Orders sometimes show two charges. Start with the cause.` | The trigger and the causes, each tagged, before any fix; the associates then fix at the root |
| Review a change | louis, with `/suits:code-review` | `/suits:louis Review this diff against the spec.` | A verdict on the first line, then findings, each with `file:line` and the rule it breaks |

For the pull request, ask donna: `/suits:donna Write the PR body for this branch.` She writes it and never opens or pushes it. When a session ends with work unfinished, `/suits:handoff` writes it up for the next one.

## What comes back

The first line is always the answer: the behaviour, the cause, the test result or the review verdict. Every comment louis makes is labelled BLOCKER, SHOULD FIX or SUGGESTION, so you know which ones stop the merge.

## Worked example

A coupon is accepted after it expires.

1. You type: `/suits:rachel Expired coupons still apply at checkout. What is behind it?`
2. Rachel's first line is the trigger and the main cause, tagged. For example: `Found: the expiry is compared in local time, and the server runs in UTC.` She lists the other causes and one item per cause to assign.
3. You type: `/suits:associates Fix the expiry comparison. Rachel's causes are above.` They write a test that fails because of that cause, then the fix. The hand-over shows `new test failed before` and `checks pass`.
4. You type: `/suits:louis Review the fix.` He returns `passes` or a count of BLOCKERs, with `Checked:` and `Not checked:` lines.
5. You type: `/suits:donna Write the PR body.` You open the pull request yourself.

## Related

- [mike](../characters/mike.md), [associates](../characters/associates.md), [rachel](../characters/rachel.md), [louis](../characters/louis.md)
- [tdd](../tools/tdd.md), [code-review](../tools/code-review.md), [security-review](../tools/security-review.md), [pr](../tools/pr.md)
