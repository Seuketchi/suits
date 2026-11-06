---
name: scrum
description: Use when the user invokes /scrum, or asks for their daily standup, scrum report, or "what did I do yesterday" — drafts a scrum daily report from real git and GitHub activity and writes it to a plain-text file.
allowed-tools:
  - Bash(date:*)
  - Bash(git config:*)
  - Bash(git fetch:*)
  - Bash(git log:*)
  - Bash(git show:*)
  - Bash(gh pr list:*)
  - Bash(gh pr view:*)
  - Bash(gh pr checks:*)
  - Bash(gh run list:*)
  - Bash(gh run view:*)
  - Bash(gh issue list:*)
  - Bash(gh issue view:*)
  - Bash(gh api:*)
  - Read
  - Write
---

# Draft the scrum daily report

Builds a report from **evidence only** — merged PRs, the open PR queue, real CI failures, open contract questions — and writes it as plain text to a file. The report covers **only the invoking user's own work**.

## When to use

Explicit invocation: `/scrum`, "standup", "scrum report", "what did I do yesterday".

Optional argument: a date (`/scrum 2026-09-03`) to redraft a past day. Without it, the report is for **today**.

## Prerequisites

`gh` authenticated. A local clone of the app repo is optional: it only adds the `git log` cross-check, and without one everything comes from the `gh` API.

---

## 1. Establish identity and date — before anything else

Never guess either.

```bash
date +'%d %b %Y'                    # header date  -> "04 Sep 2026"
date +'%Y-%m-%d'                    # filename date
date +'%u'                          # 1=Mon .. 7=Sun, for the window rule
gh api user -q .login               # GitHub handle, for --author/--assignee @me
```

The report carries no name — it is filed under the author who ran it.

### The reporting window

The window covers **the previous working day, 04:00 local to 04:00 local**:

| Today is | Window runs from | to |
|---|---|---|
| Tue–Fri | previous day 04:00 local | today 04:00 local |
| Mon | **Friday** 04:00 local | today 04:00 local (so Sat + Sun are included) |

> **Why 04:00 and not midnight.** A merge at 00:59 local is work the person did last night and will absolutely mention at the 09:00 standup. A midnight boundary files it under *today*, drops it from today's report, and surfaces it days later — on a Friday-night merge, not until Monday. Verified against real data: `#1387`, `#1362` and `#1293` all merged between 00:12 and 01:13 local and belong to the previous day's report.

> **Timezone — convert before assigning.** GitHub timestamps are **UTC**; the team is **Asia/Manila (UTC+8)**. Never eyeball it:
>
> ```bash
> TZ=Asia/Manila date -d '<utc timestamp>' +'%a %F %H:%M'
> ```
>
> For a Tue–Fri report the window is `previous-day 04:00 +08` → `today 04:00 +08`, which in UTC is `previous-day-minus-1 20:00Z` → `previous-day 20:00Z`.

---

## 2. Repos

| Repo | What it is |
|---|---|
| `apollo-com-ph/asenso_mobile` | the Flutter app |
| `apollo-com-ph/asenso-v3-mobile-api-spec` | the v3 API contract — semver in `openapi.yaml` (`info.version`), with a `CHANGELOG.md` |

---

## 3. Gather

Run all of these. Every line in the report must trace back to one.

1. **Merged work** — `gh pr list --author "@me" --state merged --json number,title,mergedAt,headRefName --limit 60`, filtered to the window **after** timezone conversion. Cross-check with `git log` on the default branch when there's a local clone.
2. **Opened or pushed** — PRs created or updated inside the window.
3. **The open queue** — `gh pr list --author "@me" --state open --json number,title,reviewDecision,mergeStateStatus,isDraft,headRefName,updatedAt`. Sort into six buckets:

   | Bucket | Signal |
   |---|---|
   | ready to merge | `APPROVED` + `CLEAN` |
   | changes requested | `CHANGES_REQUESTED` — **but check step 4 first** |
   | red CI | a check with `fail` |
   | **CI still running** | checks `pending` / `UNSTABLE` with nothing failed yet |
   | conflicted | `DIRTY` |
   | draft / parked | `isDraft` |

