# Suits for a project manager

Ask jessica for the plan, the status and the risks, donna for minutes and briefs, and louis to set the done test. Her replies open with the state and whether you must decide something.

## Who it is for

You own a delivery date. You turn requests into work others can take, keep the status honest and tell people early when something slips.

## The jobs

| Job | Who takes it | What you type | What you get back |
| --- | --- | --- | --- |
| Turn a decided request into tickets | jessica, with `/suits:to-spec` and `/suits:to-tickets` | `/suits:jessica Break the customer export feature into tickets.` | A spec drafted in chat, then tickets with blocking edges and owned files, shown for approval before anything is published |
| Report status | jessica, with `/suits:status-report`; `/suits:critical-path` and `/suits:raid-log` when they apply | `/suits:jessica Write this week's status for the steering group.` | One page, state first, with a decision line and the risks that matter |
| Check readiness for a release | jessica, with `/suits:go-live-check` | `/suits:jessica Build the go-live check for the 13 November release.` | At most 30 lines, each with its reason, how it is checked and the evidence |
| Record a meeting | donna | `/suits:donna Minutes and actions from today's planning call: <notes>` | Minutes, rows in the action log and a tickler entry for what you are waiting on; nothing is sent |

After a batch lands, type `/suits:retro` to look back at what bounced and what ran over budget, and get proposed fixes to your setup.

## What comes back

Jessica's first line is the state with the one before it, for example `at risk (was on track on 30 Oct)`. Within the first five lines is either `Decision needed: <what, by whom, by when>` or `No decision needed`. She names the next owner, so you know who takes the tickets.

## Worked example

Three tickets depend on each other and a release date is fixed.

1. You type: `/suits:jessica Status on the export feature. Release is 13 November.`
2. She says in one line that she is calling `/suits:critical-path`, because three or more tickets depend on each other.
3. Her reply opens: `At risk (was on track on 30 Oct), release 13 Nov, baseline 12 Nov, as of 6 Nov.` The next line reads `Decision needed: cut the audit-log ticket, by you, by 8 Nov.`
4. Below it she gives the one thing that decides the state, the longest chain of blocked tickets, and the next owner.
5. You type: `/suits:donna Draft the note to the steering group from jessica's status.` Donna writes it and you send it.

## Related

- [jessica](../characters/jessica.md), [donna](../characters/donna.md), [louis](../characters/louis.md)
- [to-tickets](../tools/to-tickets.md), [status-report](../tools/status-report.md), [raid-log](../tools/raid-log.md), [go-live-check](../tools/go-live-check.md), [retro](../tools/retro.md)
