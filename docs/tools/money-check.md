## What it does

`money-check` is a ten-item check on how work handles money: no binary float for an amount or rate, the currency travelling with the amount, the minor-unit exponent taken from a per-currency table, rounding mode and scale named at one stated point, who gains the remainder at each rounding site, input finer than the minor unit rejected, limits checked on the amount that moves, money writes safe to retry, entries that net to zero, and amounts compared numerically. Each item has a worked number and is answered `yes`, `no` or `n/a` with a `file:line`. A `no` is ruled like any other finding.

## When to reach for it

Only when the diff or spec touches amounts, fees, limits, rates, rounding, currency or balances. Louis calls it then. A diff with no money in it skips it.

## Common questions

**Is every `no` a blocker?**
No. Each `no` is ruled like any other finding, with a severity that cites the rule or spec line it breaks.

**Which item is a judgement?**
Item g, the limit check. No source states whether a limit is checked before or after rounding, so the reviewer says which he assumed.

**Does it apply to code that only displays an amount?**
Yes if it formats, rounds or converts the amount. Items that do not apply are answered `n/a`.

## It's working if

- Every item is answered `yes`, `no` or `n/a`, and each `yes` and `no` carries a `file:line`.
- A `no` appears in the review as a ruled finding.
- Item g says which order (before or after rounding) was assumed.
- A diff with no money in it never reaches it.
