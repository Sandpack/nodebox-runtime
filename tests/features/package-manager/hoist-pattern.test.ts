import { test, expect } from 'tests';
import { MockCdn } from '../../../tests/setup/MockCdn';

const mockCdn = new MockCdn({
  packages: [
    {
      name: '@test/a',
      version: '1.0.0',
      files: {
        '/package.json': JSON.stringify({ name: '@test/a', version: '1.0.0' }),
      },
    },
    {
      name: '@test/b',
      version: '2.0.0',
      files: {
        '/package.json': JSON.stringify({
          name: '@test/b',
          version: '2.0.0',
          dependencies: { '4th-party': '0.0.1' },
        }),
      },
    },
    {
      name: '4th-party',
      version: '0.0.1',
      files: {
        '/package.json': JSON.stringify({ name: '4th-party', version: '0.0.1' }),
      },
    },
  ],
});

test.beforeAll(async () => {
  await mockCdn.listen();
});

test('respects a custom "public-hoist-pattern" in ".npmrc" file', async ({ runTestServer, emulatorUrl, page }) => {
  await runTestServer();

  const installedPaths = await page.evaluate(
    async ([emulatorUrl, cdnUrl]) => {
      const { Nodebox } = window;

      const nodebox = new Nodebox({
        runtimeUrl: emulatorUrl,
        iframe: document.getElementById('frame') as HTMLIFrameElement,
        cdnUrl,
      });
      await nodebox.connect();

      await nodebox.fs.init({
        '/.npmrc': `public-hoist-pattern[] = @test/*`,
      });
      // Writing package.json triggers dependency installation.
      await nodebox.fs.writeFile(
        '/package.json',
        JSON.stringify({
          name: 'public-hoist-package-test',
          dependencies: {
            '@test/a': '1.0.0',
            '@test/b': '2.0.0',
          },
        })
      );

      /**
       * @fixme Remove this.
       * Spawn a dummy command because we don't await the dependency
       * installation correctly unless you spawn a command.
       * @see https://linear.app/codesandbox/issue/ECO-310/dependency-installation-is-not-awaited-when-operating-with-nodebox-api
       */
      const shell = nodebox.shell.create();
      await shell.runCommand('exit', ['0']);

      const readdir = (base: string): Promise<Array<string>> => {
        return nodebox.fs.readdir(base).then((paths) => {
          return paths.map((path) => `${base}/${path}`);
        });
      };

      // Read the installed packages on the root-level "node_modules",
      // assuming that they have been hoisted correctly.
      return Promise.all([
        readdir('/node_modules/@test'),
        readdir('/node_modules/.store/@test'),
        readdir('/node_modules/.store'),
      ]).then((paths) => paths.flat());
    },
    [emulatorUrl, mockCdn.url]
  );

  expect(installedPaths).toEqual([
    // Hoisted packages must be symlinked to the root.
    '/node_modules/@test/a',
    '/node_modules/@test/b',

    // Hoisted packages are still physically installed in the store.
    '/node_modules/.store/@test/a@1.0.0',
    '/node_modules/.store/@test/b@2.0.0',
    '/node_modules/.store/@test',

    // A non-hoisted package is installed in the store.
    '/node_modules/.store/4th-party@0.0.1',
    '/node_modules/.store/node_modules',
  ]);
});
