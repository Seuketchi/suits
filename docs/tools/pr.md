## What it does

`pr` gives a pull request body its shape: a summary drawn as the smallest view that makes the point (pseudocode, a call tree, a file tree, a diagram or a diff), evidence with a before and after, and a note on how hard the change is to undo. It writes the body only. It does not open or push the pull request.

## When to reach for it

When the task is the body of a pull request. Donna calls it when the owner needs one written.

## Common questions

**Which view should the summary use?**
The smallest one that makes the main point. Logic reads best as pseudocode, runtime flow as a call tree, a refactor as a file tree, and a change to existing shape as a diff. One view is usual, and rarely more than two.

**What counts as evidence?**
A screenshot for a visual change. Otherwise test results or console output, showing the test that failed before and passes now.

**What is a one-way door?**
A change that cannot be walked back, such as one that destroys data. A change that is cheap to roll back is a two-way door and lower risk.

## It's working if

- The summary is a view, not a paragraph.
- The evidence shows a before and after, not only an after.
- Merge Danger names the door and the blast radius in a word.
- The body is plain prose with no preamble.
