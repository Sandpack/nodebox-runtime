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
      'foo.js': `process.stdout.write('Hello world');
process.exit();`,

      'index.js': `const { exec } = require('node:child_process');
    
exec("./foo", { encoding: "utf8", timeout: 5_000 }, (err, stdout, stderr) => {
  console.log("Exec output: " + stdout)
});`,
    });

    const shellProcess = emulator.shell.create();

    return new Promise(async (resolve) => {
      shellProcess.stdout.on('data', (data) => {
        return resolve(data);
      });

      await shellProcess.runCommand('node', ['index.js']);
    });
  };

  console.log(await foo());
};
