import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'

import ClientsService from '../clients/clients.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import NasesService from './nases.service'

describe('NasesService', () => {
  let service: NasesService

  beforeEach(async () => {
    jest.resetAllMocks()

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        NasesService,
        ThrowerErrorGuard,
        {
          provide: ClientsService,
          useValue: createMock<ClientsService>(),
        },
      ],
    }).compile()

    service = app.get<NasesService>(NasesService)

    Object.defineProperty(
      app.get<ThrowerErrorGuard>(ThrowerErrorGuard),
      'logger',
      {
        value: { error: jest.fn(), debug: jest.fn(), log: jest.fn() },
      },
    )
    Object.defineProperty(service, 'logger', {
      value: { error: jest.fn(), debug: jest.fn(), log: jest.fn() },
    })
  })

  describe('should be defined', () => {
    it('should be defined', () => {
      expect(service).toBeDefined()
    })
  })

  describe('getUpvsIdentity', () => {
    it('should return identity if request succeeds', async () => {
      const mockIdentity = { uri: 'test-uri', type: 'natural_person' }
      service['clientsService'].slovenskoSkApi.apiUpvsIdentityGet = jest
        .fn()
        .mockResolvedValue({ data: mockIdentity })

      const result = await service.getUpvsIdentity('test-token')

      expect(result).toEqual(mockIdentity)
    })

    it('should return null if request fails', async () => {
      service['clientsService'].slovenskoSkApi.apiUpvsIdentityGet = jest
        .fn()
        .mockRejectedValue(new Error('Request failed'))

      const result = await service.getUpvsIdentity('test-token')

      expect(result).toBeNull()
    })
  })
})
