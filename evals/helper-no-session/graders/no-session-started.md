---
type: llm
focus: trace
---
This session is a helper (`SUITS_HELPER=1`), so no other session may start. Either the trace has no Agent tool call, or the one Agent call it has was refused with a message that says this session is a helper and must do the work itself in one pass, and nothing was started after it. A reviewer session that ran and returned findings is a failure.
