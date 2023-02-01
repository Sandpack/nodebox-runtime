import { test, expect } from 'tests';

test('runs an Express application', async ({ runTestServer, getPreviewFrame, runExample }) => {
  await runTestServer();

  await runExample(require.resolve('../examples/express.example.js'));

  // Must render the Vite app in the preview iframe.
  const previewFrame = await getPreviewFrame();
  const headingLocator = previewFrame.locator('text=Hello world');

  await expect(headingLocator).toBeVisible({ timeout: 800_000 });
});
