import { Ozka, Intents, UI } from '../index.js';
const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error('Set DISCORD_TOKEN before running this example.');
const bot = new Ozka({
  token,
  intents: Intents.Guilds,
  registerCommands: process.env.DISCORD_GUILD_ID ? { guildId: process.env.DISCORD_GUILD_ID } : true,
  logger: (entry) => {
    if (entry.level !== 'debug') console.log(entry.level, entry.message);
  },
});
bot.command('ping', (ctx) => ctx.reply('Pong!'));
bot.command(
  'hello',
  {
    description: 'Say hello',
    options: { name: { type: 'string', description: 'Your name', required: true } },
    cooldown: 2000,
  },
  (ctx) =>
    ctx.reply(UI.message().text(`## Hello, ${ctx.options.name}!`).button('Wave', 'hello:wave')),
);
bot.component('hello:wave', (ctx) =>
  ctx.reply({ content: `👋 Hello ${ctx.user.username}`, flags: 64 }),
);
bot.on('ready', (user) => console.log(`Connected as ${user.username}`));
bot.on('error', (error) => console.error(error instanceof Error ? error.message : error));
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.once(signal, () => {
    void bot.stop().then(() => process.exit(0));
  });
await bot.start();
