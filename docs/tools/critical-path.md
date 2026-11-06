## What it does

`critical-path` works out the longest chain of tickets to the goal from the blocker edges on the board. For each ticket it gives the float, which is the latest finish minus the earliest finish, and lists the tickets with zero float and those near it. Durations come from closed cycle times, never from a guess. It warns on a cycle, on a ticket with no blockers and no dependents, on a float larger than the longest path, and on two tickets that own a file with no blocker path between them.

## When to reach for it

When three or more tickets depend on each other. Jessica calls it for that case. Two independent tickets have no path to compute.

## Common questions

**Where do the durations come from?**
From the closed cycle times on the board. Until about ten tickets have closed, it asks the owner for a fixed day count instead of inventing one.

**What does a float larger than the longest path mean?**
A blocker is probably missing, so the ticket looks free when it is not.

**Does it change the board?**
No. It reports; jessica fixes the edges.

## It's working if

- The path follows the blocker edges and nothing else.
- Every ticket on it has a duration with a source.
- A cycle or a missing edge is reported, not worked around.
- Near-critical tickets are listed, not only the critical ones.
