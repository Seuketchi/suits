# What the associates copy: real patches and commits, not a promise about test order

Research of 6 Nov 2026. VERIFIED = read on the page in this session (URL given). UNCONFIRMED = not read. Pages were fetched as HTML and converted to text; quotes are one sentence at most.

## What the real ones do

| Kind | Artifact | What it does | What the associates copy |
| --- | --- | --- | --- |
| Patch guide | [Linux kernel, Submitting patches](https://www.kernel.org/doc/html/latest/process/submitting-patches.html) | Message opens with the problem and its user-visible impact, then the change; "Fixes:" tag names the commit that introduced the bug; every patch in a series must build, because of bisect | problem-first message, one problem per commit, each commit leaves the checks green, name the cause commit |
| Patch guide | [Git, SubmittingPatches](https://git-scm.com/docs/SubmittingPatches) | Asks for a test with every bug fix, the whole suite after any change, and a log that gives the why, the alternatives dropped, and what the change leaves out | whole suite before hand-over; message states what was not done and why |
| Contribution guide | [Go, Contribution guide](https://go.dev/doc/contribute) | First line "area: summary" that completes "This change modifies Go to ___"; body wrapped near 72; "Fixes #n" when done, "Updates #n" when partial; a maintainer submits, not the author | done vs partial is written down; the author does not integrate |
| Contribution guide | [Rust compiler dev guide, Contribution procedures](https://rustc-dev-guide.rust-lang.org/contributing.html) | Index page only: sends routine changes to PR-lifecycle pages | nothing yet (the linked pages were not read) |
| Message spec | [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) | `type(scope): description`, body, footers; types beyond fix/feat are not mandated | one optional form; Git, Go and the kernel use "area: summary" instead, so follow the repo's own log |
| Review guide | [Google eng-practices, Small CLs](https://google.github.io/eng-practices/review/developer/small-cls.html) | Size = one self-contained change, with its tests; too small is better than too large | test and code travel together; split by change, not by file count |
| Review guide | [Google eng-practices, CL descriptions](https://google.github.io/eng-practices/review/developer/cl-descriptions.html) | Description says what and why; first line stands alone in history | hand-over first line is a verdict that stands alone |
| Real commit | [git/git 13a5a9f0fd, "rebase: fix GIT_REFLOG_ACTION regression"](https://github.com/git/git/commit/13a5a9f0fdcf36270dcc2dcb7752c281bbea06f1) | Message gives cause, fix, a regression test "with set and unset", and a known bug left for later; diff = builtin/rebase.c + t/t3406-rebase-message.sh | fix and test in one commit; say what was left alone |
| Real commit | [git/git 7700ab087b, "rebase --apply: fix reflog"](https://github.com/git/git/commit/7700ab087b82f71d19134141045b95063e407344) | Names the cause (a message passed as the wrong member), the fix, notes what existing tests already cover; 3 source files + 1 test file | cause named in one sentence; reuse of existing coverage is stated |
| Real commit | [golang/go 9a9a007bb7, "encoding/json: fix Indent..."](https://github.com/golang/go/commit/9a9a007bb7bff8e41ed95d3cccb2273a705c2718) | Cause in prose ("The rewrite ran in a defer"), the move that fixes it, "Fixes #81547"; diff = source + two test files | a bug commit reads cause, then fix, then issue link |
| Ownership | [GitHub, About code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) | CODEOWNERS routes review to owners of the files a PR touches; it is not an edit lock | ownership is a list of paths that a diff can be checked against |
| Branching | [Trunk Based Development, short-lived branches](https://trunkbaseddevelopment.com/short-lived-feature-branches/) | Branch lasts "a couple of days"; developer count stays at one (two if pairing); bug fixes count too | one associate per branch; keep branches short |
| TDD text | [Beck, Canon TDD](https://tidyfirst.substack.com/p/canon-tdd) | Primary text. List scenarios, then ONE test, make it pass, optional refactor; lists named mistakes | see below |
| Stop rule | [Toyota, Jidoka](https://www.toyota-global.com/company/vision_philosophy/toyota_production_system/jidoka.html) | Stop on an abnormality; the andon lets workers "call the person in charge" | stop-and-call, not a count |
| Incident | [Google SRE book, Managing incidents](https://sre.google/sre-book/managing-incidents/) | One group modifies the system; handoff is explicit and acknowledged | explicit hand-over, one modifier |
| Study | [Fucci et al., Dissection of the TDD process](https://arxiv.org/abs/1611.05994) | 82 data points, 39 professionals; abstract read | order is not what matters, step size is |
| Study | [Santos et al., Family of Experiments on TDD](https://arxiv.org/abs/2011.11942) | 12 experiments, meta-analysed; abstract read | benefit is not general; depends on task and people |

## What is dropped, and the check that holds it

| Pattern | Why | Check |
| --- | --- | --- |
| Deleting an assertion to turn a test green | Beck: "Mistake: delete assertions so the test pretends to pass." | node test on a diff: a test file with removed `assert`/`expect` lines and none added fails. Heuristic only |
| Expected value copied from the code's own output | Beck names it a mistake; `/tdd` calls it tautological | not checkable |
| All tests written first, then all code | Beck: speculative tests cause rework | not checkable; the done test from jessica is one test |
| Bug-fix commit with no test file in the same commit | Git: "make sure you have new tests that break if somebody else breaks" what you fixed | node test over `git diff --name-only <base>..HEAD`: a `fix` commit touching source and no path matching `test` fails. Needs a "no behaviour" opt-out |
| Commit that mixes two changes | kernel: one problem per patch | not checkable; proxy: commit touches paths from more than one ticket's owned list |
| Edit outside the ticket's owned files | rule 3 | node test: `git diff --name-only` is a subset of the owned-file list in the ticket. Checkable once the list is a fixture |
| Message with no cause on a bug fix | kernel, Git, the three commits | node test on a message string: type is fix and the body is empty fails. Imperative mood: not checkable |
| First line too long, no blank line after it | Git: 50 soft limit; Go: wrap near 72 | node test: line 1 is 72 characters or fewer, line 2 is empty, body lines are 72 or fewer |
| Persona in a commit or PR | existing rule in SKILL.md | already testable: the Voice test; extend it to scan the sample commit message |
| Hand-over with no command in its first line | rule 8 | node test on the Hand over sample: the first line contains a backticked command and a result |
| Fourth fix attempt | rule 4 | not checkable; a ticket log could count `fix` commits referencing one ticket |

The existing test (`test/characters/characters.test.mjs`) reads only SKILL.md: it checks sections, tool names, the sample line and the voice. The checks above on diffs and messages need fixtures (a sample diff, a sample message); adding the message and hand-over ones is cheap, the diff ones need a ticket format.

## Not seen

- Rafique and Misic meta-analysis (IEEE TSE, 2013, DOI 10.1109/TSE.2012.28): publisher page returned no abstract and the open-access copy is closed. The claim "mixed evidence" rests on the two abstracts above only. UNCONFIRMED for the meta-analysis itself.
- Fucci et al. blind-analysis replication (ESEM 2016), Karac and Turhan "What do we (really) know about TDD", Munir et al. review: not found on arXiv; Semantic Scholar rate-limited. Not read.
- Linux patch threads (lore.kernel.org) and Git list threads: no thread opened; only the process documents and committed results. Whether a fix's test failed first is not stated in any of the three commit messages.
- Rust PR-lifecycle pages: only the index was read.
- "Make the test fail for the right reason": no external primary source found; the only text is local (`diagnosing-bugs` Phase 5). UNCONFIRMED externally.
- Any study of debugging by guessing, and any source for "three" failed fixes: not found. Rules 4, 6 (conflict to author first) and 7 (prototype thrown away) have no opened support.
- Google SRE and Toyota pages describe incidents and factory lines, not code fixes; used for the stop-and-call idea only.
- Rule 5 against pushing a CI branch (Git's "push to a fork" line): read, not resolved; owner's call.
