import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'

import prismaMock from '../../../test/singleton'
import { externalEdeskCheckFactory } from '../../__tests__/factories/externalEdeskCheck.factory'
import { expectObjectContaining } from '../../__tests__/jest-matchers'
import { ExternalEdeskCheck } from '../../generated/prisma/client'
import { QueueItemStatusEnum } from '../../generated/prisma/enums'
import { GetIdentitiesByUrisResult, NasesService } from '../../nases/nases.service'
import { PhysicalEntityService } from '../../physical-entity/physical-entity.service'
import { PrismaService } from '../../prisma/prisma.service'
import { EdeskBatchUpdateService } from '../edesk-batch-update.service'

describe('EdeskBatchUpdateService', () => {
  let service: EdeskBatchUpdateService
  let physicalEntityService: PhysicalEntityService
  let nasesService: NasesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EdeskBatchUpdateService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: PhysicalEntityService, useValue: createMock<PhysicalEntityService>() },
        { provide: NasesService, useValue: createMock<NasesService>() },
      ],
    }).compile()

    service = module.get(EdeskBatchUpdateService)
    physicalEntityService = module.get(PhysicalEntityService)
    nasesService = module.get(NasesService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // High-priority selection uses $queryRaw, external selection uses findMany.
  const mockSelection = (highPriority: unknown[], external: Partial<ExternalEdeskCheck>[]) => {
    prismaMock.$queryRaw.mockResolvedValue(highPriority)
    prismaMock.externalEdeskCheck.findMany.mockResolvedValue(
      external.map((item) => externalEdeskCheckFactory(item))
    )
  }

  it('does nothing and returns zero counts when there is no work', async () => {
    mockSelection([], [])

    const result = await service.updateEdeskStatusBatch()

    expect(nasesService.getIdentitiesByUris).not.toHaveBeenCalled()
    expect(result).toEqual({ highPriorityProcessed: 0, externalProcessed: 0 })
  })

  it('searches the combined batch and reports the counts', async () => {
    mockSelection([{ id: 'pe-1', uri: 'rc://sk/hp' }], [{ uri: 'rc://sk/ext' }])
    jest.spyOn(nasesService, 'getIdentitiesByUris').mockResolvedValue({
      success: [
        {
          physicalEntityId: 'pe-1',
          inputUri: 'rc://sk/hp',
          data: { status: 'activated', upvs: {} },
        },
        {
          physicalEntityId: null,
          inputUri: 'rc://sk/ext',
          data: { status: 'activated', upvs: {} },
        },
      ],
      failed: [],
    } satisfies GetIdentitiesByUrisResult)
    prismaMock.externalEdeskCheck.update.mockResolvedValue(externalEdeskCheckFactory({ norisId: 1 }))

    const result = await service.updateEdeskStatusBatch()

    expect(nasesService.getIdentitiesByUris).toHaveBeenCalledTimes(1)
    expect(physicalEntityService.updateSuccessfulActiveEdeskUpdateInDatabase).toHaveBeenCalledWith([
      expectObjectContaining({ physicalEntityId: 'pe-1' }),
    ])
    expect(prismaMock.externalEdeskCheck.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { uri: 'rc://sk/ext' },
        data: expectObjectContaining({ queueStatus: QueueItemStatusEnum.COMPLETED }),
      })
    )
    expect(result).toEqual({ highPriorityProcessed: 1, externalProcessed: 1 })
  })

  it('logs a death date when the resolved external identity carries one', async () => {
    mockSelection([], [{ uri: 'rc://sk/ext' }])
    jest.spyOn(nasesService, 'getIdentitiesByUris').mockResolvedValue({
      success: [
        {
          physicalEntityId: null,
          inputUri: 'rc://sk/ext',
          data: {
            status: 'activated',
            type: 'natural_person',
            natural_person: { death: { date: '2020-05-01' } },
            upvs: {},
          },
        },
      ],
      failed: [],
    } satisfies GetIdentitiesByUrisResult)
    prismaMock.externalEdeskCheck.update.mockResolvedValue(externalEdeskCheckFactory({ norisId: 42 }))
    const logSpy = jest.spyOn(service['logger'], 'log').mockImplementation(jest.fn())

    await service.updateEdeskStatusBatch()

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('external_edesk_death_date'))
  })

  it('requeues possible URI changes and flags the entities outdated', async () => {
    mockSelection([], [{ uri: 'rc://sk/ext' }])
    jest.spyOn(nasesService, 'getIdentitiesByUris').mockResolvedValue({
      success: [],
      failed: [{ inputUri: 'rc://sk/ext', possibleUriChange: true }],
    } satisfies GetIdentitiesByUrisResult)

    await service.updateEdeskStatusBatch()

    expect(prismaMock.externalEdeskCheck.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { queueStatus: QueueItemStatusEnum.NEW_URI_CHECK_REQUIRED },
      })
    )
    expect(prismaMock.physicalEntity.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { uriPossiblyOutdated: true } })
    )
  })

  it('marks plain failures FAILED (external) and bumps the internal fail counter', async () => {
    mockSelection([{ id: 'pe-1', uri: 'rc://sk/hp' }], [{ uri: 'rc://sk/ext' }])
    jest.spyOn(nasesService, 'getIdentitiesByUris').mockResolvedValue({
      success: [],
      failed: [
        { physicalEntityId: 'pe-1', inputUri: 'rc://sk/hp', possibleUriChange: false },
        { inputUri: 'rc://sk/ext', possibleUriChange: false },
      ],
    } satisfies GetIdentitiesByUrisResult)

    await service.updateEdeskStatusBatch()

    expect(physicalEntityService.updateFailedActiveEdeskUpdateInDatabase).toHaveBeenCalledWith([
      'pe-1',
    ])
    expect(prismaMock.externalEdeskCheck.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { queueStatus: QueueItemStatusEnum.FAILED, failCount: { increment: 1 } },
      })
    )
  })
})
