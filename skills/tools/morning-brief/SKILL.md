---
name: morning-brief
description: Write a private daily work brief (what is assigned, what needs review, suggested triage) to a local file with a desktop notification. Use when the owner asks for the day's brief built from their repositories. Starts pending PR reviews that only the owner can see, and only when the owner has agreed.
---

# Morning brief

Read the repositories named in the user's config and write one brief to a local file, which pops a desktop notification. PR reviews are started as **pending**, so only the owner sees them until they submit one. Nothing is posted anywhere else.

The scheduled run starts this skill by itself at login (`node scripts/brief.mjs run`) with read-only `gh` commands and `scripts/brief.mjs` allowed, and nothing else. Anything outside that is refused; do not look for a way around it.

**Guard.** In the scheduled run, follow every step. In any other session (the prompt does not say "This is the scheduled run"), ask the owner before step 3 starts any pending review, and write the brief without that step if they say no. Never submit a review, post a comment, or change a label.

## 1. Read the config and earlier briefs

```bash
node <this-skill>/scripts/brief.mjs config
node <this-skill>/scripts/brief.mjs history
```

`config` prints the owner's `login` and the `repos`; use only those repos. If it fails, stop and print its error. `history` prints the last 14 days of briefs. Note which `ready-for-human` issues already got a triage suggestion there, and do not suggest those again.

## 2. Gather, per repo

```bash
gh search issues --repo <repo> --state open --assignee @me --json number,title,labels,updatedAt,url
gh search issues --repo <repo> --state open --label ready-for-human --json number,title,labels,createdAt,url
gh search prs --repo <repo> --state open --review-requested @me --json number,title,author,updatedAt,url
gh search prs --repo <repo> --state open --author @me --json number,title,url
gh pr view <n> --repo <repo> --json reviewDecision,statusCheckRollup   # each of the owner's own PRs
```

## 3. Start pending reviews

For up to 3 PRs requesting the owner's review, oldest first:

1. `gh pr view <n> --repo <repo>` and `gh pr diff <n> --repo <repo>`.
2. Write a short review body: what the PR does in one line, then the concrete problems (correctness, missing tests, risky changes) as a list, each naming the file. No praise padding. If nothing is wrong, say what was checked.
3. Start it, with the body on stdin:

```bash
node <this-skill>/scripts/brief.mjs pending-review <repo> <n> <<'BODY'
<review body>
BODY
```

The script skips a PR that already has a pending review from the owner.

## 4. Save the brief

One brief, in this shape. Leave out a section with nothing in it, and cap each list at 5, then "+N more".

```markdown
# Brief — <Weekday, D Month>

**Do this first:** <one item and why: a PR blocking someone, a failing check on the owner's PR, the oldest assigned issue>

## Needs your review
- <repo>#<n> <title> — pending review drafted: <one-line gist>
  <url>

## Your PRs
- <repo>#<n> <title> — <changes requested | checks failing | approved, ready to merge>

## Assigned to you
- <repo>#<n> <title> (updated <N>d ago)

## Triage suggestions (not applied)
- <repo>#<n> <title> — label: <label>, priority: <high|medium|low>, next: <one step>
```

Suggest triage for at most 5 `ready-for-human` issues a day, oldest first, not already suggested. Base each on the issue's title and body, and say "unclear" rather than guess.

The summary argument is the notification text: counts only, under 60 characters, for example `2 reviews, 1 failing check, 3 assigned`.

```bash
node <this-skill>/scripts/brief.mjs save '<summary>' <<'BODY'
<the brief>
BODY
```

Then print one line: the file it saved and how many pending reviews were started.

## Config

`~/.config/morning-brief/config.json` (or `$MORNING_BRIEF_CONFIG`), local to the machine and never committed:

```json
{ "repos": ["owner/repo-a", "owner/repo-b"], "briefDir": "~/briefs" }
```

`briefDir` is optional and defaults to `~/briefs`. Briefs are named `YYYY-MM-DD.md`. `onSave` is optional too: a command that `save` runs with counts worked out from the brief's headings. Do not call it or write its text.
