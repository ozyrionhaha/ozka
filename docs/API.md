# API reference

This reference covers the `0.1.0-alpha.1` public API. Generated TypeScript declarations contain the complete signatures and official Discord payload types. Most examples below assume an existing `bot` or interaction `ctx`; use the [quickstart](QUICKSTART.md) for a complete program.

## Imports

```js
import { Ozka, UI, Intents, State, ReactiveView, templates } from 'ozka.js';
import { REST } from 'ozka.js/rest';
import { Gateway, shardForGuild } from 'ozka.js/gateway';
import { createRenderer } from 'ozka.js/renderer';
```

The package also exports `/ui`, `/types`, `/utils`, and `/plugins`. The root export includes `Context`, `InteractionRouter`, `Commands`, `OzkaError`, `Events`, and `LRU`. Importing the main package does not load the graphics backend. There is no CommonJS `require()` export.

## Ozka

```js
const bot = new Ozka({
  token: process.env.DISCORD_TOKEN,
  intents: Intents.Guilds,
  registerCommands: { guildId: process.env.DISCORD_GUILD_ID },
  cache: { users: 1000, messages: 0, ttl: 300_000 },
  logger: (entry) => console.log(entry.level, entry.source, entry.message),
});
```

| Option                        | Meaning                                                                                            |
| ----------------------------- | -------------------------------------------------------------------------------------------------- |
| `token`                       | Required bot token, without the `Bot ` prefix                                                      |
| `intents`                     | Numeric intent bitfield; defaults to `Intents.Guilds`                                              |
| `applicationId`               | Application ID for registration before Gateway READY; otherwise learned at startup                 |
| `registerCommands`            | Omitted/false disables registration; `true` registers globally; `{ guildId }` registers in a guild |
| `shardCount`, `shards`        | Total shard count and IDs assigned to this process                                                 |
| `cache`                       | User/message entry limits and TTL in milliseconds; `0` entries disables a cache                    |
| `rest`, `gateway`             | Networking options; see [operations](PERFORMANCE.md)                                               |
| `renderer`, `attachmentLimit` | Default renderer and per-file byte limit for message preparation                                   |
| `logger`                      | Callback receiving `{ level, source, message, data? }`                                             |
| `readyTimeout`                | Startup readiness deadline in milliseconds                                                         |

| Method/property                             | Behavior                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `await bot.start()`                         | Discover Gateway settings, connect shards, optionally register commands, and start plugins |
| `await bot.stop()`                          | Disconnect shards, dispose collectors, clear caches, and stop plugins                      |
| `bot.command(name, handler)`                | Define a command with default options; returns `bot`                                       |
| `bot.command(name, options, handler)`       | Define a command with a typed option schema; returns `bot`                                 |
| `bot.use(middleware)`                       | Add command middleware; returns `bot`                                                      |
| `bot.useEvents(middleware)`                 | Add middleware around raw Gateway dispatch; returns `bot`                                  |
| `bot.component(pattern, handler, options?)` | Register a component route; returns a disposal function                                    |
| `bot.modal(pattern, handler, options?)`     | Register a modal route; returns a disposal function                                        |
| `await bot.registerCommands(guildId?)`      | Upsert declared commands; requires an application ID                                       |
| `await bot.send(channelId, input)`          | Prepare and send a channel message; returns the raw Discord message                        |
| `await bot.plugin(plugin)`                  | Install a lifecycle plugin before startup; resolves to `bot`                               |
| `bot.rest`                                  | REST client for raw endpoints and prepared message sends/edits                             |
| `bot.shards`                                | Map of shard ID to `Gateway`                                                               |
| `bot.cache.users`, `bot.cache.messages`     | Bounded caches of raw Discord payloads                                                     |
| `bot.user`                                  | Connected bot user after READY                                                             |

`bot.stop()` is a shutdown operation. Construct a new client for a fresh application lifecycle after shutdown.

## Commands

```ts
bot.command(
  'greet',
  {
    description: 'Greet someone',
    options: {
      name: { type: 'string', description: 'Display name', required: true },
      count: { type: 'integer', description: 'Repetitions', minValue: 1, maxValue: 5 },
    },
    cooldown: 3000,
  },
  async (ctx) => {
    // TypeScript infers name: string and count: number | undefined.
    await ctx.reply(`Hello ${ctx.options.name}, ${ctx.options.count ?? 1} times.`);
  },
);
```

| Command option      | Behavior                                                                         |
| ------------------- | -------------------------------------------------------------------------------- |
| `description`       | Slash command description                                                        |
| `options`           | Named schema entries                                                             |
| `type`              | `1` slash, `2` user context menu, `3` message context menu                       |
| `cooldown`          | Per-user command cooldown in milliseconds                                        |
| `permissions`       | Required invoking-member permission bitfield as `bigint`                         |
| `middleware`        | Command-specific middleware array                                                |
| `autocomplete(ctx)` | Autocomplete handler; respond with `ctx.autocomplete(...)`                       |
| `autoDefer`         | `false` or `{ after?, ephemeral? }`; commands default to deferring after 1800 ms |

