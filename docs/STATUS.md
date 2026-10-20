# Implementation and release status

Version: **0.1.0-alpha.1**, [published on npm](https://www.npmjs.com/package/ozka.js) on October 20, 2026 with the `alpha` tag. Public installation and a native-only consumer smoke test passed. This is a working initial library, not a claim of production certification or feature parity with every established Discord SDK. Live Discord bot behavior has not been verified by the project. No GitHub repository or deployment has been created by this build.

## Milestones delivered

| Milestone                         | Implemented and verified                                                                                                                                                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Gateway and REST               | Independent WebSocket protocol, identify/resume/reconnect, heartbeat, shard scheduling, learned REST buckets, 429 handling, multipart, deadlines and resource bounds; foundation tests and real loopback sockets/HTTP           |
| 2. Commands, events, interactions | Typed wire events, priorities/once/middleware, slash/context/subcommand/group definitions, opt-in registration, autocomplete, cooldowns, member permission guards, response state machine, routes, modals and collectors        |
| 3. Native UI                      | Declarative builders for the current message/modal component families, legacy embeds, payload limits, placement checks and explicit V2 compatibility errors                                                                     |
| 4. Free-position graphics         | Actual PNG output from optional Skia backend, nested coordinates/flow/percentages, images, circular avatars, measured wrapped text, gradients, borders, shadows, progress, layering, scale, font registration and asset budgets |
| 5. Hybrid and reactive UI         | Native-vs-graphics capability planning with explanations, native controls, detached state, edit batching/serialization, duplicate suppression, expiry, guarded restore and application persistence hooks                        |
| 6. Templates and tooling          | Thirteen implemented template families, lifecycle plugins, structured logs, counters, TypeScript inference assertions and error codes                                                                                           |
| 7. Verification and benchmarks    | Unit, payload, rendering pixel snapshot and real local socket/HTTP integration tests; three-round comparisons against discord.js/Eris/Oceanic; one-million-event and 20,000-request simulated workload with bounded caches      |
| 8. Documentation and examples     | Installation, intents/authentication, command/interaction/UI guides, operations, migration, security boundaries and runnable basic/profile/reactive/render examples                                                             |
| 9. npm release                    | ESM subpath exports, SemVer alpha metadata, declaration/source maps, MIT license, lockfile, CI workflow, public alpha publication and verified public npm installation                                                          |

The final test count and exact package-install verification are recorded in [verification](VERIFICATION.md). CI is configured for Node 22/24 on Windows/Linux, but those remote matrix jobs have not run. Local full-suite verification passed on Node 24.19.0 and Node 22.23.3 on Windows. Bun 1.4.3 and Deno 2.9.6 passed the native-only ESM smoke example; this does not certify their Gateway, HTTP or native graphics behavior.

## Scope and implementation limits

- The monorepo has logical packages distributed through one `ozka.js` package; individual `@ozka/*` npm packages are not published or separately versioned.
- The Gateway supports uncompressed JSON. ETF, stream compression, voice/audio, durable session storage and fleet/process orchestration are not implemented. These are not exposed as working configuration flags.
- Sharding and global rate limiting coordinate within a process/client. A distributed application must supply shared identification/REST coordination and persistent state.
- Raw Discord objects are typed and cached with entry limits. Automatic guild/member/entity hydration, role-overwrite permission resolution and helpers for every REST resource are not implemented; the real raw REST/Gateway APIs remain available.
- Common command schema constraints are checked locally. The concise schema does not expose every Discord command option/localization/install-context field. Advanced registration can use raw REST and official exported wire types.
- Hybrid rendering is a deterministic planner, not natural-language AI. It does not preserve requested native control coordinates or create clickable image regions. It explains that limitation.
- Graphics use bounded main-thread scene traversal and an optional native backend. No built-in worker pool, WASM backend, PDF/SVG decoder, arbitrary URL downloader, CSS/browser layout engine or animated attachment renderer is implemented.
- Native typography/positioning follows Discord. Visual templates support font/layout customization; native templates support the fields Discord exposes. Template controls require application handlers. Music has no voice playback, tickets have no channel provisioning and shops have no payment processing.
- Reactive persistence serializes application state. It does not automatically store interaction closures, make databases transactional, reconstruct routes after restart or synchronize multiple processes. Channel-message edits are required after interaction tokens expire.
- Plugins share the process and its privileges. Lifecycle dependencies/cleanup are implemented; OS sandboxing and dependency-version isolation require separate processes/workspaces.
- Tests validate protocol behavior against simulations, not a Discord deployment. Comparative numbers do not cover full competitor Gateway hydration pipelines or production fleets. Native/WASM speed comparisons have not been run; no speculative Rust networking module was added.

## Gates before a stable production release

Run a bot against Discord in a dedicated test guild and validate command registration, attachment display/accessibility, every component/modal family, ephemeral/deferred responses, interaction updates, permission failures and V2 message edits. Exercise real 429s safely, shard identify concurrency, invalid sessions, network interruptions and long-running resume behavior. Conduct a multi-day soak test, security/dependency review, fuzz malformed wire payloads/assets and measure representative bot traffic on more than one runtime/platform. Configure the GitHub repository metadata and release provenance when a repository is established.

These are concrete remaining release-validation tasks. They are not represented as already completed, and the current alpha should not be advertised as production-grade until they are satisfied.
