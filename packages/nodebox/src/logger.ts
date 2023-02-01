/* eslint-disable no-console */
const FLAG = window.localStorage['CSB_EMULATOR_DEBUG'];

/**
 * Colors
 */
const DEFAULT = '\u001b[0m';
// Status
const GREEN = '\u001b[32;1m';
const RED = '\u001b[31m';
// Scopes
const BLUE = '\u001b[34m';
const YELLOW = '\u001b[33;1m';
const MAGENTA = '\u001b[35;1m';
const CYAN = '\u001b[36;1m';

type Scope = 'preview' | 'emulator' | 'runtime' | 'bridge' | 'runtime:worker';
const COLOR_SCOPE: Record<Scope, string> = {
  preview: YELLOW,
  emulator: MAGENTA,
  runtime: CYAN,
  bridge: BLUE,
  'runtime:worker': CYAN,
};

export function createDebug(scope: Scope) {
  return function debug(message: string, ...data: any[]) {
    if (FLAG === 'true') {
      const direction = () => {
        if (message.includes('sender')) return `${GREEN}sender`;
        if (message.includes('receiver')) return `${RED}receiver`;
        return '';
      };
      const cleanMessage = message.replace(/\[.+\]:/, '');

      console.log(`${COLOR_SCOPE[scope]}${scope}:${direction()}${DEFAULT}:${cleanMessage}`, ...data);
    }
  };
}
