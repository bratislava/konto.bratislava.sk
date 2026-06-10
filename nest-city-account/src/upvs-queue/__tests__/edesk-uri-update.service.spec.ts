import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { QueueItemStatusEnum } from '@prisma/client'

import prismaMock from '../../../test/singleton'
import { NasesService } from '../../nases/nases.service'
import { PrismaService } from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { EdeskUriUpdateService } from '../edesk-uri-update.service'

describe('EdeskUriUpdateService', () => {
  let service: EdeskUriUpdateService
  let nasesService: NasesService
  let throwerErrorGuard: ThrowerErrorGuard

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EdeskUriUpdateService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: NasesService, useValue: createMock<NasesService>() },
        { provide: ThrowerErrorGuard, useValue: createMock<ThrowerErrorGuard>() },
      ],
    }).compile()

    service = module.get(EdeskUriUpdateService)
    nasesService = module.get(NasesService)
    throwerErrorGuard = module.get(ThrowerErrorGuard)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getUriToUpdateInternal', () => {
    it('returns the row when one is due, null otherwise', async () => {
      prismaMock.$queryRaw.mockResolvedValueOnce([{ uri: 'rc://sk/1', id: 'id-1' }])
      await expect(service.getUriToUpdateInternal()).resolves.toEqual({
        uri: 'rc://sk/1',
        id: 'id-1',
      })

      prismaMock.$queryRaw.mockResolvedValueOnce([])
      await expect(service.getUriToUpdateInternal()).resolves.toBeNull()
    })
  })

  describe('getUriToUpdateExternal', () => {
    it('queries NEW_URI_CHECK_REQUIRED items with a non-null uri', async () => {
      prismaMock.externalEdeskCheck.findFirst.mockResolvedValue({ uri: 'rc://sk/ext' } as any)

      await expect(service.getUriToUpdateExternal()).resolves.toEqual({ uri: 'rc://sk/ext' })
      expect(prismaMock.externalEdeskCheck.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            queueStatus: QueueItemStatusEnum.NEW_URI_CHECK_REQUIRED,
          }),
        })
      )
    })
  })

  describe('handleUriUpdateInternal', () => {
    it('writes the resolved uri on success', async () => {
      jest.spyOn(nasesService, 'createMany').mockResolvedValue({
        success: [
          { physicalEntityId: 'id-1', inputUri: 'rc://sk/old', data: { uri: 'rc://sk/new' } },
        ],
        failed: [],
      } as any)

      await service.handleUriUpdateInternal({ uri: 'rc://sk/old', id: 'id-1' })

      expect(prismaMock.physicalEntity.update).toHaveBeenCalledWith({
        where: { id: 'id-1' },
        data: { uri: 'rc://sk/new' },
      })
    })

    it('bumps the fail counter and throws on failure', async () => {
      jest.spyOn(nasesService, 'createMany').mockResolvedValue({
        success: [],
        failed: [{ inputUri: 'rc://sk/old', possibleUriChange: false }],
      } as any)
      jest
        .spyOn(throwerErrorGuard, 'InternalServerErrorException')
        .mockReturnValue(new Error('failed to update') as any)

      await expect(
        service.handleUriUpdateInternal({ uri: 'rc://sk/old', id: 'id-1' })
      ).rejects.toThrow('failed to update')

      expect(prismaMock.physicalEntity.update).toHaveBeenCalledWith({
        where: { id: 'id-1' },
        data: expect.objectContaining({
          uriPossiblyOutdated: false,
          activeEdeskUpdateFailCount: { increment: 1 },
        }),
      })
    })
  })

  describe('handleUriUpdateExternal', () => {
    it('marks the row COMPLETED on success', async () => {
      jest.spyOn(nasesService, 'createMany').mockResolvedValue({
        success: [
          {
            inputUri: 'rc://sk/ext',
            data: { status: 'activated', upvs: { edesk_status: 'active', edesk_number: '1' } },
          },
        ],
        failed: [],
      } as any)

      await service.handleUriUpdateExternal('rc://sk/ext')

      expect(prismaMock.externalEdeskCheck.update).toHaveBeenCalledWith({
        where: { uri: 'rc://sk/ext' },
        data: expect.objectContaining({ queueStatus: QueueItemStatusEnum.COMPLETED }),
      })
    })

    it('marks the row FAILED and bumps failCount when not resolved', async () => {
      jest.spyOn(nasesService, 'createMany').mockResolvedValue({ success: [], failed: [] } as any)

      await service.handleUriUpdateExternal('rc://sk/ext')

      expect(prismaMock.externalEdeskCheck.update).toHaveBeenCalledWith({
        where: { uri: 'rc://sk/ext' },
        data: { queueStatus: QueueItemStatusEnum.FAILED, failCount: { increment: 1 } },
      })
    })
  })
})
