import { Ozka, UI, State, ReactiveView } from '../index.js';
const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error('Set DISCORD_TOKEN before running this example.');
const bot = new Ozka({
  token,
  registerCommands: process.env.DISCORD_GUILD_ID ? { guildId: process.env.DISCORD_GUILD_ID } : true,
});
const panels = new Set<{
  view: ReactiveView<{ count: number }>;
  off: () => void;
  timer: ReturnType<typeof setTimeout>;
}>();
bot.command(
  'counter',
  {
    description: 'Create a private-to-your-controls reactive panel',
    autoDefer: { ephemeral: true },
  },
  async (ctx) => {
    const channelId = ctx.interaction.channel_id;
    if (!channelId) throw new Error('Run /counter in a channel.');
    const sent = await bot.send(channelId, UI.message().text('Starting your counter…'));
    const state = new State({ count: 0 });
    const id = `counter:${sent.id}`;
    const view = new ReactiveView(
      state,
      (s) => UI.message().text(`## Your counter\n${s.count} steps forward.`).button('Add one', id),
      (message) => bot.rest.edit(channelId, sent.id, message),
      {
        timeout: 0,
        debounce: 100,
        disableOnExpire: true,
        onError: (error) => console.error(error),
      },
    );
    const off = bot.component(
      id,
      async (click) => {
        await click.deferUpdate();
        state.set((s) => ({ count: s.count + 1 }));
      },
      { userId: ctx.user.id, timeout: 900000 },
    );
    const entry = {
      view,
      off,
      timer: setTimeout(() => {
        void view.expire().catch(console.error);
        off();
        panels.delete(entry);
      }, 900000),
    };
    entry.timer.unref();
    panels.add(entry);
    await view.flush();
    await ctx.reply({
      content: 'Your counter is ready in this channel. Only you can use its button.',
      flags: 64,
    });
  },
);
bot.on('error', (error) => console.error(error instanceof Error ? error.message : error));
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.once(signal, () => {
    for (const entry of panels) {
      clearTimeout(entry.timer);
      entry.off();
      entry.view.dispose();
    }
    void bot.stop().then(() => process.exit(0));
  });
await bot.start();
