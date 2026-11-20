## What it does

`judge` asks Jev, TypeSafe's model, one small question with a fixed set of answers, and takes the answer only when it is confident. Four questions ship: who owns a request (`owner`), what kind a review comment is (`comment-kind`), and whether a diff touches money (`touches-money`) or a trust boundary (`touches-trust-boundary`). Every answer is logged, the final decision is recorded beside it, and the record tunes how confident each question must be.

## When to reach for it

When a character's When to call names one of its questions: donna and ask-donna for `owner`, louis for the other three. Without a TypeSafe key it answers nothing and the character decides alone, exactly as before.

## Common questions

**Can the judge let a check be skipped?**
No. A yes to `touches-money` or `touches-trust-boundary` runs the check; a no is never taken, and louis reads the diff against his trigger as before.

**Does my code leave the machine?**
Only from a repository whose GitHub owner is listed in `~/.config/suits-judge/allow.json`. Anything else is refused before a request is made. Never list an employer's or a client's account.

**What happens when the judge is wrong?**
The character or the owner decides differently and records it. `report` counts those overrides; `report --save` raises a question's floor, never below the written one.

**Why does the `owner` answer sometimes not count?**
Each choice is paired with "does any option fit". When that is below 0.7, or the answer is `none-fits`, the front desk routes the request itself.

## It's working if

- A decided answer is named as the judge's in one line, and an undecided one changes nothing.
- No question that sends code runs on a repository missing from the allow list.
- Every judgment acted on has a `record` line, so `report` has something to fit.
- A `preference` comment never ends up a BLOCKER, and a diff the judge says touches money gets the money check.
