# Writing rules for a document that asks, names and proves

Reference for the documents steps ([DOCS.md](DOCS.md), step 4). They come from real bank documents and apply to any reader who must act on what you made.

## Asks

- **Every ask states what to send or decide, and why.** "Send the signed form. We cannot start without it." Not "Please advise."
- **Never ask what we can find out ourselves.** Read the code, the config or the reader's own material first. Where only the reader knows, write a proposal ("We will use X. Accept, or tell us what to change.").
- **One ask, one reader, one date.** A second ask is a second row in the list, never a clause in the first.
- Use `.asks` and `.ask` with a `.what` and a `.why`; `check.sh` fails an ask with either missing.

## Files

- **Name the exact file the reader must open or return**, spelled as it is on disk, in a `.file`: `<span class="file">terms-guide-v1.pdf</span>`. Check that it exists (`check.sh --files <dir>`), and that the name in the email, the cover and the file system match.
- A file the reader must send back, and so does not exist yet, takes `class="file theirs"`: it looks the same and `check.sh` does not look for it.
- Name the page or section when the evidence is inside it.

## What we made, what is yours

Say it once, early, in a `.pair`: **What we made** (the things we built or wrote and answer for) beside **Yours** (the things that are the reader's own and stay theirs: their data, their decisions, their accounts, their wording). A reader should never have to guess who owns a line of the document. Say it again in a table cell only when a row mixes both.

## Every claim has a source

Before a document is called done, every factual claim in it is checked **word for word** against its source: the code, the official documentation, the reader's own material. A length, a character count or "it reads right" is not a check.

Keep a ledger beside the source, `claims.md`:

```
| Claim | Source | Source's words | Status |
| --- | --- | --- | --- |
| The editor keeps 3 list levels | src/editor/schema.ts:42 | maxListDepth = 3 | verified |
| Customers see the change within a minute | the operator, call of 4 Nov | (not checked) | unverified |
```

- **Source** is a file path (with a line), or a URL you opened. **Source's words** is what the source says, copied, not paraphrased.
- **Status** is `verified`, `unverified` or `removed`. An unverified claim is **marked** in the document (`<mark class="unverified">…</mark>`, which prints highlighted) or removed. It is never left to read as fact.
- `check.sh --claims claims.md` reads each local source and fails a verified row whose words are not in it. A URL it cannot read: open it yourself.
- No claim about any system, product or rule in the document: `check.sh --no-claims`, and say so.

## Answers and approvals

Where the reader must answer or approve, give them somewhere to do it: `.fields` for text, `ul.checks` or `.box` for choices, and a `.signoff` block with **Name, Position, Date** (and Signature). For a PDF they type into, add real fields over those blanks (`pdfcraft-cli`, PDFCRAFT.md). Never an empty page, a frame or a decorative border on an image or an icon: the check fails them.

## One visual per process or screen

A process of more than 3 steps gets a flow diagram; a screen the reader must find gets an annotated screenshot with numbered boxes and a numbered `.legend`. Captions are numbered for you. A document with nothing to show gets no figure. Crop screenshots to the part the step is about.

## Editable source for a visual page

A page that is mostly a picture (a diagram, a poster, a cover) is offered with its **editable source** beside the PDF: the SVG, or the project's design tool file, so the reader can change it. Keep diagrams as SVG files in `src/img/`, embed them inline, and name the SVG in the hand-over.

## Avoid

These make a document look generated. They come from landing pages and app screens, not from the documents professionals send: [references](../../../../docs/characters/donna/references.md) lists the real ones that were opened and what each does instead. A recipe or a request that asks for one wins; otherwise leave them out. `check.sh` fails the ones it can measure (rule `tropes`, and `side bars`).

- **A small tracked-uppercase label above the title or a heading** (an eyebrow or kicker, often coloured), **a hero-sized title** (over 20pt outside a cover) **and a grey line of facts joined by middle dots** ("30 points · Due 3 March · Calculators allowed"). Real documents put the name line first, a small plain title next, and the facts in a sentence or in labelled rows. `check.sh` fails letter-spaced uppercase, a dot-separated header or meta line, and an `h1` over 20pt outside the cover.
- **A thick coloured bar down the side of a tinted box.** A callout is a bold label over ordinary text between thin rules (`.answer`, `.callout`). `check.sh` fails a side bar of 3px or more.
- **Every block in a rounded card,** tinted fills behind everything, drop shadows. Most things sit on the page with space around them; a rule is enough to separate. `check.sh` fails a rounded box (2.5px or more) and any shadow.
- **Pill badges and status chips** for things that are plain words ("Draft", "Required"). A named file is the one highlighted inline element.
- **Gradients.** None. The cover band is a flat band of the accent colour. `check.sh` fails any gradient.
- **Emoji and icon clip-art** as bullets or headings; an icon frame or a coloured circle round a number.
- **Several accent colours.** One accent, one warm colour for "not settled", the ink and a grey. The accent shows on rules, numbers and the title only.
- **Decorative borders** round images, and screenshots with a drop shadow.
- **Headings that are labels** ("Overview", "Details") or in capitals; a heading says what the section tells the reader.

### The words

A document that reads like a chatbot loses the reader as fast as one that looks like a landing page. `check.sh` fails the patterns it can find (rule `prose`); a NOTE is a tell for a person's eye.

- **Stock openers and throat-clearing:** "In today's fast-paced world", "It is important to note that", "When it comes to", "Let's dive in", "Here's the thing". Start with the fact.
- **Words the real documents do not use:** delve, seamless, robust, leverage, pivotal, tapestry, holistic, cutting-edge, game-changing. Use the plain word: use, strong, key.
- **An em dash as a pause.** Use a comma, a colon or a full stop. A lone "—" in a table cell for "none" is fine.
- **Exclamation marks, "not only … but also", "it's not X, it's Y",** and ", highlighting …" tails that restate the sentence.
- **Three bare words in a row** ("quick, simple and clear") used again and again. Two items, or one, or the real list of things.
- **A last sentence that says again what the section said,** and "In conclusion", "Overall", "In short". End when the section ends.
- Words inside double quotes, in `<code>` and in an element with class `prose-ok` are not judged: a quotation is somebody else's words.

The detection list follows the unslop skill's reference (throat-clearing, emphasis crutches, AI vocabulary, em-dash and exclamation overuse, three-item lists, conclusion scaffolding), cut to what a document would say. Sources and what could not be confirmed are in the research notes.
