---
max_turns: 25
timeout_seconds: 600
allowed_tools: [Skill, Agent, Read, Glob, Grep, Bash, Edit, Write]
---
/suits:louis Review the change below. Review it in parallel: start a separate reviewer for each file and bring their findings together. I'm away, so don't ask me anything.

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
