# UI engine

## Native components

`UI.message()` is chainable. `.text()` adds V2 text; `.content()` sets legacy content or converts it to text when building V2. `.add(...)` accepts native top-level components. `.embed(object)` accepts standard embed data. `.button(label,id,options)` packs up to five buttons per action row; `.select(id,options,settings)` adds a dedicated select row. `.attach({ name, data, contentType, description })` adds an upload. `.ephemeral()` sets the ephemeral flag for interaction replies. `.mentions(...)` explicitly overrides default suppression of mentions and reply pings.

Factories are plain typed data: `row`, `button`, `link`, `premium`, `select`, `userSelect`, `roleSelect`, `mentionSelect`, `channelSelect`, `section`, `textDisplay`, `thumbnail`, `gallery`, `file`, `separator`, `container`, `label`, `input`, `upload`, `radio`, `checkboxGroup`, `checkbox`, `modal`.

`.build({ renderer, attachmentLimit })` returns `{ body, files?, explanations? }`. `prepareMessage` provides the same normalization for raw JSON and strings. Files use Discord's `payload_json` and `files[n]` multipart fields. The safe fallback upload limit is 10 MiB per file; interaction contexts use Discord's `attachment_size_limit`. Use an explicit limit for channel sends if your application supports a different allowance.

Validation covers row composition, legal nesting, unique IDs, component count, Text Display text budget, select options, modal placement, embed size budgets and V2 conflicts. Native components still use Discord's layouts and typography. A Section needs 1–3 Text Displays and a real button or thumbnail accessory. Containers cannot nest other containers. File components refer to actual `attachment://` uploads. Ordinary embeds cannot coexist with V2; requesting that combination raises an error. Once a message uses V2, Discord does not permit removing the flag: keep the same mode for edits.

New component types can be introduced with `registerComponent(type, validator)` and raw wire payloads. This is an explicit escape hatch: your validator is responsible for the new component's constraints, recursive children, and permitted context. It cannot override built-in validation.

## Positioned graphics

Importing the main package does not import a graphics backend. The first canvas build dynamically loads `ozka.js/renderer` and `@napi-rs/canvas`. Install that optional peer for visual bots; native-only bots have no mandatory graphics dependency.

```ts
import { createRenderer } from 'ozka.js/renderer';
import { readFile } from 'node:fs/promises';
const renderer = createRenderer({
  concurrency: 2,
  maxPixels: 8_000_000,
  fonts: [{ family: 'Brand', data: await readFile('./Brand.ttf') }],
  resolveAsset: async (id) => readFile(`./trusted-assets/${assetNames[id]}`),
});
```

The application must validate `id` against its own trusted map (`assetNames` above). Do not interpolate user input into file paths. Ozka never fetches arbitrary image URLs or opens arbitrary file paths. Use a resolver to map IDs to trusted PNG/JPEG bytes. `UI.avatar({ user })` requests an asset ID of `avatar:USER_ID:AVATAR_HASH` or `avatar:USER_ID:default`; provide a resolver for that format. For remote images, build an application-specific allowlisted downloader with timeouts, response byte limits, redirects disabled, and a policy that rejects private-network destinations. `UI.avatar({ source: bytes })` needs no resolver.

PNG/JPEG signatures and declared dimensions are checked before native decoding. The renderer rejects SVG, URLs, paths, unsupported formats, oversized compressed/decoded assets, cyclic scenes and excessive nodes. Defaults: 8 million output pixels, 1,000 nodes, depth 32, 8 MiB encoded image, 4 million pixels per image, 16 MiB image cache, 32 MiB newly decoded assets per frame, queue 100 and two simultaneous jobs. Native libraries remain part of your dependency security review. Font registration is process-wide in the optional native backend; use unique family names.

`UI.canvas({ width, height, background, theme, scale })` is a scene. Add `box`, `card`, `text`, `image`, `avatar`, `progress`, `circle` and `badge`. Icons can be text glyphs from a chosen font or transparent PNG assets. `background` is a color or `{ from, to, angle }` gradient. A background image is an image node behind content (`z: -1`). Alpha colors and `opacity` support transparency and overlays.

