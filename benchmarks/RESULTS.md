# Local benchmark measurements

Generated 2026-10-20T20:15:55.040Z. v24.19.0, win32/x64, Intel(R) Core(TM) i5-14400F. 3 rounds, fresh worker processes, no Discord connection. Full samples: [latest.json](results/latest.json).

| Library    | Version       | Startup median ms | Idle RSS MiB | Emitter median ns/event | Parse+emit p99 µs | HTTPS p95 ms |
| ---------- | ------------- | ----------------: | -----------: | ----------------------: | ----------------: | -----------: |
| ozka.js    | 0.1.0-alpha.1 |             42.02 |        66.32 |                   13.19 |              0.90 |         0.69 |
| discord.js | 14.27.0       |            391.92 |        94.75 |                   21.46 |              1.80 |         0.75 |
| eris       | 0.18.0        |             62.07 |        67.87 |                   20.19 |              1.70 |         0.48 |
| oceanic.js | 1.15.0        |            185.78 |        80.11 |                   34.16 |              1.70 |        16.14 |

Ozka PNG renderer: 47.81 ms median, 61.39 ms p95 for the 1100×680 showcase. Ozka Gateway JSON/receive: 1.70 µs p99.

- All workloads are simulated or loopback; no Discord API calls or login.
- Public emitter and JSON parse+emit timings do not exercise competitors’ full Gateway processing pipelines.
- Startup is dynamic import + construction in a fresh process with warm OS filesystem caches; clients never connect.
- Idle memory is sampled before connection; caches and runtime states differ.
- Allocation bytes are V8 sampling estimates, not exact counts.
- Cache adapters enforce the same LRU policy around Map-compatible collections; this is not a comparison of entity hydration or default cache policies.
- HTTPS latency includes local TCP/TLS/JSON and server costs; it is not pure REST overhead. Eris uses an agent that redirects only the connection port to the loopback listener.
- UI rendering and internal Gateway receive are Ozka-only because competitors do not expose equivalent public render APIs.
- Three rounds are a local smoke benchmark, not evidence for broad performance or production-scale claims.

No overall speed advantage is claimed. Results must be interpreted with the workload and feature differences above. No additional Rust/WASM runtime is justified by this microbenchmark; first profile a representative bot. The optional renderer already uses a native Skia backend through Rust bindings.
