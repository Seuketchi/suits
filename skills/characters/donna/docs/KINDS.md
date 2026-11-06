# Kinds of document

Reference for the documents steps ([DOCS.md](DOCS.md), step 2). Find the kind in the request, read its recipe, start from `templates/cover.html`, then write. A document is one kind: do not mix how-to steps, reference tables and explanation in one section. When the reader's side has set the headings and order (an audit reply, a regulator's form, a bank's template), mirror theirs instead of this recipe.

Every recipe starts with the answer: what the reader can do or decide, in an `.answer` block or the first paragraph, before background. Class names are in [letterhead.css](styles/letterhead.css).

A handout, memo, letter, form or checklist takes `<body class="plain">`: the look of the real ones, not of a web page ([references](../../../../docs/characters/donna/references.md)). Their header is **the sender's letterhead (`.lh`: mark, name, office) or a name line, then labelled rows**, never a coloured label above the title and never a line of facts joined by dots; say it as a sentence or as rows. The style is the project's own tokens on Letterhead, the default, or Academic serif or Engineering when asked ([DOCS.md](DOCS.md), step 1).

| Kind | Opening | Length |
| --- | --- | --- |
| [Sign-off checklist or request list](#sign-off-checklist-or-request-list) | title block; cover past 3 pages | 1 to 4 pages |
| [Proposal](#proposal) | cover | 3 to 10 |
| [Report or findings](#report-or-findings) | cover if it leaves the building | any |
| [How-to guide](#how-to-guide) | cover if external or past 3 pages | any |
| [Reference or spec](#reference-or-spec) | cover | any |
| [Memo](#memo) | title block with To / From / Date / Subject | 1 |
| [Formal letter](#formal-letter) | letterhead | 1 to 2 |
| [Form to fill in](#form-to-fill-in) | title block | 1 to 3 |
| [Comparison or decision record](#comparison-or-decision-record) | title block | 1 to 3 |
| [Assignment or worksheet](#assignment-or-worksheet) | title block with a header block | 2 to 4 |
| [Company or legal document](#company-or-legal-document) | letterhead, the review notice | 1 to 15 |

A cover (`.cover`) is for a document that leaves the building or runs past about 3 pages: a flat band of the accent colour. A shorter internal one gets the letterhead (`.lh`) and a title.

## Sign-off checklist or request list

For asking another party to send, confirm or approve things.

- **First page says:** what we need, from whom, by when, how to reply. Then the asks.
- **Structure:** `.answer` (the count of asks and the date) · `.asks` with one `.ask` per request · `.pair` (what we made, what is yours) when both appear · sign-off block.
- **Each ask** has a `.what` (exactly what to send or decide) and a `.why` (what it is needed for), and a `.due` when dates differ. `.ask.tick` gives a box to tick. Never ask for what we can find out ourselves: write the proposal and ask the reader to accept or change it.
- Name every file the reader must open or return in a `.file`; every name must be real.
- End with `.signoff` (Name, Position, Date, Signature).

## Proposal

- **Cover:** title the outcome, not "Proposal for…"; the 4-row block with the reader as *Prepared for*. No label above the title.
- **First page after the cover says:** what we propose, what it costs and takes, the decision wanted and its date (`.answer`).
- **Structure:** the problem in the reader's words · the proposal · `.pair` "What we make" / "What is yours" · plan with dates (a table) · cost · risks and what we do not know (`.callout`) · next step and an acceptance `.signoff`.
- One option recommended. Others go in a comparison table, shortly.

## Report or findings

- **Cover** when it leaves the building. The title says what was examined; the rows say who for, who by, when and which version.
- **First page says:** the bottom line and the ranked findings, each in one line. Method and evidence follow; they never come first.
- **Structure:** bottom line · findings, one `h2` each: the claim, the evidence, where it came from · what we could not check · method · sources. Each finding's claim is a ledger row ([WRITING.md](WRITING.md)).
- Answering an audit or a regulator: mirror their section order and numbering.

## How-to guide

- **Cover** when external or past about 3 pages; else a title block.
- **First page says:** what the reader will be able to do, and **Before you start** (rights, tools, time) as an `.answer` box with bold lead-ins.
- **Structure:** one `h2` per task; numbered steps, one action each, the control named exactly as the screen shows it; a process of more than 3 steps gets a flow diagram ([templates/flow.svg](templates/flow.svg)); a screen the reader must find gets an annotated screenshot with a numbered `.legend`; then "If it says no": each message and what to do. Explanation stays short and apart from the steps.
- `body.long` past about 6 pages: every `h2` starts a page, and a contents page is worth it (BUILD.md).

## Reference or spec

For what a system, a device, an interface or a rule set must do, so that others can build to it and accept against it. Shaped like the real ones: a datasheet or an RFC has numbered sections, thin-ruled tables and a version line, not a hero title.

- **Opening:** the letterhead and a title, `body.plain`: the title (`h1`), one sentence saying what it specifies and for whom, then `.facts` rows Document, Version and status, Date, Written by. A **cover** (with the Version and status rows) only when it leaves the building or runs past about 10 pages.
- **First page says:** what it specifies, who must follow it, what version this is and what changed. A sample or a draft says so in a bold sentence there.
- **Structure,** `h2` numbered in the text (`1 Purpose and scope`, so that a section can be cited): scope, in and out · terms (a two-column table) and the meaning of must, should and may (RFC 2119, quoted once) · **requirements** as `<ol class="reqs">`, one `<li>` each, counted R1, R2 … (`data-id="R10"` keeps an id fixed once the document is issued: append, never renumber) · the diagram · tables for pins, fields and values (header row repeats) · budgets with their formula · message or file formats · states · open questions (a table: question, who decides, needed by) · revisions (a table: version, date, change, by).
- **A requirement** is one sentence with one subject and one of must, must not, should or may in bold. It can be tested. A number carries its unit. If it rests on a fact about another system (a chip, an API), that fact is a row in the ledger.
- **Code and data** go in `<pre><code>` (thin rules, no tint, wraps inside the margin); names, topics and fields in `<code>`. Set a topic or an id that must not break in `class="nowrap"`.
- **A budget or an estimate** shows its formula as MathML, a table of its inputs with the basis of each (datasheet, measured or assumed, said as such), and the working with the result. Both the table and the result come from one small script whose output is the ledger's source.
- **A state or flow diagram** is an SVG from [templates/state.svg](templates/state.svg) (states in a row, one skip path, one return path); a table under it lists each move: From, Event, To, What happens. A block diagram is drawn in the same style: boxes with plain outlines, one filled, arrows labelled with the signal.
- No tutorial and no argument: say what is, not how to learn it. Offer the diagrams' SVG files beside the PDF.

## Memo

- **Header** as on the real ones (OMB and SEC memoranda, the Bank of England's letters): the sender's letterhead (`.lh`: the mark and name at the left, the office at the right, one rule), the word "Memorandum" as the title (`h1`), a reference line (`.ref`), then `.facts` rows To / From / Date / Reply by / Subject, then the body. `body.plain`. One page. [templates/memo.html](templates/memo.html). The Engineering style also wants Document and Revision rows.
- **First page says:** the point and what you need, in the first two sentences, as ordinary bold-led text, not a box. Then the reasons, as a short list. No sign-off block unless approval is the point.

## Formal letter

- **Letterhead:** `.lh` with the logo at top left and the sender's address at the right, date, then the addressee, then a reference line (their reference, ours), then "Dear Ms. Reyes,". `body.plain`. A regulator or circular letter (Federal Reserve SR letters, FDIC letters) puts its number and date at the top, a bold subject and one plain sentence on whom it applies to.
- **Body:** the point and the ask in the first paragraph, one paragraph of what the reader needs to act, the close ("Regards," or "Yours sincerely," to match the reader), then name, position, organisation. List enclosures as `.file` names. Dates in full ("14 November 2026").
- Not a memo: no title and no headings.

## Form to fill in

- **First page says:** who fills it in, by when, and where to send it.
- **Structure:** `.fields` (a label over a rule; `.wide`, `.tall` where the answer is long) · `ul.checks` for choices · `.signoff` with Name, Position, Date, Signature.
- The HTML draws the blanks. For a reader who types into the PDF, run `scripts/add-fields.py <in.pdf> <out.pdf>`: it adds a text field over every `.field` and a checkbox in every `.ask.tick` with `pdfcraft-cli`. Render the result and look; a document that changes the blanks' CSS needs the script's constants changed with it. Fill nothing you were not told. No empty pages.

## Assignment or worksheet

For a teacher or trainer handing out problems to be answered on paper or typed into the PDF.

- **Header** as on the real ones (Physics Classroom, school-district sheets, IGCSE papers): a `.strip` with the course at the left and the school at the right, then `.fields.header-block` (`Name: ____ Section: ____ Date: ____ Score: ____ / 30`), then a small plain title, then one sentence: due date, total points, what is allowed. No label above the title, no line of facts joined by dots. `body.plain`. Put `<div class="cols"><span>No.</span><span>Problem</span><span>Marks</span></div>` before `.problems`: Letterhead hides it, Academic and Engineering show it as the head of the marks column.
- **First page says:** what to do and what is allowed, in a few numbered instructions (an `h2` "Instructions" and an `ol`).
- **Structure:** "Instructions" (what to write, in what order, where the answer goes) · "Equations you may use" as `.eqs` when the course allows them · `.problems`, one `.problem` each: `<span class="points">[4]</span>` (marks in brackets at the right margin, the number comes from the counter), the question, then its answer spaces; a problem with parts uses `<div class="part"><span class="points">[4]</span>…</div>` · a rubric table last ("How the points are given", with the total).
- **Mathematics** is MathML ([BUILD.md](BUILD.md), "Mathematics"): typeset by Chrome, offline, the math font embedded. Units and values stay plain text.
- **Answer spaces** are sized for handwriting and named by what goes in them: `.space.calc` (Calculation:, 26mm), `.space.work` (Working:, 50mm), `.space.explain` (Explain:, four ruled lines), `.space.ans` (Answer: and a rule, with its units). Size them to the work: a calculation of three lines does not need 50mm.
- **A figure** (a graph, a circuit, a map) is an SVG from [templates/graph.svg](templates/graph.svg), numbered by its caption and referred to in the problem. A problem with parts and a figure takes `class="problem split"` so it may flow onto the next page; a space and the part above it never split across pages.
- **Points:** every item states its points, they add up to the total on page 1, and the rubric says how each is earned.
- **Fillable version:** `scripts/add-fields.py` turns every space and header field into a text field, so the sheet can be completed on screen. Keep the plain PDF for printing; the ruled lines show in it.
- The answer key is a separate file the teacher keeps (built from the same numbers, `check.sh --claims` against it), not a page in the handout.

## Comparison or decision record

- **First page says:** the decision (or the recommendation) and why, in two sentences, with its status (proposed, accepted, superseded) and date.
- **Structure:** context · options considered · a table with the options as columns and the criteria as rows, the chosen column marked `.chosen` · consequences (what gets easier, what gets harder) · who decided. `.signoff` when someone must approve.
- A criterion that cannot be measured says so; a cell never claims a fact that is not in the ledger.

## Company or legal document

For a policy, SOP, board resolution, secretary's certificate, minutes, notice of meeting, staff memo, incident report, job offer, certificate of employment, authorization letter, NDA, service agreement, MOA, special power of attorney, affidavit, privacy notice, demand letter or quitclaim. [LEGAL.md](LEGAL.md) has the parts in order, the wording each must have, and the sign or notary block for each. The hard rules there bind every one: no legal advice, no invented statute, a notarial block left empty, the review notice on page 1.

- **Opening:** `body.plain.legal`, starting from [templates/legal.html](templates/legal.html): the review notice (`.notice`), a centred title, then the parts. A policy, SOP, announcement or incident report is an ordinary internal document: the letterhead, a title and `.facts` rows (number, version, owner, effective date).
- **Structure:** numbered articles (`ol.articles`), signature lines (`.sigs`), the empty notarial frame (`.notary`) only where a notary acts, and a last page "Open points for counsel" outside the instrument.
- **Facts:** every name, date, amount and number comes from the owner. A gap is a question, never a guess; a sample says in a notice that its facts are made up.
