# Other format routes

Read this when the target is an EVM bytecode blob, a GGUF or safetensors model file, a Unity IL2CPP metadata file, an Apple crash report, a CPython .pyc, an Erlang BEAM file, a SQLite database, or a recorded crash core.

- Explicit local EVM bytecode carrier: `inspect_evm_interface` with caller-selected
  `raw` or `hex` encoding. The owned worker deadline is `timeout_ms` (default
  30000 ms, range 1..2147483647, next call). It does not raise the fixed byte,
  address-space, or CPU allowances. Preserve carrier/decoded digests and treat selectors,
  argument strings and mutability as inferred candidates; this performs no chain
  lookup or target execution. For the complete inferred interface without hex or
  duplicate stdout, discover support and select `detail: "summary"`; complete
  Evidence stays retained under its original identity. Use the returned
  `parent_evidence_id` for exact function or `bytecode_hex`/stdout/stderr pages.
  Candidate coverage does not establish interface completeness. See the
  [EVM bytecode guide](https://github.com/morluto/rea/blob/main/docs/evm-bytecode.md).

- Bundled GGUF or safetensors model declarations: `inspect_model_artifact`
  with the explicit local file. Default header hashing leaves full-file identity
  unknown; `hash: "full"` additionally reads all weights for SHA-256. MCP returns
  retained summaries; optional `view` selects one page in the initial call. Use
  `inspect_analysis_view` kind `model-artifact` for
  batched metadata keys, tensor names or type totals, selected fields and pages.
  Preserve header-scoped indices and array preview omissions; do not infer model
  behavior from declared architecture or tensor types. See the
  [model file guide](https://github.com/morluto/rea/blob/main/docs/model-artifacts.md).
- Unity IL2CPP names, member owners and string literals from `global-metadata.dat`:
  `inspect_il2cpp_metadata` with the explicit local file; MCP defaults to compact
  counts. Query sections, images, types, methods, fields, properties, events,
  parameters or string_literals through `inspect_analysis_view`
  with the returned `parent_evidence_id`, using exact filters, batch indices and
  selected fields. Parameters accept `method_indices`, avoiding a scan of all
  parameter pages. Missing collections in historical Evidence remain unknown.
  Versions 24, 27, 29, 31 and 39; no Unity, IL2CPP
  binary or disassembler is run. Unrecognized magic (possibly encrypted) and
  other versions are unsupported. Optional matching `binary_path` enables static native addresses and type references; query `method_addresses` with indices or addresses/states, preserving every shared-body method and both artifact identities. Without a linked binary native counts remain unknown. Byte-pattern fallback is inferred; no runtime behavior or same-build pairing is proved. See the
  [IL2CPP metadata guide](https://github.com/morluto/rea/blob/main/docs/il2cpp-metadata.md).

- Apple `.ips` crash reports: `inspect_apple_ips` with the explicit local
  file. This built-in target-free inspection requires no Xcode, atos, or
  pwntools. Preserve first-line metadata, `bug_type` as a string, process and
  exception facts, lossless integer registers, usedImages UUIDs, and
  documented classification matches. Only `bug_type` `"309"` yields a crash
  body; other types, including `"288"` stackshots, return no crash result.
  Opened Mach-O and dSYM UUID joins remain unobserved. See the
  [Apple IPS guide](https://github.com/morluto/rea/blob/main/docs/apple-ips.md).

- CPython 3.7–3.13 `.pyc` header, nested marshal code objects and bytecode
  identity: `inspect_python_pyc` with the explicit local file. This built-in
  target-free inspection requires no Python installation. Preserve magic,
  PEP 552 hash or mtime/size, nested names, and bytecode SHA-256. Bytecode is
  not decompiled, and a decoded header does not prove the matching `.py` is
  present. See the
  [CPython pyc guide](https://github.com/morluto/rea/blob/main/docs/python-pyc.md).
- Erlang BEAM IFF container: `inspect_erlang_beam` with the explicit local
  `.beam` file. This built-in target-free inspection requires no Erlang
  installation. Preserve chunk names, atom order, export/import/lambda tables,
  and the Code header. For selected facts, prefer `detail: "summary"` plus a
  `beam` view (collection, names/indices, fields and paging), retaining the full
  Evidence. CLI summary requires `--evidence_output`. Missing table counts stay
  null; decoded empty tables count zero. Bytecode is not executed. See the
  [Erlang BEAM guide](https://github.com/morluto/rea/blob/main/docs/erlang-beam.md).

- Explicit local SQLite database snapshot: `inspect_sqlite_database`. Inspect
  with Node.js 24.x >=24.15 or 26+ providing native SQLite limits. Read schema
  first (compact inventory by default), or select an exact ordinary table
  and `columns` when rows are needed. Defaults are selected-table schema and
  20 rows; request `schema_scope: "database"` for the complete stored schema. Preserve both database and existing sibling WAL identity; row samples
  report truncation and have unspecified order. Use a quiescent snapshot rather
  than assuming a live database/WAL pair was copied atomically. See the
  [SQLite guide](https://github.com/morluto/rea/blob/main/docs/sqlite-databases.md).

- Supplied Linux x86-64 ELF core: `inspect_recorded_crash`. Read every recorded
  thread, raw note and source-bound register without opening a live target.
  Historical PIDs do not select live processes. Request `include_debugger_context`
  only when core-only mapping candidates help; see the
  [recorded crash guide](https://github.com/morluto/rea/blob/main/docs/recorded-crashes.md).
