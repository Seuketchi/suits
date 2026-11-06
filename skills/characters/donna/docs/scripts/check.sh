#!/usr/bin/env bash
# The measured checks for a finished document. They do not replace looking at every page.
#   check.sh <doc.html> <doc.pdf> (--claims <ledger.md> | --no-claims) [--files <dir>]
# Prints PASS or FAIL per rule; exits 1 if any FAIL. Needs headless Chrome and poppler (pdftotext, pdffonts, pdfimages).
#   line length   longest prose line in the PDF, in characters (fail above 95); table rows are not prose
#   headings      at most 3 levels (h1 to h3), one h1, no all-caps heading
#   contrast      every text colour against what is behind it: 4.5:1, or 3:1 for large text
#   figures       every figure has a caption, numbered in order
#   image frames  no border, rounded corner or shadow on an image or icon
#   side bars    no thick accent bar down one side of a box
#   tropes        no tracked-uppercase kicker, dot-separated header line, hero title, pill, card, shadow or gradient
#   legal draft   (body class legal) the review notice leads page 1; every notary blank is empty
#   prose         no stock opener, AI vocabulary, em-dash pause, exclamation mark, rule of three or closing sentence that repeats its section
#   asks          every .ask has a .what and a .why
#   empty pages   no page without text or an image
#   fonts         every font embedded
#   files         with --files: every .file name exists in that folder
#   claims        the ledger: each verified claim has a source and the source's words, found word for word in a local source
set -uo pipefail

here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
usage() { echo "usage: check.sh <doc.html> <doc.pdf> (--claims <ledger.md> | --no-claims) [--files <dir>]" >&2; exit 2; }
[ $# -ge 2 ] || usage
html=$(realpath "$1"); pdf=$(realpath "$2"); shift 2
claims=""; noclaims=0; files=""
while [ $# -gt 0 ]; do
  case $1 in
    --claims) [ $# -ge 2 ] || usage; claims=$(realpath -m "$2"); shift 2 ;;
    --no-claims) noclaims=1; shift ;;
    --files) [ $# -ge 2 ] || usage; files=$(realpath -m "$2"); shift 2 ;;
    *) usage ;;
  esac
done
[ -f "$html" ] || { echo "check.sh: $html not found" >&2; exit 1; }
[ -f "$pdf" ]  || { echo "check.sh: $pdf not found" >&2; exit 1; }
for t in pdftotext pdffonts pdfimages python3; do command -v "$t" >/dev/null 2>&1 || { echo "check.sh: $t not found" >&2; exit 1; }; done

chrome=${CHROME:-}
if [ -z "$chrome" ]; then
  for c in google-chrome google-chrome-stable chromium chromium-browser chrome; do command -v "$c" >/dev/null 2>&1 && { chrome=$c; break; }; done
fi
[ -n "$chrome" ] || { echo "check.sh: no Chrome or Chromium on PATH; set CHROME=/path/to/chrome" >&2; exit 1; }

status=0
pass() { echo "PASS $1"; }
fail() { echo "FAIL $1"; status=1; }

