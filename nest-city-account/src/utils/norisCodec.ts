import { z } from 'zod'
import { DeliveryMethodEnum } from '@prisma/client'
import { DeliveryMethodNoris } from './types/tax.types'

const DELIVERY_METHOD_MAPPING = {
  [DeliveryMethodEnum.CITY_ACCOUNT]: DeliveryMethodNoris.CITY_ACCOUNT,
  [DeliveryMethodEnum.EDESK]: DeliveryMethodNoris.EDESK,
  [DeliveryMethodEnum.POSTAL]: DeliveryMethodNoris.POSTAL,
} as const

const REVERSE_DELIVERY_METHOD_MAPPING = Object.fromEntries(
  Object.entries(DELIVERY_METHOD_MAPPING).map(([k, v]) => [v, k])
) as Record<DeliveryMethodNoris, DeliveryMethodEnum>

export const DeliveryMethodCodec = z.codec(
  z.nativeEnum(DeliveryMethodEnum).nullable().optional(),
  z.nativeEnum(DeliveryMethodNoris),
  {
    decode: (value: DeliveryMethodEnum | null | undefined): DeliveryMethodNoris =>
      (value && DELIVERY_METHOD_MAPPING[value]) || DeliveryMethodNoris.POSTAL,
    encode: (value: DeliveryMethodNoris): DeliveryMethodEnum | null =>
      REVERSE_DELIVERY_METHOD_MAPPING[value] || null,
  }
)