4. **Check whether a `CHANGES_REQUESTED` is stale.** `reviewDecision` stays `CHANGES_REQUESTED` until a *new review* is submitted — pushing fixes does not clear it. Compare the last commit date against the review date:

   ```bash
   gh pr view <n> --json reviews,commits \
     --jq '{review: (.reviews[-1].submittedAt), lastCommit: (.commits[-1].committedDate)}'
   ```

   If the commit is newer, the fixes are already pushed — report it as *awaiting re-review*, **not** as an outstanding blocker. Read the review body to name the concrete issue either way.

5. **Get the actual CI failure** — `gh pr checks <n>`, then `gh run view <id> --log-failed` for anything that failed. **Never write "CI failing" without naming the failing test or step.** If several PRs fail the same test, say it once with the shared cause. A *pending* gate is not a failure — it belongs in the "CI still running" bucket.

6. **Contract drift** — compare `info.version` on the spec repo's default branch against the version the app has adopted. If the app is behind, list each intervening release from the spec `CHANGELOG.md` with a one-line "what it means for us".

7. **Open questions to the backend** — for *Blockers* and *Risk* only, never for *Work planned*:

   ```bash
   gh issue list --repo apollo-com-ph/asenso-v3-mobile-api-spec \
     --author @me --state open --json number,title,createdAt
   ```

   These are contract questions and defects awaiting a backend decision. Most will **not** be blockers — see the blocker test in §5. An aging unanswered question belongs in the *Risk* line. **Never turn one into a *Work planned* bullet:** an open issue is evidence that a question was asked, not evidence that anyone intends to chase it today.

8. **Work with no PR yet** — what *Work planned for today* draws on besides the open queue:

   ```bash
   gh issue list --repo apollo-com-ph/asenso_mobile \
     --assignee @me --state open --json number,title,updatedAt,labels
   ```

   Assigned issues are started-next candidates. Prefer ones whose scope maps to the nearest release; an issue untouched for weeks is backlog, not today — say so rather than promoting it.

9. **Sanity-check anything carried from a previous run.** A PR can be closed unmerged between two runs on the same day. Re-read state (`gh pr view <n> --json state,mergedAt`) rather than trusting an earlier draft; a closed-unmerged PR is neither done nor in flight, so it leaves the report entirely.

Read [`reference/seams.md`](reference/seams.md) for the delivery schedule and how to map work to a release.

**Nothing else.** No local health sweep, no test runs, no OpenProject. If GitHub does not show it, it does not go in the report.

---

## 4. Output format

Write to `${SCRUM_DIR:-$HOME/projects/asenso/scrum}/standup-<YYYY-MM-DD>.txt` (create the directory if missing). **Print the path only. Never print the report inline.**

**In chat** (Tern on Telegram, a scheduled routine, or whenever the caller asks for the report itself): write no file, and reply with the report and nothing else. The plain-text rules below hold either way, so it still pastes cleanly.

**Plain text.** No markdown headings, no bold, no backticks, no code fences, no emoji, no literal `\n` escapes. Every bullet is **one line with no internal breaks**, so it survives a paste into Slack.

```
Scrum Daily Report for <DD Mon YYYY>

Work done yesterday
- <what landed or moved, and what it does for a customer or the team>
- ...

Work planned for today
- <the area of work, and what it does for a customer or the team when it lands>
- ...

Blockers
- <what is stopping work and who it waits on, or "None.">
- Risk: <one line, only if there is a real one>
```

- On a Monday the second heading reads **`Work done last working day`** instead.
- Append the release to the third heading when today's work sits in one: `Work planned for today — Sept 14 release (payments and recovery), 10 days out`. When it spans releases or maps to none, leave the heading bare and let the bullets carry the dates. Say "release", never "seam" — see the vocabulary table in §5.

See [`reference/example-report.txt`](reference/example-report.txt) for a full worked example.

---

## 5. Rules

**Length.** 4–6 bullets under *Work done*, 3–5 under *Work planned*, 0–2 under *Blockers*. If there is genuinely more, cut the least consequential — do not extend the section.

**Cap every bullet at roughly 25 words.** One sentence, or one sentence plus a short clause after a dash or colon. This is skimmed on a phone in a standup, not read.

| Too long (44 words) | Compressed (19) |
|---|---|
| A customer moving to a new phone can now do it start to finish: begin from the login screen on the new phone, kick it off from the old one, and the old phone is told the account is moving before they have to ask. | Moving to a new phone works start to finish now, including warning the old phone before it asks. |

Compress by **cutting detail, never by going vague**. Drop the mechanism, the sequence and the caveats; keep the customer outcome and the number. If a bullet still will not fit, it is two bullets or it is one bullet plus something that did not matter.

