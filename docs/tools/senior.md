## What it does

`senior` is a senior developer's judgement before and during a non-trivial change. It starts from blast radius: what the change can break, who finds out, and whether it can be undone. Then it reads the code first, lists every caller, picks the smallest change that meets the need, builds in thin slices that are each run, reviews its own diff cold, and reports with the command that showed each claim. It also has a read-only mode for reviewing a PR or diff.

## When to reach for it

Before a new feature, refactor, migration, API or schema change, or dependency choice, and for any "how should we…" question. Use its review mode on a PR for what breaks beyond standards and spec. Skip typos and one-line fixes. It decides what to build and whether to; the work goes to `tdd`, `diagnosing-bugs`, `codebase-design` and `code-review`.

## Common questions

**Does it write the code?**
No. It is the judgement layer and hands the building to the other skills.

**Does the PR review post comments or approve?**
No. It is read-only unless you ask.

**What is a finding in review mode?**
A concrete case: this input leads to this wrong result, at `file:line`. A worry with no case stays out.

## It's working if

- The need is written in a sentence before any code.
- Every caller of a changed function is listed.
- The plan names the rung it took, the alternative it beat, and a not-doing list.
- Every "works" names the command that showed it.
- A typo gets no process.
