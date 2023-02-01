import 'dotenv/config';
import { setupApp } from '../utils';

import fastifyStatic from '@fastify/static';
import path from 'path';

const PORT = 4007;

const app = setupApp();

app.register(fastifyStatic, {
  root: path.join(__dirname),
  index: ['index.html'],
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: path.join(__dirname, '../../..', 'packages/nodebox/build'),
  prefix: '/nodebox/',
  decorateReply: false,
});

app.listen({ port: PORT }, function (err, address) {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }

  console.log(`Server is now listening on ${address}`);
});
