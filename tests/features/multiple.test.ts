import { test, expect } from '..';
import { MockCdn } from '../../tests/setup/MockCdn';

const mockCdn = new MockCdn({
  packages: [
    {
      name: 'parent-a',
      version: '1.0.0',
      files: {
        '/package.json': JSON.stringify({
          name: 'parent-a',
          version: '1.0.0',
          main: './index.js',
          dependencies: { child: '1.0.0' },
        }),
        '/index.js': `
const child = require('child')
module.exports = { childVersion: child.version }`,
      },
    },
    {
      name: 'parent-b',
      version: '1.0.0',
      files: {
        '/package.json': JSON.stringify({
          name: 'parent-b',
          version: '1.0.0',
          main: './index.js',
          dependencies: { child: '2.0.0' },
        }),
        '/index.js': `
const child = require('child')
module.exports = { childVersion: child.version }`,
      },
    },
    {
      name: 'child',
      version: '1.0.0',
      files: {
        '/package.json': JSON.stringify({
          name: 'child',
          version: '1.0.0',
          main: './index.js',
        }),

        '/index.js': `module.exports = { version: '1.0.0' }`,
      },
    },
    {
      name: 'child',
      version: '2.0.0',
      files: {
        '/package.json': JSON.stringify({
          name: 'child',
          version: '2.0.0',
          main: './index.js',
        }),
        '/index.js': `module.exports = { version: '2.0.0' }`,
      },
    },
  ],
});

test.beforeAll(async () => {
  await mockCdn.listen({ host: 'localhost', port: 3080 });
});

test('supports multiple major versions of the same package', async ({
  runTestServer,
  runExample,
  getPreviewFrame,
  page,
}) => {
  await runTestServer();
  await runExample(require.resolve('../examples/multiple.example.js'));

  await page.pause();

  const previewFrame = await getPreviewFrame();
  const parentA = previewFrame.locator('[id="parent-a"]');
  const parentB = previewFrame.locator('[id="parent-b"]');

  await expect(parentA).toHaveText('1.0.0');
  await expect(parentB).toHaveText('2.0.0');
});
