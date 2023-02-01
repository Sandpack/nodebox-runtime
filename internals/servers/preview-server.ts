import 'dotenv/config';
import { setupApp } from './utils';

import fastifyStatic from '@fastify/static';
import path from 'path';

const PORT = +(process.env.PORT || '3000');

const app = setupApp();

const PREVIEW_BUILD_DIR = path.join(__dirname, '../../packages/runtime/preview');

app.register(fastifyStatic, {
  root: PREVIEW_BUILD_DIR,
  index: ['index.html'],
  setHeaders: (res) => {
    res.setHeader('x-csb-no-sw-proxy', '1');
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
