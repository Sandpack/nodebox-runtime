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
    'index.html': `<html>
<head>
  <title>Vite Sandbox</title>
  <meta charset="UTF-8" />
</head>

<body>
  <div id="app"></div>

  <script type="module" src="./src/main.tsx"></script>
</body>
</html>`,
    'package.json': JSON.stringify({
      scripts: {
        start: 'vite',
        build: 'vite build',
      },
      dependencies: {
        'solid-js': '1.6.11',
      },
      devDependencies: {
        vite: '^4.0.4',
        'esbuild-wasm': '0.15.12',
        'vite-plugin-solid': '^2.5.0',
      },
    }),
    'src/main.tsx': `import { render } from "solid-js/web";
import { createSignal } from "solid-js";

function Counter() {
  const [count, setCount] = createSignal(1);
  const increment = () => setCount(count() + 1);

  return (
    <button type="button" onClick={increment}>
      {count()}
    </button>
  );
}

render(() => <Counter />, document.getElementById("app")!);
`,
    'vite.config.ts': `import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
plugins: [solidPlugin()],
build: {
  target: "esnext",
  polyfillDynamicImport: false,
},
});`,
  });

  const shellProcess = emulator.shell.create();
  const shellInfo = await shellProcess.runCommand('vite', ['dev', '--port', '3000']);
  shellProcess.on('exit', (...data) => console.error('Process exited:', ...data));
  return shellInfo;
};
