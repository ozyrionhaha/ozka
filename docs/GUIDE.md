# Getting started

Use a bot token from the Discord Developer Portal through an environment variable. Never paste it into source, issue reports, logs or UI state. Enable only necessary Gateway intents and invite your app with the command scope. The default `Intents.Guilds` supports guild lifecycle events; `Intents.GuildMessages` enables message events. Message content may require the privileged `MessageContent` intent and Portal approval. Likewise member and presence events need privileged intents. Bot permissions and intents are separate.

For a complete first bot, start with the [quickstart](QUICKSTART.md). Source-repository TypeScript examples import local source; run `node --env-file=.env --import tsx examples/basic.ts` after installing development dependencies and creating `.env`. Set `DISCORD_GUILD_ID` for development registration. Use `import { Ozka } from 'ozka.js'` in an installed application. The package is ESM; use `.mjs` or `"type": "module"`.

## Commands and inferred options

```ts
bot.command(
  'greet',
  {
    description: 'Greet someone',
    options: {
      name: { type: 'string', description: 'Name', required: true },
      count: { type: 'integer', description: 'Repetitions' },
    },
    cooldown: 3000,
    permissions: 0n,
  },
  async (ctx) => {
    // name: string; count: number | undefined
    await ctx.reply(`Hello ${ctx.options.name}, ${ctx.options.count ?? 1} times.`);
  },
);
```

Option values for users, roles, channels, mentionables and attachments are IDs. Access Discord's resolved objects through `ctx.interaction.data` after narrowing the interaction type. No hidden entity hydration or fetch occurs. Context menu targets are available at `ctx.targetId`.

Use names such as `admin role add` for a root, group and subcommand. A root cannot have both a direct handler and subcommands. Each command can supply its own option schema, handler and middleware. Context-menu commands use `{ type: 2 }` for users or `{ type: 3 }` for messages. Their names can contain spaces and mixed case; they cannot have slash options.

Automatic registration is opt-in with `registerCommands: true` or `{ guildId }`. It runs after READY and upserts the declared command names. Alternatively set `applicationId` and call `await bot.registerCommands(guildId)` before connecting. Stale commands are not deleted automatically; use REST deliberately to remove them. Common schema constraints are validated locally; Discord remains authoritative for platform limits and application-specific rules.

For autocomplete, set `autocomplete: true` on a string/integer/number option and provide a command-level `autocomplete(ctx)` handler. `ctx.focused` identifies the focused option; respond with `ctx.autocomplete(choices)` (at most 25).

## Middleware and authorization

```ts
bot.use(async (ctx, next) => {
  const start = performance.now();
  await next();
  console.log('Command duration:', performance.now() - start);
});
```

Call `next()` at most once; omit it to stop command execution. Global middleware runs before per-command middleware. Command permission and per-user cooldown guards run before middleware. Permissions use the invoking member's bitfield, including administrator bypass. A bot's ability to carry out a moderation action must still be checked independently in the action handler. Component/modal routes do not inherit command permissions: check them in each sensitive handler. Restrict user-specific controls with `{ userId }`.

## Interactions

`ctx.reply(input)`, `defer({ ephemeral })`, `editReply(input)`, `followUp(input)`, `update(input)`, `deferUpdate()`, `showModal(data)`, and `autocomplete(choices)` correspond to actual Discord response modes. `input` accepts a string, `UI.message()`, `{ ui: message }`, raw message JSON, or `{ body, files }`.

Commands auto-defer after 1.8 seconds. This timer can acknowledge while a PNG is rendering; the pending reply then edits the deferred response. Use `{ autoDefer: { after: 1500, ephemeral: true } }` for private slow commands. Ephemerality is established by the initial response; editing cannot convert a public deferred reply into a private one. Set `{ autoDefer: false }` on commands that open a modal. Autocomplete cannot defer. Component handlers should call `deferUpdate()` before slow work. Initial responses must arrive within three seconds; webhook continuations expire after fifteen minutes. Ozka checks these deadlines using the interaction snowflake and prevents concurrent initial acknowledgements.

```ts
bot.component('settings:*', async (ctx) => {
  await ctx.showModal(
    UI.modal('settings:save', 'Preferences', [
      UI.label('Display name', UI.input({ custom_id: 'name', style: 1 })),
      UI.label('Receive updates', UI.checkbox('updates')),
    ]),
  );
});
bot.modal('settings:save', async (ctx) => {
  await ctx.reply({ content: `Saved ${ctx.fields.name}`, flags: 64 });
});
```

Routes accept exact IDs or one trailing `*`. The wildcard suffix appears in `ctx.params`. Exact routes win over wildcard routes; registration order resolves overlapping prefixes. `ctx.values` contains select values; `ctx.fields` recursively extracts modal string, array, boolean and nullable values. Validate these before persistence. Every submitted value and client-supplied ID is untrusted application input.

Routes return disposal functions. Optional `{ timeout, userId }` controls their lifetime and user scope. `bot.interactions.collect(filter, { timeout, signal })` resolves with one matching context, which your code must acknowledge. A collector claims the matching interaction before ordinary routes. Timed-out and cancelled collectors reject; bot shutdown closes them. Persistent routes are preferable for long-lived panels.

## Events and errors

```ts
const off = bot.on('MESSAGE_CREATE', (message) => console.log(message.id));
bot.once('ready', (user) => console.log(`Ready as ${user.username}`));
bot.on('error', (error) => console.error(error));
off();
```

Official Gateway events use uppercase names and precise payload types. Listeners are synchronous; returned promises are observed and failures go to `error`. Optional `{ priority: 10, once: true }` controls ordering and lifetime. Subscriptions use copy-on-write snapshots, so changing listeners during an emit affects later emits. `bot.useEvents(async (packet, next) => { await next(); })` intercepts raw dispatch before caches, listeners and framework routing. Raw listeners should not also acknowledge interactions handled by commands/routes.

Errors have stable `OzkaError.code` identifiers and actionable messages. Permission and cooldown errors are safe to display; unexpected handler errors produce a generic response and emit the detailed error to your logger. Network/5xx REST failures are not automatically retried because an operation may already have succeeded. Reconcile state before retrying mutations.

`await bot.stop()` disconnects shards, closes collectors, clears caches and stops plugins. Register application shutdown handlers as in the examples.
