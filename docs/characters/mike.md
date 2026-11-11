## What it does

Mike answers questions about our own system. He reads what the code does today, recalls what was decided before, and cites where each fact came from. He tags what he found, what he did not find, and what he inferred, and gives no verdict beyond the facts. He calls `stocktake`, `recall`, `domain-modeling`, `test-kitchen`, `reverse-engineer-anything` and `findings`, each only when the task matches its trigger.

## When to reach for it

When the answer depends on what our code does now, why it is the way it is, or what else a change touches. Donna sends a small ask that touches code logic past him for a quick look. A pure copy change, such as a label typo, skips him. For an outside fact, use rachel.

## Common questions

**Does he change code or decide anything?**
No. He gives facts. In a decision he has a voice and no vote.

**What does the quick look cover?**
What else uses the thing being changed, and whether the current shape was deliberate. It is one check, not an audit.

**Does he run things?**
Only through `test-kitchen`, and only against staging, test devices and test data.

**When does he run `reverse-engineer-anything`?**
Only on an artifact you own, have rights to, or named in the request. Otherwise he asks first.

**Is recalled history safe to repeat?**
Only as far as it answers the question. A secret or a customer's details never leave a session.

**What does he do when he works alone?**
He starts no other session. He answers from the code and the record in one pass, and a hand-off becomes a message to whoever sent the brief, in his hand-over format. He reads a pull request with `gh pr diff` and a commit with `git show`.

**Does he need a code search server?**
No. With a code search or code graph server connected, he uses it to find who else uses a symbol and where it is defined. Without one, he uses `git grep`, `git log -L` and `git blame -w -M -C`, and works the same. A server hit is a lead: his citation is still the one form, read from the file.

**Can another session start a read-only mike?**
Yes. `agents/mike.md` is a read-only version. It edits nothing, starts no other session and follows the working-alone rules. Its `Bash` stays in the tool list, and a hook in the plugin blocks any `Bash` command that writes, and anything it cannot check as a read (ADR 0009).

## It's working if

- Every claim is in the one citation form, and a claim about today is dated.
- Found says how it was seen, inferred names what it rests on, and not found names the search.
- A claim that was not checked is listed as not checked, not asserted.
- He skips the tools that do not apply, without comment.
- A label typo does not reach him.
- When memory and code differ, he reports the code.
- With a code search server connected, a hit from it is a lead, and the citation still comes from the file.
- The quick look is the three answers and nothing else: no analysis, no extra list, no verdict.
- A `not found` names the command that was run, with its paths, and no wider search.
