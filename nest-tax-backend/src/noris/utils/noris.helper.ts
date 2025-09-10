import { DeliveryMethod, DeliveryMethodNoris } from '../noris.types'

export const mapDeliveryMethodToNoris = (
  deliveryMethod: DeliveryMethod | null,
): DeliveryMethodNoris | null => {
  if (deliveryMethod === null) return null

  const mapping: Record<DeliveryMethod, DeliveryMethodNoris> = {
    [DeliveryMethod.EDESK]: DeliveryMethodNoris.EDESK,
    [DeliveryMethod.CITY_ACCOUNT]: DeliveryMethodNoris.CITY_ACCOUNT,
    [DeliveryMethod.POSTAL]: DeliveryMethodNoris.EDESK, // Postal is saved in Noris as EDESK ('E')
  }

  const norisMethod = mapping[deliveryMethod]
  if (!norisMethod) {
    throw new Error(`Unknown delivery method: ${deliveryMethod}`)
  }
  return norisMethod
}
