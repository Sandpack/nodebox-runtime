import { test, expect } from 'tests';
import waitFor from 'wait-for-expect';

test('exposes a "uv" process binding', async ({ runTestServer, emulatorUrl, page }) => {
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
      'index.js': `
const uv = process.binding('uv')
console.log(uv.errname(-50))
      `,
    });

    const shellProcess = emulator.shell.create();
    shellProcess.stderr.on('data', (data) => {
      console.error(data.trim());
    });
    shellProcess.stdout.on('data', (data) => {
      // eslint-disable-next-line no-console
      console.log(data.trim());
    });
    await shellProcess.runCommand('node', ['index.js']);
  }, emulatorUrl);

  await waitFor(() => {
    expect(logs).toEqual(expect.arrayContaining(['ENETDOWN']));
  });
});
