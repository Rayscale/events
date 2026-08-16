import { Disposable, Exposable } from '@rayscale/types'

/**
 * Represents a callback function invoked when an event is dispatched.
 *
 * @template Payload - The type of arguments passed to the callback.
 */
export type EventCallback<Payload extends unknown[] = []> = (
  ...payload: Payload
) => void

/**
 * Represents an active connection between an event and a callback.
 *
 * @template Payload - The type of arguments associated with the event.
 */
export interface EventConnection<Payload extends unknown[] = []> {
  /** The callback function executed when the event fires. */
  callback: EventCallback<Payload>
  /** Indicates whether the connection persists after being triggered or cleared. */
  readonly persistent: boolean
  /** Disconnects the callback from the event. */
  disconnect(): void
}

/**
 * Exposes a restricted interface for subscribing to events without allowing dispatching or clearing.
 *
 * @template Payload - The type of arguments passed to the event listeners.
 */
export interface ExposedEvent<Payload extends unknown[] = []> {
  /**
   * Subscribes a callback function to the event.
   *
   * @param callback - The function to be called when the event occurs.
   * @param persistent - Whether the connection should survive standard clearing operations.
   * @returns An {@link EventConnection} representing the subscription.
   */
  connect(
    callback: EventCallback<Payload>,
    persistent?: boolean,
  ): EventConnection<Payload>
}

/**
 * Base class for managing and dispatching events with type-safe payloads.
 *
 * @template Payload - The type of arguments passed to the event listeners.
 */
export abstract class Event<Payload extends unknown[] = []>
  implements Exposable<ExposedEvent<Payload>>, Disposable {
  /** Internal set of active event connections. */
  protected _connections: Set<EventConnection<Payload>> = new Set()
  /** Internal flag indicating if the event has been disposed. */
  private _disposed = false

  /** Gets a value indicating whether the event has been disposed. */
  public get disposed(): boolean {
    return this._disposed
  }

  /**
   * Creates an instance of an Event.
   *
   * @param connections - Initial connections to add to the event.
   */
  public constructor(connections: EventConnection<Payload>[] = []) {
    for (const connection of connections) {
      this._connections.add(connection)
    }
  }

  /**
   * Subscribes a callback function to the event.
   *
   * @param callback - The function to be called when the event occurs.
   * @param persistent - Whether the connection should survive standard clearing operations. Default is `false`.
   * @returns An {@link EventConnection} representing the subscription.
   */
  public connect(
    callback: EventCallback<Payload>,
    persistent = false,
  ): EventConnection<Payload> {
    const connection: EventConnection<Payload> = {
      callback,
      persistent,
      disconnect: (): void => {
        this._connections.delete(connection)
      },
    }

    this._connections.add(connection)
    return connection
  }

  /**
   * Clears event connections. By default, removes only non-persistent connections.
   *
   * @param force - If `true`, clears all connections including persistent ones. Default is `false`.
   * @throws {Error} Throws an error if the event has already been disposed.
   */
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

  /**
   * Exposes a restricted interface of the event.
   *
   * @returns An {@link ExposedEvent} view of this event.
   */
  public expose(): ExposedEvent<Payload> {
    return this
  }

  /**
   * Disposes of the event, clearing all connections and marking it as unusable.
   */
  public dispose(): void {
    if (this._disposed) {
      throw new Error('Event is already disposed, cannot dispose again')
    }
    this.clear(true)
    this._disposed = true
  }
}
