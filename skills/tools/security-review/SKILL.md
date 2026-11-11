---
name: security-review
description: A read-only, one-pass security review of a diff covering parsing, command execution, deserialization, queries, authentication or authorization, secrets, outbound requests, file paths and dependencies, answered with a file:line and ruled BLOCKER, SHOULD FIX or SUGGESTION. Use only when the diff touches untrusted input or a trust boundary. Skip when it does not.
---

# The security pass

Use only when the diff touches untrusted input or a trust boundary. A diff that touches none of the nine areas below skips this. Read the diff once, run the checks for the areas it touches, and report. The pass is read-only and in one pass: it runs no exploit, edits nothing, installs nothing and starts no other session.

## The checks

Run only the rows whose area the diff touches; mark the others `n/a` or leave them out. A finding names a path in the diff, not a worry: where the input enters, each step it takes, and where it lands, with `file:line` for each. Reading a file outside the diff is allowed only to follow a path that starts or ends in the diff.

| | Area | Look for | Evidence that makes it a finding |
| --- | --- | --- | --- |
| 1 | Parsing files, images and uploads | A width, height, size or count taken from the file's own header and multiplied (width * height * bytes per pixel) before the allocation, with no cap on pixels, memory or decode time; a type decided by extension or `Content-Type` instead of the bytes; a decoder, archive or XML parser with default settings; a file name that a decoder reads as a coder or protocol prefix (ImageMagick `msl:`, `ephemeral:`, `label:`, delegates) or as an option; SVG or other active content accepted as an image; an archive entry written to a path built from its name; a file served back with the client's content type or without `X-Content-Type-Options: nosniff`. | The limit missing before the read or the allocation, the type check made on a name or header the sender controls, the entity, entry or delegate handling left on, the entry name reaching a write, or the sender's content type reaching the response (CWE-190, CWE-400, CWE-770, CWE-787, CWE-125, CWE-434, CWE-611, CWE-409, CWE-79). |
| 2 | Shell, command and remote execution | A command string built from input; `shell=True`, `exec`, `eval`, backticks, `system`; an executable or command name chosen from input; a template or expression engine fed input; a dynamic `import`, `require` or plugin load from a path that input can set; a download followed by running what was downloaded; a CI workflow expression from input (`${{ github.event... }}`) inside a `run:` step; an argument that can start with `-`. | Input reaching the command string, the program name, an option position, a load path or a workflow `run:` step without a fixed argument list or an allow-list (CWE-78, CWE-94, CWE-88, CWE-426, CWE-829). |
| 3 | Deserialization | `pickle`, `yaml.load`, Java object streams, `unserialize`, a type name chosen by the payload, a parser that builds arbitrary classes. | Bytes from outside reaching a parser that can build arbitrary types, with no schema or allow-list of types (CWE-502). |
| 4 | SQL and query building | A query joined or formatted from input, including `ORDER BY`, table names, NoSQL operators, LDAP filters and GraphQL arguments. | Input in the query text instead of a bound parameter, or a name taken from input without an allow-list (CWE-89, CWE-943, CWE-90). |
| 5 | Authentication, authorization and session | A route with no caller check; a record fetched by an id from the request with no owner check; a role read from the request; a session id that is not renewed at login; a state-changing request with no CSRF defence; a check that errors open. | A path from the request to a read or write with the identity check or the per-record permission check missing, or a lookup failure that grants (CWE-306, CWE-862, CWE-639, CWE-384, CWE-352). |
| 6 | Secrets and keys | A key, token or password in source, a fixture, a log line, an error message or a URL; a homemade or weak algorithm; a secret compared with `==`; a fixed or reused nonce or salt. | The secret or the weak construction on a line of the diff (CWE-798, CWE-532, CWE-327, CWE-208). A leaked secret is also a rotation, which the finding says. |
| 7 | Outbound network and URLs from input | A request whose host, scheme or redirect target comes from input; a webhook or fetch-by-URL feature; certificate checks turned off; an address check made on the name before DNS resolution, or only on the first request. | Input reaching the request target with no allow-list of hosts and schemes, or no refusal of private, loopback and link-local addresses made on the resolved address, at connection time, and again on every redirect (CWE-918, CWE-295). |
| 8 | File paths from input | A path joined from input; `..`, absolute paths and symlinks not handled; a file name used as is. | Input reaching a file open, write or delete with no resolve-then-check against a fixed base directory (CWE-22, CWE-73). |
| 9 | Dependencies | A new or bumped package; an install script; a source other than the registry; a lockfile changed without the manifest, or the reverse; a name one letter from a well-known one. | The line in the manifest or lockfile, and the reason it is a concern: unpinned, unexpected source, install-time script or a near-miss name (CWE-829, CWE-1104). An advisory is cited only when the repo or the diff holds it. |

## Rulings

Report in the same form as any other review: the prefix line, then `file:line`, then the path and the rule.

- **`BLOCKER, verified:`** a complete path in the diff, from outside input to a dangerous use, and a rule, spec line or CWE id it breaks.
- **`SHOULD FIX, verified:`** the guard is missing but the diff does not show that the input is untrusted, or the damage is limited; it still cites a rule, spec line or CWE id.
- **`SUGGESTION, verified:`** hardening, or a problem that was there before the diff. A finding with no rule, spec line or CWE id is at most a SUGGESTION.

Every finding says what to change in one line, and the pass changes nothing itself.

## Not checked

The pass reads the diff and the files that complete a path in it. End the hand-over with a `Not checked:` line that names what it could not see, for example: runtime and deployment configuration, infrastructure and network rules, secrets stored outside the repository, the behaviour of a dependency, advisories newer than the repository, and anything that is only decided at run time. Also say the pass ran no exploit, scanner or live test.

A pass with no findings says `Checked:` for the areas it ran, and does not say the diff is secure.
