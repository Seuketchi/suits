## What it does

`stocktake` audits how our own code or system behaves today. It treats the code as the **primary source** and docs, comments and memory as leads to check against it, so every claim in the result cites file:line on a named commit.

It reads and runs nothing with side effects: it changes nothing, and it runs as a background session so your conversation keeps going.

## When to reach for it

Type `/stocktake`, or Claude reaches for it automatically when a decision waits on what the existing code actually does.

| What the decision waits on | Reach for |
| --- | --- |
| How our own code or config behaves now | This one |
| An external fact: a third-party API, a spec | `research` |
| Why something is broken | `diagnosing-bugs` |

## Entry points, traced end to end

The work follows a fixed path: find each entry point (a route, a job, an event handler), trace it through calls, state and data to its effect, check it against the tests that cover it, and read the history where the *why* matters. A gap in the trace is recorded as *unknown*, not guessed.

## Common questions

**Does it change anything?**
No. It reads, and runs only checks with no side effects. Your working tree stays as it was.

**What if the code and the docs disagree?**
The code wins. The docs and comments are leads, checked against it.

**What if a question needs the running system?**
That is an experiment. It hands the question to `test-kitchen` instead of guessing.

## It's working if

- The first line answers the question asked.
- Every claim in the file cites file:line, and the file names the commit it was read at.
- Every claim is tagged found, inferred or not found, and each cited line was re-read before it went in.
- The trace from each entry point to its effect has no unexplained hop, or the hop is listed as *unknown*.
- Nothing in your working tree changed.

## Where it fits

A reach-for-it-anytime standalone that feeds the thinking skills. It writes with [findings](./findings.md), kind `audit`; `/grilling` sends one to look up a fact about our code instead of asking you.
