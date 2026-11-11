---
type: llm
focus: last_message
---
The final message starts with a verdict line (`passes`, `passes with N conditions: ...` or `N BLOCKERs`) that counts the security BLOCKER, then reports under a Standards heading and a Spec heading, neither merged nor ranked against the other. The security finding is ruled in the same prefix form as the others (`BLOCKER, verified:`, `SHOULD FIX, verified:` or `SUGGESTION, verified:`) and every finding names `file:line`. The missing test is a Standards finding. It ends with `Checked:` and `Not checked:` lines.
