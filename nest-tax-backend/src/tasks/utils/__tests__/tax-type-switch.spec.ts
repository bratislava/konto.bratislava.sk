import { TaxType } from '@prisma/client'

import { getNextTaxType } from '../tax-type-switch'

describe('getNextTaxType', () => {
  it('should return KO when given DZN', () => {
    expect(getNextTaxType(TaxType.DZN)).toBe(TaxType.KO)
  })

  it('should return DZN when given KO (wrap around)', () => {
    expect(getNextTaxType(TaxType.KO)).toBe(TaxType.DZN)
  })

  it('should cycle through all tax types in schema order', () => {
    const types = [TaxType.DZN, TaxType.KO]
    for (let i = 0; i < types.length; i += 1) {
      const current = types[i]
      const next = types[(i + 1) % types.length]
      expect(getNextTaxType(current)).toBe(next)
    }
  })

  it('should return DZN when the tax type is not in the enum (as indexOf returns -1)', () => {
    expect(getNextTaxType('INVALID' as TaxType)).toBe(TaxType.DZN)
  })
})
