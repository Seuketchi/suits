# A hook holds the read-only versions to reading

Date: 2026-11-11

## Context

ADR 0007 gave louis, mike and rachel read-only versions, and left `Bash` open: the definition file cannot limit `Bash` to reading, and the body's sentence was the only limit. Settings hooks written in a definition's front matter are ignored for a plugin's definitions. Plugin-level hooks do run inside a session another session started, so a hook can hold `Bash` if it can tell who is calling.

That was run, not assumed. A throwaway plugin with a `Bash` hook and a definition that listed `Bash`, started with `claude -p --plugin-dir`, logged what the hook was given:

- A call made by the other session carried its id and its type, written `<plugin>:<name>` (`suits:louis`). The call the main session made carried neither.
- The mod `tool.call` event carries `agentId` for the same call and none for the main session's. `$.agent.list()` gives that id's type.

## Decision

`hooks/register.tsx` has a `tool.call` hook on `Bash`. It denies a command when the call comes from a session whose type is `suits:louis`, `suits:mike` or `suits:rachel`, and runs every other call, the main session's included, as before. The plugin name is read from the plugin, so the check follows a renamed install.

The decision is the pure `checkReadOnly` in `hooks/readonly.mjs`. It allows a command only when every part of it is a read, where the parts are split at `;`, a newline, `&&`, `||` and `|`:

- Allowed commands: `git` (`log`, `show`, `diff`, `grep`, `blame`, `status`, `ls-files`, `rev-parse`, `cat-file` and the other read subcommands, `branch --show-current`, `config --get`, `stash list`, `tag -l`, `worktree list`, `remote -v`), `gh` (`pr view|diff|list|status|checks`, `issue`, `run`, `repo` and `release` views and lists, `search`, and `api` without a method, field or input option), `grep`, `rg`, `cat`, `ls`, `find`, `head`, `tail`, `wc`, `sort`, `uniq`, `cut`, `tr`, `jq`, `diff`, `stat`, `du`, `cd`, `echo` and a few more of the same kind.
- Denied inside those: `find` with `-delete`, `-exec`, `-execdir`, `-ok`, `-okdir` or `-fprint*`; `rg --pre`; `sort -o`; `uniq` with two files; `git -c`; `git` with `--output`, `--ext-diff` or `-O`; `gh api` with `-X`, `-f`, `-F` or `--input`.
- Denied outright: every other command (`rm`, `mv`, `cp`, `tee`, `sed`, `awk`, `xargs`, a shell, an interpreter, an installer, `curl`), every other `git` and `gh` subcommand (`commit`, `push`, `checkout`, `fetch`, `pr create`, `pr merge`), a variable assignment before a command, and a command named by a path.
- Fails closed on what it cannot follow: redirection to anything but `/dev/null` (`2>&1` is allowed), `<`, command substitution, variable expansion, a group or subshell, a background job, a comment, a line continuation, an unclosed quote, an empty part, a control character, and a command longer than 16384 characters.

The denial says which version is read-only, names this ADR and gives the part that stopped it, and the owner sees a toast. The body of each `agents/*.md` says a hook blocks such commands and tells the version to report one that was blocked.

If the check itself fails on a call from another session, the call is denied unless the session's type can be read and is not one of the three. The main session's calls are never held.

## Consequences

- "Edit nothing" holds for these three through `Bash` as well, except for what an allowed command writes as a side effect that its options do not control (`git status` refreshing the index, `git log` reading a pager setting).
- A new read-only version adds a name in `agents/` and in `READ_ONLY` in `hooks/readonly.mjs`; a test fails when the two lists differ.
- The list errs towards denial. A read the list misses is denied, and the version reports it; the fix is to add the command to `COMMANDS` with a test, not to loosen the parser.
- `claude --agent suits:louis`, which starts the definition as the main session, is not held: the main session's calls carry no type, so the hook cannot tell it from the owner's own session. The tool list still applies.
- The hook is part of the plugin and no longer reads only the project's rules file (ADR 0005); this one rule is the plugin's own, about its own versions, and applies in every project.
- A shell started by an allowed command (`git` with a pager or an alias that runs a program set in the user's own config) is outside what the list can see.
