---
name: findings
description: The findings format every investigation writes to: research, audit, reverse-engineering, experiment. Use when writing one up, or reading one into a spec.
---

A **findings file** answers one question with evidence, so a spec can cite it and a reader can check it. It lives at `docs/findings/<topic>.md` in the repo the work is for; a new answer to the same question replaces the old file, and git keeps the history.

## Format

```markdown
# <the question, as a question>

**Kind:** research | audit | reverse-engineer | experiment
**Asked by:** <the ticket, map or conversation, linked>
**Date:** <YYYY-MM-DD>

## Answer

<two or three sentences a decision can use as-is. Name what is still unknown.>

## Method

<what was read, run or inspected, in enough detail to repeat: sources, commands,
build or device, versions. An experiment also states its setup and side effects.>

## Claims

| Claim | Status | Evidence |
| --- | --- | --- |
| <one fact> | observed | <file:line, URL, command + output excerpt, symbol, offset> |
| <one fact> | inferred | <the observed claims it rests on> |
| <one fact> | unknown | <what would settle it> |

## Open

- <each unknown that matters: a follow-up (ticket link) or "accepted: <why>">
```

## Rules

- **Three statuses only.** *Observed*: seen directly at the cited place. *Inferred*: reasoned from observed claims, which it names. *Unknown*: not established; say what would settle it.
- **Every claim cites.** A claim with no evidence is *unknown*, whatever it feels like.
- **Mike's tags map onto these:** found is *observed*, inferred is *inferred*, and not found is *observed* only when the search was complete, otherwise *unknown*.
- **Absence is a claim too.** "X is never called" is *observed* only when the search was complete and the method says how; otherwise *unknown*.
- **Done** when the answer stands on the claims, and every *unknown* that matters is in **Open** as a follow-up or an accepted gap.
