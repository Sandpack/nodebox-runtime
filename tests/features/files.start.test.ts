import { test, expect } from 'tests';
import type { FileWatchEvent } from '@codesandbox/nodebox';

test('starts a vanilla project and make sure files are readable', async ({ runTestServer, emulatorUrl, page }) => {
  await runTestServer();

  const fileContent = await page.evaluate(async (emulatorUrl) => {
    const { Nodebox } = window;

    const emulator = new Nodebox({
      runtimeUrl: emulatorUrl,
      iframe: document.getElementById('frame') as HTMLIFrameElement,
    });

    await emulator.connect();
    await emulator.fs.init({});

    await emulator.fs.writeFile('/App.js', 'console.log("Hello World")', 'utf8');
    return await emulator.fs.readFile('/App.js', 'utf8');
  }, emulatorUrl);

  expect(fileContent).toBe('console.log("Hello World")');
});

test('starts a vanilla project and watch file changes', async ({ runTestServer, emulatorUrl, page }) => {
  await runTestServer();

  type WatchOutput = FileWatchEvent | undefined;

  const watchOutput = await page.evaluate(async (emulatorUrl) => {
    const { Nodebox } = window;

    const emulator = new Nodebox({
      runtimeUrl: emulatorUrl,
      iframe: document.getElementById('frame') as HTMLIFrameElement,
    });

    await emulator.connect();
    await emulator.fs.init({});

    const watchEvents: WatchOutput[] = [];
    await emulator.fs.watch(['*'], [], (data) => {
      watchEvents.push(data);
    });

    await emulator.fs.writeFile('/index.js', `console.log("Hello")`, 'utf8');

    return watchEvents;
  }, emulatorUrl);

  expect(watchOutput).toEqual([
    {
      type: 'create',
      path: '/index.js',
    },
  ]);
});
