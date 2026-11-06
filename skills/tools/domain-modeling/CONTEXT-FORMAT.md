# CONTEXT.md Format

## Structure

```md
# {Context Name}

{One or two sentence description of what this context is and why it exists.}

## Language

**Order**:
{A one or two sentence description of the term}
_Avoid_: Purchase, transaction

**Invoice**:
A request for payment sent to a customer after delivery.
_Avoid_: Bill, payment request

**Customer**:
A person or organization that places orders.
_Avoid_: Client, buyer, account
```

## Rules

- **Be opinionated.** When several words name the same concept, pick the best and list the rest under `_Avoid_`.
- **Keep definitions tight.** One or two sentences. Define what the term IS, not what it does.
- **Only terms specific to this project's context.** General programming concepts (timeouts, error types, utility patterns) stay out, however much the project uses them. Before adding a term, ask whether it is unique to this context; add it only if so.
- **Group terms under subheadings** when natural clusters emerge. If every term belongs to one cohesive area, a flat list is fine.

## Single vs multi-context repos

**Single context (most repos):** one `CONTEXT.md` at the repo root.

**Multiple contexts:** a `CONTEXT-MAP.md` at the repo root lists the contexts, where they live, and how they relate:

```md
# Context Map

## Contexts

- [Ordering](./src/ordering/CONTEXT.md): receives and tracks customer orders
- [Billing](./src/billing/CONTEXT.md): generates invoices and processes payments
- [Fulfillment](./src/fulfillment/CONTEXT.md): manages warehouse picking and shipping

## Relationships

- **Ordering → Fulfillment**: Ordering emits `OrderPlaced` events; Fulfillment consumes them to start picking
- **Fulfillment → Billing**: Fulfillment emits `ShipmentDispatched` events; Billing consumes them to generate invoices
- **Ordering ↔ Billing**: Shared types for `CustomerId` and `Money`
```

Infer which structure applies:

- `CONTEXT-MAP.md` exists: read it to find the contexts.
- Only a root `CONTEXT.md` exists: single context.
- Neither exists: create a root `CONTEXT.md` lazily, when the first term is resolved.

With multiple contexts, infer which one the current topic belongs to. If unclear, ask.
