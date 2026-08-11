import { Disposable, Exposable } from '@rayscale/types'

export type EventCallback<Payload extends unknown[] = []> = (
  ...payload: Payload
) => void

export interface EventConnection<Payload extends unknown[] = []> {
  callback: EventCallback<Payload>
  readonly persistent: boolean
  disconnect(): void
}

export interface ExposedEvent<Payload extends unknown[] = []> {
  connect(
    callback: EventCallback<Payload>,
    persistent?: boolean,
  ): EventConnection<Payload>
}

export abstract class Event<Payload extends unknown[] = []>
  implements Exposable<ExposedEvent<Payload>>, Disposable {
  protected _connections: Set<EventConnection<Payload>> = new Set()
  private _disposed = false

  public get disposed(): boolean {
    return this._disposed
  }

  public constructor(connections: EventConnection<Payload>[] = []) {
    for (const connection of connections) {
      this._connections.add(connection)
    }
  }

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

  public expose(): ExposedEvent<Payload> {
    return this
  }

  public dispose(): void {
    this.clear(true)
    this._disposed = true
  }
}
