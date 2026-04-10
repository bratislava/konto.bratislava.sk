import { DeliveryMethodNamed, TaxPayer, TaxType } from '@prisma/client'

import {
  RealEstateTaxAreaType,
  type RealEstateTaxDetail,
  RealEstateTaxPropertyType,
} from '../../prisma/json-types'
import { TaxWithTaxPayer } from '../../utils/types/types.prisma'
import { createTestTaxPayer } from './taxPayer.factory'

/** Shallow `Partial` does not apply to nested `taxPayer`; use this in tests. */
export type TestTaxOverrides = Omit<Partial<TaxWithTaxPayer>, 'taxPayer'> & {
  taxPayer?: Partial<TaxPayer>
}

const DEFAULT_DATE = new Date('2024-01-01T00:00:00.000Z')

const defaultDznTaxDetails: RealEstateTaxDetail = {
  type: TaxType.DZN,
  taxLand: 120,
  taxConstructions: 340,
  taxFlat: 540,
  propertyDetails: [
    {
      type: RealEstateTaxPropertyType.GROUND,
      areaType: RealEstateTaxAreaType.RESIDENTIAL,
      area: '320',
      base: 8000,
      amount: 120,
    },
    {
      type: RealEstateTaxPropertyType.CONSTRUCTION,
      areaType: RealEstateTaxAreaType.nebyt,
      area: '45',
      base: 12000,
      amount: 340,
    },
    {
      type: RealEstateTaxPropertyType.APARTMENT,
      areaType: RealEstateTaxAreaType.byt,
      area: '68.3',
      base: 9500,
      amount: 540,
    },
  ],
}

export const createTestTax = (
  overrides?: TestTaxOverrides,
): TaxWithTaxPayer => {
  const defaultTaxPayer = createTestTaxPayer()
  return {
    id: 1,
    uuid: '00000000-0000-4000-8000-000000000001',
    createdAt: DEFAULT_DATE,
    updatedAt: DEFAULT_DATE,
    taxPayerId: 1,
    year: 2024,
    type: TaxType.DZN,
    order: 1,
    variableSymbol: '1234567890',
    taxId: '1234567890',
    dateCreateTax: '2024-01-01',
    dateTaxRuling: DEFAULT_DATE,
    amount: 1000,
    taxDetails: defaultDznTaxDetails,
    lastCheckedPayments: DEFAULT_DATE,
    deliveryMethod: DeliveryMethodNamed.EDESK,
    bloomreachUnpaidTaxReminderSent: false,
    isCancelled: false,
    paymentMethodIsInkaso: false,
    ...overrides,
    taxPayer: {
      ...defaultTaxPayer,
      ...overrides?.taxPayer,
    },
  }
}
