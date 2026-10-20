# Verification record

Local environment: Node 24.19.0, Windows x64, Intel Core i5-14400F. Verified on October 20, 2026.

- `npm run check`: TypeScript build, declarations, example/test type checks and **52 passing tests**, with no skips or todos. The full test suite also passed on Node 22.23.3.
- Rendering: committed 1100×680 PNG compared at pixel level, real coordinate/layer/clipping pixel assertions, image safety/resource checks, and manual inspection of `artifacts/showcase.png`.
- Integration: local real HTTP/WebSocket discovery, IDENTIFY, READY, command upsert, command dispatch, PNG generation and multipart callback. No real bot token or Discord API traffic.
- Benchmarks: three separate-process rounds for all four libraries; environment and raw samples in `benchmarks/results/latest.json`. Initial slower fetch transport retained separately. One million synthetic events reached all listeners; caches remained at their configured limits. Twenty thousand mock REST calls completed across bounded route metadata.
- Native-only runtime smoke: Node 24.19.0, Bun 1.4.3, Deno 2.9.6. Other runtime functionality is not certified by this smoke test.

The local npm tarball was installed in a fresh consumer with `--omit=dev --omit=optional --ignore-scripts`. Only Ozka and its wire-type dependency were installed. Native UI, package imports and inferred declaration types passed; canvas use correctly reported the missing optional backend. `discord.js`, Eris, Oceanic and the graphics backend were confirmed absent from the consumer.

The source archive contains the implementation, lockfile, tests, examples, graphics fixture, docs, benchmarks and built declarations, excluding node_modules, temporary TLS material and scratch files. These checks were performed before npm publication. Remote CI has not run.

## Public npm release

`ozka.js@0.1.0-alpha.1` was published on October 20, 2026. Registry metadata confirmed the version, tarball, and `alpha` tag. A separate consumer project installed `ozka.js@alpha` from the public registry with optional dependencies omitted and scripts disabled. Its native UI/import smoke test passed; the optional graphics backend and benchmark competitors were absent.

Registry tarball integrity:

```text
sha512-z3A1aTr1drmJFJvqh6MIG94+y/xcauk3upKFikEcUODsgadu3yHcXeP84lc3cxbC6lBKxQ3EWrzEdtcBJaiLow==
```

Repository documentation may be newer than the immutable published tarball. See the [Unreleased changelog](../CHANGELOG.md#unreleased). No further npm release is implied by documentation edits.

## GitHub documentation checks

The expanded documentation was checked locally on October 20, 2026: 19 Markdown files, 85 local links/anchors, and syntax for 22 JavaScript/TypeScript snippets. The quickstart's code matches its runnable JavaScript file. A stubbed startup verified its command/button registration and valid native V2 payload without contacting Discord. The local PNG example rendered successfully and its output was visually inspected. Formatting checks passed. These checks do not replace live Discord validation or rerun the release's full test suite.
