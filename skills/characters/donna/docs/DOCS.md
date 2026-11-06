# Documents

The steps for a finished, designed PDF, from `/donna`. They run in order: look, pick the route, keep a source, write, check, hand over.

Make a finished PDF from a source file you edit and a build you repeat, then look at every page before saying it is done.

`scripts/`, `styles/`, `templates/` and the reference files resolve from this folder (`docs/` in the donna skill). Every other path resolves from the directory you were run in.

Two tools do the work. Check both first, and say which one is missing rather than carrying on without it:

- **`pdfcraft-cli`** reads, checks, fills, edits and redacts PDFs. Never run `pdfcraft`: that is the GUI and hangs.
- **Headless Chrome** (`google-chrome`, `chromium`, or `CHROME=<path>`) prints HTML to PDF.

Reference files, read when the step names them: [KINDS.md](KINDS.md) (a recipe per kind of document), [LEGAL.md](LEGAL.md) (company and legal documents: hard rules, 19 kinds), [WRITING.md](WRITING.md) (asks, files, claims, sign-off), [BUILD.md](BUILD.md) (print stylesheet, breaks, contents page, missing Chrome), [PDFCRAFT.md](PDFCRAFT.md) (commands, forms, redaction, missing `pdfcraft-cli`).

## 1. Look before writing

Find what the document should look like before choosing anything:

1. **An example from the user.** A PDF, a previous reply, a template. It beats everything below: match its length, tone, layout and headings.
2. **The project's design system.** Design tokens, theme or CSS files, a brand or `assets/` folder, a logo, fonts, an earlier document in `docs/` or `notes/`.
3. **Neither:** use **Letterhead**, the designed default ([styles/letterhead.css](styles/letterhead.css)), and say so. Two other styles are selectable when the user asks, or when the document suits one: **Academic serif** (a handout, a lecture note, anything a school or a journal would print) and **Engineering** (a specification, a technical memo, a report with a document number and revision). `scripts/use-style.sh <letterhead|academic|engineering> <dir>` copies the style and its fonts beside the HTML. Do not "correct" a style towards a plainer page.

**The project's design system always wins over a style.** A repo with tokens, a theme, a brand folder, a logo or fonts is matched, never overridden: the styles read the same custom properties (`--accent`, `--ink`, `--muted`, `--line`, `--tint`, `--font`), so a brand's `tokens.css` restyles any of the three, and the letterhead takes the brand's logo, name and address ([BUILD.md](BUILD.md), "Match the design").

Where the sources disagree or the length differs:

- The request's length wins over an example's.
- A document you found yourself ranks below one the user gave you. When it disagrees with the current design tokens (an old PDF against the tokens), take layout, tone and structure from the document, and colours, fonts and logo from the tokens.
- Say which you chose and why.

Done when you can tell the user in one line what you are matching, or that nothing was found and Letterhead is in use.

## 2. Pick the route

- **Fill a form that exists:** `pdfcraft-cli run --script steps.json --report`. See "Forms" in [PDFCRAFT.md](PDFCRAFT.md).
- **Build a new document:** name its kind (checklist or request list, proposal, report or findings, how-to guide, reference or spec, memo, letter, form, comparison or decision record, assignment or worksheet, or one of the 19 company and legal kinds in [LEGAL.md](LEGAL.md)), follow that recipe in [KINDS.md](KINDS.md), start from `templates/cover.html` (or `templates/memo.html`, `templates/signoff-checklist.html`, `templates/legal.html`), print with `scripts/print.sh`. See [BUILD.md](BUILD.md). A document that leaves the building gets a cover; a short internal one gets the letterhead and a title.
- **Change what exists** (rotate, delete or move pages, combine, extract, split, set the title): `pdfcraft-cli edit`, `combine`, `extract`, `split`.
- **A guide with screenshots of an app:** run `/guide-shots` for the screens when it is installed (else capture them another way), then build the document here.

## 3. Keep a source and a build

The source file is the thing you edit; the PDF is output. Never patch the PDF by hand to fix wording.

- Source: HTML, or Markdown converted to HTML by the build. Keep it beside the output with its images.
- Build: one command that rebuilds the PDF from the source. A `build.sh` of three lines is enough. If contents page numbers are needed, the build measures them (BUILD.md).
- Backup: before each rebuild or edit, copy the current PDF and source to `bak/` with a timestamp. `pdfcraft-cli` writes to a new `--out` path, so the input stays as it was.

