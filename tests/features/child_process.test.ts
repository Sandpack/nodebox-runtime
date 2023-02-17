import { test, expect } from 'tests';

test('exec', async ({ runTestServer, emulatorUrl, page }) => {
  await runTestServer();

  const watchOutput = await page.evaluate(async (emulatorUrl) => {
    const { Nodebox } = window;

    const emulator = new Nodebox({
      runtimeUrl: emulatorUrl,
      iframe: document.getElementById('frame') as HTMLIFrameElement,
    });

    await emulator.connect();
    await emulator.fs.init({
      'foo.js': `process.stdout.write('Hello world');
process.exit();`,

      'index.js': `const { exec } = require('node:child_process');
    
exec("./foo", { encoding: "utf8", timeout: 5_000 }, (err, stdout, stderr) => {
  console.log("Exec output:", stdout)
});`,
    });

    const shellProcess = emulator.shell.create();

    return new Promise<string>(async (resolve) => {
      shellProcess.stdout.on('data', (data) => {
        resolve(data);
      });

      await shellProcess.runCommand('node', ['index.js']);
    });
  }, emulatorUrl);

  expect(watchOutput).toEqual('Exec output: Hello world\n');
});

test('run binary command', async ({ runTestServer, emulatorUrl, page }) => {
  await runTestServer();

  const watchOutput = await page.evaluate(async (emulatorUrl) => {
    const { Nodebox } = window;

    const emulator = new Nodebox({
      runtimeUrl: emulatorUrl,
      iframe: document.getElementById('frame') as HTMLIFrameElement,
    });

    await emulator.connect();
    await emulator.fs.init({
      'index.js': `const { spawn } = require('node:child_process');
      const p = spawn("test");
      p.stdout.on('data', (data) => {
        console.log(\`stdout: $\{data\}\`);
      });
      p.on('close', (code) => {
        console.log("Closed output streams");
      });
      p.on('exit', (code) => {
        console.log(\`Exited with code: $\{code\}\`);
      });`,
      '/node_modules/.bin/test': `process.stdout.write('test');process.exit(0);`,
    });

    const shellProcess = emulator.shell.create();

    const expectedMessages = 3;
    const messages: string[] = [];
    return new Promise<string[]>(async (resolve) => {
      shellProcess.stdout.on('data', (data) => {
        messages.push(data);
        if (messages.length === expectedMessages) {
          resolve(messages);
        }
      });

      await shellProcess.runCommand('node', ['index.js']);
    });
  }, emulatorUrl);

  expect(watchOutput).toEqual(['stdout: test\n', 'Exited with code: 0\n', 'Closed output streams\n']);
});
