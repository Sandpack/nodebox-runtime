import { test, expect } from 'tests';

test('runs a Fastify.js application', async ({ runTestServer, getPreviewFrame, runExample }) => {
  await runTestServer();

  await runExample(require.resolve('../examples/fastify.example.js'));

  // Must render the Vite app in the preview iframe.
  const previewFrame = await getPreviewFrame();
  const headingLocator = previewFrame.locator('text={"hello":"world"}');

  await expect(headingLocator).toBeVisible({ timeout: 800_000 });
});
