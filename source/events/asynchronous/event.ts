import { Disposable, Exposable } from '@rayscale/types'

/**
 * Represents an asynchronous callback invoked when an event is dispatched.
 *
 * @template Payload - The type of arguments passed to the callback.
 */
export type AsyncEventCallback<Payload extends unknown[] = []> = (
  ...payload: Payload
) => Promise<void>

/**
 * Represents an active connection between an async event and a callback.
 *
 * @template Payload - The type of arguments associated with the event.
 */
export interface AsyncEventConnection<Payload extends unknown[] = []> {
  /** The async callback executed when the event fires. */
  callback: AsyncEventCallback<Payload>
  /** Indicates whether the connection persists after being triggered or cleared. */
  readonly persistent: boolean
  /** Disconnects the callback from the event. */
  disconnect(): void
}

/**
 * Exposes a restricted interface for subscribing to asynchronous events without allowing dispatching or clearing.
 *
 * @template Payload - The type of arguments passed to the event listeners.
 */
export interface ExposedAsyncEvent<Payload extends unknown[] = []> {
  /**
   * Subscribes an asynchronous callback to the event.
   *
   * @param callback - The async function to be called when the event occurs.
   * @param persistent - Whether the connection should survive standard clearing operations.
   * @returns An {@link AsyncEventConnection} representing the subscription.
   */
  connect(
    callback: AsyncEventCallback<Payload>,
    persistent?: boolean,
  ): AsyncEventConnection<Payload>
}

/**
 * Base class for managing and dispatching asynchronous events with type-safe payloads.
 *
 * @template Payload - The type of arguments passed to the event listeners.
 */
export abstract class AsyncEvent<Payload extends unknown[] = []>
  implements Exposable<ExposedAsyncEvent<Payload>>, Disposable {
  protected _connections: Set<AsyncEventConnection<Payload>> = new Set()
  private _disposed = false

  public get disposed(): boolean {
    return this._disposed
  }

  public constructor(connections: AsyncEventConnection<Payload>[] = []) {
    for (const connection of connections) {
      this._connections.add(connection)
    }
  }

  public connect(
    callback: AsyncEventCallback<Payload>,
    persistent = false,
  ): AsyncEventConnection<Payload> {
    const connection: AsyncEventConnection<Payload> = {
      callback,
      persistent,
      disconnect: (): void => {
        this._connections.delete(connection)
      },
    }

    this._connections.add(connection)
    return connection
  }

  public clear(force = false): void {
    if (this._disposed) throw new Error('Event is disposed, cannot clear')
    if (force) {
      this._connections.clear()
    } else {
      for (const connection of this._connections) {
        if (!connection.persistent) {
          connection.disconnect()
        }
      }
    }
  }

  public expose(): ExposedAsyncEvent<Payload> {
    return this
  }

  public dispose(): void {
    if (this._disposed) {
      throw new Error('Event is already disposed, cannot dispose again')
    }
    this.clear(true)
    this._disposed = true
  }
}
