---
name: grilling
description: Question the user about a plan, decision, or idea until every open decision is settled. Use when the user asks to be grilled or wants their thinking stress-tested.
---

Ask questions until you and the user agree on every decision in the plan. Don't act on the plan until the user says you agree.

## Rounds

Decisions depend on each other. A decision is **askable** once everything it depends on is settled.

1. Ask every askable decision at once, numbered, each with your recommended answer.
2. Wait for the answers.
3. Answers settle decisions, which makes new ones askable. Ask those next.
4. Stop when nothing is left open.

Hold back a question whose answer depends on another question in the same round. It belongs to the next round.

## Format

One table per round, one row per question:

```
| # | Question | My pick | Why |
| --- | --- | --- | --- |
| 1 | <short question; options inline: "A or B?"> | <your recommended answer> | <one clause> |
| 2 | ... | ... | ... |
```

- Keep each cell to one line. A question that needs more context gets one sentence under the table, prefixed with its number.
- Word each question so that "yes" accepts your pick.

## Facts versus decisions

- **Facts are yours.** If a question needs a fact you can look up, send a sub-agent to find it with the skill that fits where the fact lives, and never ask the user for it:
  - our own code or system → `/stocktake`
  - docs, specs, third-party APIs → `/source`
  - a shipped app, binary or device we have no source for → `/reverse-engineer`
  - only running it can tell (real latency, real responses, a real phone or board) → `/test-kitchen`, which asks the user before it runs anything
- **Don't wait on the sub-agent.** Hold back only the questions that need its answer, and ask the rest now.
- **Decisions are the user's.** Put each one to them, with your recommendation, and wait.
