---
name: prototype
description: Build a throwaway prototype to answer a design question. Use when the user wants to sanity-check whether a state model or logic feels right, or explore what a UI should look like.
---

# Prototype

A prototype is **throwaway code that answers a question**. The question picks the shape.

## Pick a branch

Work out which question is being asked from the user's prompt or the surrounding code, or ask the user if they're around:

- **"Does this logic / state model feel right?"** → [LOGIC.md](LOGIC.md). A single shareable HTML file, with free-play buttons and tabbed guided walkthroughs, that pushes the state machine through cases hard to reason about on paper. A non-developer can drive it.
- **"What should this look like?"** → [UI.md](UI.md). Several radically different UI variations on one route, switched by a URL search param and a floating bottom bar.

The two branches build very different things, so a wrong pick wastes the prototype. If the question is ambiguous and the user isn't reachable, pick the branch that matches the surrounding code (a backend module → logic; a page or component → UI) and state that assumption at the top of the prototype.

## Rules for both branches

1. **Throwaway, and marked as such.** Put the prototype next to the module or page it's for, and name it so a casual reader sees it's a prototype, not production. A throwaway UI route follows the project's existing routing convention; add no new top-level structure.
2. **Trivial to run.** A UI prototype starts with one command in the project's task runner: `pnpm <name>`, `python <path>`, `bun <path>`, etc. A logic demo is one HTML file the user double-clicks.
3. **No persistence by default.** State lives in memory. If the question is about persistence, use a scratch DB or a local file with a clear "PROTOTYPE, wipe me" name.
4. **Skip the polish.** No tests, no abstractions, and only the error handling needed to make it run.
5. **Surface the state.** After every action (logic) or variant switch (UI), print or render the full relevant state so the user sees what changed.
6. **Capture it when done.**
   - Fold any validated decision into the real code.
   - Capture the prototype as a **primary source**: commit it to a throwaway branch, not main, and leave a context pointer to that branch on the implementation issue.
   - Record the answer (the verdict and the question it settled) in the issue or a commit.

   Main keeps only the validated decision.
