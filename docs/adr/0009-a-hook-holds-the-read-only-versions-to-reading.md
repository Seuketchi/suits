# A hook holds the read-only versions to reading

Date: 2026-11-11

## Context

ADR 0007 gave louis, mike and rachel read-only versions, and left `Bash` open: the definition file cannot limit `Bash` to reading, and the body's sentence was the only limit. Settings hooks written in a definition's front matter are ignored for a plugin's definitions. Plugin-level hooks do run inside a session another session started, so a hook can hold `Bash` if it can tell who is calling.

That was run, not assumed. A throwaway plugin with a `Bash` hook and a definition that listed `Bash`, started with `claude -p --plugin-dir`, logged what the hook was given:

- A call made by the other session carried its id and its type, written `<plugin>:<name>` (`suits:louis`). The call the main session made carried neither.
- The mod `tool.call` event carries `agentId` for the same call and none for the main session's. `$.agent.list()` gives that id's type.

## Decision

`hooks/register.tsx` has a `tool.call` hook on `Bash`. It denies a command when the call comes from a session whose type is `suits:louis`, `suits:mike` or `suits:rachel`, and runs every other call, the main session's included, as before. The plugin name is read from the plugin, so the check follows a renamed install.

The decision is the pure `checkReadOnly` in `hooks/readonly.mjs`. It allows a command only when every part of it is a read, where the parts are split at `;`, a newline, `&&`, `||` and `|`.

- Allowed commands: `git` (`log`, `show`, `diff`, `grep`, `blame`, `status`, `ls-files`, `rev-parse`, `cat-file` and the other read subcommands, `branch` with listing flags only, `config --get|--list`, `stash list|show`, `tag -l`, `worktree list`, and `remote` alone, as `-v` alone, or `show|get-url <name>`), `gh` (`pr view|diff|list|status|checks`, `issue`, `run`, `repo` and `release` views and lists, `search`, and `api` with a short list of options), `grep`, `rg`, `cat`, `ls`, `find`, `head`, `tail`, `wc`, `sort`, `uniq`, `cut`, `tr`, `jq`, `diff`, `stat`, `du`, `cd`, `echo` and a few more of the same kind.
- Options are allow-listed, not deny-listed, for the commands that have an option that writes or runs a program: `sort`, `uniq`, `file`, `rg`, `find` and `gh api`. Only the options listed are allowed, spelled in full; any other word that starts with `-` is denied, so `sort --out=x`, `file --compi`, `gh api -iXPOST` and `uniq - out` do not get past it. A lone `-` counts as a file. The other commands in the list have no such option and are not read against a list.
- `git` is read against the names it knows to be unsafe, because its read subcommands take too many options to list. `git` accepts any unambiguous prefix of a long option, so a word that starts `--output`, `--ext-diff` or `--open-files-in-pager` (`--out`, `--open`) is denied, and so is any short cluster in `git grep` that contains `O`. `git -c`, `git ls-remote` (its `--upload-pack` runs a program), `git remote -v add ...` and every other global option but `-C`, `--no-pager` and `--no-optional-locks` are denied.
- Denied outright: every other command (`rm`, `mv`, `cp`, `tee`, `sed`, `awk`, `xargs`, a shell, an interpreter, an installer, `curl`), every other `git` and `gh` subcommand (`commit`, `push`, `checkout`, `fetch`, `pr create`, `pr merge`), a variable assignment before a command, and a command named by a path.
- Fails closed on what it cannot follow: redirection to anything but `/dev/null` (`2>&1` is allowed; a quoted or escaped digit is a word, not a file descriptor), `<`, command substitution, variable and arithmetic expansion (`$x`, `$[..]`), unquoted brace and glob characters (`{ } * ? [`, which can build an option the check never saw; quote them), a group or subshell, a background job, a comment, a line continuation, an unclosed quote, an empty part, a control character, and a command longer than 16384 characters.

The denial says which version is read-only, names this ADR and gives the part that stopped it, and the owner sees a toast. The body of each `agents/*.md` says a hook blocks such commands and tells the version to report one that was blocked.

A call from another session is held only when its type is found and is one of the three. A session the list does not name has no type, and its call runs: this is chosen, and a test pins it. Holding it would deny `Bash` to loops the list never names (a workflow's, an engine fork) in every project that has the plugin installed, which costs more than the gap. The `Bash` hook event carries the id but not the type, so the list is the only place the type is read from. If the list itself cannot be read, the call is denied, because then the hook cannot tell the three from any other. The main session's calls are never held.

## Consequences

- "Edit nothing" holds for these three through `Bash` as well, except for what an allowed command writes as a side effect that its options do not control (`git status` refreshing the index).
- A new read-only version adds a name in `agents/` and in `READ_ONLY` in `hooks/readonly.mjs`; a test fails when the two lists differ.
- The list errs towards denial. A read the list misses is denied, and the version reports it; the fix is to add the command to `COMMANDS` with a test, not to loosen the parser.
- `claude --agent suits:louis`, which starts the definition as the main session, is not held: the main session's calls carry no type, so the hook cannot tell it from the owner's own session. The tool list still applies.
- The hook is part of the plugin and no longer reads only the project's rules file (ADR 0005); this one rule is the plugin's own, about its own versions, and applies in every project.
- The check assumes it knows each tool's option parsing and each allowed command's behaviour. It lists options by what the tool documents; a tool or version that parses differently, or has an option that is not documented, can get past it. The remedy is to shrink the list, not to patch a case.
- An allowed command can still run a program that is set in configuration the hook does not read: `core.fsmonitor`, `diff.external`, `diff.*.textconv`, clean and smudge filters, `gpg.program` (`git log --show-signature`), and shell aliases. A repository that sets these can run a program under a read command. The hook cannot see them.
- An allowed command can write as a side effect that no option controls, such as `git status` refreshing the index.
- A read-only version whose id is missing from the session's list is not held. The list has named every such session in the runs so far, so this is a gap in principle, not one seen. It is accepted for the reason given above.
