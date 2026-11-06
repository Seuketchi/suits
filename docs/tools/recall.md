## What it does

`recall` searches the past Claude Code sessions on this machine for how something was done or decided. It looks in an index of what was said, never tool input or output, picks the session that fits, reads around the matches, and answers in a few lines with the date, the project and the session id.

## When to reach for it

When a past decision or the history of how something came to be matters, such as "why did we drop that library" or "how did we set that up". Pass what to look for as the argument. Mike calls it for history.

## Common questions

**What if it finds nothing?**
The index may be stale. It re-indexes when asked, which takes about half a minute for a few hundred sessions. A hook keeps it current at the end of each session.

**Can it leak a secret?**
Transcripts can hold keys and customer details. It quotes only what answers the question and never copies a secret into a file, a commit or a message.

**Does it search tool output?**
No. Only what the user and Claude said.

## It's working if

- The answer says which session it came from, with the date and project.
- It offers the session id so the session can be resumed.
- A search for something that never happened says so.
