import { AsyncEvent, AsyncEventConnection, ExposedAsyncEvent } from './event.ts'

/**
 * Exposes a restricted interface for an `AsyncStore`, including read access via `get()`.
 *
 * @template Value - The type of the stored value.
 */
export interface ExposedAsyncStore<Value> extends ExposedAsyncEvent<[Value]> {
  /**
   * Retrieves the current value of the store without allowing mutation.
   *
   * @returns The current {@link Value}.
   */
  get(): Value
}

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
  /** Internal current value of the store. */
  private _value: Value
  /** Optional custom equality function to determine if the value has changed. */
  private _equals?: (a: Value, b: Value) => boolean | Promise<boolean>

  /**
   * Creates an instance of an AsyncStore.
   *
   * @param value - The initial value of the store.
   * @param connections - Initial async event connections to add to the store.
   * @param equals - An optional custom function to check value equality.
   */
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

  /**
   * Retrieves the current value of the store.
   *
   * @returns The current {@link Value}.
   */
  public get(): Value {
    return this._value
  }

  /**
   * Updates the store's value and notifies listeners if the value has changed.
   *
   * @param value - The new value to set.
   * @throws {Error} Throws an error if the store has already been disposed.
   */
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

  /**
   * Exposes a restricted view of the async store including read-only access via `get()`.
   *
   * @returns An {@link ExposedAsyncStore} view of this store.
   */
  public override expose(): ExposedAsyncStore<Value> {
    return this
  }
}
