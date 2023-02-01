import path from 'path';
import 'dotenv/config';
import { setupApp } from './utils';

import fastifyStatic from '@fastify/static';

const PORT = +(process.env.PORT || '4000');

const app = setupApp();

const NODE_EMULATOR_RUNTIME_BUILD_DIR = path.join(__dirname, '../../packages/runtime/build');

app.register(fastifyStatic, {
  root: NODE_EMULATOR_RUNTIME_BUILD_DIR,
  index: ['index.html'],
  setHeaders: (res) => {
    res.setHeader('x-csb-no-sw-proxy', '1');
  },
  decorateReply: false,
});

app.register(fastifyStatic, {
  prefix: '/public/',
  root: path.join(__dirname, '../public'),
  index: ['index.html'],
  setHeaders: (res, filePath) => {
    const parsedPath = path.parse(filePath);
    if (parsedPath.ext === '.gz') {
      res.setHeader('Content-Encoding', 'gzip');
    } else if (parsedPath.ext === '.br') {
      res.setHeader('Content-Encoding', 'br');
    }
  },
  decorateReply: false,
});

// Run the server!
app.listen({ port: PORT }, function (err, address) {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }

  console.log(`Server is now listening on ${address}`);
});
