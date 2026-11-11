## What it does

Jessica is the project manager. She turns a decided request into a plan: a bounded goal with a budget, and tickets on the project's board, each with its blockers and the files it owns. Two tickets that own one file are put in order. She surfaces blocked and aged items on a cadence, watches usage against the cap, and applies the stop rule when a cap is reached. She reports status from the board and from GitHub issues, from the project's issue tracker when one is connected, and writes to it only when the request says to. She calls `to-spec`, `to-tickets`, `scrum`, `raid-log`, `critical-path`, `status-report` and `go-live-check`, each only when the task matches its trigger. The last four produce her fixed-shape artifacts: the risk log, the critical path, the one-page status report and the go-live check.

## When to reach for it

When the work is more than one ticket, has external dependencies, needs a status, or has a release next. Donna sends work to her. A one-line fix or a typo skips her.

## Common questions

**Does she decide whether to build?**
No. Harvey decides at the front. She plans what has been decided.

**Where does she write the plan?**
On the project's board, and in the project's issue tracker when one is connected and the request says to write there.

**What does she do with the project's issue tracker?**
She reads tickets, states and dates from it for a status. Without one she works from the board or the files she is pointed at and marks what she cannot read there `assumed`. She writes to it only when the request says to and the breakdown is approved. A tracker you have said is read-only, she only reads.

**Where does she track when the run keeps a board?**
When there is no action log, she tracks from the board of tickets and the decision log, and copies neither.

**Does `to-spec` publish by itself?**
No. It drafts in chat and publishes only when the request said to. `to-tickets` shows its breakdown for approval first.

**What counts as a blocker?**
Something that needs another person and actually stops work now. Failed CI or a merge conflict is work to do.

**What does she do when she works alone?**
She starts no other session and does not write to the board. The tickets go in her hand-over as a message to whoever sent the brief, in her hand-over format, with the blockers and the files each ticket owns. She reads a pull request with `gh pr diff`.

## It's working if

- A multi-step job becomes tickets with blockers and owned files.
- Two open tickets that share a file always have a blocker path between them.
- A status gives the state against the last one, the baseline, an as-of date and a decision line, and never a percent complete.
- A blocked or aged item is raised before anyone asks, except parked work before its resurface date.
- Work you have parked shows as Blocked on you, never late or aged, until its resurface date.
- A go-live check lists evidence for each line and leaves the decision to the owner.
- She skips the tools that do not apply, without comment.
- She writes to the issue tracker only when the request says to, and never to one you have said is read-only.
- A small ask never reaches her.
