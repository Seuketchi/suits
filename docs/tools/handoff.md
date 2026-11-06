## What it does

`handoff` writes the current session up as a short document so another session can carry on. It holds the goal, where things stand, what was decided and why, what was tried and dropped, what is next, and the skills the next session should load. It points to specs, plans, issues and commits by path instead of copying them, and redacts secrets and personal data.

## When to reach for it

When a session is ending and its work will be picked up in another. Pass what the next session is for as the argument. Donna calls it for that case.

## Common questions

**Where does the document go?**
Into the system's temporary directory, not the working tree, so it never lands in a commit. It gives the path when done.

**Does it publish or start anything?**
No. It asks before publishing the document anywhere or starting another session.

**What if the work is already written down?**
It links to the spec, plan, decision record, issue or commit and does not repeat it.

## It's working if

- The next session can start from the document alone.
- Decisions carry their reason in a line.
- Nothing already kept elsewhere is copied in.
- No key, password or personal detail is in it.
