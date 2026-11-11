# Research works inline and delegates on sonnet

Date: 2026-11-11

## Context

The `research` tool used to run every question in a background session. Anthropic's guidance says handing a task to another session gives parallelism or a fresh pair of eyes, not a better answer, and that a run split across several sessions costs about 15 times the tokens of a chat. It pays for breadth-first reading across many independent sources, which is a minority of research questions. A narrow question (one API, one version claim) paid the cost and gained nothing.

## Decision

- The default is inline: the tool reads and answers in the current session.
- It delegates only when the question has several independent directions, or noisy reading too big for one context, and it says so in one line before it starts. A session that is already a delegated run, or cannot start one, does the work itself and never re-delegates.
- A delegated run sets its model to `sonnet`. The reading is the cheap part; the claims keep their citations, so the write-up can be checked.
- Each delegated brief has an objective, an output format, the sources to use and clear bounds.

## Why the model is set in the skill and not in `agents/`

The definitions in `agents/` are the read-only versions of louis, mike and rachel (ADR 0007), with no `Write`, and they run a character's skill. Research writes `docs/findings/<topic>.md`, so a read-only version cannot do its job, and pointing it at `agents/rachel.md` would run the wrong skill. A new definition in `agents/` would also break the rule that the folder holds the read-only versions only. The start call takes a model, so the skill names it there and no `model:` line is needed in any definition. ADR 0007's "sets no model" still holds for the three.

## Consequences

- Most research questions cost one session, not two.
- Broad ones still fan out, on the cheaper model.
- If the start call stops taking a model, the delegated run inherits the session's model and costs more; this ADR is then the place to revisit.
