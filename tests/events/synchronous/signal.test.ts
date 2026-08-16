import { Signal } from '@rayscale/events'
import { assertEquals } from '@std/assert'

Deno.test('Signal Class', async (test) => {
  await test.step('fire should invoke all the callbacks correctly', () => {
    const signal = new Signal()
    let count = 0

    signal.connect(() => {
      count++
    })
    signal.fire()

    assertEquals(count, 1)
  })

  await test.step('fire should pass the payload correctly', () => {
    const signal = new Signal<[number]>()
    let count = 0

    signal.connect((value) => {
      count = count + value
    })
    signal.fire(5)

    assertEquals(count, 5)
  })
})
