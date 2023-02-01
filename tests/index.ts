import { test as base, expect, Locator } from '@playwright/test';
import { runTestServer } from './setup/runTestServer';
import { readFile } from 'node:fs/promises';

declare global {
  interface Window {
    /**
     * Function defined inside the page scope by the example file
     */
    runExample(emulatorUrl: string): Promise<void>;
  }
}

interface Fixtures {
  emulatorUrl: string;
  runTestServer(): Promise<void>;
  getBridgeFrameLocator(): Promise<Locator>;
  getPreviewFrameLocator(): Promise<Locator>;

  /**
   * Returns the preview frame of the application.
   * @note This awaits both the bridge and the preview locators
   * before returning.
   */
  getPreviewFrame(): Promise<Locator>;
  runExample(path: string): Promise<void>;
}

const EMULATOR_URL = `https://${process.env.EMULATOR_HOST}?layout=debug`;

const test = base.extend<Fixtures>({
  emulatorUrl: EMULATOR_URL,

  async runTestServer({ page }, use) {
    const { app, address } = await runTestServer();

    await use(async () => {
      await page.goto(address.replace('127.0.0.1', 'localhost'), { waitUntil: 'networkidle' });

      if (process.env.PWDEBUG === '1' || process.env.PWDEBUG === 'true') {
        await page.evaluate(() => {
          localStorage.setItem('CSB_EMULATOR_DEBUG', 'true');
        });
      }

      await page.waitForFunction(() => {
        return typeof window.Nodebox !== 'undefined';
      });
    });

    await app.close();
  },

  async getBridgeFrameLocator({ page }, use) {
    await use(async () => {
      // First, wait for the "Previews" frame to become visible.
      // This frame hosts the bridge and the app's preview frame.
      const previewsFrame = page.frameLocator('#frame');
      await previewsFrame.locator('html').waitFor();
      return previewsFrame.frameLocator('[name="bridge"]').locator('body');
    });
  },

  async getPreviewFrameLocator({ page }, use) {
    await use(async () => {
      // First, wait for the "Previews" frame to become visible.
      // This frame hosts the bridge and the app's preview frame.
      const previewsFrame = page.frameLocator('#frame');
      await previewsFrame.locator('html').waitFor();
      return previewsFrame.frameLocator('[name="preview"]').locator('body');
    });
  },

  async getPreviewFrame({ getBridgeFrameLocator, getPreviewFrameLocator }, use) {
    await use(async () => {
      const bridgeFrame = await getBridgeFrameLocator();
      await bridgeFrame.waitFor();

      const previewFrame = await getPreviewFrameLocator();
      await previewFrame.waitFor();

      return previewFrame;
    });
  },

  async runExample({ page }, use) {
    await use(async (exampleFilePath) => {
      const emulatorUrl = EMULATOR_URL;
      const content = await readFile(exampleFilePath, 'utf8');

      page.mainFrame().addScriptTag({ content });

      await page.evaluate(async (emulatorUrl) => {
        await window.runExample(emulatorUrl);
      }, emulatorUrl);
    });
  },
});

export { test, expect };
