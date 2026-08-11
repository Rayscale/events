import { Event } from './event.ts'

export class Signal<Payload extends unknown[] = []> extends Event<Payload> {
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
