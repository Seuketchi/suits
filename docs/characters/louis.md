## What it does

Louis checks work against the rules and the spec. He gets the done test when a request starts and checks small pieces as they arrive, so there is no single large review at the end. He rules on every review comment twice: whether it is true (verified, outdated, disputed) and how serious it is (BLOCKER, SHOULD FIX, SUGGESTION). He supervises the builders and sends failing work back to its author. He calls `code-review` when there is a diff to check, `money-check` when the work touches money, and `/suits:security-review` when the diff touches untrusted input or a trust boundary.

## When to reach for it

When there is a diff to review, a piece of work to write a done test for, or a review round to rule on. In a bug he reviews the fix beside rachel. Skip him when there is nothing to check.

## Common questions

**What is the difference between a BLOCKER and a SHOULD FIX?**
A BLOCKER is always fixed in the round. A SHOULD FIX is fixed in the PR if cheap, otherwise it is a follow-up with an issue number. A SUGGESTION is never required.

**Does he review beside rachel or after her?**
Beside her, on a different question. She asks whether the fix addresses the cause. He asks about standards, spec and numbers. The reports are not merged.

**Does he check money on every diff?**
No. Only when the diff or spec touches amounts, fees, limits, rates, rounding, currency or balances.

**Does he run a security pass on every diff?**
No. Only when the diff touches parsing of files or uploads, command execution, deserialization, query building, authentication or authorization, secrets or keys, outbound requests built from input, file paths from input, or dependencies. Its findings are ruled like his others, reported under the Standards heading, and it never says a diff is secure.

**Why is the verdict always the first line, even when he writes a done test?**
The verdict is what you act on, so it comes first. A done test written in the same reply goes after it, and the findings follow.

**Why does he name the review skill as `suits:code-review`?**
Claude Code has a built-in `/code-review`. The prefix picks this one.

**Can another session start a read-only louis?**
Yes. The plugin ships `agents/louis.md`, a version of louis another session can start by name. Its tool list has no `Edit`, `Write` or `NotebookEdit`, and none that starts a session, so it edits nothing and starts no other session. It runs the `louis` skill in its one-pass mode. `Bash` stays in the list because he needs `git` and `gh` to read, and the list cannot limit `Bash` to reading: the file tells him to use it only to read, and that sentence is the only limit on it.

**Does he start other sessions to review?**
No. He runs the review skill in its one-pass mode: Standards, then Spec, both himself, each in its own section. That is also what he does when he works alone, and he reads a pull request with `gh pr diff` or a commit with `git show` without checking a branch out. A hand-off to another character becomes a message to whoever sent the brief, in his hand-over format.

## It's working if

- Each finding names `file:line` and the rule, spec line or CWE id it breaks.
- Every comment starts with one prefix line, such as `BLOCKER, verified:`.
- A pass says what it checked and what it did not.
- A money diff is answered against the ten items of `money-check`, each with a `file:line`.
- A diff with no money in it gets no numbers check.
- A diff that touches untrusted input or a trust boundary gets `/suits:security-review`, and a finding in it cites a rule, spec line or CWE id.
- A diff that touches none of those gets no security pass.
- He skips the tools that do not apply, without comment.
- He edits nothing he reviews.
- A merge with resolved conflicts gets one verdict per conflicted file (`both kept`, `ours lost` or `theirs lost`) from `git show --remerge-diff`, and a lost side is a BLOCKER citing its commit.
