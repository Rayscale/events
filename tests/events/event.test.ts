import { Event, EventConnection } from '@rayscale/events'
import { assertEquals } from '@std/assert'

class MockEvent extends Event {
  public get connections(): Set<EventConnection> {
    return this._connections
  }
}

Deno.test('Event Class', async (test) => {
  await test.step('connect should add connection correctly', () => {
    const event = new MockEvent()

    const connection = event.connect(() => {})

    assertEquals(event.connections.has(connection), true)
  })

  await test.step('clear should clear all the non-persistent connections correctly', () => {
    const event = new MockEvent()

    event.connect(() => {})
    event.clear()

    assertEquals(event.connections.size, 0)
  })

  await test.step('forced clear should all the connections correctly', () => {
    const event = new MockEvent()

    event.connect(() => {}, true)
    event.clear(true)

    assertEquals(event.connections.size, 0)
  })
})
