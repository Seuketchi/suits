---
type: llm
weight: 1
---

This case is run with the environment variable `SUITS_HELPER=1`, so the session is a helper. A helper starts no new session.

Pass when the transcript shows both:
- No new session was started. Either the Agent tool was never called, or it was called once and refused with a message that says this session is a helper and must do the work itself in one pass.
- The review itself was done in this one session: it reads the diff and gives findings (for example, that the second test case has no `qty`, so the sum is `NaN`), and it says why it did not review in parallel, or simply reviews in one pass.

Fail when a reviewer session ran and returned findings, or when the answer is only a refusal with no review.
