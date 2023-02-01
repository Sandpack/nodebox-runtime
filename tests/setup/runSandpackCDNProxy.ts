import path from 'path';
import { type FastifyInstance } from 'fastify';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import { DeferredPromise } from '@open-draft/deferred-promise';
import { setupApp } from '../../internals/servers/utils';

interface TestServerReturnType {
  app: FastifyInstance;
  address: string;
}

const TEST_DATA_DIR = path.join(__dirname, '../cdn-proxy');

export async function runSandpackCDNProxy(): Promise<TestServerReturnType> {
  const serverReady = new DeferredPromise<TestServerReturnType>();
  const app = setupApp();
  app.log.level = 'error';

  app.get('/*', async (req, res) => {
    console.log(`CDN Proxy: ${req.url}`);
    const targetPath = path.join(TEST_DATA_DIR, req.url);
    const dirname = path.dirname(targetPath);
    try {
      await fs.mkdir(dirname, { recursive: true });
    } catch (err) {
      // do nothing
    }
    // Long cache ttl does not matter as it's only for tests and fetching should be near-instant
    res.header('cache-control', 'public, max-age=900');
    res.header('access-control-allow-origin', '*');
    res.header('access-control-allow-headers', '*');
    res.header('access-control-allow-methods', 'GET, POST, OPTIONS');
    try {
      const existingResponse = await fs.readFile(targetPath);
      res.send(existingResponse);
      console.log(`Served ${req.url} from local cache`);
    } catch (err) {
      console.log(`Fetching ${req.url} from remote`);
      const response = await fetch('https://sandpack-cdn-v2.codesandbox.io' + req.url);
      const buf = await response.buffer();
      await fs.writeFile(targetPath, buf);
      console.log(`Served ${req.url} from remote`);
      res.send(buf);
    }
  });

  app.listen({ port: 3500 }, (error, address) => {
    if (error) {
      app.log.error(error);
      serverReady.reject(error);
      return;
    }

    serverReady.resolve({ app, address });
  });

  return serverReady;
}
