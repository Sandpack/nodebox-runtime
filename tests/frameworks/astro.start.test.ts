import { test, expect } from 'tests';

test.fixme('starts an Astro project', async ({ runTestServer, runExample, page, getPreviewFrame }) => {
  await runTestServer();

  page.setDefaultTimeout(300_000);

  await runExample(require.resolve('../examples/astro.example.js'));

  const previewFrame = await getPreviewFrame();
  const headingLocator = previewFrame.locator('text="Hello world"');

  await expect(headingLocator).toBeVisible({ timeout: 900_000 });
});
