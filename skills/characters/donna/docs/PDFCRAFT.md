# pdfcraft-cli

Reference for `/suits:donna`: forms, edits, redaction and checks. Project: https://github.com/storytold/pdfcraft. Run `pdfcraft-cli`, never `pdfcraft` (the GUI, which hangs).

`pdfcraft-cli --help` lists the commands; `pdfcraft-cli tools` prints every automation tool with its JSON schema. Read the schema before writing a step you have not used.

## One-shot commands

```
pdfcraft-cli info    f.pdf                        # JSON: "pages", "acroform_fields", "title", fonts, tagged
pdfcraft-cli render  f.pdf --page N --dpi 70 --out p.png   # one page per call
pdfcraft-cli text    f.pdf [--page N]             # text in reading order; includes filled form values
pdfcraft-cli check   f.pdf                        # opens and renders; read its summary line, see below
pdfcraft-cli audit   f.pdf                        # finds text hidden under a box; exits 1 when it finds any
pdfcraft-cli edit    in.pdf --out out.pdf [--rotate 1,3:90] [--delete 2,4] [--move 5:1] [--insert-blank 1] [--title T] [--author A]
pdfcraft-cli combine a.pdf b.pdf --out out.pdf
pdfcraft-cli extract in.pdf --pages 1,3,5-8 --out out.pdf
pdfcraft-cli split   in.pdf --every N | --before 3,7 --out-dir DIR
```

- `edit`, `combine`, `extract` and `split` write a new file and leave the input alone.
- `check` exits 0 even for an unreadable file. It prints `checked N files: {"ok": N}` when all is well; any other key in that object (`open-error`, for one) is a failure. `scripts/review.sh` reads the line for you.

## Steps files

For anything that needs several operations on one document, write `steps.json` and run it:

```
pdfcraft-cli run --script steps.json --root <dir> --report > report.json
```

```json
[{"tool": "doc_open",  "args": {"path": "blank.pdf"}},
 {"tool": "form_fill", "args": {"doc": 1, "values": {"name": "..."}}},
 {"tool": "doc_save",  "args": {"doc": 1, "path": "out.pdf", "full": true}}]
```

- Relative paths resolve from `--root` (default: the current directory).
- The first `doc_open` is document 1, the next is 2. Each `run` is a fresh process, so ids start again.
- Read `ok` and every step's `status` in the report. A failing step stops the run: the rest read `skipped`, the exit code is 1, and `doc_save` never ran, so no half-made file appears.
- Save to a new path with `"full": true`. Saving over the source loses the original.

## Forms

First `pdfcraft-cli info form.pdf`: `acroform_fields` says whether the form has fields.

**It has fields.** List them, fill them, read them back:

1. `form_fields` gives each field's `name`, `type`, `rect` and current `value`.
2. `form_fill` with `values`: `{name: text}`, `true` or `false` for a checkbox. An unknown name fails the step.
3. `form_fields` again: every value you set must be there. Then `render` the page and look for text that runs past its box.
4. `doc_flatten` before `doc_save` when the recipient must not edit it; it bakes the values into the page and leaves no fields.

**It has none** (a scanned or printed-to-PDF form). Two ways, by what the recipient needs:

- **They need to type into it:** add fields with `form_add_field` (`type` text, checkbox, date, combo), one per blank, then fill them as above.
- **A finished copy:** `page_add_text` stamps text where the blank is. Fonts: `helvetica`, `times`, `courier`; Western European characters only (other text is refused, so say so instead of dropping it). Stamped text is not a field.

Both routes need coordinates. They are points from the **top-left** of the displayed page, as `[x0, y0, x1, y1]` for a field or `at: [x, y]` for text.

1. `text_lines` (page) gives each label's box. The entry area sits just under or beside its label: start at the label's bottom edge plus 2 to 4 points.
2. Start text about 3 points inside the box, size 9 to 11.
3. Fill, `render`, look, nudge by a point or two, repeat. Three or four rounds is normal.

Fill only what the user supplied. A blank you cannot fill from what you were told stays blank and goes in your report, not guessed.

## Redaction

```json
[{"tool": "doc_open",       "args": {"path": "doc.pdf"}},
 {"tool": "redact_mark",    "args": {"doc": 1, "find": "text to remove"}},
 {"tool": "redact_apply",   "args": {"doc": 1}},
 {"tool": "doc_hidden_info","args": {"doc": 1}},
 {"tool": "doc_save",       "args": {"doc": 1, "path": "doc-shareable.pdf", "full": true}}]
```

- Redact a copy; the original stays unshared. `redact_mark` also takes `rect` with `page`, `pattern` and `words`.
- Proof, all three: `text` no longer contains the string; `render` shows the black box; `audit` reports `"count":0`.
- `doc_hidden_info` lists what else travels in the file (metadata, comments, attachments, hidden text). `doc_remove_hidden` strips the categories you name.
- A box drawn over text in the source HTML hides nothing: `audit` finds the text underneath. Delete the text from the source instead.

## When `pdfcraft-cli` is missing

Say so. Then, by job:

- **Review:** `scripts/review.sh` falls back to poppler (`pdftoppm`, `pdftotext`, `pdfinfo`) and tells you the file check and the redaction audit did not run. Do not claim a redaction is safe without the audit.
- **Combine, extract, rotate, fill a form:** Python `pypdf`, or a `pdf` skill if the session lists one.
- **Redact or flatten:** nothing here substitutes. Tell the user the step could not be done and why.
