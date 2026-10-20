# Architecture and extension points

This source monorepo has logical packages and a single npm distribution with explicit subpath exports. This avoids coordinating ten package versions during the initial alpha. Networking and UI packages do not depend on each other: the core composes them through prepared messages and renderer interfaces.

| Directory             | Responsibility                                                                     |
| --------------------- | ---------------------------------------------------------------------------------- |
| packages/core         | Bot lifecycle, shard startup, event pipeline, framework composition                |
| packages/gateway      | WebSocket protocol, heartbeat, resume, reconnect, identify scheduling              |
| packages/rest         | Bounded bucket scheduling, HTTP transport, multipart uploads                       |
| packages/commands     | Definitions, inference, subcommands, registration, guards, middleware              |
| packages/interactions | Response state machine, routing, collectors and deadline checks                    |
| packages/ui           | Declarative wire components, validation, scenes, hybrid planning, state, templates |
| packages/renderer     | Lazy optional native backend, layout, font metrics, drawing, asset limits          |
| packages/plugins      | Dependency ordering, lifecycle and cleanup                                         |
| packages/utils        | Copy-on-write events, LRU, locks, cancellation and errors                          |
| packages/types        | Official Discord wire types and library contracts                                  |

`GraphicsRenderer` only requires `render(scene): Promise<Uint8Array>`. Implement it to use another native/WASM backend or remote rendering service without changing the Discord client. Always return a PNG/JPEG-compatible image for Discord; the built-in message path names its output `.png`. A remote renderer is an explicit developer choice, not an automatic upload of state or assets.

`gateway.socket(url)` can inject another WebSocket implementation, provided it emits text JSON frames and implements the `Socket` interface. `rest.fetch` can inject transport behavior. Public raw `REST.request`, `Gateway.send`, `Ozka.dispatch` and Gateway listeners keep advanced users close to Discord's protocol.

## Plugins

```ts
await bot.plugin({
  name: 'audit',
  version: '1.0.0',
  dependencies: [],
  setup({ bot, cleanup }) {
    cleanup(bot.on('MESSAGE_DELETE', (message) => auditId(message.id)));
  },
  async start() {
    /* connect application-owned resources */
  },
  async stop() {
    /* close them */
  },
});
```

Install dependencies before dependents and install plugins before starting the bot. Setup failures run registered cleanup in reverse order. Start hooks run in installation order; shutdown runs stop and cleanup in reverse order. Plugin dependency lists are lifecycle dependencies, not package-manager version solvers. Plugins run in the same process with the bot's capabilities: they are not sandboxed. JavaScript module scopes keep ordinary implementation dependencies separate; conflicting versions and untrusted plugins require application-controlled package/workspace or process isolation. Await every plugin installation.

## Security boundaries

Bot tokens use ECMAScript private fields and are removed from stored option objects. Built-in logs redact bot and webhook/interaction path tokens. Raw interaction payloads still contain Discord interaction tokens: do not log full contexts. User-provided callbacks/loggers/transports can access information you explicitly pass them.

Mentions are disabled by default on normalized outbound messages. Explicit `allowed_mentions` is honored. UI strings are text/Markdown rather than evaluated JavaScript or HTML. Prevent unwanted Markdown formatting yourself where a field should be literal text. Interaction IDs are routing hints, not authorization. Validate users, permissions, guild/channel ownership and submitted values for every sensitive action. Commands verify requested permissions against Discord's member bitfield; plugin/component actions must perform their own checks.

Renderer sources accept bytes and opaque asset IDs, with bounded image preflight and no implicit remote fetch. Native components can refer to HTTP(S) media; those URLs are sent to Discord and are not fetched by Ozka. Follow Discord policy for application products and moderation actions. The optional Skia backend is native code and is not a security sandbox; isolate rendering if you accept hostile image uploads.

## Compatibility

Node.js 22+ is the primary target; the full suite passed on Node 22 and 24 on Windows. Bun and Deno smoke-test results are recorded in STATUS. TypeScript consumers get declaration files and declaration maps. Public event names are string literals, while values retain official Discord types. There is no CommonJS export or browser-bundle target. Package consumers do not need graphics installed for native UI, REST or Gateway. No external dashboard, site hosting or voice engine is included.
