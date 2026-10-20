import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';
import { createRenderer } from '../packages/renderer/index.js';
import { UI } from '../index.js';
import { showcase } from './showcase.js';
const root = new URL('../', import.meta.url);
const avatarCanvas = createCanvas(180, 180);
const c = avatarCanvas.getContext('2d');
const gradient = c.createLinearGradient(0, 0, 180, 180);
gradient.addColorStop(0, '#7aa5c7');
gradient.addColorStop(1, '#384c72');
c.fillStyle = gradient;
c.fillRect(0, 0, 180, 180);
c.fillStyle = '#b8d0db';
c.beginPath();
c.ellipse(90, 75, 33, 38, 0, 0, Math.PI * 2);
c.fill();
c.beginPath();
c.ellipse(90, 174, 70, 60, 0, 0, Math.PI * 2);
c.fill();
c.fillStyle = '#263a56';
c.beginPath();
c.ellipse(89, 47, 37, 24, -0.15, Math.PI, Math.PI * 2);
c.fill();
const avatar = await avatarCanvas.encode('png');
await writeFile(new URL('examples/assets/avatar.png', root), avatar);
const renderer = createRenderer({
  fonts: [{ data: await readFile(new URL('examples/assets/Outfit.ttf', root)), family: 'Outfit' }],
});
const design = showcase(avatar);
await mkdir(new URL('artifacts/', root), { recursive: true });
const message = await UI.message()
  .canvas(design, {
    description:
      'Community profile with freely positioned cards, progress, layered decoration and a bottom-right avatar.',
  })
  .button('View projects', 'profile:projects')
  .button('Settings', 'profile:settings', { style: 2 })
  .build({ renderer });
await writeFile(new URL('artifacts/showcase.png', root), message.files![0]!.data);
await writeFile(
  new URL('artifacts/showcase.payload.json', root),
  JSON.stringify({ body: message.body, explanations: message.explanations }, null, 2) + '\n',
);
console.log(`Rendered ${fileURLToPath(new URL('artifacts/showcase.png', root))}`);
