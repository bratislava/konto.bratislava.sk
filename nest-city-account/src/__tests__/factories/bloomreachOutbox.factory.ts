import {
  BloomreachCommandDataKind,
  BloomreachCustomerCommandData,
} from '../../bloomreach/bloomreach.types'
import {
  BloomreachCommandName,
  BloomreachOutbox,
  BloomreachOutboxStatus,
} from '../../generated/prisma/client'

const defaultCommandData: BloomreachCustomerCommandData = {
  kind: BloomreachCommandDataKind.CUSTOMER,
  customer_ids: { city_account_id: 'user-id' },
  properties: {},
  update_timestamp: 0,
}

export const bloomreachOutboxFactory = (
  overrides: Partial<BloomreachOutbox> = {}
): BloomreachOutbox => ({
  id: '33333333-3333-3333-3333-333333333333',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  externalId: 'external-id',
  commandName: BloomreachCommandName.CUSTOMERS,
  commandData: defaultCommandData,
  status: BloomreachOutboxStatus.PENDING,
  attempts: 0,
  lastError: null,
  isTerminal: false,
  ...overrides,
})
