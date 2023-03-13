/**
 * @typedef { typeof import("../../packages/nodebox").Nodebox } Nodebox
 * @type {Nodebox} */
const Nodebox = window.Nodebox;

/**
 * @param {string} emulatorUrl
 */
window.runExample = async function (emulatorUrl) {
  const emulator = new Nodebox({
    runtimeUrl: emulatorUrl,
    iframe: document.getElementById('frame'),
  });

  await emulator.connect();

  await emulator.fs.init({
    '/pages/api/hello.js': `import { NextResponse } from 'next/server';
export const config = {
  runtime: 'edge',
};

export default (req) => {
  return NextResponse.json({
    name: 'Hello now an Edge Function!',
  });
};`,
    '/pages/index.js': `import useSwr from 'swr';
  const fetcher = (url) => fetch(url).then((res) => res.json());
  export default function Index() {
  const { data, error, isLoading } = useSwr('/api/hello', fetcher)

  if (error) return <div>Failed to load</div>
  if (isLoading) return <div>Loading...</div>
  if (!data) return null

  return (
    <div>Got data</div>
  )
}`,

    '/next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}
module.exports = nextConfig
`,

    '/package.json': JSON.stringify({
      name: 'my-app',
      version: '0.1.0',
      private: true,
      dependencies: {
        next: '13.2.3', // @todo: update to the latest version
        react: '18.2.0',
        'react-dom': '18.2.0',
        '@next/swc-wasm-nodejs': '13.2.3',
        swr: '2.1.0',
      },
    }),
  });

  const shellProcess = emulator.shell.create();
  const shellInfo = await shellProcess.runCommand('next', ['dev'], {
    env: {
      NEXT_IGNORE_INCORRECT_LOCKFILE: 'true',
      NEXT_TELEMETRY_DISABLED: 'true',
      __NEXT_DISABLE_MEMORY_WATCHER: 'true',
    },
  });
  shellProcess.on('exit', (...data) => console.error('Process exited:', ...data));
  return shellInfo;
};
