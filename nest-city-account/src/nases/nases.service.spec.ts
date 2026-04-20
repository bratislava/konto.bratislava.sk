import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'

import ClientsService from '../clients/clients.service'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { NasesService } from './nases.service'

describe('NasesService', () => {
  let service: NasesService
  let throwerErrorGuard: ThrowerErrorGuard

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NasesService,
        ThrowerErrorGuard,
        { provide: ClientsService, useValue: createMock<ClientsService>() },
      ],
    }).compile()

    service = module.get<NasesService>(NasesService)
    throwerErrorGuard = module.get<ThrowerErrorGuard>(ThrowerErrorGuard)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createMany', () => {
    it('should successfully match direct URI results', async () => {
      const inputs = [
        { uri: 'rc://sk/1234567890_doe_john', physicalEntityId: 'entity-1' },
        { uri: 'rc://sk/9876543210_smith_jane', physicalEntityId: 'entity-2' },
      ]

      jest.spyOn(service as any, 'searchUpvsIdentitiesByUri').mockResolvedValue([
        {
          uri: 'rc://sk/1234567890_doe_john',
          status: 'activated',
          upvs: { edesk_status: 'active', edesk_number: '123' },
        },
        {
          uri: 'rc://sk/9876543210_smith_jane',
          status: 'activated',
          upvs: { edesk_status: 'active', edesk_number: '456' },
        },
      ] as any)

      const result = await service.createMany(inputs)

      expect(result.success).toHaveLength(2)
      expect(result.failed).toHaveLength(0)
      expect(result.success[0]).toEqual({
        inputUri: 'rc://sk/1234567890_doe_john',
        data: expect.objectContaining({ uri: 'rc://sk/1234567890_doe_john' }),
        physicalEntityId: 'entity-1',
      })
      expect(result.success[1]).toEqual({
        inputUri: 'rc://sk/9876543210_smith_jane',
        data: expect.objectContaining({ uri: 'rc://sk/9876543210_smith_jane' }),
        physicalEntityId: 'entity-2',
      })
    })

    it('should handle possible URI change when exactly one unmatched result and one unmatched input', async () => {
      const inputs = [{ uri: 'rc://sk/1234567890_doe_john', physicalEntityId: 'entity-1' }]

      // API returns different URI (e.g., surname changed)
      jest.spyOn(service as any, 'searchUpvsIdentitiesByUri').mockResolvedValue([
        {
          uri: 'rc://sk/1234567890_smith_john',
          status: 'activated',
          upvs: { edesk_status: 'active', edesk_number: '123' },
        },
      ] as any)

      const result = await service.createMany(inputs)

      expect(result.success).toHaveLength(1)
      expect(result.failed).toHaveLength(0)
      expect(result.success[0]).toEqual({
        inputUri: 'rc://sk/1234567890_doe_john',
        data: expect.objectContaining({ uri: 'rc://sk/1234567890_smith_john' }),
        physicalEntityId: 'entity-1',
      })
    })

    it('should mark as possibleUriChange when multiple unmatched results and inputs', async () => {
      const inputs = [
        { uri: 'rc://sk/1234567890_doe_john', physicalEntityId: 'entity-1' },
        { uri: 'rc://sk/9876543210_smith_jane', physicalEntityId: 'entity-2' },
      ]

      // API returns different URIs that we can't safely match
      jest.spyOn(service as any, 'searchUpvsIdentitiesByUri').mockResolvedValue([
        {
          uri: 'rc://sk/1234567890_jones_john',
          status: 'activated',
          upvs: { edesk_status: 'active', edesk_number: '123' },
        },
        {
          uri: 'rc://sk/9876543210_brown_jane',
          status: 'activated',
          upvs: { edesk_status: 'active', edesk_number: '456' },
        },
      ] as any)

      const result = await service.createMany(inputs)

      expect(result.success).toHaveLength(0)
      expect(result.failed).toHaveLength(2)
      expect(result.failed).toEqual(
        expect.arrayContaining([
          {
            physicalEntityId: 'entity-1',
            inputUri: 'rc://sk/1234567890_doe_john',
            possibleUriChange: true,
          },
          {
            physicalEntityId: 'entity-2',
            inputUri: 'rc://sk/9876543210_smith_jane',
            possibleUriChange: true,
          },
        ])
      )
    })

    it('should handle regular failures when no URI is returned', async () => {
      const inputs = [{ uri: 'rc://sk/invalid_uri', physicalEntityId: 'entity-1' }]

      jest.spyOn(service as any, 'searchUpvsIdentitiesByUri').mockResolvedValue([
        {
          uri: null,
          status: 'not_found',
        },
      ] as any)

      const result = await service.createMany(inputs)

      expect(result.success).toHaveLength(0)
      expect(result.failed).toHaveLength(1)
      expect(result.failed[0]).toEqual({
        physicalEntityId: 'entity-1',
        inputUri: 'rc://sk/invalid_uri',
        possibleUriChange: false,
      })
    })

    it('should handle mixed success and possible URI changes', async () => {
      const inputs = [
        { uri: 'rc://sk/1111111111_match_direct' },
        { uri: 'rc://sk/2222222222_nomatch_old', physicalEntityId: 'entity-2' },
      ]

      jest.spyOn(service as any, 'searchUpvsIdentitiesByUri').mockResolvedValue([
        {
          uri: 'rc://sk/1111111111_match_direct',
          status: 'activated',
          upvs: { edesk_status: 'active', edesk_number: '111' },
        },
        {
          uri: 'rc://sk/2222222222_nomatch_new',
          status: 'activated',
          upvs: { edesk_status: 'active', edesk_number: '222' },
        },
      ] as any)

      const result = await service.createMany(inputs)

      // When there's exactly 1 unmatched result and 1 unmatched input, they get matched
      expect(result.success).toHaveLength(2)
      expect(result.failed).toHaveLength(0)
      expect(result.success[0].inputUri).toBe('rc://sk/1111111111_match_direct')
      expect(result.success[1].inputUri).toBe('rc://sk/2222222222_nomatch_old')
      expect(result.success[1].data.uri).toBe('rc://sk/2222222222_nomatch_new')
    })

    it('should throw error for invalid input size', async () => {
      const throwerSpy = jest.spyOn(throwerErrorGuard, 'BadRequestException')

      await expect(service.createMany([])).rejects.toThrow()
      expect(throwerSpy).toHaveBeenCalled()

      const tooManyInputs = Array.from({ length: 11 }, (_, i) => ({ uri: `uri-${i}` }))
      await expect(service.createMany(tooManyInputs)).rejects.toThrow()
    })

    it('should deduplicate inputs by URI', async () => {
      const inputs = [
        { uri: 'rc://sk/same_uri', physicalEntityId: 'entity-1' },
        { uri: 'rc://sk/same_uri', physicalEntityId: 'entity-2' },
      ]

      const searchSpy = jest.spyOn(service as any, 'searchUpvsIdentitiesByUri').mockResolvedValue([
        {
          uri: 'rc://sk/same_uri',
          status: 'activated',
          upvs: { edesk_status: 'active', edesk_number: '123' },
        },
      ] as any)

      await service.createMany(inputs)

      // Should only search for unique URI once
      expect(searchSpy).toHaveBeenCalledWith(['rc://sk/same_uri'])
    })

    it('should throw error if UPVS server is down', async () => {
      const inputs = [
        { uri: 'rc://sk/same_uri', physicalEntityId: 'entity-1' },
        { uri: 'rc://sk/same_uri', physicalEntityId: 'entity-2' },
      ]

      const searchSpy = jest
        .spyOn(service as any, 'searchUpvsIdentitiesByUri')
        .mockRejectedValue(new Error('UPVS server is down'))

      await expect(service.createMany(inputs)).rejects.toThrow()
      expect(searchSpy).toHaveBeenCalledTimes(1)
    })
  })
})
