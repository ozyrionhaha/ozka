# Contributing

Use Node 22+ and run `npm ci`. Keep the core free of runtime framework/graphics dependencies. Add a focused regression test for protocol or validation fixes, then run `npm run check`. Update the PNG fixture only after visually reviewing a deliberate rendering change. `npm run demo` produces `artifacts/showcase.png`; the committed baseline is `tests/fixtures/showcase.png`. Run performance comparisons from a clean build and retain raw samples and environment information.

New Discord behavior needs an official documentation reference, valid/invalid payload tests and wire types. Preserve mention defaults, token redaction, cancellation, resource bounds and the one-ack interaction state machine. Do not log real tokens, include credentials, make live API calls in default tests or claim unmeasured speed gains.

Use SemVer prereleases during alpha. Public API changes before 1.0 may break compatibility and must be documented. Prepare releases with `npm run check` and `npm pack --dry-run`, then install/test the actual tarball in a fresh consumer project with optional dependencies omitted. Maintainer authorization is required before npm publication. CI intentionally verifies and packs without publishing.
