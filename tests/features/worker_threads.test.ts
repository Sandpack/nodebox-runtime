import { test, expect } from 'tests';
import waitForExpect from 'wait-for-expect';

test('increments "threadId" of each spawned child worker', async ({ runTestServer, page, emulatorUrl }) => {
  await runTestServer();

  const logs: Array<string> = [];
  page.on('console', (msg) => logs.push(msg.text()));

  await page.evaluate(async (emulatorUrl) => {
    const { Nodebox } = window;

    const emulator = new Nodebox({
      runtimeUrl: emulatorUrl,
      iframe: document.getElementById('frame') as HTMLIFrameElement,
    });

    await emulator.connect();

    await emulator.fs.init({
      'parent.js': `
import { Worker, threadId } from 'worker_threads'
console.log('[parent]:', threadId)

// Standalone child.
const standaloneChild = new Worker('./child-standalone.js')
console.log('[parent] standalone child:', standaloneChild.threadId)

// Child that spawns another child.
const childWithChildren = new Worker('./child-with-children.js')
console.log('[parent] child with children:', childWithChildren.threadId)
        `,
      'child-standalone.js': `
console.log('[child-standalone]:', require('worker_threads').threadId)
      `,
      'child-with-children.js': `
import { Worker, threadId } from 'worker_threads'
console.log('[child-with-children]:', threadId)

const child = new Worker('./nested-child.js')
console.log('[child-with-children] nested child:', child.threadId)
        `,
      'nested-child.js': `
console.log('[nested-child]:', require('worker_threads').threadId)
        `,
    });

    const shell = emulator.shell.create();
    shell.stderr.on('data', (data) => {
      console.error(data.trim());
    });
    shell.stdout.on('data', (data) => {
      // eslint-disable-next-line no-console
      console.log(data.trim());
    });
    await shell.runCommand('node', ['parent.js']);
  }, emulatorUrl);

  await page.pause();

  await waitForExpect(() => {
    expect(logs).toContain('[parent]: 0');

    // Parent must increment the worker threadId
    // with each spawned child worker.
    expect(logs).toContain('[parent] standalone child: 1');
    expect(logs).toContain('[child-standalone]: 1');

    expect(logs).toContain('[child-with-children]: 2');
    expect(logs).toContain('[child-with-children] nested child: 21');
    /**
     * @todo Uncomment this once we support nested workers.
     * @see https://linear.app/codesandbox/issue/ECO-302/3rd-level-workers-cannot-be-spawned
     */
    // expect(logs).toContain('[nested-child]: 21');
  });
});

test('forwards "workerData" from parent to child', async ({ runTestServer, page, emulatorUrl }) => {
  await runTestServer();

  const logs: Array<string> = [];
  page.on('console', (msg) => logs.push(msg.text()));

  await page.evaluate(async (emulatorUrl) => {
    const { Nodebox } = window;

    const emulator = new Nodebox({
      runtimeUrl: emulatorUrl,
      iframe: document.getElementById('frame') as HTMLIFrameElement,
    });

    await emulator.connect();

    await emulator.fs.init({
      'parent.js': `
import { Worker } from 'worker_threads'

const worker = new Worker('./child.js', { workerData: 'Hello World' })
        `,
      'child.js': `
import { isMainThread, workerData, parentPort } from 'worker_threads'

console.log('child.workerData:', workerData)
        `,
    });

    const shell = emulator.shell.create();
    shell.stderr.on('data', (data) => {
      console.error(data.trim());
    });
    shell.stdout.on('data', (data) => {
      // eslint-disable-next-line no-console
      console.log(data.trim());
    });
    await shell.runCommand('node', ['parent.js']);
  }, emulatorUrl);

  await waitForExpect(() => {
    // The child worker must have access to the "workerData"
    // provided by the parent from the "worker_threads" module.
    expect(logs).toContain('child.workerData: Hello World');
  });
});

test('exposes "isMainThread: false" for child workers', async ({ runTestServer, page, emulatorUrl }) => {
  await runTestServer();

  const logs: Array<string> = [];
  page.on('console', (msg) => logs.push(msg.text()));

  await page.evaluate(async (emulatorUrl) => {
    const { Nodebox } = window;

    const emulator = new Nodebox({
      runtimeUrl: emulatorUrl,
      iframe: document.getElementById('frame') as HTMLIFrameElement,
    });

    await emulator.connect();

    await emulator.fs.init({
      'parent.js': `
import { Worker, isMainThread } from 'worker_threads'

const worker = new Worker('./child.js')
console.log('parent.isMainThread:', isMainThread)
        `,
      'child.js': `
import { isMainThread } from 'worker_threads'

console.log('child.isMainThread:', isMainThread)
      `,
    });

    const shell = emulator.shell.create();
    shell.stderr.on('data', (data) => {
      console.error(data.trim());
    });
    shell.stdout.on('data', (data) => {
      // eslint-disable-next-line no-console
      console.log(data.trim());
    });
    await shell.runCommand('node', ['parent.js']);
  }, emulatorUrl);

  await waitForExpect(() => {
    // The parent worker must be the main thread.
    expect(logs).toContain('parent.isMainThread: true');

    // The child worker must have access to the "isMainThread"
    // property from the "worker_threads" module.
    expect(logs).toContain('child.isMainThread: false');
  });
});

