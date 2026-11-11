---
type: llm
focus: last_message
---
Every "not found" in the final message names the search: the command (`git grep -n feeFor -- test/` or equivalent) and the paths it covered. A history search (`git log` or `git blame` without `--follow`) that did not follow renames is called `not checked`, not `not found`; a `git grep` of the tree at one commit is not a history search, so `not found` is right for it. The message does not say a test exists when the prompt shows none.
