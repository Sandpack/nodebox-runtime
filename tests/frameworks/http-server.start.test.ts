import { test, expect } from 'tests';

test('starts a vanilla HTTP server project', async ({ runTestServer, getPreviewFrame, runExample }) => {
  await runTestServer();

  await runExample(require.resolve('../examples/http-server.example.js'));

  const previewFrame = await getPreviewFrame();
  const headingLocator = previewFrame.locator('text="Hello world"');

  await expect(headingLocator).toBeVisible({ timeout: 800000 });
});
