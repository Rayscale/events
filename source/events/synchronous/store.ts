import { Event, EventConnection } from './event.ts'

/**
 * Represents a reactive state container that holds a value and notifies listeners upon changes.
 *
 * @template Value - The type of value stored in the container.
 *
 * @example
 * ```ts
 * const store = new Store<number>(0);
 *
 * store.connect((value) => {
 *   console.log(`Value changed to: ${value}`);
 * });
 *
 * store.set(5); // Logs: Value changed to: 5
 * ```
 */
export class Store<Value> extends Event<[Value]> {
  /** Internal current value of the store. */
  private _value: Value
  /** Optional custom equality function to determine if the value has changed. */
  private _equals?: (a: Value, b: Value) => boolean

  /**
   * Creates an instance of a Store.
   *
   * @param value - The initial value of the store.
   * @param connections - Initial event connections to add to the store.
   * @param equals - An optional custom function to check value equality.
   */
  public constructor(
    value: Value,
    connections: EventConnection<[Value]>[] = [],
    equals?: (a: Value, b: Value) => boolean,
  ) {
    super(connections)
    this._value = value
    this._equals = equals
  }

  private fire(): void {
    for (const connection of this._connections) {
      try {
        connection.callback(this._value)
      } catch (error) {
        console.error('Error in store listener:', error)
        throw error
      }
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
  public set(value: Value): void {
    if (this.disposed) throw new Error('Store is disposed, cannot set value')
    if (this._equals) {
      if (!this._equals(this._value, value)) {
        this._value = value
        this.fire()
      }
    } else {
      if (this._value !== value) {
        this._value = value
        this.fire()
      }
    }
  }
}
