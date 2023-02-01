import cuid from 'cuid';
import { format } from 'outvariant';
import type { MessageSender, FSWatchEvent } from '../messages';

type FSEncoding = BufferEncoding | 'buffer';

export type FileContent = Uint8Array | string;

export interface FilesMap {
  [filePath: string]: FileContent;
}

export interface FileWatchOptions {
  recursive?: boolean;
}

export type FileWatchEvent = Omit<FSWatchEvent, 'watcherId'>;

export interface FileSystemEvents {
  'fs/init': {
    files: FilesMap;
  };

  'fs/readFile':
    | [{ path: string; encoding?: undefined }, { data?: Uint8Array }]
    | [{ path: string; encoding?: 'buffer' }, { data?: Uint8Array }]
    | [{ path: string; encoding?: FSEncoding }, { data?: string | FileContent }];

  'fs/writeFile': {
    path: string;
    content: FileContent;
    encoding?: BufferEncoding;
  };

  'fs/watch': {
    watcherId: string;
    includes: string[];
    excludes: string[];
  };

  'fs/unwatch': {
    watcherId: string;
  };
}

export class FileSystemApi {
  constructor(private readonly channel: MessageSender) {}

  /**
   * Initialize the File System worker with the files.
   */
  public async init(files: FilesMap): Promise<void> {
    // Await the sent event to know when the worker
    // is done writing the files.
    await this.channel.send('fs/init', { files });
  }

  /**
   * Read a file at the given path.
   */
  public async readFile(path: string, encoding?: undefined): Promise<Uint8Array>;
  public async readFile(path: string, encoding: 'buffer'): Promise<Uint8Array>;
  public async readFile(path: string, encoding: BufferEncoding): Promise<string>;

  public async readFile(path: string, encoding?: FSEncoding): Promise<FileContent | string | undefined> {
    const response = await this.channel.send('fs/readFile', { path, encoding }).catch((error) => {
      throw new Error(format('Failed to read file at path "%s"', path), { cause: error });
    });

    return response ? response.data : undefined;
  }

  /**
   * Write a file at the given path.
   * Replaces the file content if the file already exists.
   */
  public async writeFile(path: string, content: Uint8Array): Promise<void>;
  public async writeFile(path: string, content: string, encoding: BufferEncoding): Promise<void>;

  public async writeFile(path: string, content: FileContent | string, encoding?: BufferEncoding): Promise<void> {
    await this.channel.send('fs/writeFile', { path, content, encoding }).catch((error) => {
      throw new Error(format('Failed to write file at path "%s"', path), { cause: error });
    });
  }

  /**
   * Subscribe to changes at the given file or directory.
   */
  public async watch(
    includes: string[],
    excludes: string[],
    listener?: (evt?: FileWatchEvent) => void
  ): Promise<{ dispose: () => Promise<void> }> {
    const watcherId = cuid();

    await this.channel.send('fs/watch', { watcherId, includes, excludes });

    this.channel.on('fs/watch-event', ({ data }) => {
      if (data.watcherId === watcherId && listener) {
        const evt = { ...data } as FSWatchEvent;
        // @ts-ignore
        delete evt.watcherId;
        listener(evt);
      }
    });

    return {
      dispose: () => this.channel.send('fs/unwatch', { watcherId }),
    };
  }
}
