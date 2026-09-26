# Design It Twice

When the user wants to explore alternative interfaces for a chosen deepening candidate, use this parallel sub-agent pattern. From Ousterhout's "Design It Twice": your first idea is unlikely to be the best.

Uses the vocabulary in [SKILL.md](SKILL.md): **module**, **interface**, **seam**, **adapter**, **leverage**.

## Process

### 1. Frame the problem space

Before spawning sub-agents, write the user an explanation of the candidate's problem space:

- The constraints any new interface must satisfy.
- The dependencies it would rely on, and their category (see [DEEPENING.md](DEEPENING.md)).
- A rough code sketch that makes the constraints concrete. It illustrates; it is not a proposal.

Show this to the user, then go straight to step 2. The user reads while the sub-agents work.

### 2. Spawn sub-agents

Spawn 3+ sub-agents in parallel. Each must produce a **radically different** interface for the deepened module.

Give each sub-agent its own technical brief, separate from the user-facing explanation in step 1: file paths, coupling details, dependency category (from [DEEPENING.md](DEEPENING.md)), and what sits behind the seam. Include the vocabulary from both [SKILL.md](SKILL.md) and CONTEXT.md, so each design names things in the architecture language and the project's domain language.

Give each agent a different design constraint:

- Agent 1: "Minimize the interface: aim for 1–3 entry points max. Maximise leverage per entry point."
- Agent 2: "Maximise flexibility: support many use cases and extension."
- Agent 3: "Optimise for the most common caller: make the default case trivial."
- Agent 4 (if applicable): "Design around ports & adapters for cross-seam dependencies."

Each sub-agent outputs:

1. Interface (types, methods, params, plus invariants, ordering, error modes)
2. Usage example showing how callers use it
3. What the implementation hides behind the seam
4. Dependency strategy and adapters (see [DEEPENING.md](DEEPENING.md))
5. Trade-offs: where leverage is high, where it's thin

### 3. Present and compare

1. Present the designs one at a time, so the user can absorb each.
2. Compare them in prose by **depth** (leverage at the interface), **locality** (where change concentrates), and **seam placement**.
3. Recommend the design you think is strongest, and say why. Where elements of different designs combine well, propose a hybrid. Give one strong read, not a menu.
