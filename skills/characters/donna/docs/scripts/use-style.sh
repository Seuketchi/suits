#!/usr/bin/env bash
# Copy a donna style beside a document's HTML: print.css (the Letterhead base), fonts/, and for another style its layer.
#   use-style.sh <letterhead|academic|engineering> <dir>
# Then link, in this order: tokens.css (the project's, when it has one), print.css, and for academic or engineering <style>.css.
set -euo pipefail
[ $# -eq 2 ] || { echo "usage: use-style.sh <letterhead|academic|engineering> <dir>" >&2; exit 2; }
style=$1; dir=$2
here=$(cd "$(dirname "${BASH_SOURCE[0]}")/../styles" && pwd)
[ -f "$here/$style.css" ] || { echo "use-style.sh: no style '$style' (letterhead, academic, engineering)" >&2; exit 2; }
mkdir -p "$dir"
cp "$here/letterhead.css" "$dir/print.css"
rm -rf "$dir/fonts"; cp -r "$here/fonts" "$dir/fonts"
rm -f "$dir/academic.css" "$dir/engineering.css"
if [ "$style" = letterhead ]; then
  echo "linked: print.css"
else
  cp "$here/$style.css" "$dir/$style.css"
  echo "linked: print.css, then $style.css"
fi
