## What it does

`pr` writes a pull request body. When the repo has a PR template, it fills every section of that template in its order and places a summary, evidence and a note on how hard the change is to undo where they fit. When there is no template, it uses its own three parts: a summary drawn as the smallest view that makes the point (pseudocode, a call tree, a file tree, a diagram or a diff), evidence with a before and after, and a note on how hard the change is to undo. It adds no attribution line unless the session or the owner asks for one. When asked to tidy a pull request, it hides outdated bot comments as outdated and never deletes them. It does not open or push the pull request.

## When to reach for it

When the task is the body of a pull request, or the outdated bot comments on one need tidying. Donna calls it when the owner needs a body written.

## Common questions

**Which template does it use?**
The first one it finds at `.github/pull_request_template.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/PULL_REQUEST_TEMPLATE/` or `docs/pull_request_template.md`. Every section is filled. A section with nothing to say reads "None" and why.

**Why does it add no "Co-Authored-By" or "Generated with" line?**
Because the body is the owner's. An attribution line appears only when the session's instructions or the owner ask for one.

**Which view should the summary use?**
The smallest one that makes the main point. Logic reads best as pseudocode, runtime flow as a call tree, a refactor as a file tree, and a change to existing shape as a diff. One view is usual, and rarely more than two.

**What counts as evidence?**
A screenshot for a visual change. Otherwise test results or console output, showing the test that failed before and passes now.

**What is a one-way door?**
A change that cannot be walked back, such as one that destroys data. A change that is cheap to roll back is a two-way door and lower risk.

**What happens to an outdated bot comment?**
It is hidden as outdated, which collapses it on screen and keeps it on the record. It is never deleted.

## It's working if

- The body follows the repo's template when one exists, with every section filled.
- The summary is a view, not a paragraph.
- The evidence shows a before and after, not only an after.
- Merge Danger names the door and the blast radius in a word.
- No attribution line appears unless someone asked for one.
- Outdated bot comments are hidden, and none has been deleted.
- The body is plain prose with no preamble.
