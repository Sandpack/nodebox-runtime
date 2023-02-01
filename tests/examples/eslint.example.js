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
    '/index.js': `const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('Hello world');
});

console.log("foo");

server.listen(port, hostname, () => {
  console.log(\`Server running at http://\${hostname}:\${port}/\`);
});`,

    '/.eslintrc.js': `module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: { 
    "semi": ["error", "always"],
    "no-console": ["error", { allow: ["warn", "error"] }]
  }
}
`,

    '/package.json': JSON.stringify({
      devDependencies: {
        eslint: '^8.0.1',
      },
      scripts: { start: 'eslint index.js' },
      main: 'index.js',
    }),
  });

  const shellProcess = emulator.shell.create();

  return new Promise(async (resolve) => {
    shellProcess.stdout.on('data', (data) => {
      return resolve(data);
    });

    return await shellProcess.runCommand('eslint', ['index.js']);
  });
};
