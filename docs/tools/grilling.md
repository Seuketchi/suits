## What it does

`grilling` questions you about a plan, a decision, or an idea until every decision in it is settled, before anyone acts on it.

It asks in **rounds**. A round is every decision it can ask about yet: the ones whose prerequisites you've already settled. It never puts two questions in one round when one depends on the other. Your answers settle decisions, which makes new ones askable, and the next round asks those. Thirteen questions usually take about three rounds, not thirteen.

## When to reach for it

Type `/suits:grilling`, or Claude reaches for it on its own when a task fits. It is the only [skill](https://www.aihero.dev/ai-coding-dictionary/skill) in the grilling family that is model-invoked, which is why you rarely type it: usually a skill you *did* type is running it for you.

Typing `/suits:grilling` directly gets you the plain interview and nothing else. Where you want something more than that:

| What you have | Reach for |
| --- | --- |
| You aren't working in a working directory | [grill-me](https://aihero.dev/skills-grill-me): the same [session](https://www.aihero.dev/ai-coding-dictionary/session), under a name Claude will never fire by itself |
| You are in a working directory | [grill-with-docs](https://aihero.dev/skills-grill-with-docs): the same session, and it writes `CONTEXT.md` and ADRs as it goes |
| An effort too big to hold in one session | [banquet](https://aihero.dev/skills-banquet): it charts a map and runs grilling inside the decision tickets |
| A question that talking cannot settle: how something should look or feel | [sample](https://aihero.dev/skills-prototype): build the throwaway version, then come back |
| A skill of your own that needs an interview | Invoke `/suits:grilling` from it, rather than writing another interview |

## Rounds, and who decides

Each round arrives as one table: a row per question, with Claude's pick and a one-clause reason beside it. That lets you answer a round by number ("1 yes, 2 the second option, 3 no, because…") instead of quoting questions back. One rough edge: a recommendation sometimes argues against the question as worded, so agreeing with it means answering "no". When that happens, answer the recommendation and say so.

Facts and decisions are split. Facts are Claude's job: when a question needs something it can look up, it sends a helper session to find out instead of asking you, picked by where the fact lives: `stocktake` for our own code, `source` for docs and APIs, `reverse-engineer` for a shipped artifact, `test-kitchen` when only running it can tell (and that one asks before it runs), and only the questions that need that answer wait for it. Decisions are yours, and it waits for them. Claude running `grilling` that answers its own decisions has broken the skill. The session ends when nothing is left open, and it won't act on what you agreed until you confirm you agree.

The limit: which questions are askable is Claude's judgement, not a computed graph. It can put two questions in one round and only then see that one answer should have changed the other. Tell it, and it reopens that decision next round.

## What lives here and what lives in the wrappers

This page covers the mechanism. The things people most often want are documented one level up.

| Question | Where it is answered |
| --- | --- |
| Rounds, the question format, facts vs decisions | Here |
| How long a session should run, what to do with a question you can't answer by talking, how to avoid nodding along | [grill-me](https://aihero.dev/skills-grill-me) |
| What gets written to `CONTEXT.md`, what becomes an ADR | [grill-with-docs](https://aihero.dev/skills-grill-with-docs) |

## Common questions

**Can I go back to one question at a time?**
Yes, and a large part of the audience does. Add this to your global `CLAUDE.md`:

```
When grilling, ask one question at a time.
```

The round-based default is genuinely contested. Practitioners who read slowly, who work in a second language, or who use the sequential format as focus scaffolding all report the one-at-a-time rhythm is better for them, and the opt-out is supported rather than tolerated.

**Where did `/batch-grill-me` go?**
Into this skill. Round-based questioning shipped briefly as a separate skill, then moved into `grilling` itself, so everything built on the primitive (`grill-me`, `grill-with-docs`, `triage`, `banquet`) got it at once. There is no `batch-grill-me` to install, and no separate sequential skill either; the `CLAUDE.md` line above is the way back to one-at-a-time.

**Asking a whole round at once must lose the questions my earlier answers would have raised. Doesn't it?**
This is the most common objection to rounds. A round only ever holds questions that don't depend on each other, so no answer in a round can invalidate another question in the same round. Answers still reshape everything downstream: the next round is recomputed, not pre-written. What you lose is smaller than "all questions at once" implies, and larger than nothing: see the limit above.

**It ran out of questions and started building.**
A confirmation gate exists precisely for this: the skill isn't finished when it runs out of questions, but when you say you agree. Weaker and faster [models](https://www.aihero.dev/ai-coding-dictionary/model) still break it; this is reported most often on lower-effort or non-frontier models, which collapse "interview until shared understanding" into a couple of questions and an outline. If yours does it, the reliable fix is a line in your own `AGENTS.md` or `CLAUDE.md` telling Claude not to implement without permission.

**It answered its own questions instead of asking me.**
That is a bug in the run, not the intended behaviour, and it was the reason facts and decisions were separated in the skill's text. It shows up most when another skill runs `grilling` inside a resolve-this-ticket frame, where the surrounding task reads as licence to keep moving. The same constraint is why there is no async mode: people have asked for a variant that reads a GitHub issue and posts one consolidated decision memo, and that is a different skill, because a grilling session that nobody answers has produced Claude's opinion rather than yours.

**Can I cap the number of questions?**
No, and a cap is deliberately out of scope. Some plans need three questions and some need fifty; a fixed ceiling either truncates the hard case or feels arbitrary on the easy one. Steering in plain language is the intended control: tell it to wrap up, or stop and accept the plan where it stands. If a session is running very long, the cause is usually that the scope was too big; break the work up and grill the pieces.

**I installed `grill-me` on its own and nothing happens.**
`grill-me` is a one-line skill whose whole body is "run a `/suits:grilling` session", so it needs this skill installed too. The same is true of `grill-with-docs`, which additionally needs [domain-modeling](https://aihero.dev/skills-domain-modeling). Installing the whole set avoids the problem; installing selectively means installing the primitives as well.

**`grill-with-docs` ran, but it never loaded `grilling`.**
A real and unfixed rough edge, reported across [harnesses](https://www.aihero.dev/ai-coding-dictionary/harness) and models: a skill that names another skill does not reliably cause that skill to load, and `grill-with-docs` names two. The tell is a session that asks everything at once with no recommendations attached: that is the model improvising an interview rather than running this one. Asking Claude directly whether it loaded `grilling` and `domain-modeling` usually recovers it.

## It's working if

- A round arrives as one table, a row per question with Claude's pick and why, and you can answer the whole round by number.
- Nothing in a round needs another question in the same round answered first.
- Later rounds ask things the first round could not have asked.
- It goes and looks facts up (reading files, starting a helper session) rather than asking you something it could have found out.
- Research running in the background does not stall the round; only the questions that depend on it wait.
- It stops at the end and asks you to confirm the understanding is shared, instead of starting work.
- Question count stays high while round count stays low.

## Where it fits

`grilling` is a **primitive**, not a step you schedule: the single source of truth for the interview technique, kept in one place so every skill that needs an interview reaches for it instead of inventing one. [grill-me](https://aihero.dev/skills-grill-me) and [grill-with-docs](https://aihero.dev/skills-grill-with-docs) are its two user-invoked front doors, and `grill-with-docs` is where the main build chain begins, ahead of [recipe](https://aihero.dev/skills-to-spec). [banquet](https://aihero.dev/skills-banquet) runs it to resolve decision tickets, [triage](https://aihero.dev/skills-triage) to grill a vague report into a workable one, and [deep-clean](https://aihero.dev/skills-improve-codebase-architecture) to walk the tree once you have picked a candidate to deepen. When you are unsure which entry point fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
