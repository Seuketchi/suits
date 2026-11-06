---
name: status-report
description: Write the one-page status report for a piece of work, state first, from the board and the issues. Use when the owner or a stakeholder needs a status.
---

Write a one-page status report from the board and the project's issues. A claim is on the board or in an issue; anything else is marked `assumed` and has a row in the risk log.

## Order

1. The state, this report against the last, and the as-of date: "at risk (was on track on 30 Oct), as of 6 Nov." The state is one of on track, at risk, blocked or replan, defined by the dates:
   - on track: the forecast is not after the baseline
   - at risk: the forecast is after the baseline, and a recovery plan with an owner and a date exists
   - blocked: a dated blocker waits on someone else
   - replan: recovery is not possible, and the owner must re-baseline
2. The dates: baseline, last reported, current, and why each moved. Label every date baseline, forecast or actual. A date for going live names a stage: merged, build submitted, in review, rolling out at N percent, at 100 percent.
3. `Decision needed: <what, by whom, by when>`, or `No decision needed`. Within the first five lines.
4. The top three risks, each with an owner and a date, from the risk log.
5. What is done, by scope: done, still unknown, not moved. No percent complete, and no count of closed tickets as progress. List blocked and aged items.
6. What is next, with the next owner.
7. Usage against the cap, only when the forecast is over it.

## Rules

- The report is plain and professional. It is written for other people.
- A moved date always carries a reason.
- Nice-to-have tickets are marked `~`. When a cap is near, list them as the first to cut before anyone asks to extend.
- Do not publish or send. Hand it to donna to lay out or put on the owner's brief.