Every visual has parent-relative `x`, `y`, `width`, `height`, numeric `z`, optional `anchor`, background, border, radius, shadow and clipping. Coordinates and dimensions accept numbers or strings such as `'50%'`. Anchors are `top-left`, `center` and `bottom-right` relative to the given coordinate. Boxes accept children, padding, `layout: 'row' | 'column' | 'absolute'`, and gap. Flow positions are calculated in source order; painting follows z-index. The default box size is 100×100; default text width is its parent width. This is a small graphics layout system, not CSS: there is no flex-grow, intrinsic container sizing or browser DOM.

`scale` changes output resolution while preserving logical coordinates. Relative sizes recompute within each parent; native Discord then scales the attachment to the user's client viewport. Ozka cannot inspect the actual Discord viewport or reposition native components at runtime based on it.

Text uses real backend font metrics. `font`, `fontSize`, `weight`, `lineHeight`, `align`, `maxLines`, dimensions and color control wrapping and clipping. Long words break to fit; clipped final lines receive ellipsis. Fixed boxes keep text inside their bounds. `progress.value` is a percentage, clamped from 0 to 100. `image.fit` can be `cover` or `contain`; avatars clip to a circle/ellipse. Use equal width and height for circular avatars.

Provide a shared renderer to `new Ozka({ renderer })` or `.build({ renderer })` for reusable fonts and decoded-image caching. Asset IDs are cache keys; version them when the underlying image changes or call `renderer.clearCache()`. Renderer execution uses native encoding and bounded asynchronous work; scene traversal and text layout still run on the JavaScript thread. Heavy concurrent render farms should use application-managed workers. No worker isolation or zero-copy performance is claimed.

## Hybrid planning

`UI.hybrid({ canvas?, children })` leaves strings and supported components native. Positioned visual elements are grouped into a canvas. A complete `Scene` becomes its own attachment. Native buttons/selects become action rows. `{ control, x, y }` requests that control visually near a point, but Discord does not support that placement: the planner moves it to a real native row and includes an explanation. Call `.build()` to inspect explanations. Visuals become media before the native controls; it is not a pixel-preserving transformation of native component layouts. Unknown components require an explicit extension validator.

## Reactive state and persistence

```ts
const state = new State({ count: 0 });
const view = new ReactiveView(
  state,
  (s) => UI.message().text(`Count: ${s.count}`).button('+1', 'counter:1'),
  (prepared) => bot.rest.edit(channelId, messageId, prepared),
  {
    debounce: 100,
    timeout: 900_000,
    disableOnExpire: true,
    onError: (error) => console.error(error),
    persist: async (json) => saveToYourDatabase(json),
  },
);
await view.flush();
const off = bot.component('counter:1', async (ctx) => {
  await ctx.deferUpdate();
  state.set((s) => ({ count: s.count + 1 }));
});
// Dispose both when your application removes the panel:
off();
view.dispose();
```

See the runnable [reactive bot](../examples/reactive-bot.ts), which scopes state and route IDs per message. `State.get()` returns a detached copy. `set(value | updater)` and `update(partial)` notify subscribers synchronously. Updates coalesce over a configurable debounce window; edits never overlap. A SHA-256 fingerprint of the prepared payload and image bytes skips identical edits. Scene nodes are not incrementally diffed: a changed view is rebuilt and rendered before comparing the payload. Errors go to `onError`, preserve dirty state, and can be retried with `flush()` or the next state change. There is no unbounded automatic retry loop.

Use a channel-message edit transport for long-lived UI. Interaction-token transports expire after fifteen minutes. `timeout: 0` disables view expiry; otherwise expiry releases subscriptions and can disable native controls through one final edit. `dispose()` releases timers/subscriptions without sending an edit. An in-flight transport cannot be cancelled by dispose.

`state.snapshot()` serializes `{ version: 1, savedAt, state }`. `State.restore(json, typeGuard)` validates state before restoring; application schema migrations, durable database transactions, route reconstruction, permissions and multi-process synchronization belong to your application. Snapshot data must be JSON serializable. The library does not persist tokens or closures. Prefer idempotent actions and a database transaction when interacting with balances, inventories or other shared state.

## Templates

All 13 templates are concrete payload/scene builders. Their controls are native; install the corresponding routes yourself. Music controls do not include a voice/audio engine. Moderation controls do not execute bans. Ticket controls do not provision channels. Poll controls emit selections; tally votes in application state. Inventory and shop views do not maintain an economy. Premium buttons use your approved Discord application SKU IDs and emit no custom-ID callbacks. Native template typography follows Discord, while visual templates support custom fonts/themes and scene decoration.
