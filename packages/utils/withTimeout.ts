import { DeferredPromise } from '@open-draft/deferred-promise';

/**
 * Rejects a given `DeferredPromise` if it doesn't settle within
 * the timeout duration.
 */
export function withTimeout(promise: DeferredPromise<any>, duration: number): void {
  const timeout = setTimeout(() => {
    // Prevent the timeout rejection if the Promise has already been settled.
    // Rejecting a Promise multiple times is also a no-op, and it'd throw.
    if (promise.state === 'pending') {
      promise.reject(new Error(`DeferredPromise hasn't settled within ${duration}ms`));
    }
  }, duration);

  const cancelTimeout = () => clearTimeout(timeout);
  promise.then(cancelTimeout, cancelTimeout);
}
