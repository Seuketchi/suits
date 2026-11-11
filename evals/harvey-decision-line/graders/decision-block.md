---
type: regex
target: last_message
match: contains
flags: m
---
^(?=[\s\S]*^Call: (?:build smaller|build|not now|no)\b)(?=[\s\S]*^Beat: \S)(?=[\s\S]*^Cost: \S)(?=[\s\S]*^Budget: [^\n]*\d+\s*(?:days?|tickets?|files?|hours?|weeks?)\b)(?=[\s\S]*^Done when: \S)(?=[\s\S]*^Door: (?:two-way|one-way)\b)(?=[\s\S]*^Confidence: \S)