test('exposes a custom "resourceLimits" to the child workd', async ({ runTestServer, page, emulatorUrl }) => {
  await runTestServer();

  const logs: Array<string> = [];
  page.on('console', (msg) => logs.push(msg.text()));

  await page.evaluate(async (emulatorUrl) => {
    const { Nodebox } = window;

    const emulator = new Nodebox({
      runtimeUrl: emulatorUrl,
      iframe: document.getElementById('frame') as HTMLIFrameElement,
    });

    await emulator.connect();

    await emulator.fs.init({
      'parent.js': `
import { Worker, resourceLimits } from 'worker_threads'

const worker = new Worker('./child.js', {
  resourceLimits: {
    stackSizeMb: 2
  }
})

console.log("parent.resourceLimits:", resourceLimits)
        `,
      'child.js': `
import { resourceLimits } from 'worker_threads'

console.log('child.stackSizeMb:', resourceLimits.stackSizeMb)
      `,
    });

    const shell = emulator.shell.create();
    shell.stderr.on('data', (data) => {
      console.error(data.trim());
    });
    shell.stdout.on('data', (data) => {
      // eslint-disable-next-line no-console
      console.log(data.trim());
    });
    await shell.runCommand('node', ['parent.js']);
  }, emulatorUrl);

  await waitForExpect(() => {
    expect(logs).toContain('parent.resourceLimits: {}');
    expect(logs).toContain('child.stackSizeMb: 2');
  });
});

/**
 * Must expose the "parentPort" reference to the child worker
 * to communicate with the parent worker.
 * @see https://nodejs.org/api/worker_threads.html#workerparentport
 */
test('exposes a "parentPort" to communicate with the parent worker', async ({ runTestServer, page, emulatorUrl }) => {
  await runTestServer();

  const logs: Array<string> = [];
  page.on('console', (msg) => logs.push(msg.text()));

  await page.evaluate(async (emulatorUrl) => {
    const { Nodebox } = window;

    const emulator = new Nodebox({
      runtimeUrl: emulatorUrl,
      iframe: document.getElementById('frame') as HTMLIFrameElement,
    });

    await emulator.connect();

    await emulator.fs.init({
      'parent.js': `
import { Worker } from 'worker_threads'

const worker = new Worker('./child.js')

worker.once('message', (data) => {
  console.log('parent (from child):', data)
})

worker.postMessage('hello from parent')
        `,
      'child.js': `
import { parentPort } from 'worker_threads'

parentPort.once('message', (data) => {
  console.log('child (from parent):', data)
  parentPort.postMessage('hello from child')
})
      `,
    });

    const shell = emulator.shell.create();
    shell.stderr.on('data', (data) => {
      console.error(data.trim());
    });
    shell.stdout.on('data', (data) => {
      // eslint-disable-next-line no-console
      console.log(data.trim());
    });
    await shell.runCommand('node', ['parent.js']);
  }, emulatorUrl);

  await waitForExpect(() => {
    expect(logs).toContain('child (from parent): hello from parent');
    expect(logs).toContain('parent (from child): hello from child');
  });
});

test('allows modifying parent env using the "SHARE_ENV" flag', async ({ runTestServer, page, emulatorUrl }) => {
  await runTestServer();

  const logs: Array<string> = [];
  page.on('console', (msg) => logs.push(msg.text()));

  await page.evaluate(async (emulatorUrl) => {
    const { Nodebox } = window;

    const emulator = new Nodebox({
      runtimeUrl: emulatorUrl,
      iframe: document.getElementById('frame') as HTMLIFrameElement,
    });

    await emulator.connect();

    await emulator.fs.init({
      'parent.js': `
import { Worker, SHARE_ENV } from 'worker_threads'

process.env.PARENT_A = 'parent-a'
process.env.PARENT_B = 'parent-b'

console.log('parent (initial):', process.env.PARENT_A, process.env.PARENT_B)

const worker = new Worker('./child.js', { env: SHARE_ENV })

worker.on('exit', () => {
  console.log('child (modified):', process.env.PARENT_A)
  console.log('child (deleted):', process.env.PARENT_B)
  console.log('child (added):', process.env.CHILD_VALUE)
})
        `,
      'child.js': `
import { parentPort } from 'worker_threads'

// Child should be able to read parent env.
console.log('child (read):', process.env.PARENT_A)

// Child should be able to modify parent env.
process.env.PARENT_A = 'parent-a-modified'
delete process.env.PARENT_B

// Child should propagate env changes to the parent.
process.env.CHILD_VALUE = 'child'

process.exit(0)
      `,
    });

    const shell = emulator.shell.create();
    shell.stderr.on('data', (data) => {
      console.error(data.trim());
    });
    shell.stdout.on('data', (data) => {
      // eslint-disable-next-line no-console
      console.log(data.trim());
    });
    await shell.runCommand('node', ['parent.js']);
  }, emulatorUrl);

  await waitForExpect(() => {
    expect(logs).toContain('parent (initial): parent-a parent-b');
    expect(logs).toContain('child (read): parent-a');

    expect(logs).toContain('child (modified): parent-a-modified');
    expect(logs).toContain('child (deleted): undefined');
    expect(logs).toContain('child (added): child');
  });
});

