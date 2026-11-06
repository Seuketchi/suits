# UI Prototype

Build **several radically different UI variations** on one route, switched from a floating bottom bar. The user flips between them in the browser, picks one (or takes parts of several), and the rest are thrown away.

For questions about logic or state rather than looks, use [LOGIC.md](LOGIC.md) instead.

## When this is the right shape

- "What should this page look like?"
- "I want to see a few options for this dashboard before committing."
- "Try a different layout for the settings screen."
- Any time the user would otherwise weigh three vague mockups in their head.

## Two sub-shapes: prefer sub-shape A

A UI variant is easier to judge **inside the rest of the app**: real header, real sidebar, real data, real density. On an empty route every variant looks fine. Use sub-shape A whenever an existing page could plausibly host the variants.

### Sub-shape A: adjust an existing page (default)

The route exists. Render the variants **on that route**, gated by a `?variant=` URL search param. Existing data fetching, params, and auth stay; only the rendering swaps.

Something with no page yet that would naturally live inside one (a new dashboard section, a new card on the settings screen, a new step in an existing flow) is still sub-shape A: mount the variants inside the host page.

### Sub-shape B: a new page (last resort)

Use only when the thing has no existing page to live in (an entirely new top-level surface, or a flow that can't sensibly be embedded). First check again that no existing page could host it: an empty route hides design problems a populated one exposes.

Create a **throwaway route** following the project's existing routing convention; add no new top-level structure. Name it so it's obviously a prototype (e.g. `prototype` in the path or filename). Same `?variant=` pattern.

The floating bottom bar is identical in both sub-shapes.

## Process

### 1. State the question and pick N

Default to **3 variants**, at most 5; past that they stop being radically different.

Write the plan in one line, in the prototype's location or a top-of-file comment:

> "Three variants of the settings page, switchable via `?variant=`, on the existing `/settings` route."

### 2. Generate radically different variants

Draft each variant against:

- The page's purpose and the data it can access.
- The project's component library / styling system (TailwindCSS, shadcn, MUI, plain CSS, whatever).
- A clear exported component name, e.g. `VariantA`, `VariantB`, `VariantC`.

Variants are **structurally different**: different layout, information hierarchy, and primary affordance, not just colours. If two drafts come out too similar, redo one with explicit guidance such as "do not use a card grid".

### 3. Wire them together

Create one switcher component on the route:

```tsx
// pseudo-code, adapt to the project's framework
const variant = searchParams.get('variant') ?? 'A';
return (
  <>
    {variant === 'A' && <VariantA {...data} />}
    {variant === 'B' && <VariantB {...data} />}
    {variant === 'C' && <VariantC {...data} />}
    <PrototypeSwitcher variants={['A','B','C']} current={variant} />
  </>
);
```

- **Sub-shape A**: keep all existing data fetching above the switcher; only the rendered subtree changes per variant.
- **Sub-shape B**: the throwaway route under `/sample/<name>` mounts the same switcher.

### 4. Build the floating switcher

A small fixed-position bar at the bottom centre of the screen, with three pieces:

- **Left arrow**: previous variant (wraps around).
- **Variant label**: the current variant key, plus its name if the variant exports one, e.g. `B (Sidebar layout)`.
- **Right arrow**: next variant (wraps around).

Behaviour:

- An arrow click updates the URL search param through the framework's router (e.g. `router.replace` on Next, `navigate` on React Router), so the variant is shareable and survives reload.
- `←` and `→` keys also cycle, except when an `<input>`, `<textarea>`, or `[contenteditable]` has focus.
- It looks distinct from the page (e.g. high-contrast pill, subtle shadow), so it's obviously not part of the design under review.
- It's hidden in production builds: gate it on `process.env.NODE_ENV !== 'production'` or an equivalent, so a stray prototype merge can't ship it to users.

Make it one shared component, reused by both sub-shapes, placed wherever the project keeps shared UI.

### 5. Hand it over

Give the URL and the `?variant=` keys. The user flips through when they get to it. The useful feedback is usually "I want the header from B with the sidebar from C": that's the design they want.

### 6. Capture the answer and clean up

Once a variant wins, capture the answer (which variant and why), then capture the prototype as the [SKILL](SKILL.md) describes. Fold the winner into the real code and move the rest to the throwaway branch, not main:

- **Sub-shape A**: fold the winner into the existing page; drop the losing variants and the switcher from main.
- **Sub-shape B**: promote the winner to a real route; drop the throwaway route and the switcher from main.

The full set of variants is the primary source, so it goes to the throwaway branch, not the bin. Variants and a switcher left on main rot fast and confuse the next reader.

## Anti-patterns

- **Variants that differ only in colour or copy.** That's a tweak. Real variants disagree about structure.
- **Too much shared code between variants.** A shared `<Header>` is fine; a shared `<Layout>` defeats the point. Each variant is free to throw out the layout.
- **Real mutations.** Read-only is fine. A variant that must mutate points at a stub: the question is how it looks, not whether the backend works.
- **Promoting the prototype straight to production.** Variant code was written without tests and with minimal error handling. Rewrite it properly when you fold it in.
