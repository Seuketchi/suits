# What harvey copies: real decision records, not a persona

Read 6 Nov 2026. VERIFIED = I read the sentence on the page named, in this session. Method: fetched each page and read the text; no page was opened as an image.

## What the real ones do

| Kind | Artifact | What it does | What harvey should copy |
| --- | --- | --- | --- |
| ADR essay | [Nygard, Documenting Architecture Decisions](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions) | The post is itself an ADR: Title, Context, Decision, Status, Consequences, one or two pages | Status and Consequences as fields; "We will..." active voice |
| ADR process | [AWS Prescriptive Guidance, ADR process](https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/adr-process.html) | States Proposed / Accepted / Rejected / Superseded; a rejected ADR carries its reason; accepted ones are never edited | Reasoned "no"; reversal = new record |
| ADR guide | [Azure Well-Architected, ADR](https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record) | Record only choices "difficult to reverse"; append-only log; confidence level; tradeoffs | Reversibility as the entry test; confidence field |
| ADR framework | [GOV.UK ADR framework](https://www.gov.uk/government/publications/architectural-decision-record-framework/architectural-decision-record-framework) | Four decision levels, each with who decides and when it escalates; fields incl. date, status, stakeholders consulted | A written escalation test instead of "a risk" |
| ADR template | [MADR template](https://raw.githubusercontent.com/adr/madr/main/template/adr-template.md) | decision-makers / consulted / informed; Considered Options; Consequences good and bad; Confirmation; More Information | "how will we confirm" and "when to revisit" fields |
| Real ADRs | Backstage [ADR013](https://raw.githubusercontent.com/backstage/backstage/master/docs/architecture-decisions/adr013-use-node-fetch.md), [ADR014](https://raw.githubusercontent.com/backstage/backstage/master/docs/architecture-decisions/adr014-use-fetch.md) | 013 is bannered "[superseded]" and points to 014; 014 Context names what changed (Node 20), Consequences name a breakage (msw tests) | Reversal names the old record and what changed; a real cost line |
| RFC process | [Rust RFCs README](https://raw.githubusercontent.com/rust-lang/rfcs/master/README.md) | Defines when a change needs the process; ends in one of three dispositions: merge, close or postpone | build / no / not now as three distinct outcomes |
| RFC template | [Rust RFC template](https://raw.githubusercontent.com/rust-lang/rfcs/master/0000-template.md) | Sections Drawbacks, Rationale and alternatives (incl. impact of not doing it), Unresolved questions in three buckets | Cost field; status quo as an option; open questions by when they resolve |
| A real RFC | [Rust RFC 2603](https://raw.githubusercontent.com/rust-lang/rfcs/master/text/2603-rust-symbol-name-mangling-v0.md) | Alternatives list starts with keeping the current scheme; an open question gets an UPDATE with a recommended resolution | Status quo first in "Beat" |
| Python process | [PEP 1](https://raw.githubusercontent.com/python/peps/main/peps/pep-0001.rst) | Required Rejected Ideas and Open Issues sections; Resolution header links the deciding post; accepted PEPs can still be reversed, but not after release | Rejected ideas kept so they are not re-argued; the door closes at release |
| A rejected PEP | [PEP 3103](https://raw.githubusercontent.com/python/peps/main/peps/pep-3103.rst) | Status Rejected; a two-sentence Rejection Notice by the project lead, at the top | A close is short and first |
| Shareholder letter | [Bezos 2016 letter](https://www.aboutamazon.com/news/company-news/2016-letter-to-shareholders) | Light process for reversible decisions; decide near 70% of the information; "disagree and commit" with a worked example of the boss doing it | Two-way test; speed rule; what a genuine disagreement is |
| Principles | [Amazon leadership principles](https://www.amazon.jobs/content/en/our-workplace/leadership-principles) | "Have Backbone; Disagree and Commit": challenge first, then commit wholly | Challenge is an obligation, not a courtesy |
| Decision rights | [Atlassian DACI](https://www.atlassian.com/team-playbook/plays/daci) | One approver; the template lists decision factors before options; options table with pros, cons, cost | One decider; factors before options |
| Decision rights | [Bain RAPID](https://www.bain.com/insights/rapid-tool-to-clarify-decision-accountability/) | Five roles; "Agree" holds legal or regulatory requirements; decider sits close to where it is implemented | A rule's owner must agree; push small calls down |
| Decision rights | [GitLab DRI](https://handbook.gitlab.com/handbook/people-group/directly-responsible-individuals/) | Lists the rare cases that need another approver; says when a DRI should stop arguing | The exception list; the time limit on disagreeing |
| Budget | Shape Up: [appetite](https://basecamp.com/shapeup/1.2-chapter-03), [no-gos](https://basecamp.com/shapeup/1.5-chapter-06), [betting table](https://basecamp.com/shapeup/2.2-chapter-08) | Budget is a number set first and the design fits it; no-gos listed; a bet caps the downside; no extension by default | Budget is a cap with unit; "smaller" names what is cut |
| Approval research | [DORA, streamlining change approval](https://dora.dev/capabilities/streamlining-change-approval/) | Peer review plus automation beats an external gate; segregation of duties is met by a non-author peer | Keep rule 8; harvey is not the peer reviewer |
| Review standard | [Google review standard](https://google.github.io/eng-practices/review/reviewer/standard.html) | Facts over preference; record a face-to-face result on the review; escalate, never let it sit | Log the disagreement; escalate without stalling |
| Negotiation prep | [PON preparation checklist](https://www.pon.harvard.edu/daily/negotiation-skills-daily/negotiation-preparation-checklist/), [principled negotiation](https://www.pon.harvard.edu/daily/negotiation-skills-daily/principled-negotiation-focus-interests-create-value/), [what is a BATNA](https://www.pon.harvard.edu/tag/batna/) | Interests ranked, BATNA, reservation and aspiration points, authority to commit, objective criteria | A five-field prep block for the negotiation case |

## What is dropped, and the check that holds it

Checks run on a decision line or log entry (labelled rows from item 1) or on SKILL.md itself.

| Pattern | Why | Check |
| --- | --- | --- |
| A decision with no alternative, or only an invented straw man | Rust and RFC 2603 start from the status quo | Regex: `^Beat: .*(status quo\|do nothing\|as is\|current)` (i) |
| A decision with no cost | Nygard and Azure: all consequences, tradeoffs | Regex: `^Cost: (?!none\b\|n/a\b).{8,}` (im) |
| Budget as a vague word ("small", "quick") | Shape Up: a number first | Regex: `^Budget: .*\b\d+ ?(min\|hours?\|days?\|tickets?\|files?)\b` |
| `not now` without a trigger | Rust: postponed because we can afford to wait, until when | If `^Call: not now` then require `^Revisit: .{5,}` |
| `no` without a reason | AWS: a rejection carries its reason | If `^Call: no\b` then require `^Why: .{10,}` |
| `Door: one-way` without agreement before work | Rule 3 | If `^Door: one-way` then require `^Agreed by: ` |
| `sound` verdict with nothing read | Rule 5; Google: facts overrule opinion | If `^Verdict: sound` then require a `file:line` or artifact ref: `\S+:\d+\|https?://` |
| `needs more` with no named gap or owner | AWS action points with assignees | If `^Verdict: needs more` then require `^Need: .+ (from\|by) \S+` |
| Disagreeing more than once on a thread | Rule 4; GitLab time limit | Count of `^Disagreed:` lines in one thread is at most 1; any `Disagreed:` requires a later `^Committed:` |
| Reversal that edits instead of superseding | AWS, Azure append-only | A reversal entry has `^Supersedes: ` and the old entry is unchanged (diff) |
| Verdict not on the first line | Owner's answer-shape rule | First line starts with `^(Build smaller\|Build\|Not now\|No\|Sound\|Not sound\|Needs more)\b` |
| Persona in a written record | Voice section, spec 8a item 19 | Not checkable beyond a banned-word list; owner's call which words |
| Reopening a settled call with no new facts | PEP 1 Rejected Ideas exist to stop this | Not checkable; the log's `Rejected:` lines let a reader see it |
| Success-rate statistics for a framework | The Atlassian DACI page quotes a consulting survey I could not trace | Not checkable; do not copy such figures into references.md |
| SKILL.md says harvey signs off everything | DORA | Test that SKILL.md contains no `approve every\|sign off every` outside a negation (low value) |

SKILL.md itself: add a node test that the "Decision line" section lists all seven labels, and that rule 2 contains "status quo".

## Not seen

- Bezos 2015 shareholder letter (the source of the "one-way door" wording): SEC returned 403, aboutamazon.com returned 404, the q4cdn PDF 404. The 2016 letter says "last year's letter" covers it. The one-way sentence is UNCONFIRMED; the two-way and reversible wording is VERIFIED in 2016. Not retried.
- Harvard PON pages read: checklist, principled negotiation, BATNA. Fetched but not read: ZOPA and BATNA-examples articles. *Getting to Yes* the book: not opened; its four elements are known here only through the PON summary.
- HBR premortem (Klein): paywall, teaser only. Not used.
- Real build-or-not or design-review memos from companies (Amazon PR/FAQ, internal RFCs): none found public, so the "build or not" artifacts here are the Rust RFC and PEP processes, which gate whether to build. UNCONFIRMED that private memos match.
- GitLab's value "disagree, commit, and disagree": not found in the values page I fetched, so UNCONFIRMED; only the DRI page wording is VERIFIED.
- The Atlassian DACI claim of a "25% higher success rate" is on the page but untraced; UNCONFIRMED.
- Bain "Great Decisions: Not a Solo Performance", Basecamp's pitch pages beyond those listed, DORA's remaining paragraph on the CAB's role: not read.
- No ADR set from a regulated company was opened; the regulated-change case rests on DORA's segregation-of-duties sentence only.
