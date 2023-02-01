import { DeferredPromise } from '@open-draft/deferred-promise';
import { withTimeout } from './withTimeout';

it('rejects a pending promise if it exceeds the timeout', async () => {
  const promise = new DeferredPromise<void>();
  withTimeout(promise, 200);

  const rejectionError = new Error(`DeferredPromise hasn't settled within 200ms`);

  await expect(promise).rejects.toThrowError(rejectionError);
  expect(promise.state).toBe('rejected');
  expect(promise.rejectionReason).toEqual(rejectionError);
});

it('rejects a pending promise that resolves post-timeout', async () => {
  const promise = new DeferredPromise<number>();
  withTimeout(promise, 200);
  setTimeout(() => promise.resolve(123), 510);

  const rejectionError = new Error(`DeferredPromise hasn't settled within 200ms`);

  await expect(promise).rejects.toThrowError(rejectionError);
  expect(promise.state).toBe('rejected');
  expect(promise.rejectionReason).toEqual(rejectionError);
});

it('rejects a pending promise that rejects post-timeout', async () => {
  const promise = new DeferredPromise<void>();
  withTimeout(promise, 200);
  setTimeout(() => promise.reject('reason'), 250);

  const rejectionError = new Error(`DeferredPromise hasn't settled within 200ms`);

  await expect(promise).rejects.toThrowError(rejectionError);
  expect(promise.state).toBe('rejected');
  expect(promise.rejectionReason).toEqual(rejectionError);
});

it('does not reject a promise that resolves within the timeout', async () => {
  const promise = new DeferredPromise<number>();
  withTimeout(promise, 200);
  setTimeout(() => promise.resolve(123), 100);

  expect(await promise).toBe(123);
  expect(promise.state).toBe('fulfilled');

  expect(await promise).toBe(123);
  expect(promise.state).toBe('fulfilled');
  expect(promise.rejectionReason).toBeUndefined();
});

it('does not reject a promise that rejects within the timeout', async () => {
  const promise = new DeferredPromise<number>();
  withTimeout(promise, 200);
  setTimeout(() => promise.reject('reason'), 100);

  await expect(promise).rejects.toBe('reason');
  expect(promise.state).toBe('rejected');
  expect(promise.rejectionReason).toBe('reason');
});
