import prismaMock from '../../../test/singleton'
import { PrismaService } from '../../prisma/prisma.service'
import {
  selectHighPriorityEntities,
  selectUrgentEntities,
  selectUriToUpdateInternal,
} from '../upvs-queue.queries'

// The query module is a thin layer over `$queryRaw`; these basic tests pin its return
// shaping (raw rows pass through; the single-row selector collapses to first-or-null).
describe('upvs-queue.queries', () => {
  const prisma = prismaMock as unknown as PrismaService

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('selectUrgentEntities', () => {
    it('returns the rows from $queryRaw', async () => {
      const rows = [{ entityId: 'e1', birthNumber: '123456/7890', externalId: 'x1' }]
      prismaMock.$queryRaw.mockResolvedValue(rows)

      await expect(selectUrgentEntities(prisma, 50)).resolves.toEqual(rows)
      expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1)
    })
  })

  describe('selectUriToUpdateInternal', () => {
    it('returns the first row when present', async () => {
      const row = { uri: 'rc://sk/1', id: 'id-1' }
      prismaMock.$queryRaw.mockResolvedValue([row])

      await expect(selectUriToUpdateInternal(prisma)).resolves.toEqual(row)
    })

    it('returns null when no row is due', async () => {
      prismaMock.$queryRaw.mockResolvedValue([])

      await expect(selectUriToUpdateInternal(prisma)).resolves.toBeNull()
    })
  })

  describe('selectHighPriorityEntities', () => {
    it('returns the rows from $queryRaw', async () => {
      const rows = [{ id: 'pe-1', uri: 'rc://sk/1' }]
      prismaMock.$queryRaw.mockResolvedValue(rows)

      await expect(selectHighPriorityEntities(prisma, new Date('2024-01-01'), 8)).resolves.toEqual(
        rows
      )
    })
  })
})
