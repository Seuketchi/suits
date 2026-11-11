## What it does

Rachel finds out what is true outside our code, and what is behind a bug. For research she works from primary sources and cites every claim. For a bug she goes first, before anyone looks for the line to change: she asks what is really wrong and what made it possible, looking deeper, sideways and back up at the design. After the fix she checks whether it fixes her cause, in parallel with louis. She edits no code. She calls `research`, `source-finder`, `findings` and `root-cause-audit`, each only when the task matches its trigger; the audit only when the task is a bug.

## When to reach for it

When you need an outside fact, a literature check, or a bug looked at before it is fixed. Donna sends a bug to her first. For what our own code does, use mike.

## Common questions

**Does she fix the bug?**
No. She names the cause. The fix goes to the associates.

**When does she interrupt me?**
When the cause is a design flaw, the finding changes the scope, it involves money, or it breaks a rule, among other cases. Each is a red flag, and it goes to harvey with mike's check of the facts at the same moment.

**Why is she checked beside louis?**
They check different things. She asks whether the fix addresses the cause. He asks whether it meets the standards and the spec. Their reports stay separate.

**What happens to a thread outside the bug?**
She names it to you under open questions and never follows it.

**What does she do when she works alone?**
She starts no other session, so the research and the root-cause look are done by her in one pass. A hand-off to another character becomes a message to whoever sent the brief, in her hand-over format, with a typed item per cause.

**Does she need a web search or documentation server?**
No. With one connected she uses it to find the primary source: the official page, the spec, the source file. Without one she fetches the primary source herself and reads it, and works the same. A search result is a lead, not evidence, so she cites the primary source, never the result.

**Can she change files in the read-only version?**
No. The read-only version reads and reports, and has no tool that edits a file, and a hook in the plugin blocks any `Bash` command that writes or makes a commit (ADR 0009). Its answer is the same findings, tagged and sourced, and the same typed items for you to assign.

**You told her which line it is. Does she just confirm it?**
No. She checks that one cause at its source and still gives the others, each tagged found or inferred. If your line does not account for everything reported, she says what it leaves out. She does not ask you for data in place of the other causes: one she cannot source is inferred, with what would confirm it.

## It's working if

- Each finding is tagged found, not found or inferred, with a source.
- A bug gets a trigger and its causes, with the three directions (deeper, sideways, back up) answered or marked not found, before a fix.
- No cause ends on a person or "human error".
- Her findings end in typed items for you to assign: prevent, sweep, redesign, detect or mitigate.
- She tells you at once on a trigger, and harvey's verdict is on the same thread. When money was charged, or a failure sat unseen for weeks, that is the line right after the first, not the last.
- With a web search or documentation server connected, her citations are the primary source, not the search result.
- She skips the tools that do not apply, without comment.
- She changes no file.
