/**
 * This is a message contract between the Consumer and the Worker (Emulator).
 * @see "consumer-worker-messages.md" in the documentation.
 */
import cuid from 'cuid';
import { invariant } from 'outvariant';
import { DeferredPromise } from '@open-draft/deferred-promise';
import type { FileSystemEvents } from './modules/fs';
import type { ShellEvents } from './modules/shell';
import type { PreviewInfo } from './modules/preview';
import type { PreviewEvents } from './modules/preview';
import { createDebug } from './logger';

const debug = createDebug('emulator');

export interface ConsumerEvents extends FileSystemEvents, ShellEvents, PreviewEvents {
  connect: {
    cdnUrl?: string | null;
  };
}

type WatcherEvent =
  | {
      type: 'create';
      path: string;
    }
  | {
      type: 'remove';
      path: string;
    }
  | {
      type: 'change';
      path: string;
    }
  | {
      type: 'rename';
      oldPath: string;
      newPath: string;
    }
  | {
      type: 'close';
    };

export type FSWatchEvent = WatcherEvent & {
  watcherId: string;
};

export type WorkerStatusUpdate =
  | {
      state: 'downloading_manifest';
    }
  | {
      state: 'downloaded_module';
      name: string;
      totalPending: number;
    }
  | {
      state: 'starting_command';
    }
  | {
      state: 'command_running';
    };

export interface WorkerEvents {
  'internal/handshake/done': void;
  'internal/operation/done': {
    operationId: string;
    listenerPayload: unknown;
  };
  'internal/operation/failed': {
    operationId: string;
    error: Error;
  };
  'runtime/ready': void;
  'worker/progress': {
    workerId?: string;
    status: WorkerStatusUpdate;
  };
  'worker/tty': {
    workerId: string;
    payload: {
      data: string;
      type: 'out' | 'err';
    };
  };
  'worker/exit': {
    workerId: string;
    exitCode: number;
    error?: {
      message: string;
    };
  };
  'preview/port/ready': PreviewInfo;
  'fs/watch-event': FSWatchEvent;
}

type OperationEvent<Payload> = Payload & {
  operationId: string;
};

type MaybePromise<T> = T | Promise<T>;

export class MessageReceiver {
  private emitter: EventTarget;
  private senderPort: MessagePort = null as any;

  constructor() {
    this.emitter = new EventTarget();
    this.waitForHandshake();
  }

  private waitForHandshake() {
    const handshakePromise = new DeferredPromise();

    const handshakeListener = (message: MessageEvent) => {
      const { data } = message;

      debug('[message-receiver]: incoming', message);

      if (data.type === 'internal/handshake') {
        invariant(
          message.ports.length > 0,
          'Failed to confirm a MessageReceiver handshake: received event has no ports'
        );

        this.senderPort = message.ports[0];
        this.addMessageListener();

        debug('[message-receiver]: handshake received!', this.senderPort);

        this.send('internal/handshake/done');
        debug('[message-receiver]: finish handshake');
      }
    };

    window.addEventListener('message', handshakeListener);
    handshakePromise.then(() => {
      window.removeEventListener('message', handshakeListener);
    });

    window.parent.postMessage({ type: 'internal/ready' }, '*');

    return handshakePromise;
  }

  private addMessageListener(): void {
    invariant(
      this.senderPort,
      '[MessageReceiver] Failed to add a message listener: sender port is not defined. Did you forget to await a handshake?'
    );

    this.senderPort.onmessage = (evt) => {
      const data = evt.data;
      if (data.type == null) {
        return;
      }

      this.emitter.dispatchEvent(
        new MessageEvent(data.type, {
          data: data.payload,
        })
      );
    };
  }

  public on<Event extends keyof ConsumerEvents & string>(
    event: Event,
    listener: (
      message: ConsumerEvents[Event] extends [infer PayloadType, infer _] ? PayloadType : ConsumerEvents[Event]
    ) => MaybePromise<ConsumerEvents[Event] extends [infer _, infer ReturnType] ? ReturnType | undefined : void>,
    options?: AddEventListenerOptions
  ): void {
    this.emitter.addEventListener(
      event,
      async (message) => {
        if (!(message instanceof MessageEvent)) {
          return;
        }

        // Send back the confirmation about the operation completion.
        const { operationId, payload } = message.data;

        try {
          const listenerPayload = await listener(payload);
          this.send('internal/operation/done', { operationId, listenerPayload });
        } catch (error) {
          if (error instanceof Error) {
            this.send('internal/operation/failed', { operationId, error });
          }
        }
      },
      options
    );
  }

  public send<Event extends keyof WorkerEvents & string>(
    event: Event,
    ...data: WorkerEvents[Event] extends Record<string, unknown> ? [WorkerEvents[Event]] : [undefined?]
  ): void {
    invariant(
      this.senderPort,
      '[MessageReceiver] Failed to send a message "%j": sender port is not defined. Did you forget to await a handshake?',
      event
    );

    const payload = data[0] || {};
    debug('[message-receiver]: send "%s"', event, payload);

    this.senderPort.postMessage({ type: event, payload });
  }
}

