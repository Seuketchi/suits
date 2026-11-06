---
name: critical-path
description: Work out the longest chain of blocked tickets to the goal, and how much each ticket can slip, from the blocker edges on the board. Use when three or more tickets depend on each other.
---

Compute the critical path from the blocker edges on the board. Never guess it.

## Method

1. List the open tickets, each with its blockers. A blocker edge means the blocker finishes before the ticket starts.
2. Give each ticket a duration from the closed cycle times on this board, never a guess. If fewer than about ten tickets have closed, say so and ask the owner for a fixed day count; do not invent one.
3. Find the longest path from today to the goal's last ticket. That is the critical path.
4. For each ticket, float is the latest finish minus the earliest finish. A ticket with zero float is critical. List the zero-float tickets and those near it, since one more slip makes them critical.
5. Say what a one-week slip on a critical ticket does to the goal's date.

## Warn on

- A cycle in the blockers. Stop and name the tickets; no path can be computed.
- A ticket with no blockers and no dependents. A link is probably missing.
- A float larger than the longest path. A blocker is probably missing.
- Two open tickets that own the same file with no blocker path between them, in either direction.

## Output

The path in order, then the near-critical tickets with their float in days, then the warnings. Label every date baseline, forecast or actual, and give the as-of date. The path and its warnings go to the status report; the tool does not publish.
