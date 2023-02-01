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
    '/src/styles.css': `body {
  font-family: sans-serif;
  -webkit-font-smoothing: auto;
  -moz-font-smoothing: auto;
  -moz-osx-font-smoothing: grayscale;
  font-smoothing: auto;
  text-rendering: optimizeLegibility;
  font-smooth: always;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}
h1 {
  font-size: 1.5rem;
}`,
    '/src/pages/index.astro': `---
import "../styles.css";
const data = "world";
---

<h1>Hello {data}</h1>

<style>
  h1 {
    font-size: 1.5rem;
  }
</style>`,

    '/package.json': JSON.stringify({
      dependencies: {
        astro: '^1.6.12',
        'esbuild-wasm': '^0.15.16',
      },
      scripts: {
        dev: 'astro dev',
      },
    }),
  });

  const shellProcess = emulator.shell.create();
  const shellInfo = await shellProcess.runCommand('astro', ['dev'], {
    env: { ASTRO_TELEMETRY_DISABLED: '1' },
  });
  shellProcess.on('exit', (...data) => console.error('Process exited:', ...data));
  return shellInfo;
};
