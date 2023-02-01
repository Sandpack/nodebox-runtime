import { invariant } from 'outvariant';
import { DeferredPromise } from '@open-draft/deferred-promise';
import { createDebug } from './logger';

import { MessageSender } from './messages';
import { FileSystemApi, FilesMap } from './modules/fs';
import type { FileWatchEvent } from './modules/fs';
import { ShellApi, ShellInfo, ShellProcess } from './modules/shell';
import { PreviewApi, PreviewInfo } from './modules/preview';

export type { ShellInfo, PreviewInfo, FilesMap, ShellProcess, FileWatchEvent };

const DEFAULT_RUNTIME_URL = 'https://nodebox-runtime.codesandbox.io';

export interface ChannelOptions {
  iframe: HTMLIFrameElement;

  /**
   * A custom Nodebox runtime URL
   */
  runtimeUrl?: string;

  /**
   * A custom Sandpack CDN URL.
   */
  cdnUrl?: string;
}

const debug = createDebug('emulator');

/**
 * Create a new Node emulator instance
 */
export class Nodebox {
  private channel: MessageSender = null as any;
  private isConnected: boolean;
  private url: string;

  /* API */
  private fileSystemApi: FileSystemApi = null as any;
  private shellApi: ShellApi = null as any;
  private previewApi: PreviewApi = null as any;

  constructor(private readonly options: ChannelOptions) {
    invariant(
      this.options.iframe,
      'Failed to create a Nodebox: expected "iframe" argument to be a reference to an <iframe> element but got %j',
      this.options.iframe
    );

    this.url = this.options.runtimeUrl || DEFAULT_RUNTIME_URL;

    this.isConnected = false;
  }

  /**
   * Connect to the deployed Node Emulator instance.
   */
  public async connect(): Promise<void> {
    const { iframe, cdnUrl } = this.options;

    debug('[message-sender]: Connecting to node emulator...');

    const connectionPromise = new DeferredPromise<void>();

    if (!this.url) {
      connectionPromise.reject(
        new Error('Nodebox URL is missing. Did you forget to provide it when creating this Nodebox instance?')
      );
    }

    invariant(
      iframe.contentWindow,
      'Failed to create a MessageChannel with the Nodebox iframe: no content window found'
    );

    // Establish a message channel with the worker frame
    // to communicate with the worker instance.
    this.channel = new MessageSender(iframe.contentWindow);

    // Connect to the emulator.
    const frameLoadPromise = new DeferredPromise<void>();
    iframe.setAttribute('src', this.url);
    iframe.addEventListener(
      'load',
      () => {
        frameLoadPromise.resolve();
      },
      { once: true }
    );
    iframe.addEventListener(
      'error',
      (event) => {
        frameLoadPromise.reject(event.error);
      },
      { once: true }
    );

    // Wait until the Emulator iframe is ready
    // before communicating with it.
    await frameLoadPromise;

    debug('[message-sender]: IFrame loaded...');

    // Await the worker frame to establish the receiver channel
    // and confirm the functioning message port via handshake.
    await this.channel.handshake();

    debug('[message-sender]: Handshake completed...');

    // Prompt a connection to the worker.
    this.channel.send('connect', {
      cdnUrl,
    });

    this.channel.on('runtime/ready', () => {
      connectionPromise.resolve();
    });

    return connectionPromise.then(() => {
      debug('[message-sender]: Connected to runtime...');
      this.isConnected = true;
    });
  }

  get fs(): FileSystemApi {
    invariant(
      this.isConnected,
      'Failed to access the File System API: consumer is not connected. Did you forget to run "connect()"?'
    );

    if (this.fileSystemApi) {
      return this.fileSystemApi;
    }

    this.fileSystemApi = new FileSystemApi(this.channel);
    return this.fileSystemApi;
  }

  get shell(): ShellApi {
    invariant(
      this.isConnected,
      'Failed to access the Shell API: consumer is not connected. Did you forget to run "connect()"?'
    );

    if (this.shellApi) {
      return this.shellApi;
    }

    this.shellApi = new ShellApi(this.channel);
    return this.shellApi;
  }

  get preview(): PreviewApi {
    invariant(
      this.isConnected,
      'Failed to access the Preview API: consumer is not connected. Did you forget to run "connect()"?'
    );

    if (this.previewApi) {
      return this.previewApi;
    }

    this.previewApi = new PreviewApi(this.channel);
    return this.previewApi;
  }
}
