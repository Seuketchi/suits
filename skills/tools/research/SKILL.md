---
name: research
description: Investigate a question against high-trust primary sources and capture the findings as a Markdown file in the repo. Use when the user wants a topic researched, docs or API facts gathered, or a cited answer written down.
---

By default, read and answer **inline**, in the current session: a handed-off task is not answered better, and a delegated run costs several times the tokens.

Delegate only when the question has several independent directions or noisy reading too big for one context, and say so in one line before you start. If you are already a sub-agent, or cannot start one, do the work yourself; never re-delegate.

When you do delegate, start one background agent with its model set to `sonnet`: the reading is the cheap part, and the cited write-up is checked afterwards. Give each delegated brief:

- an **objective**: the one question that run answers;
- the **output format**: the findings file below, or a list of claims each with its source;
- the **sources to use**: the primary sources to read, named by kind or by name;
- the **bounds**: what is out of scope, and when to stop reading.

The job, inline or delegated:

1. Investigate the question against **primary sources**: official docs, source code, specs, first-party APIs. Trace every claim back to the source that owns it, not a secondary write-up.
2. Write it up with the `/suits:findings` skill, kind `research`: one file at `docs/findings/<topic>.md`, each claim citing its source.
