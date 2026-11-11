## What it does

`findings` is the one format every investigation writes its answer to: research, an audit of our own code, reverse-engineering, an experiment. The file lives at `docs/findings/<topic>.md` and opens with the question, then the answer, the method, and a table of claims.

Every claim in that table carries one of three statuses, **observed**, **inferred** or **unknown**, and a claim with no evidence is *unknown*, whatever it feels like. That is what lets a spec cite the file and a reader check it.

## When to reach for it

Type `/suits:findings`, or Claude reaches for it automatically when it is writing up an investigation or reading one into a spec.

Reach for it when you are about to record what an investigation found out. The investigating skills (`research`, [stocktake](./stocktake.md), `reverse-engineer-anything` and [`test-kitchen`](./test-kitchen.md)) call it themselves, so you rarely type it.

## Claims, not prose

The leading idea is the **claim table**: one fact per row, a status, and the evidence that earns the status (a file:line, a URL, a command and its output). *Absence* is a claim too; "X is never called" is *observed* only when the method says how the search was made complete.

## Common questions

**Is it a tool I run?**
Rarely. The investigating skills call it themselves when they write their result.

**Where does the file go?**
`docs/findings/<topic>.md`, with raw output beside it in `docs/findings/<topic>/`.

**What is a claim?**
One statement with the source that supports it. A claim without one is marked as inferred or not found.

## It's working if

- The file opens with the question as a question and a two- or three-sentence answer a decision can use as-is.
- Every row in the claim table has evidence, or says *unknown* and what would settle it.
- Every *unknown* that matters is listed under **Open** as a follow-up or an accepted gap.

## Where it fits

A format layer under the investigating skills, not a step in the build chain. `research` and [stocktake](./stocktake.md) write to it, and `to-spec` can synthesise against it.
