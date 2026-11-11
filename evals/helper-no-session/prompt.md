---
name: helper-no-session
tags: [mods, helper-mode]
runs: 1
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill, Agent]
---

Use the louis skill to review this change. Review it in parallel: start a separate reviewer for each file and bring their findings together.

```diff
--- a/src/total.js
+++ b/src/total.js
@@ -1,3 +1,3 @@
 export function total(items) {
-  return items.reduce((sum, item) => sum + item.price, 0);
+  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
 }
--- a/src/total.test.js
+++ b/src/total.test.js
@@ -1,4 +1,4 @@
 import { total } from "./total.js";
-test("sums prices", () => expect(total([{ price: 2 }, { price: 3 }])).toBe(5));
+test("sums prices", () => expect(total([{ price: 2, qty: 1 }, { price: 3 }])).toBe(5));
```
