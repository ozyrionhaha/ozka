# Troubleshooting

Start with the [quickstart](QUICKSTART.md). Record your Node version, ozka.js version, error code, and a minimal reproduction. Do not post tokens, `.env`, full interaction payloads, or private user data.

## Installation and startup

| Symptom                                         | Check and fix                                                                                                                                   |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `Cannot use import statement outside a module`  | Use a `.mjs` file, or set `"type": "module"` in your application's `package.json`                                                               |
| `ERR_REQUIRE_ESM` or missing CommonJS exports   | Use ESM `import`; this alpha has no CommonJS export                                                                                             |
| `TOKEN_REQUIRED`                                | Confirm `.env` contains `DISCORD_TOKEN` and run `node --env-file=.env bot.mjs` from the correct folder                                          |
| `node: .env: not found`                         | Create `.env` in the current directory or supply its actual path                                                                                |
| WebSocket/runtime errors on an old Node version | Check `node --version`; use Node 22+                                                                                                            |
| REST 401 or fatal Gateway authentication        | Use the bot token for this application, without a `Bot ` prefix; update it if it was regenerated                                                |
| `READY_TIMEOUT`                                 | Check network connectivity, intents, shard configuration, and identify allowance; increasing the timeout alone does not fix invalid credentials |
| `SESSION_EXHAUSTED`                             | Respect Discord's session-start reset and coordinate IDENTIFY across processes                                                                  |

The source repository requires `npm ci` and `npm run build` for compiled examples. A consumer project only needs `npm install ozka.js@alpha`. Development-only competitor packages are used for benchmarks and are not runtime dependencies of published ozka.js.

## Slash commands are missing

1. Confirm the bot printed its ready message and emitted no registration error.
2. Set `registerCommands: { guildId: process.env.DISCORD_GUILD_ID }` and use that same server in Discord.
3. Confirm the value is the server ID, not a channel or application ID.
4. Install the application with both `bot` and `applications.commands` scopes.
5. Check your permission to use application commands in that channel and the server's application integration settings.
6. Check that another running bot process is not changing the same command definitions.

Registration is opt-in. `registerCommands: true` targets global commands; a guild ID makes development easier. Removing a command from source does not delete its existing Discord registration. Use the raw REST API deliberately for cleanup.

## Messages or member events are missing

Gateway intents select which events Discord sends. `Intents.Guilds` is the default; it does not subscribe to all message/member events. Add only the intents your application needs. Reading message content or receiving certain member/presence events can require privileged intents enabled and, where applicable, approved in the Developer Portal.

Raw event names use Discord's uppercase names, such as `MESSAGE_CREATE`. Payloads use wire fields such as `channel_id`; they do not provide hydrated methods such as `message.reply()`.

## Commands work, but buttons do not

- Register `bot.component('the-custom-id', handler)` for the actual button ID. Link and premium buttons do not call custom-ID handlers.
- Check that a route has not expired or been disposed. User-scoped routes reject other users.
- A matching collector claims an interaction before ordinary routes; acknowledge the context returned by that collector.
- For this Gateway-based client, check that an existing HTTP Interactions Endpoint URL is not receiving interactions instead. Discord describes the delivery methods in its [interaction documentation](https://docs.discord.com/developers/interactions/receiving-and-responding).
- A button painted into a PNG is visual content. Add a real native button outside the image to receive interactions.

## Interaction failures

| Symptom                                               | Action                                                                                                                         |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `INTERACTION_EXPIRED`                                 | Respond or defer promptly; use channel-message edits for durable views after interaction tokens expire                         |
| Duplicate acknowledgement                             | Do not reply in both a raw `INTERACTION_CREATE` listener and a framework handler; after replying use `followUp` or `editReply` |
| A modal cannot open after slow work                   | Set the command's `autoDefer: false` and open the modal as its initial response within Discord's deadline                      |
| Private reply becomes public or cannot become private | Set ephemeral behavior on the initial reply/deferral; edits cannot change that decision                                        |
| “This control has expired or is no longer available”  | Restore/register its route, check timeout/user scope, and recreate stale panels when appropriate                               |

Commands auto-defer by default; component handlers should call `await ctx.deferUpdate()` before slow work. Autocomplete cannot defer. Check the terminal's `error` listener for the original exception.

## UI validation and graphics

| Error or symptom                            | Fix                                                                                                                           |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `UI_V2_CONFLICT`                            | Replace embeds with native text/containers, or build a separate legacy message; ordinary embeds cannot share a V2 message     |
| Updating a V2 message fails                 | Keep the V2 mode on edits, for example `ctx.update(UI.message().text('Updated'))`                                             |
| `RENDERER_MISSING`                          | Run `npm install @napi-rs/canvas` in the bot project                                                                          |
| Native backend cannot load                  | Check the backend's support for your platform and whether optional platform packages were omitted during installation         |
| `ASSET_RESOLVER`                            | Pass trusted PNG/JPEG bytes, or configure `createRenderer({ resolveAsset })` for your asset ID format                         |
| Avatar absent despite a user object         | `UI.avatar({ user })` produces an asset ID; configure a resolver or pass `source: bytes`                                      |
| URL or file path rejected as an image       | The renderer does not download URLs or open arbitrary paths; use validated bytes or an application-owned resolver             |
| Text cut off                                | Increase its width/height, adjust font size/line height, or set a suitable `maxLines`; inspect output using the intended font |
| Requested native button coordinates ignored | Discord owns native control layout; hybrid rendering moves controls to valid rows and includes explanations                   |
| Attachment/component limit error            | Reduce the payload or configured image dimensions; do not bypass platform limits                                              |

Use [render-card.mjs](../examples/render-card.mjs) to isolate local rendering from Discord networking. The [UI guide](UI.md) documents resource bounds, media formats, fonts, and resolvers.

## Rate limits and reactive panels

REST 429 responses trigger bounded waits/retries. Do not add an immediate application retry loop around the client. `REST_QUEUE_FULL`, `REST_ROUTES_FULL`, or `RENDER_QUEUE` means resource bounds were reached; reduce concurrency and batch updates before increasing budgets.

Reactive views require `await view.flush()` for the initial render. Attach `onError` to observe asynchronous edit failures. Unchanged payloads are deliberately skipped. Use `state.set(...)` or `state.update(...)`; mutating the copy returned by `state.get()` does not update state.

For long-lived views, edit by channel/message ID. Persist application state and reconstruct routes after restarting; interaction tokens and closures are not durable storage. Expire or dispose views and routes when panels are removed.

## Before reporting a bug

Include a small code sample, package/runtime versions, expected versus observed behavior, and a redacted error code/stack. State whether the failure occurs in a local render, mock transport, or live Discord test. For private vulnerabilities, follow [SECURITY.md](../SECURITY.md).

[Documentation index](README.md)
