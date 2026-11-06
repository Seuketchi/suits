#!/usr/bin/env python3
"""Flag machine-sounding prose in a finished document.

    check-prose.py < prose.json        (the "prose" list that check-dom.js writes: blocks of text in order)

Prints one line per finding and exits 1 if any is a FAIL. NOTE lines are tells that need a person's eye.
The catalogue follows the detection reference of the unslop skill (references/taboo-phrases.md: throat-clearing openers, emphasis
crutches, significance inflation, promotional language, AI vocabulary, superficial -ing tails, em-dash and exclamation overuse,
three-item lists, conclusion scaffolding), cut to what a document, a spec or a form would say. It adds the words the owner named.
Text in double quotes, in <code>, and in an element with class prose-ok is not judged: a quotation is somebody else's words.
"""
import json, re, sys

HARD = [   # (pattern, what it is)  case-insensitive, whole words
    (r"in today'?s (?:fast-paced|digital|modern|ever-changing|rapidly|world|landscape)", "stock opener"),
    (r"in (?:the|an) (?:ever-evolving|ever-changing|fast-paced) (?:world|landscape|field)", "stock opener"),
    (r"in the (?:world|realm) of", "stock opener"),
    (r"when it comes to", "stock opener"),
    (r"it(?:'s| is) (?:worth|important to|crucial to|essential to) (?:noting|note|mention|remember|understand)(?: that)?", "stock opener"),
    (r"(?:it is|it's) (?:important|crucial|essential|vital) (?:to|that)", "stock opener"),
    (r"needless to say", "stock opener"),
    (r"as we (?:all )?know", "stock opener"),
    (r"look no further", "stock opener"),
    (r"welcome to", "stock opener"),
    (r"whether you(?:'re| are) a", "stock opener"),
    (r"imagine (?:a world|if|a scenario)", "stock opener"),
    (r"let'?s (?:dive|delve|unpack|explore|break (?:this|it) down|take a look)", "workshop filler"),
    (r"here'?s (?:the thing|the deal|why|what)\b", "throat-clearing"),
    (r"(?:the )?(?:uncomfortable )?truth is", "throat-clearing"),
    (r"let me be (?:clear|honest)", "throat-clearing"),
    (r"make no mistake", "emphasis crutch"),
    (r"let that sink in", "emphasis crutch"),
    (r"full stop\b|\bperiod\.", "emphasis crutch"),
    (r"this (?:cannot|can't) be overstated", "emphasis crutch"),
    (r"(?:the )?(?:key|main) takeaway", "colon reveal"),
    (r"the bottom line is", "colon reveal"),
    (r"deliv(?:er|ers|ered|ering) (?:value|results|impact)", "business jargon"),
    (r"\bdelv(?:e|es|ed|ing)\b", "AI vocabulary"),
    (r"\bseamless(?:ly)?\b", "AI vocabulary"),
    (r"\brobust(?:ly|ness)?\b", "AI vocabulary"),
    (r"\bleverag(?:e|es|ed|ing)\b", "AI vocabulary"),
    (r"\b(?:cutting-edge|state-of-the-art|world-class|best-in-class|game[- ]chang(?:er|ing)|next-generation|groundbreaking|revolutionary|transformative)\b", "promotional"),
    (r"\b(?:tapestry|multifaceted|paramount|burgeoning|myriad|plethora|intricate|interplay|pivotal|testament|holistic|synergy|synergies)\b", "AI vocabulary"),
    (r"\b(?:aforementioned|henceforth|whereby|therein|notwithstanding|pertaining to)\b", "AI-formal word"),
    (r"\b(?:meticulous(?:ly)?|garner(?:s|ed)?|underscor(?:e|es|ed|ing)|resonat(?:e|es|ed) with)\b", "AI vocabulary"),
    (r"\b(?:unlock(?:s|ed|ing)?|empower(?:s|ed|ing)?|elevat(?:e|es|ed|ing)) (?:the |your |their |its )?(?:power|potential|full|experience|team|users?)", "promotional"),
    (r"\bnavigat(?:e|es|ed|ing) (?:the )?(?:complexit|challeng|landscape)", "business jargon"),
    (r"\b(?:sheds?|shed) light\b|\bpaints? a picture\b|\bstrikes? a balance\b|\bdouble-edged sword\b|\bload-bearing\b", "AI metaphor"),
    (r",\s+(?:highlighting|showcasing|underscoring|fostering|paving the way|demonstrating the importance)\b", "superficial -ing tail"),
    (r"\b(?:serves|stands|functions|acts) as a\b", "copula avoidance"),
    (r"\bnot only\b[^.]{1,80}\bbut (?:also|rather)\b|\bit'?s not just (?:about|a)\b", "negative parallelism"),
    (r"\b(?:isn'?t|aren'?t|is not|are not) (?:a |an |the )?[^,.;]{2,40}, (?:it'?s|they'?re|it is|they are) ", "contrastive definition"),
    (r"i hope this helps|great question|happy to help|let me know if you|feel free to", "chat artifact"),
    (r"\b(?:the future looks bright|exciting (?:times|journey)|only time will tell|continues to evolve)\b", "generic conclusion"),
    (r"\b(?:in conclusion|to sum up|to summari[sz]e|in summary|in short|all in all|overall,)", "conclusion scaffold"),
]
SOFT = [
    (r"\b(?:moreover|furthermore|additionally|nevertheless)\b", "AI transition word"),
    (r"\b(?:very|really|extremely|incredibly|truly)\b", "intensifier"),
    (r"\b(?:streamline|ensure that|comprehensive|ecosystem|landscape|journey)\b", "stock word"),
    (r"\bbottom line\b", "colon reveal"),
]
STOP = set("the a an and or but of to in on for with by at from as is are was were be been it its this that these those you your we our they their there here not no can will must should may do does did has have had which who what when where how than then so if into out up down over under about after before between per each any all one two three".split())

