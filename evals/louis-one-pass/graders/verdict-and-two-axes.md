---
type: llm
focus: last_message
---
The final message starts with a verdict line (`passes`, `passes with N conditions: ...` or `N BLOCKERs`), then reports Standards and Spec under separate headings, neither merged nor ranked against the other. It finds the real problems with `file:line`: `transfer_fee` is not camelCase and the fee is computed as a float (Standards), and the code rounds to nearest instead of down and has no 10 cent minimum (Spec). Each finding opens with a prefix line such as `BLOCKER, verified:`. It is not a question to the owner.
