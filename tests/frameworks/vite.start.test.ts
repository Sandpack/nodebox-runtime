import { test, expect } from 'tests';

test('starts a Vite project', async ({ runTestServer, getPreviewFrame, runExample }) => {
  await runTestServer();

  await runExample(require.resolve('../examples/vite.example.js'));

  // Must render the Vite app in the preview iframe.
  const previewFrame = await getPreviewFrame();
  const headingLocator = previewFrame.locator('text=Hello world');

  await expect(headingLocator).toBeVisible({ timeout: 800_000 });
});

test('starts a Vite React project', async ({ runTestServer, runExample, getPreviewFrame }) => {
  await runTestServer();

  await runExample(require.resolve('../examples/vite-react.example.js'));

  // Must render the Vite app in the preview iframe.
  const previewFrame = await getPreviewFrame();
  const headingLocator = previewFrame.locator('text="Hello world"');

  await expect(headingLocator).toBeVisible({ timeout: 800000 });
});

test('starts a Vite Vue project', async ({ runTestServer, runExample, getPreviewFrame }) => {
  await runTestServer();

  await runExample(require.resolve('../examples/vite-vue.example.js'));

  // Must render the Vite app in the preview iframe.
  const previewFrame = await getPreviewFrame();
  const headingLocator = previewFrame.locator('text="Hello world"');

  await expect(headingLocator).toBeVisible({ timeout: 800000 });
});

test('starts a Vite Svelte project', async ({ runTestServer, runExample, getPreviewFrame }) => {
  await runTestServer();

  await runExample(require.resolve('../examples/vite-svelte.example.js'));

  // Must render the Vite app in the preview iframe.
  const previewFrame = await getPreviewFrame();
  const headingLocator = previewFrame.locator('text="Hello world"');

  await expect(headingLocator).toBeVisible({ timeout: 800000 });
});
