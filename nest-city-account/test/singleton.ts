import { DeepMockProxy, mockDeep, mockReset } from 'vitest-mock-extended'

import { PrismaClient } from '../src/generated/prisma/client'
import prisma from './client'

vi.mock('./client', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
export default prismaMock

beforeEach(() => {
  mockReset(prismaMock)
})
