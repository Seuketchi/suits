---
name: to-spec
description: "Turn the current conversation into a spec: no interview, just synthesis of what you've already discussed. Drafts in chat, and publishes to the project issue tracker only when asked."
---

Turn what you already know (this conversation and your understanding of the codebase) into a spec. Synthesize; do not interview the user.

You need the issue tracker and the triage label vocabulary. If you weren't given them, ask the user where issues are tracked and which labels the project uses.

## Process

1. **Explore** the repo, if you haven't already. Use the project's domain glossary vocabulary throughout the spec, and respect any ADRs in the area you're touching.

2. **Sketch the seams** where you'll test the feature:
   - Prefer existing seams to new ones.
   - Use the highest seam possible. Propose any new seam at the highest point you can.
   - Fewer seams is better; the ideal is one.

   Done when the seams are proposed. If the user is here, ask them to confirm; if they are away, don't wait: write the seams into the spec as proposed and go on.

3. **Write, and publish only when asked.** Write the spec from the template below. Publish it to the project issue tracker and apply the `ready-for-agent` triage label (it needs no further triage) only when the request said to publish. Otherwise show the draft in chat and stop.

<spec-template>

## Problem Statement

The problem the user faces, from the user's perspective.

## Solution

The solution, from the user's perspective.

## User Stories

A LONG, numbered list of user stories covering every aspect of the feature. Each one reads:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

## Implementation Decisions

A list of the implementation decisions made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Leave out file paths and code snippets; they go stale fast.

Exception: when a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim it to the decision-rich parts, not a working demo.

## Testing Decisions

A list of the testing decisions made. Include:

- What makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (similar tests in the codebase)

## Out of Scope

What is out of scope for this spec.

## Further Notes

Any further notes about the feature.

</spec-template>
