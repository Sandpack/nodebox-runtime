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
    'package.json': JSON.stringify({
      dependencies: {
        express: '4.18.2',
      },
    }),
    'index.js': `const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello world')
})

app.listen(port, () => {
  console.log(\`Example app listening on port \${port}\`)
})`,
  });

  const shellProcess = emulator.shell.create();
  const shellInfo = await shellProcess.runCommand('node', ['index.js']);
  shellProcess.on('exit', (...data) => console.error('Process exited:', ...data));
  return shellInfo;
};
