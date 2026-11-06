# Self-test: three drafts checked against the skill's rules and its tells check

Run on 2026-11-06 with made-up inputs. Each draft was written by following [SKILL.md](../../../skills/characters/donna/email/EMAIL.md), then put through step 4 (the rules) and step 5 (the scan, shape table and length check in [TELLS.md](../../../skills/characters/donna/email/TELLS.md)). Word counts run from the greeting to `Regards,`, as the skill counts them (`sed -n '/^Dear/,/^Regards,/p' file | wc -w`). The research behind the tells is in `notes/email-not-ai-rrl.md` in the asenso repository.

The attachment in draft A was a real 14-page PDF, read with `pdfinfo`.

## What the check catches: a first draft of A

Written the way an unchecked draft usually comes out, for the same input as A:

> **Subject:** Submission of Chapter 1 Requirement
>
> Dear Professor Villanueva,
>
> I hope this email finds you well. I am writing to submit my Chapter 1 requirement for Software Engineering. Please find attached the document, which is comprehensive, well-organized, and thoroughly researched — I look forward to your valuable feedback. Please do not hesitate to contact me if you have any questions. Thank you for your time and consideration!

The scan printed 11 hits: `hope this`, `finds you`, `Please find`, `comprehensive`, the em dash, `look forward`, `valuable`, `hesitate`, `any questions`, `Thank you for your` and `!`. The shape table adds: a list of three adjectives for effect, praise the draft cannot back, a closing line that offers help, no deadline, no ask with a date, and a first line that is not the point. It fails. Draft A below is the rewrite.

## A. Student submitting a requirement to a teacher (pattern 1)

Input: Mika Santos, Section BSIT-2B, submits the Chapter 1 requirement for Software Engineering to Prof. Villanueva. It is due on 8 November. The file is a 14-page PDF. Mika wants to know the file opens, in time to resend.

> **Subject:** BSIT-2B Software Engineering: Chapter 1 requirement
>
> Dear Prof. Villanueva,
>
> Attached is my Chapter 1 requirement for Software Engineering (PDF, 14 pages), for the 8 November deadline. Please confirm by 7 November that the file opens. If it does not, I can resend it before the deadline.
>
> Regards,
> Mika Santos, student, Section BSIT-2B

## B. Follow-up to a supplier (pattern 3)

Input: Rina Lopez, Operations Manager, Brightway Clinic, asked Ms. Tan for a revised quote for two oxygen concentrators on 2 November and has no answer. The order must go in by 13 November so the units arrive before the new wing opens on 1 December. She wants the quote by 10 November and a short reply with the unit price is enough.

> **Subject:** Re: Revised quote for oxygen concentrators
>
> Dear Ms. Tan,
>
> On 2 November I asked for a revised quote for two oxygen concentrators, and I do not have it yet. We must order by 13 November for the units to arrive before the new wing opens on 1 December. Please send the quote by 10 November. A short reply with the unit price is enough.
>
> Regards,
> Rina Lopez, Operations Manager, Brightway Clinic

## C. Reply to a colleague (pattern 5)

Input: Ben, a colleague Rina writes to by first name, asked whether the vaccine delivery can move to Friday. It can: Friday 14 November, between 8:00 and 12:00. The vendor needs confirmation by Wednesday 12 November, and Rina books it once Ben says yes.

> **Subject:** Re: Can the vaccine delivery move to Friday?
>
> Dear Ben,
>
> Yes, we can move the vaccine delivery to Friday 14 November, between 8:00 and 12:00. The vendor needs our confirmation by Wednesday 12 November. Please reply with a yes by then and I'll book it.
>
> Regards,
> Rina Lopez, Operations Manager, Brightway Clinic

## Checks

| Check | A | B | C |
|---|---|---|---|
| Words, greeting to `Regards,` (aim 50 to 80, cap 125) | 41 | 59 | 38 |
| Subject present, 3 to 8 words | 6 | 6 | 8 |
| First line is the point | attachment named and its purpose | what was asked and that it has not come | the answer, yes |
| One ask, with a date | confirm the file opens, by 7 November | send the quote, by 10 November | reply yes, by 12 November |
| Facts match source | 14 pages matches `pdfinfo`; dates match input | dates and item match input | dates and times match input |
| Nothing invented | yes | yes | yes |
| Tells scan (TELLS.md step 1) | prints nothing | prints nothing | prints nothing |
| Sentence lengths in words (fail above 25, or 3 within 2 words) | 17, 9, 11 | 20, 19, 7, 9 | 15, 9, 11 |
| Shapes (three-part list, repeating last line, hedge stack, same thing under two names) | none | none | none |
| Decoration (em dash, bold, bullets, emoji, `!`, curly quotes) | none | none | none |

## Re-check of earlier work

- The three drafts from the first self-test (cover note, escalation, saying no) were put through the scan and the length check again. The scan printed nothing; sentence lengths were 7, 9, 17, 8; 19, 14, 13; and 16, 12, 12. They pass unchanged.
- All 11 examples in [PATTERNS.md](../../../skills/characters/donna/email/PATTERNS.md) were put through the same checks. The scan printed nothing for any of them. Four were reworked for the shape and voice rules: pattern 3 (the opener "I am following up on" became the fact it stood for), patterns 4 and 10 (a semicolon each became two sentences), and patterns 3, 5 and 10 (a contraction where the reader is a working contact). Every pattern now also names the tell its kind most often picks up.

## Result

All three pass, and the naive draft of A fails. A and C sit below the 50-word aim (41 and 38), which the rule allows when the ask and its date are both present; they are, and the inputs held no further fact the reader needs. What the check does not prove: that a reader will take the email as human. It removes the named tells and keeps the facts; it is not a detector test, and no detector was run.
