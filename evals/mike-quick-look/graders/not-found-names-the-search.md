---
type: llm
focus: last_message
---
Every "not found" in the final message names the search: the command (`git grep -n feeFor -- test/` or equivalent) and the paths it covered. A search that did not follow renames is called `not checked`, not `not found`. The message does not say a test exists when the prompt shows none.
