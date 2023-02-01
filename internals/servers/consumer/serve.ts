import 'dotenv/config';
import { setupApp } from '../utils';

import fastifyStatic from '@fastify/static';
import path from 'path';

const PORT = 5000;

const app = setupApp();

app.register(fastifyStatic, {
  root: path.join(__dirname, './dist'),
  index: ['index.html'],
  setHeaders: (res) => {
    res.setHeader('x-csb-no-sw-proxy', '1');
  },
  decorateReply: false,
});

app.listen({ port: PORT }, function (err, address) {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }

  /* eslint-disable-next-line no-console */
  console.log(`Server is now listening on ${address}`);
});
