# donna

## What it does

`donna` is the front desk and your secretary: one skill. A request reaches her first. She names the one owner, writes the request in the action log, and reports when its state changes. For you she also drafts, lays out, tracks and reminds, and never sends, signs or commits you to anything. You decide and press send.

She does two kinds of work. **Papers**: a finished, designed PDF (a proposal, report, guide, spec, memo, letter, sign-off checklist, form, assignment, or a company or legal document such as a board resolution, an NDA or a special power of attorney), a filled-in form, a professional email, a slide deck. **Tracking**: a one-page brief before a meeting, minutes and an action log after it, a tickler of what you are waiting on, a morning and a Friday brief, and a records register with a retention check.

She works in two registers. To you she is confident, dry and a step ahead: she has already noticed, gives the verdict first and never fawns. The documents and emails she writes for other people are plain and professional, with none of that voice in them.

## When to reach for it

Type `/suits:donna`, or ask for any of the above and she is called.

| The job | Where it is |
| --- | --- |
| A PDF or document of any kind in [KINDS.md](../../skills/characters/donna/docs/KINDS.md), or to fill, edit, combine, split or redact one | [docs/DOCS.md](../../skills/characters/donna/docs/DOCS.md) |
| A company or legal document, with its hard rules and its 19 kinds | [docs/LEGAL.md](../../skills/characters/donna/docs/LEGAL.md) |
| An email to paste into your own mail client | [email/EMAIL.md](../../skills/characters/donna/email/EMAIL.md) |
| A meeting brief, minutes and action log, tickler, daily or weekly brief, records register | [secretary/](../../skills/characters/donna/secretary/) |
| A deck or presentation, once the pitch structure is set | the [slides](../tools/slides.md) tool |

## At the front desk

- **One owner.** She names the one character accountable for the request and says who it is. Never two. An unrelated ask is a new request, with its own owner and its own log line.
- **Two logs, one writer.** The action log (who was asked what, who owns it, its state, its budget, the next owner) and the decision log (what was decided, by whom, why, when) are hers alone. An entry is added, never rewritten.
- **A packet only when it pays.** Work that goes to another character or spans more than one ticket gets a hand-off packet. A small ask gets one line and skips the other characters.
- **Reports on change.** She reports when a request's state changes, then once at the end. A request that passes its budget stops and asks.

She calls a tool only when the task matches its trigger: `/suits:pr` for a pull request body, `/suits:handoff` when a session ends, `/suits:morning-brief` and `/suits:scrum` for your own briefs, `/suits:slides` for a deck. The default is not to call.

## Three styles, and your own

With no example and no design system, documents use **Letterhead**: IBM Plex Sans, the sender's mark and name at the left and the office at the right over one accent rule, labelled rows between thin rules, a footer with the document id and page x of y. **Academic serif** (Source Serif 4, small caps, section numbers hanging in the margin) and **Engineering** (a ruled title block with a document number and revision, Q1, Q2 with boxed answer areas) are there when you ask or the document suits them. All three read the same colour and font settings, so a project's own design tokens restyle any of them and the letterhead takes the project's logo, name and address. The project's design system always wins. The fonts are embedded and open-licensed, so nothing is fetched at print time.

## Documents: the loop it keeps

Source, build, measure, look. The source file is the only thing edited; `bak/` holds a timestamped copy before each rebuild; `scripts/review.sh` renders every page to a PNG and runs the file check and the redaction audit; `scripts/check.sh` measures the design rules and reads the claims ledger. Donna then reads each PNG for what a script cannot see: overflow, a heading stranded at a page foot, a near-empty page, an ID split across two lines.

## Company and legal documents

Donna drafts the skeleton and the boilerplate of 19 kinds, Philippines first, from a research note that marks each rule VERIFIED (a statute or rule she read) or UNCONFIRMED (practice, or a source that could not be opened). The unconfirmed ones stay marked in the draft, on a last "Open points for counsel" page. Her hard rules: she never gives legal advice, never invents a statute, never fills a notary's block as if it were notarised (it stays empty under "To be completed by the notary public"), and every legal draft carries a review notice on page 1.

## Secretary work

- **Meeting brief:** one page before a meeting. Purpose, who is there and why, the agenda with times, what was decided last time, open actions with the overdue ones first, a line per pre-read.
- **Minutes and action log:** from your notes, minutes with the fields the Revised Corporation Code lists for a corporate meeting, and rows of Owner, Task, Due in one log that is never overwritten, only amended with dated notes.
- **Tickler:** what you are waiting on and what you promised, with dates. Each session she lists what is overdue and drafts the nudge. You send it.
- **Parked work:** when you say you are busy or still handling something, she logs it as parked on you with a resurface date. Nothing on it starts and she does not nag before that date. She raises it on the date, or earlier only when you ask.
- **Daily and weekly brief:** the morning one-pager and the Friday close.
- **Records register:** where each contract, approval and board paper lives, and whether it may go. She never invents a retention period: a person sets it.

## Working with harvey and jessica

`harvey` passes the pitch structure and donna builds the deck from it; a change to the structure goes back to him.

