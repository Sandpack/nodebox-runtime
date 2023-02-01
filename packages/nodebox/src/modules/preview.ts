import { format } from 'outvariant';
import { DeferredPromise } from '@open-draft/deferred-promise';
import type { MessageSender } from '../messages';

export interface PreviewEvents {
  'preview/get/info': [
    {
      port?: number;
      sourceShellId?: string;
    },
    PreviewInfo
  ];
}

const TIMEOUT = 10_000;

export type PreviewInfo = {
  url: string;
  sourceShellId: string;
  port: number;
};

export class PreviewApi {
  constructor(private readonly channel: MessageSender) {}

  private async waitFor(
    payload: { sourceShellId?: string; port?: number },
    predicate: (data: PreviewInfo) => boolean,
    timeout = TIMEOUT
  ): Promise<PreviewInfo> {
    const readyPromise = new DeferredPromise<PreviewInfo>();

    const rejectTimeout = setTimeout(() => {
      readyPromise.reject();
    }, timeout);

    // Look up for the informaton on PreviewManager
    const previewInformation = await this.channel.send('preview/get/info', payload).catch((error) => {
      readyPromise.reject(
        new Error(
          format(
            'Failed to look up preview information for shell ID "%s" (port: %d)',
            payload.sourceShellId,
            payload.port
          )
        )
      );
    });

    const foundPreview = previewInformation && predicate(previewInformation);

    if (foundPreview) {
      readyPromise.resolve({
        url: previewInformation.url,
        port: previewInformation.port,
        sourceShellId: previewInformation.sourceShellId,
      });
    }

    // Response from PreviewManager
    this.channel.on('preview/port/ready', ({ data }) => {
      // Avoid resolve the promise once again
      if (!foundPreview && predicate(data)) {
        readyPromise.resolve({
          url: data.url,
          port: data.port,
          sourceShellId: data.sourceShellId,
        });
      }
    });

    return readyPromise.finally(() => {
      clearTimeout(rejectTimeout);
    });
  }

  public async getByShellId(sourceShellId: string, timeout?: number): Promise<PreviewInfo> {
    return this.waitFor({ sourceShellId }, (data) => data.sourceShellId === sourceShellId, timeout).catch((error) => {
      throw new Error(format('Failed to get shell by ID "%s"', sourceShellId), { cause: error });
    });
  }

  public async waitForPort(port: number, timeout?: number): Promise<PreviewInfo> {
    return this.waitFor({ port }, (data) => data.port === port, timeout).catch((error) => {
      throw new Error(format('Failed to await port %d', port), { cause: error });
    });
  }
}
