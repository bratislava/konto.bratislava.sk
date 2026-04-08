import { TaxPayer } from '@prisma/client'

const DEFAULT_DATE = new Date('2024-01-01T00:00:00.000Z')

export const createTestTaxPayer = (overrides?: Partial<TaxPayer>): TaxPayer => ({
  id: 1,
  uuid: '1234567890',
  createdAt: DEFAULT_DATE,
  updatedAt: DEFAULT_DATE,
  birthNumber: '1234567890',
  externalId: '1234567890',
  name: 'John Doe',
  permanentResidenceStreet: '1234567890',
  permanentResidenceZip: '1234567890',
  permanentResidenceCity: '1234567890',
  lastUpdatedAtDZN: DEFAULT_DATE,
  lastUpdatedAtKO: DEFAULT_DATE,
  ...overrides,
})
