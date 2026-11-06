## What it does

`raid-log` keeps one log of risks, assumptions, issues and dependencies, with the same row shape every time: an id, the kind, the text, one owner, a status, the date raised, a review-by date, and a last column that depends on the kind (the mitigation, how and when to validate, the next step, or the other party and the needed-by date). It is built from the board and the issues, proposes new rows from blocked tickets and overdue dates, and keeps closed rows with a pointer to what closed them. It reports a row with an empty cell, an open row past its review-by date, and an `assumed` claim in a status that has no row.

## When to reach for it

When the work has an external dependency, or a status carries a claim marked `assumed`. Jessica calls it for those cases. A job on one team with no outside party and nothing assumed does not need a log.

## Common questions

**Who writes to it?**
Jessica proposes rows and the owner approves them. The action log and the decision log have one writer, donna; this log is separate and does not copy them.

**Why are closed rows kept?**
So the history reads in order and a later question about why something was accepted can be answered.

**Does it write to OpenProject?**
No. It reads OpenProject only when pointed at it.

## It's working if

- Every row has an owner, a status, a raised date and a review-by date.
- No open row is past its review-by date without being reported.
- Every `assumed` claim in a status has an A row.
- Closed rows are still there, each with a pointer.
