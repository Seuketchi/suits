# ADR Format

ADRs live in `docs/adr/`, numbered sequentially: `0001-slug.md`, `0002-slug.md`, etc.

Create `docs/adr/` lazily, when the first ADR is needed.

## Template

```md
# {Short title of the decision}

{1-3 sentences: what's the context, what did we decide, and why.}
```

A single paragraph is a complete ADR. What it records is *that* a decision was made and *why*; there are no sections to fill.

## Optional sections

Add these only when they carry something. Most ADRs need none.

- **Status** frontmatter (`proposed | accepted | deprecated | superseded by ADR-NNNN`): when decisions get revisited
- **Considered Options**: when the rejected alternatives are worth remembering
- **Consequences**: when non-obvious downstream effects need calling out

## Numbering

Find the highest existing number in `docs/adr/` and add one.

## When to offer an ADR

All three must be true:

1. **Hard to reverse**: changing your mind later has a meaningful cost
2. **Surprising without context**: a future reader will look at the code and wonder "why on earth did they do it this way?"
3. **The result of a real trade-off**: there were genuine alternatives, and you picked one for specific reasons

Skip it if the decision is easy to reverse (you'll just reverse it), unsurprising (nobody will wonder), or had no real alternative (there's nothing to record beyond "we did the obvious thing").

### What qualifies

- **Architectural shape.** "We're using a monorepo." "The write model is event-sourced, the read model is projected into Postgres."
- **Integration patterns between contexts.** "Ordering and Billing communicate via domain events, not synchronous HTTP."
- **Technology choices that carry lock-in.** Database, message bus, auth provider, deployment target. Only the ones that would take a quarter to swap out, not every library.
- **Boundary and scope decisions.** "Customer data is owned by the Customer context; other contexts reference it by ID only." The explicit no-s are as valuable as the yes-s.
- **Deliberate deviations from the obvious path.** "We're using manual SQL instead of an ORM because X." Anything where a reasonable reader would assume the opposite. These stop the next engineer from "fixing" something deliberate.
- **Constraints not visible in the code.** "We can't use AWS because of compliance requirements." "Response times must be under 200ms because of the partner API contract."
- **Rejected alternatives when the rejection is non-obvious.** If you considered GraphQL and picked REST for subtle reasons, record it, or someone will suggest GraphQL again in six months.
