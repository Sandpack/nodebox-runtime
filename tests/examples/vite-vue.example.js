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
    '/src/App.vue': `<script setup>
import { ref } from "vue";
const msg = ref("world");
</script>

<template>
  <h1>Hello {{ msg }}</h1>
</template>

<style>
h1 {
  font-size: 1.5rem;
}
</style>`,
    '/src/main.js': `import { createApp } from 'vue'
import App from './App.vue'
import "./styles.css"
            
createApp(App).mount('#app')            
`,

    '/index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`,

    '/vite.config.js': `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()]
})
`,

    '/package.json': JSON.stringify({
      scripts: {
        dev: 'vite',
      },
      dependencies: {
        vue: 'latest',
      },
      devDependencies: {
        vite: '4.2.0',
        'esbuild-wasm': '0.17.12',
        '@vitejs/plugin-vue': '4.1.0',
      },
    }),
  });

  const shellProcess = emulator.shell.create();
  const shellInfo = await shellProcess.runCommand('vite', ['--port', '3000']);
  shellProcess.on('exit', (...data) => console.error('Process exited:', ...data));
  return shellInfo;
};
