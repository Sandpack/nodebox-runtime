import crypto from 'crypto';
import path from 'path';
import fs from 'fs-extra';
import type { Plugin } from 'esbuild';
import BaseX from 'base-x';

const WORKER_RE = /(?:new Worker|createNodeWorker|StatefulWorker)\(require\.resolve\(["'`]([.\\/\-\w]*)["'`]\)\)/g;

const base36 = BaseX('0123456789abcdefghijklmnopqrstuvwxyz');
export function hashString(val: string): string {
  const hash = crypto.createHash('sha1');
  const data = hash.update(val, 'utf-8');
  return base36.encode(data.digest());
}

export async function writeWorker(dirname: string, content: string): Promise<string> {
  const filename = `worker-${hashString(content)}.js`;
  await fs.writeFile(path.join(dirname, filename), content, 'utf-8');
  return filename;
}

const existingBundles = new Map<string, string>();
const existingReplaces = new Map<string, string>();

export function inlineWorkerPlugin(outDir: string, bundle: (entry: string) => Promise<string>): Plugin {
  const filter = /^worker-content:/;
  const namespace = '_' + Math.random().toString(36).substr(2, 9);

  return {
    name: 'esbuild-worker-threads-plugin',
    setup(build) {
      // Links worker-content: calls to this namespace
      build.onResolve({ filter }, (args) => {
        const realPath = args.path.replace(filter, '');
        return {
          path: path.resolve(args.resolveDir, realPath),
          namespace,
        };
      });

      // Handles `worker-content:` values to bundle them and replace with new link
      build.onLoad({ filter: /.*/, namespace }, async (args) => {
        // console.log(args);
        let workerPath = existingBundles.get(args.path);
        if (!workerPath) {
          const result = await bundle(args.path);
          workerPath = await writeWorker(outDir, result);
          existingBundles.set(args.path, workerPath);
        }
        return {
          contents: workerPath,
          loader: 'text',
        };
      });

      // Gets called when loading files, extracts worker constructors and replaces them with worker-content:...
      // to be handled by other onLoad
      build.onLoad({ filter: /.*\.(js|ts|mjs|cjs)/ }, async (args) => {
        const content = await fs.readFile(args.path, 'utf8');
        if (WORKER_RE.test(content)) {
          if (existingReplaces.has(args.path)) {
            return {
              contents: content,
              loader: args.path.endsWith('.ts') ? 'ts' : 'js',
            };
          }
          const result = content.replace(WORKER_RE, (...params) => {
            const replacement = /StatefulWorker/.test(params[0])
              ? `StatefulWorker(require("worker-content:${params[1]}"), { eval: true })`
              : `new Worker(require("worker-content:${params[1]}"), { eval: true })`;

            console.log(`Replacing: "${params[0]}" with "${replacement}"`);

            return replacement;
          });
          existingReplaces.set(args.path, result);
          //   console.log(`Rewrote worker constructor for ${path.relative(process.cwd(), args.path)}`);
          return {
            contents: result,
            loader: args.path.endsWith('.ts') ? 'ts' : 'js',
          };
        }
      });
    },
  };
}
