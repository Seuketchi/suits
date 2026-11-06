# Email

The steps for an email draft, from `/donna`.

Draft a short plain-text email the user pastes into their own mail client. The user sends it; you never do. Chat messages and the design of HTML or system-sent email are other jobs.

## Steps

1. **Collect the facts.** Gather the recipient, what the email is for, the one thing needed back and by when, and the attachment if there is one. Done when every fact you will write has a source (the user's words or a file you looked at) and every gap is a placeholder.
   - Write a gap as a clear placeholder: `[recipient's name]`, `[date]`, `[amount]`. Invent no recipient, name, date, number or fact.
   - Ask the user only for a gap that changes the email, usually the ask. Placeholder the rest and carry on.
   - For an attachment, look at the real file: it exists, and its name, type and page count match what the email will say.
2. **Pick the pattern.** Read [PATTERNS.md](PATTERNS.md) and take the closest kind. A kind not listed (thanks, invitation, complaint) starts from the closest one and follows the rules below. Done when you can say the email's one ask in a sentence; if you need two, write two emails.
3. **Draft** to the rules below, including *Sounds like a person*. Save it to the file named under Deliver as you go.
4. **Check** the draft against every rule and recount the words. Done when each rule holds. Fix the draft, never the count.
5. **Remove the tells.** Read [TELLS.md](TELLS.md), run its scan on the draft file and go through its shape table. Done when the scan prints nothing, no shape is left and the length check passes. Rewrite a hit with the real fact; a synonym keeps the empty sentence. Then recount the words and recheck the ask, since a rewrite can break either.
6. **Deliver** (below).

## Rules

- **English, plain words.** Pick the short word. Name a thing by what it is to the reader, never by an internal tool, code name or team shorthand. A reference number the reader already uses is fine.
- **Lead with the point.** Sentence 1 is the bottom line: the answer, the decision wanted, or "Attached is X, for Y". Context comes after, only if the reader needs it to act.
- **One ask, with a date.** One thing the reader must do, by a written date. A status update or an answer with nothing to do says "No action needed."
- **Length.** Count from the greeting to the closing word, signature block left out. Aim for 50 to 80 words, cap 125 unless the user asks for more. Under 50, check that the ask and its date are both there. Past 125, the detail belongs in an attachment.
- **Subject.** Always present. 3 to 8 words. Name the thing and its reference number when there is one: "CR-0142 limit change: please approve". Add an action word only when it clarifies. A reply keeps the thread's subject.
- **Attachment email is brief.** Say what is attached in one sentence (name, type, pages, what it is for) and the one thing needed. The attachment carries the detail: do not restate its contents or repeat an ask it already makes. One attachment per email.
- **Dates in full.** "14 November", with the weekday when proposing times. Never "tomorrow", "EOW" or "as discussed" with no date.
- **Tone.** Polite, plain, brisk, not terse. Greet by title and surname ("Dear Ms. Reyes,") unless the user has used a first name with this person. Close "Regards," and the sender's name, role and company, as placeholders when unknown.
- **Leave out** "I hope this finds you well", background story, praise, thanks or apology in advance, exclamation marks, emoji, bold. The apology pattern may apologise, once.
- **Facts match their source.** Every date, file name, page count, reference number and amount agrees with what the user gave or the file shows.

## Sounds like a person

The aim: a busy colleague wrote this in two minutes, to this one reader. An email that reads as generated costs the sender the reader's trust before the ask is read. Formal is not the same as generated: a title-and-surname greeting and "Regards," stay.

- **Say it as you would across a desk.** If you would not say the sentence to this person, rewrite it.
- **Plain verb, not the formal one.** *use*, *start*, *help*, *send*, *check*, *ask*; never *utilise*, *initiate*, *facilitate*, *submit for your perusal*.
- **Be specific.** Names, dates, amounts, file names. If swapping in another recipient leaves a sentence unchanged, it carries nothing: add the fact or cut it.
- **Let sentences differ in length.** Keep every one at 25 words or fewer, and put a short one beside a longer one. Equal-length sentences read as generated.
- **List only what exists.** Three slots, two options or four files are fine when they are real. Never pad a list to three, and never write "clear, concise and actionable".
- **Stop when the ask is made.** No closing sentence that restates the email, offers help or thanks in advance. No "Let me know if you have any questions".
- **Hedge once, where you are unsure.** One soft word at the real doubt. No "I just wanted to quickly check if perhaps".
- **No decoration.** No em dash, bold, bullets, emoji or exclamation marks. A full stop, a colon or a comma does the job. Use straight quotes.
- **Name a thing one way.** If it is "the report", it stays "the report", not "the document" two lines later.
- **Contractions follow the voice.** "I'll" and "we've" are fine to a colleague you write to often. Use "I will" and "we have" to a bank, a regulator or someone senior you have not written to before.

## Deliver

1. Make sure the draft file `${TMPDIR:-/tmp}/email-<short-slug>.txt` holds the final text: a `Subject:` line, a blank line, then greeting, body, sign-off.
2. When a clipboard tool exists (`wl-copy`, `xclip`, `pbcopy`), copy the file with a process that outlives the shell, so the clipboard still holds it after the command returns. On Wayland: `setsid nohup wl-copy < "$f" >/dev/null 2>&1 & disown`.
3. Reply with the draft as text ready to paste, then: the file path, whether it was copied, the attachment to add (full path), the placeholders still to fill, and one check line: `N words, 1 ask, first line answers, attachment named, tells scan clean`.
4. Stop. Sending is the user's call.
