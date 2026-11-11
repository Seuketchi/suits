---
max_turns: 25
timeout_seconds: 600
allowed_tools: [Skill, Agent, Read, Glob, Grep, Bash, Edit, Write]
---
/suits:louis Review the change below against the spec and the repo's standard. I'm away, so don't ask me anything, and you work alone.

Spec: "A fee of 1.5% is charged on each transfer, rounded down to the cent, and never less than 10 cents."

Standard (CODING_STANDARDS.md): "Functions are camelCase. Money is integer cents, never a float."

Diff, new file `src/fee.js`:

```diff
+export function transfer_fee(amountCents) {
+  const fee = amountCents * 0.015;
+  return Math.round(fee);
+}
```
