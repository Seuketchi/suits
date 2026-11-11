# Characters name the kind of server they use, and ship none

Date: 2026-11-11

## Context

Some characters do better with a server the owner has connected: mike with a code search or code graph server, rachel with a web search or documentation server, jessica with the project's issue tracker, donna with a mail and calendar server. Naming one product would tie the plugin to one owner's setup, and shipping a server would make the plugin carry credentials and a runtime it has no reason to hold.

## Decision

The plugin ships no server and names no project's server. Mike, rachel, jessica and donna each have an `## If a server is connected` section, after **Hard rules**. It is three to five lines, in this order:

- the kind of server, as a category ("a code search or code graph server");
- what the character uses it for;
- what it does without one;
- the limit that still holds.

The limits do not loosen because a server is there. A hit from a server is a lead, not a citation. Jessica writes to a tracker only when the request says to and the breakdown is approved, and only reads one the owner has said is read-only. Donna drafts and never sends.

The section is prose. A plugin's `agents/` files ignore the `mcpServers` field, so the text is the only place a character can say what it does with a server.

## Consequences

- A character works the same with no server, using its own tools (`git grep`, its own fetch, the files it is pointed at) and saying that it has no server.
- The read-only versions in `agents/` list their tools, which drops every connected server's tools; they fall back as the section says (ADR 0007).
- Adding a server to a character's section means naming another kind, not a product.
