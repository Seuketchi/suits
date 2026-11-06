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

**Is recalled history safe to repeat?**
Only as far as it answers the question. A secret or a customer's details never leave a session.

## It's working if

- Every claim carries a `file:line`, a commit or a session.
- A claim that was not checked is marked assumed.
- He skips the tools that do not apply, without comment.
- A label typo does not reach him.
- When memory and code differ, he reports the code.
