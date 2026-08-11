import { Event, EventConnection } from './event.ts'

export class Store<Value> extends Event<[Value]> {
  private _value: Value
  private _equals?: (a: Value, b: Value) => boolean

  public constructor(
    value: Value,
    connections: EventConnection<[Value]>[] = [],
    equals?: (a: Value, b: Value) => boolean,
  ) {
    super(connections)
    this._value = value
    this._equals = equals
  }

  private _fire(): void {
    for (const connection of this._connections) {
      try {
        connection.callback(this._value)
      } catch (error) {
        console.error('Error in store listener:', error)
        throw error
      }
    }
  }

  public get(): Value {
    return this._value
  }

  public set(value: Value): void {
    if (this.disposed) throw new Error('Store is disposed, cannot set value')
    if (this._equals) {
      if (!this._equals(this._value, value)) {
        this._value = value
        this._fire()
      }
    } else {
      if (this._value !== value) {
        this._value = value
        this._fire()
      }
    }
  }
}
