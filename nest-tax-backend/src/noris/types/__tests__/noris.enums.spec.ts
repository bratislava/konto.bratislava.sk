import { DeliveryMethod, DeliveryMethodNoris } from '../noris.enums'

describe('DeliveryMethodNoris', () => {
  it('each key has the same value as in DeliveryMethod', () => {
    for (const key of Object.keys(
      DeliveryMethodNoris,
    ) as (keyof typeof DeliveryMethodNoris)[]) {
      expect(DeliveryMethodNoris[key]).toBe(DeliveryMethod[key])
    }
  })
})
