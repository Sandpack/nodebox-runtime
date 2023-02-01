/**
 * @typedef { typeof import("../../packages/node-emulator").Nodebox } Nodebox
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
}`,

    '/src/routes/+page.svelte': `<script>
  import "/src/style.css";
  let data = "world"
</script>

<h1>Hello {data}</h1>

<style>
h1 {
  font-size: 1.5rem;
}
</style>`,

    '/src/app.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>`,

    'vite.config.js': `import { sveltekit } from '@sveltejs/kit/vite';

const config = {
  plugins: [sveltekit()]
};

export default config;
`,

    'svelte.config.js': `import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter()
  }
};

export default config;`,

    '/package.json': JSON.stringify({
      scripts: {
        dev: 'vite',
      },
      devDependencies: {
        '@sveltejs/adapter-auto': '^1.0.0',
        '@sveltejs/kit': '^1.0.0',
        svelte: '^3.54.0',
        vite: '^4.0.0',
        'esbuild-wasm': '0.15.12',
      },
      type: 'module',
    }),
  });

  const shellProcess = emulator.shell.create();
  const shellInfo = await shellProcess.runCommand('vite', ['dev', '--port', '3000']);
  shellProcess.on('exit', (...data) => console.error('Process exited:', ...data));
  return shellInfo;
};
