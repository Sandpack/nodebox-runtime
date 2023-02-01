import { test, expect } from 'tests';

test('starts a project successfully', async ({ runTestServer, page, emulatorUrl, getPreviewFrame }) => {
  await runTestServer();

  await page.evaluate(async (emulatorUrl) => {
    const { Nodebox } = window;
    const emulator = new Nodebox({
      runtimeUrl: emulatorUrl,
      iframe: document.getElementById('frame') as HTMLIFrameElement,
    });

    await emulator.connect();
    await emulator.fs.init({
      'index.js': `const http = require("node:http");
const url = require("url");

// Create an HTTP server
const server = http.createServer((req, res) => {
  // Parse the request url
  const reqUrl = url.parse(req.url).pathname
  
  res.write("Hello world")  
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end()
});

// Now that server is running
server.listen(3000, "127.0.0.1", () => {
  console.log('Server is running');
});`,
    });

    const shellProcess = emulator.shell.create();

    await shellProcess.runCommand('node', ['index.js']);
  }, emulatorUrl);

  // Must setup the HTTP server in the preview iframe.
  const previewFrame = await getPreviewFrame();
  const headingLocator = previewFrame.locator('text="Hello world"');

  await expect(headingLocator).toBeVisible({ timeout: 800000 });
});

test('starts a project and exit it', async ({ runTestServer, page, emulatorUrl }) => {
  await runTestServer();

  await page.evaluate(async (emulatorUrl) => {
    const { Nodebox } = window;
    const emulator = new Nodebox({
      runtimeUrl: emulatorUrl,
      iframe: document.getElementById('frame') as HTMLIFrameElement,
    });

    await emulator.connect();
    await emulator.fs.init({
      'index.js': `const http = require("node:http");
const url = require("url");

// Create an HTTP server
const server = http.createServer((req, res) => {
  // Parse the request url
  const reqUrl = url.parse(req.url).pathname
  
  res.write("Hello world")  
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end()
});

// Now that server is running
server.listen(3000, "127.0.0.1", () => {
  console.log('Server is running');
});`,
    });

    const shellProcess = emulator.shell.create();

    await shellProcess.runCommand('node', ['index.js']);

    await shellProcess.kill();
  }, emulatorUrl);

  // Must not setup the HTTP server in the preview iframe.
  const emulatorFrame = page.frameLocator('#frame');
  const headingLocator = emulatorFrame.locator('iframe[name="preview"]');

  expect(await headingLocator.count()).toEqual(0);
});

test('supports restarting the preview from the consumer', async ({
  runTestServer,
  emulatorUrl,
  page,
  getPreviewFrame,
  getBridgeFrameLocator,
  getPreviewFrameLocator,
}) => {
  await runTestServer();

  await page.evaluate(async (emulatorUrl) => {
    const { Nodebox } = window;

    const emulator = new Nodebox({
      runtimeUrl: emulatorUrl,
      iframe: document.getElementById('frame') as HTMLIFrameElement,
    });

    await emulator.connect();

    await emulator.fs.init({
      'index.js': `
const http = require('http')

const server = http.createServer((req, res) => {
  res.write("App Preview")
  res.writeHead(200, { "Content-Type": "text/html" })
  res.end()
})

server.listen(3000, "127.0.0.1", () => {
  console.log("Server is running")
})
      `,
    });

    const shell = emulator.shell.create();

    const startPreview = async () => {
      await shell.runCommand('node', ['index.js']);
    };
    const stopPreview = async () => {
      await shell.kill();
    };

    // @ts-ignore
    window.startPreview = startPreview;

    // @ts-ignore
    window.stopPreview = stopPreview;
  }, emulatorUrl);

  // Must render the initial preview.
  await page.evaluate(() => window.startPreview());
  const initialPreviewFrame = await getPreviewFrame();
  await expect(initialPreviewFrame.locator('text=App Preview')).toBeVisible({ timeout: 800000 });

  // Stop the preview.
  await page.evaluate(() => window.stopPreview());
  const bridgeFrame = await getBridgeFrameLocator();
  expect(bridgeFrame).not.toBeVisible();

  const previewFrame = await getPreviewFrameLocator();
  expect(previewFrame).not.toBeVisible();

  // Restart the bridge/preview.
  await page.evaluate(() => window.startPreview());
  const incrementalPreviewFrame = await getPreviewFrame();
  await expect(incrementalPreviewFrame.locator('text=App Preview')).toBeVisible({ timeout: 800000 });
});
