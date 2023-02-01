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
    '/app.vue': `<template>
  <div>
    <h1>Hello world</h1>
  </div>
</template>`,
    '/package.json': JSON.stringify({
      scripts: { dev: 'nuxt dev' },
      dependencies: { nuxt: '3.0.0', 'esbuild-wasm': '^0.15.16', 'enhanced-resolve': '4.1.1' },
    }),
  });

  const shellProcess = emulator.shell.create();
  const shellInfo = await shellProcess.runCommand('nuxt', ['dev'], { env: { NUXT_TELEMETRY_DISABLED: 1 } });
  shellProcess.on('exit', (...data) => console.error('Process exited:', ...data));
  return shellInfo;
};
