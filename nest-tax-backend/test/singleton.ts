import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'

import { PrismaClient } from '../prisma/generated/prisma/client'
import prisma from './client'

jest.mock('./client', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
export default prismaMock

beforeEach(() => {
  mockReset(prismaMock)
})
