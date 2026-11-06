# What mike copies: cited answers and graded evidence, not a memory

Research notes for mike, 6 November 2026. Status: VERIFIED = read this session, by me (ICD 203 PDF, three commits) or by a fetch agent that returned the sentence verbatim ("agent"). UNCONFIRMED = a summary only, or not read. Where a page was only partly read, the quote comes from the part that was.

## What the real ones do

| Kind | Artifact | What it does | What mike copies |
| --- | --- | --- | --- |
| Evidence standard | [ICD 203](https://archive.dni.gov/files/documents/ICD/ICD-203.pdf), signed 2 Jan 2015 (VERIFIED, me, pdftotext of the file) | Nine tradecraft standards. D.6.e(1) source quality "age and continued currency"; (2) likelihood and confidence kept apart; (3) information vs assumptions vs judgments; (7) say if a judgment changed | Tags separate seen from reasoned; assumptions stated; changes to earlier judgments stated. "Products should state assumptions explicitly when they serve as the linchpin of an argument or when they bridge key information gaps." |
| Source grid | [Admiralty code](https://en.wikipedia.org/wiki/Admiralty_code) (VERIFIED, agent; page carries a "single source" banner) | Letter A-F for the source, number 1-6 for the information; F and 6 both mean "cannot be judged" | The two ratings are separate: "Each descriptor is considered in isolation". Mike separates how a fact was seen from whether anything corroborates it |
| Evidence grading | [Cochrane Handbook ch. 14](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-14) (VERIFIED, agent; the BMJ GRADE paper refused, see below) | Certainty per outcome in four levels, with a footnote explaining each downgrade | "The GRADE approach specifies four levels of the certainty for a body of evidence for a given outcome". Grade per claim, with the reason beside it |
| Sourcing rules | [WP:V](https://en.wikipedia.org/wiki/Wikipedia:Verifiability), [WP:NOR](https://en.wikipedia.org/wiki/Wikipedia:No_original_research) (VERIFIED, agent, lead sections) | Unsourced claims may be removed; a combined conclusion no source states is original research | "Even if you are sure something is true, it must have been published in a reliable source before you can add it." (V). NOR's "any analysis or synthesis ... that reaches or implies a conclusion not stated by the sources" is what `inferred` is |
| Commit-message rules | [Git SubmittingPatches](https://git-scm.com/docs/SubmittingPatches), [Linux submitting-patches](https://docs.kernel.org/process/submitting-patches.html), [Beams](https://cbea.ms/git-commit/), [Postgres committing checklist](https://wiki.postgresql.org/wiki/Committing_checklist) (VERIFIED, agent; tails of the first two were summarised and not used) | Where the history's "why" lives and how a commit is cited: 12+ chars of SHA plus subject (kernel), 9 chars (Postgres) | Git: "The goal of your log message is to convey the why behind your change to help future developers." Kernel form: `Commit e21d2170f36602ae2708 ("video: remove unnecessary platform_set_drvdata()")` |
| Real commit messages | [postgres e5f6a7a](https://github.com/postgres/postgres/commit/e5f6a7a28c4a), [git 4315717](https://github.com/git/git/commit/43157175b549), [linux f19f2b3](https://github.com/torvalds/linux/commit/f19f2b308beb) (VERIFIED, me, via `gh api`, first ~60 lines) | Each states the old behaviour, the cause, and the earlier commits it builds on. Postgres: "Re-add the test case that f52d4051 removed because it turned trilobite red". Git gives numbers: "checking 70K commits without a boundary takes 5.3s with the full check and 9.2s with the incremental one". Linux names a commit: "A producer-side path cap is already merged (ea4d4b5dddb5)" | A history answer names the commit, what it did and the stated reason, and says plainly when the message gives none |
| Code-reading guide | [rustc-dev-guide overview](https://rustc-dev-guide.rust-lang.org/overview.html) (VERIFIED, agent, whole page) | Traces one program through the compiler by crate, function and file; one link pinned to a commit and line; dates its claims; marks gaps "TODO" | "as of November 2022, only the steps between HIR and LLVM-IR are query-fied." Date the claim; name the symbol; mark the gap |
| Code README | [Postgres transam README](https://raw.githubusercontent.com/postgres/postgres/master/src/backend/access/transam/README) (VERIFIED, agent, first 40k chars) | Function and file names throughout, reasons given, no line numbers, no commit | Symbols outlast line numbers; cite both |
| Design essays | [nginx, AOSA](https://aosabook.org/en/v2/nginx.html); [Python design FAQ](https://docs.python.org/3/faq/design.html); [Old New Thing, MOV EDI,EDI](https://devblogs.microsoft.com/oldnewthing/20110921-00/?p=9583) (VERIFIED, agent) | Rationale, but opinions stated flat ("At this time, nginx doesn't support dynamically loaded modules", undated); Chen's "It's a hot-patch point." gives no source; the FAQ attributes: "Guido van Rossum believes that using indentation for grouping is extremely elegant" | Attribute a reason to a person and place; refuse the flat, undated, unsourced "why" (these are the anti-examples) |
| ADRs | [Nygard](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions), [Fowler](https://martinfowler.com/bliki/ArchitectureDecisionRecord.html) (VERIFIED, agent) | Status proposed / accepted / superseded; old records kept. "If a decision is reversed, we will keep the old one around, but mark it as superseded." | A cited decision carries its status and date; a reversal is a new record, not a quiet edit |
| Recovery method | [Reflexion models abstract](https://www.cs.ubc.ca/~murphy/papers/rm/fse95.html) (VERIFIED, agent, abstract only) | "computes a software reflexion model that shows where the engineer's high-level model agrees with and where it differs from a model of the source." | Check a remembered model element by element: agrees / differs |
| Pin-down tests | [Characterization test](https://en.wikipedia.org/wiki/Characterization_test) (VERIFIED, agent) | "Characterization tests are, essentially, change detectors." They record observed behaviour, not correct behaviour | A test run proves what the code does, never what it should do |
| Git history tools | [git log](https://git-scm.com/docs/git-log), [git blame](https://git-scm.com/docs/git-blame) (VERIFIED, agent; `-S`/`-G` text UNCONFIRMED) | `--follow` "Continue listing the history of a file beyond renames (works only for a single file)."; blame `-M`/`-C` follow moved lines; `--ignore-rev` skips a formatting commit | The quick look must follow moves and renames before it says "not found" or "introduced by" |

## What is dropped, and the check that holds it

| Pattern | Check (on mike's reply or findings file) |
| --- | --- |
| Bare SHA, no subject | Fail if `\b[0-9a-f]{7,40}\b` is not followed by ` \("` |
| `path:line` with no commit anywhere in the reply | Fail if `\w\.\w+:\d+` matches and no `\b[0-9a-f]{12}\b` does |
| `not found` with no search named | Fail if the line has `not found` and none of `git grep`, `git log`, `searched`, `rg` |
| Fourth tag (`assumed`, `probably`, `seems`) | Fail on `\b(assumed\|probably\|seems\|I think)\b` outside a quote; also assert the SKILL.md tag list is exactly the three |
| Confidence word and likelihood word in one sentence | Fail on a sentence matching both `(high\|moderate\|low) confidence` and `(likely\|unlikely\|probabl)` |
| `inferred` with no parents | Required field: every `inferred` line matches `rests on` |
| Reason with no source ("because", "chose", "on purpose", "deliberate") | Fail unless the same line has a sha, `ADR`, a record path or a session id; heuristic |
| Undated "currently / today / now" | Fail unless a sha or a date is in the same line |
| "I remember", "as I recall", memory as source | Fail on `I remember\|as I recall\|from memory` |
| Quick look verdict "accidental" or "by mistake" | Fail on that regex; only `no reason recorded` is allowed |
| Reading a passing test as "correct" | Not checkable |
| Quote longer than needed from a recalled session (rule 7) | Not checkable by regex; a length cap on quoted blocks is possible |

## Not seen

- BMJ GRADE paper (bmj.com/content/336/7650/924): HTTP 403, not retried. Only Cochrane ch. 14 was read; its mandatory-justification box (C75) came from a summary: UNCONFIRMED.
- College of Policing 5x5x5 report: HTTP 403, not retried. Admiralty is read only from Wikipedia, which carries a "single source" banner; NATO AJP-2.1 not opened.
- ICD 203 itself defines likelihood terms and says analysts' confidence rests on "quantity and quality of source material", but the high / moderate / low confidence definitions are not in it; I did not look in ICD 206 or the NIE footnotes.
- Reflexion paper body: the PDF was unreadable binary, so the terms "convergence", "divergence", "absence" are UNCONFIRMED.
- Kernel and Git SubmittingPatches tails, WP:V primary-source rules and the "verifiability, not truth" phrase, Python FAQ tail: summarised only, not used.
- Commit messages: first ~60 lines of three; long ones in Chromium not opened. No "day in the life" trace beyond rustc-dev-guide. No post-mortem or Chesterton's-fence primary source was opened.
- Not measured: how often real commit messages state a why (the quick look in item 6 assumes many do not).
