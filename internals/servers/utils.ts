import fastify, { FastifyInstance } from 'fastify';
import fs from 'fs';
import path from 'path';

export function setupApp(): FastifyInstance {
  if (process.env.CSB) {
    return fastify({
      logger: true,
    });
  }

  const app = fastify({
    logger: true,
    https: {
      key: fs.readFileSync(path.join(__dirname, '../../certificates/cert.key')),
      cert: fs.readFileSync(path.join(__dirname, '../../certificates/cert.crt')),
    },
  });

  app.log.level = process.env.NODE_ENV === 'test' ? 'error' : 'debug';

  return app;
}
