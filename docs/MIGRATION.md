# Migrating from discord.js

Ozka is independent; it does not wrap or instantiate discord.js. Both can register commands on the same application, so test in a separate guild and avoid responding to the same interactions from two running clients. Keep your token and application configuration in environment variables.

| discord.js pattern                                | Ozka equivalent                                      |
| ------------------------------------------------- | ---------------------------------------------------- |
| `new Client({ intents })` + `client.login(token)` | `new Ozka({ token, intents })` + `await bot.start()` |
| `client.once('ready', client => ...)`             | `bot.once('ready', user => ...)`                     |
| `client.on('messageCreate', message => ...)`      | `bot.on('MESSAGE_CREATE', rawMessage => ...)`        |
| `interactionCreate` switch on commandName         | `bot.command(name, options?, handler)`               |
| `SlashCommandBuilder` + REST registration         | inferred `options` schema + `registerCommands`       |
| `EmbedBuilder`                                    | `.embed({ title, description, ... })`                |
| `ActionRowBuilder` / `ButtonBuilder`              | `UI.row(UI.button(label,id))`                        |
| `interaction.deferReply({ flags: 64 })`           | `ctx.defer({ ephemeral: true })`                     |
| `interaction.editReply(payload)`                  | `ctx.editReply(payload)`                             |
| `interaction.update(payload)`                     | `ctx.update(payload)`                                |
| `interaction.showModal(...)`                      | `ctx.showModal(UI.modal(...))`                       |
| `interaction.options.getString('name', true)`     | `ctx.options.name` from a required string schema     |
| `client.destroy()`                                | `await bot.stop()`                                   |

```ts
import { Ozka, UI } from 'ozka.js';
const bot = new Ozka({
  token: process.env.DISCORD_TOKEN!,
  registerCommands: { guildId: process.env.DISCORD_GUILD_ID! },
});
bot.command(
  'profile',
  {
    description: 'Show a profile',
    options: { name: { type: 'string', description: 'Display name', required: true } },
  },
  (ctx) =>
    ctx.reply(
      UI.message().add(
        UI.container([
          UI.textDisplay(`## ${ctx.options.name}`),
          UI.row(UI.button('Settings', 'profile:settings')),
        ]),
      ),
    ),
);
bot.component('profile:settings', (ctx) => ctx.reply({ content: 'Settings opened', flags: 64 }));
await bot.start();
```

Event payloads and cached values are raw Discord objects with snake_case fields. They do not have hydrated methods such as `message.reply()` or `member.ban()`. Use `bot.send(message.channel_id, ...)` and `bot.rest.request(method,path,options)`. Raw wire access is deliberate; it avoids an entity manager for basic bots and keeps uncommon endpoints accessible.

Do not copy a Components V2 flag onto a payload containing embeds. Use Ozka native containers/sections or choose legacy mode. Use a canvas for arbitrary positions. Buttons painted onto an attachment cannot be clicked; append real native controls.

Collection helpers, sharding process managers, voice playback, advanced permission computation (roles/overwrites), automatic entity fetching and discord.js plugins are not drop-in compatible. Migrate one command or panel at a time and verify application permissions and intents. Retain your application database and business logic; translate the networking/UI boundary.
