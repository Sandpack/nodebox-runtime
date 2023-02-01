import { test, expect } from 'tests';
import waitFor from 'wait-for-expect';

test('executes code that uses "process.binding()"', async ({ runTestServer, emulatorUrl, page }) => {
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
// We resolve certain bindings against our patched modules.
const { URL } = process.binding('url')
const link = new URL('https://codesandbox.io')
console.log(link.hostname)
      `,
    });

    const shellProcess = emulator.shell.create();
    await shellProcess.runCommand('node', ['index.js']);
  }, emulatorUrl);

  await waitFor(() => {
    // Must print the message from "index.js" to the console.
    expect(logs).toEqual(expect.arrayContaining(['codesandbox.io']));
  });
});

test('warns on executing code that uses unsupported binding', async ({ runTestServer, emulatorUrl, page }) => {
  await runTestServer();

  const warnings: Array<string> = [];
  page.on('console', (message) => {
    if (message.type() === 'warning') {
      warnings.push(message.text());
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
const { foo } = process.binding('zlib')
foo('bar')
      `,
    });

    const shellProcess = emulator.shell.create();
    await shellProcess.runCommand('node', ['index.js']);
  }, emulatorUrl);

  await waitFor(() => {
    // Must print a warning whenever accessing a valid process binding
    // that does not have a corresponding patched module on our side.
    expect(warnings).toEqual([
      `"process.binding("zlib")" is not yet implemented. Please file an issue on GitHub if you rely on this feature.`,
    ]);
  });
});

test('throws an error when using an invalid binding', async ({ runTestServer, emulatorUrl, page }) => {
  await runTestServer();

  const errors: Array<string> = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
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
      // Only a strict subset of modules is considered a valid binding in Node.js.
      // We have that validation as well to improve Node.js compatibility.
      'index.js': `
process.binding('invalid-binding-module')
      `,
    });

    const shellProcess = emulator.shell.create();
    await shellProcess.runCommand('node', ['index.js']);
  }, emulatorUrl);

  await waitFor(() => {
    // Must print a warning whenever accessing a valid process binding
    // that does not have a corresponding patched module on our side.
    expect(errors).toEqual(expect.arrayContaining([expect.stringContaining('No such module: invalid-binding-module')]));
  });
});
