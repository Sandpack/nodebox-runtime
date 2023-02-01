declare namespace NodeJS {
  export interface ProcessEnv {
    EMULATOR_HOST: string;
    PREVIEW_HOST: string;
  }
}

declare global {
  export interface Window {
    Nodebox: typeof import('../packages/nodebox').Nodebox;
    downloadProject(packFilePath: string): Promise<Record<string, Uint8Array>>;
  }
}

export {};
