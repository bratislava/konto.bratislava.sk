import { createMock } from '@golevelup/ts-jest'
import { HttpException, HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import prismaMock from '../../../test/singleton'
import { NasesService } from '../../nases/nases.service'
import { PhysicalEntityService } from '../../physical-entity/physical-entity.service'
import { PrismaService } from '../../prisma/prisma.service'
import { CognitoSubservice } from '../../utils/subservices/cognito.subservice'
import { UrgentLookupService } from '../urgent-lookup.service'

const urgentEntity = (overrides: Record<string, string> = {}) => ({
  entityId: 'urgent-1',
  birthNumber: '123456/7890',
  externalId: 'ext-1',
  ...overrides,
})

describe('UrgentLookupService', () => {
  let service: UrgentLookupService
  let physicalEntityService: PhysicalEntityService
  let nasesService: NasesService
  let cognitoSubservice: CognitoSubservice

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrgentLookupService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: PhysicalEntityService, useValue: createMock<PhysicalEntityService>() },
        { provide: NasesService, useValue: createMock<NasesService>() },
        { provide: CognitoSubservice, useValue: createMock<CognitoSubservice>() },
      ],
    }).compile()

    service = module.get(UrgentLookupService)
    physicalEntityService = module.get(PhysicalEntityService)
    nasesService = module.get(NasesService)
    cognitoSubservice = module.get(CognitoSubservice)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns an empty result and persists nothing when there are no urgent entities', async () => {
    prismaMock.$queryRaw.mockResolvedValue([])

    const result = await service.processUrgentItems()

    expect(result).toEqual({ attempted: 0, rateLimited: false, failures: [] })
    expect(physicalEntityService.updateSuccessfulActiveEdeskUpdateInDatabase).not.toHaveBeenCalled()
    expect(physicalEntityService.updateFailedActiveEdeskUpdateInDatabase).not.toHaveBeenCalled()
  })

  it('resolves a URI and persists the success', async () => {
    prismaMock.$queryRaw.mockResolvedValue([urgentEntity()])
    jest
      .spyOn(cognitoSubservice, 'getDataFromCognito')
      .mockResolvedValue({ given_name: 'John', family_name: 'Doe' } as any)
    jest
      .spyOn(nasesService, 'lookupIdentityFO')
      .mockResolvedValue({ uri: 'rc://sk/resolved' } as any)

    const result = await service.processUrgentItems()

    expect(nasesService.lookupIdentityFO).toHaveBeenCalledWith(
      '1234567890',
      'John',
      'Doe',
      'urgent-1'
    )
    expect(physicalEntityService.updateSuccessfulActiveEdeskUpdateInDatabase).toHaveBeenCalledWith([
      { physicalEntityId: 'urgent-1', uri: 'rc://sk/resolved', edeskStatus: undefined },
    ])
    expect(result).toEqual({ attempted: 1, rateLimited: false, failures: [] })
  })

  it('records a failure when Cognito is missing the name', async () => {
    prismaMock.$queryRaw.mockResolvedValue([urgentEntity()])
    jest.spyOn(cognitoSubservice, 'getDataFromCognito').mockResolvedValue({} as any)

    const result = await service.processUrgentItems()

    expect(nasesService.lookupIdentityFO).not.toHaveBeenCalled()
    expect(physicalEntityService.updateFailedActiveEdeskUpdateInDatabase).toHaveBeenCalledWith([
      'urgent-1',
    ])
    expect(result.attempted).toBe(1)
    expect(result.failures).toEqual([
      expect.objectContaining({ entityId: 'urgent-1', reason: expect.stringContaining('Cognito') }),
    ])
  })

  it('records a failure when the lookup returns no URI', async () => {
    prismaMock.$queryRaw.mockResolvedValue([urgentEntity()])
    jest
      .spyOn(cognitoSubservice, 'getDataFromCognito')
      .mockResolvedValue({ given_name: 'John', family_name: 'Doe' } as any)
    jest.spyOn(nasesService, 'lookupIdentityFO').mockResolvedValue({ uri: undefined } as any)

    const result = await service.processUrgentItems()

    expect(physicalEntityService.updateFailedActiveEdeskUpdateInDatabase).toHaveBeenCalledWith([
      'urgent-1',
    ])
    expect(result.failures).toEqual([
      expect.objectContaining({ reason: 'Identity lookup returned no URI' }),
    ])
  })

  it('records a generic lookup error as a failure', async () => {
    prismaMock.$queryRaw.mockResolvedValue([urgentEntity()])
    jest
      .spyOn(cognitoSubservice, 'getDataFromCognito')
      .mockResolvedValue({ given_name: 'John', family_name: 'Doe' } as any)
    jest.spyOn(nasesService, 'lookupIdentityFO').mockRejectedValue(new Error('upstream down'))

    const result = await service.processUrgentItems()

    expect(result.rateLimited).toBe(false)
    expect(result.failures).toEqual([expect.objectContaining({ reason: 'Lookup failed' })])
  })

  it('stops the run, logs an alert, and persists nothing further on HTTP 429', async () => {
    prismaMock.$queryRaw.mockResolvedValue([
      urgentEntity({ entityId: 'urgent-1' }),
      urgentEntity({ entityId: 'urgent-2' }),
    ])
    jest
      .spyOn(cognitoSubservice, 'getDataFromCognito')
      .mockResolvedValue({ given_name: 'John', family_name: 'Doe' } as any)
    jest
      .spyOn(nasesService, 'lookupIdentityFO')
      .mockRejectedValue(new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS))
    const errorSpy = jest.spyOn((service as any).logger, 'error').mockImplementation(() => {})

    const result = await service.processUrgentItems()

    // Broke after the first entity — the second is left for the next tick.
    expect(nasesService.lookupIdentityFO).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ attempted: 0, rateLimited: true, failures: [] })
    expect(physicalEntityService.updateSuccessfulActiveEdeskUpdateInDatabase).not.toHaveBeenCalled()
    expect(physicalEntityService.updateFailedActiveEdeskUpdateInDatabase).not.toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'upvs_lookup_rate_limited', alert: 1 })
    )
  })
})
