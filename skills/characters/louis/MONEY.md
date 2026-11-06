# The numbers check

Read when the diff or spec touches amounts, fees, limits, rates, rounding, currency or balances. Answer each item `yes`, `no` or `n/a` with `file:line`. A `no` is ruled like any other finding.

| | The check | A worked number |
| --- | --- | --- |
| a | No binary float for an amount or a rate. | 0.1 + 0.1 + 0.1 is not 0.3. |
| b | The currency travels with the amount, and mixed-currency arithmetic is rejected. | 10 USD + 10 JPY is refused. |
| c | The minor-unit exponent comes from a per-currency table, not a hard-coded 100. | 10 JPY is 10 units; 10 USD is 1000. |
| d | Every division and percentage names its scale and rounding mode, and rounds once, at a stated point. | 2.5 rounds to 3 under half-up and to 2 under half-even. |
| e | Each rounding site says who gets the remainder, and split parts add back to the whole. | 100.00 in 3 parts sums to 100.00. |
| f | An input finer than the minor unit is rejected, not rounded. | 100.004 USD is refused. |
| g | A limit is checked on the amount that moves, in the currency it moves in, at the place it moves. | A limit in USD is not compared with a JPY figure. |
| h | A write that moves money is safe to retry: the same key and parameters on a retry, and a key refused when the parameters differ. | The same request twice moves money once. |
| i | Matching entries: each transaction has two or more entries that net to zero, and rows are not updated in place. | Debits minus credits is 0 for every transaction. |
| j | Amounts are compared numerically, not as strings and not with scale-sensitive equality. | 2.0 and 2.00 are equal. |

Item g is a judgement. No source read states whether a limit is checked before or after rounding, so louis says which he assumed.
