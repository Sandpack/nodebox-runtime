/**
 * @typedef { typeof import("../../packages/nodebox").Nodebox } Nodebox
 * @type {Nodebox} */
const Nodebox = window.Nodebox;

/**
 * @param {string} emulatorUrl
 */
window.runExample = async function (emulatorUrl) {
  const emulator = new Nodebox({
    runtimeUrl: emulatorUrl,
    iframe: document.getElementById('frame'),
  });

  await emulator.connect();

  await emulator.fs.init({
    '/README.md': `# Hello world`,
    '/package.json': JSON.stringify({
      dependencies: {
        vuepress: '2.0.0-beta.53',
        'esbuild-wasm': '0.15.12',
      },
      main: '/README.md',
    }),
  });

  const shellProcess = emulator.shell.create();
  const shellInfo = await shellProcess.runCommand('vuepress', ['dev']);
  shellProcess.on('exit', (exitCode, error) => console.error('Process exited:', exitCode, error));
  return shellInfo;
};
