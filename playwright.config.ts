import { type PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  globalSetup: require.resolve('./tests/setup/globalSetup'),
  workers: 1,
  reporter: process.env.CI ? 'github' : undefined,
  use: {
    browserName: 'chromium',
    channel: 'chrome',
    ignoreHTTPSErrors: true,
    launchOptions: {
      args: [
        '--allow-insecure-localhost',
        '--ignore-certificate-errors',
        /**
         * @note Setting this feature flag prevents "SharedArrayBuffer is not defined"
         * for insecure hosts.
         */
        '--enable-features=SharedArrayBuffer',
        '--unsafely-treat-insecure-origin-as-secure=https://localhost',
      ],
      devtools: true,
    },
    screenshot: 'only-on-failure',
  },
  forbidOnly: !!process.env.CI,
};

export default config;
