import { ExternalEdeskCheck, QueueItemStatusEnum } from '../../generated/prisma/client'

export const externalEdeskCheckFactory = (
  overrides: Partial<ExternalEdeskCheck> = {}
): ExternalEdeskCheck => ({
  id: '55555555-5555-5555-5555-555555555555',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  uri: 'rc://sk/external',
  newUri: null,
  queueStatus: QueueItemStatusEnum.PENDING,
  upvsStatus: null,
  edeskStatus: null,
  edeskNumber: null,
  edeskDeathDate: null,
  norisId: 1,
  processedAt: null,
  failCount: 0,
  ...overrides,
})
