## What it does

`test-kitchen` settles a question by measuring it. It states the experiment first, pins the setup, runs it enough times to tell signal from noise, undoes what it changed, and records the result with `findings` as an experiment: the setup, the side effects, and the raw output each claim came from.

## When to reach for it

When reading cannot answer the question: real latency, real API responses, behaviour on a real phone or board. It runs against staging builds, test devices, test accounts and test data only. Never production, customer data or real money. Mike calls it when something must be run.

## Common questions

**What if the question can only be answered in production?**
It stops and says so.

**How many runs?**
At least three for anything timed.

**Where does the raw output go?**
Into `docs/findings/<topic>/`, with secrets and personal data redacted.

## It's working if

- The experiment is stated, with its side effects, before anything runs.
- The setup is pinned: build, device, OS, environment and tool versions.
- Each claim cites the run and the output it came from.
- What could not be undone is listed.
