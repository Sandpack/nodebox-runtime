/**
 * @typedef { typeof import("../../packages/node-emulator").Nodebox } Nodebox
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
    '/src/main.js': `import "./styles.css";
import App from "./App.svelte";

const app = new App({
  target: document.getElementById("app"),
});

export default app;`,
    'src/App.svelte': `<script>
const data = "world";
</script>

<main>
  <h1>Hello {data}</h1>
</main>

<style>
h1 {
  font-size: 1.5rem;
}
</style>`,
    'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + Svelte</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`,
    'vite.config.js': `import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
})`,
    'svelte.config.js': `import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

export default {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: vitePreprocess(),
}
`,
    'package.json': JSON.stringify({
      name: 'vite-svelte-example',
      type: 'module',
      scripts: { dev: 'vite' },
      devDependencies: {
        '@sveltejs/vite-plugin-svelte': '2.0.3',
        svelte: '3.57.0',
        vite: '4.2.0',
        'esbuild-wasm': '0.17.12',
      },
    }),
  });

  const shellProcess = emulator.shell.create();
  const shellInfo = await shellProcess.runCommand('vite', ['dev', '--port', '3000']);
  shellProcess.on('exit', (...data) => console.error('Process exited:', ...data));
  return shellInfo;
};
