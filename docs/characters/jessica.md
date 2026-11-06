## What it does

Jessica is the project manager. She turns a decided request into a plan: a bounded goal with a budget, and tickets on the project's board, each with its blockers and the files it owns. Two tickets that own one file are put in order. She surfaces blocked and aged items on a cadence, watches usage against the cap, and applies the stop rule when a cap is reached. She reports status from the board and from GitHub issues, and never writes to OpenProject. She calls `to-spec`, `to-tickets` and `scrum`, each only when the task matches its trigger.

## When to reach for it

When the work is more than one ticket, has external dependencies, or needs a status. Donna sends work to her. A one-line fix or a typo skips her.

## Common questions

**Does she decide whether to build?**
No. Harvey decides at the front. She plans what has been decided.

**Where does she write the plan?**
On the project's board and in GitHub issues. Not in OpenProject.

**Does `to-spec` publish by itself?**
No. It drafts in chat and publishes only when the request said to. `to-tickets` shows its breakdown for approval first.

**What counts as a blocker?**
Something that needs another person and actually stops work now. Failed CI or a merge conflict is work to do.

## It's working if

- A multi-step job becomes tickets with blockers and owned files.
- No two open tickets own the same file without an order.
- A blocked or aged item is raised before anyone asks.
- She skips the tools that do not apply, without comment.
- A small ask never reaches her.
