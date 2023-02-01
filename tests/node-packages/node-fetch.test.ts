import { test, expect } from 'tests';

test('starts a `node-fetch` project', async ({ runTestServer, page, emulatorUrl, getPreviewFrame }) => {
  await runTestServer();

  await page.evaluate(async (emulatorUrl) => {
    const { Nodebox } = window;

    const emulator = new Nodebox({
      runtimeUrl: emulatorUrl,
      iframe: document.getElementById('frame') as HTMLIFrameElement,
    });

    await emulator.connect();

    // Initialize the file system with a Vite project.
    await emulator.fs.init({
      '/index.js': `const http = require('http');
import fetch from 'node-fetch';

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer(async(req, res) => {
  const response = await fetch('https://sandpack-cdn-v2.codesandbox.io/v2/json/deps/bG9hZGFzaEAxLjAuMA==');

  if (!response.ok) {
    res.statusCode = response.status;
    res.end(await response.text());
    return
  }

  const data = await response.json();
  
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/json');
  res.end(JSON.stringify(data));
});

server.listen(port, hostname, () => {
  console.log(\`Server running at http://\${hostname}:\${port}/\`);
});`,

      '/package.json': JSON.stringify({
        dependencies: { 'node-fetch': '3.3.0' },
        scripts: { start: 'node index.js' },
        main: 'index.js',
      }),
    });

    // Run the Vite app.
    const shellProcess = emulator.shell.create();
    await shellProcess.runCommand('node', ['index.js']);
  }, emulatorUrl);

  // Must render the Vite app in the preview iframe.
  const previewFrame = await getPreviewFrame();
  const headingLocator = previewFrame.locator('text="{"loadash@1":"1.0.0"}"');

  await expect(headingLocator).toBeVisible({ timeout: 800000 });
});
