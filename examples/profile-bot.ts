import { readFile } from 'node:fs/promises';
import { Ozka, UI } from '../index.js';
import { createRenderer } from '../packages/renderer/index.js';
import { showcase } from './showcase.js';
const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error('Set DISCORD_TOKEN before running this example.');
const renderer = createRenderer({
  fonts: [
    { family: 'Outfit', data: await readFile(new URL('assets/Outfit.ttf', import.meta.url)) },
  ],
});
const avatar = await readFile(new URL('assets/avatar.png', import.meta.url));
const bot = new Ozka({
  token,
  renderer,
  registerCommands: process.env.DISCORD_GUILD_ID ? { guildId: process.env.DISCORD_GUILD_ID } : true,
});
bot.command('profile', async (ctx) =>
  ctx.reply(
    UI.message()
      .canvas(showcase(avatar), {
        description: 'Community profile with independent cards, progress bars and avatar.',
      })
      .button('View projects', 'profile:projects')
      .button('Settings', 'profile:settings', { style: 2 }),
  ),
);
bot.component('profile:projects', (ctx) =>
  ctx.reply({
    content:
      'You have three projects in motion. This demonstration uses local sample profile data.',
    flags: 64,
  }),
);
bot.component('profile:settings', (ctx) =>
  ctx.showModal(
    UI.modal('profile:save', 'Profile preferences', [
      UI.label('Display name', UI.input({ custom_id: 'display-name', style: 1, max_length: 40 })),
      UI.label('Show badges', UI.checkbox('badges', true)),
    ]),
  ),
);
bot.modal('profile:save', (ctx) =>
  ctx.reply({
    content: `Received display name: ${ctx.fields['display-name']}. Badge visibility: ${ctx.fields.badges}. Add application storage to persist these preferences.`,
    flags: 64,
  }),
);
bot.on('error', (error) => console.error(error instanceof Error ? error.message : error));
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.once(signal, () => {
    void bot.stop().then(() => process.exit(0));
  });
await bot.start();
