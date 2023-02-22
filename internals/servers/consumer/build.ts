import esbuild from 'esbuild';
import path from 'path';
import os from 'os';
import { readFile, writeFile } from 'node:fs/promises';
import glob from 'glob-promise';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const RUNTIME_PORT = 4000;
const RUNTIME_URL = `https://${os.hostname()}-${RUNTIME_PORT}.${
  process.env.CSB_PREVIEW_BASE_HOST ?? 'preview.csb.app'
}`;

(async function buildConsumer() {
  const files = await glob('tests/**/*.example.js', { cwd: path.resolve(process.cwd()) });
  const fileContent = [];

  for (const file of files) {
    const content = await readFile(file, { encoding: 'utf8' });

    const pickShellProcess = content.replace(
      `const shellProcess = emulator.shell.create();`,
      `const shellProcess = emulator.shell.create();
      onShellProcessAvailable(shellProcess);`
    );

    const splitPath = file.split('/');
    const exampleName = splitPath[splitPath.length - 1].replace('.example.js', '');

    fileContent.push({
      exampleName,
      content: pickShellProcess,
    });
  }

  const fileTemplate = `
  import { Nodebox } from '../../../../packages/nodebox';
      
  /**
   * Global vars
   */
  window.emulatorUrl = '${RUNTIME_URL}?layout=debug';
  window.Nodebox = Nodebox;
  const templates = ${JSON.stringify(fileContent)};
`;

  const output = path.resolve(process.cwd() + '/internals/servers/consumer/bin');

  if (!existsSync(output)) {
    await mkdir(output);
  }

  await writeFile(output + '/consumer.js', fileTemplate);

  await esbuild.build({
    bundle: true,
    minify: false,
    sourcemap: false,
    treeShaking: false,
    platform: 'browser',
    format: 'cjs',
    outdir: path.join(__dirname, './dist'),
    entryPoints: [path.join(__dirname, './bin/consumer.js')],
  });
})();
