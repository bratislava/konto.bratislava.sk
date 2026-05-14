import { DeliveryMethodEnum } from '@prisma/client'
import { z } from 'zod'

import { DeliveryMethodNoris } from './types/tax.types'

const DELIVERY_METHOD_MAPPING = {
  [DeliveryMethodEnum.CITY_ACCOUNT]: DeliveryMethodNoris.CITY_ACCOUNT,
  [DeliveryMethodEnum.EDESK]: DeliveryMethodNoris.EDESK,
  [DeliveryMethodEnum.POSTAL]: DeliveryMethodNoris.POSTAL,
} as const satisfies Record<DeliveryMethodEnum, DeliveryMethodNoris>

const REVERSE_DELIVERY_METHOD_MAPPING = Object.fromEntries(
  Object.entries(DELIVERY_METHOD_MAPPING).map(([k, v]) => [v, k])
) as Partial<Record<DeliveryMethodNoris, DeliveryMethodEnum>>

export const DeliveryMethodCodec = z.codec(
  z.enum(DeliveryMethodEnum).nullable().optional(),
  z.enum(DeliveryMethodNoris),
  {
    decode: (value: DeliveryMethodEnum | null | undefined): DeliveryMethodNoris =>
      value ? DELIVERY_METHOD_MAPPING[value] : DeliveryMethodNoris.POSTAL,
    encode: (value: DeliveryMethodNoris): DeliveryMethodEnum | null =>
      REVERSE_DELIVERY_METHOD_MAPPING[value] || null,
  }
)
