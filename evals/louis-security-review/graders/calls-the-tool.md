---
type: llm
focus: trace
---
The trace has a Skill call whose name ends in `security-review` (`suits:security-review`), because the diff builds a shell command from a request parameter. Saying that he ran a security pass, or that he will call the skill, without such a call in the trace is a failure, and so is a call to a different security command.