Schema types: `string`, `integer`, `number`, `boolean`, `user`, `channel`, `role`, `mentionable`, and `attachment`. Each entry requires a `description`. Optional fields include `required`, `autocomplete`, `choices`, `minValue`, `maxValue`, `minLength`, and `maxLength`, as applicable to the type.

Use space-separated command paths such as `admin role add` for groups and subcommands. Entity options return IDs, not hydrated Discord objects. Registration does not delete stale commands. Permission guards check the invoking member; your action handler must also validate the bot's permissions and any target-specific constraints.

## Interaction context

| Property          | Value                                                                          |
| ----------------- | ------------------------------------------------------------------------------ |
| `ctx.interaction` | Original typed Discord interaction, including its sensitive continuation token |
| `ctx.user`        | Invoking Discord user                                                          |
| `ctx.guildId`     | Guild ID, or `undefined` outside a guild                                       |
| `ctx.options`     | Parsed command options, inferred from the schema                               |
| `ctx.targetId`    | Context-menu target ID                                                         |
| `ctx.customId`    | Component/modal custom ID                                                      |
| `ctx.params`      | Suffix matched by a trailing route wildcard                                    |
| `ctx.values`      | Select-menu values                                                             |
| `ctx.fields`      | Modal values: strings, string arrays, booleans, or null                        |
| `ctx.focused`     | Autocomplete option `{ name, value }`, when applicable                         |
| `ctx.state`       | Acknowledgement state: fresh, pending, replied, deferred, or failed            |

| Method                            | Use                                                                         |
| --------------------------------- | --------------------------------------------------------------------------- |
| `await ctx.reply(input)`          | Initial message reply, or edit the response after a message deferral        |
| `await ctx.defer({ ephemeral? })` | Acknowledge a slow command before preparing a message                       |
| `await ctx.editReply(input)`      | Edit the original response                                                  |
| `await ctx.followUp(input)`       | Send a follow-up through the interaction webhook; returns the REST response |
| `await ctx.update(input)`         | Acknowledge a component and edit its source message                         |
| `await ctx.deferUpdate()`         | Acknowledge a component before slower work                                  |
| `await ctx.showModal(data)`       | Open a modal as the initial response                                        |
| `await ctx.autocomplete(choices)` | Return autocomplete choices                                                 |

`input` can be a string, `UI.message()`, `{ ui: message }`, raw message JSON, or `{ body, files }`. Most response methods resolve without a message object. Use `bot.send(...)` when you need the raw channel-message result for later edits.

