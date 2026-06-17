import { DeliveryMethodEnum } from '@prisma/client'
import { z } from 'zod'

import { DeliveryMethod } from '../noris/types/noris.enums'

const DELIVERY_METHOD_MAPPING = {
  [DeliveryMethodEnum.CITY_ACCOUNT]: DeliveryMethod.CITY_ACCOUNT,
  [DeliveryMethodEnum.EDESK]: DeliveryMethod.EDESK,
  [DeliveryMethodEnum.POSTAL]: DeliveryMethod.POSTAL,
} as const satisfies Record<DeliveryMethodEnum, DeliveryMethod>

const REVERSE_DELIVERY_METHOD_MAPPING = Object.fromEntries(
  Object.entries(DELIVERY_METHOD_MAPPING).map(([k, v]) => [v, k])
) as Partial<Record<DeliveryMethod, DeliveryMethodEnum>>

export const DeliveryMethodCodec = z.codec(
  z.enum(DeliveryMethodEnum).nullable().optional(),
  z.enum(DeliveryMethod),
  {
    decode: (value: DeliveryMethodEnum | null | undefined): DeliveryMethod =>
      value ? DELIVERY_METHOD_MAPPING[value] : DeliveryMethod.POSTAL,
    encode: (value: DeliveryMethod): DeliveryMethodEnum | null =>
      REVERSE_DELIVERY_METHOD_MAPPING[value] || null,
  }
)
