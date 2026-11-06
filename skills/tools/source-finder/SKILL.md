---
name: source-finder
description: Use when searching for academic sources to support a thesis claim, fill a citation gap, or build a literature review section. Uses real web searches to find and verify papers — never surfaces a citation without confirmation it exists.
---

# Source Finder Skill

## Purpose

Find real, verifiable academic papers that support a specific thesis claim or topic area.
This skill never outputs a citation without first confirming it exists via web search.

## Modes

Choose the mode based on what the user provides:

| User provides | Mode |
|---|---|
| A claim or sentence that needs a citation | **Claim mode** |
| A topic or keyword | **Topic mode** |
| A gap ("I need more sources on X") | **Gap-fill mode** |

---

## Mode 1 — Claim Mode

When the user provides a specific claim that needs a citation:

1. **Parse the claim** — identify the key assertion (e.g., "RL agents trained in simulation can transfer to physical hardware")
2. **Extract search terms** — pick 2–3 specific technical terms from the claim; avoid generic terms
3. **Run searches** — use WebSearch with these query forms in order:
   - `"[specific term]" [related term] site:arxiv.org`
   - `"[specific term]" [related term] site:ieeexplore.ieee.org`
   - `"[specific term]" [related term] site:semanticscholar.org`
   - `[claim paraphrase] academic paper [year range]`
4. **Fetch and verify** — for each promising result, use WebFetch on the abstract page to confirm the paper (a) exists, (b) has an accessible title/author/year, and (c) its abstract actually supports the claim
5. **Score relevance** — rate each verified paper: Direct / Partial / Background
6. **Return results** in the output format below

---

## Mode 2 — Topic Mode

When the user provides a topic or keyword for literature review:

1. Search broadly: `[topic] survey OR review [year range] site:arxiv.org OR site:ieeexplore.ieee.org`
2. Also search: `[topic] state of the art [year]` (adjust the domain terms to the topic)
3. Find at least 5 papers; aim for a mix of:
   - 1–2 foundational/survey papers (can be older)
   - 2–3 recent papers (last 3 years preferred)
   - 1 paper from a venue the reader would recognize (IEEE, ACM, Springer, Elsevier)
4. Verify each via WebFetch before including
5. Return in output format

---

## Mode 3 — Gap-Fill Mode

When the user says a thesis section is missing citations:

1. Read the section text
2. Identify claims that are stated without evidence (facts, numbers, comparisons)
3. For each uncited claim, run Claim Mode
4. Also check: does the section cite primary sources, or does it over-rely on secondary ones? Flag if so.

---

## Search Rules

- **Never output a citation you have not searched for.** If search fails, say so.
- **Two attempts minimum** before declaring a paper unfindable — try different query forms.
- If a paper title appears in search results but the link is paywalled and no abstract is visible, note it as **Potentially valid — abstract not confirmed**.
- Prefer DOI links over plain URLs. If a DOI is visible in search results, include it.
- Prefer papers with clear authorship (named authors, not just "et al." in the snippet).

---

## Output Format

For each confirmed paper, output:

```
**[Author(s)] ([Year]). [Title]. [Journal/Conference].**
DOI: [if available] | URL: [direct link if available]
Relevance: [Direct / Partial / Background]
Why it fits: [1 sentence connecting the paper to the claim or thesis]
Suggested in-text cite: ([Author], [Year])
```

Group results as:
- **Strongly recommended** (Direct relevance, verified)
- **Also useful** (Partial or Background relevance, verified)
- **Could not verify** (searched but abstract/existence not confirmed — do not cite without manual check)

---

## Constraints

- Do not fabricate DOIs, page numbers, or volume numbers — only include what was visible in the search result or fetched page.
- If you find a paper that seems perfect but cannot confirm its abstract, say so explicitly rather than including it as verified.
- Check that the paper's domain actually overlaps the claim. A general result is weaker evidence for a specific deployment than a paper on that deployment.
