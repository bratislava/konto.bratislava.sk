import { PrismaClient } from '@prisma/client'
import { beforeEach, vi } from 'vitest'
import { DeepMockProxy, mockDeep, mockReset } from 'vitest-mock-extended'

import prisma from './client.js'

vi.mock('./client.js', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
export default prismaMock

beforeEach(() => {
  mockReset(prismaMock)
})
