import { format, invariant } from 'outvariant';
import { Emitter } from 'strict-event-emitter';
import type { MessageSender, WorkerStatusUpdate } from '../messages';

export interface ShellEvents {
  'shell/runCommand': [
    {
      command: string;
      args: Array<string>;
      options: ShellCommandOptions;
    },
    ShellInfo
  ];
  'shell/exit': ShellInfo;
}

export interface ShellCommandOptions {
  cwd?: string;
  env?: Record<string, string>;
}

export type ShellInfo = {
  id: string;
};

export class ShellApi {
  constructor(private readonly channel: MessageSender) {}

  public create(): ShellProcess {
    return new ShellProcess(this.channel);
  }
}

export class ShellProcess {
  public id?: string;
  public state: 'running' | 'idle';

  public stdout: Emitter<{
    data: [string];
  }>;
  public stderr: Emitter<{
    data: [string];
  }>;

  constructor(private readonly channel: MessageSender) {
    this.state = 'running';
    this.stdout = new Emitter();
    this.stderr = new Emitter();

    this.forwardStdEvents();
  }

  private forwardStdEvents(): void {
    this.channel.on('worker/tty', (message) => {
      const { data } = message;

      if (data.workerId !== this.id) {
        return;
      }

      switch (data.payload.type) {
        case 'out': {
          this.stdout.emit('data', data.payload.data);
          break;
        }

        case 'err': {
          this.stderr.emit('data', data.payload.data);
          break;
        }
      }
    });
  }

  /**
   * Evaluates a given module in the File
   */
  public async runCommand(command: string, args: Array<string>, options: ShellCommandOptions = {}): Promise<ShellInfo> {
    invariant(!this.id, 'Failed to run "runCommand" on a ShellProcess: there is already a process running.');

    const shellInfo = await this.channel.send('shell/runCommand', { command, args, options });

    invariant(shellInfo, 'Failed to run "runCommand" on a ShellProcess: was not able to retrieve a running process.');

    this.id = shellInfo.id;
    this.state = 'running';

    return shellInfo;
  }

  public async on(message: 'exit', listener: (exitCode: number, error?: { message: string }) => void): Promise<void>;
  public async on(message: 'progress', listener: (status: WorkerStatusUpdate) => void): Promise<void>;

  public async on(message: 'exit' | 'progress' | 'error', listener: any): Promise<void> {
    switch (message) {
      case 'progress': {
        this.channel.on('worker/progress', ({ data }) => {
          listener(data.status);
        });
        return;
      }

      case 'exit': {
        this.channel.on('worker/exit', ({ data }) => {
          if (data.workerId === this.id) {
            listener(data.exitCode, data.error);
          }
        });
        return;
      }
    }
  }

  /**
   * Terminates the shell process.
   */
  public async kill(): Promise<void> {
    invariant(
      this.id,
      'Failed to run "kill" on a ShellProcess: there is no process running. Did you forget to run it?'
    );

    /**
     * @note Optimistically (and eagerly) transition the shell to the next state.
     * Shell exit only fails on protocol mismatch or when it's already been killed.
     */
    this.state = 'idle';

    /**
     * @todo I wonder if we should support a custom "exitCode" here
     * or a signal.
     */
    await this.channel.send('shell/exit', { id: this.id }).catch((error) => {
      throw new Error(format('Failed to kill shell with ID "%s"', this.id), { cause: error });
    });

    this.id = undefined;
  }
}
