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

export interface IFileStats {
  type: 'dir' | 'file' | 'link';
  size: number;
  ino: number;
  atimeMs: number;
  mtimeMs: number;
  ctimeMs: number;
  blocks: number;
  mode: number;
}

export interface FileSystemEvents {
  'fs/init': {
    files: FilesMap;
  };

  'fs/readFile':
    | [{ path: string; encoding?: undefined }, { data: Uint8Array }]
    | [{ path: string; encoding?: 'buffer' }, { data: Uint8Array }]
    | [{ path: string; encoding?: FSEncoding }, { data: string | FileContent }];

  'fs/writeFile': {
    path: string;
    content: FileContent;
    encoding?: BufferEncoding;
    recursive?: boolean;
  };

  'fs/readdir': [
    {
      path: string;
    },
    { data: string[] }
  ];

  'fs/stat': [
    {
      path: string;
    },
    { data: IFileStats }
  ];

  'fs/mkdir': {
    path: string;
    recursive?: boolean;
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

type WriteFileOptions = BufferEncoding | { encoding?: BufferEncoding; recursive?: boolean };

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

  public async readFile(path: string, encoding?: FSEncoding): Promise<FileContent> {
    const response = await this.channel.send('fs/readFile', { path, encoding }).catch((error) => {
      throw new Error(format('Failed to read file at path "%s"', path), { cause: error });
    });
    if (!response) {
      throw new Error('File not found');
    }
    return response.data;
  }

  /**
   * Write a file at the given path.
   * Replaces the file content if the file already exists.
   */
  public async writeFile(path: string, content: FileContent): Promise<void>;
  public async writeFile(path: string, content: FileContent, options: WriteFileOptions): Promise<void>;

  public async writeFile(path: string, content: FileContent, options?: WriteFileOptions): Promise<void> {
    let encoding = undefined;
    let recursive = false;

    if (typeof options === 'object') {
      encoding = options.encoding;
      recursive = !!options.recursive;
    } else if (typeof options === 'string') {
      encoding = options;
    }

    await this.channel.send('fs/writeFile', { path, content, encoding, recursive }).catch((error) => {
      throw new Error(format('Failed to write file at path "%s"', path), { cause: error });
    });
  }

  public async readdir(path: string): Promise<string[]> {
    const response = await this.channel.send('fs/readdir', { path }).catch((error) => {
      throw new Error(format('Failed to read directory at path "%s"', path), { cause: error });
    });
    if (!response) {
      throw new Error('Directory not found');
    }
    return response.data;
  }

  public async mkdir(path: string, options?: { recursive?: boolean }): Promise<void> {
    const recursive = !!options?.recursive;
    await this.channel.send('fs/mkdir', { path, recursive }).catch((error) => {
      throw new Error(format('Failed to make directory at path "%s"', path), { cause: error });
    });
  }

  public async stat(path: string): Promise<IFileStats> {
    const response = await this.channel.send('fs/stat', { path }).catch((error) => {
      throw new Error(format('Failed to stat file at path "%s"', path), { cause: error });
    });
    if (!response) {
      throw new Error('File not found');
    }
    return response.data;
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
