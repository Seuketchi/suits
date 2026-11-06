#!/usr/bin/env python3
"""Put real, fillable PDF fields over the blanks that the Letterhead style draws.

    add-fields.py <in.pdf> <out.pdf> [--labels EXTRA,LABELS]

Chrome prints the page with its blanks drawn: a rule beside each .field label ("Name:"), a ballot box (the character
U+2610) at the start of each .ask.tick, and a ruled space under each .space label ("Working:", "Explain:"). This finds
them in the printed PDF and adds a text field over every rule, a checkbox on every ballot box and a multi-line field in
every space, with pdfcraft-cli. The positions are measured from the text (pdftotext -bbox) and tied to styles/letterhead.css:
a .space starts 31mm from the page edge (22mm margin, 9mm problem indent) and has the size set below. The Academic and Engineering styles place the blanks elsewhere: build a fillable sheet in Letterhead. A document that
changes those rules needs the constants below changed with them. Always render the result and look.
Writes <out.pdf> and a steps file beside it. Fills nothing: the reader does.
"""
import json, os, re, subprocess, sys, tempfile

PT_PER_MM = 72 / 25.4
LABELS = ["name", "section", "date", "score", "position", "signature"]   # .field labels, as printed before the colon; --labels adds more
SPACES = {"calculation": (152, 24), "working": (152, 46), "explain": (152, 34)}   # .space labels -> (width, height) in mm, as letterhead.css sets them
INLINE = {"answer": 80}                                                     # a .space.ans: the rule runs 80mm from its label
SPACE_X = 31 * PT_PER_MM                                                    # where a .space label starts: 22mm margin + 9mm indent
BOX = 4.4 * PT_PER_MM                                                       # the checkbox field laid over a ballot box
GAP = 7 * PT_PER_MM                                                         # the gap between fields on a row
RIGHT_EDGE = 595 - 22 * PT_PER_MM                                           # right text margin on A4

def words(pdf):
    """Printed words with their boxes: (page, x0, y0, x1, y1, text), y measured from the top of the page."""
    xml = subprocess.run(["pdftotext", "-bbox", pdf, "-"], capture_output=True, text=True, check=True).stdout
    out, page = [], 0
    for line in xml.splitlines():
        if "<page " in line: page += 1
        m = re.search(r'xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>', line)
        if m: out.append((page, *map(float, m.groups()[:4]), m.group(5)))
    return out

def main():
    args = sys.argv[1:]
    labels = list(LABELS)
    if "--labels" in args:
        i = args.index("--labels"); labels += [l.lower() for l in args[i + 1].split(",")]; del args[i:i + 2]
    src, dst = args[0], args[1]
    ws = words(src)
    steps = [{"tool": "doc_open", "args": {"path": os.path.abspath(src)}}]
    seen = {}
    def name(base):
        seen[base] = seen.get(base, 0) + 1
        return base if seen[base] == 1 and base not in ("tick", "answer", "working", "explain", "calculation") else f"{base}{seen[base]}"
    def same_line(p, y0, y1):
        return [w for w in ws if w[0] == p and abs(w[4] - y1) < 3.5]
    for p, x0, y0, x1, y1, t in ws:
        key = t.rstrip(":").lower()
        if t == "\u2610":                                                         # checkbox: a ballot box
            cx, cy = (x0 + x1) / 2, (y0 + y1) / 2 + 0.6
            steps.append({"tool": "form_add_field", "args": {"doc": 1, "page": p, "type": "checkbox", "name": name("tick"), "rect": [cx - BOX / 2, cy - BOX / 2, cx + BOX / 2, cy + BOX / 2]}})
        elif t.endswith(":") and key in SPACES and abs(x0 - SPACE_X) < 3 and not [w for w in same_line(p, y0, y1) if w[1] > x1]:   # handwriting space: its label alone on a line
            w, h = SPACES[key]
            by = y0 - 3
            steps.append({"tool": "form_add_field", "args": {"doc": 1, "page": p, "type": "text", "multiline": True, "name": name(key), "rect": [x0, y1 + 1, x0 + w * PT_PER_MM, by + h * PT_PER_MM - 1]}})
        elif t.endswith(":") and key in INLINE and abs(x0 - SPACE_X) < 3:          # the answer line: a text field right of its label
            steps.append({"tool": "form_add_field", "args": {"doc": 1, "page": p, "type": "text", "name": name(key), "rect": [x1 + 2, y0 - 2, x0 + INLINE[key] * PT_PER_MM, y1 + 2]}})
        elif t.endswith(":") and key in labels and all(w[5].endswith(":") or w[5] == "/" or w[5].isdigit() for w in same_line(p, y0, y1) if w[1] > x1):
            # a text field on the rule right of a .field label: nothing but other labels follows it on the line (a bold "Name:" that starts a sentence is prose)
            right = [w[1] for w in same_line(p, y0, y1) if w[1] > x1 + 8 and w[5].endswith(":") and w[5].rstrip(":").lower() in labels]
            of = [w[1] for w in same_line(p, y0, y1) if w[1] > x1 + 8 and w[5] == "/"]
            limit = min([r - GAP for r in right] + [o - 3 for o in of] + [RIGHT_EDGE])
            steps.append({"tool": "form_add_field", "args": {"doc": 1, "page": p, "type": "text", "name": name(key), "rect": [x1 + 2, y0 - 2, limit, y1 + 2]}})
    steps.append({"tool": "doc_save", "args": {"doc": 1, "path": os.path.abspath(dst), "full": True}})
    sf = os.path.splitext(dst)[0] + ".fields.json"
    json.dump(steps, open(sf, "w"), indent=1)
    r = subprocess.run(["pdfcraft-cli", "run", "--script", sf, "--report"], capture_output=True, text=True)
    if r.returncode != 0 or not os.path.exists(dst):
        print(r.stdout[-800:], r.stderr[-400:]); return 1
    print(f"added {len(steps) - 2} fields: {dst}")
    return 0

sys.exit(main())
