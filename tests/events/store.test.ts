import { Store } from '@rayscale/events'
import { assertEquals } from '@std/assert'

Deno.test('Store Class', async (test) => {
  await test.step('set should invoke all the connection callbacks', () => {
    const store = new Store<number>(0)
    let count = 0

    store.connect((value) => {
      count = count + value
    })
    store.set(5)

    assertEquals(count, 5)
  })
})
