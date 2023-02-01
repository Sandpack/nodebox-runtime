import path from 'path';
import esbuild from 'esbuild';
import { spawnSync } from 'node:child_process';

const EXIT_TS_ERROR = Boolean(process.env.IS_PROD_BUILD || process.env.CI);

async function build() {
  const tscScriptOutput = spawnSync('tsc', ['-p', require.resolve('./tsconfig.build.json')], {
    stdio: 'inherit',
  });

  if (EXIT_TS_ERROR && tscScriptOutput?.status && tscScriptOutput.status > 0) {
    process.exit(tscScriptOutput.status);
  }

  await esbuild.build({
    entryPoints: [require.resolve('./src/index')],
    outdir: path.resolve(process.cwd(), './build'),
    format: 'cjs',
    target: 'es2020',
    platform: 'browser',
    bundle: true,
    minify: false,
  });

  await esbuild.build({
    entryPoints: [require.resolve('./src/index')],
    outdir: path.resolve(process.cwd(), './build'),
    format: 'esm',
    platform: 'browser',
    outExtension: { '.js': '.mjs' },
    bundle: true,
    minify: false,
  });
}

build();
