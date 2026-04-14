import { DeliveryMethodNamed, Prisma, TaxType } from '@prisma/client'

import {
  RealEstateTaxAreaType,
  type RealEstateTaxDetail,
  RealEstateTaxPropertyType,
} from '../../prisma/json-types'
import { createTestTaxPayer } from './taxPayer.factory'

/** Tax row as returned by `findUnique` with installments, payments, and payer admins. */
export type TestTax = Prisma.TaxGetPayload<{
  include: {
    taxPayer: {
      include: {
        taxAdministrators: { include: { taxAdministrator: true } }
      }
    }
    taxInstallments: { include: { tax: true } }
    taxPayments: { include: { tax: true } }
  }
}>

/** Nested keys use explicit optional merge; other keys use shallow `Partial`. */
export type TestTaxOverrides = Omit<
  Partial<TestTax>,
  'taxPayer' | 'taxInstallments' | 'taxPayments'
> & {
  taxPayer?: Partial<TestTax['taxPayer']>
  taxInstallments?: TestTax['taxInstallments']
  taxPayments?: TestTax['taxPayments']
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

export const createTestTax = (overrides?: TestTaxOverrides): TestTax => {
  const barePayer = createTestTaxPayer()

  const base: TestTax = {
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
    taxDetails: defaultDznTaxDetails as TestTax['taxDetails'],
    lastCheckedPayments: DEFAULT_DATE,
    deliveryMethod: DeliveryMethodNamed.EDESK,
    bloomreachUnpaidTaxReminderSent: false,
    isCancelled: false,
    paymentMethodIsInkaso: false,
    taxPayer: {
      ...barePayer,
      taxAdministrators: [],
    } as TestTax['taxPayer'],
    taxInstallments: [],
    taxPayments: [],
  }

  if (!overrides) {
    return base
  }

  const {
    taxPayer: taxPayerOverrides,
    taxInstallments: taxInstallmentsOverrides,
    taxPayments: taxPaymentsOverrides,
    ...rest
  } = overrides

  return {
    ...base,
    ...rest,
    taxPayer: {
      ...base.taxPayer,
      ...taxPayerOverrides,
    } as TestTax['taxPayer'],
    taxInstallments:
      taxInstallmentsOverrides !== undefined
        ? taxInstallmentsOverrides
        : base.taxInstallments,
    taxPayments:
      taxPaymentsOverrides !== undefined
        ? taxPaymentsOverrides
        : base.taxPayments,
  }
}
