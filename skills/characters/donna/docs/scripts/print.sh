#!/usr/bin/env bash
# Print an HTML file to PDF with headless Chrome, then report the page count.
#   print.sh <input.html> <output.pdf>
set -euo pipefail

[ $# -eq 2 ] || { echo "usage: print.sh <input.html> <output.pdf>" >&2; exit 2; }
html=$(realpath "$1")
out=$(realpath -m "$2")
[ -f "$html" ] || { echo "print.sh: $html not found" >&2; exit 1; }

chrome=${CHROME:-}
if [ -z "$chrome" ]; then
  for c in google-chrome google-chrome-stable chromium chromium-browser chrome; do
    command -v "$c" >/dev/null 2>&1 && { chrome=$c; break; }
  done
fi
[ -n "$chrome" ] || { echo "print.sh: no Chrome or Chromium on PATH; set CHROME=/path/to/chrome" >&2; exit 1; }

profile=$(mktemp -d)               # a fresh profile, so a running Chrome cannot swallow the job
trap 'rm -rf "$profile"' EXIT
mkdir -p "$(dirname "$out")"
rm -f "$out"                       # a stale PDF must never pass for this run's output

"$chrome" --headless=new --disable-gpu --no-sandbox --user-data-dir="$profile" \
  --no-pdf-header-footer --print-to-pdf="$out" "file://$html" >/dev/null 2>&1 || true

[ -s "$out" ] || { echo "print.sh: Chrome wrote no PDF for $html" >&2; exit 1; }
if command -v pdfcraft-cli >/dev/null 2>&1; then
  pages=$(pdfcraft-cli info "$out" | sed -n 's/^ *"pages": *\([0-9]*\).*/\1/p')
elif command -v pdfinfo >/dev/null 2>&1; then
  pages=$(pdfinfo "$out" | sed -n 's/^Pages: *//p')
fi
echo "wrote $out (${pages:-unknown} pages)"
