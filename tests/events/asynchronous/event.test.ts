import { AsyncEvent, AsyncEventConnection } from '@rayscale/events'
import { assertEquals } from '@std/assert'

class MockAsyncEvent extends AsyncEvent {
  public get connections(): Set<AsyncEventConnection> {
    return this._connections
  }
}

Deno.test('AsyncEvent Class', async (test) => {
  await test.step('connect should add connection correctly', () => {
    const event = new MockAsyncEvent()
    const connection = event.connect(async () => {})

    assertEquals(event.connections.has(connection), true)
  })

  await test.step('clear should clear all the non-persistent connections correctly', () => {
    const event = new MockAsyncEvent()

    event.connect(async () => {})
    event.clear()

    assertEquals(event.connections.size, 0)
  })

  await test.step('forced clear should all the connections correctly', () => {
    const event = new MockAsyncEvent()

    event.connect(async () => {}, true)
    event.clear(true)

    assertEquals(event.connections.size, 0)
  })
})
