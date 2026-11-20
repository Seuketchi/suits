# The hooks ship as their own plugin

Date: 2026-11-20

## Context

The mod (the checklist and cast panes, the status line, helper mode, the project rules file and the read-only guard of ADR 0009) shipped inside the suits plugin. Some hosts that start Claude Code sessions on the owner's behalf turn off every installed plugin that registers hooks, because a hook runs inside every turn of every session. Such a host turned suits off whole, so none of the characters or tools could be called there.

## Decision

The marketplace lists two plugins. `suits`, at the repository root, holds the skills and the read-only versions, and registers no hooks. `suits-hooks`, under `plugins/suits-hooks/`, holds the mod, its types and its tests.

- The mod reads the character names from `plugins/suits-hooks/hooks/characters.json`, which `npm run lists` writes from the skill folders, because an installed plugin cannot read another's manifest.
- The read-only guard matches definitions of the `suits` plugin by name (`suits:louis`), not its own plugin's name.
- The mod's session values are declared under `suits-hooks`, the plugin that owns and writes them. The checklist tool is `mcp__suits-hooks__suits_checklist`.

## Consequences

- Where hooks are turned off, the characters still load, without the panes and without the read-only guard. The definitions' own tool lists still apply.
- Installing suits for the panes and guards is two lines: `suits@suits` and `suits-hooks@suits`. An existing install keeps working without the panes until `suits-hooks` is installed.
- `check-skills` validates both plugins, and CI runs `claude plugin test plugins/suits-hooks`.
