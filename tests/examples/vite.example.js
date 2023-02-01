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
    '/styles.css': `body {
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
    '/index.js': `import "./styles.css";
document.getElementById("app").innerHTML = \`
<h1>Hello world</h1>
\`;
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
    <script type="module" src="/index.js"></script>
  </body>
</html>
`,

    '/package.json': JSON.stringify({
      scripts: { dev: 'vite' },
      devDependencies: { vite: '^4.0.0', 'esbuild-wasm': '0.15.12' },
    }),
  });

  const shellProcess = emulator.shell.create();
  const shellInfo = await shellProcess.runCommand('vite', ['--port', '3000']);
  shellProcess.on('exit', (...data) => console.error('Process exited:', ...data));
  return shellInfo;
};
