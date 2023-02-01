import { test, expect } from 'tests';
import waitFor from 'wait-for-expect';

test('loads circular esm imports', async ({ runTestServer, emulatorUrl, page }) => {
  await runTestServer();

  const logs: Array<string> = [];
  page.on('console', (message) => {
    if (message.type() === 'log') {
      logs.push(message.text());
    }
  });

  await page.evaluate(async (emulatorUrl) => {
    const { Nodebox } = window;

    const emulator = new Nodebox({
      runtimeUrl: emulatorUrl,
      iframe: document.getElementById('frame') as HTMLIFrameElement,
    });

    await emulator.connect();
    await emulator.fs.init({
      '/index.mjs': `import { test, something } from './a.mjs';
        export function blabla() {
            return 'circular-dep-message';
        }
        await new Promise((resolve) => resolve('123'));
        console.log(something());
        export { test };
        `,
      '/a.mjs': `import { blabla } from './index.mjs';
        export function something() {
            return blabla();
        }
        export const test = 'abc';`,
      '/package.json': JSON.stringify({
        name: 'example',
        dependencies: {},
      }),
    });

    const shellProcess = emulator.shell.create();
    await shellProcess.runCommand('node', ['index.mjs']);
  }, emulatorUrl);

  await waitFor(() => {
    // Must print the message from "index.js" to the console.
    expect(logs).toEqual(['circular-dep-message']);
  });
});