`jessica` is the project-management skill (plans, tickets, risks, status reports, go-live readiness). When your task needs a plan, a status report or go-live readiness, donna runs `/suits:jessica` and carries on with what comes back; when `jessica` has a report to lay out, an email to draft or something for your brief, she hands it to donna. Donna writes the action log and the decision log, `jessica` tracks from them, and neither calls the other twice for the same thing. `jessica` is not in the repo yet: this is the contract she will follow.

## Decks

For a pitch, `harvey` sets the structure with `/suits:pitching` and donna builds the deck from it with `/suits:slides`: one point a slide, the title states the claim, one slide to a page, speaker notes in the source and not in the PDF. She does not reorder or cut the structure. A number with no source is marked unverified on the slide. The deck goes through the same checks as a PDF, so a kicker, a card, a gradient or a stock opener fails it.

## Common questions

**Why no small coloured label above the title, or a grey line of facts joined by dots?**
Because none of the real documents opened for the research has one: it is a landing-page pattern, and the owner said it looks generated. A handout starts with a name line, a memo with labelled rows. [references](donna/references.md) lists what was opened and what each does instead.

**Why does a short document get a cover?**
It does not. A document that leaves the building (a client, a bank, a regulator) or runs past about 3 pages gets a cover. A shorter internal one, such as a memo or a one-page checklist, gets a title block. The recipe for each kind says which.

**Why did `check.sh` fail my document?**
It prints one FAIL per rule with the offending text: a prose line over 95 characters, a fourth heading level, a colour pair under 4.5:1, a figure with no numbered caption, a border or rounded corner on an image, an ask with no "why", a generated-looking trope (a tracked-uppercase kicker, a dot-separated header line, a hero title, a pill, a card, a shadow, a gradient outside the cover band), machine-sounding prose (a stock opener, "delve", "seamless", "robust", "leverage", an em dash used as a pause, an exclamation mark, three bare words in a row used three times, a closing sentence that repeats its section), an empty page, an unembedded font, a named file that does not exist, or a claim in the ledger whose source does not contain the words. Fix the source and rebuild. It cannot judge whether the page looks designed: that is still the looking.

**How are facts checked?**
Each claim, its source and the source's own words go in a `claims.md` ledger. For a local source `check.sh` finds the words in the file word for word. A length or a character count is not a check, and a claim that could not be checked is marked in the document or removed, never left to read as fact.

**Can it typeset equations?**
Yes, offline: write them in MathML and Chrome typesets and embeds the math font, so an assignment with real equations needs no CDN and no install. [KINDS.md](../../skills/characters/donna/docs/KINDS.md) has a recipe for assignments and worksheets: a header block, points per item, answer spaces sized for handwriting, a labelled graph, a rubric, and a fillable version.

**Does it handle a technical specification?**
Yes. The recipe for a reference or spec gives numbered requirements (R1, R2 …), code blocks, a state-diagram template, and a rule that a budget shows its formula and its inputs. The sample, a made-up ESP32 soil-moisture node, ran 6 pages with every fact about the chip checked word for word against Espressif's datasheet and ESP-IDF pages.

**Can the reader type into the PDF?**
Yes. The layout draws the blanks and boxes (a labelled rule, a ballot box character, a ruled space); `scripts/add-fields.py` then adds real fillable fields over them with `pdfcraft-cli`. Render the result and look: the positions are measured from the printed text.

**Why not draw a black box over what must be hidden?**
The text is still in the file under the box, and anyone can select or extract it. donna removes the text from the source, or uses pdfcraft's redaction, and `pdfcraft-cli audit` must report nothing found before the copy is called shareable.

**The form has no fields. Can it still be filled?**
Yes, two ways. Add fields with `form_add_field` when the recipient needs to type into it, or stamp the text at coordinates when you want a finished copy. Stamped text is not a field, and it is limited to Western European characters.

**Why does it not add a contents page to a short guide?**
Under about six pages it is padding. When one is wanted, Chrome cannot compute page numbers, so the build prints, measures where each heading landed, fills the numbers in and prints again.

**Will it upload or send anything?**
No, nothing: not a PDF, not an email, not a brief. It names the file, its page count, and offers to open it. Replacing a file on Google Drive can remove the comments on it, so it warns before that is even suggested.

**What does she do when she works alone?**
She starts no other session. A request for another character becomes a message to whoever sent the brief, in her hand-over format, naming the character it is for. She reads a pull request with `gh pr diff` or a commit with `git show`, and does the work of a tool herself in one pass instead of starting it somewhere else.

## It's working if

- The first thing she tells you is what she is matching (your example, your design system, or Letterhead).
- You can change a sentence in the source and get a new PDF with one command, and the old one is in `bak/`.
- A legal draft has the review notice on page 1, an empty notary block, and every unconfirmed point marked.
- A meeting brief fits one page and names what is overdue; minutes come with their actions in the log.
- A request has one named owner and one line in the action log before work starts.
- She skips the tools that do not apply: a typo goes to a builder without a plan, and a pull request body is the only thing that reaches `/suits:pr`.
- A deck follows the structure harvey gave her, and every number on it has a source or is marked unverified.
- Nothing was sent, signed or accepted for you.
- To you she is brief and a step ahead; in the documents for others there is no trace of her voice.

## Where it fits

`donna` is where a request starts and where it ends: the last step of any piece of work that ends in a document, and the keeper of what you promised and what you wait on. The team is listed in the [README](../../README.md).
