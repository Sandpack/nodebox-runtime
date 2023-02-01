import { test, expect } from 'tests';

test('should install and run `apollo-server` dependency', async ({ runTestServer, runExample, getPreviewFrame }) => {
  await runTestServer();

  await runExample(require.resolve('../examples/apollo-server.example.js'));

  // Must render the Vite app in the preview iframe.
  const previewFrame = await getPreviewFrame();
  const headingLocator = previewFrame.locator("h1");

  await expect(headingLocator).toBeVisible({ timeout: 800000 });
});
