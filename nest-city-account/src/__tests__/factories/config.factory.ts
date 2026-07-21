import { Config } from '../../generated/prisma/client'

export const configFactory = (overrides: Partial<Config> = {}): Config => ({
  id: '55555555-5555-5555-5555-555555555555',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  key: 'config-key',
  value: {},
  ...overrides,
})
