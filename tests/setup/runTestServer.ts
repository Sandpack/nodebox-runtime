import path from 'path';
import { type FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import { DeferredPromise } from '@open-draft/deferred-promise';
import { setupApp } from '../../internals/servers/utils';

interface TestServerReturnType {
  app: FastifyInstance;
  address: string;
}

export async function runTestServer(): Promise<TestServerReturnType> {
  const serverReady = new DeferredPromise<TestServerReturnType>();
  const app = setupApp();
  app.log.level = 'error';

  app.register(fastifyStatic, {
    root: path.join(__dirname, 'server'),
    index: ['index.html'],
    decorateReply: false,
  });

  // Serve the Node emulator build.
  app.register(fastifyStatic, {
    prefix: '/deps/nodebox/',
    root: path.join(__dirname, '../..', 'packages/nodebox/build'),
    decorateReply: false,
  });

  // Serve project packs to be available in the test server runtime.
  app.register(fastifyStatic, {
    prefix: '/projects/',
    root: path.join(__dirname, 'projects'),
    decorateReply: false,
    setHeaders(res, filePath) {
      const parsedPath = path.parse(filePath);

      if (parsedPath.ext === '.gz') {
        res.setHeader('Content-Encoding', 'gzip');
      } else if (parsedPath.ext === '.br') {
        res.setHeader('Content-Encoding', 'br');
      }
    },
  });

  // Serve Msgpack to unpack project files on runtime.
  app.register(fastifyStatic, {
    prefix: '/deps/msgpack/',
    root: path.join(__dirname, '../..', 'node_modules/@msgpack/msgpack'),
    decorateReply: false,
  });

  app.listen({ port: undefined }, (error, address) => {
    if (error) {
      app.log.error(error);
      serverReady.reject(error);
      return;
    }

    serverReady.resolve({ app, address });
  });

  return serverReady;
}
