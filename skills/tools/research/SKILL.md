---
name: source
description: Investigate a question against high-trust primary sources and capture the findings as a Markdown file in the repo. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork delegated to a background agent.
---

Run the research in a **background agent**, so you keep working while it reads.

Give it this job:

1. Investigate the question against **primary sources**: official docs, source code, specs, first-party APIs. Trace every claim back to the source that owns it, not a secondary write-up.
2. Write it up with the `/findings` skill, kind `research`: one file at `docs/findings/<topic>.md`, each claim citing its source.
