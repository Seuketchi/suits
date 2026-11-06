# Deepening

How to deepen a cluster of shallow modules safely, given its dependencies. Uses the vocabulary in [SKILL.md](SKILL.md): **module**, **interface**, **seam**, **adapter**.

## Dependency categories

Classify each deepening candidate's dependencies. The category decides how the deepened module is tested across its seam.

### 1. In-process

Pure computation, in-memory state, no I/O. Always deepenable: merge the modules and test through the new interface directly. No adapter needed.

### 2. Local-substitutable

Dependencies with local test stand-ins (PGLite for Postgres, an in-memory filesystem). Deepenable if the stand-in exists. Test the deepened module with the stand-in running in the test suite. The seam is internal; no port at the module's external interface.

### 3. Remote but owned (Ports & Adapters)

Your own services across a network boundary (microservices, internal APIs). Define a **port** (interface) at the seam. The deep module owns the logic; the transport is injected as an **adapter**. Tests use an in-memory adapter; production uses an HTTP/gRPC/queue adapter.

Recommendation shape: *"Define a port at the seam, implement an HTTP adapter for production and an in-memory adapter for testing, so the logic sits in one deep module even though it's deployed across a network."*

### 4. True external (Mock)

Third-party services you don't control (Stripe, Twilio, etc.). The deepened module takes the dependency as an injected port; tests provide a mock adapter.

## Seam discipline

- **One adapter means a hypothetical seam. Two adapters means a real one.** Introduce a port only when at least two adapters are justified (typically production + test). A single-adapter seam is just indirection.
- **Internal seams vs external seams.** A deep module can have internal seams (private to its implementation, used by its own tests) as well as the external seam at its interface. Keep internal seams out of the interface, even when tests use them.

## Testing strategy: replace, don't layer

- Once tests exist at the deepened module's interface, delete the old unit tests on the shallow modules.
- Write new tests at the deepened module's interface. The **interface is the test surface**.
- Assert on observable outcomes through the interface, not internal state.
- Tests describe behaviour, so they survive internal refactors. A test that must change when the implementation changes is testing past the interface.
