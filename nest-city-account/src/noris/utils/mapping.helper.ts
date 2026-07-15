import { DeliveryMethod, DeliveryMethodNoris } from '../types/noris.enums'

export const mapDeliveryMethodToNoris = (
  deliveryMethod: DeliveryMethod | null
): DeliveryMethodNoris | null => {
  if (deliveryMethod === null) {
    return null
  }

  const mapping = new Map<DeliveryMethod, DeliveryMethodNoris>([
    [DeliveryMethod.EDESK, DeliveryMethodNoris.EDESK],
    [DeliveryMethod.CITY_ACCOUNT, DeliveryMethodNoris.CITY_ACCOUNT],
    [DeliveryMethod.POSTAL, DeliveryMethodNoris.EDESK], // Postal is saved in Noris as EDESK ('E')
  ])

  const norisMethod = mapping.get(deliveryMethod)
  if (!norisMethod) {
    throw new Error(`Unknown delivery method: ${deliveryMethod}`)
  }
  return norisMethod
}
