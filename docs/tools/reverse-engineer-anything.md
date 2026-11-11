## What it does

`reverse-engineer-anything` is the skill from [morluto/rea](https://github.com/morluto/rea), used under its own name with its text kept. Its entry file is short, and the detail for each artifact type sits in reference files beside it. It works out what a shipped artifact does when there is no source: a native binary, a managed build, an Electron or JavaScript bundle, firmware, a packaged app, or a browser target. It uses the REA tools for evidence, and each claim stays tied to what was observed. It can also build an AgentEnv bundle of a web application from a live instance or a capture.

## When to reach for it

When the facts live in a shipped artifact and no source is available: to explain a feature, compare versions, decompile code, or guide a reconstruction. Skip it for a source repository you can read. Mike runs it only when you own the artifact, have rights to it, or named it in the request. Otherwise he asks first.

## Common questions

**Does installing this skill install the REA tools?**
No. It supplies instructions only. The REA server is registered separately, and the skill's connection guide covers a missing server.

**Where does it come from, and how does it stay current?**
It is rea's own skill, copied from commit `99bcd3e`, version 60. Its changes are taken by hand, in small pull requests.

## It's working if

- It starts on the target without running setup first when the tools are already connected.
- A claim about the artifact cites evidence the tools returned.
- It declines a target the requester does not own and did not name, and asks first.