def mask(t):
    t = re.sub(r'"[^"]*"|“[^”]*”', lambda m: " " * len(m.group(0)), t)
    return t

def sentences(t):
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+(?=[A-Z\"“(])", t) if s.strip()]

def words(s):
    return [w for w in re.findall(r"[a-z][a-z-]{3,}", s.lower()) if w not in STOP]

def main():
    blocks = json.load(sys.stdin)
    fails, notes = [], []
    def add(kind, what, text, where):
        (fails if kind == "FAIL" else notes).append(f"{what}: \"{text.strip()[:70]}\" ({where})")
    triples, looser = [], []
    for b in blocks:
        t = b["text"]; tag = b["tag"]; m = mask(t); where = (b["sec"] or "top")[:30]
        if t in ("—", "-", "–"): continue                                 # an empty table cell
        for pat, what in HARD:
            for hit in re.finditer(pat, m, re.I): add("FAIL", what, m[max(0, hit.start() - 12):hit.end() + 20], where); break
        for pat, what in SOFT:
            hit = re.search(pat, m, re.I)
            if hit: add("NOTE", what, m[max(0, hit.start() - 12):hit.end() + 20], where)
        if "—" in m or re.search(r"\s–\s", m): add("FAIL", "em dash used as a pause (use a comma, a colon or a full stop)", m[:70], where)
        if "!" in m: add("FAIL", "exclamation mark", m[:70], where)
        if tag in ("p", "li", "dd", "figcaption"):
            for s in sentences(m):                                                  # three parallel items in a row: "quick, simple, and clear"
                x = re.search(r"\b([a-z][\w-]+), ([a-z][\w-]+),? (?:and|or) ([a-z][\w-]+)\b", s)   # three bare words: "quick, simple, and clear"
                if x and not (set(x.groups()) & STOP) and not re.search(r"\d", x.group(0)): triples.append((x.group(0), where)); continue
                x = re.search(r"\b([a-z][\w-]*(?: [a-z][\w-]*)?), ([a-z][\w-]*(?: [a-z][\w-]*)?),? (?:and|or) ([a-z][\w-]*(?: [a-z][\w-]*)?)\b", s)
                if x and not re.search(r"\d", x.group(0)): looser.append((x.group(0), where))   # a list of things: a person's eye, not a failure
    if len(triples) >= 3:
        for x, where in triples: add("FAIL", f"rule of three ({len(triples)} in this document)", x, where)
    else:
        for x, where in triples: add("NOTE", "three words in a row", x, where)
    for x, where in looser: add("NOTE", "three items in a row", x, where)
    # a closing sentence that says again what the section said
    secs = {}
    for b in blocks:
        if b["tag"] == "p" and b["sec"]: secs.setdefault(b["sec"], []).append(b["text"])
    for sec, ps in secs.items():
        sents = [s for p in ps for s in sentences(p)]
        if len(sents) < 3: continue
        last, rest = sents[-1], sents[:-1]
        wl = set(words(last))
        if len(wl) < 4: continue
        seen = set(words(sec) + [w for s in rest for w in words(s)])
        if len(wl & seen) / len(wl) >= 0.75: add("FAIL", "closing sentence repeats the section", last, sec[:30])
    for line in fails: print("FAIL " + line)
    for line in notes: print("NOTE " + line)
    return 1 if fails else 0

sys.exit(main())
