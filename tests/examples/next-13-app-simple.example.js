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
    '/app/layout.jsx': `export default function RootLayout({ children }) {
  return (
    <html>
      <head></head>
      <body>{children}</body>
    </html>
  );
}`,
    '/app/page.jsx': `async function fetchData(params) {
  const res = await fetch(
    \`https://jsonplaceholder.typicode.com/posts/\${params.id}\`,
    { cache: "no-store" }
  );
  const data = await res.json();

  return data;
}

export default async function Page() {
  const data = await fetchData({ id: 1 });

  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.body}</p>
    </div>
  );
}`,
    'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: { appDir: true },
};
module.exports = nextConfig;`,
    'package.json': JSON.stringify({
      scripts: {
        dev: 'next dev',
      },
      dependencies: {
        next: '13.1.6',
        react: '18.2.0',
        'react-dom': '18.2.0',
        '@next/swc-wasm-nodejs': '13.1.6',
        '@swc/helpers': '0.4.14',
      },
    }),
  });

  // Run the Vite app.
  const shellProcess = emulator.shell.create();
  shellProcess.stderr.on('data', (data) => {
    console.error(data);
  });
  shellProcess.stdout.on('data', (data) => {
    // eslint-disable-next-line no-console
    console.log(data);
  });
  return await shellProcess.runCommand('next', ['dev'], {
    env: {
      NEXT_IGNORE_INCORRECT_LOCKFILE: 'true',
      NEXT_TELEMETRY_DISABLED: 'true',
      __NEXT_DISABLE_MEMORY_WATCHER: 'true',
    },
  });
};
