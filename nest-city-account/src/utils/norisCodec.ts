import { z } from 'zod'
import {DeliveryMethodEnum} from "@prisma/client";
import {DeliveryMethodNoris} from "./types/tax.types";

const DELIVERY_METHOD_MAPPING = {
  [DeliveryMethodEnum.CITY_ACCOUNT]: DeliveryMethodNoris.CITY_ACCOUNT,
  [DeliveryMethodEnum.EDESK]: DeliveryMethodNoris.EDESK,
  [DeliveryMethodEnum.POSTAL]: DeliveryMethodNoris.POSTAL,
} as const

const REVERSE_DELIVERY_METHOD_MAPPING = Object.fromEntries(
  Object.entries(DELIVERY_METHOD_MAPPING).map(([k, v]) => [v, k])
) as Record<DeliveryMethodNoris, DeliveryMethodEnum>

export const DeliveryMethodCodec = z.codec(
  DeliveryMethodEnum,
  DeliveryMethodNoris,
  {
  decode: z
    .enum(DeliveryMethodEnum)
    .nullable()
    .transform((value) => (value && DELIVERY_METHOD_MAPPING[value]) || DeliveryMethodNoris.POSTAL),

  encode: z
    .enum(DeliveryMethodNoris)
    .transform((value) => REVERSE_DELIVERY_METHOD_MAPPING[value] || null)
})