test('forwards data via "setEnvironmentData" and "getEnvironmentData"', async ({
  runTestServer,
  page,
  emulatorUrl,
}) => {
  await runTestServer();

  const logs: Array<string> = [];
  page.on('console', (msg) => logs.push(msg.text()));

  await page.evaluate(async (emulatorUrl) => {
    const { Nodebox } = window;

    const emulator = new Nodebox({
      runtimeUrl: emulatorUrl,
      iframe: document.getElementById('frame') as HTMLIFrameElement,
    });

    await emulator.connect();

    await emulator.fs.init({
      'parent.js': `
import { Worker, getEnvironmentData, setEnvironmentData } from 'worker_threads'

setEnvironmentData('hello', 'world')
const worker = new Worker('./child.js')

// Parent is the main thread, which also receives the env data in Node.js
console.log('parent (get):', getEnvironmentData('hello'))
        `,
      'child.js': `
import { getEnvironmentData } from 'worker_threads'

// Child must be able to get env data set by the parent worker.
console.log('child (get):', getEnvironmentData('hello'))
      `,
    });

    const shell = emulator.shell.create();
    shell.stderr.on('data', (data) => {
      console.error(data.trim());
    });
    shell.stdout.on('data', (data) => {
      // eslint-disable-next-line no-console
      console.log(data.trim());
    });
    await shell.runCommand('node', ['parent.js']);
  }, emulatorUrl);

  await waitForExpect(() => {
    expect(logs).toContain('parent (get): world');
    expect(logs).toContain('child (get): world');
  });
});

test('spawn worker_thread from inside a worker_thread', async ({ runTestServer, page, emulatorUrl }) => {
  await runTestServer();

  const logs: Array<string> = [];
  page.on('console', (msg) => logs.push(msg.text()));

  await page.evaluate(async (emulatorUrl) => {
    const { Nodebox } = window;

    const emulator = new Nodebox({
      runtimeUrl: emulatorUrl,
      iframe: document.getElementById('frame') as HTMLIFrameElement,
    });

    await emulator.connect();

    await emulator.fs.init({
      'parent.js': `
import { Worker, getEnvironmentData, setEnvironmentData } from 'worker_threads'
setEnvironmentData('hello', 'world')
const worker = new Worker('./child.js')
// Parent is the main thread, should have the same env data as the child.
console.log('parent (get):', getEnvironmentData('hello'))
        `,
      'child.js': `
  import { Worker, getEnvironmentData } from 'worker_threads'
  const worker = new Worker('./child-two.js')
  
  // Child must be able to get env data set by the parent worker.
  console.log('child (get):', getEnvironmentData('hello'))
        `,
      'child-two.js': `
  import { getEnvironmentData } from 'worker_threads'
  
  // Child must be able to get env data set by the parent worker.
  console.log('child-two (get):', getEnvironmentData('hello'))
        `,
    });

    const shell = emulator.shell.create();
    shell.stderr.on('data', (data) => {
      console.error(data.trim());
    });
    shell.stdout.on('data', (data) => {
      // eslint-disable-next-line no-console
      console.log(data.trim());
    });
    await shell.runCommand('node', ['parent.js']);
  }, emulatorUrl);

  await waitForExpect(() => {
    expect(logs).toContain('parent (get): world');
    expect(logs).toContain('child (get): world');
    expect(logs).toContain('child-two (get): world');
  });
});

test('evaluates given code when "eval" is set to true', async ({ runTestServer, page, emulatorUrl }) => {
  await runTestServer();

  const logs: Array<string> = [];
  page.on('console', (msg) => logs.push(msg.text()));

  await page.evaluate(async (emulatorUrl) => {
    const { Nodebox } = window;

    const emulator = new Nodebox({
      runtimeUrl: emulatorUrl,
      iframe: document.getElementById('frame') as HTMLIFrameElement,
    });

    await emulator.connect();

    await emulator.fs.init({
      'worker.js': `
import { Worker } from 'worker_threads'

const worker = new Worker(\`
console.log('eval: hello')
console.log('__dirname', __dirname)
console.log('__filename', __filename)
\`, { eval: true })
        `,
    });

    const shell = emulator.shell.create();
    shell.stderr.on('data', (data) => {
      console.error(data.trim());
    });
    shell.stdout.on('data', (data) => {
      // eslint-disable-next-line no-console
      console.log(data.trim());
    });

    await shell.runCommand('node', ['worker.js']);
  }, emulatorUrl);

  await waitForExpect(() => {
    expect(logs).toContain('eval: hello');
    // These globals are set to specific values in eval worker mode.
    expect(logs).toContain('__dirname .');
    expect(logs).toContain('__filename [eval]');
  });
});
