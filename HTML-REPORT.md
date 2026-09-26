# HTML Report Format

Render the architectural review as one self-contained HTML file in the OS temp directory. Tailwind and Mermaid both load from CDNs. Use Mermaid for graph-shaped diagrams, and hand-built divs and inline SVG for editorial visuals (mass diagrams, cross-sections). Mix the two, so the report doesn't look generic.

## Scaffold

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Architecture review for {{repo name}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="module">
      import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
      mermaid.initialize({ startOnLoad: true, theme: "neutral", securityLevel: "loose" });
    </script>
    <style>
      /* small custom layer for things Tailwind doesn't cover cleanly:
         dashed seam lines, hand-drawn-feeling arrow heads, etc. */
      .seam { stroke-dasharray: 4 4; }
      .leak { stroke: #dc2626; }
      .deep { background: linear-gradient(135deg, #0f172a, #1e293b); }
    </style>
  </head>
  <body class="bg-stone-50 text-slate-900 font-sans">
    <main class="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <header>...</header>
      <section id="candidates" class="space-y-10">...</section>
      <section id="top-recommendation">...</section>
    </main>
  </body>
</html>
```

## Header

Repo name, date, and a compact legend: solid box = module, dashed line = seam, red arrow = leakage, thick dark box = deep module. No introduction paragraph; go straight into the candidates.

## Candidate card

The diagrams carry the weight. Prose is sparse and plain, and uses the glossary terms (from the `/codebase-design` skill) without ceremony.

Each candidate is one `<article>`:

- **Title**: short, names the deepening (e.g. "Collapse the Order intake pipeline").
- **Badge row**: recommendation strength (`Strong` = emerald, `Worth exploring` = amber, `Speculative` = slate), plus a tag for the dependency category (`in-process`, `local-substitutable`, `ports & adapters`, `mock`).
- **Files**: monospaced list, `font-mono text-sm`.
- **Before / After diagram**: the centrepiece. Two columns, side by side. See the patterns below.
- **Problem**: one sentence. What hurts.
- **Solution**: one sentence. What changes.
- **Wins**: bullets, ≤6 words each. e.g. "Tests hit one interface", "Pricing logic stops leaking", "Delete 4 shallow wrappers".
- **ADR callout** (if applicable): one line in an amber-tinted box.

No explanatory paragraphs. If a diagram needs a paragraph to be understood, redraw it.

## Diagram patterns

Pick the pattern that fits each candidate, and vary them across the report.

### Mermaid graph (the workhorse for dependencies / call flow)

Use a Mermaid `flowchart` or `graph` to show "X calls Y calls Z, and look at the mess." Wrap it in a Tailwind-styled card. Use classDef to colour leakage edges red and the deep module dark. Sequence diagrams suit "before: 6 round-trips; after: 1."

```html
<div class="rounded-lg border border-slate-200 bg-white p-4">
  <pre class="mermaid">
    flowchart LR
      A[OrderHandler] --> B[OrderValidator]
      B --> C[OrderRepo]
      C -.leak.-> D[PricingClient]
      classDef leak stroke:#dc2626,stroke-width:2px;
      class C,D leak
  </pre>
</div>
```

### Hand-built boxes-and-arrows (when Mermaid's layout fights you)

Modules as bordered, labelled `<div>`s. Arrows as inline SVG `<line>` or `<path>` elements positioned absolutely over a relative container. Use this when the "after" should read as one thick-bordered deep module with greyed-out internals; Mermaid can't give it that weight.

### Cross-section (good for layered shallowness)

Stack horizontal bands (`h-12 border-l-4`) for the layers a call passes through. Before: 6 thin layers each doing nothing. After: 1 thick band labelled with the consolidated responsibility.

### Mass diagram (good for "interface as wide as implementation")

Two rectangles per module: interface surface area and implementation. Before: the interface rectangle is nearly as tall as the implementation's (shallow). After: the interface is short and the implementation tall (deep).

### Call-graph collapse

Before: a tree of function calls as nested boxes. After: the same tree collapsed into one box, the now-internal calls faded inside it.

## Style guidance

- Editorial, not corporate dashboard. Generous whitespace. Serif headings optional (`font-serif` pairs well with stone/slate).
- Colour sparingly: one accent (emerald or indigo), red for leakage, amber for warnings.
- Keep diagrams ~320px tall so before/after sit side by side without scrolling.
- Label modules inside diagrams with `text-xs uppercase tracking-wider`, so they read as schematic, not UI.
- The only scripts are the Tailwind CDN and the Mermaid ESM import. Otherwise the report is static: no app code, no interactivity beyond Mermaid's own rendering.

## Top recommendation section

One larger card: candidate name, one sentence on why, and an anchor link to its card. Nothing else.

## Tone

Plain, concise English, with the architectural nouns and verbs taken straight from the `/codebase-design` skill. Stay on those terms even when compressing.

**Use exactly:** module, interface, implementation, depth, deep, shallow, seam, adapter, leverage, locality.

**Never substitute:** component, service, unit (for module) · API, signature (for interface) · boundary (for seam) · layer, wrapper (for module, when you mean module).

**Phrasings that fit the style:**

- "Order intake module is shallow: interface nearly matches the implementation."
- "Pricing leaks across the seam."
- "Deepen: one interface, one place to test."
- "Two adapters justify the seam: HTTP in prod, in-memory in tests."

**Wins bullets** name the gain in glossary terms: *"locality: bugs concentrate in one module"*, *"leverage: one interface, N call sites"*, *"interface shrinks; implementation absorbs the wrappers"*. Leave out *"easier to maintain"* and *"cleaner code"*: they aren't glossary terms.

No hedging or throat-clearing ("it's worth noting that…"). Turn a sentence into a bullet where you can, and cut a bullet where you can. Before inventing a term, reach for one in the `/codebase-design` glossary.
