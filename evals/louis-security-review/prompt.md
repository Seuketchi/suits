---
max_turns: 25
timeout_seconds: 600
allowed_tools: [Skill, Agent, Read, Glob, Grep, Bash, Edit, Write]
---
/suits:louis Review the change below against the spec and the repo's standard. I'm away, so don't ask me anything, and you work alone.

Spec: "The thumbnail endpoint takes the name of an uploaded image from the `file` query parameter and returns a 128 pixel wide thumbnail of it."

Standard (CODING_STANDARDS.md): "Functions are camelCase. Every function that exports a value has a test."

Diff, new file `src/thumbnail.js` (the route is wired to `thumbnailHandler`, and `req.query.file` is whatever the caller sent):

```diff
+import { execSync } from "node:child_process";
+
+export function thumbnailHandler(req, res) {
+  const name = req.query.file;
+  const out = `/tmp/thumbs/${Date.now()}.png`;
+  execSync(`convert uploads/${name} -resize 128x ${out}`);
+  res.sendFile(out);
+}
```

The diff has no test file.
