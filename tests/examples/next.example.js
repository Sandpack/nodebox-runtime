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
    '/styles.css': `body {
  font-family: sans-serif;
  -webkit-font-smoothing: auto;
  -moz-font-smoothing: auto;
  -moz-osx-font-smoothing: grayscale;
  font-smoothing: auto;
  text-rendering: optimizeLegibility;
  font-smooth: always;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}
h1 {
  font-size: 1.5rem;
}`,
    '/pages/_app.js': `import '../styles.css'
export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}`,
    '/pages/index.js': `export default function Home({ data }) {
  return (
    <div>
      <h1>Hello {data}</h1>
    </div>
  );
}
  
export function getServerSideProps() {
  return {
    props: { data: "world" },
  }
}
`,

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
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
      },
      dependencies: {
        next: '12.1.6', // @todo: update to the latest version
        react: '18.2.0',
        'react-dom': '18.2.0',
        '@next/swc-wasm-nodejs': '12.1.6',
      },
    }),
  });

  const shellProcess = emulator.shell.create();
  const shellInfo = await shellProcess.runCommand('next', ['dev'], {
    env: {
      NEXT_IGNORE_INCORRECT_LOCKFILE: 'true',
      NEXT_TELEMETRY_DISABLED: 'true',
    },
  });
  shellProcess.on('exit', (...data) => console.error('Process exited:', ...data));
  return shellInfo;
};
