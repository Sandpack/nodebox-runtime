export const INJECT_MESSAGE_TYPE = 'INJECT_AND_INVOKE';
export const PREVIEW_LOADED_MESSAGE_TYPE = 'PREVIEW_LOADED';

export interface Message {
  type: string;
}

type BaseScope = Record<string, unknown>;

export interface InjectMessage<Scope = BaseScope> {
  uid: string;

  type: typeof INJECT_MESSAGE_TYPE;
  /* A stringified function that will be called inside the iFrame. */
  code: string;
  /* The scope that will be passed to the injected code, as `options.scope`. */
  scope: Scope;
}
