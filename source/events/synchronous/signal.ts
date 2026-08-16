import { Event } from './event.ts'

/**
 * Represents a dispatcher for specific events, allowing listeners to be notified when the signal fires.
 *
 * @template Payload - The type of arguments passed to the signal listeners.
 *
 * @example
 * ```ts
 * const onClick = new Signal<[string, number]>();
 *
 * onClick.connect((id, count) => {
 *   console.log(`Clicked ${id} ${count} times`);
 * });
 *
 * onClick.fire('btn-submit', 3); // Logs: Clicked btn-submit 3 times
 * ```
 */
export class Signal<Payload extends unknown[] = []> extends Event<Payload> {
  /**
   * Dispatches the signal, invoking all connected listener callbacks with the provided payload.
   *
   * @param payload - The arguments passed to each event listener.
   * @throws {Error} Throws an error if the signal has already been disposed.
   */
  public fire(...payload: Payload): void {
    if (this.disposed) throw new Error('Signal is disposed, cannot fire')
    for (const connection of this._connections) {
      try {
        connection.callback(...payload)
      } catch (error) {
        console.error('Error in signal listener:', error)
        throw error
      }
    }
  }
}
