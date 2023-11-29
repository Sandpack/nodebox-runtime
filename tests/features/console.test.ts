import { test, expect } from 'tests';
import waitFor from 'wait-for-expect';

test('console#time', async ({ runTestServer, emulatorUrl, page }) => {
  await runTestServer();

  const stdout: Array<string> = [];
  const stderr: Array<string> = [];
  page.on('console', (msg) => {
    if (msg.type() === 'log') {
      stdout.push(msg.text());
    } else if (msg.type() === 'error') {
      stderr.push(msg.text());
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
      'main.js': `console.time();
      console.time('aaa');
      console.time('bbb');
      console.timeEnd();
      setTimeout(() => {
        console.timeEnd('aaa');
        console.timeLog('bbb');
      }, 50);
      setTimeout(() => {
        console.timeEnd('bbb');
        console.timeLog('aaa');
      }, 1000);`,
    });

    const shell = emulator.shell.create();
    shell.stderr.on('data', (data) => {
      console.error(data.trim());
    });
    shell.stdout.on('data', (data) => {
      // eslint-disable-next-line no-console
      console.log(data.trim());
    });
    await shell.runCommand('node', ['main.js']);
  }, emulatorUrl);

  await waitFor(() => {
    expect(stdout[0]).toMatch(/^default: \dms$/);
    expect(stdout[1]).toMatch(/^aaa: \d+ms$/);
    expect(stdout[2]).toMatch(/^bbb: \d+ms$/);
    expect(stdout[3]).toMatch(/^bbb: 1\.\d{3}s$/);

    expect(stderr[0]).toEqual(`Timer 'aaa' does not exist`);
  });
});

test('console#dir', async ({ runTestServer, emulatorUrl, page }) => {
  await runTestServer();

  const stdout: Array<string> = [];
  const stderr: Array<string> = [];
  page.on('console', (msg) => {
    if (msg.type() === 'log') {
      stdout.push(msg.text());
    } else if (msg.type() === 'error') {
      stderr.push(msg.text());
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
      'main.js': `console.dir({ hello: "world", a: { bbb: "bbb" } });console.dir("test");`,
    });

    const shell = emulator.shell.create();
    shell.stderr.on('data', (data) => {
      console.error(data.trim());
    });
    shell.stdout.on('data', (data) => {
      // eslint-disable-next-line no-console
      console.log(data.trim());
    });
    await shell.runCommand('node', ['main.js']);
  }, emulatorUrl);

  await waitFor(() => {
    expect(stdout[0]).toEqual("{ hello: 'world', a: { bbb: 'bbb' } }");
    expect(stdout[1]).toEqual("'test'");
  });
});

test('console#group', async ({ runTestServer, emulatorUrl, page }) => {
  await runTestServer();

  const stdout: Array<string> = [];
  const stderr: Array<string> = [];
  page.on('console', (msg) => {
    if (msg.type() === 'log') {
      stdout.push(msg.text());
    } else if (msg.type() === 'error') {
      stderr.push(msg.text());
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
      'main.js': `
      console.group("a", "b");
      console.log("test");
      console.group("bla");
      console.warn("tada");
      console.groupEnd();
      console.error("woops");
      console.groupEnd();`,
    });

    const shell = emulator.shell.create();
    shell.stderr.on('data', (data) => {
      console.error(data);
    });
    shell.stdout.on('data', (data) => {
      // eslint-disable-next-line no-console
      console.log(data);
    });
    await shell.runCommand('node', ['main.js']);
  }, emulatorUrl);

  await waitFor(() => {
    expect(stdout[0]).toEqual('a b\n');
    expect(stdout[1]).toEqual('  test\n');
    expect(stdout[2]).toEqual('  bla\n');
    expect(stderr[0]).toEqual('    tada\n');
    expect(stderr[1]).toEqual('  woops\n');
  });
});

test('console#table', async ({ runTestServer, emulatorUrl, page }) => {
  await runTestServer();

  const stdout: Array<string> = [];
  const stderr: Array<string> = [];
  page.on('console', (msg) => {
    if (msg.type() === 'log') {
      stdout.push(msg.text());
    } else if (msg.type() === 'error') {
      stderr.push(msg.text());
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
      'main.js': `
      console.table(["a", "b", "c"]);
      console.table({ a: 1, b: 2, c: 3 });
      console.table([{ a: 1, b: 2 }, {c: 3}], ["a", "c"]);`,
    });

    const shell = emulator.shell.create();
    shell.stderr.on('data', (data) => {
      console.error(data);
    });
    shell.stdout.on('data', (data) => {
      // eslint-disable-next-line no-console
      console.log(data);
    });
    await shell.runCommand('node', ['main.js']);
  }, emulatorUrl);

  await waitFor(() => {
    expect(stdout[0]).toEqual(`────────────────────
│ (index) │ Values │
────────────────────
│ 0       │ a      │
│ 1       │ b      │
│ 2       │ c      │
────────────────────
`);
    expect(stdout[1]).toEqual(`────────────────────
│ (index) │ Values │
────────────────────
│ a       │ 1      │
│ b       │ 2      │
│ c       │ 3      │
────────────────────
`);
    expect(stdout[2]).toEqual(`───────────────────
│ (index) │ a │ c │
───────────────────
│ 0       │ 1 │   │
│ 1       │   │ 3 │
───────────────────
`);
  });
});
