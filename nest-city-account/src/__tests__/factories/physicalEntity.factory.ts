import { PhysicalEntity } from '../../generated/prisma/client'

export const physicalEntityFactory = (
  overrides: Partial<PhysicalEntity> = {}
): PhysicalEntity => ({
  id: '44444444-4444-4444-4444-444444444444',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  userId: null,
  uri: 'ico://sk/12345678',
  ifo: null,
  birthNumber: null,
  uriPossiblyOutdated: false,
  activeEdesk: null,
  edeskStatusChangedAt: null,
  activeEdeskUpdatedAt: null,
  activeEdeskUpdateFailedAt: null,
  activeEdeskUpdateFailCount: 0,
  ...overrides,
})
