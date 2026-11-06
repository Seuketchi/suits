#!/usr/bin/env python3
"""Check a claims ledger: every claim the document makes about a system, with its source and the source's words.

    check-claims.py <ledger.md> [root]

The ledger is a Markdown table: | Claim | Source | Source's words | Status |
Status is verified, unverified (marked in the document) or removed. A verified row needs a source and the
source's words; when the source is a local file (path or path:line), the words must appear in it, word for
word (whitespace aside). A URL is not read here: the row says it was, and that is for the reviewer to spot-check.
"""
import os, re, sys

def cells(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]

def squash(s):
    return re.sub(r"\s+", " ", s.replace("’", "'").replace("“", '"').replace("”", '"')).strip().lower()

def main():
    path = sys.argv[1]
    root = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.abspath(path))
    rows = [cells(l) for l in open(path, encoding="utf-8") if l.strip().startswith("|")]
    rows = [r for r in rows if not all(re.fullmatch(r":?-{3,}:?", c) for c in r)]
    if len(rows) < 2:
        print("ledger has no rows; a document with no claims about a system uses --no-claims"); return 1
    head = [squash(c) for c in rows[0]]
    try:
        ic, isrc, iq, ist = [next(i for i, h in enumerate(head) if h.startswith(k)) for k in ("claim", "source", "source's words", "status")]
    except StopIteration:
        print("ledger header must be: Claim | Source | Source's words | Status"); return 1
    bad, counts = [], {"verified": 0, "unverified": 0, "removed": 0}
    for n, r in enumerate(rows[1:], 1):
        r += [""] * (4 - len(r))
        claim, src, quote, status = r[ic], r[isrc], r[iq].strip("`\"' "), squash(r[ist])
        if not claim: bad.append(f"row {n}: no claim"); continue
        if status not in counts: bad.append(f"row {n} ({claim[:40]}): status must be verified, unverified or removed"); continue
        counts[status] += 1
        if status != "verified": continue
        if not src: bad.append(f"row {n} ({claim[:40]}): no source"); continue
        if not quote: bad.append(f"row {n} ({claim[:40]}): no source's words"); continue
        if re.match(r"https?://", src): continue
        f = re.sub(r":\d+(-\d+)?$", "", src.strip("` "))
        found = next((p for p in (f, os.path.join(root, f), os.path.join(os.path.dirname(os.path.abspath(path)), f)) if os.path.isfile(p)), None)
        if not found: bad.append(f"row {n} ({claim[:40]}): source file {f} not found"); continue
        if squash(quote) not in squash(open(found, encoding="utf-8", errors="replace").read()):
            bad.append(f"row {n} ({claim[:40]}): the source's words are not in {f}")
    if bad:
        print("\n".join(bad)); return 1
    print(f"{counts['verified']} verified, {counts['unverified']} unverified, {counts['removed']} removed"); return 0

sys.exit(main())
