---
name: stocktake
description: Audit how our own code or system behaves today, citing file:line for every claim. Use when a decision waits on what the existing code actually does, not what anyone remembers.
---

A **stocktake** checks what is really on the shelves: how our code, config and data behave now. The code is the primary source; docs, comments and memory are leads to check against it.

Run it in a **background agent**, so the conversation keeps going. Give it the question and this job:

1. **Find the entry points.** Where does the behaviour start: a route, a screen, a job, an event handler, a migration? Done when each is named with its file:line.
2. **Trace each one end to end,** through calls, state and data to the effect: the response, the write, the screen, the message. Read config and feature flags on the path, and which environment sets them. Done when the trace has no unexplained hop, or the gap is an *unknown*.
3. **Check it against something that runs.** Find the tests that cover the path and what they assert; run them if they're cheap. When a claim needs the running system to settle, that is an experiment: name it in **Open** (for `/test-kitchen`, when installed), and don't run anything with side effects here.
4. **Read the history** where the *why* matters: `git log -L` or blame on the key lines, and the PR or issue that introduced them.
5. **Write it up** with the `/findings` skill, kind `audit`. Every claim cites file:line on a named commit.

Read only; change nothing.
