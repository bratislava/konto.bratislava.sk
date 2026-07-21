import {
  DeliveryMethodPreferenceHistory,
  DeliveryMethodUserPreferenceEnum,
} from '../../generated/prisma/client'

export const deliveryMethodPreferenceHistoryFactory = (
  overrides: Partial<DeliveryMethodPreferenceHistory> = {}
): DeliveryMethodPreferenceHistory => ({
  id: '66666666-6666-6666-6666-666666666666',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  userId: '11111111-1111-1111-1111-111111111111',
  method: DeliveryMethodUserPreferenceEnum.POSTAL,
  ...overrides,
})
