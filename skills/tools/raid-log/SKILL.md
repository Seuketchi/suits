---
name: raid-log
description: Keep the risk log (risks, assumptions, issues, dependencies) in one fixed row shape, kept from the tickets. Use when the work has an external dependency, or a status carries a claim marked assumed.
---

Keep one log of risks, assumptions, issues and dependencies for the work in hand. The board and the issues hold the facts; the log is a view built from them, never a second copy that drifts. Propose new rows from blocked tickets, overdue dates and open questions to other people. The owner approves additions before they are written.

## Row shape

One row per entry:

`id` | `kind` | `text` | `owner` | `status` | `raised` | `review-by` | last column

- `id` is R, A, I or D and a number: R01, A01, I01, D01.
- `kind` is risk, assumption, issue or dependency.
- `owner` is one named person. `raised` and `review-by` are dates.
- `status` is open or closed.
- The last column depends on the kind:
  - risk: the mitigation
  - assumption: how and when it is validated
  - issue: the next step
  - dependency: the other party and the needed-by date

A closed row stays, with a pointer to what closed it ("Closed: see A10").

## Findings

Report these, do not fix them silently:

- A row with an empty cell.
- An open row past `review-by`, and a log not touched since the last status.
- A claim marked `assumed` in a status that has no A row.
- A ticket the board shows as blocked on another person that has no D or I row.

## Where it lives

A file in the project's notes, named for the work. Say the path when done. Do not write to OpenProject; read it only when pointed at it.
