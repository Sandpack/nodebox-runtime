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
    '/src/styles.css': `body {
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
}
`,
    '/src/pages/_app.tsx': `import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
`,
    '/src/pages/index.tsx': `import { GetServerSideProps } from "next";

interface Props {
  framework: string;
}

export default function Home({ framework }: Props) {
  return (
    <div>
      <h1>Hello {framework}</h1>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  return {
    props: { framework: "Next.js" },
  };
};
`,
    '/next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
`,
    '/.env.development': `NEXT_TELEMETRY_DISABLED=1`,
    '/next-env.d.ts': `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
`,
    '/tsconfig.json': JSON.stringify({
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
      exclude: ['node_modules'],
    }),
    '/package.json': JSON.stringify({
      name: 'my-app',
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
      },
      dependencies: {
        '@types/node': '18.11.9',
        '@types/react': '18.0.25',
        '@types/react-dom': '18.0.8',
        next: '13.0.2',
        react: '18.2.0',
        'react-dom': '18.2.0',
        typescript: '4.8.4',
        '@next/swc-wasm-nodejs': '13.0.2',
        '@swc/helpers': '0.4.12',
      },
    }),
  });

  // Run the Vite app.
  const shellProcess = emulator.shell.create();
  return await shellProcess.runCommand('next', ['dev'], {
    env: {
      NEXT_IGNORE_INCORRECT_LOCKFILE: 'true',
      NEXT_TELEMETRY_DISABLED: 'true',
      __NEXT_DISABLE_MEMORY_WATCHER: 'true',
    },
  });
};
