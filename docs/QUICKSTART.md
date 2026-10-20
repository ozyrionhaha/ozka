# Your first ozka.js bot

This guide creates a real Gateway-connected bot with `/ping`, `/panel`, and a native button. No public web server, graphics backend, or privileged intent is required for this example.

## 1. Install Node and the package

Use Node.js **22 or newer**. Check your version:

```sh
node --version
```

Open a terminal in the folder where you keep projects:

```sh
mkdir ozka-test
cd ozka-test
npm init -y
npm install ozka.js@alpha
```

## 2. Create and install your Discord app

In the [Discord Developer Portal](https://discord.com/developers/applications):

1. Create an application, or select an existing bot application.
2. Open **Bot** and obtain its bot token. Store it privately.
3. Open **Installation**, enable **Guild Install**, and configure a Discord Provided Link.
4. For Guild Install, select the `bot` and `applications.commands` scopes. Give the bot the channel permissions it needs, including View Channel and Send Messages for this example.
5. Open the installation link and add the app to a server you manage.

Discord's [official setup guide](https://docs.discord.com/developers/quick-start/getting-started) explains these settings. This example connects through the Gateway; leave the **Interactions Endpoint URL** unset for this test so Discord delivers interactions over the Gateway.

To obtain the server ID, enable Developer Mode in Discord's advanced settings, then use **Copy Server ID** from your server's context menu. Use the server ID, not the application ID or channel ID. Discord's [ID lookup guide](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID) covers desktop and mobile.

## 3. Configure credentials

Create a file named `.env` in `ozka-test`:

```dotenv
DISCORD_TOKEN=your_bot_token
DISCORD_GUILD_ID=your_test_server_id
```

Create `.gitignore`:

```gitignore
node_modules/
.env
```

Use the bot token without a `Bot ` prefix. Never commit `.env` or paste its contents into an issue. If a token is exposed, regenerate it in the Developer Portal and update `.env`.

## 4. Write the bot

Copy [quickstart.mjs](../examples/quickstart.mjs) into your project as `bot.mjs`, or use:

```js
import { Ozka, UI } from 'ozka.js';

const { DISCORD_TOKEN, DISCORD_GUILD_ID } = process.env;
if (!DISCORD_TOKEN || !DISCORD_GUILD_ID) {
  throw new Error('Set DISCORD_TOKEN and DISCORD_GUILD_ID in .env.');
}

const bot = new Ozka({
  token: DISCORD_TOKEN,
  registerCommands: { guildId: DISCORD_GUILD_ID },
});

bot.command('ping', (ctx) => ctx.reply('Pong!'));
bot.command('panel', (ctx) =>
  ctx.reply(
    UI.message()
      .text('## Hello from Ozka\nYour first native Discord panel.')
      .button('Try it', 'panel:try'),
  ),
);
bot.component('panel:try', (ctx) => ctx.reply('Your button works!'));

bot.on('ready', (user) => console.log(`Connected as ${user.username}`));
bot.on('error', (error) => console.error(error));

process.once('SIGINT', () => void bot.stop());
process.once('SIGTERM', () => void bot.stop());
await bot.start();
```

## 5. Run it

```sh
node --env-file=.env bot.mjs
```

The terminal should report `Connected as YOUR_BOT_NAME`. In the test server:

1. Run `/ping` and expect `Pong!`.
2. Run `/panel` and expect a text panel with a **Try it** button.
3. Press the button and expect `Your button works!`.

Keep the process running while testing; press Ctrl+C to stop it. ozka.js registers the declared guild commands when startup completes. It upserts commands and does not delete old commands automatically.

If commands are missing or startup fails, use [troubleshooting](TROUBLESHOOTING.md). This walkthrough describes expected live behavior; the release's completed validation is listed separately in [verification](VERIFICATION.md).

## 6. Add positioned graphics

Install the backend:

```sh
npm install @napi-rs/canvas
```

Download [render-card.mjs](../examples/render-card.mjs), then run:

```sh
node render-card.mjs
```

This writes `ozka-card.png` locally without a Discord token. To send a graphic in a command, use `ctx.reply(UI.message().canvas(design))`. See the [UI guide](UI.md) for nested layout, avatars, fonts, native controls, and hybrid rendering.

## JavaScript and TypeScript

JavaScript uses the published ESM exports directly. TypeScript declarations are bundled; no separate `@types` package is needed. Use a modern Node-compatible module setting such as `NodeNext`, and narrow environment variables before passing them to the client.

For source-repository TypeScript examples, install development dependencies with `npm ci`, then follow the [examples index](EXAMPLES.md).

[Documentation index](README.md)