export class MessageSender {
  private emitter: EventTarget;
  private channel: MessageChannel;
  private receiverPort: MessagePort;
  private receiverReadyPromise: DeferredPromise<void>;

  constructor(private readonly target: Window) {
    this.emitter = new EventTarget();
    this.channel = new MessageChannel();
    this.receiverPort = this.channel.port1;

    const receiverReadyPromise = new DeferredPromise<void>();
    const handshakeListener = (message: MessageEvent) => {
      if (message.data.type === 'internal/ready') {
        debug('[message-sender]: runtime is ready');
        receiverReadyPromise.resolve();
      }
    };
    window.addEventListener('message', handshakeListener);
    receiverReadyPromise.then(() => {
      window.removeEventListener('message', handshakeListener);
    });
    this.receiverReadyPromise = receiverReadyPromise;

    // Attach a message listener once.
    this.receiverPort.onmessage = (evt) => {
      const data = evt.data;
      if (data.type != null) {
        debug('[message-sender]: emitting "%s" event...', data.type, data.payload);
        this.emitter.dispatchEvent(new MessageEvent(data.type, { data: data.payload }));
      }
    };
  }

  public async handshake(): Promise<void> {
    const handshakePromise = new DeferredPromise<void>();

    await this.receiverReadyPromise;

    debug('[message-sender]: sending handshake');
    this.target.postMessage(
      {
        type: 'internal/handshake',
      },
      '*',
      [this.channel.port2]
    );

    this.on('internal/handshake/done', () => {
      handshakePromise.resolve();
      clearTimeout(rejectionTimeout);
    });

    const rejectionTimeout = setTimeout(() => {
      handshakePromise.reject(new Error('MessageSender: Handshake timeout'));
    }, 5000);

    return handshakePromise;
  }

  public on<Event extends keyof WorkerEvents & string>(
    event: Event,
    listener: (message: MessageEvent<WorkerEvents[Event]>) => void,
    options?: AddEventListenerOptions
  ): void {
    debug('[message-sender]: add listener "%s"', event);

    this.emitter.addEventListener(
      event,
      (message) => {
        if (message instanceof MessageEvent) {
          listener(message);
        }
      },
      options
    );
  }

  public off<Event extends keyof WorkerEvents & string>(
    event: Event,
    listener: (message: MessageEvent<WorkerEvents[Event]>) => void,
    options?: AddEventListenerOptions
  ): void {
    this.emitter.removeEventListener(event, listener as EventListener, options);
  }

  public async send<Event extends keyof ConsumerEvents & string>(
    event: Event,
    ...data: ConsumerEvents[Event] extends [infer PayloadType, infer _]
      ? [PayloadType]
      : ConsumerEvents[Event] extends Record<string, unknown>
      ? [ConsumerEvents[Event]]
      : [undefined?]
  ): Promise<
    ConsumerEvents[Event] extends [infer _, infer ReturnType] ? OperationEvent<ReturnType> | undefined : void
  > {
    const operationPromise = new DeferredPromise<
      ConsumerEvents[Event] extends [infer _, infer ReturnType] ? OperationEvent<ReturnType> : void
    >();
    const operationId = cuid();

    const payload = data[0] || {};
    debug('[message-sender]: send "%s" (%s)', event, operationId, payload);

    this.receiverPort.postMessage({ type: event, payload: { operationId, payload } });

    // Await this operation to be confirmed as done by the receiver.
    debug('[message-sender]: adding done listener for "%s" (%s)', event, operationId);

    const handleOperationDone = (doneEvent: MessageEvent<WorkerEvents['internal/operation/done']>) => {
      const { data } = doneEvent;

      if (data.operationId === operationId) {
        const listenerPayload = (data.listenerPayload || {}) as ConsumerEvents[Event] extends [
          infer _,
          infer ReturnType
        ]
          ? OperationEvent<ReturnType>
          : void;

        debug('[message-sender]: resolving "%s (%s) promise!', event, operationId);

        operationPromise.resolve({
          ...listenerPayload,
          operationId: data.operationId,
        });
      }
    };

    const handleOperationFailed = (failEvent: MessageEvent<WorkerEvents['internal/operation/failed']>) => {
      const { data } = failEvent;

      if (data.operationId === operationId) {
        debug('[message-sender]: rejecting "%s (%s) promise!', event, operationId);

        operationPromise.reject(data.error);
      }
    };

    this.on('internal/operation/done', handleOperationDone);

    // Handle exceptions from the receiver.
    this.on('internal/operation/failed', handleOperationFailed);

    return operationPromise.finally(() => {
      // Clean up all the listeners for this particular operation.
      // Each operation has its own unique ID, so we can safely remove all the listeners for this operation.
      this.emitter.removeEventListener('internal/operation/done', handleOperationDone as EventListener);
      this.emitter.removeEventListener('internal/operation/failed', handleOperationFailed as EventListener);
    });
  }
}
