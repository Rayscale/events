import { AsyncEvent } from './event.ts'

/**
 * Represents a dispatcher for asynchronous events, allowing listeners that return promises to be notified when the signal fires.
 *
 * @template Payload - The type of arguments passed to the signal listeners.
 *
 * @example
 * ```ts
 * const onClick = new AsyncSignal<[string, number]>();
 *
 * onClick.connect(async (id, count) => {
 *   await doSomethingAsync(id, count);
 * });
 *
 * await onClick.fire('btn-submit', 3); // Waits for all listeners
 * ```
 */
export class AsyncSignal<Payload extends unknown[] = []>
  extends AsyncEvent<Payload> {
  /**
   * Dispatches the signal, invoking all connected async listener callbacks with the provided payload and awaiting their completion.
   *
   * @param payload - The arguments passed to each event listener.
   * @throws {Error} Throws an error if the signal has already been disposed.
   */
  public async fire(...payload: Payload): Promise<void> {
    if (this.disposed) throw new Error('Signal is disposed, cannot fire')
    const promises = Array.from(this._connections).map((connection) =>
      Promise.resolve().then(() => connection.callback(...payload))
    )
    const results = await Promise.allSettled(promises)
    const errors = results
      .filter((r) => r.status === 'rejected')
      .map((r) => (r as PromiseRejectedResult).reason)
    if (errors.length) {
      throw new AggregateError(errors, 'One or more listeners failed')
    }
  }
}
