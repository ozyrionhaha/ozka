import assert from 'node:assert/strict';
import { Ozka, UI, State, LRU } from '../dist/index.js';
assert.equal(typeof WebSocket, 'function');
const bot = new Ozka({ token: 'smoke-only-not-a-real-token' });
let called = false;
bot.once('ready', () => {
  called = true;
});
bot.emit('ready', {});
assert.equal(called, true);
const message = await UI.message().text('Hello').button('Go', 'go').build();
assert.equal(message.body.flags, 32768);
assert.equal(message.body.allowed_mentions.parse.length, 0);
assert.equal(new State({ a: 1 }).get().a, 1);
assert.equal(new LRU(2).set('a', 1).get('a'), 1);
await bot.stop();
console.log('Native-only ESM compatibility smoke passed.');
