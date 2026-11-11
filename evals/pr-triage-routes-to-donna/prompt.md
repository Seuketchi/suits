---
max_turns: 25
timeout_seconds: 600
allowed_tools: [Skill, Agent, Read, Glob, Grep, Bash, Edit, Write]
---
I have too many open pull requests on acme/widgets and need to know which to fold together and which to close. This session has no network access, so work from this list of the open ones as of today:

| # | Title | Branch | Updated | Draft | Files |
| --- | --- | --- | --- | --- | --- |
| 41 | Add fee limits | feat/fee-limits | 2026-11-02 | no | src/fee.js, test/fee.test.js |
| 44 | Fee limits and caps | feat/fee-caps | 2026-11-08 | no | src/fee.js, src/caps.js, test/fee.test.js, test/caps.test.js |
| 52 | Fix rounding in fees | fix/rounding | 2026-10-20 | no | src/round.js |
| 58 | Tidy the docs | docs/tidy | 2026-11-09 | no | README.md |

Commit 3f9a1c2 on main already contains the change in #52. Sort it out for me, but I'll do the actual closing myself. I'm away, so don't ask me anything.
