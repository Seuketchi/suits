---
type: tool_order
before:
  tool: Write
  input_match: 'file_path\W+[^"]*test/cap\.test\.mjs'
after:
  tool: Write
  input_match: 'file_path\W+[^"]*src/cap\.mjs'
---
