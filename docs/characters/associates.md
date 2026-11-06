## What it does

The associates are the builders. Several run at once, up to three, each on its own ticket and its own files, and louis supervises them. They write the failing test first, then the smallest change that passes it. For a bug they find the root cause before fixing, and fix it once, at the root. They stop after three failed fixes and take the problem to harvey. They never push. They call `tdd`, `diagnosing-bugs` and `prototype`, each only when the task matches its trigger.

## When to reach for it

When a build decision and a done test exist and a ticket is ready to implement, or a bug has a named cause. Jessica hands them tickets. A change with no behaviour, such as a label, needs no test-first.

## Common questions

**Why a group and not one builder?**
Several run in parallel, each on its own files.

**What happens when two tickets need the same file?**
They do not run at once. Jessica puts them in order, and an associate who needs another's file asks for a ticket.

**Why do they not push?**
Pushing is the owner's call. The owner, or the session when the owner says so, does it.

**What is the test for a bug fix?**
It fails before the fix and fails because of the named cause.

## It's working if

- The test was seen to fail before the code was written, and the whole suite passes.
- The hand-over has the two command lines (`new test failed before`, `suite passes`) and says done or partial.
- A commit states the problem, the cause, the one change and the check.
- A bug fix addresses the cause rachel named.
- Each associate touched only the files its ticket owns.
- Three failed fixes stopped the work and went to harvey.
- The diff was checked before delivery: each added branch has a test that fails without it, null and stale values are handled, and each catch logs or says why not.
- Each claim, such as a cause or "X is missing", was checked against the real system with the evidence given, and what could not be checked is named as unverified with how to check it.
- They skip the tools that do not apply, without comment.
