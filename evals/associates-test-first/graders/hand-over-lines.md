---
type: regex
target: last_message
match: contains
flags: mi
---
^(?=[\s\S]*^[\s>*_`-]*new test failed before:[ \t]*(?!(?:none|n/a)\b)\S)(?=[\s\S]*^[\s>*_`-]*checks pass:[ \t]*\S)
