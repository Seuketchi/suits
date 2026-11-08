# What louis copies: real review comments and money rules, not a bully

Date: 2026-11-06. VERIFIED = the sentence or fact was on a page fetched in this session (URL given). The pages were read through separate fetch sessions, which returned exact sentences; the PR threads I pulled myself with `gh api`. UNCONFIRMED = a summary only, my inference, or not read.

## What the real ones do

| Kind | Artifact | What it does | What louis should copy |
| --- | --- | --- | --- |
| Review standard | [Google: how to write comments](https://google.github.io/eng-practices/review/reviewer/comments.html) | Names `Nit:`, `Optional`/`Consider`, `FYI` as severity labels | A label on every comment; a nit is still "technically should do" |
| Review standard | [Google: the standard](https://google.github.io/eng-practices/review/reviewer/standard.html) | Approve when code health improves, even if not perfect; facts beat taste; consensus, then escalate | Severity ceiling by evidence; escalation path for a dispute |
| Review standard | [Google: what to look for](https://google.github.io/eng-practices/review/reviewer/looking-for.html) | Style not in the guide gets `Nit:`; pre-existing mess gets a bug and a TODO | Do not block on taste; old problems are not this diff's |
| Review standard | [Google: pushback](https://google.github.io/eng-practices/review/reviewer/pushback.html) | Reviewer first checks whether the developer is right; "clean up later" refused if the CL adds complexity | The "is it true" step as a real step; the follow-up rule |
| Review standard | [Google: speed](https://google.github.io/eng-practices/review/reviewer/speed.html) | One business day maximum; "LGTM with comments" allowed if the reviewer says which case applies | A third verdict state |
| Review standard | [Google: navigate](https://google.github.io/eng-practices/review/reviewer/navigate.html) | Ask "does this change make sense", send design comments at once | Send design BLOCKERs before finishing the pass |
| Review standard | [Google: emergencies](https://google.github.io/eng-practices/review/emergencies.html) | Emergency = small, launch-saving or production-bug fix; fuller review after | An explicit, narrow exception, with the fuller review owed |
| Label scheme | [Conventional Comments](https://conventionalcomments.org/) | `<label> [decorations]: <subject>`; labels praise/nitpick/suggestion/issue/todo/question/thought/chore/note; decorations `(blocking)`, `(non-blocking)`, `(if-minor)` | Label and blocking are two fields; `question` for an unproven worry |
| Patch rules | [Kernel: submitting patches](https://docs.kernel.org/process/submitting-patches.html) | Defines Reviewed-by, Acked-by, Tested-by; reviewer's statement of oversight | What a "pass" certifies, and what it does not |
| Patch rules | [Kernel: follow-through](https://docs.kernel.org/process/6.Followthrough.html) | Author answers every comment; need not agree; polite reasoned disagreement | Replies and a disputed path |
| Patch rules | [Kernel: posting](https://docs.kernel.org/process/5.Posting.html) | Tag list; tags need the person's permission | Tags are statements by a named person (no new copy) |
| Project norm | [rustc-dev-guide: PR lifecycle](https://rustc-dev-guide.rust-lang.org/pr-lifecycle.html) | `r+` approves; `r=me after fixing` approves with trivial fixes; no severity vocabulary | Approval with conditions exists in real teams |
| Project norm | [std-dev-guide: reviewing](https://std-dev-guide.rust-lang.org/team/reviewing.html) | `r+` only if confident of no breakage, no perf regression, no unreviewed API change | A pass is a list of things confirmed |
| Project norm | [CPython devguide: PR lifecycle](https://devguide.python.org/getting-started/pull-request-lifecycle/) | No "approve" label; tests and green CI required | Tests are part of done |
| Project norm | [Go: contribute](https://go.dev/doc/contribute) | Code-Review +1 (minor changes wanted) vs +2 (approved); Hold +1 blocks; every comment gets a reply | Reply to every ruling |
| Project norm | [Kubernetes: pull requests](https://www.kubernetes.dev/docs/guide/pull-requests/) and [review guidelines](https://github.com/kubernetes/community/blob/master/contributors/guide/review-guidelines.md) | Hold labels block merge; architecture before nits | Design before detail |
| Real PR thread | [cpython#103764](https://github.com/python/cpython/pull/103764#discussion_r1178544975) | Reviewer opens with `nit:` and a question; later "separate PR" request | Nits are cheap to apply in place |
| Real PR thread | [rust#90630](https://github.com/rust-lang/rust/pull/90630#discussion_r774228026) | `Nit:` on a loop variable; scope split to a follow-up PR | Scope creep goes to a separate PR |
| Real PR thread | [kubernetes#91824](https://github.com/kubernetes/kubernetes/pull/91824#discussion_r512157916) | Maintainer pushes comments to follow-ups near merge | SHOULD FIX to follow-up is normal late |
| Real PR thread | [kubernetes#125488](https://github.com/kubernetes/kubernetes/pull/125488#discussion_r1671349048) | Terse `nit:` / "minor point" labels from two maintainers | One-line label, no ceremony |
| Real PR thread | [cpython#95749](https://github.com/python/cpython/pull/95749#discussion_r945252337) | Reviewer flags an optional point as the author's call | An "optional" is a stated state |
| Money | [Fowler: Money](https://martinfowler.com/eaaCatalog/money.html) | A Money type carries currency; rounding to the smallest unit loses pennies | Currency with amount; remainders accounted |
| Money | [Python: floating point](https://docs.python.org/3/tutorial/floatingpoint.html) | Binary floats cannot hold most decimals; errors accumulate | No float money; no float equality |
| Money | [Python: decimal](https://docs.python.org/3/library/decimal.html) | Context rounding applies to arithmetic only; `Decimal(float)` is exact binary; `round(x)` ignores context | Build from strings; name the rounding site |
| Money | [Java RoundingMode](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/math/RoundingMode.html) and [BigDecimal](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/math/BigDecimal.html) | Eight modes; HALF_UP vs HALF_EVEN differ on ties; `divide` needs scale and mode | Mode named at every division |
| Money | [Stripe: currencies](https://docs.stripe.com/currencies) | Amounts in minor units; zero-decimal currencies; per-currency minimums; remainders go to customer balance | Exponent from a table; limits in the settlement currency |
| Money | [Stripe: idempotent requests](https://docs.stripe.com/api/idempotent_requests) | Key on each money write; same key + different params errors | Idempotency item |
| Money | [Brandur: idempotency keys](https://brandur.org/idempotency-keys) | Unique key per user, locked while running, indeterminate errors not blindly retried | Retry-safety checks |
| Money | [Modern Treasury: accounting for developers](https://www.moderntreasury.com/journal/accounting-for-developers-part-i) and [Square Books](https://developer.squareup.com/blog/books-an-immutable-double-entry-accounting-database-service/) | Two or more entries per transaction that net out; append-only ledger | Zero-sum and no-update checks (vendor blogs, not standards) |
| Money | [SIX: ISO 4217 lists](https://www.six-group.com/en/products-services/financial-information/market-reference-data/data-standards.html) | Maintenance agency; lists carry a Minor Unit and change by dated amendments | Read the exponent from the list; version it |

## What is dropped, and the check that holds it

| Pattern | Why it is out | Check for a node test |
| --- | --- | --- |
| An unlabelled review comment | Real teams label severity; unlabelled reads as mandatory | Every comment line matches `^(BLOCKER|SHOULD FIX|SUGGESTION), (verified|outdated|disputed):` |
| A BLOCKER or SHOULD FIX with no cited rule | Taste is not a block (Google) | Those lines contain `\S+:\d+` and a rule or spec reference |
| "SUGGESTION never fixed in the round" | Stricter than any source read; wastes one-line fixes | Hand over: each SUGGESTION has a disposition `applied` or `follow-up #\d+` |
| A bare "follow-up list" with no issue | The "clean up later" sink | Each follow-up line has an issue number |
| A pass that says only "passes" | Certifies nothing | Hand over has `Checked:` and `Not checked:` lines |
| A done test line with no check | Cannot be tested | Each `Dn` line has `Check:` and `Expect:` |
| A money line with no currency or number | Unverifiable | Money `Dn` lines match a three-letter currency code and a digit |
| A disputed ruling with no reply or next step | Stalls the PR (Google: do not let it sit) | `disputed` lines contain `author:` and `louis:` |
| "Three failed rounds" with no count | Cannot tell when to hand off | Log carries `round N`; N=3 with an open BLOCKER requires `harvey` in the hand over |
| A float used as an amount in the diff | Item 12a | Not checkable by louis's skill text; checkable by a grep on the diff for `double`/`float` near amount names (project-specific) |
| Persona voice inside a written comment | Rule 7 (plain register) | Not checkable beyond a banned-phrase list |
| Style preference ruled as a block | Google | Not checkable; held by the citation rule above |

## Not seen

- Real Linux kernel review threads (lore.kernel.org) and Go Gerrit threads: not opened.
- Only five public PR threads, and only the first 220 characters of each review comment: a thin sample of real severity marking. In them no one used "blocking"; blocking shows as unresolved discussion. Rust and Python guides define no severity words at all.
- Kubernetes `/lgtm` and `/approve` mechanics: the tail of both pages (about 14k characters) came back summarised, not verbatim. Kernel submitting-patches tail (about 9.6k characters) the same.
- Python decimal FAQ tail, Java BigDecimal tail (equals/compareTo/setScale): summarised. Stripe's zero-decimal list items did not appear in the page text.
- GitHub's "outdated" marker, Fowler's other accounting patterns, ISO's own site (SIX read instead), Conventional Comments' repository, IIA and Scrum Guide pages from the earlier draft: not read; those claims stay UNCONFIRMED.
- No primary standard for double-entry as a code invariant: only two vendor blogs (Square, Modern Treasury).
- Nothing opened on supervising builders or the three-round hand-off beyond Google/Go/Rust dispute paths; the three-round count has no source.
