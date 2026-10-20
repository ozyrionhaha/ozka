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