**Write for a project manager, not for another developer.** This report is read by people tracking delivery, not by anyone who will open the code. Say what a customer or the team gets. A reader who has never seen the codebase should finish every line knowing something.

Translate internal vocabulary. Never let these reach the page:

| Internal | Write instead |
|---|---|
| money rail | the payment type — a transfer, InstaPay, bills, e-load |
| the money ceremony | paying with a confirmation step |
| authorise / authorisation path | approving a payment with fingerprint, face or PIN |
| data layer, repository, BLoC, use case | say what the screen or the customer sees; drop the layer entirely |
| the seam | the release, by its date — "the Sept 14 release" |
| contract, contract 10.3.0, conformance | the backend's API agreement; "picked up the backend's latest changes" |
| codegen, build.yaml, generator | build time, or the build |
| interceptor, transport, DTO, wire enum | omit — describe the effect, never the mechanism |
| v2 / v3 | fine as-is; the migration is the project's own name |

Name a screen or a customer action wherever one exists. "A customer moving to a new phone can do it start to finish" beats "device re-link walks end to end". Keep PR and issue numbers in parentheses — a PM ignores them, and anyone who needs to trace the work has them.

Two things stay technical because a PM decision depends on them: **a defect's customer-visible consequence** ("their money looks refused when it may have gone through") and **a date being missed**. Never simplify either into vagueness.

**Work planned is written in the same voice as Work done — name the work, not the git operation.** The PR queue is where the evidence comes from; it is not what the section is about. Nobody at a standup needs to hear that a branch wants rebasing.

| Write this | Not this |
|---|---|
| Finish the first whole money rail on v3 — an InstaPay transfer from bank choice to receipt (#1399). | Rebase #1399 onto main and get its checks running. |
| Make the money ceremony survive a lost response, a kill and a spent budget; the open question is a rate-limited inquiry still reading as a refusal (#1400). | Turn #1400 around after the review at 11:40. |
| Move the accounts list off v2, after a v3 session crashed it in QA (#1402). | Get #1402 reviewed, checks are running. |

**PR and issue numbers trail in parentheses as references. Never open a bullet with a git verb** — merge, rebase, push, review, land. If a mechanical detail changes what happens today (a conflict that must be resolved first, a review that must be answered), fold it into the sentence as a clause; do not make it the subject.

**State intentions only where the evidence shows one.** The tooling can see what is in flight; it cannot see what someone has decided to do. Inferring a plan from a query result is invention, no different from making up a bullet.

| Source | How it may be stated |
|---|---|
| step 3 buckets — open PRs | as work in progress; there is a branch and commits behind it |
| step 8 assigned issues, step 6 contract drift | only as a **candidate**, said plainly: "not started", "no PR against it yet" |
| step 7 spec questions | **not at all** — these go in the *Risk* line |

Never write that someone will chase, follow up on, or get answers to anything. An open issue proves a question was asked, not that today is the day it gets pushed. Cover what the evidence supports — not every source fires every day. Never leave the section empty.

### What counts as a blocker

A blocker is **something that stops work and cannot be moved from our end**. Both halves must hold:

1. **It needs another person** — a backend decision, someone else's review, an environment we do not control.
2. **Work is actually stopped by it right now** — there is a specific thing that cannot proceed until it is resolved.

| Not a blocker | Why |
|---|---|
| Failed CI | ours to fix — that is today's work |
| Merge conflict | ours to rebase |
| Missing tests, review comments to address | ours to write |
| A draft PR that is not finished | ours to finish |
| An open spec question that work routed around | nothing is stopped — mention it as a risk if it is aging, not as a blocker |

| Is a blocker | Why |
|---|---|
| A PR approved but needing someone else's merge permission | cannot proceed alone |
| A spec question whose answer a specific PR is waiting on | that PR cannot be finished |
| A backend defect making a flow untestable on staging | verification cannot proceed |
| An environment or credential we do not control being down | cannot proceed |

When naming one, say **what is stopped** and **who it waits on** — not just that a question is open. If nothing meets both halves, write `None.` A short honest Blockers section is the point; a padded one trains people to skip it.

**Only the invoking user's work.** A teammate's blocker is not a blocker here.

**Never invent.** No filler bullets. If the evidence is thin, the report is short.

**Output only the file path**, or in chat only the report — no preamble, no gathering narration, no closing summary.
