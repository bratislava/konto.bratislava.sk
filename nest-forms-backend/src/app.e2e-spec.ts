import { PrismaClient } from '@prisma/client'

/**
 * TEMPORARY TEST FILE
 * This is just a temporary test to verify that the database connection and
 * initialization work correctly. This should be replaced with proper e2e tests
 * for the application's endpoints and functionality.
 */
describe('AppController (e2e)', () => {
  let prisma: PrismaClient

  beforeAll(async () => {
    prisma = new PrismaClient()
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should be able to connect to the database', async () => {
    const result = await prisma.forms.count()
    expect(result).toBe(0)
  })
})
