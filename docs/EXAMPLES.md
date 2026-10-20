# Runnable examples

Use the JavaScript examples in your own project with the published package. The TypeScript examples belong to the source repository and use local source imports.

## Published-package JavaScript

### Native bot

Follow the [quickstart](QUICKSTART.md), then copy [quickstart.mjs](../examples/quickstart.mjs) into your project. It registers `/ping`, `/panel`, and a native button handler.

```sh
npm install ozka.js@alpha
node --env-file=.env quickstart.mjs
```

Requires `DISCORD_TOKEN` and `DISCORD_GUILD_ID` in `.env`. Does not require graphics or privileged intents.

### Local PNG

Copy [render-card.mjs](../examples/render-card.mjs) into your project:

```sh
npm install ozka.js@alpha @napi-rs/canvas
node render-card.mjs
```

Output: `ozka-card.png` in the current directory, containing a gradient, card, independently positioned text, progress, and a badge. No token or Discord connection is used.

## Source-repository examples

From the repository root:

```sh
npm ci
npm run build
```

For bot examples, put `DISCORD_TOKEN` and `DISCORD_GUILD_ID` in a private `.env` in the repository root. The TypeScript bot examples fall back to global command registration when no guild ID is supplied; set the guild ID for development.

| Example                                             | Run                                                          | Demonstrates                                                            |
| --------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| [Basic bot](../examples/basic.ts)                   | `node --env-file=.env --import tsx examples/basic.ts`        | Commands, inferred options, cooldowns, and a native button              |
| [Profile bot](../examples/profile-bot.ts)           | `node --env-file=.env --import tsx examples/profile-bot.ts`  | Full canvas showcase, bundled font/avatar, native controls, and a modal |
| [Reactive bot](../examples/reactive-bot.ts)         | `node --env-file=.env --import tsx examples/reactive-bot.ts` | Per-message state, user-scoped controls, batching, expiry, and cleanup  |
| [Render demo](../examples/render-demo.ts)           | `npm run demo`                                               | Local PNG plus the corresponding Discord message payload                |
| [Compatibility smoke](../examples/compat-smoke.mjs) | `node examples/compat-smoke.mjs`                             | Native-only compiled ESM imports; run the build first                   |

The render demo writes [showcase.png](../artifacts/showcase.png) and [showcase.payload.json](../artifacts/showcase.payload.json). The shared [showcase scene](../examples/showcase.ts) demonstrates nested cards, percentage positioning, gradients, custom fonts, an avatar, layers, and independent progress indicators.

## Templates

Inside an existing command handler:

```js
import { templates, UI } from 'ozka.js';

const panel = templates.profile({
  name: 'Alex',
  bio: 'Building something new.',
  stats: [{ label: 'Projects', value: '12' }],
  theme: { accent: '#6ee7b7' },
  controls: [UI.button('Settings', 'profile:settings')],
});
await ctx.reply(panel);
```

This profile uses graphics, so install `@napi-rs/canvas`. Register `profile:settings` separately. An avatar is optional; pass trusted image bytes or a configured asset ID to add one.

Native-only example:

```js
await ctx.reply(
  templates.help({
    title: 'How can I help?',
    commands: [
      { name: 'ping', description: 'Check that the bot responds' },
      { name: 'panel', description: 'Open the example panel' },
    ],
  }),
);
```

Templates build interfaces, not backend services. Music requires your own playback system; tickets require your own provisioning; polls require your own tally/storage. Shop buttons require valid approved application SKU IDs.

## What to verify in Discord

After running a bot, check registration, the initial response, button/menu acknowledgements, modal submissions, and error reporting. For graphics, check that the attachment and description appear; for reactive views, check rapid clicks, expiry, and unauthorized users. These are suggested live validation steps, not claims of completed live testing.

[Documentation index](README.md)
