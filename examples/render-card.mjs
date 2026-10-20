import { writeFile } from 'node:fs/promises';
import { UI } from 'ozka.js';

const design = UI.canvas({
  width: 1000,
  height: 600,
  background: { from: '#10121a', to: '#242a45', angle: 35 },
});

design.add(
  UI.card({
    x: 40,
    y: 40,
    width: 450,
    height: 200,
    title: 'Your workspace',
    description: 'Independent cards. Real coordinates. One Discord message.',
  }),
  UI.text('Make it your own.', {
    x: '50%',
    y: 300,
    width: 700,
    height: 70,
    anchor: 'center',
    align: 'center',
    fontSize: 42,
    color: '#ffffff',
  }),
  UI.progress({ x: 40, y: 450, width: 600, height: 18, value: 75 }),
  UI.badge('LEVEL 12', { x: 800, y: 500, width: 150, height: 40 }),
);

const prepared = await UI.message()
  .canvas(design, { description: 'Workspace card with progress at 75 percent.' })
  .build();
await writeFile('ozka-card.png', prepared.files[0].data);
console.log('Wrote ozka-card.png');
