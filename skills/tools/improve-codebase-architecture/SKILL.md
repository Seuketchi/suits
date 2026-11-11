---
name: improve-codebase-architecture
description: Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick. Use when asked where the code should be deepened and no module is named. Asks before it starts a sub-agent.
---

# Improve Codebase Architecture

Find architectural friction and propose **deepening opportunities**: refactors that turn shallow modules into deep ones, for testability and AI-navigability.

Two sources inform the work:

- **Architecture vocabulary.** Call the Skill tool with "codebase-design" for the terms (**module**, **interface**, **depth**, **seam**, **adapter**, **leverage**, **locality**) and principles (the deletion test, "the interface is the test surface", "one adapter = hypothetical seam, two = real"). Use these terms exactly in every suggestion, never "component," "service," "API," or "boundary."
- **Domain model.** The language in `CONTEXT.md` names good seams. ADRs in `docs/adr/` record decisions this command must not re-litigate.

## Before you start

This skill starts a sub-agent and writes a report. Say so and wait for a yes before either, unless the request already asked for the survey.

## Process

### 1. Explore

**Scope before you scan: YAGNI.** Deepening pays off by making future changes easier, so weight the parts of the codebase that changed recently. Decide *where* to look before you look:

- If the user named a direction (a module, a subsystem, a pain point), take it and skip the inference below.
- Otherwise, walk back a good stretch of `git log --oneline` to find the hot spots: the files and areas that keep coming up. Look there first. If the changes are scattered with no clear hot spot, widen the net.

Read `CONTEXT.md` and any ADRs in the area first.

Then spawn a sub-agent to walk the codebase. Explore organically rather than by rigid heuristics, and note where you hit friction:

- Where does understanding one concept mean bouncing between many small modules?
- Where are modules **shallow**, with an interface nearly as complex as the implementation?
- Where were pure functions extracted just for testability, while the real bugs hide in how they're called (no **locality**)?
- Where do tightly coupled modules leak across their seams?
- Which parts are untested, or hard to test through their current interface?

Apply the **deletion test** to anything you suspect is shallow: would deleting it concentrate complexity, or just move it? "Concentrates" is the signal you want.

### 2. Present candidates as an HTML report

1. Write a self-contained HTML file to the OS temp directory, so nothing lands in the repo. Resolve the temp dir from `$TMPDIR`, falling back to `/tmp` (or `%TEMP%` on Windows). Write to `<tmpdir>/architecture-review-<timestamp>.html` so each run gets a fresh file.
2. Open it for the user (`xdg-open <path>` on Linux, `open <path>` on macOS, `start <path>` on Windows) and tell them the absolute path.

Build the report with **Tailwind via CDN** for layout and styling, and **Mermaid via CDN** for graph-shaped diagrams (call graphs, dependencies, sequences). Mix Mermaid with hand-built divs/SVG for more editorial visuals (mass diagrams, cross-sections, collapse animations). Every candidate gets a **before/after visualisation**. Be visual.

Each candidate is a card with:

- **Files**: the files/modules involved
- **Problem**: why the current architecture causes friction
- **Solution**: plain-English description of what would change
- **Benefits**: in terms of locality and leverage, and how tests would improve
- **Before / After diagram**: side by side, custom-drawn, showing the shallowness and the deepening
- **Recommendation strength**: `Strong`, `Worth exploring`, or `Speculative`, rendered as a badge

End the report with a **Top recommendation** section: which candidate to tackle first, and why.

**Use CONTEXT.md vocabulary for the domain and `/suits:codebase-design` vocabulary for the architecture.** If `CONTEXT.md` defines "Order," say "the Order intake module," not "the FooBarHandler" or "the Order service."

**ADR conflicts**: surface a candidate that contradicts an existing ADR only when the friction is real enough to reopen the ADR. Mark it in the card with a warning callout (e.g. _"contradicts ADR-0007, but worth reopening because…"_). Leave out theoretical refactors an ADR forbids.

See [HTML-REPORT.md](HTML-REPORT.md) for the HTML scaffold, diagram patterns, and styling.

Propose no interfaces yet. Once the file is written, ask the user: "Which of these would you like to explore?"

### 3. Grilling loop

When the user picks a candidate, call the Skill tool with "grilling" to walk the decision tree with them: constraints, dependencies, the shape of the deepened module, what sits behind the seam, which tests survive.

Call the Skill tool with "domain-modeling" and keep the domain model current as decisions crystallise, inline:

- **Naming a deepened module after a concept not in `CONTEXT.md`?** Add the term to `CONTEXT.md`, creating the file if it doesn't exist.
- **Sharpening a fuzzy term?** Update `CONTEXT.md` right there.
- **User rejects the candidate for a reason a future review would need?** Offer an ADR: _"Want me to record this as an ADR so future architecture reviews don't re-suggest it?"_ Offer only when a future explorer would need the reason to avoid re-suggesting the same thing. Skip ephemeral reasons ("not worth it right now") and self-evident ones.
- **Exploring alternative interfaces for the deepened module?** Call the Skill tool with "codebase-design" and use its design-it-twice parallel sub-agent pattern.
