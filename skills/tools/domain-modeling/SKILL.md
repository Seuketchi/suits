---
name: domain-modeling
description: Build and sharpen a project's domain model. Use when discussing codebase terminology, writing or editing a CONTEXT.md, or recording or editing an ADR.
---

# Domain Modeling

Build and sharpen the project's domain model while you design: challenge terms, invent edge-case scenarios, and write the glossary and decisions down the moment they crystallise. This skill is for *changing* the model. Merely reading `CONTEXT.md` for vocabulary is a habit any skill has, not this skill.

## File structure

Most repos have a single context:

```
/
├── CONTEXT.md
├── docs/
│   └── adr/
│       ├── 0001-event-sourced-orders.md
│       └── 0002-postgres-for-write-model.md
└── src/
```

A `CONTEXT-MAP.md` at the root means the repo has multiple contexts. The map points to where each one lives:

```
/
├── CONTEXT-MAP.md
├── docs/
│   └── adr/                          ← system-wide decisions
├── src/
│   ├── ordering/
│   │   ├── CONTEXT.md
│   │   └── docs/adr/                 ← context-specific decisions
│   └── billing/
│       ├── CONTEXT.md
│       └── docs/adr/
```

Create files lazily, only when you have something to write: `CONTEXT.md` when the first term is resolved, `docs/adr/` when the first ADR is needed.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with `CONTEXT.md`, call it out at once. "Your glossary defines 'cancellation' as X, but you seem to mean Y. Which is it?"

### Sharpen fuzzy language

When the user uses a vague or overloaded term, propose a precise canonical one. "You're saying 'account': do you mean the Customer or the User? Those are different things."

### Discuss concrete scenarios

When domain relationships come up, stress-test them with specific scenarios. Invent ones that probe edge cases and force the user to be precise about where one concept ends and another begins.

### Cross-reference with code

When the user states how something works, check whether the code agrees. Surface any contradiction: "Your code cancels entire Orders, but you just said partial cancellation is possible. Which is right?"

### Update CONTEXT.md inline

When a term is resolved, write it into `CONTEXT.md` right then, not in a batch later. Use the format in [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md).

`CONTEXT.md` is a glossary and nothing else: no implementation details, no spec, no scratch notes, no implementation decisions.

### Offer ADRs sparingly

Offer an ADR only when all three are true:

1. **Hard to reverse**: changing your mind later has a meaningful cost
2. **Surprising without context**: a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off**: there were genuine alternatives, and you picked one for specific reasons

If any is missing, skip the ADR. Use the format in [ADR-FORMAT.md](./ADR-FORMAT.md).
