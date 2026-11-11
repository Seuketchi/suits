# Web and JavaScript routes

Read this when the target is an ASAR or extracted JavaScript tree, a Bun or Electron build, a WebAssembly module, a live web page or its traffic, a browser scenario, or an agent environment (AgentEnv bundle).

- ASAR or extracted JavaScript/Electron tree:
  `analyze_javascript_application`.

- Bun `--compile` executable: `open_binary`, then `inspect_artifact`; the Bun
  module graph is the application layer. Extract stored modules and analyze the
  JavaScript. See [Bun standalone executables](https://github.com/morluto/rea/blob/main/docs/bun-standalone.md).

- User-owned browser page already open: `list_browser_targets`.

- Passive traffic capture of a SPA: the default scope is the page's own origin,
  and data APIs usually live on another origin. Discover API origins from
  absolute URLs in loaded bundles or script text via JavaScript analysis tools
  (another passive capture without those origins still scopes to the page
  origin, and `completeness.excluded` counts lack URLs). Pass both the page
  origin and those API origins in `allowed_origins` — the list replaces the
  default scope — and read `completeness.excluded` before reporting that an
  API is absent. For long captures with body shapes, use
  `export_evidence_bundle` instead of expecting an inline result.

- Browser action the agent must perform (click, type, navigate):
  `capture_browser_scenario` with declared actions. See
  [runtime observation](runtime-observation.md) for connect/launch
  and the focused follow-up browser tools.

- Agent environment (AgentEnv bundle) of a web application: read
  [environments](environments.md) before recording; it records with
  `capture_browser_scenario` and writes the bundle with `export_environment_bundle`.

- Task for a desktop application's exported environment, from a
  `capture-desktop-application` folder: read
  [desktop application tasks](environments.md#tasks-for-a-desktop-application-environment).

- Fiddler Everywhere traffic or a native `.saz` capture: read the
  [Fiddler workflow](runtime-observation.md#fiddler-everywhere-traffic-debugging).
  Inspect saved SAZ with `inspect_web_network_capture` and `format: "saz"`;
  connect Everywhere's separate MCP server for live traffic.

- Retained HAR/SAZ/native mitmproxy/aioquic qlog capture: `inspect_web_network_capture`. Select
  original record ordinals when useful; inspect producer fields and byte/number
  sidecars without fetching recorded URLs or claiming live attribution. HAR/SAZ/qlog
  old-generation heap is `REA_CAPTURE_DECODER_OLD_GENERATION_MIB` (default 192 MiB,
  floor 8, maximum 16384), set where REA starts. Host memory and `NODE_OPTIONS` do not
  raise it. See
  [historical captures](https://github.com/morluto/rea/blob/main/docs/web-network-captures.md) for the exact upstream
  profile and credential exclusions. Qlog support starts with aioquic 1.5.0
  JSON 0.3; stream coverage and endpoint loss declarations do not recover bodies
  or establish network loss. Prefer detail summary, then kind qlog trace/stream
  pages; select one trace, stream ID and direction for contribution/range pages.
  Facts retain all-recorded-events-before-selection scope. Other qlog layouts
  and PCAP correlation are unsupported.

- User-owned Electron runtime already open: `list_electron_targets`. Before an electron-main Inspector attempt, check packaged fuses with `inspect_electron_fuses`; disabled `EnableNodeCliInspectArguments` means the app ignores `--inspect`.

- Explicit local WebAssembly artifact: `inspect_wasm_artifact`. Supply WABT 1.0.42
  through `REA_WABT_BIN_DIRECTORY`; retain exact byte/tool identity and decoded WAT.
  Select JavaScript glue and candidate paths explicitly and preserve URL/path
  ambiguity. No implicit fetch or target execution; WAT is not original source.
  See the [WASM guide](https://github.com/morluto/rea/blob/main/docs/wasm-artifacts.md).
