## What it does

`research` answers a question by reading the sources that own the answer, then leaves a cited Markdown file in the repo. It works only from **[primary sources](https://www.aihero.dev/ai-coding-dictionary/primary-source)**: official docs, source code, specs, first-party APIs. It follows every claim back to the source that owns it, so it will not repeat a blog post's account of an API when the API's own docs are reachable.

It does not answer you in the conversation. The output is a file at `docs/findings/<topic>.md`, in the shared findings format, with a link on each claim. That is the point: a document you can react to, hand to another session, or throw away, rather than an answer that vanishes when the [session](https://www.aihero.dev/ai-coding-dictionary/session) ends.

## When to reach for it

Type `/suits:research`, or Claude reaches for it automatically when a task turns into reading legwork.

Reach for it when the next step is *finding something out* from outside the working directory (how a third-party API behaves, what a spec actually says, whether a version claim holds). What you need decides which skill:

| What you need | Reach for |
| --- | --- |
| An external fact a decision is waiting on | `research` |
| A decision made *with* you, by interview | [grilling](https://aihero.dev/skills-grilling) |
| A durable architecture decision, written into `CONTEXT.md` and ADRs | [grill-with-docs](https://aihero.dev/skills-grill-with-docs) |
| To find out whether an approach works in your codebase | [prototype](https://aihero.dev/skills-prototype) |

The line between `research` and `grill-with-docs` is the **shelf life of what comes back**. Research produces short-lived assets: what this library's auth mechanism does as of this week. An ADR records a decision you keep. If what you are producing is a decision rather than a fact, you are [grilling](https://www.aihero.dev/ai-coding-dictionary/grilling), not researching.

## Inline by default, delegated for breadth

The skill reads and answers **inline**, in the session you are in. Handing the same task to another session does not make the answer better: it buys parallelism or a fresh pair of eyes, at several times the token cost. Research delegates only when the question has several independent directions, or the reading is too noisy to fit one context, and it says so in one line before it starts.

When it delegates, it starts one background session on the cheaper `sonnet` model and gives it a brief with four parts: the objective, the output format, the sources to use, and the bounds. You keep working while it reads.

The skill tells the session not to nest. If the session that runs it is already a background session, or cannot start one, it does the reading itself and never starts a further session.

The file lands at `docs/findings/<topic>.md`, in the format the `/suits:findings` skill defines (answer, method, claims marked observed, inferred or unknown, open questions), the same place and shape as an audit, a reverse-engineering run or an experiment. It writes one file per run.

## Common questions

**Can a background session start another one?**

No. The skill says so in its own text: a session that is already a background session, or cannot start one, does the work itself and never starts another. So a delegated run is one background session, and no duplicate runs out of view. Watch your background task list after invoking anyway; there should be exactly one new entry.

If your own global instructions forbid starting background sessions, the skill still does the reading in the session it runs in, so it does not quietly do nothing.

**Where should the file live, and should I commit it?**

The skill puts the file in `docs/findings/` and has no opinion beyond that on whether you keep it. The community one is fairly settled: ADRs are kept, research files are not. The sharpest version of it, from a Discord thread on exactly this question: "ADRs yes. Everything else archive or delete after done. It otherwise becomes cruft of work and can poison future repo reads if you've drifted away from the spec/research." A research file records what was true on the day it was written, so a stale one is worse than none. On balance these artifacts don't really belong in git, and there is no canonical home for them: people use Obsidian, a separate knowledge repo, or the issue tracker instead.

**What counts as a "high-trust" primary source, and who decides?**

The [model](https://www.aihero.dev/ai-coding-dictionary/model) does. The skill names the *kinds* of source that qualify (official docs, source code, specs, first-party APIs), and there is no allowlist, no domain gate, and no verification pass. This was the loudest objection when the skill was first proposed and it has never been answered publicly: five research runs pointed at junk only give five confident wrong answers faster, so what decides which sources count as high-trust? The mitigation you actually have is the citation on each claim. Follow two or three of them. If they land on a summary of the thing rather than the thing, the run failed at its one job.

**Does a later session reuse what an earlier run found?**

No. Nothing auto-loads a past research file; it is a document sitting in the repo until a human or a skill points at it. This was raised early as the strongest challenge to the design: the value is the Markdown becoming context the model reads again later, not the fetch itself, and a file written once and never read is only a fancy search. The shipped skill does not solve it. In practice the file earns its keep by being fed into the next step deliberately: attach it to a spec, quote it into a grilling session, point a [ticket](https://www.aihero.dev/ai-coding-dictionary/ticket) at it.

**Why not just ask Claude to go read the docs?**

You can, and a two-line prompt saying exactly that was the practice this skill replaced. What the skill buys over the prompt is that the primary-source constraint and the cited-file output come out the same way every time rather than however you happened to phrase it. Against a [harness](https://www.aihero.dev/ai-coding-dictionary/harness)'s own deep-research mode, the difference is the artifact and the source discipline, not the search. If a two-line prompt gets you what you need on a small question, use the two-line prompt.

**When does it stop reading?**

There is no stopping criterion in the skill, and this shows up as two complaints that look opposite but are the same gap: runs that go far too deep, and runs that cover a topic broadly while missing the one specific detail that mattered. One practitioner found deep-research skills sometimes go too deep, while a plain request to research usually misses crucial details. Scoping is on you. A narrow, answerable question (one API, one behaviour, one version claim) comes back far better than "research X".

## It's working if

- A narrow question is answered in your own session, with no background task. A broad one starts at most one, after a one-line note saying why. A second task with a near-identical name is the nesting bug.
- One new findings file shows up in `docs/findings/`, and Claude tells you the path.
- Every claim in it carries a link, and following two at random lands you on an official doc, a spec, or the actual source file, not on someone's write-up of it.
- You can make the decision you were stuck on from the file alone, without going back to the sources yourself.

## Where it fits

A reach-for-it-anytime standalone that feeds the thinking skills rather than sitting in the build chain. Its file is something to take *into* the flow: [grilling](https://aihero.dev/skills-grilling) and [grill-with-docs](https://aihero.dev/skills-grill-with-docs) ask sharper questions when the facts are already on the table, and [to-spec](https://aihero.dev/skills-to-spec) can synthesise against it.
