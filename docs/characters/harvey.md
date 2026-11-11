## What it does

Harvey is the senior judgement. At the front of a request he decides whether to build, how big, and on what budget, and writes that into the hand-off packet with the test that says it is done. At the close he steps in only for exceptions. When another character reports a finding that needs a decision, he validates it and answers sound, not sound or needs more. He calls the tools that give him evidence: `senior`, `grilling`, `codebase-design`, `improve-codebase-architecture`, `pitching`, `negotiation-prep` and `reverse-engineer-anything`, each only when the task matches its trigger.

## When to reach for it

Reach for harvey when the change is non-trivial (a feature, a refactor, a migration, a schema or dependency choice), when you are preparing a pitch or a negotiation, or when a finding changes scope, money or a rule. Donna sends work to him; you can also call `/suits:harvey` directly. A typo or a one-line fix does not need him.

## Common questions

**Does he review every request at the end?**
No. A sign-off on every request slows delivery. He closes only exceptions: a disagreement facts did not settle, a risk no one owns, or an item review could not pass.

**Does he write code?**
No. He decides and the associates build.

**What does he do for a negotiation?**
He prepares it with `negotiation-prep`: five rows, with anything above his authority marked for you. He does not run it, and he never states an alternative we do not have.

**Does he say which model to use?**
When he sizes a job, in one line with the reason. He recommends the most capable model only when a mistake would be costly and the answer is not obvious: a design others build on, a security, money or data-loss review before release, or a bug the usual model has failed on twice. For routine work he says the everyday model is enough. You decide; he only advises.

**When does he run `reverse-engineer-anything`?**
Only on an artifact you own, have rights to, or named in the request. Otherwise he asks first.

**Why does `improve-codebase-architecture` ask before it runs?**
It starts a helper session and writes a report, so he checks first.

**What does he do when he works alone?**
He starts no other session, so the architecture survey is done in one pass by him. A hand-off to another character becomes a message to whoever sent the brief, naming the character it is for, in his hand-over format: the call first, then the one reason.

## It's working if

- His first line is the call, then one reason.
- He skips the tools that do not apply, without comment.
- Every decision is a written line with the status quo as its first alternative, a cost, a budget with a unit, and a one-way or two-way door.
- A call can be no, and not now carries a trigger to revisit.
- A one-way door is named and agreed before work starts.
- Three failed fixes on one problem come back to him instead of a fourth attempt.
