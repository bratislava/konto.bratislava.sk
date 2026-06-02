import { DeliveryMethod, DeliveryMethodNoris } from '../../types/noris.enums'
import { mapDeliveryMethodToNoris } from '../mapping.helper'

describe('mapDeliveryMethodToNoris', () => {
  it('should map CITY_ACCOUNT to CITY_ACCOUNT', () => {
    expect(mapDeliveryMethodToNoris(DeliveryMethod.CITY_ACCOUNT)).toBe(
      DeliveryMethodNoris.CITY_ACCOUNT
    )
  })

  it('should map EDESK to EDESK', () => {
    expect(mapDeliveryMethodToNoris(DeliveryMethod.EDESK)).toBe(DeliveryMethodNoris.EDESK)
  })

  it('should map POSTAL to EDESK', () => {
    expect(mapDeliveryMethodToNoris(DeliveryMethod.POSTAL)).toBe(DeliveryMethodNoris.EDESK)
  })

  it('should return null for null input', () => {
    expect(mapDeliveryMethodToNoris(null)).toBeNull()
  })

  it('should throw an error for unknown delivery method', () => {
    expect(() => mapDeliveryMethodToNoris('UNKNOWN' as unknown as DeliveryMethod)).toThrow(
      'Unknown delivery method: UNKNOWN'
    )
  })
})
