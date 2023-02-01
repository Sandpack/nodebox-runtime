import { test, expect } from 'tests';

test('starts a Vuepress project', async ({ runTestServer, getPreviewFrame, runExample }) => {
  await runTestServer();

  await runExample(require.resolve('../examples/vuepress.example.js'));

  const previewFrame = await getPreviewFrame();
  const headingLocator = previewFrame.locator('h1', { hasText: 'Hello world' });

  await expect(headingLocator).toBeVisible({ timeout: 800_000 });
});
