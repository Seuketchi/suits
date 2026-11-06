#!/usr/bin/env bash
# Everything that can be checked about a finished PDF without opening a viewer.
#   review.sh <file.pdf> [out-dir] [dpi]
# Writes <out-dir>/page-NN.png for every page and <out-dir>/text.txt, runs the file check and the
# redaction audit, and prints the page count. Look at every PNG afterwards; this script cannot see
# overflow, clipping or a heading stranded at the foot of a page.
set -uo pipefail

[ $# -ge 1 ] || { echo "usage: review.sh <file.pdf> [out-dir] [dpi]" >&2; exit 2; }
pdf=$(realpath "$1")
dir=${2:-review}
dpi=${3:-70}
[ -f "$pdf" ] || { echo "review.sh: $pdf not found" >&2; exit 1; }
mkdir -p "$dir"
rm -f "$dir"/page-*.png
status=0

if command -v pdfcraft-cli >/dev/null 2>&1; then
  pages=$(pdfcraft-cli info "$pdf" | sed -n 's/^ *"pages": *\([0-9]*\).*/\1/p')
  [ -n "$pages" ] || { echo "review.sh: cannot read the page count of $pdf" >&2; exit 1; }
  for n in $(seq 1 "$pages"); do
    pdfcraft-cli render "$pdf" --page "$n" --dpi "$dpi" --out "$dir/$(printf 'page-%02d' "$n").png" >/dev/null 2>&1 || status=1
  done
  pdfcraft-cli text "$pdf" > "$dir/text.txt" || status=1
  # check exits 0 even for an unreadable file, so the verdict is read from its summary line
  verdict=$(pdfcraft-cli check "$pdf" 2>&1 | tail -1)
  if [[ $verdict =~ \{\"ok\":\ [0-9]+\}$ ]]; then echo "check: ok"; else echo "check: FAILED ($verdict)"; status=1; fi
  pdfcraft-cli audit "$pdf" >/dev/null 2>&1 && echo "audit: no faux redactions" || { echo "audit: FAILED (faux redaction found)"; status=1; }
elif command -v pdftoppm >/dev/null 2>&1 && command -v pdftotext >/dev/null 2>&1; then
  pages=$(pdfinfo "$pdf" | sed -n 's/^Pages: *//p')
  pdftoppm -r "$dpi" -png "$pdf" "$dir/page" || status=1
  for f in "$dir"/page-*.png; do   # pdftoppm pads to the width of the count; match review.sh's page-NN
    b=${f##*/page-}; n=$((10#${b%.png})); [ "$f" = "$dir/$(printf 'page-%02d' "$n").png" ] || mv "$f" "$dir/$(printf 'page-%02d' "$n").png"
  done
  pdftotext -layout "$pdf" "$dir/text.txt" || status=1
  echo "pdfcraft-cli not found: used poppler; the file check and the redaction audit did NOT run"
else
  echo "review.sh: need pdfcraft-cli or poppler (pdftoppm, pdftotext, pdfinfo)" >&2; exit 1
fi
echo "pages: $pages"
echo "images: $dir/page-01.png .. page-$(printf '%02d' "$pages").png"
echo "text: $dir/text.txt"
exit $status
