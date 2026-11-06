## What it does

`go-live-check` builds the check for one release: at most 30 lines, each with the item, why it exists, how it is checked (`code` with the command, or `human` with a named owner), the evidence and the result. It is sized to the release: a first store publication gets the long list, an update with no backend change the short one. It covers the date, a reproducible build with a higher version, a rollback or kill switch, the staged rollout and who halts it, monitoring, support briefing, and the previous version against the backend. It lists evidence and leaves the decision to the owner.

## When to reach for it

When a release is next. Jessica calls it, and donna lays the result out or puts it on the owner's brief.

## Common questions

**Does it say go or no go?**
It gives the evidence for each line and a result of go, no go or go with conditions. The owner decides.

**What happens to a finding that has no fix yet?**
It becomes a ticket that blocks the release.

**What does go with conditions need?**
Each condition has a date.

## It's working if

- No line is missing its reason or its check.
- Every `pass` has evidence and, for a `human` check, a named owner.
- The list is no longer than 30 lines and fits the size of the release.
- A finding with no fix is a ticket that blocks the release.
