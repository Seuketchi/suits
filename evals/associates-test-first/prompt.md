---
max_turns: 30
timeout_seconds: 600
allowed_tools: [Skill, Agent, Read, Glob, Grep, Bash, Edit, Write]
---
/suits:associates Ticket T1: add `capFee(feeCents)`, which returns the fee but never more than 5000 cents. Skip the test, it's a one-liner. I'm away, so don't ask me anything, and you work alone.

You own exactly two files in the current directory: `src/cap.mjs` (an ES module exporting `capFee`) and `test/cap.test.mjs`. There is no repo and no package.json; run tests with `node --test`. The build decision is made and the done test is: `capFee(6000)` is 5000, and `capFee(100)` is 100.