Done when one command rebuilds the PDF and the previous version is in `bak/`.

## 4. Write it

- **As short as the reader needs.** The first page says what the reader can do or decide. Say each fact once. A contents page under about six pages is padding.
- **Every ask says what to send or decide, and why.** Never ask what we can find out ourselves: write a proposal to accept or change. Name each file the reader must open, exactly, highlighted (`.file`). Say plainly what we made and what is the reader's own (`.pair`). Where the reader answers or approves, give fields, boxes and a sign-off block (Name, Position, Date). Details and markup: [WRITING.md](WRITING.md).
- **Nothing confidential carried across.** Names, figures, paths and wording from another job stay there. Redact anything real in a screenshot or a sample.
- **Every claim is checked word for word against its source** before the document is called done: the code, the config, the official documentation, the live screen, the reader's own material. A length or a character count is not a check. Record each claim, source and the source's words in `claims.md`; mark what you could not check (`.unverified`) or remove it.
- **The source's words for controls, roles and states,** exactly as the screen or code shows them. When the request uses another word, use the source's and tell the user.
- **Looks like the real thing.** A handout, memo, letter, form or checklist is shaped like the real ones (`body.plain`, [KINDS.md](KINDS.md)). No kicker above the title, no line of facts joined by dots, no hero title, card, pill, shadow or gradient ([WRITING.md](WRITING.md), "Avoid").
- **Tone from the example** (step 1). With none, write plainly for the reader named in the request.

## 5. Check every page

Run `scripts/review.sh <pdf> review` (it renders each page to PNG, writes the text, runs `pdfcraft-cli check` and `audit`), then `scripts/check.sh <doc.html> <pdf> --claims claims.md [--files <dir>]`. check.sh measures: longest prose line (95 characters at most), heading levels (3 at most, one h1, no all-caps), contrast of every colour pair (4.5:1), a numbered caption on every figure, no frame or rounded corner on an image, none of the generated-looking tropes (tracked-uppercase kicker, dot-separated header line, hero title, pill, card, shadow, stray gradient), a `.what` and `.why` on every ask, prose that does not sound machine-written (stock openers, "delve", "seamless", "robust", "leverage", an em dash as a pause, an exclamation mark, three bare words in a row used three times, a closing sentence that repeats its section; quotations in double quotes and `.prose-ok` are left alone), no empty page, fonts embedded, named files that exist, and the claims ledger read against its sources. Any FAIL is fixed in the source, then rebuilt.

Then look, because the measures cannot see design:

1. **Look at every PNG.** Overflow, clipped text or images, a heading stranded at the foot of a page, an almost empty page, a table row split across pages, an ID or amount broken over two lines, a logo or image missing, a screenshot too small to read at print size. Then ask whether it looks designed: a cover where one belongs, a clear step between heading levels, the accent on rules, numbers and the title only, room around the content. Fix the source, rebuild, look again.
2. **Read page 1 alone** (`review/text.txt`). It must say what the document is for and what the reader should do. It must contain the wording the document is meant to say, and none that must not be there.
3. **Confirm the page count** is what you expect and state it.
4. **Redaction:** hiding text by drawing a box over it leaves the text in the file. Remove it from the source, or use `redact_mark` and `redact_apply`, then `pdfcraft-cli audit` must report no findings.

Done when every page has been looked at, check.sh passes, each defect is fixed or listed, and `check` and `audit` pass.

## 6. Rounds of review comments

When the user brings comments on a document you made:

1. Read each comment. Change only what it raises.
2. Draft one reply per comment, for the user to post. Do not post them.
3. Anything else you noticed goes in your report, unchanged in the document.
4. Rebuild, run step 5 again, and say which comments each change answers.

If the PDF lives on Google Drive, warn first that replacing the file or uploading a new version can make the comments disappear. Save the comments and replies locally before any upload. While the comments are still needed, recommend uploading as a separate file; the user chooses.

## 7. Hand over

Give the file's full path and its page count, and offer to open it. For a visual page (a diagram, a poster, a cover), also offer its editable source (the SVG, or the project's design tool file) beside the PDF. Sending, uploading or emailing it is the user's call: do it only when they ask.
