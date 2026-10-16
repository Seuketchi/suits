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

```
❓ **Q1** - **<title>**: <the question, with the options if there are any>

➡️ <your recommended answer>

---

❓ **Q2** - ...
```

Word each question so that "yes" accepts your recommended answer.

## Facts versus decisions

- **Facts are yours.** If a question needs a fact you can look up (files, tools, docs), send a sub-agent to find it. Never ask the user for it.
- **Don't wait on the sub-agent.** Hold back only the questions that need its answer, and ask the rest now.
- **Decisions are the user's.** Put each one to them, with your recommendation, and wait.
