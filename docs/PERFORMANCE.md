# Performance and operations

`npm run bench` runs the pinned development versions in separate Node processes. Read [methodology](../benchmarks/README.md) and [actual results](../benchmarks/RESULTS.md). There is no claimed universal speed advantage. Import time, empty-client memory and public emitter throughput do not imply production Gateway or REST throughput. No real Discord API benchmark has been run.

## Gateway

The default transport uses Node's WebSocket and plain JSON without compression. Heartbeats use randomized first delay, ACK checks and resume after missed ACK. Disconnect handling distinguishes fatal configuration errors, resumable sessions and invalid sessions. Reconnects have capped exponential jitter. Outgoing payloads enforce Discord's documented size bound and reserve Gateway event budget for heartbeats. Raw `send(op,data)` is available on each shard; callers are responsible for opcode-specific limits (for example presence updates).

`shardCount` overrides Discord's recommended total. `shards: [0,1]` assigns specific shard IDs within that total. Each connection uses its shard tuple in IDENTIFY. The in-process IDENTIFY coordinator obeys `max_concurrency` and the remaining session-start allowance. It stops when the allowance is exhausted. Startup defaults account for staggered identification; `readyTimeout` can override that wait.

For multiple bot processes, supply `gateway.beforeIdentify(shardId, signal)`. Coordinate the global session allowance and per-concurrency-bucket spacing across processes with a durable shared store. The built-in scheduler is **in-process only**. REST global limits are also per REST instance; distributed bots need a shared external limiter/transport. This release does not include worker orchestration, cross-process RPC, durable Gateway session storage, ETF, zlib-stream, zstd-stream or voice transport. They are not advertised as enabled options.

## REST

REST groups requests by normalized route and major parameter, learns Discord bucket hashes and serializes shared buckets. Relative reset headers avoid clock-skew assumptions. HTTP 429 uses `retry_after`/`Retry-After`, including global bot limiting. Interaction callbacks/webhook requests use `auth: false` and are not blocked by the bot-auth global gate. Same-route work queues; different known buckets run independently. First discovery of a previously unknown shared bucket can still incur 429, which is handled with a bounded retry count.

Defaults: 30-second request deadline (including rate-limit waits after acquiring the route lock), five 429 retries, queue bound 10,000, bucket/route bound 10,000 and response bound 16 MiB. Idle bucket metadata is evicted when the bound is reached. Route-queue waiting before lock acquisition is bounded in count, not by the request timeout. Caller cancellation signals are checked before transmission; no Discord mutation is retried after a network/5xx failure. Consume `OzkaError` status/code details and reconcile ambiguous operations.

The default buffered transport uses Node HTTP/HTTPS keep-alive, does not follow redirects, and advertises no compression. Supply `rest.fetch` to inject fetch, a proxy, a distributed limiter or deterministic test transport. Supplying global fetch may have different latency on your runtime. `maxResponseBytes` bounds the built-in transport; custom transports must enforce their own response bounds. HTTP body buffers, JSON and attachment multipart serialization use memory proportional to the configured request size.

## Caches and memory

```ts
new Ozka({
  token,
  cache: { users: 10_000, messages: 0, ttl: 300_000 },
  rest: { maxQueue: 5_000, maxRoutes: 10_000, timeout: 30_000 },
});
```

Messages are not cached by default. Users have a 1,000-entry TTL/LRU cache. These store raw payload references and apply entry limits rather than estimating arbitrary object byte size. Use `0` to disable. TTL entries expire on access or `cache.sweep()`. Guild/member hydration is intentionally absent, keeping the core small. Application-managed listeners can maintain specialized caches from raw events.

UI rendering has independent pixel, asset, cache, queue and concurrency budgets; see [UI guide](UI.md). Encoded images are generated only when requested. Batch state changes with `ReactiveView`, reuse a renderer, downscale source images and use worker processes for CPU-heavy rendering workloads. No Rust networking parser is included: profiling this release has not demonstrated a need to cross a native boundary for JSON/event dispatch. The optional graphics backend uses existing native Skia bindings instead of maintaining a new renderer implementation in Rust.

## Diagnostics and troubleshooting

`logger(entry)` receives structured `{ level, source, message, data? }` records. REST traces include method, redacted route, status and elapsed time. Gateway emits connection state, close and error events and warns about missed ACKs. `bot.rest.metrics`, `gateway.metrics`, `renderer.metrics` and `view.metrics` expose cumulative counts and timing. They are process-local counters, not an exporter or a tracing SDK. Raw Gateway payload tracing can be installed via event middleware; redact interaction tokens and personal data before storing it.

- `GATEWAY_FATAL`: verify token, privileged intent approval and shard tuple; fatal codes stop reconnecting.
- `SESSION_EXHAUSTED`: wait for reset or inspect identify coordination; repeated fresh IDENTIFYs consume allowance.
- `INTERACTION_EXPIRED`: defer early, keep slow work out of initial modal/autocomplete paths, and use channel edits for durable views.
- `UI_V2_CONFLICT`: replace embeds/content with containers/text displays, or create a new legacy message.
- `RENDERER_MISSING`: install the optional `@napi-rs/canvas` peer matching the lockfile platform.
- `ASSET_RESOLVER`: provide bytes directly or configure a trusted asset resolver.
- `REST_QUEUE_FULL`/`RENDER_QUEUE`: apply application backpressure and batch updates before increasing memory budgets.
