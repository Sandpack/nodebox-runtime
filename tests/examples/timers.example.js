/**
 * @typedef { typeof import("../../packages/nodebox").Nodebox } Nodebox
 * @type {Nodebox} */
const Nodebox = window.Nodebox;

/**
 * @param {string} emulatorUrl
 */
window.runExample = async function (emulatorUrl) {
  const foo = async () => {
    const { Nodebox } = window;

    const emulator = new Nodebox({
      runtimeUrl: emulatorUrl,
      iframe: document.getElementById('frame'),
    });

    await emulator.connect();
    await emulator.fs.init({
      'index.mjs': `import timers from "timers/promises";

async function run() {
  console.log("Start timers");
  console.log(await timers.setTimeout(1500, "test timeout"));
  console.log(await timers.setImmediate("immediate"));

  const interval = 100;
  for await (const startTime of timers.setInterval(interval, Date.now())) {
    const now = Date.now();
    console.log(now);
    if (now - startTime > 1000) {
      break;
    }
  }
}

run().catch(console.error);
`,
    });

    const shellProcess = emulator.shell.create();

    return new Promise(async (resolve) => {
      shellProcess.stdout.on('data', (data) => {
        return resolve(data);
      });

      await shellProcess.runCommand('node', ['index.mjs']);
    });
  };

  console.log(await foo());
};
