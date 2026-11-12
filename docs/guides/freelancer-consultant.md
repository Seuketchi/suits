# Suits for a solo freelancer or consultant

Hand your paperwork to donna, your pricing and negotiation to harvey, and your client updates to jessica. Everything is a draft you send yourself.

## Who it is for

You run the whole business alone: the proposals, the emails, the follow-ups and the delivery. Nobody checks your numbers or your wording, and nobody remembers what you are waiting on.

## The jobs

| Job | Who takes it | What you type | What you get back |
| --- | --- | --- | --- |
| Write a proposal, contract draft or letter | donna | `/suits:donna Draft a one-page proposal for a three-month website audit, fixed fee.` | A PDF draft and its full path; a legal document carries a review notice and an empty notary block |
| Answer a client email | donna | `/suits:donna Reply to the client who wants a discount on the second phase.` | A plain-text email draft, never sent |
| Prepare a negotiation or a pitch | harvey, with `/suits:negotiation-prep` or `/suits:pitching` | `/suits:harvey Prepare my rate negotiation. The client's budget is fixed.` | Five rows: interests, alternatives, walk-away point and authority; or a pitch structure for the audience |
| Keep clients informed and track what you wait on | jessica, with `/suits:status-report`; donna keeps the tickler | `/suits:jessica One-page status for the client on the audit.` | The state first, a decision line for the client, and a tickler of dated follow-ups from donna |

Check any amount before you send it: `/suits:louis Check the fees and rounding in this invoice calculation.` He returns a verdict first and answers ten money items.

## What comes back

Donna's first line says what was made, where it is, and what is still yours to do. Harvey's first line is the call. You approve, edit and send; nothing leaves without you.

## Worked example

A client asks for a discount after you have quoted.

1. You type: `/suits:harvey The client wants ten percent off phase two. My floor is the quote minus five. Prepare me.`
2. He says in one line that he is calling `/suits:negotiation-prep`, because a negotiation with another party is the task.
3. He returns five rows. The walk-away point is written with the objective criterion behind it, such as your day rate for comparable work.
4. You type: `/suits:donna Draft the reply offering five percent for payment in 14 days.` She writes the email and does not send it.
5. You type: `/suits:donna Add a tickler for their answer, due Friday.` She keeps the row and drafts the nudge if Friday passes.

## Related

- [donna](../characters/donna.md), [harvey](../characters/harvey.md), [jessica](../characters/jessica.md), [louis](../characters/louis.md)
- [negotiation-prep](../tools/negotiation-prep.md), [status-report](../tools/status-report.md), [money-check](../tools/money-check.md)
