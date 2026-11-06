---
name: handoff
description: Write the current session up as a short document so another session can pick the work up. Use when a session is ending and its work continues elsewhere.
argument-hint: "What will the next session be used for?"
---

Write a handoff document that lets a fresh session carry on the work of this one. It is a note for the next reader, so it holds what that reader cannot get from the files.

Ask before publishing it anywhere or starting any other session. The default is to write the document to disk and give its path.

## Where it goes

Save it in the system's temporary directory (`$TMPDIR`, else `/tmp`; `%TEMP%` on Windows), not in the working tree. A handoff in the repository ends up in a commit.

## What goes in

- The goal and where the work stands now.
- What was decided, and why, in a line each.
- What was tried and dropped, so the next session does not repeat it.
- What is next, in order.
- A **Suggested skills** section naming the skills the next session should load, and why.

## What stays out

- Anything already kept in a spec, plan, decision record, issue, commit or diff. Point to it by path or URL instead of copying it.
- Secrets and personal data: keys, passwords, tokens, and names or numbers that identify a person. Redact them.

## Argument

If the caller says what the next session is for, tailor the document to that and cut what does not serve it.

When done, give the path and one line on what the document holds.
