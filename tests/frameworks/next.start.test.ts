import { test, expect } from 'tests';

test.setTimeout(240_000);

/**
 * @see https://github.com/codesandbox/nodebox/actions/runs/3532894910/jobs/5927821309
 */
test.fixme('starts a NextJS project', async ({ runTestServer, page, getPreviewFrame, runExample }) => {
  await runTestServer();

  page.on('pageerror', (error) => console.error('Page error:', error));
  page.on('crash', () => console.error('PAGE CRASHED!'));
  page.on('console', (message) => console.log('Console:', message.type(), message.text()));

  await runExample(require.resolve('../examples/next.example.js'));

  // Must render the Vite app in the preview iframe.
  const previewFrame = await getPreviewFrame();

  console.warn('preview framwe html:', await previewFrame.locator('body').textContent());

  const nextBlock = previewFrame.locator('#__next');
  await expect(nextBlock).toBeVisible({ timeout: 300_000 });
});
