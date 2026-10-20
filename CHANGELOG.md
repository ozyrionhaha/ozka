# Changelog

This project uses semantic versioning. Alpha releases may change public APIs; pin a specific version when reproducibility matters.

## Unreleased

### Documentation

- Added a documentation index, complete beginner quickstart, public API reference, runnable examples index, and troubleshooting guide.
- Added published-package JavaScript examples for a native bot and local PNG rendering.
- Updated the README and verification/status records to reflect the published alpha.
- Made the README's Components V2 update example keep V2 message formatting.
- Corrected the archived fetch-transport benchmark report's link to its original raw samples.

These repository documentation changes are newer than the immutable npm `0.1.0-alpha.1` tarball. They have not been republished as a new package version.

## 0.1.0-alpha.1 — 2026-10-20

Initial public alpha, published to npm with the `alpha` tag.

### Added

- Independent Gateway heartbeat, reconnect/resume, and in-process shard identification scheduling.
- REST bucket scheduling, bounded 429 handling, multipart uploads, cancellation, and limits.
- Slash/context commands, subcommands/groups, autocomplete, middleware, cooldowns, and invoking-member permission guards.
- Interaction response state management, routes, modals, collectors, and typed events.
- Native Discord UI builders and payload validation, including explicit Components V2 compatibility checks.
- Optional PNG graphics renderer with nested positioning, percentages, typography, gradients, images, avatars, progress, layering, and bounded assets.
- Hybrid planning, reactive state, serialized/batched edits, and state persistence hooks.
- Thirteen UI template families, lifecycle plugins, diagnostics, metrics, ESM exports, and TypeScript declarations.
- Unit, local socket/HTTP integration, payload, and PNG snapshot tests; reproducible simulated benchmarks.

### Validation and limits

The release passed 52 automated tests on Node 22 and 24 on Windows. A public npm install and native-only consumer smoke test passed. Live Discord behavior, production soak testing, distributed coordination, voice transport, and a security audit are not covered by this validation. See [verification](docs/VERIFICATION.md), [status](docs/STATUS.md), and [measured benchmarks](benchmarks/RESULTS.md).
