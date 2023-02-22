import { encode } from '@msgpack/msgpack';
import { FastifyReply, FastifyRequest } from 'fastify';
import { type FilesMap } from '@codesandbox/nodebox';
import { test, expect } from '..';
import { setupApp } from '../../internals/servers/utils';

const mockCdn = setupApp();

function sendMsgPack(res: FastifyReply, payload: unknown) {
  res.type('application/octet-stream');
  const buffer = Buffer.from(encode(payload));
  return res.send(buffer);
}

mockCdn.get('/v2/deps/:query', (req: FastifyRequest<{ Params: { query: string } }>, res) => {
  res.header('access-control-allow-origin', '*');

  const responseJson = {
    'parent-a@1': '1.0.0',
    'parent-b@1': '1.0.0',
    'child@1': '1.0.0',
    'child@2': '2.0.0',
  };

  sendMsgPack(res, responseJson);
});

mockCdn.get('/v2/mod/:query', async (req: FastifyRequest<{ Params: { query: string } }>, res) => {
  res.header('access-control-allow-origin', '*');

  const respondWithFiles = (files: FilesMap) => {
    return sendMsgPack(res, files);
  };

  const parsedQuery = atob(req.params.query);
  switch (parsedQuery) {
    case 'parent-a@1.0.0': {
      return respondWithFiles({
        '/package.json': Buffer.from(
          JSON.stringify({
            name: 'parent-a',
            version: '1.0.0',
            main: './index.js',
            dependencies: { child: '1.0.0' },
          }),
          'utf8'
        ),
        '/index.js': Buffer.from(
          `
const child = require('child')
module.exports = { childVersion: child.version }`,
          'utf8'
        ),
      });
    }

    case 'parent-b@1.0.0': {
      return respondWithFiles({
        '/package.json': Buffer.from(
          JSON.stringify({
            name: 'parent-b',
            version: '1.0.0',
            main: './index.js',
            dependencies: { child: '2.0.0' },
          }),
          'utf8'
        ),
        '/index.js': Buffer.from(
          `
const child = require('child')
module.exports = { childVersion: child.version }`,
          'utf8'
        ),
      });
    }

    case 'child@1.0.0': {
      return respondWithFiles({
        '/package.json': Buffer.from(
          JSON.stringify({
            name: 'child',
            version: '1.0.0',
            main: './index.js',
          }),
          'utf8'
        ),
        '/index.js': Buffer.from(`module.exports = { version: '1.0.0' }`, 'utf8'),
      });
    }

    case 'child@2.0.0': {
      return respondWithFiles({
        '/package.json': Buffer.from(
          JSON.stringify({
            name: 'child',
            version: '2.0.0',
            main: './index.js',
          }),
          'utf8'
        ),
        '/index.js': Buffer.from(`module.exports = { version: '2.0.0' }`, 'utf8'),
      });
    }

    default: {
      return res.status(401).send(`Unknown dependency "${parsedQuery}"`);
    }
  }
});

test.beforeAll(async () => {
  await mockCdn.listen({ port: 3080 });
});

test.afterAll(async () => {
  await mockCdn.close();
});

test('supports multiple major versions of the same package', async ({ runTestServer, runExample, getPreviewFrame }) => {
  await runTestServer();
  await runExample(require.resolve('../examples/multiple.example.js'));

  const previewFrame = await getPreviewFrame();
  const parentA = previewFrame.locator('[id="parent-a"]');
  const parentB = previewFrame.locator('[id="parent-b"]');

  await expect(parentA).toHaveText('1.0.0');
  await expect(parentB).toHaveText('2.0.0');
});
