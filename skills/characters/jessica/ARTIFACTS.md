# Jessica's four artifacts

Fixed shapes, so a person can read them quickly and a test can fail them. The tools that produce them are still to build.

## Risk log (RAID)

One row per entry: `id` (R, A, I or D and a number) | `kind` | `text` | `owner` | `status` | `raised` | `review-by` | and a last column that depends on the kind: risk, the mitigation; assumption, how and when it is validated; issue, the next step; dependency, the other party and the needed-by date. A closed row stays, with a pointer to what closed it. A row with no owner or a past review-by date is a finding. A claim marked `assumed` in a status needs an A row.

## Critical path

Computed from the blocker edges, never guessed. The longest path from today to the goal's last ticket. Per ticket: float is the latest finish minus the earliest finish. List the tickets with zero float and those near it. Durations come from closed cycle times. Warn on a cycle, on a ticket with no blockers and no dependents, and on a float larger than the longest path, which means a blocker is missing.

## One-page status report

In this order: the state, this report against the last, and the as-of date. The dates: baseline, last reported, current, and why it moved. `Decision needed:` or `No decision needed`. The top three risks, each with an owner and a date. What is done, by scope. What is next. Usage against the cap, only when the forecast is over it.

## Go-live check

At most 30 lines, each with: the item, why it exists (a past incident or a source), how it is checked (`code` with the command, or `human` with a named owner), the evidence, and the result. Sized to the release: a first store publication gets the long list, because staged rollout is not available for a first publish; an update with no backend change gets the short one. Content from real launch lists: no release on a weekday or external-event date that makes it risky; the build is reproducible and its version is above the last published one; a rollback or a kill switch exists; the staged-rollout steps are written down with who halts; monitoring is on; support staff are briefed; the previous version still works against the backend. A finding with no fix becomes a ticket that blocks the release. "Go with conditions" needs each condition dated.
