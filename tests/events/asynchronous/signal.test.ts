import { AsyncSignal } from '@rayscale/events'
import { assertEquals } from '@std/assert'

Deno.test('AsyncSignal Class', async (test) => {
  await test.step('fire should await all async callbacks', async () => {
    const signal = new AsyncSignal()
    let count = 0

    signal.connect(async () => {
      await Promise.resolve()
      count++
    })
    await signal.fire()

    assertEquals(count, 1)
  })

  await test.step('fire should propagate payload to async listeners', async () => {
    const signal = new AsyncSignal<[number]>()
    let count = 0

    signal.connect(async (value) => {
      await Promise.resolve()
      count = count + value
    })
    await signal.fire(5)

    assertEquals(count, 5)
  })
})
