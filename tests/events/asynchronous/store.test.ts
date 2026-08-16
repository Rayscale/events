import { AsyncStore } from '@rayscale/events'
import { assertEquals } from '@std/assert'

Deno.test('AsyncStore Class', async (test) => {
  await test.step('set should await all async connection callbacks', async () => {
    const store = new AsyncStore<number>(0)
    let count = 0

    store.connect(async (value) => {
      await Promise.resolve()
      count = count + value
    })
    await store.set(5)

    assertEquals(count, 5)
  })
})