Only one initial acknowledgement is allowed. Defer slow component work explicitly. Commands opening modals should set `autoDefer: false`; autocomplete cannot defer. Ephemerality is established by the initial reply/deferral. Discord requires the initial response within three seconds and limits interaction continuation tokens to fifteen minutes. See [Discord's response documentation](https://docs.discord.com/developers/interactions/receiving-and-responding).

## Routes and collectors

```js
const off = bot.component(
  'profile:*',
  async (ctx) => {
    await ctx.reply(`Selected profile: ${ctx.params}`);
  },
  { userId: ownerId, timeout: 60_000 },
);

// Call off() when your application removes the route.
```

Patterns are exact IDs or prefixes ending in one `*`. Exact routes win. Routes can restrict a user or expire after a timeout in milliseconds. Command middleware and permissions do not automatically apply to component/modal handlers.

`await bot.interactions.collect(filter, { timeout, signal })` returns one matching context. A collector claims the interaction ahead of ordinary routes; the caller must acknowledge it. Timeout/cancellation rejects. Use persistent routes for long-lived panels.

## Events

```js
const off = bot.on(
  'MESSAGE_CREATE',
  (message) => {
    console.log(message.id, message.channel_id);
  },
  { priority: 10 },
);
bot.once('ready', (user) => console.log(user.username));
bot.on('error', (error) => console.error(error));
```

Gateway event names use uppercase Discord names and require the appropriate intents. Event payloads are raw wire objects. Listeners run synchronously in priority order; asynchronous failures are observed and forwarded to `error`. `on`/`once` return disposal functions. Do not acknowledge the same interaction in both a raw event listener and a command/component handler.

## Message builders

```js
const prepared = await UI.message()
  .text('## Settings')
  .button('Save', 'settings:save')
  .ephemeral()
  .build();
```

| Method                                                | Behavior                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| `.text(markdown)`                                     | Add a native Text Display                                    |
| `.content(text)`                                      | Legacy content; converted to a Text Display when building V2 |
| `.add(...components)`                                 | Add typed native top-level components                        |
| `.embed(data)`                                        | Add a traditional embed; incompatible with V2                |
| `.button(label, id, options?)`                        | Append a real native button, packing rows when possible      |
| `.select(id, options, settings?)`                     | Add a string select in its own row                           |
| `.canvas(scene, { name?, description? }?)`            | Render a scene as an attachment                              |
| `.attach({ name, data, contentType?, description? })` | Attach bytes                                                 |
| `.mode('legacy' \| 'v2')`                             | Choose a message mode                                        |
| `.ephemeral(enabled?)`                                | Set the interaction-only ephemeral flag                      |
| `.mentions(allowedMentions)`                          | Explicitly override mention suppression                      |
| `await .build({ renderer?, attachmentLimit? }?)`      | Return `{ body, files?, explanations? }` after validation    |

`body` is Discord JSON; `files` contains upload bytes. `prepareMessage(input, options?)` normalizes the other supported message input forms. Built-in normalized sends suppress mentions and reply pings by default. Raw `REST.request` payloads remain your responsibility.

Native factories include `row`, `button`, `link`, `premium`, `select`, `userSelect`, `roleSelect`, `mentionSelect`, `channelSelect`, `section`, `textDisplay`, `thumbnail`, `gallery`, `file`, `separator`, `container`, `label`, `input`, `upload`, `radio`, `checkboxGroup`, `checkbox`, and `modal`. Their typed options follow Discord wire fields such as `custom_id` and `max_length`. Placement rules differ between messages and modals; see [UI](UI.md).

## Canvas, hybrid, and templates

`UI.canvas({ width, height, background?, theme?, scale? })` returns a mutable scene with `.add(...elements)`. Visual factories are `box`, `card`, `text`, `image`, `avatar`, `progress`, `circle`, and `badge`.

Coordinates are parent-relative numbers or percentage strings. Use `z`, `anchor`, `opacity`, `radius`, `border`, `shadow`, `clip`, padding, and row/column layout to compose graphics. These are renderer options, not CSS. `progress.value` is a percentage from 0 to 100. Images accept PNG/JPEG bytes or `{ asset: id }` with an application-supplied resolver.

`UI.hybrid({ canvas?, children })` keeps supported controls/text native and renders positioned visuals. `.build()` returns explanations when native control coordinates cannot be preserved.

`templates` exports `profile`, `xp`, `leaderboard`, `welcome`, `ticket`, `moderation`, `music`, `poll`, `server`, `inventory`, `shop`, `help`, and `settings`. Visual templates support dimensions, theme, controls, and a `decorate(scene)` hook. Native templates use Discord's layout. See [template example](EXAMPLES.md#templates) and [UI boundaries](UI.md#templates).

## Reactive state

| API                                               | Behavior                                                             |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| `new State(initial)`                              | Create state using detached structured copies                        |
| `state.get()`                                     | Return a detached current value                                      |
| `state.set(valueOrUpdater)`                       | Replace state and notify subscribers                                 |
| `state.update(partial)`                           | Shallow-merge object state                                           |
| `state.subscribe(callback)`                       | Subscribe; returns an unsubscribe function                           |
| `state.snapshot()`                                | Serialize a versioned JSON snapshot; state must be JSON serializable |
| `State.restore(json, typeGuard)`                  | Restore validated state                                              |
| `new ReactiveView(state, render, edit, options?)` | Bind state to a message builder and edit transport                   |
| `await view.flush()`                              | Render and finish pending edits; also performs the initial render    |
| `await view.expire()`                             | Dispose and optionally disable the last message's controls           |
| `view.dispose()`                                  | Release subscriptions/timers without a final edit                    |
| `view.metrics`                                    | Render, edit, and skipped-edit counters                              |

View options: `debounce` (default 100 ms), `timeout` (default 900000 ms; `0` disables), `disableOnExpire`, `onError`, `persist`, `renderer`, and `attachmentLimit`. Rebuilds are coalesced and edits serialized; unchanged prepared payloads are skipped. Persistence stores state, not routes or closures. Use channel-message edits for durable panels. See the [reactive example](../examples/reactive-bot.ts).

## Low-level networking and plugins

`REST.request(method, apiRelativePath, { body?, files?, auth?, signal?, reason? })` provides raw API access. `bot.rest.edit(channelId, messageId, prepared)` and `.send(channelId, prepared)` expect an already prepared message. `Gateway.send(op, data)` exposes the protocol boundary, while `shardForGuild(guildId, total)` computes routing.

REST handles bounded 429 retries, not automatic retries of ambiguous network/5xx mutations. Shard identification and global REST limits are coordinated within a process/client. A distributed fleet needs shared coordination.

Plugins expose `name`, `version`, optional `dependencies`, `setup({ bot, cleanup })`, `start`, and `stop`. Await installation, install dependencies first, and install before `start()`. Plugins run as trusted code in the same process. See [architecture](ARCHITECTURE.md).

[Documentation index](README.md)
