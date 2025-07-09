import { DeliveryMethodNamed, Prisma } from '@prisma/client'

import { DeliveryMethod } from '../../noris/noris.types'

export type TaxPaymentWithTaxYear = Prisma.TaxPaymentGetPayload<{
  include: {
    tax: {
      select: {
        year: true
      }
    }
  }
}>

export type TaxWithTaxPayer = Prisma.TaxGetPayload<{
  include: {
    taxPayer: true
  }
}>

export type TaxIdVariableSymbolYear = Prisma.TaxGetPayload<{
  select: {
    id: true
    variableSymbol: true
    year: true
  }
}>

export const transformDeliveryMethodToDatabaseType = (
  deliveryMethod: DeliveryMethod | null,
): DeliveryMethodNamed | null => {
  switch (deliveryMethod) {
    case DeliveryMethod.EDESK:
      return DeliveryMethodNamed.EDESK

    case DeliveryMethod.CITY_ACCOUNT:
      return DeliveryMethodNamed.CITY_ACCOUNT

    case DeliveryMethod.POSTAL:
      return DeliveryMethodNamed.POSTAL

    default:
      return null
  }
}
