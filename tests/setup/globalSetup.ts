import * as path from 'path';
import { config } from 'dotenv';
import { format } from 'outvariant';
import { Config } from '@playwright/test';
import { DeferredPromise } from '@open-draft/deferred-promise';
import { ChildProcess, spawn } from 'child_process';
import { runSandpackCDNProxy } from './runSandpackCDNProxy';

config({
  path: path.resolve(__dirname, '../..', '.env.test'),
});

/**
 * @see https://playwright.dev/docs/test-advanced#global-setup-and-teardown
 */
export default async function globalSetup(_context: Config): Promise<() => Promise<void>> {
  const [runtimeIoResult, previewIoResult] = await Promise.allSettled([runRuntimeServer(), runPreviewServer()]);

  if (runtimeIoResult.status === 'rejected' || previewIoResult.status === 'rejected') {
    if (runtimeIoResult.status === 'fulfilled') {
      runtimeIoResult.value.kill();
    } else if (previewIoResult.status === 'fulfilled') {
      previewIoResult.value.kill();
    }

    if (runtimeIoResult.status === 'rejected') {
      throw runtimeIoResult.reason;
    } else if (previewIoResult.status === 'rejected') {
      throw previewIoResult.reason;
    }
  }

  const cdnProxy = await runSandpackCDNProxy();
  return async () => {
    cdnProxy.app.close();
    runtimeIoResult.value.kill();
    previewIoResult.value.kill();
  };
}

function runRuntimeServer(): DeferredPromise<ChildProcess> {
  return spawnAndWaitForStdout('pnpm', ['start:runtime'], (stdout) => {
    return stdout.includes('Server is now listening');
  });
}

function runPreviewServer(): DeferredPromise<ChildProcess> {
  return spawnAndWaitForStdout('pnpm', ['start:preview'], (stdout) => {
    return stdout.includes('Server is now listening');
  });
}

function spawnAndWaitForStdout(
  command: string,
  args: string[],
  predicate: (stdout: string) => boolean
): DeferredPromise<ChildProcess> {
  const promise = new DeferredPromise<ChildProcess>();
  const io = spawn(command, args, {
    env: {
      ...process.env,
      NODE_ENV: 'test',
    },
  });
  let stdout = Buffer.from('');

  io.stdout.on('data', (raw: Buffer) => {
    console.log(raw.toString('utf8'));
    stdout = Buffer.concat([stdout, raw]);

    if (predicate(raw.toString('utf8'))) {
      promise.resolve(io);
    }
  });

  io.stderr.on('data', (raw: Buffer) => {
    console.error(stdout.toString('utf8'));
    promise.reject(new Error(raw.toString('utf8')));
    io.kill(1);
  });

  io.once('error', (error) => promise.reject(error));
  io.once('exit', (code) => {
    if (code !== 0) {
      promise.reject(new Error(format('Process "%s %j" exited with code %d', command, args, code)));
    }
  });

  return promise;
}
