import { test, expect } from 'tests';

test.skip('starts a `nodemon` project', async ({ runTestServer, runExample, getPreviewFrame }) => {
  await runTestServer();

  await runExample(require.resolve('../examples/nodemon.example.js'));

  // Must render the Vite app in the preview iframe.
  const previewFrame = await getPreviewFrame();
  const headingLocator = previewFrame.locator('text="Hello world"');

  await expect(headingLocator).toBeVisible({ timeout: 800000 });
});
