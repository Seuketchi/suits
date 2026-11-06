## What it does

`morning-brief` reads the repositories in the owner's config and writes one private brief to a local file, with a desktop notification: what needs the owner's review, the owner's own PRs and their checks, what is assigned, and a few triage suggestions that are never applied. For up to three PRs waiting on the owner it can start a pending review that only the owner sees. It never submits a review or posts anywhere.

## When to reach for it

When the owner asks for the day's brief and wants it built from their repositories rather than from the files already open. It also runs on its own at login, once a day. Donna calls it for the brief.

## Common questions

**Does it post anything?**
No. A pending review stays visible only to the owner until they submit it. Outside the scheduled run it asks before starting one.

**Where is the brief saved?**
In `~/briefs/YYYY-MM-DD.md`, or the `briefDir` in the config. The config lives at `~/.config/morning-brief/config.json`, or the path in `$MORNING_BRIEF_CONFIG`, and is never committed.

**Which repositories does it read?**
Only those in the config's `repos`. A repository outside the list is refused.

## It's working if

- The brief names one thing to do first and why.
- Empty sections are left out and each list stops at five.
- Triage suggestions are marked as not applied and are not repeated from earlier days.
- The notification carries counts only, no titles.
