import { invariant } from 'outvariant';
import { FastifyInstance, FastifyListenOptions, FastifyReply, FastifyRequest } from 'fastify';
import { type FilesMap } from '@codesandbox/nodebox';
import { encode } from '@msgpack/msgpack';
import { setupApp } from '../../internals/servers/utils';

interface MockCdnOptions {
  packages: Array<MockCdnPackage>;
}

interface MockCdnPackage {
  name: string;
  version: string;
  files: FilesMap;
}

export class MockCdn {
  private app: FastifyInstance;
  private packages: Array<MockCdnPackage>;
  private _url?: string;

  constructor(options: MockCdnOptions) {
    this.packages = options.packages;

    this.app = setupApp();
    this.app.log.level = 'error';

    this.app.get('/', (req, res) => {
      res.send(`This is a mock CDN for testing purposes.`);
    });
    this.app.get('/v2/deps/:query', this.dependencyQueryMiddleware.bind(this));
    this.app.get('/v2/mod/:query', this.moduleQueryMiddleware.bind(this));
  }

  private respondWith(res: FastifyReply, data: unknown) {
    res.type('application/octet-stream');
    res.send(Buffer.from(encode(data)));
  }

  private dependencyQueryMiddleware(req: FastifyRequest, res: FastifyReply): void {
    res.header('access-control-allow-origin', '*');

    const responseJson: Record<string, string> = {};

    for (const pkg of this.packages) {
      const pkgMajorVersion = pkg.version.split('.')[0];
      responseJson[`${pkg.name}@${pkgMajorVersion}`] = pkg.version;
    }

    this.respondWith(res, responseJson);
  }

  private moduleQueryMiddleware(req: FastifyRequest<{ Params: { query: string } }>, res: FastifyReply): void {
    res.header('access-control-allow-origin', '*');
    const parsedQuery = atob(req.params.query);

    for (const pkg of this.packages) {
      const pkgPragma = this.getPackagePragma(pkg.name, pkg.version);

      if (parsedQuery === pkgPragma) {
        this.respondWith(res, pkg.files);
        return;
      }
    }

    // Otherwise, respond with a 404.
    res.status(401).send(`Unknown dependency "${parsedQuery}"`);
  }

  private getPackagePragma(pkgName: string, packageVersion: string): string {
    return `${pkgName}@${packageVersion}`;
  }

  get url(): string {
    invariant(this._url, 'Failed to access "url" on MockCdn: the server is not running');
    return this._url;
  }

  public async listen(options?: FastifyListenOptions): Promise<string> {
    const serverUrl = await this.app.listen(options);
    this._url = serverUrl;
    return serverUrl;
  }
}
