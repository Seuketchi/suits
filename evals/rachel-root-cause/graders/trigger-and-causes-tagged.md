---
type: llm
focus: last_message
---
The first line gives the trigger and the main cause, tagged. The message does not just confirm the rounding line: it states the trigger (an amount whose fee has a fraction of half a cent or more, where `Math.round` rounds up and the rule says round down) and gives more than one cause, such as the rounding, the test that checks one exact value only, and nothing that compares charged fees with the rule. Each cause is tagged found, not found or inferred, with its source (`src/fee.js:3`, the test file, the commit, or the bug report). A cause that rests on knowing the outcome is inferred and says what would confirm it. A claim with no source is not stated as fact.
