## What it does

`/suits:security-review` is a read-only, one-pass security review of a diff. It covers nine areas: parsing files, images and uploads; shell, command and remote execution; deserialization; SQL and query building; authentication, authorization and session; secrets and keys; outbound requests built from input; file paths from input; and new or bumped dependencies. For each area the diff touches it says what to look for and what counts as evidence: a path in the diff from outside input to a dangerous use, with a `file:line` for each step.

Findings are ruled in the review format, `BLOCKER, verified:`, `SHOULD FIX, verified:` or `SUGGESTION, verified:`, each with a `file:line` and the rule, spec line or known weakness (a CWE id) that makes it a finding. A finding with none of these is at most a SUGGESTION. The hand-over ends with a `Not checked:` line for what the pass could not see, such as runtime configuration and infrastructure.

It runs no exploit, edits nothing, installs nothing, and starts no other session.

## When to reach for it

Only when the diff touches untrusted input or a trust boundary, in any of the nine areas above. Louis calls it then. A diff with none of them skips it.

## Common questions

**Claude Code already has a `/security-review`. How is this one different?**
The built-in command reviews the pending changes on the current branch and writes its own report. This one is a tool the reviewer calls on a diff, as part of a review, and its findings come out in the same rulings format as the rest of that review, so they sit beside the Standards and Spec findings instead of in a separate report. It is named `/suits:security-review`; the prefix picks it.

**Does it say a diff is secure?**
No. A pass with no findings says which areas it checked and what it did not. It reads the diff, not the running system.

**Does it try the exploit?**
No. It shows the path in the code and stops. Nothing is run.

**Does it flag a weakness that was there before the diff?**
Only as a SUGGESTION. A problem that was already there is not a finding on this diff.

**Which dependency findings does it make?**
Those the manifest or lockfile in the diff shows: a source other than the registry, an install script, a near-miss name, an unpinned version. It cites an advisory only when the repository or the diff holds it, and it names the advisory lookup under `Not checked:`.

## It's working if

- Each finding names `file:line`, the path from input to use, and the rule, spec line or CWE id it rests on.
- Each finding opens with a prefix line such as `BLOCKER, verified:`.
- A finding with no rule, spec line or CWE id is no more than a SUGGESTION.
- The hand-over has a `Not checked:` line that names runtime configuration, infrastructure and the lack of any exploit or live test.
- A pass with no findings does not claim the diff is secure.
- A diff that touches none of the nine areas never reaches it.
- Nothing is edited, installed or run.