# ---- the HTML as Chrome computes it: a copy with the measuring script added, beside the original so relative paths resolve ----
tmp=$(mktemp "$(dirname "$html")/.donna-check-XXXXXX.html")
profile=$(mktemp -d)
trap 'rm -rf "$tmp" "$profile"' EXIT
python3 -I - "$html" "$here/check-dom.js" "$tmp" <<'PY'
import sys
src, js, out = (open(sys.argv[1], encoding="utf-8").read(), open(sys.argv[2], encoding="utf-8").read(), sys.argv[3])
i = src.lower().rfind("</body>")
open(out, "w", encoding="utf-8").write((src[:i] if i >= 0 else src) + "<script>" + js + "</script>" + (src[i:] if i >= 0 else ""))
PY
dom=$("$chrome" --headless=new --disable-gpu --no-sandbox --user-data-dir="$profile" --virtual-time-budget=3000 --dump-dom "file://$tmp" 2>/dev/null)
json=$(printf '%s' "$dom" | python3 -I -c '
import sys, re, html
m = re.findall(r"<pre id=\"donna-check\">(.*?)</pre>", sys.stdin.read(), re.S)
print(html.unescape(m[-1]) if m else "")')
[ -n "$json" ] || { echo "FAIL measuring: Chrome did not run the measuring script on $html"; exit 1; }

# report <rule> <label> <key>: PASS, or FAIL with every item
report() {
  local items
  items=$(printf '%s' "$json" | python3 -I -c 'import sys, json; print("\n".join(json.load(sys.stdin)[sys.argv[1]]))' "$3")
  if [ -z "$items" ]; then pass "$1${4:+ ($4)}"; else fail "$1"; printf '%s\n' "$items" | sed 's/^/     /'; fi
}
info() { printf '%s' "$json" | python3 -I -c 'import sys, json; d = json.load(sys.stdin); print(eval(sys.argv[1], {"d": d}))' "$1"; }

# ---- the PDF ----
longest=$(pdftotext -layout "$pdf" - | python3 -I -c '
import sys, re
best = (0, "")
for line in sys.stdin:
    t = line.strip()
    if re.search(r"\S {3,}\S", t) or "\f" in t:   # columns of a table, or a footer: not prose
        continue
    if len(t) > best[0]: best = (len(t), t)
print(best[0], best[1][:70])')
len=${longest%% *}
if [ "${len:-0}" -le 95 ]; then pass "line length (longest ${len:-0} characters)"; else fail "line length: ${len} characters, over 95: ${longest#* }..."; fi

report headings headings headings "levels $(info '", ".join("h%d" % l for l in d["levels"])')"
report contrast contrast contrast "tokens: $(info '", ".join(d["tokens"]) or "none set"')"
report figures figures figures "$(info 'd["figureCount"]') figures"
report "image frames" frames frames
report "side bars" bars bars
report tropes tropes tropes
prose=$(printf '%s' "$json" | python3 -I -c 'import sys, json; print(json.dumps(json.load(sys.stdin)["prose"]))' | python3 -I "$here/check-prose.py")
if printf '%s' "$prose" | grep -q '^FAIL'; then fail prose; printf '%s\n' "$prose" | grep '^FAIL' | sed 's/^FAIL /     /'; else pass "prose ($(info 'len(d["prose"])') blocks read)"; fi
printf '%s' "$prose" | grep '^NOTE' | sed 's/^NOTE /NOTE prose: /'
report asks asks asks "$(info 'd["askCount"]') asks"
[ "$(info '1 if d["isLegal"] else 0')" -eq 1 ] && report "legal draft" legal legal

pages=$(pdfinfo "$pdf" 2>/dev/null | sed -n 's/^Pages: *//p')
body_h=$(pdfinfo "$pdf" 2>/dev/null | sed -n 's/^Page size: *[0-9.]* x \([0-9]*\).*/\1/p'); body_h=$(( ${body_h:-842} - 62 ))   # above the footer
empty=""
for n in $(seq 1 "${pages:-0}"); do
  chars=$(pdftotext -f "$n" -l "$n" -x 0 -y 0 -W 2000 -H "$body_h" "$pdf" - 2>/dev/null | tr -d '[:space:]\f' | wc -c)
  imgs=$(pdfimages -list -f "$n" -l "$n" "$pdf" 2>/dev/null | tail -n +3 | wc -l)
  [ "$chars" -lt 5 ] && [ "$imgs" -eq 0 ] && empty="$empty $n"
done
if [ -z "$empty" ]; then pass "empty pages (${pages:-0} pages)"; else fail "empty pages: page$empty"; fi

unemb=$(pdffonts "$pdf" 2>/dev/null | tail -n +3 | awk '$(NF-4) != "yes" {print $1}')
if [ -z "$unemb" ]; then pass fonts; else fail "fonts not embedded: $(echo $unemb)"; fi

if [ -n "$files" ]; then
  missing=$(printf '%s' "$json" | python3 -I -c '
import sys, json, os
for f in json.load(sys.stdin)["files"]:
    if not os.path.exists(os.path.join(sys.argv[1], f)): print("     " + f + " is not in " + sys.argv[1])' "$files")
  if [ -z "$missing" ]; then pass "files ($(info 'len(d["files"])') named)"; else fail "files"; echo "$missing"; fi
else
  n=$(info 'len(d["files"])'); [ "$n" -eq 0 ] || echo "NOTE files: $n file name(s) shown; pass --files <dir> to check they exist"
fi

if [ -n "$claims" ] && [ ! -f "$claims" ]; then
  fail "claims: ledger $claims not found"
elif [ -n "$claims" ]; then
  if out=$(python3 -I "$here/check-claims.py" "$claims" "$(dirname "$html")" 2>&1); then pass "claims ($out)"; else fail "claims"; printf '%s\n' "$out" | sed 's/^/     /'; fi
elif [ "$noclaims" -eq 1 ]; then
  echo "NOTE claims: --no-claims: the document makes no claim about a system"
else
  fail "claims: no ledger; give --claims <ledger.md>, or --no-claims for a document that states nothing about a system"
fi

u=$(info 'd["unverified"]')
[ "$u" -eq 0 ] || echo "NOTE $u unverified claim(s) are marked in the document: each stays marked, or is checked or removed, before it is sent"
exit $status
