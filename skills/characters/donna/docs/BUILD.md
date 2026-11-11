# Building a document from HTML

Reference for `/suits:donna` step 2, "Build a new document". Read it before writing the first line of HTML.

## Match the design

Search for the design system before opening an editor:

```
git ls-files | grep -iE 'token|theme|brand|logo|font|palette|\.css$|tailwind'
ls assets docs design brand 2>/dev/null
```

Outside a repo, or in a folder holding many repos and worktrees, `git ls-files` finds nothing. Use `find <dir> -maxdepth 4 \( -iname '*token*' -o -iname '*brand*' -o -iname 'logo*' -o -iname '*theme*' \)` and look for a design-system export (a `tokens.json` with its README, logos and fonts) and earlier delivered PDFs. Take one copy: the one named as the source of truth, or the newest. Skip archives, `_before-*` backups and worktree copies of the same folder.

Take from it: the colours (accent, text, muted, line, tint), the font, the logo file, any earlier document's layout.

- **CSS tokens exist:** link that file before `print.css`.
- **Tokens live elsewhere** (a JSON file, a Tailwind config, a Figma export): copy the values into a small `tokens.css`, a `:root` block that sets `--accent`, `--ink`, `--muted`, `--line`, `--tint`.
- **`print.css`** is `styles/letterhead.css` from this skill, copied beside the HTML, then adjusted: font family, sizes and margins to match the example. `letterhead.css` reads each colour as `var(--accent, #1f4e79)`, so linked tokens win and the file never defines `:root` itself. The tokens it reads: `--accent`, `--ink`, `--muted`, `--line`, `--tint`, and optionally `--accent-2` (the far end of the cover band), `--warn-bg`, `--warn-ink`, `--warn-line` and `--mark` (the red of a screenshot's numbered boxes). Every text colour pair must keep 4.5:1; `check.sh` measures it.
- **An example PDF from the user:** `pdfcraft-cli text` for its wording and length, `render` for its layout. Copy page size, margins, heading style, whether there is a cover or contents.

Fonts: use families already on the machine, or ship the file beside the HTML with `@font-face` and a relative `url()`. A missing glyph prints as a blank box, so render a page with any non-English text to see it.

## Page setup

`print.css` already sets A4 (change `size` to Letter for a US reader), the margins, the footer and the cover page. What a document adds is its own words and logo, in a `<style>` block from `templates/cover.html`:

```css
:root { --running: "Short title"; --footer-logo: url("data:image/png;base64,..."); --footer-pad: 9mm; }
```

- The footer shows the logo, the short title and "Page n of N", and none on page 1. The logo must be a `data:` URI: Chrome does not resolve relative URLs in page margin boxes reliably. Without a logo, leave out `--footer-logo` and `--footer-pad`.
- The cover is a section with `class="cover"`. It prints on a named page with no margin, so it is full bleed and has no footer, and the page after it is page 2. Do not add `break-after` to it: the named page already starts a new page, and the extra break prints a blank one. Keep `overflow: hidden` on it: a heading margin that escapes the section pushes it past 297mm and prints a blank page as well.
- `<body class="long">` starts every `h2` on a new page (past about 6 pages); leave it off in a short document, where it leaves half-empty pages. `<body class="plain">` is for a handout, memo, letter, form or checklist: a small bold title, bold headings with no rule under them, no coloured subheads (`compact` only shrinks the default headings).
- `print.sh` passes `--no-pdf-header-footer`; without it Chrome adds its own date and URL.
- Chrome has no `string-set`, so a running title is literal text in the CSS.
- Set the title with `pdfcraft-cli edit in.pdf --out out.pdf --title "..." --author "..."`.

## Mathematics

Write equations in MathML inside the HTML. Chrome typesets it with no script and no network, and embeds the math font (`pdffonts` shows DejaVu Math TeX Gyre), so it prints the same on any machine that has the font. Do not load KaTeX or MathJax from a CDN at print time. `default.css` sets the font stack and `.eq` (a displayed equation).

```html
<p class="eq"><math><mi>d</mi><mo>=</mo><msub><mi>v</mi><mn>0</mn></msub><mi>t</mi><mo>+</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><mi>a</mi><msup><mi>t</mi><mn>2</mn></msup></math></p>
```

- `<mi>` a variable (italic), `<mn>` a number, `<mo>` an operator, `<mfrac>` a fraction, `<msub>` and `<msup>` sub and superscripts, `<msqrt>` a root, `<mrow>` a group. A Greek capital such as Δ takes `<mi mathvariant="normal">`.
- Units and plain quantities (12 m/s², 4.0 s) stay ordinary text.
- If the machine has none of the fonts in the stack, equations print in a fallback: render a page and look. A missing glyph prints as a box.

## Breaks, widths, images

```css
h2, h3 { break-after: avoid; }               /* no heading stranded at a page foot */
tr, li, figure { break-inside: avoid; }
thead { display: table-header-group; }       /* the header row repeats on a split table */
p { orphans: 3; widows: 3; }
.nowrap { white-space: nowrap; }             /* ids, amounts, dates, phone numbers */
```

- Wrap every ID, amount, date and phone number in `.nowrap`. The trial's "G-4821" split at its hyphen until it was wrapped.
- Images and icons get no border, rounded corner or shadow: `check.sh` fails them. `print.css` sets the figure rules.
- Give images a `max-width: 100%` and a `max-height` in mm. A tall figure with `break-inside: avoid` that does not fit leaves a near-empty page: shrink it, or move it so text fills the gap.
- A screenshot must be readable at print size. Crop it (Pillow or ImageMagick) to the part the step is about before embedding; a whole screen shrunk into a column is illegible. Drop a figure you cannot make readable.
- Screenshots: PNG at 150 dpi or more. Logos and charts: SVG, which stays sharp. Text inside a raster image cannot be searched, so say in the caption what it shows.
- `break-before: page` is for a real section start, not for filling space.

## Markdown source

If the user wants Markdown as the source, convert in the build: `python3 -c "import markdown"` (use the `tables` and `sane_lists` extensions), or `pandoc`, or `npx marked`. Wrap the result in the HTML shell with the stylesheet links. With no converter installed, write HTML instead and say why.

## Contents with page numbers

Chrome has no `target-counter()`, so the build measures the numbers. Put `<span class="pg">{{Heading text}}</span>` where each number goes in `src/doc.tpl.html`, then run this (`scripts/print.sh` is this skill's script; use its full path). Tried end to end on a sample: it converges in two passes.

```bash
heads=$(sed -n 's/.*<span class="pg">{{\(.*\)}}<\/span>.*/\1/p' src/doc.tpl.html)
fill()    { cp src/doc.tpl.html src/doc.html
            while IFS= read -r h; do
              p=$(grep -F -m1 "$h	" "$1" | cut -f2)         # a tab after the heading
              sed -i "s|{{$h}}|${p:-?}|" src/doc.html; done <<< "$heads"; }
measure() { n=$(pdfcraft-cli info "$1" | sed -n 's/^ *"pages": *\([0-9]*\).*/\1/p')
            while IFS= read -r h; do for p in $(seq 2 "$n"); do       # page 1 holds the contents
              pdfcraft-cli text "$1" --page "$p" | grep -qx "$h" && { printf '%s\t%s\n' "$h" "$p"; break; }
            done; done <<< "$heads"; }
: > out/pages0.tsv; fill out/pages0.tsv; scripts/print.sh src/doc.html out/doc.pdf
measure out/doc.pdf > out/pages1.tsv
fill out/pages1.tsv; scripts/print.sh src/doc.html out/doc.pdf
measure out/doc.pdf > out/pages2.tsv
cmp out/pages1.tsv out/pages2.tsv       # the numbers must not move between passes
```

Headings in the contents must match the headings in the body word for word.

## A missing Chrome

Try `chromium` or `chromium-browser`, or point `CHROME=` at a binary. With none installed, `weasyprint` or `wkhtmltopdf` can print the HTML, but their CSS support differs: check every page, and drop margin-box page numbers if they fail. With no printer at all, tell the user, and hand over the HTML as HTML, not as a PDF.
