import { DeliveryMethodNamed } from '@prisma/client'

import { DeliveryMethod } from '../../../noris/noris.types'
import { transformDeliveryMethodToDatabaseType } from '../types.prisma'

describe('transformDeliveryMethodToDatabaseType', () => {
  it('should return the correct DeliveryMethodNamed for EDESK', () => {
    expect(transformDeliveryMethodToDatabaseType(DeliveryMethod.EDESK)).toBe(
      DeliveryMethodNamed.EDESK,
    )
  })

  it('should return the correct DeliveryMethodNamed for CITY_ACCOUNT', () => {
    expect(
      transformDeliveryMethodToDatabaseType(DeliveryMethod.CITY_ACCOUNT),
    ).toBe(DeliveryMethodNamed.CITY_ACCOUNT)
  })

  it('should return the correct DeliveryMethodNamed for POSTAL', () => {
    expect(transformDeliveryMethodToDatabaseType(DeliveryMethod.POSTAL)).toBe(
      DeliveryMethodNamed.POSTAL,
    )
  })

  it('should return null for null input', () => {
    expect(transformDeliveryMethodToDatabaseType(null)).toBeNull()
  })

  it('should return null for undefined input', () => {
    expect(
      transformDeliveryMethodToDatabaseType('FAIL_VALUE' as DeliveryMethod),
    ).toBeNull()
  })
})
