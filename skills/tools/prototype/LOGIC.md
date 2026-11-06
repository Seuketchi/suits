# Logic Prototype

A single self-contained HTML file (a **shareable demo**) that lets anyone drive a state model by clicking buttons. Use it for questions about **business logic, state transitions, or data shape**: things that look fine on paper and feel wrong once pushed through real cases.

It's one file with nothing to install, so a non-developer (designer, PM, domain expert) can drive it. Write it in their language, not the code's.

## When this is the right shape

- "I'm not sure this state machine handles the edge case where X then Y."
- "Does this data model let me represent the case where..."
- "I want to feel out what the API should look like before writing it."
- Anything where someone wants to **press buttons and watch state change**.

For "what should this look like", use [UI.md](UI.md) instead.

## Process

### 1. State the question

Before any code, write one paragraph naming the state model and the question. Put it in a visible intro at the top of the demo, not only in a comment, so it can be checked later, live or AFK.

### 2. Isolate the logic in a portable module

Put the logic that answers the question in one `<script>` block, written as a small pure module that could drop into the real codebase later. The page is throwaway; this module isn't.

Pick the shape that fits the question, not the one easiest to wire to a page:

- **A pure reducer**, `(state, action) => state`: discrete events, a single state value.
- **A state machine**, explicit states and transitions: when "which actions are legal right now" is part of the question.
- **A small set of pure functions** over a plain data type: no current state, just transformations.
- **A class or module with a clear method surface**: when the logic owns ongoing internal state.

Keep it pure: no DOM, no `document`, no button handlers inside it. The page calls into the module; nothing flows back. Then the validated reducer / machine / function set lifts into the real module on its own.

### 3. Build the shareable HTML file

- One file of plain HTML/CSS/JS, everything inline. No framework, no bundler, no server. It opens by double-click and survives being emailed.
- Every label is in **domain language**: buttons and state read like the business, not the reducer. Explain in plain words what's happening.

Lay it out top to bottom:

1. **Title and one-line explanation** of what the demo explores (the question from step 1).
2. **Current state**: the full relevant state as a readable panel (labelled fields, not a raw JSON dump), re-rendered after every click. Call out what just changed where that helps a non-developer.
3. **Free-play buttons**: one per action, always available, usable in any order. Each click dispatches its action and re-renders the state.
4. **Guided walkthroughs**: one **scenario** per tab. Each tab holds a short plain-language description (the situation it sets up, what to watch for) and, under it, the ordered **buttons to press**. Each step is a real button: clicking it performs the action and moves to the next step. Starting a walkthrough resets to a known initial state, so the scenario runs the same way every time.

Pick scenarios that show the cases hard to reason about on paper: the happy path, a tricky edge case, an attempt at something that should be illegal.

Style: clean typography, generous spacing, one accent colour. No animations or gimmicks competing with the state and the buttons.

### 4. Hand it over

Send the file or open it for them. They'll click through when they get to it. Listen for "wait, that shouldn't be possible" or "huh, I assumed X would be different": those are bugs in the _idea_, which is what the prototype is for. Add new actions or scenarios when they ask.

### 5. Capture the answer and the prototype

Once the prototype has answered its question, capture the answer, then capture the prototype as the [SKILL](SKILL.md) describes. For a logic prototype:

- The validated reducer / machine / function set lifts into the real module (the decision, absorbed).
- The HTML shell goes to the throwaway branch that keeps the prototype as a primary source. As one self-contained file, it stays trivially re-runnable there.

## Anti-patterns

- **Tests.** A prototype that needs tests is no longer a prototype.
- **The real database.** Use in-memory state unless the question is about persistence.
- **Generalising.** No "what if we wanted to support X later". It answers one question.
- **Logic blurred into the page.** If the pure module references the DOM, `document`, or button handlers, it can't be lifted. Keep the page a thin shell over the module.
- **A framework, bundler, or server.** A React app or a dev server defeats "shareable".
- **Shipping the HTML shell to production.** The page is built for clicking through by hand; the logic module is what's worth keeping.
