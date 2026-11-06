## What it does

`scrum` drafts a daily standup report from evidence only: merged pull requests, the open queue, real CI failures and open contract questions. It covers only the work of the person who ran it. The report goes to a plain-text file, or into chat when the caller asks, in three parts: work done, work planned, and blockers.

## When to reach for it

Type `/scrum`, or ask for a standup, a scrum report, or "what did I do yesterday". Pass a date to redraft a past day. Jessica calls it when the owner asks for their own standup.

## Common questions

**Where does the report go?**
To a file under `$SCRUM_DIR` (by default `~/projects/asenso/scrum`), and it prints the path only. In chat it replies with the report and nothing else.

**What does it count as a blocker?**
Something that needs another person and stops work now. Failed CI and merge conflicts are work.

**Does it work for any repository?**
Not yet. It names two repositories and a timezone in its own text. Making them settings is a later change.

## It's working if

- Every line traces to a pull request, an issue, a check or a log.
- A CI failure names the failing test or step.
- Nothing is invented: a thin day gives a short report.
- Blockers say what is stopped and who it waits on, or say None.
