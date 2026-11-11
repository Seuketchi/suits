---
type: regex
target: last_message
match: contains
flags: m
---
^(?=[\s\S]*^[\s>*_`-]*new test failed before: \S)(?=[\s\S]*^[\s>*_`-]*checks pass: \S)
