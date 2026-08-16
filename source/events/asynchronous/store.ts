import { AsyncEvent, AsyncEventConnection } from './event.ts'

/**
 * Represents an asynchronous reactive state container that holds a value and notifies listeners when it changes.
 *
 * @template Value - The type of the stored value.
 *
 * @example
 * ```ts
 * const store = new AsyncStore<number>(0);
 *
 * store.connect(async (value) => {
 *   await saveToDatabase(value);
 * });
 *
 * await store.set(5); // Waits for all listeners to complete
 * ```
 */
export class AsyncStore<Value> extends AsyncEvent<[Value]> {
  private _value: Value
  private _equals?: (a: Value, b: Value) => boolean | Promise<boolean>

  public constructor(
    value: Value,
    connections: AsyncEventConnection<[Value]>[] = [],
    equals?: (a: Value, b: Value) => boolean | Promise<boolean>,
  ) {
    super(connections)
    this._value = value
    this._equals = equals
  }

  private async fire(): Promise<void> {
    const promises = Array.from(this._connections).map((connection) =>
      Promise.resolve().then(() => connection.callback(this._value))
    )
    const results = await Promise.allSettled(promises)
    const errors = results
      .filter((r) => r.status === 'rejected')
      .map((r) => (r as PromiseRejectedResult).reason)
    if (errors.length) {
      throw new AggregateError(errors, 'One or more listeners failed')
    }
  }

  public get(): Value {
    return this._value
  }

  public async set(value: Value): Promise<void> {
    if (this.disposed) throw new Error('Store is disposed, cannot set value')
    let changed = false
    if (this._equals) {
      changed = !(await this._equals(this._value, value))
    } else {
      changed = this._value !== value
    }

    if (changed) {
      this._value = value
      await this.fire()
    }
  }
}
