/**
 * @typedef {typeof import("../../packages/nodebox").Nodebox} Nodebox
 * @type {Nodebox} */
const Nodebox = window.Nodebox;

/**
 * @param {string} emulatorUrl
 */
window.runExample = async function (emulatorUrl) {
  const emulator = new Nodebox({
    runtimeUrl: emulatorUrl,
    iframe: document.getElementById('frame'),
    /**
     * @note Use a mock CDN to return non-existing dependencies.
     */
    cdnUrl: 'https://localhost:3080',
  });

  await emulator.connect();

  // Initialize a project that uses multiple major versions
  // of the same dependency at the same time.
  await emulator.fs.init({
    'package.json': JSON.stringify({
      dependencies: {
        'parent-a': '^1.0.0',
        'parent-b': '^1.0.0',
      },
    }),
    'index.js': `
const http = require('http');
const parentA = require('parent-a');
const parentB = require('parent-b');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(\`
<p id="parent-a">\${parentA.childVersion}</p>
<p id="parent-b">\${parentB.childVersion}</p>
  \`)
});

server.listen(3000, '127.0.0.1', () => {
  console.log(\`Server running at http://127.0.0.1:3000\`);
});`,
  });

  const shellProcess = emulator.shell.create();
  const shellInfo = await shellProcess.runCommand('node', ['index.js']);
  shellProcess.on('exit', (...data) => console.error('Process exited:', ...data));
  return shellInfo;
};
